// ─────────────────────────────────────────────────────────────────────────────
// returnsService.ts — Service layer cho Module 6: Sự cố & Hàng hoàn
// Bây giờ: đọc/ghi vào db + liên thông Module 3/4
// Sau này: fetch('/api/returns/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuHangHoan, PhieuSuCo } from "../data/returnsTypes";
import type { PhieuNhapKho } from "../data/inboundTypes";
import { MOCK_PHIEU_HANG_HOAN, MOCK_PHIEU_SU_CO } from "../data/returnsMockData";
import { taoPhieuNhap } from "./inboundService";
import { taoPhieuNhat } from "./outboundService";
import { truTonKho } from "./inventoryService";
import { gen_id, gen_ma_phieu } from "../data/inboundHelpers";

// ─── Hàng hoàn ───────────────────────────────────────────────────────────────

export async function layDanhSachHangHoan(): Promise<PhieuHangHoan[]> {
  return MOCK_PHIEU_HANG_HOAN;
}

export async function taoPhieuHangHoan(phieu: PhieuHangHoan): Promise<PhieuHangHoan> {
  MOCK_PHIEU_HANG_HOAN.unshift(phieu);
  return phieu;
}

export async function capNhatPhieuHangHoan(phieu: PhieuHangHoan): Promise<PhieuHangHoan> {
  const idx = MOCK_PHIEU_HANG_HOAN.findIndex(p => p.id === phieu.id);
  if (idx >= 0) MOCK_PHIEU_HANG_HOAN[idx] = phieu;
  return phieu;
}

// ─── Hành động liên module: Loại 1 → tạo phiếu nhập kho ─────────────────────

export async function xacNhanLoai1TaoPhieuNhap(
  hang_hoan_id: string,
  dong_id:      string,
): Promise<{ ma_phieu_nhap: string }> {
  const phieu = MOCK_PHIEU_HANG_HOAN.find(p => p.id === hang_hoan_id);
  if (!phieu) throw new Error("Không tìm thấy phiếu hàng hoàn");

  const dong = phieu.danh_sach.find(d => d.id === dong_id);
  if (!dong) throw new Error("Không tìm thấy dòng hàng");

  // Tạo phiếu nhập kho loại "khong_co_po" — đẩy vào Module 3
  const phieu_nhap: PhieuNhapKho = {
    id:             gen_id(),
    ma_phieu:       gen_ma_phieu(),
    loai:           "khong_co_po",
    trang_thai:     "cho_cat_ke",
    nha_cung_cap:   `Hàng hoàn — ${phieu.ten_khach}`,
    nguoi_tao:      "Module 6 — Hàng hoàn",
    ngay_tao:       new Date().toISOString(),
    ngay_du_kien:   new Date().toISOString(),
    ngay_nhan_thuc: new Date().toISOString(),
    ly_do:          `Hàng hoàn đạt 100% từ đơn ${phieu.ma_don}`,
    ghi_chu:        `Phiếu hoàn ${phieu.ma_phieu} — ${dong.ten_sp}`,
    chi_tiet: [{
      id:              gen_id(),
      phieu_id:        "",
      ma_sku:          dong.ma_sku,
      ten_sp:          dong.ten_sp,
      so_luong_po:     dong.so_luong,
      so_luong_thuc:   dong.so_luong,
      so_luong_dat:    dong.so_luong,
      so_luong_loi:    0,
      trang_thai_qc:   "dat",
      ghi_chu_qc:      "Hàng hoàn đạt 100% — sẵn sàng cất kệ",
      da_cat_ke:       false,
      node_id_cat:     "",
      so_luong_da_cat: 0,
    }],
  };

  console.log("hello");
  await taoPhieuNhap(phieu_nhap);

  // Cập nhật dòng hàng hoàn — lưu reference phiếu nhập
  dong.ghi_chu = `Phiếu nhập: ${phieu_nhap.ma_phieu}`;
  await capNhatPhieuHangHoan(phieu);

  return { ma_phieu_nhap: phieu_nhap.ma_phieu };
  // Sau này: return fetch(`/api/returns/${hang_hoan_id}/approve-loai-1`, { method: 'POST' }).then(r => r.json());
}

// ─── Hành động liên module: Trả NCC → tạo phiếu xuất ────────────────────────

export async function xacNhanTraNCC(
  hang_hoan_id: string,
  dong_id:      string,
  nha_cung_cap: string,
): Promise<{ ma_phieu_nhat: string }> {
  const phieu = MOCK_PHIEU_HANG_HOAN.find(p => p.id === hang_hoan_id);
  if (!phieu) throw new Error("Không tìm thấy phiếu hàng hoàn");
  const dong = phieu.danh_sach.find(d => d.id === dong_id);
  if (!dong) throw new Error("Không tìm thấy dòng hàng");

  // Tạo phiếu xuất trả NCC — đẩy vào Module 4
  const ma_phieu = `PX-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
  const phieu_nhat = {
    id:              gen_id(),
    ma_phieu,
    trang_thai:      "cho_nhat" as const,
    don_ids:         [phieu.don_id],
    nhan_vien:       "Nhân viên kho",
    ngay_tao:        new Date().toISOString(),
    ngay_hoan_thanh: "",
    ghi_chu:         `Xuất trả NCC ${nha_cung_cap} — từ hàng hoàn ${phieu.ma_phieu}`,
    danh_sach_nhat:  [{
      id:            gen_id(),
      phieu_id:      "",
      ma_sku:        dong.ma_sku,
      ten_sp:        dong.ten_sp,
      node_id:       "n-C01-01A-T1",
      location_code: "C-01-01A-T1",
      so_luong_can:  dong.so_luong,
      so_luong_lay:  dong.so_luong,
      da_nhat:       false,
      don_ids:       [phieu.don_id],
    }],
    packing_items: [],
  };

  await taoPhieuNhat(phieu_nhat);

  dong.ghi_chu = `Phiếu xuất trả NCC: ${ma_phieu}`;
  await capNhatPhieuHangHoan(phieu);

  return { ma_phieu_nhat: ma_phieu };
  // Sau này: return fetch(`/api/returns/${hang_hoan_id}/tra-ncc`, { method: 'POST', body: JSON.stringify({ dong_id, nha_cung_cap }) }).then(r => r.json());
}

// ─── Sự cố ───────────────────────────────────────────────────────────────────

export async function layDanhSachSuCo(): Promise<PhieuSuCo[]> {
  return MOCK_PHIEU_SU_CO;
}

export async function taoPhieuSuCo(phieu: PhieuSuCo): Promise<PhieuSuCo> {
  MOCK_PHIEU_SU_CO.unshift(phieu);
  // Tự động trừ tồn kho tại kệ nguồn
  await truTonKho(phieu.ma_sku, phieu.node_id_nguon, phieu.so_luong);
  return phieu;
  // Sau này: return fetch('/api/returns/incidents', { method: 'POST', body: JSON.stringify(phieu) }).then(r => r.json());
}

export async function capNhatPhieuSuCo(phieu: PhieuSuCo): Promise<PhieuSuCo> {
  const idx = MOCK_PHIEU_SU_CO.findIndex(p => p.id === phieu.id);
  if (idx >= 0) MOCK_PHIEU_SU_CO[idx] = phieu;
  return phieu;
}