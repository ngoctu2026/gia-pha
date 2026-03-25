-- Global site settings for configurable branding/footer content

CREATE TABLE IF NOT EXISTS public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  site_name TEXT,
  logo_url TEXT,
  footer_text TEXT,
  footer_address TEXT,
  footer_phone TEXT,
  footer_email TEXT,
  updated_by UUID REFERENCES public.profiles(id) DEFAULT auth.uid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.site_settings (id, site_name, logo_url, footer_text)
VALUES (1, 'Gia Phả OS', '/icon.png', 'Gia Phả OS by HomieLab')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_settings" ON public.site_settings;
CREATE POLICY "Public can read site_settings"
  ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins and Editors can manage site_settings" ON public.site_settings;
CREATE POLICY "Admins and Editors can manage site_settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.is_admin() OR public.is_editor())
  WITH CHECK (public.is_admin() OR public.is_editor());

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
