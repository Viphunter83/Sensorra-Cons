-- Phase 4: AI Designer & Marketplace Design
-- 0. Enable Vector (just in case, should be enabled by previous migration)
create extension if not exists vector;

-- 1. Create Spaces table (Rooms within a Project)
create table if not exists spaces (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  name text not null, -- e.g. 'Master Bedroom'
  dimensions jsonb not null default '{"l": 5, "w": 4, "h": 3}', -- Length, Width, Height in meters
  model_url text, -- Custom GLB/GLTF file URL (optional)
  created_at timestamptz default now()
);

alter table spaces enable row level security;

-- Policies for Spaces (Inherit from Project Access)
create policy "View spaces: Project Stakeholders"
  on spaces for select
  using (
    exists (
      select 1 from projects 
      join properties on projects.property_id = properties.id
      where projects.id = spaces.project_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );

create policy "Manage spaces: Project Stakeholders"
  on spaces for all
  using (
    exists (
      select 1 from projects 
      join properties on projects.property_id = properties.id
      where projects.id = spaces.project_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );


-- 2. Create Catalog Items (The Marketplace)
create table if not exists catalog_items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  category text, -- furniture, lighting, flooring, decor
  price numeric,
  currency text default 'AED',
  dimensions jsonb, -- {l, w, h}
  image_url text,
  model_url text, -- 3D model URL
  supplier_name text,
  supplier_url text,
  embedding vector(1536), -- For AI semantic search
  created_at timestamptz default now()
);

alter table catalog_items enable row level security;

-- Catalog is public read (authenticated)
create policy "Catalog items: Viewable by everyone"
  on catalog_items for select
  using (true);

-- 3. Create Design Boards (Visualize items in a Space)
create table if not exists design_boards (
  id uuid default uuid_generate_v4() primary key,
  space_id uuid references spaces(id) on delete cascade not null,
  name text, -- e.g. 'Concept 1'
  items jsonb default '[]'::jsonb, -- Array of { catalog_item_id, position: {x,y,z}, rotation: {x,y,z} }
  created_at timestamptz default now()
);

alter table design_boards enable row level security;

create policy "View design boards: Space/Project Stakeholders"
  on design_boards for select
  using (
    exists (
      select 1 from spaces
      join projects on spaces.project_id = projects.id
      join properties on projects.property_id = properties.id
      where spaces.id = design_boards.space_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );

create policy "Manage design boards: Space/Project Stakeholders"
  on design_boards for all
  using (
    exists (
      select 1 from spaces
      join projects on spaces.project_id = projects.id
      join properties on projects.property_id = properties.id
      where spaces.id = design_boards.space_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );

-- 4. Search Function for Catalog
create or replace function search_catalog_items (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_category text default null
)
returns table (
  id uuid,
  name text,
  description text,
  price numeric,
  image_url text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    catalog_items.id,
    catalog_items.name,
    catalog_items.description,
    catalog_items.price,
    catalog_items.image_url,
    1 - (catalog_items.embedding <=> query_embedding) as similarity
  from catalog_items
  where 1 - (catalog_items.embedding <=> query_embedding) > match_threshold
  and (filter_category is null or catalog_items.category = filter_category)
  order by catalog_items.embedding <=> query_embedding
  limit match_count;
end;
$$;
