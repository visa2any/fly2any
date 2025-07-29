#!/bin/bash

# 🎯 SCRIPT DE CONVERSÃO PARA TAILWIND CSS PURO
# Converte classes CSS customizadas para Tailwind CSS nativo

echo "🚀 Iniciando conversão para Tailwind CSS puro..."

# Encontrar todos os arquivos .tsx
find /mnt/d/Users/vilma/fly2any/src -name "*.tsx" -type f | while read file; do
  echo "📝 Processando: $file"
  
  # Admin Layout Classes
  sed -i 's/admin-app/min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100/g' "$file"
  sed -i 's/admin-sidebar/fixed top-0 left-0 h-screen w-16 bg-white\/95 backdrop-blur-lg border-r border-slate-200 transition-all duration-300/g' "$file"
  sed -i 's/admin-main/flex-1 ml-16 transition-all duration-300 flex flex-col/g' "$file"
  sed -i 's/admin-header/h-16 bg-white\/95 backdrop-blur-lg border-b border-slate-200 flex items-center justify-between px-6/g' "$file"
  sed -i 's/admin-content/flex-1 p-6 overflow-y-auto/g' "$file"
  
  # Admin Card Classes  
  sed -i 's/admin-card-header/px-6 py-4 border-b border-slate-200/g' "$file"
  sed -i 's/admin-card-title/text-lg font-semibold text-slate-900/g' "$file"
  sed -i 's/admin-card-description/text-sm text-slate-600/g' "$file"
  
  # Admin Stats Classes
  sed -i 's/admin-stats-card/glass-card rounded-xl p-6 text-center shadow-card/g' "$file"
  sed -i 's/admin-stats-value/text-3xl font-bold text-slate-900 mb-2/g' "$file"
  sed -i 's/admin-stats-label/text-sm font-medium text-slate-600/g' "$file"
  
  # Admin Button Classes
  sed -i 's/admin-btn/inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200/g' "$file"
  sed -i 's/admin-btn-primary/bg-gradient-primary text-white shadow-button hover:shadow-lg hover:-translate-y-0.5/g' "$file"
  sed -i 's/admin-btn-secondary/bg-slate-100 text-slate-700 border border-slate-200 hover:bg-white hover:border-slate-400/g' "$file"
  
  # Admin Badge Classes
  sed -i 's/admin-badge/inline-flex items-center px-3 py-1 text-xs font-medium rounded-full/g' "$file"
  sed -i 's/admin-badge-success/bg-green-100 text-green-700 border border-green-200/g' "$file"
  sed -i 's/admin-badge-warning/bg-yellow-100 text-yellow-700 border border-yellow-200/g' "$file"
  sed -i 's/admin-badge-danger/bg-red-100 text-red-700 border border-red-200/g' "$file"
  sed -i 's/admin-badge-info/bg-blue-100 text-blue-700 border border-blue-200/g' "$file"
  sed -i 's/admin-badge-neutral/bg-slate-100 text-slate-700 border border-slate-200/g' "$file"
  
  # Admin Form Classes
  sed -i 's/admin-label/block text-sm font-medium text-slate-700 mb-2/g' "$file"
  
  # Admin Text Classes
  sed -i 's/admin-text-primary/text-slate-900/g' "$file"
  sed -i 's/admin-text-secondary/text-slate-600/g' "$file"
  sed -i 's/admin-text-muted/text-slate-500/g' "$file"
  sed -i 's/admin-text-inverse/text-white/g' "$file"
  
  # Admin Background Classes
  sed -i 's/admin-bg-primary/bg-gradient-to-br from-slate-50 to-slate-100/g' "$file"
  sed -i 's/admin-bg-secondary/bg-slate-100/g' "$file"
  sed -i 's/admin-bg-card/glass-card/g' "$file"
  
  # Admin Border/Color Classes
  sed -i 's/admin-border-color/border-slate-200/g' "$file"
  sed -i 's/admin-accent-primary/bg-gradient-primary/g' "$file"
  sed -i 's/admin-accent-secondary/bg-gradient-secondary/g' "$file"
  sed -i 's/admin-accent-success/bg-gradient-success/g' "$file"
  sed -i 's/admin-accent-warning/bg-gradient-warning/g' "$file"
  sed -i 's/admin-accent-danger/bg-gradient-danger/g' "$file"
  
  # Generic Button Classes
  sed -i 's/btn-primary/bg-gradient-primary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-button hover:-translate-y-0.5/g' "$file"
  sed -i 's/btn-secondary/bg-slate-100 text-slate-700 border border-slate-200 px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:bg-white hover:border-slate-300/g' "$file"
  
  # Generic Badge Classes  
  sed -i 's/badge-success/bg-green-100 text-green-700 border border-green-200/g' "$file"
  sed -i 's/badge-warning/bg-yellow-100 text-yellow-700 border border-yellow-200/g' "$file"
  sed -i 's/badge-danger/bg-red-100 text-red-700 border border-red-200/g' "$file"
  sed -i 's/badge-info/bg-blue-100 text-blue-700 border border-blue-200/g' "$file"
  sed -i 's/badge-neutral/bg-slate-100 text-slate-700 border border-slate-200/g' "$file"
  
  # Generic Card Classes
  sed -i 's/bg-card/glass-card/g' "$file"
  sed -i 's/border-card/border border-slate-200/g' "$file"
  sed -i 's/shadow-card/shadow-lg shadow-gray-200\/50/g' "$file"
  
done

echo "✅ Conversão concluída!"
echo "🔍 Verificando classes restantes..."

# Contar classes restantes
remaining=$(grep -r "admin-\|bg-card\|btn-primary" /mnt/d/Users/vilma/fly2any/src --exclude-dir=node_modules | wc -l)
echo "📊 Classes customizadas restantes: $remaining"

if [ $remaining -eq 0 ]; then
  echo "🎉 Conversão 100% completa! Todos os estilos agora usam Tailwind CSS puro."
else
  echo "⚠️  Ainda restam $remaining classes para conversão manual."
fi