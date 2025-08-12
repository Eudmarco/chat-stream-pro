# Configurações de Segurança Final Para Produção

## ⚠️ Configurações Críticas que Devem ser Ajustadas no Painel Supabase

### 1. Proteção Contra Senhas Vazadas
**Status**: ❌ DESABILITADO (Requer ação manual)

**Como corrigir**:
1. Acesse o painel Supabase: https://supabase.com/dashboard/project/bhtyhbjbebwuzciencrk/auth/providers
2. Vá para Authentication > Settings > Password Protection
3. **ATIVE** "Leaked Password Protection"
4. Configure o nível de proteção desejado

**Documentação**: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

### 2. Tempo de Expiração OTP
**Status**: ❌ MUITO LONGO (Requer ação manual)

**Como corrigir**:
1. Acesse o painel Supabase: https://supabase.com/dashboard/project/bhtyhbjbebwuzciencrk/auth/providers
2. Vá para Authentication > Settings > Auth
3. Ajuste "OTP Expiry" para um valor menor (recomendado: máximo 10 minutos)

**Documentação**: https://supabase.com/docs/guides/platform/going-into-prod#security

## ✅ Correções Automatizadas Já Implementadas

### 1. Function Search Path
**Status**: ✅ CORRIGIDO
- Função `update_updated_at_column` agora tem `search_path` fixo em `public`
- Protege contra ataques de privilege escalation

## 🔒 Status de Segurança Final

### Políticas RLS
- ✅ Todas as tabelas têm RLS habilitado
- ✅ Políticas restritivas implementadas
- ✅ Edge Functions podem inserir dados usando service role

### Autenticação
- ✅ JWT obrigatório para todas as operações sensíveis
- ⚠️ Proteção contra senhas vazadas precisa ser habilitada manualmente
- ⚠️ Tempo de expiração OTP precisa ser ajustado manualmente

### Database
- ✅ Search path seguro para funções
- ✅ Triggers com SECURITY DEFINER
- ✅ Foreign keys e constraints implementados

## 📋 Checklist Final Antes do Go-Live

### Configurações Manuais Obrigatórias
- [ ] Habilitar Leaked Password Protection
- [ ] Ajustar tempo de expiração OTP (máximo 10 minutos)
- [ ] Configurar domínio personalizado
- [ ] Configurar SSL/HTTPS
- [ ] Configurar backup automático

### Testes de Produção
- [ ] Testar fluxo completo de registro/login
- [ ] Testar criação e gerenciamento de instâncias
- [ ] Testar envio de mensagens WhatsApp
- [ ] Testar pagamentos Stripe
- [ ] Verificar monitoramento e logs

### Performance
- [ ] Verificar tempo de carregamento < 3s
- [ ] Testar com múltiplos usuários simultâneos
- [ ] Verificar limites de rate limiting

## 🚨 CRÍTICO: Não Prossiga Sem Estas Correções

As configurações manuais de segurança são **OBRIGATÓRIAS** antes do go-live. O sistema não deve ser colocado em produção sem:

1. Proteção contra senhas vazadas habilitada
2. Tempo de expiração OTP ajustado
3. Domínio HTTPS configurado
4. Backup e recovery testados

## Links Úteis

- [Painel de Autenticação](https://supabase.com/dashboard/project/bhtyhbjbebwuzciencrk/auth/providers)
- [Configurações de Segurança](https://supabase.com/dashboard/project/bhtyhbjbebwuzciencrk/settings/general)
- [Documentação de Produção](https://supabase.com/docs/guides/platform/going-into-prod)