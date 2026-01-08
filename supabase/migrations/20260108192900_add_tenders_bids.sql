-- Create Tenders Table
create table if not exists tenders (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  owner_id uuid references profiles(id) not null,
  title text not null,
  scope_of_work text, -- AI generated description
  budget_max numeric,
  zone_tag text,
  status tender_status default 'open'::tender_status,
  created_at timestamptz default now()
);

alter table tenders enable row level security;

-- Policies for Tenders
create policy "View tenders: Everyone (Marketplace)"
  on tenders for select
  using (status = 'open' or auth.uid() = owner_id);

create policy "Insert tenders: Owners only"
  on tenders for insert
  with check (auth.uid() = owner_id);

create policy "Update tenders: Owners only"
  on tenders for update
  using (auth.uid() = owner_id);


-- Create Bids Table (Sealed Bidding)
create table if not exists bids (
  id uuid default uuid_generate_v4() primary key,
  tender_id uuid references tenders(id) on delete cascade not null,
  contractor_id uuid references profiles(id) not null,
  price numeric not null,
  comment text,
  created_at timestamptz default now()
);

alter table bids enable row level security;

-- Policies for Bids
-- 1. Contractors can view ONLY their own bids.
-- 2. Owners can view bids ONLY for their own tenders.
create policy "View bids: Owners of tender or Author Contractor"
  on bids for select
  using (
    auth.uid() = contractor_id 
    or 
    exists (select 1 from tenders where id = bids.tender_id and owner_id = auth.uid())
  );

-- Contractors can insert bids
create policy "Insert bids: Authenticated users (Contractors)"
  on bids for insert
  with check (auth.uid() = contractor_id);
