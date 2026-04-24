// ─────────────────────────────────────────────────────────────────────────────
// inboundTypes.ts — Types cho Module 3: Quản lý Nhập Kho
// Flow: PO → Nhận hàng → QC → Put-away
// ─────────────────────────────────────────────────────────────────────────────

// ─── Loại phiếu nhập ─────────────────────────────────────────────────────────

export type LoaiPhieuNhap =
  | "tu_don_dat_hang" // Có PO trước — luồng chuẩn
  | "khong_co_po" // Hàng về bất ngờ, không có PO
  | "nhap_khac"; // Hàng mẫu, bù kiểm kê... (bắt buộc có lý do)

export type TrangThaiPhieuNhap =
  | "cho_hang_ve" // PO đã tạo, chờ hàng về
  | "dang_kiem_tra" // Hàng đã về, đang QC
  | "cho_cat_ke" // QC xong, chờ cất lên kệ
  | "hoan_thanh" // Đã cất kệ xong
  | "co_van_de"; // Có hàng lỗi cần xử lý

// ─── Dòng hàng trong phiếu nhập ──────────────────────────────────────────────

export type TrangThaiQC =
  | "chua_kiem" // Chưa kiểm tra
  | "dat" // Đạt chất lượng
  | "loi_nhe" // Lỗi nhẹ — vẫn bán được, chiết khấu
  | "loi_nang" // Lỗi nặng — trả xưởng hoặc hủy
  | "thieu_hang"; // Số lượng thực tế ít hơn PO

export interface ChiTietPhieuNhap {
  id: string;
  phieu_id: string;
  ma_sku: string;
  ten_sp: string;
  so_luong_po: number; // Số lượng theo PO/kế hoạch
  so_luong_thuc: number; // Số lượng thực tế nhận được
  so_luong_dat: number; // Số lượng đạt QC
  so_luong_loi: number; // Số lượng lỗi
  trang_thai_qc: TrangThaiQC;
  ghi_chu_qc: string; // Ghi chú lỗi cụ thể
  // Put-away
  da_cat_ke: boolean;
  node_id_cat: string; // Ô đã cất (từ put-away)
  so_luong_da_cat: number;
}

// ─── Phiếu Nhập Kho ──────────────────────────────────────────────────────────

export interface PhieuNhapKho {
  id: string;
  ma_phieu: string; // VD: "PN-2026-041"
  loai: LoaiPhieuNhap;
  trang_thai: TrangThaiPhieuNhap;
  nha_cung_cap: string;
  nguoi_tao: string;
  ngay_tao: string; // ISO
  ngay_du_kien: string; // Ngày hàng dự kiến về
  ngay_nhan_thuc: string; // Ngày thực tế nhận hàng
  ly_do: string; // Bắt buộc với loại "nhap_khac"
  ghi_chu: string;
  chi_tiet: ChiTietPhieuNhap[];
}

// ─── Put-away session ─────────────────────────────────────────────────────────

export interface PutAwayItem {
  chi_tiet_id: string;
  ma_sku: string;
  ten_sp: string;
  so_luong_can: number; // Số cần cất (= so_luong_dat - so_luong_da_cat)
  so_luong_cat: number; // Số đang nhập vào form
  // Gợi ý từ SKU rules
  node_goi_y: string | null; // node_id gợi ý (primary pick bin)
  node_chon: string; // node_id người dùng chọn thực tế
  da_xac_nhan: boolean;
}

// ─── Form states ──────────────────────────────────────────────────────────────

export interface TaoPhieuFormData {
  loai: LoaiPhieuNhap;
  nha_cung_cap: string;
  ngay_du_kien: string;
  ly_do: string;
  ghi_chu: string;
  chi_tiet: {
    ma_sku: string;
    ten_sp: string;
    so_luong_po: number;
  }[];
}

// ─── Computed stats cho 1 phiếu ──────────────────────────────────────────────

export interface PhieuNhapStats {
  tong_sku: number;
  da_kiem: number;
  so_dat: number;
  so_loi: number;
  da_cat_ke: number;
  con_lai_cat: number;
  pct_hoan_thanh: number; // 0-100
}
