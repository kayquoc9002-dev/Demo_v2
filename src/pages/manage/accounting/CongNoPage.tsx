// ─────────────────────────────────────────────────────────────────────────────
// CongNoPage.tsx — Quản lý Công nợ AR/AP — 3 lớp UI
// Lớp 1: Bảng tổng hợp → Lớp 2: Aging chi tiết → Lớp 3: Popup khớp nợ
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle, CheckCircle, Clock, Link,
  X, Unlink, Info, ChevronRight,
  DollarSign,
} from "lucide-react";
import type {
  DebtSummary, InvoiceWithAging, UnappliedAmount,
} from "../../../components/ThuChi/data/accountingTypes";
import {
  layDebtSummary, layInvoicesWithAging, layUnappliedAmounts,
  allocate, unallocate,
} from "../../../components/ThuChi/ServiceLayer/accountingService";
import { MOCK_VOUCHERS } from "../../../components/ThuChi/data/accountingMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function fmt_short(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0) + " tr";
  return fmt(n) + "đ";
}

function fmt_ngay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const AGING_CONFIG = {
  trong_han: { label: "Trong hạn",       mau: "#10b981", nen: "#06472520" },
  "1_30":    { label: "Quá hạn 1-30ng",  mau: "#f59e0b", nen: "#78350f20" },
  "31_60":   { label: "Quá hạn 31-60ng", mau: "#f97316", nen: "#7c2d1220" },
  "61_90":   { label: "Quá hạn 61-90ng", mau: "#ef4444", nen: "#7f1d1d20" },
  tren_90:   { label: "Quá hạn >90ng",   mau: "#dc2626", nen: "#450a0a20" },
};

function total_qua_han(d: DebtSummary): number {
  return d.qua_han_1_30 + d.qua_han_31_60 + d.qua_han_61_90 + d.qua_han_tren_90;
}

// ─── Lớp 3: Popup Khớp nợ ────────────────────────────────────────────────────

function MatchingPopup({ invoice, type, onClose, onDone }: {
  invoice:  InvoiceWithAging;
  type:     "ar" | "ap";
  onClose:  () => void;
  onDone:   () => void;
}) {
  const [unapplied,    setUnapplied]   = useState<UnappliedAmount[]>([]);
  const [sel_voucher,  setSelVoucher]  = useState("");
  const [amount_input, setAmountInput] = useState(invoice.remaining);
  const [loading,      setLoading]     = useState(false);
  const [error,        setError]       = useState("");
  const [success,      setSuccess]     = useState("");

  useEffect(() => {
    layUnappliedAmounts(type).then(setUnapplied);
  }, [type]);

  const sel_v = unapplied.find(u => u.voucher_id === sel_voucher);
  const voucher_obj = MOCK_VOUCHERS.find(v => v.voucher_id === sel_voucher);

  // Tính FX gain/loss preview
  const fx_gl = sel_v && voucher_obj && invoice.currency !== "VND"
    ? Math.round((voucher_obj.exchange_rate - invoice.exchange_rate)
        * (amount_input / invoice.exchange_rate))
    : 0;

  const handle_khop = async () => {
    if (!sel_voucher) { setError("Chưa chọn phiếu thu"); return; }
    if (amount_input <= 0) { setError("Số tiền phải lớn hơn 0"); return; }
    if (amount_input > invoice.remaining) {
      setError(`Không được vượt quá số còn nợ: ${fmt(invoice.remaining)}đ`);
      return;
    }
    setLoading(true);
    setError("");
    try {
      await allocate({
        voucher_id:     sel_voucher,
        invoice_id:     invoice.invoice_id,
        applied_amount: amount_input,
        applied_fx:     invoice.currency !== "VND"
          ? amount_input / (voucher_obj?.exchange_rate ?? 1) : 0,
        created_by:     "Trần Kế Toán Trưởng",
      });
      setSuccess(`Đã khớp ${fmt(amount_input)}đ${fx_gl !== 0
        ? ` · Lãi/lỗ tỷ giá: ${fx_gl > 0 ? "+" : ""}${fmt(fx_gl)}đ` : ""}`);
      setTimeout(() => { onDone(); onClose(); }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Lỗi không xác định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.92)" }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-[560px]"
        style={{ background: "#0a1628", border: "1px solid #38bdf840", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#1e293b", background: "#0c435415" }}>
          <div>
            <h3 className="text-sm font-black text-white">Khớp nợ</h3>
            <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
              {invoice.invoice_code} · Còn nợ{" "}
              <span className="font-black" style={{ color: "#ef4444" }}>
                {fmt(invoice.remaining)}đ
              </span>
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Nửa trên: Chọn phiếu thu có tiền chưa dùng */}
          <div>
            <p className="text-[10px] font-black uppercase mb-2" style={{ color: "#475569" }}>
              Chọn phiếu {type === "ar" ? "thu" : "chi"} (có tiền chưa phân bổ)
            </p>
            {unapplied.length === 0 ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                style={{ background: "#1e293b" }}>
                <Info size={13} style={{ color: "#475569" }} />
                <p className="text-xs" style={{ color: "#475569" }}>
                  Không có phiếu nào có tiền chưa phân bổ
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {unapplied.map(u => (
                  <button key={u.voucher_id}
                    onClick={() => {
                      setSelVoucher(u.voucher_id);
                      setAmountInput(Math.min(u.unapplied_vnd, invoice.remaining));
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: sel_voucher === u.voucher_id ? "#0c435425" : "#1e293b",
                      border: `1px solid ${sel_voucher === u.voucher_id ? "#38bdf840" : "#334155"}`,
                    }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-black"
                          style={{ color: "#38bdf8" }}>
                          {u.voucher_code}
                        </code>
                        <span className="text-[9px]" style={{ color: "#334155" }}>
                          {fmt_ngay(u.payment_date)}
                        </span>
                      </div>
                      <p className="text-[10px] truncate" style={{ color: "#475569" }}>
                        {u.doi_tuong_name}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black" style={{ color: "#10b981" }}>
                        {fmt_short(u.unapplied_vnd)}
                      </p>
                      <p className="text-[9px]" style={{ color: "#334155" }}>
                        chưa dùng
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nửa dưới: Nhập số tiền khớp */}
          {sel_voucher && (
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #1e293b" }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: "#1e293b", background: "#0f172a" }}>
                <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                  Số tiền muốn khớp vào hóa đơn này
                </p>
              </div>
              <div className="px-4 py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <input type="number"
                    value={amount_input}
                    onChange={e => setAmountInput(Number(e.target.value))}
                    min={1} max={invoice.remaining}
                    className="flex-1 px-3 py-2.5 rounded-xl text-lg font-black outline-none text-right"
                    style={{ background: "#1e293b", border: "1px solid #334155",
                      color: "#38bdf8", fontVariantNumeric: "tabular-nums" }} />
                  <span className="text-sm font-bold" style={{ color: "#475569" }}>đ</span>
                </div>

                {/* Quick fill buttons */}
                <div className="flex gap-2">
                  {[25, 50, 75, 100].map(pct => (
                    <button key={pct}
                      onClick={() => setAmountInput(Math.round(invoice.remaining * pct / 100))}
                      className="flex-1 py-1 rounded-lg text-[10px] font-bold"
                      style={{ background: "#1e293b", color: "#64748b" }}>
                      {pct}%
                    </button>
                  ))}
                </div>

                {/* FX Gain/Loss preview */}
                {fx_gl !== 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: fx_gl > 0 ? "#06472520" : "#7f1d1d20",
                      border: `1px solid ${fx_gl > 0 ? "#10b98130" : "#ef444430"}` }}>
                    <Info size={11} style={{ color: fx_gl > 0 ? "#10b981" : "#ef4444" }} />
                    <p className="text-[10px]" style={{ color: fx_gl > 0 ? "#10b981" : "#ef4444" }}>
                      Chênh lệch tỷ giá:{" "}
                      <span className="font-black">
                        {fx_gl > 0 ? "+" : ""}{fmt(fx_gl)}đ
                      </span>
                      {" "}({fx_gl > 0 ? "Lãi" : "Lỗ"} tỷ giá — tự động ghi nhận)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
              <AlertTriangle size={12} style={{ color: "#ef4444" }} />
              <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#06472520", border: "1px solid #10b98130" }}>
              <CheckCircle size={12} style={{ color: "#10b981" }} />
              <p className="text-xs font-bold" style={{ color: "#10b981" }}>{success}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t"
          style={{ borderColor: "#1e293b" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Đóng
          </button>
          <button onClick={handle_khop} disabled={loading || !sel_voucher}
            className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            <Link size={14} />
            {loading ? "Đang khớp..." : "Xác nhận khớp nợ"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lớp 2: Chi tiết Aging 1 khách hàng ──────────────────────────────────────

function AgingDetail({ party, type, onClose, onRefresh }: {
  party:     DebtSummary;
  type:      "ar" | "ap";
  onClose:   () => void;
  onRefresh: () => void;
}) {
  const [invoices,    setInvoices]   = useState<InvoiceWithAging[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [matching,    setMatching]   = useState<InvoiceWithAging | null>(null);
  const [refreshKey,  setRefreshKey] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setRefreshKey(k => k + 1);
  }, []);

  useEffect(() => {
    let active = true;
    layInvoicesWithAging(party.party_id, type).then(data => {
      if (active) { setInvoices(data); setLoading(false); }
    });
    return () => { active = false; };
  }, [party.party_id, type, refreshKey]);

  const handle_unallocate = async (alloc_id: string) => {
    await unallocate(alloc_id);
    load();
    onRefresh();
  };

  // Tổng theo bucket
  const buckets = Object.keys(AGING_CONFIG) as (keyof typeof AGING_CONFIG)[];
  const bucket_totals = buckets.map(b => ({
    bucket: b,
    total: invoices
      .filter(i => i.aging_bucket === b)
      .reduce((s, i) => s + i.remaining, 0),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.85)" }}
      onClick={onClose}>
      <div className="flex flex-col rounded-2xl overflow-hidden w-[800px]"
        style={{ background: "#0a1628", border: "1px solid #1e293b", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          <div>
            <h3 className="text-sm font-black text-white">{party.party_name}</h3>
            <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
              Dư nợ cuối kỳ:{" "}
              <span className="font-black" style={{ color: "#ef4444" }}>
                {fmt_short(party.du_no_cuoi_ky)}
              </span>
              {total_qua_han(party) > 0 && (
                <span className="ml-2" style={{ color: "#ef4444" }}>
                  · Quá hạn: {fmt_short(total_qua_han(party))}
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        {/* Aging buckets */}
        <div className="grid grid-cols-5 gap-2 px-6 py-3 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          {bucket_totals.map(({ bucket, total }) => {
            const cfg = AGING_CONFIG[bucket];
            return (
              <div key={bucket} className="px-3 py-2 rounded-xl text-center"
                style={{ background: cfg.nen, border: `1px solid ${cfg.mau}30` }}>
                <p className="text-[9px] font-black uppercase mb-0.5"
                  style={{ color: cfg.mau }}>{cfg.label}</p>
                <p className="text-sm font-black"
                  style={{ color: total > 0 ? cfg.mau : "#334155",
                    fontVariantNumeric: "tabular-nums" }}>
                  {total > 0 ? fmt_short(total) : "—"}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bảng hóa đơn */}
        <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Header */}
          <div className="grid items-center px-6 py-2 text-[9px] font-black uppercase sticky top-0"
            style={{
              gridTemplateColumns: "120px 80px 80px 120px 120px 80px 100px 80px",
              background: "#020817", color: "#334155",
              borderBottom: "1px solid #1e293b",
            }}>
            <span>Số HĐ</span>
            <span>Ngày xuất</span>
            <span>Hạn TT</span>
            <span className="text-right">Tổng HĐ</span>
            <span className="text-right">Đã trả</span>
            <span className="text-right">Còn nợ</span>
            <span className="text-center">Tuổi nợ</span>
            <span></span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-xs" style={{ color: "#475569" }}>Đang tải...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle size={24} className="mb-2" style={{ color: "#10b981", opacity: 0.4 }} />
              <p className="text-sm" style={{ color: "#475569" }}>Không có hóa đơn nào còn nợ</p>
            </div>
          ) : invoices.map(inv => {
            const cfg        = AGING_CONFIG[inv.aging_bucket];
            const is_overdue = inv.days_overdue > 0;
            return (
              <div key={inv.invoice_id}>
                <div className="grid items-center px-6 py-3 gap-2 hover:bg-slate-800/30 transition-colors"
                  style={{
                    gridTemplateColumns: "120px 80px 80px 120px 120px 80px 100px 80px",
                    borderBottom: "1px solid #0f172a",
                    borderLeft: `3px solid ${is_overdue ? cfg.mau : "transparent"}`,
                  }}>
                  <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                    {inv.invoice_code}
                  </code>
                  <p className="text-[11px]" style={{ color: "#64748b" }}>
                    {fmt_ngay(inv.issue_date)}
                  </p>
                  <p className="text-[11px] font-bold"
                    style={{ color: is_overdue ? cfg.mau : "#64748b" }}>
                    {fmt_ngay(inv.due_date)}
                  </p>
                  <p className="text-xs text-right" style={{ color: "#94a3b8",
                    fontVariantNumeric: "tabular-nums" }}>
                    {fmt(inv.total_amount)}
                  </p>
                  <p className="text-xs text-right" style={{ color: "#10b981",
                    fontVariantNumeric: "tabular-nums" }}>
                    {inv.paid_amount > 0 ? fmt(inv.paid_amount) : "—"}
                  </p>
                  <p className="text-sm font-black text-right"
                    style={{ color: cfg.mau, fontVariantNumeric: "tabular-nums" }}>
                    {fmt(inv.remaining)}
                  </p>
                  <div className="flex justify-center">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: cfg.nen, color: cfg.mau }}>
                      {is_overdue ? `+${inv.days_overdue}ng` : cfg.label}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setMatching(inv)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                      style={{ background: "#0c435420", color: "#38bdf8" }}>
                      <Link size={10} /> Khớp
                    </button>
                  </div>
                </div>

                {/* Allocations đã khớp */}
                {inv.allocations.map(alloc => (
                  <div key={alloc.allocation_id}
                    className="flex items-center gap-3 px-8 py-2"
                    style={{ background: "#06472210", borderBottom: "1px solid #0f172a" }}>
                    <CheckCircle size={10} style={{ color: "#10b981", flexShrink: 0 }} />
                    <p className="text-[10px] flex-1" style={{ color: "#10b981" }}>
                      Đã khớp {fmt(alloc.applied_amount)}đ
                      {alloc.fx_gain_loss !== 0 && (
                        <span style={{ color: alloc.fx_gain_loss > 0 ? "#10b981" : "#ef4444" }}>
                          {" "}· FX {alloc.fx_gain_loss > 0 ? "+" : ""}{fmt(alloc.fx_gain_loss)}đ
                        </span>
                      )}
                    </p>
                    <button
                      onClick={() => handle_unallocate(alloc.allocation_id)}
                      className="flex items-center gap-1 text-[9px] hover:opacity-80"
                      style={{ color: "#475569" }}>
                      <Unlink size={9} /> Hủy khớp
                    </button>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Matching popup */}
      {matching && (
        <MatchingPopup
          invoice={matching}
          type={type}
          onClose={() => setMatching(null)}
          onDone={() => { load(); onRefresh(); }}
        />
      )}
    </div>
  );
}

// ─── Lớp 1: Bảng tổng hợp công nợ ───────────────────────────────────────────

export default function CongNoPage() {
  const [type,        setType]       = useState<"ar" | "ap">("ar");
  const [summaries,   setSummaries]  = useState<DebtSummary[]>([]);
  const [unapplied,   setUnapplied]  = useState<UnappliedAmount[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [detail,      setDetail]     = useState<DebtSummary | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [sums, unap] = await Promise.all([
      layDebtSummary(type),
      layUnappliedAmounts(type),
    ]);
    setSummaries(sums);
    setUnapplied(unap);
    setLoading(false);
  }, [type]);

  useEffect(() => { 
    const fetchLoad = () => {
      load();
    }
    fetchLoad()
   }, [load]);

  const tong_no    = summaries.reduce((s, d) => s + d.du_no_cuoi_ky, 0);
  const tong_qh    = summaries.reduce((s, d) => s + total_qua_han(d), 0);
  const tong_unap  = unapplied.reduce((s, u) => s + u.unapplied_vnd, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* Header */}
      <div className="px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-black text-white">Quản lý Công nợ</h2>
            <p className="text-[10px] mt-0.5" style={{ color: "#334155" }}>
              Báo cáo tuổi nợ · Khớp nợ · Phân bổ thanh toán
            </p>
          </div>
          {/* Tab AR/AP */}
          <div className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e293b" }}>
            {(["ar", "ap"] as const).map(t => (
              <button key={t} onClick={() => setType(t)}
                className="px-4 py-2 text-xs font-black"
                style={{
                  background: type === t ? "#0c4354" : "#1e293b",
                  color:      type === t ? "#38bdf8" : "#475569",
                }}>
                {t === "ar" ? "Phải Thu (AR)" : "Phải Trả (AP)"}
              </button>
            ))}
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: type === "ar" ? "Tổng phải thu" : "Tổng phải trả",
              value: fmt_short(tong_no), mau: "#38bdf8", icon: DollarSign },
            { label: "Quá hạn",
              value: fmt_short(tong_qh), mau: "#ef4444", icon: AlertTriangle },
            { label: "Tiền chưa phân bổ",
              value: fmt_short(tong_unap), mau: "#f59e0b", icon: Clock },
            { label: "Trong hạn",
              value: fmt_short(summaries.reduce((s, d) => s + d.trong_han, 0)), mau: "#10b981", icon: CheckCircle },
          ].map(({ label, value, mau, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: mau + "20" }}>
                <Icon size={13} style={{ color: mau }} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold" style={{ color: "#334155" }}>
                  {label}
                </p>
                <p className="text-base font-black leading-none"
                  style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bảng tổng hợp */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
        {/* Header */}
        <div className="grid items-center px-6 py-2 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "200px 130px 130px 130px 130px 100px 28px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <span>{type === "ar" ? "Khách hàng" : "Nhà cung cấp"}</span>
          <span className="text-right">Dư đầu kỳ</span>
          <span className="text-right">Phát sinh +</span>
          <span className="text-right">Phát sinh −</span>
          <span className="text-right">Dư cuối kỳ</span>
          <span className="text-right">Quá hạn</span>
          <span></span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-xs" style={{ color: "#475569" }}>Đang tải...</p>
          </div>
        ) : summaries.map((s, i) => (
          <div key={s.party_id}
            className="grid items-center px-6 py-3 gap-2 cursor-pointer hover:bg-slate-800/30 transition-colors"
            style={{
              gridTemplateColumns: "200px 130px 130px 130px 130px 100px 28px",
              borderBottom: "1px solid #0f172a",
              background: i % 2 === 0 ? "transparent" : "#0f172a40",
              borderLeft: `3px solid ${total_qua_han(s) > 0 ? "#ef4444" : "transparent"}`,
            }}
            onClick={() => setDetail(s)}>
            <p className="text-sm font-bold text-white truncate">{s.party_name}</p>
            <p className="text-xs text-right" style={{ color: "#64748b",
              fontVariantNumeric: "tabular-nums" }}>
              {s.du_no_dau_ky > 0 ? fmt(s.du_no_dau_ky) : "—"}
            </p>
            <p className="text-xs text-right font-bold"
              style={{ color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>
              {s.phat_sinh_tang > 0 ? "+" + fmt(s.phat_sinh_tang) : "—"}
            </p>
            <p className="text-xs text-right font-bold"
              style={{ color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
              {s.phat_sinh_giam > 0 ? "−" + fmt(s.phat_sinh_giam) : "—"}
            </p>
            <p className="text-sm font-black text-right"
              style={{ color: "#f97316", fontVariantNumeric: "tabular-nums" }}>
              {fmt(s.du_no_cuoi_ky)}
            </p>
            <p className="text-sm font-black text-right"
              style={{ color: total_qua_han(s) > 0 ? "#ef4444" : "#334155",
                fontVariantNumeric: "tabular-nums" }}>
              {total_qua_han(s) > 0 ? fmt(total_qua_han(s)) : "—"}
            </p>
            <ChevronRight size={13} style={{ color: "#334155" }} />
          </div>
        ))}
      </div>

      {/* Lớp 2 — Detail drawer */}
      {detail && (
        <AgingDetail
          party={detail}
          type={type}
          onClose={() => setDetail(null)}
          onRefresh={load}
        />
      )}
    </div>
  );
}