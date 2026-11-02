#!/usr/bin/env bash

# Script de verificación del proyecto API TAX
# Verifica que todos los archivos necesarios existan

echo "🔍 VERIFICANDO ESTRUCTURA DEL PROYECTO API TAX"
echo "=============================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass=0
fail=0

# Función para verificar archivo
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((pass++))
    else
        echo -e "${RED}✗${NC} FALTA: $1"
        ((fail++))
    fi
}

# Función para verificar carpeta
check_dir() {
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        ((pass++))
    else
        echo -e "${RED}✗${NC} FALTA: $1/"
        ((fail++))
    fi
}

echo "📁 DIRECTORIOS:"
check_dir "backend"
check_dir "backend/src"
check_dir "backend/src/config"
check_dir "backend/src/controllers"
check_dir "backend/src/models"
check_dir "backend/src/routes"
check_dir "backend/src/middleware"
check_dir "backend/uploads"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/src/pages"
check_dir "frontend/src/services"
check_dir "frontend/src/stores"
check_dir "frontend/src/router"
check_dir "frontend/public"

echo ""
echo "📄 ARCHIVOS BACKEND:"
check_file "backend/package.json"
check_file "backend/.env"
check_file "backend/.env.example"
check_file "backend/.gitignore"
check_file "backend/src/index.js"
check_file "backend/src/config/database.js"
check_file "backend/src/controllers/gastoController.js"
check_file "backend/src/models/Gasto.js"
check_file "backend/src/routes/gastoRoutes.js"
check_file "backend/src/middleware/upload.js"
check_file "backend/README.md"

echo ""
echo "📄 ARCHIVOS FRONTEND:"
check_file "frontend/package.json"
check_file "frontend/.gitignore"
check_file "frontend/index.html"
check_file "frontend/vite.config.js"
check_file "frontend/src/main.js"
check_file "frontend/src/App.vue"
check_file "frontend/src/router/index.js"
check_file "frontend/src/services/gastoService.js"
check_file "frontend/src/stores/gastoStore.js"
check_file "frontend/src/pages/ListadoGastos.vue"
check_file "frontend/src/pages/NuevoGasto.vue"
check_file "frontend/src/pages/ResumenGastos.vue"
check_file "frontend/README.md"

echo ""
echo "📄 ARCHIVOS DE DOCUMENTACIÓN:"
check_file "README.md"
check_file "INSTALACION_RAPIDA.md"
check_file "ARQUITECTURA.md"
check_file "TESTING_API.md"
check_file "PROYECTO_COMPLETADO.md"
check_file "DIAGRAMA_ARQUITECTURA.md"

echo ""
echo "⚙️  ARCHIVOS DE CONFIGURACIÓN:"
check_file "docker-compose.yml"
check_file "install.sh"
check_file "install.bat"

echo ""
echo "=============================================="
echo -e "Verificación completada:"
echo -e "${GREEN}✓ Archivos correctamente ubicados: $pass${NC}"
if [ $fail -gt 0 ]; then
    echo -e "${RED}✗ Archivos faltantes: $fail${NC}"
else
    echo -e "${GREEN}✓ Sin archivos faltantes${NC}"
fi
echo ""

if [ $fail -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡EL PROYECTO ESTÁ COMPLETO Y LISTO!${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. cd backend && npm install"
    echo "2. cd ../frontend && npm install"
    echo "3. Asegúrate que MongoDB esté corriendo"
    echo "4. cd backend && npm run dev"
    echo "5. En otra terminal: cd frontend && npm run dev"
    exit 0
else
    echo -e "${RED}⚠️  HAY ARCHIVOS FALTANTES. Revisa arriba.${NC}"
    exit 1
fi
