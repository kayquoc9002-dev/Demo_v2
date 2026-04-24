// ─────────────────────────────────────────────────────────────────────────────
// inboundMockData.ts — Mock data cho Module 3: Nhập Kho
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhapKho } from "./inboundTypes";

export const MOCK_PHIEU_NHAP: PhieuNhapKho[] = [
  // ── Phiếu 1: Đang kiểm tra QC ────────────────────────────────────────────
  {
    id: "pn-001",
    ma_phieu: "PN-2026-041",
    loai: "tu_don_dat_hang",
    trang_thai: "dang_kiem_tra",
    nha_cung_cap: "Xưởng May Minh Phát",
    nguoi_tao: "Nguyễn Văn A",
    ngay_tao: "2026-04-18T08:00:00Z",
    ngay_du_kien: "2026-04-20T00:00:00Z",
    ngay_nhan_thuc: "2026-04-20T14:30:00Z",
    ly_do: "",
    ghi_chu: "Đơn áo thun tháng 4",
    chi_tiet: [
      {
        id: "ct-001-1",
        phieu_id: "pn-001",
        ma_sku: "AT001-M-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng M",
        so_luong_po: 100,
        so_luong_thuc: 98,
        so_luong_dat: 95,
        so_luong_loi: 3,
        trang_thai_qc: "dat",
        ghi_chu_qc: "3 cái lỗi đường may",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
      {
        id: "ct-001-2",
        phieu_id: "pn-001",
        ma_sku: "AT001-L-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng L",
        so_luong_po: 80,
        so_luong_thuc: 80,
        so_luong_dat: 0,
        so_luong_loi: 0,
        trang_thai_qc: "chua_kiem",
        ghi_chu_qc: "",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
      {
        id: "ct-001-3",
        phieu_id: "pn-001",
        ma_sku: "AT001-XL-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng XL",
        so_luong_po: 60,
        so_luong_thuc: 55,
        so_luong_dat: 0,
        so_luong_loi: 0,
        trang_thai_qc: "thieu_hang",
        ghi_chu_qc: "Thiếu 5 cái so với PO",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
    ],
  },

  // ── Phiếu 2: Chờ cất kệ ──────────────────────────────────────────────────
  {
    id: "pn-002",
    ma_phieu: "PN-2026-039",
    loai: "tu_don_dat_hang",
    trang_thai: "cho_cat_ke",
    nha_cung_cap: "Xưởng Thành Đạt",
    nguoi_tao: "Trần Thị B",
    ngay_tao: "2026-04-15T09:00:00Z",
    ngay_du_kien: "2026-04-17T00:00:00Z",
    ngay_nhan_thuc: "2026-04-17T10:00:00Z",
    ly_do: "",
    ghi_chu: "Quần jean tháng 4",
    chi_tiet: [
      {
        id: "ct-002-1",
        phieu_id: "pn-002",
        ma_sku: "QJ004-29-XNHT",
        ten_sp: "Quần Jean Skinny — Xanh nhạt 29",
        so_luong_po: 50,
        so_luong_thuc: 50,
        so_luong_dat: 48,
        so_luong_loi: 2,
        trang_thai_qc: "dat",
        ghi_chu_qc: "2 cái phai màu nhẹ",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
      {
        id: "ct-002-2",
        phieu_id: "pn-002",
        ma_sku: "QJ004-30-XNHT",
        ten_sp: "Quần Jean Skinny — Xanh nhạt 30",
        so_luong_po: 50,
        so_luong_thuc: 50,
        so_luong_dat: 50,
        so_luong_loi: 0,
        trang_thai_qc: "dat",
        ghi_chu_qc: "",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
    ],
  },

  // ── Phiếu 3: Hoàn thành ──────────────────────────────────────────────────
  {
    id: "pn-003",
    ma_phieu: "PN-2026-035",
    loai: "tu_don_dat_hang",
    trang_thai: "hoan_thanh",
    nha_cung_cap: "Xưởng May Minh Phát",
    nguoi_tao: "Nguyễn Văn A",
    ngay_tao: "2026-04-10T08:00:00Z",
    ngay_du_kien: "2026-04-12T00:00:00Z",
    ngay_nhan_thuc: "2026-04-12T09:00:00Z",
    ly_do: "",
    ghi_chu: "",
    chi_tiet: [
      {
        id: "ct-003-1",
        phieu_id: "pn-003",
        ma_sku: "VD003-M-XANH",
        ten_sp: "Váy Midi Floral — Xanh M",
        so_luong_po: 40,
        so_luong_thuc: 40,
        so_luong_dat: 40,
        so_luong_loi: 0,
        trang_thai_qc: "dat",
        ghi_chu_qc: "",
        da_cat_ke: true,
        node_id_cat: "n-B01-01A-T1",
        so_luong_da_cat: 40,
      },
    ],
  },

  // ── Phiếu 4: Chờ hàng về ────────────────────────────────────────────────
  {
    id: "pn-004",
    ma_phieu: "PN-2026-044",
    loai: "tu_don_dat_hang",
    trang_thai: "cho_hang_ve",
    nha_cung_cap: "Xưởng Hoàng Gia",
    nguoi_tao: "Lê Văn C",
    ngay_tao: "2026-04-22T10:00:00Z",
    ngay_du_kien: "2026-04-26T00:00:00Z",
    ngay_nhan_thuc: "",
    ly_do: "",
    ghi_chu: "Lô váy hè 2026",
    chi_tiet: [
      {
        id: "ct-004-1",
        phieu_id: "pn-004",
        ma_sku: "VD003-L-XANH",
        ten_sp: "Váy Midi Floral — Xanh L",
        so_luong_po: 60,
        so_luong_thuc: 0,
        so_luong_dat: 0,
        so_luong_loi: 0,
        trang_thai_qc: "chua_kiem",
        ghi_chu_qc: "",
        da_cat_ke: false,
        node_id_cat: "",
        so_luong_da_cat: 0,
      },
    ],
  },

  // ── Phiếu 5: Nhập khác ───────────────────────────────────────────────────
  {
    id: "pn-005",
    ma_phieu: "PN-2026-042",
    loai: "nhap_khac",
    trang_thai: "hoan_thanh",
    nha_cung_cap: "Nội bộ",
    nguoi_tao: "Trần Thị B",
    ngay_tao: "2026-04-19T14:00:00Z",
    ngay_du_kien: "2026-04-19T00:00:00Z",
    ngay_nhan_thuc: "2026-04-19T14:30:00Z",
    ly_do: "Bù chênh lệch kiểm kê tháng 4 — biên bản số BK-2026-04",
    ghi_chu: "",
    chi_tiet: [
      {
        id: "ct-005-1",
        phieu_id: "pn-005",
        ma_sku: "AK007-S-DEN",
        ten_sp: "Áo Khoác Bomber — Đen S",
        so_luong_po: 5,
        so_luong_thuc: 5,
        so_luong_dat: 5,
        so_luong_loi: 0,
        trang_thai_qc: "dat",
        ghi_chu_qc: "",
        da_cat_ke: true,
        node_id_cat: "n-A02-02A-T1",
        so_luong_da_cat: 5,
      },
    ],
  },
];

// ─── Danh sách NCC gợi ý ────────────────────────────────────────────────────

export const MOCK_NHA_CUNG_CAP = [
  "Xưởng May Minh Phát",
  "Xưởng Thành Đạt",
  "Xưởng Hoàng Gia",
  "Công ty Dệt May Phương Nam",
  "Nội bộ",
];

// ─── Mock PO từ kế toán ──────────────────────────────────────────────────────

export interface DonDatHang {
  id: string;
  ma_po: string; // VD: "PO-2026-018"
  nha_cung_cap: string;
  ngay_tao: string;
  ngay_giao_du_kien: string;
  trang_thai: "cho_giao" | "da_tao_phieu" | "huy";
  ghi_chu: string;
  chi_tiet: {
    ma_sku: string;
    ten_sp: string;
    so_luong: number;
    don_gia: number;
  }[];
}

export const MOCK_PO: DonDatHang[] = [
  {
    id: "po-001",
    ma_po: "PO-2026-018",
    nha_cung_cap: "Xưởng May Minh Phát",
    ngay_tao: "2026-04-20T08:00:00Z",
    ngay_giao_du_kien: "2026-04-28T00:00:00Z",
    trang_thai: "cho_giao",
    ghi_chu: "Lô áo thun hè 2026",
    chi_tiet: [
      {
        ma_sku: "AT001-S-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng S",
        so_luong: 120,
        don_gia: 85000,
      },
      {
        ma_sku: "AT001-M-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng M",
        so_luong: 200,
        don_gia: 85000,
      },
      {
        ma_sku: "AT001-L-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng L",
        so_luong: 150,
        don_gia: 85000,
      },
      {
        ma_sku: "AT001-M-DEN",
        ten_sp: "Áo Thun Basic Oversize — Đen M",
        so_luong: 180,
        don_gia: 85000,
      },
    ],
  },
  {
    id: "po-002",
    ma_po: "PO-2026-019",
    nha_cung_cap: "Xưởng Thành Đạt",
    ngay_tao: "2026-04-21T10:00:00Z",
    ngay_giao_du_kien: "2026-04-30T00:00:00Z",
    trang_thai: "cho_giao",
    ghi_chu: "Quần jean skinny tháng 5",
    chi_tiet: [
      {
        ma_sku: "QJ004-28-XNHT",
        ten_sp: "Quần Jean Skinny — Xanh nhạt 28",
        so_luong: 60,
        don_gia: 145000,
      },
      {
        ma_sku: "QJ004-29-XNHT",
        ten_sp: "Quần Jean Skinny — Xanh nhạt 29",
        so_luong: 80,
        don_gia: 145000,
      },
      {
        ma_sku: "QJ004-30-XNHT",
        ten_sp: "Quần Jean Skinny — Xanh nhạt 30",
        so_luong: 70,
        don_gia: 145000,
      },
    ],
  },
  {
    id: "po-003",
    ma_po: "PO-2026-020",
    nha_cung_cap: "Xưởng Hoàng Gia",
    ngay_tao: "2026-04-22T09:00:00Z",
    ngay_giao_du_kien: "2026-05-05T00:00:00Z",
    trang_thai: "cho_giao",
    ghi_chu: "Váy đầm bộ sưu tập hè",
    chi_tiet: [
      {
        ma_sku: "VD003-S-XANH",
        ten_sp: "Váy Midi Floral — Xanh S",
        so_luong: 50,
        don_gia: 195000,
      },
      {
        ma_sku: "VD003-M-XANH",
        ten_sp: "Váy Midi Floral — Xanh M",
        so_luong: 70,
        don_gia: 195000,
      },
      {
        ma_sku: "VD003-L-XANH",
        ten_sp: "Váy Midi Floral — Xanh L",
        so_luong: 60,
        don_gia: 195000,
      },
    ],
  },
  {
    id: "po-004",
    ma_po: "PO-2026-015",
    nha_cung_cap: "Xưởng May Minh Phát",
    ngay_tao: "2026-04-10T08:00:00Z",
    ngay_giao_du_kien: "2026-04-18T00:00:00Z",
    trang_thai: "da_tao_phieu",
    ghi_chu: "Đã tạo phiếu PN-2026-041",
    chi_tiet: [
      {
        ma_sku: "AT001-M-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng M",
        so_luong: 100,
        don_gia: 85000,
      },
      {
        ma_sku: "AT001-L-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng L",
        so_luong: 80,
        don_gia: 85000,
      },
      {
        ma_sku: "AT001-XL-TRANG",
        ten_sp: "Áo Thun Basic Oversize — Trắng XL",
        so_luong: 60,
        don_gia: 85000,
      },
    ],
  },
];
