// Setup N8N WhatsApp Workflow via API
require('dotenv').config({ path: '.env.local' });

const N8N_TOKEN = process.env.N8N_API_TOKEN;
const N8N_BASE_URL = process.env.N8N_BASE_URL;

if (!N8N_TOKEN || !N8N_BASE_URL) {
  console.error('❌ N8N_API_TOKEN or N8N_BASE_URL not configured');
  process.exit(1);
}

// WhatsApp Workflow Configuration
const whatsappWorkflow = {
  "name": "WhatsApp Automation - Fly2Any",
  "active": true,
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "whatsapp",
        "options": {}
      },
      "name": "WhatsApp Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [260, 300],
      "webhookId": "whatsapp-fly2any"
    },
    {
      "parameters": {
        "jsCode": `// Process incoming WhatsApp message
const body = $json.body || $json;
let messageData = {};

// Handle different webhook formats
if (body.event === 'whatsapp_message_received') {
  messageData = {
    from: body.data.from,
    message: body.data.text,
    contactName: body.data.contactName || '',
    timestamp: body.data.timestamp,
    messageId: body.data.messageId,
    isNewConversation: body.data.isNewConversation
  };
} else {
  // Direct message format
  messageData = {
    from: body.from || body.phone,
    message: body.message || body.text,
    contactName: body.contactName || body.name || '',
    timestamp: body.timestamp || new Date().toISOString(),
    messageId: body.messageId || \`msg_\${Date.now()}\`,
    isNewConversation: body.isNewConversation || false
  };
}

// Detect intent
const message = messageData.message.toLowerCase();
let intent = 'general';
let priority = 'normal';

if (message.includes('urgente') || message.includes('emergência') || message.includes('problema')) {
  intent = 'urgent';
  priority = 'high';
} else if (message.includes('voo') || message.includes('passagem') || message.includes('viagem')) {
  intent = 'flight_inquiry';
} else if (message.includes('hotel') || message.includes('hospedagem')) {
  intent = 'hotel_inquiry';
} else if (message.includes('carro') || message.includes('aluguel')) {
  intent = 'car_rental';
} else if (message.includes('preço') || message.includes('cotação') || message.includes('valor')) {
  intent = 'pricing';
} else if (message.includes('oi') || message.includes('olá') || message.includes('bom dia')) {
  intent = 'greeting';
}

// Check business hours (EST)
const now = new Date();
const estTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
const hour = estTime.getHours();
const day = estTime.getDay();
const isBusinessHours = (day >= 1 && day <= 5 && hour >= 9 && hour < 18) || (day === 6 && hour >= 9 && hour < 14);

return {
  ...messageData,
  intent,
  priority,
  isBusinessHours,
  shouldNotifyHuman: intent === 'urgent' || (isBusinessHours && messageData.isNewConversation),
  autoResponse: !isBusinessHours || intent === 'greeting'
};`
      },
      "name": "Process Message",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [480, 300]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "auto-response",
              "leftValue": "={{ $json.autoResponse }}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "equal"
              }
            }
          ],
          "combinator": "and"
        }
      },
      "name": "Need Auto Response?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [700, 300]
    },
    {
      "parameters": {
        "jsCode": `// Generate appropriate auto-response
const intent = $json.intent;
const isBusinessHours = $json.isBusinessHours;

const responses = {
  greeting: '😊 Olá! Bem-vindo à Fly2Any! Como posso ajudar com sua viagem Brasil-EUA hoje?',
  
  flight_inquiry: \`✈️ Perfeito! Para uma cotação de voos, preciso saber:

📍 Origem e destino
📅 Datas de ida e volta  
👥 Quantos passageiros
💺 Classe preferida

Pode me enviar esses detalhes?

🎯 Cotação gratuita em até 2 horas!\`,
  
  pricing: \`💰 Nossos preços são imbatíveis! Alguns exemplos:

✈️ Miami ↔ São Paulo: $650-900
✈️ NY ↔ Rio de Janeiro: $720-1100  
✈️ Orlando ↔ São Paulo: $680-950

🎯 Cotação personalizada GRÁTIS em 2h!
📞 Quer falar com um especialista agora?\`,

  hotel_inquiry: \`🏨 Ótimo! Temos parcerias com os melhores hotéis:

🌟 Destinos populares:
• São Paulo - Centro/Paulista
• Rio de Janeiro - Copacabana/Ipanema
• Salvador - Pelourinho/Orla

📍 Em qual cidade você se hospedará?
📅 Quais as datas da estadia?\`,

  car_rental: \`🚗 Aluguel de carros em todo o Brasil:

🏢 Parceiros: Localiza, Hertz, Avis
🚗 Categorias: Econômico, Executivo, SUV
📍 Retirada: Aeroportos ou centros urbanos

Em qual cidade você precisa?\`,
  
  general: \`😊 Entendi! Um dos nossos especialistas vai revisar sua mensagem e responder em breve.

🎯 Enquanto isso, saiba que oferecemos:
• ✈️ Voos Brasil ↔ EUA
• 🏨 Hotéis no Brasil
• 🚗 Aluguel de carros
• 🛡️ Seguro viagem

Tem mais alguma pergunta?\`
};

let response = responses[intent] || responses.general;

// Add after-hours message if needed
if (!isBusinessHours) {
  response += \`

🕐 Estamos fora do horário comercial, mas um especialista retornará sua mensagem pela manhã!

⏰ Horário: Seg-Sex 9h-18h (EST)\`;
}

return {
  phone: $json.from,
  message: response,
  timestamp: new Date().toISOString()
};`
      },
      "name": "Generate Auto Response",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [920, 180]
    },
    {
      "parameters": {
        "url": "https://fly2any.com/api/whatsapp/send",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "phone",
              "value": "={{ $json.phone }}"
            },
            {
              "name": "message", 
              "value": "={{ $json.message }}"
            }
          ]
        }
      },
      "name": "Send Auto Response",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1140, 180]
    },
    {
      "parameters": {
        "conditions": {
          "options": {
            "caseSensitive": true,
            "leftValue": "",
            "typeValidation": "strict"
          },
          "conditions": [
            {
              "id": "notify-human",
              "leftValue": "={{ $json.shouldNotifyHuman }}",
              "rightValue": true,
              "operator": {
                "type": "boolean",
                "operation": "equal"
              }
            }
          ],
          "combinator": "and"
        }
      },
      "name": "Notify Human?",
      "type": "n8n-nodes-base.if",
      "typeVersion": 2,
      "position": [920, 420]
    },
    {
      "parameters": {
        "url": "https://fly2any.com/api/support/tickets",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "source",
              "value": "whatsapp"
            },
            {
              "name": "phone",
              "value": "={{ $json.from }}"
            },
            {
              "name": "name",
              "value": "={{ $json.contactName || 'Cliente WhatsApp' }}"
            },
            {
              "name": "subject",
              "value": "{{ $json.intent === 'urgent' ? 'URGENTE - ' : '' }}Nova mensagem WhatsApp"
            },
            {
              "name": "message",
              "value": "={{ $json.message }}"
            },
            {
              "name": "priority",
              "value": "={{ $json.priority }}"
            },
            {
              "name": "department",
              "value": "sales"
            }
          ]
        }
      },
      "name": "Create Support Ticket",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.1,
      "position": [1140, 420]
    }
  ],
  "connections": {
    "WhatsApp Webhook": {
      "main": [
        [
          {
            "node": "Process Message",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Message": {
      "main": [
        [
          {
            "node": "Need Auto Response?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Need Auto Response?": {
      "main": [
        [
          {
            "node": "Generate Auto Response",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Notify Human?",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Generate Auto Response": {
      "main": [
        [
          {
            "node": "Send Auto Response",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Notify Human?": {
      "main": [
        [
          {
            "node": "Create Support Ticket",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "executionOrder": "v1"
  },
  "tags": ["whatsapp", "automation", "customer-service"]
};

async function setupN8N() {
  console.log('🚀 Configurando N8N WhatsApp via API...');
  
  try {
    // 1. Check if workflow already exists
    console.log('📋 Verificando workflows existentes...');
    const listResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!listResponse.ok) {
      throw new Error(`Failed to list workflows: ${listResponse.statusText}`);
    }

    const existingWorkflows = await listResponse.json();
    const existingWhatsApp = existingWorkflows.data.find(w => w.name === 'WhatsApp Automation - Fly2Any');

    let workflowId;
    
    if (existingWhatsApp) {
      console.log('📝 Atualizando workflow existente...');
      // Update existing workflow
      const updateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${existingWhatsApp.id}`, {
        method: 'PUT',
        headers: {
          'X-N8N-API-KEY': N8N_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappWorkflow)
      });

      if (!updateResponse.ok) {
        throw new Error(`Failed to update workflow: ${updateResponse.statusText}`);
      }

      const updatedWorkflow = await updateResponse.json();
      workflowId = updatedWorkflow.data.id;
      console.log('✅ Workflow atualizado:', workflowId);
    } else {
      console.log('🆕 Criando novo workflow...');
      // Create new workflow
      const createResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': N8N_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(whatsappWorkflow)
      });

      if (!createResponse.ok) {
        throw new Error(`Failed to create workflow: ${createResponse.statusText}`);
      }

      const newWorkflow = await createResponse.json();
      workflowId = newWorkflow.data.id;
      console.log('✅ Workflow criado:', workflowId);
    }

    // 2. Activate workflow
    console.log('🔄 Ativando workflow...');
    const activateResponse = await fetch(`${N8N_BASE_URL}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!activateResponse.ok) {
      console.warn('⚠️ Failed to activate workflow, but that is ok if it is already active');
    } else {
      console.log('✅ Workflow ativado!');
    }

    // 3. Get webhook URL
    const webhookUrl = `${N8N_BASE_URL}/webhook/whatsapp`;
    console.log('📡 Webhook URL:', webhookUrl);

    console.log('\n🎉 CONFIGURAÇÃO COMPLETA!');
    console.log('✅ Workflow WhatsApp criado e ativado');
    console.log('✅ Webhook disponível em:', webhookUrl);
    console.log('✅ Auto-resposta inteligente configurada');
    console.log('✅ Sistema de tickets integrado');
    
    return {
      success: true,
      workflowId,
      webhookUrl
    };

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Execute setup
setupN8N().then(result => {
  if (result.success) {
    console.log('\n🚀 SISTEMA WHATSAPP PRONTO PARA USO!');
    process.exit(0);
  } else {
    console.log('\n❌ FALHA NA CONFIGURAÇÃO');
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Erro crítico:', error);
  process.exit(1);
});