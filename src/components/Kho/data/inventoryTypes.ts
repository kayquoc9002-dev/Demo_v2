// ─────────────────────────────────────────────────────────────────────────────
// inventoryTypes.ts — Types cho Module 5: Tồn kho & Kiểm kê
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tồn kho theo SKU + vị trí ───────────────────────────────────────────────

export interface TonKhoRecord {
  ma_sku:        string;
  ten_sp:        string;
  mau_sac:       string;
  kich_thuoc:    string;
  node_id:       string;       // Ô/bin đang chứa
  location_code: string;       // VD: "A-01-01A-T1"
  so_luong:      number;       // Số lượng thực tế tại ô này
  dinh_muc_min:  number;       // Từ SKU rules
  dinh_muc_max:  number;
  la_primary:    boolean;      // Primary pick bin
  ngay_cap_nhat: string;
}

// ─── Kết quả search thông minh ────────────────────────────────────────────────

export type SearchResultType = "sku" | "location" | "empty";

export interface SearchResultSKU {
  type:          "sku";
  ma_sku:        string;
  ten_sp:        string;
  mau_sac:       string;
  kich_thuoc:    string;
  tong_ton_kho:  number;       // Tổng tất cả vị trí
  cac_vi_tri:    TonKhoRecord[];
}

export interface SearchResultLocation {
  type:          "location";
  node_id:       string;
  location_code: string;
  ten_vi_tri:    string;       // Tên đầy đủ của node
  suc_chua:      number;       // Tổng số lượng đang chứa
  cac_sku:       TonKhoRecord[];
}

export type SearchResult = SearchResultSKU | SearchResultLocation | { type: "empty" };

// ─── Chuyển kho nội bộ ───────────────────────────────────────────────────────

export type TrangThaiPhieuChuyen =
  | "cho_xac_nhan"
  | "dang_chuyen"
  | "hoan_thanh"
  | "huy";

export interface PhieuChuyenKho {
  id:            string;
  ma_phieu:      string;       // VD: "CK-2026-041"
  ma_sku:        string;
  ten_sp:        string;
  node_id_tu:    string;       // Kệ nguồn
  location_tu:   string;
  node_id_den:   string;       // Kệ đích
  location_den:  string;
  so_luong:      number;
  ly_do:         string;
  trang_thai:    TrangThaiPhieuChuyen;
  nguoi_tao:     string;
  ngay_tao:      string;
  ngay_hoan_thanh: string;
}

// ─── Kiểm kê (Stocktake) ─────────────────────────────────────────────────────

export type TrangThaiKiemKe =
  | "dang_kiem"     // Nhân viên đang đi đếm
  | "cho_duyet"     // Đã đếm xong, chờ quản lý duyệt
  | "da_duyet"      // Đã duyệt, tồn kho đã được cập nhật
  | "huy";

export interface DongKiemKe {
  id:             string;
  phieu_id:       string;
  ma_sku:         string;
  ten_sp:         string;
  node_id:        string;
  location_code:  string;
  so_luong_he_thong: number;   // Số hệ thống đang ghi nhận
  so_luong_thuc:  number;      // Số nhân viên đếm thực tế
  chenh_lech:     number;      // = thuc - he_thong (âm = thiếu, dương = dư)
  ghi_chu:        string;
  da_dem:         boolean;
}

export interface PhieuKiemKe {
  id:            string;
  ma_phieu:      string;       // VD: "KK-2026-004"
  trang_thai:    TrangThaiKiemKe;
  pham_vi:       string;       // VD: "Toàn bộ kho" / "Khu A" / "Kệ A-01-01A"
  nguoi_tao:     string;
  nguoi_duyet:   string;
  ngay_tao:      string;
  ngay_hoan_thanh: string;
  ghi_chu:       string;
  danh_sach:     DongKiemKe[];
}

// ─── Stats tồn kho tổng quan ─────────────────────────────────────────────────

export interface TonKhoStats {
  tong_sku:         number;    // Số loại SKU có hàng
  tong_san_pham:    number;    // Tổng số lượng tất cả SKU
  vi_tri_co_hang:   number;    // Số ô/bin đang chứa hàng
  vi_tri_trong:     number;    // Số ô/bin trống
  sap_het:          number;    // SKU dưới định mức min
  vuot_max:         number;    // SKU vượt định mức max
}