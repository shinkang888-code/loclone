-- Loclone app state (JSON document store)
CREATE TABLE IF NOT EXISTS loclone_state (
  id TEXT PRIMARY KEY DEFAULT 'main',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
