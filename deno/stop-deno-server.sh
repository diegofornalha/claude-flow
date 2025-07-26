#!/bin/bash

echo "🛑 Parando servidor Deno..."
echo "=========================="

# Função para parar processos Deno
stop_deno_processes() {
    echo "🔍 Procurando processos Deno..."
    
    # Encontrar processos Deno rodando deno-server.ts
    DENO_PIDS=$(ps aux | grep "deno.*serve.*deno-server.ts" | grep -v grep | awk '{print $2}')
    
    if [ -z "$DENO_PIDS" ]; then
        echo "ℹ️  Nenhum processo Deno encontrado rodando deno-server.ts"
    else
        echo "📋 Processos Deno encontrados:"
        ps aux | grep "deno.*serve.*deno-server.ts" | grep -v grep
        echo ""
        
        for PID in $DENO_PIDS; do
            echo "🛑 Parando processo Deno PID: $PID"
            kill $PID
            
            # Aguardar um pouco e verificar se parou
            sleep 1
            if kill -0 $PID 2>/dev/null; then
                echo "⚠️  Processo $PID ainda ativo, forçando parada..."
                kill -9 $PID
            fi
            echo "✅ Processo $PID parado"
        done
    fi
}

# Função para parar processos usando portas específicas
stop_port_processes() {
    local port=$1
    echo "🔍 Verificando porta $port..."
    
    PORT_PID=$(lsof -ti:$port 2>/dev/null)
    
    if [ -z "$PORT_PID" ]; then
        echo "ℹ️  Porta $port livre"
    else
        echo "🛑 Liberando porta $port (PID: $PORT_PID)"
        kill $PORT_PID 2>/dev/null
        sleep 1
        
        # Verificar se ainda está ativo
        if lsof -ti:$port > /dev/null 2>&1; then
            echo "⚠️  Forçando liberação da porta $port..."
            kill -9 $(lsof -ti:$port) 2>/dev/null
        fi
        echo "✅ Porta $port liberada"
    fi
}

# Parar processos Deno
stop_deno_processes

# Liberar portas comuns
echo ""
echo "🔍 Verificando portas..."
stop_port_processes 8000
stop_port_processes 8080
stop_port_processes 3000

echo ""
echo "📊 Status final:"
echo "   Processos Deno ativos: $(ps aux | grep "deno.*serve" | grep -v grep | wc -l | tr -d ' ')"
echo "   Porta 8000: $(lsof -ti:8000 > /dev/null 2>&1 && echo 'ocupada' || echo 'livre')"
echo "   Porta 8080: $(lsof -ti:8080 > /dev/null 2>&1 && echo 'ocupada' || echo 'livre')"

echo ""
echo "✅ Limpeza concluída!"