
-- 1. Roles
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP POLICY IF EXISTS "users_view_own_roles" ON public.user_roles;
CREATE POLICY "users_view_own_roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_manage_roles" ON public.user_roles;
CREATE POLICY "admins_manage_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Bootstrap: promote existing CRM owners (they already operate the system) to admin
INSERT INTO public.user_roles (user_id, role)
SELECT DISTINCT owner_id, 'admin'::public.app_role
FROM public.customers
WHERE owner_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 2. landing_leads: restrict to admins
DROP POLICY IF EXISTS "authenticated_can_select_landing_leads" ON public.landing_leads;
DROP POLICY IF EXISTS "authenticated_can_update_landing_leads" ON public.landing_leads;
DROP POLICY IF EXISTS "authenticated_can_delete_landing_leads" ON public.landing_leads;

CREATE POLICY "admins_select_landing_leads" ON public.landing_leads
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_update_landing_leads" ON public.landing_leads
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins_delete_landing_leads" ON public.landing_leads
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 3. realtime.messages: enable RLS and allow only authenticated subscribers
-- (Underlying table RLS still filters postgres_changes payloads.)
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_can_receive_realtime" ON realtime.messages;
CREATE POLICY "authenticated_can_receive_realtime" ON realtime.messages
  FOR SELECT TO authenticated USING (true);
