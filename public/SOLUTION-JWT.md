# SOLUTION: Configure Function to be Publicly Accessible

## The Problem
The telegram-webhook function is returning 401 "Missing authorization header" because Supabase Edge Functions require JWT authentication by default. Telegram webhooks cannot provide this authentication.

## The Root Cause
- Supabase Edge Functions by default require an `Authorization: Bearer <jwt>` header
- Telegram Bot API calls webhooks without any authentication headers
- The function code itself is correct
- The `config.toml` file with `verify_jwt = false` is NOT being applied by the CLI

## Solution: Configure via Supabase Dashboard

### Step 1: Access Function Settings
1. Go to: https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/functions/telegram-webhook
2. Click on the function name "telegram-webhook"
3. Look for "Settings" or "Configuration" tab/section

### Step 2: Disable JWT Verification
Look for one of these options:
- **"Require JWT verification"** - Toggle it OFF
- **"verify_jwt"** setting - Set to `false`
- **"Public access"** - Toggle it ON
- **"Authentication required"** - Toggle it OFF

### Step 3: Save and Test
1. Click Save/Apply
2. Test immediately with: `.\test-webhook.ps1`
3. Expected result: "SUCCESS" instead of 401 error

## Alternative: If Dashboard doesn't have the option

The function may need to be configured at deployment time with specific flags. Try:

```powershell
# May need to use the dashboard to create function config
# Or use supabase CLI with --no-verify-jwt flag (if it exists)
```

## Verification
Once configured correctly:
- Direct HTTP POST to the webhook URL should work WITHOUT any Authorization header
- Test script should show "Test 1: SUCCESS"
- Telegram should receive responses from the bot
- Logs should show 200 OK instead of 401

## Current Configuration
- Project: ocwlkljrjhgqejetgfgw
- Function: telegram-webhook (version 27)
- URL: https://ocwlkljrjhgqejetgfgw.functions.supabase.co/telegram-webhook/nadir
- Secrets: All set correctly
- Code: Working (returns proper responses when auth is bypassed)
