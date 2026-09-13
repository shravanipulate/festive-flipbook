import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "POST required" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const action = body?.action;
    const visitId = Number(body?.visit_id);

    if (action === "start") {
      const { data, error } = await supabase
        .from("site_visits")
        .insert({ duration_seconds: 0 })
        .select("id, started_at")
        .single();

      if (error) throw error;
      return json({ visit_id: data.id, started_at: data.started_at });
    }

    if (!Number.isSafeInteger(visitId) || visitId <= 0) {
      return json({ error: "Invalid visit_id" }, 400);
    }

    const duration = Number(body?.duration_seconds);
    if (!Number.isFinite(duration) || duration < 0) {
      return json({ error: "Invalid duration_seconds" }, 400);
    }

    const safeDuration = Math.min(Math.floor(duration), 24 * 60 * 60);
    const update: Record<string, unknown> = {
      duration_seconds: safeDuration,
    };

    if (action === "end") update.ended_at = new Date().toISOString();

    if (action !== "heartbeat" && action !== "end") {
      return json({ error: "Unknown action" }, 400);
    }

    const { error } = await supabase
      .from("site_visits")
      .update(update)
      .eq("id", visitId);

    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "Unable to record visit" }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
