# Script de reinitialisation webhook Telegram
# Sans emojis pour compatibilite PowerShell

Write-Host "Reinitialisation du webhook Telegram..." -ForegroundColor Cyan
Write-Host ""

$botToken = Read-Host "Entrez votre TELEGRAM_BOT_TOKEN"

if ([string]::IsNullOrWhiteSpace($botToken)) {
    Write-Host "Token manquant. Arret." -ForegroundColor Red
    exit 1
}

$webhookUrl = "https://ocwlkljrjhgqejetgfgw.functions.supabase.co/unified-telegram-webhook"

Write-Host "Etape 1: Verification webhook actuel..." -ForegroundColor Yellow
try {
    $currentInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
    Write-Host "URL actuelle: $($currentInfo.result.url)" -ForegroundColor White
    Write-Host "En attente: $($currentInfo.result.pending_update_count)" -ForegroundColor White
    if ($currentInfo.result.last_error_message) {
        Write-Host "Derniere erreur: $($currentInfo.result.last_error_message)" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lecture webhook: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Etape 2: Suppression webhook..." -ForegroundColor Yellow
try {
    $deleteResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/deleteWebhook?drop_pending_updates=true" -Method Post
    if ($deleteResult.ok) {
        Write-Host "Webhook supprime avec succes" -ForegroundColor Green
    } else {
        Write-Host "Resultat: $($deleteResult.description)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur suppression: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Attente 2 secondes..." -ForegroundColor Gray
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Etape 3: Configuration nouveau webhook..." -ForegroundColor Yellow
Write-Host "URL: $webhookUrl" -ForegroundColor Cyan
try {
    $setResult = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/setWebhook?url=$webhookUrl" -Method Post
    if ($setResult.ok) {
        Write-Host "Webhook configure avec succes!" -ForegroundColor Green
    } else {
        Write-Host "Echec: $($setResult.description)" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur configuration: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Etape 4: Verification finale..." -ForegroundColor Yellow
try {
    $finalInfo = Invoke-RestMethod -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get
    Write-Host "URL configuree: $($finalInfo.result.url)" -ForegroundColor Green
    Write-Host "En attente: $($finalInfo.result.pending_update_count)" -ForegroundColor White
    Write-Host "Certificat custom: $($finalInfo.result.has_custom_certificate)" -ForegroundColor White
    if ($finalInfo.result.last_error_message) {
        Write-Host "Erreur: $($finalInfo.result.last_error_message)" -ForegroundColor Red
        Write-Host "Date erreur: $($finalInfo.result.last_error_date)" -ForegroundColor Red
    } else {
        Write-Host "Aucune erreur detectee" -ForegroundColor Green
    }
} catch {
    Write-Host "Erreur verification: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "TEST RECOMMANDE:" -ForegroundColor Cyan
Write-Host "Ouvrir Telegram et envoyer: /help" -ForegroundColor White
Write-Host ""
Write-Host "Si pas de reponse:" -ForegroundColor Yellow
Write-Host "1. Verifier variables environnement dans Supabase Functions" -ForegroundColor White
Write-Host "2. JWT desactive pour unified-telegram-webhook" -ForegroundColor White
Write-Host "3. Consulter logs Supabase Dashboard" -ForegroundColor White
Write-Host ""
