"use server";

import { createClient } from "@/utils/supabase/server";
import { analyzeDocument } from "@/lib/ai/analyzer";
import { revalidatePath } from "next/cache";
// @ts-ignore
import pdf from "pdf-parse/lib/pdf-parse";

export async function uploadAndAnalyzeDocument(formData: FormData) {
    const file = formData.get("file") as File;
    const propertyId = formData.get("property_id") as string;

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
    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (file.type === "application/pdf") {
            const data = await pdf(buffer);
            parsedText = data.text;
        } else {
            // Simple text fallback
            parsedText = buffer.toString("utf-8");
        }
    } catch (err) {
        console.warn("Text parsing failed:", err);
        // Continue without AI metadata if parsing fails
    }

    // 3. AI Analysis
    let aiMetadata = {};
    if (parsedText.length > 50) {
        try {
            aiMetadata = await analyzeDocument(parsedText);
        } catch (err) {
            console.error("AI Analysis skipped due to error:", err);
        }
    }

    // 4. Insert into DB
    const { data: docData, error: dbError } = await supabase
        .from("documents")
        .insert({
            property_id: propertyId,
            uploader_id: (await supabase.auth.getUser()).data.user?.id!,
            type: (aiMetadata as any)?.doc_type || "unknown",
            file_url: filePath,
            status: "active",
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
