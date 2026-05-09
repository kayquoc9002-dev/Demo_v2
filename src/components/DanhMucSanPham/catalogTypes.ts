// ─────────────────────────────────────────────────────────────────────────────
// catalogTypes.ts — Types cho module Danh mục sản phẩm
// Mapping 1-1 với database schema đã thiết kế
// ─────────────────────────────────────────────────────────────────────────────

// ─── NHÓM 1: Master Data ─────────────────────────────────────────────────────

export interface Category {
  category_id:  string;
  parent_id:    string | null;   // null = root category
  category_code: string;         // VD: "SM", "QJ"
  name:         string;          // VD: "Áo sơ mi nam"
  status:       "active" | "inactive";
}

export interface Season {
  season_id:   string;
  season_code: string;           // VD: "SS24"
  season_name: string;           // VD: "Xuân Hè 2024"
}

export interface Color {
  color_id:   string;
  color_code: string;            // VD: "RED", "BLK"
  color_name: string;            // VD: "Đỏ đô", "Đen tuyền"
  hex_code:   string;            // VD: "#FF0000"
}

export interface Size {
  size_id:    string;
  size_code:  string;            // VD: "S", "M", "L", "XL", "29", "30"
  sort_order: number;            // Thứ tự sắp xếp — không dùng ABC
}

// ─── NHÓM 2: Core Data ───────────────────────────────────────────────────────

export type LifecycleStatus =
  | "draft"          // Nháp
  | "sampling"       // Đang lấy mẫu
  | "production"     // Đang sản xuất
  | "selling"        // Đang bán
  | "discontinued";  // Ngừng kinh doanh

export type Gender = "nam" | "nu" | "unisex" | "kid";

export interface Product {
  product_id:       string;
  product_code:     string;      // VD: "SM-SS24-001" — tự ghép
  name:             string;
  category_id:      string;      // FK → Category
  season_id:        string;      // FK → Season
  vendor_id:        string;      // FK → Vendor (làm sau)
  gender:           Gender;
  material:         string;      // VD: "100% Cotton"
  description:      string;      // HTML từ rich text editor
  tax_rate:         number;      // % VAT VD: 10
  lifecycle_status: LifecycleStatus;
  is_visible_web:   boolean;
  created_at:       string;
  updated_at:       string;
  // Computed — không lưu DB, tính khi fetch
  sku_count?:       number;
  skus?:            ProductSKU[];
}

export interface ProductSKU {
  sku_id:        string;
  product_id:    string;         // FK → Product
  sku_code:      string;         // VD: "SM-SS24-001-RED-XL"
  barcode:       string;
  color_id:      string;         // FK → Color
  size_id:       string;         // FK → Size
  weight:        number;         // gram
  image_url:     string;
  cost_price:    number;         // Giá vốn
  regular_price: number;         // Giá niêm yết
  sale_price:    number;         // Giá bán thực tế
  status:        "active" | "inactive";
  // Populated khi cần hiển thị
  color?:        Color;
  size?:         Size;
}

// ─── NHÓM 3: Extension Data ──────────────────────────────────────────────────

export interface VolumePricing {
  pricing_id: string;
  product_id: string | null;     // null nếu gắn vào SKU
  sku_id:     string | null;     // null nếu gắn vào Product
  min_qty:    number;
  max_qty:    number | null;     // null = vô cực
  unit_price: number;
}

export type DocumentType =
  | "anh_web"         // Ảnh đăng web
  | "rap_ky_thuat"    // Rập kỹ thuật PDF
  | "bao_cao_qc"      // Báo cáo QC
  | "sketch"          // Phác thảo thiết kế
  | "khac";           // Khác

export interface ProductAttachment {
  attachment_id:  string;
  product_id:     string;
  file_name:      string;
  file_url:       string;
  document_type:  DocumentType;
  sort_order:     number;
  uploaded_at:    string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  log_id:     string;
  product_id: string;
  user_name:  string;
  action:     string;            // VD: "Đổi giá vốn"
  field:      string;            // VD: "cost_price"
  old_value:  string;
  new_value:  string;
  changed_at: string;
}

// ─── UI Types ─────────────────────────────────────────────────────────────────

// Filter state cho màn hình danh sách
export interface ProductFilter {
  search:           string;
  season_id:        string;
  category_id:      string;
  lifecycle_status: string;
  vendor_id:        string;
}

// Saved filter
export interface SavedFilter {
  id:      string;
  name:    string;
  filter:  ProductFilter;
}

// Config hiển thị badge lifecycle
export const LIFECYCLE_CONFIG: Record<LifecycleStatus, {
  nhan: string; mau: string; nen: string;
}> = {
  draft:        { nhan: "Nháp",           mau: "#64748b", nen: "#1e293b"    },
  sampling:     { nhan: "Lấy mẫu",        mau: "#38bdf8", nen: "#0c435420"  },
  production:   { nhan: "Đang sản xuất",  mau: "#f97316", nen: "#7c2d1220"  },
  selling:      { nhan: "Đang bán",       mau: "#10b981", nen: "#06472520"  },
  discontinued: { nhan: "Ngừng KD",       mau: "#475569", nen: "#0f172a"    },
};

export const GENDER_CONFIG: Record<Gender, string> = {
  nam:    "Nam",
  nu:     "Nữ",
  unisex: "Unisex",
  kid:    "Trẻ em",
};

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, {
  nhan: string; icon: string; mau: string;
}> = {
  anh_web:       { nhan: "Ảnh đăng web",       icon: "🖼️",  mau: "#38bdf8" },
  rap_ky_thuat:  { nhan: "Rập kỹ thuật PDF",   icon: "📐",  mau: "#a78bfa" },
  bao_cao_qc:    { nhan: "Báo cáo QC",          icon: "📊",  mau: "#10b981" },
  sketch:        { nhan: "Phác thảo thiết kế",  icon: "✏️",  mau: "#f59e0b" },
  khac:          { nhan: "Khác",                icon: "📎",  mau: "#64748b" },
};

// ─── Vendor (Nhà cung cấp) ───────────────────────────────────────────────────

export interface Vendor {
  vendor_id:   string;
  vendor_code: string;
  name:        string;
  contact:     string;
  status:      "active" | "inactive";
}