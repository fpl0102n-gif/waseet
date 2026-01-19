# Add admin_note column to orders table via Supabase API
$PROJECT_REF = "ocwlkljrjhgqejetgfgw"
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jd2xrbGpyamhncWVqZXRnZmd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzM2NjA1MSwiZXhwIjoyMDc4OTQyMDUxfQ.EoaR_xdAKOUDH5i1unxv-kHEL9xaaRu7pSfBHHf6quQ"

$headers = @{
    "apikey" = $SERVICE_ROLE_KEY
    "Authorization" = "Bearer $SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
}

$sql = @"
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_note TEXT;
"@

Write-Host "Adding admin_note column to orders table..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://$PROJECT_REF.supabase.co/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body (@{ query = $sql } | ConvertTo-Json)
    Write-Host "SUCCESS: Column added!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    # Try alternative method using postgres connection
    Write-Host "Direct SQL method failed, trying psql connection..." -ForegroundColor Yellow
    
    # Get database URL from secrets
    $DB_URL = "postgresql://postgres.ocwlkljrjhgqejetgfgw:FGNadir05112002@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"
    
    Write-Host "Executing SQL via REST API..." -ForegroundColor Yellow
    
    # Use Supabase SQL Editor API
    $body = @{
        sql = $sql
    } | ConvertTo-Json
    
    try {
        $ACCESS_TOKEN = "sbp_95f9f44475870be9744d57b669c134ac81ece447"
        $mgmtHeaders = @{
            "Authorization" = "Bearer $ACCESS_TOKEN"
            "Content-Type" = "application/json"
        }
        
        Invoke-RestMethod -Uri "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" -Method POST -Headers $mgmtHeaders -Body $body
        Write-Host "SUCCESS: Column added via Management API!" -ForegroundColor Green
    } catch {
        Write-Host "ERROR:" -ForegroundColor Red
        $_.Exception.Message
        Write-Host "`nPlease run this SQL manually in the SQL Editor:" -ForegroundColor Yellow
        Write-Host $sql -ForegroundColor Cyan
    }
}
