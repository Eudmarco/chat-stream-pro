import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const title = "Dashboard | WhatsAPI SaaS";
  const description = "Acesse suas instâncias, métricas e configurações. Faça login para começar.";

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

        <section className="mt-8 rounded-xl border p-6 bg-card">
          <h2 className="text-xl font-semibold">Acesso</h2>
          <p className="text-sm text-muted-foreground mt-2">
            A autenticação via Supabase será adicionada na próxima fase. Por ora, esta é uma prévia do layout.
          </p>
          <div className="mt-4">
            <Button variant="hero">Entrar (em breve)</Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
