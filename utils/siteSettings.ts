import config from "@/app/config";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { cache } from "react";

export interface SiteSettings {
  site_name: string;
  logo_url: string;
  footer_text: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
}

const defaults: SiteSettings = {
  site_name: config.siteName,
  logo_url: "/icon.png",
  footer_text: "Gia Phả OS by HomieLab",
  footer_address: "",
  footer_phone: "",
  footer_email: "",
};

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data } = await supabase
      .from("site_settings")
      .select("site_name, logo_url, footer_text, footer_address, footer_phone, footer_email")
      .eq("id", 1)
      .maybeSingle();

    if (!data) return defaults;

    return {
      site_name: data.site_name || defaults.site_name,
      logo_url: data.logo_url || defaults.logo_url,
      footer_text: data.footer_text || defaults.footer_text,
      footer_address: data.footer_address || defaults.footer_address,
      footer_phone: data.footer_phone || defaults.footer_phone,
      footer_email: data.footer_email || defaults.footer_email,
    };
  } catch {
    return defaults;
  }
});
