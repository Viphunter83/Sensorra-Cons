
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

        if (error) {
            console.error('Connection failed:', error.message);
            if (error.code === 'PGRST116') {
                console.log('Connected, but table might be empty or permissions issue (expected for anon).');
            }
        } else {
            console.log('Success! Connection established.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testConnection();
