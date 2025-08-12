import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api, type Webhook } from "@/lib/api";
import { useEffect, useState } from "react";

const Webhooks = () => {
  const title = "Webhooks | WhatsAPI SaaS";
  const description = "Cadastre endpoints para receber eventos (mock local).";

  const { toast } = useToast();
  const [items, setItems] = useState<Webhook[]>([]);
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const load = async () => setItems(await api.listWebhooks());

  useEffect(() => {
    load();
  }, []);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^https?:\/\//i.test(url)) {
      toast({ title: "URL inválida", description: "Use http(s)://...", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await api.addWebhook(url.trim());
      setUrl("");
      await load();
      toast({ title: "Webhook adicionado", description: "Você pode simular eventos em breve." });
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground mt-3">Endpoints para receber eventos da sua instância. Mock local.</p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Novo webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input id="url" placeholder="https://meu-endpoint" value={url} onChange={(e) => setUrl(e.target.value)} />
                </div>
                <Button type="submit" variant="hero" disabled={saving}>
                  {saving ? "Salvando..." : "Adicionar"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Guardamos seus endpoints localmente. Na integração real, validaremos a assinatura HMAC e entregaremos eventos.</p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum endpoint cadastrado.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Criado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-medium break-all">{w.url}</TableCell>
                        <TableCell>{new Date(w.createdAt).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Webhooks;
