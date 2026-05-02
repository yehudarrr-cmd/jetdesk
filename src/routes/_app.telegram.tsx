import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Copy, RefreshCw, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/telegram")({
  component: TelegramPage,
});

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function TelegramPage() {
  const qc = useQueryClient();
  const [polling, setPolling] = useState(false);

  const links = useQuery({
    queryKey: ["tg-links"],
    queryFn: async () => {
      const { data, error } = await supabase.from("telegram_chat_links").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const codes = useQuery({
    queryKey: ["tg-codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telegram_pairing_codes")
        .select("*")
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const messages = useQuery({
    queryKey: ["tg-messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("telegram_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const createCode = async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const code = generateCode();
    const expires = new Date(Date.now() + 30 * 60_000).toISOString();
    const { error } = await supabase
      .from("telegram_pairing_codes")
      .insert({ code, owner_id: u.user.id, expires_at: expires });
    if (error) { toast.error(error.message); return; }
    toast.success(`קוד נוצר: ${code}`);
    qc.invalidateQueries({ queryKey: ["tg-codes"] });
  };

  const triggerPoll = async () => {
    setPolling(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("נדרשת התחברות");
      const res = await fetch("/api/public/telegram/poll", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "polling failed");
      toast.success(`עיבוד הסתיים: ${data.processed ?? 0} הודעות`);
      qc.invalidateQueries({ queryKey: ["tg-messages"] });
      qc.invalidateQueries({ queryKey: ["tg-links"] });
      qc.invalidateQueries({ queryKey: ["tg-codes"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "שגיאה");
    } finally {
      setPolling(false);
    }
  };

  const unlink = async (id: string) => {
    if (!confirm("לבטל את החיבור?")) return;
    const { error } = await supabase.from("telegram_chat_links").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("בוטל");
    qc.invalidateQueries({ queryKey: ["tg-links"] });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" /> בוט טלגרם
          </h1>
          <p className="text-muted-foreground mt-1">עדכן לקוחות, רשום תשלומים וצור משימות ישירות מהטלגרם</p>
        </div>
        <Button onClick={triggerPoll} disabled={polling} variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${polling ? "animate-spin" : ""}`} />
          {polling ? "ממתין להודעות..." : "משוך הודעות עכשיו"}
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">חיבור הבוט לחשבון</h2>
        <ol className="text-sm space-y-2 text-muted-foreground list-decimal pr-5">
          <li>פתח את הבוט שלך בטלגרם ושלח <code className="bg-muted px-1.5 py-0.5 rounded">/start</code></li>
          <li>לחץ כאן על <strong>"צור קוד חיבור"</strong></li>
          <li>שלח את הקוד לבוט בטלגרם תוך 30 דקות</li>
          <li>לחץ על <strong>"משוך הודעות עכשיו"</strong> כדי שהבוט יזהה אותך</li>
        </ol>
        <Button onClick={createCode} className="gap-2"><Send className="h-4 w-4" /> צור קוד חיבור חדש</Button>

        {(codes.data?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">קודים פעילים:</div>
            {codes.data!.map((c: any) => (
              <div key={c.code} className="flex items-center justify-between gap-2 bg-muted/40 rounded px-3 py-2">
                <code className="text-lg font-mono font-bold tracking-widest" dir="ltr">{c.code}</code>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">פג בעוד {Math.max(0, Math.round((new Date(c.expires_at).getTime() - Date.now()) / 60_000))} דק׳</span>
                  <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(c.code); toast.success("הועתק"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">חשבונות טלגרם מחוברים</h2>
        {(links.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">אין חשבונות מחוברים עדיין.</p>
        ) : (
          <div className="space-y-2">
            {links.data!.map((l: any) => (
              <div key={l.id} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2.5">
                <div>
                  <div className="font-medium">{l.first_name ?? "—"} {l.username ? <span className="text-muted-foreground text-xs">@{l.username}</span> : null}</div>
                  <div className="text-xs text-muted-foreground" dir="ltr">chat_id: {l.chat_id}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => unlink(l.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-semibold text-lg">הודעות אחרונות</h2>
        {(messages.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">אין הודעות עדיין.</p>
        ) : (
          <div className="space-y-3">
            {messages.data!.map((m: any) => (
              <div key={m.update_id} className="border border-border rounded p-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant={m.status === "processed" ? "default" : m.status === "error" ? "destructive" : "secondary"}>
                    {m.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("he-IL")}</span>
                </div>
                <div className="text-foreground">{m.text ?? "—"}</div>
                {m.reply_text && <div className="text-muted-foreground text-xs border-r-2 border-primary pr-2">↳ {m.reply_text}</div>}
                {m.error && <div className="text-destructive text-xs">{m.error}</div>}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}