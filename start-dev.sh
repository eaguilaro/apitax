#!/usr/bin/env bash

# 🚀 Script de inicio rápido para desarrollo

echo "🚀 INICIANDO PROYECTO API TAX EN MODO DESARROLLO"
echo "=============================================="
echo ""

# Verificar si tenemos dos terminales disponibles
echo "Este script abrirá dos ventanas de terminal:"
echo "1. Backend (Express en puerto 3001)"
echo "2. Frontend (Vite en puerto 5173)"
echo ""

# Función para iniciar backend
start_backend() {
    echo "📦 Iniciando Backend..."
    cd backend
    npm run dev
}

# Función para iniciar frontend
start_frontend() {
    echo "🎨 Iniciando Frontend..."
    cd frontend
    npm run dev
}

# En Linux/Mac, abrir en tmux si está disponible
if command -v tmux &> /dev/null; then
    echo "📝 Usando tmux para administración de sesiones..."
    
    # Crear nueva sesión
    tmux new-session -d -s apitax
    
    # Backend en primera ventana
    tmux send-keys -t apitax "cd backend && npm run dev" Enter
    
    # Frontend en segunda ventana
    tmux new-window -t apitax
    tmux send-keys -t apitax "cd frontend && npm run dev" Enter
    
    echo ""
    echo "✅ Sessiones iniciadas en tmux:"
    echo "   Backend: tmux send-keys -t apitax:0"
    echo "   Frontend: tmux send-keys -t apitax:1"
    echo ""
    echo "Attacher a tmux:"
    echo "   tmux attach -t apitax"
else
    echo "⚠️  Para iniciar en dos terminales:"
    echo ""
    echo "Terminal 1:"
    echo "  cd backend && npm run dev"
    echo ""
    echo "Terminal 2:"
    echo "  cd frontend && npm run dev"
fi

echo ""
echo "🌐 Accesos:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo "   APIs:     http://localhost:3001/api/gastos"
echo ""
echo "Presiona Ctrl+C para detener"
