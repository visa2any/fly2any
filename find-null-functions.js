// Script para encontrar funções que retornam null
const fs = require('fs');
const path = require('path');

function searchInFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Procura por padrões específicos que podem causar o erro
      if (line.includes('() => null') || 
          line.includes('()=>null') ||
          line.includes('function() { return null }') ||
          line.includes('= () => null') ||
          line.includes(': () => null')) {
        console.log(`FOUND: ${filePath}:${i + 1} - ${line.trim()}`);
      }
    }
  } catch (err) {
    // Ignora erros de leitura
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      searchInFile(filePath);
    }
  }
}

console.log('Procurando por funções que retornam null...');
walkDir('./src');
console.log('Busca concluída!');