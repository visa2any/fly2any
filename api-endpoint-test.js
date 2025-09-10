/**
 * 🌐 BACKEND API ENDPOINT TEST
 * Direct testing of the /api/leads endpoint functionality
 */

const https = require('https');
const http = require('http');

const CONFIG = {
  baseUrl: 'http://localhost:3000',
  endpoints: [
    '/api/leads'
  ]
};

// Test data based on LeadCapture component structure
const TEST_LEAD_DATA = {
  // Personal data
  nome: 'João Silva API Test',
  email: 'joao.apitest@fly2any.com',
  whatsapp: '+55 11 99999-8888',
  cpf: '123.456.789-01',
  dataNascimento: '1990-05-15',
  
  // Location
  cidade: 'São Paulo',
  estado: 'SP',
  pais: 'Brasil',
  
  // Travel data
  tipoViagem: 'ida_volta',
  origem: {
    iataCode: 'GRU',
    name: 'São Paulo–Guarulhos International Airport',
    city: 'São Paulo',
    country: 'Brazil'
  },
  destino: {
    iataCode: 'JFK', 
    name: 'John F. Kennedy International Airport',
    city: 'New York',
    country: 'United States'
  },
  dataPartida: '2025-12-15',
  dataRetorno: '2025-12-22',
  numeroPassageiros: 2,
  classeViagem: 'economica',
  
  // Services
  selectedServices: ['voos', 'hospedagem'],
  
  // Accommodation
  precisaHospedagem: true,
  tipoHospedagem: 'hotel',
  categoriaHospedagem: '4',
  
  // Transport
  precisaTransporte: false,
  
  // Budget
  orcamentoTotal: '5000_10000',
  prioridadeOrcamento: 'custo_beneficio',
  
  // Experience  
  experienciaViagem: 'ocasional',
  motivoViagem: 'lazer',
  
  // Contact preferences
  preferenciaContato: 'whatsapp',
  melhorHorario: 'qualquer',
  
  // Marketing
  comoConheceu: 'google',
  receberPromocoes: true,
  
  // Additional
  observacoes: 'API Test - verificando conectividade backend e persistência database',
  necessidadeEspecial: '',
  
  // Metadata
  source: 'api_test',
  timestamp: new Date().toISOString(),
  userAgent: 'Node.js API Test',
  pageUrl: 'http://localhost:3000/'
};

let testResults = {
  timestamp: new Date().toISOString(),
  apiTests: [],
  databaseTests: [],
  networkAnalysis: {
    responseTime: 0,
    statusCode: 0,
    headers: {},
    body: null
  }
};

/**
 * 🌐 Test API Endpoint
 */
async function testAPIEndpoint() {
  console.log('🌐 Testing Backend API Endpoints...');
  console.log(`📍 Target: ${CONFIG.baseUrl}/api/leads`);
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(TEST_LEAD_DATA);
    const startTime = Date.now();
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Request-Id': 'test-' + Date.now()
      }
    };
    
    console.log('📤 Sending POST request to /api/leads...');
    console.log(`📦 Payload size: ${Buffer.byteLength(postData)} bytes`);
    
    const req = http.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let body = '';
      
      console.log(`📥 Response Status: ${res.statusCode}`);
      console.log(`⏱️  Response Time: ${responseTime}ms`);
      console.log(`📋 Response Headers:`, res.headers);
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          
          testResults.networkAnalysis = {
            responseTime,
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          };
          
          testResults.apiTests.push({
            endpoint: '/api/leads',
            method: 'POST',
            status: res.statusCode === 201 ? 'SUCCESS' : 'FAILED',
            responseTime,
            statusCode: res.statusCode,
            response: parsedBody
          });
          
          console.log('📋 Response Body:');
          console.log(JSON.stringify(parsedBody, null, 2));
          
          if (res.statusCode === 201 && parsedBody.success) {
            console.log('✅ API Endpoint Test: SUCCESS');
            console.log(`📝 Lead ID: ${parsedBody.data?.leadId}`);
            resolve({
              success: true,
              leadId: parsedBody.data?.leadId,
              response: parsedBody
            });
          } else {
            console.log('❌ API Endpoint Test: FAILED');
            console.log(`📝 Error: ${parsedBody.error || 'Unknown error'}`);
            resolve({
              success: false,
              error: parsedBody.error || 'API request failed',
              response: parsedBody
            });
          }
          
        } catch (parseError) {
          console.log('❌ Failed to parse response:', parseError.message);
          console.log('📝 Raw response:', body);
          resolve({
            success: false,
            error: 'Failed to parse JSON response',
            rawResponse: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Request Error:', error.message);
      testResults.apiTests.push({
        endpoint: '/api/leads',
        method: 'POST',
        status: 'ERROR',
        error: error.message
      });
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      console.log('❌ Request Timeout');
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout'
      });
    });
    
    // Set timeout
    req.setTimeout(30000);
    
    // Send the data
    req.write(postData);
    req.end();
  });
}

/**
 * 🔍 Test GET Endpoint
 */
async function testGETEndpoint() {
  console.log('\n🔍 Testing GET /api/leads endpoint...');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/leads?limit=5',
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Request-Id': 'get-test-' + Date.now()
      }
    };
    
    const req = http.request(options, (res) => {
      let body = '';
      
      console.log(`📥 GET Response Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          
          testResults.apiTests.push({
            endpoint: '/api/leads',
            method: 'GET',
            status: res.statusCode === 200 ? 'SUCCESS' : 'FAILED',
            statusCode: res.statusCode,
            response: parsedBody
          });
          
          console.log('📋 GET Response:');
          console.log(JSON.stringify(parsedBody, null, 2));
          
          resolve({
            success: res.statusCode === 200,
            response: parsedBody
          });
          
        } catch (parseError) {
          console.log('❌ Failed to parse GET response:', parseError.message);
          resolve({ success: false, error: parseError.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ GET Request Error:', error.message);
      resolve({ success: false, error: error.message });
    });
    
    req.setTimeout(15000);
    req.end();
  });
}

/**
 * 🗄️ Test Database Persistence (indirect via GET)
 */
async function testDatabasePersistence(leadId) {
  console.log('\n🗄️ Testing Database Persistence...');
  
  if (!leadId) {
    console.log('❌ No lead ID available for database test');
    testResults.databaseTests.push({
      test: 'Database Persistence',
      status: 'SKIPPED',
      reason: 'No lead ID from POST request'
    });
    return { success: false, reason: 'No lead ID' };
  }
  
  // Wait a moment for the database write to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try to retrieve leads to see if our lead was persisted
  const getResult = await testGETEndpoint();
  
  if (getResult.success && getResult.response?.data) {
    const leads = Array.isArray(getResult.response.data) ? getResult.response.data : 
                  getResult.response.data.leads ? getResult.response.data.leads : [];
    
    console.log(`📊 Retrieved ${leads.length} leads from database`);
    
    // Look for our test lead
    const ourLead = leads.find(lead => 
      lead.id === leadId || 
      lead.email === TEST_LEAD_DATA.email ||
      lead.observacoes?.includes('API Test')
    );
    
    if (ourLead) {
      console.log('✅ Database Persistence: SUCCESS');
      console.log(`📝 Found our lead: ${ourLead.id || 'ID unknown'}`);
      
      testResults.databaseTests.push({
        test: 'Database Persistence',
        status: 'SUCCESS',
        leadId: ourLead.id,
        leadData: ourLead
      });
      
      return { 
        success: true, 
        leadFound: true,
        leadData: ourLead
      };
    } else {
      console.log('❌ Database Persistence: LEAD NOT FOUND');
      console.log(`📝 Expected lead with ID: ${leadId} or email: ${TEST_LEAD_DATA.email}`);
      
      testResults.databaseTests.push({
        test: 'Database Persistence',
        status: 'FAILED',
        reason: 'Lead not found in database',
        searchedForId: leadId,
        totalLeadsInDB: leads.length
      });
      
      return { 
        success: false, 
        leadFound: false,
        reason: 'Lead not found in database'
      };
    }
  } else {
    console.log('❌ Database Persistence: UNABLE TO RETRIEVE LEADS');
    
    testResults.databaseTests.push({
      test: 'Database Persistence',
      status: 'ERROR',
      reason: 'Unable to retrieve leads for verification'
    });
    
    return { 
      success: false, 
      reason: 'Unable to retrieve leads'
    };
  }
}

/**
 * 📋 Generate API Test Report
 */
async function generateAPIReport() {
  const report = `# 🌐 BACKEND API ENDPOINT TEST REPORT

## 📊 Test Summary

**Test Date:** ${testResults.timestamp}  
**API Tests:** ${testResults.apiTests.length}  
**Database Tests:** ${testResults.databaseTests.length}  

### API Endpoint Results
${testResults.apiTests.map(test => `
#### ${test.method} ${test.endpoint}
- **Status:** ${test.status}
- **Response Time:** ${test.responseTime || 'N/A'}ms
- **Status Code:** ${test.statusCode}
${test.error ? `- **Error:** ${test.error}` : ''}
${test.response ? `- **Response:** ${JSON.stringify(test.response, null, 2)}` : ''}
`).join('')}

### Database Persistence Results
${testResults.databaseTests.map(test => `
#### ${test.test}
- **Status:** ${test.status}
${test.reason ? `- **Reason:** ${test.reason}` : ''}
${test.leadId ? `- **Lead ID:** ${test.leadId}` : ''}
${test.totalLeadsInDB !== undefined ? `- **Total Leads in DB:** ${test.totalLeadsInDB}` : ''}
`).join('')}

## 🔬 Network Analysis

### Response Analysis
- **Response Time:** ${testResults.networkAnalysis.responseTime}ms
- **Status Code:** ${testResults.networkAnalysis.statusCode}
- **Content-Type:** ${testResults.networkAnalysis.headers?.['content-type'] || 'N/A'}

### Response Headers
\`\`\`json
${JSON.stringify(testResults.networkAnalysis.headers, null, 2)}
\`\`\`

### Response Body
\`\`\`json
${JSON.stringify(testResults.networkAnalysis.body, null, 2)}
\`\`\`

## 📋 Test Data Used

\`\`\`json
${JSON.stringify(TEST_LEAD_DATA, null, 2)}
\`\`\`

## 🎯 Key Findings

### ✅ Working Components
${testResults.apiTests.filter(t => t.status === 'SUCCESS').map(t => `- ${t.method} ${t.endpoint} responding correctly`).join('\n')}

### ❌ Issues Detected  
${testResults.apiTests.filter(t => t.status !== 'SUCCESS').map(t => `- ${t.method} ${t.endpoint}: ${t.error || 'Failed'}`).join('\n')}
${testResults.databaseTests.filter(t => t.status !== 'SUCCESS').map(t => `- Database: ${t.reason || 'Failed'}`).join('\n')}

### 🔄 Database Connectivity
${testResults.databaseTests.length > 0 ? 
  (testResults.databaseTests.some(t => t.status === 'SUCCESS') ? 
    '✅ Database persistence verified' : 
    '❌ Database persistence issues detected') :
  '⚠️ Database persistence not tested'}

---

*Report generated: ${new Date().toISOString()}*
`;

  const fs = require('fs');
  fs.writeFileSync('./BACKEND_API_TEST_REPORT.md', report);
  console.log('📋 API test report saved to: ./BACKEND_API_TEST_REPORT.md');
}

/**
 * 🚀 Main Test Runner
 */
async function runAPITests() {
  console.log('🚀 Starting Backend API Endpoint Tests...');
  console.log('🎯 Testing Lead Form backend connectivity and database persistence');
  
  try {
    // Test 1: POST /api/leads
    const postResult = await testAPIEndpoint();
    
    // Test 2: Database Persistence
    await testDatabasePersistence(postResult.leadId);
    
    // Generate comprehensive report
    await generateAPIReport();
    
    console.log('\n📊 API Test Summary:');
    console.log(`✅ Successful API tests: ${testResults.apiTests.filter(t => t.status === 'SUCCESS').length}`);
    console.log(`❌ Failed API tests: ${testResults.apiTests.filter(t => t.status !== 'SUCCESS').length}`);
    console.log(`🗄️ Database tests: ${testResults.databaseTests.length}`);
    
    console.log('\n✅ Backend API Testing Complete!');
    
  } catch (error) {
    console.error('❌ API Testing Error:', error);
  }
}

// Run the tests
if (require.main === module) {
  runAPITests().catch(console.error);
}

module.exports = { runAPITests };