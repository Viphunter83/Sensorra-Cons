-- 1. Updates to user_role Enum
-- Adding new roles safely
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'architect';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'consultant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'inspector';

-- 2. Create Projects Table
create table if not exists projects (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  title text not null,
  architect_id uuid references profiles(id),
  status text check (status in ('design', 'permitting', 'construction', 'handover')) default 'design',
  created_at timestamptz default now()
);

alter table projects enable row level security;

-- Policies for Projects
create policy "View projects: Owners and Assigned Architects"
  on projects for select
  using (
    exists (select 1 from properties where id = projects.property_id and owner_id = auth.uid())
    or 
    architect_id = auth.uid()
  );

create policy "Insert projects: Owners only"
  on projects for insert
  with check (
    exists (select 1 from properties where id = property_id and owner_id = auth.uid())
  );

create policy "Update projects: Owners and Assigned Architects"
  on projects for update
  using (
    exists (select 1 from properties where id = projects.property_id and owner_id = auth.uid())
    or 
    architect_id = auth.uid()
  );

-- 3. Link Documents to Projects
alter table documents 
add column if not exists project_id uuid references projects(id) on delete set null;

-- 4. Create Permits Table
create table if not exists permits (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  authority text not null, -- e.g. 'DLD', 'Municipality'
  status text check (status in ('pending', 'approved', 'rejected')) default 'pending',
  approval_doc_id uuid references documents(id),
  created_at timestamptz default now()
);

alter table permits enable row level security;

create policy "View permits: Project Stakeholders"
  on permits for select
  using (
    exists (
      select 1 from projects 
      join properties on projects.property_id = properties.id
      where projects.id = permits.project_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );

-- 5. Link Tenders to Projects
alter table tenders
add column if not exists project_id uuid references projects(id) on delete set null;
