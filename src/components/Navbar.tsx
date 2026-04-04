import { useState } from "react";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Markets", href: "#markets" },
  { label: "Futures", href: "#" },
  { label: "Options", href: "#" },
  { label: "TradFi", href: "#", badge: "New" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-extrabold text-sm">Δ</span>
            </div>
            <span className="text-foreground">Delta<span className="text-muted-foreground font-medium text-sm ml-1">GLOBAL</span></span>
          </a>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
                {link.badge && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-success text-success-foreground px-1.5 rounded-full font-semibold">
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
            <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              More <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-sm">
            <Search className="w-4 h-4" />
            <span>Search</span>
            <kbd className="text-xs bg-background px-1.5 py-0.5 rounded border border-border">/</kbd>
          </div>
          <Button variant="ghost" size="sm" className="text-sm font-medium">
            Log In
          </Button>
          <Button size="sm" className="text-sm font-semibold">
            Sign Up
          </Button>
        </div>

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background p-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="block py-2 text-sm font-medium text-muted-foreground">
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">Log In</Button>
            <Button size="sm" className="flex-1">Sign Up</Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
