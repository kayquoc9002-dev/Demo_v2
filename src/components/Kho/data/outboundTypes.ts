// ─────────────────────────────────────────────────────────────────────────────
// outboundTypes.ts — Types cho Module 4: Quản lý Xuất Kho
// Flow: Chọn đơn → Gộp → Phiếu nhặt → Packing → Shipping
// ─────────────────────────────────────────────────────────────────────────────

// ─── Phiếu nhặt hàng (Picking List) ─────────────────────────────────────────

export type TrangThaiPhieuNhat =
  | "cho_nhat"       // Đã tạo, chưa ai nhặt
  | "dang_nhat"      // Nhân viên đang đi nhặt
  | "nhat_xong"      // Đã nhặt đủ, chờ packing
  | "dang_packing"   // Đang kiểm tra + đóng gói
  | "cho_shipping"   // Đóng gói xong, chờ in vận đơn / ĐVVC đến
  | "hoan_thanh"     // ĐVVC đã lấy
  | "co_van_de";     // Thiếu hàng khi nhặt

// Một dòng trong phiếu nhặt — đã gộp theo SKU + vị trí
export interface DongNhat {
  id:           string;
  phieu_id:     string;
  ma_sku:       string;
  ten_sp:       string;
  // Vị trí lấy hàng (từ SKU rules — primary pick bin)
  node_id:      string;
  location_code:string;   // VD: "A-01-01A-T1"
  // Số lượng
  so_luong_can: number;   // Tổng cần lấy (đã gộp từ các đơn)
  so_luong_lay: number;   // Thực tế lấy được
  // Tracking
  da_nhat:      boolean;
  // Gộp từ đơn nào
  don_ids:      string[]; // Danh sách đơn hàng chứa SKU này
}

// Phiếu nhặt hàng — gộp nhiều đơn
export interface PhieuNhatHang {
  id:           string;
  ma_phieu:     string;   // VD: "PK-2026-041"
  trang_thai:   TrangThaiPhieuNhat;
  don_ids:      string[]; // Các đơn hàng được gộp vào
  nhan_vien:    string;
  ngay_tao:     string;
  ngay_hoan_thanh: string;
  ghi_chu:      string;
  danh_sach_nhat: DongNhat[];
  // Packing
  packing_items: PackingItem[];
}

// ─── Packing ─────────────────────────────────────────────────────────────────

// Sau khi nhặt xong, tách lại theo từng đơn để đóng gói
export interface PackingItem {
  don_id:       string;
  ma_don:       string;   // VD: "DH-2026-0089"
  ten_khach:    string;
  dia_chi:      string;
  san_pham: {
    ma_sku:     string;
    ten_sp:     string;
    so_luong:   number;
  }[];
  da_kiem_tra:  boolean;  // Đã scan check chưa
  da_dong_goi:  boolean;
  ma_van_don:   string;   // Sau khi in vận đơn
  dvvc:         string;   // ĐVVC được chọn
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface PhieuNhatStats {
  tong_don:        number;
  tong_sku:        number;   // Số dòng nhặt (đã gộp)
  tong_san_pham:   number;   // Tổng số lượng sản phẩm
  da_nhat:         number;
  con_lai:         number;
  da_dong_goi:     number;
  co_van_don:      number;
  pct_nhat:        number;
}