// ─────────────────────────────────────────────────────────────────────────────
// outboundService.ts — Service layer cho Module 4: Xuất kho
// Bây giờ: đọc/ghi vào db | Sau này: fetch('/api/outbound/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhatHang, PackingItem } from "../data/outboundTypes";
import type { DonHang } from "../../BanHang/data/orderData";
import { layTatCaDonHang } from "../ServiceLayer/orderService";
import { db } from "./database";

export async function layDonHangChoXuLy(): Promise<DonHang[]> {
  const all = await layTatCaDonHang();
  return all.filter(d => d.trang_thai_don === "cho_xu_ly");
}

export async function layDanhSachPhieuNhat(): Promise<PhieuNhatHang[]> {
  return db.phieu_nhat;
}

export async function layPhieuNhatById(id: string): Promise<PhieuNhatHang | null> {
  return db.phieu_nhat.find(p => p.id === id) ?? null;
}

export async function taoPhieuNhat(phieu: PhieuNhatHang): Promise<PhieuNhatHang> {
  db.phieu_nhat.unshift(phieu);
  return phieu;
  // Sau này: return fetch('/api/outbound/picking', { method: 'POST', body: JSON.stringify(phieu) }).then(r => r.json());
}

export async function capNhatPhieuNhat(phieu: PhieuNhatHang): Promise<PhieuNhatHang> {
  const idx = db.phieu_nhat.findIndex(p => p.id === phieu.id);
  if (idx >= 0) db.phieu_nhat[idx] = phieu;
  return phieu;
  // Sau này: return fetch(`/api/outbound/picking/${phieu.id}`, { method: 'PUT', body: JSON.stringify(phieu) }).then(r => r.json());
}

export async function capNhatPackingItem(phieu_id: string, item: PackingItem): Promise<void> {
  const phieu = db.phieu_nhat.find(p => p.id === phieu_id);
  if (!phieu) return;
  const idx = phieu.packing_items.findIndex(x => x.don_id === item.don_id);
  if (idx >= 0) phieu.packing_items[idx] = item;
}

export async function nhapMaVanDon(phieu_id: string, don_id: string, ma_van_don: string): Promise<void> {
  const phieu = db.phieu_nhat.find(p => p.id === phieu_id);
  if (!phieu) return;
  const item = phieu.packing_items.find(x => x.don_id === don_id);
  if (item) item.ma_van_don = ma_van_don;
}

export async function xacNhanDVVCLayHang(phieu_id: string): Promise<void> {
  const phieu = db.phieu_nhat.find(p => p.id === phieu_id);
  if (phieu) { phieu.trang_thai = "hoan_thanh"; phieu.ngay_hoan_thanh = new Date().toISOString(); }
}

export async function capNhatTrangThaiDon(don_id: string, trang_thai: string, ma_van_don?: string): Promise<void> {
  console.log("[outboundService] capNhatTrangThaiDon", { don_id, trang_thai, ma_van_don });
  // Sau này: await fetch(`/api/orders/${don_id}/status`, { method: 'PUT', body: JSON.stringify({ trang_thai, ma_van_don }) });
}