export { };
const { Client } = require('pg');

// From .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Missing DATABASE_URL env var');
    process.exit(1);
}

// Distinct Models
const CHAIR_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb';
const LAMP_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb';
const TABLE_URL = 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'; // Using Box for Table/Desk for now

async function update() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log("Connecting to Postgres...");
    await client.connect();

    try {
        console.log("Updating Models...");

        // 1. Update Lamps
        await client.query(`
            UPDATE catalog_items 
            SET model_url = $1 
            WHERE name ILIKE '%Lamp%'
        `, [LAMP_URL]);
        console.log("Updated Lamps to Lantern model");

        // 2. Update Desks / Tables
        await client.query(`
            UPDATE catalog_items 
            SET model_url = $1 
            WHERE name ILIKE '%Desk%' OR name ILIKE '%Table%'
        `, [TABLE_URL]);
        console.log("Updated Tables/Desks to Box model");

        // 3. Update Beds (Use Box for now too, maybe larger?)
        await client.query(`
            UPDATE catalog_items 
            SET model_url = $1 
            WHERE name ILIKE '%Bed%'
        `, [TABLE_URL]);
        console.log("Updated Beds to Box model");

    } catch (e) {
        console.error("Error updating:", e);
    } finally {
        await client.end();
    }
}

update();
