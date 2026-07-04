import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Package, User as UserIcon, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BookNest" }, { name: "robots", content: "noindex" }] }),
  component: Dashboard,
});

type Order = { id: string; total: number; status: string; created_at: string };
type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null };

function Dashboard() {
  const nav = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { nav({ to: "/auth" }); return; }
    const [{ data: p }, { data: o }] = await Promise.all([
      supabase.from("profiles").select("id,full_name,email,phone").eq("id", u.user.id).maybeSingle(),
      supabase.from("orders").select("id,total,status,created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    setProfile((p as Profile) ?? { id: u.user.id, full_name: null, email: u.user.email ?? null, phone: null });
    setOrders((o ?? []) as Order[]);
    setLoading(false);
  })(); }, [nav]);

  if (loading) return <div className="p-24 text-center text-muted-foreground">Loading…</div>;
  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-[0.2em] text-accent">Your account</div>
        <h1 className="font-display text-5xl mt-1">Hi, {profile?.full_name || "reader"} 👋</h1>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Stat icon={<Package className="h-5 w-5 text-primary" />} label="Orders" value={orders.length} />
        <Stat icon={<ShoppingBag className="h-5 w-5 text-accent" />} label="Total spent" value={"$" + totalSpent.toFixed(2)} />
        <Stat icon={<UserIcon className="h-5 w-5 text-primary" />} label="Member" value="Reader" />
      </div>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <section className="glass rounded-2xl p-6">
          <h2 className="font-display text-2xl mb-4">Recent orders</h2>
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-sm">You haven't ordered anything yet. <Link to="/books" className="text-primary">Browse books →</Link></p>
          ) : (
            <div className="divide-y divide-white/10">
              {orders.map((o) => (
                <div key={o.id} className="py-3 flex justify-between items-center text-sm">
                  <div>
                    <div className="font-mono text-xs text-muted-foreground">#{o.id.slice(0, 8)}</div>
                    <div className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-primary/15 text-primary">{o.status}</span>
                  <div className="font-semibold text-primary">${Number(o.total).toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </section>
        <div className="space-y-6">
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Profile</h2>
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              const { error } = await supabase.from("profiles").upsert({ id: profile!.id, full_name: profile?.full_name, email: profile?.email, phone: profile?.phone });
              if (error) toast.error(error.message); else toast.success("Profile updated");
            }}>
              <div><Label>Name</Label><Input className="bg-white/5 border-white/10 mt-1" value={profile?.full_name ?? ""} onChange={(e) => setProfile({ ...profile!, full_name: e.target.value })} /></div>
              <div><Label>Email</Label><Input className="bg-white/5 border-white/10 mt-1" value={profile?.email ?? ""} disabled /></div>
              <div><Label>Phone</Label><Input className="bg-white/5 border-white/10 mt-1" value={profile?.phone ?? ""} onChange={(e) => setProfile({ ...profile!, phone: e.target.value })} /></div>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Save</Button>
            </form>
          </section>
          <section className="glass rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-4">Change password</h2>
            <form className="space-y-3" onSubmit={async (e) => {
              e.preventDefault();
              if (pw.length < 8) return toast.error("Minimum 8 characters");
              const { error } = await supabase.auth.updateUser({ password: pw });
              if (error) toast.error(error.message); else { toast.success("Password updated"); setPw(""); }
            }}>
              <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} className="bg-white/5 border-white/10" />
              <Button className="w-full">Update</Button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="glass rounded-2xl p-5 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg glass grid place-items-center">{icon}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-display text-2xl">{value}</div>
      </div>
    </div>
  );
}