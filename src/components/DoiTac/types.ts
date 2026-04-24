// ── Loại đối tác ─────────────────────────────────────────
export type LoaiDoiTac = "CungUng" | "GiaCong" | "ThietKe";

// ── Chi tiết từng loại ────────────────────────────────────
export interface DoiTacCungUng {
  id: number;
  doiTacId: number;
  tenNhaCungCap: string;
  quocGiaXuatXu?: string | null;
  diaChiNhaMay?: string | null;
  // null = disabled (Không có)
  namThanhLap?: number | null;
  namBatDauHopTac?: number | null;
  chungNhanChatLuong?: string | null;
  nangLucSanXuatThang?: string | null;
  // Phân loại cung ứng — null cả section = disabled
  vai?: string | null;
  chiMay?: string | null;
  cubNutDayKeo?: string | null;
  temNhan?: string | null;
  baoBiDongGoi?: string | null;
  phuLieuTrangTri?: string | null;
  hoaChatGiat?: string | null;
  // Chất lượng — null cả section = disabled
  coPhongLab?: string | null;
  tyLeLoi?: number | null;
  thoiGianGiaoHang?: string | null;
  chinhSachDoiTra?: string | null;
  kiemTraMauTruoc?: string | null;
}

export interface DoiTacGiaCong {
  id: number;
  doiTacId: number;
  tenXuong: string;
  diaChiXuong?: string | null;
  soLuongChuyen?: number | null;
  // null = disabled
  soLuongCongNhan?: number | null;
  congSuatNgay?: number | null;
  congSuatThang?: number | null;
  loaiSanPham?: string | null;
  coPhongQC?: string | null;
  // Kỹ thuật — null cả section = disabled
  mayMay1Kim?: number | null;
  mayMay2Kim?: number | null;
  mayVatSo?: number | null;
  mayKansai?: number | null;
  mayThuaKhuy?: number | null;
  mayDinhNut?: number | null;
  mayInChuyenNhiet?: number | null;
  mayTheuViTinh?: number | null;
  mayGiatCongNghiep?: number | null;
  // Chất lượng — null cả section = disabled
  tyLeLoi?: number | null;
  quyTrinh3Buoc?: string | null;
  tieuChuanMay?: string | null;
  datAuditKhachHang?: string | null;
  kinhNghiemXuatKhau?: string | null;
}

export interface QuyTrinhBuoc {
  stt: number;
  buoc: string;
}

export interface DoiTacThietKe {
  id: number;
  doiTacId: number;
  tenStudio: string;
  linhVucChuyenMon?: string | null;
  // null = disabled
  soNamKinhNghiem?: number | null;
  duAnDaThucHien?: string | null;   // JSON array
  khaNangThietKeRap?: string | null;
  khaNangLamMauThu?: string | null;
  thoiGianHoanThanh?: string | null;
  phanMemSuDung?: string | null;    // JSON array
  quyTrinhDuyetMau?: string | null; // JSON array QuyTrinhBuoc
  chinhSachBaoMat?: string | null;
}

// ── Bản ghi chính ─────────────────────────────────────────
export interface DoiTac {
  id: number;
  ma: string;
  loai: LoaiDoiTac;
  trangThai: string;
  createdAt: string;
  updatedAt: string;
  cungUng?: DoiTacCungUng | null;
  giaCong?: DoiTacGiaCong | null;
  thietKe?: DoiTacThietKe | null;
}

// ── Form data ─────────────────────────────────────────────
export interface DoiTacFormData {
  loai: LoaiDoiTac;
  ma?: string;
  // CungUng
  tenNhaCungCap?: string;
  quocGiaXuatXu?: string;
  diaChiNhaMay?: string;
  namThanhLap?: number | string;
  namBatDauHopTac?: number | string;
  chungNhanChatLuong?: string;
  nangLucSanXuatThang?: string;
  vai?: string;
  chiMay?: string;
  cubNutDayKeo?: string;
  temNhan?: string;
  baoBiDongGoi?: string;
  phuLieuTrangTri?: string;
  hoaChatGiat?: string;
  coPhongLab?: string;
  tyLeLoi?: number | string;
  thoiGianGiaoHang?: string;
  chinhSachDoiTra?: string;
  kiemTraMauTruoc?: string;
  // GiaCong
  tenXuong?: string;
  diaChiXuong?: string;
  soLuongChuyen?: number | string;
  soLuongCongNhan?: number | string;
  congSuatNgay?: number | string;
  congSuatThang?: number | string;
  loaiSanPham?: string;
  coPhongQC?: string;
  mayMay1Kim?: number | string;
  mayMay2Kim?: number | string;
  mayVatSo?: number | string;
  mayKansai?: number | string;
  mayThuaKhuy?: number | string;
  mayDinhNut?: number | string;
  mayInChuyenNhiet?: number | string;
  mayTheuViTinh?: number | string;
  mayGiatCongNghiep?: number | string;
  quyTrinh3Buoc?: string;
  tieuChuanMay?: string;
  datAuditKhachHang?: string;
  kinhNghiemXuatKhau?: string;
  // ThietKe
  tenStudio?: string;
  linhVucChuyenMon?: string;
  soNamKinhNghiem?: number | string;
  duAnDaThucHien?: string;
  khaNangThietKeRap?: string;
  khaNangLamMauThu?: string;
  thoiGianHoanThanh?: string;
  phanMemSuDung?: string;
  quyTrinhDuyetMau?: string;
  chinhSachBaoMat?: string;
  // Section disabled flags — true = disabled ("Không có")
  _phanLoaiCungUngDisabled?: boolean;
  _chatLuongCungUngDisabled?: boolean;
  _kyThuatGiaCongDisabled?: boolean;
  _chatLuongGiaCongDisabled?: boolean;
}

// ── Helpers ───────────────────────────────────────────────
export const getTenDoiTac = (dt: DoiTac): string => {
  if (dt.cungUng) return dt.cungUng.tenNhaCungCap;
  if (dt.giaCong) return dt.giaCong.tenXuong;
  if (dt.thietKe) return dt.thietKe.tenStudio;
  return "—";
};

export const getLabelLoai = (loai: LoaiDoiTac) => {
  if (loai === "CungUng") return "Cung ứng NPL";
  if (loai === "GiaCong") return "Gia công";
  return "Thiết kế";
};

export const getMauLoai = (loai: LoaiDoiTac) => {
  if (loai === "CungUng") return { text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
  if (loai === "GiaCong") return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" };
  return { text: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" };
};

export const parseJsonArray = (val?: string | null): string[] => {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
};
