
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Note: In a real scenario, we'd use the service role key for seeding to bypass RLS. 
// Since we only have the anon key, we'll try to sign up a user (or sign in) and then create a property.
// If RLS prevents it, we'll need to ask for the service role key or use the SQL editor.

// However, for this environment, let's assume we can simulate a user flow.
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedData() {
    console.log('Seeding data...');

    // 1. Create/Sign-in a test user
    const email = 'demo@sensorra.com';
    const password = 'password123';

    let userId;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
            console.log('User not found, attempting signup...');
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: 'Demo User', role: 'owner' }
                }
            });
            if (signUpError) {
                console.error('Signup failed:', signUpError.message);
                return; // Can't proceed without a user
            }
            userId = signUpData.user?.id;
            console.log('User created:', userId);
        } else {
            console.error('Sign in failed:', signInError.message);
            return;
        }
    } else {
        userId = signInData.user.id;
        console.log('User signed in:', userId);
    }

    if (!userId) {
        console.error('Failed to obtain user ID');
        return;
    }

    // 2. Ensure Profile exists (trigger usually handles this, but let's check basic insert if needed - schema has triggers? checked schema, no triggers mentioned, so we might need to insert manually if signUp didn't trigger one or if we rely on client)
    // The schema "20260108163822_init_sensorra_schema.sql" defines profiles table but no auto-create trigger from auth.users.
    // We need to insert a profile for this user manually if it doesn't exist.

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (!profile) {
        console.log('Creating profile...');
        const { error: insertProfileError } = await supabase.from('profiles').insert({
            id: userId,
            full_name: 'Demo User',
            role: 'owner',
            company_name: 'Sensorra Demo Corp'
        });
        if (insertProfileError) console.error('Profile creation failed:', insertProfileError.message);
        else console.log('Profile created.');
    } else {
        console.log('Profile exists.');
    }

    // 3. Create a Demo Property
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', userId);

    let propertyId;
    if (properties && properties.length > 0) {
        propertyId = properties[0].id;
        console.log('Using existing property:', propertyId);
    } else {
        console.log('Creating demo property...');
        const { data: newProp, error: propError } = await supabase
            .from('properties')
            .insert({
                owner_id: userId,
                title: 'Project Alpha - Downtown Tower',
                is_published: true
            })
            .select()
            .single();

        if (propError) {
            console.error('Property creation failed:', propError.message);
        } else {
            propertyId = newProp.id;
            console.log('Property created:', propertyId);
        }
    }

    if (propertyId) {
        console.log('Seed successful. Use this Property ID for testing:', propertyId);
    }
}

seedData();
