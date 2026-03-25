"use client";

import { createClient } from "@/utils/supabase/client";
import { FileText, Plus, Scale, ScrollText, ShieldAlert, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ElementType, FormEvent, useMemo, useState } from "react";

type Category = "toc_quy" | "toc_uoc" | "quy_dinh";

interface ClanDocument {
  id: string;
  title: string;
  content: string;
  category: Category;
  effective_date: string | null;
  created_at: string;
}

const categoryMeta: Record<Category, { label: string; icon: ElementType }> = {
  toc_quy: { label: "Tộc quy", icon: ScrollText },
  toc_uoc: { label: "Tộc ước", icon: Scale },
  quy_dinh: { label: "Quy định", icon: ShieldAlert },
};

export default function ClanDocumentsPanel({
  initialDocs,
  canEdit,
}: {
  initialDocs: ClanDocument[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("toc_quy");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    return {
      toc_quy: initialDocs.filter((d) => d.category === "toc_quy"),
      toc_uoc: initialDocs.filter((d) => d.category === "toc_uoc"),
      quy_dinh: initialDocs.filter((d) => d.category === "quy_dinh"),
    };
  }, [initialDocs]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError(null);
    const { error: insertError } = await supabase.from("clan_documents").insert({
      title,
      content,
      category,
      effective_date: effectiveDate || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setContent("");
    setEffectiveDate("");
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Bạn có chắc muốn xoá mục này?")) return;

    const { error: deleteError } = await supabase
      .from("clan_documents")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4"
        >
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Plus className="size-5 text-amber-600" />
            Thêm nội dung quản lý dòng tộc
          </h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tiêu đề"
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
            >
              <option value="toc_quy">Tộc quy</option>
              <option value="toc_uoc">Tộc ước</option>
              <option value="quy_dinh">Quy định</option>
            </select>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="border border-stone-300 rounded-xl px-3 py-2 text-sm"
            />
          </div>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung chi tiết"
            rows={5}
            className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm"
          />
          <button
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu nội dung"}
          </button>
        </form>
      )}

      {(Object.keys(grouped) as Category[]).map((key) => {
        const meta = categoryMeta[key];
        const Icon = meta.icon;
        return (
          <section key={key} className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 mb-4">
              <Icon className="size-5 text-indigo-600" />
              {meta.label}
            </h3>
            {grouped[key].length === 0 ? (
              <p className="text-sm text-stone-500">Chưa có nội dung.</p>
            ) : (
              <div className="space-y-3">
                {grouped[key].map((doc) => (
                  <article key={doc.id} className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-stone-800">{doc.title}</h4>
                        {doc.effective_date && (
                          <p className="text-xs text-stone-500 mt-1">Hiệu lực: {doc.effective_date}</p>
                        )}
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="text-rose-600 hover:text-rose-700"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-stone-700 whitespace-pre-wrap mt-3">{doc.content}</p>
                  </article>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="text-xs text-stone-500 flex items-center gap-2">
        <FileText className="size-4" />
        Các mục này hỗ trợ chuẩn hoá nề nếp họ tộc và công bố minh bạch trong nội bộ.
      </div>
    </div>
  );
}
