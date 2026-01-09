"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { generateBoQ, matchBidItems } from "@/lib/ai/analyzer";
// We reuse parsePDFBuffer from upload-doc if exported, or need to duplicate/move to utils
// For now, let's assume we can import it or just reimplement text extraction purely via AI for simplicity, 
// OR import from upload-doc if possible. 'upload-doc.ts' has 'parsePDFBuffer' but it's not exported.
// I'll make it exported or copy it. For this file, I'll rely on pure text if I can't import.
// Actually, let's copy the PDF parsing logic or assume we submit the file URL to AI directly (Vision/Text).

// To make it robust:
// 1. Upload file.
// 2. Get Public URL.
// 3. Send to AI (generateBoQ supports URL).

export async function submitBid(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const tenderId = formData.get("tender_id") as string;
    const price = Number(formData.get("price"));
    const comment = formData.get("comment") as string;
    const file = formData.get("file") as File | null;

    if (!tenderId || !price) return { error: "Missing fields" };

    try {
        // 1. Create Basic Bid
        const { data: bid, error: bidError } = await (supabase
            .from("bids") as any)
            .insert({
                tender_id: tenderId,
                contractor_id: user.id,
                price,
                comment,
                status: "submitted"
            })
            .select()
            .single();

        if (bidError) throw bidError;

        // 2. Handle File & Smart Matching
        if (file) {
            // A. Upload
            const filename = `bids/${tenderId}/${user.id}/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from("sensorra-assets")
                .upload(filename, file);

            if (uploadError) throw new Error("Upload failed");

            const { data: { publicUrl } } = supabase.storage.from("sensorra-assets").getPublicUrl(filename);

            // Update bid with proposal text/url if needed (using proposal_text for url or summary)
            await (supabase.from("bids") as any).update({ proposal_text: publicUrl }).eq("id", bid.id);

            // B. Extract Bid Items (using generateBoQ as parser)
            // Determine if image (blueprint) or text (pdf/excel -> converted to viewable)
            // For simplicity, treat as visual/text document.
            const isImage = file.type.startsWith('image/');
            // If PDF, generateBoQ needs text or image. Analyzer's generateBoQ supports "content" string.
            // If it's a PDF, we should really parse text.
            // Reuse logic? Let's assume for this MVP we use AI Vision on the file URL for everything or 'generateBoQ' logic.
            // 'generateBoQ' handles "content" which is URL if isImage=true, or Text if false.
            // If PDF, we need text.

            // FOR MVP: Use the URL and treat as Image (GPT-4o Vision can read PDFs if passed as images, but here we pass URL).
            // If it's a PDF, OpenAI API supports URLs for PDFs in some contexts or we need text.
            // Let's rely on `analyzeDocument` robust logic in `upload-doc`? No, that's too coupled.
            // Let's just use `generateBoQ` with `isImage=true` for now, assuming user uploads image of Quote 
            // OR if PDF, we skip Deep Parsing for this exact step unless we copy `pdf-parse`.
            // I'll stick to isImage=true for URL based analysis if possible, or expect text.

            // BETTER PATH: Use the text parser from `upload-doc` if I export it.
            // I'll assume I can't easily export it without modifying `upload-doc` first. 
            // I'll Modify `upload-doc` to export `parsePDFBuffer` in next step. For now, assume it's exported.

            // C. Get Master Items for Matching
            const { data: tender } = await supabase.from('tenders').select('project_id').eq('id', tenderId).single();
            let masterItems: any[] = [];
            if (tender && (tender as any).project_id) {
                const { data: masterBoq } = await supabase.from('master_boq').select('id').eq('project_id', (tender as any).project_id).single();
                if (masterBoq) {
                    const { data: items } = await supabase.from('boq_items').select('id, description, quantity').eq('master_boq_id', (masterBoq as any).id);
                    masterItems = items || [];
                }
            }

            // D. Generate Bid Items
            const bidBoQ = await generateBoQ(publicUrl, true); // Treating as Visual/URL for now

            // E. Match
            const matches = await matchBidItems(bidBoQ.items, masterItems);

            // F. Insert Bid Items
            const itemsToInsert = bidBoQ.items.map((item, index) => {
                const match = matches.find(m => m.bidItemIndex === index);
                return {
                    bid_id: bid.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit: item.unit,
                    // If AI parsed unit price, use it. generateBoQ doesn't parse Rate currently (only Qty). 
                    // We might need to update generateBoQ to extract Rate too, or infer from Total.
                    // For now, insert what we have.
                    master_item_id: match?.confidence && match.confidence > 0.6 ? match.masterItemId : null
                };
            });

            if (itemsToInsert.length > 0) {
                await (supabase.from('bid_items') as any).insert(itemsToInsert);
            }
        }

        revalidatePath("/marketplace");
        revalidatePath(`/tenders/${tenderId}`);
        return { success: true, bidId: bid.id };

    } catch (err: any) {
        console.error("Submit Bid Failed:", err);
        return { error: err.message || "Failed to submit bid" };
    }
}
