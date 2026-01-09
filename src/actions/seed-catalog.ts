'use server';

import { createClient } from '@/utils/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.PROXY_API_KEY!,
    baseURL: process.env.PROXY_BASE_URL,
});

const SAMPLE_ITEMS = [
    {
        name: "Modern Beige Sofa",
        description: "A comfortable, minimalist 3-seater sofa in beige fabric. Perfect for modern living rooms.",
        category: "furniture",
        price: 4500,
        dimensions: { l: 2.2, w: 0.9, h: 0.8 },
        image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300"
    },
    {
        name: "Industrial Coffee Table",
        description: "Rustic wood top with black metal legs. Industrial style.",
        category: "furniture",
        price: 1200,
        dimensions: { l: 1.2, w: 0.6, h: 0.45 },
        image_url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=300"
    },
    {
        name: "Velvet Armchair (Blue)",
        description: "Luxurious deep blue velvet armchair with gold legs.",
        category: "furniture",
        price: 2800,
        dimensions: { l: 0.8, w: 0.8, h: 0.9 },
        image_url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=300"
    },
    {
        name: "Floor Lamp",
        description: "Tall arc floor lamp with marble base.",
        category: "lighting",
        price: 850,
        dimensions: { l: 0.4, w: 0.4, h: 1.8 },
        image_url: "https://images.unsplash.com/photo-1513506003013-d531628af69d?auto=format&fit=crop&q=80&w=300"
    },
    {
        name: "Persian Rug",
        description: "Traditional patterned rug, red and cream tones.",
        category: "decor",
        price: 3200,
        dimensions: { l: 3.0, w: 2.0, h: 0.02 },
        image_url: "https://images.unsplash.com/photo-1575414723279-780083a67035?auto=format&fit=crop&q=80&w=300"
    }
];

export async function seedCatalog(formData?: FormData) {
    const supabase = await createClient();
    console.log("Starting seed...");

    for (const item of SAMPLE_ITEMS) {
        // Generate embedding
        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: `${item.name}. ${item.description}`,
        });
        const embedding = embeddingResponse.data[0].embedding;

        // Insert
        const { error } = await supabase.from('catalog_items').insert({
            ...item,
            currency: 'AED',
            embedding
        });

        if (error) {
            console.error("Failed to insert", item.name, error);
        } else {
            console.log("Inserted", item.name);
        }
    }
    return { success: true, count: SAMPLE_ITEMS.length };
}
