export { };
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

// From .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Missing DATABASE_URL env var');
    process.exit(1);
}

// Reliable GLB
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
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Supabase requires SSL but usually self-signed is ok/managed
    });

    console.log("Connecting to Postgres...");
    await client.connect();

    try {
        console.log("Seeding items...");
        for (const item of items) {
            const query = `
                INSERT INTO catalog_items (id, name, category, price, currency, dimensions, model_url, image_url, description)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            const values = [
                uuidv4(),
                item.name,
                item.category,
                item.price,
                'USD',
                { l: 1, w: 1, h: 1 },
                item.model_url,
                item.image_url,
                `A beautiful ${item.name} for your home.`
            ];
            await client.query(query, values);
            console.log(`Added ${item.name}`);
        }
    } catch (e) {
        console.error("Error seeding:", e);
    } finally {
        await client.end();
    }
}

seed();
