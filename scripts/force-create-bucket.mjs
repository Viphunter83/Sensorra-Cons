
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

async function forceCreateBucket() {
    const client = await pool.connect();
    console.log('Connected to DB.');

    try {
        console.log('Inserting bucket...');
        const res = await client.query(`
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('sensorra-assets', 'sensorra-assets', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
        console.log('Insert Result:', res.rowCount);

        // Verify immediately via SQL
        const check = await client.query("SELECT * FROM storage.buckets WHERE id = 'sensorra-assets'");
        console.log('Bucket in DB:', check.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        pool.end();
    }
}

forceCreateBucket();
