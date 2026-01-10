
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual Env Load
try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) process.env[key.trim()] = val.trim().replace(/"/g, '');
    });
} catch (e) {
    console.log("No .env.local found, assuming env vars set");
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const SAMPLE_ITEMS = [
    {
        name: "Designer Velvet Sofa",
        description: "A luxurious 3-seater sofa upholstered in deep blue velvet.",
        category: "furniture",
        price: 5200,
        dimensions: { l: 2.2, w: 0.9, h: 0.8 },
        image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=300",
        model_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb"
    },
    {
        name: "Minimalist Wooden Coffee Table",
        description: "Solid oak coffee table with a natural finish.",
        category: "furniture",
        price: 1800,
        dimensions: { l: 1.2, w: 0.6, h: 0.4 },
        image_url: "https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&q=80&w=300",
        model_url: "https://media.githubusercontent.com/media/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF-Binary/AntiqueCamera.glb"
    },
    {
        name: "Modern Floor Lamp",
        description: "Sleek metal floor lamp for ambient lighting.",
        category: "lighting",
        price: 950,
        dimensions: { l: 0.4, w: 0.4, h: 1.6 },
        image_url: "https://images.unsplash.com/photo-1513506003013-d531628af69d?auto=format&fit=crop&q=80&w=300",
        model_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb"
    },
    {
        name: "Potted Ficus Plant",
        description: "Large indoor plant to add greenery to your space.",
        category: "decor",
        price: 450,
        dimensions: { l: 0.5, w: 0.5, h: 1.2 },
        image_url: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=300",
        model_url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/BoomBox/glTF-Binary/BoomBox.glb"
    }
];

async function main() {
    console.log("Seeding catalog (Standalone)...");

    for (const item of SAMPLE_ITEMS) {
        // Mock embedding
        const embedding = new Array(1536).fill(0);

        const { error } = await supabase.from('catalog_items').insert({
            ...item,
            currency: 'AED',
            embedding
        });

        if (error) {
            console.error("Failed:", item.name, error.message);
        } else {
            console.log("Inserted:", item.name);
        }
    }
    console.log("Done.");
}

main();
