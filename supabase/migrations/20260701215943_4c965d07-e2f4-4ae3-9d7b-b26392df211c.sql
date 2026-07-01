
CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  quote_url TEXT UNIQUE,
  destination TEXT NOT NULL,
  country TEXT,
  title TEXT,
  hotel TEXT,
  airline TEXT,
  price_from INTEGER,
  currency TEXT DEFAULT 'ILS',
  start_date DATE,
  end_date DATE,
  nights INTEGER,
  image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  external_url TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.deals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;
GRANT ALL ON public.deals TO service_role;

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active deals"
  ON public.deals FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can view all deals"
  ON public.deals FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert deals"
  ON public.deals FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update deals"
  ON public.deals FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete deals"
  ON public.deals FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER deals_set_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_deals_active_featured ON public.deals(active, featured, sort_order);
CREATE INDEX idx_deals_country ON public.deals(country);
