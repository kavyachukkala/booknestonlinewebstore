import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/order-success/$id")({
  head: () => ({ meta: [{ title: "Order placed — BookNest" }, { name: "robots", content: "noindex" }] }),
  component: OrderSuccess,
});

function OrderSuccess() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<{ total: number; created_at: string } | null>(null);
  useEffect(() => {
    supabase.from("orders").select("total,created_at").eq("id", id).maybeSingle().then(({ data }) => {
      if (data) setOrder({ total: Number(data.total), created_at: data.created_at as string });
    });
  }, [id]);
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="mx-auto h-16 w-16 rounded-full grid place-items-center glass glow-green">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h1 className="font-display text-5xl mt-6">Thank you!</h1>
      <p className="text-muted-foreground mt-2">Your order has been placed successfully.</p>
      <div className="glass rounded-2xl p-5 mt-8 text-left text-sm space-y-1">
        <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono">{id.slice(0, 8)}…</span></div>
        {order && <>
          <div className="flex justify-between"><span className="text-muted-foreground">Placed</span><span>{new Date(order.created_at).toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold text-primary"><span>Total</span><span>${order.total.toFixed(2)}</span></div>
        </>}
      </div>
      <div className="flex justify-center gap-3 mt-8">
        <Link to="/dashboard"><Button className="bg-primary text-primary-foreground hover:bg-primary/90">View orders</Button></Link>
        <Link to="/books"><Button variant="outline">Keep shopping</Button></Link>
      </div>
    </div>
  );
}