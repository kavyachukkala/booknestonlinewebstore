import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const linkCls = "text-sm text-foreground/80 hover:text-foreground transition-colors";

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? "glass-strong shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl glass grid place-items-center glow-green">
            <BookOpen className="h-4 w-4 text-primary" />
          </div>
          <span className="font-display text-2xl leading-none">
            Book<span className="aurora-text">Nest</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkCls} activeProps={{ className: "text-foreground font-medium" }}>Home</Link>
          <Link to="/books" className={linkCls} activeProps={{ className: "text-foreground font-medium" }}>Books</Link>
          <Link to="/books" search={{ bestseller: true } as never} className={linkCls}>Best Sellers</Link>
          <a href="/#categories" className={linkCls}>Categories</a>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/cart" className="relative p-2 rounded-lg hover:bg-white/5 transition">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold grid place-items-center">
                {count}
              </span>
            )}
          </Link>
          {userEmail ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="gap-2"><User className="h-4 w-4" />Account</Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => { await supabase.auth.signOut(); }}
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">Sign in</Button>
            </Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-strong border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link to="/" onClick={() => setOpen(false)} className={linkCls}>Home</Link>
            <Link to="/books" onClick={() => setOpen(false)} className={linkCls}>Books</Link>
            <Link to="/cart" onClick={() => setOpen(false)} className={linkCls}>Cart ({count})</Link>
            {userEmail ? (
              <Link to="/dashboard" onClick={() => setOpen(false)} className={linkCls}>Account</Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className={linkCls}>Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}