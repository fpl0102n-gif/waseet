# Configure telegram-webhook to be publicly accessible (no JWT verification)
# This must be done via the Management API, not via function deployment

$PROJECT_REF = "ocwlkljrjhgqejetgfgw"
$ACCESS_TOKEN = "sbp_95f9f44475870be9744d57b669c134ac81ece447"
$FUNCTION_SLUG = "telegram-webhook"

$headers = @{
    "Authorization" = "Bearer $ACCESS_TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "Configuring function to disable JWT verification..." -ForegroundColor Yellow

# Get the function ID first
$listUrl = "https://api.supabase.com/v1/projects/$PROJECT_REF/functions"
try {
    $functions = Invoke-RestMethod -Uri $listUrl -Headers $headers -Method GET
    $targetFunction = $functions | Where-Object { $_.slug -eq $FUNCTION_SLUG }
    
    if ($targetFunction) {
        Write-Host "Found function: $($targetFunction.name) (ID: $($targetFunction.id))"
        
        # Update function config
        $updateUrl = "https://api.supabase.com/v1/projects/$PROJECT_REF/functions/$($targetFunction.id)"
        $body = @{
            verify_jwt = $false
        } | ConvertTo-Json
        
        $result = Invoke-RestMethod -Uri $updateUrl -Headers $headers -Method PATCH -Body $body
        Write-Host "SUCCESS: JWT verification disabled!" -ForegroundColor Green
        $result | ConvertTo-Json
    } else {
        Write-Host "ERROR: Function not found" -ForegroundColor Red
    }
} catch {
    Write-Host "ERROR:" -ForegroundColor Red
    $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
        $reader.Close()
    }
}
