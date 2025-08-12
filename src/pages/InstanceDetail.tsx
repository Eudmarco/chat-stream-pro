import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { api, type Instance, type LogEntry, type DailyMetric } from "@/lib/api";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const InstanceDetail = () => {
  const { id } = useParams();
  const title = "Instância | WhatsAPI SaaS";
  const description = "Detalhes da instância, QR, mensagens, logs e métricas (mock).";

  const { toast } = useToast();
  const [instance, setInstance] = useState<Instance | undefined>();
  const [to, setTo] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [metrics, setMetrics] = useState<DailyMetric[]>([]);

  const reload = async () => {
    if (!id) return;
    const [inst, lg, mt] = await Promise.all([
      api.getInstance(id),
      api.listLogs(id),
      api.listMetrics(id),
    ]);
    setInstance(inst);
    setLogs(lg);
    setMetrics(mt);
  };

  useEffect(() => {
    reload();
    // Poll simples para refletir mudanças de status/metricas
    const t = setInterval(reload, 2000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSending(true);
    try {
      await api.sendMessage({ instanceId: id, to, text });
      setText("");
      toast({ title: "Mensagem enviada", description: `Enviado para ${to}` });
      reload();
    } catch (err) {
      toast({ title: "Erro ao enviar", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const chartConfig = useMemo(
    () => ({ sent: { label: "Enviadas", color: "hsl(var(--primary))" } }),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-3xl flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Instância</h1>
            <p className="text-muted-foreground mt-3">Detalhes e operações rápidas.</p>
          </div>
          <Button asChild variant="outline">
            <Link to="/instancias">Voltar</Link>
          </Button>
        </header>

        {!instance ? (
          <p className="mt-10 text-muted-foreground">Instância não encontrada.</p>
        ) : (
          <section className="mt-8">
            <Tabs defaultValue="resumo" className="w-full">
              <TabsList>
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="qr">QR</TabsTrigger>
                <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
                <TabsTrigger value="logs">Logs</TabsTrigger>
                <TabsTrigger value="metricas">Métricas</TabsTrigger>
              </TabsList>

              <TabsContent value="resumo" className="mt-4">
                <div className="grid gap-6 md:grid-cols-2">
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
                      <CardTitle>Dicas</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                      <p>Use a aba Mensagens para enviar um teste. O status muda para “ready” poucos segundos após criar.</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="qr" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>QR Code</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full aspect-square rounded-lg bg-muted grid place-content-center text-muted-foreground">
                      QR Code em breve
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Conecte o WhatsApp assim que liberar a integração.</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mensagens" className="mt-4">
                <Card>
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
              </TabsContent>

              <TabsContent value="logs" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {logs.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem logs ainda.</p>
                    ) : (
                      <ScrollArea className="h-64 rounded-md border p-3">
                        <ul className="space-y-2">
                          {logs.map((l) => (
                            <li key={l.id} className="text-xs">
                              <span className="text-muted-foreground">{new Date(l.at).toLocaleTimeString()} · {l.level}</span>
                              <span className="ml-2">{l.message}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="metricas" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Métricas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {metrics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem dados ainda.</p>
                    ) : (
                      <ChartContainer config={chartConfig} className="w-full">
                        <LineChart data={metrics} margin={{ left: 12, right: 12 }}>
                          <CartesianGrid vertical={false} strokeDasharray="3 3" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={30} />
                          <ChartTooltip content={<ChartTooltipContent nameKey="sent" />} />
                          <Line type="monotone" dataKey="sent" stroke="var(--color-sent)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default InstanceDetail;
