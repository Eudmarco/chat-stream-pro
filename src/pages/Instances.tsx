import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { api, type Instance } from "@/lib/api";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const Instances = () => {
  const title = "Instâncias | WhatsAPI SaaS";
  const description = "Crie e gerencie instâncias. Mock local com API plugável.";

  const { toast } = useToast();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const data = await api.listInstances();
    setInstances(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const created = await api.createInstance(name.trim());
      setName("");
      toast({ title: "Instância criada", description: `“${created.name}” provisionando...` });
      await load();
    } catch (err) {
      toast({ title: "Erro ao criar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold">Instâncias</h1>
          <p className="text-muted-foreground mt-3">Gerencie suas instâncias do WhatsApp. Dados locais (mock) para desenvolvimento.</p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Nova instância</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: suporte-01" />
                </div>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Criando..." : "Criar instância"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Como funciona</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Esta é uma camada mock (localStorage) que simula o fluxo real. Em breve, conectaremos ao backend
                (Supabase/Evolution) sem mudar esta UI.
              </p>
              <p>
                Dica: o status muda para “ready” alguns segundos após criar para simular provisionamento.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Suas instâncias</CardTitle>
            </CardHeader>
            <CardContent>
              {instances.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma instância ainda.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instances.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="font-medium">{i.name}</TableCell>
                        <TableCell className="capitalize">{i.status}</TableCell>
                        <TableCell>{new Date(i.createdAt).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link to={`/instancias/${i.id}`}>Ver</Link>
                          </Button>
                        </TableCell>
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

export default Instances;
