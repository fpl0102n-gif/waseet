# Waseet - Purchase Request Management Platform

A modern, full-stack web application for managing product purchase requests with real-time Telegram notifications and a professional admin panel.

## 🚀 Features

- **Customer Portal**
  - Simple order submission form
  - Product URL and pricing input
  - Multiple contact methods (WhatsApp/Telegram)
  - Order success page with sharing options

- **Admin Panel**
  - Secure authentication system
  - Comprehensive order dashboard
  - Order search and filtering
  - Status management
  - Internal notes system

- **Telegram Integration**
  - Real-time order notifications
  - Rich formatted messages
  - Direct links to admin panel

- **Database**
  - PostgreSQL with Row-Level Security
  - Role-based access control
  - Secure data management

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Database**: PostgreSQL
- **Authentication**: Supabase Auth
- **Functions**: Supabase Edge Functions

## 📋 Setup Instructions

### Prerequisites

- Node.js 18+ installed
- A Telegram Bot (see setup below)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd waseet
npm install
```

### 2. Configure Telegram Bot

1. Create a Telegram bot:
   - Open Telegram and search for [@BotFather](https://t.me/BotFather)
   - Send `/newbot` and follow the instructions
   - Save the bot token provided

2. Get your Chat ID:
   - Send a message to your bot
   - Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
   - Find the `chat.id` field in the response

3. Add secrets in Lovable:
   - Go to your Lovable project
   - Navigate to Settings → Secrets
   - Add `TELEGRAM_BOT_TOKEN` with your bot token
   - Add `TELEGRAM_CHAT_ID` with your chat ID

### 3. Create Admin User

After deployment, you need to create an admin user:

1. Sign up through the admin login page (`/admin`)
2. In Lovable Cloud → Database → Tables → `user_roles`
3. Add a new row:
   - `user_id`: Your user ID from the auth.users table
   - `role`: `admin`

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:8080`

## 🔐 Security Features

- Row-Level Security (RLS) on all tables
- Role-based access control (RBAC)
- Secure admin authentication
- Protected API endpoints
- Input validation on all forms

## 📱 Pages

- `/` - Home page with hero and features
- `/order` - Order submission form
- `/success/:orderId` - Order confirmation
- `/contact` - Contact information
- `/admin` - Admin login
- `/admin/dashboard` - Order management
- `/admin/orders/:orderId` - Order details

## 🔧 Configuration

The application uses Lovable Cloud for backend services. All configuration is managed through:

- **Authentication**: Auto-configured with Supabase Auth
- **Database**: Automatically provisioned PostgreSQL
- **Secrets**: Managed through Lovable Cloud secrets
- **Functions**: Auto-deployed edge functions

## 📊 Database Schema

### orders
- `id`: Order ID (auto-increment)
- `created_at`: Timestamp
- `name`: Customer name
- `contact_type`: whatsapp | telegram
- `contact_value`: Phone number or username
- `product_url`: Product link
- `price`: Product price
- `shipping_price`: Shipping cost
- `total`: Computed total
- `status`: new | processing | done | cancelled
- `notes`: Internal admin notes

### user_roles
- `id`: UUID
- `user_id`: Reference to auth.users
- `role`: admin | user
- `created_at`: Timestamp

## 🚢 Deployment

Deploy directly from Lovable:

1. Click "Share" → "Publish"
2. Your app will be live on `<your-app>.lovable.app`
3. Connect a custom domain in Settings → Domains (requires paid plan)

## 📝 Usage

### For Customers
1. Visit the home page
2. Click "Place an Order"
3. Fill in product details and contact info
4. Submit and receive order confirmation

### For Admins
1. Visit `/admin` and log in
2. View all orders in the dashboard
3. Click on orders to view details
4. Update order status and add notes
5. Receive real-time Telegram notifications

## 🤝 Support

For questions or issues:
- WhatsApp: [Add your number]
- Telegram: @waseet_support
- Email: support@waseet.com

## 📄 License

All rights reserved © 2025 Waseet

---

Built with ❤️ using Lovable

## 🛰️ Corporate Proxy / CORS Troubleshooting

If you see a browser popup asking for proxy username/password and then CORS errors like:
```
No 'Access-Control-Allow-Origin' header is present on the requested resource
```
the request likely never reached Supabase (proxy auth failure). Supabase normally returns permissive CORS headers for public REST when the anon key is valid.

### Quick Fix
Enter valid proxy credentials OR bypass the proxy for `*.supabase.co`.

### Recommended Environment Variables (PowerShell)
```powershell
$env:HTTP_PROXY="http://USERNAME:PASSWORD@proxy.host:8080"
$env:HTTPS_PROXY=$env:HTTP_PROXY
$env:NO_PROXY="localhost,127.0.0.1,*.supabase.co"
$env:no_proxy=$env:NO_PROXY
```

### Provided Script
Run `./setup-proxy.ps1` (added in repo root) to set proxy + NO_PROXY interactively and optionally persist at user level. Password is URL‑encoded only for the session; do NOT commit credentials.

### Test Supabase REST
```powershell
Invoke-RestMethod -Headers @{ apikey="YOUR_ANON_KEY"; Authorization="Bearer YOUR_ANON_KEY" } -Uri "https://<PROJECT_ID>.supabase.co/rest/v1/exchange_rates?select=*"
```

### Remove Proxy (Session)
```powershell
$env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; $env:NO_PROXY=''; $env:no_proxy=''
```

### Common Causes
- HTTP 407 from corporate proxy during preflight OPTIONS → browser reports CORS.
- Missing anon key or wrong URL.
- Service role key mistakenly exposed (never do this client-side).

### Checklist
1. Verify `VITE_SUPABASE_URL` & `VITE_SUPABASE_PUBLISHABLE_KEY` in `.env`.
2. Confirm requests succeed on a non‑proxy network (e.g. mobile hotspot).
3. Ensure NO_PROXY contains `*.supabase.co` if allowed by policy.

For persistent issues, coordinate with network admin to allowlist the Supabase domain.

##  Email Notifications

The system uses Supabase Edge Functions + Resend to send transactional emails.

### Configuration
- **RESEND_API_KEY**: Must be set in Supabase Secrets.

### Architecture
- **Triggers**: Database INSERT triggers call the edge function via 
et.http_post.
