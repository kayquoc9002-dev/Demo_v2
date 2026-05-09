// ─────────────────────────────────────────────────────────────────────────────
// outboundHelpers.ts — Pure functions cho Module 4: Xuất kho / Picking
// ─────────────────────────────────────────────────────────────────────────────

import type { PhieuNhatHang, DongNhat, PackingItem, PhieuNhatStats } from "./outboundTypes";
import type { DonHang } from "../../BanHang/data/orderData";
import type { SkuLocationRule, LocationNode } from "./warehouseTypes";
import { tinh_location_code } from "./warehouseHelpers";

// ─── ID & mã phiếu ───────────────────────────────────────────────────────────

export function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function gen_ma_phieu_nhat(): string {
  const now = new Date();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `PK-${now.getFullYear()}-${seq}`;
}

// ─── CORE: Gộp đơn → Phiếu nhặt ─────────────────────────────────────────────
//
// Đây là hàm quan trọng nhất của Module 4.
// Input:  Danh sách đơn hàng được chọn
// Output: Danh sách dòng nhặt đã gộp theo SKU + vị trí
//
// Ví dụ: 15 đơn cùng có "AT001-M-DEN" ở kệ A-01-01A-T1
// → 1 dòng nhặt: đi A-01-01A-T1 lấy 15 cái

export function gop_don_thanh_phieu_nhat(
  don_list:   DonHang[],
  rules:      SkuLocationRule[],
  nodes:      LocationNode[],
): DongNhat[] {
  // Map: `${ma_sku}::${node_id}` → DongNhat
  const map = new Map<string, DongNhat>();

  for (const don of don_list) {
    for (const sp of don.san_pham) {
      // Tìm vị trí lấy hàng từ SKU rules
      const rule = rules.find(r => r.ma_sku === sp.ma_sku && r.la_vi_tri_mac_dinh)
                ?? rules.find(r => r.ma_sku === sp.ma_sku);

      const node_id      = rule?.node_id ?? "";
      const location_code = node_id
        ? tinh_location_code(node_id, nodes)
        : "Chưa có vị trí";

      const key = `${sp.ma_sku}::${node_id}`;

      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.so_luong_can += sp.so_luong;
        if (!existing.don_ids.includes(don.id)) {
          existing.don_ids.push(don.id);
        }
      } else {
        map.set(key, {
          id:            gen_id(),
          phieu_id:      "",
          ma_sku:        sp.ma_sku,
          ten_sp:        sp.ten_sp,
          node_id,
          location_code,
          so_luong_can:  sp.so_luong,
          so_luong_lay:  sp.so_luong,
          da_nhat:       false,
          don_ids:       [don.id],
        });
      }
    }
  }

  // Sắp xếp theo location_code — để nhân viên đi theo thứ tự kho
  return Array.from(map.values()).sort((a, b) =>
    a.location_code.localeCompare(b.location_code)
  );
}

// ─── Tạo PackingItems từ danh sách đơn ───────────────────────────────────────

export function tao_packing_items(don_list: DonHang[]): PackingItem[] {
  return don_list.map(don => ({
    don_id:      don.id,
    ma_don:      don.ma_don,
    ten_khach:   don.khach_hang.ten,
    dia_chi:     don.khach_hang.dia_chi ?? "",
    san_pham:    don.san_pham.map(sp => ({
      ma_sku:    sp.ma_sku,
      ten_sp:    sp.ten_sp,
      so_luong:  sp.so_luong,
    })),
    da_kiem_tra: false,
    da_dong_goi: false,
    ma_van_don:  "",
    dvvc:        don.don_vi_vc ?? "Giao Hàng Nhanh",
  }));
}

// ─── Tính stats ───────────────────────────────────────────────────────────────

export function tinh_stats(phieu: PhieuNhatHang): PhieuNhatStats {
  const ds = phieu.danh_sach_nhat;
  const pk = phieu.packing_items;

  return {
    tong_don:      phieu.don_ids.length,
    tong_sku:      ds.length,
    tong_san_pham: ds.reduce((s, d) => s + d.so_luong_can, 0),
    da_nhat:       ds.filter(d => d.da_nhat).length,
    con_lai:       ds.filter(d => !d.da_nhat).length,
    da_dong_goi:   pk.filter(p => p.da_dong_goi).length,
    co_van_don:    pk.filter(p => p.ma_van_don).length,
    pct_nhat:      ds.length === 0 ? 0
      : Math.round(ds.filter(d => d.da_nhat).length / ds.length * 100),
  };
}

// ─── Sort dòng nhặt — theo khu vực để đi tối ưu ──────────────────────────────

export function sort_theo_duong_di(rows: DongNhat[]): DongNhat[] {
  return [...rows].sort((a, b) => a.location_code.localeCompare(b.location_code));
}

// ─── Config hiển thị trạng thái ──────────────────────────────────────────────

export const TRANG_THAI_CONFIG: Record<string, {
  nhan: string; mau: string; nen: string;
}> = {
  cho_nhat:     { nhan: "Chờ nhặt",      mau: "#64748b", nen: "#1e293b" },
  dang_nhat:    { nhan: "Đang nhặt",     mau: "#f59e0b", nen: "#78350f20" },
  nhat_xong:    { nhan: "Nhặt xong",     mau: "#a78bfa", nen: "#4c1d9520" },
  dang_packing: { nhan: "Đang packing",  mau: "#38bdf8", nen: "#0c435420" },
  cho_shipping: { nhan: "Chờ vận đơn",   mau: "#f97316", nen: "#7c2d1220" },
  hoan_thanh:   { nhan: "Hoàn thành",    mau: "#10b981", nen: "#06472520" },
  co_van_de:    { nhan: "Có vấn đề",     mau: "#ef4444", nen: "#7f1d1d20" },
};

export const DVVC_LIST = [
  "Giao Hàng Nhanh",
  "Giao Hàng Tiết Kiệm",
  "J&T Express",
  "Viettel Post",
  "Vietnam Post",
  "Shopee Express",
  "Ninja Van",
];