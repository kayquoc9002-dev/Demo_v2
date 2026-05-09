// ─────────────────────────────────────────────────────────────────────────────
// purchaseTypes.ts — Types cho module Thu mua
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tab 1: PR (Purchase Request) ────────────────────────────────────────────

export type LyDoPR =
  | "duoi_muc_an_toan"      // Hệ thống tự quét hoặc kho báo
  | "hang_hong_trong_kho"   // Hàng lỗi, hư hỏng
  | "du_tru_su_kien"        // Big sale, sự kiện
  | "hang_moi";             // Sản phẩm mới cần nhập lần đầu

export const LY_DO_PR_CONFIG: Record<LyDoPR, { nhan: string; icon: string; mau: string }> = {
  duoi_muc_an_toan:   { nhan: "Dưới mức an toàn",          icon: "📉", mau: "#f97316" },
  hang_hong_trong_kho:{ nhan: "Hàng bị lỗi/hư hỏng",       icon: "⚠️", mau: "#ef4444" },
  du_tru_su_kien:     { nhan: "Dự trữ cho sự kiện lớn",    icon: "🎯", mau: "#a78bfa" },
  hang_moi:           { nhan: "Hàng mới",                   icon: "✨", mau: "#38bdf8" },
};

// Dòng con — SKU level
export interface PRItemSKU {
  sku_id:          string;
  ma_sku:          string;
  color_name:      string;
  color_hex:       string;
  size_code:       string;
  ton_kho:         number;   // tồn kho hiện tại
  dang_di_duong:   number;   // đang trong PO chưa về kho
  ban_30_ngay:     number;   // số lượng bán trong 30 ngày qua
  toc_do_ban:      number;   // trung bình bán/ngày (ban_30_ngay / 30)
  so_luong_xin:    number;   // kho xin
  so_luong_duyet:  number;   // thu mua duyệt — user nhập
  ban_30_ngay_le:  number;  // bán lẻ 30 ngày
  ban_30_ngay_si:  number;  // bán sỉ 30 ngày
  //ban_30_ngay = ban_30_ngay_le + ban_30_ngay_si
  toc_do_ban_le:   number;   
  toc_do_ban_si:   number;   
}

// Dòng cha — Product level
export interface PRItem {
  pr_id:           string;
  product_id:      string;
  product_code:    string;
  ten_sp:          string;
  image_url:       string;
  season_code:     string;   // để tô màu hàng lỗi mùa
  season_id:       string;
  vendor_id:       string;
  vendor_name:     string;   // tên NCC hiển thị luôn
  lead_time:       number;   // thời gian giao dự kiến (ngày)
  ly_do:           LyDoPR;
  ghi_chu:         string;
  // Tổng hợp từ SKU con
  ton_kho_cha:     number;   // tổng tồn kho
  dang_di_duong:   number;   // tổng đang đi đường
  ban_30_ngay:     number;   // tổng bán 30 ngày
  toc_do_ban:      number;   // tổng tốc độ bán/ngày
  // so_luong_duyet = sum của SKU con — computed, không lưu
  trang_thai:      "cho_duyet" | "da_duyet" | "tu_choi";
  ngay_tao:        string;
  skus:            PRItemSKU[];
}

// ─── Tab 2: PO (Purchase Order) ───────────────────────────────────────────────

export type TrangThaiPO =
  | "cho_xac_nhan"   // Mới tạo, chờ xưởng xác nhận
  | "cho_giao"       // Xưởng đã xác nhận, chờ giao
  | "dang_giao"      // Đang giao lắt nhắt (partial)
  | "da_nhap"        // Đã nhập đủ kho
  | "tre_han"        // Quá ngày dự kiến chưa giao đủ
  | "huy";           // Đã hủy

export const TRANG_THAI_PO_CONFIG: Record<TrangThaiPO, {
  nhan: string; mau: string; nen: string; nhap_nhay?: boolean;
}> = {
  cho_xac_nhan: { nhan: "Chờ xác nhận", mau: "#64748b", nen: "#1e293b"    },
  cho_giao:     { nhan: "Chờ giao hàng", mau: "#f97316", nen: "#7c2d1220" },
  dang_giao:    { nhan: "Đang giao",     mau: "#f59e0b", nen: "#78350f20" },
  da_nhap:      { nhan: "Đã nhập đủ",   mau: "#10b981", nen: "#06472520" },
  tre_han:      { nhan: "Trễ hẹn",      mau: "#ef4444", nen: "#7f1d1d20", nhap_nhay: true },
  huy:          { nhan: "Đã hủy",       mau: "#475569", nen: "#0f172a"    },
};

export interface POItem {
  sku_id:          string;
  ma_sku:          string;
  ten_sp:          string;
  color_name:      string;
  color_hex:       string;
  size_code:       string;
  so_luong_dat:    number;   // số lượng đặt
  so_luong_nhan:   number;   // số lượng đã nhận (cập nhật từ Module 3)
  don_gia:         number;   // giá vốn
  thanh_tien:      number;   // so_luong_dat × don_gia
}

export interface PurchaseOrder {
  po_id:              string;
  ma_po:              string;          // PO-2026-001
  vendor_id:          string;
  vendor_name:        string;
  lead_time:          number;
  ngay_dat:           string;
  ngay_du_kien_giao:  string;
  dieu_khoan_tt:      string;          // "Công nợ 30 ngày", "Thanh toán ngay"
  ghi_chu:            string;
  tong_tien:          number;          // sum thanh_tien
  trang_thai:         TrangThaiPO;
  items:              POItem[];
  // Computed
  pct_nhan:           number;          // % đã nhận = sum(nhan) / sum(dat)
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

// Item đã duyệt — chờ gom vào PO ở Tab 2
export interface ApprovedItem {
  pr_id:       string;
  product_id:  string;
  product_code: string;
  ten_sp:      string;
  vendor_id:   string;
  vendor_name: string;
  lead_time:   number;
  season_code: string;
  skus:        PRItemSKU[];  // chỉ các SKU đã được duyệt > 0
}

export const DIEU_KHOAN_OPTIONS = [
  "Thanh toán ngay",
  "Công nợ 15 ngày",
  "Công nợ 30 ngày",
  "Công nợ 45 ngày",
  "Đặt cọc 50% - còn lại khi nhận hàng",
];