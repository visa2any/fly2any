# 🌐 BACKEND API ENDPOINT TEST REPORT

## 📊 Test Summary

**Test Date:** 2025-09-10T02:06:54.457Z  
**API Tests:** 2  
**Database Tests:** 1  

### API Endpoint Results

#### POST /api/leads
- **Status:** SUCCESS
- **Response Time:** 7280ms
- **Status Code:** 201

- **Response:** {
  "success": true,
  "data": {
    "leadId": "lead_1757470020192_w4gnollud",
    "status": "novo",
    "createdAt": "2025-09-10T02:07:00.192Z"
  },
  "message": "Lead created successfully",
  "metadata": {
    "requestId": "test-1757470014462",
    "timestamp": "2025-09-10T02:07:01.714Z",
    "processingTime": 1554,
    "storage": "database"
  }
}

#### GET /api/leads
- **Status:** SUCCESS
- **Response Time:** N/Ams
- **Status Code:** 200

- **Response:** {
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_1757470020192_w4gnollud",
        "created_at": "2025-09-10T02:07:00.192Z",
        "updated_at": "2025-09-10T02:07:02.021Z",
        "source": "api_test",
        "status": "novo",
        "nome": "João Silva API Test",
        "email": "joao.apitest@fly2any.com",
        "whatsapp": "5511999998888",
        "telefone": null,
        "sobrenome": null,
        "origem": "São Paulo, Brazil (GRU)",
        "destino": "New York, United States (JFK)",
        "data_partida": "2025-12-15T03:00:00.000Z",
        "data_retorno": "2025-12-22T03:00:00.000Z",
        "tipo_viagem": "ida_volta",
        "numero_passageiros": 2,
        "adultos": 1,
        "criancas": 0,
        "bebes": 0,
        "classe_viagem": "economica",
        "companhia_preferida": null,
        "horario_preferido": null,
        "escalas": null,
        "orcamento_total": null,
        "orcamento_aproximado": null,
        "flexibilidade_datas": false,
        "selected_services": [
          "voos"
        ],
        "observacoes": "API Test - verificando conectividade backend e persistência database",
        "full_data": {}
      },
      {
        "id": "lead_1757251677869_bl61mvm4m",
        "created_at": "2025-09-07T13:27:57.869Z",
        "updated_at": "2025-09-07T13:27:58.310Z",
        "source": "mobile_flight_form_unified_premium",
        "status": "novo",
        "nome": "Vilmar Figueiredo",
        "email": "vi@g.com",
        "whatsapp": "",
        "telefone": "5511111",
        "sobrenome": null,
        "origem": "A definir",
        "destino": "A definir",
        "data_partida": null,
        "data_retorno": null,
        "tipo_viagem": "ida-volta",
        "numero_passageiros": 1,
        "adultos": 1,
        "criancas": 0,
        "bebes": 0,
        "classe_viagem": "economica",
        "companhia_preferida": null,
        "horario_preferido": null,
        "escalas": null,
        "orcamento_total": null,
        "orcamento_aproximado": null,
        "flexibilidade_datas": false,
        "selected_services": [
          "voos"
        ],
        "observacoes": "Tedte",
        "full_data": {}
      },
      {
        "id": "lead_1757247497172_qm0zyjb85",
        "created_at": "2025-09-07T12:18:17.172Z",
        "updated_at": "2025-09-07T12:18:17.591Z",
        "source": "mobile_flight_form_unified_premium",
        "status": "novo",
        "nome": "Mirna Gonzalez",
        "email": "mirba@gmail.com",
        "whatsapp": "",
        "telefone": "5561994475761",
        "sobrenome": null,
        "origem": "A definir",
        "destino": "A definir",
        "data_partida": null,
        "data_retorno": null,
        "tipo_viagem": "ida-volta",
        "numero_passageiros": 1,
        "adultos": 1,
        "criancas": 0,
        "bebes": 0,
        "classe_viagem": "economica",
        "companhia_preferida": null,
        "horario_preferido": null,
        "escalas": null,
        "orcamento_total": null,
        "orcamento_aproximado": null,
        "flexibilidade_datas": false,
        "selected_services": [
          "voos"
        ],
        "observacoes": "Teste",
        "full_data": {}
      },
      {
        "id": "lead_1757132857928_xvm4gagc5",
        "created_at": "2025-09-06T04:27:37.928Z",
        "updated_at": "2025-09-06T04:27:38.360Z",
        "source": "mobile_flight_form_unified_premium",
        "status": "novo",
        "nome": "Gil Fluru",
        "email": "eu@teste.cok",
        "whatsapp": "",
        "telefone": "5561994475761",
        "sobrenome": null,
        "origem": "A definir",
        "destino": "A definir",
        "data_partida": null,
        "data_retorno": null,
        "tipo_viagem": "ida-volta",
        "numero_passageiros": 1,
        "adultos": 1,
        "criancas": 0,
        "bebes": 0,
        "classe_viagem": "economica",
        "companhia_preferida": null,
        "horario_preferido": null,
        "escalas": null,
        "orcamento_total": null,
        "orcamento_aproximado": null,
        "flexibilidade_datas": false,
        "selected_services": [
          "voos"
        ],
        "observacoes": "Teste",
        "full_data": {}
      },
      {
        "id": "lead_1757127684998_yh40o03sz",
        "created_at": "2025-09-06T03:01:24.998Z",
        "updated_at": "2025-09-06T03:01:25.433Z",
        "source": "mobile_flight_form_unified_premium",
        "status": "novo",
        "nome": "Antonio Santos",
        "email": "eu@gnail.com",
        "whatsapp": "",
        "telefone": "5561994475761",
        "sobrenome": null,
        "origem": "A definir",
        "destino": "A definir",
        "data_partida": null,
        "data_retorno": null,
        "tipo_viagem": "ida-volta",
        "numero_passageiros": 1,
        "adultos": 1,
        "criancas": 0,
        "bebes": 0,
        "classe_viagem": "economica",
        "companhia_preferida": null,
        "horario_preferido": null,
        "escalas": null,
        "orcamento_total": null,
        "orcamento_aproximado": null,
        "flexibilidade_datas": false,
        "selected_services": [
          "voos"
        ],
        "observacoes": "Teste",
        "full_data": {}
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 5
  },
  "metadata": {
    "requestId": "get-test-1757470023768",
    "timestamp": "2025-09-10T02:07:04.037Z",
    "processingTime": 185,
    "storage": "database"
  }
}


### Database Persistence Results

#### Database Persistence
- **Status:** SUCCESS

- **Lead ID:** lead_1757470020192_w4gnollud



## 🔬 Network Analysis

### Response Analysis
- **Response Time:** 7280ms
- **Status Code:** 201
- **Content-Type:** application/json

### Response Headers
```json
{
  "vary": "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch",
  "content-type": "application/json",
  "x-request-id": "test-1757470014462",
  "date": "Wed, 10 Sep 2025 02:07:01 GMT",
  "connection": "keep-alive",
  "keep-alive": "timeout=5",
  "transfer-encoding": "chunked"
}
```

### Response Body
```json
{
  "success": true,
  "data": {
    "leadId": "lead_1757470020192_w4gnollud",
    "status": "novo",
    "createdAt": "2025-09-10T02:07:00.192Z"
  },
  "message": "Lead created successfully",
  "metadata": {
    "requestId": "test-1757470014462",
    "timestamp": "2025-09-10T02:07:01.714Z",
    "processingTime": 1554,
    "storage": "database"
  }
}
```

## 📋 Test Data Used

```json
{
  "nome": "João Silva API Test",
  "email": "joao.apitest@fly2any.com",
  "whatsapp": "+55 11 99999-8888",
  "cpf": "123.456.789-01",
  "dataNascimento": "1990-05-15",
  "cidade": "São Paulo",
  "estado": "SP",
  "pais": "Brasil",
  "tipoViagem": "ida_volta",
  "origem": {
    "iataCode": "GRU",
    "name": "São Paulo–Guarulhos International Airport",
    "city": "São Paulo",
    "country": "Brazil"
  },
  "destino": {
    "iataCode": "JFK",
    "name": "John F. Kennedy International Airport",
    "city": "New York",
    "country": "United States"
  },
  "dataPartida": "2025-12-15",
  "dataRetorno": "2025-12-22",
  "numeroPassageiros": 2,
  "classeViagem": "economica",
  "selectedServices": [
    "voos",
    "hospedagem"
  ],
  "precisaHospedagem": true,
  "tipoHospedagem": "hotel",
  "categoriaHospedagem": "4",
  "precisaTransporte": false,
  "orcamentoTotal": "5000_10000",
  "prioridadeOrcamento": "custo_beneficio",
  "experienciaViagem": "ocasional",
  "motivoViagem": "lazer",
  "preferenciaContato": "whatsapp",
  "melhorHorario": "qualquer",
  "comoConheceu": "google",
  "receberPromocoes": true,
  "observacoes": "API Test - verificando conectividade backend e persistência database",
  "necessidadeEspecial": "",
  "source": "api_test",
  "timestamp": "2025-09-10T02:06:54.455Z",
  "userAgent": "Node.js API Test",
  "pageUrl": "http://localhost:3000/"
}
```

## 🎯 Key Findings

### ✅ Working Components
- POST /api/leads responding correctly
- GET /api/leads responding correctly

### ❌ Issues Detected  



### 🔄 Database Connectivity
✅ Database persistence verified

---

*Report generated: 2025-09-10T02:07:04.050Z*
