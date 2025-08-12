import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { api, type Instance } from "@/lib/api";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const InstanceDetail = () => {
  const { id } = useParams();
  const title = "Instância | WhatsAPI SaaS";
  const description = "Detalhes da instância, QR e tester de mensagens (mock).";

  const { toast } = useToast();
  const [instance, setInstance] = useState<Instance | undefined>();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.getInstance(id).then(setInstance);
  }, [id]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSending(true);
    try {
      await api.sendMessage({ instanceId: id, to, text });
      setText("");
      toast({ title: "Mensagem enviada", description: `Enviado para ${to}` });
    } catch (err) {
      toast({ title: "Erro ao enviar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Instância</h1>
            <p className="text-muted-foreground mt-3">Detalhes e testes rápidos de envio.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/instancias">Voltar</Link>
          </Button>
        </header>

        {!instance ? (
          <p className="mt-10 text-muted-foreground">Instância não encontrada.</p>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nome</span>
                  <span className="font-medium">{instance.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="capitalize">{instance.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Criado</span>
                  <span>{new Date(instance.createdAt).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full aspect-square rounded-lg bg-muted grid place-content-center text-muted-foreground">
                  QR Code em breve
                </div>
                <p className="text-xs text-muted-foreground mt-3">Conecte o WhatsApp assim que liberar a Fase 2.B.</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Tester de mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSend} className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="to">Número (E.164)</Label>
                    <Input id="to" placeholder="+5511999999999" value={to} onChange={(e) => setTo(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="text">Mensagem</Label>
                    <Input id="text" placeholder="Olá!" value={text} onChange={(e) => setText(e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <Button type="submit" variant="hero" disabled={sending || !to || !text}>
                      {sending ? "Enviando..." : "Enviar"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InstanceDetail;
