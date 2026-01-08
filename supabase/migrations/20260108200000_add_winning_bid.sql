-- Add winning_bid_id to tenders to track the awarded bid
alter table tenders 
add column if not exists winning_bid_id uuid references bids(id);
