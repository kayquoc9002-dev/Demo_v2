// ─────────────────────────────────────────────────────────────────────────────
// returnsMockData.ts — Mock data cho Module 6: Sự cố & Hàng hoàn
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuHangHoan, PhieuSuCo } from "./returnsTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NOW = new Date().toISOString();

// ─── Phiếu hàng hoàn từ ĐVVC ─────────────────────────────────────────────────

export const MOCK_PHIEU_HANG_HOAN: PhieuHangHoan[] = [
  // Phiếu 1: Đang QC
  {
    id: "hh-001", ma_phieu: "HH-2026-038",
    ma_van_don: "VTP-2026-11203",
    don_id: "8", ma_don: "DH-2026-0008",
    ten_khach: "Vũ Thanh Tùng", dvvc: "Viettel Post",
    trang_thai: "dang_qc",
    nguon: "dvvc",
    ngay_tao: "2026-04-24T09:00:00Z", ngay_hoan_thanh: "",
    ghi_chu: "",
    danh_sach: [
      {
        id: "dong-hh-1", phieu_id: "hh-001",
        ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize — Đen M",
        so_luong: 1,
        tinh_trang: "loi_nang",
        huong_xu_ly: "chua_xu_ly",
        ghi_chu: "Rách đường may tay áo",
        da_qc: true,
      },
      {
        id: "dong-hh-2", phieu_id: "hh-001",
        ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize — Đen M",
        so_luong: 1,
        tinh_trang: null,
        huong_xu_ly: "chua_xu_ly",
        ghi_chu: "",
        da_qc: false,
      },
    ],
  },

  // Phiếu 2: Chờ QC (mới scan về)
  {
    id: "hh-002", ma_phieu: "HH-2026-039",
    ma_van_don: "GHTK-2026-44512",
    don_id: "10", ma_don: "DH-2026-0010",
    ten_khach: "Đinh Văn Khoa", dvvc: "GHTK",
    trang_thai: "cho_qc",
    nguon: "dvvc",
    ngay_tao: "2026-04-24T14:00:00Z", ngay_hoan_thanh: "",
    ghi_chu: "Khách không nhận — giao thất bại lần 2",
    danh_sach: [
      {
        id: "dong-hh-3", phieu_id: "hh-002",
        ma_sku: "AT001-L-DEN", ten_sp: "Áo Thun Basic Oversize — Đen L",
        so_luong: 3, tinh_trang: null, huong_xu_ly: "chua_xu_ly",
        ghi_chu: "", da_qc: false,
      },
      {
        id: "dong-hh-4", phieu_id: "hh-002",
        ma_sku: "QS002-L-DEN", ten_sp: "Quần Short Kaki — Đen L",
        so_luong: 2, tinh_trang: null, huong_xu_ly: "chua_xu_ly",
        ghi_chu: "", da_qc: false,
      },
    ],
  },

  // Phiếu 3: Hoàn thành
  {
    id: "hh-003", ma_phieu: "HH-2026-035",
    ma_van_don: "GHN2026038291",
    don_id: "3", ma_don: "DH-2026-0003",
    ten_khach: "Cty TNHH Thời Trang ABC", dvvc: "Giao Hàng Nhanh",
    trang_thai: "hoan_thanh",
    nguon: "dvvc",
    ngay_tao: "2026-04-20T10:00:00Z", ngay_hoan_thanh: "2026-04-20T16:00:00Z",
    ghi_chu: "",
    danh_sach: [
      {
        id: "dong-hh-5", phieu_id: "hh-003",
        ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize — Đen M",
        so_luong: 5, tinh_trang: "moi_100", huong_xu_ly: "len_ke_ban_tiep",
        ghi_chu: "Còn nguyên tag, khách chưa mặc", da_qc: true,
      },
      {
        id: "dong-hh-6", phieu_id: "hh-003",
        ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny — 29",
        so_luong: 3, tinh_trang: "loi_nhe", huong_xu_ly: "thanh_ly",
        ghi_chu: "Dính vết bẩn nhỏ ở ống quần", da_qc: true,
      },
    ],
  },
];

// ─── Phiếu sự cố trong kho ───────────────────────────────────────────────────

export const MOCK_PHIEU_SU_CO: PhieuSuCo[] = [
  {
    id: "sc-001", ma_phieu: "SC-2026-015",
    ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Basic Oversize — Trắng L",
    so_luong: 2,
    ly_do: "hang_o_vang",
    mo_ta_them: "2 cái bị ố vàng do ẩm mốc, phát hiện lúc picking",
    node_id_nguon: "n-A01-01A-T2", location_nguon: "A-01-01A-T2",
    trang_thai: "da_chuyen_kho",
    huong_xu_ly: "tra_xuong_ncc",
    nguoi_bao: "Trần Văn Kho",
    ngay_tao: "2026-04-22T10:30:00Z",
    ghi_chu: "Đã chuyển vào Khu C, chờ trả xưởng",
  },
  {
    id: "sc-002", ma_phieu: "SC-2026-016",
    ma_sku: "QJ004-30-XNHT", ten_sp: "Quần Jean Skinny — Xanh nhạt 30",
    so_luong: 1,
    ly_do: "hang_bi_rach",
    mo_ta_them: "Rách túi sau lúc lấy hàng",
    node_id_nguon: "n-A01-01B-T2", location_nguon: "A-01-01B-T2",
    trang_thai: "cho_xu_ly",
    huong_xu_ly: "chua_xu_ly",
    nguoi_bao: "Nguyễn Thị Lan",
    ngay_tao: "2026-04-24T08:15:00Z",
    ghi_chu: "",
  },
];