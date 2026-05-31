-- 1. Extend customers table
ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS id_number text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS last_contact_at timestamptz;

-- 2. Booking status enum
DO $$ BEGIN
  CREATE TYPE public.booking_trip_status AS ENUM ('draft','quoted','confirmed','completed','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  customer_id uuid NOT NULL,
  booking_number text,
  title text,
  destination text,
  departure_date date,
  return_date date,
  status public.booking_trip_status NOT NULL DEFAULT 'draft',
  total_price numeric DEFAULT 0,
  amount_paid numeric DEFAULT 0,
  profit numeric DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_bookings ON public.bookings FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_bookings ON public.bookings FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_update_bookings ON public.bookings FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY owner_delete_bookings ON public.bookings FOR DELETE USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_owner ON public.bookings(owner_id);

CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Add booking_id to child tables
ALTER TABLE public.flights      ADD COLUMN IF NOT EXISTS booking_id uuid;
ALTER TABLE public.hotels       ADD COLUMN IF NOT EXISTS booking_id uuid;
ALTER TABLE public.car_rentals  ADD COLUMN IF NOT EXISTS booking_id uuid;
ALTER TABLE public.transfers    ADD COLUMN IF NOT EXISTS booking_id uuid;
ALTER TABLE public.payments     ADD COLUMN IF NOT EXISTS booking_id uuid;

CREATE INDEX IF NOT EXISTS idx_flights_booking ON public.flights(booking_id);
CREATE INDEX IF NOT EXISTS idx_hotels_booking ON public.hotels(booking_id);
CREATE INDEX IF NOT EXISTS idx_car_rentals_booking ON public.car_rentals(booking_id);
CREATE INDEX IF NOT EXISTS idx_transfers_booking ON public.transfers(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);

-- 5. Frequent flyer programs
CREATE TABLE IF NOT EXISTS public.frequent_flyer_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  customer_id uuid NOT NULL,
  airline text NOT NULL,
  program_name text,
  member_number text,
  tier text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.frequent_flyer_programs TO authenticated;
GRANT ALL ON public.frequent_flyer_programs TO service_role;

ALTER TABLE public.frequent_flyer_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_ffp ON public.frequent_flyer_programs FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_ffp ON public.frequent_flyer_programs FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_update_ffp ON public.frequent_flyer_programs FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY owner_delete_ffp ON public.frequent_flyer_programs FOR DELETE USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ffp_customer ON public.frequent_flyer_programs(customer_id);

CREATE TRIGGER ffp_set_updated_at BEFORE UPDATE ON public.frequent_flyer_programs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Companion travelers
CREATE TABLE IF NOT EXISTS public.companion_travelers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  customer_id uuid NOT NULL,
  full_name text NOT NULL,
  relation text,
  date_of_birth date,
  passport_number text,
  passport_expiry date,
  nationality text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.companion_travelers TO authenticated;
GRANT ALL ON public.companion_travelers TO service_role;

ALTER TABLE public.companion_travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_companions ON public.companion_travelers FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_companions ON public.companion_travelers FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_update_companions ON public.companion_travelers FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY owner_delete_companions ON public.companion_travelers FOR DELETE USING (owner_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_companions_customer ON public.companion_travelers(customer_id);

CREATE TRIGGER companions_set_updated_at BEFORE UPDATE ON public.companion_travelers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();