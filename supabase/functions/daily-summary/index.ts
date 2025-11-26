// @ts-nocheck
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function summarize(date: string) {
  const { data: users, error: userErr } = await supabase.from("users").select("id");
  if (userErr) throw userErr;

  await Promise.all(
    users.map(async (user) => {
      const { error } = await supabase.rpc("recompute_daily_summary", {
        target_user: user.id,
        target_date: date,
      });
      if (error) console.error("Failed summary", user.id, error);
    })
  );
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json().catch(() => ({}));
  const targetDate: string = body?.date ?? new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  try {
    await summarize(targetDate);
    return new Response(JSON.stringify({ status: "ok", date: targetDate }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Summary failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
