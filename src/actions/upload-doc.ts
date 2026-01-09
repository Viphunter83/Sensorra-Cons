"use server";

import { createClient } from "@/utils/supabase/server";
import { analyzeDocument, generateBoQ } from "@/lib/ai/analyzer";
import { storeProjectContext } from "@/lib/ai/rag";
import { revalidatePath } from "next/cache";
// @ts-ignore
import PDFParser from "pdf2json";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "debug-upload.log");

function log(msg: string) {
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(LOG_FILE, `[${timestamp}] ${msg}\n`);
    } catch (e) {
        // Ignore logging errors
    }
    console.log(msg);
}

function parsePDFBuffer(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const parser = new PDFParser(null, true); // true = text content
        parser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
        parser.on("pdfParser_dataReady", () => {
            const raw = parser.getRawTextContent();
            resolve(raw);
        });
        // Catch async errors
        try {
            parser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}

export async function uploadAndAnalyzeDocument(formData: FormData) {
    const file = formData.get("file") as File;
    const propertyId = formData.get("property_id") as string;
    const projectId = formData.get("project_id") as string | null;
    const itemsDocType = formData.get("doc_type") as string | null; // Manual override

    if (!file || !propertyId) {
        return { error: "Missing file or property ID" };
    }

    const supabase = await createClient();

    // 1. Upload to Storage
    const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filePath = `${propertyId}/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("sensorra-assets")
        .upload(filePath, file);

    if (uploadError) {
        console.error("Upload Error:", uploadError);
        return { error: "Failed to upload file" };
    }


    // 2. Parse Text
    let parsedText = "";
    let aiMetadata: any = {};
    const isImage = file.type.startsWith('image/');

    try {
        log(`Starting Parsing for: ${file.name} Size: ${file.size}`);
        const buffer = Buffer.from(await file.arrayBuffer());

        if (file.type === "application/pdf") {
            parsedText = await parsePDFBuffer(buffer);
            log(`PDF Parsed successfully (pdf2json). Text length: ${parsedText.length}`);
        } else {
            parsedText = buffer.toString("utf-8");
            log(`Text fallback used. Length: ${parsedText.length}`);
        }
    } catch (err: any) {
        log(`Text parsing failed: ${err.message}`);
        aiMetadata = { error: `Parsing failed: ${err.message}`, stack: err.stack };
    }

    // 3. AI Analysis
    // CASE A: Image (Vision Mode) - e.g. Blueprint
    if (isImage) {
        try {
            log("Sending to AI Vision...");
            if (!process.env.PROXY_API_KEY) throw new Error("Missing PROXY_API_KEY env var");

            const { data: publicUrlData } = supabase.storage.from("sensorra-assets").getPublicUrl(filePath);

            if (publicUrlData.publicUrl) {
                aiMetadata = await analyzeDocument(publicUrlData.publicUrl, true);
                log("AI Vision result: Success");

                // --- PHASE I: MASTER BOQ GENERATION ---
                // If it's a blueprint and part of a project, generate BoQ
                if (projectId && aiMetadata.doc_type === 'blueprint') {
                    log("Generating Master BoQ from Blueprint...");
                    const boqResult = await generateBoQ(publicUrlData.publicUrl, true);

                    if (boqResult.items.length > 0) {
                        // 1. Create Master BoQ Record
                        const { data: masterBoq, error: mBoqErr } = await supabase
                            .from('master_boq')
                            .insert({
                                project_id: projectId,
                                status: 'draft',
                                currency: boqResult.currency
                            })
                            .select()
                            .single();

                        if (!mBoqErr && masterBoq) {
                            // 2. Insert Items
                            const itemsToInsert = boqResult.items.map(item => ({
                                master_boq_id: masterBoq.id,
                                description: item.description,
                                unit: item.unit,
                                quantity: item.quantity,
                                category: item.category,
                                item_code: item.item_code,
                                specification_reference: item.specification
                            }));

                            const { error: itemsErr } = await supabase.from('boq_items').insert(itemsToInsert);
                            if (itemsErr) log(`Error inserting BoQ items: ${itemsErr.message}`);
                            else log(`Successfully created Master BoQ with ${itemsToInsert.length} items.`);
                        } else {
                            log(`Error creating Master BoQ: ${mBoqErr?.message}`);
                        }
                    }
                }
                // --------------------------------------
            }

        } catch (err: any) {
            console.error("AI Vision skipped:", err);
            aiMetadata = { error: err.message };
        }
    }
    // CASE B: Text (PDF/Doc) - Extraction + RAG
    else if (parsedText && parsedText.length > 50) {
        try {
            log("Sending to AI...");
            if (!process.env.PROXY_API_KEY) throw new Error("Missing PROXY_API_KEY env var");

            aiMetadata = await analyzeDocument(parsedText, false);
            log("AI result: Success");

            // RAG Integration: Store embedding for project context
            if (projectId && !aiMetadata.error) {
                await storeProjectContext(projectId, parsedText);
                log("RAG Context Stored");

                // --- PHASE I: MASTER BOQ GENERATION (Text) ---
                if (aiMetadata.doc_type === 'blueprint' || aiMetadata.doc_type === 'contract') { // contracts/specs can have BoQ
                    log("Generating Master BoQ from Text...");
                    const boqResult = await generateBoQ(parsedText, false);

                    if (boqResult.items.length > 0) {
                        const { data: masterBoq, error: mBoqErr } = await supabase
                            .from('master_boq')
                            .insert({
                                project_id: projectId,
                                status: 'draft',
                                currency: boqResult.currency
                            })
                            .select()
                            .single();

                        if (!mBoqErr && masterBoq) {
                            const itemsToInsert = boqResult.items.map(item => ({
                                master_boq_id: masterBoq.id,
                                description: item.description,
                                unit: item.unit,
                                quantity: item.quantity,
                                category: item.category,
                                item_code: item.item_code,
                                specification_reference: item.specification
                            }));
                            await supabase.from('boq_items').insert(itemsToInsert);
                            log(`Successfully created Master BoQ from text with ${itemsToInsert.length} items.`);
                        }
                    }
                }
                // ---------------------------------------------
            }

        } catch (err: any) {
            console.error("AI Analysis skipped due to error:", err);
            aiMetadata = { error: err.message || "Unknown AI error" };
        }
    } else if (!aiMetadata.error) {
        log("Skipping AI: Text too short or empty.");
        aiMetadata = { error: "Parsing failed or text too short", length: parsedText?.length || 0 };
    }

    // 4. Insert into DB
    const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
            property_id: propertyId,
            project_id: projectId || null,
            uploader_id: (await supabase.auth.getUser()).data.user?.id!,
            type: itemsDocType || (aiMetadata as any)?.doc_type || "unknown",
            file_url: filePath,
            status: aiMetadata.error ? "rejected" : "active",
            ai_metadata: aiMetadata,
        })
        .select()
        .single();

    if (dbError) {
        console.error("DB Insert Error:", dbError);
        return { error: "Failed to save document record" };
    }

    revalidatePath("/(dashboard)", "layout");
    return { success: true, document: docData };
}
