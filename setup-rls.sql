-- ##################################################################
-- 1. Enable Row Level Security (RLS)
-- ##################################################################
DROP POLICY IF EXISTS "Allow public checks" ON public.admins;

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- ##################################################################
-- 2. Define Public (Anon) Policies
-- ##################################################################

-- Allow public inserts into students
CREATE POLICY "Allow public inserts into students" 
ON public.students FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow public inserts into faculty
CREATE POLICY "Allow public inserts into faculty" 
ON public.faculty FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow public inserts into vehicles
CREATE POLICY "Allow public inserts into vehicles" 
ON public.vehicles FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow public status checks
CREATE POLICY "Allow public status checks" 
ON public.vehicles FOR SELECT 
TO anon 
USING (true);

-- Allow public status updates (for Admin simulation)
CREATE POLICY "Allow public status updates" 
ON public.vehicles FOR UPDATE
TO anon 
USING (true)
WITH CHECK (true);

-- Admins Policy (Allow SELECT to check credentials)
DROP POLICY IF EXISTS "Allow public checks" ON public.admins;
CREATE POLICY "Allow public checks" 
ON public.admins FOR SELECT 
TO anon 
USING (true);

-- Violations Policy
DROP POLICY IF EXISTS "Enable insert for all users" ON public.violations;
CREATE POLICY "Enable insert for all users" 
ON public.violations FOR INSERT 
TO anon 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public checks" ON public.violations;
CREATE POLICY "Allow public checks" 
ON public.violations FOR SELECT 
TO anon 
USING (true);

DROP POLICY IF EXISTS "Allow public updates" ON public.violations;
CREATE POLICY "Allow public updates" 
ON public.violations FOR UPDATE
TO anon 
USING (true)
WITH CHECK (true);

-- ##################################################################
-- 3. Storage Policies
-- ##################################################################

-- Ensure 'documents' bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Enable public upload for documents" ON storage.objects;
DROP POLICY IF EXISTS "Enable public access to documents" ON storage.objects;

-- Allows public to upload documents into the 'documents' bucket.
CREATE POLICY "Enable public upload for documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'documents');

-- Allows public to view/access the documents.
CREATE POLICY "Enable public access to documents"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'documents');
