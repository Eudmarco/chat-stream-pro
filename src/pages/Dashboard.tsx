import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import UsageLimitsCard from "@/components/UsageLimitsCard";
import { Crown, User, RefreshCw } from "lucide-react";

const Dashboard = () => {
  const title = "Dashboard | WhatsAPI SaaS";
  const description = "Acesse suas instâncias, métricas e configurações. Faça login para começar.";
  
  const { user } = useAuth();
  const { subscribed, subscription_tier, subscription_end, loading, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();

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

        <section className="mt-8">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Subscription Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Status da Assinatura
                </CardTitle>
                <CardDescription>
                  Informações do seu plano atual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plano Atual:</span>
                  <Badge variant={subscribed ? "default" : "secondary"} className="capitalize">
                    {subscribed ? subscription_tier || "Premium" : "Gratuito"}
                  </Badge>
                </div>
                
                {subscribed && subscription_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Renovação:</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(subscription_end).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {subscribed ? (
                    <Button onClick={openCustomerPortal} variant="outline" className="flex-1">
                      Gerenciar Assinatura
                    </Button>
                  ) : (
                    <Button onClick={() => createCheckout('Premium')} className="flex-1">
                      <Crown className="h-4 w-4 mr-2" />
                      Fazer Upgrade
                    </Button>
                  )}
                  <Button onClick={checkSubscription} variant="ghost" disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Limits Card */}
            <UsageLimitsCard />
          </div>

          {/* Welcome Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Bem-vindo ao WhatsAPI SaaS
              </CardTitle>
              <CardDescription>
                Sua plataforma completa para automação WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Logado como: <span className="font-medium text-foreground">{user?.email}</span>
              </p>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Instâncias</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Crie e gerencie suas instâncias WhatsApp
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Mensagens</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Envie mensagens automatizadas
                  </p>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium">Webhooks</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure notificações em tempo real
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
