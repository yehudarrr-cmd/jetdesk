
-- Lock down telegram_bot_state: no client access, only service role
REVOKE ALL ON public.telegram_bot_state FROM anon, authenticated;
DROP POLICY IF EXISTS "deny_all_telegram_bot_state" ON public.telegram_bot_state;
CREATE POLICY "deny_all_telegram_bot_state" ON public.telegram_bot_state
  AS RESTRICTIVE FOR ALL TO anon, authenticated
  USING (false) WITH CHECK (false);

-- Scope realtime channels per-user to prevent cross-tenant subscription
DROP POLICY IF EXISTS "authenticated_can_receive_realtime" ON realtime.messages;
CREATE POLICY "authenticated_can_receive_realtime" ON realtime.messages
  FOR SELECT TO authenticated
  USING (
    (realtime.topic() = ('user:' || auth.uid()::text))
    OR (realtime.topic() = 'app-realtime')
  );

-- Restrict SECURITY DEFINER has_role function: not callable by anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
