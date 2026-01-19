# Script de diagnostic Telegram Al-Khayr
Write-Host "=== Diagnostic Système Telegram Al-Khayr ===" -ForegroundColor Cyan
Write-Host ""

$projectRef = "ocwlkljrjhgqejetgfgw"
$botToken = "8138462799:AAFaf451LfJmRBOgjtb9iGsaXJmk2w_Ya-8"

# 1. Vérifier le webhook
Write-Host "1. État du Webhook Telegram:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method GET
    $info = $response.Content | ConvertFrom-Json
    
    Write-Host "   URL: $($info.result.url)" -ForegroundColor $(if ($info.result.url) { "Green" } else { "Red" })
    Write-Host "   Erreurs: $($info.result.pending_update_count)" -ForegroundColor $(if ($info.result.pending_update_count -eq 0) { "Green" } else { "Red" })
    
    if ($info.result.last_error_message) {
        Write-Host "   Dernière erreur: $($info.result.last_error_message)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
}

# 2. Tester la fonction notification
Write-Host ""
Write-Host "2. Test de la fonction alkhayr-telegram-notifications:" -ForegroundColor Yellow
try {
    $testPayload = @{
        type = "local_request"
        record = @{
            id = "test-123"
            full_name = "Test Patient"
            medicine_name = "Test Medicine"
            city = "Test City"
            urgency = "normal"
            contact_type = "whatsapp"
            contact_value = "+213555000000"
        }
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-WebRequest -Uri "https://$projectRef.supabase.co/functions/v1/alkhayr-telegram-notifications" `
        -Method POST `
        -ContentType "application/json" `
        -Body $testPayload
    
    Write-Host "   ✅ Fonction accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "   Réponse: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
    Write-Host "   Détails: $($_.Exception.Message)" -ForegroundColor Gray
}

# 3. Tester le webhook unifié
Write-Host ""
Write-Host "3. Test de la fonction unified-telegram-webhook:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://$projectRef.supabase.co/functions/v1/unified-telegram-webhook" `
        -Method GET
    
    Write-Host "   ✅ Fonction accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 405) {
        Write-Host "   ✅ Fonction active (méthode GET non supportée, c'est normal)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur: $_" -ForegroundColor Red
    }
}

# 4. Instructions SQL
Write-Host ""
Write-Host "4. Vérifications Base de Données:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Exécutez ces requêtes dans Supabase SQL Editor:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   -- Vérifier l'extension pg_net" -ForegroundColor White
Write-Host "   SELECT * FROM pg_extension WHERE extname = 'pg_net';" -ForegroundColor White
Write-Host ""
Write-Host "   -- Vérifier les triggers" -ForegroundColor White
Write-Host "   SELECT tgname, tgenabled FROM pg_trigger WHERE tgname LIKE 'trigger_notify%';" -ForegroundColor White
Write-Host ""
Write-Host "   -- Vérifier la config" -ForegroundColor White
Write-Host "   SELECT * FROM public.alkhayr_settings;" -ForegroundColor White
Write-Host ""
Write-Host "   -- Tester manuellement une notification" -ForegroundColor White
Write-Host "   SELECT extensions.http_post(" -ForegroundColor White
Write-Host "     url := 'https://$projectRef.supabase.co/functions/v1/alkhayr-telegram-notifications'," -ForegroundColor White
Write-Host "     headers := '{\"Content-Type\": \"application/json\"}'::jsonb," -ForegroundColor White
Write-Host "     body := '{\"type\": \"test\", \"record\": {\"message\": \"Test\"}}'::jsonb" -ForegroundColor White
Write-Host "   );" -ForegroundColor White
Write-Host ""

# 5. Solution rapide
Write-Host ""
Write-Host "5. Solution Rapide (si pg_net ne fonctionne pas):" -ForegroundColor Yellow
Write-Host ""
Write-Host "   A. Activer pg_net dans Supabase:" -ForegroundColor Cyan
Write-Host "      Dashboard -> Database -> Extensions -> pg_net (Enable)" -ForegroundColor Gray
Write-Host ""
Write-Host "   B. Exécuter la migration de correction:" -ForegroundColor Cyan
Write-Host "      public/supabase/migrations/20251119_fix_telegram_triggers.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   C. Mettre à jour l'URL:" -ForegroundColor Cyan
Write-Host "      UPDATE public.alkhayr_settings" -ForegroundColor Gray
Write-Host "      SET value = 'https://$projectRef.supabase.co/functions/v1/alkhayr-telegram-notifications'" -ForegroundColor Gray
Write-Host "      WHERE key = 'telegram_notification_url';" -ForegroundColor Gray
Write-Host ""

Write-Host "=== Fin du Diagnostic ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Conseil: Si les triggers ne fonctionnent pas, utilisez les Database Webhooks de Supabase:" -ForegroundColor Yellow
Write-Host "   Dashboard -> Database -> Webhooks -> Create a new hook" -ForegroundColor Gray
Write-Host "   Table: local_medicine_requests" -ForegroundColor Gray
Write-Host "   Events: INSERT" -ForegroundColor Gray
Write-Host "   URL: https://$projectRef.supabase.co/functions/v1/alkhayr-telegram-notifications" -ForegroundColor Gray
