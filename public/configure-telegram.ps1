# Configuration complète du système Telegram pour Al-Khayr
# Exécutez ce script après avoir déployé les Edge Functions

Write-Host "=== Configuration Telegram Al-Khayr ===" -ForegroundColor Cyan
Write-Host ""

# 1. Demander le Bot Token
Write-Host "1. Récupérez votre TELEGRAM_BOT_TOKEN depuis:" -ForegroundColor Yellow
Write-Host "   Supabase Dashboard -> Edge Functions -> Secrets" -ForegroundColor Yellow
Write-Host ""
$botToken = Read-Host "Entrez votre TELEGRAM_BOT_TOKEN"

if ([string]::IsNullOrWhiteSpace($botToken)) {
    Write-Host "Erreur: Token vide!" -ForegroundColor Red
    exit 1
}

# 2. Configuration du webhook
$projectRef = "ocwlkljrjhgqejetgfgw"
$webhookUrl = "https://$projectRef.supabase.co/functions/v1/unified-telegram-webhook"

Write-Host ""
Write-Host "2. Configuration du webhook Telegram..." -ForegroundColor Green
Write-Host "   URL: $webhookUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl" -Method GET
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.ok) {
        Write-Host "   ✅ Webhook configuré avec succès!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur: $($result.description)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur de connexion: $_" -ForegroundColor Red
    exit 1
}

# 3. Vérifier le webhook
Write-Host ""
Write-Host "3. Vérification du webhook..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method GET
    $info = $response.Content | ConvertFrom-Json
    
    Write-Host "   URL actuelle: $($info.result.url)" -ForegroundColor Gray
    Write-Host "   Erreurs en attente: $($info.result.pending_update_count)" -ForegroundColor Gray
    Write-Host "   Dernière erreur: $($info.result.last_error_message)" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Impossible de vérifier: $_" -ForegroundColor Yellow
}

# 4. Instructions pour mettre à jour la base de données
Write-Host ""
Write-Host "4. Dernière étape: Mettre à jour l'URL dans la base de données" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Exécutez cette requête SQL dans Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   UPDATE public.alkhayr_settings" -ForegroundColor White
Write-Host "   SET value = 'https://$projectRef.supabase.co/functions/v1/alkhayr-telegram-notifications'" -ForegroundColor White
Write-Host "   WHERE key = 'telegram_notification_url';" -ForegroundColor White
Write-Host ""

# 5. Test
Write-Host ""
Write-Host "5. Pour tester, soumettez une demande Al-Khayr sur votre site:" -ForegroundColor Yellow
Write-Host "   http://localhost:8080/local-medicine-request" -ForegroundColor Gray
Write-Host ""
Write-Host "   Vous devriez recevoir une notification Telegram!" -ForegroundColor Green
Write-Host ""
Write-Host "=== Configuration terminée! ===" -ForegroundColor Cyan
