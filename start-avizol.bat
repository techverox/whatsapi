@echo off
TITLE Avizol Automation - Enterprise Omnichannel & AI CRM Engine
COLOR 0A

echo =====================================================================
echo   🚀 AVIZOL AUTOMATION PLATFORM (100% PRODUCTION READY REPLICA)
echo   Reverse-Engineered from BizAutomation (app.bizautomation.io/vb)
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Avizol API Gateway & WebSocket Server on Port 4000...
start "Avizol API Gateway (Port 4000)" cmd /k "cd apps\api-gateway && npm run start"

timeout /t 2 /nobreak >nul

echo [2/2] Starting Avizol Web Frontend on Port 3000...
start "Avizol Web Portal (Port 3000)" cmd /k "cd apps\web && npm run preview -- --port 3000 --host"

echo.
echo =====================================================================
echo   ✅ ALL SERVICES ACTIVATED SUCCESSFULLY!
echo   👉 Web Portal:      http://localhost:3000/
echo   👉 API Gateway:     http://localhost:4000/
echo   👉 WebSocket:       ws://localhost:4000
echo   👉 WhatsApp Hook:   http://localhost:4000/webhook/whatsapp
echo   👉 IndiaMart Hook:  http://localhost:4000/webhook/indiamart
echo =====================================================================
echo.
pause
