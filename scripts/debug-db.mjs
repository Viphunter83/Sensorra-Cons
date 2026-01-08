
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function debugDB() {
    const client = await pool.connect();
    console.log('Connected to DB.');

    try {
        // 1. List Users
        console.log('--- Auth Users ---');
        const users = await client.query('SELECT id, email, created_at, last_sign_in_at FROM auth.users');
        users.rows.forEach(u => console.log(`User: ${u.email} (ID: ${u.id})`));

        // 2. List Properties
        console.log('\n--- Properties ---');
        const props = await client.query('SELECT id, title, owner_id FROM public.properties');
        props.rows.forEach(p => console.log(`Property: "${p.title}" (Owner: ${p.owner_id})`));

        // 3. List Profiles
        console.log('\n--- Profiles ---');
        const profiles = await client.query('SELECT id, full_name, role FROM public.profiles');
        profiles.rows.forEach(p => console.log(`Profile: ${p.full_name} (${p.role}) ID: ${p.id}`));

    } catch (err) {
        console.error('Debug Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

debugDB();
