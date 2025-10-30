# deploy-frontend.ps1
# PowerShell script for Windows Server

$ErrorActionPreference = "Stop"

Write-Host "============================================" -ForegroundColor Blue
Write-Host "   Deploying Insight Hunter Frontend       " -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "frontend")) {
    Write-Host "ERROR: frontend directory not found" -ForegroundColor Red
    Write-Host "Run this script from the project root" -ForegroundColor Yellow
    exit 1
}

Set-Location frontend

# Check if package.json exists
if (-Not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found in frontend directory" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Blue
npm install

# Build the frontend
Write-Host "Building React frontend..." -ForegroundColor Blue
npm run build

# Check if build was successful
if (-Not (Test-Path "dist")) {
    Write-Host "ERROR: Build failed - dist directory not found" -ForegroundColor Red
    Write-Host "Make sure your package.json has a build script" -ForegroundColor Yellow
    exit 1
}

Write-Host "SUCCESS: Build completed" -ForegroundColor Green
Write-Host ""

# Deploy to Cloudflare Pages
Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Blue

try {
    wrangler pages deploy dist --project-name insighthunter --branch main
    
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "     Frontend Deployed Successfully!       " -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Access your app at:" -ForegroundColor Blue
    Write-Host "  Production: https://insighthunter.pages.dev" -ForegroundColor Green
    Write-Host "  Custom:     https://app.insighthunter.app (after domain setup)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Set up custom domain: wrangler pages domain add insighthunter app.insighthunter.app"
    Write-Host "2. Add environment variables in Cloudflare dashboard"
    Write-Host "3. Test your application"
}
catch {
    Write-Host "ERROR: Deployment failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Set-Location ..