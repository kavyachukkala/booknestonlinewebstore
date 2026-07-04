import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { booksQuery, categoriesQuery } from "@/lib/queries";
import { BookCard } from "@/components/site/BookCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/books")({
  head: () => ({ meta: [{ title: "All Books — BookNest" }, { name: "description", content: "Browse the full BookNest catalog with live search, filters, and honest ratings." }] }),
  component: BooksPage,
});

function BooksPage() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [sort, setSort] = useState<"newest" | "price_asc" | "price_desc" | "rating">("newest");
  const [page, setPage] = useState(1);
  useEffect(() => { const t = setTimeout(() => setDebounced(q), 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); }, [debounced, category, sort]);
  const cats = useQuery(categoriesQuery);
  const books = useQuery(booksQuery({ search: debounced, categoryId: category, sort, page, pageSize: 12 }));
  const totalPages = Math.max(1, Math.ceil((books.data?.total ?? 0) / 12));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-accent">Catalog</div>
        <h1 className="font-display text-5xl mt-1">The full library</h1>
        <p className="text-muted-foreground mt-2">Search updates as you type.</p>
      </div>
      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        <aside className="glass rounded-2xl p-5 h-fit lg:sticky lg:top-24">
          <div className="flex items-center gap-2 mb-4"><SlidersHorizontal className="h-4 w-4 text-accent" /><h2 className="font-display text-xl">Filters</h2></div>
          <div className="relative mb-5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Live search…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 bg-white/5 border-white/10" />
          </div>
          <div className="mb-5">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Category</label>
            <div className="mt-2 space-y-1">
              <button onClick={() => setCategory(undefined)} className={"block w-full text-left text-sm py-1.5 px-2 rounded " + (!category ? "bg-primary/15 text-primary" : "hover:bg-white/5")}>All categories</button>
              {(cats.data ?? []).map((c) => (
                <button key={c.id} onClick={() => setCategory(c.id)} className={"block w-full text-left text-sm py-1.5 px-2 rounded " + (category === c.id ? "bg-primary/15 text-primary" : "hover:bg-white/5")}>{c.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Sort</label>
            <select value={sort} onChange={(e) => setSort(e.target.value as never)} className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </aside>
        <div>
          <div className="mb-4 text-sm text-muted-foreground">{books.isFetching ? "Searching…" : (books.data?.total ?? 0) + " results"}</div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {(books.data?.rows ?? []).map((b) => <BookCard key={b.id} book={b} />)}
          </div>
          {books.data && books.data.rows.length === 0 && (
            <div className="glass rounded-2xl p-10 text-center"><div className="font-display text-2xl">No books matched.</div></div>
          )}
          {totalPages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
              <div className="glass rounded-lg px-4 py-2 text-sm">Page {page} of {totalPages}</div>
              <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
          <div className="hidden"><Link to="/">Home</Link></div>
        </div>
      </div>
    </div>
  );
}