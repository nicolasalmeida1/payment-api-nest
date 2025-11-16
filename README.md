# payment-api-nest

API de pagamentos com integração Mercado Pago e orquestração via Temporal.io usando NestJS

## 🚀 Tecnologias

- **NestJS** - Framework Node.js progressivo
- **TypeScript** - Superset tipado do JavaScript
- **Prisma** - ORM moderno para TypeScript/Node.js
- **PostgreSQL** - Banco de dados relacional
- **Temporal.io** - Orquestração de workflows duráveis
- **Mercado Pago** - Gateway de pagamento
- **Express** - Framework web (integrado ao NestJS)
- **Jest** - Framework de testes

## 📋 Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- Temporal CLI (para desenvolvimento)
- npm ou yarn

## 🔧 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate
```

## 🏃 Executando

### API REST

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

### Temporal Server (Desenvolvimento)

```bash
npm run temporal:dev
```

### Temporal Worker

```bash
npm run temporal:worker
```

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar com watch mode
npm run test:watch

# Executar com coverage
npm run test:cov
```

📖 **Documentação completa**: [docs/TESTING.md](docs/TESTING.md)

**Cobertura atual:**
- ✅ Controllers: 100%
- ✅ Services: 97.64% 
- ✅ Repositories: 98.11%
- ✅ DTOs: 93.1%
- ✅ Exceptions: 100%
- ✅ Total: **85 testes passando** | Cobertura geral: **65.99%**

## 📚 API Endpoints

### Pagamentos

#### Criar Pagamento

```bash
POST /api/payment
Content-Type: application/json

{
  "cpf": "12345678901",
  "description": "Pagamento de teste",
  "amount": 100.50,
  "paymentMethod": "PIX" | "CREDIT_CARD"
}
```

#### Atualizar Pagamento

```bash
PUT /api/payment/:id
Content-Type: application/json

{
  "status": "PAID" | "PENDING" | "FAIL",
  "description": "Nova descrição",
  "amount": 150.00
}
```

#### Buscar Pagamento por ID

```bash
GET /api/payment/:id
```

#### Listar Pagamentos

```bash
GET /api/payment?cpf=12345678901&status=PENDING&page=1&take=10
```

### Webhooks

#### Webhook Mercado Pago

```bash
POST /api/webhooks/mercado-pago
Content-Type: application/json

{
  "action": "payment.updated",
  "type": "payment",
  "data": {
    "id": "123456789"
  }
}
```

## 🏗️ Arquitetura

Este projeto segue os princípios de **Clean Architecture** com NestJS:

```
src/
├── common/              # Enums, exceptions e utilidades compartilhadas
│   ├── enums/          # PaymentStatus, PaymentMethod, etc.
│   └── exceptions/     # Custom exceptions
├── payment/            # Módulo de pagamentos
│   ├── controllers/    # Controllers (REST endpoints)
│   ├── dto/           # Data Transfer Objects com validações
│   ├── repositories/  # Camada de acesso a dados
│   ├── services/      # Lógica de negócio
│   └── payment.module.ts
├── prisma/            # Configuração do Prisma
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── temporal/          # Integração com Temporal.io
│   ├── activities/    # Activities do Temporal
│   ├── workflows/     # Workflows do Temporal
│   ├── client.ts      # Cliente Temporal
│   └── start-worker.ts
├── app.module.ts      # Módulo raiz
└── main.ts           # Entry point
```

## 🔐 Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/payment_db

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=your_token_here
MERCADO_PAGO_BASE_URL=https://api.mercadopago.com
APP_URL=http://localhost:3000

# Temporal
TEMPORAL_ADDRESS=localhost:7233
TEMPORAL_NAMESPACE=default

# Server
PORT=3000
```

## 🗄️ Prisma Commands

```bash
# Gerar Prisma Client
npm run prisma:generate

# Criar nova migration
npm run prisma:migrate:create

# Executar migrations
npm run prisma:migrate

# Deploy migrations (produção)
npm run prisma:migrate:deploy

# Abrir Prisma Studio
npm run prisma:studio

# Executar seeds
npm run prisma:seed
```

## 📊 Status

- ✅ CRUD de pagamentos
- ✅ Integração Mercado Pago
- ✅ Webhooks
- ✅ Temporal.io workflows
- ✅ Validações com class-validator
- ✅ Logging estruturado
- ✅ Tratamento de erros
- ✅ Suporte a transações

## 🔄 Migração do projeto original

Este projeto é uma reimplementação completa do [payment-api](../payment-api) usando NestJS:

- **Fastify → NestJS/Express**: Framework moderno com injeção de dependências
- **Objection.js → Prisma**: ORM type-safe com melhor DX
- **Joi → class-validator**: Validações integradas ao NestJS
- **Knex migrations → Prisma migrations**: Migrations mais simples e type-safe
- **Manual DI → NestJS DI**: Sistema de injeção de dependências robusto

## 📝 Licença

ISC

## 👤 Autor

Nicolas Gabriel de Almeida