// ─────────────────────────────────────────────────────────────────────────────
// accountingService.ts — Service layer cho module Kế toán quản trị
//
// Bây giờ: đọc/ghi mock data
// Sau này: swap sang fetch('/api/accounting/...')
// ─────────────────────────────────────────────────────────────────────────────

import type {
  BankAccount, TransactionCategory, CostCenter,
  DailyExchangeRate, ApprovalRule, Voucher,
  Invoice, Bill, CogsDraft, CashFlowForecast,
  AgingReport, AgingDetail, PLSnapshot, AccountingDashboard,
  Currency, CogsStatus,
} from "../data/accountingTypes";
import {
  MOCK_ACCOUNTS, MOCK_CATEGORIES, MOCK_COST_CENTERS,
  MOCK_EXCHANGE_RATES, MOCK_APPROVAL_RULES,
  MOCK_INVOICES, MOCK_BILLS, MOCK_COGS_DRAFTS, MOCK_FORECASTS,
} from "../data/accountingMockData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function so_ngay_qua_han(due_date: string): number {
  const today = new Date();
  const due   = new Date(due_date);
  return Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

export function dinh_dang_tien(amount: number, currency: Currency = "VND"): string {
  if (currency === "VND") return amount.toLocaleString("vi-VN") + "đ";
  if (currency === "USD") return "$" + amount.toLocaleString("en-US");
  if (currency === "EUR") return "€" + amount.toLocaleString("en-US");
  if (currency === "RMB") return "¥" + amount.toLocaleString("zh-CN");
  return amount.toString();
}

// ─── Master Data ──────────────────────────────────────────────────────────────

export async function layDanhSachTaiKhoan(): Promise<BankAccount[]> {
  return MOCK_ACCOUNTS.filter(a => a.is_active);
  // Sau này: return fetch('/api/accounting/accounts').then(r => r.json());
}

export async function layDanhSachHangMuc(type?: "thu" | "chi"): Promise<TransactionCategory[]> {
  return type
    ? MOCK_CATEGORIES.filter(c => c.is_active && (c.type === type || c.type === "ca_hai"))
    : MOCK_CATEGORIES.filter(c => c.is_active);
  // Sau này: return fetch(`/api/accounting/categories?type=${type}`).then(r => r.json());
}

export async function layDanhSachCostCenter(): Promise<CostCenter[]> {
  return MOCK_COST_CENTERS.filter(c => c.is_active);
}

// ─── Tỷ giá ──────────────────────────────────────────────────────────────────

export async function layTyGiaHomNay(currency: Currency): Promise<DailyExchangeRate | null> {
  const today = new Date().toISOString().split("T")[0];
  return MOCK_EXCHANGE_RATES.find(r => r.date === today && r.currency === currency)
    ?? MOCK_EXCHANGE_RATES
        .filter(r => r.currency === currency)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
    ?? null;
  // Sau này: return fetch(`/api/accounting/exchange-rates/today?currency=${currency}`).then(r => r.json());
}

export async function quyDoiVND(amount: number, currency: Currency): Promise<number> {
  if (currency === "VND") return amount;
  const rate = await layTyGiaHomNay(currency);
  return Math.round(amount * (rate?.rate_sell ?? 1));
}

// ─── Approval Rules ───────────────────────────────────────────────────────────

export async function layApprovalRules(): Promise<ApprovalRule[]> {
  return MOCK_APPROVAL_RULES.filter(r => r.is_active)
    .sort((a, b) => a.min_amount - b.min_amount);
}

export async function timApprovalRule(amount_vnd: number): Promise<ApprovalRule | null> {
  const rules = await layApprovalRules();
  return rules.find(r =>
    amount_vnd >= r.min_amount &&
    (r.max_amount === null || amount_vnd <= r.max_amount)
  ) ?? null;
}

// ─── Hóa đơn AR (Phải thu) ───────────────────────────────────────────────────

export async function layDanhSachInvoice(status?: Invoice["status"]): Promise<Invoice[]> {
  const list = status
    ? MOCK_INVOICES.filter(i => i.status === status)
    : MOCK_INVOICES;
  return list.sort((a, b) => b.issue_date.localeCompare(a.issue_date));
}

export async function taoInvoice(invoice: Invoice): Promise<Invoice> {
  MOCK_INVOICES.unshift(invoice);
  return invoice;
}

export async function capNhatInvoice(invoice: Invoice): Promise<Invoice> {
  const idx = MOCK_INVOICES.findIndex(i => i.invoice_id === invoice.invoice_id);
  if (idx >= 0) MOCK_INVOICES[idx] = invoice;
  return invoice;
}

// ─── Hóa đơn AP (Phải trả) ───────────────────────────────────────────────────

export async function layDanhSachBill(status?: Bill["status"]): Promise<Bill[]> {
  const list = status
    ? MOCK_BILLS.filter(b => b.status === status)
    : MOCK_BILLS;
  return list.sort((a, b) => b.issue_date.localeCompare(a.issue_date));
}

export async function taoBill(bill: Bill): Promise<Bill> {
  MOCK_BILLS.unshift(bill);
  return bill;
  // Sau này: return fetch('/api/accounting/bills', { method: 'POST', body: JSON.stringify(bill) }).then(r => r.json());
}

// ─── COGS ────────────────────────────────────────────────────────────────────

export async function layDanhSachCogs(status?: CogsStatus): Promise<CogsDraft[]> {
  const list = status
    ? MOCK_COGS_DRAFTS.filter(c => c.status === status)
    : MOCK_COGS_DRAFTS;
  return list.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Kho gọi hàm này khi hoàn tất xuất kho → tạo COGS draft
export async function taoCogsDraft(draft: CogsDraft): Promise<CogsDraft> {
  MOCK_COGS_DRAFTS.unshift(draft);
  return draft;
  // Sau này: return fetch('/api/accounting/cogs', { method: 'POST', body: JSON.stringify(draft) }).then(r => r.json());
}

export async function duyetCogs(
  cogs_id:  string,
  note_kt:  string,
  approved_by: string,
): Promise<CogsDraft> {
  const idx = MOCK_COGS_DRAFTS.findIndex(c => c.cogs_id === cogs_id);
  if (idx >= 0) {
    MOCK_COGS_DRAFTS[idx] = {
      ...MOCK_COGS_DRAFTS[idx],
      status:      "approved",
      note_kt,
      approved_by,
      approved_at: new Date().toISOString(),
    };
  }
  return MOCK_COGS_DRAFTS[idx];
  // Sau này: return fetch(`/api/accounting/cogs/${cogs_id}/approve`, { method: 'PUT', body: JSON.stringify({ note_kt }) }).then(r => r.json());
}

export async function tuChoiCogs(cogs_id: string, note_kt: string): Promise<void> {
  const idx = MOCK_COGS_DRAFTS.findIndex(c => c.cogs_id === cogs_id);
  if (idx >= 0) {
    MOCK_COGS_DRAFTS[idx].status  = "rejected";
    MOCK_COGS_DRAFTS[idx].note_kt = note_kt;
  }
}

// ─── Aging Report ────────────────────────────────────────────────────────────

export async function layAgingReport(type: "ar" | "ap"): Promise<AgingReport> {
  const today    = new Date().toISOString().split("T")[0];
  const buckets  = [
    { label: "Chưa đến hạn", days_min: -9999, days_max: 0,  amount: 0, count: 0 },
    { label: "0–30 ngày",    days_min: 1,     days_max: 30, amount: 0, count: 0 },
    { label: "31–60 ngày",   days_min: 31,    days_max: 60, amount: 0, count: 0 },
    { label: "61–90 ngày",   days_min: 61,    days_max: 90, amount: 0, count: 0 },
    { label: ">90 ngày",     days_min: 91,    days_max: null, amount: 0, count: 0 },
  ];
  const details: AgingDetail[] = [];

  const items = type === "ar" ? MOCK_INVOICES : MOCK_BILLS;
  const unpaid = type === "ar"
    ? (MOCK_INVOICES as Invoice[]).filter(i => i.status !== "paid" && i.remaining > 0)
    : (MOCK_BILLS as Bill[]).filter(b => b.status !== "paid" && b.remaining > 0);

  unpaid.forEach(item => {
    const days = so_ngay_qua_han(item.due_date);
    const bucket = buckets.find(b =>
      days >= b.days_min && (b.days_max === null || days <= b.days_max)
    );
    if (bucket) {
      bucket.amount += item.remaining;
      bucket.count  += 1;
    }
    details.push({
      party_name:   "customer_name" in item ? item.customer_name : item.vendor_name,
      invoice_code: "invoice_code" in item ? item.invoice_code : item.bill_code,
      due_date:     item.due_date,
      days_overdue: Math.max(0, days),
      amount:       item.remaining,
      currency:     item.currency,
    });
  });

  const total = details.reduce((s, d) => s + d.amount, 0);
  return {
    type, as_of_date: today, buckets, total,
    details: details.sort((a, b) => b.days_overdue - a.days_overdue),
  };
}

// ─── P&L Snapshot ────────────────────────────────────────────────────────────

export async function layPLSnapshot(period?: string): Promise<PLSnapshot> {
  // Tính từ invoices đã paid + COGS đã approved
  const thang = period ?? new Date().toISOString().slice(0, 7); // YYYY-MM

  const revenue = MOCK_INVOICES
    .filter(i => i.status === "paid" && i.issue_date.startsWith(thang))
    .reduce((s, i) => s + i.total_vnd, 0);

  const cogs = MOCK_COGS_DRAFTS
    .filter(c => c.status === "approved" && c.created_at.startsWith(thang))
    .reduce((s, c) => s + c.total_cogs, 0);

  const gross_profit = revenue - cogs;
  const gross_margin = revenue > 0 ? Math.round(gross_profit / revenue * 100) : 0;
  const expenses     = 420000000 + 85000000; // Lương + thuế (mock cố định)
  const net_profit   = gross_profit - expenses;

  return {
    period:        thang,
    revenue, cogs, gross_profit, gross_margin, expenses, net_profit,
    by_product: [
      { center: "Áo thun",   revenue: revenue * 0.45, cogs: cogs * 0.42, profit: 0 },
      { center: "Áo sơ mi",  revenue: revenue * 0.30, cogs: cogs * 0.31, profit: 0 },
      { center: "Quần jean", revenue: revenue * 0.25, cogs: cogs * 0.27, profit: 0 },
    ].map(p => ({ ...p, profit: p.revenue - p.cogs })),
    by_market: [
      { center: "Xuất khẩu",   revenue: revenue * 0.70, cogs: cogs * 0.68, profit: 0 },
      { center: "Nội địa",     revenue: revenue * 0.30, cogs: cogs * 0.32, profit: 0 },
    ].map(p => ({ ...p, profit: p.revenue - p.cogs })),
  };
}

// ─── Cash Flow Forecast ───────────────────────────────────────────────────────

export async function layDuBaoDongTien(ngay_bat_dau?: string, so_ngay = 14): Promise<CashFlowForecast[]> {
  const start = ngay_bat_dau ?? new Date().toISOString().split("T")[0];
  const end   = new Date(new Date(start).getTime() + so_ngay * 24 * 60 * 60 * 1000)
    .toISOString().split("T")[0];
  return MOCK_FORECASTS.filter(f => f.date >= start && f.date <= end)
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Tính tổng theo ngày — dùng cho biểu đồ
export async function layDuBaoTheoNgay(so_ngay = 14): Promise<{
  date: string; thu: number; chi: number; net: number; cum_balance: number;
}[]> {
  const forecasts = await layDuBaoDongTien(undefined, so_ngay);
  const total_cash = MOCK_ACCOUNTS.reduce((s, a) => s + a.balance_vnd, 0);

  // Group theo ngày
  const by_date: Record<string, { thu: number; chi: number }> = {};
  forecasts.forEach(f => {
    if (!by_date[f.date]) by_date[f.date] = { thu: 0, chi: 0 };
    const weighted = f.amount_vnd * (f.probability / 100);
    if (f.type === "thu") by_date[f.date].thu += weighted;
    else                  by_date[f.date].chi += weighted;
  });

  let cum = total_cash;
  return Object.entries(by_date).sort().map(([date, { thu, chi }]) => {
    const net = thu - chi;
    cum += net;
    return { date, thu, chi, net, cum_balance: cum };
  });
}

// ─── Dashboard tổng hợp ───────────────────────────────────────────────────────

export async function layDashboardData(): Promise<AccountingDashboard> {
  const [accounts, ar_aging, ap_aging, pl, forecast_days] = await Promise.all([
    layDanhSachTaiKhoan(),
    layAgingReport("ar"),
    layAgingReport("ap"),
    layPLSnapshot(),
    layDuBaoTheoNgay(14),
  ]);

  const total_cash_vnd = accounts.reduce((s, a) => s + a.balance_vnd, 0);

  // AR quá hạn — sort theo số ngày quá hạn giảm dần
  const ar_overdue = ar_aging.details
    .filter(d => d.days_overdue > 0)
    .sort((a, b) => b.days_overdue - a.days_overdue);

  // AP sắp đến hạn trong 7 ngày
  const ap_due_soon = ap_aging.details
    .filter(d => d.days_overdue <= 0)
    .filter(d => {
      const days_until = Math.abs(d.days_overdue);
      return days_until <= 7;
    })
    .sort((a, b) => a.days_overdue - b.days_overdue);

  return {
    cash_positions: accounts.map(a => ({
      account_id:   a.account_id,
      account_name: a.account_name,
      currency:     a.currency,
      balance:      a.balance,
      balance_vnd:  a.balance_vnd,
    })),
    total_cash_vnd,
    forecast_14_days: forecast_days,
    ar_overdue,
    ap_due_soon,
    pl_current_month: pl,
  };
}

// ─── Vouchers (Phiếu Thu/Chi) ─────────────────────────────────────────────────
 
import type { VoucherType, ApprovalRole } from "../data/accountingTypes";
import { MOCK_VOUCHERS } from "../data/accountingMockData";
 
// Sinh mã chứng từ tự động PT-2405-001
// Reset về 001 mỗi tháng mới
export function genVoucherCode(type: VoucherType): string {
  const now    = new Date();
  const prefix = type === "phieu_thu" ? "PT" : type === "phieu_chi" ? "PC" : "PH";
  const yyMM   = now.getFullYear().toString().slice(2) + String(now.getMonth() + 1).padStart(2, "0");
 
  // Tìm phiếu cùng loại trong tháng hiện tại
  const same_month = MOCK_VOUCHERS.filter(v =>
    v.voucher_code.startsWith(`${prefix}-${yyMM}-`)
  );
 
  // Tìm số thứ tự cao nhất
  const max_seq = same_month.reduce((max, v) => {
    const seq = parseInt(v.voucher_code.split("-")[2] ?? "0");
    return Math.max(max, seq);
  }, 0);
 
  return `${prefix}-${yyMM}-${String(max_seq + 1).padStart(3, "0")}`;
}
 
export async function layDanhSachVoucher(filter?: {
  type?:            VoucherType;
  status?:          string;
  account_id?:      string;
  search?:          string;
  from_date?:       string;
  to_date?:         string;
  date_field?:      "document_date" | "accounting_date";
}): Promise<Voucher[]> {
  let list = [...MOCK_VOUCHERS];
 
  if (filter?.type)       list = list.filter(v => v.type === filter.type);
  if (filter?.status)     list = list.filter(v => v.status === filter.status);
  if (filter?.account_id) list = list.filter(v => v.account_id === filter.account_id);
 
  if (filter?.search) {
    const q = filter.search.toLowerCase();
    list = list.filter(v =>
      v.doi_tuong_name.toLowerCase().includes(q) ||
      v.voucher_code.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q)
    );
  }
 
  const date_field = filter?.date_field ?? "accounting_date";
  if (filter?.from_date) list = list.filter(v => v[date_field] >= filter.from_date!);
  if (filter?.to_date)   list = list.filter(v => v[date_field] <= filter.to_date!);
 
  return list.sort((a, b) => b.accounting_date.localeCompare(a.accounting_date));
}
 
export async function layVoucherById(id: string): Promise<Voucher | null> {
  return MOCK_VOUCHERS.find(v => v.voucher_id === id) ?? null;
}
 
export async function taoVoucher(voucher: Omit<Voucher, "voucher_id" | "voucher_code">): Promise<Voucher> {
  const new_voucher: Voucher = {
    ...voucher,
    voucher_id:   gen_id(),
    voucher_code: genVoucherCode(voucher.type),
  };
  MOCK_VOUCHERS.unshift(new_voucher);
  return new_voucher;
}
 
export async function capNhatVoucher(voucher: Voucher): Promise<Voucher> {
  const idx = MOCK_VOUCHERS.findIndex(v => v.voucher_id === voucher.voucher_id);
  if (idx >= 0) {
    if (MOCK_VOUCHERS[idx].status === "approved") {
      throw new Error("Không thể sửa phiếu đã duyệt");
    }
    MOCK_VOUCHERS[idx] = voucher;
  }
  return voucher;
}
 
export async function xoaVoucher(id: string): Promise<void> {
  const idx = MOCK_VOUCHERS.findIndex(v => v.voucher_id === id);
  if (idx < 0) return;
  if (MOCK_VOUCHERS[idx].status === "approved") {
    throw new Error("Không thể xóa phiếu đã duyệt");
  }
  MOCK_VOUCHERS.splice(idx, 1);
}
 
export async function guiDuyetVoucher(id: string): Promise<Voucher> {
  const idx = MOCK_VOUCHERS.findIndex(v => v.voucher_id === id);
  if (idx < 0) throw new Error("Không tìm thấy phiếu");
  if (MOCK_VOUCHERS[idx].status !== "draft") throw new Error("Chỉ gửi duyệt phiếu đang ở trạng thái Nháp");
  MOCK_VOUCHERS[idx].status = "pending_approval";
  return MOCK_VOUCHERS[idx];
}
 
export async function duyetVoucher(
  id:          string,
  actor:       string,
  role:        ApprovalRole,
): Promise<Voucher> {
  const idx = MOCK_VOUCHERS.findIndex(v => v.voucher_id === id);
  if (idx < 0) throw new Error("Không tìm thấy phiếu");
 
  const v = MOCK_VOUCHERS[idx];
  if (v.status !== "pending_approval") throw new Error("Phiếu không ở trạng thái chờ duyệt");
 
  // Kiểm tra chặn âm quỹ với Phiếu Chi
  if (v.type === "phieu_chi") {
    const account = MOCK_ACCOUNTS.find(a => a.account_id === v.account_id);
    if (account && !account.allow_overdraft && v.total_vnd > account.balance_vnd) {
      throw new Error(`Số dư tài khoản không đủ! Cần ${dinh_dang_tien(v.total_vnd, "VND")} nhưng chỉ còn ${dinh_dang_tien(account.balance_vnd, "VND")}`);
    }
  }
 
  // Tìm approval rule
  const rule = await timApprovalRule(v.total_vnd);
  if (!rule) throw new Error("Không tìm thấy quy tắc phê duyệt");
 
  // Cập nhật approval history
  const step_idx = v.approval_history.findIndex(s => s.role === role && s.status === "pending");
  if (step_idx >= 0) {
    v.approval_history[step_idx] = { ...v.approval_history[step_idx], status: "approved", actor, acted_at: new Date().toISOString() };
  }
 
  // Kiểm tra đã đủ tất cả approvers chưa
  const all_approved = rule.approvers.every(r =>
    v.approval_history.some(s => s.role === r && s.status === "approved")
  );
 
  if (all_approved) {
    v.status      = "approved";
    v.approved_by = actor;
    v.approved_at = new Date().toISOString();
 
    // Cập nhật số dư tài khoản
    const acc_idx = MOCK_ACCOUNTS.findIndex(a => a.account_id === v.account_id);
    if (acc_idx >= 0) {
      if (v.type === "phieu_thu") {
        MOCK_ACCOUNTS[acc_idx].balance     += v.total_amount;
        MOCK_ACCOUNTS[acc_idx].balance_vnd += v.total_vnd;
      } else if (v.type === "phieu_chi") {
        MOCK_ACCOUNTS[acc_idx].balance     -= v.total_amount;
        MOCK_ACCOUNTS[acc_idx].balance_vnd -= v.total_vnd;
      }
    }
  }
 
  MOCK_VOUCHERS[idx] = v;
  return v;
}
 
export async function huyDuyetVoucher(
  id:      string,
  actor:   string,
  ly_do:   string,
): Promise<Voucher> {
  const idx = MOCK_VOUCHERS.findIndex(v => v.voucher_id === id);
  if (idx < 0) throw new Error("Không tìm thấy phiếu");
 
  const v = MOCK_VOUCHERS[idx];
  if (v.status !== "approved") throw new Error("Phiếu chưa được duyệt");
 
  // Rollback số dư tài khoản
  const acc_idx = MOCK_ACCOUNTS.findIndex(a => a.account_id === v.account_id);
  if (acc_idx >= 0) {
    if (v.type === "phieu_thu") {
      MOCK_ACCOUNTS[acc_idx].balance     -= v.total_amount;
      MOCK_ACCOUNTS[acc_idx].balance_vnd -= v.total_vnd;
    } else if (v.type === "phieu_chi") {
      MOCK_ACCOUNTS[acc_idx].balance     += v.total_amount;
      MOCK_ACCOUNTS[acc_idx].balance_vnd += v.total_vnd;
    }
  }
 
  v.status = "draft";
  v.approval_history.push({
    step:     v.approval_history.length + 1,
    role:     "ke_toan_truong",
    status:   "rejected",
    actor,
    note:     `HỦY DUYỆT: ${ly_do}`,
    acted_at: new Date().toISOString(),
  });
 
  MOCK_VOUCHERS[idx] = v;
  return v;
}
 
// ─── Công nợ (AR/AP) ──────────────────────────────────────────────────────────
 
import type {
  PaymentAllocation, DebtSummary,
  InvoiceWithAging, UnappliedAmount,
} from "../../../components/ThuChi/data/accountingTypes";
import { MOCK_ALLOCATIONS } from "../../../components/ThuChi/data/accountingMockData";
 
// Tính aging bucket động — không lưu DB
function tinh_aging_bucket(due_date: string): InvoiceWithAging["aging_bucket"] {
  const days = Math.floor(
    (Date.now() - new Date(due_date).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 0)  return "trong_han";
  if (days <= 30) return "1_30";
  if (days <= 60) return "31_60";
  if (days <= 90) return "61_90";
  return "qua_90";
}
 
function tinh_days_overdue(due_date: string): number {
  return Math.floor(
    (Date.now() - new Date(due_date).getTime()) / (1000 * 60 * 60 * 24)
  );
}
 
// Lay danh sách invoice kèm aging cho 1 khách hàng
export async function layInvoicesWithAging(
  customer_id: string,
  type: "ar" | "ap" = "ar",
): Promise<InvoiceWithAging[]> {
  const list = type === "ar"
    ? MOCK_INVOICES.filter(i => i.customer_id === customer_id && i.status !== "paid")
    : MOCK_BILLS.filter(b => b.vendor_id === customer_id && b.status !== "paid");
 
  return list.map(item => {
    const due     = "due_date" in item ? item.due_date : (item as any).due_date;
    const allocs  = MOCK_ALLOCATIONS.filter(a =>
      "invoice_id" in item
        ? a.invoice_id === (item as any).invoice_id
        : a.bill_id   === (item as any).bill_id
    );
    return {
      invoice_id:    (item as any).invoice_id ?? (item as any).bill_id,
      invoice_code:  (item as any).invoice_code ?? (item as any).bill_code,
      issue_date:    item.issue_date,
      due_date:      due,
      total_amount:  item.total_vnd,
      paid_amount:   item.paid_amount,
      remaining:     item.remaining,
      currency:      item.currency,
      exchange_rate: item.exchange_rate,
      status:        item.status,
      days_overdue:  tinh_days_overdue(due),
      aging_bucket:  tinh_aging_bucket(due),
      allocations:   allocs,
    };
  }).sort((a, b) => b.days_overdue - a.days_overdue);
}
 
// Tổng hợp công nợ tất cả khách hàng theo kỳ
export async function layDebtSummary(
  type:      "ar" | "ap" = "ar",
  ky_month?: string,   // YYYY-MM — mặc định tháng hiện tại
): Promise<DebtSummary[]> {
  const thang = ky_month ?? new Date().toISOString().slice(0, 7);
  const start = thang + "-01";
  const end   = new Date(new Date(start).getTime() + 31 * 86400000)
    .toISOString().split("T")[0];
 
  if (type === "ar") {
    // Group invoices theo customer
    const groups: Record<string, typeof MOCK_INVOICES> = {};
    MOCK_INVOICES.forEach(inv => {
      if (!groups[inv.customer_id]) groups[inv.customer_id] = [];
      groups[inv.customer_id].push(inv);
    });
 
    return Object.entries(groups).map(([cid, invs]) => {
      const first       = invs[0];
      const du_dau      = invs
        .filter(i => i.issue_date < start && i.status !== "paid")
        .reduce((s, i) => s + i.remaining, 0);
      const phat_tang   = invs
        .filter(i => i.issue_date >= start && i.issue_date < end)
        .reduce((s, i) => s + i.total_vnd, 0);
      const phat_giam   = invs
        .filter(i => i.issue_date >= start && i.issue_date < end)
        .reduce((s, i) => s + i.paid_amount, 0);
      const du_cuoi     = invs
        .filter(i => i.status !== "paid")
        .reduce((s, i) => s + i.remaining, 0);
      const qua_han     = invs
        .filter(i => i.status !== "paid" && tinh_days_overdue(i.due_date) > 0)
        .reduce((s, i) => s + i.remaining, 0);
 
      return {
        party_id:       cid,
        party_name:     first.customer_name,
        party_type:     "khach_hang" as const,
        du_no_dau_ky:   du_dau,
        phat_sinh_tang: phat_tang,
        phat_sinh_giam: phat_giam,
        du_no_cuoi_ky:  du_cuoi,
        qua_han,
        ung_truoc:      0,
      };
    }).sort((a, b) => b.du_no_cuoi_ky - a.du_no_cuoi_ky);
  } else {
    // AP — group theo vendor
    const groups: Record<string, typeof MOCK_BILLS> = {};
    MOCK_BILLS.forEach(b => {
      if (!groups[b.vendor_id]) groups[b.vendor_id] = [];
      groups[b.vendor_id].push(b);
    });
 
    return Object.entries(groups).map(([vid, bills]) => {
      const first     = bills[0];
      const du_cuoi   = bills
        .filter(b => b.status !== "paid")
        .reduce((s, b) => s + b.remaining, 0);
      const qua_han   = bills
        .filter(b => b.status !== "paid" && tinh_days_overdue(b.due_date) > 0)
        .reduce((s, b) => s + b.remaining, 0);
      return {
        party_id:       vid,
        party_name:     first.vendor_name,
        party_type:     "ncc" as const,
        du_no_dau_ky:   0,
        phat_sinh_tang: bills.reduce((s, b) => s + b.total_vnd, 0),
        phat_sinh_giam: bills.reduce((s, b) => s + b.paid_amount, 0),
        du_no_cuoi_ky:  du_cuoi,
        qua_han,
        ung_truoc:      0,
      };
    }).sort((a, b) => b.du_no_cuoi_ky - a.du_no_cuoi_ky);
  }
}
 
// Unapplied amounts — tiền thu chưa khớp hóa đơn nào
export async function layUnappliedAmounts(type: "ar" | "ap" = "ar"): Promise<UnappliedAmount[]> {
  const vouchers = MOCK_VOUCHERS.filter(v =>
    type === "ar" ? v.type === "phieu_thu" : v.type === "phieu_chi"
  ).filter(v => v.status === "approved");
 
  return vouchers.map(v => {
    const applied = MOCK_ALLOCATIONS
      .filter(a => a.voucher_id === v.voucher_id)
      .reduce((s, a) => s + a.applied_amount, 0);
    return {
      voucher_id:       v.voucher_id,
      voucher_code:     v.voucher_code,
      party_name:       v.doi_tuong_name,
      total_amount:     v.total_vnd,
      applied_amount:   applied,
      unapplied_amount: v.total_vnd - applied,
      currency:         v.currency,
      payment_date:     v.accounting_date,
    };
  }).filter(u => u.unapplied_amount > 0);
}
 
// ─── Allocation (Khớp nợ) ────────────────────────────────────────────────────
 
export async function allocate(params: {
  voucher_id:     string;
  invoice_id:     string;
  applied_amount: number;   // VNĐ muốn phân bổ
  applied_fx:     number;   // Ngoại tệ tương ứng (0 nếu VNĐ)
  created_by:     string;
}): Promise<PaymentAllocation> {
  const { voucher_id, invoice_id, applied_amount, applied_fx, created_by } = params;
 
  const voucher = MOCK_VOUCHERS.find(v => v.voucher_id === voucher_id);
  const invoice = MOCK_INVOICES.find(i => i.invoice_id === invoice_id);
  if (!voucher) throw new Error("Không tìm thấy phiếu thu");
  if (!invoice) throw new Error("Không tìm thấy hóa đơn");
 
  // Rule 1: Tổng applied không vượt tổng phiếu
  const da_applied = MOCK_ALLOCATIONS
    .filter(a => a.voucher_id === voucher_id)
    .reduce((s, a) => s + a.applied_amount, 0);
  if (da_applied + applied_amount > voucher.total_vnd) {
    throw new Error(
      `Số tiền phân bổ vượt quá phiếu thu! Còn có thể dùng: ${dinh_dang_tien(voucher.total_vnd - da_applied, "VND")}`
    );
  }
 
  // Rule 2: paid_amount không vượt total
  if (invoice.paid_amount + applied_amount > invoice.total_vnd) {
    throw new Error(
      `Số tiền phân bổ vượt quá hóa đơn! Còn nợ: ${dinh_dang_tien(invoice.remaining, "VND")}`
    );
  }
 
  // Logic 4: Tính lãi/lỗ tỷ giá
  const fx_gain_loss = applied_fx > 0
    ? Math.round((voucher.exchange_rate - invoice.exchange_rate) * applied_fx)
    : 0;
 
  const alloc: PaymentAllocation = {
    allocation_id:  gen_id(),
    voucher_id,
    invoice_id,
    applied_amount,
    applied_fx,
    rate_invoice:   invoice.exchange_rate,
    rate_payment:   voucher.exchange_rate,
    fx_gain_loss,
    created_at:     new Date().toISOString(),
    created_by,
  };
 
  MOCK_ALLOCATIONS.push(alloc);
 
  // Cập nhật invoice
  const inv_idx = MOCK_INVOICES.findIndex(i => i.invoice_id === invoice_id);
  if (inv_idx >= 0) {
    const inv           = MOCK_INVOICES[inv_idx];
    inv.paid_amount    += applied_amount;
    inv.remaining       = inv.total_vnd - inv.paid_amount;
    inv.status          = inv.remaining <= 0 ? "paid"
                        : inv.paid_amount > 0 ? "partial"
                        : "sent";
    MOCK_INVOICES[inv_idx] = inv;
  }
 
  return alloc;
}
 
export async function unallocate(allocation_id: string): Promise<void> {
  const idx = MOCK_ALLOCATIONS.findIndex(a => a.allocation_id === allocation_id);
  if (idx < 0) throw new Error("Không tìm thấy bản ghi khớp nợ");
 
  const alloc    = MOCK_ALLOCATIONS[idx];
  const inv_idx  = MOCK_INVOICES.findIndex(i => i.invoice_id === alloc.invoice_id);
 
  // Rollback invoice
  if (inv_idx >= 0) {
    const inv        = MOCK_INVOICES[inv_idx];
    inv.paid_amount  = Math.max(0, inv.paid_amount - alloc.applied_amount);
    inv.remaining    = inv.total_vnd - inv.paid_amount;
    inv.status       = inv.paid_amount <= 0 ? "sent" : "partial";
    MOCK_INVOICES[inv_idx] = inv;
  }
 
  // Xóa allocation
  MOCK_ALLOCATIONS.splice(idx, 1);
}