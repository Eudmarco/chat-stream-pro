# WhatsAPI - Plataforma SaaS para WhatsApp

## 📱 Sobre o Projeto

WhatsAPI é uma plataforma SaaS completa que permite integração fácil e eficiente com WhatsApp através da Evolution API. Com interface moderna e funcionalidades avançadas de gerenciamento de instâncias, mensagens e webhooks.

### ✨ Funcionalidades Principais

- 🔐 **Autenticação Completa** - Sistema de login/registro com Supabase Auth
- 💳 **Pagamentos Integrados** - Planos de assinatura via Stripe
- 📱 **Gestão de Instâncias** - Criação e gerenciamento de conexões WhatsApp
- 💬 **Envio de Mensagens** - API para envio automático de mensagens
- 🔗 **Webhooks** - Receba eventos em tempo real
- 📊 **Dashboard Completo** - Métricas, logs e monitoramento
- 🛡️ **Segurança Avançada** - RLS, autenticação JWT, rate limiting

### 🏗️ Arquitetura

```
Frontend (React + TypeScript + Tailwind CSS)
    ↓
Supabase Backend
    ├── Auth (Autenticação)
    ├── Database (PostgreSQL)
    ├── Edge Functions (Serverless)
    └── Real-time (WebSockets)
    ↓
Integrações Externas
    ├── Stripe (Pagamentos)
    └── Evolution API (WhatsApp)
```

### 💰 Planos de Assinatura

#### 📦 Plano Básico - R$ 49/mês
- 3 instâncias WhatsApp
- 1.000 mensagens/mês
- 5 webhooks
- Suporte por email

#### 🚀 Plano Pro - R$ 149/mês
- 10 instâncias WhatsApp
- 10.000 mensagens/mês
- 20 webhooks
- Suporte prioritário

#### 🏢 Plano Enterprise - Sob consulta
- Instâncias ilimitadas
- Mensagens ilimitadas
- Webhooks ilimitados
- Suporte dedicado

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes acessíveis
- **Vite** - Build tool moderna
- **React Router** - Roteamento SPA

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de dados relacional
- **Edge Functions** - Serverless functions
- **Row Level Security** - Segurança de dados

### Integrações
- **Stripe** - Processamento de pagamentos
- **Evolution API** - Integração WhatsApp
- **Deno** - Runtime para Edge Functions

## 🚀 Como Usar

### Desenvolvimento Local

1. **Clone o repositório:**
   ```bash
   git clone <repository-url>
   cd whatsapi
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   # Crie um projeto no Supabase
   # Configure as secrets nas Edge Functions
   ```

4. **Execute o projeto:**
   ```bash
   npm run dev
   ```

5. **Acesse:** `http://localhost:5173`

### Deploy em Produção

#### Via Lovable (Recomendado)
1. Clique em "Publish" no editor
2. Configure domínio personalizado
3. SSL automático

#### Via Vercel/Netlify
```bash
npm run build
# Deploy do diretório dist/
```

## 📚 Documentação

- **[Documentação da API](./docs/API.md)** - Guia completo da API
- **[Guia de Implantação](./docs/DEPLOYMENT.md)** - Passo a passo para produção
- **[Supabase Docs](https://supabase.com/docs)** - Documentação oficial
- **[Stripe Docs](https://stripe.com/docs)** - Integração de pagamentos

## 🔧 Configuração

### Supabase Setup
1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute as migrations do banco
3. Configure as políticas RLS
4. Deploy das Edge Functions

### Stripe Setup
1. Crie conta no [Stripe](https://stripe.com)
2. Configure produtos e preços
3. Configure webhook endpoints
4. Ative customer portal

### Evolution API Setup
1. Deploy da Evolution API
2. Configure autenticação
3. Teste conexões WhatsApp

## 🛡️ Segurança

- ✅ **Row Level Security (RLS)** - Isolamento de dados por usuário
- ✅ **JWT Authentication** - Tokens seguros
- ✅ **HTTPS Only** - Comunicação criptografada
- ✅ **Rate Limiting** - Proteção contra abuso
- ✅ **Input Validation** - Validação de dados
- ✅ **CORS Policy** - Política de origem cruzada

## 📊 Monitoramento

### Métricas Disponíveis
- Uso de instâncias por usuário
- Volume de mensagens enviadas
- Taxa de sucesso de entregas
- Performance das Edge Functions
- Erros e logs do sistema

### Alertas Configurados
- Limite de uso atingido
- Falhas de conexão
- Erros de pagamento
- Performance degradada

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

- **Email:** suporte@whatsapi.com
- **Portal do Cliente:** Acesse via dashboard
- **Documentação:** Links acima
- **Status:** [status.whatsapi.com]

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ usando Lovable.dev**
