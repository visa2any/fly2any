# 📱 WhatsApp Workflow Import - Complete Guide

## 🎯 CURRENT STATUS
- ✅ **N8N Instance**: Online at https://n8n-production-81b6.up.railway.app
- ✅ **Workflow File**: Ready at `/n8n-workflows/whatsapp-automation-complete.json`
- ❌ **Webhook Endpoint**: Not yet imported (returns 404)
- 🔒 **API Access**: Requires authentication (returns 401)

## 📋 IMPORT REQUIRED - MANUAL PROCESS

Since the N8N API requires authentication and browser automation isn't available in this environment, **manual import is required** through the N8N web interface.

## 🚀 QUICK IMPORT PROCESS

### Step 1: Access N8N
1. Open: https://n8n-production-81b6.up.railway.app
2. Login with your credentials

### Step 2: Import Workflow
1. Click **"Import from JSON"** or **"+"** → **"Import"**
2. Copy the **entire contents** from: `/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json`
3. Paste into the import dialog
4. Click **"Import"**

### Step 3: Activate Workflow
1. Click **"Save"** (Ctrl+S)
2. Toggle **"Active"** switch to ON
3. Verify webhook is available: `/webhook/whatsapp`

## 🤖 WORKFLOW FEATURES OVERVIEW

The WhatsApp automation workflow includes **10 interconnected nodes**:

### 1. **WhatsApp Webhook** (Entry Point)
- **Endpoint**: `/webhook/whatsapp`
- **Method**: POST
- **Purpose**: Receives all WhatsApp messages and lead events

### 2. **Process Message** (Intelligence Hub)
- **Intent Detection**: Analyzes message content for user intent
- **Priority Assignment**: Sets priority based on urgency keywords
- **Business Hours Check**: Determines appropriate response timing
- **Event Type Routing**: Handles both messages and lead events

### 3. **Is Lead Event?** (Smart Router)
- **Purpose**: Routes lead creation events vs regular messages
- **Logic**: Checks `eventType === 'lead_created'`

### 4. **Process Lead Event** (Lead Handler)
- **Confidence Scoring**: Processes lead data with confidence metrics
- **Campaign Triggers**: Auto-creates campaigns for high-confidence leads (≥60%)
- **Priority Routing**: High-confidence leads (≥70%) get high priority

### 5. **Need Auto Response?** (Response Decision)
- **Business Logic**: Determines when auto-responses are appropriate
- **Conditions**: After hours, greetings, thanks messages
- **Human Escalation**: Routes complex queries to humans

### 6. **Generate Auto Response** (AI Response)
- **Contextual Responses**: Different responses per intent type
- **Business Hours Aware**: Adapts messages based on time
- **Personalization**: Supports dynamic content insertion

### 7. **Send Auto Response** (Message Delivery)
- **WhatsApp Integration**: Sends responses via WhatsApp API
- **Error Handling**: Manages delivery failures
- **Rate Limiting**: Respects messaging limits

### 8. **Notify Human?** (Escalation Logic)
- **Smart Escalation**: Routes urgent/complex messages to humans
- **Trigger Conditions**: 
  - Urgent keywords detected
  - Flight/pricing inquiries
  - New conversations during business hours
  - High-priority intents

### 9. **Create Support Ticket** (Ticket System)
- **Automatic Ticketing**: Creates support tickets for human follow-up
- **Priority Assignment**: Maps message urgency to ticket priority
- **Department Routing**: Routes to appropriate team (sales, support, etc.)

### 10. **Email Notification via Resend** (Team Alerts)
- **Real-time Notifications**: Alerts team about new messages/leads
- **Smart Filtering**: Only sends relevant notifications
- **Rich Content**: Includes message context and customer details

## 📊 WORKFLOW LOGIC FLOW

```
WhatsApp Message/Lead Event
↓
Process Message (Intent Detection)
↓
Is Lead Event? → YES → Process Lead Event → Email Notification
                ↓ NO
                ↓
Need Auto Response? → YES → Generate Response → Send Response
                     ↓ NO
                     ↓
Notify Human? → YES → Create Support Ticket → Email Notification
               ↓ NO
               ↓
[End]
```

## 🎯 SUPPORTED MESSAGE TYPES

### 1. **Regular WhatsApp Messages**
```json
{
  "event": "whatsapp_message_received",
  "data": {
    "from": "+5511999887766",
    "text": "Preciso de voos para Miami",
    "contactName": "João Silva",
    "timestamp": "2025-07-25T20:50:00Z",
    "messageId": "msg_123",
    "isNewConversation": true
  }
}
```

### 2. **Lead Creation Events**
```json
{
  "event": "whatsapp_lead_created", 
  "data": {
    "phone": "+5511999887766",
    "leadData": {
      "origem": "Miami",
      "destino": "São Paulo",
      "dataPartida": "2025-08-15",
      "numeroPassageiros": 2,
      "intent": "flight_booking",
      "selectedServices": ["voos", "hoteis"]
    },
    "confidence": 85,
    "timestamp": "2025-07-25T20:50:00Z"
  }
}
```

## 🧠 INTENT DETECTION SYSTEM

The workflow automatically detects these intents from message content:

| Intent | Keywords | Priority | Auto-Response | Human Notification |
|--------|----------|----------|---------------|-------------------|
| **urgent** | urgente, emergência, problema | HIGH | ❌ | ✅ Always |
| **flight_inquiry** | voo, passagem, viagem | HIGH | ✅ | ✅ Business hours |
| **pricing** | preço, cotação, valor | HIGH | ✅ | ✅ Always |
| **hotel_inquiry** | hotel, hospedagem | NORMAL | ✅ | ❌ |
| **car_rental** | carro, aluguel | NORMAL | ✅ | ❌ |
| **greeting** | oi, olá, bom dia | NORMAL | ✅ | ❌ |
| **thanks** | obrigad, valeu, tchau | NORMAL | ✅ | ❌ |
| **general** | (default) | NORMAL | ✅ | ✅ New conversations |

## ⏰ BUSINESS HOURS LOGIC

- **Business Hours**: Monday-Friday 9 AM - 6 PM EST, Saturday 9 AM - 2 PM EST
- **During Hours**: Immediate human notification for new conversations
- **After Hours**: Auto-response with "will contact you in the morning" message
- **Urgent Messages**: Always escalated regardless of time

## 🚀 AUTO-RESPONSE EXAMPLES

### Flight Inquiry Response:
```
✈️ Perfeito! Para uma cotação de voos, preciso saber:

📍 Origem e destino
📅 Datas de ida e volta  
👥 Quantos passageiros
💺 Classe preferida

Pode me enviar esses detalhes?

🎯 Cotação gratuita em até 2 horas!
```

### Pricing Response:
```
💰 Nossos preços são imbatíveis! Alguns exemplos:

✈️ Miami ↔ São Paulo: $650-900
✈️ NY ↔ Rio de Janeiro: $720-1100  
✈️ Orlando ↔ São Paulo: $680-950

🎯 Cotação personalizada GRÁTIS em 2h!
📞 Quer falar com um especialista agora?
```

## 🧪 TESTING COMMANDS

After importing the workflow, test with these commands:

### Test Regular Message:
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_message_received",
    "data": {
      "from": "+5511999887766",
      "text": "Preciso de voos para Miami",
      "contactName": "Test User",
      "timestamp": "2025-07-25T20:50:00Z",
      "messageId": "test_123",
      "isNewConversation": true
    }
  }'
```

### Test Lead Event:
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_lead_created",
    "data": {
      "phone": "+5511999887766", 
      "leadData": {
        "origem": "Miami",
        "destino": "São Paulo",
        "dataPartida": "2025-08-15",
        "numeroPassageiros": 2,
        "intent": "flight_booking"
      },
      "confidence": 85,
      "timestamp": "2025-07-25T20:50:00Z"
    }
  }'
```

### Test Urgent Message:
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_message_received",
    "data": {
      "from": "+5511999887766",
      "text": "URGENTE! Meu voo foi cancelado!",
      "contactName": "Emergency User", 
      "timestamp": "2025-07-25T20:50:00Z",
      "messageId": "urgent_123",
      "isNewConversation": false
    }
  }'
```

## 🛠️ AUTOMATED TESTING

Use the provided test suite:
```bash
node test-whatsapp-webhook.js
```

This will run 6 comprehensive tests covering all message types and scenarios.

## 📁 AVAILABLE FILES

1. **`n8n-workflows/whatsapp-automation-complete.json`** - Complete workflow definition
2. **`manual-whatsapp-import-guide.md`** - Detailed manual import steps  
3. **`import-whatsapp-workflow.js`** - Browser automation script (requires GUI)
4. **`import-whatsapp-api.js`** - API-based import script
5. **`test-whatsapp-webhook.js`** - Comprehensive webhook testing suite

## 🔧 TROUBLESHOOTING

### Common Issues:

| Issue | Cause | Solution |
|-------|-------|----------|
| **404 Not Found** | Workflow not imported/active | Import workflow and activate |
| **401 Unauthorized** | API authentication required | Use manual import process |
| **500 Internal Error** | Workflow execution error | Check N8N execution logs |
| **No Response** | Webhook not configured | Verify webhook path is `/whatsapp` |

### Validation Steps:

1. **Check Import**: Workflow appears in N8N workflows list
2. **Check Active**: Workflow toggle shows "Active" (green)
3. **Check Webhook**: Returns 200 on test message (not 404)
4. **Check Logs**: N8N execution logs show processing steps
5. **Check Integration**: Support tickets created, emails sent

## 🎉 SUCCESS INDICATORS

Once properly imported and activated, you should see:

✅ **Webhook Responds**: Returns 200 status instead of 404  
✅ **Messages Processed**: N8N execution logs show workflow steps  
✅ **Auto-Responses**: Appropriate responses generated per intent  
✅ **Tickets Created**: Support tickets appear in your system  
✅ **Emails Sent**: Team notifications via Resend  
✅ **Lead Processing**: Lead events trigger sales notifications  

## 🚀 POST-IMPORT CHECKLIST

- [ ] Import workflow from JSON file
- [ ] Activate workflow (toggle to Active)
- [ ] Test webhook endpoint (should return 200, not 404)
- [ ] Verify auto-responses work for different intents
- [ ] Confirm support ticket creation
- [ ] Check email notifications via Resend
- [ ] Test lead event processing
- [ ] Validate business hours logic
- [ ] Run comprehensive test suite
- [ ] Monitor N8N execution logs

---

## 📞 NEXT STEPS

1. **IMMEDIATE**: Import workflow using manual guide
2. **VERIFY**: Run test suite to confirm functionality  
3. **INTEGRATE**: Connect with your WhatsApp Business API
4. **MONITOR**: Watch N8N logs for successful executions
5. **OPTIMIZE**: Adjust responses and routing based on usage

**🎯 Expected Result**: Full WhatsApp automation with intelligent message routing, auto-responses, lead processing, and team notifications - all handled seamlessly by the N8N workflow!**