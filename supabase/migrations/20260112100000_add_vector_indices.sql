-- Add IVFFlat indices for vector similarity search
-- Improves performance of Match RPC functions

SET maintenance_work_mem = '128MB';

CREATE INDEX IF NOT EXISTS knowledge_base_embedding_idx 
ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS project_embeddings_embedding_idx 
ON project_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

CREATE INDEX IF NOT EXISTS catalog_items_embedding_idx 
ON catalog_items 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
