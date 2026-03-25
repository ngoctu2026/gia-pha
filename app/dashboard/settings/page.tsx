import SiteSettingsForm from "@/components/SiteSettingsForm";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Cấu hình chung",
};

export default async function SettingsPage() {
  const [supabase, profile] = await Promise.all([getSupabase(), getProfile()]);

  const { data } = await supabase
    .from("site_settings")
    .select("site_name, logo_url, footer_text, footer_address, footer_phone, footer_email")
    .eq("id", 1)
    .maybeSingle();

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  return (
    <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 pb-12 space-y-4">
      <div>
        <h1 className="title">Cấu hình chung</h1>
        <p className="text-sm text-stone-500 mt-1">
          Tuỳ chỉnh logo, thông tin chân trang, địa chỉ liên hệ và nhận diện chung của website.
        </p>
      </div>

      <SiteSettingsForm
        canEdit={canEdit}
        initialSettings={{
          site_name: data?.site_name || "Gia Phả OS",
          logo_url: data?.logo_url || "/icon.png",
          footer_text: data?.footer_text || "Gia Phả OS by HomieLab",
          footer_address: data?.footer_address || "",
          footer_phone: data?.footer_phone || "",
          footer_email: data?.footer_email || "",
        }}
      />
    </main>
  );
}
