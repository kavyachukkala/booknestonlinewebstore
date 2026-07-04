import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { BookOpen, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — BookNest" }] }),
  component: AuthPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function AuthPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 rounded-2xl glass grid place-items-center mb-3 glow-green">
          <BookOpen className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-display text-4xl">Welcome to BookNest</h1>
      </div>
      <div className="glass-strong rounded-2xl p-6">
        <Tabs defaultValue="signin">
          <TabsList className="w-full grid grid-cols-2 bg-white/5">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="signin"><SignIn /></TabsContent>
          <TabsContent value="signup"><SignUp /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [show, setShow] = useState(false); const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false); const [forgot, setForgot] = useState(false);
  if (forgot) return <Forgot back={() => setForgot(false)} />;
  return (
    <form className="mt-5 space-y-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return toast.error(error.message);
      if (!remember) sessionStorage.setItem("booknest_no_remember", "1");
      toast.success("Signed in"); nav({ to: "/dashboard" });
    }}>
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
      <div>
        <Label>Password</Label>
        <div className="relative mt-1">
          <Input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 pr-10" />
          <button type="button" onClick={() => setShow(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary" /> Remember me</label>
        <button type="button" onClick={() => setForgot(true)} className="text-accent hover:underline">Forgot?</button>
      </div>
      <Button disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green">{busy ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

function SignUp() {
  const nav = useNavigate();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(""); const [busy, setBusy] = useState(false);
  const s = strength(password);

  if (step === "otp") return (
    <div className="mt-5 space-y-4">
      <p className="text-sm text-muted-foreground">We sent a 6-digit code to <span className="text-foreground">{email}</span>.</p>
      <div className="flex justify-center">
        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
          <InputOTPGroup>{Array.from({ length: 6 }).map((_, i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
        </InputOTP>
      </div>
      <Button disabled={busy || otp.length !== 6} onClick={async () => {
        setBusy(true);
        const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: "signup" });
        setBusy(false);
        if (error) return toast.error(error.message);
        toast.success("Verified — welcome!"); nav({ to: "/dashboard" });
      }} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green">
        {busy ? "Verifying…" : "Verify & continue"}
      </Button>
      <button type="button" onClick={() => setStep("form")} className="text-sm text-accent hover:underline w-full text-center">← different email</button>
    </div>
  );

  return (
    <form className="mt-5 space-y-4" onSubmit={async (e) => {
      e.preventDefault();
      if (s < 3) return toast.error("Choose a stronger password");
      setBusy(true);
      const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: window.location.origin + "/dashboard" } });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Check your inbox for the code"); setStep("otp");
    }}>
      <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} className="bg-white/5 border-white/10 mt-1" /></div>
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
      <div><Label>Password</Label><Input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
      <div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={"flex-1 mx-0.5 rounded-full " + (i < s ? (s < 2 ? "bg-destructive" : s < 3 ? "bg-yellow-400" : "bg-primary") : "bg-white/5")} />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mt-1">{s < 2 ? "Weak" : s < 3 ? "Okay" : s < 4 ? "Good" : "Excellent"}</div>
      </div>
      <Button disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-green">{busy ? "Creating…" : "Create account"}</Button>
    </form>
  );
}

function Forgot({ back }: { back: () => void }) {
  const [email, setEmail] = useState(""); const [busy, setBusy] = useState(false);
  return (
    <form className="mt-5 space-y-4" onSubmit={async (e) => {
      e.preventDefault(); setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/reset-password" });
      setBusy(false);
      if (error) return toast.error(error.message);
      toast.success("Reset email sent"); back();
    }}>
      <h3 className="font-display text-2xl">Reset password</h3>
      <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="bg-white/5 border-white/10 mt-1" /></div>
      <Button disabled={busy} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">{busy ? "Sending…" : "Send reset link"}</Button>
      <button type="button" onClick={back} className="text-sm text-accent hover:underline w-full text-center">← back</button>
    </form>
  );
}