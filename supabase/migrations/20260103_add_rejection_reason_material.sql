-- Add rejection_reason column to material_donations
ALTER TABLE public.material_donations 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
