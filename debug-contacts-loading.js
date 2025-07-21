const fs = require('fs');
const path = require('path');

async function debugContactsLoading() {
    console.log('=== DEBUG: CARREGAMENTO DE CONTATOS ===\n');
    
    try {
        // Simular a lógica da API
        console.log('1. Verificando working directory');
        console.log('process.cwd():', process.cwd());
        
        const contactsFilePath = path.join(process.cwd(), 'contacts-imported.json');
        console.log('Caminho esperado:', contactsFilePath);
        
        console.log('\n2. Verificando se arquivo existe');
        const exists = fs.existsSync(contactsFilePath);
        console.log('Arquivo existe:', exists);
        
        if (exists) {
            console.log('\n3. Lendo arquivo');
            const stats = fs.statSync(contactsFilePath);
            console.log('Tamanho do arquivo:', stats.size, 'bytes');
            console.log('Última modificação:', stats.mtime);
            
            const data = fs.readFileSync(contactsFilePath, 'utf8');
            console.log('Primeiros 200 caracteres:', data.substring(0, 200));
            
            console.log('\n4. Parseando JSON');
            const fileContacts = JSON.parse(data);
            
            console.log('Tipo do dado:', typeof fileContacts);
            console.log('É array:', Array.isArray(fileContacts));
            console.log('Length:', fileContacts.length);
            
            if (fileContacts.length > 0) {
                console.log('\n5. Primeiro contato:');
                console.log(JSON.stringify(fileContacts[0], null, 2));
                
                console.log('\n6. Estrutura dos contatos:');
                const firstContact = fileContacts[0];
                console.log('Tem ID:', !!firstContact.id);
                console.log('Tem email:', !!firstContact.email);
                console.log('Tem nome:', !!firstContact.nome);
                console.log('Tem emailStatus:', !!firstContact.emailStatus);
                
                console.log('\n7. Contagem por status:');
                const statusCount = {};
                fileContacts.forEach(contact => {
                    statusCount[contact.emailStatus] = (statusCount[contact.emailStatus] || 0) + 1;
                });
                console.log('Status counts:', statusCount);
            }
        } else {
            console.log('❌ Arquivo não encontrado no caminho especificado');
            
            // Procurar em outros locais possíveis
            console.log('\n3. Procurando arquivo em outros locais');
            const possiblePaths = [
                './contacts-imported.json',
                '../contacts-imported.json',
                path.join(__dirname, 'contacts-imported.json'),
                path.join(__dirname, '..', 'contacts-imported.json')
            ];
            
            for (const testPath of possiblePaths) {
                const resolved = path.resolve(testPath);
                console.log(`Testando: ${resolved} -> ${fs.existsSync(resolved) ? '✅' : '❌'}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Erro durante debug:', error);
        console.error('Stack:', error.stack);
    }
}

// Executar debug
debugContactsLoading().catch(console.error);