-- ====================================================================
-- AUTOSQUAD / LUXURY CARS - COMPLETE SUPABASE DATABASE SETUP SCRIPT
-- Includes admins, vehicles, vehicle_images, leads, site_settings, metadata_versions
-- Copy and run this script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Paste & Click Run)
-- ====================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 2. CREATE & MIGRATE TABLES
-- ==========================================

-- 2A. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin',
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin';
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2B. Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    variant TEXT,
    year INT NOT NULL,
    price BIGINT NOT NULL,
    original_price BIGINT,
    mileage BIGINT DEFAULT 0,
    km_driven BIGINT DEFAULT 0,
    fuel_type TEXT NOT NULL DEFAULT 'Petrol',
    transmission TEXT NOT NULL DEFAULT 'Automatic',
    engine TEXT,
    color TEXT,
    ownership TEXT,
    owner_number TEXT,
    registration TEXT,
    registration_state TEXT,
    insurance TEXT,
    status TEXT DEFAULT 'Available',
    featured BOOLEAN DEFAULT false,
    sold BOOLEAN DEFAULT false,
    description TEXT,
    instagram_reel TEXT,
    inspection_notes TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS variant TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS original_price BIGINT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS mileage BIGINT DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS km_driven BIGINT DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS engine TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS ownership TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS owner_number TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS registration TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS registration_state TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS insurance TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Available';
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS sold BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS instagram_reel TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS inspection_notes TEXT;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Safely convert pre-existing BIGINT timestamp columns to TIMESTAMPTZ if needed
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.vehicles ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING to_timestamp(updated_at/1000);
    EXCEPTION WHEN OTHERS THEN END;
    BEGIN
        ALTER TABLE public.vehicles ALTER COLUMN created_at TYPE TIMESTAMPTZ USING to_timestamp(created_at/1000);
    EXCEPTION WHEN OTHERS THEN END;
END $$;

-- 2C. Vehicle Images Table
CREATE TABLE IF NOT EXISTS public.vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
    image_url TEXT,
    url TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vehicle_images ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.vehicle_images ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE public.vehicle_images ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- 2D. Leads Table
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS car_title TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2E. Site Settings Table
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
    about_image TEXT,
    home_hero_image_url TEXT,
    home_hero_image TEXT,
    home_hero_mobile_image_url TEXT,
    home_hero_mobile_image TEXT,
    home_hero_video_url TEXT,
    home_hero_video TEXT,
    home_hero_mobile_video_url TEXT,
    home_hero_mobile_video TEXT,
    home_hero_type TEXT DEFAULT 'video',
    logo_url TEXT,
    logo TEXT,
    client_deliveries JSONB DEFAULT '[]'::jsonb,
    instagram_reels JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS company_name TEXT DEFAULT 'AutoSquad';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS google_maps_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS about_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_image_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_image TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_video_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_video TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_video_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_mobile_video TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS home_hero_type TEXT DEFAULT 'video';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo TEXT;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS client_deliveries JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS instagram_reels JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2F. Metadata Versioning Table
CREATE TABLE IF NOT EXISTS public.metadata_versions (
    key TEXT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. INITIAL SEED DATA
-- ==========================================

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

    -- Seed Default Admin User
    IF NOT EXISTS (SELECT 1 FROM public.admins WHERE email = 'admin@autosquad.com') THEN
        INSERT INTO public.admins (email, role, full_name) 
        VALUES ('admin@autosquad.com', 'admin', 'AutoSquad Administrator');
    END IF;
END $$;

-- Optional: Auto-populate public.admins whenever a new user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admins (id, email, role, full_name)
  VALUES (NEW.id, NEW.email, 'admin', COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin User'))
  ON CONFLICT (email) DO UPDATE SET id = EXCLUDED.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ==========================================
-- 4. PERMISSIONS & ROW LEVEL SECURITY (RLS)
-- ==========================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metadata_versions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access to admins" ON public.admins;
DROP POLICY IF EXISTS "Public access to vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Public access to vehicle_images" ON public.vehicle_images;
DROP POLICY IF EXISTS "Public access to leads" ON public.leads;
DROP POLICY IF EXISTS "Public access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public access to metadata_versions" ON public.metadata_versions;

CREATE POLICY "Public access to admins" ON public.admins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to vehicle_images" ON public.vehicle_images FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access to metadata_versions" ON public.metadata_versions FOR ALL USING (true) WITH CHECK (true);

-- ==========================================
-- 5. STORAGE BUCKETS & STORAGE POLICIES
-- ==========================================

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

DROP POLICY IF EXISTS "Allow public access to site_settings storage" ON storage.objects;
CREATE POLICY "Allow public access to site_settings storage" ON storage.objects
    FOR ALL USING (bucket_id = 'site_settings') WITH CHECK (bucket_id = 'site_settings');

DROP POLICY IF EXISTS "Allow public access to vehicle-images storage" ON storage.objects;
CREATE POLICY "Allow public access to vehicle-images storage" ON storage.objects
    FOR ALL USING (bucket_id = 'vehicle-images') WITH CHECK (bucket_id = 'vehicle-images');
