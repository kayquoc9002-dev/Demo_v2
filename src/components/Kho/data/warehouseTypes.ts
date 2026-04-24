// ─────────────────────────────────────────────────────────────────────────────
// warehouseTypes.ts — Toàn bộ types cho Module 2: Sơ đồ Kho
// ─────────────────────────────────────────────────────────────────────────────

// ─── Cấp phân cấp (do người dùng định nghĩa) ─────────────────────────────────

export interface WarehouseLevel {
  id:      string;
  ten:     string;    // VD: "Khu vực", "Dãy", "Kệ", "Ô"
  icon:    string;    // emoji icon
  thu_tu:  number;    // 1 = cao nhất (root), tăng dần xuống leaf
}

// ─── Node trong cây vị trí ───────────────────────────────────────────────────

export interface LocationNode {
  id:         string;
  parent_id:  string | null;   // null = root node (cấp 1)
  level_id:   string;          // Thuộc WarehouseLevel nào
  ten:        string;          // Tên đầy đủ,  VD: "Khu A - Đồ Nam"
  prefix:     string;          // Mã rút gọn,  VD: "A"
  mo_ta:      string;
  thu_tu:     number;          // Thứ tự trong cùng parent
  trang_thai: "active" | "inactive";
  co_hang:    boolean;         // true → không xóa được
  ngay_tao:   string;          // ISO 8601
}

// ─── Cấu hình tổng thể kho ───────────────────────────────────────────────────

export interface WarehouseConfig {
  id:        string;
  ten_kho:   string;
  dia_chi:   string;
  mo_ta:     string;
  levels:    WarehouseLevel[];   // Sắp xếp theo thu_tu tăng dần
  ngay_tao:  string;
}

// ─── SKU ↔ Vị trí (Module 2b — chuẩn bị sẵn) ────────────────────────────────

export interface SkuLocationRule {
  id:                  string;
  ma_sku:              string;
  ten_sp:              string;
  node_id:             string;   // Phải là leaf node
  dinh_muc_min:        number;
  dinh_muc_max:        number;
  la_vi_tri_mac_dinh:  boolean;  // Primary pick bin
  ngay_tao:            string;
}

// ─── Form states ─────────────────────────────────────────────────────────────

export type NodeFormMode = "create" | "edit";

export interface NodeFormData {
  ten:        string;
  prefix:     string;
  level_id:   string;
  parent_id:  string | null;
  mo_ta:      string;
  trang_thai: "active" | "inactive";
}

export interface LevelFormData {
  ten:    string;
  icon:   string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface WarehouseUIState {
  selected_node_id: string | null;
  expanded_ids:     Set<string>;
  panel:            "tree" | "form" | "print" | "levels";
  form_mode:        NodeFormMode;
  search_query:     string;
}

// ─── Computed (không lưu DB, tính runtime) ───────────────────────────────────

export interface NodeComputed {
  location_code:  string;       // VD: "A-01-01A-T1-05"
  depth:          number;       // 0 = root
  la_leaf:        boolean;
  so_con_truc_tiep: number;
  so_o_tong:      number;       // Tổng leaf nodes trong subtree
  ten_level:      string;       // Tên cấp của node này
}
