#!/usr/bin/env node

const AutoSaveMemory = require('../auto-save');
const path = require('path');

class MemoryHook {
    constructor() {
        this.memory = new AutoSaveMemory();
        this.isActive = false;
    }

    // Inicializar hook de memória
    init() {
        this.memory.startAutoSave(30000); // 30 segundos
        this.isActive = true;
        
        // Tentar restaurar sessão anterior
        const session = this.memory.restoreSessionWithContext();
        if (session) {
            console.log('🔄 Sessão anterior restaurada automaticamente');
        }
        
        // Registrar handlers para sinais do sistema
        process.on('SIGINT', () => this.shutdown());
        process.on('SIGTERM', () => this.shutdown());
        process.on('beforeExit', () => this.shutdown());
        
        return this;
    }

    // Salvar contexto da tarefa atual
    saveTaskContext(task, progress = {}) {
        this.memory.updateSession('current_goal', task);
        this.memory.updateSession('progress', progress);
        
        console.log(`💾 Contexto salvo: ${task}`);
    }

    // Adicionar tarefa com auto-save
    addTask(taskDescription, priority = 'medium') {
        const task = {
            description: taskDescription,
            priority: priority,
            status: 'pending',
            created: new Date().toISOString()
        };
        
        this.memory.addTask(task);
        console.log(`📝 Tarefa adicionada: ${taskDescription}`);
    }

    // Atualizar status da tarefa
    updateTaskStatus(taskId, status, notes = '') {
        this.memory.updateTask(taskId, { 
            status: status,
            notes: notes,
            updated: new Date().toISOString()
        });
        
        console.log(`✅ Tarefa atualizada: ${status}`);
    }

    // Registrar arquivo modificado
    trackFileModification(filePath) {
        this.memory.addModifiedFile(filePath);
        console.log(`📁 Arquivo rastreado: ${filePath}`);
    }

    // Criar snapshot importante
    createMilestoneSnapshot(description) {
        const snapshotFile = this.memory.createSnapshot(description);
        console.log(`📸 Milestone criado: ${description}`);
        return snapshotFile;
    }

    // Shutdown graceful
    shutdown() {
        if (this.isActive) {
            console.log('\n🔄 Salvando estado final...');
            this.memory.autoSaveSession();
            this.memory.stopAutoSave();
            this.isActive = false;
            console.log('💾 Memória salva com sucesso');
        }
    }

    // Obter resumo da sessão atual
    getSessionSummary() {
        const session = this.memory.sessionData;
        return {
            goal: session.current_goal,
            tasks: session.tasks?.length || 0,
            files_modified: session.files_modified?.length || 0,
            progress: session.progress,
            timestamp: session.timestamp
        };
    }
}

module.exports = MemoryHook;

// CLI Usage
if (require.main === module) {
    const hook = new MemoryHook();
    const command = process.argv[2];
    
    switch (command) {
        case 'init':
            hook.init();
            console.log('🧠 Memory Hook iniciado');
            // Manter processo vivo
            process.stdin.resume();
            break;
        case 'add-task':
            const task = process.argv[3];
            if (task) {
                hook.addTask(task);
            } else {
                console.log('❌ Forneça uma descrição da tarefa');
            }
            break;
        case 'snapshot':
            const description = process.argv[3] || 'Manual snapshot';
            hook.createMilestoneSnapshot(description);
            break;
        case 'summary':
            console.log('📊 Resumo da Sessão:', hook.getSessionSummary());
            break;
        default:
            console.log(`
🧠 Claude Memory Hook

Comandos disponíveis:
  node memory-hook.js init           - Inicializar hook
  node memory-hook.js add-task "desc" - Adicionar tarefa
  node memory-hook.js snapshot "desc" - Criar snapshot
  node memory-hook.js summary        - Ver resumo da sessão
            `);
    }
}