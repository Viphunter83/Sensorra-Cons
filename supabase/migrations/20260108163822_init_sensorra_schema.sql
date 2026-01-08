-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- 1. Enums
create type user_role as enum ('owner', 'manager', 'contractor', 'viewer');
create type doc_status as enum ('processing', 'active', 'archived', 'rejected');
create type tender_status as enum ('draft', 'open', 'review', 'awarded', 'closed');

-- 2. Profiles (Extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  company_name text,
  role user_role default 'viewer'::user_role,
  avatar_url text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone" 
  on profiles for select using (true);

create policy "Users can insert their own profile" 
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
  on profiles for update using (auth.uid() = id);

-- 3. Properties
create table properties (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references profiles(id) not null,
  title text not null,
  address_data jsonb default '{}'::jsonb,
  specs jsonb default '{}'::jsonb,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table properties enable row level security;

create policy "View properties: Owners or Invited Contractors"
  on properties for select
  using (
    auth.uid() = owner_id 
    -- Logic for 'Invited Contractor' would typically require a separate 'property_access' table
    -- For now, we strictly implement: Owner can see. 
    -- TODO: Add logic for contractors when invites are implemented.
  );

create policy "Insert properties: Owners Only"
  on properties for insert
  with check (
    auth.uid() = owner_id 
    and exists (select 1 from profiles where id = auth.uid() and role = 'owner')
  );

create policy "Update properties: Owners Only"
  on properties for update
  using (auth.uid() = owner_id);

-- 4. Documents
create table documents (
  id uuid default uuid_generate_v4() primary key,
  property_id uuid references properties(id) on delete cascade not null,
  uploader_id uuid references profiles(id) not null,
  type text not null,
  file_url text not null,
  version int default 1,
  ai_metadata jsonb default '{}'::jsonb,
  status doc_status default 'processing'::doc_status,
  created_at timestamptz default now()
);

alter table documents enable row level security;

create policy "View documents: Property Access"
  on documents for select
  using (
    exists (
      select 1 from properties 
      where id = documents.property_id 
      and properties.owner_id = auth.uid()
    )
  );

create policy "Insert documents: Owners and Contractors"
  on documents for insert
  with check (
     auth.uid() = uploader_id
     -- Basic check for role presence
     and exists (select 1 from profiles where id = auth.uid() and role in ('owner', 'contractor'))
  );

-- 5. Audit Logs
create table audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id),
  action text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz default now()
);

alter table audit_logs enable row level security;

-- Audit logs are typically viewable only by admins/managers, insertable by system/triggers
create policy "View audit logs: Managers only"
  on audit_logs for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'manager'));
  
-- Allow all authenticated users to create logs (for application-level logging)
create policy "Insert audit logs: Authenticated users"
  on audit_logs for insert
  with check (auth.role() = 'authenticated');
