# 📧 N8N Email Marketing Workflow Import Guide

## 🎯 Overview
This guide helps you import and configure the **Email Marketing Final Working** workflow into your N8N Railway instance at `https://n8n-production-81b6.up.railway.app`.

## 📋 Workflow Features
- ✉️ **Email Campaign Processing**: Handles complete email campaigns
- 📧 **Gmail SMTP Integration**: Sends emails via Gmail API
- 📦 **Batch Processing**: Processes 10 emails per batch
- ⏱️ **Rate Limiting**: 2-second delay between batches
- 📊 **Campaign Tracking**: Tracks campaign success/failure
- 👥 **Contact Management**: Handles contact lists efficiently
- 🎯 **Webhook Endpoint**: `/webhook/email-marketing-final`

## 🚀 Quick Import Steps

### Method 1: Direct File Import (Recommended)

1. **Access N8N Dashboard**
   ```
   https://n8n-production-81b6.up.railway.app
   ```

2. **Import Workflow**
   - Click "Import" or "+" → "Import from file"
   - Upload: `n8n-workflows/email-marketing-final.json`
   - Or use the generated: `email-marketing-workflow-import.json`

3. **Activate Workflow**
   - Click the "Inactive" toggle to make it "Active"
   - Verify webhook URL: `/webhook/email-marketing-final`

### Method 2: Manual Node Configuration

If import fails, create manually:

#### Node 1: Email Webhook Final
```json
{
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "email-marketing-final",
    "responseMode": "responseNode"
  }
}
```

#### Node 2: Split in Batches Final
```json
{
  "type": "n8n-nodes-base.splitInBatches",
  "parameters": {
    "batchSize": 10
  }
}
```

#### Node 3: Split Contacts Final
```json
{
  "type": "n8n-nodes-base.itemLists",
  "parameters": {
    "fieldToSplitOut": "contacts"
  }
}
```

#### Node 4: Send Gmail Final
```json
{
  "type": "n8n-nodes-base.gmail",
  "parameters": {
    "operation": "send",
    "sendTo": "={{ $json.email }}",
    "subject": "={{ $node(\"Email Webhook Final\").first().json.subject }}",
    "message": "={{ $node(\"Email Webhook Final\").first().json.htmlContent }}",
    "options": {
      "contentType": "html"
    }
  }
}
```

#### Node 5: Rate Limit Final
```json
{
  "type": "n8n-nodes-base.wait",
  "parameters": {
    "amount": 2,
    "unit": "seconds"
  }
}
```

#### Node 6: Check Complete Final
```json
{
  "type": "n8n-nodes-base.if",
  "parameters": {
    "conditions": {
      "conditions": [
        {
          "leftValue": "={{ $node(\"Split in Batches Final\").context.noItemsLeft }}",
          "rightValue": true,
          "operator": {
            "type": "boolean",
            "operation": "equal"
          }
        }
      ]
    }
  }
}
```

#### Node 7: Success Response Final
```json
{
  "type": "n8n-nodes-base.respondToWebhook",
  "parameters": {
    "respondWith": "json",
    "responseBody": "{\n  \"success\": true,\n  \"message\": \"Emails enviados com sucesso!\",\n  \"campaignId\": \"{{ $node(\"Email Webhook Final\").first().json.campaignId }}\",\n  \"totalContacts\": {{ $node(\"Email Webhook Final\").first().json.contacts.length }},\n  \"timestamp\": \"{{ new Date().toISOString() }}\"\n}"
  }
}
```

#### Node 8: Continue Final
```json
{
  "type": "n8n-nodes-base.noOp"
}
```

## 🔧 Required Configuration

### 1. Gmail OAuth Setup
- Configure Gmail credentials in N8N
- Set up OAuth2 for Gmail API access
- Test Gmail connection

### 2. Webhook Configuration
- Ensure path is: `email-marketing-final`
- Method: POST
- Response mode: "Response Node"

### 3. Batch Processing
- Batch size: 10 emails
- Rate limit: 2 seconds between batches

## 📨 API Usage

### Webhook Endpoint
```
POST https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final
```

### Request Payload
```json
{
  "campaignId": "campaign-123",
  "campaignName": "Welcome Campaign",
  "subject": "Welcome to Our Service!",
  "htmlContent": "<h1>Welcome!</h1><p>Thank you for joining us.</p>",
  "contacts": [
    {
      "email": "user1@example.com",
      "nome": "User One"
    },
    {
      "email": "user2@example.com", 
      "nome": "User Two"
    }
  ]
}
```

### Success Response
```json
{
  "success": true,
  "message": "Emails enviados com sucesso!",
  "campaignId": "campaign-123",
  "totalContacts": 2,
  "timestamp": "2025-01-25T10:30:00.000Z"
}
```

## 🧪 Testing

### Test Script
```bash
curl -X POST https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "test-campaign",
    "subject": "Test Email",
    "htmlContent": "<p>Test message</p>",
    "contacts": [{"email": "test@example.com", "nome": "Test User"}]
  }'
```

### Expected Status Codes
- **200**: Success - emails sent
- **404**: Webhook not found - workflow not active
- **500**: Internal error - check workflow configuration

## 🚨 Troubleshooting

### Common Issues

1. **Webhook 404 Error**
   - Workflow is not active
   - Path is incorrect
   - Solution: Activate workflow and verify path

2. **Gmail Authentication Error**
   - OAuth not configured
   - Credentials expired
   - Solution: Reconfigure Gmail credentials

3. **Rate Limit Issues**
   - Too many emails too fast
   - Gmail API limits exceeded
   - Solution: Increase batch delay or reduce batch size

4. **Batch Processing Stuck**
   - Logic error in batch loop
   - Missing connections
   - Solution: Verify node connections and conditions

## 📊 Monitoring

### Key Metrics to Monitor
- Email delivery success rate
- Batch processing time
- API response times
- Error rates

### Logs to Check
- N8N execution logs
- Gmail API logs
- Webhook request logs

## 🔄 Workflow Flow

1. **Webhook Receives Request** → Email campaign data
2. **Split in Batches** → Divides contacts into batches of 10
3. **Split Contacts** → Processes individual contacts
4. **Send Gmail** → Sends email via Gmail API
5. **Rate Limit** → Waits 2 seconds
6. **Check Complete** → Verifies if all batches processed
7. **Success Response** → Returns success status
8. **Continue/Loop** → Processes next batch if needed

## 💡 Best Practices

1. **Rate Limiting**: Keep 2-second delays to avoid Gmail limits
2. **Batch Size**: 10-15 emails per batch is optimal
3. **Error Handling**: Monitor failed sends and retry logic
4. **Testing**: Always test with small batches first
5. **Monitoring**: Set up alerts for failed campaigns

## 📞 Support

If you encounter issues:
1. Check N8N execution logs
2. Verify Gmail credentials
3. Test webhook endpoint manually
4. Review workflow connections
5. Check rate limiting configuration

---

**Status**: ✅ N8N is online and healthy  
**Webhook URL**: `https://n8n-production-81b6.up.railway.app/webhook/email-marketing-final`  
**Import File**: `email-marketing-workflow-import.json`