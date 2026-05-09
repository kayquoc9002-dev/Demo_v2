// ─────────────────────────────────────────────────────────────────────────────
// revenueTypes.ts — Types cho module Doanh thu & Giá vốn
// ─────────────────────────────────────────────────────────────────────────────

import type { Currency } from "./accountingTypes";

// ─── Đơn hàng bán (từ Sales) ─────────────────────────────────────────────────

export type SalesOrderStatus =
  | "cho_xuat_hd"   // Chờ kế toán xuất hóa đơn
  | "da_xuat_hd"    // Đã xuất hóa đơn
  | "hoan_tra"      // Khách hoàn trả
  | "huy";          // Đã hủy

export interface SalesOrderItem {
  item_id:      string;
  sku_code:     string;
  ten_sp:       string;
  so_luong:     number;
  don_gia:      number;       // Đơn giá bán (chưa thuế)
  thanh_tien:   number;       // = so_luong × don_gia
  center_id?:   string;       // Cost center (dòng SP / thị trường)
}

export interface SalesOrder {
  order_id:      string;
  order_code:    string;       // VD: "DH-2026-0041"
  customer_id:   string;
  customer_name: string;
  order_date:    string;
  delivery_date: string;
  currency:      Currency;
  exchange_rate: number;
  subtotal:      number;       // Tổng chưa thuế
  vat_rate:      number;       // % VAT (0, 8, 10)
  vat_amount:    number;       // Tiền thuế
  total:         number;       // Tổng thanh toán = subtotal + vat_amount
  total_vnd:     number;       // Quy đổi VNĐ
  status:        SalesOrderStatus;
  invoice_id?:   string;       // FK → Invoice (sau khi xuất HĐ)
  note:          string;
  items:         SalesOrderItem[];
  // Thị trường
  thi_truong:    "trong_nuoc" | "xuat_khau";
}

// ─── P&L (Lãi lỗ) ────────────────────────────────────────────────────────────

export interface PLLine {
  label:       string;
  value:       number;
  is_subtotal: boolean;       // true = dòng tổng (bold, có border top)
  mau?:        string;        // màu hiển thị
  indent?:     number;        // thụt lề
}

export interface PLReport {
  period:      string;        // YYYY-MM
  is_locked:   boolean;       // Đã khóa sổ chưa
  locked_by?:  string;
  locked_at?:  string;

  // Doanh thu
  doanh_thu_ban_hang:  number;
  doanh_thu_tra_lai:   number;   // Hàng khách hoàn trả
  doanh_thu_thuan:     number;   // = ban_hang - tra_lai

  // Giá vốn
  cogs_dinh_muc:       number;   // Giá vốn theo định mức
  cogs_hao_hut:        number;   // Hao hụt được duyệt (công ty chịu)
  tong_cogs:           number;   // = dinh_muc + hao_hut

  // Lãi gộp
  lai_gop:             number;   // = doanh_thu_thuan - tong_cogs
  ty_le_lai_gop:       number;   // % = lai_gop / doanh_thu_thuan

  // Chi phí hoạt động
  chi_phi_ban_hang:    number;
  chi_phi_ql:          number;
  chi_phi_tai_chinh:   number;   // Lãi vay, phí ngân hàng
  tong_chi_phi:        number;

  // Lãi ròng
  lai_rong:            number;   // = lai_gop - tong_chi_phi
  ty_le_lai_rong:      number;   // %

  // So sánh kỳ trước
  prev_doanh_thu:      number;
  prev_lai_gop:        number;
  prev_lai_rong:       number;
}

// ─── Order Approval ───────────────────────────────────────────────────────────
 
export interface CreditInfo {
  current_debt:  number;    // Tổng nợ hiện tại (VNĐ)
  overdue_days:  number;    // Số ngày quá hạn cao nhất
  overdue_amount: number;   // Số tiền quá hạn
  credit_limit:  number;    // Hạn mức tín dụng
  is_risk:       boolean;   // nợ > limit hoặc overdue_days > 0
}
 
export interface ProfitInfo {
  estimated_cost:  number;  // Giá vốn định mức
  margin_amount:   number;  // = total - cost
  margin_percent:  number;  // % lợi nhuận
  is_low_margin:   boolean; // margin < MIN_MARGIN_THRESHOLD
  is_loss:         boolean; // margin < 0 — bán dưới giá vốn
}
 
export type OrderApprovalStatus =
  | "cho_duyet"   // Chờ kế toán duyệt
  | "da_duyet"    // Đã duyệt — chuyển xuống kho
  | "tu_choi";    // Từ chối
 
export type RiskLevel = "an_toan" | "canh_bao" | "rui_ro_cao";
 
export interface OrderApproval {
  order_id:       string;
  order_code:     string;
  customer_id:    string;
  customer_name:  string;
  sales_person:   string;
  order_date:     string;
  total_amount:   number;       // Chưa VAT
  currency:       import("./accountingTypes").Currency;
  exchange_rate:  number;
  thi_truong:     "trong_nuoc" | "xuat_khau";
  approval_status: OrderApprovalStatus;
  reject_reason?: string;
  approved_by?:   string;
  approved_at?:   string;
  credit_info:    CreditInfo;
  profit_info:    ProfitInfo;
  risk_level:     RiskLevel;    // Tổng hợp: an_toan / canh_bao / rui_ro_cao
  items: {
    product_name: string;
    sku_code:     string;
    qty:          number;
    price:        number;       // Giá bán
    cost:         number;       // Giá vốn định mức
    subtotal:     number;
  }[];
}
 
export const MIN_MARGIN_THRESHOLD = 10;   // % — cảnh báo nếu thấp hơn
export const CREDIT_OVERDUE_THRESHOLD = 0; // ngày — đỏ nếu khách đang quá hạn