// ─────────────────────────────────────────────────────────────────────────────
// catalogMockData.ts — Mock data cho module Danh mục sản phẩm
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Category, Season, Color, Size,
  Product, ProductSKU, VolumePricing,
  ProductAttachment, AuditLog,
} from "../catalogTypes";

// ─── Master Data ──────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { category_id: "cat-1", parent_id: null,    category_code: "AT",  name: "Áo",              status: "active" },
  { category_id: "cat-2", parent_id: "cat-1", category_code: "ATS", name: "Áo thun",          status: "active" },
  { category_id: "cat-3", parent_id: "cat-1", category_code: "SM",  name: "Áo sơ mi",         status: "active" },
  { category_id: "cat-4", parent_id: "cat-1", category_code: "AK",  name: "Áo khoác",         status: "active" },
  { category_id: "cat-5", parent_id: null,    category_code: "Q",   name: "Quần",             status: "active" },
  { category_id: "cat-6", parent_id: "cat-5", category_code: "QJ",  name: "Quần jean",        status: "active" },
  { category_id: "cat-7", parent_id: "cat-5", category_code: "QS",  name: "Quần short",       status: "active" },
  { category_id: "cat-8", parent_id: null,    category_code: "V",   name: "Váy & Đầm",        status: "active" },
  { category_id: "cat-9", parent_id: "cat-8", category_code: "VD",  name: "Váy dài",          status: "active" },
];

export const MOCK_SEASONS: Season[] = [
  { season_id: "s-1", season_code: "SS24", season_name: "Xuân Hè 2024" },
  { season_id: "s-2", season_code: "AW24", season_name: "Thu Đông 2024" },
  { season_id: "s-3", season_code: "SS25", season_name: "Xuân Hè 2025" },
  { season_id: "s-4", season_code: "AW25", season_name: "Thu Đông 2025" },
];

export const MOCK_COLORS: Color[] = [
  { color_id: "c-1",  color_code: "WHT",  color_name: "Trắng",       hex_code: "#FFFFFF" },
  { color_id: "c-2",  color_code: "BLK",  color_name: "Đen",         hex_code: "#1a1a1a" },
  { color_id: "c-3",  color_code: "RED",  color_name: "Đỏ đô",       hex_code: "#c0392b" },
  { color_id: "c-4",  color_code: "NVY",  color_name: "Xanh navy",   hex_code: "#1a3a5c" },
  { color_id: "c-5",  color_code: "GRY",  color_name: "Xám",         hex_code: "#7f8c8d" },
  { color_id: "c-6",  color_code: "BEG",  color_name: "Be",          hex_code: "#f5f0e8" },
  { color_id: "c-7",  color_code: "LBL",  color_name: "Xanh nhạt",   hex_code: "#85c1e9" },
  { color_id: "c-8",  color_code: "KHK",  color_name: "Kaki",        hex_code: "#c8b560" },
];

export const MOCK_SIZES: Size[] = [
  { size_id: "sz-1",  size_code: "XS",  sort_order: 1 },
  { size_id: "sz-2",  size_code: "S",   sort_order: 2 },
  { size_id: "sz-3",  size_code: "M",   sort_order: 3 },
  { size_id: "sz-4",  size_code: "L",   sort_order: 4 },
  { size_id: "sz-5",  size_code: "XL",  sort_order: 5 },
  { size_id: "sz-6",  size_code: "XXL", sort_order: 6 },
  { size_id: "sz-7",  size_code: "27",  sort_order: 7 },
  { size_id: "sz-8",  size_code: "28",  sort_order: 8 },
  { size_id: "sz-9",  size_code: "29",  sort_order: 9 },
  { size_id: "sz-10", size_code: "30",  sort_order: 10 },
  { size_id: "sz-11", size_code: "31",  sort_order: 11 },
  { size_id: "sz-12", size_code: "32",  sort_order: 12 },
];

// ─── SKUs cho từng sản phẩm ───────────────────────────────────────────────────

const SKUS_ATS_001: ProductSKU[] = [
  { sku_id: "sku-1",  product_id: "p-1", sku_code: "ATS-SS24-001-WHT-S",  barcode: "8938500001001", color_id: "c-1", size_id: "sz-2", weight: 180, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-2",  product_id: "p-1", sku_code: "ATS-SS24-001-WHT-M",  barcode: "8938500001002", color_id: "c-1", size_id: "sz-3", weight: 195, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-3",  product_id: "p-1", sku_code: "ATS-SS24-001-WHT-L",  barcode: "8938500001003", color_id: "c-1", size_id: "sz-4", weight: 210, image_url: "", cost_price: 88000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-4",  product_id: "p-1", sku_code: "ATS-SS24-001-BLK-S",  barcode: "8938500001004", color_id: "c-2", size_id: "sz-2", weight: 180, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-5",  product_id: "p-1", sku_code: "ATS-SS24-001-BLK-M",  barcode: "8938500001005", color_id: "c-2", size_id: "sz-3", weight: 195, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-6",  product_id: "p-1", sku_code: "ATS-SS24-001-BLK-L",  barcode: "8938500001006", color_id: "c-2", size_id: "sz-4", weight: 210, image_url: "", cost_price: 88000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-7",  product_id: "p-1", sku_code: "ATS-SS24-001-GRY-S",  barcode: "8938500001007", color_id: "c-5", size_id: "sz-2", weight: 180, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-8",  product_id: "p-1", sku_code: "ATS-SS24-001-GRY-M",  barcode: "8938500001008", color_id: "c-5", size_id: "sz-3", weight: 195, image_url: "", cost_price: 85000,  regular_price: 189000, sale_price: 159000, status: "active" },
  { sku_id: "sku-9",  product_id: "p-1", sku_code: "ATS-SS24-001-GRY-L",  barcode: "8938500001009", color_id: "c-5", size_id: "sz-4", weight: 210, image_url: "", cost_price: 88000,  regular_price: 189000, sale_price: 159000, status: "active" },
];

const SKUS_SM_001: ProductSKU[] = [
  { sku_id: "sku-10", product_id: "p-2", sku_code: "SM-SS24-001-WHT-S",  barcode: "8938500002001", color_id: "c-1", size_id: "sz-2", weight: 220, image_url: "", cost_price: 120000, regular_price: 295000, sale_price: 250000, status: "active" },
  { sku_id: "sku-11", product_id: "p-2", sku_code: "SM-SS24-001-WHT-M",  barcode: "8938500002002", color_id: "c-1", size_id: "sz-3", weight: 235, image_url: "", cost_price: 120000, regular_price: 295000, sale_price: 250000, status: "active" },
  { sku_id: "sku-12", product_id: "p-2", sku_code: "SM-SS24-001-WHT-L",  barcode: "8938500002003", color_id: "c-1", size_id: "sz-4", weight: 250, image_url: "", cost_price: 125000, regular_price: 295000, sale_price: 250000, status: "active" },
  { sku_id: "sku-13", product_id: "p-2", sku_code: "SM-SS24-001-NVY-S",  barcode: "8938500002004", color_id: "c-4", size_id: "sz-2", weight: 220, image_url: "", cost_price: 120000, regular_price: 295000, sale_price: 250000, status: "active" },
  { sku_id: "sku-14", product_id: "p-2", sku_code: "SM-SS24-001-NVY-M",  barcode: "8938500002005", color_id: "c-4", size_id: "sz-3", weight: 235, image_url: "", cost_price: 120000, regular_price: 295000, sale_price: 250000, status: "active" },
  { sku_id: "sku-15", product_id: "p-2", sku_code: "SM-SS24-001-NVY-L",  barcode: "8938500002006", color_id: "c-4", size_id: "sz-4", weight: 250, image_url: "", cost_price: 125000, regular_price: 295000, sale_price: 250000, status: "active" },
];

const SKUS_QJ_001: ProductSKU[] = [
  { sku_id: "sku-16", product_id: "p-3", sku_code: "QJ-AW24-001-BLK-29", barcode: "8938500003001", color_id: "c-2", size_id: "sz-9",  weight: 480, image_url: "", cost_price: 195000, regular_price: 520000, sale_price: 450000, status: "active" },
  { sku_id: "sku-17", product_id: "p-3", sku_code: "QJ-AW24-001-BLK-30", barcode: "8938500003002", color_id: "c-2", size_id: "sz-10", weight: 495, image_url: "", cost_price: 195000, regular_price: 520000, sale_price: 450000, status: "active" },
  { sku_id: "sku-18", product_id: "p-3", sku_code: "QJ-AW24-001-BLK-31", barcode: "8938500003003", color_id: "c-2", size_id: "sz-11", weight: 510, image_url: "", cost_price: 198000, regular_price: 520000, sale_price: 450000, status: "active" },
  { sku_id: "sku-19", product_id: "p-3", sku_code: "QJ-AW24-001-LBL-29", barcode: "8938500003004", color_id: "c-7", size_id: "sz-9",  weight: 480, image_url: "", cost_price: 195000, regular_price: 520000, sale_price: 450000, status: "active" },
  { sku_id: "sku-20", product_id: "p-3", sku_code: "QJ-AW24-001-LBL-30", barcode: "8938500003005", color_id: "c-7", size_id: "sz-10", weight: 495, image_url: "", cost_price: 195000, regular_price: 520000, sale_price: 450000, status: "active" },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: Product[] = [
  {
    product_id: "p-1", product_code: "ATS-SS24-001",
    name: "Áo Thun Basic Oversize",
    category_id: "cat-2", season_id: "s-1", vendor_id: "v-1",
    gender: "unisex", material: "100% Cotton Compact",
    description: "<p>Áo thun basic form oversize, phong cách tối giản. Chất liệu cotton compact mềm mại, thoáng mát.</p>",
    tax_rate: 10, lifecycle_status: "selling",
    is_visible_web: true,
    created_at: "2024-01-15T08:00:00Z", updated_at: "2024-03-20T10:30:00Z",
    sku_count: 9, skus: SKUS_ATS_001,
  },
  {
    product_id: "p-2", product_code: "SM-SS24-001",
    name: "Áo Sơ Mi Linen Trơn",
    category_id: "cat-3", season_id: "s-1", vendor_id: "v-1",
    gender: "nam", material: "55% Linen, 45% Cotton",
    description: "<p>Áo sơ mi linen form regular, phù hợp đi làm và dạo phố. Chất vải linen tự nhiên, thấm hút tốt.</p>",
    tax_rate: 10, lifecycle_status: "production",
    is_visible_web: false,
    created_at: "2024-02-01T09:00:00Z", updated_at: "2024-04-10T14:00:00Z",
    sku_count: 6, skus: SKUS_SM_001,
  },
  {
    product_id: "p-3", product_code: "QJ-AW24-001",
    name: "Quần Jean Slim Fit",
    category_id: "cat-6", season_id: "s-2", vendor_id: "v-2",
    gender: "nam", material: "98% Cotton, 2% Spandex",
    description: "<p>Quần jean slim fit, form ôm vừa phải. Co giãn nhẹ, dễ vận động.</p>",
    tax_rate: 10, lifecycle_status: "selling",
    is_visible_web: true,
    created_at: "2024-03-01T08:00:00Z", updated_at: "2024-04-15T09:00:00Z",
    sku_count: 5, skus: SKUS_QJ_001,
  },
  {
    product_id: "p-4", product_code: "VD-SS25-001",
    name: "Váy Midi Floral",
    category_id: "cat-9", season_id: "s-3", vendor_id: "v-2",
    gender: "nu", material: "100% Viscose",
    description: "<p>Váy midi họa tiết hoa, dáng xòe nhẹ. Chất viscose mềm rủ đẹp.</p>",
    tax_rate: 10, lifecycle_status: "sampling",
    is_visible_web: false,
    created_at: "2024-04-01T10:00:00Z", updated_at: "2024-04-20T11:00:00Z",
    sku_count: 0, skus: [],
  },
  {
    product_id: "p-5", product_code: "AK-AW24-001",
    name: "Áo Khoác Bomber Phối Sọc",
    category_id: "cat-4", season_id: "s-2", vendor_id: "v-1",
    gender: "unisex", material: "Polyester, lót bông nhẹ",
    description: "<p>Áo khoác bomber phối sọc cổ điển. Giữ ấm nhẹ, thích hợp thời tiết se lạnh.</p>",
    tax_rate: 10, lifecycle_status: "draft",
    is_visible_web: false,
    created_at: "2024-04-10T08:00:00Z", updated_at: "2024-04-10T08:00:00Z",
    sku_count: 0, skus: [],
  },
];

// ─── Volume Pricing ───────────────────────────────────────────────────────────

export const MOCK_VOLUME_PRICING: VolumePricing[] = [
  // Rule mặc định cho ATS-SS24-001 (product level)
  { pricing_id: "vp-1", product_id: "p-1", sku_id: null, min_qty: 10, max_qty: 49,   unit_price: 130000 },
  { pricing_id: "vp-2", product_id: "p-1", sku_id: null, min_qty: 50, max_qty: null, unit_price: 110000 },
  // Override cho size XL (đắt hơn vì tốn vải)
  { pricing_id: "vp-3", product_id: null,  sku_id: "sku-3", min_qty: 10, max_qty: 49,   unit_price: 145000 },
  { pricing_id: "vp-4", product_id: null,  sku_id: "sku-3", min_qty: 50, max_qty: null, unit_price: 125000 },
];

// ─── Product Attachments ──────────────────────────────────────────────────────

export const MOCK_ATTACHMENTS: ProductAttachment[] = [
  { attachment_id: "att-1", product_id: "p-1", file_name: "Techpack_ATS_SS24_001.pdf",    file_url: "/mock/techpack.pdf",    document_type: "rap_ky_thuat", sort_order: 1, uploaded_at: "2024-01-20T10:00:00Z" },
  { attachment_id: "att-2", product_id: "p-1", file_name: "QC_Report_ATS_SS24_001.xlsx",  file_url: "/mock/qc.xlsx",         document_type: "bao_cao_qc",   sort_order: 2, uploaded_at: "2024-02-10T14:00:00Z" },
  { attachment_id: "att-3", product_id: "p-2", file_name: "Techpack_SM_SS24_001.pdf",     file_url: "/mock/techpack2.pdf",   document_type: "rap_ky_thuat", sort_order: 1, uploaded_at: "2024-02-05T09:00:00Z" },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { log_id: "log-1", product_id: "p-1", user_name: "Nguyễn Văn Dev", action: "Đổi giá vốn",         field: "cost_price",      old_value: "75000",      new_value: "85000",      changed_at: "2024-03-20T10:30:00Z" },
  { log_id: "log-2", product_id: "p-1", user_name: "Trần Thị Sale",  action: "Đổi trạng thái",      field: "lifecycle_status", old_value: "production", new_value: "selling",    changed_at: "2024-03-15T09:00:00Z" },
  { log_id: "log-3", product_id: "p-1", user_name: "Nguyễn Văn Dev", action: "Cập nhật giá bán",    field: "sale_price",      old_value: "149000",     new_value: "159000",     changed_at: "2024-02-28T16:00:00Z" },
  { log_id: "log-4", product_id: "p-2", user_name: "Lê Minh Product", action: "Tạo sản phẩm mới",   field: "product",         old_value: "",           new_value: "SM-SS24-001", changed_at: "2024-02-01T09:00:00Z" },
];

// ─── Vendors ─────────────────────────────────────────────────────────────────

export const MOCK_VENDORS = [
  { vendor_id: "v-1", vendor_code: "XWA", name: "Xưởng May Ánh Sáng",    contact: "0901234567", status: "active" as const },
  { vendor_id: "v-2", vendor_code: "XHV", name: "Xưởng Hồng Vân",        contact: "0912345678", status: "active" as const },
  { vendor_id: "v-3", vendor_code: "NCC-TQ", name: "NCC Thiên Quang",    contact: "0923456789", status: "active" as const },
  { vendor_id: "v-4", vendor_code: "NCC-PT", name: "NCC Phú Thịnh",      contact: "0934567890", status: "inactive" as const },
];