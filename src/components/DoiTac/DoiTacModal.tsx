import { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Package,
  Wrench,
  Palette,
  ChevronDown,
  Plus,
  Trash2,
} from "lucide-react";
import type { DoiTac, DoiTacFormData, LoaiDoiTac } from "./types";
import { getTenDoiTac } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editDT?: DoiTac | null;
  onSave: (data: DoiTacFormData) => void;
}

// ── UI primitives ─────────────────────────────────────────
const Field = ({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
      {required && <span className="text-rose-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  "w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all";
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={inputCls} />
);
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} rows={2} className={`${inputCls} resize-none`} />
);
const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} appearance-none`}
    >
      <option value="">-- Chọn --</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <ChevronDown
      size={13}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
    />
  </div>
);

// ── Optional field: checkbox Không có ────────────────────
const OptField = ({
  label,
  children,
  checked,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  checked: boolean;
  onToggle: () => void;
}) => {
  const uid = "opt-" + label.replace(/[^a-zA-Z0-9]/g, "-");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <label
          htmlFor={uid}
          className="flex items-center gap-1.5 cursor-pointer select-none"
        >
          <input
            id={uid}
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            className="w-3.5 h-3.5 cursor-pointer accent-slate-500"
          />
          <span className="text-[10px] text-slate-500">Không có</span>
        </label>
      </div>
      {!checked && children}
    </div>
  );
};

// ── NoteField: textarea + Không có ───────────────────────
const NoteField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => {
  const isNone = value === "__none__";
  const uid = "nf-dt-" + label.replace(/[^a-zA-Z0-9]/g, "-");
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <label
          htmlFor={uid}
          className="flex items-center gap-1.5 cursor-pointer select-none"
        >
          <input
            id={uid}
            type="checkbox"
            checked={isNone}
            onChange={(e) => onChange(e.target.checked ? "__none__" : "")}
            className="w-3.5 h-3.5 cursor-pointer accent-slate-500"
          />
          <span className="text-[10px] text-slate-500">Không có</span>
        </label>
      </div>
      <Textarea
        value={isNone ? "" : value}
        disabled={isNone}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isNone ? "Đã đánh dấu không có" : "Nhập nội dung..."}
      />
    </div>
  );
};

// ── SectionHeader với toggle Không có ────────────────────
const SectionHeader = ({
  label,
  disabled,
  onToggle,
}: {
  label: string;
  disabled: boolean;
  onToggle: () => void;
}) => (
  <div className="flex items-center justify-between border-b border-slate-800 pb-1 pt-2">
    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
      {label}
    </p>
    <label className="flex items-center gap-1.5 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={disabled}
        onChange={onToggle}
        className="w-3.5 h-3.5 cursor-pointer accent-slate-500"
      />
      <span className="text-[10px] text-slate-500">Không có</span>
    </label>
  </div>
);

// ── Quy trình duyệt mẫu ───────────────────────────────────
const QuyTrinhEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const isNone = value === "__none__";
  const steps: { stt: number; buoc: string }[] = (() => {
    if (isNone || !value) return [];
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })();
  const uid = "qt-none";
  const save = (arr: { stt: number; buoc: string }[]) =>
    onChange(JSON.stringify(arr));
  const addStep = () => save([...steps, { stt: steps.length + 1, buoc: "" }]);
  const updateStep = (i: number, buoc: string) =>
    save(steps.map((s, idx) => (idx === i ? { ...s, buoc } : s)));
  const removeStep = (i: number) =>
    save(
      steps
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, stt: idx + 1 })),
    );

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Quy trình duyệt mẫu
        </span>
        <label
          htmlFor={uid}
          className="flex items-center gap-1.5 cursor-pointer select-none"
        >
          <input
            id={uid}
            type="checkbox"
            checked={isNone}
            onChange={(e) => onChange(e.target.checked ? "__none__" : "[]")}
            className="w-3.5 h-3.5 cursor-pointer accent-slate-500"
          />
          <span className="text-[10px] text-slate-500">Không có</span>
        </label>
      </div>
      {!isNone && (
        <div className="space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-600 w-5 text-center">
                {s.stt}
              </span>
              <input
                value={s.buoc}
                onChange={(e) => updateStep(i, e.target.value)}
                placeholder={`Bước ${s.stt}...`}
                className={`${inputCls} flex-1 py-2`}
              />
              <button
                type="button"
                onClick={() => removeStep(i)}
                className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addStep}
            className="flex items-center gap-1.5 text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-all px-1"
          >
            <Plus size={12} /> Thêm bước
          </button>
        </div>
      )}
    </div>
  );
};

// ── Build form ────────────────────────────────────────────
const nullToUndef = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v]),
  );

const buildForm = (dt?: DoiTac | null): DoiTacFormData => {
  if (!dt) return { loai: "CungUng" };
  const base = { loai: dt.loai, ma: dt.ma };
  if (dt.cungUng)
    return {
      ...base,
      ...nullToUndef(dt.cungUng as unknown as Record<string, unknown>),
    } as DoiTacFormData;
  if (dt.giaCong)
    return {
      ...base,
      ...nullToUndef(dt.giaCong as unknown as Record<string, unknown>),
    } as DoiTacFormData;
  if (dt.thietKe)
    return {
      ...base,
      ...nullToUndef(dt.thietKe as unknown as Record<string, unknown>),
    } as DoiTacFormData;
  return base;
};

// ── Main Modal ────────────────────────────────────────────
export const DoiTacModal = ({ isOpen, onClose, editDT, onSave }: Props) => {
  const [form, setForm] = useState<DoiTacFormData>(buildForm(editDT));

  const set = (key: keyof DoiTacFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Section disabled flags
  const phanLoaiDisabled = form._phanLoaiCungUngDisabled ?? false;
  const chatLuongCUDisabled = form._chatLuongCungUngDisabled ?? false;
  const kyThuatDisabled = form._kyThuatGiaCongDisabled ?? false;
  const chatLuongGCDisabled = form._chatLuongGiaCongDisabled ?? false;

  const toggleSection = (
    key:
      | "_phanLoaiCungUngDisabled"
      | "_chatLuongCungUngDisabled"
      | "_kyThuatGiaCongDisabled"
      | "_chatLuongGiaCongDisabled",
  ) => set(key, !form[key]);

  const handleSave = () => {
    const ten = form.tenNhaCungCap || form.tenXuong || form.tenStudio;
    if (!ten?.trim()) return alert("Vui lòng nhập tên!");
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  const loaiOptions: {
    value: LoaiDoiTac;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { value: "CungUng", label: "Cung ứng NPL", icon: <Package size={14} /> },
    { value: "GiaCong", label: "Gia công", icon: <Wrench size={14} /> },
    { value: "ThietKe", label: "Thiết kế", icon: <Palette size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <p className="text-sm font-bold text-white">
            {editDT ? `Sửa: ${getTenDoiTac(editDT)}` : "Thêm đối tác"}
          </p>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Chọn loại */}
          {!editDT && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Loại đối tác *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {loaiOptions.map(({ value, label, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm({ loai: value })}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      form.loai === value
                        ? "bg-violet-500/10 border-violet-500/40 text-violet-300"
                        : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
                    }`}
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mã */}
          <Field label="Mã đối tác">
            <Input
              value={form.ma || ""}
              onChange={(e) => set("ma", e.target.value)}
              placeholder="Tự động sinh nếu để trống"
            />
          </Field>

          {/* ════ CUNG ỨNG ════ */}
          {form.loai === "CungUng" && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Thông tin cơ bản
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên nhà cung cấp" required>
                  <Input
                    value={form.tenNhaCungCap || ""}
                    onChange={(e) => set("tenNhaCungCap", e.target.value)}
                  />
                </Field>
                <Field label="Quốc gia xuất xứ">
                  <Input
                    value={form.quocGiaXuatXu || ""}
                    onChange={(e) => set("quocGiaXuatXu", e.target.value)}
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Địa chỉ nhà máy">
                    <Input
                      value={form.diaChiNhaMay || ""}
                      onChange={(e) => set("diaChiNhaMay", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <OptField
                  label="Năm thành lập"
                  checked={form.namThanhLap === null}
                  onToggle={() =>
                    set("namThanhLap", form.namThanhLap === null ? "" : null)
                  }
                >
                  <Input
                    type="number"
                    value={form.namThanhLap || ""}
                    onChange={(e) => set("namThanhLap", Number(e.target.value))}
                    placeholder="2010"
                  />
                </OptField>
                <OptField
                  label="Năm bắt đầu hợp tác"
                  checked={form.namBatDauHopTac === null}
                  onToggle={() =>
                    set(
                      "namBatDauHopTac",
                      form.namBatDauHopTac === null ? "" : null,
                    )
                  }
                >
                  <Input
                    type="number"
                    value={form.namBatDauHopTac || ""}
                    onChange={(e) =>
                      set("namBatDauHopTac", Number(e.target.value))
                    }
                    placeholder="2022"
                  />
                </OptField>
                <OptField
                  label="Chứng nhận chất lượng"
                  checked={form.chungNhanChatLuong === null}
                  onToggle={() =>
                    set(
                      "chungNhanChatLuong",
                      form.chungNhanChatLuong === null ? "" : null,
                    )
                  }
                >
                  <Input
                    value={form.chungNhanChatLuong || ""}
                    onChange={(e) => set("chungNhanChatLuong", e.target.value)}
                    placeholder="ISO 9001, OEKO-TEX..."
                  />
                </OptField>
                <OptField
                  label="Năng lực sản xuất/tháng"
                  checked={form.nangLucSanXuatThang === null}
                  onToggle={() =>
                    set(
                      "nangLucSanXuatThang",
                      form.nangLucSanXuatThang === null ? "" : null,
                    )
                  }
                >
                  <Input
                    value={form.nangLucSanXuatThang || ""}
                    onChange={(e) => set("nangLucSanXuatThang", e.target.value)}
                    placeholder="50,000m vải/tháng"
                  />
                </OptField>
              </div>

              <SectionHeader
                label="Phân loại cung ứng"
                disabled={phanLoaiDisabled}
                onToggle={() => toggleSection("_phanLoaiCungUngDisabled")}
              />
              {!phanLoaiDisabled && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      key: "vai",
                      label: "Vải",
                      placeholder: "cotton, kaki, denim...",
                    },
                    { key: "chiMay", label: "Chỉ may", placeholder: "" },
                    {
                      key: "cubNutDayKeo",
                      label: "Cúc, nút, dây kéo",
                      placeholder: "",
                    },
                    { key: "temNhan", label: "Tem nhãn", placeholder: "" },
                    {
                      key: "baoBiDongGoi",
                      label: "Bao bì đóng gói",
                      placeholder: "",
                    },
                    {
                      key: "phuLieuTrangTri",
                      label: "Phụ liệu trang trí",
                      placeholder: "ren, viền, thêu...",
                    },
                    {
                      key: "hoaChatGiat",
                      label: "Hóa chất giặt – xử lý vải",
                      placeholder: "",
                    },
                  ].map(({ key, label }) => (
                    <NoteField
                      key={key}
                      label={label}
                      value={
                        (form[key as keyof DoiTacFormData] as string) ?? ""
                      }
                      onChange={(v) => set(key as keyof DoiTacFormData, v)}
                    />
                  ))}
                </div>
              )}

              <SectionHeader
                label="Quản lý chất lượng"
                disabled={chatLuongCUDisabled}
                onToggle={() => toggleSection("_chatLuongCungUngDisabled")}
              />
              {!chatLuongCUDisabled && (
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Có phòng lab kiểm tra">
                    <Select
                      value={form.coPhongLab || ""}
                      onChange={(v) => set("coPhongLab", v)}
                      options={[
                        { value: "Có", label: "Có" },
                        { value: "Không", label: "Không" },
                      ]}
                    />
                  </Field>
                  <OptField
                    label="Tỷ lệ lỗi nguyên liệu (%)"
                    checked={form.tyLeLoi === null}
                    onToggle={() =>
                      set("tyLeLoi", form.tyLeLoi === null ? "" : null)
                    }
                  >
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tyLeLoi || ""}
                      onChange={(e) =>
                        set("tyLeLoi", parseFloat(e.target.value))
                      }
                    />
                  </OptField>
                  <OptField
                    label="Thời gian giao hàng TB"
                    checked={form.thoiGianGiaoHang === null}
                    onToggle={() =>
                      set(
                        "thoiGianGiaoHang",
                        form.thoiGianGiaoHang === null ? "" : null,
                      )
                    }
                  >
                    <Input
                      value={form.thoiGianGiaoHang || ""}
                      onChange={(e) => set("thoiGianGiaoHang", e.target.value)}
                      placeholder="7-10 ngày"
                    />
                  </OptField>
                  <Field label="Kiểm tra mẫu trước SX hàng loạt">
                    <Select
                      value={form.kiemTraMauTruoc || ""}
                      onChange={(v) => set("kiemTraMauTruoc", v)}
                      options={[
                        { value: "Có", label: "Có" },
                        { value: "Không", label: "Không" },
                      ]}
                    />
                  </Field>
                  <div className="col-span-2">
                    <NoteField
                      label="Chính sách đổi trả khi lỗi"
                      value={form.chinhSachDoiTra ?? ""}
                      onChange={(v) => set("chinhSachDoiTra", v)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* ════ GIA CÔNG ════ */}
          {form.loai === "GiaCong" && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Thông tin chung
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên xưởng" required>
                  <Input
                    value={form.tenXuong || ""}
                    onChange={(e) => set("tenXuong", e.target.value)}
                  />
                </Field>
                <Field label="Số lượng chuyền may">
                  <Input
                    type="number"
                    value={form.soLuongChuyen || ""}
                    onChange={(e) =>
                      set("soLuongChuyen", Number(e.target.value))
                    }
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Địa chỉ xưởng">
                    <Input
                      value={form.diaChiXuong || ""}
                      onChange={(e) => set("diaChiXuong", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <OptField
                  label="Số lượng công nhân"
                  checked={form.soLuongCongNhan === null}
                  onToggle={() =>
                    set(
                      "soLuongCongNhan",
                      form.soLuongCongNhan === null ? "" : null,
                    )
                  }
                >
                  <Input
                    type="number"
                    value={form.soLuongCongNhan || ""}
                    onChange={(e) =>
                      set("soLuongCongNhan", Number(e.target.value))
                    }
                  />
                </OptField>
                <OptField
                  label="Công suất sản xuất/ngày"
                  checked={form.congSuatNgay === null}
                  onToggle={() =>
                    set("congSuatNgay", form.congSuatNgay === null ? "" : null)
                  }
                >
                  <Input
                    type="number"
                    value={form.congSuatNgay || ""}
                    onChange={(e) =>
                      set("congSuatNgay", Number(e.target.value))
                    }
                    placeholder="sp/ngày"
                  />
                </OptField>
                <OptField
                  label="Công suất sản xuất/tháng"
                  checked={form.congSuatThang === null}
                  onToggle={() =>
                    set(
                      "congSuatThang",
                      form.congSuatThang === null ? "" : null,
                    )
                  }
                >
                  <Input
                    type="number"
                    value={form.congSuatThang || ""}
                    onChange={(e) =>
                      set("congSuatThang", Number(e.target.value))
                    }
                    placeholder="sp/tháng"
                  />
                </OptField>
                <OptField
                  label="Loại sản phẩm chuyên may"
                  checked={form.loaiSanPham === null}
                  onToggle={() =>
                    set("loaiSanPham", form.loaiSanPham === null ? "" : null)
                  }
                >
                  <Input
                    value={form.loaiSanPham || ""}
                    onChange={(e) => set("loaiSanPham", e.target.value)}
                    placeholder="Áo, quần, đồng phục..."
                  />
                </OptField>
                <div className="col-span-2">
                  <Field label="Có phòng QC riêng không">
                    <Select
                      value={form.coPhongQC || ""}
                      onChange={(v) => set("coPhongQC", v)}
                      options={[
                        { value: "Có", label: "Có" },
                        { value: "Không", label: "Không" },
                      ]}
                    />
                  </Field>
                </div>
              </div>

              <SectionHeader
                label="Năng lực kỹ thuật"
                disabled={kyThuatDisabled}
                onToggle={() => toggleSection("_kyThuatGiaCongDisabled")}
              />
              {!kyThuatDisabled && (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "mayMay1Kim", label: "Máy may 1 kim" },
                    { key: "mayMay2Kim", label: "Máy may 2 kim" },
                    { key: "mayVatSo", label: "Máy vắt sổ" },
                    { key: "mayKansai", label: "Máy kansai" },
                    { key: "mayThuaKhuy", label: "Máy thùa khuy" },
                    { key: "mayDinhNut", label: "Máy đính nút" },
                    { key: "mayInChuyenNhiet", label: "Máy in chuyển nhiệt" },
                    { key: "mayTheuViTinh", label: "Máy thêu vi tính" },
                    { key: "mayGiatCongNghiep", label: "Máy giặt công nghiệp" },
                  ].map(({ key, label }) => (
                    <Field key={key} label={`${label} (chiếc)`}>
                      <Input
                        type="number"
                        value={
                          (form[key as keyof DoiTacFormData] as string) || ""
                        }
                        onChange={(e) =>
                          set(
                            key as keyof DoiTacFormData,
                            Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  ))}
                </div>
              )}

              <SectionHeader
                label="Quản lý chất lượng"
                disabled={chatLuongGCDisabled}
                onToggle={() => toggleSection("_chatLuongGiaCongDisabled")}
              />
              {!chatLuongGCDisabled && (
                <div className="grid grid-cols-2 gap-4">
                  <OptField
                    label="Tỷ lệ lỗi trung bình (%)"
                    checked={form.tyLeLoi === null}
                    onToggle={() =>
                      set("tyLeLoi", form.tyLeLoi === null ? "" : null)
                    }
                  >
                    <Input
                      type="number"
                      step="0.1"
                      value={form.tyLeLoi || ""}
                      onChange={(e) =>
                        set("tyLeLoi", parseFloat(e.target.value))
                      }
                    />
                  </OptField>
                  <OptField
                    label="Quy trình kiểm tra 3 bước"
                    checked={form.quyTrinh3Buoc === null}
                    onToggle={() =>
                      set(
                        "quyTrinh3Buoc",
                        form.quyTrinh3Buoc === null ? "" : null,
                      )
                    }
                  >
                    <Input
                      value={form.quyTrinh3Buoc || ""}
                      onChange={(e) => set("quyTrinh3Buoc", e.target.value)}
                      placeholder="Inline / Final / Packing"
                    />
                  </OptField>
                  <OptField
                    label="Tiêu chuẩn may áp dụng"
                    checked={form.tieuChuanMay === null}
                    onToggle={() =>
                      set(
                        "tieuChuanMay",
                        form.tieuChuanMay === null ? "" : null,
                      )
                    }
                  >
                    <Input
                      value={form.tieuChuanMay || ""}
                      onChange={(e) => set("tieuChuanMay", e.target.value)}
                    />
                  </OptField>
                  <OptField
                    label="Đạt audit khách hàng"
                    checked={form.datAuditKhachHang === null}
                    onToggle={() =>
                      set(
                        "datAuditKhachHang",
                        form.datAuditKhachHang === null ? "" : null,
                      )
                    }
                  >
                    <Select
                      value={form.datAuditKhachHang || ""}
                      onChange={(v) => set("datAuditKhachHang", v)}
                      options={[
                        { value: "Có", label: "Có" },
                        { value: "Không", label: "Không" },
                      ]}
                    />
                  </OptField>
                  <OptField
                    label="Kinh nghiệm hàng xuất khẩu"
                    checked={form.kinhNghiemXuatKhau === null}
                    onToggle={() =>
                      set(
                        "kinhNghiemXuatKhau",
                        form.kinhNghiemXuatKhau === null ? "" : null,
                      )
                    }
                  >
                    <Select
                      value={form.kinhNghiemXuatKhau || ""}
                      onChange={(v) => set("kinhNghiemXuatKhau", v)}
                      options={[
                        { value: "Có", label: "Có" },
                        { value: "Không", label: "Không" },
                      ]}
                    />
                  </OptField>
                </div>
              )}
            </>
          )}

          {/* ════ THIẾT KẾ ════ */}
          {form.loai === "ThietKe" && (
            <>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Thông tin
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên studio / Designer" required>
                  <Input
                    value={form.tenStudio || ""}
                    onChange={(e) => set("tenStudio", e.target.value)}
                  />
                </Field>
                <Field label="Lĩnh vực chuyên môn">
                  <Input
                    value={form.linhVucChuyenMon || ""}
                    onChange={(e) => set("linhVucChuyenMon", e.target.value)}
                    placeholder="Streetwear, Đồng phục..."
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <OptField
                  label="Số năm kinh nghiệm"
                  checked={form.soNamKinhNghiem === null}
                  onToggle={() =>
                    set(
                      "soNamKinhNghiem",
                      form.soNamKinhNghiem === null ? "" : null,
                    )
                  }
                >
                  <Input
                    type="number"
                    value={form.soNamKinhNghiem || ""}
                    onChange={(e) =>
                      set("soNamKinhNghiem", Number(e.target.value))
                    }
                  />
                </OptField>
                <OptField
                  label="Thời gian hoàn thành 1 mẫu"
                  checked={form.thoiGianHoanThanh === null}
                  onToggle={() =>
                    set(
                      "thoiGianHoanThanh",
                      form.thoiGianHoanThanh === null ? "" : null,
                    )
                  }
                >
                  <Input
                    value={form.thoiGianHoanThanh || ""}
                    onChange={(e) => set("thoiGianHoanThanh", e.target.value)}
                    placeholder="5-7 ngày"
                  />
                </OptField>
                <OptField
                  label="Khả năng thiết kế rập"
                  checked={form.khaNangThietKeRap === null}
                  onToggle={() =>
                    set(
                      "khaNangThietKeRap",
                      form.khaNangThietKeRap === null ? "" : null,
                    )
                  }
                >
                  <Select
                    value={form.khaNangThietKeRap || ""}
                    onChange={(v) => set("khaNangThietKeRap", v)}
                    options={[
                      { value: "Có", label: "Có" },
                      { value: "Không", label: "Không" },
                    ]}
                  />
                </OptField>
                <OptField
                  label="Khả năng làm mẫu thử"
                  checked={form.khaNangLamMauThu === null}
                  onToggle={() =>
                    set(
                      "khaNangLamMauThu",
                      form.khaNangLamMauThu === null ? "" : null,
                    )
                  }
                >
                  <Select
                    value={form.khaNangLamMauThu || ""}
                    onChange={(v) => set("khaNangLamMauThu", v)}
                    options={[
                      { value: "Có", label: "Có" },
                      { value: "Không", label: "Không" },
                    ]}
                  />
                </OptField>
                <div className="col-span-2">
                  <OptField
                    label="Dự án đã thực hiện"
                    checked={form.duAnDaThucHien === null}
                    onToggle={() =>
                      set(
                        "duAnDaThucHien",
                        form.duAnDaThucHien === null ? "" : null,
                      )
                    }
                  >
                    <Textarea
                      value={form.duAnDaThucHien || ""}
                      onChange={(e) => set("duAnDaThucHien", e.target.value)}
                      placeholder="Liệt kê các dự án nổi bật..."
                    />
                  </OptField>
                </div>
                <div className="col-span-2">
                  <OptField
                    label="Phần mềm sử dụng"
                    checked={form.phanMemSuDung === null}
                    onToggle={() =>
                      set(
                        "phanMemSuDung",
                        form.phanMemSuDung === null ? "" : null,
                      )
                    }
                  >
                    <Input
                      value={form.phanMemSuDung || ""}
                      onChange={(e) => set("phanMemSuDung", e.target.value)}
                      placeholder="Gerber, Lectra, Clo3D..."
                    />
                  </OptField>
                </div>
                <div className="col-span-2">
                  <QuyTrinhEditor
                    value={form.quyTrinhDuyetMau ?? "[]"}
                    onChange={(v) => set("quyTrinhDuyetMau", v)}
                  />
                </div>
                <div className="col-span-2">
                  <NoteField
                    label="Chính sách bảo mật thiết kế"
                    value={form.chinhSachBaoMat ?? ""}
                    onChange={(v) => set("chinhSachBaoMat", v)}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-all text-sm shadow-lg shadow-violet-600/20"
          >
            {editDT ? "Lưu thay đổi" : "Thêm đối tác"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
