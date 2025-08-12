import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-whatsapp.jpg";
import { MessageSquare, CreditCard, Webhook } from "lucide-react";

const Index = () => {
  const title = "API do WhatsApp para empresas | WhatsAPI SaaS";
  const description = "Integre o WhatsApp em minutos. Envio e recebimento de mensagens com Evolution API, assinaturas via Stripe e webhooks confiáveis.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[image:var(--gradient-hero)] bg-[length:200%_200%] animate-bg-gradient opacity-20" />
          <div className="container mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
            <article className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                API do WhatsApp simples, profissional e escalável
              </h1>
              <p className="text-lg text-muted-foreground max-w-prose">
                Construa integrações de mensagens com a Evolution API, gerencie assinaturas com Stripe e entregue webhooks com alta confiabilidade. Tudo em uma plataforma.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/precos">Começar agora</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/documentacao">Ver documentação</Link>
                </Button>
              </div>
              <ul className="text-sm text-muted-foreground grid grid-cols-2 gap-2 pt-2">
                <li>• Provisionamento de instâncias e QR Code</li>
                <li>• Envio de texto e mídia</li>
                <li>• Webhooks com assinatura HMAC</li>
                <li>• Limites por plano e métricas</li>
              </ul>
            </article>
            <div className="relative">
              <img
                src={heroImage}
                alt="Ilustração profissional de plataforma SaaS de API do WhatsApp"
                className="w-full h-auto rounded-xl border shadow"
                loading="eager"
              />
              <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden />
              <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" aria-hidden />
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="container mx-auto px-6 py-14 md:py-20">
          <div className="grid md:grid-cols-3 gap-6">
            <article className="rounded-xl border p-6 bg-card shadow-sm">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <CreditCard className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Assinaturas com Stripe</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Checkout seguro, portal do cliente e gestão de planos com limites claros por instância e mensagens.
              </p>
            </article>
            <article className="rounded-xl border p-6 bg-card shadow-sm">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Evolution API</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Provisionamento de instâncias, QR Code, status e envio de mensagens de texto e mídia de forma estável.
              </p>
            </article>
            <article className="rounded-xl border p-6 bg-card shadow-sm">
              <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center mb-4">
                <Webhook className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">Webhooks Confiáveis</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Encaminhamento assinado (HMAC), retries com backoff e trilhas de auditoria para entrega garantida.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
