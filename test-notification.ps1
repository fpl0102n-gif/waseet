$ProjectId = "ocwlkljrjhgqejetgfgw"
$AnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2xrbGpyamhncWVqZXRnZmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzNjYwNTEsImV4cCI6MjA3ODk0MjA1MX0.hMW0hB8RUEXCEoCS88H2YvOlDBeyz9oEhEPJeF38jRE"
$Url = "https://$ProjectId.supabase.co/functions/v1/send-telegram-notification"

$Body = @{
    type = "test"
    record = @{
        id = 123
        message = "Manual Test from PowerShell"
    }
} | ConvertTo-Json

$Headers = @{
    "Authorization" = "Bearer $AnonKey"
    "Content-Type"  = "application/json"
}

try {
    Write-Host "Sending test notification to: $Url"
    $response = Invoke-RestMethod -Uri $Url -Method Post -Headers $Headers -Body $Body
    Write-Host "Success!" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 5)
} catch {
    Write-Host "Error Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
