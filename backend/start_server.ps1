# Django Development Server Startup Script
# Run from the backend/ directory: .\start_server.ps1

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$VenvPython = Join-Path $ScriptDir "venv\Scripts\python.exe"

if (-Not (Test-Path $VenvPython)) {
    Write-Error "Virtual environment not found at: $VenvPython"
    Write-Host "Create it with: python -m venv venv"
    Write-Host "Then install deps: venv\Scripts\pip install -r requirements.txt"
    exit 1
}

Write-Host "Starting Django development server using venv Python..." -ForegroundColor Cyan
& $VenvPython manage.py runserver
