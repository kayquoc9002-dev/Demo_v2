import { useState } from "react";
import { motion } from "framer-motion";
import { X, Building2, Shirt, User, ChevronDown } from "lucide-react";
import type { KhachHang, KhachHangFormData, LoaiKH } from "./types";
import { getTenKH } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editKH?: KhachHang | null;
  onSave: (data: KhachHangFormData) => void;
}

// ── Field components ──────────────────────────────────────
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

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all"
  />
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    rows={2}
    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all resize-none"
  />
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
      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 transition-all appearance-none"
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

// ── NoteField: textarea tự điền + checkbox "Chưa có" để disable ──
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
  const uid = "nf-" + label.replace(/[^a-zA-Z0-9]/g, "-");
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
          <span className="text-[10px] text-slate-500">Chưa có</span>
        </label>
      </div>
      <Textarea
        value={isNone ? "" : value}
        disabled={isNone}
        onChange={(e) => onChange(e.target.value)}
        placeholder={isNone ? "Đã đánh dấu chưa có" : "Mô tả yêu cầu..."}
      />
    </div>
  );
};

// ── Fix 1: nullToUndef — đổi null → undefined để khớp FormData type ──
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullToUndef = (obj: Record<string, any>) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v === null ? undefined : v]),
  );

// ── Build initial form ────────────────────────────────────
const buildForm = (kh?: KhachHang | null): KhachHangFormData => {
  if (!kh) return { loai: "B2B" };
  const base = { loai: kh.loai, ma: kh.ma };
  if (kh.b2b)
    return {
      ...base,
      ...nullToUndef(kh.b2b),
      batDauHopTac: kh.b2b.batDauHopTac
        ? kh.b2b.batDauHopTac.substring(0, 10)
        : "",
      yeuCauKyThuat: kh.b2b.yeuCauKyThuat ?? "",
      yeuCauLogo: kh.b2b.yeuCauLogo ?? "",
      yeuCauBaobi: kh.b2b.yeuCauBaobi ?? "",
      thoiGianGiaoHang: kh.b2b.thoiGianGiaoHang ?? "",
      dieuKhoanThanhToan: kh.b2b.dieuKhoanThanhToan ?? "",
    };
  if (kh.thoiTrang)
    return {
      ...base,
      ...nullToUndef(kh.thoiTrang),
      batDauHopTac: kh.thoiTrang.batDauHopTac
        ? kh.thoiTrang.batDauHopTac.substring(0, 10)
        : "",
    };
  if (kh.caNhan) return { ...base, ...nullToUndef(kh.caNhan) };
  return base;
};

// ── Fix 2: Không dùng useEffect — component reset qua key prop ──
export const KhachHangModal = ({ isOpen, onClose, editKH, onSave }: Props) => {
  const [form, setForm] = useState<KhachHangFormData>(buildForm(editKH));

  const set = (key: keyof KhachHangFormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    const ten = form.tenDoanhNghiep || form.tenThuongHieu || form.hoTen;
    if (!ten?.trim()) return alert("Vui lòng nhập tên khách hàng!");
    onSave(form);
    onClose();
  };

  if (!isOpen) return null;

  const loaiOptions: { value: LoaiKH; label: string; icon: React.ReactNode }[] =
    [
      {
        value: "B2B",
        label: "Doanh nghiệp (B2B)",
        icon: <Building2 size={14} />,
      },
      {
        value: "ThoiTrang",
        label: "Thương hiệu thời trang",
        icon: <Shirt size={14} />,
      },
      { value: "CaNhan", label: "Khách cá nhân", icon: <User size={14} /> },
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
            {editKH ? `Sửa: ${getTenKH(editKH)}` : "Thêm khách hàng mới"}
          </p>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Chọn loại */}
          {!editKH && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Loại khách hàng *
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

          {/* Mã KH */}
          <Field label="Mã khách hàng">
            <Input
              value={form.ma || ""}
              onChange={(e) => set("ma", e.target.value)}
              placeholder="Tự động sinh nếu để trống"
            />
          </Field>

          {/* ── B2B Fields ── */}
          {form.loai === "B2B" && (
            <>
              {/* Thông tin chung */}
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Thông tin chung
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Tên doanh nghiệp" required>
                  <Input
                    value={form.tenDoanhNghiep || ""}
                    onChange={(e) => set("tenDoanhNghiep", e.target.value)}
                    placeholder="Công ty ABC..."
                  />
                </Field>
                <Field label="Lĩnh vực hoạt động">
                  <Input
                    value={form.linhVucHoatDong || ""}
                    onChange={(e) => set("linhVucHoatDong", e.target.value)}
                    placeholder="Thời trang, Xuất khẩu..."
                  />
                </Field>
                <Field label="Người phụ trách">
                  <Input
                    value={form.nguoiPhuTrach || ""}
                    onChange={(e) => set("nguoiPhuTrach", e.target.value)}
                  />
                </Field>
                <Field label="Số điện thoại">
                  <Input
                    value={form.sdt || ""}
                    onChange={(e) => set("sdt", e.target.value)}
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={form.email || ""}
                    onChange={(e) => set("email", e.target.value)}
                    type="email"
                  />
                </Field>
                <Field label="Bắt đầu hợp tác">
                  <Input
                    value={form.batDauHopTac || ""}
                    onChange={(e) => set("batDauHopTac", e.target.value)}
                    type="date"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Địa chỉ">
                    <Input
                      value={form.diaChi || ""}
                      onChange={(e) => set("diaChi", e.target.value)}
                    />
                  </Field>
                </div>
              </div>

              {/* Fix 3: Thông tin đơn hàng — ẩn 4 field DB, chỉ hiện yêu cầu */}
              <div className="space-y-1 pt-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-1">
                  Thông tin đơn hàng
                </p>
                <p className="text-[10px] text-slate-600 italic pt-1">
                  Loại sản phẩm, số lượng đơn và sản lượng được tổng hợp tự động
                  từ đơn hàng thực tế.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NoteField
                  label="Yêu cầu kỹ thuật đặc biệt"
                  value={form.yeuCauKyThuat ?? ""}
                  onChange={(v) => set("yeuCauKyThuat", v)}
                />
                <NoteField
                  label="Yêu cầu logo / in / thêu"
                  value={form.yeuCauLogo ?? ""}
                  onChange={(v) => set("yeuCauLogo", v)}
                />
                <NoteField
                  label="Yêu cầu bao bì riêng"
                  value={form.yeuCauBaobi ?? ""}
                  onChange={(v) => set("yeuCauBaobi", v)}
                />
                <NoteField
                  label="Thời gian giao hàng yêu cầu"
                  value={form.thoiGianGiaoHang ?? ""}
                  onChange={(v) => set("thoiGianGiaoHang", v)}
                />
                <div className="col-span-2">
                  <NoteField
                    label="Điều khoản thanh toán"
                    value={form.dieuKhoanThanhToan ?? ""}
                    onChange={(v) => set("dieuKhoanThanhToan", v)}
                  />
                </div>
              </div>
            </>
          )}

          {/* ── Thời trang Fields ── */}
          {form.loai === "ThoiTrang" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Tên thương hiệu" required>
                <Input
                  value={form.tenThuongHieu || ""}
                  onChange={(e) => set("tenThuongHieu", e.target.value)}
                />
              </Field>
              <Field label="Phân khúc">
                <Select
                  value={form.phanKhuc || ""}
                  onChange={(v) => set("phanKhuc", v)}
                  options={[
                    { value: "Bình dân", label: "Bình dân" },
                    { value: "Trung cấp", label: "Trung cấp" },
                    { value: "Cao cấp", label: "Cao cấp" },
                  ]}
                />
              </Field>
              <Field label="Người phụ trách">
                <Input
                  value={form.nguoiPhuTrach || ""}
                  onChange={(e) => set("nguoiPhuTrach", e.target.value)}
                />
              </Field>
              <Field label="Số điện thoại">
                <Input
                  value={form.sdt || ""}
                  onChange={(e) => set("sdt", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  type="email"
                />
              </Field>
              <Field label="Bắt đầu hợp tác">
                <Input
                  value={form.batDauHopTac || ""}
                  onChange={(e) => set("batDauHopTac", e.target.value)}
                  type="date"
                />
              </Field>
              <Field label="Thị trường chính">
                <Input
                  value={form.thiTruongChinh || ""}
                  onChange={(e) => set("thiTruongChinh", e.target.value)}
                  placeholder="Việt Nam, EU, Mỹ..."
                />
              </Field>
              <Field label="Hình thức hợp tác">
                <Select
                  value={form.hinhThucHopTac || ""}
                  onChange={(v) => set("hinhThucHopTac", v)}
                  options={[
                    { value: "OEM", label: "OEM" },
                    { value: "ODM", label: "ODM" },
                    { value: "Full package", label: "Full package" },
                  ]}
                />
              </Field>
              <Field label="Số lượng mỗi BST">
                <Input
                  type="number"
                  value={form.soLuongMoiBST || ""}
                  onChange={(e) => set("soLuongMoiBST", e.target.value)}
                />
              </Field>
              <Field label="Tần suất BST/năm">
                <Input
                  type="number"
                  value={form.tanSuatBSTNam || ""}
                  onChange={(e) => set("tanSuatBSTNam", e.target.value)}
                />
              </Field>
              <div className="col-span-2 space-y-4">
                <Field label="Bộ sưu tập đã sản xuất">
                  <Textarea
                    value={form.boSuuTapDaSanXuat || ""}
                    onChange={(e) => set("boSuuTapDaSanXuat", e.target.value)}
                    placeholder='["BST Xuân Hè 2024", "BST Thu Đông 2024"]'
                  />
                </Field>
                <Field label="Yêu cầu bảo mật sản phẩm">
                  <Textarea
                    value={form.yeuCauBaoMat || ""}
                    onChange={(e) => set("yeuCauBaoMat", e.target.value)}
                  />
                </Field>
                <Field label="Tiêu chuẩn kiểm hàng">
                  <Textarea
                    value={form.tieuChuanKiemHang || ""}
                    onChange={(e) => set("tieuChuanKiemHang", e.target.value)}
                  />
                </Field>
                <Field label="Yêu cầu test co rút / test màu">
                  <Textarea
                    value={form.yeuCauTestCoRutMau || ""}
                    onChange={(e) => set("yeuCauTestCoRutMau", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          )}

          {/* ── Cá nhân Fields ── */}
          {form.loai === "CaNhan" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Họ tên" required>
                <Input
                  value={form.hoTen || ""}
                  onChange={(e) => set("hoTen", e.target.value)}
                />
              </Field>
              <Field label="Số điện thoại">
                <Input
                  value={form.sdt || ""}
                  onChange={(e) => set("sdt", e.target.value)}
                />
              </Field>
              <Field label="Email">
                <Input
                  value={form.email || ""}
                  onChange={(e) => set("email", e.target.value)}
                  type="email"
                />
              </Field>
              <Field label="Sản phẩm đặt may">
                <Input
                  value={form.sanPhamDatMay || ""}
                  onChange={(e) => set("sanPhamDatMay", e.target.value)}
                />
              </Field>
              <Field label="Số lượng">
                <Input
                  type="number"
                  value={form.soLuong || ""}
                  onChange={(e) => set("soLuong", e.target.value)}
                />
              </Field>
              <Field label="Giá trị đơn hàng (VNĐ)">
                <Input
                  type="number"
                  value={form.giaTriDonHang || ""}
                  onChange={(e) => set("giaTriDonHang", e.target.value)}
                />
              </Field>
              <Field label="Thời gian giao">
                <Input
                  value={form.thoiGianGiao || ""}
                  onChange={(e) => set("thoiGianGiao", e.target.value)}
                  placeholder="7 ngày, 2 tuần..."
                />
              </Field>
              <div className="col-span-2 space-y-4">
                <Field label="Yêu cầu thiết kế riêng">
                  <Textarea
                    value={form.yeuCauThietKe || ""}
                    onChange={(e) => set("yeuCauThietKe", e.target.value)}
                  />
                </Field>
                <Field label="Yêu cầu chỉnh sửa">
                  <Textarea
                    value={form.yeuCauChinhSua || ""}
                    onChange={(e) => set("yeuCauChinhSua", e.target.value)}
                  />
                </Field>
                <Field label="Phản hồi sau nhận hàng">
                  <Textarea
                    value={form.phanHoi || ""}
                    onChange={(e) => set("phanHoi", e.target.value)}
                  />
                </Field>
              </div>
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
            {editKH ? "Lưu thay đổi" : "Thêm khách hàng"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
