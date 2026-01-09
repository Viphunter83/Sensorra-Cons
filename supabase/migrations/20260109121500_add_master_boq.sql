-- Create Master BoQ table
create table public.master_boq (
  id uuid not null default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'final', 'approved')),
  total_estimated_cost numeric default 0,
  currency text default 'AED',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint master_boq_pkey primary key (id)
);

-- Create BoQ Items table
create table public.boq_items (
  id uuid not null default gen_random_uuid(),
  master_boq_id uuid not null references public.master_boq(id) on delete cascade,
  item_code text,
  description text not null,
  unit text,
  quantity numeric not null,
  estimated_rate numeric,
  estimated_amount numeric,
  category text,
  specification_reference text,
  created_at timestamptz default now(),
  constraint boq_items_pkey primary key (id)
);

-- RLS Policies
alter table public.master_boq enable row level security;
alter table public.boq_items enable row level security;

-- Policies for master_boq
create policy "Users can view master_boq for their projects"
on public.master_boq for select
using (
  exists (
    select 1 from public.projects
    where projects.id = master_boq.project_id
    and (
      -- Owner access
      projects.property_id in (
        select id from public.properties where owner_id = auth.uid()
      )
      OR
      -- Architect access
      projects.architect_id = auth.uid()
    )
  )
);

create policy "Architects or Owners can insert master_boq"
on public.master_boq for insert
with check (
  exists (
    select 1 from public.projects
    where projects.id = master_boq.project_id
    and (
        projects.property_id in (select id from public.properties where owner_id = auth.uid())
        OR
        projects.architect_id = auth.uid()
    )
  )
);

-- Policies for boq_items
create policy "Users can view boq_items for their projects"
on public.boq_items for select
using (
  exists (
    select 1 from public.master_boq
    join public.projects on projects.id = master_boq.project_id
    where master_boq.id = boq_items.master_boq_id
    and (
        projects.property_id in (select id from public.properties where owner_id = auth.uid())
        OR
        projects.architect_id = auth.uid()
    )
  )
);
