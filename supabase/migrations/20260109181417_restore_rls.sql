-- Restore strict RLS policies on design_boards
-- (Reverses the insecure changes from scripts/fix-rls.ts)

-- 1. Drop the insecure "Enable all access" policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON design_boards;

-- 2. Drop the old policies if they exist (just to be clean)
DROP POLICY IF EXISTS "View design boards: Space/Project Stakeholders" ON design_boards;
DROP POLICY IF EXISTS "Manage design boards: Space/Project Stakeholders" ON design_boards;

-- 3. Re-create the strict policies
-- Policy: View (Owner or Architect)
CREATE POLICY "View design boards: Space/Project Stakeholders"
  ON design_boards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      JOIN projects ON spaces.project_id = projects.id
      JOIN properties ON projects.property_id = properties.id
      WHERE spaces.id = design_boards.space_id
      AND (properties.owner_id = auth.uid() OR projects.architect_id = auth.uid())
    )
  );

-- Policy: Manage (CRUD) (Owner or Architect)
CREATE POLICY "Manage design boards: Space/Project Stakeholders"
  ON design_boards FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM spaces
      JOIN projects ON spaces.project_id = projects.id
      JOIN properties ON projects.property_id = properties.id
      WHERE spaces.id = design_boards.space_id
      AND (properties.owner_id = auth.uid() OR projects.architect_id = auth.uid())
    )
  );
