<#
setup-proxy.ps1
Configure a corporate proxy for local development (npm / Supabase / fetch) and optionally bypass it for Supabase.
USAGE (interactive):
  powershell -ExecutionPolicy Bypass -File ./setup-proxy.ps1
Or with parameters:
  ./setup-proxy.ps1 -ProxyHost proxy.example.com -ProxyPort 8080 -Username DOMAIN\\user -NoProxy "localhost,127.0.0.1,*.supabase.co"
#>
param(
  [string]$ProxyHost = "",
  [int]$ProxyPort = 0,
  [string]$Username = "",
  [string]$NoProxy = "localhost,127.0.0.1,*.supabase.co",
  [switch]$Persist
)

function UrlEncode([string]$s) {
  [System.Net.WebUtility]::UrlEncode($s)
}

Write-Host "=== Proxy Setup Script ===" -ForegroundColor Cyan
if (-not $ProxyHost) { $ProxyHost = Read-Host "Proxy host (ex: proxy.corp.local)" }
if (-not $ProxyPort) { $ProxyPort = [int](Read-Host "Proxy port (ex: 8080)") }
if (-not $Username) { $Username = Read-Host "Proxy username (DOMAIN\\user ou user)" }

$SecurePassword = Read-Host "Proxy password" -AsSecureString
$Ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecurePassword)
$PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($Ptr)
[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($Ptr)

$EncodedPassword = UrlEncode($PlainPassword)
$EncodedUsername = UrlEncode($Username)
$ProxyUrl = "http://${EncodedUsername}:${EncodedPassword}@${ProxyHost}:${ProxyPort}"

Write-Host "Setting session environment variables..." -ForegroundColor Yellow
$env:HTTP_PROXY = $ProxyUrl
$env:HTTPS_PROXY = $ProxyUrl
$env:NO_PROXY = $NoProxy
$env:no_proxy = $NoProxy

Write-Host "HTTP_PROXY=$env:HTTP_PROXY" -ForegroundColor Green
Write-Host "NO_PROXY=$env:NO_PROXY" -ForegroundColor Green

if ($Persist) {
  Write-Host "Persisting variables at USER level" -ForegroundColor Yellow
  [Environment]::SetEnvironmentVariable("HTTP_PROXY", $env:HTTP_PROXY, "User")
  [Environment]::SetEnvironmentVariable("HTTPS_PROXY", $env:HTTPS_PROXY, "User")
  [Environment]::SetEnvironmentVariable("NO_PROXY", $env:NO_PROXY, "User")
  [Environment]::SetEnvironmentVariable("no_proxy", $env:NO_PROXY, "User")
}

Write-Host "You may also want to exclude the proxy for Supabase via Windows settings (Proxy exceptions)." -ForegroundColor Yellow
Write-Host "Test a Supabase REST endpoint (replace with your anon key):" -ForegroundColor Cyan
Write-Host "Invoke-RestMethod -Headers @{ apikey='YOUR_ANON_KEY'; Authorization='Bearer YOUR_ANON_KEY' } -Uri 'https://YOUR_PROJECT_ID.supabase.co/rest/v1/'" -ForegroundColor White

Write-Host "To remove proxy for this session:" -ForegroundColor Magenta
Write-Host "$env:HTTP_PROXY=''; $env:HTTPS_PROXY=''; $env:NO_PROXY=''; $env:no_proxy=''" -ForegroundColor White

Write-Host "Done." -ForegroundColor Cyan
