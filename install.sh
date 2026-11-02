#!/usr/bin/env bash

echo "🚀 Iniciando instalación de API TAX..."

# Verificar que Node.js esté instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor, instálalo desde https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js instalado: $(node -v)"
echo "✓ npm instalado: $(npm -v)"

# Instalar backend
echo ""
echo "📦 Instalando Backend..."
cd backend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Backend instalado exitosamente"
else
    echo "❌ Error instalando backend"
    exit 1
fi

# Instalar frontend
echo ""
echo "📦 Instalando Frontend..."
cd ../frontend
npm install
if [ $? -eq 0 ]; then
    echo "✓ Frontend instalado exitosamente"
else
    echo "❌ Error instalando frontend"
    exit 1
fi

cd ..

echo ""
echo "✅ Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura las variables de entorno en backend/.env"
echo "2. Asegúrate que MongoDB esté corriendo"
echo "3. En una terminal: cd backend && npm run dev"
echo "4. En otra terminal: cd frontend && npm run dev"
echo ""
echo "🌐 Accede a http://localhost:5173"
