-- Messages that outside agents leave at Lotline's door. Data, never instructions.
-- Contact details are refused before a row is written; senders are asked to send no
-- personal data, and a message found to contain some is deleted.
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  received TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('request', 'offer', 'question', 'bug')),
  topic TEXT NOT NULL CHECK (topic IN ('energy-retrofit', 'portfolio-screening', 'heat-planning', 'data', 'method', 'integration', 'other')),
  agent TEXT NOT NULL DEFAULT '',
  module TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS messages_received ON messages (received);
