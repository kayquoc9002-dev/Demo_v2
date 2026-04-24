// ── Loại khách hàng ──────────────────────────────────────
export type LoaiKH = "B2B" | "ThoiTrang" | "CaNhan";
export type TrangThaiKH = "active" | "inactive";

// ── Detail B2B ────────────────────────────────────────────
export interface KhachHangB2B {
  id: number;
  khachHangId: number;
  tenDoanhNghiep: string;
  linhVucHoatDong?: string | null;
  diaChi?: string | null;
  nguoiPhuTrach?: string | null;
  email?: string | null;
  sdt?: string | null;
  batDauHopTac?: string | null;
  // Đơn hàng
  loaiSanPham?: string | null;
  soLuongMoiDon?: number | null;
  soLuongDonNam?: number | null;
  tongSanLuongNam?: number | null;
  yeuCauKyThuat?: string | null;
  yeuCauLogo?: string | null;
  yeuCauBaobi?: string | null;
  thoiGianGiaoHang?: string | null;
  dieuKhoanThanhToan?: string | null;
  // Đánh giá
  soLanDatHang?: number | null;
  tyLeTaiDat?: number | null;
  mucDoHaiLong?: number | null;
  khieuNai?: string | null;
  thoiGianXuLyKhieuNai?: string | null;
}

// ── Detail Thời trang ─────────────────────────────────────
export interface KhachHangThoiTrang {
  id: number;
  khachHangId: number;
  tenThuongHieu: string;
  email?: string | null;
  sdt?: string | null;
  nguoiPhuTrach?: string | null;
  batDauHopTac?: string | null;
  phanKhuc?: string | null;
  thiTruongChinh?: string | null;
  hinhThucHopTac?: string | null;
  boSuuTapDaSanXuat?: string | null; // JSON string
  soLuongMoiBST?: number | null;
  tanSuatBSTNam?: number | null;
  yeuCauBaoMat?: string | null;
  tieuChuanKiemHang?: string | null;
  yeuCauTestCoRutMau?: string | null;
}

// ── Detail Cá nhân ────────────────────────────────────────
export interface KhachHangCaNhan {
  id: number;
  khachHangId: number;
  hoTen: string;
  email?: string | null;
  sdt?: string | null;
  sanPhamDatMay?: string | null;
  soLuong?: number | null;
  yeuCauThietKe?: string | null;
  yeuCauChinhSua?: string | null;
  thoiGianGiao?: string | null;
  giaTriDonHang?: number | null;
  lichSuDatMay?: string | null; // JSON string
  phanHoi?: string | null;
}

// ── Bản ghi chính ─────────────────────────────────────────
export interface KhachHang {
  id: number;
  ma: string;
  loai: LoaiKH;
  trangThai: TrangThaiKH;
  createdAt: string;
  updatedAt: string;
  b2b?: KhachHangB2B | null;
  thoiTrang?: KhachHangThoiTrang | null;
  caNhan?: KhachHangCaNhan | null;
}

// ── Helper: lấy tên hiển thị ─────────────────────────────
export const getTenKH = (kh: KhachHang): string => {
  if (kh.b2b) return kh.b2b.tenDoanhNghiep;
  if (kh.thoiTrang) return kh.thoiTrang.tenThuongHieu;
  if (kh.caNhan) return kh.caNhan.hoTen;
  return "—";
};

export const getLabelLoai = (loai: LoaiKH) => {
  if (loai === "B2B") return "Doanh nghiệp";
  if (loai === "ThoiTrang") return "Thời trang";
  return "Cá nhân";
};

export const getMauLoai = (loai: LoaiKH) => {
  if (loai === "B2B")
    return {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      dot: "#3b82f6",
    };
  if (loai === "ThoiTrang")
    return {
      bg: "bg-violet-500/10",
      text: "text-violet-400",
      border: "border-violet-500/20",
      dot: "#8b5cf6",
    };
  return {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "#10b981",
  };
};

// ── Form data (dùng chung cho Add/Edit) ───────────────────
export interface KhachHangFormData {
  loai: LoaiKH;
  ma?: string;
  // B2B
  tenDoanhNghiep?: string;
  linhVucHoatDong?: string;
  diaChi?: string;
  nguoiPhuTrach?: string;
  email?: string;
  sdt?: string;
  batDauHopTac?: string;
  loaiSanPham?: string;
  soLuongMoiDon?: number | string;
  soLuongDonNam?: number | string;
  tongSanLuongNam?: number | string;
  yeuCauKyThuat?: string;
  yeuCauLogo?: string;
  yeuCauBaobi?: string;
  thoiGianGiaoHang?: string;
  dieuKhoanThanhToan?: string;
  soLanDatHang?: number | string;
  tyLeTaiDat?: number | string;
  mucDoHaiLong?: number | string;
  khieuNai?: string;
  thoiGianXuLyKhieuNai?: string;
  // Thời trang
  tenThuongHieu?: string;
  phanKhuc?: string;
  thiTruongChinh?: string;
  hinhThucHopTac?: string;
  boSuuTapDaSanXuat?: string;
  soLuongMoiBST?: number | string;
  tanSuatBSTNam?: number | string;
  yeuCauBaoMat?: string;
  tieuChuanKiemHang?: string;
  yeuCauTestCoRutMau?: string;
  // Cá nhân
  hoTen?: string;
  sanPhamDatMay?: string;
  soLuong?: number | string;
  yeuCauThietKe?: string;
  yeuCauChinhSua?: string;
  thoiGianGiao?: string;
  giaTriDonHang?: number | string;
  lichSuDatMay?: string;
  phanHoi?: string;
}
