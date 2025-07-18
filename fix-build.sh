#!/bin/bash

echo "🧹 Limpando cache completamente..."

# Remove todos os caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf .turbo
rm -rf node_modules/.next-*

echo "📦 Reinstalando dependências..."
npm install

echo "🚀 Iniciando servidor de desenvolvimento..."
npm run dev