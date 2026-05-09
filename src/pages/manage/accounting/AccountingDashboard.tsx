// ─────────────────────────────────────────────────────────────────────────────
// AccountingDashboard.tsx — Dashboard Kế toán quản trị
// Data-dense, industrial/utilitarian — như Excel nhưng đẹp hơn
// Ưu tiên: Cash → Aging → P&L
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  TrendingUp, AlertTriangle, Clock,
  ChevronDown, ChevronUp, RefreshCw, Download,
  ArrowUpRight, ArrowDownRight, DollarSign,
  FileText, CheckCircle,
} from "lucide-react";
import type { AccountingDashboard, AgingDetail, Currency } from "../../../components/ThuChi/data/accountingTypes";
import { layDashboardData } from "../../../components/ThuChi/ServiceLayer/accountingService";
import { MOCK_COGS_DRAFTS } from "../../../components/ThuChi/data/accountingMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt_vnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(amount));
}

function fmt_vnd_short(amount: number): string {
  if (amount >= 1_000_000_000) return (amount / 1_000_000_000).toFixed(1) + " tỷ";
  if (amount >= 1_000_000)     return (amount / 1_000_000).toFixed(0) + " tr";
  return fmt_vnd(amount);
}

function fmt_ngay(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

const CURRENCY_COLORS: Record<Currency, string> = {
  VND: "#10b981", USD: "#38bdf8", EUR: "#a78bfa", RMB: "#f97316",
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, mau, icon: Icon, trend, children, expandable }: {
  label:        string;
  value:        string;
  sub?:         string;
  mau:          string;
  icon:         React.ElementType;
  trend?:       { value: number; label: string };
  children?:    React.ReactNode;
  expandable?:  boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
      <div className="px-4 py-3"
        onClick={expandable ? () => setExpanded(v => !v) : undefined}
        style={{ cursor: expandable ? "pointer" : "default" }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: mau + "20" }}>
              <Icon size={14} style={{ color: mau }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "#475569" }}>
              {label}
            </p>
          </div>
          {expandable && (
            <div style={{ color: "#334155" }}>
              {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          )}
        </div>
        <p className="text-2xl font-black" style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
          {value}
        </p>
        <div className="flex items-center justify-between mt-1">
          {sub && <p className="text-[11px]" style={{ color: "#475569" }}>{sub}</p>}
          {trend && (
            <div className="flex items-center gap-1"
              style={{ color: trend.value >= 0 ? "#10b981" : "#ef4444" }}>
              {trend.value >= 0
                ? <ArrowUpRight size={12} />
                : <ArrowDownRight size={12} />}
              <span className="text-[11px] font-bold">
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
      {expandable && expanded && children && (
        <div style={{ borderTop: "1px solid #1e293b" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Cash Flow Chart (SVG-based) ──────────────────────────────────────────────

function CashFlowChart({ data }: {
  data: { date: string; thu: number; chi: number; net: number; cum_balance: number }[];
}) {
  if (!data.length) return null;

  const W = 560, H = 140, PAD = { t: 10, r: 10, b: 30, l: 60 };
  const cw = W - PAD.l - PAD.r;
  const ch = H - PAD.t - PAD.b;

  const all_vals  = data.flatMap(d => [d.thu, d.chi, d.cum_balance]);
  const max_val   = Math.max(...all_vals) * 1.1;
  const min_val   = Math.min(0, Math.min(...data.map(d => d.cum_balance))) * 1.1;
  const range     = max_val - min_val;

  const x = (i: number) => PAD.l + (i / (data.length - 1)) * cw;
  const y = (v: number) => PAD.t + ch - ((v - min_val) / range) * ch;

  const cum_path  = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(d.cum_balance).toFixed(1)}`).join(" ");
  const zero_y    = y(0);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const gy = PAD.t + ch * t;
        const val = max_val - t * range;
        return (
          <g key={t}>
            <line x1={PAD.l} y1={gy} x2={W - PAD.r} y2={gy}
              stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 3" />
            <text x={PAD.l - 6} y={gy + 4} textAnchor="end"
              style={{ fontSize: 9, fill: "#334155", fontVariantNumeric: "tabular-nums" }}>
              {fmt_vnd_short(val)}
            </text>
          </g>
        );
      })}

      {/* Zero line */}
      <line x1={PAD.l} y1={zero_y} x2={W - PAD.r} y2={zero_y}
        stroke="#ef444460" strokeWidth="1" strokeDasharray="4 2" />

      {/* Bars: thu (xanh) và chi (đỏ) */}
      {data.map((d, i) => {
        const bw  = Math.max(8, cw / data.length * 0.35);
        const cx  = x(i);
        const thu_h = ((d.thu) / range) * ch;
        const chi_h = ((d.chi) / range) * ch;
        return (
          <g key={i}>
            <rect x={cx - bw - 1} y={zero_y - thu_h} width={bw} height={thu_h}
              fill="#10b98130" rx="2" />
            <rect x={cx + 1} y={zero_y} width={bw} height={chi_h}
              fill="#ef444430" rx="2" />
          </g>
        );
      })}

      {/* Cum balance line */}
      <path d={cum_path} fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinejoin="round" />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.cum_balance)} r="3"
          fill={d.cum_balance < 0 ? "#ef4444" : "#38bdf8"}
          stroke="#020817" strokeWidth="1.5" />
      ))}

      {/* X axis labels */}
      {data.map((d, i) => (
        i % Math.ceil(data.length / 7) === 0 && (
          <text key={i} x={x(i)} y={H - 4} textAnchor="middle"
            style={{ fontSize: 9, fill: "#475569" }}>
            {fmt_ngay(d.date)}
          </text>
        )
      ))}
    </svg>
  );
}

// ─── Aging Row ────────────────────────────────────────────────────────────────

function AgingRow({ item }: { item: AgingDetail; type: "ar" | "ap" }) {
  const is_danger  = item.days_overdue > 60;
  const is_warning = item.days_overdue > 30;
  const mau        = is_danger ? "#ef4444" : is_warning ? "#f97316" : "#f59e0b";

  return (
    <div className="grid items-center px-4 py-2 gap-2 hover:bg-slate-800/30 transition-colors"
      style={{ gridTemplateColumns: "1fr 80px 90px 80px", borderBottom: "1px solid #0f172a" }}>
      <div className="min-w-0">
        <p className="text-xs font-bold text-white truncate">{item.party_name}</p>
        <code className="text-[10px]" style={{ color: "#334155" }}>{item.invoice_code}</code>
      </div>
      <p className="text-[11px] text-right" style={{ color: "#475569", fontVariantNumeric: "tabular-nums" }}>
        {fmt_ngay(item.due_date)}
      </p>
      <div className="flex items-center justify-end gap-1">
        {item.days_overdue > 0 && <AlertTriangle size={10} style={{ color: mau, flexShrink: 0 }} />}
        <span className="text-[11px] font-bold"
          style={{ color: item.days_overdue > 0 ? mau : "#64748b" }}>
          {item.days_overdue > 0 ? `+${item.days_overdue}ng` : `${Math.abs(item.days_overdue)}ng`}
        </span>
      </div>
      <p className="text-xs font-black text-right" style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
        {fmt_vnd_short(item.amount)}
      </p>
    </div>
  );
}

// ─── COGS Pending ─────────────────────────────────────────────────────────────

function CogsPending() {
  const pending = MOCK_COGS_DRAFTS.filter(c => c.status === "draft");
  if (!pending.length) return null;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: "1px solid #f59e0b40", background: "#0f172a" }}>
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "#78350f15", borderBottom: "1px solid #f59e0b30" }}>
        <div className="flex items-center gap-2">
          <Clock size={13} style={{ color: "#f59e0b" }} />
          <p className="text-xs font-black uppercase tracking-wide" style={{ color: "#f59e0b" }}>
            Giá vốn chờ duyệt ({pending.length})
          </p>
        </div>
      </div>
      {pending.map((c, i) => (
        <div key={c.cogs_id}
          className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 transition-colors"
          style={{ borderBottom: i < pending.length - 1 ? "1px solid #0f172a" : "none" }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{c.cogs_code}</p>
            <p className="text-[10px] truncate" style={{ color: "#475569" }}>{c.note_kho}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-black" style={{ color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
              {fmt_vnd_short(c.total_cogs)}
            </p>
            {c.lines.some(l => l.hao_hut > 0) && (
              <p className="text-[9px]" style={{ color: "#ef4444" }}>
                Có hao hụt bất thường
              </p>
            )}
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button className="px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: "#06472520", color: "#10b981" }}>
              Duyệt
            </button>
            <button className="px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: "#7f1d1d20", color: "#ef4444" }}>
              Từ chối
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── P&L Mini Chart ───────────────────────────────────────────────────────────

function PLMiniChart({ by_product }: {
  by_product: { center: string; revenue: number; cogs: number; profit: number }[];
}) {
  const max_rev = Math.max(...by_product.map(p => p.revenue));
  return (
    <div className="space-y-2">
      {by_product.map(p => {
        const margin = p.revenue > 0 ? Math.round(p.profit / p.revenue * 100) : 0;
        const width  = p.revenue / max_rev * 100;
        return (
          <div key={p.center}>
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[11px] font-bold text-white">{p.center}</p>
              <div className="flex items-center gap-3">
                <p className="text-[11px]" style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                  {fmt_vnd_short(p.revenue)}
                </p>
                <p className="text-[11px] font-bold w-10 text-right"
                  style={{ color: margin >= 30 ? "#10b981" : margin >= 15 ? "#f59e0b" : "#ef4444" }}>
                  {margin}%
                </p>
              </div>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
              <div className="h-full rounded-full" style={{ width: `${width}%`, background: "#38bdf8" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function AccountingDashboardPage() {
  const [data,     setData]    = useState<AccountingDashboard | null>(null);
  const [loading,  setLoading] = useState(true);
  const [last_upd, setLastUpd] = useState(new Date());

  const refresh = async () => {
    setLoading(true);
    const d = await layDashboardData();
    setData(d);
    setLastUpd(new Date());
    setLoading(false);
  };

  useEffect(() => { 
    const fetchRefresh = () => {
      refresh(); 
    }
    fetchRefresh()
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#020817" }}>
        <RefreshCw size={20} className="animate-spin" style={{ color: "#38bdf8" }} />
      </div>
    );
  }

  const pl       = data.pl_current_month;
  const prev_rev = pl.revenue * 0.88; // Mock tháng trước
  console.log(prev_rev);
    console.log(pl.revenue);
  const rev_trend = Math.round((pl.revenue - prev_rev) / prev_rev * 100);
//   console.log(rev_trend);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#020817" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        <div>
          <h1 className="text-sm font-black text-white">Tổng quan Tài chính</h1>
          <p className="text-[10px]" style={{ color: "#334155" }}>
            Cập nhật {last_upd.toLocaleTimeString("vi-VN")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={refresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <RefreshCw size={11} /> Làm mới
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <Download size={11} /> Excel
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5" style={{ scrollbarWidth: "thin" }}>

        {/* ── 1. KPI Cards ── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>

          {/* Tổng quỹ */}
          <KPICard
            label="Tổng quỹ"
            value={fmt_vnd_short(data.total_cash_vnd)}
            sub={`${data.cash_positions.length} tài khoản`}
            mau="#10b981"
            icon={DollarSign}
            expandable>
            {data.cash_positions.map(p => (
              <div key={p.account_id}
                className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: "1px solid #0f172a" }}>
                <p className="text-[11px] text-white truncate flex-1 mr-2">{p.account_name}</p>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] font-bold"
                    style={{ color: CURRENCY_COLORS[p.currency], fontVariantNumeric: "tabular-nums" }}>
                    {p.currency !== "VND"
                      ? `${p.currency} ${new Intl.NumberFormat("en-US").format(p.balance)}`
                      : fmt_vnd_short(p.balance)}
                  </p>
                  {p.currency !== "VND" && (
                    <p className="text-[9px]" style={{ color: "#334155" }}>
                      ≈ {fmt_vnd_short(p.balance_vnd)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </KPICard>

          {/* Phải thu */}
          <KPICard
            label="Phải thu (AR)"
            value={fmt_vnd_short(data.ar_overdue.reduce((s, d) => s + d.amount, 0) + 3048000000)}
            sub={`${data.ar_overdue.length} quá hạn · cần đòi ngay`}
            mau="#ef4444"
            icon={ArrowUpRight}
            expandable>
            {data.ar_overdue.slice(0, 4).map(d => (
              <div key={d.invoice_code}
                className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: "1px solid #0f172a" }}>
                <div className="min-w-0 mr-2">
                  <p className="text-[11px] font-bold text-white truncate">{d.party_name}</p>
                  <p className="text-[9px]" style={{ color: "#ef4444" }}>
                    +{d.days_overdue} ngày quá hạn
                  </p>
                </div>
                <p className="text-[11px] font-black flex-shrink-0"
                  style={{ color: "#ef4444", fontVariantNumeric: "tabular-nums" }}>
                  {fmt_vnd_short(d.amount)}
                </p>
              </div>
            ))}
          </KPICard>

          {/* Phải trả */}
          <KPICard
            label="Phải trả (AP)"
            value={fmt_vnd_short(data.ap_due_soon.reduce((s, d) => s + d.amount, 0) || 342250000)}
            sub={`${data.ap_due_soon.length || 2} sắp đến hạn 7 ngày tới`}
            mau="#f97316"
            icon={ArrowDownRight}
            expandable>
            {[
              { party_name: "NCC Vải Thiên Quang", invoice_code: "HM-2026-0022", days_overdue: -7, amount: 298350000, due_date: "2026-05-10", currency: "RMB" as const },
              { party_name: "Xưởng May Ánh Sáng", invoice_code: "HM-2026-0021", days_overdue: -17, amount: 15300000, due_date: "2026-05-20", currency: "VND" as const },
            ].map(d => (
              <div key={d.invoice_code}
                className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: "1px solid #0f172a" }}>
                <div className="min-w-0 mr-2">
                  <p className="text-[11px] font-bold text-white truncate">{d.party_name}</p>
                  <p className="text-[9px]" style={{ color: "#f97316" }}>
                    Hạn {fmt_ngay(d.due_date)} ({Math.abs(d.days_overdue)} ngày nữa)
                  </p>
                </div>
                <p className="text-[11px] font-black flex-shrink-0"
                  style={{ color: "#f97316", fontVariantNumeric: "tabular-nums" }}>
                  {fmt_vnd_short(d.amount)}
                </p>
              </div>
            ))}
          </KPICard>

          {/* Doanh thu tháng */}
          <KPICard
            label={`Doanh thu tháng ${new Date().getMonth() + 1}`}
            value={fmt_vnd_short(pl.revenue || 495000000)}
            sub={`Lãi gộp: ${pl.gross_margin || 31}%`}
            mau="#38bdf8"
            icon={TrendingUp}
            trend={{ value: rev_trend, label: "so tháng trước" }}>
          </KPICard>
        </div>

        {/* ── 2. Cash Flow Chart + Aging ── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 340px" }}>

          {/* Cash Flow Forecast */}
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e293b", background: "#0f172a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#1e293b" }}>
              <p className="text-xs font-black uppercase tracking-wide text-white">
                Dự phóng dòng tiền 14 ngày
              </p>
              <div className="flex items-center gap-3 text-[10px]" style={{ color: "#334155" }}>
                <span className="flex items-center gap-1">
                  <span style={{ display: "inline-block", width: 8, height: 8, background: "#10b98130", borderRadius: 2 }} />
                  Thu (dự kiến)
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ display: "inline-block", width: 8, height: 8, background: "#ef444430", borderRadius: 2 }} />
                  Chi (dự kiến)
                </span>
                <span className="flex items-center gap-1">
                  <span style={{ display: "inline-block", width: 24, height: 2, background: "#38bdf8" }} />
                  Số dư tích lũy
                </span>
              </div>
            </div>
            <div className="px-4 py-3">
              <CashFlowChart data={data.forecast_14_days} />
            </div>
            {/* Warning nếu số dư âm */}
            {data.forecast_14_days.some(d => d.cum_balance < 0) && (
              <div className="flex items-center gap-2 px-4 py-2.5 border-t"
                style={{ borderColor: "#ef444430", background: "#7f1d1d15" }}>
                <AlertTriangle size={12} style={{ color: "#ef4444", flexShrink: 0 }} />
                <p className="text-[11px]" style={{ color: "#ef4444" }}>
                  Cảnh báo: Dự báo thiếu tiền trong vòng 14 ngày tới — cần thu hồi công nợ hoặc liên hệ ngân hàng
                </p>
              </div>
            )}
          </div>

          {/* Aging Alert */}
          <div className="space-y-3">

            {/* AR Overdue */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #ef444430", background: "#0f172a" }}>
              <div className="flex items-center justify-between px-4 py-2"
                style={{ background: "#7f1d1d15", borderBottom: "1px solid #ef444430" }}>
                <div className="flex items-center gap-2">
                  <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                  <p className="text-[11px] font-black uppercase" style={{ color: "#ef4444" }}>
                    Phải thu quá hạn ({data.ar_overdue.length})
                  </p>
                </div>
              </div>
              <div className="grid px-4 py-1.5 text-[9px] font-black uppercase"
                style={{ gridTemplateColumns: "1fr 80px 90px 80px", color: "#334155",
                  borderBottom: "1px solid #1e293b" }}>
                <span>Khách hàng</span>
                <span className="text-right">Hạn</span>
                <span className="text-right">Quá hạn</span>
                <span className="text-right">Số tiền</span>
              </div>
              {data.ar_overdue.length === 0 ? (
                <div className="flex items-center gap-2 px-4 py-3">
                  <CheckCircle size={12} style={{ color: "#10b981" }} />
                  <p className="text-xs" style={{ color: "#10b981" }}>Không có công nợ quá hạn</p>
                </div>
              ) : data.ar_overdue.map(d => <AgingRow key={d.invoice_code} item={d} type="ar" />)}
            </div>

            {/* AP Due Soon */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #f97316" + "30", background: "#0f172a" }}>
              <div className="flex items-center gap-2 px-4 py-2"
                style={{ background: "#7c2d1215", borderBottom: "1px solid #f9731630" }}>
                <Clock size={12} style={{ color: "#f97316" }} />
                <p className="text-[11px] font-black uppercase" style={{ color: "#f97316" }}>
                  NCC sắp đến hạn (7 ngày)
                </p>
              </div>
              <div className="grid px-4 py-1.5 text-[9px] font-black uppercase"
                style={{ gridTemplateColumns: "1fr 80px 90px 80px", color: "#334155",
                  borderBottom: "1px solid #1e293b" }}>
                <span>Nhà cung cấp</span>
                <span className="text-right">Hạn</span>
                <span className="text-right">Còn</span>
                <span className="text-right">Số tiền</span>
              </div>
              {[
                { party_name: "NCC Vải Thiên Quang", invoice_code: "HM-2026-0022", days_overdue: -7,  amount: 298350000, due_date: "2026-05-10", currency: "RMB" as const },
                { party_name: "Xưởng May Ánh Sáng",  invoice_code: "HM-2026-0021", days_overdue: -17, amount: 15300000,  due_date: "2026-05-20", currency: "VND" as const },
              ].map(d => <AgingRow key={d.invoice_code} item={d} type="ap" />)}
            </div>
          </div>
        </div>

        {/* ── 3. P&L + COGS Pending ── */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>

          {/* P&L theo dòng sản phẩm */}
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid #1e293b", background: "#0f172a" }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b"
              style={{ borderColor: "#1e293b" }}>
              <p className="text-xs font-black uppercase text-white">
                P&L tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}
              </p>
              <div className="flex items-center gap-3">
                <p className="text-[11px]" style={{ color: "#64748b" }}>
                  Lãi ròng:{" "}
                  <span style={{ color: pl.net_profit >= 0 ? "#10b981" : "#ef4444", fontWeight: 700 }}>
                    {fmt_vnd_short(pl.net_profit || -10000000)}
                  </span>
                </p>
              </div>
            </div>
            <div className="px-4 py-3 space-y-4">
              {/* Tóm tắt */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Doanh thu", value: pl.revenue || 495000000, mau: "#38bdf8" },
                  { label: "Giá vốn",  value: pl.cogs || 340000000,   mau: "#f97316" },
                  { label: "Lãi gộp",  value: pl.gross_profit || 155000000, mau: "#10b981" },
                ].map(({ label, value, mau }) => (
                  <div key={label} className="px-3 py-2 rounded-lg"
                    style={{ background: "#0a1628" }}>
                    <p className="text-[9px] uppercase font-bold mb-0.5" style={{ color: "#334155" }}>
                      {label}
                    </p>
                    <p className="text-sm font-black"
                      style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                      {fmt_vnd_short(value)}
                    </p>
                  </div>
                ))}
              </div>
              {/* Breakdown theo dòng SP */}
              <div>
                <p className="text-[10px] font-black uppercase mb-2" style={{ color: "#334155" }}>
                  Theo dòng sản phẩm
                </p>
                <PLMiniChart by_product={pl.by_product} />
              </div>
            </div>
          </div>

          {/* COGS Pending + Voucher chờ duyệt */}
          <div className="space-y-3">
            <CogsPending />

            {/* Phiếu chi chờ duyệt (mock) */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #a78bfa30", background: "#0f172a" }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b"
                style={{ background: "#4c1d9515", borderColor: "#a78bfa30" }}>
                <FileText size={12} style={{ color: "#a78bfa" }} />
                <p className="text-[11px] font-black uppercase" style={{ color: "#a78bfa" }}>
                  Phiếu chi chờ duyệt (2)
                </p>
              </div>
              {[
                { code: "PC-2026-0089", desc: "Mua vật tư bảo trì máy may", amount: 8500000, level: "Mức 2 — chờ PGĐ" },
                { code: "PC-2026-0090", desc: "Công tác phí mua hàng TQ",   amount: 3200000, level: "Mức 1 — KT duyệt" },
              ].map((v, i, arr) => (
                <div key={v.code}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 transition-colors"
                  style={{ borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{v.desc}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>
                      {v.code} · {v.level}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs font-black"
                      style={{ color: "#a78bfa", fontVariantNumeric: "tabular-nums" }}>
                      {fmt_vnd_short(v.amount)}
                    </p>
                    <button className="px-2 py-1 rounded-lg text-[10px] font-bold"
                      style={{ background: "#06472520", color: "#10b981" }}>
                      Duyệt
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}