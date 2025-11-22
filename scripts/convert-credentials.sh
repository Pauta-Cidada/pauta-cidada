#!/bin/bash
# Script para converter credentials.json para formato .env
# Uso: ./convert-credentials.sh credentials.json

if [ -z "$1" ]; then
    echo "Uso: $0 <path-to-credentials.json>"
    echo "Exemplo: $0 backend-python/credentials.json"
    exit 1
fi

CREDS_FILE="$1"

if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Arquivo não encontrado: $CREDS_FILE"
    exit 1
fi

echo "🔄 Convertendo $CREDS_FILE para formato .env..."
echo ""

# Verifica se jq está instalado
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq não está instalado. Tentando conversão manual..."
    JSON_INLINE=$(cat "$CREDS_FILE" | tr -d '\n' | tr -d ' ')
else
    JSON_INLINE=$(jq -c '.' "$CREDS_FILE")
fi

# Escapa aspas simples
JSON_ESCAPED=$(echo "$JSON_INLINE" | sed "s/'/\\\\'/g")

echo "✅ Conversão completa! Adicione esta linha ao seu .env:"
echo ""
echo "GOOGLE_APPLICATION_CREDENTIALS_JSON='$JSON_ESCAPED'"
echo ""
echo "📋 Ou copie apenas o JSON (sem aspas):"
echo "$JSON_INLINE"
