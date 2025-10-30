cd frontend

Write-Host "Cleaning old build..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

Write-Host "Building with debug info..." -ForegroundColor Blue
npm run build

Write-Host "`nChecking dist directory..." -ForegroundColor Blue
if (Test-Path "dist/index.html") {
    Write-Host "✓ index.html found" -ForegroundColor Green
    Get-Content dist/index.html | Select-Object -First 10
} else {
    Write-Host "✗ index.html NOT found!" -ForegroundColor Red
}

Write-Host "`nAssets in dist:" -ForegroundColor Blue
Get-ChildItem -Recurse dist | Select-Object FullName

Write-Host "`nDeploying..." -ForegroundColor Blue
wrangler pages deploy dist --project-name insighthunter

cd ..
