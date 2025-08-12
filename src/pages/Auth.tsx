import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

const Auth = () => {
  const title = "Entrar ou criar conta | WhatsAPI SaaS";
  const description = "Autenticação segura via Supabase. Faça login ou crie sua conta.";

  const { toast } = useToast();
  const { session, signIn, signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<'login' | 'signup'>("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      window.location.href = "/dashboard";
    }
  }, [session]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const action = mode === 'login' ? signIn : signUp;
    const { error } = await action(email.trim(), password);
    if (error) {
      toast({ title: mode === 'login' ? 'Erro ao entrar' : 'Erro ao cadastrar', description: error, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold">Acessar sua conta</h1>
          <p className="text-muted-foreground mt-3">Entre ou crie uma conta para gerenciar suas instâncias do WhatsApp.</p>
        </header>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>{mode === 'login' ? 'Entrar' : 'Criar conta'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@empresa.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                </div>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? (mode === 'login' ? 'Entrando...' : 'Enviando...') : (mode === 'login' ? 'Entrar' : 'Criar conta')}
                </Button>
              </form>
              <div className="text-sm text-muted-foreground mt-4">
                {mode === 'login' ? (
                  <button className="underline" onClick={() => setMode('signup')}>Não tem conta? Cadastre-se</button>
                ) : (
                  <button className="underline" onClick={() => setMode('login')}>Já tem conta? Entrar</button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dicas de acesso</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Após criar sua conta, verifique sua caixa de e-mail caso a confirmação esteja habilitada no Supabase.</p>
              <p>Em seguida você será redirecionado para o Dashboard automaticamente.</p>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
