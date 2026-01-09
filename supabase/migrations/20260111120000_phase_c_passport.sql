-- Phase C: Digital Passport Migrations

-- 1. Create Timeline Events Table (The "Timeline of Truth")
create table if not exists timeline_events (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  title text not null, -- e.g. "Replaced Circuit Breaker"
  description text,
  category text not null, -- e.g. 'maintenance', 'renovation', 'incident', 'inspection'
  event_date date default CURRENT_DATE,
  media_urls text[], -- Array of photo/document URLs
  verified boolean default false, -- If added by a certified contractor
  created_at timestamptz default now()
);

-- 2. Add Public Access Token to Projects
-- This allows sharing a read-only version of the project without login
alter table projects 
add column if not exists public_access_token text unique,
add column if not exists is_public boolean default false;

-- 3. RLS for Timeline Events
alter table timeline_events enable row level security;

-- Owners can manage their timeline
create policy "Manage timeline: Project Owners"
  on timeline_events for all
  using (
    exists (
      select 1 from projects 
      join properties on projects.property_id = properties.id
      where projects.id = timeline_events.project_id 
      and properties.owner_id = auth.uid()
    )
  );

-- Public Access Policy (Read-Only via Token check in application logic mainly, 
-- but we can verify public access via a specialized view or function if needed. 
-- For MVP, we'll rely on the server action fetching data using a service role or 
-- strictly controlled query if the token matches).
-- ACTUALLY, strict RLS is better. Let's allowing selecting if project is public.

create policy "Public view timeline: If project is public"
  on timeline_events for select
  using (
    exists (
      select 1 from projects 
      where projects.id = timeline_events.project_id 
      and projects.is_public = true
    )
  );

-- Also allow public viewing of generic project info if public
create policy "Public view projects: If is_public"
  on projects for select
  using (is_public = true);

-- And Spaces (for the 3D viewer)
create policy "Public view spaces: If project is public"
  on spaces for select
  using (
    exists (
      select 1 from projects 
      where projects.id = spaces.project_id 
      and projects.is_public = true
    )
  );

-- And Design Boards (for the 3D viewer)
create policy "Public view boards: If project is public"
  on design_boards for select
  using (
    exists (
      select 1 from spaces
      join projects on spaces.project_id = projects.id
      where spaces.id = design_boards.space_id
      and projects.is_public = true
    )
  );
