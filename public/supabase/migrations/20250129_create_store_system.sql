-- Store System Migration
-- Flexible store system supporting multiple store categories and product types

-- Create store_categories table
CREATE TABLE IF NOT EXISTS public.store_categories (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE, -- SEO-friendly URL slug
  description TEXT,
  badge_label TEXT NOT NULL, -- Display label for badge (e.g., "Medical Equipment")
  badge_color TEXT DEFAULT '#3b82f6', -- Badge color hex code
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  CONSTRAINT store_categories_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create product_types table (dynamic product types per store category)
CREATE TABLE IF NOT EXISTS public.product_types (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  store_category_id BIGINT NOT NULL REFERENCES public.store_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  
  UNIQUE(store_category_id, slug),
  CONSTRAINT product_types_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  store_category_id BIGINT NOT NULL REFERENCES public.store_categories(id) ON DELETE CASCADE,
  product_type_id BIGINT REFERENCES public.product_types(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE, -- SEO-friendly URL slug
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  images TEXT[], -- Array of image URLs (Supabase Storage)
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  
  -- Additional fields for future extensibility
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  weight DECIMAL(10, 2),
  dimensions TEXT,
  
  CONSTRAINT products_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_store_categories_active ON public.store_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_store_categories_slug ON public.store_categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_types_store_category ON public.product_types(store_category_id);
CREATE INDEX IF NOT EXISTS idx_product_types_active ON public.product_types(is_active);
CREATE INDEX IF NOT EXISTS idx_products_store_category ON public.products(store_category_id);
CREATE INDEX IF NOT EXISTS idx_products_product_type ON public.products(product_type_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(store_category_id, status) WHERE status = 'active';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_store_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER store_categories_updated_at
  BEFORE UPDATE ON public.store_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_store_updated_at();

CREATE TRIGGER product_types_updated_at
  BEFORE UPDATE ON public.product_types
  FOR EACH ROW
  EXECUTE FUNCTION update_store_updated_at();

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION update_store_updated_at();

-- Enable Row Level Security
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Public read access for active stores and products
CREATE POLICY "Anyone can view active store categories"
  ON public.store_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active product types"
  ON public.product_types FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (status = 'active' AND store_category_id IN (
    SELECT id FROM public.store_categories WHERE is_active = true
  ));

-- Admin policies (service_role will bypass RLS, but we add policies for authenticated admins)
-- Note: These assume you have a user_roles table for admin checks
-- Adjust based on your actual admin authentication system

-- Insert default Medical Equipment store category
INSERT INTO public.store_categories (name, slug, description, badge_label, badge_color, is_active, display_order)
VALUES (
  'Medical Equipment',
  'medical-equipment',
  'Professional medical equipment and supplies',
  'Medical Equipment',
  '#3b82f6',
  true,
  1
)
ON CONFLICT (slug) DO NOTHING;

-- Insert default product types for Medical Equipment
INSERT INTO public.product_types (store_category_id, name, slug, description, is_active, display_order)
SELECT 
  sc.id,
  pt.name,
  pt.slug,
  pt.description,
  true,
  pt.display_order
FROM public.store_categories sc
CROSS JOIN (VALUES
  ('Diagnostic Equipment', 'diagnostic', 'Diagnostic and monitoring equipment', 1),
  ('Surgical Equipment', 'surgical', 'Surgical instruments and tools', 2),
  ('Consumables', 'consumables', 'Medical consumables and supplies', 3),
  ('Therapy Equipment', 'therapy', 'Therapy and rehabilitation equipment', 4),
  ('Furniture & Storage', 'furniture-storage', 'Medical furniture and storage solutions', 5)
) AS pt(name, slug, description, display_order)
WHERE sc.slug = 'medical-equipment'
ON CONFLICT (store_category_id, slug) DO NOTHING;

-- Add comments
COMMENT ON TABLE public.store_categories IS 'Store categories (e.g., Medical Equipment, Electronics, Services)';
COMMENT ON TABLE public.product_types IS 'Product types within each store category (dynamic, admin-managed)';
COMMENT ON TABLE public.products IS 'Products available in stores';
COMMENT ON COLUMN public.store_categories.badge_label IS 'Label displayed on store header and product cards';
COMMENT ON COLUMN public.products.images IS 'Array of image URLs stored in Supabase Storage';

