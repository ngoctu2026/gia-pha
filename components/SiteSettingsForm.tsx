"use client";

import { createClient } from "@/utils/supabase/client";
import { Settings, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface SiteSettingsData {
  site_name: string;
  logo_url: string;
  footer_text: string;
  footer_address: string;
  footer_phone: string;
  footer_email: string;
}

export default function SiteSettingsForm({
  initialSettings,
  canEdit,
}: {
  initialSettings: SiteSettingsData;
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState(initialSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateField = (key: keyof SiteSettingsData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("site_settings").upsert({
      id: 1,
      ...form,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Đã lưu cấu hình chung thành công.");
    setLoading(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
      <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
        <Settings className="size-5 text-amber-600" />
        Cấu hình chung trang gia phả
      </h2>

      {message && <p className="text-sm text-stone-600">{message}</p>}

      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={form.site_name}
          onChange={(e) => updateField("site_name", e.target.value)}
          placeholder="Tên website"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
          disabled={!canEdit}
        />
        <input
          value={form.logo_url}
          onChange={(e) => updateField("logo_url", e.target.value)}
          placeholder="URL logo (vd: /icon.png hoặc https://...)"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
          disabled={!canEdit}
        />
      </div>

      <textarea
        rows={2}
        value={form.footer_text}
        onChange={(e) => updateField("footer_text", e.target.value)}
        placeholder="Thông tin chân trang"
        className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
        disabled={!canEdit}
      />

      <div className="grid md:grid-cols-2 gap-3">
        <input
          value={form.footer_address}
          onChange={(e) => updateField("footer_address", e.target.value)}
          placeholder="Thôn 7, xã Kon Đào, tỉnh Quảng Ngãi"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
          disabled={!canEdit}
        />
        <input
          value={form.footer_phone}
          onChange={(e) => updateField("footer_phone", e.target.value)}
          placeholder="0901 959 997"
          className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
          disabled={!canEdit}
        />
      </div>

      <input
        value={form.footer_email}
        onChange={(e) => updateField("footer_email", e.target.value)}
        placeholder="Email liên hệ"
        className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
        disabled={!canEdit}
      />

      {canEdit && (
        <button
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-60 inline-flex items-center gap-2"
        >
          <Save className="size-4" />
          {loading ? "Đang lưu..." : "Lưu cấu hình"}
        </button>
      )}
    </form>
  );
}
