import { useEffect, type ReactNode } from "react";
import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">העמוד לא נמצא</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          העמוד שחיפשת לא קיים או הועבר.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-foreground">שגיאה בטעינת העמוד</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          הייתה תקלה זמנית בטעינת התוכן. נסו לרענן את העמוד או לחזור לעמוד הבית.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            נסו שוב
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            חזרה לעמוד הבית
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "גולדטוס | סוכנות נסיעות פרימיום - טיסות, מלונות ו-VIP" },
      { name: "description", content: "גולדטוס - סוכנות נסיעות פרימיום מבית אמירים טורס. טיסות עסקיות, מלונות יוקרה, VIP בנתב\"ג וביטוח נסיעות. שירות אישי 24/7." },
      { name: "theme-color", content: "#0B0B0B" },
      { property: "og:site_name", content: "גולדטוס · GoldTus" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "he_IL" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "גולדטוס | סוכנות נסיעות פרימיום - טיסות, מלונות ו-VIP" },
      { name: "twitter:title", content: "גולדטוס | סוכנות נסיעות פרימיום - טיסות, מלונות ו-VIP" },
      { property: "og:description", content: "גולדטוס - סוכנות נסיעות פרימיום מבית אמירים טורס. טיסות עסקיות, מלונות יוקרה, VIP בנתב\"ג וביטוח נסיעות. שירות אישי 24/7." },
      { name: "twitter:description", content: "גולדטוס - סוכנות נסיעות פרימיום מבית אמירים טורס. טיסות עסקיות, מלונות יוקרה, VIP בנתב\"ג וביטוח נסיעות. שירות אישי 24/7." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/62AQQtzm4vSZrffm1h6h6VOLxA93/social-images/social-1782789249101-גולדטוס_לוגו.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/62AQQtzm4vSZrffm1h6h6VOLxA93/social-images/social-1782789249101-גולדטוס_לוגו.webp" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@500;700;900&family=Heebo:wght@300;400;500;600;700;800&display=swap" },
      { rel: "alternate", type: "text/markdown", href: "/llms.txt", title: "llms.txt" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  errorComponent: ErrorComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-center" dir="rtl" />
    </QueryClientProvider>
  );
}
