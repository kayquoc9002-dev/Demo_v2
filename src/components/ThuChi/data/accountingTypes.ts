// ─────────────────────────────────────────────────────────────────────────────
// accountingTypes.ts — Types cho module Kế toán quản trị (Management Accounting)
// KHÔNG theo VAS — linh hoạt, dễ hiểu cho Sếp
// Có cột vas_account_code nullable để export MISA sau
// ─────────────────────────────────────────────────────────────────────────────

// ─── NHÓM 1: Master Data ─────────────────────────────────────────────────────

export type Currency = "VND" | "USD" | "EUR" | "RMB";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  VND: "đ", USD: "$", EUR: "€", RMB: "¥",
};

// Tài khoản ngân hàng / tiền mặt
export interface BankAccount {
  account_id:      string;
  account_name:    string;         // VD: "Vietcombank USD - TK 0071..."
  account_number:  string;
  bank_name:       string;
  currency:        Currency;
  balance:         number;         // Số dư hiện tại (đơn vị: đồng gốc)
  balance_vnd:     number;         // Quy đổi VNĐ theo tỷ giá mới nhất
  is_active:       boolean;
  vas_account_code?: string;       // VD: "112" (tiền gửi NH), "111" (tiền mặt)

  allow_overdraft: boolean  // true = ngân hàng, false = tiền mặt
}

// Hạng mục thu/chi
export type CategoryType = "thu" | "chi" | "ca_hai";

export interface TransactionCategory {
  category_id:      string;
  parent_id:        string | null;
  code:             string;        // VD: "THU_KH", "CHI_NCC", "CHI_LUONG"
  name:             string;        // VD: "Thu tiền khách hàng"
  type:             CategoryType;
  is_active:        boolean;
  vas_account_code?: string;       // VD: "131", "331", "641"
}

// Trung tâm chi phí — phân tích theo dòng SP / thị trường / bộ phận
export interface CostCenter {
  center_id:   string;
  code:        string;             // VD: "SP_AO_THUN", "TT_XUAT_KHAU"
  name:        string;             // VD: "Áo thun", "Thị trường xuất khẩu"
  type:        "san_pham" | "thi_truong" | "bo_phan";
  is_active:   boolean;
}

// Tỷ giá hối đoái theo ngày
export interface DailyExchangeRate {
  rate_id:     string;
  date:        string;             // YYYY-MM-DD
  currency:    Currency;
  rate_sell:   number;             // Tỷ giá bán chuyển khoản Vietcombank
  rate_buy:    number;             // Tỷ giá mua
  source:      "auto" | "manual"; // auto = fetch API, manual = nhập tay
  fetched_at:  string;
}

// ─── NHÓM 2: Approval Rules ──────────────────────────────────────────────────
// KHÔNG hardcode — cấu hình qua UI

export type ApprovalRole =
  | "ke_toan_truong"    // Kế toán trưởng
  | "pho_giam_doc"      // Phó Giám đốc / GĐ Tài chính
  | "tong_giam_doc";    // Tổng Giám đốc

export interface ApprovalRule {
  rule_id:     string;
  name:        string;             // VD: "Mức 1 - Dưới 5 triệu"
  min_amount:  number;             // VNĐ
  max_amount:  number | null;      // null = không giới hạn trên
  approvers:   ApprovalRole[];     // Danh sách role phải duyệt theo thứ tự
  is_active:   boolean;
}

// ─── NHÓM 3: Chứng từ (Vouchers) ─────────────────────────────────────────────

export type VoucherType =
  | "phieu_thu"         // PT — Thu tiền
  | "phieu_chi"         // PC — Chi tiền
  | "phieu_hach_toan";  // PH — Hạch toán nội bộ (không liên quan tiền mặt)

export type VoucherStatus =
  | "draft"             // Nháp
  | "pending_approval"  // Chờ duyệt
  | "approved"          // Đã duyệt
  | "rejected"          // Từ chối
  | "paid";             // Đã thanh toán

export interface VoucherLine {
  line_id:      string;
  voucher_id:   string;
  category_id:  string;            // FK → TransactionCategory
  center_id?:   string;            // FK → CostCenter (optional)
  description:  string;
  amount:       number;            // Số tiền gốc (theo currency)
  amount_vnd:   number;            // Quy đổi VNĐ = amount × exchange_rate

  ref_invoice_id?: string   // Gắn với Invoice khi matching AR
  ref_bill_id?:    string   // Gắn với Bill khi matching AP
}

export interface Voucher {
  voucher_id:     string;
  voucher_code:   string;          // VD: "PT-2026-0041"
  type:           VoucherType;
  status:         VoucherStatus;
  account_id:     string;          // FK → BankAccount
  currency:       Currency;
  exchange_rate:  number;          // LƯU CỨNG tỷ giá lúc tạo phiếu
  total_amount:   number;          // Tổng tiền gốc
  total_vnd:      number;          // Tổng quy đổi VNĐ
  description:    string;
  reference_type?: "invoice" | "bill" | "po" | "cogs"; // Liên kết chứng từ gốc
  reference_id?:  string;
  created_by:     string;
  created_at:     string;
  approved_by?:   string;
  approved_at?:   string;
  lines:          VoucherLine[];
  // Approval tracking
  approval_history: ApprovalStep[];

  document_date:   string   // Ngày trên hóa đơn giấy
  accounting_date: string   // Ngày hạch toán
  doi_tuong_name:  string   // Tên người nộp/nhận
  doi_tuong_type:  "khach_hang" | "ncc" | "nhan_vien" | "khac"
}

export interface ApprovalStep {
  step:       number;
  role:       ApprovalRole;
  status:     "pending" | "approved" | "rejected";
  actor?:     string;
  note?:      string;
  acted_at?:  string;
}

// ─── NHÓM 4: Công nợ (AR/AP) ─────────────────────────────────────────────────

export type InvoiceStatus =
  | "draft"
  | "sent"              // Đã gửi khách hàng
  | "partial"           // Đã thu một phần
  | "paid"              // Đã thu đủ
  | "overdue";          // Quá hạn

export interface Invoice {
  invoice_id:     string;
  invoice_code:   string;          // VD: "HD-2026-0041"
  customer_id:    string;
  customer_name:  string;          // Denormalized
  order_id?:      string;          // FK → đơn hàng gốc
  issue_date:     string;
  due_date:       string;
  currency:       Currency;
  exchange_rate:  number;          // Tỷ giá lúc xuất hóa đơn
  subtotal:       number;
  tax_amount:     number;
  total_amount:   number;
  total_vnd:      number;
  paid_amount:    number;          // Đã thu (VNĐ)
  remaining:      number;          // Còn lại = total_vnd - paid_amount
  status:         InvoiceStatus;
  note:           string;
  lines:          InvoiceLine[];
}

export interface InvoiceLine {
  line_id:      string;
  invoice_id:   string;
  sku_code?:    string;
  description:  string;
  quantity:     number;
  unit_price:   number;
  amount:       number;
  center_id?:   string;           // FK → CostCenter
}

// Thanh toán — matching vào Invoice/Bill
export interface Payment {
  payment_id:    string;
  payment_code:  string;          // VD: "TT-2026-0041"
  type:          "thu" | "chi";
  voucher_id:    string;          // FK → Voucher
  invoice_id:   string;          // FK → Invoice (AR)
  bill_id?:      string;          // FK → Bill (AP)
  amount:        number;          // Số tiền gốc
  amount_vnd:    number;          // Quy đổi VNĐ
  exchange_rate: number;          // Tỷ giá lúc thực thu/chi
  fx_gain_loss:  number;          // Chênh lệch tỷ giá = (rate_thu - rate_hd) × amount
  payment_date:  string;
  note:          string;
}

// Hóa đơn mua hàng (AP — phải trả NCC)
export interface Bill {
  bill_id:       string;
  bill_code:     string;          // VD: "HM-2026-0041"
  vendor_id:     string;
  vendor_name:   string;
  po_id?:        string;          // FK → PurchaseOrder
  issue_date:    string;
  due_date:      string;
  currency:      Currency;
  exchange_rate: number;
  total_amount:  number;
  total_vnd:     number;
  paid_amount:   number;
  remaining:     number;
  status:        "draft" | "approved" | "partial" | "paid" | "overdue";
  note:          string;
}

// ─── NHÓM 5: COGS (Giá vốn hàng bán) ─────────────────────────────────────────

export type CogsStatus =
  | "draft"             // Nháp — kho đẩy sang, kế toán chưa duyệt
  | "approved"          // Đã duyệt — ghi vào P&L
  | "rejected";         // Từ chối — kho cần điều chỉnh

export interface CogsDraft {
  cogs_id:       string;
  cogs_code:     string;          // VD: "COGS-2026-0041"
  source_type:   "xuat_kho" | "tra_hang"; // Từ phiếu xuất kho hay hoàn hàng
  source_id:     string;          // FK → PhieuNhatHang / PhieuHangHoan
  order_id?:     string;
  status:        CogsStatus;
  total_cogs:    number;          // Tổng giá vốn VNĐ
  note_kho:      string;          // Ghi chú từ thủ kho
  note_kt:       string;          // Ghi chú điều chỉnh của kế toán
  created_at:    string;
  approved_by?:  string;
  approved_at?:  string;
  lines:         CogsLine[];
}

export interface CogsLine {
  line_id:          string;
  cogs_id:          string;
  ma_sku:           string;
  ten_sp:           string;
  so_luong:         number;
  don_gia_binh_quan: number;      // Moving average tại thời điểm xuất
  thanh_tien:       number;       // = so_luong × don_gia_binh_quan
  // Hao hụt bất thường
  so_luong_dinh_muc: number;      // Định mức tiêu hao chuẩn
  so_luong_thuc:     number;      // Thực tế xuất
  hao_hut:          number;       // = thuc - dinh_muc (nếu > 0 là bất thường)
}

// ─── NHÓM 6: Dự báo dòng tiền ────────────────────────────────────────────────

export interface CashFlowForecast {
  forecast_id:  string;
  date:         string;            // Ngày dự kiến
  type:         "thu" | "chi";
  category:     string;            // VD: "Thu từ Zara", "Trả NCC Ánh Sáng"
  amount_vnd:   number;
  source_type:  "invoice" | "bill" | "manual"; // Tự động từ AR/AP hay nhập tay
  source_id?:   string;
  probability:  number;            // 0-100% khả năng thu/chi đúng hạn
  note:         string;
}

// ─── UI / Report Types ────────────────────────────────────────────────────────

// Aging Report — tuổi nợ
export interface AgingBucket {
  label:    string;               // VD: "0-30 ngày", "31-60 ngày", "61-90 ngày", ">90 ngày"
  days_min: number;
  days_max: number | null;
  amount:   number;               // Tổng tiền trong bucket này
  count:    number;               // Số hóa đơn
}

export interface AgingReport {
  type:       "ar" | "ap";        // Phải thu hay phải trả
  as_of_date: string;
  buckets:    AgingBucket[];
  total:      number;
  details:    AgingDetail[];
}

export interface AgingDetail {
  party_name:    string;          // Tên khách / NCC
  invoice_code:  string;
  due_date:      string;
  days_overdue:  number;
  amount:        number;
  currency:      Currency;
}

// P&L snapshot
export interface PLSnapshot {
  period:        string;          // VD: "2026-04" (tháng) hay "2026-Q1"
  revenue:       number;          // Doanh thu
  cogs:          number;          // Giá vốn
  gross_profit:  number;          // Lãi gộp = revenue - cogs
  gross_margin:  number;          // % lãi gộp
  expenses:      number;          // Chi phí vận hành
  net_profit:    number;          // Lãi ròng
  // Breakdown theo cost center
  by_product:    { center: string; revenue: number; cogs: number; profit: number }[];
  by_market:     { center: string; revenue: number; cogs: number; profit: number }[];
}

// Dashboard summary
export interface AccountingDashboard {
  // Ưu tiên 1: Cash
  cash_positions: {
    account_id:   string;
    account_name: string;
    currency:     Currency;
    balance:      number;
    balance_vnd:  number;
  }[];
  total_cash_vnd:   number;

  // Dự báo 14 ngày
  forecast_14_days: {
    date:         string;
    thu:          number;
    chi:          number;
    net:          number;
    cum_balance:  number;         // Số dư tích lũy
  }[];

  // Ưu tiên 2: Aging cảnh báo
  ar_overdue:       AgingDetail[];  // Phải thu quá hạn
  ap_due_soon:      AgingDetail[];  // Phải trả sắp đến hạn (7 ngày tới)

  // Ưu tiên 3: P&L tháng hiện tại
  pl_current_month: PLSnapshot;
}


// ─── Công nợ — Payment Allocations ───────────────────────────────────────────
 
export interface PaymentAllocation {
  allocation_id:  string;
  voucher_id:     string;   // FK → Voucher (phiếu thu/chi đã duyệt)
  invoice_id:    string;   // FK → Invoice (AR)
  bill_id?:       string;   // FK → Bill (AP)
  applied_amount: number;   // VNĐ đã phân bổ vào hóa đơn này
  applied_fx:     number;   // Ngoại tệ tương ứng (0 nếu VNĐ)
  rate_invoice:   number;   // Tỷ giá lúc xuất hóa đơn
  rate_payment:   number;   // Tỷ giá lúc thu/chi tiền
  fx_gain_loss:   number;   // Lãi/lỗ tỷ giá = (rate_payment - rate_invoice) × applied_fx
  created_at:     string;
  created_by:     string;
}
 
// Tổng hợp công nợ theo khách hàng/NCC
export interface DebtSummary {
  party_id:       string;
  party_name:     string;
  party_type:     "khach_hang" | "ncc";
  du_no_dau_ky:   number;   // Tồn từ kỳ trước
  phat_sinh_tang: number;   // Hóa đơn mới trong kỳ
  phat_sinh_giam: number;   // Đã thanh toán trong kỳ
  du_no_cuoi_ky:  number;   // = dau_ky + tang - giam
  qua_han:        number;   // Trong du_no_cuoi_ky bao nhiêu là quá hạn
  ung_truoc:      number;   // Tiền khách trả dư / mình nợ lại
}
 
// Chi tiết 1 invoice với aging bucket
export interface InvoiceWithAging {
  invoice_id:    string;
  invoice_code:  string;
  issue_date:    string;
  due_date:      string;
  total_amount:  number;
  paid_amount:   number;
  remaining:     number;
  currency:      Currency;
  exchange_rate: number;
  status:        string;
  days_overdue:  number;    // Tính động: today - due_date
  aging_bucket:  "trong_han" | "1_30" | "31_60" | "61_90" | "qua_90";
  allocations:   PaymentAllocation[];
}
 
// Unapplied — tiền thu/chi chưa khớp với hóa đơn nào
export interface UnappliedAmount {
  voucher_id:       string;
  voucher_code:     string;
  party_name:       string;
  total_amount:     number;
  applied_amount:   number;
  unapplied_amount: number;  // = total - applied
  currency:         Currency;
  payment_date:     string;
}
 
// ─── NHÓM 7: Công nợ — Khớp nợ ──────────────────────────────────────────────
 
export interface PaymentAllocation {
  allocation_id:  string;
  voucher_id:     string;   // FK → Voucher (Phiếu Thu/Chi)
  invoice_id:     string;   // FK → Invoice (AR) hoặc Bill (AP)
  invoice_type:   "ar" | "ap";
  applied_amount: number;   // VNĐ đã phân bổ vào hóa đơn này
  applied_fx:     number;   // Ngoại tệ tương ứng (0 nếu VNĐ)
  rate_invoice:   number;   // Tỷ giá lúc xuất hóa đơn
  rate_payment:   number;   // Tỷ giá lúc thu/chi tiền
  fx_gain_loss:   number;   // Lãi(+)/Lỗ(-) tỷ giá = (rate_payment - rate_invoice) × applied_fx
  created_at:     string;
  created_by:     string;
}
 
// Tiền chưa phân bổ của 1 Phiếu Thu/Chi
export interface UnappliedAmount {
  voucher_id:      string;
  voucher_code:    string;
  doi_tuong_name:  string;
  total_vnd:       number;   // Tổng phiếu
  applied_vnd:     number;   // Đã phân bổ
  unapplied_vnd:   number;   // Chưa phân bổ = total - applied
  currency:        Currency;
  payment_date:    string;
}
 
// Summary công nợ 1 đối tượng (dùng cho Master List)
export interface DebtSummary {
  party_id:        string;
  party_name:      string;
  party_type:      "khach_hang" | "ncc";
  currency:        Currency;
  // Theo kỳ
  du_no_dau_ky:    number;
  phat_sinh_tang:  number;   // HĐ mới xuất trong kỳ
  phat_sinh_giam:  number;   // Tiền đã thu/chi trong kỳ
  du_no_cuoi_ky:   number;   // = đầu kỳ + tăng - giảm
  // Aging
  trong_han:       number;
  qua_han_1_30:    number;
  qua_han_31_60:   number;
  qua_han_61_90:   number;
  qua_han_tren_90: number;
}
 
// Chi tiết 1 hóa đơn với aging bucket
export interface InvoiceWithAging {
  invoice_id:    string;
  invoice_code:  string;
  issue_date:    string;
  due_date:      string;
  total_amount:  number;
  total_vnd:     number;
  paid_amount:   number;
  remaining:     number;
  currency:      Currency;
  exchange_rate: number;
  status:        string;
  days_overdue:  number;   // Tính động: today - due_date
  aging_bucket:  "trong_han" | "1_30" | "31_60" | "61_90" | "tren_90";
  allocations:   PaymentAllocation[];
}
 