// ─────────────────────────────────────────────────────────────────────────────
// VoucherList.tsx — Màn hình danh sách Phiếu Thu/Chi (Sổ Quỹ)
// Data-dense, dạng sổ cái ngân hàng
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Download, Upload,
  CheckCircle, Clock, FileText, AlertCircle,
  Eye, Pencil, Trash2, Send, X, RefreshCw,
  
} from "lucide-react";
import type { Voucher, VoucherType, BankAccount } from "../data/accountingTypes";
import {
  layDanhSachVoucher, layDanhSachTaiKhoan,
  xoaVoucher, guiDuyetVoucher,
} from "../ServiceLayer/accountingService";
// import { MOCK_ACCOUNTS } from "./SoQuy/data/accountingMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt_vnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function fmt_ngay(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const STATUS_CONFIG: Record<string, { nhan: string; mau: string; icon: React.ElementType }> = {
  draft:            { nhan: "Nháp",        mau: "#64748b", icon: FileText    },
  pending_approval: { nhan: "Chờ duyệt",   mau: "#f59e0b", icon: Clock       },
  approved:         { nhan: "Đã duyệt",    mau: "#10b981", icon: CheckCircle },
  rejected:         { nhan: "Từ chối",     mau: "#ef4444", icon: AlertCircle },
};

const TYPE_CONFIG: Record<VoucherType, { nhan: string; mau: string; nen: string }> = {
  phieu_thu:       { nhan: "Thu",    mau: "#10b981", nen: "#06472520" },
  phieu_chi:       { nhan: "Chi",    mau: "#ef4444", nen: "#7f1d1d20" },
  phieu_hach_toan: { nhan: "HT",     mau: "#38bdf8", nen: "#0c435420" },
};

// ─── Account Balance Bar ──────────────────────────────────────────────────────

function AccountBalanceBar({ accounts }: { accounts: BankAccount[] }) {
  return (
    <div className="flex items-center gap-3">
      {accounts.map(acc => (
        <div key={acc.account_id}
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
          <div>
            <p className="text-[9px] font-black uppercase tracking-wide"
              style={{ color: "#334155" }}>
              {acc.bank_name}
            </p>
            <p className="text-sm font-black leading-none"
              style={{ color: acc.balance_vnd < 10000000 ? "#ef4444" : "#10b981",
                fontVariantNumeric: "tabular-nums" }}>
              {acc.currency !== "VND"
                ? `${acc.currency} ${new Intl.NumberFormat("en-US").format(acc.balance)}`
                : fmt_vnd(acc.balance) + "đ"}
            </p>
            {acc.currency !== "VND" && (
              <p className="text-[9px]" style={{ color: "#334155" }}>
                ≈ {fmt_vnd(acc.balance_vnd)}đ
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: cfg.mau + "20", color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      <Icon size={9} />
      {cfg.nhan}
    </span>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, desc, onConfirm, onClose, danger = false }: {
  title:     string;
  desc:      string;
  onConfirm: () => void;
  onClose:   () => void;
  danger?:   boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.85)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-80"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-black text-white mb-1">{title}</h3>
        <p className="text-xs mb-5" style={{ color: "#64748b" }}>{desc}</p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Huỷ
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-black"
            style={{ background: danger ? "#7f1d1d" : "#0c4354",
              color: danger ? "#fca5a5" : "#38bdf8" }}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface VoucherListProps {
  onTao:      (type: VoucherType) => void;
  onXem:      (voucher: Voucher) => void;
  onSua:      (voucher: Voucher) => void;
}

export default function VoucherList({ onTao, onXem, onSua }: VoucherListProps) {
  const [vouchers,   setVouchers]   = useState<Voucher[]>([]);
  const [accounts,   setAccounts]   = useState<BankAccount[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [confirm,    setConfirm]    = useState<{ type: "xoa" | "gui"; id: string } | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);

  // Filters
  const [search,      setSearch]      = useState("");
  const [fil_type,    setFilType]     = useState<string>("");
  const [fil_status,  setFilStatus]   = useState<string>("");
  const [fil_account, setFilAccount]  = useState<string>("");
  const [fil_from,    setFilFrom]     = useState("");
  const [fil_to,      setFilTo]       = useState("");
  const [date_field,  setDateField]   = useState<"document_date" | "accounting_date">("accounting_date");

  const show_toast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [vs, accs] = await Promise.all([
      layDanhSachVoucher({
        type:       fil_type    as VoucherType || undefined,
        status:     fil_status  || undefined,
        account_id: fil_account || undefined,
        search:     search      || undefined,
        from_date:  fil_from    || undefined,
        to_date:    fil_to      || undefined,
        date_field,
      }),
      layDanhSachTaiKhoan(),
    ]);
    setVouchers(vs);
    setAccounts(accs);
    setLoading(false);
  }, [search, fil_type, fil_status, fil_account, fil_from, fil_to, date_field]);

  useEffect(() => { load(); }, [load]);

  const toggle_select = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggle_all = () =>
    setSelected(prev => prev.size === vouchers.length ? new Set() : new Set(vouchers.map(v => v.voucher_id)));

  const handle_xoa = async (id: string) => {
    try {
      await xoaVoucher(id);
      show_toast("Đã xóa phiếu");
      load();
    } catch (e: any) {
      show_toast(e.message, false);
    }
    setConfirm(null);
  };

  const handle_gui_duyet = async (id: string) => {
    try {
      await guiDuyetVoucher(id);
      show_toast("Đã gửi chờ duyệt");
      load();
    } catch (e: any) {
      show_toast(e.message, false);
    }
    setConfirm(null);
  };

  // Tính tổng thu/chi trong kết quả lọc
  const tong_thu = vouchers.filter(v => v.type === "phieu_thu" && v.status === "approved")
    .reduce((s, v) => s + v.total_vnd, 0);
  const tong_chi = vouchers.filter(v => v.type === "phieu_chi" && v.status === "approved")
    .reduce((s, v) => s + v.total_vnd, 0);

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* ── Header ── */}
      <div className="px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>

        {/* Row 1: Title + Account balances */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-black text-white">Sổ Quỹ — Phiếu Thu/Chi</h2>
            <p className="text-[10px] mt-0.5" style={{ color: "#334155" }}>
              Số dư tài khoản (theo thời gian thực)
            </p>
          </div>
          <AccountBalanceBar accounts={accounts} />
        </div>

        {/* Row 2: Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tạo phiếu */}
          <button onClick={() => onTao("phieu_thu")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
            style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
            <Plus size={12} /> Phiếu Thu
          </button>
          <button onClick={() => onTao("phieu_chi")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black"
            style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444440" }}>
            <Plus size={12} /> Phiếu Chi
          </button>

          <div className="h-4 w-px mx-1" style={{ background: "#1e293b" }} />

          {/* Search */}
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Mã CT, tên đối tượng..."
              className="pl-7 pr-3 py-1.5 rounded-xl text-xs outline-none w-48"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>

          {/* Lọc loại */}
          <select value={fil_type} onChange={e => setFilType(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
            <option value="">Tất cả loại</option>
            <option value="phieu_thu">Phiếu Thu</option>
            <option value="phieu_chi">Phiếu Chi</option>
          </select>

          {/* Lọc trạng thái */}
          <select value={fil_status} onChange={e => setFilStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
            <option value="">Tất cả trạng thái</option>
            <option value="draft">Nháp</option>
            <option value="pending_approval">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
          </select>

          {/* Lọc tài khoản */}
          <select value={fil_account} onChange={e => setFilAccount(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl text-xs outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
            <option value="">Tất cả TK</option>
            {accounts.map(a => (
              <option key={a.account_id} value={a.account_id}>{a.account_name}</option>
            ))}
          </select>

          {/* Lọc ngày */}
          <div className="flex items-center gap-1">
            <select value={date_field} onChange={e => setDateField(e.target.value as any)}
              className="px-2 py-1.5 rounded-xl text-[10px] outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#64748b" }}>
              <option value="accounting_date">Ngày HT</option>
              <option value="document_date">Ngày CT</option>
            </select>
            <input type="date" value={fil_from} onChange={e => setFilFrom(e.target.value)}
              className="px-2 py-1.5 rounded-xl text-[10px] outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }} />
            <span className="text-[10px]" style={{ color: "#334155" }}>—</span>
            <input type="date" value={fil_to} onChange={e => setFilTo(e.target.value)}
              className="px-2 py-1.5 rounded-xl text-[10px] outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }} />
          </div>

          {(search || fil_type || fil_status || fil_account || fil_from || fil_to) && (
            <button onClick={() => {
              setSearch(""); setFilType(""); setFilStatus("");
              setFilAccount(""); setFilFrom(""); setFilTo("");
            }} className="flex items-center gap-1 text-[10px]" style={{ color: "#ef4444" }}>
              <X size={10} /> Xoá lọc
            </button>
          )}

          <div className="flex-1" />

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <Download size={11} /> Excel
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <Upload size={11} /> Import sao kê
          </button>
        </div>
      </div>

      {/* ── Bulk action bar ── */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 px-6 py-2 flex-shrink-0"
          style={{ background: "#0c435415", borderBottom: "1px solid #38bdf820" }}>
          <span className="text-xs font-bold" style={{ color: "#38bdf8" }}>
            Đã chọn {selected.size} phiếu
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: "#06472520", color: "#10b981" }}>
            <Send size={11} /> Gửi duyệt hàng loạt
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold"
            style={{ background: "#7f1d1d20", color: "#ef4444" }}>
            <Trash2 size={11} /> Xóa hàng loạt
          </button>
          <button onClick={() => setSelected(new Set())}
            className="text-xs ml-auto" style={{ color: "#475569" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Summary bar ── */}
      <div className="flex items-center gap-6 px-6 py-2 flex-shrink-0"
        style={{ background: "#0a1628", borderBottom: "1px solid #1e293b" }}>
        <p className="text-[11px]" style={{ color: "#475569" }}>
          {vouchers.length} phiếu
        </p>
        <p className="text-[11px]" style={{ color: "#10b981" }}>
          ↑ Thu đã duyệt: <span className="font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt_vnd(tong_thu)}đ
          </span>
        </p>
        <p className="text-[11px]" style={{ color: "#ef4444" }}>
          ↓ Chi đã duyệt: <span className="font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt_vnd(tong_chi)}đ
          </span>
        </p>
        <p className="text-[11px]" style={{ color: tong_thu - tong_chi >= 0 ? "#10b981" : "#ef4444" }}>
          = Chênh lệch: <span className="font-black" style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt_vnd(tong_thu - tong_chi)}đ
          </span>
        </p>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>

        {/* Header */}
        <div className="grid items-center px-4 py-2 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "32px 100px 56px 140px 80px 1fr 120px 80px 60px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <input type="checkbox"
            checked={selected.size === vouchers.length && vouchers.length > 0}
            onChange={toggle_all}
            className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
          <span>Ngày HT</span>
          <span>Loại</span>
          <span>Số CT</span>
          <span>Tài khoản</span>
          <span>Đối tượng / Diễn giải</span>
          <span className="text-right">Số tiền (VNĐ)</span>
          <span className="text-center">Trạng thái</span>
          <span></span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw size={16} className="animate-spin" style={{ color: "#38bdf8" }} />
          </div>
        ) : vouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <FileText size={28} className="mb-2 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm" style={{ color: "#475569" }}>Không có phiếu nào</p>
          </div>
        ) : vouchers.map((v, i) => {
          const type_cfg   = TYPE_CONFIG[v.type];
          const is_sel     = selected.has(v.voucher_id);
          const account    = accounts.find(a => a.account_id === v.account_id);
          const can_edit   = v.status !== "approved";
          const can_delete = v.status !== "approved";
          const can_send   = v.status === "draft";

          return (
            <div key={v.voucher_id}
              className="grid items-center px-4 py-2.5 gap-2 group transition-colors"
              style={{
                gridTemplateColumns: "32px 100px 56px 140px 80px 1fr 120px 80px 60px",
                borderBottom: "1px solid #0f172a",
                background: is_sel ? "#0c435410" : i % 2 === 0 ? "transparent" : "#0f172a40",
              }}>

              {/* Checkbox */}
              <input type="checkbox" checked={is_sel} onChange={() => toggle_select(v.voucher_id)}
                className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />

              {/* Ngày hạch toán */}
              <div>
                <p className="text-xs font-bold text-white">{fmt_ngay(v.accounting_date)}</p>
                {v.document_date !== v.accounting_date && (
                  <p className="text-[9px]" style={{ color: "#334155" }}>
                    CT: {fmt_ngay(v.document_date)}
                  </p>
                )}
              </div>

              {/* Loại */}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black"
                style={{ background: type_cfg.nen, color: type_cfg.mau }}>
                {type_cfg.nhan}
              </span>

              {/* Số CT */}
              <button onClick={() => onXem(v)}
                className="text-left hover:underline"
                style={{ color: "#38bdf8" }}>
                <code className="text-xs font-black">{v.voucher_code}</code>
              </button>

              {/* Tài khoản */}
              <p className="text-[11px] truncate" style={{ color: "#64748b" }}>
                {account?.bank_name ?? "—"}
              </p>

              {/* Đối tượng / Diễn giải */}
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{v.doi_tuong_name}</p>
                <p className="text-[10px] truncate" style={{ color: "#475569" }}>{v.description}</p>
              </div>

              {/* Số tiền */}
              <p className="text-sm font-black text-right"
                style={{
                  color: v.type === "phieu_thu" ? "#10b981" : "#ef4444",
                  fontVariantNumeric: "tabular-nums",
                }}>
                {v.type === "phieu_thu" ? "+" : "−"}{fmt_vnd(v.total_vnd)}
              </p>

              {/* Trạng thái */}
              <div className="flex justify-center">
                <StatusBadge status={v.status} />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onXem(v)} title="Xem chi tiết"
                  className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#64748b" }}>
                  <Eye size={12} />
                </button>
                {can_edit && (
                  <button onClick={() => onSua(v)} title="Chỉnh sửa"
                    className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#64748b" }}>
                    <Pencil size={12} />
                  </button>
                )}
                {can_send && (
                  <button onClick={() => setConfirm({ type: "gui", id: v.voucher_id })}
                    title="Gửi duyệt"
                    className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#f59e0b" }}>
                    <Send size={12} />
                  </button>
                )}
                {can_delete && (
                  <button onClick={() => setConfirm({ type: "xoa", id: v.voucher_id })}
                    title="Xóa"
                    className="p-1.5 rounded-lg hover:bg-red-900/20" style={{ color: "#475569" }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm modal */}
      {confirm?.type === "xoa" && (
        <ConfirmModal
          title="Xóa phiếu"
          desc="Hành động này không thể hoàn tác. Phiếu sẽ bị xóa vĩnh viễn."
          onConfirm={() => handle_xoa(confirm.id)}
          onClose={() => setConfirm(null)}
          danger />
      )}
      {confirm?.type === "gui" && (
        <ConfirmModal
          title="Gửi chờ duyệt"
          desc="Phiếu sẽ được gửi cho người có thẩm quyền phê duyệt."
          onConfirm={() => handle_gui_duyet(confirm.id)}
          onClose={() => setConfirm(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{ background: "#0f172a", border: `1px solid ${toast.ok ? "#10b98140" : "#ef444440"}` }}>
          {toast.ok
            ? <CheckCircle size={13} style={{ color: "#10b981" }} />
            : <AlertCircle size={13} style={{ color: "#ef4444" }} />}
          <p className="text-xs font-bold"
            style={{ color: toast.ok ? "#10b981" : "#ef4444" }}>
            {toast.msg}
          </p>
        </div>
      )}
    </div>
  );
}