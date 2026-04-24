// ─────────────────────────────────────────────────────────────────────────────
// skuRuleHelpers.ts — Pure functions cho Module 2b: Quy tắc SKU ↔ Vị trí
// ─────────────────────────────────────────────────────────────────────────────

import type { SkuLocationRule, LocationNode } from "./warehouseTypes";

// ─── Query helpers ────────────────────────────────────────────────────────────

/** Lấy tất cả rules của một SKU, primary trước */
export function lay_rules_cua_sku(
  ma_sku: string,
  rules: SkuLocationRule[],
): SkuLocationRule[] {
  return rules
    .filter((r) => r.ma_sku === ma_sku)
    .sort(
      (a, b) => (b.la_vi_tri_mac_dinh ? 1 : 0) - (a.la_vi_tri_mac_dinh ? 1 : 0),
    );
}

/** Lấy primary bin của một SKU */
export function lay_primary_bin(
  ma_sku: string,
  rules: SkuLocationRule[],
): SkuLocationRule | undefined {
  return rules.find((r) => r.ma_sku === ma_sku && r.la_vi_tri_mac_dinh);
}

/** Lấy tất cả SKU đang được gán vào một node */
export function lay_skus_tai_node(
  node_id: string,
  rules: SkuLocationRule[],
): SkuLocationRule[] {
  return rules.filter((r) => r.node_id === node_id);
}

// ─── Cảnh báo tồn kho ────────────────────────────────────────────────────────

export interface TonKhoCanhBao {
  ma_sku: string;
  ten_sp: string;
  node_id: string;
  ton_kho_hien_tai: number;
  dinh_muc_min: number;
  dinh_muc_max: number;
  loai: "thieu" | "du" | "thua";
  chenh_lech: number;
}

export function tinh_canh_bao_ton_kho(
  rules: SkuLocationRule[],
  ton_kho_map: Record<string, number>,
): TonKhoCanhBao[] {
  return rules
    .map((rule) => {
      const key = `${rule.node_id}:${rule.ma_sku}`;
      const ton_hien = ton_kho_map[key] ?? 0;
      const loai =
        ton_hien < rule.dinh_muc_min
          ? "thieu"
          : ton_hien > rule.dinh_muc_max
            ? "thua"
            : "du";
      const chenh_lech =
        loai === "thieu"
          ? rule.dinh_muc_min - ton_hien
          : loai === "thua"
            ? ton_hien - rule.dinh_muc_max
            : 0;
      return {
        ma_sku: rule.ma_sku,
        ten_sp: rule.ten_sp,
        node_id: rule.node_id,
        ton_kho_hien_tai: ton_hien,
        dinh_muc_min: rule.dinh_muc_min,
        dinh_muc_max: rule.dinh_muc_max,
        loai,
        chenh_lech,
      };
    })
    .filter((c) => c.loai !== "du");
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface SkuRuleFormData {
  ma_sku: string;
  ten_sp: string;
  node_id: string;
  dinh_muc_min: number;
  dinh_muc_max: number;
  la_vi_tri_mac_dinh: boolean;
}

export interface SkuRuleValidation {
  ok: boolean;
  loi: string[];
  canh_bao: string[]; // Warnings — không block save
}

export function validate_sku_rule(
  data: SkuRuleFormData,
  rules: SkuLocationRule[],
  nodes: LocationNode[],
  editing_id?: string,
): SkuRuleValidation {
  const loi: string[] = [];
  const canh_bao: string[] = [];

  if (!data.ma_sku.trim()) loi.push("Phải chọn SKU");
  if (!data.node_id) loi.push("Phải chọn vị trí kho");
  else {
    const node = nodes.find((n) => n.id === data.node_id);
    if (!node) loi.push("Vị trí kho không tồn tại");
    else if (node.trang_thai === "inactive") loi.push("Vị trí kho đang bị tắt");
  }

  if (data.dinh_muc_min < 0) loi.push("Định mức tối thiểu không được âm");
  if (data.dinh_muc_max <= 0) loi.push("Định mức tối đa phải lớn hơn 0");
  if (data.dinh_muc_max < data.dinh_muc_min)
    loi.push("Tối đa phải ≥ tối thiểu");

  if (data.ma_sku && data.node_id) {
    const trung = rules.find(
      (r) =>
        r.ma_sku === data.ma_sku &&
        r.node_id === data.node_id &&
        r.id !== editing_id,
    );
    if (trung) loi.push("SKU này đã được gán vào vị trí này rồi");
  }

  if (data.la_vi_tri_mac_dinh && data.ma_sku) {
    const primary_hien = rules.find(
      (r) =>
        r.ma_sku === data.ma_sku && r.la_vi_tri_mac_dinh && r.id !== editing_id,
    );
    if (primary_hien)
      canh_bao.push("Sẽ tự động chuyển primary từ vị trí cũ sang vị trí này");
  }

  return { ok: loi.length === 0, loi, canh_bao };
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface SkuRuleStats {
  tong_rules: number;
  tong_sku_co_rule: number;
  tong_node_co_rule: number;
  so_canh_bao_thieu: number;
  so_canh_bao_thua: number;
}

export function tinh_stats_rules(
  rules: SkuLocationRule[],
  canh_bao: TonKhoCanhBao[],
): SkuRuleStats {
  return {
    tong_rules: rules.length,
    tong_sku_co_rule: new Set(rules.map((r) => r.ma_sku)).size,
    tong_node_co_rule: new Set(rules.map((r) => r.node_id)).size,
    so_canh_bao_thieu: canh_bao.filter((c) => c.loai === "thieu").length,
    so_canh_bao_thua: canh_bao.filter((c) => c.loai === "thua").length,
  };
}

// ─── Dashboard integration ────────────────────────────────────────────────────

/**
 * Tạo dữ liệu cảnh báo dạng flat để KhoDashboard render bảng "Sắp hết hàng"
 * Tái sử dụng toàn bộ logic từ tinh_canh_bao_ton_kho nhưng enrich thêm
 * vi_tri_ke (location code) để hiển thị trên Dashboard
 */
export interface CanhBaoDashboard {
  ma_sku: string;
  ten_sp: string;
  vi_tri_ke: string; // Location code đã tính
  ton_kho: number;
  dinh_muc_min: number;
  dinh_muc_max: number;
  thieu: number; // dinh_muc_min - ton_kho (0 nếu không thiếu)
  muc_do: "het_hang" | "nguy_hiem" | "canh_bao";
}

export function lay_canh_bao_dashboard(
  rules: SkuLocationRule[],
  nodes: LocationNode[],
  ton_kho_map: Record<string, number>,
): CanhBaoDashboard[] {
  const canh_bao = tinh_canh_bao_ton_kho(rules, ton_kho_map);

  return canh_bao
    .filter((cb) => cb.loai !== "thua") // Dashboard chỉ hiện thiếu/hết
    .map((cb) => {
      const node = nodes.find((n) => n.id === cb.node_id);
      // Tính location code từ node path
      let vi_tri_ke = "—";
      if (node) {
        const parts: string[] = [];
        let cur: LocationNode | undefined = node;
        while (cur) {
          parts.unshift(cur.prefix);
          cur = cur.parent_id
            ? nodes.find((n) => n.id === cur!.parent_id)
            : undefined;
        }
        vi_tri_ke = parts.join("-");
      }

      return {
        ma_sku: cb.ma_sku,
        ten_sp: cb.ten_sp,
        vi_tri_ke,
        ton_kho: cb.ton_kho_hien_tai,
        dinh_muc_min: cb.dinh_muc_min,
        dinh_muc_max: cb.dinh_muc_max,
        thieu: Math.max(0, cb.dinh_muc_min - cb.ton_kho_hien_tai),
        muc_do:
          cb.loai === "het_hang"
            ? "het_hang"
            : cb.muc_do === "nguy_hiem"
              ? "nguy_hiem"
              : "canh_bao",
      };
    });
}
