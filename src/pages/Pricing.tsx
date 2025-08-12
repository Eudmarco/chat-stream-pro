import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const tiers = [
  {
    id: "basic",
    name: "Básico",
    price: "R$49/mês",
    features: ["1 instância", "2.000 mensagens/mês", "Suporte por email"],
    cta: "Começar",
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$149/mês",
    features: ["5 instâncias", "20.000 mensagens/mês", "Webhooks e métricas"],
    cta: "Assinar Pro",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    features: ["Limites flexíveis", "SLA e suporte prioritário", "Onboarding assistido"],
    cta: "Fale com vendas",
  },
];

const Pricing = () => {
  const title = "Planos e Preços | WhatsAPI SaaS";
  const description = "Escolha o plano ideal: Básico, Pro e Enterprise. API do WhatsApp com Evolution e Stripe.";
  
  const { session } = useAuth();
  const { subscription_tier, createCheckout } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!session) {
      window.location.href = '/auth';
      return;
    }

    if (planId === 'enterprise') {
      toast({
        title: "Entre em contato",
        description: "Para o plano Enterprise, entre em contato conosco diretamente.",
      });
      return;
    }

    try {
      setLoading(planId);
      const data = await createCheckout(planId);
      window.open(data.url, '_blank');
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao criar checkout",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

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
                <Button 
                  variant={subscription_tier === t.name ? "outline" : "hero"} 
                  className="w-full"
                  onClick={() => handleSubscribe(t.id)}
                  disabled={loading === t.id || subscription_tier === t.name}
                >
                  {loading === t.id ? "Processando..." : subscription_tier === t.name ? "Plano Atual" : t.cta}
                </Button>
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
