#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ClaudeMemory {
    constructor() {
        this.memoryDir = path.join(process.cwd(), '.claude-memory');
        this.sessionFile = path.join(this.memoryDir, 'current-session.json');
        this.historyFile = path.join(this.memoryDir, 'session-history.json');
        this.contextFile = path.join(this.memoryDir, 'context-data.json');
        
        this.ensureDirectoryExists();
    }

    ensureDirectoryExists() {
        if (!fs.existsSync(this.memoryDir)) {
            fs.mkdirSync(this.memoryDir, { recursive: true });
        }
    }

    // Salvar contexto da sessão atual
    saveSession(sessionData) {
        const timestamp = new Date().toISOString();
        const session = {
            timestamp,
            id: this.generateSessionId(),
            ...sessionData
        };

        fs.writeFileSync(this.sessionFile, JSON.stringify(session, null, 2));
        this.addToHistory(session);
        
        console.log(`💾 Sessão salva em: ${timestamp}`);
        return session.id;
    }

    // Recuperar última sessão
    restoreSession() {
        if (fs.existsSync(this.sessionFile)) {
            try {
                const session = JSON.parse(fs.readFileSync(this.sessionFile, 'utf8'));
                console.log(`🔄 Sessão restaurada de: ${session.timestamp}`);
                return session;
            } catch (error) {
                console.error('❌ Erro ao restaurar sessão:', error.message);
                return null;
            }
        }
        return null;
    }

    // Salvar contexto específico (tarefas, códigos, etc.)
    saveContext(type, data) {
        let contexts = {};
        
        if (fs.existsSync(this.contextFile)) {
            contexts = JSON.parse(fs.readFileSync(this.contextFile, 'utf8'));
        }

        contexts[type] = {
            timestamp: new Date().toISOString(),
            data: data
        };

        fs.writeFileSync(this.contextFile, JSON.stringify(contexts, null, 2));
        console.log(`📝 Contexto '${type}' salvo`);
    }

    // Recuperar contexto específico
    getContext(type) {
        if (fs.existsSync(this.contextFile)) {
            const contexts = JSON.parse(fs.readFileSync(this.contextFile, 'utf8'));
            return contexts[type] || null;
        }
        return null;
    }

    // Adicionar ao histórico
    addToHistory(session) {
        let history = [];
        
        if (fs.existsSync(this.historyFile)) {
            history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
        }

        history.unshift(session);
        
        // Manter apenas últimas 50 sessões
        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
    }

    // Buscar sessões anteriores
    searchSessions(query) {
        if (!fs.existsSync(this.historyFile)) return [];
        
        const history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
        return history.filter(session => 
            JSON.stringify(session).toLowerCase().includes(query.toLowerCase())
        );
    }

    // Limpar memória
    clearMemory() {
        const files = [this.sessionFile, this.historyFile, this.contextFile];
        files.forEach(file => {
            if (fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
        });
        console.log('🧹 Memória limpa');
    }

    // Gerar ID único para sessão
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Status da memória
    getMemoryStatus() {
        const status = {
            hasCurrentSession: fs.existsSync(this.sessionFile),
            hasHistory: fs.existsSync(this.historyFile),
            hasContext: fs.existsSync(this.contextFile),
            memorySize: this.getDirectorySize()
        };

        if (status.hasHistory) {
            const history = JSON.parse(fs.readFileSync(this.historyFile, 'utf8'));
            status.sessionCount = history.length;
            status.lastSession = history[0]?.timestamp;
        }

        return status;
    }

    getDirectorySize() {
        let size = 0;
        try {
            const files = fs.readdirSync(this.memoryDir);
            files.forEach(file => {
                const stats = fs.statSync(path.join(this.memoryDir, file));
                size += stats.size;
            });
        } catch (error) {
            // Directory doesn't exist or is empty
        }
        return size;
    }
}

module.exports = ClaudeMemory;

// CLI Usage
if (require.main === module) {
    const memory = new ClaudeMemory();
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            console.log('📊 Status da Memória:', memory.getMemoryStatus());
            break;
        case 'restore':
            const session = memory.restoreSession();
            if (session) {
                console.log('🔄 Sessão restaurada:', session);
            } else {
                console.log('❌ Nenhuma sessão encontrada');
            }
            break;
        case 'clear':
            memory.clearMemory();
            break;
        case 'search':
            const query = process.argv[3];
            if (query) {
                const results = memory.searchSessions(query);
                console.log(`🔍 Encontradas ${results.length} sessões para: "${query}"`);
                results.forEach(session => {
                    console.log(`  - ${session.timestamp}: ${session.task || 'Sem título'}`);
                });
            } else {
                console.log('❌ Forneça um termo de busca');
            }
            break;
        default:
            console.log(`
🧠 Claude Memory System

Comandos disponíveis:
  node session-manager.js status   - Ver status da memória
  node session-manager.js restore  - Restaurar última sessão
  node session-manager.js clear    - Limpar toda memória
  node session-manager.js search <termo> - Buscar sessões
            `);
    }
}