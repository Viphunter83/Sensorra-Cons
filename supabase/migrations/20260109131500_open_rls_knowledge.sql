-- Allow everyone to insert/update/delete knowledge base for Demo purposes
create policy "Manage knowledge base: Everyone"
  on knowledge_base
  using (true)
  with check (true);
