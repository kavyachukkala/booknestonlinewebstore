import { Link } from "@tanstack/react-router";
import { Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

export type BookRow = {
  id: string;
  title: string;
  author: string;
  price: number;
  original_price: number | null;
  cover_url: string | null;
  rating: number;
  rating_count: number;
  is_bestseller?: boolean;
};

export function BookCard({ book }: { book: BookRow }) {
  const { add } = useCart();
  const discount =
    book.original_price && book.original_price > book.price
      ? Math.round((1 - book.price / book.original_price) * 100)
      : 0;

  return (
    <div className="group relative rounded-2xl glass p-4 hover:-translate-y-1 transition-all duration-300 hover:glow-violet">
      {book.is_bestseller && (
        <span className="absolute top-3 right-3 z-10 text-[10px] uppercase tracking-widest px-2 py-1 rounded-full bg-accent/20 border border-accent/40 text-accent">
          Bestseller
        </span>
      )}
      <Link to="/books/$id" params={{ id: book.id }} className="block">
        <div className="aspect-[2/3] rounded-xl overflow-hidden bg-black/30 border border-white/10">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={"Cover of " + book.title + " by " + book.author}
              loading="lazy"
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full grid place-items-center text-muted-foreground text-xs">No cover</div>
          )}
        </div>
        <div className="mt-3">
          <h3 className="font-display text-lg leading-tight line-clamp-2">{book.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-accent text-accent" />
            <span className="text-foreground">{Number(book.rating).toFixed(1)}</span>
            <span>({book.rating_count})</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-lg font-semibold text-primary">${Number(book.price).toFixed(2)}</span>
            {discount > 0 && book.original_price && (
              <>
                <span className="text-xs line-through text-muted-foreground">
                  ${Number(book.original_price).toFixed(2)}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary">-{discount}%</span>
              </>
            )}
          </div>
        </div>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          add({
            id: book.id,
            title: book.title,
            author: book.author,
            price: Number(book.price),
            cover_url: book.cover_url,
          });
          toast.success('Added "' + book.title + '" to cart');
        }}
        className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition"
      >
        <ShoppingCart className="h-4 w-4" /> Add to Cart
      </button>
    </div>
  );
}