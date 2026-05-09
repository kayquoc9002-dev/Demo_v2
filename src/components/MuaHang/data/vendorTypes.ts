// vendorTypes.ts

export type VendorCategory = 'fabric' | 'trims' | 'packaging' | 'factory';
export type VendorStatus   = 'active' | 'inactive' | 'blacklisted';
export type VendorRating   = 'A' | 'B' | 'C';
export type ContactRole    = 'sales' | 'accounting' | 'technical' | 'owner' | 'other';
export type PaymentTerms   = 'cod' | 'deposit30' | 'deposit50' | 'net15' | 'net30' | 'net45' | 'net60';

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  fabric:    'Vải (Fabric)',
  trims:     'Phụ liệu (Trims)',
  packaging: 'Bao bì (Packaging)',
  factory:   'Xưởng may (CMT)',
};

export const VENDOR_CATEGORY_COLORS: Record<VendorCategory, string> = {
  fabric:    '#38bdf8',
  trims:     '#a78bfa',
  packaging: '#f97316',
  factory:   '#10b981',
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  active:      'Đang hợp tác',
  inactive:    'Tạm ngưng',
  blacklisted: 'Danh sách đen',
};

export const VENDOR_STATUS_COLORS: Record<VendorStatus, string> = {
  active:      '#10b981',
  inactive:    '#f59e0b',
  blacklisted: '#ef4444',
};

export const VENDOR_RATING_COLORS: Record<VendorRating, string> = {
  A: '#10b981',
  B: '#f59e0b',
  C: '#ef4444',
};

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  sales:      'Kinh doanh',
  accounting: 'Kế toán',
  technical:  'Kỹ thuật',
  owner:      'Chủ / Giám đốc',
  other:      'Khác',
};

export const PAYMENT_TERMS_LABELS: Record<PaymentTerms, string> = {
  cod:       'Trả ngay (COD)',
  deposit30: 'Cọc 30%, đối soát sau',
  deposit50: 'Cọc 50%, đối soát sau',
  net15:     'Net 15 ngày',
  net30:     'Net 30 ngày',
  net45:     'Net 45 ngày',
  net60:     'Net 60 ngày',
};

// ── Sub-tables ──────────────────────────────────────────────────────────

export interface VendorContact {
  id: string;
  name: string;
  role: ContactRole;
  phone: string;
  email?: string;
  zaloId?: string;
  isPrimary: boolean;
}

export interface VendorBankAccount {
  id: string;
  bankName: string;
  branch?: string;
  accountNumber: string;
  beneficiaryName: string;
  isPrimary: boolean;
}

// ── Main table ──────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  vendorCode: string;             // V-F001, V-T001...
  legalName: string;              // Tên pháp lý
  tradeName: string;              // Tên giao dịch / Tên lóng
  category: VendorCategory;
  taxId?: string;
  invoiceAddress?: string;
  status: VendorStatus;
  blacklistReason?: string;       // Bắt buộc nếu status = blacklisted
  rating: VendorRating;
  standardLeadTimeDays: number;   // Thời gian giao hàng chuẩn (ngày)
  defaultPaymentTerms: PaymentTerms;
  contacts: VendorContact[];
  bankAccounts: VendorBankAccount[];
  internalNote?: string;
  createdAt: string;
  updatedAt: string;
}

// ── PO History (for detail tab) ──────────────────────────────────────────

export interface VendorPORecord {
  id: string;
  poCode: string;
  date: string;
  status: 'open' | 'partial' | 'completed' | 'cancelled';
  totalAmount: number;
  itemCount: number;
  actualLeadTimeDays?: number;    // So sánh vs standardLeadTimeDays
}

// ── Validation ──────────────────────────────────────────────────────────

export const TAX_REGEX    = /^\d{10}(-\d{3})?$/;
export const PHONE_REGEX  = /^(0[3|5|7|8|9])\d{8}$/;
export const EMAIL_REGEX  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const BANK_REGEX   = /^\d+$/;
// Vendor code: chữ hoa/thường, số, dấu gạch ngang — không dấu tiếng Việt, không khoảng trắng
export const VCODE_REGEX  = /^[A-Za-z0-9\-]+$/;