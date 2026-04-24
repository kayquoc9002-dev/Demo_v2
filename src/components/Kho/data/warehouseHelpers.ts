// ─────────────────────────────────────────────────────────────────────────────
// warehouseHelpers.ts — Pure functions cho tree operations & location logic
// Không có state, không có side effects — dễ test và tái sử dụng
// ─────────────────────────────────────────────────────────────────────────────

import type { LocationNode, WarehouseLevel, NodeComputed, NodeFormData } from "./warehouseTypes";

// ─── Tree traversal ───────────────────────────────────────────────────────────

/** Lấy tất cả con trực tiếp của một node */
export function lay_con_truc_tiep(
  parent_id: string | null,
  nodes: LocationNode[]
): LocationNode[] {
  return nodes
    .filter(n => n.parent_id === parent_id)
    .sort((a, b) => a.thu_tu - b.thu_tu);
}

/** Lấy toàn bộ ancestors (từ root đến node cha) */
export function lay_ancestors(
  node_id: string,
  nodes: LocationNode[]
): LocationNode[] {
  const result: LocationNode[] = [];
  let current = nodes.find(n => n.id === node_id);

  while (current?.parent_id) {
    const parent = nodes.find(n => n.id === current!.parent_id);
    if (!parent) break;
    result.unshift(parent);
    current = parent;
  }
  return result;
}

/** Lấy toàn bộ descendants (cháu, chắt...) */
export function lay_descendants(
  node_id: string,
  nodes: LocationNode[]
): LocationNode[] {
  const result: LocationNode[] = [];
  const queue = [node_id];

  while (queue.length > 0) {
    const current_id = queue.shift()!;
    const children = nodes.filter(n => n.parent_id === current_id);
    result.push(...children);
    queue.push(...children.map(c => c.id));
  }
  return result;
}

/** Kiểm tra node có phải leaf không (không có con) */
export function la_leaf_node(node_id: string, nodes: LocationNode[]): boolean {
  return !nodes.some(n => n.parent_id === node_id);
}

/** Đếm số leaf nodes trong subtree */
export function dem_so_o(node_id: string, nodes: LocationNode[]): number {
  const descendants = lay_descendants(node_id, nodes);
  if (descendants.length === 0) return 1; // Chính nó là leaf
  return descendants.filter(d => la_leaf_node(d.id, nodes)).length;
}

/** Tính depth của node (root = 0) */
export function tinh_depth(node_id: string, nodes: LocationNode[]): number {
  return lay_ancestors(node_id, nodes).length;
}

// ─── Location Code ────────────────────────────────────────────────────────────

/** Tính Location Code từ path, VD: "A-01-01A-T1-05" */
export function tinh_location_code(
  node_id: string,
  nodes: LocationNode[]
): string {
  const node = nodes.find(n => n.id === node_id);
  if (!node) return "";

  const ancestors = lay_ancestors(node_id, nodes);
  const path = [...ancestors, node];
  return path.map(n => n.prefix).join("-");
}

/** Tính toàn bộ computed data cho một node */
export function tinh_computed(
  node: LocationNode,
  nodes: LocationNode[],
  levels: WarehouseLevel[]
): NodeComputed {
  const level = levels.find(l => l.id === node.level_id);
  const is_leaf = la_leaf_node(node.id, nodes);

  return {
    location_code:    tinh_location_code(node.id, nodes),
    depth:            tinh_depth(node.id, nodes),
    la_leaf:          is_leaf,
    so_con_truc_tiep: lay_con_truc_tiep(node.id, nodes).length,
    so_o_tong:        is_leaf ? 1 : dem_so_o(node.id, nodes),
    ten_level:        level?.ten ?? "—",
  };
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  ok:     boolean;
  loi:    string[];
}

/** Validate form data trước khi tạo/sửa node */
export function validate_node_form(
  data: NodeFormData,
  nodes: LocationNode[],
  editing_id?: string
): ValidationResult {
  const loi: string[] = [];

  if (!data.ten.trim()) {
    loi.push("Tên vị trí không được để trống");
  }

  if (!data.prefix.trim()) {
    loi.push("Mã rút gọn không được để trống");
  } else if (!/^[A-Z0-9\-_]+$/i.test(data.prefix)) {
    loi.push("Mã rút gọn chỉ được dùng chữ, số, dấu gạch");
  } else {
    // Check duplicate prefix trong cùng parent
    const trung_prefix = nodes.find(n =>
      n.parent_id === data.parent_id &&
      n.prefix.toLowerCase() === data.prefix.toLowerCase() &&
      n.id !== editing_id
    );
    if (trung_prefix) {
      loi.push(`Mã "${data.prefix}" đã tồn tại trong cùng cấp`);
    }
  }

  if (!data.level_id) {
    loi.push("Phải chọn loại cấp cho vị trí");
  }

  return { ok: loi.length === 0, loi };
}

/** Kiểm tra có thể xóa node không */
export function co_the_xoa(node: LocationNode, nodes: LocationNode[]): { ok: boolean; ly_do?: string } {
  if (node.co_hang) {
    return { ok: false, ly_do: "Vị trí đang chứa hàng, không thể xóa" };
  }

  const descendants = lay_descendants(node.id, nodes);
  const co_hang_con = descendants.some(d => d.co_hang);
  if (co_hang_con) {
    return { ok: false, ly_do: "Có vị trí con đang chứa hàng" };
  }

  return { ok: true };
}

// ─── ID generation ────────────────────────────────────────────────────────────

export function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Search ───────────────────────────────────────────────────────────────────

/** Tìm kiếm node theo tên, prefix, hoặc location code */
export function tim_kiem(
  query: string,
  nodes: LocationNode[]
): LocationNode[] {
  const q = query.toLowerCase().trim();
  if (!q) return nodes;

  return nodes.filter(n => {
    const code = tinh_location_code(n.id, nodes).toLowerCase();
    return (
      n.ten.toLowerCase().includes(q) ||
      n.prefix.toLowerCase().includes(q) ||
      code.includes(q)
    );
  });
}

// ─── Sort & order ─────────────────────────────────────────────────────────────

/** Tính thu_tu tiếp theo trong cùng parent */
export function tinh_thu_tu_tiep_theo(
  parent_id: string | null,
  nodes: LocationNode[]
): number {
  const siblings = lay_con_truc_tiep(parent_id, nodes);
  if (siblings.length === 0) return 1;
  return Math.max(...siblings.map(s => s.thu_tu)) + 1;
}

// ─── Print helpers ────────────────────────────────────────────────────────────

/** Tạo nội dung QR code data cho một vị trí */
export function tao_qr_data(node: LocationNode, nodes: LocationNode[]): string {
  const code = tinh_location_code(node.id, nodes);
  return JSON.stringify({
    code,
    id: node.id,
    ten: node.ten,
  });
}

/** Group nodes thành trang để in (mỗi trang N tem) */
export function chia_trang_in(
  nodes: LocationNode[],
  tem_moi_trang: number = 20
): LocationNode[][] {
  const pages: LocationNode[][] = [];
  for (let i = 0; i < nodes.length; i += tem_moi_trang) {
    pages.push(nodes.slice(i, i + tem_moi_trang));
  }
  return pages;
}
