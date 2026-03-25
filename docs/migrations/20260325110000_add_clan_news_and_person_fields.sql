-- Add Vietnamese genealogy-oriented person fields and clan news module

ALTER TABLE public.persons
  ADD COLUMN IF NOT EXISTS hometown TEXT,
  ADD COLUMN IF NOT EXISTS grave_address TEXT;

CREATE INDEX IF NOT EXISTS idx_persons_hometown ON public.persons(hometown);

CREATE TABLE IF NOT EXISTS public.clan_news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clan_news_published_at ON public.clan_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_clan_news_is_pinned ON public.clan_news(is_pinned);

ALTER TABLE public.clan_news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read clan_news" ON public.clan_news;
CREATE POLICY "Authenticated can read clan_news"
  ON public.clan_news FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins and Editors can manage clan_news" ON public.clan_news;
CREATE POLICY "Admins and Editors can manage clan_news"
  ON public.clan_news FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP TRIGGER IF EXISTS trg_clan_news_updated_at ON public.clan_news;
CREATE TRIGGER trg_clan_news_updated_at
BEFORE UPDATE ON public.clan_news
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
