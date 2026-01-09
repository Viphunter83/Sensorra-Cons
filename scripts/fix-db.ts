export { }; // Treat as module
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
    console.log("Deleting null model_url items...");
    const { error, count } = await supabase
        .from('catalog_items')
        .delete({ count: 'exact' })
        .is('model_url', null);

    if (error) console.error("Error:", error);
    else console.log(`Deleted ${count} items with null model_url.`);

    // Also check duplicates with valid urls? 
    // For now just removing nulls solves the pink box.
}

fix();
