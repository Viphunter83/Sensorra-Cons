-- Phase B: Smart Tender Migrations

-- 1. Create Tender Invites Table (for Private Tenders)
create table if not exists tender_invites (
  id uuid default uuid_generate_v4() primary key,
  tender_id uuid references tenders(id) on delete cascade not null,
  email text not null,
  token text not null, -- Unique token for "Click to Bid" link
  status text default 'pending', -- pending, accepted, declined
  created_at timestamptz default now(),
  unique(tender_id, email)
);

-- 2. Add PDF URL to Bids (for storing original quote)
alter table bids 
add column if not exists pdf_url text,
add column if not exists score numeric; -- AI Analysis Score (0-100)

-- 3. RLS for Tender Invites
alter table tender_invites enable row level security;

-- Owners can view/manage invites for their tenders
create policy "Manage invites: Tender Owners"
  on tender_invites for all
  using (
    exists (
      select 1 from tenders 
      where tenders.id = tender_invites.tender_id 
      and tenders.owner_id = auth.uid()
    )
  );

-- 4. Update Tenders to support "Invite Only" mode logic implies status check
-- (Existing policies handle 'open' vs owner, we might need a policy for 'invited contractors' later, 
-- but for now invites are just for notification/access token verification on backend)

-- 5. Add matching function for AI Analysis (if needed for later)
-- For now, handled in app logic.
