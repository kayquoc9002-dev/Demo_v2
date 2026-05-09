// ─────────────────────────────────────────────────────────────────────────────
// inventoryMockData.ts — Mock data cho Module 5: Tồn kho & Kiểm kê
// ─────────────────────────────────────────────────────────────────────────────

import type { TonKhoRecord, PhieuChuyenKho, PhieuKiemKe } from "./inventoryTypes";

const NOW = new Date().toISOString();

// ─── Tồn kho hiện tại (SKU × Vị trí) ────────────────────────────────────────
// Đây là bảng trung tâm — mỗi dòng = 1 SKU tại 1 ô cụ thể

export const MOCK_TON_KHO: TonKhoRecord[] = [
  // ── Khu A — Áo thun ──────────────────────────────────────────────────────
  {
    ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M",
    node_id: "n-A01-01A-T1", location_code: "A-01-01A-T1",
    so_luong: 0, dinh_muc_min: 10, dinh_muc_max: 200, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  {
    ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M",
    node_id: "n-A01-01A-T2", location_code: "A-01-01A-T2",
    so_luong: 2, dinh_muc_min: 0, dinh_muc_max: 0, la_primary: false,
    ngay_cap_nhat: NOW,
  },
  {
    ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "L",
    node_id: "n-A01-01A-T2", location_code: "A-01-01A-T2",
    so_luong: 45, dinh_muc_min: 10, dinh_muc_max: 150, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  {
    ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen", kich_thuoc: "M",
    node_id: "n-A01-01A-T3", location_code: "A-01-01A-T3",
    so_luong: 38, dinh_muc_min: 10, dinh_muc_max: 200, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  // ── Khu A — Quần jean ────────────────────────────────────────────────────
  {
    ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny", mau_sac: "Xanh nhạt", kich_thuoc: "29",
    node_id: "n-A01-01B-T1", location_code: "A-01-01B-T1",
    so_luong: 48, dinh_muc_min: 5, dinh_muc_max: 100, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  {
    ma_sku: "QJ004-30-XNHT", ten_sp: "Quần Jean Skinny", mau_sac: "Xanh nhạt", kich_thuoc: "30",
    node_id: "n-A01-01B-T2", location_code: "A-01-01B-T2",
    so_luong: 50, dinh_muc_min: 5, dinh_muc_max: 100, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  // ── Khu A — Áo khoác ────────────────────────────────────────────────────
  {
    ma_sku: "AK007-S-DEN", ten_sp: "Áo Khoác Bomber", mau_sac: "Đen", kich_thuoc: "S",
    node_id: "n-A02-02A-T1", location_code: "A-02-02A-T1",
    so_luong: 12, dinh_muc_min: 5, dinh_muc_max: 80, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  // ── Khu B — Đồ nữ ────────────────────────────────────────────────────────
  {
    ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral", mau_sac: "Xanh pastel", kich_thuoc: "M",
    node_id: "n-B01-01A-T1", location_code: "B-01-01A-T1",
    so_luong: 40, dinh_muc_min: 8, dinh_muc_max: 100, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  {
    ma_sku: "VD003-S-XANH", ten_sp: "Váy Midi Floral", mau_sac: "Xanh pastel", kich_thuoc: "S",
    node_id: "n-B01-01A-T2", location_code: "B-01-01A-T2",
    so_luong: 3, dinh_muc_min: 8, dinh_muc_max: 80, la_primary: true,
    ngay_cap_nhat: NOW,
  },
  // ── Khu C — Hàng lỗi ────────────────────────────────────────────────────
  {
    ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize (Lỗi)", mau_sac: "Trắng", kich_thuoc: "M",
    node_id: "n-C01-01A-T1", location_code: "C-01-01A-T1",
    so_luong: 3, dinh_muc_min: 0, dinh_muc_max: 0, la_primary: false,
    ngay_cap_nhat: NOW,
  },
];

// ─── Phiếu chuyển kho nội bộ ─────────────────────────────────────────────────

export const MOCK_PHIEU_CHUYEN: PhieuChuyenKho[] = [
  {
    id: "ck-001", ma_phieu: "CK-2026-031",
    ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize — Trắng M",
    node_id_tu: "n-A01-01A-T2", location_tu: "A-01-01A-T2",
    node_id_den: "n-A01-01A-T1", location_den: "A-01-01A-T1",
    so_luong: 10, ly_do: "Bổ sung vào vị trí primary đang hết hàng",
    trang_thai: "hoan_thanh", nguoi_tao: "Trần Văn Kho",
    ngay_tao: "2026-04-20T09:00:00Z", ngay_hoan_thanh: "2026-04-20T09:30:00Z",
  },
  {
    id: "ck-002", ma_phieu: "CK-2026-032",
    ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral — Xanh M",
    node_id_tu: "n-B01-01A-T1", location_tu: "B-01-01A-T1",
    node_id_den: "n-B01-01A-T2", location_den: "B-01-01A-T2",
    so_luong: 5, ly_do: "Dọn kệ, phân bổ đều 2 tầng",
    trang_thai: "cho_xac_nhan", nguoi_tao: "Nguyễn Thị Lan",
    ngay_tao: "2026-04-24T10:00:00Z", ngay_hoan_thanh: "",
  },
];

// ─── Phiếu kiểm kê ───────────────────────────────────────────────────────────

export const MOCK_PHIEU_KIEM_KE: PhieuKiemKe[] = [
  {
    id: "kk-001", ma_phieu: "KK-2026-003",
    trang_thai: "cho_duyet",
    pham_vi: "Khu A — Toàn bộ",
    nguoi_tao: "Quản lý kho", nguoi_duyet: "",
    ngay_tao: "2026-04-22T08:00:00Z", ngay_hoan_thanh: "2026-04-22T17:00:00Z",
    ghi_chu: "Kiểm kê định kỳ cuối tháng 4",
    danh_sach: [
      {
        id: "dk-1", phieu_id: "kk-001",
        ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize — Trắng M",
        node_id: "n-A01-01A-T1", location_code: "A-01-01A-T1",
        so_luong_he_thong: 0, so_luong_thuc: 0,
        chenh_lech: 0, ghi_chu: "", da_dem: true,
      },
      {
        id: "dk-2", phieu_id: "kk-001",
        ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Basic Oversize — Trắng L",
        node_id: "n-A01-01A-T2", location_code: "A-01-01A-T2",
        so_luong_he_thong: 45, so_luong_thuc: 43,
        chenh_lech: -2, ghi_chu: "2 cái không thấy — có thể đã xuất thiếu ghi chép",
        da_dem: true,
      },
      {
        id: "dk-3", phieu_id: "kk-001",
        ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize — Đen M",
        node_id: "n-A01-01A-T3", location_code: "A-01-01A-T3",
        so_luong_he_thong: 38, so_luong_thuc: 38,
        chenh_lech: 0, ghi_chu: "", da_dem: true,
      },
      {
        id: "dk-4", phieu_id: "kk-001",
        ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny — 29",
        node_id: "n-A01-01B-T1", location_code: "A-01-01B-T1",
        so_luong_he_thong: 48, so_luong_thuc: 50,
        chenh_lech: 2, ghi_chu: "Dư 2 — cần đối chiếu phiếu nhập",
        da_dem: true,
      },
    ],
  },
  {
    id: "kk-002", ma_phieu: "KK-2026-004",
    trang_thai: "dang_kiem",
    pham_vi: "Khu B — Toàn bộ",
    nguoi_tao: "Quản lý kho", nguoi_duyet: "",
    ngay_tao: "2026-04-24T08:00:00Z", ngay_hoan_thanh: "",
    ghi_chu: "",
    danh_sach: [
      {
        id: "dk-5", phieu_id: "kk-002",
        ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral — Xanh M",
        node_id: "n-B01-01A-T1", location_code: "B-01-01A-T1",
        so_luong_he_thong: 40, so_luong_thuc: 40,
        chenh_lech: 0, ghi_chu: "", da_dem: true,
      },
      {
        id: "dk-6", phieu_id: "kk-002",
        ma_sku: "VD003-S-XANH", ten_sp: "Váy Midi Floral — Xanh S",
        node_id: "n-B01-01A-T2", location_code: "B-01-01A-T2",
        so_luong_he_thong: 3, so_luong_thuc: 0,
        chenh_lech: 0, ghi_chu: "", da_dem: false,
      },
    ],
  },
];