
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const migrationFile = 'supabase/migrations/20260108171136_storage_bucket.sql';

if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function applyMigration() {
    const client = await pool.connect();
    console.log('Connected to DB.');

    try {
        const sql = fs.readFileSync(migrationFile, 'utf8');
        console.log(`Applying ${migrationFile}...`);
        console.log(sql);

        await client.query(sql);
        console.log('Migration applied successfully!');

    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

applyMigration();
