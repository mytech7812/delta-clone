import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SignInModal from "@/components/SignInModal";
import { supabase } from '@/lib/supabase';

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Swap", href: "#swap" },
  { label: "Staking", href: "#staking" },
  { label: "Assets", href: "#assets" },
];

const Navbar = ({ onLoginClick }: { onLoginClick?: () => void }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [localSignInOpen, setLocalSignInOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setLocalSignInOpen(true);
    }
  };

  useEffect(() => {
    // Load current session user
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session && session.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && session.user) setUser(session.user);
      else setUser(null);
    });

    return () => {
      mounted = false;
      try { subscription.unsubscribe(); } catch (e) { /* ignore */ }
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-extrabold text-sm">A</span>
              </div>
              <span className="text-foreground">
                Anexmint<span className="text-primary font-medium text-sm ml-0.5">Mining</span>
              </span>
            </a>
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {!user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm font-medium"
                  onClick={handleLoginClick}
                >
                  Log In
                </Button>
                <Button
                  size="sm"
                  className="text-sm font-semibold"
                  onClick={() => navigate("/signup")}
                >
                  Sign Up
                </Button>
              </>
            )}

            {user && (
              <div className="relative" style={{ marginLeft: 'auto' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold"
                  aria-label="User menu"
                >
                  {(() => {
                    // Derive initials from user metadata or email
                    const meta = (user.user_metadata || {});
                    const first = (meta.first_name || meta.firstName || '').toString().trim();
                    const last = (meta.last_name || meta.lastName || '').toString().trim();
                    const full = (meta.full_name || meta.fullName || '').toString().trim();
                    let initials = '';
                    if (first && last) initials = `${first.charAt(0)}${last.charAt(0)}`;
                    else if (full) {
                      const parts = full.split(' ').filter(Boolean);
                      initials = parts.length >= 2 ? `${parts[0].charAt(0)}${parts[parts.length-1].charAt(0)}` : full.slice(0,2);
                    } else if (user.email) initials = user.email.charAt(0).toUpperCase();
                    return initials.toUpperCase();
                  })()}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-md py-2 z-50">
                    <div className="px-4 py-2">
                      <div className="font-medium text-sm text-foreground">
                        {((user.user_metadata && (user.user_metadata.full_name || user.user_metadata.fullName)) || user.email || 'User')}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <div className="border-t border-border mt-2" />
                    <button
                      className="w-full text-left px-4 py-2 text-sm hover:bg-surface"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
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
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => { setMobileOpen(false); handleLoginClick(); }}
              >
                Log In
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => { setMobileOpen(false); navigate("/signup"); }}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </header>

      <SignInModal isOpen={localSignInOpen} onClose={() => setLocalSignInOpen(false)} />
    </>
  );
};

export default Navbar;
