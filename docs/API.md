# WhatsAPI - Documentação da API

## Visão Geral

WhatsAPI é uma plataforma SaaS que permite a integração com WhatsApp através da Evolution API. Esta documentação descreve como usar as principais funcionalidades da API.

## Autenticação

Todas as requisições para a API requerem autenticação via token JWT do Supabase:

```bash
Authorization: Bearer <seu-token-jwt>
```

## Endpoints Principais

### 1. Criação de Instâncias

**POST** `/instances`

Cria uma nova instância do WhatsApp.

```typescript
// Frontend - Usando a API client
import { api } from '@/lib/api';

const instance = await api.createInstance('Minha Instância');
```

**Resposta:**
```json
{
  "id": "uuid",
  "name": "Minha Instância",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### 2. Obter QR Code

**GET** `/instances/{id}/qr`

Obtém o código QR para conectar a instância ao WhatsApp.

```typescript
const qrData = await api.getQRCode(instanceId);
```

**Resposta:**
```json
{
  "qr_code": "data:image/png;base64,...",
  "state": "open"
}
```

### 3. Envio de Mensagens

**POST** `/messages`

Envia uma mensagem através de uma instância.

```typescript
await api.sendMessage({
  instanceId: 'uuid',
  number: '5511999999999',
  message: 'Olá! Esta é uma mensagem automática.'
});
```

**Payload:**
```json
{
  "instanceId": "uuid",
  "number": "5511999999999",
  "message": "Texto da mensagem"
}
```

### 4. Webhooks

**POST** `/webhooks`

Cadastra um webhook para receber eventos.

```typescript
await api.addWebhook('https://sua-api.com/webhook');
```

**Formato dos eventos recebidos:**
```json
{
  "event": "message.received",
  "instanceId": "uuid",
  "data": {
    "from": "5511999999999",
    "message": "Texto recebido",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Limites por Plano

### Plano Básico (R$ 49/mês)
- **Instâncias:** 3
- **Mensagens:** 1.000/mês
- **Webhooks:** 5

### Plano Pro (R$ 149/mês)
- **Instâncias:** 10
- **Mensagens:** 10.000/mês
- **Webhooks:** 20

### Plano Enterprise
- **Instâncias:** Ilimitadas
- **Mensagens:** Ilimitadas
- **Webhooks:** Ilimitados

## Estados das Instâncias

- `pending`: Instância criada, aguardando configuração
- `open`: Instância conectada e pronta para uso
- `closed`: Instância desconectada
- `connecting`: Instância tentando conectar

## Códigos de Erro

### 400 - Bad Request
```json
{
  "error": "Parâmetros inválidos"
}
```

### 403 - Forbidden
```json
{
  "error": "Limite de uso excedido"
}
```

### 404 - Not Found
```json
{
  "error": "Instância não encontrada"
}
```

### 500 - Internal Server Error
```json
{
  "error": "Erro interno do servidor"
}
```

## Exemplos de Uso

### Fluxo Completo

1. **Criar instância:**
```typescript
const instance = await api.createInstance('Bot Vendas');
```

2. **Obter QR Code:**
```typescript
const qr = await api.getQRCode(instance.id);
// Exibir qr.qr_code para escaneamento
```

3. **Aguardar conexão:**
```typescript
// Verificar status periodicamente
const instanceData = await api.getInstance(instance.id);
if (instanceData.status === 'open') {
  // Pronto para enviar mensagens
}
```

4. **Enviar mensagem:**
```typescript
await api.sendMessage({
  instanceId: instance.id,
  number: '5511999999999',
  message: 'Olá! Sua instância está conectada!'
});
```

## Boas Práticas

1. **Rate Limiting:** Respeite os limites do seu plano
2. **Webhooks:** Use webhooks para receber eventos em tempo real
3. **Monitoramento:** Monitore logs e métricas no dashboard
4. **Reconexão:** Implemente lógica de reconexão automática
5. **Validação:** Sempre valide números antes de enviar mensagens

## Suporte

Para suporte técnico ou dúvidas sobre a API, entre em contato através do portal do cliente.