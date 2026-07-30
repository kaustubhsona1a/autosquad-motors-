-- ====================================================================
-- AUTOSQUAD / JACKPOT CARS - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- 100% Fail-Safe for fresh OR existing Supabase projects
-- Copy and run this script in your Supabase SQL Editor:
-- (Dashboard -> SQL Editor -> New Query -> Paste & Click Run)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CREATE & MIGRATE TABLES
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
    instagram_reel TEXT,
    inspection_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add all vehicle columns if table pre-existed
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
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS instagram_reel TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS inspection_notes TEXT;
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
    images JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS car_title TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

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

-- Safely add ALL site_settings columns if table pre-existed
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

-- Metadata Versioning Table
CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.metadata_versions ADD COLUMN IF NOT EXISTS key TEXT;
ALTER TABLE public.metadata_versions ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 1;
ALTER TABLE public.metadata_versions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Seed Default Row Data Safely (Avoids ON CONFLICT errors if constraints differ)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.site_settings) THEN
        INSERT INTO public.site_settings (id, company_name)
        VALUES ('00000000-0000-0000-0000-000000000000'::uuid, 'AutoSquad');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.metadata_versions WHERE key = 'vehicles') THEN
        INSERT INTO public.metadata_versions (key, version) VALUES ('vehicles', 1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.metadata_versions WHERE key = 'site_settings') THEN
        INSERT INTO public.metadata_versions (key, version) VALUES ('site_settings', 1);
    END IF;
END $$;

-- ==========================================
-- 3. PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Grant schema access permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Enable RLS on all tables
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_versions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to avoid policy name collisions
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
DROP POLICY IF EXISTS "Site settings updatable by admins only" ON public.site_settings;
DROP POLICY IF EXISTS "Metadata viewable by everyone" ON public.metadata_versions;
DROP POLICY IF EXISTS "Metadata managed by admins" ON public.metadata_versions;

-- Create full open access policies for public read/write
CREATE POLICY "Public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to vehicle_images" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to metadata_versions" ON public.metadata_versions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 4. STORAGE BUCKETS & STORAGE POLICIES
-- ==========================================

-- Ensure storage buckets exist and are PUBLIC without ON CONFLICT constraints
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'site_settings') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('site_settings', 'site_settings', true);
    ELSE
        UPDATE storage.buckets SET public = true WHERE id = 'site_settings';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'vehicle-images') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('vehicle-images', 'vehicle-images', true);
    ELSE
        UPDATE storage.buckets SET public = true WHERE id = 'vehicle-images';
    END IF;
END $$;

-- Drop prior storage policies
DROP POLICY IF EXISTS "Public Access to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete to Site Settings Images" ON storage.objects;
DROP POLICY IF EXISTS "Public view for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public insert for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete for site_settings storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to site_settings storage" ON storage.objects;

CREATE POLICY "Allow public access to site_settings storage" ON storage.objects
    FOR ALL USING (bucket_id = 'site_settings') WITH CHECK (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Public Access to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete to Vehicle Images" ON storage.objects;
DROP POLICY IF EXISTS "Public view for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public insert for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public update for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Public delete for vehicle-images storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to vehicle-images storage" ON storage.objects;

CREATE POLICY "Allow public access to vehicle-images storage" ON storage.objects
    FOR ALL USING (bucket_id = 'vehicle-images') WITH CHECK (bucket_id = 'vehicle-images');
