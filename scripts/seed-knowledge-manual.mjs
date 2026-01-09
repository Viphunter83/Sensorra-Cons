
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Simple .env parser (since we are running standalone node script)
try {
    if (fs.existsSync('.env')) {
        const envConfig = fs.readFileSync('.env', 'utf8');
        for (const line of envConfig.split('\n')) {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key] = val;
            }
        }
    }
} catch (e) {
    console.log('No .env file found', e);
}

const DUBAI_REGULATIONS = [
    "Electrical: All internal wiring in residential villas must use LSZH (Low Smoke Zero Halogen) insulation. PVC is prohibited in critical areas.",
    "Waterproofing: Wet areas (bathrooms, kitchens) require a minimum 2-layer bitumen membrane application or approved equivalent liquid membrane.",
    "Fire Safety: Kitchen doors in commercial or shared residential units must be fire-rated for at least 60 minutes (FD60) and self-closing.",
    "HVAC: AC units must meet the new SEER ratings of at least 12.0 for residential split systems.",
    "Structural: Concrete mix for foundations must use Sulfate Resisting Cement (SRC) due to high soil salinity.",
    "Plumbing: PEX piping is preferred for internal water supply; copper is allowed but requires insulation against corrosion.",
    "Safety: Construction sites must have perimeter fencing of at least 2.0 meters height with warning signs every 10 meters."
];

async function main() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error("Missing Supabase Env Vars");
        return;
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // We need service role for admin writes if RLS policies are strict, but here we used anon key in policies for simplicity initially.
    // If inserts fail, we might need SERVICE_ROLE_KEY. 
    // Let's assume ANON is fine based on migration 'create policy "Read knowledge base: Everyone"'.
    // WAIT, I only added policies for SELECT. I might need a policy for INSERT or use Service Role.
    // Let's check if SERVICE_ROLE is available or just add an INSERT policy.
    // Actually, migration didn't add INSERT policy! So Anon insert will fail.
    // I should use the Service Role Key if available, or simpler: Update RLS to allow Anon Insert for this demo script 
    // OR easier: Just use the Service Role Key which bypasses RLS.
    // Let's check if SUPABASE_SERVICE_ROLE_KEY is in .env. safely.

    // Better approach: I'll use a direct PG client for the embeddings insertion in this script? NO, Supabase JS is easier.
    // I will try to use the ANON key first, if it fails, I'll print error.

    const openai = new OpenAI({
        baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
        apiKey: process.env.PROXY_API_KEY,
    });

    console.log("Generating Embeddings...");

    for (const rule of DUBAI_REGULATIONS) {
        try {
            const resp = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: rule.replace(/\n/g, " "),
            });
            const embedding = resp.data[0].embedding;

            const { error } = await supabase.from('knowledge_base').insert({
                content: rule,
                embedding,
                metadata: { source: "Dubai Building Code 2024 (Simulated)" }
            });

            if (error) console.error("Insert Error (RLS likely):", error.message);
            else console.log("Inserted:", rule.substring(0, 30) + "...");

        } catch (e) {
            console.error("Error:", e);
        }
    }
}

main();
