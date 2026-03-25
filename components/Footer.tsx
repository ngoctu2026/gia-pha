"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export interface FooterProps {
  className?: string;
  showDisclaimer?: boolean;
}

interface FooterSettings {
  footer_text: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
}

const defaultSettings: FooterSettings = {
  footer_text: "Gia Phả OS by HomieLab",
  footer_address: "",
  footer_phone: "",
  footer_email: "",
};

export default function Footer({
  className = "",
  showDisclaimer = false,
}: FooterProps) {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("site_settings")
        .select("footer_text, footer_address, footer_phone, footer_email")
        .eq("id", 1)
        .maybeSingle();

      if (data) {
        setSettings({
          footer_text: data.footer_text || defaultSettings.footer_text,
          footer_address: data.footer_address || "",
          footer_phone: data.footer_phone || "",
          footer_email: data.footer_email || "",
        });
      }
    };

    loadSettings();
  }, []);

  return (
    <footer
      className={`py-8 text-center text-sm text-stone-500 ${className} backdrop-blur-sm`}
    >
      <div className="max-w-7xl mx-auto px-4 space-y-2">
        {showDisclaimer && (
          <p className="mb-2 text-xs tracking-wide bg-amber-50 inline-block px-3 py-1 rounded-full text-amber-800/80 border border-amber-200/50">
            Nội dung có thể thiếu sót. Vui lòng đóng góp để gia phả chính xác
            hơn.
          </p>
        )}

        <p className="font-semibold text-stone-700">{settings.footer_text}</p>

        {(settings.footer_address || settings.footer_phone || settings.footer_email) && (
          <div className="text-xs text-stone-500 space-y-1">
            {settings.footer_address && <p>Địa chỉ: {settings.footer_address}</p>}
            {settings.footer_phone && <p>Điện thoại: {settings.footer_phone}</p>}
            {settings.footer_email && <p>Email: {settings.footer_email}</p>}
          </div>
        )}
      </div>
    </footer>
  );
}
