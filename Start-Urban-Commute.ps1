# Start-Urban-Commute.ps1 - PowerShell script to start the Urban Commute Assistant

$Host.UI.RawUI.WindowTitle = "Urban Commute Assistant Launcher"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Urban Commute Assistant - Python Launcher" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

# Activate the Python virtual environment
$envPath = Join-Path $PSScriptRoot ".venv\Scripts\Activate.ps1"
Write-Host "Activating Python environment..." -ForegroundColor Yellow
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

Write-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Starting Urban Commute Assistant Backend" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

Set-Location -Path (Join-Path $PSScriptRoot "backend")
Start-Process -FilePath "powershell" -ArgumentList "-Command", ". '$envPath'; python run.py" -WindowStyle Normal

Write-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Starting Urban Commute Assistant Frontend" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

Start-Sleep -Seconds 5
Set-Location -Path (Join-Path $PSScriptRoot "frontend")
Start-Process -FilePath "powershell" -ArgumentList "-Command", "npm run dev" -WindowStyle Normal

Write-Host "Frontend will be available at: http://localhost:3000 (or another port if 3000 is busy)" -ForegroundColor Green

Set-Location -Path $PSScriptRoot
Write-Host
Write-Host "Both applications are now running in separate windows." -ForegroundColor Green
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
