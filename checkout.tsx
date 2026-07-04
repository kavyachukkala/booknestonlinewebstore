import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCart } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Truck } from "lucide-react";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout — BookNest" }, { name: "robots", content: "noindex" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const nav = useNavigate();
  const { items, subtotal, clear } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", zip: "", phone: "", payment: "card" });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { toast.info("Please sign in to checkout"); nav({ to: "/auth" }); }
      else setUserId(data.user.id);
    });
  }, [nav]);

  const shipping = subtotal > 40 ? 0 : 4.99;
  const total = subtotal + shipping;

  if (items.length === 0) return <div className="p-24 text-center text-muted-foreground">Your cart is empty.</div>;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    const { data: order, error } = await supabase.from("orders").insert({
      user_id: userId, subtotal, discount: 0, shipping, total,
      shipping_name: form.name, shipping_address: form.address, shipping_city: form.city,
      shipping_zip: form.zip, shipping_phone: form.phone, payment_method: form.payment, status: "paid",
    }).select("id").single();
    if (error || !order) { setBusy(false); return toast.error(error?.message ?? "Order failed"); }
    const { error: iErr } = await supabase.from("order_items").insert(items.map((it) => ({
      order_id: order.id, book_id: it.id, title: it.title, cover_url: it.cover_url, price: it.price, quantity: it.quantity,
    })));
    setBusy(false);
    if (iErr) return toast.error(iErr.message);
    clear(); toast.success("Order placed!"); nav({ to: "/order-success/$id", params: { id: order.id } });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-5xl mb-8">Checkout</h1>
      <form onSubmit={placeOrder} className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-6">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-2xl flex items-center gap-2"><Truck className="h-5 w-5 text-accent" /> Shipping address</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <F label="Full name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" /></F>
              <F label="Phone"><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10" /></F>
              <F label="Address" className="sm:col-span-2"><Input required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-white/5 border-white/10" /></F>
              <F label="City"><Input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-white/5 border-white/10" /></F>
              <F label="Postal code"><Input required value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="bg-white/5 border-white/10" /></F>
            </div>
          </section>
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-2xl flex items-center gap-2"><CreditCard className="h-5 w-5 text-accent" /> Payment (demo)</h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-2">
              {["card", "paypal", "cod"].map((m) => (
                <button type="button" key={m} onClick={() => setForm({ ...form, payment: m })} className={"glass rounded-xl p-4 text-sm capitalize " + (form.payment === m ? "ring-2 ring-primary glow-green" : "")}>
                  {m === "cod" ? "Cash on delivery" : m}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">This is a demo — no card is charged.</p>
          </section>
        </div>
        <aside className="glass-strong rounded-2xl p-6 h-fit">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm max-h-64 overflow-auto pr-1">
            {items.map((it) => (
              <div key={it.id} className="flex justify-between gap-2">
                <span className="line-clamp-1">{it.title} <span className="text-muted-foreground">× {it.quantity}</span></span>
                <span>${(it.price * it.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10 mt-3 pt-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? "Free" : "$" + shipping.toFixed(2)}</span></div>
            <div className="flex justify-between font-display text-2xl mt-2"><span>Total</span><span className="text-primary">${total.toFixed(2)}</span></div>
          </div>
          <Button type="submit" disabled={busy} className="w-full mt-5 bg-primary text-primary-foreground hover:bg-primary/90 glow-green">{busy ? "Placing order…" : "Place order"}</Button>
        </aside>
      </form>
    </div>
  );
}

function F({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={className}><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label><div className="mt-1">{children}</div></div>;
}