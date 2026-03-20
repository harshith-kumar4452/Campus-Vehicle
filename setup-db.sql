-- ##################################################################
-- 0. DESTROY EXISTING TABLES
-- Description: Drops existing tables to start with a clean slate
-- ##################################################################
DROP TABLE IF EXISTS public.violations CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.faculty CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.teachers CASCADE;

-- ##################################################################
-- 1. Create the Students Table
-- ##################################################################
CREATE TABLE IF NOT EXISTS public.students (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  roll_number text UNIQUE NOT NULL,
  year text NOT NULL,
  branch text,
  section text NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  parent_guardian_phone text,
  dl_number text UNIQUE NOT NULL,
  dl_url text,
  id_card_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ##################################################################
-- 2. Create the Faculty Table
-- ##################################################################
CREATE TABLE IF NOT EXISTS public.faculty (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  faculty_id_number text UNIQUE NOT NULL,
  department text,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  parent_spouse_phone text,
  dl_number text UNIQUE NOT NULL,
  dl_url text,
  id_card_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ##################################################################
-- 3. Create the Vehicles Table
-- ##################################################################
CREATE TABLE IF NOT EXISTS public.vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid REFERENCES public.students(id) ON DELETE CASCADE,
  faculty_id uuid REFERENCES public.faculty(id) ON DELETE CASCADE,
  plate_number text UNIQUE NOT NULL,
  vehicle_type text NOT NULL,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  offense_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT check_owner CHECK (
    (student_id IS NOT NULL AND faculty_id IS NULL) OR 
    (faculty_id IS NOT NULL AND student_id IS NULL)
  )
);

-- ##################################################################
-- 4. Create the Violations Table
-- ##################################################################
CREATE TABLE IF NOT EXISTS public.violations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id uuid NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  violation_type text NOT NULL, -- 'Speeding', 'Wrong Parking', 'No Helmet', etc.
  description text,
  fine_amount decimal(10,2) DEFAULT 0.00,
  fine_status text DEFAULT 'pending', -- 'pending', 'paid', 'waived'
  warning_issued boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ##################################################################
-- 5. Create the Admins Table
-- ##################################################################
CREATE TABLE IF NOT EXISTS public.admins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Data
INSERT INTO public.admins (email, password)
VALUES ('kumarharshith4452@gmail.com', '123456789')
ON CONFLICT (email) DO NOTHING;
