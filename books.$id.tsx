import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { bookQuery, relatedBooksQuery, reviewsQuery } from "@/lib/queries";
import { BookCard } from "@/components/site/BookCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/books/$id")({
  component: BookDetail,
  errorComponent: ({ error, reset }) => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-3xl">Couldn't load this book.</h1>
      <p className="text-muted-foreground mt-2">{error.message}</p>
      <Button onClick={reset} className="mt-6">Try again</Button>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl">Book not found</h1>
      <Link to="/books" className="mt-6 inline-block text-primary">Back to catalog</Link>
    </div>
  ),
});

function BookDetail() {
  const { id } = Route.useParams();
  const { add } = useCart();
  const book = useQuery(bookQuery(id));
  const reviews = useQuery(reviewsQuery(id));
  const related = useQuery(relatedBooksQuery(book.data?.category_id ?? null, id));
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  if (book.isLoading) return <div className="p-24 text-center text-muted-foreground">Loading…</div>;
  if (!book.data) throw notFound();
  const b = book.data;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/books" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"><ArrowLeft className="h-4 w-4" /> All books</Link>
      <div className="grid md:grid-cols-[320px_1fr] gap-10">
        <div className="rounded-2xl overflow-hidden glass p-3">
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/40">
            {b.cover_url && <img src={b.cover_url} alt={b.title} className="h-full w-full object-cover" />}
          </div>
        </div>
        <div>
          {b.categories && <div className="text-xs uppercase tracking-widest text-accent">{(b.categories as { name: string }).name}</div>}
          <h1 className="font-display text-5xl mt-2">{b.title}</h1>
          <p className="text-lg text-muted-foreground mt-1">by {b.author}</p>
          <div className="flex items-center gap-2 mt-4 text-sm">
            <div className="flex text-accent">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={"h-4 w-4 " + (i < Math.round(Number(b.rating)) ? "fill-current" : "")} />)}
            </div>
            <span>{Number(b.rating).toFixed(1)}</span>
            <span className="text-muted-foreground">({b.rating_count} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mt-5">
            <span className="text-4xl font-display text-primary">${Number(b.price).toFixed(2)}</span>
            {b.original_price && Number(b.original_price) > Number(b.price) && (
              <span className="text-muted-foreground line-through">${Number(b.original_price).toFixed(2)}</span>
            )}
          </div>
          <p className="mt-6 text-foreground/90 leading-relaxed">{b.description}</p>
          <div className="mt-8 flex gap-3">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 glow-green"
              onClick={() => { add({ id: b.id, title: b.title, author: b.author, price: Number(b.price), cover_url: b.cover_url }); toast.success("Added to cart"); }}>
              <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
            </Button>
            <Link to="/cart"><Button size="lg" variant="outline">Go to cart</Button></Link>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-display text-3xl mb-6">Ratings & Reviews</h2>
        <div className="grid md:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-4">
            {reviews.data?.length ? reviews.data.map((r) => (
              <div key={r.id} className="glass rounded-xl p-4">
                <div className="flex text-accent">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={"h-3 w-3 " + (i < r.rating ? "fill-current" : "")} />)}
                </div>
                <p className="mt-2 text-sm">{r.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            )) : <div className="text-muted-foreground text-sm">No reviews yet — be the first!</div>}
          </div>
          <div className="glass rounded-xl p-5 h-fit">
            <h3 className="font-display text-xl mb-3">Write a review</h3>
            {!userId ? (
              <p className="text-sm text-muted-foreground"><Link to="/auth" className="text-primary underline">Sign in</Link> to leave a review.</p>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault(); setSaving(true);
                const { error } = await supabase.from("reviews").upsert({ book_id: b.id, user_id: userId, rating, comment }, { onConflict: "book_id,user_id" });
                setSaving(false);
                if (error) toast.error(error.message);
                else { toast.success("Thanks!"); setComment(""); reviews.refetch(); book.refetch(); }
              }}>
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((n) => (
                    <button type="button" key={n} onClick={() => setRating(n)}>
                      <Star className={"h-6 w-6 " + (n <= rating ? "text-accent fill-accent" : "text-muted-foreground")} />
                    </button>
                  ))}
                </div>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts…" required maxLength={1000} className="bg-white/5 border-white/10" />
                <Button type="submit" disabled={saving} className="mt-3 w-full bg-primary text-primary-foreground hover:bg-primary/90">{saving ? "Saving…" : "Post review"}</Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {(related.data?.length ?? 0) > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.data!.map((rb) => <BookCard key={rb.id} book={rb} />)}
          </div>
        </section>
      )}
    </div>
  );
}