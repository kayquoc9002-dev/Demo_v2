// ─────────────────────────────────────────────────────────────────────────────
// Tab32GiaVon.tsx — Màn hình 3.2: Quản lý Giá vốn & Hao hụt
// Duyệt COGS Draft từ kho — 2 nhánh: Công ty chịu vs Bắt xưởng đền
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Check, X, AlertTriangle, Info,
  ChevronDown, ChevronRight,
} from "lucide-react";
import type { CogsDraft } from "../data/accountingTypes";
import { MOCK_COGS_DRAFTS } from "../data/accountingMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}
function fmt_short(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0) + " tr";
  return fmt(n);
}

const HAO_HUT_THRESHOLD = 5; // % — tô đỏ nếu vượt ngưỡng này

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ cogs, action, onConfirm, onClose }: {
  cogs:      CogsDraft;
  action:    "duyet" | "tu_choi";
  onConfirm: (note: string) => void;
  onClose:   () => void;
}) {
  const [note, setNote] = useState("");
  const is_duyet = action === "duyet";

  const tong_dinh_muc = cogs.lines.reduce((s, l) => s + l.so_luong_dinh_muc * l.don_gia_binh_quan, 0);
  const tong_thuc_te  = cogs.lines.reduce((s, l) => s + l.thanh_tien, 0);
  const chenh_lech    = tong_thuc_te - tong_dinh_muc;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.88)" }}
      onClick={onClose}>
      <div className="rounded-2xl overflow-hidden w-[480px]"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        onClick={e => e.stopPropagation()}>

        <div className="px-6 py-4 border-b"
          style={{ borderColor: "#1e293b",
            background: is_duyet ? "#06472215" : "#7f1d1d15" }}>
          <h3 className="text-sm font-black text-white">
            {is_duyet ? "✅ Duyệt — Công ty chịu lỗ" : "❌ Từ chối — Bắt xưởng đền"}
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
            {cogs.cogs_code} · {cogs.note_kho}
          </p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Tóm tắt số liệu */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Định mức (A)",  val: tong_dinh_muc, mau: "#64748b" },
              { label: "Thực tế (B)",   val: tong_thuc_te,  mau: "#f59e0b" },
              { label: "Chênh lệch",    val: chenh_lech,    mau: chenh_lech > 0 ? "#ef4444" : "#10b981" },
            ].map(({ label, val, mau }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl"
                style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
                <p className="text-[9px] uppercase font-bold mb-0.5" style={{ color: "#334155" }}>
                  {label}
                </p>
                <p className="text-sm font-black"
                  style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                  {fmt_short(val)}đ
                </p>
              </div>
            ))}
          </div>

          {/* Giải thích kết quả */}
          <div className="px-4 py-3 rounded-xl"
            style={{ background: is_duyet ? "#06472215" : "#7f1d1d15",
              border: `1px solid ${is_duyet ? "#10b98130" : "#ef444430"}` }}>
            <p className="text-xs" style={{ color: is_duyet ? "#10b981" : "#fca5a5" }}>
              {is_duyet
                ? `Toàn bộ ${fmt_short(tong_thuc_te)}đ (giá vốn thực tế) sẽ được ghi vào Chi phí P&L tháng này. Công ty chịu ${fmt_short(chenh_lech)}đ hao hụt.`
                : `Chỉ ghi ${fmt_short(tong_dinh_muc)}đ (định mức) vào P&L. Phần chênh lệch ${fmt_short(chenh_lech)}đ sẽ tạo khoản nợ cho Quản đốc xưởng.`
              }
            </p>
          </div>

          {/* Ghi chú kế toán */}
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block"
              style={{ color: "#475569" }}>
              Ghi chú kế toán {!is_duyet && <span style={{ color: "#ef4444" }}>*</span>}
            </label>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder={is_duyet
                ? "VD: Hao hụt trong định mức cho phép..."
                : "VD: Hao hụt bất thường do lỗi vận hành — yêu cầu xưởng bồi thường..."}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl text-xs outline-none resize-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>
        </div>

        <div className="flex gap-2 px-6 py-4 border-t"
          style={{ borderColor: "#1e293b" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Xem lại
          </button>
          <button
            onClick={() => onConfirm(note)}
            disabled={!is_duyet && !note.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
            style={{
              background: is_duyet ? "#06472520" : "#7f1d1d",
              color:      is_duyet ? "#10b981"   : "#fca5a5",
              border:     `1px solid ${is_duyet ? "#10b98140" : "transparent"}`,
            }}>
            {is_duyet ? "✅ Xác nhận duyệt" : "❌ Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── COGS Row ─────────────────────────────────────────────────────────────────

function CogsRow({ cogs, onAction }: {
  cogs:     CogsDraft;
  onAction: (cogs: CogsDraft, action: "duyet" | "tu_choi") => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const tong_dinh_muc = cogs.lines.reduce((s, l) => s + l.so_luong_dinh_muc * l.don_gia_binh_quan, 0);
  const tong_thuc_te  = cogs.lines.reduce((s, l) => s + l.thanh_tien, 0);
  const chenh_lech    = tong_thuc_te - tong_dinh_muc;
  const pct_hao_hut   = tong_dinh_muc > 0
    ? ((chenh_lech / tong_dinh_muc) * 100) : 0;
  const la_bat_thuong = pct_hao_hut > HAO_HUT_THRESHOLD;

  return (
    <>
      <div
        className="grid items-center px-6 py-3 gap-2 cursor-pointer hover:bg-slate-800/20 transition-colors"
        style={{
          gridTemplateColumns: "140px 1fr 130px 130px 120px 80px 130px",
          borderBottom: expanded ? "none" : "1px solid #0f172a",
          background:   la_bat_thuong ? "#7f1d1d08" : "transparent",
          borderLeft:   `3px solid ${la_bat_thuong ? "#ef4444" : "transparent"}`,
        }}
        onClick={() => setExpanded(v => !v)}>

        {/* Mã lô */}
        <div className="flex items-center gap-2">
          {expanded
            ? <ChevronDown size={12} style={{ color: "#475569", flexShrink: 0 }} />
            : <ChevronRight size={12} style={{ color: "#475569", flexShrink: 0 }} />}
          <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
            {cogs.cogs_code}
          </code>
        </div>

        {/* Diễn giải */}
        <p className="text-xs text-white truncate">{cogs.note_kho}</p>

        {/* Định mức A */}
        <p className="text-xs text-right font-bold"
          style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
          {fmt(tong_dinh_muc)}đ
        </p>

        {/* Thực tế B */}
        <p className="text-xs text-right font-bold"
          style={{ color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
          {fmt(tong_thuc_te)}đ
        </p>

        {/* Chênh lệch — FE tự tính */}
        <div className="text-right">
          <p className="text-sm font-black"
            style={{ color: chenh_lech > 0 ? "#ef4444" : "#10b981",
              fontVariantNumeric: "tabular-nums" }}>
            {chenh_lech > 0 ? "+" : ""}{fmt(chenh_lech)}đ
          </p>
          {la_bat_thuong && (
            <p className="text-[9px] flex items-center justify-end gap-0.5"
              style={{ color: "#ef4444" }}>
              <AlertTriangle size={8} />
              {pct_hao_hut.toFixed(1)}% vượt ngưỡng
            </p>
          )}
        </div>

        {/* Trạng thái */}
        <div className="text-center">
          {cogs.status === "approved" ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#06472520", color: "#10b981" }}>Đã duyệt</span>
          ) : cogs.status === "rejected" ? (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#7f1d1d20", color: "#ef4444" }}>Từ chối</span>
          ) : (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full animate-pulse"
              style={{ background: "#78350f20", color: "#f59e0b" }}>Chờ duyệt</span>
          )}
        </div>

        {/* Actions */}
        {cogs.status === "draft" && (
          <div className="flex items-center gap-1.5 justify-end"
            onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onAction(cogs, "duyet")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black"
              style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98130" }}>
              <Check size={10} /> Duyệt
            </button>
            <button
              onClick={() => onAction(cogs, "tu_choi")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
              <X size={10} /> Từ chối
            </button>
          </div>
        )}
      </div>

      {/* Expand — chi tiết từng SKU */}
      {expanded && (
        <div style={{ borderBottom: "1px solid #0f172a", background: "#0a1628" }}>
          <div className="grid px-10 py-1.5 text-[9px] font-black uppercase"
            style={{ gridTemplateColumns: "1fr 60px 90px 90px 90px 80px",
              color: "#334155", borderBottom: "1px solid #1e293b" }}>
            <span>SKU</span>
            <span className="text-right">SL</span>
            <span className="text-right">Đơn giá BQ</span>
            <span className="text-right">ĐM</span>
            <span className="text-right">Thực tế</span>
            <span className="text-right">Hao hụt</span>
          </div>
          {cogs.lines.map(line => {
            const dm_tien = line.so_luong_dinh_muc * line.don_gia_binh_quan;
            const hao_hut_vnd = line.thanh_tien - dm_tien;
            return (
              <div key={line.line_id}
                className="grid items-center px-10 py-2.5 gap-2"
                style={{ gridTemplateColumns: "1fr 60px 90px 90px 90px 80px",
                  borderBottom: "1px solid #0f172a" }}>
                <div>
                  <p className="text-xs font-bold text-white">{line.ten_sp}</p>
                  <code className="text-[9px]" style={{ color: "#334155" }}>{line.ma_sku}</code>
                </div>
                <p className="text-xs text-right" style={{ color: "#64748b" }}>
                  {line.so_luong_thuc}
                </p>
                <p className="text-xs text-right" style={{ color: "#475569",
                  fontVariantNumeric: "tabular-nums" }}>
                  {fmt(line.don_gia_binh_quan)}đ
                </p>
                <p className="text-xs text-right" style={{ color: "#64748b",
                  fontVariantNumeric: "tabular-nums" }}>
                  {fmt(dm_tien)}đ
                </p>
                <p className="text-xs text-right font-bold"
                  style={{ color: "#f59e0b", fontVariantNumeric: "tabular-nums" }}>
                  {fmt(line.thanh_tien)}đ
                </p>
                <p className="text-xs text-right font-bold"
                  style={{ color: hao_hut_vnd > 0 ? "#ef4444" : "#10b981",
                    fontVariantNumeric: "tabular-nums" }}>
                  {hao_hut_vnd > 0 ? "+" : ""}{fmt(hao_hut_vnd)}đ
                </p>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

// ─── Main Tab 3.2 ─────────────────────────────────────────────────────────────

export default function Tab32GiaVon() {
  const [cogs_list, setCogslist] = useState<CogsDraft[]>(MOCK_COGS_DRAFTS);
  const [filter,    setFilter]   = useState<CogsDraft["status"] | "">("");
  const [confirm,   setConfirm]  = useState<{ cogs: CogsDraft; action: "duyet" | "tu_choi" } | null>(null);
  const [toast,     setToast]    = useState<{ msg: string; ok: boolean } | null>(null);

  const show_toast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = filter ? cogs_list.filter(c => c.status === filter) : cogs_list;

  const tong_draft    = cogs_list.filter(c => c.status === "draft").reduce((s, c) => s + c.total_cogs, 0);
  const tong_approved = cogs_list.filter(c => c.status === "approved").reduce((s, c) => s + c.total_cogs, 0);
  const handle_confirm = (note: string) => {
    if (!confirm) return;
    const { cogs, action } = confirm;
    const idx = MOCK_COGS_DRAFTS.findIndex(c => c.cogs_id === cogs.cogs_id);
    if (idx >= 0) {
      MOCK_COGS_DRAFTS[idx] = {
        ...MOCK_COGS_DRAFTS[idx],
        status:      action === "duyet" ? "approved" : "rejected",
        note_kt:     note,
        approved_by: action === "duyet" ? "Trần Kế Toán Trưởng" : undefined,
        approved_at: action === "duyet" ? new Date().toISOString() : undefined,
      };
    }
    setCogslist([...MOCK_COGS_DRAFTS]);
    setConfirm(null);
    show_toast(
      action === "duyet"
        ? "Đã duyệt — Giá vốn ghi nhận vào P&L"
        : "Đã từ chối — Tạo khoản nợ cho xưởng",
      action === "duyet"
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        {[
          { label: "Chờ duyệt",   val: tong_draft,    mau: "#f59e0b",
            count: cogs_list.filter(c => c.status === "draft").length },
          { label: "Đã duyệt",    val: tong_approved,  mau: "#10b981",
            count: cogs_list.filter(c => c.status === "approved").length },
          { label: "Hao hụt bất thường", val: 0, mau: "#ef4444",
            count: cogs_list.filter(c => {
              const dm = c.lines.reduce((s, l) => s + l.so_luong_dinh_muc * l.don_gia_binh_quan, 0);
              return dm > 0 && ((c.total_cogs - dm) / dm * 100) > HAO_HUT_THRESHOLD;
            }).length },
        ].map(({ label, val, mau, count }) => (
          <div key={label} className="px-4 py-3 rounded-xl"
            style={{ background: "#0f172a", border: `1px solid ${count > 0 && label.includes("bất thường") ? "#ef444430" : "#1e293b"}` }}>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#334155" }}>
              {label} ({count})
            </p>
            {val > 0 ? (
              <p className="text-xl font-black"
                style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                {fmt_short(val)}đ
              </p>
            ) : (
              <p className="text-sm font-bold mt-1"
                style={{ color: count > 0 ? mau : "#334155" }}>
                {count > 0 ? `${count} phiếu cần xem xét` : "Không có"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center gap-1 text-[10px]" style={{ color: "#475569" }}>
          <Info size={11} />
          Ngưỡng cảnh báo hao hụt: <span className="font-black" style={{ color: "#f59e0b" }}>
            &gt;{HAO_HUT_THRESHOLD}%
          </span>
        </div>
        <div className="flex-1" />
        <select value={filter} onChange={e => setFilter(e.target.value as any)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
          <option value="">Tất cả trạng thái</option>
          <option value="draft">Chờ duyệt</option>
          <option value="approved">Đã duyệt</option>
          <option value="rejected">Từ chối</option>
        </select>
      </div>

      {/* Bảng */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="grid items-center px-6 py-2 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "140px 1fr 130px 130px 120px 80px 130px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <span>Mã phiếu</span>
          <span>Diễn giải</span>
          <span className="text-right">ĐM (A)</span>
          <span className="text-right">Thực tế (B)</span>
          <span className="text-right">Chênh lệch</span>
          <span className="text-center">TT</span>
          <span className="text-right">Thao tác</span>
        </div>
        {filtered.map(cogs => (
          <CogsRow key={cogs.cogs_id} cogs={cogs}
            onAction={(c, a) => setConfirm({ cogs: c, action: a })} />
        ))}
      </div>

      {confirm && (
        <ConfirmModal
          cogs={confirm.cogs}
          action={confirm.action}
          onConfirm={handle_confirm}
          onClose={() => setConfirm(null)} />
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{ background: "#0f172a",
            border: `1px solid ${toast.ok ? "#10b98140" : "#ef444440"}` }}>
          <p className="text-xs font-bold"
            style={{ color: toast.ok ? "#10b981" : "#ef4444" }}>
            {toast.msg}
          </p>
        </div>
      )}
    </div>
  );
}