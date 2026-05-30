
CREATE TABLE public.email_ingest_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid() UNIQUE,
  last_history_id text,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_ingest_state TO authenticated;
GRANT ALL ON public.email_ingest_state TO service_role;

ALTER TABLE public.email_ingest_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_all_email_ingest_state ON public.email_ingest_state
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());


CREATE TABLE public.email_ingest_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  gmail_message_id text NOT NULL,
  subject text,
  from_email text,
  received_at timestamptz,
  status text NOT NULL DEFAULT 'pending',
  matched_customer_id uuid,
  matched_flight_ids uuid[] DEFAULT '{}',
  passenger_names text[] DEFAULT '{}',
  pnr text,
  extracted_data jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, gmail_message_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_ingest_log TO authenticated;
GRANT ALL ON public.email_ingest_log TO service_role;

ALTER TABLE public.email_ingest_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_all_email_ingest_log ON public.email_ingest_log
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE INDEX idx_email_ingest_log_owner_created ON public.email_ingest_log(owner_id, created_at DESC);
CREATE INDEX idx_email_ingest_log_status ON public.email_ingest_log(owner_id, status);

-- Add source column to flights to indicate origin (e.g. 'gmail')
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';
ALTER TABLE public.flights ADD COLUMN IF NOT EXISTS source_email_id text;

CREATE TRIGGER trg_email_ingest_state_updated
  BEFORE UPDATE ON public.email_ingest_state
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_email_ingest_log_updated
  BEFORE UPDATE ON public.email_ingest_log
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
