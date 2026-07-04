import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { booksQuery, categoriesQuery } from "@/lib/queries";
import { BookCard } from "@/components/site/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight, Sparkles, Star, Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({ component: Home });

const CATEGORY_ICONS: Record<string, string> = {
  fiction: "📖", "sci-fi": "🚀", business: "💼", biography: "👤",
  mystery: "🔍", "self-help": "✨", fantasy: "🐉", history: "🏛️",
};
const REVIEWS = [
  { name: "Ananya S.", quote: "BookNest is now my late-night reading ritual. The curation is unreal.", stars: 5 },
  { name: "Marcus T.", quote: "Fast checkout, honest reviews, gorgeous UI. I've bought 12 books in 3 weeks.", stars: 5 },
  { name: "Priya R.", quote: "Finally a bookstore that feels like a bookstore, not a supermarket.", stars: 5 },
];

function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const featured = useQuery(booksQuery({ featured: true, pageSize: 8 }));
  const best = useQuery(booksQuery({ bestseller: true, pageSize: 4 }));
  const cats = useQuery(categoriesQuery);

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/20 blur-3xl animate-drift" />
          <div className="absolute top-20 -right-20 h-[400px] w-[400px] rounded-full bg-primary/20 blur-3xl animate-drift" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1 text-xs mb-6">
              <Sparkles className="h-3 w-3 text-accent" /> Welcome to your late-night library
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.05]">
              A quieter place<br />
              to find your <span className="aurora-text italic">next</span> favourite <span className="italic">book</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Thousands of hand-picked titles across fiction, sci-fi, biography and more — with honest reviews and delivery to your door.
            </p>
            <form
              onSubmit={(e) => { e.preventDefault(); nav({ to: "/books" }); }}
              className="mt-8 glass rounded-2xl p-2 flex items-center gap-2 max-w-xl"
            >
              <Search className="h-5 w-5 text-muted-foreground ml-3" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for a title or author…" className="border-0 bg-transparent focus-visible:ring-0 shadow-none text-base" />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">Search</Button>
            </form>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/books"><Button size="lg" variant="secondary" className="rounded-xl">Browse the shelves <ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
              <Link to="/auth"><Button size="lg" variant="outline" className="rounded-xl border-accent/40 text-accent hover:bg-accent/10">Create account</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative grid grid-cols-3 gap-3 max-w-md mx-auto">
              {(featured.data?.rows ?? []).slice(0, 6).map((b, i) => (
                <div key={b.id} className={"rounded-xl overflow-hidden glass p-2 animate-float " + (i % 2 ? "translate-y-6" : "")} style={{ animationDelay: (i * 0.4) + "s" }}>
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-black/40">
                    {b.cover_url && <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover" loading="lazy" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Section id="featured" eyebrow="Curated for you" title="Featured Books" cta={<Link to="/books" className="text-sm text-accent hover:underline">See all →</Link>}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {(featured.data?.rows ?? []).slice(0, 8).map((b) => <BookCard key={b.id} book={b} />)}
        </div>
      </Section>

      <Section id="categories" eyebrow="Browse by mood" title="Categories">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {(cats.data ?? []).map((c) => (
            <Link key={c.id} to="/books" className="glass rounded-2xl p-6 hover:glow-green transition group">
              <div className="text-3xl">{CATEGORY_ICONS[c.slug] ?? "📚"}</div>
              <div className="mt-3 font-display text-xl group-hover:text-primary transition">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-1">Explore titles</div>
            </Link>
          ))}
        </div>
      </Section>

      <Section id="bestsellers" eyebrow="This week" title="Best Sellers">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {(best.data?.rows ?? []).map((b, i) => (
            <div key={b.id} className="relative">
              <span className="absolute -top-3 -left-3 z-10 h-10 w-10 rounded-full grid place-items-center font-display text-xl bg-accent text-accent-foreground glow-violet">#{i + 1}</span>
              <BookCard book={b} />
            </div>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 grid md:grid-cols-3 gap-4">
        {[
          { icon: Truck, title: "Free shipping over $40", body: "Fast, tracked delivery." },
          { icon: ShieldCheck, title: "Secure checkout", body: "Encrypted end-to-end." },
          { icon: Star, title: "Honest reviews", body: "Real readers, real ratings." },
        ].map((v) => (
          <div key={v.title} className="glass rounded-2xl p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-primary/15 grid place-items-center text-primary"><v.icon className="h-5 w-5" /></div>
            <div>
              <div className="font-display text-xl">{v.title}</div>
              <div className="text-sm text-muted-foreground mt-1">{v.body}</div>
            </div>
          </div>
        ))}
      </section>

      <Section eyebrow="Loved by readers" title="What people are saying">
        <div className="grid md:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <figure key={r.name} className="glass rounded-2xl p-6">
              <div className="flex gap-1 text-accent">
                {Array.from({ length: r.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <blockquote className="mt-3 font-display text-xl leading-snug">“{r.quote}”</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">— {r.name}</figcaption>
            </figure>
          ))}
        </div>
      </Section>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-24 mb-8">
        <div className="glass-strong rounded-3xl p-10 text-center relative overflow-hidden">
          <div aria-hidden className="absolute -top-20 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl">Get a great read every Sunday.</h2>
            <p className="mt-2 text-muted-foreground">A short newsletter with picks, deals, and reading lists.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); (e.target as HTMLFormElement).reset(); toast.success("Subscribed! Check your inbox."); }}
              className="mt-6 max-w-md mx-auto flex gap-2"
            >
              <Input type="email" required placeholder="your@email.com" className="glass border-white/10" />
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

function Section({ id, eyebrow, title, cta, children }: { id?: string; eyebrow: string; title: string; cta?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-24 scroll-mt-24">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-accent">{eyebrow}</div>
          <h2 className="font-display text-4xl mt-1">{title}</h2>
        </div>
        {cta}
      </div>
      {children}
    </section>
  );
}
