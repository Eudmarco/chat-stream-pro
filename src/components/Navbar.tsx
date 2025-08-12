import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
const Navbar = () => {
  const { session, signOut } = useAuth();
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block h-6 w-6 rounded-md bg-primary" aria-hidden />
          <span>WhatsAPI SaaS</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">Recursos</Link>
          <NavLink to="/precos" className={getNavCls} end>
            Planos
          </NavLink>
          <NavLink to="/documentacao" className={getNavCls} end>
            Documentação
          </NavLink>
          <NavLink to="/instancias" className={getNavCls} end>
            Instâncias
          </NavLink>
          <NavLink to="/webhooks" className={getNavCls} end>
            Webhooks
          </NavLink>
          <NavLink to="/dashboard" className={getNavCls} end>
            Dashboard
          </NavLink>
        </nav>
        <div className="flex items-center gap-2">
          {session ? (
            <Button variant="outline" onClick={signOut}>
              Sair
            </Button>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/auth">Entrar</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/precos">Começar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
