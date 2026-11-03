#!/usr/bin/env node
/*
 * Lotline's gate: runs on every pull request and before every deploy. Fails on
 *   - a secret or token pattern in any tracked file;
 *   - contact details (email outside bicm.app, phone numbers, IBAN) in the public material:
 *     notes/, README.md and POLICY.md as written, and everything the Worker serves, rendered
 *     (so a split string, a template literal or an escape cannot hide one);
 *   - a number with an energy, cost or emission unit in that material, since BiCM presents
 *     no result on Lotline;
 *   - a change of the pinned configuration: Worker name, the single route, no workers.dev
 *     or preview addresses, no AI binding, only the known keys and bindings, DOOR open or
 *     closed;
 *   - the maintainers' test header in anything the Worker serves;
 *   - a note missing from the sitemap, or listed with a lastmod other than its published date;
 *   - MCP Registry metadata (server.json) that names another namespace, another remote
 *     or a package, or a version other than the server's.
 * Code-owned (CODEOWNERS).
 *
 * Usage: node gate/check.mjs
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const SKIP = new Set([".git", "node_modules", ".wrangler"]);
function files(dir = ".") {
  return readdirSync(dir).flatMap((f) => {
    if (SKIP.has(f)) return [];
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p.replace(/\\/g, "/").replace(/^\.\//, "")];
  });
}

const SECRETS = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bghp_[A-Za-z0-9]{30,}/,
  /\bgithub_pat_[A-Za-z0-9_]{40,}/,
  /\bnpm_[A-Za-z0-9]{30,}/,
  /\bsk-[A-Za-z0-9]{20,}/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{10,}/,
  /(CLOUDFLARE|CF)_?(API_?)?TOKEN\s*[=:]\s*["']?[A-Za-z0-9_-]{30,}/i,
];
const CONTACT = [
  [/[A-Z0-9._%+-]+@(?!bicm\.app(?![.\w-]))[A-Z0-9.-]+\.[A-Z]{2,}/i, "email address"],
  [/(\+|00)\d[\d ()./-]{7,20}\d/, "phone number"],
  [/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}\b/i, "IBAN"],
];
// A number next to an energy, cost or emission unit, in either order ("30 %", "€ 300").
const RESULT = /\b\d[\d.,]*\s?(kWh|MWh|kW\b|W\/\(?m|€|EUR\b|euro|ct\b|t ?CO[2₂]|kg ?CO[2₂]|CO[2₂]e?\b|%|Prozent|percent)|(€|EUR)\s?\d/i;
// Prose files are checked as written; the Worker is checked by what it serves.
const PROSE = (f) => /^notes\//.test(f) || f === "README.md" || f === "POLICY.md";

let problems = 0;
const fail = (f, why) => { console.log(`::error file=${f}::${why}`); problems++; };

/** Text after decoding the escapes a page or JSON could hide a number or address behind. */
function plain(t) {
  return t
    .replace(/&nbsp;|&#160;| /g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/\\u([0-9a-f]{4})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}
const WORDS = /\b\d[\d.,]*[\s-]?(percent|per cent|kilowatt|megawatt|tonnes? of co|euros?)\b/i;

function checkPublic(where, text) {
  const t = plain(text);
  for (const [re, what] of CONTACT) if (re.test(t)) fail(where, `Contact details (${what}) in public material.`);
  const m = RESULT.exec(t) || WORDS.exec(t);
  if (m) fail(where, `A number with a result unit ("${m[0]}"): Lotline presents no result.`);
}

for (const f of files()) {
  if (/\.(png|jpg|ico|woff2?)$/.test(f)) continue;
  const t = readFileSync(f, "utf8");
  if (SECRETS.some((re) => re.test(t))) fail(f, "Secret or token pattern.");
  if (PROSE(f)) checkPublic(f, t);
}

// Everything the Worker serves, rendered: pages, notes, discovery, MCP results, refusals.
const worker = await import(pathToFileURL(join(process.cwd(), "src/worker.js")).href);
const content = await import(pathToFileURL(join(process.cwd(), "src/content.js")).href);
const env = { DOOR: "open", INBOX: { prepare: () => ({ bind: () => ({ run: async () => {} }) }) } };
const get = async (path) => (await worker.default.fetch(new Request(`https://lotline.bicm.app${path}`), env)).text();
const served = [["/", await get("/")], ["/llms.txt", await get("/llms.txt")], ["/privacy", await get("/privacy")], ["/notes", await get("/notes")], ["/schema", await get("/schema")], ["/sitemap.xml", await get("/sitemap.xml")], ["/robots.txt", await get("/robots.txt")]];
for (const n of content.NOTES) served.push([`/notes/${n.id}`, await get(`/notes/${n.id}`)]);
for (const method of ["initialize", "tools/list", "resources/list"]) served.push([`mcp ${method}`, JSON.stringify(await worker.mcp({ jsonrpc: "2.0", id: 1, method, params: {} }, env))]);
for (const r of worker.RESOURCES) served.push([`mcp resources/read ${r.uri}`, JSON.stringify(await worker.mcp({ jsonrpc: "2.0", id: 1, method: "resources/read", params: { uri: r.uri } }, env))]);
for (const [where, text] of served) checkPublic(`src/ (served at ${where})`, text);

// The maintainers' test header is documented for maintainers only, never in what agents read.
const testHeader = new RegExp(worker.TEST_HEADER, "i");
for (const [where, text] of served) if (testHeader.test(text)) fail(`src/ (served at ${where})`, `The maintainers' header ${worker.TEST_HEADER} appears in served material.`);

// Every note is in the sitemap with its published date as lastmod.
const sitemapXml = served.find(([w]) => w === "/sitemap.xml")[1];
for (const n of content.NOTES) if (!sitemapXml.includes(`<loc>https://lotline.bicm.app/notes/${n.id}</loc><lastmod>${n.published}</lastmod>`)) fail("src/worker.js", `Note ${n.id} is missing from /sitemap.xml or has the wrong lastmod.`);

// The MCP Registry metadata (server.json) names this server only, and is public material.
const serverJson = readFileSync("server.json", "utf8");
checkPublic("server.json", serverJson);
const sj = JSON.parse(serverJson);
const init = await worker.mcp({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }, env);
if (!/^https:\/\/static\.modelcontextprotocol\.io\/schemas\/[0-9-]+\/server\.schema\.json$/.test(sj.$schema || "")) fail("server.json", "$schema is the official MCP Registry server.json schema.");
if (!/^app\.bicm(\.[a-z0-9-]+)*\/[a-zA-Z0-9._-]+$/.test(sj.name || "")) fail("server.json", "name lies in the app.bicm namespace (reverse DNS of bicm.app).");
if (typeof sj.description !== "string" || !sj.description || sj.description.length > 100) fail("server.json", "description is 1 to 100 characters.");
if (sj.version !== init.result.serverInfo.version) fail("server.json", "version equals the MCP serverInfo version.");
if ((sj.packages || []).length) fail("server.json", "Lotline is a remote server only: no packages.");
if (JSON.stringify(sj.remotes) !== JSON.stringify([{ type: "streamable-http", url: "https://lotline.bicm.app/mcp" }])) fail("server.json", "The only remote is streamable-http at https://lotline.bicm.app/mcp.");

const cfg = JSON.parse(readFileSync("wrangler.jsonc", "utf8").replace(/^\s*\/\/.*$/gm, ""));
const routes = (cfg.routes || []).map((r) => r.pattern);
const KEYS = ["$schema", "name", "main", "compatibility_date", "vars", "d1_databases", "analytics_engine_datasets", "triggers", "workers_dev", "preview_urls", "observability", "routes"];
if (cfg.name !== "bicm-lotline") fail("wrangler.jsonc", "Worker name must be bicm-lotline.");
if (routes.length !== 1 || routes[0] !== "lotline.bicm.app") fail("wrangler.jsonc", "The only route is lotline.bicm.app.");
if (cfg.workers_dev !== false || cfg.preview_urls !== false) fail("wrangler.jsonc", "workers_dev and preview_urls stay false.");
for (const k of Object.keys(cfg)) if (!KEYS.includes(k)) fail("wrangler.jsonc", `Key "${k}" is not in the pinned configuration (no AI binding, no other bindings or environments).`);
if (JSON.stringify(Object.keys(cfg.vars || {})) !== '["DOOR"]' || !["open", "closed"].includes(cfg.vars.DOOR)) fail("wrangler.jsonc", "vars holds DOOR only, open or closed.");
if ((cfg.d1_databases || []).length !== 1 || cfg.d1_databases[0].binding !== "INBOX") fail("wrangler.jsonc", "One D1 binding, INBOX.");
if ((cfg.analytics_engine_datasets || []).length !== 1 || cfg.analytics_engine_datasets[0].binding !== "EVENTS") fail("wrangler.jsonc", "One Analytics Engine binding, EVENTS.");

console.log(problems ? `${problems} problem(s).` : "Lotline gate passed.");
process.exit(problems ? 1 : 0);
