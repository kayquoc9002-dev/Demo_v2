// ─────────────────────────────────────────────────────────────────────────────
// Tab33PnL.tsx — Màn hình 3.3: P&L Dashboard (Kết quả kinh doanh)
// Read-only · Filter tháng/năm · Nút Khóa sổ
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Lock, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Info,
  AlertCircle,
} from "lucide-react";
import type { PLReport } from "../data/revenueTypes";
import { MOCK_PL_CURRENT, MOCK_PL_LOCKED } from "../data/revenueMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}
function fmt_short(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + " tỷ";
  if (Math.abs(n) >= 1_000_000)     return (n / 1_000_000).toFixed(0) + " tr";
  return fmt(n);
}
function pct_thay_doi(cur: number, prev: number): number {
  if (prev === 0) return 0;
  return Math.round((cur - prev) / Math.abs(prev) * 100);
}

// ─── P&L Line Row ─────────────────────────────────────────────────────────────

function PLLineRow({ label, value, mau, is_subtotal, indent = 0, prev_value }: {
  label:       string;
  value:       number;
  mau?:        string;
  is_subtotal?: boolean;
  indent?:     number;
  prev_value?: number;
}) {
  const change_pct = prev_value !== undefined ? pct_thay_doi(value, prev_value) : null;

  return (
    <div className="flex items-center justify-between py-2.5 px-4"
      style={{
        paddingLeft: 16 + indent * 20,
        borderTop:   is_subtotal ? "1px solid #1e293b" : "none",
        borderBottom: is_subtotal ? "1px solid #1e293b" : "1px solid #0f172a",
        background:  is_subtotal ? "#0f172a" : "transparent",
      }}>
      <p className="text-xs" style={{
        color:      is_subtotal ? "white" : "#94a3b8",
        fontWeight: is_subtotal ? 900 : 400,
      }}>
        {label}
      </p>
      <div className="flex items-center gap-4">
        {change_pct !== null && Math.abs(change_pct) > 0 && (
          <div className="flex items-center gap-0.5 text-[10px] font-bold"
            style={{ color: change_pct >= 0 ? "#10b981" : "#ef4444" }}>
            {change_pct >= 0
              ? <ArrowUpRight size={11} />
              : <ArrowDownRight size={11} />}
            {Math.abs(change_pct)}%
          </div>
        )}
        <p className="text-sm font-black w-36 text-right"
          style={{ color: mau ?? (is_subtotal ? "white" : "#64748b"),
            fontVariantNumeric: "tabular-nums" }}>
          {fmt(value)}đ
        </p>
      </div>
    </div>
  );
}

// ─── Khóa sổ Modal ────────────────────────────────────────────────────────────

function KhoaSoModal({ period, onConfirm, onClose }: {
  period:    string;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  const [input, setInput] = useState("");
  const CONFIRM_TEXT = "KHÓA SỔ";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.9)" }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-[420px]"
        style={{ background: "#0f172a", border: "1px solid #ef444430" }}
        onClick={e => e.stopPropagation()}>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#7f1d1d20" }}>
              <Lock size={18} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <p className="text-sm font-black text-white">Khóa sổ tháng {period}</p>
              <p className="text-[10px]" style={{ color: "#475569" }}>
                Hành động này không thể hoàn tác
              </p>
            </div>
          </div>

          <div className="px-4 py-3 rounded-xl space-y-1.5"
            style={{ background: "#7f1d1d15", border: "1px solid #ef444430" }}>
            <p className="text-[10px] font-bold" style={{ color: "#ef4444" }}>
              Sau khi khóa sổ:
            </p>
            {[
              "Không thể tạo/sửa/xóa chứng từ trong tháng này",
              "Không thể duyệt thêm COGS hoặc Invoice",
              "Số liệu P&L tháng này bị đóng băng vĩnh viễn",
            ].map(t => (
              <p key={t} className="text-[10px] flex items-start gap-1.5" style={{ color: "#fca5a5" }}>
                <span style={{ flexShrink: 0 }}>·</span> {t}
              </p>
            ))}
          </div>

          <div>
            <p className="text-[10px] mb-1.5" style={{ color: "#475569" }}>
              Gõ <code className="font-black" style={{ color: "#ef4444" }}>{CONFIRM_TEXT}</code> để xác nhận:
            </p>
            <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
              placeholder={CONFIRM_TEXT}
              className="w-full px-3 py-2.5 rounded-xl text-sm font-black text-center outline-none tracking-widest"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#ef4444" }} />
          </div>

          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              Huỷ
            </button>
            <button onClick={onConfirm}
              disabled={input !== CONFIRM_TEXT}
              className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
              style={{ background: "#7f1d1d", color: "#fca5a5" }}>
              <Lock size={13} className="inline mr-1.5" />
              Xác nhận khóa sổ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab 3.3 ─────────────────────────────────────────────────────────────

// Mock user role
const CURRENT_USER_ROLE = "ke_toan_truong"; // hoặc "sep"

export default function Tab33PnL() {
  const [period,    setPeriod]   = useState(() => new Date().toISOString().slice(0, 7));
  const [show_khoa, setShowKhoa] = useState(false);
  const [is_locked, setIsLocked] = useState(false);

  // Chọn P&L theo kỳ
  const pl: PLReport = period === "2026-03" ? MOCK_PL_LOCKED
    : { ...MOCK_PL_CURRENT, period, is_locked };

  const can_lock = ["ke_toan_truong", "sep"].includes(CURRENT_USER_ROLE) && !pl.is_locked;

  const handle_khoa = () => {
    setIsLocked(true);
    setShowKhoa(false);
  };

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center gap-3">
          {/* Filter kỳ */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <p className="text-[10px] font-bold" style={{ color: "#475569" }}>Kỳ báo cáo:</p>
            <input type="month" value={period}
              onChange={e => setPeriod(e.target.value)}
              className="text-xs font-black outline-none"
              style={{ background: "transparent", color: "#38bdf8", border: "none" }} />
          </div>

          {/* Trạng thái khóa sổ */}
          {pl.is_locked ? (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "#06472515", border: "1px solid #10b98130" }}>
              <Lock size={11} style={{ color: "#10b981" }} />
              <p className="text-[10px] font-bold" style={{ color: "#10b981" }}>
                Đã khóa sổ · {pl.locked_by}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{ background: "#78350f15", border: "1px solid #f59e0b30" }}>
              <AlertCircle size={11} style={{ color: "#f59e0b" }} />
              <p className="text-[10px] font-bold" style={{ color: "#f59e0b" }}>
                Chưa khóa sổ — số liệu có thể thay đổi
              </p>
            </div>
          )}
        </div>

        {can_lock && (
          <button onClick={() => setShowKhoa(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black"
            style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
            <Lock size={13} /> Khóa sổ tháng này
          </button>
        )}
      </div>

      {/* KPI 3 ô lớn */}
      <div className="grid grid-cols-3 gap-4 px-6 py-5 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        {[
          { label: "Doanh thu thuần",   val: pl.doanh_thu_thuan,   prev: pl.prev_doanh_thu, mau: "#38bdf8", icon: TrendingUp   },
          { label: "Lãi gộp",           val: pl.lai_gop,           prev: pl.prev_lai_gop,   mau: "#10b981", icon: TrendingUp   },
          { label: "Lãi ròng",          val: pl.lai_rong,          prev: pl.prev_lai_rong,  mau: pl.lai_rong >= 0 ? "#10b981" : "#ef4444",
            icon: pl.lai_rong >= 0 ? TrendingUp : TrendingDown },
        ].map(({ label, val, prev, mau, icon: Icon }) => {
          const pct = pct_thay_doi(val, prev);
          return (
            <div key={label} className="px-5 py-4 rounded-2xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: mau }} />
                <p className="text-[10px] font-bold uppercase" style={{ color: "#475569" }}>{label}</p>
              </div>
              <p className="text-3xl font-black"
                style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                {fmt_short(val)}đ
              </p>
              <div className="flex items-center gap-1 mt-1.5">
                <span style={{ color: pct >= 0 ? "#10b981" : "#ef4444", fontSize: 11 }}>
                  {pct >= 0 ? "▲" : "▼"} {Math.abs(pct)}%
                </span>
                <span className="text-[10px]" style={{ color: "#334155" }}>so kỳ trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Báo cáo P&L dạng list dọc */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="max-w-2xl mx-auto py-4">

          {/* Header cột */}
          <div className="flex justify-between px-4 pb-2 mb-1"
            style={{ borderBottom: "1px solid #1e293b" }}>
            <p className="text-[9px] font-black uppercase" style={{ color: "#334155" }}>
              Khoản mục
            </p>
            <div className="flex items-center gap-4">
              <p className="text-[9px] font-black uppercase w-24 text-center"
                style={{ color: "#334155" }}>
                So kỳ trước
              </p>
              <p className="text-[9px] font-black uppercase w-36 text-right"
                style={{ color: "#334155" }}>
                Tháng {period}
              </p>
            </div>
          </div>

          {/* 1. Doanh thu */}
          <PLLineRow label="(1) Doanh thu bán hàng"    value={pl.doanh_thu_ban_hang}  indent={1} prev_value={pl.prev_doanh_thu} />
          <PLLineRow label="    Hàng khách hoàn trả"   value={-pl.doanh_thu_tra_lai}  indent={2} mau="#ef4444" />
          <PLLineRow label="DOANH THU THUẦN"            value={pl.doanh_thu_thuan}     is_subtotal mau="#38bdf8" prev_value={pl.prev_doanh_thu} />

          {/* 2. Giá vốn */}
          <PLLineRow label="(2) Giá vốn định mức"      value={-pl.cogs_dinh_muc}      indent={1} mau="#f97316" />
          <PLLineRow label="    Hao hụt được duyệt"    value={-pl.cogs_hao_hut}       indent={2} mau="#ef4444" />
          <PLLineRow label="TỔNG GIÁ VỐN"              value={-pl.tong_cogs}          is_subtotal mau="#f97316" />

          {/* 3. Lãi gộp */}
          <PLLineRow label="LÃI GỘP"                   value={pl.lai_gop}             is_subtotal mau="#10b981" prev_value={pl.prev_lai_gop} />
          <div className="px-4 py-1.5 flex justify-end">
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Tỷ lệ lãi gộp:{" "}
              <span className="font-black" style={{ color: "#10b981" }}>
                {pl.ty_le_lai_gop.toFixed(1)}%
              </span>
            </p>
          </div>

          {/* 4. Chi phí hoạt động */}
          <PLLineRow label="(4) Chi phí bán hàng"      value={-pl.chi_phi_ban_hang}   indent={1} mau="#f97316" />
          <PLLineRow label="    Chi phí quản lý"        value={-pl.chi_phi_ql}         indent={2} mau="#f97316" />
          <PLLineRow label="    Chi phí tài chính"      value={-pl.chi_phi_tai_chinh}  indent={2} mau="#f97316" />
          <PLLineRow label="TỔNG CHI PHÍ"              value={-pl.tong_chi_phi}       is_subtotal mau="#f97316" />

          {/* 5. Lãi ròng */}
          <PLLineRow
            label="LÃI RÒNG"
            value={pl.lai_rong}
            is_subtotal
            mau={pl.lai_rong >= 0 ? "#10b981" : "#ef4444"}
            prev_value={pl.prev_lai_rong} />
          <div className="px-4 py-1.5 flex justify-end">
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Tỷ lệ lãi ròng:{" "}
              <span className="font-black"
                style={{ color: pl.lai_rong >= 0 ? "#10b981" : "#ef4444" }}>
                {pl.ty_le_lai_rong.toFixed(1)}%
              </span>
            </p>
          </div>

          {/* Note COGS chờ duyệt */}
          {!pl.is_locked && (
            <div className="mx-4 mt-4 flex items-start gap-2 px-4 py-3 rounded-xl"
              style={{ background: "#78350f15", border: "1px solid #f59e0b30" }}>
              <Info size={12} style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }} />
              <p className="text-[10px]" style={{ color: "#f59e0b" }}>
                Lưu ý: Một số phiếu COGS chưa được duyệt — số liệu giá vốn chưa phản ánh đầy đủ.
                Vào Tab 3.2 để duyệt trước khi khóa sổ.
              </p>
            </div>
          )}
        </div>
      </div>

      {show_khoa && (
        <KhoaSoModal
          period={period}
          onConfirm={handle_khoa}
          onClose={() => setShowKhoa(false)} />
      )}
    </div>
  );
}