# 🚀 Baileys WhatsApp Service - Railway Deployment

## 📋 Passo a Passo para Deploy no Railway

### 1️⃣ Criar Novo Projeto no Railway

1. Acesse: https://railway.app
2. Clique em **"New Project"**
3. Escolha **"Empty Project"**
4. Nome: `baileys-whatsapp`

### 2️⃣ Conectar ao GitHub (Opcional)

1. **Fork** este repositório ou crie um novo repo
2. Faça upload dos arquivos desta pasta (`railway-baileys-setup/`)
3. No Railway, clique **"Connect Repo"**

### 3️⃣ Deploy Manual (Mais Rápido)

1. No Railway, clique **"Deploy from GitHub"**
2. Ou use **"Deploy from Local Directory"**
3. Faça upload dos arquivos:
   - `package.json`
   - `server.js`
   - `README.md`

### 4️⃣ Configurar Variáveis de Ambiente

No Railway, vá em **Settings → Environment Variables**:

```bash
# Porta (Railway define automaticamente)
PORT=3000

# Node environment
NODE_ENV=production
```

### 5️⃣ Deploy e Teste

1. Railway fará o deploy automaticamente
2. Após deploy, você receberá uma URL como:
   `https://baileys-whatsapp-production-xxxx.up.railway.app`

3. **Teste a API:**
   ```bash
   curl https://sua-url-railway.up.railway.app/health
   ```

## 🧪 Endpoints Disponíveis

### 📊 Health Check
```bash
GET /health
```

### 🚀 Inicializar WhatsApp
```bash
POST /api/whatsapp/init
```

### 📱 Status do WhatsApp
```bash
GET /api/whatsapp/status
```

### 📤 Enviar Mensagem
```bash
POST /api/whatsapp/send
Content-Type: application/json

{
  "phone": "+5511999999999",
  "message": "Olá! Esta é uma mensagem de teste."
}
```

### 🔌 Desconectar
```bash
POST /api/whatsapp/disconnect
```

## 🔧 Atualizar Fly2Any para Usar Railway

Após o deploy, atualize a URL no seu projeto principal:

1. **No arquivo `.env.local`:**
   ```bash
   WHATSAPP_RAILWAY_URL=https://sua-url-railway.up.railway.app
   ```

2. **Teste a integração:**
   ```bash
   curl -X POST https://www.fly2any.com/api/whatsapp/init
   ```

## 📝 Logs e Debug

1. **Ver logs do Railway:**
   - No dashboard Railway → **"View Logs"**

2. **Teste local:**
   ```bash
   npm install
   npm start
   ```

## 🚨 Troubleshooting

### Problema: Deploy falha
- ✅ Verifique se `package.json` está correto
- ✅ Node.js versão >= 18.0.0

### Problema: QR code não gera
- ✅ Verifique logs do Railway
- ✅ Teste endpoint `/health` primeiro
- ✅ Aguarde até 30 segundos após `/api/whatsapp/init`

### Problema: Conexão perde
- ✅ Normal - o serviço reconecta automaticamente
- ✅ Verifique se Railway não está hibernando o serviço

## 🎯 Próximos Passos

1. **Deploy no Railway** ✅
2. **Testar QR code generation** ✅
3. **Atualizar Fly2Any** para usar nova URL ✅
4. **Conectar WhatsApp** escaneando QR ✅
5. **Testar envio de mensagens** ✅

---

**🎉 Depois do deploy, você terá WhatsApp funcionando 100%!**