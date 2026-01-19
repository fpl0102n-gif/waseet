# Update existing orders with current exchange rate
$PROJECT_REF = "ocwlkljrjhgqejetgfgw"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2xrbGpyamhncWVqZXRnZmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjA1MSwiZXhwIjoyMDc4OTQyMDUxfQ.EoaR_xdAKOUDH5i1unxv-kHEL9xaaRu7pSfBHHf6quQ"

$headers = @{
    "apikey" = $SERVICE_ROLE_KEY
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

Write-Host "Getting current exchange rate..." -ForegroundColor Yellow
$rateResponse = Invoke-RestMethod -Uri "https://$PROJECT_REF.supabase.co/rest/v1/settings?key=eq.exchange_rate_usd_to_dzd&select=value" -Headers $headers
$currentRate = [decimal]$rateResponse[0].value
Write-Host "Current rate: $currentRate DZD" -ForegroundColor Green

Write-Host "`nGetting orders without total_dzd..." -ForegroundColor Yellow
$ordersResponse = Invoke-RestMethod -Uri "https://$PROJECT_REF.supabase.co/rest/v1/orders?select=id,total&total_dzd=is.null" -Headers $headers
Write-Host "Found $($ordersResponse.Count) orders to update" -ForegroundColor Green

if ($ordersResponse.Count -eq 0) {
    Write-Host "All orders already have total_dzd set!" -ForegroundColor Green
    exit 0
}

Write-Host "`nUpdating orders..." -ForegroundColor Yellow
$updated = 0
foreach ($order in $ordersResponse) {
    $totalDzd = [decimal]$order.total * $currentRate
    
    $body = @{
        exchange_rate_at_order = $currentRate
        total_dzd = $totalDzd
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "https://$PROJECT_REF.supabase.co/rest/v1/orders?id=eq.$($order.id)" -Method PATCH -Headers $headers -Body $body | Out-Null
        $updated++
        Write-Host "  Updated order #$($order.id): $($order.total) USD = $($totalDzd.ToString('F2')) DZD" -ForegroundColor Cyan
    } catch {
        Write-Host "  Failed to update order #$($order.id): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nSUCCESS: Updated $updated orders!" -ForegroundColor Green
