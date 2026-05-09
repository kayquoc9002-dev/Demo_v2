// // KhachHangPage.tsx
// import { useState, useEffect, useCallback, useRef } from 'react';
// import {
//   Search, Plus, Filter, X, ChevronDown, ChevronRight,
//   Phone, Building2, User, Edit2, Trash2, ArrowLeft,
//   ShoppingBag, CreditCard, Star, AlertTriangle, Check,
//   GitMerge, FileText, Package, TrendingUp, Eye,
//   CalendarDays, MapPin, Mail, Copy, Cake,
// } from 'lucide-react';

// import type {
//   Customer, RetailCustomer, WholesaleCustomer,
//   WholesaleTier, Gender, PaymentTerm, CustomerSource,
//   MemberTier, ValidationError,
// } from './customerTypes';

// import {
//   WHOLESALE_CREDIT_LIMITS, WHOLESALE_TIER_LABELS,
//   MEMBER_TIER_LABELS, PAYMENT_TERM_LABELS, SOURCE_OPTIONS,
//   computeMemberTier, getDebtStatus,
// } from './customerTypes';

// import { VN_PROVINCES, VN_DISTRICTS, VN_WARDS } from './customerMockData';

// import {
//   getAllCustomers, getCustomerById, createCustomer, updateCustomer,
//   deleteCustomer, checkPhoneDuplicate, checkTaxIdDuplicate,
//   getCustomerOrders, getCustomerPayments, filterCustomers,
//   type CustomerFilter,
// } from './customerService';

// // ── Helpers ───────────────────────────────────────────────────────────────
// const fmt = (n: number) =>
//   n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

// const fmtNumber = (n: number) =>
//   n.toLocaleString('vi-VN');

// const fmtShort = (n: number) => {
//   if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
//   if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)}M`;
//   if (n >= 1_000)         return `${(n / 1_000).toFixed(0)}K`;
//   return String(n);
// };

// const fmtDate = (d: string) =>
//   new Date(d).toLocaleDateString('vi-VN');

// function titleCase(s: string): string {
//   return s
//     .toLowerCase()
//     .split(' ')
//     .map(w => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(' ');
// }

// function cleanPhone(v: string): string {
//   return v.replace(/[\s.]/g, '');
// }

// const VN_PHONE_REGEX = /^(0[3|5|7|8|9])\d{8}$/;
// const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const TAX_REGEX      = /^\d{10}(-\d{3})?$/;

// // ── Color utils ───────────────────────────────────────────────────────────
// const MEMBER_COLORS: Record<MemberTier, string> = {
//   new:     '#64748b',
//   silver:  '#94a3b8',
//   gold:    '#f59e0b',
//   diamond: '#38bdf8',
// };

// const DEBT_STATUS_COLOR = {
//   safe:    '#10b981',
//   warning: '#f59e0b',
//   danger:  '#ef4444',
// };

// const TYPE_COLOR = { retail: '#a78bfa', wholesale: '#c17f44' };

// // ── Shared small components ───────────────────────────────────────────────
// function Badge({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
//   return (
//     <span
//       className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${pulse ? 'animate-pulse' : ''}`}
//       style={{ background: color + '20', color, border: `1px solid ${color}30` }}
//     >
//       {label}
//     </span>
//   );
// }

// function DebtBar({ debt, limit }: { debt: number; limit: number }) {
//   const pct = limit > 0 ? Math.min((debt / limit) * 100, 100) : 0;
//   const status = getDebtStatus(debt, limit);
//   const color = DEBT_STATUS_COLOR[status];
//   return (
//     <div className="flex items-center gap-2">
//       <div className="flex-1 h-1.5 rounded-full" style={{ background: '#1e293b' }}>
//         <div
//           className="h-1.5 rounded-full transition-all"
//           style={{ width: `${pct}%`, background: color }}
//         />
//       </div>
//       <span className="text-[10px] font-black tabular-nums" style={{ color }}>
//         {pct.toFixed(0)}%
//       </span>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────
// // SECTION 1 — CUSTOMER LIST
// // ─────────────────────────────────────────────────────────────────────────
// function CustomerList({
//   onSelect,
//   onCreateNew,
// }: {
//   onSelect: (id: string) => void;
//   onCreateNew: () => void;
// }) {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [filters, setFilters] = useState<CustomerFilter>({ type: 'all' });
//   const [showFilters, setShowFilters] = useState(false);
//   const [currentRole] = useState<'sale' | 'manager'>('sale');

//   useEffect(() => {
//     setCustomers(filterCustomers(filters));
//   }, [filters]);

//   const setFilter = (key: keyof CustomerFilter, val: any) =>
//     setFilters(prev => ({ ...prev, [key]: val }));

//   const clearFilters = () => setFilters({ type: 'all' });
//   const activeFilterCount = Object.entries(filters).filter(
//     ([k, v]) => k !== 'type' && v !== undefined && v !== 'all' && v !== ''
//   ).length;

//   return (
//     <div className="flex flex-col h-full" style={{ background: '#020817' }}>
//       {/* ── Header ── */}
//       <div
//         className="px-6 py-3 flex items-center justify-between flex-shrink-0"
//         style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
//       >
//         <div>
//           <h1 className="text-base font-black text-white">Quản lý Khách hàng</h1>
//           <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
//             {customers.length} khách hàng
//           </p>
//         </div>
//         <button
//           onClick={onCreateNew}
//           className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all"
//           style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}
//         >
//           <Plus size={14} />
//           Thêm khách hàng
//         </button>
//       </div>

//       {/* ── Search + Filter bar ── */}
//       <div
//         className="px-6 py-3 flex items-center gap-3 flex-shrink-0"
//         style={{ borderBottom: '1px solid #1e293b' }}
//       >
//         {/* Search */}
//         <div className="relative flex-1 max-w-sm">
//           <Search
//             size={13}
//             className="absolute left-3 top-1/2 -translate-y-1/2"
//             style={{ color: '#64748b' }}
//           />
//           <input
//             type="text"
//             placeholder="Tìm tên, SĐT, mã KH..."
//             value={filters.search ?? ''}
//             onChange={e => setFilter('search', e.target.value)}
//             className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
//             style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//           />
//         </div>

//         {/* Type tabs */}
//         <div
//           className="flex rounded-xl overflow-hidden"
//           style={{ border: '1px solid #334155' }}
//         >
//           {(['all', 'wholesale', 'retail'] as const).map(t => (
//             <button
//               key={t}
//               onClick={() => setFilter('type', t)}
//               className="px-3 py-1.5 text-xs font-bold transition-all"
//               style={{
//                 background: filters.type === t ? '#1e293b' : 'transparent',
//                 color: filters.type === t ? 'white' : '#64748b',
//               }}
//             >
//               {t === 'all' ? 'Tất cả' : t === 'wholesale' ? 'Khách sỉ' : 'Khách lẻ'}
//             </button>
//           ))}
//         </div>

//         {/* Filter toggle */}
//         <button
//           onClick={() => setShowFilters(!showFilters)}
//           className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
//           style={{
//             background: showFilters ? '#1e293b' : 'transparent',
//             border: '1px solid #334155',
//             color: '#94a3b8',
//           }}
//         >
//           <Filter size={12} />
//           Bộ lọc
//           {activeFilterCount > 0 && (
//             <span
//               className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black"
//               style={{ background: '#38bdf8', color: '#020817' }}
//             >
//               {activeFilterCount}
//             </span>
//           )}
//         </button>
//         {activeFilterCount > 0 && (
//           <button
//             onClick={clearFilters}
//             className="flex items-center gap-1 text-xs"
//             style={{ color: '#64748b' }}
//           >
//             <X size={11} /> Xóa lọc
//           </button>
//         )}
//       </div>

//       {/* ── Filter panel ── */}
//       {showFilters && (
//         <div
//           className="px-6 py-3 flex items-center gap-4 flex-wrap flex-shrink-0"
//           style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
//         >
//           {/* Wholesale tier */}
//           <div className="flex items-center gap-2">
//             <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Cấp sỉ</span>
//             <select
//               value={filters.wholesaleTier ?? ''}
//               onChange={e => setFilter('wholesaleTier', e.target.value || undefined)}
//               className="px-2 py-1.5 rounded-lg text-xs outline-none"
//               style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//             >
//               <option value="">Tất cả</option>
//               {(['tier1', 'tier2', 'tier3'] as WholesaleTier[]).map(t => (
//                 <option key={t} value={t}>{WHOLESALE_TIER_LABELS[t]}</option>
//               ))}
//             </select>
//           </div>

//           {/* Member tier */}
//           <div className="flex items-center gap-2">
//             <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Hạng thẻ</span>
//             <select
//               value={filters.memberTier ?? ''}
//               onChange={e => setFilter('memberTier', e.target.value || undefined)}
//               className="px-2 py-1.5 rounded-lg text-xs outline-none"
//               style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//             >
//               <option value="">Tất cả</option>
//               {(['new', 'silver', 'gold', 'diamond'] as MemberTier[]).map(t => (
//                 <option key={t} value={t}>{MEMBER_TIER_LABELS[t]}</option>
//               ))}
//             </select>
//           </div>

//           {/* Birthday month */}
//           <div className="flex items-center gap-2">
//             <Cake size={12} style={{ color: '#a78bfa' }} />
//             <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Sinh nhật tháng</span>
//             <select
//               value={filters.birthdayMonth ?? ''}
//               onChange={e => setFilter('birthdayMonth', e.target.value ? Number(e.target.value) : undefined)}
//               className="px-2 py-1.5 rounded-lg text-xs outline-none"
//               style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//             >
//               <option value="">--</option>
//               {Array.from({ length: 12 }, (_, i) => (
//                 <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
//               ))}
//             </select>
//           </div>

//           {/* Debt status */}
//           <div className="flex items-center gap-2">
//             <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Công nợ</span>
//             <select
//               value={filters.debtStatus ?? 'all'}
//               onChange={e => setFilter('debtStatus', e.target.value)}
//               className="px-2 py-1.5 rounded-lg text-xs outline-none"
//               style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//             >
//               <option value="all">Tất cả</option>
//               <option value="safe">An toàn</option>
//               <option value="warning">Cảnh báo</option>
//               <option value="danger">Nợ xấu</option>
//             </select>
//           </div>
//         </div>
//       )}

//       {/* ── Table header ── */}
//       <div
//         className="grid flex-shrink-0 px-4"
//         style={{
//           gridTemplateColumns: '140px 1fr 110px 100px 160px 130px 80px',
//           background: '#020817',
//           borderBottom: '1px solid #1e293b',
//           position: 'sticky', top: 0, zIndex: 10,
//         }}
//       >
//         {['MÃ KH', 'KHÁCH HÀNG', 'SĐT', 'LOẠI', 'CÔNG NỢ / CHI TIÊU', 'HẠNG THẺ', 'NGUỒN'].map(h => (
//           <div key={h} className="px-2 py-2.5 text-[9px] font-black uppercase" style={{ color: '#334155' }}>
//             {h}
//           </div>
//         ))}
//       </div>

//       {/* ── Table rows ── */}
//       <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
//         {customers.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-40 gap-2">
//             <User size={32} style={{ color: '#334155' }} />
//             <p className="text-sm" style={{ color: '#475569' }}>Không tìm thấy khách hàng</p>
//           </div>
//         ) : (
//           customers.map((c, i) => {
//             const isWholesale = c.customerType === 'wholesale';
//             const wc = c as WholesaleCustomer;
//             const debtStatus = isWholesale ? getDebtStatus(wc.currentDebt, wc.creditLimit) : 'safe';
//             const debtRatio = isWholesale && wc.creditLimit > 0 ? wc.currentDebt / wc.creditLimit : 0;
//             const leftBorderColor = debtStatus === 'danger' ? '#ef4444' : debtStatus === 'warning' ? '#f59e0b' : 'transparent';

//             return (
//               <div
//                 key={c.id}
//                 onClick={() => onSelect(c.id)}
//                 className="grid px-4 cursor-pointer transition-all"
//                 style={{
//                   gridTemplateColumns: '140px 1fr 110px 100px 160px 130px 80px',
//                   borderBottom: '1px solid #0f172a',
//                   background: i % 2 === 1 ? '#0f172a40' : 'transparent',
//                   borderLeft: `3px solid ${leftBorderColor}`,
//                 }}
//                 onMouseEnter={e => (e.currentTarget.style.background = '#1e293b30')}
//                 onMouseLeave={e => (e.currentTarget.style.background = i % 2 === 1 ? '#0f172a40' : 'transparent')}
//               >
//                 {/* Mã KH */}
//                 <div className="px-2 py-2.5 flex items-center">
//                   <span className="text-xs font-black" style={{ color: '#38bdf8' }}>
//                     {c.customerCode}
//                   </span>
//                 </div>

//                 {/* Tên */}
//                 <div className="px-2 py-2.5 flex items-center gap-2 min-w-0">
//                   <div
//                     className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black"
//                     style={{
//                       background: isWholesale ? '#c17f4420' : '#a78bfa20',
//                       color: isWholesale ? '#c17f44' : '#a78bfa',
//                     }}
//                   >
//                     {c.fullName.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="min-w-0">
//                     <p className="text-xs font-bold text-white truncate">{c.fullName}</p>
//                     {isWholesale && (
//                       <p className="text-[10px] truncate" style={{ color: '#64748b' }}>
//                         {wc.companyName}
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 {/* SĐT */}
//                 <div className="px-2 py-2.5 flex items-center">
//                   <span className="text-xs font-bold" style={{ color: '#94a3b8' }}>
//                     {c.phoneNumber}
//                   </span>
//                 </div>

//                 {/* Loại */}
//                 <div className="px-2 py-2.5 flex items-center">
//                   <Badge
//                     label={isWholesale ? 'Sỉ' : 'Lẻ'}
//                     color={isWholesale ? TYPE_COLOR.wholesale : TYPE_COLOR.retail}
//                   />
//                 </div>

//                 {/* Công nợ / chi tiêu */}
//                 <div className="px-2 py-2.5 flex flex-col justify-center gap-1">
//                   {isWholesale ? (
//                     <>
//                       <div className="flex items-center justify-between">
//                         <span className="text-[10px]" style={{ color: '#64748b' }}>Nợ</span>
//                         <span
//                           className="text-xs font-black tabular-nums"
//                           style={{ color: DEBT_STATUS_COLOR[debtStatus] }}
//                         >
//                           {fmtShort(wc.currentDebt)}
//                         </span>
//                       </div>
//                       <DebtBar debt={wc.currentDebt} limit={wc.creditLimit} />
//                     </>
//                   ) : (
//                     <div className="flex items-center gap-1">
//                       <TrendingUp size={10} style={{ color: '#10b981' }} />
//                       <span className="text-xs font-black tabular-nums" style={{ color: '#10b981' }}>
//                         {fmtShort((c as RetailCustomer).totalSpent)}
//                       </span>
//                     </div>
//                   )}
//                 </div>

//                 {/* Hạng thẻ */}
//                 <div className="px-2 py-2.5 flex items-center">
//                   <Badge
//                     label={MEMBER_TIER_LABELS[(c as any).memberTier]}
//                     color={MEMBER_COLORS[(c as any).memberTier]}
//                   />
//                 </div>

//                 {/* Nguồn */}
//                 <div className="px-2 py-2.5 flex items-center">
//                   <span className="text-[10px]" style={{ color: '#475569' }}>{c.source}</span>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────
// // SECTION 2 — CUSTOMER FORM
// // ─────────────────────────────────────────────────────────────────────────
// type FormMode = 'create' | 'edit';

// interface FormState {
//   customerType: 'retail' | 'wholesale';
//   fullName: string;
//   phoneNumber: string;
//   email: string;
//   province: string;
//   provinceId: string;
//   district: string;
//   districtId: string;
//   ward: string;
//   wardId: string;
//   addressDetail: string;
//   source: CustomerSource;
//   notes: string;
//   // Retail
//   dob: string;
//   gender: Gender | '';
//   // Wholesale
//   taxId: string;
//   companyName: string;
//   contactPersonName: string;
//   contactPersonPhone: string;
//   wholesaleTier: WholesaleTier | '';
//   creditLimit: number;
//   paymentTerm: PaymentTerm;
// }

// const EMPTY_FORM: FormState = {
//   customerType: 'retail',
//   fullName: '', phoneNumber: '', email: '',
//   province: '', provinceId: '', district: '', districtId: '', ward: '', wardId: '',
//   addressDetail: '', source: 'POS', notes: '',
//   dob: '', gender: '',
//   taxId: '', companyName: '', contactPersonName: '', contactPersonPhone: '',
//   wholesaleTier: '', creditLimit: 0, paymentTerm: 'cod',
// };

// function CustomerForm({
//   mode,
//   customerId,
//   onSave,
//   onCancel,
//   role = 'sale',
// }: {
//   mode: FormMode;
//   customerId?: string;
//   onSave: (c: Customer) => void;
//   onCancel: () => void;
//   role?: 'sale' | 'manager';
// }) {
//   const [form, setForm] = useState<FormState>(EMPTY_FORM);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [asyncErrors, setAsyncErrors] = useState<Record<string, string>>({});
//   const [touched, setTouched] = useState<Record<string, boolean>>({});
//   const [saving, setSaving] = useState(false);

//   // Preload on edit
//   useEffect(() => {
//     if (mode === 'edit' && customerId) {
//       const c = getCustomerById(customerId);
//       if (!c) return;
//       const wc = c as WholesaleCustomer;
//       const rc = c as RetailCustomer;
//       setForm({
//         customerType: c.customerType,
//         fullName: c.fullName,
//         phoneNumber: c.phoneNumber,
//         email: c.email ?? '',
//         province: c.province, provinceId: c.provinceId,
//         district: c.district, districtId: c.districtId,
//         ward: c.ward, wardId: c.wardId,
//         addressDetail: c.addressDetail,
//         source: c.source,
//         notes: c.notes ?? '',
//         dob: rc.dob ?? '',
//         gender: rc.gender ?? '',
//         taxId: wc.taxId ?? '',
//         companyName: wc.companyName ?? '',
//         contactPersonName: wc.contactPersonName ?? '',
//         contactPersonPhone: wc.contactPersonPhone ?? '',
//         wholesaleTier: wc.wholesaleTier ?? '',
//         creditLimit: wc.creditLimit ?? 0,
//         paymentTerm: wc.paymentTerm ?? 'cod',
//       });
//     }
//   }, [mode, customerId]);

//   const districts = VN_DISTRICTS[form.provinceId] ?? [];
//   const wards     = VN_WARDS[form.districtId] ?? [];

//   const set = (key: keyof FormState, val: any) =>
//     setForm(prev => ({ ...prev, [key]: val }));

//   const touch = (key: string) =>
//     setTouched(prev => ({ ...prev, [key]: true }));

//   // Address cascade reset
//   const onProvinceChange = (provinceId: string) => {
//     const prov = VN_PROVINCES.find(p => p.id === provinceId);
//     setForm(prev => ({
//       ...prev,
//       provinceId,
//       province: prov?.name ?? '',
//       districtId: '', district: '',
//       wardId: '', ward: '',
//     }));
//   };

//   const onDistrictChange = (districtId: string) => {
//     const dist = (VN_DISTRICTS[form.provinceId] ?? []).find(d => d.id === districtId);
//     setForm(prev => ({
//       ...prev,
//       districtId,
//       district: dist?.name ?? '',
//       wardId: '', ward: '',
//     }));
//   };

//   const onWardChange = (wardId: string) => {
//     const w = (VN_WARDS[form.districtId] ?? []).find(w => w.id === wardId);
//     setForm(prev => ({ ...prev, wardId, ward: w?.name ?? '' }));
//   };

//   // Wholesale tier → credit limit
//   const onTierChange = (tier: WholesaleTier | '') => {
//     setForm(prev => ({
//       ...prev,
//       wholesaleTier: tier,
//       creditLimit: tier ? WHOLESALE_CREDIT_LIMITS[tier] : 0,
//     }));
//   };

//   // Phone auto-trim on blur + async duplicate check
//   const onPhoneBlur = async () => {
//     touch('phoneNumber');
//     const cleaned = cleanPhone(form.phoneNumber);
//     setForm(prev => ({ ...prev, phoneNumber: cleaned }));

//     if (cleaned.length === 10) {
//       const dup = checkPhoneDuplicate(cleaned, customerId);
//       if (dup) {
//         setAsyncErrors(prev => ({
//           ...prev,
//           phoneNumber: `Số điện thoại này đã được đăng ký cho KH "${dup.fullName}" (${dup.customerCode})`,
//         }));
//       } else {
//         setAsyncErrors(prev => { const n = { ...prev }; delete n.phoneNumber; return n; });
//       }
//     }
//   };

//   const onTaxBlur = async () => {
//     touch('taxId');
//     if (form.taxId && form.taxId.length >= 10) {
//       const dup = checkTaxIdDuplicate(form.taxId, customerId);
//       if (dup) {
//         setAsyncErrors(prev => ({
//           ...prev,
//           taxId: `MST này đã được đăng ký cho KH "${dup.fullName}" (${dup.customerCode})`,
//         }));
//       } else {
//         setAsyncErrors(prev => { const n = { ...prev }; delete n.taxId; return n; });
//       }
//     }
//   };

//   // Inline validation
//   function validate(): boolean {
//     const errs: Record<string, string> = {};

//     if (!form.fullName.trim() || form.fullName.trim().length < 2)
//       errs.fullName = 'Tên phải có ít nhất 2 ký tự';

//     const cleaned = cleanPhone(form.phoneNumber);
//     if (!cleaned)
//       errs.phoneNumber = 'SĐT là bắt buộc';
//     else if (!/^\d+$/.test(cleaned))
//       errs.phoneNumber = 'SĐT chỉ được chứa số';
//     else if (cleaned.length !== 10)
//       errs.phoneNumber = 'SĐT phải có đúng 10 số';
//     else if (!VN_PHONE_REGEX.test(cleaned))
//       errs.phoneNumber = 'Đầu số không hợp lệ (03/05/07/08/09)';

//     if (form.email && !EMAIL_REGEX.test(form.email))
//       errs.email = 'Email không đúng định dạng';

//     if (!form.provinceId) errs.province = 'Vui lòng chọn Tỉnh/Thành phố';
//     if (!form.districtId) errs.district = 'Vui lòng chọn Quận/Huyện';
//     if (!form.wardId)     errs.ward     = 'Vui lòng chọn Phường/Xã';

//     if (!form.addressDetail || form.addressDetail.trim().length < 5)
//       errs.addressDetail = 'Địa chỉ chi tiết phải có ít nhất 5 ký tự';

//     // Wholesale specific
//     if (form.customerType === 'wholesale') {
//       if (!form.companyName.trim())
//         errs.companyName = 'Tên pháp nhân là bắt buộc';
//       if (form.taxId && !TAX_REGEX.test(form.taxId))
//         errs.taxId = 'MST phải là 10 số hoặc 10 số + gạch ngang + 3 số (VD: 0101234567-001)';
//       if (!form.wholesaleTier)
//         errs.wholesaleTier = 'Vui lòng chọn cấp độ khách sỉ';
//     }

//     // Retail specific
//     if (form.customerType === 'retail' && form.dob) {
//       const dobDate = new Date(form.dob);
//       const today   = new Date();
//       if (dobDate > today) errs.dob = 'Ngày sinh không được ở tương lai';
//       const age = today.getFullYear() - dobDate.getFullYear();
//       if (age < 10) errs.dob = 'Tuổi khách hàng phải ít nhất 10 tuổi';
//       if (dobDate.getFullYear() < 1930) errs.dob = 'Năm sinh không hợp lệ';
//     }

//     setErrors(errs);
//     return Object.keys(errs).length === 0 && Object.keys(asyncErrors).length === 0;
//   }

//   const handleSave = async () => {
//     setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
//     if (!validate()) return;
//     setSaving(true);

//     const cleaned = cleanPhone(form.phoneNumber);

//     const base = {
//       customerType: form.customerType,
//       fullName: titleCase(form.fullName.trim()),
//       phoneNumber: cleaned,
//       email: form.email || undefined,
//       province: form.province,
//       provinceId: form.provinceId,
//       district: form.district,
//       districtId: form.districtId,
//       ward: form.ward,
//       wardId: form.wardId,
//       addressDetail: form.addressDetail.trim(),
//       source: form.source,
//       notes: form.notes || undefined,
//       isActive: true,
//     };

//     try {
//       let saved: Customer;

//       if (form.customerType === 'retail') {
//         const payload = {
//           ...base,
//           customerType: 'retail' as const,
//           dob: form.dob || undefined,
//           gender: (form.gender || undefined) as Gender | undefined,
//           currentPoints: 0,
//           totalAccumulatedPoints: 0,
//           memberTier: 'new' as const,
//           totalSpent: 0,
//         };
//         saved = mode === 'create'
//           ? createCustomer(payload)
//           : updateCustomer(customerId!, payload)!;
//       } else {
//         const payload = {
//           ...base,
//           customerType: 'wholesale' as const,
//           taxId: form.taxId || undefined,
//           companyName: form.companyName.trim(),
//           contactPersonName: form.contactPersonName || undefined,
//           contactPersonPhone: form.contactPersonPhone || undefined,
//           wholesaleTier: form.wholesaleTier as WholesaleTier,
//           creditLimit: form.creditLimit,
//           currentDebt: 0,
//           paymentTerm: form.paymentTerm,
//           currentPoints: 0,
//           totalAccumulatedPoints: 0,
//           memberTier: 'new' as const,
//           totalSpent: 0,
//         };
//         saved = mode === 'create'
//           ? createCustomer(payload)
//           : updateCustomer(customerId!, payload)!;
//       }

//       onSave(saved);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const err = (field: string) =>
//     (touched[field] && (errors[field] || asyncErrors[field])) || undefined;

//   const inputStyle = (field: string) => ({
//     background: '#1e293b',
//     border: `1px solid ${err(field) ? '#ef4444' : '#334155'}`,
//     color: 'white',
//   });

//   const isManager = role === 'manager';

//   return (
//     <div
//       className="flex flex-col h-full overflow-y-auto"
//       style={{ background: '#020817', scrollbarWidth: 'thin' }}
//     >
//       {/* ── Header ── */}
//       <div
//         className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
//         style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
//       >
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onCancel}
//             className="p-1.5 rounded-lg transition-all"
//             style={{ background: '#1e293b', color: '#64748b' }}
//           >
//             <ArrowLeft size={14} />
//           </button>
//           <div>
//             <h1 className="text-base font-black text-white">
//               {mode === 'create' ? 'Thêm khách hàng mới' : 'Chỉnh sửa khách hàng'}
//             </h1>
//             <p className="text-[11px]" style={{ color: '#64748b' }}>
//               {mode === 'create' ? 'Mã KH sẽ được tự động tạo' : `Mã: ${getCustomerById(customerId!)?.customerCode}`}
//             </p>
//           </div>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={onCancel}
//             className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
//             style={{ background: '#1e293b', color: '#64748b' }}
//           >
//             Hủy
//           </button>
//           <button
//             onClick={handleSave}
//             disabled={saving}
//             className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black transition-all"
//             style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}
//           >
//             <Check size={14} />
//             {saving ? 'Đang lưu...' : 'Lưu'}
//           </button>
//         </div>
//       </div>

//       <div className="px-6 py-5 space-y-5">
//         {/* ── Loại KH ── */}
//         <Section title="Loại khách hàng">
//           <div className="flex gap-3">
//             {(['retail', 'wholesale'] as const).map(t => (
//               <button
//                 key={t}
//                 onClick={() => {
//                   set('customerType', t);
//                   setErrors({});
//                 }}
//                 className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
//                 style={{
//                   background: form.customerType === t
//                     ? (t === 'wholesale' ? '#c17f4420' : '#a78bfa20')
//                     : '#1e293b',
//                   border: `1px solid ${form.customerType === t
//                     ? (t === 'wholesale' ? '#c17f4440' : '#a78bfa40')
//                     : '#334155'}`,
//                   color: form.customerType === t
//                     ? (t === 'wholesale' ? '#c17f44' : '#a78bfa')
//                     : '#64748b',
//                 }}
//               >
//                 {t === 'wholesale' ? <Building2 size={16} /> : <User size={16} />}
//                 <div className="text-left">
//                   <p className="text-sm font-black">{t === 'wholesale' ? 'Khách Sỉ (B2B)' : 'Khách Lẻ (B2C)'}</p>
//                   <p className="text-[10px]" style={{ opacity: 0.7 }}>
//                     {t === 'wholesale' ? 'Đại lý, cửa hàng phân phối' : 'Khách mua lẻ tại cửa hàng'}
//                   </p>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </Section>

//         {/* ── Thông tin cơ bản ── */}
//         <Section title="Thông tin cơ bản">
//           <div className="grid grid-cols-2 gap-4">
//             {/* Tên */}
//             <FormField
//               label={form.customerType === 'wholesale' ? 'Tên cửa hàng / Thương hiệu *' : 'Họ và tên *'}
//               error={err('fullName')}
//             >
//               <input
//                 value={form.fullName}
//                 onChange={e => set('fullName', e.target.value)}
//                 onBlur={() => touch('fullName')}
//                 placeholder="VD: Nguyễn Thị Lan"
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={inputStyle('fullName')}
//               />
//             </FormField>

//             {/* SĐT */}
//             <FormField label="Số điện thoại *" error={err('phoneNumber')}>
//               <input
//                 value={form.phoneNumber}
//                 onChange={e => set('phoneNumber', e.target.value)}
//                 onBlur={onPhoneBlur}
//                 placeholder="0901234567"
//                 maxLength={12}
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={inputStyle('phoneNumber')}
//               />
//             </FormField>

//             {/* Email */}
//             <FormField label="Email" error={err('email')}>
//               <input
//                 value={form.email}
//                 onChange={e => set('email', e.target.value)}
//                 onBlur={() => touch('email')}
//                 placeholder="example@gmail.com"
//                 type="email"
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={inputStyle('email')}
//               />
//             </FormField>

//             {/* Nguồn đến */}
//             <FormField label="Kênh đến">
//               <select
//                 value={form.source}
//                 onChange={e => set('source', e.target.value as CustomerSource)}
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//               >
//                 {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
//               </select>
//             </FormField>

//             {/* Retail: DOB + Gender */}
//             {form.customerType === 'retail' && (
//               <>
//                 <FormField label="Ngày sinh" error={err('dob')}>
//                   <input
//                     type="date"
//                     value={form.dob}
//                     onChange={e => set('dob', e.target.value)}
//                     onBlur={() => touch('dob')}
//                     max={new Date().toISOString().split('T')[0]}
//                     className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                     style={inputStyle('dob')}
//                   />
//                 </FormField>

//                 <FormField label="Giới tính">
//                   <select
//                     value={form.gender}
//                     onChange={e => set('gender', e.target.value as Gender | '')}
//                     className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                     style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//                   >
//                     <option value="">-- Chọn --</option>
//                     <option value="male">Nam</option>
//                     <option value="female">Nữ</option>
//                     <option value="other">Khác</option>
//                   </select>
//                 </FormField>
//               </>
//             )}
//           </div>
//         </Section>

//         {/* ── Khách sỉ: Công ty ── */}
//         {form.customerType === 'wholesale' && (
//           <Section title="Thông tin công ty / pháp nhân">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Tên pháp nhân / Công ty *" error={err('companyName')}>
//                 <input
//                   value={form.companyName}
//                   onChange={e => set('companyName', e.target.value)}
//                   onBlur={() => touch('companyName')}
//                   placeholder="Cty TNHH TM&DV ..."
//                   className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                   style={inputStyle('companyName')}
//                 />
//               </FormField>

//               <FormField label="Mã số thuế" error={err('taxId')}>
//                 <input
//                   value={form.taxId}
//                   onChange={e => set('taxId', e.target.value.replace(/[^0-9-]/g, ''))}
//                   onBlur={onTaxBlur}
//                   placeholder="0101234567 hoặc 0101234567-001"
//                   maxLength={14}
//                   className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                   style={inputStyle('taxId')}
//                 />
//               </FormField>

//               <FormField label="Người liên hệ">
//                 <input
//                   value={form.contactPersonName}
//                   onChange={e => set('contactPersonName', e.target.value)}
//                   placeholder="Tên người trực tiếp lấy hàng"
//                   className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                   style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//                 />
//               </FormField>

//               <FormField label="SĐT người liên hệ">
//                 <input
//                   value={form.contactPersonPhone}
//                   onChange={e => set('contactPersonPhone', e.target.value.replace(/\D/g, ''))}
//                   placeholder="0901234567"
//                   maxLength={10}
//                   className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                   style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//                 />
//               </FormField>
//             </div>
//           </Section>
//         )}

//         {/* ── Địa chỉ ── */}
//         <Section title="Địa chỉ">
//           <div className="grid grid-cols-3 gap-4">
//             <FormField label="Tỉnh / Thành phố *" error={err('province')}>
//               <select
//                 value={form.provinceId}
//                 onChange={e => { onProvinceChange(e.target.value); touch('province'); }}
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={{ background: '#1e293b', border: `1px solid ${err('province') ? '#ef4444' : '#334155'}`, color: form.provinceId ? 'white' : '#64748b' }}
//               >
//                 <option value="">-- Chọn tỉnh --</option>
//                 {VN_PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
//               </select>
//             </FormField>

//             <FormField label="Quận / Huyện *" error={err('district')}>
//               <select
//                 value={form.districtId}
//                 onChange={e => { onDistrictChange(e.target.value); touch('district'); }}
//                 disabled={!form.provinceId}
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={{
//                   background: '#1e293b',
//                   border: `1px solid ${err('district') ? '#ef4444' : '#334155'}`,
//                   color: form.districtId ? 'white' : '#64748b',
//                   opacity: !form.provinceId ? 0.5 : 1,
//                 }}
//               >
//                 <option value="">-- Chọn quận --</option>
//                 {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
//               </select>
//             </FormField>

//             <FormField label="Phường / Xã *" error={err('ward')}>
//               <select
//                 value={form.wardId}
//                 onChange={e => { onWardChange(e.target.value); touch('ward'); }}
//                 disabled={!form.districtId}
//                 className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                 style={{
//                   background: '#1e293b',
//                   border: `1px solid ${err('ward') ? '#ef4444' : '#334155'}`,
//                   color: form.wardId ? 'white' : '#64748b',
//                   opacity: !form.districtId ? 0.5 : 1,
//                 }}
//               >
//                 <option value="">-- Chọn phường --</option>
//                 {wards.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
//               </select>
//             </FormField>
//           </div>

//           <FormField label="Số nhà, tên đường *" error={err('addressDetail')} className="mt-4">
//             <input
//               value={form.addressDetail}
//               onChange={e => set('addressDetail', e.target.value)}
//               onBlur={() => touch('addressDetail')}
//               placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé"
//               className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//               style={inputStyle('addressDetail')}
//             />
//           </FormField>
//         </Section>

//         {/* ── Khách sỉ: Cấp độ & Công nợ ── */}
//         {form.customerType === 'wholesale' && (
//           <Section title="Cấp độ & Công nợ">
//             <div className="grid grid-cols-2 gap-4">
//               <FormField label="Cấp độ khách sỉ *" error={err('wholesaleTier')}>
//                 {isManager ? (
//                   <select
//                     value={form.wholesaleTier}
//                     onChange={e => { onTierChange(e.target.value as WholesaleTier | ''); touch('wholesaleTier'); }}
//                     className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                     style={{ background: '#1e293b', border: `1px solid ${err('wholesaleTier') ? '#ef4444' : '#334155'}`, color: 'white' }}
//                   >
//                     <option value="">-- Chọn cấp --</option>
//                     {(['tier1', 'tier2', 'tier3'] as WholesaleTier[]).map(t => (
//                       <option key={t} value={t}>{WHOLESALE_TIER_LABELS[t]}</option>
//                     ))}
//                   </select>
//                 ) : (
//                   <div
//                     className="px-3 py-2 rounded-xl text-xs"
//                     style={{ background: '#1e293b40', border: '1px solid #334155', color: '#64748b' }}
//                   >
//                     {form.wholesaleTier ? WHOLESALE_TIER_LABELS[form.wholesaleTier] : '-- Chỉ Quản lý mới được đặt --'}
//                   </div>
//                 )}
//               </FormField>

//               <FormField label="Hạn mức công nợ">
//                 <div
//                   className="px-3 py-2 rounded-xl text-xs flex items-center justify-between"
//                   style={{ background: '#1e293b40', border: '1px solid #334155' }}
//                 >
//                   <span className="text-xs font-black tabular-nums" style={{ color: form.creditLimit > 0 ? '#f59e0b' : '#475569' }}>
//                     {form.creditLimit > 0 ? fmt(form.creditLimit) : 'Chưa xác định'}
//                   </span>
//                   <span className="text-[10px]" style={{ color: '#475569' }}>Tự động theo cấp</span>
//                 </div>
//               </FormField>

//               <FormField label="Hạn thanh toán">
//                 <select
//                   value={form.paymentTerm}
//                   onChange={e => set('paymentTerm', e.target.value as PaymentTerm)}
//                   disabled={!isManager}
//                   className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//                   style={{
//                     background: '#1e293b',
//                     border: '1px solid #334155',
//                     color: 'white',
//                     opacity: !isManager ? 0.6 : 1,
//                   }}
//                 >
//                   {Object.entries(PAYMENT_TERM_LABELS).map(([k, v]) => (
//                     <option key={k} value={k}>{v}</option>
//                   ))}
//                 </select>
//               </FormField>
//             </div>

//             {!isManager && (
//               <div
//                 className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
//                 style={{ background: '#f59e0b10', border: '1px solid #f59e0b20', color: '#f59e0b' }}
//               >
//                 <AlertTriangle size={12} />
//                 Hạn mức & điều khoản thanh toán chỉ được chỉnh bởi Quản lý
//               </div>
//             )}
//           </Section>
//         )}

//         {/* ── Ghi chú ── */}
//         <Section title="Ghi chú">
//           <textarea
//             value={form.notes}
//             onChange={e => set('notes', e.target.value)}
//             placeholder="Thêm ghi chú về khách hàng..."
//             rows={3}
//             className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
//             style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
//           />
//         </Section>
//       </div>
//     </div>
//   );
// }

// function Section({ title, children }: { title: string; children: React.ReactNode }) {
//   return (
//     <div className="rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
//       <div className="px-4 py-2.5" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
//         <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>{title}</span>
//       </div>
//       <div className="p-4">{children}</div>
//     </div>
//   );
// }

// function FormField({
//   label,
//   error,
//   children,
//   className = '',
// }: {
//   label: string;
//   error?: string;
//   children: React.ReactNode;
//   className?: string;
// }) {
//   return (
//     <div className={className}>
//       <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
//         {label}
//       </label>
//       {children}
//       {error && (
//         <p className="mt-1 text-[10px] flex items-center gap-1" style={{ color: '#ef4444' }}>
//           <AlertTriangle size={10} /> {error}
//         </p>
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────
// // SECTION 3 — CUSTOMER DETAIL
// // ─────────────────────────────────────────────────────────────────────────
// function CustomerDetail({
//   customerId,
//   onBack,
//   onEdit,
//   onCreateOrder,
//   role = 'sale',
// }: {
//   customerId: string;
//   onBack: () => void;
//   onEdit: (id: string) => void;
//   onCreateOrder: (id: string) => void;
//   role?: 'sale' | 'manager';
// }) {
//   const [tab, setTab] = useState<'info' | 'orders' | 'payments'>('info');
//   const customer = getCustomerById(customerId);

//   if (!customer) return null;

//   const isWholesale = customer.customerType === 'wholesale';
//   const wc = customer as WholesaleCustomer;
//   const rc = customer as RetailCustomer;
//   const orders   = getCustomerOrders(customerId);
//   const payments = getCustomerPayments(customerId);
//   const debtStatus = isWholesale ? getDebtStatus(wc.currentDebt, wc.creditLimit) : 'safe';
//   const memberColor = MEMBER_COLORS[(customer as any).memberTier];

//   return (
//     <div className="flex flex-col h-full" style={{ background: '#020817' }}>
//       {/* ── Header ── */}
//       <div
//         className="px-6 py-3 flex-shrink-0"
//         style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <button
//               onClick={onBack}
//               className="p-1.5 rounded-lg"
//               style={{ background: '#1e293b', color: '#64748b' }}
//             >
//               <ArrowLeft size={14} />
//             </button>
//             <div
//               className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
//               style={{
//                 background: isWholesale ? '#c17f4420' : '#a78bfa20',
//                 color: isWholesale ? '#c17f44' : '#a78bfa',
//               }}
//             >
//               {customer.fullName.charAt(0)}
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <h1 className="text-base font-black text-white">{customer.fullName}</h1>
//                 <Badge
//                   label={customer.customerCode}
//                   color="#38bdf8"
//                 />
//                 <Badge
//                   label={MEMBER_TIER_LABELS[(customer as any).memberTier]}
//                   color={memberColor}
//                 />
//               </div>
//               {isWholesale && (
//                 <p className="text-[11px]" style={{ color: '#64748b' }}>{wc.companyName}</p>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => onCreateOrder(customerId)}
//               className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
//               style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}
//             >
//               <ShoppingBag size={12} /> Tạo đơn hàng
//             </button>
//             <button
//               onClick={() => onEdit(customerId)}
//               className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
//               style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
//             >
//               <Edit2 size={12} /> Sửa
//             </button>
//           </div>
//         </div>

//         {/* ── KPI bar ── */}
//         <div className="grid grid-cols-4 gap-3 mt-3">
//           <KpiCard
//             label="Tổng chi tiêu"
//             value={fmt((customer as any).totalSpent)}
//             color="#10b981"
//           />
//           <KpiCard
//             label="Điểm hiện có"
//             value={fmtNumber((customer as any).currentPoints)}
//             color="#f59e0b"
//           />
//           {isWholesale ? (
//             <>
//               <div
//                 className="rounded-xl px-3 py-2"
//                 style={{ background: '#0f172a', border: '1px solid #1e293b' }}
//               >
//                 <p className="text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>Công nợ</p>
//                 <p
//                   className="text-sm font-black tabular-nums"
//                   style={{ color: DEBT_STATUS_COLOR[debtStatus] }}
//                 >
//                   {fmt(wc.currentDebt)}
//                 </p>
//                 <DebtBar debt={wc.currentDebt} limit={wc.creditLimit} />
//               </div>
//               <KpiCard
//                 label="Hạn mức"
//                 value={fmt(wc.creditLimit)}
//                 color="#64748b"
//               />
//             </>
//           ) : (
//             <>
//               <KpiCard
//                 label="Tổng điểm tích lũy"
//                 value={fmtNumber(rc.totalAccumulatedPoints)}
//                 color="#a78bfa"
//               />
//               <KpiCard
//                 label="Đơn hàng"
//                 value={`${orders.length} đơn`}
//                 color="#38bdf8"
//               />
//             </>
//           )}
//         </div>

//         {/* ── Tabs ── */}
//         <div className="flex gap-1 mt-3">
//           {([
//             { id: 'info',     label: 'Thông tin',    icon: User },
//             { id: 'orders',   label: 'Lịch sử mua',  icon: ShoppingBag },
//             { id: 'payments', label: 'Công nợ',       icon: CreditCard },
//           ] as const).map(({ id, label, icon: Icon }) => (
//             <button
//               key={id}
//               onClick={() => setTab(id)}
//               className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
//               style={{
//                 background: tab === id ? '#1e293b' : 'transparent',
//                 color: tab === id ? 'white' : '#64748b',
//                 border: tab === id ? '1px solid #334155' : '1px solid transparent',
//               }}
//             >
//               <Icon size={12} />
//               {label}
//               {id === 'orders' && orders.length > 0 && (
//                 <span
//                   className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black"
//                   style={{ background: '#334155', color: '#94a3b8' }}
//                 >
//                   {orders.length}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── Tab content ── */}
//       <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
//         {tab === 'info' && (
//           <InfoTab customer={customer} role={role} />
//         )}
//         {tab === 'orders' && (
//           <OrdersTab orders={orders} />
//         )}
//         {tab === 'payments' && (
//           <PaymentsTab payments={payments} customer={customer} />
//         )}
//       </div>
//     </div>
//   );
// }

// function KpiCard({ label, value, color }: { label: string; value: string; color: string }) {
//   return (
//     <div className="rounded-xl px-3 py-2" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
//       <p className="text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>{label}</p>
//       <p className="text-sm font-black tabular-nums" style={{ color }}>{value}</p>
//     </div>
//   );
// }

// function InfoRow({ icon: Icon, label, value, valueColor }: {
//   icon?: any; label: string; value: string; valueColor?: string;
// }) {
//   return (
//     <div className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid #0f172a' }}>
//       {Icon && <Icon size={13} style={{ color: '#475569', marginTop: 2, flexShrink: 0 }} />}
//       <span className="text-xs font-bold w-40 flex-shrink-0" style={{ color: '#64748b' }}>{label}</span>
//       <span className="text-xs font-bold" style={{ color: valueColor ?? 'white' }}>{value || '--'}</span>
//     </div>
//   );
// }

// function InfoTab({ customer, role }: { customer: Customer; role: string }) {
//   const isWholesale = customer.customerType === 'wholesale';
//   const wc = customer as WholesaleCustomer;
//   const rc = customer as RetailCustomer;
//   const debtStatus = isWholesale ? getDebtStatus(wc.currentDebt, wc.creditLimit) : 'safe';

//   return (
//     <div className="space-y-4">
//       {/* Thông tin cá nhân */}
//       <Section title="Thông tin liên hệ">
//         <InfoRow icon={Phone} label="Số điện thoại" value={customer.phoneNumber} valueColor="#38bdf8" />
//         {customer.email && <InfoRow icon={Mail} label="Email" value={customer.email} />}
//         <InfoRow
//           icon={MapPin}
//           label="Địa chỉ"
//           value={[customer.addressDetail, customer.ward, customer.district, customer.province].filter(Boolean).join(', ')}
//         />
//         <InfoRow icon={CalendarDays} label="Kênh đến" value={customer.source} />
//         <InfoRow icon={CalendarDays} label="Ngày tạo" value={fmtDate(customer.createdAt)} />
//       </Section>

//       {/* Retail extra */}
//       {!isWholesale && (
//         <Section title="Thông tin cá nhân">
//           <InfoRow
//             icon={CalendarDays}
//             label="Ngày sinh"
//             value={rc.dob ? fmtDate(rc.dob) : '--'}
//           />
//           <InfoRow
//             icon={User}
//             label="Giới tính"
//             value={rc.gender === 'male' ? 'Nam' : rc.gender === 'female' ? 'Nữ' : rc.gender === 'other' ? 'Khác' : '--'}
//           />
//           <InfoRow icon={Star} label="Hạng thẻ" value={MEMBER_TIER_LABELS[rc.memberTier]} valueColor={MEMBER_COLORS[rc.memberTier]} />
//         </Section>
//       )}

//       {/* Wholesale extra */}
//       {isWholesale && (
//         <Section title="Thông tin công ty & Công nợ">
//           <InfoRow icon={Building2} label="Tên công ty" value={wc.companyName} />
//           <InfoRow icon={FileText} label="Mã số thuế" value={wc.taxId ?? '--'} />
//           <InfoRow icon={User} label="Người liên hệ" value={wc.contactPersonName ?? '--'} />
//           <InfoRow icon={Phone} label="SĐT liên hệ" value={wc.contactPersonPhone ?? '--'} />
//           <InfoRow
//             label="Cấp độ"
//             value={WHOLESALE_TIER_LABELS[wc.wholesaleTier]}
//             valueColor="#c17f44"
//           />
//           <InfoRow
//             label="Hạn thanh toán"
//             value={PAYMENT_TERM_LABELS[wc.paymentTerm]}
//           />
//           <InfoRow
//             label="Hạn mức công nợ"
//             value={fmt(wc.creditLimit)}
//             valueColor="#f59e0b"
//           />
//           <InfoRow
//             label="Công nợ hiện tại"
//             value={fmt(wc.currentDebt)}
//             valueColor={DEBT_STATUS_COLOR[debtStatus]}
//           />
//           {debtStatus !== 'safe' && (
//             <div
//               className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
//               style={{
//                 background: debtStatus === 'danger' ? '#ef444415' : '#f59e0b15',
//                 border: `1px solid ${debtStatus === 'danger' ? '#ef444430' : '#f59e0b30'}`,
//                 color: debtStatus === 'danger' ? '#ef4444' : '#f59e0b',
//               }}
//             >
//               <AlertTriangle size={12} />
//               {debtStatus === 'danger'
//                 ? 'Khách hàng đã vượt hạn mức công nợ!'
//                 : 'Công nợ sắp chạm hạn mức (≥ 80%)'}
//             </div>
//           )}
//         </Section>
//       )}

//       {customer.notes && (
//         <Section title="Ghi chú">
//           <p className="text-xs" style={{ color: '#94a3b8' }}>{customer.notes}</p>
//         </Section>
//       )}
//     </div>
//   );
// }

// function OrdersTab({ orders }: { orders: ReturnType<typeof getCustomerOrders> }) {
//   const STATUS_MAP = {
//     completed: { label: 'Hoàn thành', color: '#10b981' },
//     shipping:  { label: 'Đang giao',  color: '#38bdf8' },
//     cancelled: { label: 'Đã hủy',     color: '#ef4444' },
//     pending:   { label: 'Chờ xử lý',  color: '#f59e0b' },
//   };

//   if (orders.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-40 gap-2">
//         <ShoppingBag size={32} style={{ color: '#334155' }} />
//         <p className="text-sm" style={{ color: '#475569' }}>Chưa có đơn hàng nào</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-2">
//       {orders.map(order => {
//         const s = STATUS_MAP[order.status];
//         return (
//           <div
//             key={order.id}
//             className="rounded-xl p-4"
//             style={{ background: '#0f172a', border: '1px solid #1e293b' }}
//           >
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-black" style={{ color: '#38bdf8' }}>{order.orderCode}</span>
//                 <Badge label={s.label} color={s.color} />
//               </div>
//               <div className="text-right">
//                 <p className="text-sm font-black tabular-nums" style={{ color: '#10b981' }}>
//                   {fmt(order.total)}
//                 </p>
//                 <p className="text-[10px]" style={{ color: '#475569' }}>{fmtDate(order.date)}</p>
//               </div>
//             </div>
//             <div className="space-y-1">
//               {order.items.map((item, i) => (
//                 <div key={i} className="flex items-center justify-between">
//                   <div>
//                     <span className="text-xs font-bold text-white">{item.name}</span>
//                     <span className="text-[10px] ml-2" style={{ color: '#64748b' }}>{item.sku}</span>
//                   </div>
//                   <span className="text-xs tabular-nums" style={{ color: '#94a3b8' }}>
//                     x{item.qty} × {fmtShort(item.price)}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// function PaymentsTab({
//   payments,
//   customer,
// }: {
//   payments: ReturnType<typeof getCustomerPayments>;
//   customer: Customer;
// }) {
//   if (payments.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-40 gap-2">
//         <CreditCard size={32} style={{ color: '#334155' }} />
//         <p className="text-sm" style={{ color: '#475569' }}>Chưa có lịch sử thanh toán</p>
//       </div>
//     );
//   }

//   const TYPE_MAP = {
//     receipt:    { label: 'Phiếu thu',   color: '#10b981' },
//     invoice:    { label: 'Hóa đơn',     color: '#f97316' },
//     adjustment: { label: 'Điều chỉnh',  color: '#a78bfa' },
//   };

//   return (
//     <div className="space-y-2">
//       {payments.map(p => {
//         const t = TYPE_MAP[p.type];
//         const isReceipt = p.amount > 0;
//         return (
//           <div
//             key={p.id}
//             className="rounded-xl p-4"
//             style={{ background: '#0f172a', border: '1px solid #1e293b' }}
//           >
//             <div className="flex items-center justify-between mb-1">
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-black" style={{ color: '#38bdf8' }}>{p.voucherCode}</span>
//                 <Badge label={t.label} color={t.color} />
//               </div>
//               <div className="text-right">
//                 <p
//                   className="text-sm font-black tabular-nums"
//                   style={{ color: isReceipt ? '#10b981' : '#ef4444' }}
//                 >
//                   {isReceipt ? '+' : ''}{fmt(p.amount)}
//                 </p>
//                 <p className="text-[10px]" style={{ color: '#475569' }}>{fmtDate(p.date)}</p>
//               </div>
//             </div>
//             <div className="flex items-center justify-between mt-2">
//               <p className="text-[11px]" style={{ color: '#64748b' }}>{p.note}</p>
//               <p className="text-[10px] tabular-nums" style={{ color: '#475569' }}>
//                 Dư nợ sau: <span style={{ color: '#f59e0b' }}>{fmt(p.remainingDebt)}</span>
//               </p>
//             </div>
//             {p.approvedBy && (
//               <p className="text-[10px] mt-1" style={{ color: '#475569' }}>
//                 Duyệt bởi: {p.approvedBy}
//               </p>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────
// // MAIN PAGE
// // ─────────────────────────────────────────────────────────────────────────
// type View =
//   | { type: 'list' }
//   | { type: 'detail'; id: string }
//   | { type: 'form'; mode: 'create' | 'edit'; id?: string };

// export default function KhachHangPage() {
//   const [view, setView] = useState<View>({ type: 'list' });
//   const [role] = useState<'sale' | 'manager'>('manager'); // Sau này: lấy từ auth context

//   const handleSave = (customer: Customer) => {
//     setView({ type: 'detail', id: customer.id });
//   };

//   return (
//     <div className="h-full flex flex-col" style={{ background: '#020817', color: 'white' }}>
//       {view.type === 'list' && (
//         <CustomerList
//           onSelect={id => setView({ type: 'detail', id })}
//           onCreateNew={() => setView({ type: 'form', mode: 'create' })}
//         />
//       )}

//       {view.type === 'detail' && (
//         <CustomerDetail
//           customerId={view.id}
//           role={role}
//           onBack={() => setView({ type: 'list' })}
//           onEdit={id => setView({ type: 'form', mode: 'edit', id })}
//           onCreateOrder={id => {
//             // Sau này: navigate('/manage/ban-hang/tao-don?customerId=' + id)
//             console.log('Create order for', id);
//           }}
//         />
//       )}

//       {view.type === 'form' && (
//         <CustomerForm
//           mode={view.mode}
//           customerId={view.id}
//           role={role}
//           onSave={handleSave}
//           onCancel={() =>
//             view.id
//               ? setView({ type: 'detail', id: view.id })
//               : setView({ type: 'list' })
//           }
//         />
//       )}
//     </div>
//   );
// }