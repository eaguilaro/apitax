@echo off
REM Script de verificación del proyecto API TAX para Windows

echo 🔍 VERIFICANDO ESTRUCTURA DEL PROYECTO API TAX
echo ============================================== 

setlocal enabledelayedexpansion
set pass=0
set fail=0

REM Función para verificar archivo
set "folders[0]=backend"
set "folders[1]=backend\src"
set "folders[2]=backend\src\config"
set "folders[3]=backend\src\controllers"
set "folders[4]=backend\src\models"
set "folders[5]=backend\src\routes"
set "folders[6]=backend\src\middleware"
set "folders[7]=backend\uploads"
set "folders[8]=frontend"
set "folders[9]=frontend\src"
set "folders[10]=frontend\src\pages"
set "folders[11]=frontend\src\services"
set "folders[12]=frontend\src\stores"
set "folders[13]=frontend\src\router"
set "folders[14]=frontend\public"

echo.
echo 📁 DIRECTORIOS:
for /l %%i in (0,1,14) do (
    if exist "!folders[%%i]!" (
        echo ✓ !folders[%%i]!\
        set /a pass+=1
    ) else (
        echo ✗ FALTA: !folders[%%i]!\
        set /a fail+=1
    )
)

echo.
echo 📄 ARCHIVOS BACKEND:
call :verifyFile "backend\package.json"
call :verifyFile "backend\.env"
call :verifyFile "backend\.env.example"
call :verifyFile "backend\.gitignore"
call :verifyFile "backend\src\index.js"
call :verifyFile "backend\src\config\database.js"
call :verifyFile "backend\src\controllers\gastoController.js"
call :verifyFile "backend\src\models\Gasto.js"
call :verifyFile "backend\src\routes\gastoRoutes.js"
call :verifyFile "backend\src\middleware\upload.js"
call :verifyFile "backend\README.md"

echo.
echo 📄 ARCHIVOS FRONTEND:
call :verifyFile "frontend\package.json"
call :verifyFile "frontend\.gitignore"
call :verifyFile "frontend\index.html"
call :verifyFile "frontend\vite.config.js"
call :verifyFile "frontend\src\main.js"
call :verifyFile "frontend\src\App.vue"
call :verifyFile "frontend\src\router\index.js"
call :verifyFile "frontend\src\services\gastoService.js"
call :verifyFile "frontend\src\stores\gastoStore.js"
call :verifyFile "frontend\src\pages\ListadoGastos.vue"
call :verifyFile "frontend\src\pages\NuevoGasto.vue"
call :verifyFile "frontend\src\pages\ResumenGastos.vue"
call :verifyFile "frontend\README.md"

echo.
echo 📄 ARCHIVOS DE DOCUMENTACIÓN:
call :verifyFile "README.md"
call :verifyFile "INSTALACION_RAPIDA.md"
call :verifyFile "ARQUITECTURA.md"
call :verifyFile "TESTING_API.md"
call :verifyFile "PROYECTO_COMPLETADO.md"
call :verifyFile "DIAGRAMA_ARQUITECTURA.md"

echo.
echo ⚙️  ARCHIVOS DE CONFIGURACIÓN:
call :verifyFile "docker-compose.yml"
call :verifyFile "install.bat"
call :verifyFile "verify.bat"

echo.
echo ============================================== 
echo Verificación completada:
echo ✓ Archivos correctos: %pass%
echo ✗ Archivos faltantes: %fail%
echo.

if %fail% equ 0 (
    echo 🎉 ¡EL PROYECTO ESTÁ COMPLETO Y LISTO!
    echo.
    echo Próximos pasos:
    echo 1. cd backend ^&^& npm install
    echo 2. cd ..\frontend ^&^& npm install
    echo 3. Asegúrate que MongoDB esté corriendo
    echo 4. cd backend ^&^& npm run dev
    echo 5. En otra terminal: cd frontend ^&^& npm run dev
) else (
    echo ⚠️  HAY ARCHIVOS FALTANTES. Revisa arriba.
)

endlocal
pause

exit /b 0

:verifyFile
if exist %1 (
    echo ✓ %1
    set /a pass+=1
) else (
    echo ✗ FALTA: %1
    set /a fail+=1
)
exit /b 0
