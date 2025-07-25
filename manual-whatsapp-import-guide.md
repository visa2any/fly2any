# 📱 Manual WhatsApp Workflow Import Guide

## 🎯 Objective
Import and configure the WhatsApp automation workflow in N8N Railway instance.

## 📋 Step-by-Step Manual Import Process

### Step 1: Access N8N Instance
1. Open browser and go to: https://n8n-production-81b6.up.railway.app
2. Log in if required (credentials should be in your Railway dashboard)

### Step 2: Import Workflow
1. **Option A - Direct Import:**
   - Click "Import from JSON" or "+" button
   - Copy the entire JSON content from `/mnt/d/Users/vilma/fly2any/n8n-workflows/whatsapp-automation-complete.json`
   - Paste into the import dialog
   - Click "Import"

2. **Option B - Create New:**
   - Click "New Workflow"
   - Click workflow menu (⋯) → "Import from JSON"
   - Paste the JSON content
   - Click "Import"

### Step 3: Verify Workflow Nodes
The imported workflow should contain these nodes:

1. **WhatsApp Webhook** (Entry point)
   - Type: `webhook`
   - Path: `whatsapp`
   - Method: `POST`

2. **Process Message** (Message analysis)
   - Type: `code`
   - Processes incoming messages and detects intents

3. **Is Lead Event?** (Conditional routing)
   - Type: `if`
   - Routes lead events vs regular messages

4. **Process Lead Event** (Lead handling)
   - Type: `code`
   - Handles lead creation events

5. **Need Auto Response?** (Response decision)
   - Type: `if`
   - Determines if auto-response is needed

6. **Generate Auto Response** (Response generation)
   - Type: `code`
   - Creates contextual auto-responses

7. **Send Auto Response** (Message sending)
   - Type: `httpRequest`
   - Sends responses via WhatsApp API

8. **Notify Human?** (Human notification)
   - Type: `if`
   - Decides when to notify human agents

9. **Create Support Ticket** (Ticket creation)
   - Type: `httpRequest`
   - Creates support tickets for important messages

10. **Email Notification via Resend** (Notifications)
    - Type: `httpRequest`
    - Sends email notifications

### Step 4: Configure Environment Variables
Ensure these environment variables are set in your N8N instance:

```env
NEXT_PUBLIC_APP_URL=https://fly2any.com
# Add other required environment variables
```

### Step 5: Activate Workflow
1. Click the "Active" toggle switch in the top-right
2. Ensure the toggle shows "Active" (usually green)
3. Save the workflow (Ctrl+S)

### Step 6: Test Webhook Endpoint
The webhook should be available at:
```
https://n8n-production-81b6.up.railway.app/webhook/whatsapp
```

Test with this sample payload:
```json
{
  "event": "whatsapp_message_received",
  "data": {
    "from": "+1234567890",
    "text": "Olá! Preciso de uma cotação para voos Miami-São Paulo",
    "contactName": "Test User",
    "timestamp": "2025-07-25T20:50:00.000Z",
    "messageId": "test_msg_123",
    "isNewConversation": true
  }
}
```

## 🔧 Workflow Features Explanation

### 1. Message Processing
- **Intent Detection:** Analyzes message content to determine user intent
- **Priority Assignment:** Sets priority based on message urgency
- **Business Hours Check:** Determines if it's within business hours

### 2. Lead Event Handling
- **Lead Creation:** Processes lead creation events with confidence scoring
- **Campaign Triggers:** Automatically creates marketing campaigns for high-confidence leads
- **Priority Routing:** Routes high-confidence leads as high priority

### 3. Auto-Response System
- **Contextual Responses:** Generates appropriate responses based on intent
- **Business Hours Awareness:** Different responses during/after hours
- **Personalization:** Supports dynamic content insertion

### 4. Support Integration
- **Ticket Creation:** Automatically creates support tickets for:
  - Urgent messages
  - Flight inquiries
  - Pricing requests
  - New conversations during business hours
- **Priority Setting:** Assigns appropriate priority levels

### 5. Notification System
- **Email Alerts:** Sends notifications via Resend API
- **Lead Notifications:** Special handling for new leads
- **Human Escalation:** Notifies agents when human intervention needed

## 🚨 Troubleshooting

### Webhook Not Found (404)
- Check if workflow is activated
- Verify webhook path is exactly `whatsapp`
- Ensure workflow is saved

### Import Errors
- Verify JSON syntax is valid
- Check for missing environment variables
- Ensure N8N version compatibility

### Node Configuration Issues
- Check HTTP request node URLs
- Verify credential configurations
- Test individual nodes manually

## 🧪 Testing Scenarios

### 1. Regular Message Test
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_message_received",
    "data": {
      "from": "+1234567890",
      "text": "Olá! Como posso comprar passagens?",
      "contactName": "Test User",
      "timestamp": "2025-07-25T20:50:00.000Z",
      "messageId": "test_msg_123",
      "isNewConversation": true
    }
  }'
```

### 2. Lead Creation Test
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_lead_created",
    "data": {
      "phone": "+1234567890",
      "leadData": {
        "origem": "Miami",
        "destino": "São Paulo", 
        "dataPartida": "2025-08-15",
        "numeroPassageiros": 2,
        "intent": "flight_booking",
        "selectedServices": ["voos", "hoteis"]
      },
      "confidence": 85,
      "timestamp": "2025-07-25T20:50:00.000Z"
    }
  }'
```

### 3. Urgent Message Test
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "event": "whatsapp_message_received",
    "data": {
      "from": "+1234567890",
      "text": "URGENTE! Meu voo foi cancelado e preciso de ajuda!",
      "contactName": "Emergency User",
      "timestamp": "2025-07-25T20:50:00.000Z",
      "messageId": "urgent_msg_123",
      "isNewConversation": false
    }
  }'
```

## ✅ Success Indicators

1. **Workflow Import:** All 10 nodes appear correctly connected
2. **Activation:** Workflow shows as "Active" 
3. **Webhook:** Returns 200 status on test requests
4. **Processing:** Logs show message processing steps
5. **Responses:** Auto-responses are generated appropriately
6. **Tickets:** Support tickets are created when needed
7. **Notifications:** Email notifications are sent

## 🎯 Expected Behavior

### For Regular Messages:
- Message processed and intent detected
- Auto-response generated if appropriate
- Support ticket created if needed
- Email notification sent to team

### For Lead Events:
- Lead data processed and scored
- High-confidence leads trigger campaigns
- Immediate email notification to sales team
- Lead stored in system for follow-up

### For Urgent Messages:
- Immediate high-priority ticket creation
- Instant email notification
- No auto-response delay
- Escalated to human agents

---

**🚀 Once imported and activated, the WhatsApp workflow will be ready to handle all incoming messages automatically!**