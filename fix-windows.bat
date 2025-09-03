@echo off
echo ✅ Corrigindo Tailwind CSS para Windows...
echo ========================================

echo 1. Parando processos Node.js...
taskkill /f /im node.exe /t 2>nul

echo 2. Aguardando 3 segundos...
timeout /t 3 /nobreak >nul

echo 3. Removendo pacotes problemáticos...
rmdir /s /q node_modules\lightningcss 2>nul
rmdir /s /q node_modules\@tailwindcss 2>nul
rmdir /s /q node_modules\.cache 2>nul

echo 4. Limpando cache npm...
npm cache clean --force

echo 5. Instalando Tailwind CSS v3 (estável)...
npm install

echo 6. Testando aplicação...
echo.
echo ✅ Correção concluída!
echo ✅ Execute: npm run dev
echo.
pause