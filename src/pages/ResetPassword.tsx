import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const title = "Redefinir senha | WhatsAPI SaaS";
  const description = "Redefinir sua senha de acesso.";

  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });

    if (error) {
      toast({
        title: "Erro ao enviar e-mail",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSent(true);
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={title} description={description} />
      <Navbar />
      <main className="container mx-auto px-6 py-14 md:py-20">
        <header className="max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold">Redefinir senha</h1>
          <p className="text-muted-foreground mt-3">
            Digite seu e-mail para receber instruções de redefinição de senha.
          </p>
        </header>

        <section className="mt-8 max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Esqueci minha senha</CardTitle>
            </CardHeader>
            <CardContent>
              {!sent ? (
                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="voce@empresa.com"
                      required
                    />
                  </div>
                  <Button type="submit" variant="hero" disabled={loading} className="w-full">
                    {loading ? "Enviando..." : "Enviar instruções"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enviamos instruções para redefinir sua senha para <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Verifique sua caixa de entrada e spam.
                  </p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground mt-4 text-center">
                <Link to="/auth" className="underline hover:text-foreground">
                  Voltar para login
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;