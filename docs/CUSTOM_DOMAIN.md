# 🚀 Configuração de Domínio Personalizado - WhatsAPI

## Visão Geral

Este guia te ajudará a configurar um domínio personalizado para sua plataforma WhatsAPI hospedada no Lovable. Com um domínio personalizado, seus usuários acessarão sua plataforma através de um endereço profissional como `app.suaempresa.com`.

## Pré-requisitos

- ✅ Projeto WhatsAPI funcional no Lovable
- ✅ Domínio registrado (ex: `suaempresa.com`)
- ✅ Acesso ao painel de controle do seu registrador de domínio
- ✅ Plano pago do Lovable (necessário para domínios personalizados)

## Passo a Passo

### 1. Configurar no Lovable

1. **Acesse as configurações do projeto:**
   - Vá para seu projeto no Lovable
   - Clique em **Settings** → **Domains**

2. **Adicionar domínio:**
   - Clique em **Connect Domain**
   - Digite seu domínio (ex: `app.suaempresa.com`)
   - Clique em **Add Domain**

3. **Obter configurações DNS:**
   - O Lovable fornecerá as configurações DNS necessárias
   - Anote os valores para configurar no seu registrador

### 2. Configurar DNS

#### Configuração Padrão (Recomendada)
No painel do seu registrador de domínio, adicione:

```dns
# Para subdomínio (app.suaempresa.com)
Type: A Record
Name: app
Value: 185.158.133.1

# Para domínio raiz (suaempresa.com) - opcional
Type: A Record  
Name: @
Value: 185.158.133.1

# Para www (www.suaempresa.com) - opcional
Type: A Record
Name: www
Value: 185.158.133.1
```

#### Exemplos por Registrador

**Hostgator:**
1. Acesse cPanel → Zone Editor
2. Adicione registro A:
   - Name: `app`
   - Type: `A`
   - Address: `185.158.133.1`

**GoDaddy:**
1. Acesse DNS Management
2. Adicione registro:
   - Type: `A`
   - Host: `app`
   - Points to: `185.158.133.1`

**Cloudflare:**
1. Acesse DNS tab
2. Add record:
   - Type: `A`
   - Name: `app`
   - IPv4 address: `185.158.133.1`
   - Proxy status: 🟠 (DNS only)

**Registro.br:**
1. Acesse painel de controle
2. DNS → Editar zona
3. Adicione:
   - Nome: `app`
   - Tipo: `A`
   - Dados: `185.158.133.1`

### 3. Verificação

#### Testar Propagação DNS
Use estas ferramentas para verificar se o DNS está propagado:

```bash
# Via terminal (Linux/Mac)
nslookup app.suaempresa.com

# Via browser
https://dnschecker.org
https://whatsmydns.net
```

#### Checklist de Verificação
- [ ] DNS propagado globalmente
- [ ] Domínio respondendo corretamente
- [ ] HTTPS funcionando automaticamente
- [ ] Redirecionamentos funcionando

### 4. Configurações Avançadas

#### SSL/HTTPS
- **Automático:** O Lovable configura SSL automaticamente via Let's Encrypt
- **Tempo:** Pode levar até 24h para o certificado ser emitido
- **Verificação:** Acesse `https://app.suaempresa.com` e verifique o cadeado

#### Redirects
Configure redirects se necessário:

```dns
# Redirect www para app
Type: CNAME
Name: www
Value: app.suaempresa.com

# Redirect raiz para app  
Type: A
Name: @
Value: 185.158.133.1
```

#### Subdomínios Adicionais
Para múltiplos subdomínios:

```dns
# Para dashboard.suaempresa.com
Type: A
Name: dashboard
Value: 185.158.133.1

# Para api.suaempresa.com  
Type: A
Name: api
Value: 185.158.133.1
```

## Troubleshooting

### ❌ Problemas Comuns

#### 1. DNS Não Propaga
**Sintomas:** Domínio não resolve ou dá erro 404
**Soluções:**
- Aguarde até 48h para propagação completa
- Verifique se o registro A está correto
- Limpe cache DNS local: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

#### 2. SSL Não Funciona
**Sintomas:** Warning de certificado inválido
**Soluções:**
- Aguarde até 24h para emissão do certificado
- Verifique se não há registros conflitantes
- Confirme que o DNS está propagado corretamente

#### 3. Domínio Já Conectado
**Sintomas:** Erro "Domain already connected"
**Soluções:**
- Remova o domínio do projeto anterior primeiro
- Aguarde alguns minutos antes de reconectar
- Entre em contato com o suporte se persistir

#### 4. Registros DNS Conflitantes
**Sintomas:** Comportamento inconsistente
**Soluções:**
- Remova registros antigos (CNAME, A) para o mesmo subdomínio
- Use apenas um tipo de registro por subdomínio
- Verifique se não há wildcards conflitantes

### 🔧 Ferramentas de Diagnóstico

#### Verificar DNS
```bash
# Verificar propagação
dig app.suaempresa.com

# Verificar rota
traceroute app.suaempresa.com

# Verificar SSL
openssl s_client -connect app.suaempresa.com:443
```

#### Online Tools
- [DNSChecker.org](https://dnschecker.org) - Verificar propagação global
- [WhatsMyDNS.net](https://whatsmydns.net) - Status de propagação
- [SSL Labs](https://ssllabs.com/ssltest/) - Testar configuração SSL
- [DNS Lookup](https://mxtoolbox.com/dnsLookup.aspx) - Verificar registros DNS

## 💡 Dicas de Performance

### CDN e Cache
- Use Cloudflare para CDN automático
- Configure cache headers apropriados
- Otimize imagens antes do upload

### SEO
```html
<!-- Configure meta tags adequadamente -->
<meta name="description" content="WhatsAPI - Plataforma SaaS para WhatsApp">
<meta property="og:title" content="WhatsAPI">
<meta property="og:url" content="https://app.suaempresa.com">
```

### Analytics
- Configure Google Analytics com novo domínio
- Atualize Stripe com novo domínio
- Atualize Evolution API URLs se necessário

## 📋 Checklist Final

### Antes do Launch
- [ ] DNS configurado e propagado
- [ ] HTTPS funcionando
- [ ] Redirects configurados
- [ ] Performance testada
- [ ] SEO otimizado
- [ ] Analytics configurado

### Pós-Launch
- [ ] Monitor uptime por 24h
- [ ] Verificar métricas de performance
- [ ] Testar todos os fluxos críticos
- [ ] Coletar feedback de usuários
- [ ] Documentar configuração final

## 🆘 Suporte

### Recursos de Ajuda
- **Lovable Docs:** [docs.lovable.dev](https://docs.lovable.dev)
- **DNS Guides:** Documentação do seu registrador
- **Community:** Discord/Forum do Lovable

### Contatos de Emergência
- **Suporte Lovable:** Através do dashboard
- **Registrador:** Suporte do seu provedor de domínio
- **CDN:** Suporte Cloudflare (se usando)

---

## ✅ Sucesso!

Após completar todos os passos, seu WhatsAPI estará acessível em:
- 🌐 **https://app.suaempresa.com**
- 🔒 **SSL automático e seguro**
- 🚀 **Performance otimizada**
- 📱 **Mobile-friendly**

**Parabéns! Seu domínio personalizado está configurado!** 🎉