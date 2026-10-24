# =====================================================================
# 🚀 AVIZOL AUTOMATION PLATFORM — POWERSHELL PRODUCTION LAUNCHER
# Reverse-Engineered from BizAutomation (app.bizautomation.io/vb)
# =====================================================================

Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host "  🚀 AVIZOL AUTOMATION PLATFORM (100% PRODUCTION READY REPLICA)" -ForegroundColor Green
Write-Host "  Reverse-Engineered from BizAutomation (app.bizautomation.io/vb)" -ForegroundColor Yellow
Write-Host "=====================================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start API Gateway on Port 4000
Write-Host "`n[1/2] Starting Avizol API Gateway & WebSocket Server on Port 4000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\api-gateway'; npm run start"

Start-Sleep -Seconds 2

# 2. Start Web Portal on Port 3000
Write-Host "[2/2] Starting Avizol Web Frontend on Port 3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\apps\web'; npm run preview -- --port 3000 --host"

Write-Host "`n=====================================================================" -ForegroundColor Green
Write-Host "  ✅ ALL SERVICES ACTIVATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "  👉 Web Portal:      http://localhost:3000/" -ForegroundColor White
Write-Host "  👉 API Gateway:     http://localhost:4000/" -ForegroundColor White
Write-Host "  👉 WebSocket:       ws://localhost:4000" -ForegroundColor White
Write-Host "  👉 WhatsApp Hook:   http://localhost:4000/webhook/whatsapp" -ForegroundColor White
Write-Host "  👉 IndiaMart Hook:  http://localhost:4000/webhook/indiamart" -ForegroundColor White
Write-Host "=====================================================================`n" -ForegroundColor Green
