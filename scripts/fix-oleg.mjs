
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

async function fixOleg() {
    const client = await pool.connect();
    console.log('Connected.');

    try {
        const email = 'olegvakin@gmail.com';

        // 1. Get User ID
        const userRes = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            console.error('User not found!');
            return;
        }
        const userId = userRes.rows[0].id;
        console.log(`User ID: ${userId}`);

        // 2. Confirm Email (optional, but good)
        await client.query('UPDATE auth.users SET email_confirmed_at = now() WHERE id = $1', [userId]);

        // 3. Create Profile
        await client.query(`
      INSERT INTO public.profiles (id, full_name, role, company_name)
      VALUES ($1, 'Oleg Vakin', 'owner', 'My Company')
      ON CONFLICT (id) DO NOTHING
    `, [userId]);

        // 4. Create Property
        await client.query(`
        INSERT INTO public.properties (owner_id, title, is_published)
        VALUES ($1, 'Oleg Project', true)
    `, [userId]);

        console.log('Done! Property created for Oleg.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

fixOleg();
