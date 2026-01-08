
import pg from 'pg';
const { Pool } = pg;

// Parse .env manualy since we don't assume loaded in this context unless referenced
// But we run with `set -a; source .env` so process.env.DATABASE_URL is available.

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is missing.');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function adminSeed() {
    const client = await pool.connect();
    console.log('Connected to DB as Admin.');

    try {
        const email = 'demo@sensorra.com';

        // 1. Confirm User
        console.log(`Confirming user ${email}...`);
        const confirmRes = await client.query(`
      UPDATE auth.users 
      SET email_confirmed_at = now() 
      WHERE email = $1 
      RETURNING id;
    `, [email]);

        let userId;
        if (confirmRes.rows.length === 0) {
            console.log('User not found in auth.users. Please Sign Up first via the UI (even if email fails).');
            // If user doesn't exist, we can't really create them easily as auth.users requires hashing password.
            // We rely on the user having tried to sign up.
            // Alternatives: Create a user via SQL? Complex due to password hashing (bcrypt/argon2).
            // Better to ask user to "Sign Up" if they haven't.
            console.log('Trying to find any user to fallback...');
            const anyUser = await client.query('SELECT id, email FROM auth.users LIMIT 1');
            if (anyUser.rows.length > 0) {
                userId = anyUser.rows[0].id;
                console.log(`Found existing user: ${anyUser.rows[0].email} (${userId})`);
            }
        } else {
            userId = confirmRes.rows[0].id;
            console.log(`User confirmed: ${userId}`);
        }

        if (!userId) {
            console.error('No user found to seed data for.');
            return;
        }

        // 2. Ensure Profile
        console.log('Ensuring profile...');
        const profileRes = await client.query(`
      INSERT INTO public.profiles (id, full_name, role, company_name)
      VALUES ($1, 'Demo Owner', 'owner', 'Sensorra Corp')
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `, [userId]);
        console.log('Profile ensured.');

        // 3. Ensure Property
        console.log('Ensuring property...');
        const propRes = await client.query(`
        INSERT INTO public.properties (owner_id, title, is_published)
        VALUES ($1, 'Downtown Tower - Demo', true)
        RETURNING id;
    `, [userId]); // Note: If insert fails (not unique?), we don't have constraints on title. It will create new one.
        // Ideally check if exists.

        // Clean up duplicates for demo
        // await client.query('DELETE FROM public.properties WHERE owner_id = $1 AND title = $2', [userId, 'Downtown Tower - Demo']);

        console.log(`Property created: ${propRes.rows[0]?.id}`);

    } catch (err) {
        console.error('Admin Seed Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

adminSeed();
