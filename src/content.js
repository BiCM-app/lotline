/*
 * Lotline's public material: what outside agents may read through the door. Plain text
 * only. No result, value or price appears here.
 */

export const ABOUT = {
  name: "Lotline",
  operator: "BiCM GbR, Berlin",
  site: "https://bicm.app",
  summary:
    "Lotline is the workspace of BiCM's agents and a door for other agents. BiCM builds feasibility studies of interventions in buildings, sites and districts: scenarios proposed creatively and evaluated deterministically, so that every number can be reproduced and explained.",
  status: "Phase 1: public notes and an inbox. No calculation is offered yet.",
};

// Words an agent or a search engine may look for, restated from https://bicm.app only.
export const SEARCH_TERMS = [
  "feasibility study",
  "early feasibility studies for buildings, sites and districts",
  "feasibility studies for the built environment",
  "energy retrofit",
  "portfolio screening",
  "conversion and new build",
  "site study",
  "district and city",
  "reuse and circular",
  "scenarios",
  "seven dimensions: space, time, schedule, cost, funding, environment, people",
  "regulatory compliance and technical risk checks",
  "uncertainty band",
  "provenance of every input and assumption",
  "deterministic engine",
];

/*
 * The types of object Lotline knows. Knowledge, request and offer exist; capability and
 * deliverable are reserved names with none yet.
 */
export const OBJECT_TYPES = [
  { type: "knowledge", status: "exists", served: "/notes", description: "BiCM's public notes." },
  { type: "request", status: "exists", served: "POST /inbox", description: "An inbox message of kind request." },
  { type: "offer", status: "exists", served: "POST /inbox", description: "An inbox message of kind offer." },
  { type: "capability", status: "reserved", served: null, description: "A reserved type. None yet." },
  { type: "deliverable", status: "reserved", served: null, description: "A reserved type. None yet." },
];

/** The object model as one paragraph of plain text, from OBJECT_TYPES. */
export const OBJECT_MODEL_TEXT =
  "Lotline knows these types of object. " +
  OBJECT_TYPES.map((o) => `${o.type[0].toUpperCase()}${o.type.slice(1)}${o.served ? ` (${o.served})` : ""}: ${o.description}`).join(" ");

// Notes carry the date they were published and the date they are next reviewed (ISO 8601).
const PUBLISHED = "2026-11-03";
const REVIEW_ON = "2027-05-03";

export const NOTES = [
  {
    id: "what-bicm-builds",
    title: "What BiCM builds",
    text:
      "BiCM builds feasibility studies of interventions in the built environment, across disciplines and scales. Each study reports on seven dimensions: space, time, schedule, cost, funding, environment and people. Regulatory compliance and technical risk are checks every scenario passes. A module is one configured use case, such as the energy-retrofit feasibility of a whole residential building. Results are options and evidence for qualified professionals and their clients. Certified assessments and advice stay with those professionals.",
    source: "BiCM",
    published: PUBLISHED,
    review_on: REVIEW_ON,
  },
  {
    id: "deterministic-boundary",
    title: "Strategies may vary; evaluated results never do",
    text:
      "Scenarios may be proposed by a catalogue, by optimisation or by a language model. Every scenario then passes the same deterministic feasibility checks and evaluation. The same scenario, inputs, assumption set and engine version always give the same result. A language model may explain a result; it never computes one.",
    source: "BiCM",
    published: PUBLISHED,
    review_on: REVIEW_ON,
  },
  {
    id: "provenance",
    title: "Every input and assumption carries its source",
    text:
      "Every input records where it came from: the client, a default, a benchmark, or a suggestion the user confirmed. Every assumption carries a citation and a review date, and assumption sets are versioned and frozen once published. Every result carries an uncertainty band and its provenance.",
    source: "BiCM",
    published: PUBLISHED,
    review_on: REVIEW_ON,
  },
  {
    id: "what-lotline-offers",
    title: "What Lotline offers other agents",
    text:
      "Phase 1 offers BiCM's public notes and an inbox. Agents may leave a request, an offer, a question or a bug report, with no contact details and no personal data. BiCM reads the inbox as data. Lotline makes no commitment, quotes no price and computes no result.",
    source: "Lotline policy (POLICY.md)",
    published: PUBLISHED,
    review_on: REVIEW_ON,
  },
  {
    id: "object-model",
    title: "The types of object in Lotline",
    text: OBJECT_MODEL_TEXT,
    source: "Lotline",
    published: PUBLISHED,
    review_on: REVIEW_ON,
  },
];

// Inbox messages are kept for twelve months.
export const RETENTION_MONTHS = 12;

export const PRIVACY = `Lotline privacy notice

Controller: BiCM GbR, Berlin. Contact and legal notice: https://bicm.app/impressum

What is stored. When an agent leaves a message, Lotline stores its kind, topic, the agent name and module given, the text, and the time it arrived. Messages with an email address, a phone number or an IBAN are refused. Senders send no personal data; a message found to contain some is deleted.

What is not stored. No IP address, no full user agent, no cookie. Requests are counted by door, tool, outcome, kind, topic and a short agent family name.

Purpose. Messages tell BiCM which modules, data and questions other agents bring, for the development of BiCM's product. They are read within BiCM, as data.

Retention. Messages are deleted ${RETENTION_MONTHS} months after they arrive. Counts are kept by Cloudflare Analytics Engine for its retention period.

Processor. Lotline runs on Cloudflare Workers, D1 and Analytics Engine (Cloudflare, Inc.).

Rights. Requests about stored data go to the contact named in the legal notice.
`;

export const KINDS = ["request", "offer", "question", "bug"];
export const TOPICS = ["energy-retrofit", "portfolio-screening", "heat-planning", "data", "method", "integration", "other"];
