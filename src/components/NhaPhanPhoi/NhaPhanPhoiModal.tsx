import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown } from "lucide-react";
import type { NhaPhanPhoi, NhaPhanPhoiFormData } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editNPP?: NhaPhanPhoi | null;
  onSave: (data: NhaPhanPhoiFormData) => void;
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

// ── NoteField: textarea + checkbox "Không có" ─────────────
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
  const uid = "nf-npp-" + label.replace(/[^a-zA-Z0-9]/g, "-");
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

// ── SectionToggle: toggle cả section ─────────────────────
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

// ── MultiSelect chips ─────────────────────────────────────
const MultiSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  options: string[];
}) => (
  <div className="space-y-1.5">
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() =>
              onChange(
                active ? value.filter((v) => v !== opt) : [...value, opt],
              )
            }
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              active
                ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Build form from existing record ──────────────────────
const n2u = (obj: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v]),
  );

const buildForm = (npp?: NhaPhanPhoi | null): NhaPhanPhoiFormData => {
  if (!npp) return { ma: "", tenCongTy: "", trangThai: "active" };
  return {
    ...n2u(npp as unknown as Record<string, unknown>),
  } as NhaPhanPhoiFormData;
};

// ── Main Modal ────────────────────────────────────────────
export const NhaPhanPhoiModal = ({
  isOpen,
  onClose,
  editNPP,
  onSave,
}: Props) => {
  const [form, setForm] = useState<NhaPhanPhoiFormData>(buildForm(editNPP));

  const set = (key: keyof NhaPhanPhoiFormData, value: unknown) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Section disabled: null = không có
  const phamViDisabled =
    form.phanPhoiDocQuyen === null &&
    form.phanPhoiKhuVuc === null &&
    form.kenhPhanPhoi === null;
  const nangLucDisabled =
    form.dienTichKho === null && form.coHeThongWMS === null;
  const chinhSachDisabled =
    form.chinhSachChietKhau === null && form.dieuKhoanChamDut === null;

  const toggleSection = (section: "phamVi" | "nangLuc" | "chinhSach") => {
    if (section === "phamVi") {
      const now = !phamViDisabled;
      const val = now ? null : "";
      setForm((p) => ({
        ...p,
        phanPhoiDocQuyen: val,
        phanPhoiKhuVuc: val,
        phanPhoiNganhHang: val,
        hinhThucBanHang: val,
        coDaiLyCon: val,
        kenhPhanPhoi: val,
      }));
    }
    if (section === "nangLuc") {
      const now = !nangLucDisabled;
      setForm((p) => ({
        ...p,
        dienTichKho: now ? null : undefined,
        sucChuaToiDa: now ? null : "",
        sanLuongTieuThuThang: now ? null : undefined,
        sanLuongTieuThuNam: now ? null : undefined,
        khaNangGiaoHangNgay: now ? null : undefined,
        thoiGianXuLyDon: now ? null : "",
        doiNguNhanSu: now ? null : "",
        phuongTienVanChuyen: now ? null : "",
        coHeThongWMS: now ? null : "",
      }));
    }
    if (section === "chinhSach") {
      const now = !chinhSachDisabled;
      setForm((p) => ({
        ...p,
        chinhSachChietKhau: now ? null : "",
        chinhSachCongNo: now ? null : "",
        thoiHanThanhToan: now ? null : "",
        mucTonKhoToiThieu: now ? null : "",
        chinhSachDoiTra: now ? null : "",
        dieuKhoanBaoHanh: now ? null : "",
        dieuKhoanBaoMat: now ? null : "",
        dieuKhoanChamDut: now ? null : "",
      }));
    }
  };

  const handleSave = () => {
    if (!form.tenCongTy?.trim()) return alert("Vui lòng nhập tên công ty!");
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  // Helper parse/stringify cho JSON arrays
  const getArr = (key: keyof NhaPhanPhoiFormData): string[] => {
    const v = form[key] as string | undefined | null;
    if (!v) return [];
    try {
      return JSON.parse(v);
    } catch {
      return [];
    }
  };
  const setArr = (key: keyof NhaPhanPhoiFormData, arr: string[]) =>
    set(key, arr.length ? JSON.stringify(arr) : "");

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
            {editNPP ? `Sửa: ${editNPP.tenCongTy}` : "Thêm nhà phân phối"}
          </p>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── Thông tin chung ── */}
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
              Thông tin chung
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tên công ty phân phối" required>
              <Input
                value={form.tenCongTy || ""}
                onChange={(e) => set("tenCongTy", e.target.value)}
                placeholder="Công ty TNHH..."
              />
            </Field>
            <Field label="Mã đối tác nội bộ">
              <Input
                value={form.ma || ""}
                onChange={(e) => set("ma", e.target.value)}
                placeholder="Tự động sinh nếu để trống"
              />
            </Field>
            <Field label="Người phụ trách chính">
              <Input
                value={form.nguoiPhuTrach || ""}
                onChange={(e) => set("nguoiPhuTrach", e.target.value)}
              />
            </Field>
            <Field label="Chức vụ người liên hệ">
              <Input
                value={form.chucVuLienHe || ""}
                onChange={(e) => set("chucVuLienHe", e.target.value)}
              />
            </Field>
            <Field label="Email liên hệ">
              <Input
                type="email"
                value={form.email || ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="Số điện thoại">
              <Input
                value={form.sdt || ""}
                onChange={(e) => set("sdt", e.target.value)}
              />
            </Field>
            <Field label="Website chính thức">
              <Input
                value={form.website || ""}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://..."
              />
            </Field>
            <Field label="Quốc gia / Khu vực hoạt động">
              <Input
                value={form.quocGiaKhuVuc || ""}
                onChange={(e) => set("quocGiaKhuVuc", e.target.value)}
              />
            </Field>
            <Field label="Năm bắt đầu hợp tác">
              <Input
                type="number"
                value={form.namBatDauHopTac || ""}
                onChange={(e) => set("namBatDauHopTac", Number(e.target.value))}
                placeholder="2020"
              />
            </Field>
            <Field label="Thời hạn hợp đồng">
              <Input
                value={form.thoiHanHopDong || ""}
                onChange={(e) => set("thoiHanHopDong", e.target.value)}
                placeholder="2 năm / 31/12/2026..."
              />
            </Field>
            <div className="col-span-2">
              <Field label="Địa chỉ trụ sở chính">
                <Input
                  value={form.diaChiTruSo || ""}
                  onChange={(e) => set("diaChiTruSo", e.target.value)}
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Địa chỉ kho hàng">
                <Input
                  value={form.diaChiKho || ""}
                  onChange={(e) => set("diaChiKho", e.target.value)}
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Tình trạng hợp tác">
                <Select
                  value={form.trangThai || "active"}
                  onChange={(v) => set("trangThai", v)}
                  options={[
                    { value: "active", label: "Đang hoạt động" },
                    { value: "tamNgung", label: "Tạm ngưng" },
                    { value: "ketThuc", label: "Kết thúc" },
                  ]}
                />
              </Field>
            </div>
          </div>

          {/* ── Phạm vi & hình thức phân phối ── */}
          <SectionHeader
            label="Phạm vi & hình thức phân phối"
            disabled={phamViDisabled}
            onToggle={() => toggleSection("phamVi")}
          />
          {!phamViDisabled && (
            <div className="space-y-4">
              <Field label="Phân phối độc quyền">
                <Select
                  value={form.phanPhoiDocQuyen || ""}
                  onChange={(v) => set("phanPhoiDocQuyen", v)}
                  options={[
                    { value: "Độc quyền", label: "Độc quyền" },
                    { value: "Không độc quyền", label: "Không độc quyền" },
                  ]}
                />
              </Field>
              <MultiSelect
                label="Phân phối theo khu vực"
                value={getArr("phanPhoiKhuVuc")}
                onChange={(v) => setArr("phanPhoiKhuVuc", v)}
                options={["Miền Bắc", "Miền Trung", "Miền Nam", "Quốc tế"]}
              />
              <MultiSelect
                label="Phân phối theo ngành hàng"
                value={getArr("phanPhoiNganhHang")}
                onChange={(v) => setArr("phanPhoiNganhHang", v)}
                options={["Đồng phục", "Thời trang", "Xuất khẩu", "Gia công"]}
              />
              <MultiSelect
                label="Hình thức bán hàng"
                value={getArr("hinhThucBanHang")}
                onChange={(v) => setArr("hinhThucBanHang", v)}
                options={["Sỉ", "Lẻ", "Đại lý cấp 1", "Đại lý cấp 2"]}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Có hệ thống đại lý con không">
                  <Select
                    value={form.coDaiLyCon || ""}
                    onChange={(v) => set("coDaiLyCon", v)}
                    options={[
                      { value: "Có", label: "Có" },
                      { value: "Không", label: "Không" },
                    ]}
                  />
                </Field>
                <Field label="Số lượng đại lý trực thuộc">
                  <Input
                    type="number"
                    value={form.soLuongDaiLy || ""}
                    onChange={(e) =>
                      set("soLuongDaiLy", Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <MultiSelect
                label="Kênh phân phối"
                value={getArr("kenhPhanPhoi")}
                onChange={(v) => setArr("kenhPhanPhoi", v)}
                options={["Offline", "Online", "TMĐT", "Showroom"]}
              />
            </div>
          )}

          {/* ── Năng lực phân phối ── */}
          <SectionHeader
            label="Năng lực phân phối"
            disabled={nangLucDisabled}
            onToggle={() => toggleSection("nangLuc")}
          />
          {!nangLucDisabled && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Diện tích kho hàng (m²)">
                <Input
                  type="number"
                  value={form.dienTichKho || ""}
                  onChange={(e) => set("dienTichKho", Number(e.target.value))}
                />
              </Field>
              <Field label="Sức chứa tối đa">
                <Input
                  value={form.sucChuaToiDa || ""}
                  onChange={(e) => set("sucChuaToiDa", e.target.value)}
                  placeholder="10,000 sp / 5 tấn"
                />
              </Field>
              <Field label="Sản lượng tiêu thụ/tháng">
                <Input
                  type="number"
                  value={form.sanLuongTieuThuThang || ""}
                  onChange={(e) =>
                    set("sanLuongTieuThuThang", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Sản lượng tiêu thụ/năm">
                <Input
                  type="number"
                  value={form.sanLuongTieuThuNam || ""}
                  onChange={(e) =>
                    set("sanLuongTieuThuNam", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Khả năng giao hàng/ngày (đơn)">
                <Input
                  type="number"
                  value={form.khaNangGiaoHangNgay || ""}
                  onChange={(e) =>
                    set("khaNangGiaoHangNgay", Number(e.target.value))
                  }
                />
              </Field>
              <Field label="Thời gian xử lý đơn hàng">
                <Input
                  value={form.thoiGianXuLyDon || ""}
                  onChange={(e) => set("thoiGianXuLyDon", e.target.value)}
                  placeholder="24h, 2 ngày..."
                />
              </Field>
              <div className="col-span-2">
                <Field label="Đội ngũ nhân sự">
                  <Input
                    value={form.doiNguNhanSu || ""}
                    onChange={(e) => set("doiNguNhanSu", e.target.value)}
                    placeholder="5 sale, 3 vận hành, 8 kho"
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Phương tiện vận chuyển sở hữu">
                  <Input
                    value={form.phuongTienVanChuyen || ""}
                    onChange={(e) => set("phuongTienVanChuyen", e.target.value)}
                    placeholder="3 xe tải, 1 container..."
                  />
                </Field>
              </div>
              <div className="col-span-2">
                <Field label="Có hệ thống quản lý kho (WMS/ERP)">
                  <Select
                    value={form.coHeThongWMS || ""}
                    onChange={(v) => set("coHeThongWMS", v)}
                    options={[
                      { value: "Có", label: "Có" },
                      { value: "Không", label: "Không" },
                    ]}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── Chính sách hợp tác ── */}
          <SectionHeader
            label="Chính sách hợp tác"
            disabled={chinhSachDisabled}
            onToggle={() => toggleSection("chinhSach")}
          />
          {!chinhSachDisabled && (
            <div className="space-y-4">
              <NoteField
                label="Chính sách chiết khấu"
                value={form.chinhSachChietKhau ?? ""}
                onChange={(v) => set("chinhSachChietKhau", v)}
              />
              <NoteField
                label="Chính sách công nợ"
                value={form.chinhSachCongNo ?? ""}
                onChange={(v) => set("chinhSachCongNo", v)}
              />
              <NoteField
                label="Thời hạn thanh toán"
                value={form.thoiHanThanhToan ?? ""}
                onChange={(v) => set("thoiHanThanhToan", v)}
              />
              <NoteField
                label="Mức tồn kho tối thiểu yêu cầu"
                value={form.mucTonKhoToiThieu ?? ""}
                onChange={(v) => set("mucTonKhoToiThieu", v)}
              />
              <NoteField
                label="Chính sách đổi trả"
                value={form.chinhSachDoiTra ?? ""}
                onChange={(v) => set("chinhSachDoiTra", v)}
              />
              <NoteField
                label="Điều khoản bảo hành sản phẩm"
                value={form.dieuKhoanBaoHanh ?? ""}
                onChange={(v) => set("dieuKhoanBaoHanh", v)}
              />
              <NoteField
                label="Điều khoản bảo mật thông tin"
                value={form.dieuKhoanBaoMat ?? ""}
                onChange={(v) => set("dieuKhoanBaoMat", v)}
              />
              <NoteField
                label="Điều khoản chấm dứt hợp tác"
                value={form.dieuKhoanChamDut ?? ""}
                onChange={(v) => set("dieuKhoanChamDut", v)}
              />
            </div>
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
            {editNPP ? "Lưu thay đổi" : "Thêm nhà phân phối"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
