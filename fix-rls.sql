-- Temporarily disable RLS to allow uploads
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Or create a more permissive policy
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
CREATE POLICY "Allow authenticated users to insert" ON documents
  FOR INSERT TO authenticated WITH CHECK (true);