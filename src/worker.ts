import { Hono } from "hono";
import { cors } from "hono/cors";
import { createAddonHandler } from "./lib/addon.js";

const PROXY_WHITELISTED_DOMAINS = [
  "au-d1-01.scws-content.net",
  "au-d1-02.scws-content.net",
  "au-d1-03.scws-content.net",
  "au-d1-04.scws-content.net",
  "au-d1-05.scws-content.net",
];

const app = new Hono();

app.use("*", cors());

app.get("/_internal/stream-proxy/:url", async (c) => {
  const url = new URL(c.req.param("url"));

  if (!PROXY_WHITELISTED_DOMAINS.includes(url.hostname)) {
    return new Response("Not allowed", { status: 403 });
  }

  const response = await fetch(url.toString(), {
    headers: c.req.raw.headers,
  });

  return response;
});

app.get("*", async (c) => {
  const url = new URL(c.req.url);

  const proxyBase = `${url.origin}/_internal/stream-proxy/`;

  const response = await createAddonHandler(proxyBase)(c.req.raw);

  if (!response) {
    return new Response("Not found", { status: 404 });
  }

  return response;
});

export default app;
