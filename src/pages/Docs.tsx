import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Docs = () => {
  const title = "Documentação da API | WhatsAPI SaaS";
  const description = "Guia rápido para começar com a API do WhatsApp: autenticação, instâncias, mensagens e webhooks.";

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold">Documentação</h1>
          <p className="text-muted-foreground mt-3">
            Veja como provisionar instâncias, obter QR Code, enviar mensagens e configurar webhooks.
          </p>
        </header>

        <section className="grid md:grid-cols-2 gap-8 mt-10">
          <article className="rounded-xl border p-5 bg-card">
            <h2 className="text-xl font-semibold">Criar instância</h2>
            <pre className="mt-3 rounded-md bg-muted p-4 overflow-auto text-xs">
{`POST /v1/instances
{
  "name": "meu-whatsapp"
}
// Resposta: { id, status, qr_code_url }`}
            </pre>
          </article>

          <article className="rounded-xl border p-5 bg-card">
            <h2 className="text-xl font-semibold">Enviar mensagem</h2>
            <pre className="mt-3 rounded-md bg-muted p-4 overflow-auto text-xs">
{`POST /v1/messages
{
  "to": "+5511999999999",
  "type": "text",
  "text": "Olá!"
}`}
            </pre>
          </article>

          <article className="rounded-xl border p-5 bg-card md:col-span-2">
            <h2 className="text-xl font-semibold">Webhook de recebimento</h2>
            <pre className="mt-3 rounded-md bg-muted p-4 overflow-auto text-xs">
{`POST https://seu-endpoint
// Corpo assinado via HMAC-SHA256 (X-Signature)
{
  "event": "message.received",
  "data": { /* mensagem */ }
}`}
            </pre>
          </article>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Docs;
