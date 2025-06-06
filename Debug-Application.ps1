# Debug-Application.ps1 - PowerShell script to check and debug the Urban Commute Assistant

$Host.UI.RawUI.WindowTitle = "Urban Commute Assistant Debugger"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Urban Commute Assistant - Debug Utility" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

# Activate the Python 3.11.5 virtual environment
$envPath = Join-Path $PSScriptRoot "temp_env\Scripts\Activate.ps1"
Write-Host "Activating Python 3.11.5 environment..." -ForegroundColor Yellow
if (Test-Path $envPath) {
    . $envPath
} else {
    Write-Host "ERROR: Virtual environment not found at $envPath" -ForegroundColor Red
    Write-Host "Please run Setup-Environment.ps1 first to create the environment." -ForegroundColor Red
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Python version
$pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
Write-Host "Using Python version: $pythonVersion" -ForegroundColor Green

# Check if backend .env file exists
$backendEnvPath = Join-Path $PSScriptRoot "backend\.env"
if (Test-Path $backendEnvPath) {
    Write-Host "Backend .env file found." -ForegroundColor Green
} else {
    Write-Host "WARNING: Backend .env file not found. API keys may be missing." -ForegroundColor Yellow
}

# Check if frontend .env file exists
$frontendEnvPath = Join-Path $PSScriptRoot "frontend\.env"
if (Test-Path $frontendEnvPath) {
    Write-Host "Frontend .env file found." -ForegroundColor Green
    $frontendEnvContent = Get-Content $frontendEnvPath -Raw
    if ($frontendEnvContent -match "VITE_API_URL=(.*)") {
        Write-Host "Frontend API URL is set to: $($matches[1])" -ForegroundColor Green
    } else {
        Write-Host "WARNING: VITE_API_URL not found in frontend .env" -ForegroundColor Yellow
    }
} else {
    Write-Host "WARNING: Frontend .env file not found." -ForegroundColor Yellow
}

# Check if index.html exists in the correct location
$indexHtmlPath = Join-Path $PSScriptRoot "frontend\index.html"
if (Test-Path $indexHtmlPath) {
    Write-Host "Frontend index.html found in the correct location." -ForegroundColor Green
} else {
    Write-Host "ERROR: frontend/index.html not found!" -ForegroundColor Red
    Write-Host "This file is required for the Vite build process." -ForegroundColor Red
}

# Test backend API
Write-Host
Write-Host "Testing backend API..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8000/" -ErrorAction Stop
    Write-Host "Backend API is accessible." -ForegroundColor Green
    Write-Host "Response: $($backendResponse | ConvertTo-Json -Compress)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not connect to backend API at http://localhost:8000/" -ForegroundColor Red
    Write-Host "Make sure the backend server is running." -ForegroundColor Red
}

# Check network ports
Write-Host
Write-Host "Checking network ports..." -ForegroundColor Yellow
$tcpConnections = Get-NetTCPConnection -State Listen | Where-Object { $_.LocalPort -eq 8000 -or $_.LocalPort -eq 3000 -or $_.LocalPort -eq 3001 -or $_.LocalPort -eq 3002 -or $_.LocalPort -eq 3003 }
if ($tcpConnections) {
    Write-Host "Found the following relevant ports in use:" -ForegroundColor Green
    $tcpConnections | ForEach-Object {
        Write-Host "Port $($_.LocalPort) is in use by process ID $($_.OwningProcess)" -ForegroundColor Green
    }
} else {
    Write-Host "No relevant ports (8000, 3000-3003) found in use." -ForegroundColor Yellow
    Write-Host "This might mean the servers are not running." -ForegroundColor Yellow
}

Write-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Debug complete!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host
Write-Host "If you're experiencing issues:" -ForegroundColor Yellow
Write-Host "1. Make sure both backend and frontend servers are running" -ForegroundColor Yellow
Write-Host "2. Check browser console for JavaScript errors" -ForegroundColor Yellow
Write-Host "3. Try restarting both servers using Start-Urban-Commute.ps1" -ForegroundColor Yellow
Write-Host "4. Ensure you're using Python 3.11.5 via the temp_env environment" -ForegroundColor Yellow
Write-Host
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
