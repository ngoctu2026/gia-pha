-- Clan governance documents and finance ledger

CREATE TABLE IF NOT EXISTS public.clan_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('toc_quy', 'toc_uoc', 'quy_dinh')),
  effective_date DATE,
  created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.clan_finance_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT,
  amount NUMERIC(14,0) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  payer_receiver TEXT,
  note TEXT,
  created_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clan_documents_category ON public.clan_documents(category);
CREATE INDEX IF NOT EXISTS idx_clan_documents_effective_date ON public.clan_documents(effective_date);
CREATE INDEX IF NOT EXISTS idx_clan_finance_entries_date ON public.clan_finance_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_clan_finance_entries_type ON public.clan_finance_entries(type);

DROP TRIGGER IF EXISTS trg_clan_documents_updated_at ON public.clan_documents;
CREATE TRIGGER trg_clan_documents_updated_at
BEFORE UPDATE ON public.clan_documents
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_clan_finance_entries_updated_at ON public.clan_finance_entries;
CREATE TRIGGER trg_clan_finance_entries_updated_at
BEFORE UPDATE ON public.clan_finance_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.clan_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_finance_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read clan_documents" ON public.clan_documents;
CREATE POLICY "Authenticated can read clan_documents"
  ON public.clan_documents FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins and Editors can manage clan_documents" ON public.clan_documents;
CREATE POLICY "Admins and Editors can manage clan_documents"
  ON public.clan_documents FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP POLICY IF EXISTS "Authenticated can read clan_finance_entries" ON public.clan_finance_entries;
CREATE POLICY "Authenticated can read clan_finance_entries"
  ON public.clan_finance_entries FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins and Editors can manage clan_finance_entries" ON public.clan_finance_entries;
CREATE POLICY "Admins and Editors can manage clan_finance_entries"
  ON public.clan_finance_entries FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());
