import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-6 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} WhatsAPI SaaS. Todos os direitos reservados.</p>
        <nav className="flex gap-4">
          <Link to="/documentacao" className="hover:text-foreground">Docs</Link>
          <Link to="/precos" className="hover:text-foreground">Preços</Link>
          <a href="https://status.example.com" target="_blank" rel="noreferrer" className="hover:text-foreground">Status</a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
