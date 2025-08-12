# Checklist de Produção - WhatsAPI

## 🔧 Configuração de Ambiente

### ✅ Supabase Configuration
- [ ] Projeto Supabase criado e configurado
- [ ] Todas as migrations executadas com sucesso
- [ ] RLS (Row Level Security) habilitado em todas as tabelas
- [ ] Policies de segurança configuradas e testadas
- [ ] Edge Functions deployadas automaticamente

### ✅ Secrets Management
Configure todas as secrets necessárias no Supabase:

```bash
# Stripe Integration
STRIPE_SECRET_KEY=sk_live_... (Production Secret Key)

# Evolution API Integration  
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua-chave-api

# Supabase (Auto-configured)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJ... (Auto-configured)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (Auto-configured)
SUPABASE_DB_URL=postgresql://... (Auto-configured)
```

### ✅ Database Verification
```sql
-- Verificar se todas as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar policies RLS
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar função de trigger
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public';
```

## 🔒 Segurança

### ✅ Authentication & Authorization
- [ ] Supabase Auth configurado corretamente
- [ ] Providers de autenticação habilitados (Email, Google, etc.)
- [ ] Políticas RLS testadas para todos os recursos
- [ ] JWT tokens configurados corretamente
- [ ] Session management funcional

### ✅ Data Protection
- [ ] Todas as tabelas com RLS habilitado
- [ ] Users só acessam seus próprios dados
- [ ] Secrets protegidas em Edge Functions
- [ ] Validação de entrada em todos os endpoints
- [ ] Rate limiting implementado

### ✅ SSL & HTTPS
- [ ] HTTPS obrigatório em produção
- [ ] Certificados SSL válidos
- [ ] CORS configurado corretamente
- [ ] Headers de segurança configurados

## 💳 Stripe Integration

### ✅ Products & Pricing
- [ ] Produtos criados no Stripe Dashboard
- [ ] Preços configurados corretamente (BRL)
- [ ] Customer Portal habilitado
- [ ] Webhook endpoints configurados (opcional)

### ✅ Checkout Flow
- [ ] create-checkout Edge Function funcionando
- [ ] Redirecionamento pós-pagamento funcional  
- [ ] check-subscription atualizando status
- [ ] customer-portal permitindo gestão

### ✅ Testing
```bash
# Teste checkout básico
curl -X POST https://seu-projeto.supabase.co/functions/v1/create-checkout \
  -H "Authorization: Bearer seu-token" \
  -H "Content-Type: application/json" \
  -d '{"plan": "basic"}'

# Teste verificação subscription
curl -X POST https://seu-projeto.supabase.co/functions/v1/check-subscription \
  -H "Authorization: Bearer seu-token"

# Teste customer portal
curl -X POST https://seu-projeto.supabase.co/functions/v1/customer-portal \
  -H "Authorization: Bearer seu-token"
```

## 📱 Evolution API Integration

### ✅ API Configuration
- [ ] Evolution API deployada e acessível
- [ ] HTTPS configurado com SSL válido
- [ ] API Key configurada e segura
- [ ] Webhook endpoint configurado
- [ ] Rate limiting configurado

### ✅ Instance Management
- [ ] Criação de instâncias funcionando
- [ ] QR Code generation funcionando
- [ ] Status updates em tempo real
- [ ] Disconnect/reconnect funcionando

### ✅ Message Processing
- [ ] Envio de mensagens funcionando
- [ ] Validação de números
- [ ] Rate limiting por plano
- [ ] Logs de mensagens funcionando

### ✅ Testing
```bash
# Teste criação de instância
curl -X POST https://sua-evolution-api.com/instance/create \
  -H "apikey: sua-api-key" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "test-instance"}'

# Teste status da instância
curl -X GET https://sua-evolution-api.com/instance/connectionState/test-instance \
  -H "apikey: sua-api-key"
```

## 🌐 Frontend Deployment

### ✅ Build & Deploy
- [ ] Build de produção sem erros
- [ ] Assets otimizados (imagens, CSS, JS)
- [ ] Bundle size otimizado
- [ ] Source maps removidos/configurados

### ✅ Domain Configuration
- [ ] Domínio personalizado configurado
- [ ] DNS apontando corretamente
- [ ] SSL certificate válido
- [ ] Redirects HTTP -> HTTPS funcionando

### ✅ Performance
```bash
# Verificar performance
npm run build
# Bundle size < 500KB (gzipped)
# First load < 3s
# Core Web Vitals green
```

## 📊 Monitoring & Logging

### ✅ System Monitoring
- [ ] SystemMonitoring component implementado
- [ ] Health checks configurados
- [ ] Métricas sendo coletadas
- [ ] Alertas configurados para falhas

### ✅ Logging
- [ ] Logs estruturados em Edge Functions
- [ ] Error tracking implementado
- [ ] Performance logging ativo
- [ ] User action logging (opcional)

### ✅ Analytics
- [ ] Usage tracking implementado
- [ ] Conversion tracking configurado
- [ ] Performance metrics coletadas
- [ ] Business metrics dashboards

## 🧪 Testing

### ✅ End-to-End Testing
- [ ] Registration flow completo
- [ ] Login/logout funcionando
- [ ] Subscription checkout completo
- [ ] Instance creation & QR scan
- [ ] Message sending funcionando
- [ ] Webhook receiving funcionando

### ✅ Load Testing
```bash
# Teste de carga básico
for i in {1..100}; do
  curl -X POST https://seu-dominio.com/api/test &
done
wait
```

### ✅ Security Testing
- [ ] SQL injection testing
- [ ] XSS protection testing
- [ ] CSRF protection testing  
- [ ] Authentication bypass testing
- [ ] Authorization testing

## 🚀 Go-Live Checklist

### ✅ Pre-Launch
- [ ] Todos os testes passando
- [ ] Backup strategy configurada
- [ ] Rollback plan documentado
- [ ] Support team preparado
- [ ] Documentation atualizada

### ✅ Launch Day
- [ ] Deploy em horário de baixo tráfego
- [ ] Monitoring ativo durante deploy
- [ ] Health checks verificados
- [ ] Critical user journeys testados
- [ ] Support team em standby

### ✅ Post-Launch
- [ ] Monitor por 24h após launch
- [ ] Verificar métricas de erro
- [ ] Confirmar performance targets
- [ ] Coletar feedback inicial de usuários
- [ ] Document lessons learned

## 🔧 Maintenance

### ✅ Regular Tasks
- [ ] Database backups automáticos
- [ ] Security updates regulares
- [ ] Performance monitoring contínuo
- [ ] User feedback review
- [ ] Financial metrics tracking

### ✅ Scaling Preparation
- [ ] Database performance optimization
- [ ] CDN configuration para assets
- [ ] Edge Function scaling limits
- [ ] Evolution API scaling plan
- [ ] Support scaling plan

## 📞 Emergency Contacts

### ✅ Support Channels
- [ ] Supabase support configurado
- [ ] Stripe support configurado  
- [ ] Evolution API support
- [ ] DNS/Domain registrar support
- [ ] Internal team escalation

## 🎯 Success Metrics

### ✅ KPIs to Track
- [ ] User registration rate
- [ ] Subscription conversion rate
- [ ] Instance creation success rate
- [ ] Message delivery success rate
- [ ] User retention rate
- [ ] Support ticket volume
- [ ] System uptime percentage

---

## ✅ Final Verification

Antes de ir live, execute este último check:

```bash
# 1. Testar fluxo completo de usuário
# 2. Verificar todos os endpoints críticos
# 3. Confirmar backup e rollback procedures
# 4. Validar monitoring e alerting
# 5. Confirmar support readiness

echo "🚀 WhatsAPI está pronto para produção!"
```

**Status: [ ] APROVADO PARA PRODUÇÃO**

Data: _______________
Aprovado por: _______________