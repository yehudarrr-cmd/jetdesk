import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import jetdeskLogo from "@/assets/jetdesk-logo-transparent.png.asset.json";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("הסיסמה עודכנה בהצלחה");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "שגיאה");
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
            alt="JetDesk"
            width={200}
            height={68}
            className="h-16 w-auto object-contain mb-3"
          />
          <h1 className="text-lg font-semibold">איפוס סיסמה</h1>
        </div>
        {!ready ? (
          <p className="text-sm text-center text-muted-foreground">
            מאמת את קישור האיפוס... אם לא הגעת מקישור במייל, בקש קישור חדש בעמוד הכניסה.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">סיסמה חדשה</Label>
              <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">אישור סיסמה</Label>
              <Input id="confirm" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "..." : "עדכן סיסמה"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}