-- Create bid_items table
create table public.bid_items (
  id uuid not null default gen_random_uuid(),
  bid_id uuid not null references public.bids(id) on delete cascade,
  master_item_id uuid references public.boq_items(id) on delete set null, -- Link to Master BoQ Item
  description text not null,
  unit text,
  quantity numeric not null,
  unit_price numeric,
  total_price numeric,
  notes text,
  created_at timestamptz default now(),
  constraint bid_items_pkey primary key (id)
);

-- Enable RLS
alter table public.bid_items enable row level security;

-- Policies

-- 1. Owners/Project Members can view bid items for tenders they own
create policy "Owners can view bid items"
on public.bid_items for select
using (
  exists (
    select 1 from public.bids b
    join public.tenders t on b.tender_id = t.id
    where b.id = bid_items.bid_id
    and t.owner_id = auth.uid()
  )
);

-- 2. Contractors can see their own bid items
create policy "Contractors can view own bid items"
on public.bid_items for select
using (
  exists (
    select 1 from public.bids b
    where b.id = bid_items.bid_id
    and b.contractor_id = auth.uid()
  )
);

-- 3. Contractors can insert their own bid items
create policy "Contractors can insert own bid items"
on public.bid_items for insert
with check (
  exists (
    select 1 from public.bids b
    where b.id = bid_items.bid_id
    and b.contractor_id = auth.uid()
  )
);
