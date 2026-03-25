import DeleteMemberButton from "@/components/DeleteMemberButton";
import MemberDetailContent from "@/components/MemberDetailContent";
import { getProfile, getSupabase } from "@/utils/supabase/queries";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

function computeLineageRole(
  currentId: string,
  siblings: {
    id: string;
    gender: "male" | "female" | "other";
    birth_order: number | null;
    birth_year: number | null;
    birth_month: number | null;
    birth_day: number | null;
  }[],
): string | null {
  const rank = (gender: "male" | "female") => {
    const sorted = siblings
      .filter((s) => s.gender === gender)
      .sort((a, b) => {
        const aOrder = a.birth_order ?? Number.MAX_SAFE_INTEGER;
        const bOrder = b.birth_order ?? Number.MAX_SAFE_INTEGER;
        if (aOrder !== bOrder) return aOrder - bOrder;

        const aTime = new Date(
          a.birth_year ?? 3000,
          (a.birth_month ?? 12) - 1,
          a.birth_day ?? 31,
        ).getTime();
        const bTime = new Date(
          b.birth_year ?? 3000,
          (b.birth_month ?? 12) - 1,
          b.birth_day ?? 31,
        ).getTime();
        return aTime - bTime;
      });

    return sorted.findIndex((s) => s.id === currentId) + 1;
  };

  const maleRank = rank("male");
  if (maleRank > 0) return maleRank === 1 ? "Trưởng nam" : `Thứ nam ${maleRank}`;

  const femaleRank = rank("female");
  if (femaleRank > 0) return femaleRank === 1 ? "Trưởng nữ" : `Thứ nữ ${femaleRank}`;

  return null;
}

export default async function MemberDetailPage({ params }: PageProps) {
  const { id } = await params;

  const profile = await getProfile();

  const isAdmin = profile?.role === "admin";
  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  const supabase = await getSupabase();

  // Fetch Person Public Data
  const { data: person, error } = await supabase
    .from("persons")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !person) {
    notFound();
  }

  // Fetch Private Data if Admin
  let privateData = null;
  if (isAdmin) {
    const { data } = await supabase
      .from("person_details_private")
      .select("*")
      .eq("person_id", id)
      .single();
    privateData = data;
  }

  // Determine Vietnamese sibling role: trưởng nam / trưởng nữ / thứ nam / thứ nữ
  let lineageRole: string | null = null;
  const { data: parentRels } = await supabase
    .from("relationships")
    .select("person_a")
    .eq("person_b", id)
    .in("type", ["biological_child", "adopted_child"]);

  const parentIds = Array.from(new Set((parentRels ?? []).map((r) => r.person_a)));
  if (parentIds.length > 0) {
    const { data: siblingRels } = await supabase
      .from("relationships")
      .select("person_b")
      .in("person_a", parentIds)
      .in("type", ["biological_child", "adopted_child"]);

    const siblingIds = Array.from(new Set((siblingRels ?? []).map((r) => r.person_b)));
    if (siblingIds.length > 0) {
      const { data: siblings } = await supabase
        .from("persons")
        .select("id, gender, birth_order, birth_year, birth_month, birth_day")
        .in("id", siblingIds);

      if (siblings && siblings.length > 0) {
        lineageRole = computeLineageRole(id, siblings);
      }
    }
  }

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="title">Chi Tiết Thành Viên</h1>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2.5">
            <Link
              href={`/dashboard/members/${id}/edit`}
              className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
            >
              Chỉnh sửa
            </Link>
            <DeleteMemberButton memberId={id} />
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <div className="bg-white/60 rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <MemberDetailContent
            person={person}
            privateData={privateData}
            isAdmin={isAdmin}
            canEdit={canEdit}
            lineageRole={lineageRole}
          />
        </div>
      </main>
    </div>
  );
}
