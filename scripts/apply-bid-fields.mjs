
import pg from 'pg';
import fs from 'fs';

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
} catch (e) { console.log(e); }

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function apply() {
    const client = await pool.connect();
    try {
        const sql = fs.readFileSync('supabase/migrations/20260109133000_add_bid_fields.sql', 'utf8');
        await client.query(sql);
        console.log('Bid Fields Added.');
    } catch (e) {
        console.error(e);
    } finally {
        client.release();
        pool.end();
    }
}
apply();
