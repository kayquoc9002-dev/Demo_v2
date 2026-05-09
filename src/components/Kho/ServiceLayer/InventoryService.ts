// ─────────────────────────────────────────────────────────────────────────────
// inventoryService.ts — Service layer cho Module 5: Tồn kho & Kiểm kê
//
// Bây giờ: trỏ vào Mock Data
// Sau này: swap nội dung các hàm → fetch('/api/inventory/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { TonKhoRecord, PhieuChuyenKho, PhieuKiemKe } from "../data/inventoryTypes";
import {
  MOCK_TON_KHO, MOCK_PHIEU_CHUYEN, MOCK_PHIEU_KIEM_KE,
} from "../data/inventoryMockData";

// ─── Tồn kho ─────────────────────────────────────────────────────────────────

export async function layTonKho(): Promise<TonKhoRecord[]> {
  return MOCK_TON_KHO;
  // Sau này: return fetch('/api/inventory').then(r => r.json());
}

export async function capNhatTonKho(record: TonKhoRecord): Promise<TonKhoRecord> {
  console.log("[inventoryService] capNhatTonKho", record.ma_sku, record.node_id);
  return record;
  // Sau này:
  // return fetch(`/api/inventory/${record.ma_sku}/${record.node_id}`, {
  //   method: 'PUT', body: JSON.stringify(record)
  // }).then(r => r.json());
}

// ─── Chuyển kho nội bộ ───────────────────────────────────────────────────────

export async function layDanhSachPhieuChuyen(): Promise<PhieuChuyenKho[]> {
  return MOCK_PHIEU_CHUYEN;
  // Sau này: return fetch('/api/inventory/transfers').then(r => r.json());
}

export async function taoPhieuChuyen(phieu: PhieuChuyenKho): Promise<PhieuChuyenKho> {
  console.log("[inventoryService] taoPhieuChuyen", phieu.ma_phieu);
  return phieu;
  // Sau này:
  // return fetch('/api/inventory/transfers', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function xacNhanChuyenKho(phieu_id: string): Promise<void> {
  console.log("[inventoryService] xacNhanChuyenKho", phieu_id);
  // Sau này:
  // await fetch(`/api/inventory/transfers/${phieu_id}/confirm`, { method: 'POST' });
}

// ─── Kiểm kê ─────────────────────────────────────────────────────────────────

export async function layDanhSachPhieuKiemKe(): Promise<PhieuKiemKe[]> {
  return MOCK_PHIEU_KIEM_KE;
  // Sau này: return fetch('/api/inventory/stocktakes').then(r => r.json());
}

export async function taoPhieuKiemKe(phieu: PhieuKiemKe): Promise<PhieuKiemKe> {
  console.log("[inventoryService] taoPhieuKiemKe", phieu.ma_phieu);
  return phieu;
  // Sau này:
  // return fetch('/api/inventory/stocktakes', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function capNhatPhieuKiemKe(phieu: PhieuKiemKe): Promise<PhieuKiemKe> {
  console.log("[inventoryService] capNhatPhieuKiemKe", phieu.id, phieu.trang_thai);
  return phieu;
  // Sau này:
  // return fetch(`/api/inventory/stocktakes/${phieu.id}`, {
  //   method: 'PUT', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function duyetKiemKe(phieu_id: string): Promise<void> {
  console.log("[inventoryService] duyetKiemKe", phieu_id);
  // Sau này:
  // await fetch(`/api/inventory/stocktakes/${phieu_id}/approve`, { method: 'POST' });
}