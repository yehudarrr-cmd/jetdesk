
CREATE TABLE public.landing_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  destination TEXT,
  travel_start_date DATE,
  travel_end_date DATE,
  number_of_travelers INTEGER DEFAULT 1,
  message TEXT,
  source TEXT DEFAULT 'landing_page',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

-- כל אחד יכול להגיש ליד (טופס ציבורי)
CREATE POLICY "anyone_can_insert_landing_leads"
ON public.landing_leads
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- רק משתמשים מחוברים יכולים לראות לידים
CREATE POLICY "authenticated_can_select_landing_leads"
ON public.landing_leads
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "authenticated_can_update_landing_leads"
ON public.landing_leads
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "authenticated_can_delete_landing_leads"
ON public.landing_leads
FOR DELETE
TO authenticated
USING (true);

-- טריגר לעדכון updated_at
CREATE TRIGGER set_landing_leads_updated_at
BEFORE UPDATE ON public.landing_leads
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- הגבלת קצב - אינדקס לפי IP/timestamp לעתיד
CREATE INDEX idx_landing_leads_created_at ON public.landing_leads(created_at DESC);
CREATE INDEX idx_landing_leads_status ON public.landing_leads(status);

-- הוספה ל-realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.landing_leads;
ALTER TABLE public.landing_leads REPLICA IDENTITY FULL;
