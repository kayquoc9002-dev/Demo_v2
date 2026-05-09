// ─────────────────────────────────────────────────────────────────────────────
// orderService.ts — Service layer cho module Đơn hàng
//
// Bây giờ: lấy data từ MOCK_DON_HANG trong orderData.ts
// Sau này: swap nội dung các hàm → fetch('/api/orders/...')
//
// UI components chỉ import từ file này — không import MOCK_DON_HANG trực tiếp
// ─────────────────────────────────────────────────────────────────────────────

import type { DonHang, TrangThaiDon } from "../../BanHang/data/orderData";
import { MOCK_DON_HANG } from "../../BanHang/data/orderData";

// ─── Lấy danh sách ───────────────────────────────────────────────────────────

export async function layTatCaDonHang(): Promise<DonHang[]> {
  return MOCK_DON_HANG;
  // Sau này: return fetch('/api/orders').then(r => r.json());
}

export async function layDonHangTheoTrangThai(
  trang_thai: TrangThaiDon
): Promise<DonHang[]> {
  return MOCK_DON_HANG.filter(d => d.trang_thai_don === trang_thai);
  // Sau này: return fetch(`/api/orders?trang_thai=${trang_thai}`).then(r => r.json());
}

export async function layDonHangChoXuLy(): Promise<DonHang[]> {
  return MOCK_DON_HANG.filter(d => d.trang_thai_don === "cho_xu_ly");
  // Sau này: return fetch('/api/orders?trang_thai=cho_xu_ly').then(r => r.json());
}

export async function layDonHangById(id: string): Promise<DonHang | null> {
  return MOCK_DON_HANG.find(d => d.id === id) ?? null;
  // Sau này: return fetch(`/api/orders/${id}`).then(r => r.json());
}

// ─── Cập nhật ────────────────────────────────────────────────────────────────

export async function capNhatTrangThaiDon(
  id:          string,
  trang_thai:  TrangThaiDon,
  ghi_chu?:    string
): Promise<DonHang> {
  // Mock: cập nhật tại chỗ trong array
  const don = MOCK_DON_HANG.find(d => d.id === id);
  if (!don) throw new Error(`Không tìm thấy đơn hàng ${id}`);
  don.trang_thai_don = trang_thai;
  don.ngay_cap_nhat  = new Date().toISOString();
  don.lich_su.push({
    trang_thai,
    thoi_gian:      new Date().toISOString(),
    nguoi_thao_tac: "Người dùng hiện tại",
    ghi_chu,
  });
  return don;
  // Sau này:
  // return fetch(`/api/orders/${id}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ trang_thai, ghi_chu }),
  // }).then(r => r.json());
}

export async function nhapMaVanDon(
  id:          string,
  ma_van_don:  string,
  don_vi_vc:   string
): Promise<void> {
  const don = MOCK_DON_HANG.find(d => d.id === id);
  if (don) { don.ma_van_don = ma_van_don; don.don_vi_vc = don_vi_vc; }
  // Sau này:
  // await fetch(`/api/orders/${id}/shipping`, {
  //   method: 'PUT',
  //   body: JSON.stringify({ ma_van_don, don_vi_vc }),
  // });
}

// ─── Stats / Dashboard ────────────────────────────────────────────────────────

export async function layThongKeDonHang(): Promise<{
  cho_xu_ly:            number;
  dang_san_xuat:        number;
  dang_van_chuyen:      number;
  cho_giao_van_chuyen:  number;
  giao_that_bai:        number;
  tra_hang_loi:         number;
  hoan_thanh:           number;
  da_huy:               number;
}> {
  const ds = MOCK_DON_HANG;
  return {
    cho_xu_ly:           ds.filter(d => d.trang_thai_don === "cho_xu_ly").length,
    dang_san_xuat:       ds.filter(d => d.trang_thai_don === "dang_san_xuat").length,
    dang_van_chuyen:     ds.filter(d => d.trang_thai_don === "dang_van_chuyen").length,
    cho_giao_van_chuyen: ds.filter(d => d.trang_thai_don === "cho_giao_van_chuyen").length,
    giao_that_bai:       ds.filter(d => d.trang_thai_don === "giao_that_bai").length,
    tra_hang_loi:        ds.filter(d => d.trang_thai_don === "tra_hang_loi").length,
    hoan_thanh:          ds.filter(d => d.trang_thai_don === "hoan_thanh").length,
    da_huy:              ds.filter(d => d.trang_thai_don === "da_huy").length,
  };
  // Sau này: return fetch('/api/orders/stats').then(r => r.json());
}

// ─── Phân quyền ──────────────────────────────────────────────────────────────
export async function layDonHangTheoVaiTro(): Promise<DonHang[]> {
  return MOCK_DON_HANG;
  // Sau này: return fetch(`/api/orders?view=${vai_tro}`).then(r => r.json());
  // Backend sẽ tự lọc fields theo vai_tro — FE không cần biết logic ẩn field
}