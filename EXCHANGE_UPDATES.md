# Exchange System - Complete Rewrite

## Nouveau Système (27 Nov 2025)

### Architecture
Le système d'échange a été complètement repensé avec:

1. **Calcul automatique du prix** basé sur les taux admin
2. **Paires de devises** (De → Vers) au lieu d'une seule devise
3. **Taux différents** pour achat vs vente
4. **Gestion admin** complète des taux et méthodes de paiement

## Changes Made

### 1. Database Schema Updates
**Migration File**: `public/supabase/migrations/20251127_update_exchange_rate_fields.sql`

Added the following columns to `exchange_requests` table:
- `admin_rate` (NUMERIC) - Admin-controlled exchange rate for buyers/sellers
- `min_quantity` (NUMERIC) - Minimum quantity required for the exchange
- `price_min` (NUMERIC) - Minimum price allowed (controlled by admin)
- `price_max` (NUMERIC) - Maximum price allowed (controlled by admin)

### 2. Currency Changes
**Removed currencies**: MAD (Moroccan Dirham) and TND (Tunisian Dinar)

**Remaining currencies**:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- DZD (Algerian Dinar)

Updated in:
- `public/src/i18n.ts` (all 3 languages: English, French, Arabic)
- `public/src/pages/ExchangePage.tsx`

### 3. Payment Methods UI
Changed from **checkbox multi-select** to **text input** field.

Users now enter payment methods as a comma-separated list (e.g., "CCP, Baridimob, Cash").

Available methods are shown as a hint below the input field.

### 4. Frontend Updates

#### ExchangePage.tsx
- Added `min_quantity` field to the form
- Changed `payment_methods` from `string[]` to `string`
- Updated form submission to include new fields
- Added helper text indicating admin can set price limits

#### AdminExchange.tsx
- Added state management for `admin_rate`, `price_min`, `price_max`
- Added `handleUpdateRate()` function to update admin-controlled fields
- Added "Admin Controls" section in the request details dialog
- Display fields: Min Quantity, Admin Rate, Price Limits
- Input fields for admin to set/update rate and price limits

## TypeScript Errors

You may see TypeScript compilation errors about `exchange_requests` and `exchange_matches` tables not existing in the Supabase types. These errors will be resolved after:

1. Running the database migrations in Supabase
2. Regenerating the TypeScript types

**To regenerate types**, use the Supabase CLI:
```powershell
# If you have Supabase CLI installed
cd c:\Users\Administrator\Downloads\test-waseet\test-waseet\public
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/integrations/supabase/types.ts
```

Or manually update the Supabase types file if the CLI is not available.

For now, you can temporarily add `// @ts-nocheck` at the top of:
- `public/src/pages/ExchangePage.tsx`
- `public/src/pages/AdminExchange.tsx`

## How to Deploy

### Step 1: Run Database Migration
Open Supabase SQL Editor and execute:
```sql
-- File: public/supabase/migrations/20251127_update_exchange_rate_fields.sql

ALTER TABLE exchange_requests 
ADD COLUMN IF NOT EXISTS admin_rate NUMERIC,
ADD COLUMN IF NOT EXISTS min_quantity NUMERIC,
ADD COLUMN IF NOT EXISTS price_min NUMERIC,
ADD COLUMN IF NOT EXISTS price_max NUMERIC;

COMMENT ON COLUMN exchange_requests.admin_rate IS 'Admin-controlled exchange rate for this request';
COMMENT ON COLUMN exchange_requests.min_quantity IS 'Minimum quantity required for this exchange';
COMMENT ON COLUMN exchange_requests.price_min IS 'Minimum price allowed by admin';
COMMENT ON COLUMN exchange_requests.price_max IS 'Maximum price allowed by admin';
```

### Step 2: Build and Deploy
```powershell
cd c:\Users\Administrator\Downloads\test-waseet\test-waseet\public
npm run build
firebase deploy --only hosting
```

## Admin Usage

### Setting Admin Rate and Price Limits
1. Go to Admin Exchange panel (`/admin/exchange`)
2. Click "View" on any request
3. Scroll to "Admin Controls" section at the bottom of the dialog
4. Set:
   - **Admin Rate**: Exchange rate for this request
   - **Min Price**: Minimum price user can set
   - **Max Price**: Maximum price user can set
5. Click "Update Rate & Limits"

### User Experience
- Users see the "Min Quantity" field when creating buy/sell requests
- Users enter their desired price with a note that admin can set min/max limits
- Payment methods are entered as text (comma-separated)
- Only USD, EUR, GBP, and DZD are available as currencies

## Testing Checklist
- [ ] Database migration executed successfully
- [ ] Exchange page loads without errors
- [ ] Can create buy request with new fields
- [ ] Can create sell request with new fields
- [ ] Admin can view new fields in request details
- [ ] Admin can set admin_rate, price_min, price_max
- [ ] Payment methods display correctly
- [ ] Only 4 currencies available in dropdown
- [ ] Min quantity field accepts numbers

## Notes
- Payment methods are now stored as plain text strings in the database
- Admin rate field is optional and can be left empty
- Price limits (min/max) are also optional
