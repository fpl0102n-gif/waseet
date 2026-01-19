-- Create enum types for order status and contact method
CREATE TYPE public.order_status AS ENUM ('new', 'processing', 'done', 'cancelled');
CREATE TYPE public.contact_type AS ENUM ('whatsapp', 'telegram');

-- Create orders table
CREATE TABLE public.orders (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name TEXT NOT NULL,
  contact_type contact_type NOT NULL,
  contact_value TEXT NOT NULL,
  product_url TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  shipping_price DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  status order_status NOT NULL DEFAULT 'new',
  notes TEXT,
  CONSTRAINT positive_price CHECK (price >= 0),
  CONSTRAINT positive_shipping CHECK (shipping_price >= 0),
  CONSTRAINT positive_total CHECK (total >= 0)
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create app_role enum for admin authentication
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  )
$$;

-- RLS Policy: Anyone can insert orders (public form submission)
CREATE POLICY "Anyone can insert orders"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- RLS Policy: Only admins can view all orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- RLS Policy: Only admins can update orders
CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- RLS Policy: Only admins can view user_roles
CREATE POLICY "Admins can view user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Create index for faster queries
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);