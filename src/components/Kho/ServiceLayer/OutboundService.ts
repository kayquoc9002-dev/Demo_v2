// ─────────────────────────────────────────────────────────────────────────────
// outboundService.ts — Service layer cho Module 4: Xuất kho
//
// Bây giờ: trỏ vào Mock Data
// Sau này: swap nội dung các hàm → fetch('/api/outbound/...')
// UI components (OutboundManager) chỉ import từ đây
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhatHang, PackingItem } from "../data/outboundTypes";
import type { DonHang } from "../../BanHang/data/orderData";
import { MOCK_PHIEU_NHAT } from "../data/outboundMockData";
import { MOCK_DON_HANG } from "../../BanHang/data/orderData";

// ─── Đơn hàng chờ xử lý (để chọn gộp picking) ───────────────────────────────

export async function layDonHangChoXuLy(): Promise<DonHang[]> {
  return MOCK_DON_HANG.filter(d => d.trang_thai_don === "cho_xu_ly");
  // Sau này: return fetch('/api/orders?trang_thai=cho_xu_ly').then(r => r.json());
}

// ─── Phiếu Nhặt Hàng ─────────────────────────────────────────────────────────

export async function layDanhSachPhieuNhat(): Promise<PhieuNhatHang[]> {
  return MOCK_PHIEU_NHAT;
  // Sau này: return fetch('/api/outbound/picking').then(r => r.json());
}

export async function layPhieuNhatById(id: string): Promise<PhieuNhatHang | null> {
  return MOCK_PHIEU_NHAT.find(p => p.id === id) ?? null;
  // Sau này: return fetch(`/api/outbound/picking/${id}`).then(r => r.json());
}

export async function taoPhieuNhat(phieu: PhieuNhatHang): Promise<PhieuNhatHang> {
  console.log("[outboundService] taoPhieuNhat", phieu.ma_phieu, `(${phieu.don_ids.length} đơn)`);
  return phieu;
  // Sau này:
  // return fetch('/api/outbound/picking', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function capNhatPhieuNhat(phieu: PhieuNhatHang): Promise<PhieuNhatHang> {
  console.log("[outboundService] capNhatPhieuNhat", phieu.id, phieu.trang_thai);
  return phieu;
  // Sau này:
  // return fetch(`/api/outbound/picking/${phieu.id}`, {
  //   method: 'PUT', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

// ─── Packing ──────────────────────────────────────────────────────────────────

export async function capNhatPackingItem(
  phieu_id:  string,
  item:      PackingItem
): Promise<void> {
  console.log("[outboundService] capNhatPackingItem", phieu_id, item.ma_don);
  // Sau này:
  // await fetch(`/api/outbound/picking/${phieu_id}/packing/${item.don_id}`, {
  //   method: 'PUT', body: JSON.stringify(item)
  // });
}

// ─── Shipping ─────────────────────────────────────────────────────────────────

export async function nhapMaVanDon(
  phieu_id: string,
  don_id:   string,
  ma_van_don: string
): Promise<void> {
  console.log("[outboundService] nhapMaVanDon", { phieu_id, don_id, ma_van_don });
  // Sau này:
  // await fetch(`/api/outbound/picking/${phieu_id}/shipping/${don_id}`, {
  //   method: 'PUT', body: JSON.stringify({ ma_van_don })
  // });
}

export async function xacNhanDVVCLayHang(phieu_id: string): Promise<void> {
  console.log("[outboundService] xacNhanDVVCLayHang", phieu_id);
  // Sau này:
  // await fetch(`/api/outbound/picking/${phieu_id}/complete`, { method: 'POST' });
}

// ─── Cập nhật trạng thái đơn hàng sau khi giao VC ────────────────────────────
// (Quan trọng: sau khi xuất kho thành công, đơn hàng gốc cũng phải cập nhật)

export async function capNhatTrangThaiDon(
  don_id:      string,
  trang_thai:  string,
  ma_van_don?: string
): Promise<void> {
  console.log("[outboundService] capNhatTrangThaiDon", { don_id, trang_thai, ma_van_don });
  // Sau này:
  // await fetch(`/api/orders/${don_id}/status`, {
  //   method: 'PUT', body: JSON.stringify({ trang_thai, ma_van_don })
  // });
}