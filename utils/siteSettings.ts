import { getSupabase } from "@/utils/supabase/queries";

export interface SiteSettings {
  site_name: string;
  logo_url: string;
  footer_text: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
}

const fallback: SiteSettings = {
  site_name: "Gia Phả OS",
  logo_url: "/icon.png",
  footer_text: "Gia Phả OS by HomieLab",
  footer_address: "",
  footer_phone: "",
  footer_email: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("site_name, logo_url, footer_text, footer_address, footer_phone, footer_email")
      .eq("id", 1)
      .maybeSingle();

    return {
      site_name: data?.site_name || fallback.site_name,
      logo_url: data?.logo_url || fallback.logo_url,
      footer_text: data?.footer_text || fallback.footer_text,
      footer_address: data?.footer_address || fallback.footer_address,
      footer_phone: data?.footer_phone || fallback.footer_phone,
      footer_email: data?.footer_email || fallback.footer_email,
    };
  } catch {
    return fallback;
  }
}
