"use client";

import { createClient } from "@/utils/supabase/client";
import { Megaphone, Pin, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

interface NewsItem {
  id: string;
  title: string;
  summary: string | null;
  content: string;
  is_pinned: boolean;
  published_at: string;
}

export default function ClanNewsBoard({
  items,
  canEdit,
}: {
  items: NewsItem[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNews = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase.from("clan_news").insert({
      title,
      summary: summary || null,
      content,
      is_pinned: isPinned,
      published_at: new Date().toISOString(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setSummary("");
    setContent("");
    setIsPinned(false);
    setLoading(false);
    router.refresh();
  };

  const removeNews = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Bạn có chắc muốn xoá bản tin này?")) return;

    const { error: deleteError } = await supabase
      .from("clan_news")
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
        <form onSubmit={createNews} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Plus className="size-5 text-amber-600" />
            Đăng tin tức dòng họ
          </h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tiêu đề bản tin" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
          <input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Tóm tắt ngắn" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
          <textarea required rows={5} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Nội dung chi tiết" className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
          <label className="inline-flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
            Ghim tin này lên đầu bảng tin
          </label>
          <div>
            <button disabled={loading} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-60">
              {loading ? "Đang đăng..." : "Đăng tin"}
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
          <Megaphone className="size-5 text-indigo-600" />
          Bảng tin dòng họ
        </h3>
        <div className="space-y-3">
          {items.length === 0 && <p className="text-sm text-stone-500">Chưa có bản tin nào.</p>}
          {items.map((news) => (
            <article key={news.id} className="border border-stone-200 rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-stone-800">{news.title}</h4>
                    {news.is_pinned && <Pin className="size-4 text-amber-600" />}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    {new Date(news.published_at).toLocaleString("vi-VN")}
                  </p>
                </div>
                {canEdit && (
                  <button onClick={() => removeNews(news.id)} className="text-rose-600">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              {news.summary && <p className="text-sm text-stone-600 mt-2 italic">{news.summary}</p>}
              <p className="text-sm text-stone-700 mt-2 whitespace-pre-wrap">{news.content}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
