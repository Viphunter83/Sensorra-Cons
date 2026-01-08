
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
    console.log('Testing Authentication...');

    // Try to sign in with a made-up user to see if we get a network/CORS error or a logical "Invalid login" error.
    // "Invalid login" means connectivity is FINE.
    // Network error means CORS/Port issue.

    const email = 'test_connectivity@sensorra.com';
    const password = 'password123';

    console.log(`Attempting sign in for ${email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.log('Result:', error.message);
        if (error.message.includes('Invalid login credentials')) {
            console.log('SUCCESS: Connection allows auth requests. Port 3002 origin is likely NOT blocked for API calls.');
        } else {
            console.log('POTENTIAL ISSUE: Unexpected error may indicate config problems.');
        }
    } else {
        console.log('Unexpected success (user shouldn\'t exist).');
    }
}

testAuth();
