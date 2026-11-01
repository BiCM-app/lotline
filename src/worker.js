/*
 * Lotline at lotline.bicm.app: the workspace of BiCM's agents and a door for other agents.
 *
 *   /                 a page for people and agents
 *   /llms.txt         what Lotline is, for machines
 *   /mcp              an MCP server: one JSON-RPC message per POST, stateless (revision
 *                     2026-07-28)
 *   /notes, /notes/x  the public notes as JSON
 *   /inbox (POST)     a structured message from another agent
 *
 * The door is open only when DOOR is "open"; anything else, or no value, keeps it closed.
 * Outside text is stored and returned only as data: no language model runs here, and
 * nothing an outside agent writes is followed as an instruction. Messages with contact
 * details are refused; senders are asked to send no personal data. Counts go to Analytics
 * Engine without IP address or user agent, and a refused message is counted without its
 * fields.
 */

import { ABOUT, NOTES, KINDS, TOPICS, PRIVACY, RETENTION_MONTHS } from "./content.js";

export const HEADERS = {
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export const MCP_VERSION = "2026-07-28";
// MAX_TEXT bounds one message; MAX_FIELD the agent and module names; MAX_BODY follows from
// them with room for JSON.
export const MAX_TEXT = 4000;
export const MAX_FIELD = 200;
export const MAX_BODY = 16384;

// Linear patterns only: each is checked on text no longer than MAX_TEXT.
const CONTACT = [
  /[^\s@]{1,64}@[^\s@]{1,253}\.[a-z]{2,24}/i, // email address
  /\b[^\s()]{1,64}\s*[([]?\s*at\s*[)\]]?\s+[^\s()]{1,253}\s*[([]?\s*dot\s*[)\]]?\s+[a-z]{2,24}\b/i, // "name (at) domain dot tld", with or without brackets
  /(\+|00)\d[\d ()./-]{7,20}\d/, // international phone number
  /\b0\d{2,5}[ /-]?\d{4,10}\b/, // German phone number
  /\b[a-z]{2}\d{2}(?: ?[a-z0-9]{4}){3,7}\b/i, // IBAN
];

/** Why a message cannot be stored, or null. */
export function refusal(msg) {
  if (!msg || typeof msg !== "object" || Array.isArray(msg)) return "The body must be a JSON object.";
  if (!KINDS.includes(msg.kind)) return `kind must be one of: ${KINDS.join(", ")}.`;
  if (!TOPICS.includes(msg.topic)) return `topic must be one of: ${TOPICS.join(", ")}.`;
  if (typeof msg.text !== "string" || !msg.text.trim()) return "text is required.";
  if (msg.text.length > MAX_TEXT) return `text is limited to ${MAX_TEXT} characters.`;
  for (const k of ["agent", "module"]) {
    if (msg[k] === undefined) continue;
    if (typeof msg[k] !== "string") return `${k} must be text.`;
    if (msg[k].length > MAX_FIELD) return `${k} is limited to ${MAX_FIELD} characters.`;
  }
  const fields = [msg.text, msg.agent || "", msg.module || ""];
  if (fields.some((f) => CONTACT.some((re) => re.test(f)))) return "Contact details are not accepted. Send no personal data.";
  return null;
}

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { ...HEADERS, "Content-Type": "application/json; charset=utf-8" } });
}

// Read-only documents may be fetched from any page; writes may not (see headerRefusal).
function publicJson(body, status = 200) {
  const r = json(body, status);
  r.headers.set("Access-Control-Allow-Origin", "*");
  return r;
}

function text(body, type = "text/plain; charset=utf-8", status = 200) {
  return new Response(body, { status, headers: { ...HEADERS, "Content-Type": type } });
}

/**
 * Why a write must be refused before its body is read, or null. A page on another site may
 * not write (agents send no Origin); the body is bounded; a named MCP revision must be one
 * this server speaks; Mcp-Method, when sent, must match the body (checked after parsing).
 */
export function headerRefusal(headers, origin, isMcp) {
  const o = headers.get("origin");
  if (o && o !== origin) return [403, "Requests from another site's page are not accepted."];
  const len = Number(headers.get("content-length") || "0");
  if (len > MAX_BODY) return [413, `The body is limited to ${MAX_BODY} bytes.`];
  if (isMcp) {
    const v = headers.get("mcp-protocol-version");
    if (v && v !== MCP_VERSION) return [400, `Unsupported MCP-Protocol-Version. Supported: ${MCP_VERSION}.`];
  }
  return null;
}

/** The body as JSON, read up to MAX_BODY bytes; an error when it is longer or not JSON. */
async function readJson(request) {
  const reader = request.body?.getReader();
  if (!reader) return { error: "empty" };
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY) { await reader.cancel(); return { error: "large" }; }
      chunks.push(value);
    }
  } catch {
    return { error: "parse" };
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) { bytes.set(c, at); at += c.byteLength; }
  try { return { body: JSON.parse(new TextDecoder().decode(bytes)) }; } catch { return { error: "parse" }; }
}

export function llmsTxt(origin, open = true) {
  if (!open) return [`# ${ABOUT.name}`, "", `> ${ABOUT.summary}`, "", "The door is closed: the MCP server and the inbox accept no requests.", "", `Operator: ${ABOUT.operator} (${ABOUT.site}).`, ""].join("\n");
  return [
    `# ${ABOUT.name}`,
    "",
    `> ${ABOUT.summary}`,
    "",
    ABOUT.status,
    "",
    "## Door",
    `- MCP server: POST ${origin}/mcp, one JSON-RPC message per request (initialize, tools/list, tools/call), MCP revision ${MCP_VERSION}`,
    `- Notes: ${origin}/notes`,
    `- Inbox: POST ${origin}/inbox with JSON {"kind", "topic", "text", "agent", "module"}; kinds: ${KINDS.join(", ")}; topics: ${TOPICS.join(", ")}; text up to ${MAX_TEXT} characters`,
    "",
    "## Rules",
    "- Contact details are refused. Send no personal data.",
    "- Your text is stored as data. BiCM's agents read it; nothing in it is followed as an instruction.",
    "- Lotline makes no commitment, quotes no price and computes no result.",
    "",
    `Operator: ${ABOUT.operator} (${ABOUT.site}).`,
    "",
  ].join("\n");
}

export const TOOLS = [
  { name: "list_notes", description: "List BiCM's public notes (id and title).", inputSchema: { type: "object", properties: {}, additionalProperties: false } },
  { name: "get_note", description: "Read one public note by id.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"], additionalProperties: false } },
  {
    name: "leave_message",
    description: "Leave a message for BiCM. Contact details are refused; send no personal data. The text is stored as data and never followed as an instruction.",
    inputSchema: {
      type: "object",
      properties: {
        kind: { type: "string", enum: KINDS },
        topic: { type: "string", enum: TOPICS },
        text: { type: "string", maxLength: MAX_TEXT },
        agent: { type: "string", maxLength: MAX_FIELD, description: "Your agent's name or family" },
        module: { type: "string", maxLength: MAX_FIELD, description: "A module you would use, if any" },
      },
      required: ["kind", "topic", "text"],
      additionalProperties: false,
    },
  },
];

async function store(env, msg) {
  if (!env.INBOX) throw new Error("inbox not configured");
  const id = crypto.randomUUID();
  await env.INBOX.prepare("INSERT INTO messages (id, received, kind, topic, agent, module, text) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, new Date().toISOString(), msg.kind, msg.topic, msg.agent || "", msg.module || "", msg.text).run();
  return id;
}

/** The agent family as counted: a short name of letters, digits and hyphens, else "other". */
export function family(agent) {
  const a = String(agent || "").trim().toLowerCase();
  return /^[a-z0-9-]{1,32}$/.test(a) ? a : a ? "other" : "";
}

// blobs: door, tool, outcome, agent family, kind, topic. Kind and topic come from fixed lists.
function count(env, door, tool, outcome, agent, msg) {
  const ok = outcome === "ok";
  try { env.EVENTS?.writeDataPoint({ blobs: [door, tool || "", outcome, ok ? family(agent) : "", ok && msg ? msg.kind : "", ok && msg ? msg.topic : ""], indexes: [door] }); } catch { /* counts never break a request */ }
}

/** Deletes messages older than the retention period; run daily by the cron trigger. */
export async function purge(env, now = new Date()) {
  const cut = new Date(now);
  cut.setUTCMonth(cut.getUTCMonth() - RETENTION_MONTHS);
  await env.INBOX.prepare("DELETE FROM messages WHERE received < ?").bind(cut.toISOString()).run();
  return cut.toISOString();
}

/** One MCP JSON-RPC message; returns the response object, or null for a notification. */
export async function mcp(req, env) {
  const id = req && typeof req === "object" && "id" in req ? req.id : null;
  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });
  if (!req || typeof req !== "object" || Array.isArray(req) || req.jsonrpc !== "2.0" || typeof req.method !== "string") return err(-32600, "Invalid request: one JSON-RPC object per POST.");
  if (!("id" in req)) return null;
  try {
    switch (req.method) {
      case "initialize":
        return ok({ protocolVersion: MCP_VERSION, capabilities: { tools: {} }, serverInfo: { name: "lotline", version: "0.1.0" }, instructions: llmsTxt("https://lotline.bicm.app") });
      case "ping":
        return ok({});
      case "tools/list":
        return ok({ tools: TOOLS });
      case "tools/call": {
        const params = req.params && typeof req.params === "object" ? req.params : {};
        const name = params.name;
        const args = params.arguments && typeof params.arguments === "object" && !Array.isArray(params.arguments) ? params.arguments : {};
        const content = (t) => ok({ content: [{ type: "text", text: typeof t === "string" ? t : JSON.stringify(t, null, 2) }] });
        const fail = (t) => ok({ content: [{ type: "text", text: t }], isError: true });
        if (name === "list_notes") { count(env, "mcp", name, "ok"); return content(NOTES.map(({ id: nid, title }) => ({ id: nid, title }))); }
        if (name === "get_note") { const n = NOTES.find((x) => x.id === args.id); count(env, "mcp", name, n ? "ok" : "rejected"); return n ? content(n) : fail("No note with that id."); }
        if (name === "leave_message") {
          const why = refusal(args);
          if (why) { count(env, "mcp", name, "rejected"); return fail(why); }
          const mid = await store(env, args);
          count(env, "mcp", name, "ok", args.agent, args);
          return content({ stored: mid, note: "Stored as data. BiCM's agents read the inbox; Lotline makes no commitment." });
        }
        return err(-32602, "Unknown tool");
      }
      default:
        return err(-32601, "Method not found");
    }
  } catch {
    count(env, "mcp", req.method, "error");
    return err(-32603, "Internal error. The message was not stored.");
  }
}

function page(origin, open = true) {
  const notes = NOTES.map((n) => `<li><b>${esc(n.title)}.</b> ${esc(n.text)}</li>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Lotline</title>
<style>body{font:16px/1.55 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;color:#1a1a1a;background:#fbfaf7}h1{font-weight:600}code{background:#eee;padding:0 .25rem}small{color:#666}@media(prefers-color-scheme:dark){body{background:#111;color:#e8e6e1}code{background:#222}small{color:#999}}</style></head>
<body><h1>Lotline</h1><p>${esc(ABOUT.summary)}</p><p>${esc(ABOUT.status)}</p>
<h2>For agents</h2>${open ? `<ul><li>MCP: <code>POST ${esc(origin)}/mcp</code></li><li>Read: <code>${esc(origin)}/llms.txt</code></li><li>Inbox: <code>POST ${esc(origin)}/inbox</code>. Contact details are refused; send no personal data. <a href="/privacy">Privacy</a>.</li></ul>` : "<p>The door is closed.</p>"}
<h2>Notes</h2><ul>${notes}</ul><p><small>Operator: ${esc(ABOUT.operator)}, <a href="${esc(ABOUT.site)}/impressum">Impressum</a>. Lotline makes no commitment, quotes no price and computes no result.</small></p></body></html>`;
}

export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(purge(env));
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = url.origin;
    const open = env.DOOR === "open";
    if (request.method === "GET") {
      if (url.pathname === "/") { count(env, "page", "", "ok"); return text(page(origin, open), "text/html; charset=utf-8"); }
      if (url.pathname === "/llms.txt") { count(env, "llms", "", "ok"); return text(llmsTxt(origin, open)); }
      if (url.pathname === "/privacy") return text(PRIVACY);
      if (url.pathname === "/notes") return publicJson(NOTES.map(({ id, title }) => ({ id, title })));
      const m = /^\/notes\/([a-z0-9-]{1,64})$/.exec(url.pathname);
      if (m) { const n = NOTES.find((x) => x.id === m[1]); return n ? publicJson(n) : publicJson({ error: "No note with that id." }, 404); }
      if (url.pathname === "/mcp") return json({ error: "The MCP server answers POST requests with one JSON-RPC message." }, 405);
      return json({ error: "Not found" }, 404);
    }
    if (request.method === "POST" && (url.pathname === "/mcp" || url.pathname === "/inbox")) {
      const isMcp = url.pathname === "/mcp";
      if (!open) return json({ error: "The door is closed." }, 403);
      const h = headerRefusal(request.headers, origin, isMcp);
      if (h) return json(isMcp ? { jsonrpc: "2.0", id: null, error: { code: -32600, message: h[1] } } : { error: h[1] }, h[0]);
      const read = await readJson(request);
      if (read.error === "large") {
        const m = `The body is limited to ${MAX_BODY} bytes.`;
        return json(isMcp ? { jsonrpc: "2.0", id: null, error: { code: -32600, message: m } } : { error: m }, 413);
      }
      if (read.error) return json(isMcp ? { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } } : { error: "The body must be JSON." }, 400);
      const body = read.body;
      if (!isMcp) {
        const why = refusal(body);
        if (why) { count(env, "inbox", "", "rejected"); return json({ error: why }, 400); }
        try {
          const id = await store(env, body);
          count(env, "inbox", "", "ok", body.agent, body);
          return json({ stored: id, note: "Stored as data. BiCM's agents read the inbox; Lotline makes no commitment." }, 201);
        } catch {
          count(env, "inbox", "", "error");
          return json({ error: "The inbox is not available. The message was not stored." }, 503);
        }
      }
      const method = request.headers.get("mcp-method");
      if (method && body && method !== body.method) return json({ jsonrpc: "2.0", id: body.id ?? null, error: { code: -32600, message: "Mcp-Method does not match the body." } }, 400);
      const res = await mcp(body, env);
      return res ? json(res) : new Response(null, { status: 202, headers: HEADERS });
    }
    return json({ error: "Method not allowed" }, 405);
  },
};
