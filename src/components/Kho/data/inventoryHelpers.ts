// ─────────────────────────────────────────────────────────────────────────────
// inventoryHelpers.ts — Pure functions cho Module 5: Tồn kho & Kiểm kê
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TonKhoRecord, SearchResult, SearchResultSKU,
  SearchResultLocation, TonKhoStats, DongKiemKe,
} from "./inventoryTypes";
import type { LocationNode } from "./warehouseTypes";
import { tinh_location_code } from "./warehouseHelpers";

// ─── ID & mã phiếu ───────────────────────────────────────────────────────────

export function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function gen_ma_phieu_chuyen(): string {
  return `CK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export function gen_ma_phieu_kiem_ke(): string {
  return `KK-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

// ─── Smart Search — detect SKU hay Location Code ──────────────────────────────

/**
 * Tự detect loại query và trả về kết quả phù hợp
 * Ưu tiên: Location Code → SKU exact → SKU/tên fuzzy
 */
export function smart_search(
  query:       string,
  ton_kho:     TonKhoRecord[],
  nodes:       LocationNode[],
): SearchResult {
  const q = query.trim().toUpperCase();
  if (!q) return { type: "empty" };

  // 1. Thử tìm location code trước (khớp chính xác với prefix path)
  const matched_node = nodes.find(n => {
    const code = tinh_location_code(n.id, nodes).toUpperCase();
    return code === q || n.prefix.toUpperCase() === q;
  });

  if (matched_node) {
    const code     = tinh_location_code(matched_node.id, nodes);
    const cac_sku  = ton_kho.filter(t => t.node_id === matched_node.id);
    const result: SearchResultLocation = {
      type:          "location",
      node_id:       matched_node.id,
      location_code: code,
      ten_vi_tri:    matched_node.ten,
      suc_chua:      cac_sku.reduce((s, t) => s + t.so_luong, 0),
      cac_sku,
    };
    return result;
  }

  // 2. Thử tìm SKU exact match
  const sku_records = ton_kho.filter(t => t.ma_sku.toUpperCase() === q);
  if (sku_records.length > 0) {
    return build_sku_result(sku_records);
  }

  // 3. Fuzzy search theo mã SKU hoặc tên sản phẩm
  const fuzzy = ton_kho.filter(t =>
    t.ma_sku.toUpperCase().includes(q) ||
    t.ten_sp.toUpperCase().includes(q) ||
    t.mau_sac.toUpperCase().includes(q)
  );

  // Group by SKU và trả về SKU đầu tiên tìm được
  if (fuzzy.length > 0) {
    const first_sku = fuzzy[0].ma_sku;
    const same_sku  = fuzzy.filter(t => t.ma_sku === first_sku);
    return build_sku_result(same_sku);
  }

  return { type: "empty" };
}

function build_sku_result(records: TonKhoRecord[]): SearchResultSKU {
  const first = records[0];
  return {
    type:         "sku",
    ma_sku:       first.ma_sku,
    ten_sp:       first.ten_sp,
    mau_sac:      first.mau_sac,
    kich_thuoc:   first.kich_thuoc,
    tong_ton_kho: records.reduce((s, t) => s + t.so_luong, 0),
    cac_vi_tri:   records,
  };
}

// ─── Tính stats tổng quan ─────────────────────────────────────────────────────

export function tinh_stats(
  ton_kho:  TonKhoRecord[],
  nodes:    LocationNode[],
): TonKhoStats {
  const sku_unique   = new Set(ton_kho.map(t => t.ma_sku));
  const node_co_hang = new Set(ton_kho.filter(t => t.so_luong > 0).map(t => t.node_id));
  const leaf_nodes   = nodes.filter(n => !nodes.some(x => x.parent_id === n.id));

  return {
    tong_sku:       sku_unique.size,
    tong_san_pham:  ton_kho.reduce((s, t) => s + t.so_luong, 0),
    vi_tri_co_hang: node_co_hang.size,
    vi_tri_trong:   leaf_nodes.length - node_co_hang.size,
    sap_het:        ton_kho.filter(t => t.so_luong < t.dinh_muc_min && t.dinh_muc_min > 0).length,
    vuot_max:       ton_kho.filter(t => t.dinh_muc_max > 0 && t.so_luong > t.dinh_muc_max).length,
  };
}

// ─── Tính chênh lệch kiểm kê ─────────────────────────────────────────────────

export function tinh_chenh_lech(dong: DongKiemKe): number {
  return dong.so_luong_thuc - dong.so_luong_he_thong;
}

export function co_chenh_lech(dong: DongKiemKe): boolean {
  return dong.da_dem && dong.so_luong_thuc !== dong.so_luong_he_thong;
}

// ─── Tạo danh sách kiểm kê từ tồn kho hiện tại ───────────────────────────────

export function tao_danh_sach_kiem_ke(
  ton_kho:  TonKhoRecord[],
  phieu_id: string,
): DongKiemKe[] {
  return ton_kho.map(t => ({
    id:                gen_id(),
    phieu_id,
    ma_sku:            t.ma_sku,
    ten_sp:            t.ten_sp,
    node_id:           t.node_id,
    location_code:     t.location_code,
    so_luong_he_thong: t.so_luong,
    so_luong_thuc:     t.so_luong,  // Mặc định bằng hệ thống, nhân viên sẽ sửa
    chenh_lech:        0,
    ghi_chu:           "",
    da_dem:            false,
  }));
}

// ─── Config hiển thị ─────────────────────────────────────────────────────────

export const TRANG_THAI_CHUYEN_CONFIG: Record<string, {
  nhan: string; mau: string; nen: string;
}> = {
  cho_xac_nhan: { nhan: "Chờ xác nhận", mau: "#f59e0b", nen: "#78350f20" },
  dang_chuyen:  { nhan: "Đang chuyển",  mau: "#38bdf8", nen: "#0c435420" },
  hoan_thanh:   { nhan: "Hoàn thành",   mau: "#10b981", nen: "#06472520" },
  huy:          { nhan: "Đã huỷ",       mau: "#ef4444", nen: "#7f1d1d20" },
};

export const TRANG_THAI_KIEM_KE_CONFIG: Record<string, {
  nhan: string; mau: string; nen: string;
}> = {
  dang_kiem:  { nhan: "Đang kiểm",    mau: "#f59e0b", nen: "#78350f20" },
  cho_duyet:  { nhan: "Chờ duyệt",    mau: "#a78bfa", nen: "#4c1d9520" },
  da_duyet:   { nhan: "Đã duyệt",     mau: "#10b981", nen: "#06472520" },
  huy:        { nhan: "Đã huỷ",       mau: "#ef4444", nen: "#7f1d1d20" },
};