import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — BookNest" }, { name: "robots", content: "noindex" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="glass-strong rounded-2xl p-6">
        <h1 className="font-display text-3xl">Set a new password</h1>
        <form className="mt-5 space-y-4" onSubmit={async (e) => {
          e.preventDefault();
          if (pw !== pw2) return toast.error("Passwords don't match");
          if (pw.length < 8) return toast.error("Password must be 8+ characters");
          setBusy(true);
          const { error } = await supabase.auth.updateUser({ password: pw });
          setBusy(false);
          if (error) return toast.error(error.message);
          toast.success("Password updated"); nav({ to: "/dashboard" });
        }}>
          <div><Label>New password</Label><Input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
          <div><Label>Confirm</Label><Input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
          <Button disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green">{busy ? "Saving…" : "Update password"}</Button>
        </form>
      </div>
    </div>
  );
}