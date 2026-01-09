-- Enable Vector Extension
create extension if not exists vector;

-- 1. Knowledge Base (Regulations, Codes)
create table if not exists knowledge_base (
  id uuid default uuid_generate_v4() primary key,
  content text not null,
  embedding vector(1536), -- Matching OpenAI text-embedding-3-small
  metadata jsonb default '{}'::jsonb, -- e.g. source: "Dubai Building Code 2024", page: 12
  created_at timestamptz default now()
);

alter table knowledge_base enable row level security;

-- Only admins/managers (or system) should modify knowledge base, but everyone can read (via server actions/functions)
-- For simplicity in this MVP, we allow authenticated read.
create policy "Read knowledge base: Everyone"
  on knowledge_base for select
  using (true);

-- 2. Project Embeddings (RAG on Project Docs)
create table if not exists project_embeddings (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb, -- e.g. source_doc_id: uuid
  created_at timestamptz default now()
);

alter table project_embeddings enable row level security;

create policy "View project embeddings: Project Access"
  on project_embeddings for select
  using (
    exists (
      select 1 from projects 
      join properties on projects.property_id = properties.id
      where projects.id = project_embeddings.project_id
      and (properties.owner_id = auth.uid() or projects.architect_id = auth.uid())
    )
  );

-- Function for similarity search (Knowledge Base)
create or replace function match_knowledge_base (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Function for similarity search (Project Context)
create or replace function match_project_context (
  query_embedding vector(1536),
  target_project_id uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    project_embeddings.id,
    project_embeddings.content,
    project_embeddings.metadata,
    1 - (project_embeddings.embedding <=> query_embedding) as similarity
  from project_embeddings
  where project_id = target_project_id
  and 1 - (project_embeddings.embedding <=> query_embedding) > match_threshold
  order by project_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;
