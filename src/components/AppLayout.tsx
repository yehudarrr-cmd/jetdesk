import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Plane,
  Inbox,
  FileText,
  CheckSquare,
  CreditCard,
  LogOut,
  Sparkles,
  Bot,
  Menu,
  Sprout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Session } from "@supabase/supabase-js";
import { useRealtimeSync } from "@/hooks/useRealtimeSync";

const NAV = [
  { to: "/", label: "לוח בקרה", icon: LayoutDashboard },
  { to: "/leads", label: "לידים מהאתר", icon: Sprout },
  { to: "/customers", label: "לקוחות", icon: Users },
  { to: "/intake", label: "תיבת קליטה", icon: Inbox },
  { to: "/flights", label: "טיסות", icon: Plane },
  { to: "/tasks", label: "משימות", icon: CheckSquare },
  { to: "/payments", label: "תשלומים", icon: CreditCard },
  { to: "/documents", label: "מסמכים", icon: FileText },
  { to: "/telegram", label: "בוט טלגרם", icon: Bot },
] as const;

export function AppLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useRealtimeSync();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !session) {
      navigate({ to: "/auth" });
    }
  }, [loading, session, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">טוען...</div>
      </div>
    );
  }
  if (!session) return null;

  const navItems = (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map((n) => {
        const active = location.pathname === n.to ||
          (n.to !== "/" && location.pathname.startsWith(n.to));
        const Icon = n.icon;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const sidebarHeader = (
    <div className="px-6 py-6 border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-bold text-sidebar-foreground leading-tight">Travel CRM</div>
          <div className="text-[10px] text-muted-foreground">כרטסת לקוח</div>
        </div>
      </div>
    </div>
  );

  const sidebarFooter = (
    <div className="px-3 py-3 border-t border-sidebar-border">
      <div className="text-xs text-muted-foreground px-3 mb-2 truncate">
        {session.user.email}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={async () => {
          await supabase.auth.signOut();
          navigate({ to: "/auth" });
        }}
      >
        <LogOut className="h-4 w-4" />
        התנתקות
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background" dir="rtl">
      <aside className="hidden md:flex w-60 flex-col bg-sidebar border-l border-sidebar-border">
        {sidebarHeader}
        {navItems}
        {sidebarFooter}
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-64 bg-sidebar flex flex-col" dir="rtl">
              {sidebarHeader}
              {navItems}
              {sidebarFooter}
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Travel CRM</span>
          </div>
          <div className="w-9" />
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}