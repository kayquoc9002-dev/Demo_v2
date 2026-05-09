// ─────────────────────────────────────────────────────────────────────────────
// Tab30OrderApproval.tsx — Tab Xác nhận đơn hàng
// Kế toán thẩm định rủi ro tài chính trước khi đơn xuống kho
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Check, X, AlertTriangle, ShieldAlert, Shield,
  ShieldCheck, TrendingDown, AlertCircle, User,
} from "lucide-react";
import type { OrderApproval, RiskLevel } from "../../../components/ThuChi/data/revenueTypes";
import { MIN_MARGIN_THRESHOLD } from "../../../components/ThuChi/data/revenueTypes";
import { MOCK_ORDER_APPROVALS } from "../../../components/ThuChi/data/revenueMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}
function fmt_short(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (Math.abs(n) >= 1_000_000)     return (Math.abs(n) / 1_000_000).toFixed(0) + (n < 0 ? " tr âm" : " tr");
  return fmt(n);
}
function fmt_ngay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const RISK_CONFIG: Record<RiskLevel, { label: string; mau: string; nen: string; icon: React.ElementType }> = {
  an_toan:    { label: "An toàn",     mau: "#10b981", nen: "#06472520", icon: ShieldCheck  },
  canh_bao:   { label: "Cảnh báo",   mau: "#f59e0b", nen: "#78350f20", icon: Shield       },
  rui_ro_cao: { label: "Rủi ro cao", mau: "#ef4444", nen: "#7f1d1d20", icon: ShieldAlert  },
};

const STATUS_CONFIG = {
  cho_duyet: { label: "Chờ duyệt", mau: "#f59e0b", nen: "#78350f20" },
  da_duyet:  { label: "Đã duyệt",  mau: "#10b981", nen: "#06472520" },
  tu_choi:   { label: "Từ chối",   mau: "#ef4444", nen: "#7f1d1d20" },
};

// ─── Modal Chi tiết + Thẩm định ───────────────────────────────────────────────

function OrderDetailModal({ order, onClose, onDone }: {
  order:   OrderApproval;
  onClose: () => void;
  onDone:  () => void;
}) {
  const [vat_rate,      setVatRate]     = useState(order.thi_truong === "xuat_khau" ? 0 : 10);
  const [action,        setAction]      = useState<"duyet" | "tu_choi" | null>(null);
  const [reject_reason, setRejectReason] = useState("");
  const [confirm_risk,  setConfirmRisk]  = useState(false);
  const [loading,       setLoading]     = useState(false);

  const is_locked = order.approval_status !== "cho_duyet";
  const { credit_info: ci, profit_info: pi } = order;
  const risk_cfg = RISK_CONFIG[order.risk_level];

  // FE tính VAT realtime
  const vat_amount = Math.round(order.total_amount * vat_rate / 100);
  const total_with_vat = order.total_amount + vat_amount;

  const has_risk = order.risk_level !== "an_toan";

  const handle_duyet = () => {
    if (has_risk && !confirm_risk) {
      setConfirmRisk(true);
      return;
    }
    do_action("duyet");
  };

  const handle_tu_choi = () => {
    if (!reject_reason.trim()) return;
    do_action("tu_choi");
  };

  const do_action = (act: "duyet" | "tu_choi") => {
    setLoading(true);
    const idx = MOCK_ORDER_APPROVALS.findIndex(o => o.order_id === order.order_id);
    if (idx >= 0) {
      MOCK_ORDER_APPROVALS[idx] = {
        ...MOCK_ORDER_APPROVALS[idx],
        approval_status: act === "duyet" ? "da_duyet" : "tu_choi",
        reject_reason:   act === "tu_choi" ? reject_reason : undefined,
        approved_by:     act === "duyet" ? "Trần Kế Toán Trưởng" : undefined,
        approved_at:     act === "duyet" ? new Date().toISOString() : undefined,
      };
    }
    setLoading(false);
    onDone();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.9)" }}
      onClick={onClose}>
      <div className="flex flex-col rounded-2xl overflow-hidden w-[900px]"
        style={{ background: "#0a1628", border: `1px solid ${risk_cfg.mau}30`, maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b", background: risk_cfg.nen }}>
          <div className="flex items-center gap-3">
            <risk_cfg.icon size={18} style={{ color: risk_cfg.mau }} />
            <div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-black" style={{ color: "#38bdf8" }}>
                  {order.order_code}
                </code>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: risk_cfg.nen, color: risk_cfg.mau,
                    border: `1px solid ${risk_cfg.mau}40` }}>
                  {risk_cfg.label}
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
                {order.customer_name} · Sales: {order.sales_person} · {fmt_ngay(order.order_date)}
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        {/* Body — 2 cột */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div className="grid h-full" style={{ gridTemplateColumns: "1fr 340px" }}>

            {/* ── Cột trái: Thông tin đơn hàng ── */}
            <div className="px-6 py-5 border-r space-y-4"
              style={{ borderColor: "#1e293b" }}>
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                Chi tiết hàng hóa
              </p>

              {/* Bảng sản phẩm */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                <div className="grid px-4 py-2 text-[9px] font-black uppercase"
                  style={{ gridTemplateColumns: "1fr 50px 90px 80px 90px",
                    background: "#020817", color: "#334155",
                    borderBottom: "1px solid #1e293b" }}>
                  <span>Sản phẩm</span>
                  <span className="text-right">SL</span>
                  <span className="text-right">Giá bán</span>
                  <span className="text-right">Giá vốn</span>
                  <span className="text-right">Thành tiền</span>
                </div>
                {order.items.map((item, i) => {
                  const item_margin = ((item.price - item.cost) / item.price * 100);
                  const is_loss_item = item.price < item.cost;
                  return (
                    <div key={i} className="grid items-center px-4 py-2.5 gap-2"
                      style={{ gridTemplateColumns: "1fr 50px 90px 80px 90px",
                        borderBottom: i < order.items.length - 1 ? "1px solid #0f172a" : "none",
                        background: is_loss_item ? "#7f1d1d10" : "transparent" }}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.product_name}</p>
                        <code className="text-[9px]" style={{ color: "#334155" }}>{item.sku_code}</code>
                      </div>
                      <p className="text-xs text-right" style={{ color: "#64748b" }}>{fmt(item.qty)}</p>
                      <p className="text-xs text-right font-bold"
                        style={{ color: is_loss_item ? "#ef4444" : "#94a3b8",
                          fontVariantNumeric: "tabular-nums" }}>
                        {fmt(item.price)}đ
                      </p>
                      <p className="text-xs text-right"
                        style={{ color: "#475569", fontVariantNumeric: "tabular-nums" }}>
                        {fmt(item.cost)}đ
                      </p>
                      <div className="text-right">
                        <p className="text-xs font-bold"
                          style={{ color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                          {fmt_short(item.subtotal)}đ
                        </p>
                        {is_loss_item && (
                          <p className="text-[9px]" style={{ color: "#ef4444" }}>
                            Bán dưới GV!
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tính VAT */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                <div className="px-4 py-3 border-b"
                  style={{ borderColor: "#1e293b", background: "#0f172a" }}>
                  <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                    Tính toán VAT (xem trước)
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-white">Thuế VAT (%)</p>
                    <div className="flex gap-1.5">
                      {[0, 8, 10].map(r => (
                        <button key={r} onClick={() => setVatRate(r)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          style={{
                            background: vat_rate === r ? "#0c435425" : "#1e293b",
                            color:      vat_rate === r ? "#38bdf8"   : "#475569",
                            border:     `1px solid ${vat_rate === r ? "#38bdf840" : "#334155"}`,
                          }}>
                          {r}%
                        </button>
                      ))}
                    </div>
                  </div>
                  {[
                    { label: "Giá trị đơn (chưa thuế)", val: order.total_amount, mau: "#94a3b8" },
                    { label: `Thuế VAT (${vat_rate}%)`,  val: vat_amount,         mau: "#f59e0b" },
                  ].map(({ label, val, mau }) => (
                    <div key={label} className="flex justify-between">
                      <p className="text-[11px]" style={{ color: "#64748b" }}>{label}</p>
                      <p className="text-[11px] font-bold"
                        style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                        {fmt(val)}đ
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2"
                    style={{ borderTop: "1px solid #1e293b" }}>
                    <p className="text-sm font-black text-white">Khách phải trả</p>
                    <p className="text-lg font-black"
                      style={{ color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                      {fmt(total_with_vat)}đ
                    </p>
                  </div>
                </div>
              </div>

              {/* Action từ chối */}
              {action === "tu_choi" && (
                <div className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid #ef444430", background: "#7f1d1d15" }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "#ef444430" }}>
                    <p className="text-[10px] font-black uppercase" style={{ color: "#ef4444" }}>
                      Lý do từ chối <span style={{ color: "#ef4444" }}>*</span>
                    </p>
                  </div>
                  <div className="px-4 py-3 space-y-2">
                    {/* Quick select */}
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "Khách nợ quá nhiều, chưa thanh toán",
                        "Giá bán sai định mức — bán dưới giá vốn",
                        "Vượt hạn mức tín dụng",
                        "Đơn hàng nghi ngờ",
                      ].map(r => (
                        <button key={r}
                          onClick={() => setRejectReason(r)}
                          className="text-[9px] px-2 py-1 rounded-lg font-bold"
                          style={{
                            background: reject_reason === r ? "#7f1d1d" : "#1e293b",
                            color:      reject_reason === r ? "#fca5a5" : "#64748b",
                          }}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea value={reject_reason}
                      onChange={e => setRejectReason(e.target.value)}
                      placeholder="Hoặc nhập lý do tùy chỉnh..."
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                    <div className="flex gap-2">
                      <button onClick={() => setAction(null)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ background: "#1e293b", color: "#64748b" }}>
                        Huỷ
                      </button>
                      <button onClick={handle_tu_choi}
                        disabled={!reject_reason.trim() || loading}
                        className="flex-1 py-2 rounded-xl text-xs font-black disabled:opacity-40"
                        style={{ background: "#7f1d1d", color: "#fca5a5" }}>
                        Xác nhận từ chối
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirm rủi ro */}
              {confirm_risk && (
                <div className="rounded-xl p-4"
                  style={{ background: "#78350f20", border: "1px solid #f59e0b40" }}>
                  <div className="flex items-start gap-2 mb-3">
                    <AlertTriangle size={14} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
                    <p className="text-xs font-bold" style={{ color: "#f59e0b" }}>
                      Đơn hàng này có rủi ro tài chính cao — bạn vẫn muốn duyệt?
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmRisk(false)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold"
                      style={{ background: "#1e293b", color: "#64748b" }}>
                      Xem lại
                    </button>
                    <button onClick={() => { setConfirmRisk(false); do_action("duyet"); }}
                      className="flex-1 py-2 rounded-xl text-xs font-black"
                      style={{ background: "#78350f", color: "#fde68a" }}>
                      Vẫn duyệt — chấp nhận rủi ro
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── Cột phải: Thẩm định tài chính ── */}
            <div className="px-5 py-5 space-y-4 flex-shrink-0">
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                Thẩm định tài chính
              </p>

              {/* Tình trạng nợ */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${ci.is_risk ? "#ef444430" : "#1e293b"}`,
                  background: ci.is_risk ? "#7f1d1d10" : "#0f172a" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{ borderColor: ci.is_risk ? "#ef444430" : "#1e293b" }}>
                  {ci.is_risk
                    ? <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                    : <ShieldCheck   size={12} style={{ color: "#10b981" }} />}
                  <p className="text-[10px] font-black uppercase"
                    style={{ color: ci.is_risk ? "#ef4444" : "#10b981" }}>
                    {ci.is_risk ? "⚠️ Cảnh báo tín dụng" : "✅ Tín dụng tốt"}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: "Tổng nợ hiện tại",   val: ci.current_debt,
                      mau: ci.current_debt > ci.credit_limit ? "#ef4444" : "#94a3b8",
                      warn: ci.current_debt > ci.credit_limit ? "⚠️ Vượt hạn mức" : "" },
                    { label: "Hạn mức tín dụng",   val: ci.credit_limit, mau: "#64748b" },
                    { label: "Nợ quá hạn",          val: ci.overdue_amount,
                      mau: ci.overdue_days > 0 ? "#ef4444" : "#10b981",
                      warn: ci.overdue_days > 0 ? `Quá hạn ${ci.overdue_days} ngày` : "Không có" },
                  ].map(({ label, val, mau, warn }) => (
                    <div key={label}>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px]" style={{ color: "#64748b" }}>{label}</p>
                        <p className="text-[11px] font-black text-right"
                          style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                          {fmt_short(val)}đ
                        </p>
                      </div>
                      {warn && warn !== "Không có" && (
                        <p className="text-[9px] text-right font-bold mt-0.5"
                          style={{ color: "#ef4444" }}>
                          {warn}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Biên lợi nhuận */}
              <div className="rounded-xl overflow-hidden"
                style={{ border: `1px solid ${pi.is_loss ? "#ef444430" : pi.is_low_margin ? "#f59e0b30" : "#1e293b"}`,
                  background: pi.is_loss ? "#7f1d1d10" : pi.is_low_margin ? "#78350f10" : "#0f172a" }}>
                <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                  style={{ borderColor: pi.is_loss ? "#ef444430" : pi.is_low_margin ? "#f59e0b30" : "#1e293b" }}>
                  <TrendingDown size={12}
                    style={{ color: pi.is_loss ? "#ef4444" : pi.is_low_margin ? "#f59e0b" : "#10b981" }} />
                  <p className="text-[10px] font-black uppercase"
                    style={{ color: pi.is_loss ? "#ef4444" : pi.is_low_margin ? "#f59e0b" : "#10b981" }}>
                    {pi.is_loss ? "🚨 Bán dưới giá vốn!" : pi.is_low_margin ? "⚠️ Biên lợi nhuận thấp" : "✅ Lợi nhuận tốt"}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2.5">
                  {[
                    { label: "Doanh thu (chưa VAT)", val: order.total_amount,    mau: "#38bdf8" },
                    { label: "Giá vốn định mức",     val: pi.estimated_cost,     mau: "#f97316" },
                    { label: "Lợi nhuận gộp",        val: pi.margin_amount,
                      mau: pi.is_loss ? "#ef4444" : "#10b981" },
                  ].map(({ label, val, mau }) => (
                    <div key={label} className="flex justify-between">
                      <p className="text-[10px]" style={{ color: "#64748b" }}>{label}</p>
                      <p className="text-[11px] font-black"
                        style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                        {pi.is_loss && label === "Lợi nhuận gộp" ? "−" : ""}
                        {fmt_short(Math.abs(val))}đ
                      </p>
                    </div>
                  ))}
                  {/* Progress bar biên lãi */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-[9px]" style={{ color: "#334155" }}>
                        Ngưỡng tối thiểu: {MIN_MARGIN_THRESHOLD}%
                      </p>
                      <p className="text-[11px] font-black"
                        style={{ color: pi.is_loss ? "#ef4444" : pi.is_low_margin ? "#f59e0b" : "#10b981" }}>
                        {pi.margin_percent.toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(100, pi.margin_percent))}%`,
                          background: pi.is_loss ? "#ef4444" : pi.is_low_margin ? "#f59e0b" : "#10b981",
                        }} />
                    </div>
                    {/* Ngưỡng marker */}
                    <div className="relative mt-0.5">
                      <div className="absolute top-0 w-px h-2"
                        style={{ left: `${MIN_MARGIN_THRESHOLD}%`, background: "#475569" }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cảnh báo nổi bật nếu bán dưới giá vốn */}
              {pi.is_loss && (
                <div className="flex items-start gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "#7f1d1d30", border: "1px solid #ef4444" }}>
                  <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <p className="text-xs font-black" style={{ color: "#fca5a5" }}>
                    Đơn hàng đang bán lỗ {fmt_short(Math.abs(pi.margin_amount))}đ!
                    Cần xác nhận lại giá với Sales trước khi duyệt.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {!is_locked && !action && !confirm_risk && (
          <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: "#1e293b", background: "#0a1628" }}>
            <button onClick={() => setAction("tu_choi")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
              <X size={14} /> Từ chối
            </button>
            <div className="flex-1" />
            <button onClick={handle_duyet} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
              style={{
                background: has_risk ? "#78350f20" : "#06472520",
                color:      has_risk ? "#fde68a"   : "#10b981",
                border:     `1px solid ${has_risk ? "#f59e0b40" : "#10b98140"}`,
              }}>
              <Check size={14} />
              {has_risk ? "Duyệt (có rủi ro)" : "Duyệt — Chuyển xuống kho"}
            </button>
          </div>
        )}
        {is_locked && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-t"
            style={{ borderColor: "#1e293b" }}>
            {order.approval_status === "da_duyet"
              ? <><Check size={13} style={{ color: "#10b981" }} />
                  <p className="text-xs font-bold" style={{ color: "#10b981" }}>
                    Đã duyệt bởi {order.approved_by} · {order.approved_at && fmt_ngay(order.approved_at.split("T")[0])}
                  </p></>
              : <><X size={13} style={{ color: "#ef4444" }} />
                  <p className="text-xs font-bold" style={{ color: "#ef4444" }}>
                    Đã từ chối · {order.reject_reason}
                  </p></>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

export default function Tab30OrderApproval() {
  const [orders,   setOrders]   = useState<OrderApproval[]>(MOCK_ORDER_APPROVALS);
  const [selected, setSelected] = useState<OrderApproval | null>(null);
  const [search,   setSearch]   = useState("");
  const [fil_sp,   setFilSp]    = useState("");
  const [fil_risk, setFilRisk]  = useState<RiskLevel | "">("");
  const [fil_status, setFilStatus] = useState<OrderApproval["approval_status"] | "">("");

  const sales_persons = [...new Set(orders.map(o => o.sales_person))];

  const filtered = orders.filter(o => {
    if (search && !o.order_code.toLowerCase().includes(search.toLowerCase())
      && !o.customer_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (fil_sp     && o.sales_person !== fil_sp)          return false;
    if (fil_risk   && o.risk_level !== fil_risk)           return false;
    if (fil_status && o.approval_status !== fil_status)    return false;
    return true;
  });

  // KPI
  const cho_duyet  = orders.filter(o => o.approval_status === "cho_duyet");
  const rui_ro_cao = cho_duyet.filter(o => o.risk_level === "rui_ro_cao");
  const ban_lo     = cho_duyet.filter(o => o.profit_info.is_loss);

  const handle_done = () => setOrders([...MOCK_ORDER_APPROVALS]);

  return (
    <div className="flex flex-col h-full">

      {/* KPI */}
      <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        {[
          { label: "Chờ duyệt",       val: cho_duyet.length,  mau: "#f59e0b", unit: "đơn",
            sub: `${fmt_short(cho_duyet.reduce((s,o)=>s+o.total_amount,0))}đ` },
          { label: "Rủi ro cao",      val: rui_ro_cao.length, mau: "#ef4444", unit: "đơn",
            sub: "Nợ quá hạn / Vượt hạn mức" },
          { label: "Bán dưới giá vốn", val: ban_lo.length,    mau: "#ef4444", unit: "đơn",
            sub: "Cần xác nhận giá với Sales" },
          { label: "Đã xử lý hôm nay", val: orders.filter(o => o.approval_status !== "cho_duyet").length,
            mau: "#10b981", unit: "đơn", sub: "Duyệt + Từ chối" },
        ].map(({ label, val, mau, unit, sub }) => (
          <div key={label} className="px-4 py-3 rounded-xl"
            style={{ background: "#0f172a", border: `1px solid ${val > 0 && mau === "#ef4444" ? "#ef444430" : "#1e293b"}` }}>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#334155" }}>
              {label}
            </p>
            <p className="text-2xl font-black" style={{ color: mau }}>
              {val} <span className="text-sm" style={{ color: "#475569" }}>{unit}</span>
            </p>
            <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm mã SO, tên khách..."
          className="px-3 py-1.5 rounded-xl text-xs outline-none w-48"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "white" }} />

        <select value={fil_sp} onChange={e => setFilSp(e.target.value)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
          <option value="">Tất cả Sales</option>
          {sales_persons.map(sp => <option key={sp} value={sp}>{sp}</option>)}
        </select>

        <select value={fil_risk} onChange={e => setFilRisk(e.target.value as any)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
          <option value="">Tất cả rủi ro</option>
          <option value="an_toan">✅ An toàn</option>
          <option value="canh_bao">⚠️ Cảnh báo</option>
          <option value="rui_ro_cao">🚨 Rủi ro cao</option>
        </select>

        <select value={fil_status} onChange={e => setFilStatus(e.target.value as any)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
          <option value="">Tất cả trạng thái</option>
          <option value="cho_duyet">Chờ duyệt</option>
          <option value="da_duyet">Đã duyệt</option>
          <option value="tu_choi">Từ chối</option>
        </select>

        <p className="text-[10px]" style={{ color: "#334155" }}>
          {filtered.length} đơn hàng
        </p>
      </div>

      {/* Bảng */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="grid items-center px-6 py-2 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "110px 160px 120px 110px 120px 90px 80px 100px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <span>Mã SO</span>
          <span>Khách hàng</span>
          <span>Sales</span>
          <span className="text-right">Giá trị đơn</span>
          <span>Tình trạng nợ</span>
          <span className="text-right">Biên LN</span>
          <span className="text-center">Rủi ro</span>
          <span className="text-center">Thao tác</span>
        </div>

        {filtered.map((o, i) => {
          const risk_cfg   = RISK_CONFIG[o.risk_level];
          const status_cfg = STATUS_CONFIG[o.approval_status];
          const RiskIcon   = risk_cfg.icon;
          const is_cho     = o.approval_status === "cho_duyet";

          return (
            <div key={o.order_id}
              className="grid items-center px-6 py-3 gap-2 cursor-pointer hover:bg-slate-800/20 transition-colors"
              style={{
                gridTemplateColumns: "110px 160px 120px 110px 120px 90px 80px 100px",
                borderBottom: "1px solid #0f172a",
                background: i % 2 === 0 ? "transparent" : "#0f172a40",
                borderLeft: `3px solid ${o.risk_level === "rui_ro_cao" ? "#ef4444" : o.risk_level === "canh_bao" ? "#f59e0b" : "transparent"}`,
              }}
              onClick={() => setSelected(o)}>

              <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                {o.order_code}
              </code>

              <p className="text-xs font-bold text-white truncate">{o.customer_name}</p>

              <div className="flex items-center gap-1 min-w-0">
                <User size={10} style={{ color: "#334155", flexShrink: 0 }} />
                <p className="text-[10px] truncate" style={{ color: "#64748b" }}>
                  {o.sales_person.split(" ").slice(-1)[0]}
                </p>
              </div>

              <p className="text-sm font-black text-right"
                style={{ color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                {fmt_short(o.total_amount)}đ
              </p>

              {/* Tình trạng nợ */}
              <div>
                {o.credit_info.overdue_days > 0 ? (
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={10} style={{ color: "#ef4444" }} />
                    <p className="text-[10px] font-bold" style={{ color: "#ef4444" }}>
                      Quá hạn {o.credit_info.overdue_days}ng
                    </p>
                  </div>
                ) : o.credit_info.current_debt > o.credit_info.credit_limit ? (
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={10} style={{ color: "#f59e0b" }} />
                    <p className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>
                      Vượt hạn mức
                    </p>
                  </div>
                ) : (
                  <p className="text-[10px] font-bold" style={{ color: "#10b981" }}>
                    ✓ Trong hạn
                  </p>
                )}
              </div>

              {/* Biên lợi nhuận */}
              <p className="text-sm font-black text-right"
                style={{
                  color: o.profit_info.is_loss ? "#ef4444"
                    : o.profit_info.is_low_margin ? "#f59e0b" : "#10b981",
                  fontVariantNumeric: "tabular-nums",
                }}>
                {o.profit_info.margin_percent.toFixed(1)}%
              </p>

              {/* Risk badge */}
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                  style={{ background: risk_cfg.nen, color: risk_cfg.mau }}>
                  <RiskIcon size={8} />
                  {risk_cfg.label}
                </span>
              </div>

              {/* Thao tác nhanh */}
              <div className="flex items-center gap-1 justify-center"
                onClick={e => e.stopPropagation()}>
                {is_cho ? (
                  <>
                    <button onClick={() => {
                      const idx = MOCK_ORDER_APPROVALS.findIndex(x => x.order_id === o.order_id);
                      if (idx >= 0) MOCK_ORDER_APPROVALS[idx].approval_status = "da_duyet";
                      handle_done();
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                    style={{ background: "#06472520", color: "#10b981" }}
                    title="Duyệt nhanh">
                      <Check size={12} />
                    </button>
                    <button onClick={() => setSelected(o)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80"
                      style={{ background: "#7f1d1d20", color: "#ef4444" }}
                      title="Từ chối — cần nhập lý do">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: status_cfg.nen, color: status_cfg.mau }}>
                    {status_cfg.label}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <OrderDetailModal
          order={selected}
          onClose={() => setSelected(null)}
          onDone={handle_done} />
      )}
    </div>
  );
}