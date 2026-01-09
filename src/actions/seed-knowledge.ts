"use server";

import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";

const openai = new OpenAI({
    baseURL: process.env.PROXY_BASE_URL || "https://api.proxyapi.ru/openai/v1",
    apiKey: process.env.PROXY_API_KEY,
});

const DUBAI_REGULATIONS = [
    "Electrical: All internal wiring in residential villas must use LSZH (Low Smoke Zero Halogen) insulation. PVC is prohibited in critical areas.",
    "Waterproofing: Wet areas (bathrooms, kitchens) require a minimum 2-layer bitumen membrane application or approved equivalent liquid membrane.",
    "Fire Safety: Kitchen doors in commercial or shared residential units must be fire-rated for at least 60 minutes (FD60) and self-closing.",
    "HVAC: AC units must meet the new SEER ratings of at least 12.0 for residential split systems.",
    "Structural: Concrete mix for foundations must use Sulfate Resisting Cement (SRC) due to high soil salinity.",
    "Plumbing: PEX piping is preferred for internal water supply; copper is allowed but requires insulation against corrosion.",
    "Safety: Construction sites must have perimeter fencing of at least 2.0 meters height with warning signs every 10 meters."
];

async function generateEmbedding(text: string) {
    const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, " "),
    });
    return response.data[0].embedding;
}

export async function seedKnowledgeBase() {
    const supabase = await createClient();

    // Check if already seeded to avoid duplicates (naive check)
    const { count } = await supabase.from('knowledge_base').select('*', { count: 'exact', head: true });
    if (count && count > 0) {
        return { message: "Knowledge Base already populated", count };
    }

    let inserted = 0;

    for (const rule of DUBAI_REGULATIONS) {
        try {
            const embedding = await generateEmbedding(rule);

            const { error } = await supabase.from('knowledge_base').insert([{
                content: rule,
                embedding: embedding as any, // Cast to any to avoid strict vector type issues
                metadata: { source: "Dubai Building Code 2024 (Simulated)" }
            }]);

            if (error) {
                console.error("Error inserting rule:", rule, error);
            } else {
                inserted++;
            }

        } catch (e) {
            console.error("Error embedding rule:", rule, e);
        }
    }

    return { success: true, inserted };
}
