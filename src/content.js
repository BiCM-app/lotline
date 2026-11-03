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

/*
 * Terms that bicm.app uses, in English and German, each defined only by restating the
 * English page (https://www.bicm.app/) and the German page (https://www.bicm.app/de/).
 * A term the site uses without defining it is left out.
 */
export const GLOSSARY = [
  { en: "Feasibility study", de: "Machbarkeitsstudie",
    en_text: "An early answer to what could be done for a building, a site or a district, and whether it is worth it, given before detailed design is commissioned.",
    de_text: "Eine frühe Antwort darauf, was für ein Gebäude, ein Grundstück oder ein Quartier möglich ist und ob es sich lohnt, bevor die Planung beauftragt wird." },
  { en: "Seven dimensions", de: "Sieben Dimensionen",
    en_text: "The dimensions on which every scenario is reported: space, time, schedule, cost, funding, environment and people.",
    de_text: "Die Dimensionen, in denen jede Variante bewertet wird: Fläche, Dauer, Ablauf, Kosten, Förderung, Umwelt und Menschen." },
  { en: "Space", de: "Fläche",
    en_text: "Areas, volumes and programme fit; space gained or lost.",
    de_text: "Flächen, Volumen und Nutzung; gewonnene oder verlorene Fläche." },
  { en: "Time", de: "Dauer",
    en_text: "Durations of works and approvals; payback.",
    de_text: "Bauzeit, Genehmigung, Amortisation." },
  { en: "Schedule", de: "Ablauf",
    en_text: "Which measures, in which order and in which year.",
    de_text: "Welche Maßnahmen, in welcher Reihenfolge und in welchem Jahr." },
  { en: "Cost", de: "Kosten",
    en_text: "Investment, running cost and life-cycle cost.",
    de_text: "Investition, Betrieb, Lebenszyklus." },
  { en: "Funding", de: "Förderung",
    en_text: "Subsidies, grants, tax relief and financing, with eligibility.",
    de_text: "Förderprogramme, Zuschüsse, steuerliche Vorteile und Finanzierung, mit Förderfähigkeit." },
  { en: "Environment", de: "Umwelt",
    en_text: "Operational energy, and operational and embodied CO₂.",
    de_text: "Betriebsenergie, Betriebs- und graue Emissionen." },
  { en: "People", de: "Menschen",
    en_text: "The effect on the people a building serves.",
    de_text: "Die Wirkung auf die Menschen, die ein Gebäude nutzen." },
  { en: "Input", de: "Eingabe",
    en_text: "What is known about a place, each input with its source: the client, a default, a benchmark, or a suggestion the user confirms.",
    de_text: "Was über einen Ort bekannt ist, jede Eingabe mit Quelle: Auftraggeber, Standardwert, Kennwert oder ein Vorschlag, den die Nutzerin oder der Nutzer bestätigt." },
  { en: "Scenario", de: "Variante",
    en_text: "One of several options a study proposes, generated from a cited catalogue of measures. The professional selects, edits or rejects each scenario.",
    de_text: "Eine von mehreren Optionen, die eine Studie vorschlägt, erzeugt aus einem belegten Maßnahmenkatalog. Die Fachperson wählt jede Variante aus, ändert sie oder verwirft sie." },
  { en: "Checks", de: "Prüfung",
    en_text: "Rules, regulations and limits every scenario must pass. Regulatory compliance and technical risk are checks.",
    de_text: "Regeln, Vorschriften und Grenzen, die jede Variante bestehen muss. Rechtliche Anforderungen und technische Risiken sind Prüfungen." },
  { en: "Evaluation", de: "Bewertung",
    en_text: "Each scenario evaluated by fixed rules on the seven dimensions, each dimension with its uncertainty band.",
    de_text: "Jede Variante nach festen Regeln in den sieben Dimensionen bewertet, jede Dimension mit ihrer Unsicherheitsspanne." },
  { en: "Comparison", de: "Vergleich",
    en_text: "The trade-offs between scenarios, with the weights stated.",
    de_text: "Abwägungen zwischen Varianten, mit offengelegten Gewichten." },
  { en: "Explanation", de: "Erläuterung",
    en_text: "A written account of the result that quotes its numbers by reference. It may differ between runs and never changes a number.",
    de_text: "Ein Text zum Ergebnis, der seine Zahlen per Verweis zitiert. Er kann je Lauf abweichen und ändert nie eine Zahl." },
  { en: "Report", de: "Bericht",
    en_text: "With full provenance: every input, assumption and engine version. Every report can be reproduced.",
    de_text: "Mit vollständiger Herkunft: jede Eingabe, jede Annahme, die Version der Rechenlogik. Jeder Bericht ist reproduzierbar." },
  { en: "Provenance", de: "Herkunft",
    en_text: "Where every input and assumption comes from, with the engine version. Every study is stored with its provenance and can be run again to the same answer.",
    de_text: "Woher jede Eingabe und jede Annahme stammt, mit der Version der Rechenlogik. Jede Studie wird mit ihrer Herkunft gespeichert und lässt sich zum selben Ergebnis wiederholen." },
  { en: "Deterministic engine", de: "Deterministische Rechenlogik",
    en_text: "The engine every number in a result comes from, using cited assumptions. The same scenario, with the same inputs, assumptions and engine version, always gives the same result. A language model may explain a result; it never computes one.",
    de_text: "Die Rechenlogik, aus der jede Zahl in einem Ergebnis stammt, mit belegten Annahmen. Dieselbe Variante mit denselben Eingaben, Annahmen und derselben Version der Rechenlogik ergibt immer dasselbe Ergebnis. Ein Sprachmodell darf ein Ergebnis erläutern, aber nie berechnen." },
  { en: "Module", de: "Modul",
    en_text: "One configured use case: a slice of the grid of scales and disciplines for one kind of client job, with its own inputs, measures and validation. One engine runs many modules.",
    de_text: "Ein konfigurierter Anwendungsfall: ein Ausschnitt des Rasters aus Maßstäben und Disziplinen für eine Art von Auftrag, mit eigenen Eingaben, Maßnahmen und Validierung. Ein Kern, viele Module." },
];

/** The glossary as plain text: each term in English and German, with both definitions. */
export const GLOSSARY_TEXT =
  "Terms used on bicm.app, in English and German (Begriffe von bicm.app, englisch und deutsch). " +
  GLOSSARY.map((g) => `${g.en} (${g.de}): ${g.en_text} / ${g.de_text}`).join(" ");

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
  {
    id: "glossary",
    title: "Glossary: BiCM's terms in English and German",
    text: GLOSSARY_TEXT,
    terms: GLOSSARY,
    source: "bicm.app",
    published: "2026-11-03",
    review_on: "2027-05-03",
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
