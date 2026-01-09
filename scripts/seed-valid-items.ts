export { };
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Use a reliable GLB from Khronos reference (SheenChair) for all items for now,
// as we just need to verify the *flow* working. 
const MODEL_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb';
const IMAGE_URL = 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=1000';

const items = [
    { name: 'Ergonomic Office Chair', category: 'furniture', price: 299, model_url: MODEL_URL, image_url: IMAGE_URL },
    { name: 'Minimalist Oak Desk', category: 'furniture', price: 499, model_url: MODEL_URL, image_url: IMAGE_URL },
    { name: 'Modern Table Lamp', category: 'lighting', price: 89, model_url: MODEL_URL, image_url: IMAGE_URL },
    { name: 'King Size Bed Frame', category: 'furniture', price: 899, model_url: MODEL_URL, image_url: IMAGE_URL },
    { name: 'Bedside Nightstand', category: 'furniture', price: 149, model_url: MODEL_URL, image_url: IMAGE_URL },
    { name: 'Dining Table', category: 'furniture', price: 699, model_url: MODEL_URL, image_url: IMAGE_URL },
];

async function seed() {
    console.log("Seeding valid catalog items...");

    for (const item of items) {
        const { error } = await supabase.from('catalog_items').insert({
            id: uuidv4(),
            name: item.name,
            category: item.category,
            price: item.price,
            currency: 'USD',
            dimensions: { l: 1, w: 1, h: 1 },
            model_url: item.model_url,
            image_url: item.image_url,
            description: `A beautiful ${item.name} for your home.`
        });
        if (error) console.error(`Failed to add ${item.name}:`, error.message);
        else console.log(`Added ${item.name}`);
    }
}

seed();
