// // ─────────────────────────────────────────────────────────────────────────────
// // inboundService.ts — Service layer cho Module 3: Nhập kho
// // Bây giờ: đọc/ghi vào db | Sau này: fetch('/api/inbound/...')
// // ─────────────────────────────────────────────────────────────────────────────

// import type { PhieuNhapKho, ChiTietPhieuNhap } from "../data/inboundTypes";
// import type { DonDatHang } from "../data/inboundMockData";
// import { MOCK_PO } from "../data/inboundMockData";
// import { db } from "./database";

// export async function layDanhSachPhieuNhap(): Promise<PhieuNhapKho[]> {
//   return db.phieu_nhap;
// }

// export async function layPhieuNhapById(id: string): Promise<PhieuNhapKho | null> {
//   return db.phieu_nhap.find(p => p.id === id) ?? null;
// }

// export async function taoPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
//   db.phieu_nhap.unshift(phieu);
//   return phieu;
//   // Sau này: return fetch('/api/inbound', { method: 'POST', body: JSON.stringify(phieu) }).then(r => r.json());
// }

// export async function capNhatPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
//   const idx = db.phieu_nhap.findIndex(p => p.id === phieu.id);
//   if (idx >= 0) db.phieu_nhap[idx] = phieu;
//   return phieu;
//   // Sau này: return fetch(`/api/inbound/${phieu.id}`, { method: 'PUT', body: JSON.stringify(phieu) }).then(r => r.json());
// }

// export async function capNhatKetQuaQC(phieu_id: string, chi_tiet: ChiTietPhieuNhap[]): Promise<void> {
//   const idx = db.phieu_nhap.findIndex(p => p.id === phieu_id);
//   if (idx >= 0) db.phieu_nhap[idx] = { ...db.phieu_nhap[idx], chi_tiet };
// }

// export async function xacNhanCatKe(phieu_id: string, chi_tiet_id: string, node_id: string, so_luong: number): Promise<void> {
//   const phieu = db.phieu_nhap.find(p => p.id === phieu_id);
//   if (!phieu) return;
//   const ct = phieu.chi_tiet.find(c => c.id === chi_tiet_id);
//   if (ct) { ct.da_cat_ke = true; ct.node_id_cat = node_id; ct.so_luong_da_cat = so_luong; }
// }

// export async function layDanhSachPO(): Promise<DonDatHang[]> {
//   return MOCK_PO;
// }

// export async function layPOKhaDung(): Promise<DonDatHang[]> {
//   return MOCK_PO.filter(p => p.trang_thai === "cho_giao");
// }

// ─────────────────────────────────────────────────────────────────────────────
// inboundService.ts — Service layer cho Module 3: Nhập kho
// Bây giờ: đọc/ghi vào db | Sau này: fetch('/api/inbound/...')
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhapKho, ChiTietPhieuNhap } from "../data/inboundTypes";
import type { DonDatHang } from "../data/inboundMockData";
import { MOCK_PO, MOCK_NHA_CUNG_CAP } from "../data/inboundMockData";
import { db } from "./database";

// ─── Phiếu Nhập Kho ──────────────────────────────────────────────────────────

export async function layDanhSachPhieuNhap(): Promise<PhieuNhapKho[]> {
  return db.phieu_nhap;
  // Sau này: return fetch('/api/inbound').then(r => r.json());
}

export async function layPhieuNhapById(id: string): Promise<PhieuNhapKho | null> {
  return db.phieu_nhap.find(p => p.id === id) ?? null;
}

export async function taoPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
  db.phieu_nhap.unshift(phieu);
  console.log(db.phieu_nhap);
  return phieu;
  // Sau này: return fetch('/api/inbound', { method: 'POST', body: JSON.stringify(phieu) }).then(r => r.json());
}

export async function capNhatPhieuNhap(phieu: PhieuNhapKho): Promise<PhieuNhapKho> {
  const idx = db.phieu_nhap.findIndex(p => p.id === phieu.id);
  if (idx >= 0) db.phieu_nhap[idx] = phieu;
  return phieu;
}

// ─── QC ──────────────────────────────────────────────────────────────────────

export async function capNhatKetQuaQC(
  phieu_id: string,
  chi_tiet: ChiTietPhieuNhap[]
): Promise<void> {
  const idx = db.phieu_nhap.findIndex(p => p.id === phieu_id);
  if (idx >= 0) db.phieu_nhap[idx] = { ...db.phieu_nhap[idx], chi_tiet };
}
// ─── Put-away ─────────────────────────────────────────────────────────────────
// Chỉ cập nhật trạng thái phiếu nhập
// Việc cộng tồn kho do UI component tự gọi inventoryService.congTonKho()
// sau khi put-away hoàn thành — hoặc backend xử lý khi có API thật
 
export async function xacNhanCatKe(
  phieu_id:    string,
  chi_tiet_id: string,
  node_id:     string,
  so_luong:    number,
): Promise<void> {
  const phieu = db.phieu_nhap.find(p => p.id === phieu_id);
  if (!phieu) return;
  const ct = phieu.chi_tiet.find(c => c.id === chi_tiet_id);
  if (ct) {
    ct.da_cat_ke       = true;
    ct.node_id_cat     = node_id;
    ct.so_luong_da_cat = so_luong;
  }
  // Sau này: await fetch(`/api/inbound/${phieu_id}/put-away`, {
  //   method: 'POST', body: JSON.stringify({ chi_tiet_id, node_id, so_luong })
  // });
}

// ─── Nhà cung cấp ────────────────────────────────────────────────────────────

export async function layDanhSachNhaCungCap(): Promise<string[]> {
  return MOCK_NHA_CUNG_CAP;
  // Sau này: return fetch('/api/suppliers').then(r => r.json());
}

// ─── Đơn Đặt Hàng (PO) ───────────────────────────────────────────────────────

export async function layDanhSachPO(): Promise<DonDatHang[]> {
  return MOCK_PO;
}

export async function layPOKhaDung(): Promise<DonDatHang[]> {
  return MOCK_PO.filter(p => p.trang_thai === "cho_giao");
}