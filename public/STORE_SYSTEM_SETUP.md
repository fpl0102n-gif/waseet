# Store System Setup Guide

## Overview
A flexible, scalable store system that supports multiple store categories and product types, starting with Medical Equipment.

## Features Implemented

### ✅ User-Facing Features
- **Store Page** (`/store`) - Browse products with category badges
- **Category Badges** - Visible on store header and product cards
- **Product Filters** - Filter by product type and search
- **Product Cards** - Clean, professional product display
- **SEO-Friendly URLs** - `/store/:categorySlug` and `/store/product/:slug`

### ✅ Admin Features
- **Store Category Management** (`/admin/store` → Categories tab)
  - Create, edit, delete store categories
  - Configure badge labels and colors
  - Enable/disable categories
  - Set display order

- **Product Type Management** (`/admin/store` → Product Types tab)
  - Create, edit, delete product types per category
  - Dynamic product types (not hardcoded)
  - Enable/disable types
  - Set display order

- **Product Management** (`/admin/store` → Products tab)
  - Add, edit, delete products
  - Upload multiple product images
  - Set product status (active/inactive)
  - Link products to categories and types

## Database Setup

### 1. Run Migration
Execute the migration file in Supabase SQL Editor:
```
public/supabase/migrations/20250129_create_store_system.sql
```

### 2. Create Storage Bucket
Create a storage bucket for product images:

**In Supabase Dashboard:**
1. Go to Storage
2. Create new bucket: `store-products`
3. Set as **Public** bucket
4. Add policy for public read access:

```sql
-- Allow public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'store-products');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'store-products');
```

### 3. Default Data
The migration automatically creates:
- **Medical Equipment** store category
- Default product types:
  - Diagnostic Equipment
  - Surgical Equipment
  - Consumables
  - Therapy Equipment
  - Furniture & Storage

## Routes

### Public Routes
- `/store` - Main store page (defaults to first active category)
- `/store/:categorySlug` - Store page for specific category

### Admin Routes
- `/admin/store` - Store management dashboard with tabs:
  - Categories
  - Products
  - Product Types

## Navigation

### Header
- "Store" link added to main navigation (desktop & mobile)

### Admin Dashboard
- "Store" button added to admin dashboard toolbar

## Components Created

### Reusable Components
1. **CategoryBadge** (`components/ui/category-badge.tsx`)
   - Displays store category badge
   - Customizable color and size
   - Used on store header and product cards

2. **ProductCard** (`components/ui/product-card.tsx`)
   - Product display card
   - Shows category badge
   - Product type badge
   - Image, name, description, price
   - View and Add to Cart buttons

3. **FilterBar** (`components/ui/filter-bar.tsx`)
   - Product type filter dropdown
   - Active filter badge with remove option
   - Dynamic based on admin settings

## Database Schema

### Tables
1. **store_categories**
   - Store category information
   - Badge configuration
   - Active/inactive status

2. **product_types**
   - Product types per category
   - Dynamic, admin-managed
   - Active/inactive status

3. **products**
   - Product information
   - Images array (Supabase Storage URLs)
   - Status (active/inactive)
   - SEO fields (slug, meta_title, meta_description)

## Future Scalability

The system is designed to easily support:
- Multiple store categories (Electronics, Services, etc.)
- New product types per category
- Product variations
- Inventory management
- Shopping cart (ready for integration)
- Payment processing (ready for integration)
- Order management

## Next Steps

1. **Run the migration** in Supabase SQL Editor
2. **Create storage bucket** `store-products` (see above)
3. **Access admin panel** at `/admin/store`
4. **Add products** through the admin interface
5. **View store** at `/store`

## Notes

- All product types are dynamic (database-driven)
- Badge colors are customizable per category
- Images are stored in Supabase Storage
- SEO-friendly slugs are auto-generated
- System is ready for future extensions (cart, orders, payments)

