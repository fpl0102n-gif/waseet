# Exchange Feature - Implementation Guide

## Overview
The Exchange feature allows users to post Buy and Sell currency exchange requests. Admin reviews, verifies, and manually matches compatible requests. No public marketplace - all requests are private and handled by admin.

## Features Implemented

### 1. Database Schema
**Tables:**
- `exchange_requests` - Stores buy/sell requests with full details
- `exchange_matches` - Stores matched pairs created by admin
- `exchange_settings` - Admin configuration (auto-match toggle, KYC threshold, etc.)

**Fields in exchange_requests:**
- Type (buy/sell), currency, amount (exact or range), price
- Payment methods (multi-select), country, city
- Contact method & value, attachments, notes
- Status workflow: pending → verified → paired → completed
- Rejection reason, verification tracking

**RLS Policies:**
- Users can create and view their own requests
- Users can update their own pending requests
- Admins can view and update all requests
- Users can see matches involving their requests
- Admins can create and manage all matches

### 2. Frontend Components

#### ExchangePage.tsx (`/exchange`)
- Tabs for Buy/Sell request forms
- Form fields:
  - Currency dropdown (USD, EUR, GBP, DZD, MAD, TND)
  - Amount (exact or range toggle)
  - Price (optional)
  - Payment methods (checkboxes: cash, bank, Wise, PayPal, crypto, CCP, Baridi Mob)
  - Country & City
  - Contact method (WhatsApp, Telegram, Email, Phone) + value
  - File attachments (images/PDF, max 10MB)
  - Notes
  - Terms & Conditions checkbox
- Validation & error handling
- Success modal with request ID
- Fully responsive & mobile-first

#### AdminExchange.tsx (`/admin/exchange`)
- **Requests Tab:**
  - Filterable table (status, type, currency)
  - View request details dialog
  - Verify/Reject actions for pending requests
  - Rejection reason input
  - Export functionality (planned)
  
- **Matches Tab:**
  - View all created matches
  - Match details (buy request ID, sell request ID, status, notes)

- **Create Match Dialog:**
  - Side-by-side selection of verified buy & sell requests
  - Only shows verified requests for matching
  - Optional match notes
  - Creates match and updates both requests to 'paired' status

### 3. Translations (i18n)
Complete translations in English, French, and Arabic for:
- Navigation link ("Exchange" / "Échange" / "الصرف")
- All form labels and placeholders
- Currency names
- Payment methods
- Contact methods
- Success/error messages
- Validation messages

### 4. Navigation
- Added "Exchange" link to header (desktop & mobile)
- Positioned after Contact, before Al-Khayr section
- Accessible to all users (no auth required for viewing, but form prefills for logged-in users)

### 5. Routing
- `/exchange` - Public exchange page (buy/sell request forms)
- `/admin/exchange` - Admin panel for managing requests and matches

## Setup Instructions

### ⚡ Quick Setup (Recommended - No CLI Needed)

**Step 1:** Open Supabase SQL Editor
- Go to: https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/sql

**Step 2:** Run Complete Setup
1. Open file `COMPLETE-EXCHANGE-SETUP.sql` (in project root)
2. Copy ALL content (203 lines)
3. Paste in SQL Editor
4. Click **"Run"**

You should see:
```
✅ Setup Complete!
active_rates: 8
payment_methods: 8
```

**Step 3:** Verify
- Visit: http://localhost:8081/health (all checks should be green ✅)
- Visit: http://localhost:8081/exchange (should show currency/payment lists)

### 🔧 Alternative: CLI Method

Only if Supabase CLI is installed:
```bash
cd public
supabase link --project-ref ocwlkljrjhgqejetgfgw
supabase db push
```

### 🌐 Proxy Issues?

If you get proxy authentication popups:

```powershell
# Run this to configure proxy
.\setup-proxy.ps1

# Or manually set:
$env:HTTP_PROXY="http://USERNAME:PASSWORD@proxy.host:8080"
$env:HTTPS_PROXY=$env:HTTP_PROXY
$env:NO_PROXY="localhost,127.0.0.1,*.supabase.co"
```

### 📝 Environment Variables
Check `public/.env` has:
```
VITE_SUPABASE_URL=https://ocwlkljrjhgqejetgfgw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

## Admin Workflow

### Request Lifecycle
1. **User submits request** → Status: `pending`
2. **Admin reviews** → Can verify or reject
3. **If verified** → Status: `verified` (eligible for matching)
4. **Admin creates match** → Status changes to `paired` for both requests
5. **Users complete transaction** → Admin marks as `completed`

### Matching Process
1. Go to **Admin Exchange** > **Requests tab**
2. Click **Create Match** button
3. Select one **Buy Request** (left column)
4. Select one **Sell Request** (right column)
5. Add optional match notes
6. Click **Create Match**
7. System:
   - Creates match record
   - Updates both requests to `paired` status
   - (Future: Send notifications to both parties)

### Rejection
1. Click **Reject** (X icon) on a pending request
2. Enter rejection reason
3. Request status → `rejected`
4. User can see rejection reason when viewing their request

## User Experience

### Submitting a Request
1. Navigate to `/exchange`
2. Choose **Post Buy Request** or **Post Sell Request** tab
3. Fill out the form:
   - Select currency
   - Enter amount (exact or range)
   - Optional: Set preferred price/rate
   - Select payment methods (multiple allowed)
   - Enter location (country & city)
   - Choose contact method and provide contact value
   - Upload attachments (optional, images/PDF)
   - Add notes (optional)
   - Accept terms & conditions
4. Click **Submit Request**
5. Success modal shows **Request ID** for tracking

### Viewing Your Requests
(Future feature - not yet implemented)
- Users can view their request history
- Check status of each request
- See if they've been matched
- View match details and counterparty contact info

## Security & Validation

### Frontend Validation
- Required fields: currency, amount, contact method, contact value, terms acceptance
- File size validation: max 10MB per file
- File type validation: only images and PDFs
- Amount range validation (min < max)

### Backend Security (RLS)
- Row-level security enforces:
  - Users can only see their own requests
  - Admins can see all requests
  - Users can't modify verified/paired requests
  - Only admins can verify, reject, and create matches

### File Upload
- Stored in Supabase Storage (`exchange-attachments` bucket)
- Public read access (URLs are not guessable but accessible if known)
- Validation on client side (type & size)

## Future Enhancements (Optional)

### Notifications
- Email/SMS/Telegram notifications on:
  - Request received (confirmation)
  - Request verified/rejected
  - Match created (with counterparty contact info)
  - Match completed

### Auto-Matching
- Admin toggle in settings (`exchange_settings.auto_match_enabled`)
- Rules:
  - Match by currency
  - Overlapping amount range
  - Compatible payment methods
  - Optional: price tolerance %
- Can be implemented as a scheduled job or on-demand admin action

### KYC Integration
- Trigger KYC verification for requests above threshold
- Admin setting: `exchange_settings.kyc_threshold_amount`
- Store KYC status in user profile

### Escrow (Advanced)
- Hold funds until both parties confirm
- Requires payment gateway integration
- Admin can release/refund funds

### In-App Chat
- Allow matched parties to communicate in-app
- Alternative to sharing contact info directly

### Analytics Dashboard
- Request volume over time
- Average match time
- Conversion rates (requests → verified → paired → completed)
- Popular currencies, countries

### CSV Export
- Export requests and matches for reporting
- Filter by date range, status, currency

### Audit Logs
- Track all admin actions (verify, reject, match)
- Useful for accountability and debugging

## Testing Checklist

- [ ] User can submit buy request
- [ ] User can submit sell request
- [ ] Form validation works (missing fields, invalid file types/sizes)
- [ ] Success modal displays after submission
- [ ] Request appears in admin panel with 'pending' status
- [ ] Admin can view request details
- [ ] Admin can verify request
- [ ] Admin can reject request with reason
- [ ] Verified requests appear in Create Match dialog
- [ ] Admin can select one buy + one sell request
- [ ] Match is created successfully
- [ ] Both requests change to 'paired' status after matching
- [ ] Match appears in Matches tab
- [ ] File upload works and attachments are stored
- [ ] Filters work in admin panel (status, type, currency)
- [ ] Mobile responsive UI works for forms and admin panel
- [ ] Translations display correctly in all three languages

## Deployment Notes

### First Deployment
1. Run database migrations first
2. Create storage bucket and policies
3. Build and deploy frontend
4. Test with sample requests

### Subsequent Deployments
- No special steps needed
- Database schema is already in place
- Only frontend code updates

## Support & Troubleshooting

### Issue: Storage bucket not found
**Solution:** Create `exchange-attachments` bucket in Supabase Dashboard > Storage and make it public.

### Issue: RLS policy errors
**Solution:** Ensure admin users have `role: 'admin'` in their `raw_user_meta_data` in the `auth.users` table.

### Issue: File upload fails
**Solution:** 
1. Check storage policies are applied
2. Verify file size < 10MB and type is image or PDF
3. Check browser console for detailed error

### Issue: Can't create match
**Solution:** Ensure both requests have `status = 'verified'` before attempting to match.

## API Endpoints (Future)
If you want to add REST API endpoints:

```
POST   /api/exchange/requests          - Create request
GET    /api/exchange/requests          - List requests (admin or own)
GET    /api/exchange/requests/:id      - Get request details
PUT    /api/exchange/requests/:id      - Update request (admin or owner)
PATCH  /api/exchange/requests/:id/status - Update status (admin)
POST   /api/exchange/matches           - Create match (admin)
GET    /api/exchange/matches           - List matches
GET    /api/exchange/matches/:id       - Get match details
```

Currently, the app uses Supabase client SDK directly (no custom API layer).

## License & Credits
Part of the Waseet platform. All rights reserved.
