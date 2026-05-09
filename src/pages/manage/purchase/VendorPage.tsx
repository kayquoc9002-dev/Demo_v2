// NhaCungCapPage.tsx
import { useState, useEffect } from 'react';
import {
  Search, Plus, Filter, X, ArrowLeft, Edit2, Copy, Check,
  AlertTriangle, Trash2, Building2, Phone, Mail, MessageCircle,
  Clock, ShoppingCart,
  BadgeAlert, Users, FileText, Banknote, Tag,
} from 'lucide-react';

import type {
  Vendor, VendorContact, VendorBankAccount,
  VendorCategory, VendorStatus, VendorRating,
  PaymentTerms,
} from '../../../components/MuaHang/data/vendorTypes';

import {
  VENDOR_CATEGORY_LABELS, VENDOR_CATEGORY_COLORS,
  VENDOR_STATUS_LABELS, VENDOR_STATUS_COLORS, VENDOR_RATING_COLORS,
  CONTACT_ROLE_LABELS, PAYMENT_TERMS_LABELS,
  TAX_REGEX, PHONE_REGEX, EMAIL_REGEX, BANK_REGEX, VCODE_REGEX,
} from '../../../components/MuaHang/data/vendorTypes';

import {
  getVendorById, createVendor, updateVendor,
  checkVendorCodeUnique, checkTaxIdUnique,
  getVendorPOs, filterVendors, type VendorFilter,
} from '../../../components/MuaHang/service/vendorService';

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

const fmtShort = (n: number) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString('vi-VN');

// ── Shared ────────────────────────────────────────────────────────────────
function Badge({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${pulse ? 'animate-pulse' : ''}`}
      style={{ background: color + '20', color, border: `1px solid ${color}30` }}
    >
      {label}
    </span>
  );
}

function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button
      onClick={copy}
      title="Copy"
      className="p-1 rounded-lg transition-all flex-shrink-0"
      style={{ background: copied ? '#10b98120' : 'transparent', color: copied ? '#10b981' : '#475569' }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}
      >
        <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>{title}</span>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FormField({
  label, error, children, required, className = '',
}: {
  label: string; error?: string; children: React.ReactNode;
  required?: boolean; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[10px] flex items-start gap-1" style={{ color: '#ef4444' }}>
          <AlertTriangle size={9} style={{ marginTop: 1, flexShrink: 0 }} /> {error}
        </p>
      )}
    </div>
  );
}

const inputBase = (hasError?: boolean): React.CSSProperties => ({
  background: '#1e293b',
  border: `1px solid ${hasError ? '#ef4444' : '#334155'}`,
  color: 'white',
});

const selectBase: React.CSSProperties = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: 'white',
};

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1 — VENDOR LIST
// ─────────────────────────────────────────────────────────────────────────
function VendorList({
  onSelect, onCreateNew,
}: {
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [filters, setFilters] = useState<VendorFilter>({ category: 'all', status: 'all', rating: 'all' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setVendors(filterVendors(filters));
  }, [filters]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setF = (k: keyof VendorFilter, v: any) =>
    setFilters(prev => ({ ...prev, [k]: v }));

  const activeFilters = Object.entries(filters).filter(
    ([k, v]) => k !== 'search' && v && v !== 'all'
  ).length;

  const total = vendors.length;
  const blacklisted = vendors.filter(v => v.status === 'blacklisted').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div>
          <h1 className="text-base font-black text-white">Danh mục Nhà cung cấp</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[11px]" style={{ color: '#64748b' }}>{total} nhà cung cấp</span>
            {blacklisted > 0 && (
              <span className="text-[10px] font-black flex items-center gap-1" style={{ color: '#ef4444' }}>
                <BadgeAlert size={10} /> {blacklisted} blacklisted
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black"
          style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}
        >
          <Plus size={14} /> Thêm NCC
        </button>
      </div>

      {/* Search + filter bar */}
      <div
        className="px-6 py-3 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: '1px solid #1e293b' }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Tên, mã, SĐT, MST..."
            value={filters.search ?? ''}
            onChange={e => setF('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
          />
        </div>

        {/* Category tabs */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
          {(['all', 'fabric', 'trims', 'packaging', 'factory'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setF('category', cat)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                background: filters.category === cat ? '#1e293b' : 'transparent',
                color: filters.category === cat
                  ? (cat === 'all' ? 'white' : VENDOR_CATEGORY_COLORS[cat as VendorCategory])
                  : '#64748b',
                borderRight: '1px solid #334155',
              }}
            >
              {cat === 'all' ? 'Tất cả' : VENDOR_CATEGORY_LABELS[cat as VendorCategory].split(' ')[0]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          style={{ background: showFilters ? '#1e293b' : 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
        >
          <Filter size={12} /> Lọc thêm
          {activeFilters > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
              style={{ background: '#38bdf8', color: '#020817' }}
            >
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div
          className="px-6 py-3 flex items-center gap-4 flex-shrink-0"
          style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
        >
          {[
            { label: 'Trạng thái', key: 'status', options: [['all', 'Tất cả'], ['active', 'Đang hợp tác'], ['inactive', 'Tạm ngưng'], ['blacklisted', 'Blacklist']] },
            { label: 'Hạng uy tín', key: 'rating', options: [['all', 'Tất cả'], ['A', 'A — Xuất sắc'], ['B', 'B — Khá'], ['C', 'C — Cần cải thiện']] },
          ].map(({ label, key, options }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>{label}</span>
              <select
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(filters as any)[key] ?? 'all'}
                onChange={e => setF(key as keyof VendorFilter, e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs outline-none"
                style={selectBase}
              >
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          {activeFilters > 0 && (
            <button
              onClick={() => setFilters({ category: 'all', status: 'all', rating: 'all' })}
              className="flex items-center gap-1 text-xs"
              style={{ color: '#64748b' }}
            >
              <X size={11} /> Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Table header */}
      <div
        className="grid flex-shrink-0 px-4"
        style={{
          gridTemplateColumns: '110px 1fr 90px 80px 80px 120px 120px 70px',
          background: '#020817',
          borderBottom: '1px solid #1e293b',
          position: 'sticky', top: 0, zIndex: 10,
        }}
      >
        {['MÃ NCC', 'NHÀ CUNG CẤP', 'PHÂN NHÓM', 'HẠNG', 'LEAD-TIME', 'ĐIỀU KHOẢN TT', 'TRẠNG THÁI', 'SĐT CHÍNH'].map(h => (
          <div key={h} className="px-2 py-2.5 text-[9px] font-black uppercase" style={{ color: '#334155' }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {vendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Building2 size={32} style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Không tìm thấy nhà cung cấp</p>
          </div>
        ) : (
          vendors.map((v, i) => {
            const isBlacklisted = v.status === 'blacklisted';
            const primaryContact = v.contacts.find(c => c.isPrimary) ?? v.contacts[0];
            const catColor = VENDOR_CATEGORY_COLORS[v.category];
            const statusColor = VENDOR_STATUS_COLORS[v.status];
            const ratingColor = VENDOR_RATING_COLORS[v.rating];

            return (
              <div
                key={v.id}
                onClick={() => onSelect(v.id)}
                className="grid px-4 cursor-pointer transition-all"
                style={{
                  gridTemplateColumns: '110px 1fr 90px 80px 80px 120px 120px 70px',
                  borderBottom: '1px solid #0f172a',
                  background: isBlacklisted
                    ? '#ef444408'
                    : i % 2 === 1 ? '#0f172a40' : 'transparent',
                  borderLeft: isBlacklisted ? '3px solid #ef4444' : '3px solid transparent',
                  opacity: v.status === 'inactive' ? 0.65 : 1,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1e293b30')}
                onMouseLeave={e => (e.currentTarget.style.background = isBlacklisted ? '#ef444408' : i % 2 === 1 ? '#0f172a40' : 'transparent')}
              >
                {/* Mã */}
                <div className="px-2 py-2.5 flex items-center">
                  <span className="text-xs font-black" style={{ color: '#38bdf8' }}>{v.vendorCode}</span>
                </div>

                {/* Tên */}
                <div className="px-2 py-2.5 flex items-center gap-2 min-w-0">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-black"
                    style={{ background: catColor + '20', color: catColor }}
                  >
                    {v.tradeName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {v.tradeName}
                      {isBlacklisted && <BadgeAlert size={10} style={{ color: '#ef4444', flexShrink: 0 }} />}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: '#64748b' }}>{v.legalName}</p>
                  </div>
                </div>

                {/* Phân nhóm */}
                <div className="px-2 py-2.5 flex items-center">
                  <Badge label={VENDOR_CATEGORY_LABELS[v.category].split(' ')[0]} color={catColor} />
                </div>

                {/* Hạng */}
                <div className="px-2 py-2.5 flex items-center">
                  <span
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black"
                    style={{ background: ratingColor + '20', color: ratingColor }}
                  >
                    {v.rating}
                  </span>
                </div>

                {/* Lead-time */}
                <div className="px-2 py-2.5 flex items-center">
                  <span className="text-xs font-bold tabular-nums" style={{ color: '#94a3b8' }}>
                    {v.standardLeadTimeDays}d
                  </span>
                </div>

                {/* Điều khoản TT */}
                <div className="px-2 py-2.5 flex items-center">
                  <span className="text-[10px]" style={{ color: '#64748b' }}>
                    {PAYMENT_TERMS_LABELS[v.defaultPaymentTerms]}
                  </span>
                </div>

                {/* Trạng thái */}
                <div className="px-2 py-2.5 flex items-center">
                  <Badge
                    label={VENDOR_STATUS_LABELS[v.status]}
                    color={statusColor}
                    pulse={isBlacklisted}
                  />
                </div>

                {/* SĐT */}
                <div className="px-2 py-2.5 flex items-center">
                  <span className="text-xs" style={{ color: '#94a3b8' }}>
                    {primaryContact?.phone ?? '--'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2 — VENDOR FORM
// ─────────────────────────────────────────────────────────────────────────
function newContact(isPrimary = false): VendorContact {
  return { id: `c${Date.now()}`, name: '', role: 'sales', phone: '', email: '', zaloId: '', isPrimary };
}

function newBank(isPrimary = false): VendorBankAccount {
  return { id: `b${Date.now()}`, bankName: '', branch: '', accountNumber: '', beneficiaryName: '', isPrimary };
}

interface FormState {
  vendorCode: string;
  legalName: string;
  tradeName: string;
  category: VendorCategory | '';
  taxId: string;
  invoiceAddress: string;
  status: VendorStatus;
  blacklistReason: string;
  rating: VendorRating;
  standardLeadTimeDays: string;
  defaultPaymentTerms: PaymentTerms;
  contacts: VendorContact[];
  bankAccounts: VendorBankAccount[];
  internalNote: string;
}

const EMPTY_FORM: FormState = {
  vendorCode: '', legalName: '', tradeName: '',
  category: '', taxId: '', invoiceAddress: '',
  status: 'active', blacklistReason: '', rating: 'B',
  standardLeadTimeDays: '',
  defaultPaymentTerms: 'net30',
  contacts: [newContact(true)],
  bankAccounts: [newBank(true)],
  internalNote: '',
};

function VendorForm({
  mode,
  vendorId,
  onSave,
  onCancel,
}: {
  mode: 'create' | 'edit';
  vendorId?: string;
  onSave: (v: Vendor) => void;
  onCancel: () => void;
}) {
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [asyncErr, setAsyncErr] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [saving, setSaving]   = useState(false);

  // Track dirty state
  useEffect(() => { setIsDirty(true); }, [form]);

  // Block browser refresh
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Preload on edit
  useEffect(() => {
    if (mode === 'edit' && vendorId) {
      const v = getVendorById(vendorId);
      if (!v) return;
      setForm({
        vendorCode: v.vendorCode,
        legalName: v.legalName,
        tradeName: v.tradeName,
        category: v.category,
        taxId: v.taxId ?? '',
        invoiceAddress: v.invoiceAddress ?? '',
        status: v.status,
        blacklistReason: v.blacklistReason ?? '',
        rating: v.rating,
        standardLeadTimeDays: String(v.standardLeadTimeDays),
        defaultPaymentTerms: v.defaultPaymentTerms,
        contacts: v.contacts.length ? v.contacts : [newContact(true)],
        bankAccounts: v.bankAccounts.length ? v.bankAccounts : [newBank(true)],
        internalNote: v.internalNote ?? '',
      });
      setIsDirty(false);
    }
  }, [mode, vendorId]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: keyof FormState, val: any) =>
    setForm(prev => ({ ...prev, [k]: val }));

  const touch = (k: string) =>
    setTouched(prev => ({ ...prev, [k]: true }));

  // Contacts CRUD
  const addContact = () =>
    setForm(prev => ({ ...prev, contacts: [...prev.contacts, newContact()] }));
  const removeContact = (id: string) =>
    setForm(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateContact = (id: string, key: keyof VendorContact, val: any) =>
    setForm(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => c.id === id ? { ...c, [key]: val } : c),
    }));

  // Bank CRUD
  const addBank = () =>
    setForm(prev => ({ ...prev, bankAccounts: [...prev.bankAccounts, newBank()] }));
  const removeBank = (id: string) =>
    setForm(prev => ({ ...prev, bankAccounts: prev.bankAccounts.filter(b => b.id !== id) }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateBank = (id: string, key: keyof VendorBankAccount, val: any) =>
    setForm(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(b => b.id === id ? { ...b, [key]: val } : b),
    }));

  // Async checks
  const onVendorCodeBlur = () => {
    touch('vendorCode');
    if (!form.vendorCode || mode === 'edit') return;
    if (!checkVendorCodeUnique(form.vendorCode, vendorId)) {
      setAsyncErr(prev => ({ ...prev, vendorCode: 'Mã NCC này đã tồn tại trong hệ thống' }));
    } else {
      setAsyncErr(prev => { const n = { ...prev }; delete n.vendorCode; return n; });
    }
  };

  const onTaxBlur = () => {
    touch('taxId');
    if (!form.taxId) return;
    const dup = checkTaxIdUnique(form.taxId, vendorId);
    if (dup) {
      setAsyncErr(prev => ({ ...prev, taxId: `MST đã dùng cho "${dup.tradeName}" (${dup.vendorCode})` }));
    } else {
      setAsyncErr(prev => { const n = { ...prev }; delete n.taxId; return n; });
    }
  };

  // Validation
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!form.tradeName.trim())
      errs.tradeName = 'Tên giao dịch là bắt buộc';

    if (!form.legalName.trim())
      errs.legalName = 'Tên pháp lý là bắt buộc';

    if (!form.category)
      errs.category = 'Vui lòng chọn phân nhóm';

    if (form.vendorCode && !VCODE_REGEX.test(form.vendorCode))
      errs.vendorCode = 'Mã không được có khoảng trắng hoặc dấu tiếng Việt';

    if (form.taxId && !TAX_REGEX.test(form.taxId))
      errs.taxId = 'MST phải là 10 số hoặc 10 số + gạch ngang + 3 số';

    if (!form.standardLeadTimeDays || isNaN(Number(form.standardLeadTimeDays)) || Number(form.standardLeadTimeDays) <= 0)
      errs.standardLeadTimeDays = 'Vui lòng nhập thời gian giao hàng hợp lệ (ngày)';

    // Contacts
    if (!form.contacts.length)
      errs.contacts = 'Phải có ít nhất 1 người liên hệ';

    form.contacts.forEach((c, i) => {
      if (!c.name.trim())
        errs[`contact_name_${i}`] = 'Tên liên hệ là bắt buộc';
      if (!c.phone)
        errs[`contact_phone_${i}`] = 'SĐT là bắt buộc';
      else if (!PHONE_REGEX.test(c.phone.replace(/\s/g, '')))
        errs[`contact_phone_${i}`] = 'SĐT không hợp lệ (10 số, đầu 03/05/07/08/09)';
      if (c.email && !EMAIL_REGEX.test(c.email))
        errs[`contact_email_${i}`] = 'Email không đúng định dạng';
    });

    // Banks
    form.bankAccounts.forEach((b, i) => {
      if (b.accountNumber && !BANK_REGEX.test(b.accountNumber))
        errs[`bank_acct_${i}`] = 'Số tài khoản chỉ được nhập số';
    });

    // Blacklist must have reason
    if (form.status === 'blacklisted' && !form.blacklistReason.trim())
      errs.blacklistReason = 'Lý do đưa vào Blacklist là bắt buộc';

    setErrors(errs);
    return Object.keys(errs).length === 0 && Object.keys(asyncErr).length === 0;
  }

  const handleSave = async () => {
    setTouched(
      [...Object.keys(form),
       ...form.contacts.flatMap((_, i) => [`contact_name_${i}`, `contact_phone_${i}`]),
       ...form.bankAccounts.flatMap((_, i) => [`bank_acct_${i}`]),
      ].reduce((a, k) => ({ ...a, [k]: true }), {})
    );
    if (!validate()) return;
    setSaving(true);

    const payload = {
      legalName: form.legalName.trim(),
      tradeName: form.tradeName.trim(),
      category: form.category as VendorCategory,
      taxId: form.taxId || undefined,
      invoiceAddress: form.invoiceAddress || undefined,
      status: form.status,
      blacklistReason: form.status === 'blacklisted' ? form.blacklistReason.trim() : undefined,
      rating: form.rating,
      standardLeadTimeDays: Number(form.standardLeadTimeDays),
      defaultPaymentTerms: form.defaultPaymentTerms,
      contacts: form.contacts,
      bankAccounts: form.bankAccounts,
      internalNote: form.internalNote || undefined,
    };

    try {
      let saved: Vendor;
      if (mode === 'create') {
        saved = createVendor(payload);
      } else {
        saved = updateVendor(vendorId!, payload)!;
      }
      setIsDirty(false);
      onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (isDirty && mode !== 'create') {
      setShowExitModal(true);
    } else {
      onCancel();
    }
  };

  const err = (k: string) =>
    (touched[k] && (errors[k] || asyncErr[k])) || undefined;

  const blacklistNeedsReason = form.status === 'blacklisted';
  const saveDisabled = blacklistNeedsReason && !form.blacklistReason.trim();

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* ── Unsaved changes modal ── */}
      {showExitModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(2,8,23,0.85)', backdropFilter: 'blur(4px)' }}
        >
          <div className="rounded-2xl p-6 w-80 space-y-4" style={{ background: '#0a1628', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#f59e0b20' }}
              >
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Có dữ liệu chưa lưu</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
                  Nếu rời đi, toàn bộ thay đổi sẽ bị mất.
                </p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setShowExitModal(false)}
                className="flex-1 py-2 rounded-xl text-sm font-bold"
                style={{ background: '#1e293b', color: '#94a3b8' }}
              >
                Ở lại
              </button>
              <button
                onClick={() => { setIsDirty(false); onCancel(); }}
                className="flex-1 py-2 rounded-xl text-sm font-black"
                style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444430' }}
              >
                Rời đi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            className="p-1.5 rounded-lg"
            style={{ background: '#1e293b', color: '#64748b' }}
          >
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-base font-black text-white">
              {mode === 'create' ? 'Thêm nhà cung cấp mới' : 'Chỉnh sửa nhà cung cấp'}
            </h1>
            <p className="text-[11px]" style={{ color: '#64748b' }}>
              {mode === 'create'
                ? 'Mã NCC sẽ tự sinh theo phân nhóm'
                : `Mã: ${getVendorById(vendorId!)?.vendorCode}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: '#1e293b', color: '#64748b' }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || saveDisabled}
            title={saveDisabled ? 'Vui lòng nhập lý do Blacklist trước khi lưu' : undefined}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all"
            style={{
              background: (saving || saveDisabled) ? '#1e293b' : '#10b98120',
              color: (saving || saveDisabled) ? '#475569' : '#10b981',
              border: `1px solid ${(saving || saveDisabled) ? '#334155' : '#10b98140'}`,
              cursor: saveDisabled ? 'not-allowed' : 'pointer',
            }}
          >
            <Check size={14} />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1" style={{ scrollbarWidth: 'thin' }}>

        {/* ── Thông tin cơ bản ── */}
        <Section title="Thông tin định danh & phân loại">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tên giao dịch (Tên lóng)" required error={err('tradeName')}>
              <input
                value={form.tradeName}
                onChange={e => set('tradeName', e.target.value)}
                onBlur={() => touch('tradeName')}
                placeholder="VD: Xưởng Cô Hai, Phụ liệu Tấn Phát"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={inputBase(!!err('tradeName'))}
              />
            </FormField>

            <FormField label="Tên pháp lý (Để xuất hóa đơn)" required error={err('legalName')}>
              <input
                value={form.legalName}
                onChange={e => set('legalName', e.target.value)}
                onBlur={() => touch('legalName')}
                placeholder="VD: Công Ty TNHH May Mặc ..."
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={inputBase(!!err('legalName'))}
              />
            </FormField>

            <FormField label="Phân nhóm NCC" required error={err('category')}>
              <select
                value={form.category}
                onChange={e => { set('category', e.target.value); touch('category'); }}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ ...selectBase, border: `1px solid ${err('category') ? '#ef4444' : '#334155'}` }}
              >
                <option value="">-- Chọn phân nhóm --</option>
                {(['fabric', 'trims', 'packaging', 'factory'] as VendorCategory[]).map(c => (
                  <option key={c} value={c}>{VENDOR_CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Mã NCC (tùy chỉnh)" error={err('vendorCode') || asyncErr.vendorCode}>
              <input
                value={form.vendorCode}
                onChange={e => set('vendorCode', e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                onBlur={onVendorCodeBlur}
                placeholder={`VD: V-F001 (tự sinh nếu để trống)`}
                disabled={mode === 'edit'}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ ...inputBase(!!err('vendorCode')), opacity: mode === 'edit' ? 0.6 : 1 }}
              />
            </FormField>

            <FormField label="Mã số thuế" error={err('taxId') || asyncErr.taxId}>
              <input
                value={form.taxId}
                onChange={e => set('taxId', e.target.value.replace(/[^0-9-]/g, ''))}
                onBlur={onTaxBlur}
                placeholder="0311234567 hoặc 0311234567-001"
                maxLength={14}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={inputBase(!!err('taxId'))}
              />
            </FormField>

            <FormField label="Địa chỉ xuất hóa đơn">
              <input
                value={form.invoiceAddress}
                onChange={e => set('invoiceAddress', e.target.value)}
                placeholder="Địa chỉ đăng ký kinh doanh"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={inputBase()}
              />
            </FormField>
          </div>
        </Section>

        {/* ── Người liên hệ ── */}
        <Section
          title={`Người liên hệ (${form.contacts.length})`}
          action={
            <button
              onClick={addContact}
              className="flex items-center gap-1 text-[10px] font-black"
              style={{ color: '#38bdf8' }}
            >
              <Plus size={10} /> Thêm liên hệ
            </button>
          }
        >
          <div className="space-y-4">
            {form.contacts.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <div style={{ borderTop: '1px solid #1e293b', marginBottom: 16 }} />}
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    label={i === 0 ? 'Tên người liên hệ chính *' : `Tên liên hệ ${i + 1}`}
                    error={err(`contact_name_${i}`)}
                  >
                    <input
                      value={c.name}
                      onChange={e => updateContact(c.id, 'name', e.target.value)}
                      onBlur={() => touch(`contact_name_${i}`)}
                      placeholder="Họ và tên"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={inputBase(!!err(`contact_name_${i}`))}
                    />
                  </FormField>

                  <FormField label="Chức vụ">
                    <select
                      value={c.role}
                      onChange={e => updateContact(c.id, 'role', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={selectBase}
                    >
                      {Object.entries(CONTACT_ROLE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Số điện thoại *" error={err(`contact_phone_${i}`)}>
                    <div className="relative">
                      <input
                        value={c.phone}
                        onChange={e => updateContact(c.id, 'phone', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => touch(`contact_phone_${i}`)}
                        placeholder="0901234567"
                        maxLength={10}
                        className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                        style={inputBase(!!err(`contact_phone_${i}`))}
                      />
                      {i > 0 && (
                        <button
                          onClick={() => removeContact(c.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                          style={{ color: '#ef4444' }}
                          title="Xóa liên hệ này"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </FormField>

                  <FormField label="Email" error={err(`contact_email_${i}`)}>
                    <input
                      value={c.email ?? ''}
                      onChange={e => updateContact(c.id, 'email', e.target.value)}
                      onBlur={() => touch(`contact_email_${i}`)}
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={inputBase(!!err(`contact_email_${i}`))}
                    />
                  </FormField>

                  <FormField label="Zalo / WeChat ID">
                    <input
                      value={c.zaloId ?? ''}
                      onChange={e => updateContact(c.id, 'zaloId', e.target.value)}
                      placeholder="SĐT Zalo hoặc WeChat ID"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={inputBase()}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Tài khoản ngân hàng ── */}
        <Section
          title={`Tài khoản ngân hàng (${form.bankAccounts.length})`}
          action={
            <button
              onClick={addBank}
              className="flex items-center gap-1 text-[10px] font-black"
              style={{ color: '#38bdf8' }}
            >
              <Plus size={10} /> Thêm tài khoản
            </button>
          }
        >
          <div className="space-y-4">
            {form.bankAccounts.map((b, i) => (
              <div key={b.id}>
                {i > 0 && <div style={{ borderTop: '1px solid #1e293b', marginBottom: 16 }} />}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Tên ngân hàng">
                    <input
                      value={b.bankName}
                      onChange={e => updateBank(b.id, 'bankName', e.target.value)}
                      placeholder="VD: Vietcombank, BIDV, Techcombank..."
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={inputBase()}
                    />
                  </FormField>

                  <FormField label="Chi nhánh">
                    <input
                      value={b.branch ?? ''}
                      onChange={e => updateBank(b.id, 'branch', e.target.value)}
                      placeholder="Chi nhánh (tùy chọn)"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                      style={inputBase()}
                    />
                  </FormField>

                  <FormField label="Số tài khoản" error={err(`bank_acct_${i}`)}>
                    <div className="relative">
                      <input
                        value={b.accountNumber}
                        onChange={e => updateBank(b.id, 'accountNumber', e.target.value.replace(/\D/g, ''))}
                        onBlur={() => touch(`bank_acct_${i}`)}
                        placeholder="Chỉ nhập số"
                        className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                        style={inputBase(!!err(`bank_acct_${i}`))}
                      />
                      {i > 0 && (
                        <button
                          onClick={() => removeBank(b.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded"
                          style={{ color: '#ef4444' }}
                          title="Xóa tài khoản này"
                        >
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </FormField>

                  <FormField label="Tên người thụ hưởng">
                    <input
                      value={b.beneficiaryName}
                      onChange={e => updateBank(b.id, 'beneficiaryName', e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A (chữ in hoa, không dấu)"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none font-bold"
                      style={inputBase()}
                    />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Vận hành & Đánh giá ── */}
        <Section title="Vận hành & Đánh giá">
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Lead-time chuẩn (ngày)" required error={err('standardLeadTimeDays')}>
              <input
                type="number"
                min={1}
                value={form.standardLeadTimeDays}
                onChange={e => set('standardLeadTimeDays', e.target.value)}
                onBlur={() => touch('standardLeadTimeDays')}
                placeholder="VD: 21"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={inputBase(!!err('standardLeadTimeDays'))}
              />
            </FormField>

            <FormField label="Điều khoản thanh toán mặc định">
              <select
                value={form.defaultPaymentTerms}
                onChange={e => set('defaultPaymentTerms', e.target.value as PaymentTerms)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={selectBase}
              >
                {Object.entries(PAYMENT_TERMS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Hạng uy tín">
              <div className="flex gap-2">
                {(['A', 'B', 'C'] as VendorRating[]).map(r => (
                  <button
                    key={r}
                    onClick={() => set('rating', r)}
                    className="flex-1 py-2 rounded-xl text-sm font-black transition-all"
                    style={{
                      background: form.rating === r ? VENDOR_RATING_COLORS[r] + '20' : '#1e293b',
                      color: form.rating === r ? VENDOR_RATING_COLORS[r] : '#475569',
                      border: `1px solid ${form.rating === r ? VENDOR_RATING_COLORS[r] + '40' : '#334155'}`,
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </FormField>

            <FormField label="Trạng thái hợp tác">
              <select
                value={form.status}
                onChange={e => { set('status', e.target.value as VendorStatus); touch('status'); }}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ ...selectBase, color: VENDOR_STATUS_COLORS[form.status] }}
              >
                {(['active', 'inactive', 'blacklisted'] as VendorStatus[]).map(s => (
                  <option key={s} value={s} style={{ color: VENDOR_STATUS_COLORS[s] }}>
                    ⚫ {VENDOR_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          {/* Blacklist reason — dynamic */}
          {form.status === 'blacklisted' && (
            <div
              className="mt-4 p-4 rounded-xl space-y-2"
              style={{ background: '#ef444410', border: '1px solid #ef444430' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BadgeAlert size={14} style={{ color: '#ef4444' }} />
                <span className="text-xs font-black" style={{ color: '#ef4444' }}>
                  Bắt buộc: Lý do đưa vào Danh sách đen
                </span>
              </div>
              <textarea
                value={form.blacklistReason}
                onChange={e => set('blacklistReason', e.target.value)}
                onBlur={() => touch('blacklistReason')}
                placeholder="VD: Giao hàng trễ 10 ngày tháng 11/2024, vải lem màu, đã thiệt hại 50 triệu. Sếp dặn không mua lại..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                style={{ background: '#1e293b', border: `1px solid ${err('blacklistReason') ? '#ef4444' : '#334155'}`, color: 'white' }}
              />
              {err('blacklistReason') && (
                <p className="text-[10px] flex items-center gap-1" style={{ color: '#ef4444' }}>
                  <AlertTriangle size={10} /> {err('blacklistReason')}
                </p>
              )}
              {saveDisabled && (
                <p className="text-[10px]" style={{ color: '#f59e0b' }}>
                  ⚠ Nút "Lưu" bị khóa cho đến khi bạn nhập lý do.
                </p>
              )}
            </div>
          )}
        </Section>

        {/* ── Ghi chú nội bộ ── */}
        <Section title="Ghi chú nội bộ">
          <textarea
            value={form.internalNote}
            onChange={e => set('internalNote', e.target.value)}
            placeholder="VD: Xưởng này hay giao trễ, sếp dặn không mua số lượng lớn. Chuyên áo sơ mi và quần tây. Capacity khoảng 5000sp/tháng..."
            rows={3}
            className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
          />
        </Section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3 — VENDOR DETAIL
// ─────────────────────────────────────────────────────────────────────────
function VendorDetail({
  vendorId, onBack, onEdit,
}: {
  vendorId: string;
  onBack: () => void;
  onEdit: (id: string) => void;
}) {
  const [tab, setTab] = useState<'info' | 'pos'>('info');
  const vendor = getVendorById(vendorId);

  if (!vendor) return null;

  const catColor    = VENDOR_CATEGORY_COLORS[vendor.category];
  const statusColor = VENDOR_STATUS_COLORS[vendor.status];
  const ratingColor = VENDOR_RATING_COLORS[vendor.rating];
  const pos         = getVendorPOs(vendorId);
  const totalPOValue = pos.filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.totalAmount, 0);
  const primaryContact = vendor.contacts.find(c => c.isPrimary) ?? vendor.contacts[0];
  const primaryBank    = vendor.bankAccounts.find(b => b.isPrimary) ?? vendor.bankAccounts[0];

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div
        className="px-6 py-3 flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg" style={{ background: '#1e293b', color: '#64748b' }}>
              <ArrowLeft size={14} />
            </button>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0"
              style={{ background: catColor + '20', color: catColor }}
            >
              {vendor.tradeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-white">{vendor.tradeName}</h1>
                <Badge label={vendor.vendorCode} color="#38bdf8" />
                <Badge label={VENDOR_CATEGORY_LABELS[vendor.category].split(' ')[0]} color={catColor} />
                <Badge
                  label={VENDOR_STATUS_LABELS[vendor.status]}
                  color={statusColor}
                  pulse={vendor.status === 'blacklisted'}
                />
              </div>
              <p className="text-[11px]" style={{ color: '#64748b' }}>{vendor.legalName}</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(vendorId)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
            style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
          >
            <Edit2 size={12} /> Sửa
          </button>
        </div>

        {/* Blacklist banner */}
        {vendor.status === 'blacklisted' && (
          <div
            className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl"
            style={{ background: '#ef444415', border: '1px solid #ef444430' }}
          >
            <BadgeAlert size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }} />
            <div>
              <p className="text-xs font-black" style={{ color: '#ef4444' }}>DANH SÁCH ĐEN — Không được đặt hàng từ NCC này</p>
              <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{vendor.blacklistReason}</p>
            </div>
          </div>
        )}

        {/* KPI bar */}
        <div className="grid grid-cols-4 gap-3 mt-3">
          <KpiCard label="Hạng uy tín" value={vendor.rating} color={ratingColor} />
          <KpiCard label="Lead-time chuẩn" value={`${vendor.standardLeadTimeDays} ngày`} color="#38bdf8" />
          <KpiCard label="Điều khoản TT" value={PAYMENT_TERMS_LABELS[vendor.defaultPaymentTerms]} color="#64748b" />
          <KpiCard label="Tổng giá trị PO" value={fmtShort(totalPOValue)} color="#10b981" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {([
            { id: 'info', label: 'Thông tin', icon: Building2 },
            { id: 'pos',  label: `Lịch sử PO${pos.length ? ` (${pos.length})` : ''}`, icon: ShoppingCart },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: tab === id ? '#1e293b' : 'transparent',
                color: tab === id ? 'white' : '#64748b',
                border: tab === id ? '1px solid #334155' : '1px solid transparent',
              }}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
        {tab === 'info' ? (
          <InfoTab vendor={vendor} primaryContact={primaryContact} primaryBank={primaryBank} />
        ) : (
          <POTab pos={pos} vendor={vendor} />
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
      <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>{label}</p>
      <p className="text-sm font-black tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function DetailRow({
  icon: Icon, label, value, copyValue, valueColor,
}: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any; label: string; value: string;
  copyValue?: string; valueColor?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 py-2"
      style={{ borderBottom: '1px solid #0f172a' }}
    >
      {Icon && <Icon size={13} style={{ color: '#475569', flexShrink: 0 }} />}
      <span className="text-xs font-bold w-44 flex-shrink-0" style={{ color: '#64748b' }}>{label}</span>
      <span className="flex-1 text-xs font-bold" style={{ color: valueColor ?? 'white' }}>
        {value || '--'}
      </span>
      {copyValue && <CopyBtn value={copyValue} />}
    </div>
  );
}

function InfoTab({
  vendor
}: {
  vendor: Vendor;
  primaryContact?: VendorContact;
  primaryBank?: VendorBankAccount;
}) {
  return (
    <>
      {/* Thông tin pháp lý */}
      <Section title="Thông tin pháp lý">
        <DetailRow icon={Tag}     label="Mã NCC"         value={vendor.vendorCode} />
        <DetailRow icon={FileText} label="Mã số thuế"    value={vendor.taxId ?? '--'} copyValue={vendor.taxId} valueColor="#38bdf8" />
        <DetailRow icon={Building2} label="Địa chỉ HĐ"   value={vendor.invoiceAddress ?? '--'} />
        <DetailRow icon={Clock}   label="Cập nhật lần cuối" value={fmtDate(vendor.updatedAt)} />
      </Section>

      {/* Tài khoản ngân hàng chính */}
      {vendor.bankAccounts.length > 0 && (
        <Section title={`Tài khoản ngân hàng (${vendor.bankAccounts.length})`}>
          {vendor.bankAccounts.map((b, i) => (
            <div key={b.id} className={i > 0 ? 'mt-3 pt-3' : ''} style={{ borderTop: i > 0 ? '1px solid #1e293b' : 'none' }}>
              <div className="flex items-center gap-2 mb-1">
                <Banknote size={12} style={{ color: b.isPrimary ? '#10b981' : '#475569' }} />
                <span className="text-[10px] font-black uppercase" style={{ color: b.isPrimary ? '#10b981' : '#475569' }}>
                  {b.isPrimary ? 'Tài khoản chính' : `Tài khoản ${i + 1}`}
                </span>
              </div>
              <DetailRow label="Ngân hàng"         value={[b.bankName, b.branch].filter(Boolean).join(' — ')} />
              <DetailRow
                label="Số tài khoản"
                value={b.accountNumber}
                copyValue={b.accountNumber}
                valueColor="#f59e0b"
              />
              <DetailRow label="Người thụ hưởng"   value={b.beneficiaryName} copyValue={b.beneficiaryName} />
            </div>
          ))}
        </Section>
      )}

      {/* Tất cả người liên hệ */}
      <Section title={`Người liên hệ (${vendor.contacts.length})`}>
        <div className="space-y-4">
          {vendor.contacts.map((c, i) => (
            <div key={c.id} className={i > 0 ? 'pt-3' : ''} style={{ borderTop: i > 0 ? '1px solid #1e293b' : 'none' }}>
              <div className="flex items-center gap-2 mb-1">
                <Users size={12} style={{ color: c.isPrimary ? '#38bdf8' : '#475569' }} />
                <span className="text-[10px] font-black uppercase" style={{ color: c.isPrimary ? '#38bdf8' : '#475569' }}>
                  {c.isPrimary ? 'Liên hệ chính — ' : ''}{CONTACT_ROLE_LABELS[c.role]}
                </span>
              </div>
              <DetailRow icon={Users}          label="Họ và tên"   value={c.name} />
              <DetailRow icon={Phone}          label="Điện thoại"  value={c.phone} copyValue={c.phone} valueColor="#38bdf8" />
              {c.email   && <DetailRow icon={Mail}           label="Email"       value={c.email} />}
              {c.zaloId  && <DetailRow icon={MessageCircle}  label="Zalo ID"     value={c.zaloId} copyValue={c.zaloId} />}
            </div>
          ))}
        </div>
      </Section>

      {/* Ghi chú nội bộ */}
      {vendor.internalNote && (
        <Section title="Ghi chú nội bộ (Chỉ nội bộ thấy)">
          <div
            className="px-3 py-2 rounded-xl text-xs"
            style={{ background: '#f59e0b10', border: '1px solid #f59e0b20', color: '#94a3b8' }}
          >
            {vendor.internalNote}
          </div>
        </Section>
      )}
    </>
  );
}

function POTab({ pos, vendor }: { pos: ReturnType<typeof getVendorPOs>; vendor: Vendor }) {
  const STATUS_MAP = {
    open:      { label: 'Đang mở',     color: '#38bdf8' },
    partial:   { label: 'Nhận một phần', color: '#f59e0b' },
    completed: { label: 'Hoàn thành',  color: '#10b981' },
    cancelled: { label: 'Đã hủy',      color: '#ef4444' },
  };

  if (pos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <ShoppingCart size={32} style={{ color: '#334155' }} />
        <p className="text-sm" style={{ color: '#475569' }}>Chưa có PO nào với nhà cung cấp này</p>
      </div>
    );
  }

  const totalValue = pos.filter(p => p.status !== 'cancelled').reduce((s, p) => s + p.totalAmount, 0);
  const onTimeCount = pos.filter(p => p.actualLeadTimeDays !== undefined && p.actualLeadTimeDays <= vendor.standardLeadTimeDays).length;
  const completedCount = pos.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Tổng giá trị PO" value={fmt(totalValue)} color="#10b981" />
        <KpiCard label="Tổng số PO" value={`${pos.length} đơn`} color="#38bdf8" />
        <KpiCard
          label="Giao đúng hạn"
          value={completedCount > 0 ? `${Math.round((onTimeCount / completedCount) * 100)}%` : '--'}
          color={onTimeCount / Math.max(completedCount, 1) >= 0.8 ? '#10b981' : '#f59e0b'}
        />
      </div>

      {/* PO list */}
      {pos.map(po => {
        const s = STATUS_MAP[po.status];
        const isLate = po.actualLeadTimeDays !== undefined && po.actualLeadTimeDays > vendor.standardLeadTimeDays;
        const daysDiff = po.actualLeadTimeDays !== undefined
          ? po.actualLeadTimeDays - vendor.standardLeadTimeDays
          : null;

        return (
          <div
            key={po.id}
            className="rounded-xl p-4"
            style={{
              background: '#0f172a',
              border: `1px solid ${isLate ? '#ef444430' : '#1e293b'}`,
              borderLeft: isLate ? '3px solid #ef4444' : '3px solid transparent',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black" style={{ color: '#38bdf8' }}>{po.poCode}</span>
                <Badge label={s.label} color={s.color} />
                {isLate && <Badge label={`Trễ ${daysDiff}d`} color="#ef4444" pulse />}
              </div>
              <div className="text-right">
                <p className="text-sm font-black tabular-nums" style={{ color: '#10b981' }}>{fmt(po.totalAmount)}</p>
                <p className="text-[10px]" style={{ color: '#475569' }}>{fmtDate(po.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px]" style={{ color: '#64748b' }}>
              <span>{po.itemCount} mặt hàng</span>
              {po.actualLeadTimeDays !== undefined && (
                <span className={isLate ? '' : ''} style={{ color: isLate ? '#ef4444' : '#10b981' }}>
                  Thực tế: {po.actualLeadTimeDays}d / Chuẩn: {vendor.standardLeadTimeDays}d
                </span>
              )}
              {po.status === 'open' || po.status === 'partial' ? (
                <span style={{ color: '#f59e0b' }}>Đang chờ nhận hàng</span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────
type View =
  | { type: 'list' }
  | { type: 'detail'; id: string }
  | { type: 'form'; mode: 'create' | 'edit'; id?: string };

export default function NhaCungCapPage() {
  const [view, setView] = useState<View>({ type: 'list' });

  const handleSave = (v: Vendor) => setView({ type: 'detail', id: v.id });

  return (
    <div className="h-full flex flex-col" style={{ background: '#020817', color: 'white' }}>
      {view.type === 'list' && (
        <VendorList
          onSelect={id => setView({ type: 'detail', id })}
          onCreateNew={() => setView({ type: 'form', mode: 'create' })}
        />
      )}
      {view.type === 'detail' && (
        <VendorDetail
          vendorId={view.id}
          onBack={() => setView({ type: 'list' })}
          onEdit={id => setView({ type: 'form', mode: 'edit', id })}
        />
      )}
      {view.type === 'form' && (
        <VendorForm
          mode={view.mode}
          vendorId={view.id}
          onSave={handleSave}
          onCancel={() =>
            view.id
              ? setView({ type: 'detail', id: view.id })
              : setView({ type: 'list' })
          }
        />
      )}
    </div>
  );
}