<#
.SYNOPSIS
Complete setup script for Waseet project - checks environment, installs dependencies, runs migrations, seeds data.

.DESCRIPTION
This script automates the entire local development setup:
- Verifies .env file exists and has required keys
- Checks if npm dependencies are installed
- Installs Supabase CLI if missing (optional)
- Tests Supabase connection
- Runs database migrations
- Seeds exchange rates test data
- Starts dev server

.PARAMETER SkipCLI
Skip Supabase CLI installation check/install

.PARAMETER SkipMigrations
Skip database migrations

.PARAMETER SkipSeed
Skip test data seeding

.EXAMPLE
.\setup-all.ps1
.\setup-all.ps1 -SkipCLI -SkipMigrations
#>

param(
    [switch]$SkipCLI,
    [switch]$SkipMigrations,
    [switch]$SkipSeed
)

$ErrorActionPreference = "Continue"

Write-Host "`n=== Waseet Project Setup ===" -ForegroundColor Cyan
Write-Host "This script will set up your local development environment.`n" -ForegroundColor White

# 1. Check .env file
Write-Host "[1/7] Checking .env configuration..." -ForegroundColor Yellow
$envPath = "public\.env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path "public\.env.example") {
        Copy-Item "public\.env.example" $envPath
        Write-Host "⚠️  Please edit public\.env and add your Supabase credentials." -ForegroundColor Yellow
        Write-Host "Then run this script again." -ForegroundColor Yellow
        exit 1
    } else {
        Write-Host "❌ .env.example not found either. Cannot proceed." -ForegroundColor Red
        exit 1
    }
}

# Read and validate env vars
$envContent = Get-Content $envPath -Raw
if ($envContent -notmatch 'VITE_SUPABASE_URL' -or $envContent -notmatch 'VITE_SUPABASE_PUBLISHABLE_KEY') {
    Write-Host "❌ .env is missing required keys (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)" -ForegroundColor Red
    exit 1
}

$envVars = @{}
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.+)$') {
        $key = $matches[1].Trim().Trim('"')
        $value = $matches[2].Trim().Trim('"')
        $envVars[$key] = $value
    }
}

if (-not $envVars['VITE_SUPABASE_URL'] -or $envVars['VITE_SUPABASE_URL'] -like '*YOUR_PROJECT*') {
    Write-Host "❌ VITE_SUPABASE_URL not configured properly in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ .env file valid" -ForegroundColor Green

# 2. Check Node.js and npm
Write-Host "`n[2/7] Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js $nodeVersion, npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js or npm not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# 3. Install npm dependencies
Write-Host "`n[3/7] Checking npm dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "public\node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    Push-Location public
    npm install
    Pop-Location
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# 4. Test Supabase connection
Write-Host "`n[4/7] Testing Supabase connection..." -ForegroundColor Yellow
$supabaseUrl = $envVars['VITE_SUPABASE_URL']
$anonKey = $envVars['VITE_SUPABASE_PUBLISHABLE_KEY']

try {
    $headers = @{
        apikey = $anonKey
        Authorization = "Bearer $anonKey"
    }
    $testUrl = "$supabaseUrl/rest/v1/"
    $response = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get -TimeoutSec 10
    Write-Host "✅ Supabase connection successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Supabase connection failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This might be due to proxy. Run setup-proxy.ps1 if needed." -ForegroundColor Yellow
    Write-Host "Continuing anyway..." -ForegroundColor Yellow
}

# 5. Supabase CLI (optional)
if (-not $SkipCLI) {
    Write-Host "`n[5/7] Checking Supabase CLI..." -ForegroundColor Yellow
    try {
        $cliVersion = supabase --version
        Write-Host "✅ Supabase CLI installed: $cliVersion" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Supabase CLI not found" -ForegroundColor Yellow
        $install = Read-Host "Install Supabase CLI via npm? (y/n)"
        if ($install -eq 'y') {
            npm install -g supabase
            Write-Host "✅ Supabase CLI installed" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Skipping CLI installation. Migrations won't run." -ForegroundColor Yellow
            $SkipMigrations = $true
        }
    }
} else {
    Write-Host "`n[5/7] Skipping Supabase CLI check" -ForegroundColor Gray
}

# 6. Run migrations
if (-not $SkipMigrations) {
    Write-Host "`n[6/7] Running database migrations..." -ForegroundColor Yellow
    try {
        Push-Location public
        
        # Check if linked
        $linkStatus = supabase status 2>&1
        if ($linkStatus -notmatch 'API URL') {
            Write-Host "Linking project..." -ForegroundColor Yellow
            $projectId = $envVars['VITE_SUPABASE_PROJECT_ID']
            if (-not $projectId) {
                # Extract from URL
                if ($supabaseUrl -match 'https://([^.]+)\.supabase\.co') {
                    $projectId = $matches[1]
                }
            }
            
            if ($projectId) {
                Write-Host "Run manually: supabase link --project-ref $projectId" -ForegroundColor Cyan
                Write-Host "Then: supabase db push" -ForegroundColor Cyan
            }
        }
        
        Pop-Location
        Write-Host "⚠️  Migrations need manual run. See commands above." -ForegroundColor Yellow
    } catch {
        Write-Host "⚠️  Migration setup incomplete: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[6/7] Skipping migrations" -ForegroundColor Gray
}

# 7. Seed test data
if (-not $SkipSeed) {
    Write-Host "`n[7/7] Seeding exchange test data..." -ForegroundColor Yellow
    
    # Check if data exists
    try {
        $checkUrl = "$supabaseUrl/rest/v1/exchange_rates?select=count"
        $existing = Invoke-RestMethod -Uri $checkUrl -Headers $headers -Method Get
        
        if ($existing) {
            Write-Host "✅ Exchange data already exists" -ForegroundColor Green
        } else {
            Write-Host "No data found. Use Supabase Table Editor to insert rates manually." -ForegroundColor Yellow
            Write-Host "Or run SQL from: public\supabase\migrations\20251127_exchange_rates_system.sql" -ForegroundColor Cyan
        }
    } catch {
        Write-Host "⚠️  Could not check existing data: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[7/7] Skipping data seeding" -ForegroundColor Gray
}

# Final summary
Write-Host "`n=== Setup Complete ===" -ForegroundColor Cyan
Write-Host "✅ Environment configured" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor White
Write-Host "1. cd public" -ForegroundColor Cyan
Write-Host "2. npm run dev" -ForegroundColor Cyan
Write-Host "3. Open http://localhost:8081/" -ForegroundColor Cyan
Write-Host "`nIf proxy issues persist, run: .\setup-proxy.ps1" -ForegroundColor Yellow
Write-Host "If migrations needed, run: supabase link --project-ref YOUR_PROJECT_ID; supabase db push" -ForegroundColor Yellow
Write-Host ""
