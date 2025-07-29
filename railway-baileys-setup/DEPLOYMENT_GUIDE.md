# 🚀 Complete Railway Deployment Guide - Baileys WhatsApp Service

## 📋 Quick Deploy (RECOMMENDED)

### Option 1: Automated Deployment Script
```bash
cd railway-baileys-setup
./deploy.sh
```

### Option 2: Manual Railway CLI Commands
```bash
# 1. Login to Railway
railway login

# 2. Initialize project
railway init

# 3. Deploy
railway up

# 4. Get URL
railway domain
```

## 🔧 Manual Railway Dashboard Deployment

### Step 1: Create New Project
1. Go to [Railway.app](https://railway.app)
2. Click **"New Project"**
3. Choose **"Empty Project"**
4. Name: `baileys-whatsapp-service`

### Step 2: Deploy from GitHub
1. **Option A - Connect GitHub Repo:**
   - Fork this repository or create new repo
   - Upload files from `railway-baileys-setup/` folder
   - In Railway: **"Connect Repo"** → Select your repo

2. **Option B - Upload Files Directly:**
   - Click **"Deploy from GitHub"** → **"Deploy from Local Directory"**
   - Upload these files:
     - `package.json`
     - `server.js` 
     - `railway.json`
     - `.env`
     - `README.md`

### Step 3: Environment Variables (IMPORTANT!)
In Railway Dashboard → **Settings → Environment Variables**, add:

```bash
NODE_ENV=production
PORT=3000
WHATSAPP_SESSION_NAME=fly2any-baileys
WHATSAPP_BROWSER_NAME=Fly2Any-Railway
WHATSAPP_BROWSER_VERSION=1.0.0
CONNECTION_TIMEOUT=60000
QUERY_TIMEOUT=60000
KEEPALIVE_INTERVAL=30000
LOG_LEVEL=info
```

### Step 4: Domain Configuration
1. Go to **Settings → Networking**
2. Click **"Generate Domain"**
3. Your URL will be: `https://baileys-whatsapp-production-xxxx.up.railway.app`

## 🧪 Testing Your Deployment

### 1. Health Check
```bash
curl https://your-railway-url.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "baileys-whatsapp",
  "uptime": 123.45,
  "timestamp": "2025-07-26T..."
}
```

### 2. Initialize WhatsApp
```bash
curl -X POST https://your-railway-url.up.railway.app/api/whatsapp/init \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "WhatsApp initialized successfully",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "isConnected": false
}
```

### 3. Check Status
```bash
curl https://your-railway-url.up.railway.app/api/whatsapp/status
```

### 4. Send Test Message (After QR Scan)
```bash
curl -X POST https://your-railway-url.up.railway.app/api/whatsapp/send \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999",
    "message": "Hello from Railway! 🚀"
  }'
```

## 📱 WhatsApp Integration Steps

### Step 1: Generate QR Code
1. Call `/api/whatsapp/init` endpoint
2. Extract the `qrCode` from response (base64 image)
3. Display QR code in your application

### Step 2: Scan QR Code
1. Open WhatsApp on your phone
2. Go to **Settings → Linked Devices**
3. Tap **"Link a Device"**
4. Scan the QR code from your application

### Step 3: Verify Connection
1. Call `/api/whatsapp/status` endpoint
2. Check `connected: true` in response
3. Service is ready to send messages!

## 🔧 Integration with Fly2Any

### Update Environment Variables
Add to your `.env.local`:
```bash
WHATSAPP_RAILWAY_URL=https://your-railway-url.up.railway.app
```

### Test Integration
```bash
# Test from your main application
curl -X POST https://www.fly2any.com/api/whatsapp/init
```

## 🚨 Troubleshooting

### ❌ Deployment Fails
**Solution:**
- Check `package.json` is valid JSON
- Ensure Node.js version >= 18.0.0 in `engines`
- Verify all files are uploaded correctly

### ❌ QR Code Not Generated
**Solutions:**
1. Check Railway logs: Dashboard → **"View Logs"**
2. Verify `/health` endpoint works first
3. Wait up to 30 seconds after calling `/init`

### ❌ Connection Drops
**Solutions:**
- This is normal - service auto-reconnects
- Check Railway doesn't hibernate service (Paid plan recommended)
- Monitor with `/status` endpoint

### ❌ Cannot Send Messages
**Solutions:**
1. Verify WhatsApp is connected: `/status` → `connected: true`
2. Check phone number format: `+5511999999999`
3. Check Railway logs for errors

## 📊 Monitoring Your Service

### Railway Dashboard
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** Deploy history and status

### API Monitoring
```bash
# Simple health check script
while true; do
  curl -s https://your-railway-url.up.railway.app/health | jq '.status'
  sleep 30
done
```

## 💰 Railway Pricing

### Hobby Plan (Free)
- ✅ 500 hours/month
- ✅ Perfect for testing
- ⚠️ May hibernate after inactivity

### Pro Plan ($5/month)
- ✅ Always-on service
- ✅ Better for production
- ✅ No hibernation

## 🎯 Next Steps After Deployment

1. ✅ **Test all endpoints** with curl commands above
2. ✅ **Generate and scan QR code** to connect WhatsApp
3. ✅ **Send test message** to verify functionality
4. ✅ **Update Fly2Any** to use Railway URL
5. ✅ **Monitor service** with Railway dashboard
6. ✅ **Set up alerts** for service health

## 🔗 Useful Commands

```bash
# Check Railway CLI status
railway whoami

# View real-time logs
railway logs

# Open Railway dashboard
railway open

# Check service variables
railway variables

# Redeploy service
railway up --detach
```

---

## 🎉 Success Checklist

- [ ] Railway project created
- [ ] Code deployed successfully
- [ ] Environment variables configured
- [ ] Domain generated and accessible
- [ ] Health endpoint returns 200 OK
- [ ] WhatsApp initialization works
- [ ] QR code generated successfully
- [ ] WhatsApp connected via QR scan
- [ ] Test message sent successfully
- [ ] Service integrated with Fly2Any
- [ ] Monitoring set up

**🚀 Once all items are checked, your WhatsApp Baileys service is fully operational on Railway!**