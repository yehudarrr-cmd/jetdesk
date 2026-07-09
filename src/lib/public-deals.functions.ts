import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

type Deal = Database["public"]["Tables"]["deals"]["Row"];

const sortSchema = z.union([z.literal("price_asc"), z.literal("date_asc")]).catch("price_asc");

export const getPublicDeals = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        kosher: z.boolean().optional(),
        sort: sortSchema.optional().default("price_asc"),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data }): Promise<Deal[]> => {
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITSupabase_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(new Error("Missing backend public configuration for public deals SSR"));
      return [];
    }

    const sb = createClient<Database>(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let query = sb
      .from("deals")
      .select("*")
      .eq("active", true)
      .order("featured", { ascending: false });

    if (data.sort === "date_asc") {
      query = query
        .order("start_date", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
    } else {
      query = query
        .order("price_from", { ascending: true, nullsFirst: false })
        .order("sort_order", { ascending: false })
        .order("created_at", { ascending: false });
    }

    if (data.kosher) {
      query = query.contains("tags", ["kosher"]);
    }

    const { data: deals, error } = await query;
    if (error) {
      console.error(error);
      return [];
    }

    return deals ?? [];
  });