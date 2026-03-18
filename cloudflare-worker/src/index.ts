interface Env {
  ASSETS_BUCKET: R2Bucket;
  EXTENSION_OBJECT_KEY?: string;
  CONFIG_OBJECT_KEY?: string;
  FALLBACK_CONFIG_JSON?: string;
}

function json(data: unknown, status = 200, cacheControl = "public, max-age=60") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function notFound(message: string) {
  return json({ error: message }, 404, "no-store");
}

async function readConfigFromR2(env: Env) {
  const key = env.CONFIG_OBJECT_KEY || "config/config.json";
  const object = await env.ASSETS_BUCKET.get(key);

  if (!object) {
    if (env.FALLBACK_CONFIG_JSON) {
      return JSON.parse(env.FALLBACK_CONFIG_JSON);
    }
    throw new Error("Missing config object in R2");
  }

  const body = await object.text();
  return JSON.parse(body);
}

async function handleDownload(env: Env): Promise<Response> {
  const key = env.EXTENSION_OBJECT_KEY || "extension.zip";
  const object = await env.ASSETS_BUCKET.get(key);

  if (!object) {
    return notFound("Extension package not found");
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/zip");
  headers.set("Content-Disposition", 'attachment; filename="flowpulse-extension.zip"');
  headers.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  headers.set("X-Content-Type-Options", "nosniff");

  return new Response(object.body, { headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, "no-store");
    }

    if (url.pathname === "/download-extension") {
      return handleDownload(env);
    }

    if (url.pathname === "/config") {
      try {
        const config = await readConfigFromR2(env);
        return json(config, 200, "public, max-age=300, stale-while-revalidate=3600");
      } catch {
        return json(
          {
            version: "unavailable",
            downloadUrl: "/download-extension",
            installNotes: [
              "Download is temporarily unavailable.",
              "Please retry in a few minutes.",
              "Use manual installation if needed.",
            ],
          },
          503,
          "no-store"
        );
      }
    }

    return notFound("Not found");
  },
};
