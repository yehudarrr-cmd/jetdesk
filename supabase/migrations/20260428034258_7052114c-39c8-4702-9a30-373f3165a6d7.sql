-- Enums
CREATE TYPE conversation_source AS ENUM ('whatsapp', 'telegram', 'manual');
CREATE TYPE document_category AS ENUM ('passport', 'flight_ticket', 'hotel_voucher', 'visa', 'insurance', 'invoice', 'supplier_document', 'other');
CREATE TYPE payment_type AS ENUM ('deposit', 'full', 'refund');
CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'other');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'done', 'cancelled');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE check_status AS ENUM ('pending', 'done', 'not_required');

-- customers
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'active',
  destination TEXT,
  travel_start_date DATE,
  travel_end_date DATE,
  pnr TEXT,
  total_price NUMERIC(12,2) DEFAULT 0,
  amount_paid NUMERIC(12,2) DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  source conversation_source NOT NULL DEFAULT 'manual',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- flights
CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  airline TEXT,
  flight_number TEXT,
  departure_airport TEXT,
  arrival_airport TEXT,
  departure_datetime TIMESTAMPTZ,
  arrival_datetime TIMESTAMPTZ,
  pnr TEXT,
  check_in_status check_status DEFAULT 'pending',
  insurance_status check_status DEFAULT 'pending',
  ticket_status check_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- hotels
CREATE TABLE public.hotels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  hotel_name TEXT,
  city TEXT,
  check_in_date DATE,
  check_out_date DATE,
  number_of_guests INT DEFAULT 1,
  room_type TEXT,
  booking_status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- car_rentals
CREATE TABLE public.car_rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  company_name TEXT,
  pickup_location TEXT,
  return_location TEXT,
  pickup_datetime TIMESTAMPTZ,
  return_datetime TIMESTAMPTZ,
  car_type TEXT,
  booking_status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- transfers
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  transfer_type TEXT,
  pickup_location TEXT,
  destination TEXT,
  datetime TIMESTAMPTZ,
  number_of_passengers INT DEFAULT 1,
  supplier TEXT,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- documents
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  category document_category DEFAULT 'other',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_type payment_type DEFAULT 'deposit',
  method payment_method DEFAULT 'cash',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- timeline_events
CREATE TABLE public.timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- telegram_updates
CREATE TABLE public.telegram_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  raw_message TEXT NOT NULL,
  parsed_action JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_customers_owner ON public.customers(owner_id);
CREATE INDEX idx_flights_owner_dep ON public.flights(owner_id, departure_datetime);
CREATE INDEX idx_flights_customer ON public.flights(customer_id);
CREATE INDEX idx_conversations_customer ON public.conversations(customer_id);
CREATE INDEX idx_documents_customer ON public.documents(customer_id);
CREATE INDEX idx_payments_customer ON public.payments(customer_id);
CREATE INDEX idx_tasks_owner_status ON public.tasks(owner_id, status);
CREATE INDEX idx_timeline_customer ON public.timeline_events(customer_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_updates ENABLE ROW LEVEL SECURITY;

-- Generic owner-based policies via function for brevity
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['customers','conversations','flights','hotels','car_rentals','transfers','documents','payments','tasks','timeline_events','telegram_updates']
  LOOP
    EXECUTE format('CREATE POLICY "owner_select_%I" ON public.%I FOR SELECT USING (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "owner_insert_%I" ON public.%I FOR INSERT WITH CHECK (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "owner_update_%I" ON public.%I FOR UPDATE USING (owner_id = auth.uid())', t, t);
    EXECUTE format('CREATE POLICY "owner_delete_%I" ON public.%I FOR DELETE USING (owner_id = auth.uid())', t, t);
  END LOOP;
END $$;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_flights_updated BEFORE UPDATE ON public.flights FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();