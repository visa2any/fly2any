#!/usr/bin/env node

console.log('🚀 Retomando campanhas pausadas...');

const https = require('https');

// Função para fazer requisição POST
function makePostRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/email-marketing',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function resumeCampaigns() {
  try {
    console.log('📡 Chamando API para retomar campanhas pausadas...');
    
    const response = await makePostRequest({
      action: 'resume_paused_campaigns'
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Resposta:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

resumeCampaigns();