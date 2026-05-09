// ─────────────────────────────────────────────────────────────────────────────
// purchaseService.ts — Service layer cho module Thu mua
//
// Bây giờ: đọc/ghi mock data
// Sau này: swap sang fetch('/api/purchase/...')
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PRItem, PRItemSKU, PurchaseOrder, POItem,
  ApprovedItem, TrangThaiPO,
} from "../data/purchaseTypes";
import {
  MOCK_PR_ITEMS, MOCK_PURCHASE_ORDERS, MOCK_APPROVED_ITEMS,
} from "../data/purchaseMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gen_id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function dinh_dang_tien(so: number) {
  return so.toLocaleString("vi-VN") + "đ";
}

// Tính % nhận hàng của PO
function tinh_pct_nhan(po: PurchaseOrder): number {
  const tong_dat  = po.items.reduce((s, i) => s + i.so_luong_dat,  0);
  const tong_nhan = po.items.reduce((s, i) => s + i.so_luong_nhan, 0);
  return tong_dat > 0 ? Math.round(tong_nhan / tong_dat * 100) : 0;
}

// Tự động cập nhật trạng thái PO dựa vào % nhận và ngày
function tinh_trang_thai_po(po: PurchaseOrder): TrangThaiPO {
  const pct   = tinh_pct_nhan(po);
  const tre   = new Date() > new Date(po.ngay_du_kien_giao) && pct < 100;

  if (po.trang_thai === "huy")   return "huy";
  if (pct === 100)               return "da_nhap";
  if (tre)                       return "tre_han";
  if (pct > 0)                   return "dang_giao";
  return po.trang_thai === "cho_xac_nhan" ? "cho_xac_nhan" : "cho_giao";
}

// ─── PR (Purchase Request) ────────────────────────────────────────────────────

export async function layDanhSachPR(
  trang_thai?: PRItem["trang_thai"]
): Promise<PRItem[]> {
  const list = trang_thai
    ? MOCK_PR_ITEMS.filter(p => p.trang_thai === trang_thai)
    : MOCK_PR_ITEMS;
  return list.sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao));
  // Sau này: return fetch(`/api/purchase/pr?trang_thai=${trang_thai}`).then(r => r.json());
}

export async function duyetPR(
  pr_id:  string,
  skus:   PRItemSKU[],  // SKU với so_luong_duyet đã được điền
): Promise<void> {
  const idx = MOCK_PR_ITEMS.findIndex(p => p.pr_id === pr_id);
  if (idx < 0) return;

  const pr = MOCK_PR_ITEMS[idx];
  const skus_duyet = skus.filter(s => s.so_luong_duyet > 0);
  if (!skus_duyet.length) return;

  // Cập nhật trạng thái PR
  MOCK_PR_ITEMS[idx] = { ...pr, trang_thai: "da_duyet", skus };

  // Đẩy vào danh sách chờ tạo PO
  const approved: ApprovedItem = {
    pr_id,
    product_id:   pr.product_id,
    product_code: pr.product_code,
    ten_sp:       pr.ten_sp,
    vendor_id:    pr.vendor_id,
    vendor_name:  pr.vendor_name,
    lead_time:    pr.lead_time,
    season_code:  pr.season_code,
    skus:         skus_duyet,
  };
  MOCK_APPROVED_ITEMS.push(approved);
  // Sau này: await fetch(`/api/purchase/pr/${pr_id}/approve`, { method: 'PUT', body: JSON.stringify({ skus }) });
}

export async function tuChoiPR(pr_id: string): Promise<void> {
  const idx = MOCK_PR_ITEMS.findIndex(p => p.pr_id === pr_id);
  if (idx >= 0) MOCK_PR_ITEMS[idx].trang_thai = "tu_choi";
  // Sau này: await fetch(`/api/purchase/pr/${pr_id}/reject`, { method: 'PUT' });
}

// ─── Approved Items (Tab 2 — Giỏ hàng) ──────────────────────────────────────

export async function layApprovedItems(): Promise<ApprovedItem[]> {
  return MOCK_APPROVED_ITEMS;
  // Sau này: return fetch('/api/purchase/approved').then(r => r.json());
}

// Group theo vendor để hiển thị accordion
export async function layApprovedGroupedByVendor(): Promise<
  { vendor_id: string; vendor_name: string; lead_time: number; items: ApprovedItem[]; tong_tien: number }[]
> {
  const items = await layApprovedItems();
  const groups: Record<string, typeof items> = {};

  items.forEach(item => {
    if (!groups[item.vendor_id]) groups[item.vendor_id] = [];
    groups[item.vendor_id].push(item);
  });

  return Object.entries(groups).map(([vendor_id, vendor_items]) => {
    const first    = vendor_items[0];
    const tong_tien = vendor_items.reduce((total, item) =>
      total + item.skus.reduce((s, sku) =>
        s + sku.so_luong_duyet * 0, // giá vốn sẽ join từ catalogService
      0), 0
    );
    return {
      vendor_id,
      vendor_name: first.vendor_name,
      lead_time:   first.lead_time,
      items:       vendor_items,
      tong_tien,
    };
  });
}

// ─── Purchase Order ───────────────────────────────────────────────────────────

export async function layDanhSachPO(): Promise<PurchaseOrder[]> {
  // Tự động cập nhật trạng thái trước khi trả về
  return MOCK_PURCHASE_ORDERS.map(po => ({
    ...po,
    pct_nhan:   tinh_pct_nhan(po),
    trang_thai: tinh_trang_thai_po(po),
  })).sort((a, b) => b.ngay_dat.localeCompare(a.ngay_dat));
  // Sau này: return fetch('/api/purchase/po').then(r => r.json());
}

export async function layPOById(po_id: string): Promise<PurchaseOrder | null> {
  const po = MOCK_PURCHASE_ORDERS.find(p => p.po_id === po_id) ?? null;
  if (!po) return null;
  return { ...po, pct_nhan: tinh_pct_nhan(po), trang_thai: tinh_trang_thai_po(po) };
  // Sau này: return fetch(`/api/purchase/po/${po_id}`).then(r => r.json());
}

export async function taoPO(
  vendor_id:         string,
  vendor_name:       string,
  lead_time:         number,
  ngay_du_kien_giao: string,
  dieu_khoan_tt:     string,
  ghi_chu:           string,
  items:             POItem[],
): Promise<PurchaseOrder> {
  const so_thu_tu = MOCK_PURCHASE_ORDERS.length + 1;
  const ma_po     = `PO-${new Date().getFullYear()}-${String(so_thu_tu).padStart(3, "0")}`;
  const tong_tien = items.reduce((s, i) => s + i.thanh_tien, 0);

  const po: PurchaseOrder = {
    po_id:  gen_id(),
    ma_po,
    vendor_id, vendor_name, lead_time,
    ngay_dat:           new Date().toISOString(),
    ngay_du_kien_giao,
    dieu_khoan_tt,
    ghi_chu,
    tong_tien,
    trang_thai: "cho_xac_nhan",
    pct_nhan:   0,
    items,
  };

  MOCK_PURCHASE_ORDERS.unshift(po);

  // Xóa các approved items đã tạo PO
  const sku_ids = new Set(items.map(i => i.sku_id));
  MOCK_APPROVED_ITEMS.forEach((item, idx) => {
    item.skus = item.skus.filter(s => !sku_ids.has(s.sku_id));
  });
  // Xóa ApprovedItem rỗng
  const xoa_idx = MOCK_APPROVED_ITEMS
    .map((item, i) => item.skus.length === 0 ? i : -1)
    .filter(i => i >= 0)
    .reverse();
  xoa_idx.forEach(i => MOCK_APPROVED_ITEMS.splice(i, 1));

  return po;
  // Sau này: return fetch('/api/purchase/po', { method: 'POST', body: JSON.stringify({...}) }).then(r => r.json());
}

export async function capNhatSoLuongNhan(
  po_id:   string,
  sku_id:  string,
  so_luong: number,
): Promise<void> {
  const po = MOCK_PURCHASE_ORDERS.find(p => p.po_id === po_id);
  if (!po) return;
  const item = po.items.find(i => i.sku_id === sku_id);
  if (item) item.so_luong_nhan = so_luong;
  // Sau này: await fetch(`/api/purchase/po/${po_id}/items/${sku_id}`, { method: 'PUT', body: JSON.stringify({ so_luong }) });
}

export async function huyPO(po_id: string): Promise<void> {
  const po = MOCK_PURCHASE_ORDERS.find(p => p.po_id === po_id);
  if (po) po.trang_thai = "huy";
  // Sau này: await fetch(`/api/purchase/po/${po_id}/cancel`, { method: 'PUT' });
}

// ─── Helpers export ───────────────────────────────────────────────────────────

// Tính tổng so_luong_duyet của 1 PRItem (từ các SKU con)
export function tinh_tong_duyet(skus: PRItemSKU[]): number {
  return skus.reduce((s, sku) => s + sku.so_luong_duyet, 0);
}

// Format tiền VND
export { dinh_dang_tien };

// Kiểm tra hàng lỗi mùa — season hè mà đang tháng 9-11
export function la_hang_loi_mua(season_code: string): boolean {
  const thang_hien_tai = new Date().getMonth() + 1; // 1-12
  const la_mua_he      = season_code.startsWith("SS"); // SS = Spring/Summer
  const la_mua_thu_dong = [9, 10, 11, 12, 1, 2].includes(thang_hien_tai);
  return la_mua_he && la_mua_thu_dong;
}