export { };
const { Client } = require('pg');

// From .env
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Missing DATABASE_URL env var');
    process.exit(1);
}

async function run() {
    const client = new Client({
        connectionString: DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    console.log("Connecting to Postgres...");
    await client.connect();

    try {
        console.log("Unlocking RLS for Spaces and Boards...");

        // Fix SPACES
        await client.query(`
            DROP POLICY IF EXISTS "View spaces: Project Stakeholders" ON spaces;
            DROP POLICY IF EXISTS "Manage spaces: Project Stakeholders" ON spaces;
            
            CREATE POLICY "Enable all access for authenticated users (Spaces)"
            ON spaces FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        `);
        console.log("Unlocked: spaces");

        // Fix DESIGN_BOARDS (just to be safe/redundant)
        await client.query(`
            DROP POLICY IF EXISTS "Enable all access for authenticated users" ON design_boards; -- Drop previous if exists
            DROP POLICY IF EXISTS "Manage design boards: Space/Project Stakeholders" ON design_boards;
            DROP POLICY IF EXISTS "View design boards: Space/Project Stakeholders" ON design_boards;
            
            CREATE POLICY "Enable all access for authenticated users (Boards)"
            ON design_boards FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true);
        `);
        console.log("Unlocked: design_boards");

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await client.end();
    }
}

run();
