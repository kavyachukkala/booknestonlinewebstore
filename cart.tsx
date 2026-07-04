import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your cart — BookNest" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, update, remove } = useCart();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [applying, setApplying] = useState(false);
  const shipping = subtotal > 40 || items.length === 0 ? 0 : 4.99;
  const total = Math.max(0, subtotal - (subtotal * discount) / 100) + shipping;

  async function applyCoupon() {
    if (!code) return;
    setApplying(true);
    const { data, error } = await supabase.from("coupons").select("*").eq("code", code.toUpperCase()).eq("active", true).maybeSingle();
    setApplying(false);
    if (error || !data) return toast.error("Invalid coupon");
    setDiscount(data.discount_percent);
    toast.success(data.discount_percent + "% off applied!");
  }

  if (items.length === 0) return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
      <h1 className="font-display text-4xl mt-4">Your cart is empty</h1>
      <Link to="/books"><Button className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 glow-green">Browse books</Button></Link>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display text-5xl mb-8">Your cart</h1>
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="glass rounded-2xl p-4 flex gap-4">
              <div className="h-24 w-16 rounded-lg overflow-hidden bg-black/40 shrink-0">
                {it.cover_url && <img src={it.cover_url} alt={it.title} className="h-full w-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <Link to="/books/$id" params={{ id: it.id }} className="font-display text-lg hover:text-primary line-clamp-1">{it.title}</Link>
                <p className="text-sm text-muted-foreground">{it.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => update(it.id, it.quantity - 1)} className="h-7 w-7 rounded-md glass grid place-items-center"><Minus className="h-3 w-3" /></button>
                  <span className="w-8 text-center text-sm">{it.quantity}</span>
                  <button onClick={() => update(it.id, it.quantity + 1)} className="h-7 w-7 rounded-md glass grid place-items-center"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-primary">${(it.price * it.quantity).toFixed(2)}</div>
                <button onClick={() => remove(it.id)} className="mt-2 text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove</button>
              </div>
            </div>
          ))}
        </div>
        <aside className="glass-strong rounded-2xl p-6 h-fit">
          <h2 className="font-display text-2xl">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <Row label="Subtotal" value={"$" + subtotal.toFixed(2)} />
            {discount > 0 && <Row label={"Discount (" + discount + "%)"} value={"-$" + ((subtotal * discount) / 100).toFixed(2)} />}
            <Row label="Shipping" value={shipping === 0 ? "Free" : "$" + shipping.toFixed(2)} />
            <div className="border-t border-white/10 pt-3 mt-3 flex justify-between font-display text-2xl">
              <span>Total</span><span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="bg-white/5 border-white/10" />
            <Button variant="outline" onClick={applyCoupon} disabled={applying}>Apply</Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">Try <span className="text-accent">BOOKNEST10</span> or <span className="text-accent">WELCOME20</span></p>
          <Link to="/checkout"><Button className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 glow-green">Checkout</Button></Link>
        </aside>
      </div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}