// ─────────────────────────────────────────────────────────────────────────────
// accountingMockData.ts — Mock data thực tế cho module Kế toán quản trị
// ─────────────────────────────────────────────────────────────────────────────

import type {
  BankAccount, TransactionCategory, CostCenter,
  DailyExchangeRate, ApprovalRule, Voucher,
  Invoice, Bill, Payment, CogsDraft, CashFlowForecast,
} from "./accountingTypes";

// ─── Tài khoản ngân hàng ──────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: BankAccount[] = [
  {
    account_id:      "acc-1",
    account_name:    "Vietcombank VNĐ - TK chính",
    account_number:  "0071002345678",
    bank_name:       "Vietcombank",
    currency:        "VND",
    balance:         850000000,
    balance_vnd:     850000000,
    is_active:       true,
    vas_account_code: "112",

    allow_overdraft: true,
  },
  {
    account_id:      "acc-2",
    account_name:    "Vietcombank USD - TK xuất khẩu",
    account_number:  "0071008765432",
    bank_name:       "Vietcombank",
    currency:        "USD",
    balance:         45000,          // USD
    balance_vnd:     1143000000,     // 45,000 × 25,400
    is_active:       true,
    vas_account_code: "112",

    allow_overdraft: true,
  },
  {
    account_id:      "acc-3",
    account_name:    "BIDV VNĐ - TK lương",
    account_number:  "31410001234567",
    bank_name:       "BIDV",
    currency:        "VND",
    balance:         320000000,
    balance_vnd:     320000000,
    is_active:       true,
    vas_account_code: "112",

    allow_overdraft: false,
  },
  {
    account_id:      "acc-4",
    account_name:    "Tiền mặt tại quỹ",
    account_number:  "CASH",
    bank_name:       "Quỹ tiền mặt",
    currency:        "VND",
    balance:         45000000,
    balance_vnd:     45000000,
    is_active:       true,
    vas_account_code: "111",

    allow_overdraft: false,
  },
];

// ─── Hạng mục thu/chi ────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: TransactionCategory[] = [
  // Thu
  { category_id: "cat-1",  parent_id: null,    code: "THU",          name: "Thu",                          type: "thu",    is_active: true },
  { category_id: "cat-2",  parent_id: "cat-1", code: "THU_KH",       name: "Thu tiền khách hàng",          type: "thu",    is_active: true,  vas_account_code: "131" },
  { category_id: "cat-3",  parent_id: "cat-1", code: "THU_LS",       name: "Thu lãi tiền gửi",             type: "thu",    is_active: true,  vas_account_code: "515" },
  { category_id: "cat-4",  parent_id: "cat-1", code: "THU_KHAC",     name: "Thu khác",                     type: "thu",    is_active: true,  vas_account_code: "711" },
  // Chi
  { category_id: "cat-5",  parent_id: null,    code: "CHI",          name: "Chi",                          type: "chi",    is_active: true },
  { category_id: "cat-6",  parent_id: "cat-5", code: "CHI_NCC",      name: "Thanh toán nhà cung cấp",      type: "chi",    is_active: true,  vas_account_code: "331" },
  { category_id: "cat-7",  parent_id: "cat-5", code: "CHI_LUONG",    name: "Chi lương nhân viên",          type: "chi",    is_active: true,  vas_account_code: "334" },
  { category_id: "cat-8",  parent_id: "cat-5", code: "CHI_HANH_CHINH", name: "Chi hành chính văn phòng",  type: "chi",    is_active: true,  vas_account_code: "642" },
  { category_id: "cat-9",  parent_id: "cat-5", code: "CHI_VAN_CHUYEN", name: "Chi phí vận chuyển",        type: "chi",    is_active: true,  vas_account_code: "641" },
  { category_id: "cat-10", parent_id: "cat-5", code: "CHI_BAO_TRI",  name: "Bảo trì thiết bị máy móc",    type: "chi",    is_active: true,  vas_account_code: "627" },
  { category_id: "cat-11", parent_id: "cat-5", code: "CHI_CONG_TAC", name: "Công tác phí",                type: "chi",    is_active: true,  vas_account_code: "642" },
  { category_id: "cat-12", parent_id: "cat-5", code: "CHI_THUE",     name: "Nộp thuế",                    type: "chi",    is_active: true,  vas_account_code: "333" },
];

// ─── Trung tâm chi phí ───────────────────────────────────────────────────────

export const MOCK_COST_CENTERS: CostCenter[] = [
  { center_id: "cc-1",  code: "SP_AO_THUN",    name: "Áo thun",           type: "san_pham",   is_active: true },
  { center_id: "cc-2",  code: "SP_SO_MI",       name: "Áo sơ mi",          type: "san_pham",   is_active: true },
  { center_id: "cc-3",  code: "SP_QUAN_JEAN",   name: "Quần jean",         type: "san_pham",   is_active: true },
  { center_id: "cc-4",  code: "SP_AO_KHOAC",    name: "Áo khoác",          type: "san_pham",   is_active: true },
  { center_id: "cc-5",  code: "TT_XUAT_KHAU",   name: "Thị trường xuất khẩu", type: "thi_truong", is_active: true },
  { center_id: "cc-6",  code: "TT_TRONG_NUOC",  name: "Thị trường nội địa",   type: "thi_truong", is_active: true },
  { center_id: "cc-7",  code: "BP_XUONG",        name: "Bộ phận xưởng",    type: "bo_phan",    is_active: true },
  { center_id: "cc-8",  code: "BP_VAN_PHONG",    name: "Bộ phận văn phòng", type: "bo_phan",   is_active: true },
];

// ─── Tỷ giá hối đoái ─────────────────────────────────────────────────────────

export const MOCK_EXCHANGE_RATES: DailyExchangeRate[] = [
  { rate_id: "er-1", date: "2026-05-03", currency: "USD", rate_sell: 25420, rate_buy: 25260, source: "auto", fetched_at: "2026-05-03T08:00:00Z" },
  { rate_id: "er-2", date: "2026-05-03", currency: "EUR", rate_sell: 28150, rate_buy: 27880, source: "auto", fetched_at: "2026-05-03T08:00:00Z" },
  { rate_id: "er-3", date: "2026-05-03", currency: "RMB", rate_sell: 3510,  rate_buy: 3475,  source: "auto", fetched_at: "2026-05-03T08:00:00Z" },
  { rate_id: "er-4", date: "2026-05-02", currency: "USD", rate_sell: 25380, rate_buy: 25220, source: "auto", fetched_at: "2026-05-02T08:00:00Z" },
  { rate_id: "er-5", date: "2026-05-02", currency: "EUR", rate_sell: 28090, rate_buy: 27820, source: "auto", fetched_at: "2026-05-02T08:00:00Z" },
];

// ─── Quy tắc phê duyệt ───────────────────────────────────────────────────────

export const MOCK_APPROVAL_RULES: ApprovalRule[] = [
  {
    rule_id:    "rule-1",
    name:       "Mức 1 — Dưới 5 triệu",
    min_amount: 0,
    max_amount: 5000000,
    approvers:  ["ke_toan_truong"],
    is_active:  true,
  },
  {
    rule_id:    "rule-2",
    name:       "Mức 2 — 5 đến 50 triệu",
    min_amount: 5000001,
    max_amount: 50000000,
    approvers:  ["ke_toan_truong", "pho_giam_doc"],
    is_active:  true,
  },
  {
    rule_id:    "rule-3",
    name:       "Mức 3 — Trên 50 triệu",
    min_amount: 50000001,
    max_amount: null,
    approvers:  ["ke_toan_truong", "pho_giam_doc", "tong_giam_doc"],
    is_active:  true,
  },
];

// ─── Hóa đơn AR (Phải thu) ───────────────────────────────────────────────────

export const MOCK_INVOICES: Invoice[] = [
  {
    invoice_id:    "inv-1",
    invoice_code:  "HD-2026-0041",
    customer_id:   "cust-1",
    customer_name: "Zara International",
    issue_date:    "2026-03-01",
    due_date:      "2026-04-30",    // ← QUÁ HẠN 3 ngày!
    currency:      "USD",
    exchange_rate: 25100,
    subtotal:      80000,
    tax_amount:    0,
    total_amount:  80000,
    total_vnd:     2008000000,
    paid_amount:   0,
    remaining:     2008000000,
    status:        "overdue",
    note:          "Đơn xuất khẩu áo thun SS24 - 4000 cái",
    lines: [
      { line_id: "il-1", invoice_id: "inv-1", sku_code: "ATS-SS24-001", description: "Áo thun Basic Oversize", quantity: 4000, unit_price: 20, amount: 80000, center_id: "cc-1" },
    ],
  },
  {
    invoice_id:    "inv-2",
    invoice_code:  "HD-2026-0042",
    customer_id:   "cust-2",
    customer_name: "H&M Vietnam",
    issue_date:    "2026-04-01",
    due_date:      "2026-05-31",
    currency:      "USD",
    exchange_rate: 25350,
    subtotal:      45000,
    tax_amount:    0,
    total_amount:  45000,
    total_vnd:     1140750000,
    paid_amount:   570375000,       // Đã trả 50%
    remaining:     570375000,
    status:        "partial",
    note:          "Đơn áo sơ mi linen SS24 - 1500 cái",
    lines: [
      { line_id: "il-2", invoice_id: "inv-2", sku_code: "SM-SS24-001", description: "Áo Sơ Mi Linen Trơn", quantity: 1500, unit_price: 30, amount: 45000, center_id: "cc-2" },
    ],
  },
  {
    invoice_id:    "inv-3",
    invoice_code:  "HD-2026-0043",
    customer_id:   "cust-3",
    customer_name: "Công ty Thời trang Việt",
    issue_date:    "2026-04-15",
    due_date:      "2026-05-15",
    currency:      "VND",
    exchange_rate: 1,
    subtotal:      450000000,
    tax_amount:    45000000,
    total_amount:  495000000,
    total_vnd:     495000000,
    paid_amount:   495000000,
    remaining:     0,
    status:        "paid",
    note:          "Bán sỉ nội địa tháng 4/2026",
    lines: [
      { line_id: "il-3", invoice_id: "inv-3", description: "Áo thun + áo sơ mi mix", quantity: 2000, unit_price: 225000, amount: 450000000, center_id: "cc-6" },
    ],
  },
  {
    invoice_id:    "inv-4",
    invoice_code:  "HD-2026-0044",
    customer_id:   "cust-4",
    customer_name: "Uniqlo Vietnam",
    issue_date:    "2026-04-20",
    due_date:      "2026-06-19",
    currency:      "USD",
    exchange_rate: 25400,
    subtotal:      120000,
    tax_amount:    0,
    total_amount:  120000,
    total_vnd:     3048000000,
    paid_amount:   0,
    remaining:     3048000000,
    status:        "sent",
    note:          "Đơn quần jean AW24 xuất khẩu - 6000 cái",
    lines: [
      { line_id: "il-4", invoice_id: "inv-4", sku_code: "QJ-AW24-001", description: "Quần Jean Slim Fit", quantity: 6000, unit_price: 20, amount: 120000, center_id: "cc-3" },
    ],
  },
];

// ─── Hóa đơn AP (Phải trả NCC) ───────────────────────────────────────────────

export const MOCK_BILLS: Bill[] = [
  {
    bill_id:      "bill-1",
    bill_code:    "HM-2026-0021",
    vendor_id:    "v-1",
    vendor_name:  "Xưởng May Ánh Sáng",
    po_id:        "po-3",
    issue_date:   "2026-04-20",
    due_date:     "2026-05-20",
    currency:     "VND",
    exchange_rate: 1,
    total_amount: 15300000,
    total_vnd:    15300000,
    paid_amount:  0,
    remaining:    15300000,
    status:       "approved",
    note:         "PO-2026-003 — Áo sơ mi linen",
  },
  {
    bill_id:      "bill-2",
    bill_code:    "HM-2026-0022",
    vendor_id:    "v-3",
    vendor_name:  "NCC Vải Thiên Quang",
    issue_date:   "2026-04-10",
    due_date:     "2026-05-10",    // ← SẮP ĐẾN HẠN
    currency:     "RMB",
    exchange_rate: 3510,
    total_amount: 85000,           // RMB
    total_vnd:    298350000,
    paid_amount:  0,
    remaining:    298350000,
    status:       "approved",
    note:         "Nhập vải cotton tháng 4/2026 — 500 cuộn",
  },
  {
    bill_id:      "bill-3",
    bill_code:    "HM-2026-0023",
    vendor_id:    "v-2",
    vendor_name:  "Xưởng Hồng Vân",
    po_id:        "po-2",
    issue_date:   "2026-03-20",
    due_date:     "2026-04-20",    // ← QUÁ HẠN
    currency:     "VND",
    exchange_rate: 1,
    total_amount: 28600000,
    total_vnd:    28600000,
    paid_amount:  14300000,        // Đã trả 50%
    remaining:    14300000,
    status:       "partial",
    note:         "PO-2026-002 — Quần jean slim fit",
  },
];

// ─── COGS Drafts ──────────────────────────────────────────────────────────────

export const MOCK_COGS_DRAFTS: CogsDraft[] = [
  {
    cogs_id:      "cogs-1",
    cogs_code:    "COGS-2026-0041",
    source_type:  "xuat_kho",
    source_id:    "pk-001",
    order_id:     "inv-4",
    status:       "draft",
    total_cogs:   148500000,
    note_kho:     "Xuất kho 6000 quần jean cho đơn Uniqlo",
    note_kt:      "",
    created_at:   "2026-04-28T14:30:00Z",
    lines: [
      {
        line_id:             "cl-1",
        cogs_id:             "cogs-1",
        ma_sku:              "QJ-AW24-001-BLK-29",
        ten_sp:              "Quần Jean Slim Fit - Đen/29",
        so_luong:            2500,
        don_gia_binh_quan:   195000,
        thanh_tien:          487500000,
        so_luong_dinh_muc:   2500,
        so_luong_thuc:       2520,   // Hao hụt 20 cái
        hao_hut:             20,
      },
      {
        line_id:             "cl-2",
        cogs_id:             "cogs-1",
        ma_sku:              "QJ-AW24-001-BLK-30",
        ten_sp:              "Quần Jean Slim Fit - Đen/30",
        so_luong:            3500,
        don_gia_binh_quan:   195000,
        thanh_tien:          682500000,
        so_luong_dinh_muc:   3500,
        so_luong_thuc:       3500,
        hao_hut:             0,
      },
    ],
  },
  {
    cogs_id:      "cogs-2",
    cogs_code:    "COGS-2026-0042",
    source_type:  "xuat_kho",
    source_id:    "pk-002",
    order_id:     "inv-1",
    status:       "approved",
    total_cogs:   340000000,
    note_kho:     "Xuất kho 4000 áo thun cho Zara",
    note_kt:      "Đã kiểm tra — hao hụt trong mức cho phép",
    created_at:   "2026-03-15T10:00:00Z",
    approved_by:  "Nguyễn Thị Kế Toán",
    approved_at:  "2026-03-16T09:00:00Z",
    lines: [
      {
        line_id:             "cl-3",
        cogs_id:             "cogs-2",
        ma_sku:              "ATS-SS24-001-BLK-M",
        ten_sp:              "Áo Thun Basic Oversize - Đen/M",
        so_luong:            4000,
        don_gia_binh_quan:   85000,
        thanh_tien:          340000000,
        so_luong_dinh_muc:   4000,
        so_luong_thuc:       4008,
        hao_hut:             8,
      },
    ],
  },
];

// ─── Cash Flow Forecast ───────────────────────────────────────────────────────

export const MOCK_FORECASTS: CashFlowForecast[] = [
  // Thu — từ Invoice AR
  { forecast_id: "fc-1",  date: "2026-05-05", type: "thu", category: "Thu từ H&M Vietnam (còn lại)",     amount_vnd: 570375000,  source_type: "invoice", source_id: "inv-2", probability: 80, note: "" },
  { forecast_id: "fc-2",  date: "2026-05-10", type: "thu", category: "Thu từ Zara (quá hạn — nhắc nợ)", amount_vnd: 2008000000, source_type: "invoice", source_id: "inv-1", probability: 60, note: "Cần Sale gọi nhắc" },
  { forecast_id: "fc-3",  date: "2026-05-15", type: "thu", category: "Thu từ Uniqlo Vietnam (đợt 1)",   amount_vnd: 1524000000, source_type: "invoice", source_id: "inv-4", probability: 90, note: "50% đợt 1 theo hợp đồng" },
  // Chi — từ Bill AP
  { forecast_id: "fc-4",  date: "2026-05-05", type: "chi", category: "Lương tháng 5/2026",              amount_vnd: 420000000,  source_type: "manual",  probability: 100, note: "Cố định mỗi tháng" },
  { forecast_id: "fc-5",  date: "2026-05-10", type: "chi", category: "Trả NCC vải Thiên Quang",         amount_vnd: 298350000,  source_type: "bill",    source_id: "bill-2", probability: 100, note: "Đến hạn 10/5" },
  { forecast_id: "fc-6",  date: "2026-05-20", type: "chi", category: "Trả Xưởng May Ánh Sáng",         amount_vnd: 15300000,   source_type: "bill",    source_id: "bill-1", probability: 100, note: "PO-2026-003" },
  { forecast_id: "fc-7",  date: "2026-05-25", type: "chi", category: "Đặt cọc lô vải SS25",            amount_vnd: 150000000,  source_type: "manual",  probability: 70,  note: "Đang đàm phán với TQ" },
  { forecast_id: "fc-8",  date: "2026-05-31", type: "chi", category: "Thuế GTGT tháng 4",              amount_vnd: 85000000,   source_type: "manual",  probability: 100, note: "Nộp thuế định kỳ" },
];


// ─── Vouchers (Phiếu Thu/Chi) ───────────────────────────────────────────────────────

export const MOCK_VOUCHERS: Voucher[] = [
  {
    voucher_id:      "v-1",
    voucher_code:    "PT-2604-001",
    type:            "phieu_thu",
    status:          "approved",
    account_id:      "acc-2",
    currency:        "USD",
    exchange_rate:   25350,
    total_amount:    22500,
    total_vnd:       570375000,
    document_date:   "2026-04-28",
    accounting_date: "2026-04-28",
    doi_tuong_name:  "H&M Vietnam",
    doi_tuong_type:  "khach_hang",
    description:     "Thu 50% tiền hàng HD-2026-0042",
    reference_type:  "invoice",
    reference_id:    "inv-2",
    created_by:      "Nguyễn Thị Kế Toán",
    created_at:      "2026-04-28T09:30:00Z",
    approved_by:     "Trần Kế Toán Trưởng",
    approved_at:     "2026-04-28T10:00:00Z",
    approval_history: [
      { step: 1, role: "ke_toan_truong", status: "approved",
        actor: "Trần Kế Toán Trưởng", acted_at: "2026-04-28T10:00:00Z" }
    ],
    lines: [
      {
        line_id: "vl-1", voucher_id: "v-1", category_id: "cat-2",
        description: "Thu 50% HĐ H&M tháng 4",
        amount: 22500, amount_vnd: 570375000,
        ref_invoice_id: "inv-2",
      }
    ],
  },
  {
    voucher_id:      "v-2",
    voucher_code:    "PC-2604-001",
    type:            "phieu_chi",
    status:          "approved",
    account_id:      "acc-1",
    currency:        "VND",
    exchange_rate:   1,
    total_amount:    420000000,
    total_vnd:       420000000,
    document_date:   "2026-04-30",
    accounting_date: "2026-04-30",
    doi_tuong_name:  "Toàn thể nhân viên",
    doi_tuong_type:  "nhan_vien",
    description:     "Chi lương tháng 4/2026",
    created_by:      "Nguyễn Thị Kế Toán",
    created_at:      "2026-04-30T08:00:00Z",
    approved_by:     "Trần Kế Toán Trưởng",
    approved_at:     "2026-04-30T09:00:00Z",
    approval_history: [
      { step: 1, role: "ke_toan_truong", status: "approved",
        actor: "Trần Kế Toán Trưởng", acted_at: "2026-04-30T09:00:00Z" }
    ],
    lines: [
      {
        line_id: "vl-2", voucher_id: "v-2", category_id: "cat-7",
        description: "Lương tháng 4 xưởng + VP",
        amount: 420000000, amount_vnd: 420000000,
      }
    ],
  },
  {
    voucher_id:      "v-3",
    voucher_code:    "PC-2605-001",
    type:            "phieu_chi",
    status:          "pending_approval",
    account_id:      "acc-1",
    currency:        "VND",
    exchange_rate:   1,
    total_amount:    8500000,
    total_vnd:       8500000,
    document_date:   "2026-05-02",
    accounting_date: "2026-05-02",
    doi_tuong_name:  "Công ty TNHH Bảo trì Máy",
    doi_tuong_type:  "ncc",
    description:     "Bảo trì máy may công nghiệp tháng 5",
    created_by:      "Lê Kế Toán",
    created_at:      "2026-05-02T14:00:00Z",
    approval_history: [
      { step: 1, role: "ke_toan_truong", status: "pending" }
    ],
    lines: [
      {
        line_id: "vl-3", voucher_id: "v-3", category_id: "cat-10",
        center_id: "cc-7",
        description: "Bảo trì 5 máy may Juki + 2 máy vắt sổ",
        amount: 8500000, amount_vnd: 8500000,
      }
    ],
  },
  {
    voucher_id:      "v-4",
    voucher_code:    "PC-2605-002",
    type:            "phieu_chi",
    status:          "draft",
    account_id:      "acc-4",
    currency:        "VND",
    exchange_rate:   1,
    total_amount:    3200000,
    total_vnd:       3200000,
    document_date:   "2026-05-03",
    accounting_date: "2026-05-03",
    doi_tuong_name:  "Nguyễn Văn Mua",
    doi_tuong_type:  "nhan_vien",
    description:     "Tạm ứng công tác phí mua hàng Trung Quốc",
    created_by:      "Lê Kế Toán",
    created_at:      "2026-05-03T09:00:00Z",
    approval_history: [],
    lines: [
      {
        line_id: "vl-4", voucher_id: "v-4", category_id: "cat-11",
        description: "Vé máy bay + khách sạn Quảng Châu",
        amount: 2800000, amount_vnd: 2800000,
      },
      {
        line_id: "vl-5", voucher_id: "v-4", category_id: "cat-8",
        description: "Chi phí văn phòng phẩm mua tại TQ",
        amount: 400000, amount_vnd: 400000,
      },
    ],
  },
];

// ─── Payment Allocations ──────────────────────────────────────────────────────
 
export const MOCK_ALLOCATIONS: import("../accountingTypes").PaymentAllocation[] = [
  {
    // PT-2604-001 (570tr từ H&M) → khớp với inv-2 (H&M còn nợ 570tr)
    allocation_id:  "alloc-1",
    voucher_id:     "v-1",
    invoice_id:     "inv-2",
    applied_amount: 570375000,
    applied_fx:     22500,
    rate_invoice:   25350,   // tỷ giá lúc xuất HĐ
    rate_payment:   25350,   // tỷ giá lúc thu tiền (giống → không lãi/lỗ)
    fx_gain_loss:   0,
    created_at:     "2026-04-28T10:00:00Z",
    created_by:     "Trần Kế Toán Trưởng",
  },
];