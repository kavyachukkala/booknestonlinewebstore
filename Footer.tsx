import { Link } from "@tanstack/react-router";
import { BookOpen, Github, Twitter, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[var(--ink-2)]/40 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl glass grid place-items-center"><BookOpen className="h-4 w-4 text-primary" /></div>
            <span className="font-display text-2xl">Book<span className="aurora-text">Nest</span></span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            A softly-lit late-night bookstore, on the internet. Curated titles, honest reviews, fast delivery.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/books" className="hover:text-primary">All Books</Link></li>
            <li><a href="/#categories" className="hover:text-primary">Categories</a></li>
            <li><a href="/#bestsellers" className="hover:text-primary">Best Sellers</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth" className="hover:text-primary">Sign In</Link></li>
            <li><Link to="/dashboard" className="hover:text-primary">Dashboard</Link></li>
            <li><Link to="/cart" className="hover:text-primary">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Follow</h4>
          <div className="flex gap-3">
            <a href="#" aria-label="Twitter" className="h-9 w-9 grid place-items-center glass rounded-lg hover:glow-green"><Twitter className="h-4 w-4" /></a>
            <a href="#" aria-label="Instagram" className="h-9 w-9 grid place-items-center glass rounded-lg hover:glow-green"><Instagram className="h-4 w-4" /></a>
            <a href="#" aria-label="Github" className="h-9 w-9 grid place-items-center glass rounded-lg hover:glow-green"><Github className="h-4 w-4" /></a>
          </div>
          <div className="mt-6 flex gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded glass">VISA</span>
            <span className="px-2 py-1 rounded glass">MC</span>
            <span className="px-2 py-1 rounded glass">PayPal</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 text-xs text-muted-foreground flex flex-wrap gap-2 items-center justify-between">
          <span>© {new Date().getFullYear()} BookNest. All rights reserved.</span>
          <span>Made with care — Capstone Project</span>
        </div>
      </div>
    </footer>
  );
}