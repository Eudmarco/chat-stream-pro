import { SystemMonitoring } from '@/components/SystemMonitoring';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SEO } from '@/components/SEO';

export default function SystemStatus() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Status do Sistema - WhatsAPI"
        description="Monitore o status em tempo real de todos os componentes da plataforma WhatsAPI"
      />
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Status do Sistema</h1>
            <p className="text-muted-foreground mt-2">
              Monitoramento em tempo real de todos os componentes da plataforma
            </p>
          </div>
          <SystemMonitoring />
        </div>
      </main>
      <Footer />
    </div>
  );
}