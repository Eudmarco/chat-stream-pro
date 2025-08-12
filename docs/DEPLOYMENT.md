# Guia de Implantação - WhatsAPI

## Pré-requisitos

### 1. Contas Necessárias
- ✅ Conta no Supabase
- ✅ Conta no Stripe
- ✅ Evolution API configurada
- ✅ Domínio personalizado (opcional)

### 2. Variáveis de Ambiente

Configure as seguintes secrets no Supabase:

```bash
STRIPE_SECRET_KEY=sk_live_...  # Chave secreta do Stripe (produção)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-da-evolution-api
```

## Passo a Passo da Implantação

### 1. Configuração do Supabase

#### 1.1 Database Setup
```sql
-- As tabelas já foram criadas via migrations
-- Verifique se todas as policies estão ativas:
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

#### 1.2 Authentication Settings
- Acesse: Authentication → Settings
- Configure providers necessários (Email, Google, etc.)
- Definir URLs de redirecionamento:
  - Site URL: `https://seu-dominio.com`
  - Redirect URLs: `https://seu-dominio.com/**`

#### 1.3 Edge Functions
As funções estão automaticamente deployadas:
- `check-subscription`
- `create-checkout` 
- `customer-portal`
- `evolution-create-instance`
- `evolution-get-qr`
- `evolution-send-message`
- `evolution-webhook`

### 2. Configuração do Stripe

#### 2.1 Produtos e Preços
Criar produtos no Stripe Dashboard:

**Plano Básico - R$ 49/mês:**
```bash
# Via Stripe CLI ou Dashboard
stripe products create --name="Plano Básico WhatsAPI"
stripe prices create --product=prod_xxx --currency=brl --unit-amount=4900 --recurring-interval=month
```

**Plano Pro - R$ 149/mês:**
```bash
stripe products create --name="Plano Pro WhatsAPI"
stripe prices create --product=prod_xxx --currency=brl --unit-amount=14900 --recurring-interval=month
```

#### 2.2 Customer Portal
- Acesse: Settings → Billing → Customer Portal
- Ative o portal do cliente
- Configure funcionalidades permitidas:
  - ✅ Cancelar assinatura
  - ✅ Atualizar método de pagamento
  - ✅ Ver faturas
  - ✅ Baixar faturas

#### 2.3 Webhooks (Opcional)
Se desejar usar webhooks do Stripe:
```bash
# Endpoint: https://seu-projeto.supabase.co/functions/v1/stripe-webhook
# Eventos: subscription_schedule.*, customer.subscription.*
```

### 3. Configuração da Evolution API

#### 3.1 Instalação
```bash
# Docker Compose (recomendado)
git clone https://github.com/EvolutionAPI/evolution-api
cd evolution-api
docker-compose up -d
```

#### 3.2 Configuração
```yaml
# docker-compose.yml
environment:
  - SERVER_TYPE=https
  - SERVER_PORT=8080
  - SERVER_URL=https://sua-evolution-api.com
  - AUTHENTICATION_API_KEY=sua-chave-super-secreta
```

#### 3.3 Nginx Proxy (Produção)
```nginx
server {
    listen 443 ssl;
    server_name sua-evolution-api.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Deployment do Frontend

#### 4.1 Via Lovable (Recomendado)
1. Clique em "Publish" no editor Lovable
2. Configure domínio personalizado (plano pago)
3. SSL automático via Cloudflare

#### 4.2 Via Vercel
```bash
npm run build
vercel deploy --prod
```

#### 4.3 Via Netlify
```bash
npm run build
netlify deploy --prod --dir=dist
```

### 5. Configurações de Produção

#### 5.1 Segurança
- ✅ HTTPS obrigatório
- ✅ CORS configurado
- ✅ Rate limiting ativo
- ✅ Logs habilitados

#### 5.2 Monitoramento
```typescript
// Adicionar ao código
import { supabase } from '@/integrations/supabase/client';

// Log erros críticos
const logError = async (error: Error, context: string) => {
  await supabase.from('logs').insert({
    level: 'error',
    message: error.message,
    data: { context, stack: error.stack }
  });
};
```

#### 5.3 Backup
```sql
-- Backup automático (configurar no Supabase)
-- Retenção: 7 dias (plano gratuito) / 30 dias (plano pago)
```

### 6. Validação Pós-Deploy

#### 6.1 Testes de Funcionalidade
```bash
# Teste criação de instância
curl -X POST https://seu-dominio.com/api/instances \
  -H "Authorization: Bearer token" \
  -d '{"name": "Teste"}'

# Teste checkout
curl -X POST https://seu-projeto.supabase.co/functions/v1/create-checkout \
  -H "Authorization: Bearer token" \
  -d '{"plan": "basic"}'
```

#### 6.2 Verificações de Segurança
- [ ] RLS policies funcionando
- [ ] Edge functions autenticando
- [ ] Stripe webhooks (se configurado)
- [ ] Evolution API respondendo

#### 6.3 Performance
- [ ] Tempo de resposta < 2s
- [ ] Bundle size otimizado
- [ ] Imagens otimizadas
- [ ] Caching configurado

### 7. Maintenance

#### 7.1 Logs e Monitoramento
```typescript
// Acesso via Supabase Dashboard
// Logs → Functions → [function-name]
// Analytics → API usage
```

#### 7.2 Updates
```bash
# Frontend updates via Lovable
# Database migrations via Supabase CLI
# Evolution API updates via Docker
```

#### 7.3 Scaling
```yaml
# Evolution API scaling
version: '3.8'
services:
  evolution-api:
    replicas: 3
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '0.5'
```

## Troubleshooting

### Problemas Comuns

#### 1. Edge Function Timeout
```typescript
// Adicionar timeout handling
const response = await fetch(url, {
  signal: AbortSignal.timeout(30000) // 30s
});
```

#### 2. Stripe Webhook Failures
```bash
# Verificar logs no Stripe Dashboard
# Reprocessar eventos falhados
stripe events resend evt_xxx
```

#### 3. Evolution API Connection
```bash
# Verificar status
curl https://sua-evolution-api.com/manager/status

# Restart container
docker-compose restart evolution-api
```

## Suporte

- **Supabase:** https://supabase.com/docs
- **Stripe:** https://stripe.com/docs
- **Evolution API:** https://github.com/EvolutionAPI/evolution-api
- **Lovable:** https://docs.lovable.dev

## Checklist Final

- [ ] ✅ Database migrado e RLS ativo
- [ ] ✅ Edge functions deployadas  
- [ ] ✅ Stripe configurado
- [ ] ✅ Evolution API funcionando
- [ ] ✅ Frontend deployado
- [ ] ✅ SSL configurado
- [ ] ✅ Domínio apontando
- [ ] ✅ Monitoring ativo
- [ ] ✅ Backups configurados
- [ ] ✅ Testes de integração passando

🚀 **Parabéns! Sua WhatsAPI está em produção!**