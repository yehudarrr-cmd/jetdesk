import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import jetdeskLogo from "@/assets/jetdesk-logo-transparent.png.asset.json";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        toast.success("שלחנו לך מייל עם קישור לאיפוס סיסמה");
        setMode("login");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        toast.success("נרשמת בהצלחה!");
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 shadow-elegant">
        <div className="flex flex-col items-center mb-6">
          <img
            src={jetdeskLogo.url}
            alt="JetDesk - CRM for Travel Agents"
            width={200}
            height={68}
            className="h-16 w-auto object-contain mb-3"
          />
          <p className="text-sm text-muted-foreground">כרטסת לקוח חכמה לסוכן הנסיעות</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : mode === "login" ? "כניסה" : mode === "signup" ? "הרשמה" : "שלח קישור לאיפוס"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-center text-sm text-muted-foreground">
          {mode === "login" && (
            <>
              <button className="hover:text-foreground" onClick={() => setMode("forgot")}>
                שכחת סיסמה?
              </button>
              <button className="hover:text-foreground" onClick={() => setMode("signup")}>
                אין לך חשבון? הירשם
              </button>
            </>
          )}
          {mode === "signup" && (
            <button className="hover:text-foreground" onClick={() => setMode("login")}>
              יש לך חשבון? התחבר
            </button>
          )}
          {mode === "forgot" && (
            <button className="hover:text-foreground" onClick={() => setMode("login")}>
              חזרה לכניסה
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}