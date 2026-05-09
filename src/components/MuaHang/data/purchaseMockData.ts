// ─────────────────────────────────────────────────────────────────────────────
// purchaseMockData.ts — Mock data cho module Thu mua
// ─────────────────────────────────────────────────────────────────────────────

import type { PRItem, PRItemSKU, PurchaseOrder } from "./purchaseTypes";

// ─── PR Items (Danh sách yêu cầu mua) ────────────────────────────────────────

const SKUS_ATS_PR: PRItemSKU[] = [
  {
    sku_id: "sku-1", ma_sku: "ATS-SS24-001-WHT-S",
    color_name: "Trắng", color_hex: "#FFFFFF", size_code: "S",
    ton_kho: 15, dang_di_duong: 0, ban_30_ngay: 42, toc_do_ban: 1.4,
    so_luong_xin: 80, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-2", ma_sku: "ATS-SS24-001-WHT-M",
    color_name: "Trắng", color_hex: "#FFFFFF", size_code: "M",
    ton_kho: 20, dang_di_duong: 0, ban_30_ngay: 55, toc_do_ban: 1.8,
    so_luong_xin: 100, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-3", ma_sku: "ATS-SS24-001-WHT-L",
    color_name: "Trắng", color_hex: "#FFFFFF", size_code: "L",
    ton_kho: 8, dang_di_duong: 0, ban_30_ngay: 38, toc_do_ban: 1.3,
    so_luong_xin: 70, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-4", ma_sku: "ATS-SS24-001-BLK-S",
    color_name: "Đen", color_hex: "#1a1a1a", size_code: "S",
    ton_kho: 5, dang_di_duong: 20, ban_30_ngay: 60, toc_do_ban: 2.0,
    so_luong_xin: 120, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-5", ma_sku: "ATS-SS24-001-BLK-M",
    color_name: "Đen", color_hex: "#1a1a1a", size_code: "M",
    ton_kho: 12, dang_di_duong: 20, ban_30_ngay: 72, toc_do_ban: 2.4,
    so_luong_xin: 150, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
];

const SKUS_SM_PR: PRItemSKU[] = [
  {
    sku_id: "sku-10", ma_sku: "SM-SS24-001-WHT-S",
    color_name: "Trắng", color_hex: "#FFFFFF", size_code: "S",
    ton_kho: 3, dang_di_duong: 0, ban_30_ngay: 25, toc_do_ban: 0.8,
    so_luong_xin: 50, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-11", ma_sku: "SM-SS24-001-WHT-M",
    color_name: "Trắng", color_hex: "#FFFFFF", size_code: "M",
    ton_kho: 5, dang_di_duong: 0, ban_30_ngay: 30, toc_do_ban: 1.0,
    so_luong_xin: 60, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-12", ma_sku: "SM-SS24-001-NVY-M",
    color_name: "Xanh navy", color_hex: "#1a3a5c", size_code: "M",
    ton_kho: 8, dang_di_duong: 0, ban_30_ngay: 20, toc_do_ban: 0.7,
    so_luong_xin: 40, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
];

const SKUS_QJ_PR: PRItemSKU[] = [
  {
    sku_id: "sku-16", ma_sku: "QJ-AW24-001-BLK-29",
    color_name: "Đen", color_hex: "#1a1a1a", size_code: "29",
    ton_kho: 4, dang_di_duong: 0, ban_30_ngay: 18, toc_do_ban: 0.6,
    so_luong_xin: 50, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-17", ma_sku: "QJ-AW24-001-BLK-30",
    color_name: "Đen", color_hex: "#1a1a1a", size_code: "30",
    ton_kho: 6, dang_di_duong: 0, ban_30_ngay: 22, toc_do_ban: 0.7,
    so_luong_xin: 50, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
  {
    sku_id: "sku-18", ma_sku: "QJ-AW24-001-LBL-30",
    color_name: "Xanh nhạt", color_hex: "#85c1e9", size_code: "30",
    ton_kho: 2, dang_di_duong: 0, ban_30_ngay: 15, toc_do_ban: 0.5,
    so_luong_xin: 30, so_luong_duyet: 0,
    ban_30_ngay_le: 35, ban_30_ngay_si: 7,
    toc_do_ban_le: 1.2, toc_do_ban_si: 0.2
  },
];

export const MOCK_PR_ITEMS: PRItem[] = [
  {
    pr_id:        "pr-1",
    product_id:   "p-1",
    product_code: "ATS-SS24-001",
    ten_sp:       "Áo Thun Basic Oversize",
    image_url:    "",
    season_code:  "SS24",
    season_id:    "s-1",
    vendor_id:    "v-1",
    vendor_name:  "Xưởng May Ánh Sáng",
    lead_time:    14,
    ly_do:        "duoi_muc_an_toan",
    ghi_chu:      "Hàng bán rất chạy, cần nhập gấp trước tháng 5",
    ton_kho_cha:  60,
    dang_di_duong: 40,
    ban_30_ngay:  267,
    toc_do_ban:   8.9,
    trang_thai:   "cho_duyet",
    ngay_tao:     "2026-04-28T08:00:00Z",
    skus:         SKUS_ATS_PR,
  },
  {
    pr_id:        "pr-2",
    product_id:   "p-2",
    product_code: "SM-SS24-001",
    ten_sp:       "Áo Sơ Mi Linen Trơn",
    image_url:    "",
    season_code:  "SS24",
    season_id:    "s-1",
    vendor_id:    "v-1",
    vendor_name:  "Xưởng May Ánh Sáng",
    lead_time:    14,
    ly_do:        "duoi_muc_an_toan",
    ghi_chu:      "",
    ton_kho_cha:  16,
    dang_di_duong: 0,
    ban_30_ngay:  75,
    toc_do_ban:   2.5,
    trang_thai:   "cho_duyet",
    ngay_tao:     "2026-04-29T09:00:00Z",
    skus:         SKUS_SM_PR,
  },
  {
    pr_id:        "pr-3",
    product_id:   "p-3",
    product_code: "QJ-AW24-001",
    ten_sp:       "Quần Jean Slim Fit",
    image_url:    "",
    season_code:  "AW24",   // ← hàng Thu Đông — sẽ tô đỏ nếu đang là mùa hè
    season_id:    "s-2",
    vendor_id:    "v-2",
    vendor_name:  "Xưởng Hồng Vân",
    lead_time:    21,
    ly_do:        "du_tru_su_kien",
    ghi_chu:      "Chuẩn bị cho đợt sale tháng 11",
    ton_kho_cha:  12,
    dang_di_duong: 0,
    ban_30_ngay:  55,
    toc_do_ban:   1.8,
    trang_thai:   "cho_duyet",
    ngay_tao:     "2026-04-29T10:00:00Z",
    skus:         SKUS_QJ_PR,
  },
];

// ─── Purchase Orders ──────────────────────────────────────────────────────────

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    po_id:             "po-1",
    ma_po:             "PO-2026-001",
    vendor_id:         "v-1",
    vendor_name:       "Xưởng May Ánh Sáng",
    lead_time:         14,
    ngay_dat:          "2026-04-01T08:00:00Z",
    ngay_du_kien_giao: "2026-04-15T08:00:00Z",
    dieu_khoan_tt:     "Công nợ 30 ngày",
    ghi_chu:           "",
    tong_tien:         42500000,
    trang_thai:        "dang_giao",
    pct_nhan:          60,
    items: [
      {
        sku_id: "sku-1", ma_sku: "ATS-SS24-001-WHT-S",
        ten_sp: "Áo Thun Basic Oversize",
        color_name: "Trắng", color_hex: "#FFFFFF", size_code: "S",
        so_luong_dat: 100, so_luong_nhan: 60,
        don_gia: 85000, thanh_tien: 8500000,
      },
      {
        sku_id: "sku-2", ma_sku: "ATS-SS24-001-WHT-M",
        ten_sp: "Áo Thun Basic Oversize",
        color_name: "Trắng", color_hex: "#FFFFFF", size_code: "M",
        so_luong_dat: 150, so_luong_nhan: 90,
        don_gia: 85000, thanh_tien: 12750000,
      },
      {
        sku_id: "sku-4", ma_sku: "ATS-SS24-001-BLK-S",
        ten_sp: "Áo Thun Basic Oversize",
        color_name: "Đen", color_hex: "#1a1a1a", size_code: "S",
        so_luong_dat: 120, so_luong_nhan: 70,
        don_gia: 85000, thanh_tien: 10200000,
      },
      {
        sku_id: "sku-5", ma_sku: "ATS-SS24-001-BLK-M",
        ten_sp: "Áo Thun Basic Oversize",
        color_name: "Đen", color_hex: "#1a1a1a", size_code: "M",
        so_luong_dat: 130, so_luong_nhan: 80,
        don_gia: 85000, thanh_tien: 11050000,
      },
    ],
  },
  {
    po_id:             "po-2",
    ma_po:             "PO-2026-002",
    vendor_id:         "v-2",
    vendor_name:       "Xưởng Hồng Vân",
    lead_time:         21,
    ngay_dat:          "2026-03-20T08:00:00Z",
    ngay_du_kien_giao: "2026-04-10T08:00:00Z", // ← đã qua ngày → TRỄ HẸN
    dieu_khoan_tt:     "Đặt cọc 50% - còn lại khi nhận hàng",
    ghi_chu:           "Liên hệ anh Tuấn SĐT 0912345678",
    tong_tien:         28600000,
    trang_thai:        "tre_han",
    pct_nhan:          30,
    items: [
      {
        sku_id: "sku-16", ma_sku: "QJ-AW24-001-BLK-29",
        ten_sp: "Quần Jean Slim Fit",
        color_name: "Đen", color_hex: "#1a1a1a", size_code: "29",
        so_luong_dat: 80, so_luong_nhan: 25,
        don_gia: 195000, thanh_tien: 15600000,
      },
      {
        sku_id: "sku-17", ma_sku: "QJ-AW24-001-BLK-30",
        ten_sp: "Quần Jean Slim Fit",
        color_name: "Đen", color_hex: "#1a1a1a", size_code: "30",
        so_luong_dat: 67, so_luong_nhan: 20,
        don_gia: 195000, thanh_tien: 13065000,
      },
    ],
  },
  {
    po_id:             "po-3",
    ma_po:             "PO-2026-003",
    vendor_id:         "v-1",
    vendor_name:       "Xưởng May Ánh Sáng",
    lead_time:         14,
    ngay_dat:          "2026-04-20T08:00:00Z",
    ngay_du_kien_giao: "2026-05-04T08:00:00Z",
    dieu_khoan_tt:     "Công nợ 30 ngày",
    ghi_chu:           "",
    tong_tien:         15300000,
    trang_thai:        "cho_giao",
    pct_nhan:          0,
    items: [
      {
        sku_id: "sku-10", ma_sku: "SM-SS24-001-WHT-S",
        ten_sp: "Áo Sơ Mi Linen Trơn",
        color_name: "Trắng", color_hex: "#FFFFFF", size_code: "S",
        so_luong_dat: 50, so_luong_nhan: 0,
        don_gia: 120000, thanh_tien: 6000000,
      },
      {
        sku_id: "sku-11", ma_sku: "SM-SS24-001-WHT-M",
        ten_sp: "Áo Sơ Mi Linen Trơn",
        color_name: "Trắng", color_hex: "#FFFFFF", size_code: "M",
        so_luong_dat: 60, so_luong_nhan: 0,
        don_gia: 120000, thanh_tien: 7200000,
      },
      {
        sku_id: "sku-12", ma_sku: "SM-SS24-001-NVY-M",
        ten_sp: "Áo Sơ Mi Linen Trơn",
        color_name: "Xanh navy", color_hex: "#1a3a5c", size_code: "M",
        so_luong_dat: 17, so_luong_nhan: 0,
        don_gia: 120000, thanh_tien: 2040000,
      },
    ],
  },
];

// ─── Approved Items — chờ gom PO ─────────────────────────────────────────────
// Lưu tạm các PR đã duyệt chờ tạo PO ở Tab 2

export const MOCK_APPROVED_ITEMS: import("./purchaseTypes").ApprovedItem[] = [];