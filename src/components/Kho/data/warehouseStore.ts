// ─────────────────────────────────────────────────────────────────────────────
// warehouseStore.ts — Factory functions tạo entities mới
// Không chứa mock data (xem warehouseMockData.ts)
// Không chứa business logic (xem warehouseHelpers.ts)
// ─────────────────────────────────────────────────────────────────────────────

import type { LocationNode, WarehouseLevel, SkuLocationRule } from "./warehouseTypes";
import { gen_id } from "./warehouseHelpers";

// ─── Factory: LocationNode ────────────────────────────────────────────────────

export function tao_node_moi(data: {
  ten:        string;
  prefix:     string;
  level_id:   string;
  parent_id:  string | null;
  mo_ta:      string;
  trang_thai: "active" | "inactive";
  thu_tu:     number;
}): LocationNode {
  return {
    id:         gen_id(),
    parent_id:  data.parent_id,
    level_id:   data.level_id,
    ten:        data.ten.trim(),
    prefix:     data.prefix.trim().toUpperCase(),
    mo_ta:      data.mo_ta.trim(),
    thu_tu:     data.thu_tu,
    trang_thai: data.trang_thai,
    co_hang:    false,
    ngay_tao:   new Date().toISOString(),
  };
}

// ─── Factory: WarehouseLevel ──────────────────────────────────────────────────

export function tao_level_moi(data: {
  ten:     string;
  icon:    string;
  thu_tu:  number;
}): WarehouseLevel {
  return {
    id:     gen_id(),
    ten:    data.ten.trim(),
    icon:   data.icon,
    thu_tu: data.thu_tu,
  };
}

// ─── Factory: SkuLocationRule ─────────────────────────────────────────────────

export function tao_sku_rule_moi(data: {
  ma_sku:              string;
  ten_sp:              string;
  node_id:             string;
  dinh_muc_min:        number;
  dinh_muc_max:        number;
  la_vi_tri_mac_dinh:  boolean;
}): SkuLocationRule {
  return {
    id:                  gen_id(),
    ma_sku:              data.ma_sku.trim(),
    ten_sp:              data.ten_sp.trim(),
    node_id:             data.node_id,
    dinh_muc_min:        data.dinh_muc_min,
    dinh_muc_max:        data.dinh_muc_max,
    la_vi_tri_mac_dinh:  data.la_vi_tri_mac_dinh,
    ngay_tao:            new Date().toISOString(),
  };
}