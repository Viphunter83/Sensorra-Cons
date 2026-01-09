const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function applyMigration() {
    try {
        await client.connect();

        // Read the migration file
        const migrationPath = path.join(__dirname, '../supabase/migrations/20260109180200_allow_catalog_insert.sql');
        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully.');

    } catch (err) {
        if (err.code === '42710') { // duplicate_object (policy already exists)
            console.log('Policy already exists, skipping.');
        } else {
            console.error('Migration failed:', err);
        }
    } finally {
        await client.end();
    }
}

applyMigration();
