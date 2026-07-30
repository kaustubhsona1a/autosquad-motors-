-- ====================================================================
-- AUTOSQUAD COMPLETE SUPABASE SETUP SCRIPT
-- 100% Safe for fresh databases AND existing database migrations
-- Copy and run this script in your Supabase Project SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Paste & Click Run)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CREATE / UPDATE TABLES
-- ==========================================

-- Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INT NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT,
    km_driven BIGINT DEFAULT 0,
    fuel_type TEXT NOT NULL,
    transmission TEXT NOT NULL,
    owner_number TEXT,
    registration_state TEXT,
    color TEXT,
    insurance TEXT,
    status TEXT DEFAULT 'Available',
    featured BOOLEAN DEFAULT false,
    sold BOOLEAN DEFAULT false,
    description TEXT,
    specs JSONB DEFAULT '{}'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all vehicle columns exist if table already existed
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS variant TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS original_price BIGINT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km_driven BIGINT DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS owner_number TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS registration_state TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Vehicle Images Table
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT,
    name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    car_title TEXT,
    message TEXT,
    type TEXT DEFAULT 'enquiry',
    status TEXT DEFAULT 'New',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS car_title TEXT;

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
    company_name TEXT DEFAULT 'AutoSquad',
    address TEXT,
    phone TEXT,
    email TEXT,
    instagram_url TEXT,
    whatsapp_number TEXT,
    google_maps_url TEXT,
    about_image_url TEXT,
    home_hero_image_url TEXT,
    home_hero_mobile_image_url TEXT,
    home_hero_video_url TEXT,
    home_hero_mobile_video_url TEXT,
    home_hero_type TEXT DEFAULT 'video',
    logo_url TEXT,
    client_deliveries JSONB DEFAULT '[]'::jsonb,
    instagram_reels JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add ALL site_settings columns if table was created earlier with missing columns
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'AutoSquad';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_video_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_video_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_type TEXT DEFAULT 'video';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS client_deliveries JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_reels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Drop problematic unique constraint on "key" if it exists from older schema variants
ALTER TABLE public.site_settings DROP CONSTRAINT IF EXISTS site_settings_key_key;
DROP INDEX IF EXISTS public.site_settings_key_key;
DROP INDEX IF EXISTS site_settings_key_key;

-- Metadata Versioning Table
CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Default Settings and Version Tracking SAFELY without violating unique constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.site_settings) THEN
        INSERT INTO public.site_settings (id, company_name)
        VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'AutoSquad');
    END IF;
END $$;

INSERT INTO public.metadata_versions (key, version) VALUES ('vehicles', 1) ON CONFLICT (key) DO NOTHING;
INSERT INTO public.metadata_versions (key, version) VALUES ('site_settings', 1) ON CONFLICT (key) DO NOTHING;

-- ==========================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_versions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public access to vehicle_images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Public access to leads" ON public.leads;
DROP POLICY IF EXISTS "Public access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public access to metadata_versions" ON public.metadata_versions;
DROP POLICY IF EXISTS "Vehicles are viewable by everyone" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicles are insertable by admins only" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicles are updatable by admins only" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicles are deletable by admins only" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicle images are viewable by everyone" ON public.vehicle_images;
DROP POLICY IF EXISTS "Vehicle images are managed by admins only" ON public.vehicle_images;
DROP POLICY IF EXISTS "Leads are insertable by everyone" ON public.leads;
DROP POLICY IF EXISTS "Leads are viewable and updatable by admins only" ON public.leads;
DROP POLICY IF EXISTS "Leads update allowed for admins" ON public.leads;
DROP POLICY IF EXISTS "Leads are deletable by admins only" ON public.leads;
DROP POLICY IF EXISTS "Site settings viewable by everyone" ON public.site_settings;
DROP POLICY IF EXISTS "Site settings managed by admins only" ON public.site_settings;
DROP POLICY IF EXISTS "Metadata viewable by everyone" ON public.metadata_versions;
DROP POLICY IF EXISTS "Metadata managed by admins" ON public.metadata_versions;

-- Allow full public access (anon + authenticated)
CREATE POLICY "Public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to vehicle_images" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to metadata_versions" ON public.metadata_versions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 4. STORAGE BUCKETS & STORAGE POLICIES
-- ==========================================

-- Ensure storage buckets exist and are PUBLIC
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site_settings', 'site_settings', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage Objects Policies for site_settings bucket
DROP POLICY IF EXISTS "Public Access to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Public view for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public insert for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete for site_settings storage" ON storage.objects;

CREATE POLICY "Public view for site_settings storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'site_settings');

CREATE POLICY "Public insert for site_settings storage" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'site_settings');

CREATE POLICY "Public update for site_settings storage" ON storage.objects
    FOR UPDATE USING (bucket_id = 'site_settings');

CREATE POLICY "Public delete for site_settings storage" ON storage.objects
    FOR DELETE USING (bucket_id = 'site_settings');

-- Storage Objects Policies for vehicle-images bucket
DROP POLICY IF EXISTS "Public Access to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Public view for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public insert for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete for vehicle-images storage" ON storage.objects;

CREATE POLICY "Public view for vehicle-images storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'vehicle-images');

CREATE POLICY "Public insert for vehicle-images storage" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'vehicle-images');

CREATE POLICY "Public update for vehicle-images storage" ON storage.objects
    FOR UPDATE USING (bucket_id = 'vehicle-images');

CREATE POLICY "Public delete for vehicle-images storage" ON storage.objects
    FOR DELETE USING (bucket_id = 'vehicle-images');
