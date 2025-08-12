import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { CreditCard, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const title = "Dashboard | WhatsAPI SaaS";
  const description = "Acesse suas instâncias, métricas e configurações. Faça login para começar.";
  
  const { user } = useAuth();
  const { subscribed, subscription_tier, subscription_end, loading, checkSubscription, openCustomerPortal } = useSubscription();

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-3">
            Em breve: suas instâncias, QR Codes e métricas. Enquanto isso, use o menu para explorar.
          </p>
        </header>

        <section className="mt-8 space-y-6">
          {/* Subscription Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl">Status da Assinatura</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={checkSubscription}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Plano atual:</span>
                <Badge variant={subscribed ? "default" : "secondary"}>
                  {subscription_tier || "Nenhum"}
                </Badge>
              </div>
              
              {subscribed && subscription_end && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Renovação:</span>
                  <span className="text-sm">
                    {new Date(subscription_end).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}

              <div className="flex gap-2">
                {subscribed ? (
                  <Button variant="outline" size="sm" onClick={openCustomerPortal}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Gerenciar Assinatura
                  </Button>
                ) : (
                  <Button variant="hero" size="sm" onClick={() => window.location.href = '/precos'}>
                    Assinar Agora
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Welcome Section */}
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo, {user?.email}!</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Em breve: suas instâncias, QR Codes e métricas. Por enquanto, gerencie sua assinatura acima.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
