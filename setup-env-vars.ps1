# Alternative: recuperer Chat ID depuis les logs webhook

Write-Host "METHODE ALTERNATIVE pour obtenir votre Chat ID:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Envoyez /start au bot dans Telegram" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Allez sur les logs de la fonction:" -ForegroundColor Yellow
Write-Host "   https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/functions/unified-telegram-webhook/logs" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Cherchez dans les logs recents un objet JSON contenant:" -ForegroundColor Yellow
Write-Host '   "from": { "id": 123456789, ... }' -ForegroundColor White
Write-Host ""
Write-Host "4. Le nombre apres 'id' est votre Chat ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "CONFIGURATION VARIABLES ENVIRONNEMENT" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""
Write-Host "Allez sur:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/ocwlkljrjhgqejetgfgw/settings/functions" -ForegroundColor White
Write-Host ""
Write-Host "Section 'Environment variables' ou 'Secrets', ajoutez:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. TELEGRAM_BOT_TOKEN" -ForegroundColor Green
Write-Host "   Valeur: 8138462799:AAFaf451LfJmRBOgjtb9iGsaXJmk2w_Ya-8" -ForegroundColor White
Write-Host ""
Write-Host "2. TELEGRAM_ADMIN_CHAT_ID" -ForegroundColor Green
Write-Host "   Valeur: [votre Chat ID numerique depuis logs]" -ForegroundColor White
Write-Host ""
Write-Host "3. SUPABASE_URL" -ForegroundColor Green
Write-Host "   Valeur: https://ocwlkljrjhgqejetgfgw.supabase.co" -ForegroundColor White
Write-Host ""
Write-Host "4. SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Green
Write-Host "   Allez: Dashboard > Settings > API" -ForegroundColor Yellow
Write-Host "   Copiez la cle 'service_role' (commence par eyJ...)" -ForegroundColor White
Write-Host ""
Write-Host "Apres configuration:" -ForegroundColor Cyan
Write-Host "- La fonction se redeploiera automatiquement" -ForegroundColor White
Write-Host "- Testez /help dans Telegram" -ForegroundColor White
Write-Host "- Logs devront montrer 'Received update' et execution complete" -ForegroundColor White
Write-Host ""
