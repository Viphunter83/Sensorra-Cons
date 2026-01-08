-- Create storage bucket
insert into storage.buckets (id, name, public)
values ('sensorra-assets', 'sensorra-assets', true)
on conflict (id) do nothing;

-- Enable RLS
-- alter table storage.objects enable row level security;

-- Policy: Authenticated users can view files (simplified for now, ideally strictly linked to property access)
create policy "Authenticated users can view sensorra-assets"
on storage.objects for select
using ( bucket_id = 'sensorra-assets' and auth.role() = 'authenticated' );

-- Policy: Owners and Contractors can insert
create policy "Owners and Contractors can upload to sensorra-assets"
on storage.objects for insert
with check (
    bucket_id = 'sensorra-assets' 
    and auth.role() = 'authenticated'
    and (
        exists (select 1 from public.profiles where id = auth.uid() and role in ('owner', 'contractor'))
    )
);
