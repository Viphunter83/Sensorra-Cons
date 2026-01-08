
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkBucket() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    const bucket = data.find(b => b.name === 'sensorra-assets');
    if (bucket) {
        console.log('SUCCESS: Bucket "sensorra-assets" exists.');
        console.log('Public:', bucket.public);
    } else {
        console.log('FAILURE: Bucket "sensorra-assets" DOES NOT EXIST.');
        console.log('Available buckets:', data.map(b => b.name));
    }
}

checkBucket();
