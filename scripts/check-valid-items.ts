export { };
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listValidItems() {
    console.log("Checking for items with valid model_url...");
    const { data, error } = await supabase
        .from('catalog_items')
        .select('id, name, category, model_url')
        .not('model_url', 'is', null)
        .limit(50);

    if (error) console.error("Error:", error);
    else {
        console.log(`Found ${data.length} valid items:`);
        console.table(data);
    }
}

listValidItems();
