import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const tiers = [
  {
    name: "Básico",
    price: "R$49/mês",
    features: ["1 instância", "2.000 mensagens/mês", "Suporte por email"],
    cta: "Começar",
  },
  {
    name: "Pro",
    price: "R$149/mês",
    features: ["5 instâncias", "20.000 mensagens/mês", "Webhooks e métricas"],
    cta: "Assinar Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: ["Limites flexíveis", "SLA e suporte prioritário", "Onboarding assistido"],
    cta: "Fale com vendas",
  },
];

const Pricing = () => {
  const title = "Planos e Preços | WhatsAPI SaaS";
  const description = "Escolha o plano ideal: Básico, Pro e Enterprise. API do WhatsApp com Evolution e Stripe.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Planos simples e transparentes</h1>
          <p className="text-muted-foreground mt-3">
            Comece pequeno e evolua quando precisar. Sem letras miúdas.
          </p>
        </header>
        <section className="grid md:grid-cols-3 gap-6">
          {tiers.map((t) => (
            <Card key={t.name} className="relative">
              <CardHeader>
                <CardTitle className="flex items-baseline justify-between">
                  <span>{t.name}</span>
                  <span className="text-lg text-muted-foreground font-normal">{t.price}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant="hero" className="w-full">{t.cta}</Button>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
