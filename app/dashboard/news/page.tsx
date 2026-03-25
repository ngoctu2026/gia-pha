import ClanNewsBoard from "@/components/ClanNewsBoard";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Tin tức dòng họ",
};

export default async function NewsPage() {
  const [supabase, profile] = await Promise.all([getSupabase(), getProfile()]);

  const { data } = await supabase
    .from("clan_news")
    .select("id, title, summary, content, is_pinned, published_at")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  return (
    <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 pb-12 space-y-4">
      <div>
        <h1 className="title">Tin tức dòng họ</h1>
        <p className="text-sm text-stone-500 mt-1">
          Đăng thông báo họp họ, lễ giỗ lớn, khuyến học, hoạt động thiện nguyện và các việc trọng của tộc.
        </p>
      </div>
      <ClanNewsBoard items={data ?? []} canEdit={canEdit} />
    </main>
  );
}
