// ─────────────────────────────────────────────────────────────────────────────
// inboundService.ts — Service layer cho Module 3: Nhập kho
//
// Bây giờ: trỏ vào Mock Data
// Sau này: swap nội dung các hàm → fetch('/api/inbound/...')
// UI components (InboundManager) chỉ import từ đây
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhapKho, ChiTietPhieuNhap } from "../data/inboundTypes";
import type { DonDatHang } from "../data/inboundMockData";
import { MOCK_PHIEU_NHAP, MOCK_PO, MOCK_NHA_CUNG_CAP } from "../data/inboundMockData";

// ─── Phiếu Nhập Kho ──────────────────────────────────────────────────────────

export async function layDanhSachPhieuNhap(): Promise<PhieuNhapKho[]> {
  return MOCK_PHIEU_NHAP;
  // Sau này: return fetch('/api/inbound').then(r => r.json());
}

export async function layPhieuNhapById(id: string): Promise<PhieuNhapKho | null> {
  return MOCK_PHIEU_NHAP.find(p => p.id === id) ?? null;
  // Sau này: return fetch(`/api/inbound/${id}`).then(r => r.json());
}

export async function taoPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
  console.log("[inboundService] taoPhieuNhap", phieu.ma_phieu);
  return phieu;
  // Sau này:
  // return fetch('/api/inbound', {
  //   method: 'POST', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

export async function capNhatPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
  console.log("[inboundService] capNhatPhieuNhap", phieu.id, phieu.trang_thai);
  return phieu;
  // Sau này:
  // return fetch(`/api/inbound/${phieu.id}`, {
  //   method: 'PUT', body: JSON.stringify(phieu)
  // }).then(r => r.json());
}

// ─── QC ──────────────────────────────────────────────────────────────────────

export async function capNhatKetQuaQC(
  phieu_id:  string,
  _chi_tiet: ChiTietPhieuNhap[]
): Promise<void> {
  console.log("[inboundService] capNhatKetQuaQC", phieu_id);
  // Sau này:
  // await fetch(`/api/inbound/${phieu_id}/qc`, {
  //   method: 'PUT', body: JSON.stringify({ chi_tiet })
  // });
}

// ─── Put-away ─────────────────────────────────────────────────────────────────

export async function xacNhanCatKe(
  phieu_id:   string,
  chi_tiet_id: string,
  node_id:    string,
  so_luong:   number
): Promise<void> {
  console.log("[inboundService] xacNhanCatKe", { phieu_id, chi_tiet_id, node_id, so_luong });
  // Sau này:
  // await fetch(`/api/inbound/${phieu_id}/put-away`, {
  //   method: 'POST', body: JSON.stringify({ chi_tiet_id, node_id, so_luong })
  // });
}

// ─── Đơn Đặt Hàng (PO) ───────────────────────────────────────────────────────

export async function layDanhSachPO(): Promise<DonDatHang[]> {
  return MOCK_PO;
  // Sau này: return fetch('/api/purchase-orders').then(r => r.json());
}

export async function layPOKhaDung(): Promise<DonDatHang[]> {
  return MOCK_PO.filter(p => p.trang_thai === "cho_giao");
  // Sau này: return fetch('/api/purchase-orders?trang_thai=cho_giao').then(r => r.json());
}

// ─── Nhà cung cấp ────────────────────────────────────────────────────────────

export async function layDanhSachNhaCungCap(): Promise<string[]> {
  return MOCK_NHA_CUNG_CAP;
  // Sau này: return fetch('/api/suppliers').then(r => r.json());
}