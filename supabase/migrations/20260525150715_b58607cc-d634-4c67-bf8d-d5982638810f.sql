
-- passports table
CREATE TABLE public.passports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  customer_id uuid NOT NULL,
  first_name text,
  last_name text,
  passport_number text,
  date_of_birth date,
  issue_date date,
  expiry_date date,
  nationality text,
  sex text,
  place_of_birth text,
  issuing_country text,
  image_url text,
  raw_extracted jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.passports ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_passports ON public.passports FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_passports ON public.passports FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_update_passports ON public.passports FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY owner_delete_passports ON public.passports FOR DELETE USING (owner_id = auth.uid());

CREATE TRIGGER passports_updated_at BEFORE UPDATE ON public.passports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_passports_customer ON public.passports(customer_id);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('passports', 'passports', false)
ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('customer-files', 'customer-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: files stored under <auth.uid()>/...
CREATE POLICY "passports_owner_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "passports_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "passports_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "passports_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'passports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "customer_files_owner_select" ON storage.objects FOR SELECT
  USING (bucket_id = 'customer-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "customer_files_owner_insert" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'customer-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "customer_files_owner_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'customer-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "customer_files_owner_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'customer-files' AND auth.uid()::text = (storage.foldername(name))[1]);
