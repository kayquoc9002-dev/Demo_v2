// ─────────────────────────────────────────────────────────────────────────────
// returnsService.ts — Service layer cho Module 6: Sự cố & Hàng hoàn
//
// Bây giờ: trỏ vào Mock Data
// Sau này: swap nội dung các hàm → fetch('/api/returns/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuHangHoan, PhieuSuCo } from "../data/returnsTypes";
import { MOCK_PHIEU_HANG_HOAN, MOCK_PHIEU_SU_CO } from "../data/returnsMockData";

// ─── Hàng hoàn ───────────────────────────────────────────────────────────────

export async function layDanhSachHangHoan(): Promise<PhieuHangHoan[]> {
  return MOCK_PHIEU_HANG_HOAN;
  // Sau này: return fetch('/api/returns/inbound').then(r => r.json());
}

export async function taoPhieuHangHoan(phieu: PhieuHangHoan): Promise<PhieuHangHoan> {
  console.log("[returnsService] taoPhieuHangHoan", phieu.ma_phieu, phieu.ma_van_don);
  return phieu;
  // Sau này:
  // return fetch('/api/returns/inbound', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function capNhatPhieuHangHoan(phieu: PhieuHangHoan): Promise<PhieuHangHoan> {
  console.log("[returnsService] capNhatPhieuHangHoan", phieu.id, phieu.trang_thai);
  return phieu;
  // Sau này:
  // return fetch(`/api/returns/inbound/${phieu.id}`, {
  //   method: 'PUT', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

// ─── Sự cố ───────────────────────────────────────────────────────────────────

export async function layDanhSachSuCo(): Promise<PhieuSuCo[]> {
  return MOCK_PHIEU_SU_CO;
  // Sau này: return fetch('/api/returns/incidents').then(r => r.json());
}

export async function taoPhieuSuCo(phieu: PhieuSuCo): Promise<PhieuSuCo> {
  console.log("[returnsService] taoPhieuSuCo", phieu.ma_phieu, phieu.ly_do);
  return phieu;
  // Sau này:
  // return fetch('/api/returns/incidents', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function capNhatPhieuSuCo(phieu: PhieuSuCo): Promise<PhieuSuCo> {
  console.log("[returnsService] capNhatPhieuSuCo", phieu.id, phieu.trang_thai);
  return phieu;
  // Sau này:
  // return fetch(`/api/returns/incidents/${phieu.id}`, {
  //   method: 'PUT', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}