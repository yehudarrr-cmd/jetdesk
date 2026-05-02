import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TABLES = ["customers", "payments", "tasks", "flights", "timeline_events"] as const;

export function useRealtimeSync() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase.channel("app-realtime");

    for (const table of TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          qc.invalidateQueries();
        }
      );
    }

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
