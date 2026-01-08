
import { createClient } from '@supabase/supabase-js';
import * as pdfLib from 'pdf-parse';
import OpenAI from "openai";

// Config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const FILE_PATH = '1f4ae6d0-db14-4bf9-bcff-d923ec7aa867/1767897390265-2025_ALPHA_PET_POUCH_SPECIFICATION_.pdf';
const BUCKET = 'sensorra-assets';

// AI Config
const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: process.env.PROXY_API_KEY,
});

async function run() {
    console.log('--- Debugging AI Pipeline ---');
    console.log('PDF Lib Exports:', Object.keys(pdfLib));

    // 1. Download File
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Try downloading via Storage API (might fail if RLS blocks public read, but let's try)
    console.log(`Downloading ${FILE_PATH}...`);
    const { data: blob, error } = await supabase.storage.from(BUCKET).download(FILE_PATH);

    if (error) {
        console.error('Download Error:', error);
        // Fallback: Try Public URL if bucket is public
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${FILE_PATH}`;
        console.log('Trying public URL:', publicUrl);
        const res = await fetch(publicUrl);
        if (!res.ok) {
            console.error('Public fetch failed:', res.status);
            return;
        }
        // If success, we'd process the buffer. But let's assume one works.
        process.exit(1);
    }

    console.log('File downloaded. Size:', blob.size);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse PDF
    console.log('Parsing PDF...');
    let text = '';
    try {
        // Adapt to PDFParse v2 API
        // Based on my previous research: export declare class PDFParse ...
        // And we imported * as pdfLib

        let parser;
        if (pdfLib.PDFParse) {
            parser = new pdfLib.PDFParse({ data: buffer });
        } else if (pdfLib.default && pdfLib.default.PDFParse) {
            parser = new pdfLib.default.PDFParse({ data: buffer });
        } else {
            console.error('Could not find PDFParse class in exports');
            return;
        }

        const data = await parser.getText();
        text = data.text;
        console.log('Text extracted. Length:', text.length);
        console.log('First 100 chars:', text.slice(0, 100));

    } catch (e) {
        console.error('PDF Parse Error:', e);
        return;
    }

    if (text.length < 50) {
        console.log('Text too short for AI.');
        return;
    }

    // 3. AI Analysis
    console.log('Sending to AI...');
    try {
        const completion = await openai.chat.completions.create({
            model: process.env.AI_MODEL || "gpt-4o",
            messages: [
                { role: "system", content: "Return JSON summary." },
                { role: "user", content: `Analyze:\n${text.slice(0, 1000)}` },
            ],
        });
        console.log('AI Response:', completion.choices[0].message.content);
    } catch (e) {
        console.error('AI Error:', e);
    }
}

run();
