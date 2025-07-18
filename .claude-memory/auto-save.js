#!/usr/bin/env node

const ClaudeMemory = require('./session-manager');
const fs = require('fs');
const path = require('path');

class AutoSaveMemory extends ClaudeMemory {
    constructor() {
        super();
        this.autoSaveInterval = null;
        this.sessionData = {
            tasks: [],
            context: '',
            files_modified: [],
            current_goal: '',
            progress: {},
            timestamp: new Date().toISOString()
        };
    }

    // Iniciar salvamento automático
    startAutoSave(intervalMs = 30000) { // 30 segundos
        this.autoSaveInterval = setInterval(() => {
            this.autoSaveSession();
        }, intervalMs);
        
        console.log(`🔄 Auto-save iniciado (${intervalMs/1000}s)`);
    }

    // Parar salvamento automático
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('⏹️ Auto-save parado');
        }
    }

    // Salvar sessão automaticamente
    autoSaveSession() {
        this.sessionData.timestamp = new Date().toISOString();
        this.saveSession(this.sessionData);
    }

    // Atualizar dados da sessão
    updateSession(key, value) {
        this.sessionData[key] = value;
        this.sessionData.timestamp = new Date().toISOString();
        
        // Salvar imediatamente para mudanças importantes
        const criticalKeys = ['current_goal', 'tasks'];
        if (criticalKeys.includes(key)) {
            this.autoSaveSession();
        }
    }

    // Adicionar tarefa
    addTask(task) {
        this.sessionData.tasks.push({
            id: Date.now(),
            task: task,
            status: 'pending',
            created: new Date().toISOString()
        });
        this.autoSaveSession();
    }

    // Atualizar tarefa
    updateTask(taskId, updates) {
        const taskIndex = this.sessionData.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.sessionData.tasks[taskIndex] = {
                ...this.sessionData.tasks[taskIndex],
                ...updates,
                updated: new Date().toISOString()
            };
            this.autoSaveSession();
        }
    }

    // Registrar arquivo modificado
    addModifiedFile(filePath) {
        if (!this.sessionData.files_modified.includes(filePath)) {
            this.sessionData.files_modified.push(filePath);
            this.autoSaveSession();
        }
    }

    // Criar snapshot da sessão atual
    createSnapshot(description) {
        const snapshot = {
            ...this.sessionData,
            description: description,
            snapshot_time: new Date().toISOString()
        };
        
        const snapshotFile = path.join(this.memoryDir, `snapshot-${Date.now()}.json`);
        fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));
        
        console.log(`📸 Snapshot criado: ${description}`);
        return snapshotFile;
    }

    // Restaurar sessão com contexto completo
    restoreSessionWithContext() {
        const session = this.restoreSession();
        if (session) {
            this.sessionData = session;
            
            console.log(`
🔄 Sessão Restaurada:
   📅 Data: ${session.timestamp}
   🎯 Objetivo: ${session.current_goal || 'Não definido'}
   📝 Tarefas: ${session.tasks?.length || 0}
   📁 Arquivos modificados: ${session.files_modified?.length || 0}
            `);
            
            // Mostrar tarefas pendentes
            if (session.tasks?.length > 0) {
                console.log('\n📋 Tarefas da sessão anterior:');
                session.tasks.forEach((task, index) => {
                    const status = task.status === 'completed' ? '✅' : '⏳';
                    console.log(`   ${status} ${task.task}`);
                });
            }
            
            return session;
        }
        return null;
    }

    // Salvar contexto específico com timestamp
    saveTimestampedContext(type, data) {
        const context = this.getContext(type) || { history: [] };
        context.history.push({
            timestamp: new Date().toISOString(),
            data: data
        });
        
        // Manter apenas últimas 10 entradas
        if (context.history.length > 10) {
            context.history = context.history.slice(-10);
        }
        
        this.saveContext(type, context);
    }

    // Cleanup de arquivos antigos
    cleanupOldFiles(daysOld = 30) {
        const files = fs.readdirSync(this.memoryDir);
        const cutoffDate = new Date(Date.now() - (daysOld * 24 * 60 * 60 * 1000));
        
        files.forEach(file => {
            const filePath = path.join(this.memoryDir, file);
            const stats = fs.statSync(filePath);
            
            if (stats.mtime < cutoffDate && file.startsWith('snapshot-')) {
                fs.unlinkSync(filePath);
                console.log(`🧹 Arquivo antigo removido: ${file}`);
            }
        });
    }
}

module.exports = AutoSaveMemory;

// CLI Usage
if (require.main === module) {
    const memory = new AutoSaveMemory();
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            memory.startAutoSave();
            // Manter processo vivo
            process.stdin.resume();
            break;
        case 'restore':
            memory.restoreSessionWithContext();
            break;
        case 'snapshot':
            const description = process.argv[3] || 'Manual snapshot';
            memory.createSnapshot(description);
            break;
        case 'cleanup':
            const days = parseInt(process.argv[3]) || 30;
            memory.cleanupOldFiles(days);
            break;
        default:
            console.log(`
🧠 Claude Auto-Save Memory

Comandos disponíveis:
  node auto-save.js start     - Iniciar auto-save
  node auto-save.js restore   - Restaurar sessão com contexto
  node auto-save.js snapshot "descrição" - Criar snapshot manual
  node auto-save.js cleanup [dias] - Limpar arquivos antigos
            `);
    }
}