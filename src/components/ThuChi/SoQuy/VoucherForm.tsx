// ─────────────────────────────────────────────────────────────────────────────
// VoucherForm.tsx — Form tạo/sửa Phiếu Thu/Chi (Modal)
// 2 phần: Header (thông tin chung) + Line items (chi tiết dòng tiền)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  X, Plus, Trash2, Save, Send, Upload,
  AlertCircle, CheckCircle, Info,
} from "lucide-react";
import type {
  Voucher, VoucherType, VoucherLine,
  TransactionCategory, BankAccount, CostCenter, Currency,
} from "../data/accountingTypes";
import {
  layDanhSachTaiKhoan, layDanhSachHangMuc, layDanhSachCostCenter,
  layTyGiaHomNay, taoVoucher, capNhatVoucher,
} from "../ServiceLayer/accountingService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function fmt_vnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

// ─── Input components ─────────────────────────────────────────────────────────

const InputStyle = {
  background: "#1e293b",
  border: "1px solid #334155",
  color: "white",
};

function FormField({ label, required, children, error }: {
  label:     string;
  required?: boolean;
  children:  React.ReactNode;
  error?:    string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase mb-1 block tracking-wide"
        style={{ color: "#475569" }}>
        {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: "#ef4444" }}>
          <AlertCircle size={9} />{error}
        </p>
      )}
    </div>
  );
}

// ─── VoucherForm ──────────────────────────────────────────────────────────────

interface VoucherFormProps {
  type:        VoucherType;
  voucher?:    Voucher;            // undefined = tạo mới
  onSave:      (v: Voucher) => void;
  onClose:     () => void;
}

export default function VoucherForm({ type, voucher, onSave, onClose }: VoucherFormProps) {
  const is_edit    = !!voucher;
  const is_locked  = voucher?.status === "approved";

  // Master data
  const [accounts,    setAccounts]   = useState<BankAccount[]>([]);
  const [categories,  setCategories] = useState<TransactionCategory[]>([]);
  const [,            setCenters]    = useState<CostCenter[]>([]);

  // Header state
  const [account_id,      setAccountId]     = useState(voucher?.account_id ?? "");
  const [currency,        setCurrency]      = useState<Currency>(voucher?.currency ?? "VND");
  const [exchange_rate,   setExchangeRate]  = useState(voucher?.exchange_rate ?? 1);
  const [document_date,   setDocumentDate]  = useState(voucher?.document_date ?? today());
  const [accounting_date, setAccountingDate]= useState(voucher?.accounting_date ?? today());
  const [doi_tuong_name,  setDoiTuongName]  = useState(voucher?.doi_tuong_name ?? "");
  const [doi_tuong_type,  setDoiTuongType]  = useState<Voucher["doi_tuong_type"]>(voucher?.doi_tuong_type ?? "khach_hang");
  const [description,     setDescription]  = useState(voucher?.description ?? "");

  // Line items
  const [lines, setLines] = useState<VoucherLine[]>(
    voucher?.lines ?? [{ line_id: gen_id(), voucher_id: "", category_id: "", description: "", amount: 0, amount_vnd: 0 }]
  );

  // UI state
  const [saving,  setSaving]  = useState(false);
  const [errors,  setErrors]  = useState<Record<string, string>>({});
  const [toast,   setToast]   = useState<string | null>(null);
  const [rate_auto, setRateAuto] = useState(false);

  useEffect(() => {
    Promise.all([
      layDanhSachTaiKhoan(),
      layDanhSachHangMuc(type === "phieu_thu" ? "thu" : "chi"),
      layDanhSachCostCenter(),
    ]).then(([accs, cats, ctrs]) => {
      setAccounts(accs);
      setCategories(cats);
      setCenters(ctrs);
    });
  }, [type]);

  // Khi chọn tài khoản → tự cập nhật currency
  useEffect(() => {
    const acc = accounts.find(a => a.account_id === account_id);
    if (acc) {
      setCurrency(acc.currency);
      if (acc.currency !== "VND") {
        layTyGiaHomNay(acc.currency).then(rate => {
          if (rate) { setExchangeRate(rate.rate_sell); setRateAuto(true); }
        });
      } else {
        setExchangeRate(1);
      }
    }
  }, [account_id, accounts]);

  // Tính tổng
  const total_amount = lines.reduce((s, l) => s + (l.amount || 0), 0);
  const total_vnd    = lines.reduce((s, l) => s + (l.amount_vnd || 0), 0);

  // Thêm dòng
  const them_dong = () => {
    setLines(prev => [...prev, {
      line_id: gen_id(), voucher_id: "", category_id: "",
      description: "", amount: 0, amount_vnd: 0,
    }]);
  };

  // Cập nhật dòng
  const update_line = (idx: number, field: keyof VoucherLine, val: unknown) => {
    setLines(prev => prev.map((l, i) => {
      if (i !== idx) return l;
      const updated = { ...l, [field]: val };
      // Tự tính amount_vnd khi sửa amount
      if (field === "amount") {
        updated.amount_vnd = Math.round((val as number) * exchange_rate);
      }
      return updated;
    }));
  };

  // Xóa dòng
  const xoa_dong = (idx: number) => {
    if (lines.length <= 1) return;
    setLines(prev => prev.filter((_, i) => i !== idx));
  };

  // Validate
  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!account_id)          errs.account_id = "Bắt buộc chọn tài khoản";
    if (!doi_tuong_name.trim()) errs.doi_tuong_name = "Bắt buộc nhập đối tượng";
    if (!document_date)       errs.document_date = "Bắt buộc chọn ngày";
    if (total_amount <= 0)    errs.total = "Tổng tiền phải lớn hơn 0";
    lines.forEach((l, i) => {
      if (!l.category_id) errs[`line_cat_${i}`] = "Chọn hạng mục";
      if (!l.amount || l.amount <= 0) errs[`line_amt_${i}`] = "Nhập số tiền";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handle_save = async (and_send = false) => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        type,
        status:          and_send ? "pending_approval" as const : "draft" as const,
        account_id,
        currency,
        exchange_rate,
        total_amount,
        total_vnd,
        document_date,
        accounting_date,
        doi_tuong_name,
        doi_tuong_type,
        description,
        created_by:      "Nguyễn Thị Kế Toán",
        created_at:      new Date().toISOString(),
        approval_history: [],
        lines: lines.map(l => ({ ...l, amount_vnd: Math.round(l.amount * exchange_rate) })),
      };

      let saved: Voucher;
      if (is_edit && voucher) {
        saved = await capNhatVoucher({ ...voucher, ...payload });
      } else {
        saved = await taoVoucher(payload);
      }
      onSave(saved);
    } catch (e: any) {
      setToast(e.message);
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const mau_type = type === "phieu_thu" ? "#10b981" : "#ef4444";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.9)" }}
      onClick={onClose}>
      <div className="flex flex-col rounded-2xl overflow-hidden w-[760px]"
        style={{ background: "#0a1628", border: `1px solid ${mau_type}30`, maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b", background: mau_type + "10" }}>
          <div>
            <h3 className="text-sm font-black text-white">
              {is_edit ? "Chỉnh sửa" : "Tạo mới"} {type === "phieu_thu" ? "Phiếu Thu" : "Phiếu Chi"}
              {is_edit && <code className="ml-2 text-xs" style={{ color: "#64748b" }}>
                {voucher?.voucher_code}
              </code>}
            </h3>
            {is_locked && (
              <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#f59e0b" }}>
                <Info size={10} /> Phiếu đã duyệt — chỉ xem, không thể sửa
              </p>
            )}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6"
          style={{ scrollbarWidth: "thin" }}>

          {/* ── Khối 1: Thông tin chung ── */}
          <div>
            <p className="text-[10px] font-black uppercase mb-3 tracking-wide"
              style={{ color: "#475569" }}>
              Thông tin chung
            </p>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

              {/* Tài khoản */}
              <FormField label="Tài khoản" required error={errors.account_id}>
                <select value={account_id} onChange={e => setAccountId(e.target.value)}
                  disabled={is_locked}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={InputStyle}>
                  <option value="">-- Chọn tài khoản --</option>
                  {accounts.map(a => (
                    <option key={a.account_id} value={a.account_id}>
                      {a.account_name}
                    </option>
                  ))}
                </select>
              </FormField>

              {/* Đối tượng */}
              <FormField label="Đối tượng" required error={errors.doi_tuong_name}>
                <div className="flex gap-1.5">
                  <select value={doi_tuong_type} onChange={e => setDoiTuongType(e.target.value as any)}
                    disabled={is_locked}
                    className="px-2 py-2 rounded-xl text-xs outline-none flex-shrink-0 w-28"
                    style={InputStyle}>
                    <option value="khach_hang">Khách hàng</option>
                    <option value="ncc">Nhà cung cấp</option>
                    <option value="nhan_vien">Nhân viên</option>
                    <option value="khac">Khác</option>
                  </select>
                  <input value={doi_tuong_name} onChange={e => setDoiTuongName(e.target.value)}
                    disabled={is_locked}
                    placeholder="Tên đối tượng..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={InputStyle} />
                </div>
              </FormField>

              {/* Tỷ giá — chỉ hiện khi ngoại tệ */}
              {currency !== "VND" ? (
                <FormField label={`Tỷ giá (${currency}/VNĐ)`}>
                  <div className="relative">
                    <input type="number" value={exchange_rate}
                      onChange={e => { setExchangeRate(Number(e.target.value)); setRateAuto(false); }}
                      disabled={is_locked}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none pr-16"
                      style={{ ...InputStyle, fontVariantNumeric: "tabular-nums" }} />
                    {rate_auto && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                        style={{ background: "#0c435420", color: "#38bdf8" }}>
                        Auto
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>
                    Tỷ giá Vietcombank hôm nay — có thể sửa tay
                  </p>
                </FormField>
              ) : (
                <FormField label="Diễn giải chung">
                  <input value={description} onChange={e => setDescription(e.target.value)}
                    disabled={is_locked}
                    placeholder="Mô tả ngắn về phiếu..."
                    className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                    style={InputStyle} />
                </FormField>
              )}

              {/* Ngày chứng từ */}
              <FormField label="Ngày chứng từ" required error={errors.document_date}>
                <input type="date" value={document_date}
                  onChange={e => setDocumentDate(e.target.value)}
                  disabled={is_locked}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={InputStyle} />
                <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>
                  Ngày ghi trên hóa đơn giấy
                </p>
              </FormField>

              {/* Ngày hạch toán */}
              <FormField label="Ngày hạch toán">
                <input type="date" value={accounting_date}
                  onChange={e => setAccountingDate(e.target.value)}
                  disabled={is_locked}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={InputStyle} />
                <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>
                  Ngày ghi nhận hệ thống (mặc định hôm nay)
                </p>
              </FormField>

              {currency !== "VND" && (
                <FormField label="Diễn giải chung">
                  <input value={description} onChange={e => setDescription(e.target.value)}
                    disabled={is_locked}
                    placeholder="Mô tả ngắn về phiếu..."
                    className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                    style={InputStyle} />
                </FormField>
              )}
            </div>
          </div>

          {/* ── Khối 2: Chi tiết dòng tiền ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black uppercase tracking-wide" style={{ color: "#475569" }}>
                Chi tiết dòng tiền
              </p>
              {!is_locked && (
                <button onClick={them_dong}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  <Plus size={10} /> Thêm dòng
                </button>
              )}
            </div>

            {/* Table header */}
            <div className="grid px-3 py-1.5 text-[9px] font-black uppercase"
              style={{
                gridTemplateColumns: "1fr 1fr 120px 80px 28px",
                background: "#020817", color: "#334155",
                borderRadius: "8px 8px 0 0", border: "1px solid #1e293b", borderBottom: "none",
              }}>
              <span>Hạng mục *</span>
              <span>Diễn giải chi tiết</span>
              <span className="text-right">
                Số tiền {currency !== "VND" ? `(${currency})` : "(VNĐ)"}
              </span>
              {currency !== "VND" && <span className="text-right">VNĐ</span>}
              <span></span>
            </div>

            <div className="rounded-b-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
              {lines.map((line, idx) => (
                <div key={line.line_id}
                  className="grid items-center px-3 py-2 gap-2"
                  style={{
                    gridTemplateColumns: "1fr 1fr 120px 80px 28px",
                    borderBottom: idx < lines.length - 1 ? "1px solid #0f172a" : "none",
                  }}>

                  {/* Hạng mục */}
                  <div>
                    <select value={line.category_id}
                      onChange={e => update_line(idx, "category_id", e.target.value)}
                      disabled={is_locked}
                      className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                      style={{
                        ...InputStyle,
                        border: errors[`line_cat_${idx}`] ? "1px solid #ef4444" : "1px solid #334155",
                      }}>
                      <option value="">-- Chọn --</option>
                      {categories
                        .filter(c => c.parent_id !== null) // chỉ lấy leaf
                        .map(c => (
                          <option key={c.category_id} value={c.category_id}>{c.name}</option>
                        ))}
                    </select>
                    {errors[`line_cat_${idx}`] && (
                      <p className="text-[9px]" style={{ color: "#ef4444" }}>{errors[`line_cat_${idx}`]}</p>
                    )}
                  </div>

                  {/* Diễn giải */}
                  <input value={line.description}
                    onChange={e => update_line(idx, "description", e.target.value)}
                    disabled={is_locked}
                    placeholder="Ghi chú thêm..."
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={InputStyle}
                    onKeyDown={e => e.key === "Tab" && idx === lines.length - 1 && !is_locked && them_dong()} />

                  {/* Số tiền */}
                  <input type="number" min={0}
                    value={line.amount || ""}
                    onChange={e => update_line(idx, "amount", Number(e.target.value))}
                    disabled={is_locked}
                    placeholder="0"
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none text-right"
                    style={{
                      ...InputStyle,
                      color: mau_type,
                      fontVariantNumeric: "tabular-nums",
                      border: errors[`line_amt_${idx}`] ? "1px solid #ef4444" : "1px solid #334155",
                    }} />

                  {/* VNĐ quy đổi */}
                  {currency !== "VND" ? (
                    <p className="text-right text-[11px]"
                      style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                      {fmt_vnd(line.amount_vnd)}
                    </p>
                  ) : <div />}

                  {/* Xóa dòng */}
                  {!is_locked && lines.length > 1 ? (
                    <button onClick={() => xoa_dong(idx)}
                      className="flex items-center justify-center w-6 h-6 rounded hover:bg-red-900/20"
                      style={{ color: "#334155" }}>
                      <Trash2 size={11} />
                    </button>
                  ) : <div />}
                </div>
              ))}
            </div>

            {errors.total && (
              <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#ef4444" }}>
                <AlertCircle size={9} />{errors.total}
              </p>
            )}

            {/* Footer: Tổng tự động */}
            <div className="flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <p className="text-xs font-black text-white">TỔNG CỘNG</p>
              <div className="text-right">
                {currency !== "VND" && (
                  <p className="text-[11px]" style={{ color: "#64748b" }}>
                    {currency} {new Intl.NumberFormat("en-US").format(total_amount)}
                  </p>
                )}
                <p className="text-base font-black"
                  style={{ color: mau_type, fontVariantNumeric: "tabular-nums" }}>
                  {fmt_vnd(total_vnd)}đ
                </p>
              </div>
            </div>
          </div>

          {/* ── Upload đính kèm ── */}
          <div>
            <p className="text-[10px] font-black uppercase mb-2 tracking-wide" style={{ color: "#475569" }}>
              Đính kèm chứng từ
            </p>
            <div className="flex items-center justify-center gap-3 py-6 rounded-xl cursor-pointer"
              style={{ border: "2px dashed #1e293b", background: "#0f172a" }}>
              <Upload size={16} style={{ color: "#334155" }} />
              <p className="text-xs" style={{ color: "#475569" }}>
                Kéo thả hóa đơn đỏ, UNC, hoặc click để chọn
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        {!is_locked && (
          <div className="flex items-center gap-2 px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: "#1e293b", background: "#0a1628" }}>
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              Huỷ
            </button>
            <div className="flex-1" />
            <button onClick={() => handle_save(false)} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
              <Save size={14} />
              {saving ? "Đang lưu..." : "Lưu nháp"}
            </button>
            <button onClick={() => handle_save(true)} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-black disabled:opacity-40"
              style={{ background: mau_type + "20", color: mau_type, border: `1px solid ${mau_type}40` }}>
              <Send size={14} />
              Lưu & Gửi duyệt
            </button>
          </div>
        )}
        {is_locked && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-t"
            style={{ borderColor: "#1e293b" }}>
            <CheckCircle size={13} style={{ color: "#10b981" }} />
            <p className="text-xs font-bold" style={{ color: "#10b981" }}>
              Phiếu đã được duyệt — dữ liệu đóng băng
            </p>
          </div>
        )}

        {/* Toast error */}
        {toast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-2xl"
            style={{ background: "#7f1d1d", border: "1px solid #ef444440" }}>
            <AlertCircle size={13} style={{ color: "#fca5a5" }} />
            <p className="text-xs font-bold" style={{ color: "#fca5a5" }}>{toast}</p>
          </div>
        )}
      </div>
    </div>
  );
}