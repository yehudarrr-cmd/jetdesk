-- Singleton table for polling offset
CREATE TABLE public.telegram_bot_state (
  id INT PRIMARY KEY CHECK (id = 1),
  update_offset BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.telegram_bot_state (id, update_offset) VALUES (1, 0);

ALTER TABLE public.telegram_bot_state ENABLE ROW LEVEL SECURITY;
-- No policies — only service role accesses this

-- Link telegram chats to owners
CREATE TABLE public.telegram_chat_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id BIGINT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  username TEXT,
  first_name TEXT,
  pairing_code TEXT,
  paired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_chat_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_telegram_chat_links ON public.telegram_chat_links
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_telegram_chat_links ON public.telegram_chat_links
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_update_telegram_chat_links ON public.telegram_chat_links
  FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY owner_delete_telegram_chat_links ON public.telegram_chat_links
  FOR DELETE USING (owner_id = auth.uid());

-- Pairing codes for linking new chats to owners
CREATE TABLE public.telegram_pairing_codes (
  code TEXT PRIMARY KEY,
  owner_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_pairing_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_telegram_pairing_codes ON public.telegram_pairing_codes
  FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY owner_insert_telegram_pairing_codes ON public.telegram_pairing_codes
  FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY owner_delete_telegram_pairing_codes ON public.telegram_pairing_codes
  FOR DELETE USING (owner_id = auth.uid());

-- Inbound message history
CREATE TABLE public.telegram_messages (
  update_id BIGINT PRIMARY KEY,
  chat_id BIGINT NOT NULL,
  owner_id UUID,
  text TEXT,
  raw_update JSONB NOT NULL,
  ai_response JSONB,
  reply_text TEXT,
  status TEXT NOT NULL DEFAULT 'received',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_telegram_messages_owner ON public.telegram_messages(owner_id, created_at DESC);
CREATE INDEX idx_telegram_messages_chat ON public.telegram_messages(chat_id);

ALTER TABLE public.telegram_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY owner_select_telegram_messages ON public.telegram_messages
  FOR SELECT USING (owner_id = auth.uid());