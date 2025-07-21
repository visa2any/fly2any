// Fix rápido para carregar contatos
const fs = require('fs');

// Ler contatos do CSV e salvar em formato correto
const csvContent = fs.readFileSync('./contacts-emails-final-2025-07-12.csv', 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

const contacts = [];
for (let i = 1; i < Math.min(lines.length, 501); i++) { // Primeiros 500
  const parts = lines[i].split(',');
  if (parts.length >= 2) {
    const nome = parts[0].replace(/"/g, '').trim();
    const email = parts[1].replace(/"/g, '').trim();
    
    if (email.includes('@')) {
      contacts.push({
        id: `contact_${i}`,
        nome,
        email,
        telefone: parts[2] ? parts[2].replace(/"/g, '').trim() : '',
        segmento: 'brasileiros-eua',
        tags: [],
        createdAt: new Date().toISOString(),
        emailStatus: 'not_sent',
        lastEmailSent: null,
        unsubscribed: false
      });
    }
  }
}

fs.writeFileSync('./contacts-imported.json', JSON.stringify(contacts, null, 2));
console.log(`✅ ${contacts.length} contatos salvos para email marketing!`);
console.log('Primeiros 3:');
contacts.slice(0, 3).forEach(c => console.log(`- ${c.nome} (${c.email})`));