# Quick Setup Script for Windows
# Usage: .\setup.ps1

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CreditLine - Quick Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify venv exists
Write-Host "[1/4] Checking Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path ".\.venv\Scripts\python.exe")) {
    Write-Host "❌ Virtual environment not found. Creating venv..." -ForegroundColor Red
    python -m venv .venv
    Write-Host "✓ Virtual environment created" -ForegroundColor Green
}
else {
    Write-Host "✓ Virtual environment found" -ForegroundColor Green
}

# Step 2: Install requirements
Write-Host "[2/4] Installing Python dependencies..." -ForegroundColor Yellow
& ".\.venv\Scripts\python.exe" -m pip install -r backend/requirements.txt -q
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Step 3: Verify Django setup
Write-Host "[3/4] Verifying Django configuration..." -ForegroundColor Yellow
Push-Location backend
& ".\..\venv\Scripts\python.exe" manage.py check 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Django configuration is valid" -ForegroundColor Green
}
else {
    Write-Host "⚠ Django check failed - review .env configuration" -ForegroundColor Yellow
}
Pop-Location

# Step 4: Check npm/node
Write-Host "[4/4] Checking Node.js installation..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✓ Node.js $(node --version) found" -ForegroundColor Green
}
else {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "✓ Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Initialize development data in Supabase SQL Editor (see docs/BACKEND_SETUP.md)"
Write-Host "2. Start backend:  cd backend && python manage.py runserver_safe 8000"
Write-Host "3. Start frontend: cd frontend && npm run dev"
Write-Host "4. Open http://localhost:5173 and login with:"
Write-Host "   - Admin: admin@example.com / admin123"
Write-Host "   - Operario: operario@example.com / operario123"
Write-Host ""
