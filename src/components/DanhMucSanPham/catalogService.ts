// ─────────────────────────────────────────────────────────────────────────────
// catalogService.ts — Service layer cho module Danh mục sản phẩm
//
// Bây giờ: đọc/ghi vào mock data
// Sau này: swap nội dung các hàm → fetch('/api/catalog/...')
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Category, Season, Color, Size, Vendor,
  Product, ProductSKU, VolumePricing,
  ProductAttachment, AuditLog,
  ProductFilter, LifecycleStatus,
} from "./catalogTypes";
import {
  MOCK_CATEGORIES, MOCK_SEASONS, MOCK_COLORS, MOCK_SIZES,
  MOCK_PRODUCTS, MOCK_VOLUME_PRICING,
  MOCK_ATTACHMENTS, MOCK_AUDIT_LOGS, MOCK_VENDORS,
} from "./data/catalogMockData";

// ─── Master Data ──────────────────────────────────────────────────────────────

export async function layDanhSachCategory(): Promise<Category[]> {
  return MOCK_CATEGORIES.filter(c => c.status === "active");
  // Sau này: return fetch('/api/catalog/categories').then(r => r.json());
}

export async function layDanhSachSeason(): Promise<Season[]> {
  return MOCK_SEASONS;
  // Sau này: return fetch('/api/catalog/seasons').then(r => r.json());
}

export async function layDanhSachColor(): Promise<Color[]> {
  return MOCK_COLORS;
  // Sau này: return fetch('/api/catalog/colors').then(r => r.json());
}

export async function layDanhSachSize(): Promise<Size[]> {
  return MOCK_SIZES.sort((a, b) => a.sort_order - b.sort_order);
  // Sau này: return fetch('/api/catalog/sizes').then(r => r.json());
}

// ─── Sản phẩm ────────────────────────────────────────────────────────────────

export async function layDanhSachSanPham(
  filter?: Partial<ProductFilter>
): Promise<Product[]> {
  let list = [...MOCK_PRODUCTS];

  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.product_code.toLowerCase().includes(q)
    );
  }
  if (filter?.season_id)        list = list.filter(p => p.season_id === filter.season_id);
  if (filter?.category_id)      list = list.filter(p => p.category_id === filter.category_id);
  if (filter?.lifecycle_status) list = list.filter(p => p.lifecycle_status === filter.lifecycle_status);
  if (filter?.vendor_id)        list = list.filter(p => p.vendor_id === filter.vendor_id);

  return list;
  // Sau này: return fetch(`/api/catalog/products?${new URLSearchParams(filter)}`).then(r => r.json());
}

export async function laySanPhamById(id: string): Promise<Product | null> {
  return MOCK_PRODUCTS.find(p => p.product_id === id) ?? null;
  // Sau này: return fetch(`/api/catalog/products/${id}`).then(r => r.json());
}

export async function taoSanPham(product: Product): Promise<Product> {
  MOCK_PRODUCTS.unshift(product);
  return product;
  // Sau này: return fetch('/api/catalog/products', { method: 'POST', body: JSON.stringify(product) }).then(r => r.json());
}

export async function capNhatSanPham(product: Product): Promise<Product> {
  const idx = MOCK_PRODUCTS.findIndex(p => p.product_id === product.product_id);
  if (idx >= 0) MOCK_PRODUCTS[idx] = { ...product, updated_at: new Date().toISOString() };
  return product;
  // Sau này: return fetch(`/api/catalog/products/${product.product_id}`, { method: 'PUT', body: JSON.stringify(product) }).then(r => r.json());
}

export async function doiTrangThaiHangLoat(
  product_ids:      string[],
  lifecycle_status: LifecycleStatus,
): Promise<void> {
  product_ids.forEach(id => {
    const idx = MOCK_PRODUCTS.findIndex(p => p.product_id === id);
    if (idx >= 0) MOCK_PRODUCTS[idx].lifecycle_status = lifecycle_status;
  });
  // Sau này: await fetch('/api/catalog/products/bulk-status', { method: 'PUT', body: JSON.stringify({ product_ids, lifecycle_status }) });
}


// ─── Vendor ───────────────────────────────────────────────────────────────────

export async function layDanhSachVendor(): Promise<Vendor[]> {
  return MOCK_VENDORS.filter(v => v.status === "active");
  // Sau này: return fetch('/api/vendors').then(r => r.json());
}

// ─── Xóa sản phẩm ────────────────────────────────────────────────────────────

export async function xoaSanPham(product_id: string): Promise<void> {
  const idx = MOCK_PRODUCTS.findIndex(p => p.product_id === product_id);
  if (idx >= 0) MOCK_PRODUCTS.splice(idx, 1);
  // Sau này: await fetch(`/api/catalog/products/${product_id}`, { method: 'DELETE' });
}

export async function xoaSanPhamHangLoat(product_ids: string[]): Promise<void> {
  product_ids.forEach(id => {
    const idx = MOCK_PRODUCTS.findIndex(p => p.product_id === id);
    if (idx >= 0) MOCK_PRODUCTS.splice(idx, 1);
  });
  // Sau này: await fetch('/api/catalog/products/bulk-delete', { method: 'DELETE', body: JSON.stringify({ product_ids }) });
}

export async function kiemTraTrungMa(code: string, exclude_id?: string): Promise<boolean> {
  return MOCK_PRODUCTS.some(
    p => p.product_code === code && p.product_id !== exclude_id
  );
  // Sau này: return fetch(`/api/catalog/products/check-code?code=${code}`).then(r => r.json()).then(d => d.exists);
}

// ─── SKU ─────────────────────────────────────────────────────────────────────

export async function laySkuTheoSanPham(product_id: string): Promise<ProductSKU[]> {
  return MOCK_PRODUCTS.find(p => p.product_id === product_id)?.skus ?? [];
  // Sau này: return fetch(`/api/catalog/products/${product_id}/skus`).then(r => r.json());
}

export async function capNhatSkus(product_id: string, skus: ProductSKU[]): Promise<void> {
  const idx = MOCK_PRODUCTS.findIndex(p => p.product_id === product_id);
  if (idx >= 0) {
    MOCK_PRODUCTS[idx].skus      = skus;
    MOCK_PRODUCTS[idx].sku_count = skus.length;
  }
  // Sau này: await fetch(`/api/catalog/products/${product_id}/skus`, { method: 'PUT', body: JSON.stringify(skus) });
}

// ─── Volume Pricing ───────────────────────────────────────────────────────────

export async function layGiaSiTheoSku(sku_id: string, product_id: string): Promise<VolumePricing[]> {
  // Ưu tiên rule SKU, fallback về rule Product
  const sku_rules = MOCK_VOLUME_PRICING.filter(v => v.sku_id === sku_id);
  if (sku_rules.length > 0) return sku_rules;
  return MOCK_VOLUME_PRICING.filter(v => v.product_id === product_id && v.sku_id === null);
  // Sau này: return fetch(`/api/catalog/pricing?sku_id=${sku_id}&product_id=${product_id}`).then(r => r.json());
}

export async function tinhGiaSi(
  sku_id:     string,
  product_id: string,
  so_luong:   number,
): Promise<number | null> {
  const rules = await layGiaSiTheoSku(sku_id, product_id);
  const rule  = rules.find(r =>
    so_luong >= r.min_qty &&
    (r.max_qty === null || so_luong <= r.max_qty)
  );
  return rule?.unit_price ?? null;
}

// ─── Tài liệu ────────────────────────────────────────────────────────────────

export async function layTaiLieuTheoSanPham(product_id: string): Promise<ProductAttachment[]> {
  return MOCK_ATTACHMENTS.filter(a => a.product_id === product_id)
    .sort((a, b) => a.sort_order - b.sort_order);
  // Sau này: return fetch(`/api/catalog/products/${product_id}/attachments`).then(r => r.json());
}

export async function capNhatTaiLieu(attachments: ProductAttachment[]): Promise<void> {
  attachments.forEach(att => {
    const idx = MOCK_ATTACHMENTS.findIndex(a => a.attachment_id === att.attachment_id);
    if (idx >= 0) MOCK_ATTACHMENTS[idx] = att;
    else MOCK_ATTACHMENTS.push(att);
  });
  // Sau này: await fetch('/api/catalog/attachments', { method: 'PUT', body: JSON.stringify(attachments) });
}

// ─── Audit Log ────────────────────────────────────────────────────────────────

export async function layAuditLog(product_id: string): Promise<AuditLog[]> {
  return MOCK_AUDIT_LOGS
    .filter(l => l.product_id === product_id)
    .sort((a, b) => b.changed_at.localeCompare(a.changed_at));
  // Sau này: return fetch(`/api/catalog/products/${product_id}/audit-log`).then(r => r.json());
}

export async function ghiAuditLog(log: AuditLog): Promise<void> {
  MOCK_AUDIT_LOGS.unshift(log);
  // Sau này: await fetch('/api/catalog/audit-log', { method: 'POST', body: JSON.stringify(log) });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Tự động ghép mã SKU từ product code + color code + size code
export function genSkuCode(
  product_code: string,
  color_code:   string,
  size_code:    string,
): string {
  return `${product_code}-${color_code}-${size_code}`;
}

// Tự động ghép mã Product từ category code + season code + số tiến
export function genProductCode(
  category_code: string,
  season_code:   string,
  so_thu_tu:     number,
): string {
  return `${category_code}-${season_code}-${String(so_thu_tu).padStart(3, "0")}`;
}