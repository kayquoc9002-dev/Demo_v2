// ── Trạng thái nhà phân phối ─────────────────────────────
export type TrangThaiNPP = "active" | "tamNgung" | "ketThuc";

// ── Interface chính ───────────────────────────────────────
export interface NhaPhanPhoi {
  id: number;
  ma: string;
  trangThai: TrangThaiNPP;
  createdAt: string;
  updatedAt: string;

  // Thông tin chung
  tenCongTy: string;
  logo?: string | null;
  diaChiTruSo?: string | null;
  diaChiKho?: string | null;
  quocGiaKhuVuc?: string | null;
  website?: string | null;
  email?: string | null;
  sdt?: string | null;
  nguoiPhuTrach?: string | null;
  chucVuLienHe?: string | null;
  namBatDauHopTac?: number | null;
  thoiHanHopDong?: string | null;

  // Phạm vi & hình thức phân phối — null = section disabled
  phanPhoiDocQuyen?: string | null;
  phanPhoiKhuVuc?: string | null;      // JSON array
  phanPhoiNganhHang?: string | null;   // JSON array
  hinhThucBanHang?: string | null;     // JSON array
  coDaiLyCon?: string | null;
  soLuongDaiLy?: number | null;
  kenhPhanPhoi?: string | null;        // JSON array

  // Năng lực phân phối — null = section disabled
  dienTichKho?: number | null;
  sucChuaToiDa?: string | null;
  sanLuongTieuThuThang?: number | null;
  sanLuongTieuThuNam?: number | null;
  khaNangGiaoHangNgay?: number | null;
  thoiGianXuLyDon?: string | null;
  doiNguNhanSu?: string | null;
  phuongTienVanChuyen?: string | null;
  coHeThongWMS?: string | null;

  // Chính sách hợp tác — null = section disabled
  chinhSachChietKhau?: string | null;
  chinhSachCongNo?: string | null;
  thoiHanThanhToan?: string | null;
  mucTonKhoToiThieu?: string | null;
  chinhSachDoiTra?: string | null;
  dieuKhoanBaoHanh?: string | null;
  dieuKhoanBaoMat?: string | null;
  dieuKhoanChamDut?: string | null;
}

// ── Form data ─────────────────────────────────────────────
export type NhaPhanPhoiFormData = Omit<NhaPhanPhoi, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
};

// ── Helpers ───────────────────────────────────────────────
export const getTrangThaiLabel = (t: TrangThaiNPP) => {
  if (t === "active") return "Đang hoạt động";
  if (t === "tamNgung") return "Tạm ngưng";
  return "Kết thúc";
};

export const getTrangThaiColor = (t: TrangThaiNPP) => {
  if (t === "active") return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (t === "tamNgung") return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-slate-500", bg: "bg-slate-800", border: "border-slate-700" };
};

export const parseJsonArray = (val?: string | null): string[] => {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
};

// Section disabled check: null = "Không có"
export const isSectionDisabled = (val: string | null | undefined) => val === null || val === undefined;
