# 🚀 Fly2Any Hotel API Reference

## 📋 **Visão Geral**

API completa de hotéis baseada na LiteAPI v3.0.0, implementando todos os endpoints documentados com funcionalidades profissionais de produção.

**Base URL**: `https://localhost:3000/api/hotels`

---

## 🔐 **Autenticação**

Todos os endpoints requerem autenticação via header:

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

---

## 📊 **Endpoints Implementados**

### **1. Data Endpoints (Dados Estáticos)**

#### **🌍 Countries**
```http
GET /api/hotels/countries
```

**Parâmetros:**
- `search` (string): Buscar por nome ou código
- `continent` (string): Filtrar por continente
- `currency` (string): Filtrar por moeda
- `limit` (number): Limite de resultados (max: 100)

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "countries": [
      {
        "id": "BR",
        "name": "Brasil",
        "iso2": "BR",
        "iso3": "BRA",
        "continent": "South America",
        "currency": "BRL",
        "phoneCode": "+55",
        "hotelCount": 15420,
        "popularCities": ["São Paulo", "Rio de Janeiro"],
        "flag": "🇧🇷"
      }
    ],
    "totalCount": 10,
    "continents": ["South America", "North America", "Europe", "Asia", "Oceania"],
    "currencies": ["BRL", "USD", "EUR", "GBP", "JPY"]
  }
}
```

#### **💰 Currencies**
```http
GET /api/hotels/currencies
```

**Parâmetros:**
- `popular` (boolean): Apenas moedas populares
- `country` (string): Filtrar por país
- `convert` (boolean): Habilitar conversão
- `amount` (number): Valor para conversão
- `from` (string): Moeda origem (default: BRL)
- `to` (string): Moeda destino (default: USD)

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "currencies": [
      {
        "code": "BRL",
        "name": "Brazilian Real",
        "symbol": "R$",
        "countries": ["BR"],
        "exchangeRate": 1.0,
        "popular": true
      }
    ],
    "conversion": {
      "originalAmount": 100,
      "convertedAmount": 20.50,
      "fromCurrency": {"code": "BRL", "symbol": "R$"},
      "toCurrency": {"code": "USD", "symbol": "$"},
      "exchangeRate": 0.205
    }
  }
}
```

#### **📍 Places**
```http
GET /api/hotels/places
```

**Parâmetros:**
- `search` (string): Buscar locais
- `country` (string): Filtrar por país
- `type` (string): Tipo (city, island, etc.)
- `category` (string): Categoria (beach, business, cultural, nature)
- `popular` (boolean): Apenas destinos populares
- `limit` (number): Limite (max: 50)

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "places": [
      {
        "id": "place-rio-de-janeiro",
        "name": "Rio de Janeiro",
        "type": "city",
        "country": "Brasil",
        "countryCode": "BR",
        "coordinates": {
          "latitude": -22.9068,
          "longitude": -43.1729
        },
        "hotelCount": 1247,
        "averagePrice": 450,
        "currency": "BRL",
        "description": "Cidade Maravilhosa com praias icônicas",
        "landmarks": ["Copacabana", "Ipanema", "Cristo Redentor"],
        "airports": ["GIG", "SDU"],
        "popular": true,
        "category": "beach"
      }
    ],
    "suggestions": []
  }
}
```

#### **🏨 Cities**
```http
GET /api/hotels/cities
```

**Parâmetros:**
- `search` (string): Buscar cidades
- `country` (string): Código do país
- `popular` (boolean): Apenas cidades populares
- `limit` (number): Limite de resultados

#### **🏠 Facilities**
```http
GET /api/hotels/facilities
```

**Parâmetros:**
- `category` (string): Categoria de facilidade

### **2. Search Endpoints**

#### **🔍 Hotel Search**
```http
GET /api/hotels/search
```

**Parâmetros obrigatórios:**
- `destination` (string): Destino da busca
- `checkIn` (string): Data check-in (YYYY-MM-DD)
- `checkOut` (string): Data check-out (YYYY-MM-DD)
- `adults` (number): Número de adultos
- `rooms` (number): Número de quartos

**Parâmetros opcionais:**
- `children` (number): Número de crianças
- `currency` (string): Moeda (default: BRL)
- `minPrice` / `maxPrice` (number): Faixa de preço
- `starRating` (string): Filtro por estrelas
- `sortBy` (string): Ordenação (price, rating, distance, stars)
- `limit` (number): Limite de resultados

#### **🏨 Hotel Details**
```http
GET /api/hotels/{id}
```

**Parâmetros:**
- `checkIn` (string): Data check-in
- `checkOut` (string): Data check-out
- `adults` (number): Adultos
- `children` (number): Crianças
- `rooms` (number): Quartos
- `includeRates` (boolean): Incluir tarifas

### **3. Booking Endpoints**

#### **📋 Pre-booking**
```http
POST /api/hotels/booking/prebook
```

**Body:**
```json
{
  "rateId": "string",
  "hotelId": "string",
  "searchParams": {
    "checkIn": "2024-07-30",
    "checkOut": "2024-07-31",
    "adults": 2,
    "children": 0,
    "rooms": 1,
    "currency": "BRL"
  }
}
```

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "prebookId": "demo_prebook_1234567890",
    "status": "confirmed",
    "validUntil": "2024-07-29T22:15:00.000Z",
    "totalPrice": {
      "amount": 850,
      "currency": "BRL",
      "formatted": "R$ 850,00"
    }
  }
}
```

#### **✅ Confirm Booking**
```http
POST /api/hotels/booking/confirm
```

**Body:**
```json
{
  "prebookId": "string",
  "guests": [
    {
      "title": "Mr",
      "firstName": "João",
      "lastName": "Silva",
      "isMainGuest": true
    }
  ],
  "contact": {
    "email": "joao@email.com",
    "phone": "+55 11 99999-9999"
  },
  "specialRequests": "Vista para o mar"
}
```

### **4. Analytics Endpoints**

#### **📊 Weekly Analytics**
```http
GET /api/hotels/analytics/weekly
```

**Parâmetros:**
- `weeks` (number): Número de semanas (default: 12)
- `currency` (string): Moeda para relatórios

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "summary": {
      "totalBookings": 1800,
      "totalRevenue": 756000,
      "averageBookingValue": 420,
      "uniqueGuests": 1530,
      "averageConversionRate": 12.5,
      "growth": {
        "bookings": 8.5,
        "revenue": 12.3,
        "conversionRate": -2.1
      }
    },
    "weeklyData": [],
    "topDestinations": [
      {
        "city": "São Paulo",
        "bookings": 450
      }
    ]
  }
}
```

### **5. Loyalty Program Endpoints**

#### **👥 Guests**
```http
GET /api/hotels/loyalty/guests
```

**Parâmetros:**
- `search` (string): Buscar hóspedes
- `tier` (string): Filtrar por nível (Bronze, Silver, Gold, Platinum)
- `status` (string): Status da conta
- `limit` (number): Limite de resultados
- `offset` (number): Offset para paginação

**Resposta:**
```json
{
  "status": "success",
  "data": {
    "guests": [
      {
        "id": "guest-001",
        "personalInfo": {
          "firstName": "Maria",
          "lastName": "Silva",
          "email": "maria.silva@email.com",
          "nationality": "BR"
        },
        "loyaltyProgram": {
          "membershipId": "FLY2ANY001",
          "tier": "Gold",
          "status": "active",
          "totalPoints": 12450,
          "availablePoints": 8200,
          "nextTierPoints": 2550,
          "nextTier": "Platinum",
          "lifetime": {
            "totalBookings": 18,
            "totalSpent": 15680.50,
            "totalNights": 42
          }
        }
      }
    ],
    "summary": {
      "totalGuests": 1500,
      "totalActiveGuests": 1420,
      "tierDistribution": {
        "Bronze": 800,
        "Silver": 450,
        "Gold": 200,
        "Platinum": 50
      }
    }
  }
}
```

### **6. Voucher System Endpoints**

#### **🎫 Vouchers**
```http
GET /api/hotels/vouchers
```

**Parâmetros:**
- `status` (string): Status (active, paused, expired)
- `type` (string): Tipo (percentage, fixed, nights)
- `search` (string): Buscar vouchers
- `validate` (string): Validar código específico
- `bookingValue` (number): Valor da reserva para validação
- `destination` (string): Destino para validação
- `guestTier` (string): Nível do hóspede

**Resposta (listagem):**
```json
{
  "status": "success",
  "data": {
    "vouchers": [
      {
        "id": "voucher-001",
        "code": "SUMMER2024",
        "type": "percentage",
        "value": 15,
        "description": "Desconto de 15% para reservas de verão",
        "status": "active",
        "validFrom": "2024-06-01",
        "validUntil": "2024-09-30",
        "maxUses": 1000,
        "currentUses": 247,
        "minBookingValue": 500
      }
    ]
  }
}
```

**Resposta (validação):**
```json
{
  "status": "success",
  "data": {
    "voucher": {},
    "validation": {
      "valid": true,
      "discount": 127.50
    }
  }
}
```

#### **✨ Create Voucher**
```http
POST /api/hotels/vouchers
```

**Body:**
```json
{
  "code": "NEWVOUCHER",
  "type": "percentage",
  "value": 20,
  "description": "Novo voucher de desconto",
  "validFrom": "2024-08-01",
  "validUntil": "2024-12-31",
  "maxUses": 500,
  "minBookingValue": 300
}
```

---

## 📈 **Códigos de Status**

- **200** - Sucesso
- **201** - Criado com sucesso
- **400** - Dados inválidos
- **401** - Não autorizado
- **404** - Não encontrado
- **409** - Conflito (recurso já existe)
- **429** - Limite de taxa excedido
- **500** - Erro interno do servidor
- **503** - Serviço indisponível

---

## 🔧 **Rate Limiting**

- **Search**: 100 requests/minuto
- **Booking**: 20 requests/minuto  
- **Data**: 200 requests/minuto

---

## 💾 **Cache**

- **TTL**: 5 minutos para dados de busca
- **Invalidação**: Automática em atualizações
- **Headers**: Cache-Control headers presentes

---

## 🛡️ **Segurança**

- Autenticação por API Key
- Rate limiting implementado
- Validação rigorosa de dados
- Sanitização de inputs
- CORS configurado

---

## 📝 **Exemplos de Uso**

### **Buscar hotéis**
```bash
curl -X GET "http://localhost:3000/api/hotels/search?destination=Rio+de+Janeiro&checkIn=2024-07-30&checkOut=2024-07-31&adults=2&rooms=1" \
  -H "X-API-Key: YOUR_API_KEY"
```

### **Validar voucher**
```bash
curl -X GET "http://localhost:3000/api/hotels/vouchers?validate=SUMMER2024&bookingValue=800&destination=Rio+de+Janeiro" \
  -H "X-API-Key: YOUR_API_KEY"
```

### **Analytics semanais**
```bash
curl -X GET "http://localhost:3000/api/hotels/analytics/weekly?weeks=8&currency=BRL" \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## 🎯 **SDKs e Integrações**

- **Postman Collection**: Disponível
- **Node.js SDK**: Em desenvolvimento
- **Python SDK**: Planejado
- **TypeScript Types**: Incluído

---

**API Reference v1.0.0 - Sistema Profissional Fly2Any**

*Baseado na LiteAPI v3.0.0 - Documentação completa*