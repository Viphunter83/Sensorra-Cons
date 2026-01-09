const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
    try {
        await client.connect();
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260109181500_add_model_url.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied.');
    } catch (err) {
        if (err.code === '42701') { // duplicate_column
            console.log('Column already exists, skipping.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await client.end();
    }
}

applyMigration();
