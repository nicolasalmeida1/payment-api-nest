# API Usage Examples

## Criar Pagamento PIX

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Pagamento via PIX",
    "amount": 100.50,
    "paymentMethod": "PIX"
  }'
```

## Criar Pagamento com Cartão de Crédito

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "12345678901",
    "description": "Pagamento via Cartão",
    "amount": 250.00,
    "paymentMethod": "CREDIT_CARD"
  }'
```

**Resposta esperada:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-do-pagamento",
    "cpf": "12345678901",
    "description": "Pagamento via Cartão",
    "amount": "250.00",
    "paymentMethod": "CREDIT_CARD",
    "status": "PENDING",
    "createdAt": "2024-11-16T00:00:00.000Z",
    "updatedAt": "2024-11-16T00:00:00.000Z"
  },
  "mercadoPago": {
    "preference_id": "1234567890",
    "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=xxx",
    "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=xxx"
  }
}
```

## Buscar Pagamento por ID

```bash
curl -X GET http://localhost:3000/api/payment/uuid-do-pagamento
```

## Listar Pagamentos

```bash
# Listar todos
curl -X GET http://localhost:3000/api/payment

# Filtrar por CPF
curl -X GET "http://localhost:3000/api/payment?cpf=12345678901"

# Filtrar por status
curl -X GET "http://localhost:3000/api/payment?status=PENDING"

# Filtrar por método de pagamento
curl -X GET "http://localhost:3000/api/payment?paymentMethod=PIX"

# Paginação
curl -X GET "http://localhost:3000/api/payment?page=1&take=10"

# Múltiplos filtros
curl -X GET "http://localhost:3000/api/payment?cpf=12345678901&status=PAID&page=1&take=5"
```

## Atualizar Pagamento

```bash
# Atualizar status
curl -X PUT http://localhost:3000/api/payment/uuid-do-pagamento \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID"
  }'

# Atualizar descrição e valor
curl -X PUT http://localhost:3000/api/payment/uuid-do-pagamento \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Nova descrição",
    "amount": 150.00
  }'
```

## Webhook Mercado Pago

```bash
curl -X POST http://localhost:3000/api/webhooks/mercado-pago \
  -H "Content-Type: application/json" \
  -d '{
    "action": "payment.updated",
    "type": "payment",
    "data": {
      "id": "123456789"
    }
  }'
```

## Exemplos de Erros

### Pagamento não encontrado (404)

```bash
curl -X GET http://localhost:3000/api/payment/uuid-inexistente
```

**Resposta:**

```json
{
  "statusCode": 404,
  "message": "Payment not found: uuid-inexistente"
}
```

### Tentativa de atualizar pagamento já pago (400)

```bash
curl -X PUT http://localhost:3000/api/payment/uuid-pagamento-pago \
  -H "Content-Type: application/json" \
  -d '{
    "status": "FAIL"
  }'
```

**Resposta:**

```json
{
  "statusCode": 400,
  "message": "Payment already paid: uuid-pagamento-pago"
}
```

### Validação de CPF inválido (400)

```bash
curl -X POST http://localhost:3000/api/payment \
  -H "Content-Type: application/json" \
  -d '{
    "cpf": "123",
    "description": "Teste",
    "amount": 100,
    "paymentMethod": "PIX"
  }'
```

**Resposta:**

```json
{
  "statusCode": 400,
  "message": ["cpf must contain 11 numeric digits"],
  "error": "Bad Request"
}
```

## Testando com Postman

Importe a collection que está em `docs/postman/` para ter todos os exemplos prontos para uso.
