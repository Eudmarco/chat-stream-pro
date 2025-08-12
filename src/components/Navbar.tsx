import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-primary" aria-hidden />
          <span>WhatsAPI SaaS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</a>
          <a href="#precos" className="text-muted-foreground hover:text-foreground transition-colors">Planos</a>
          <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors">Documentação</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href="#entrar">Entrar</a>
          </Button>
          <Button variant="hero" asChild>
            <a href="#criar-conta">Começar</a>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
