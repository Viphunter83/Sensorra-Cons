-- Add proposal_text to bids table
alter table bids 
add column if not exists proposal_text text,
add column if not exists project_id uuid references projects(id);

-- While we are at it, ensure tenders has project_id (already done in previous steps but good for consistency)
