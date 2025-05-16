# filepath: c:\Users\jaden\Documents\GitHub\TECHIN510-Developer\urban-commute-assistant-simple\Setup-Environment.ps1
# Setup-Environment.ps1 - PowerShell script to set up the Python 3.11.5 environment for Urban Commute Assistant

$Host.UI.RawUI.WindowTitle = "Urban Commute Assistant Setup"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Urban Commute Assistant - Python 3.11.5 Environment Setup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

$pythonPath = "C:\Users\jaden\.pyenv\pyenv-win\versions\3.11.5\python.exe"
$envDir = Join-Path $PSScriptRoot "temp_env"

# Check if Python 3.11.5 exists
if (-not (Test-Path $pythonPath)) {
    Write-Host "ERROR: Python 3.11.5 not found at $pythonPath" -ForegroundColor Red
    Write-Host "Please ensure Python 3.11.5 is installed using pyenv:" -ForegroundColor Yellow
    Write-Host "  pyenv install 3.11.5" -ForegroundColor Yellow
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path $envDir)) {
    Write-Host "Creating Python 3.11.5 virtual environment..." -ForegroundColor Yellow
    & $pythonPath -m venv $envDir
} else {
    Write-Host "Python virtual environment already exists." -ForegroundColor Green
}

# Activate the environment
$activateScript = Join-Path $envDir "Scripts\Activate.ps1"
Write-Host "Activating Python 3.11.5 environment..." -ForegroundColor Yellow
. $activateScript

# Verify Python version
$pythonVersion = python -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}')"
Write-Host "Using Python version: $pythonVersion" -ForegroundColor Green

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path (Join-Path $PSScriptRoot "backend")
pip install -r requirements.txt

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path (Join-Path $PSScriptRoot "frontend")
npm install

Set-Location -Path $PSScriptRoot
Write-Host
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Setup complete! You can now run Start-Urban-Commute.ps1" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
