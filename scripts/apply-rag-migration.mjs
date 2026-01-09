
import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Simple .env parser
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
    console.log('No .env file found or error reading it', e);
}

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const migrationFile = 'supabase/migrations/20260109130000_add_vector_rag.sql';

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
