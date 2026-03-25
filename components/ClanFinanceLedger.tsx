"use client";

import { createClient } from "@/utils/supabase/client";
import { BanknoteArrowDown, BanknoteArrowUp, Landmark, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type EntryType = "income" | "expense";

interface FinanceEntry {
  id: string;
  entry_date: string;
  type: EntryType;
  category: string | null;
  amount: number;
  description: string;
  payer_receiver: string | null;
  note: string | null;
}

const formatMoney = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function ClanFinanceLedger({
  initialEntries,
  canEdit,
}: {
  initialEntries: FinanceEntry[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [entryDate, setEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<EntryType>("income");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [payerReceiver, setPayerReceiver] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summary = useMemo(() => {
    const income = initialEntries
      .filter((e) => e.type === "income")
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const expense = initialEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + Number(e.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
    };
  }, [initialEntries]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setSaving(true);
    setError(null);

    const amountNumber = Number(amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setError("Số tiền không hợp lệ.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase.from("clan_finance_entries").insert({
      entry_date: entryDate,
      type,
      category: category || null,
      amount: amountNumber,
      description,
      payer_receiver: payerReceiver || null,
      note: note || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setCategory("");
    setAmount("");
    setDescription("");
    setPayerReceiver("");
    setNote("");
    setSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    if (!window.confirm("Bạn có chắc muốn xoá giao dịch này?")) return;

    const { error: deleteError } = await supabase
      .from("clan_finance_entries")
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
      <section className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm text-emerald-700">Tổng thu</p>
          <p className="text-xl font-bold text-emerald-800">{formatMoney(summary.income)}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm text-rose-700">Tổng chi</p>
          <p className="text-xl font-bold text-rose-800">{formatMoney(summary.expense)}</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-700">Số dư quỹ tộc</p>
          <p className="text-xl font-bold text-amber-800">{formatMoney(summary.balance)}</p>
        </div>
      </section>

      {canEdit && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <Plus className="size-5 text-amber-600" />
            Ghi sổ thu chi
          </h2>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm" required />
            <select value={type} onChange={(e) => setType(e.target.value as EntryType)} className="border border-stone-300 rounded-xl px-3 py-2 text-sm">
              <option value="income">Thu</option>
              <option value="expense">Chi</option>
            </select>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min={1} placeholder="Số tiền" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" required />
            <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Khoản mục" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <input value={payerReceiver} onChange={(e) => setPayerReceiver(e.target.value)} placeholder="Người nộp/nhận" className="border border-stone-300 rounded-xl px-3 py-2 text-sm" />
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nội dung" className="border border-stone-300 rounded-xl px-3 py-2 text-sm lg:col-span-3" required />
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú" rows={3} className="w-full border border-stone-300 rounded-xl px-3 py-2 text-sm" />
          <button disabled={saving} className="px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-60">
            {saving ? "Đang lưu..." : "Lưu giao dịch"}
          </button>
        </form>
      )}

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-bold text-stone-800 flex items-center gap-2 mb-4">
          <Landmark className="size-5 text-indigo-600" />
          Sổ quản lý thu chi dòng tộc
        </h3>
        <div className="space-y-3">
          {initialEntries.length === 0 && (
            <p className="text-sm text-stone-500">Chưa có giao dịch nào.</p>
          )}
          {initialEntries.map((entry) => {
            const isIncome = entry.type === "income";
            return (
              <article key={entry.id} className="border border-stone-200 rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-500">{entry.entry_date}</p>
                    <h4 className="font-semibold text-stone-800">{entry.description}</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {entry.category || "Chưa phân loại"}
                      {entry.payer_receiver ? ` · ${entry.payer_receiver}` : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${isIncome ? "text-emerald-600" : "text-rose-600"}`}>
                      {isIncome ? "+" : "-"}
                      {formatMoney(Number(entry.amount))}
                    </p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      {isIncome ? (
                        <BanknoteArrowUp className="size-4 text-emerald-500" />
                      ) : (
                        <BanknoteArrowDown className="size-4 text-rose-500" />
                      )}
                      {canEdit && (
                        <button className="text-rose-600" onClick={() => handleDelete(entry.id)}>
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {entry.note && <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{entry.note}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
