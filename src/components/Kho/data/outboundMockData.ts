// ─────────────────────────────────────────────────────────────────────────────
// outboundMockData.ts — Mock data cho Module 4: Xuất kho / Picking
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhatHang } from "./outboundTypes";

// Mock phiếu nhặt đã có sẵn (các ca trước đã tạo)
export const MOCK_PHIEU_NHAT: PhieuNhatHang[] = [
  {
    id:        "pk-001",
    ma_phieu:  "PK-2026-038",
    trang_thai:"dang_nhat",
    don_ids:   ["dh-001","dh-002","dh-003","dh-004","dh-005"],
    nhan_vien: "Trần Văn Kho",
    ngay_tao:  "2026-04-24T08:30:00Z",
    ngay_hoan_thanh: "",
    ghi_chu:   "Ca sáng",
    danh_sach_nhat: [
      {
        id: "dn-1", phieu_id: "pk-001",
        ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Oversize — Đen M",
        node_id: "n-A01-01A-T1", location_code: "A-01-01A-T1",
        so_luong_can: 8, so_luong_lay: 8,
        da_nhat: true, don_ids: ["dh-001","dh-002","dh-003"],
      },
      {
        id: "dn-2", phieu_id: "pk-001",
        ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Oversize — Trắng L",
        node_id: "n-A01-01A-T2", location_code: "A-01-01A-T2",
        so_luong_can: 5, so_luong_lay: 5,
        da_nhat: true, don_ids: ["dh-001","dh-004"],
      },
      {
        id: "dn-3", phieu_id: "pk-001",
        ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny — 29",
        node_id: "n-A01-01B-T1", location_code: "A-01-01B-T1",
        so_luong_can: 4, so_luong_lay: 4,
        da_nhat: false, don_ids: ["dh-003","dh-005"],
      },
      {
        id: "dn-4", phieu_id: "pk-001",
        ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral — Xanh M",
        node_id: "n-B01-01A-T1", location_code: "B-01-01A-T1",
        so_luong_can: 3, so_luong_lay: 3,
        da_nhat: false, don_ids: ["dh-002","dh-004","dh-005"],
      },
    ],
    packing_items: [
      {
        don_id: "dh-001", ma_don: "DH-2026-0085",
        ten_khach: "Nguyễn Văn An", dia_chi: "12 Lê Lợi, Q1, TP.HCM",
        san_pham: [
          { ma_sku: "AT001-M-DEN",   ten_sp: "Áo Thun Oversize — Đen M",   so_luong: 2 },
          { ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Oversize — Trắng L", so_luong: 1 },
        ],
        da_kiem_tra: false, da_dong_goi: false, ma_van_don: "", dvvc: "Giao Hàng Nhanh",
      },
      {
        don_id: "dh-002", ma_don: "DH-2026-0086",
        ten_khach: "Trần Thị Bình", dia_chi: "45 Nguyễn Huệ, Q1, TP.HCM",
        san_pham: [
          { ma_sku: "AT001-M-DEN",  ten_sp: "Áo Thun Oversize — Đen M",  so_luong: 3 },
          { ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral — Xanh M",  so_luong: 1 },
        ],
        da_kiem_tra: false, da_dong_goi: false, ma_van_don: "", dvvc: "Giao Hàng Nhanh",
      },
      {
        don_id: "dh-003", ma_don: "DH-2026-0087",
        ten_khach: "Lê Minh Châu", dia_chi: "78 Điện Biên Phủ, Q3, TP.HCM",
        san_pham: [
          { ma_sku: "AT001-M-DEN",   ten_sp: "Áo Thun Oversize — Đen M",   so_luong: 3 },
          { ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny — 29",       so_luong: 2 },
        ],
        da_kiem_tra: false, da_dong_goi: false, ma_van_don: "", dvvc: "J&T Express",
      },
      {
        don_id: "dh-004", ma_don: "DH-2026-0088",
        ten_khach: "Phạm Thu Dung", dia_chi: "99 Cách Mạng Tháng 8, Q10, TP.HCM",
        san_pham: [
          { ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Oversize — Trắng L", so_luong: 2 },
          { ma_sku: "VD003-M-XANH",  ten_sp: "Váy Midi Floral — Xanh M",   so_luong: 1 },
        ],
        da_kiem_tra: false, da_dong_goi: false, ma_van_don: "", dvvc: "Giao Hàng Nhanh",
      },
      {
        don_id: "dh-005", ma_don: "DH-2026-0089",
        ten_khach: "Hoàng Văn Em", dia_chi: "33 Pasteur, Q3, TP.HCM",
        san_pham: [
          { ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny — 29",     so_luong: 2 },
          { ma_sku: "VD003-M-XANH",  ten_sp: "Váy Midi Floral — Xanh M",  so_luong: 1 },
        ],
        da_kiem_tra: false, da_dong_goi: false, ma_van_don: "", dvvc: "Giao Hàng Tiết Kiệm",
      }
    ],
  },
  {
    id:        "pk-002",
    ma_phieu:  "PK-2026-037",
    trang_thai:"cho_shipping",
    don_ids:   ["dh-006","dh-007","dh-008"],
    nhan_vien: "Nguyễn Thị Lan",
    ngay_tao:  "2026-04-24T07:00:00Z",
    ngay_hoan_thanh: "",
    ghi_chu:   "",
    danh_sach_nhat: [
      {
        id: "dn-5", phieu_id: "pk-002",
        ma_sku: "AK007-S-DEN", ten_sp: "Áo Khoác Bomber — Đen S",
        node_id: "n-A02-02A-T1", location_code: "A-02-02A-T1",
        so_luong_can: 3, so_luong_lay: 3,
        da_nhat: true, don_ids: ["dh-006","dh-007","dh-008"],
      },
    ],
    packing_items: [
      {
        don_id: "dh-006", ma_don: "DH-2026-0089",
        ten_khach: "Nguyễn Thị A", dia_chi: "12 Lê Lợi, Q1, TP.HCM",
        san_pham: [{ ma_sku: "AK007-S-DEN", ten_sp: "Áo Khoác Bomber — Đen S", so_luong: 1 }],
        da_kiem_tra: true, da_dong_goi: true,
        ma_van_don: "GHN2026041234", dvvc: "Giao Hàng Nhanh",
      },
      {
        don_id: "dh-007", ma_don: "DH-2026-0090",
        ten_khach: "Trần Văn B", dia_chi: "45 Nguyễn Huệ, Q1, TP.HCM",
        san_pham: [{ ma_sku: "AK007-S-DEN", ten_sp: "Áo Khoác Bomber — Đen S", so_luong: 1 }],
        da_kiem_tra: true, da_dong_goi: true,
        ma_van_don: "GHN2026041235", dvvc: "Giao Hàng Nhanh",
      },
      {
        don_id: "dh-008", ma_don: "DH-2026-0091",
        ten_khach: "Lê Thị C", dia_chi: "78 Hai Bà Trưng, Q3, TP.HCM",
        san_pham: [{ ma_sku: "AK007-S-DEN", ten_sp: "Áo Khoác Bomber — Đen S", so_luong: 1 }],
        da_kiem_tra: true, da_dong_goi: false,
        ma_van_don: "", dvvc: "Giao Hàng Nhanh",
      },
    ],
  },
];