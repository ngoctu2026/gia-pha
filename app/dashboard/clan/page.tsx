import ClanDocumentsPanel from "@/components/ClanDocumentsPanel";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Tộc quy & Tộc ước",
};

export default async function ClanPage() {
  const [supabase, profile] = await Promise.all([getSupabase(), getProfile()]);

  const { data } = await supabase
    .from("clan_documents")
    .select("id, title, content, category, effective_date, created_at")
    .order("created_at", { ascending: false });

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  return (
    <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 pb-12 space-y-4">
      <div>
        <h1 className="title">Tộc quy, tộc ước & quy định</h1>
        <p className="text-sm text-stone-500 mt-1">
          Chuẩn hoá nề nếp dòng tộc, công bố quy định chung để mọi thành viên dễ theo dõi.
        </p>
      </div>
      <ClanDocumentsPanel initialDocs={data ?? []} canEdit={canEdit} />
    </main>
  );
}
