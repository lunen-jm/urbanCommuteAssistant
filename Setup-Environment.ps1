# Setup-Environment.ps1 - PowerShell script to set up the Python environment for Urban Commute Assistant

$Host.UI.RawUI.WindowTitle = "Urban Commute Assistant Setup"

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Urban Commute Assistant - Python Environment Setup" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host

# Try to find Python installation
$pythonPath = $null
$envDir = Join-Path $PSScriptRoot ".venv"

# Check multiple possible Python locations
$pythonCandidates = @(
    "python",  # System PATH
    "python3", # System PATH alternative
    "py",      # Python Launcher
    "C:\Python311\python.exe", # Standard installation
    "C:\Program Files\Python311\python.exe", # Program Files
    "$env:LOCALAPPDATA\Programs\Python\Python311\python.exe", # User installation
    "$env:LOCALAPPDATA\Programs\Python\Python312\python.exe", # User installation Python 3.12
    "$env:APPDATA\Python\Python311\python.exe", # Another user installation location
    "$env:APPDATA\Python\Python312\python.exe"  # Another user installation location Python 3.12
)

foreach ($candidate in $pythonCandidates) {
    try {
        # Test if the command/path exists and is accessible
        if ($candidate -match "^[a-zA-Z]:" -and -not (Test-Path $candidate)) {
            continue
        }
          $version = & $candidate --version 2>$null
        if ($version -match "Python 3\.1[1-9]" -or $version -match "Python 3\.[2-9][0-9]") {
            $pythonPath = $candidate
            Write-Host "Found Python: $version at $candidate" -ForegroundColor Green
            break
        } elseif ($version -match "Python 3\.(\d+)") {
            # Found Python but wrong version
            Write-Host "Found Python: $version (version too old, need 3.11+)" -ForegroundColor Yellow
        }
    } catch {
        # Continue to next candidate
    }
}

# Check if we found a suitable Python
if (-not $pythonPath) {
    Write-Host "ERROR: No suitable Python 3.11+ installation found" -ForegroundColor Red
    Write-Host "Please install Python 3.11+ from https://python.org/downloads" -ForegroundColor Yellow
    Write-Host "Or ensure Python is in your PATH" -ForegroundColor Yellow
    Write-Host "Press any key to exit..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path $envDir)) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    & $pythonPath -m venv $envDir
} else {
    Write-Host "Python virtual environment already exists." -ForegroundColor Green
}

# Activate the environment
$activateScript = Join-Path $envDir "Scripts\Activate.ps1"
Write-Host "Activating Python environment..." -ForegroundColor Yellow
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
