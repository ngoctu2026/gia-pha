import ClanFinanceLedger from "@/components/ClanFinanceLedger";
import { getProfile, getSupabase } from "@/utils/supabase/queries";

export const metadata = {
  title: "Sổ thu chi dòng tộc",
};

export default async function FinancePage() {
  const [supabase, profile] = await Promise.all([getSupabase(), getProfile()]);

  const { data } = await supabase
    .from("clan_finance_entries")
    .select(
      "id, entry_date, type, category, amount, description, payer_receiver, note",
    )
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  return (
    <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto py-6 pb-12 space-y-4">
      <div>
        <h1 className="title">Sổ quản lý thu chi dòng tộc</h1>
        <p className="text-sm text-stone-500 mt-1">
          Ghi nhận minh bạch các khoản thu, chi và số dư quỹ chung của dòng họ.
        </p>
      </div>
      <ClanFinanceLedger initialEntries={data ?? []} canEdit={canEdit} />
    </main>
  );
}
