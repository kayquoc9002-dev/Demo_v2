// ─────────────────────────────────────────────────────────────────────────────
// inventoryService.ts — Service layer cho Module 5: Tồn kho & Kiểm kê
// Bây giờ: đọc/ghi vào db | Sau này: fetch('/api/inventory/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { TonKhoRecord, PhieuChuyenKho, PhieuKiemKe } from "../data/inventoryTypes";
import { MOCK_PHIEU_CHUYEN, MOCK_PHIEU_KIEM_KE } from "../data/inventoryMockData";
import { db } from "./database";

// ─── Tồn kho ─────────────────────────────────────────────────────────────────

export async function layTonKho(): Promise<TonKhoRecord[]> {
  return db.ton_kho;
}

export async function capNhatTonKho(record: TonKhoRecord): Promise<TonKhoRecord> {
  const idx = db.ton_kho.findIndex(t => t.node_id === record.node_id && t.ma_sku === record.ma_sku);
  if (idx >= 0) db.ton_kho[idx] = record;
  else db.ton_kho.push(record);
  return record;
}

export async function congTonKho(ma_sku: string, node_id: string, so_luong: number): Promise<void> {
  const idx = db.ton_kho.findIndex(t => t.ma_sku === ma_sku && t.node_id === node_id);
  if (idx >= 0) {
    db.ton_kho[idx].so_luong += so_luong;
  }
  // Sau này: await fetch(`/api/inventory/add`, { method: 'POST', body: JSON.stringify({ ma_sku, node_id, so_luong }) });
}

export async function truTonKho(ma_sku: string, node_id: string, so_luong: number): Promise<void> {
  const idx = db.ton_kho.findIndex(t => t.ma_sku === ma_sku && t.node_id === node_id);
  if (idx >= 0) {
    db.ton_kho[idx].so_luong = Math.max(0, db.ton_kho[idx].so_luong - so_luong);
  }
  // Sau này: await fetch(`/api/inventory/subtract`, { method: 'POST', body: JSON.stringify({ ma_sku, node_id, so_luong }) });
}

// ─── Chuyển kho nội bộ ───────────────────────────────────────────────────────

export async function layDanhSachPhieuChuyen(): Promise<PhieuChuyenKho[]> {
  return MOCK_PHIEU_CHUYEN;
}

export async function taoPhieuChuyen(phieu: PhieuChuyenKho): Promise<PhieuChuyenKho> {
  MOCK_PHIEU_CHUYEN.unshift(phieu);
  return phieu;
}

export async function xacNhanChuyenKho(phieu_id: string): Promise<void> {
  const phieu = MOCK_PHIEU_CHUYEN.find(p => p.id === phieu_id);
  if (phieu) {
    phieu.trang_thai = "hoan_thanh";
    phieu.ngay_hoan_thanh = new Date().toISOString();
    await truTonKho(phieu.ma_sku, phieu.node_id_tu, phieu.so_luong);
    await congTonKho(phieu.ma_sku, phieu.node_id_den, phieu.so_luong);
  }
}

// ─── Kiểm kê ─────────────────────────────────────────────────────────────────

export async function layDanhSachPhieuKiemKe(): Promise<PhieuKiemKe[]> {
  return MOCK_PHIEU_KIEM_KE;
}

export async function taoPhieuKiemKe(phieu: PhieuKiemKe): Promise<PhieuKiemKe> {
  MOCK_PHIEU_KIEM_KE.unshift(phieu);
  return phieu;
}

export async function capNhatPhieuKiemKe(phieu: PhieuKiemKe): Promise<PhieuKiemKe> {
  const idx = MOCK_PHIEU_KIEM_KE.findIndex(p => p.id === phieu.id);
  if (idx >= 0) MOCK_PHIEU_KIEM_KE[idx] = phieu;
  return phieu;
}

export async function duyetKiemKe(phieu_id: string): Promise<void> {
  const phieu = MOCK_PHIEU_KIEM_KE.find(p => p.id === phieu_id);
  if (!phieu) return;
  // Cập nhật tồn kho theo chênh lệch
  for (const dong of phieu.danh_sach.filter(d => d.chenh_lech !== 0)) {
    const idx = db.ton_kho.findIndex(t => t.node_id === dong.node_id && t.ma_sku === dong.ma_sku);
    if (idx >= 0) db.ton_kho[idx].so_luong = dong.so_luong_thuc;
  }
  phieu.trang_thai = "da_duyet";
  phieu.ngay_hoan_thanh = new Date().toISOString();
}