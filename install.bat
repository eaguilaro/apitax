@echo off
REM Script de instalación para Windows

echo 🚀 Iniciando instalación de API TAX...

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado. Instálalo desde https://nodejs.org/
    exit /b 1
)

echo ✓ Node.js: 
node --version

echo ✓ npm: 
npm --version

REM Instalar Backend
echo.
echo 📦 Instalando Backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando backend
    exit /b 1
)
echo ✓ Backend instalado

REM Instalar Frontend
echo.
echo 📦 Instalando Frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando frontend
    exit /b 1
)
echo ✓ Frontend instalado

cd ..

echo.
echo ✅ Instalación completada!
echo.
echo 📝 Próximos pasos:
echo 1. Configura variables en backend\.env
echo 2. Asegúrate que MongoDB esté corriendo
echo 3. Terminal 1: cd backend && npm run dev
echo 4. Terminal 2: cd frontend && npm run dev
echo.
echo 🌐 Accede a http://localhost:5173
pause
