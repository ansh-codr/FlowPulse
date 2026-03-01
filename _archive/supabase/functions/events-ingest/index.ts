// @ts-nocheck
import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const EventSchema = z.object({
  ts: z.string().datetime(),
  url: z.string().url(),
  title: z.string().max(512).optional(),
  active_seconds: z.number().int().min(0).max(3600),
  is_idle: z.boolean(),
});

const PayloadSchema = z.array(EventSchema).min(1).max(100);

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    return new Response(JSON.stringify({ error: "Missing authorization token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (_err) {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = PayloadSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Validation failed", details: parsed.error.flatten() }), {
      status: 422,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = parsed.data.map((event) => ({
    user_id: userResult.user.id,
    ts: event.ts,
    url: event.url,
    title: event.title ?? null,
    active_seconds: event.active_seconds,
    is_idle: event.is_idle,
  }));

  const { error } = await supabase.from("activity_events").insert(rows);
  if (error) {
    console.error("Insert error", error);
    return new Response(JSON.stringify({ error: "Failed to insert events" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ inserted: rows.length }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
});
