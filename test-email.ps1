
$Url = "http://localhost:54321/functions/v1/send-email"
# Note: For local Supabase testing, you use `supabase start` and the local URL. 
# If testing against PROD, change URL to the project URL.

$Body = @{
    type = "order"
    record = @{
        id = 999
        email = "test@example.com"
        product_name = "Test Product"
        total = 5000
    }
} | ConvertTo-Json

$Headers = @{
    "Content-Type"  = "application/json"
    "Authorization" = "Bearer YOUR_TEST_TOKEN" 
}

try {
    Write-Host "Sending test email request to: $Url"
    # Logic to send request would go here if local server was running.
    # Since we can't run 'supabase start' inside this environment easily, this is a template.
    Write-Host "Payload: $Body"
} catch {
    Write-Host "Error"
}
