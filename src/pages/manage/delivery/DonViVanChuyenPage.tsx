// DonViVanChuyenPage.tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Filter, X, ArrowLeft, Edit2, Copy, Check,
  AlertTriangle, Trash2, Phone, Mail, MessageCircle,
  Star,
  Wifi, WifiOff,
  GripVertical, ToggleLeft, ToggleRight, RefreshCw,
  MapPin, FileText, Truck, Users, ExternalLink,
} from 'lucide-react';

import type {
  Carrier, ShippingContact,
  CarrierType, CarrierStatus, CarrierRegion, CarrierService,
} from '../../../components/VanChuyen/data/carrierTypes';

import {
  CARRIER_STATUS_LABELS, CARRIER_STATUS_COLORS,
  CARRIER_REGION_LABELS, CARRIER_SERVICE_LABELS,
  SHIPPING_CONTACT_ROLE_LABELS,
  CARRIER_CODE_REGEX, VN_PHONE_REGEX, EMAIL_REGEX,
} from '../../../components/VanChuyen/data/carrierTypes';

import {
  getAllCarriers, getCarrierById, createCarrier, updateCarrier,
  reorderCarriers, testApiConnection,
  checkCarrierCodeUnique, filterCarriers, type CarrierFilter,
} from '../../../components/VanChuyen/service/carrierService';

// ── Helpers ───────────────────────────────────────────────────────────────
const fmtDate = (d?: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '--';
const fmtDatetime = (d?: string) =>
  d ? new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--';

function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.round((a / b) * 100);
}

// ── Shared small components ───────────────────────────────────────────────
function Bdg({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
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
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setOk(true); setTimeout(() => setOk(false), 1500); }}
      className="p-1 rounded transition-all flex-shrink-0"
      style={{ color: ok ? '#10b981' : '#475569' }}
    >
      {ok ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={13}
          fill={(hover || value) >= i ? '#f59e0b' : 'none'}
          style={{ color: (hover || value) >= i ? '#f59e0b' : '#334155', cursor: onChange ? 'pointer' : 'default' }}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onChange && setHover(i)}
          onMouseLeave={() => onChange && setHover(0)}
        />
      ))}
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
      <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>{label}</p>
      <p className="text-sm font-black tabular-nums" style={{ color: color ?? 'white' }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{sub}</p>}
    </div>
  );
}

function Section({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
      <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
        <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>{title}</span>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function FormField({ label, error, children, required, className = '' }: {
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
        <p className="mt-1 text-[10px] flex items-center gap-1" style={{ color: '#ef4444' }}>
          <AlertTriangle size={9} /> {error}
        </p>
      )}
    </div>
  );
}

const iStyle = (err?: string): React.CSSProperties => ({
  background: '#1e293b', border: `1px solid ${err ? '#ef4444' : '#334155'}`, color: 'white',
});

const selStyle: React.CSSProperties = { background: '#1e293b', border: '1px solid #334155', color: 'white' };

// ── Status icon ───────────────────────────────────────────────────────────
export function StatusIcon({ status }: { status: CarrierStatus }) {
  if (status === 'active')    return <Wifi size={13} style={{ color: '#10b981' }} />;
  if (status === 'api_error') return <WifiOff size={13} style={{ color: '#ef4444' }} />;
  return <WifiOff size={13} style={{ color: '#64748b' }} />;
}

// ─────────────────────────────────────────────────────────────────────────
// CARD VIEW — List
// ─────────────────────────────────────────────────────────────────────────
function CarrierCard({
  carrier, onSelect, onToggle, onDragStart, onDragOver, onDrop, isDragging,
}: {
  carrier: Carrier;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (targetId: string) => void;
  isDragging: boolean;
}) {
  const [showPhone, setShowPhone] = useState(false);
  const primaryContact = carrier.contacts.find(c => c.role === 'account_manager') ?? carrier.contacts[0];
  const successRate = pct(carrier.stats.successOrders, carrier.stats.totalOrders);
  const returnRate  = pct(carrier.stats.returnedOrders, carrier.stats.totalOrders);

  return (
    <div
      draggable
      onDragStart={() => onDragStart(carrier.id)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(carrier.id)}
      className="rounded-xl overflow-hidden transition-all"
      style={{
        background: '#0f172a',
        border: `1px solid ${carrier.status === 'api_error' ? '#ef444440' : '#1e293b'}`,
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
      }}
    >
      {/* Card header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        {/* Drag handle */}
        <GripVertical size={14} style={{ color: '#334155', flexShrink: 0, cursor: 'grab' }} />

        {/* Logo placeholder */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
          style={{ background: '#1e293b', color: carrier.type === 'api' ? '#38bdf8' : '#c17f44' }}
        >
          {carrier.carrierCode.slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-black text-white cursor-pointer hover:text-sky-400 transition-colors"
              onClick={() => onSelect(carrier.id)}
            >
              {carrier.name}
            </p>
            {carrier.isDefault && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px] font-black"
                style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}
              >
                MẶC ĐỊNH
              </span>
            )}
            <Bdg
              label={CARRIER_STATUS_LABELS[carrier.status]}
              color={CARRIER_STATUS_COLORS[carrier.status]}
              pulse={carrier.status === 'api_error'}
            />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-black" style={{ color: '#475569' }}>
              {carrier.carrierCode}
            </span>
            <span className="text-[10px]" style={{ color: '#334155' }}>•</span>
            <span className="text-[10px]" style={{ color: carrier.type === 'api' ? '#38bdf8' : '#c17f44' }}>
              {carrier.type === 'api' ? 'API' : 'Thủ công'}
            </span>
            <span className="text-[10px]" style={{ color: '#334155' }}>•</span>
            <Stars value={carrier.rating} />
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(carrier.id); }}
          title={carrier.status === 'active' ? 'Tắt ĐVVC này' : 'Bật ĐVVC này'}
          className="p-1 rounded transition-all flex-shrink-0"
        >
          {carrier.status === 'active'
            ? <ToggleRight size={22} style={{ color: '#10b981' }} />
            : <ToggleLeft  size={22} style={{ color: '#334155' }} />
          }
        </button>
      </div>

      {/* API Error banner */}
      {carrier.status === 'api_error' && carrier.apiConfig?.errorMessage && (
        <div
          className="px-4 py-2 flex items-start gap-2"
          style={{ background: '#ef444410', borderBottom: '1px solid #ef444420' }}
        >
          <AlertTriangle size={12} style={{ color: '#ef4444', marginTop: 1, flexShrink: 0 }} />
          <p className="text-[10px]" style={{ color: '#ef4444' }}>
            {carrier.apiConfig.errorMessage}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 px-4 py-3">
        <div className="text-center">
          <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>Tháng này</p>
          <p className="text-sm font-black" style={{ color: '#38bdf8' }}>
            {carrier.stats.monthlyOrders}
          </p>
          <p className="text-[10px]" style={{ color: '#475569' }}>đơn</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>Thành công</p>
          <p className="text-sm font-black" style={{ color: successRate >= 95 ? '#10b981' : successRate >= 85 ? '#f59e0b' : '#ef4444' }}>
            {successRate}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>Hoàn hàng</p>
          <p className="text-sm font-black" style={{ color: returnRate > 10 ? '#ef4444' : returnRate > 5 ? '#f59e0b' : '#10b981' }}>
            {returnRate}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>T/g giao TB</p>
          <p className="text-sm font-black" style={{ color: '#a78bfa' }}>
            {carrier.stats.avgDeliveryDays}d
          </p>
        </div>
      </div>

      {/* Tags row */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {carrier.regions.map(r => (
          <Bdg key={r} label={CARRIER_REGION_LABELS[r]} color="#64748b" />
        ))}
        {carrier.services.includes('cod') && <Bdg label="COD" color="#10b981" />}
        {carrier.services.includes('bulky') && <Bdg label="Hàng cồng kềnh" color="#f97316" />}
        {carrier.type === 'manual' && carrier.manualConfig?.departureTime && (
          <Bdg label={`Xuất bến ${carrier.manualConfig.departureTime}`} color="#c17f44" />
        )}
      </div>

      {/* Actions */}
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid #1e293b' }}
      >
        {/* Phone quick view */}
        <div className="relative">
          {primaryContact ? (
            <button
              onMouseEnter={() => setShowPhone(true)}
              onMouseLeave={() => setShowPhone(false)}
              className="flex items-center gap-1.5 text-[11px] font-bold"
              style={{ color: '#64748b' }}
            >
              <Phone size={11} />
              {primaryContact.name}
              {showPhone && (
                <span
                  className="absolute left-0 top-6 z-20 px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap"
                  style={{ background: '#0a1628', border: '1px solid #334155', color: '#38bdf8' }}
                >
                  📞 {primaryContact.phone}
                  {primaryContact.zaloId && ` · Zalo: ${primaryContact.zaloId}`}
                </span>
              )}
            </button>
          ) : (
            <span className="text-[11px]" style={{ color: '#475569' }}>Chưa có liên hệ</span>
          )}
        </div>

        <button
          onClick={() => onSelect(carrier.id)}
          className="flex items-center gap-1 text-[11px] font-black"
          style={{ color: '#38bdf8' }}
        >
          Chi tiết →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 1 — CARRIER LIST
// ─────────────────────────────────────────────────────────────────────────
function CarrierList({ onSelect, onCreateNew }: {
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}) {
  const [filters, setFilters] = useState<CarrierFilter>({ type: 'all', status: 'all', region: 'all', service: 'all' });
  const [showFilters, setShowFilters] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const carriers = useMemo<Carrier[]>(() => filterCarriers(filters), [filters]);
  const reload = useCallback(() => setFilters(f => ({ ...f })), []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setF = (k: keyof CarrierFilter, v: any) => setFilters(prev => ({ ...prev, [k]: v }));

  const handleToggle = (id: string) => {
    const c = getCarrierById(id);
    if (!c) return;
    const next: CarrierStatus = c.status === 'active' ? 'inactive' : 'active';
    updateCarrier(id, { status: next });
    reload();
  };

  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); return; }
    const all = getAllCarriers();
    const fromIdx = all.findIndex(c => c.id === draggingId);
    const toIdx   = all.findIndex(c => c.id === targetId);
    const reordered = [...all];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    reorderCarriers(reordered.map(c => c.id));
    reload();
    setDraggingId(null);
  };

  const activeFilters = Object.entries(filters).filter(([k, v]) => k !== 'search' && v && v !== 'all').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div>
          <h1 className="text-base font-black text-white">Đơn vị Vận chuyển</h1>
          <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
            {carriers.length} đơn vị · Kéo thả để sắp xếp thứ tự ưu tiên
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black"
          style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}
        >
          <Plus size={14} /> Thêm ĐVVC
        </button>
      </div>

      {/* Search + filter */}
      <div className="px-6 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid #1e293b' }}>
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
          <input
            type="text"
            placeholder="Tên ĐVVC, mã, tên Sale phụ trách..."
            value={filters.search ?? ''}
            onChange={e => setF('search', e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
          />
        </div>

        {/* Type quick filter */}
        <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
          {[['all', 'Tất cả'], ['api', 'API'], ['manual', 'Chành xe']] .map(([v, l]) => (
            <button
              key={v}
              onClick={() => setF('type', v)}
              className="px-3 py-1.5 text-xs font-bold transition-all"
              style={{
                background: filters.type === v ? '#1e293b' : 'transparent',
                color: filters.type === v ? 'white' : '#64748b',
                borderRight: '1px solid #334155',
              }}
            >
              {l}
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
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black" style={{ background: '#38bdf8', color: '#020817' }}>
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="px-6 py-3 flex items-center gap-4 flex-shrink-0" style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
          {[
            { label: 'Trạng thái', key: 'status', opts: [['all','Tất cả'],['active','Đang hoạt động'],['inactive','Tạm ngưng'],['api_error','Lỗi API']] },
            { label: 'Tuyến', key: 'region', opts: [['all','Tất cả'],['nationwide','Toàn quốc'],['north','Miền Bắc'],['central','Miền Trung'],['south','Miền Nam'],['mekong','Miền Tây']] },
            { label: 'Dịch vụ', key: 'service', opts: [['all','Tất cả'],['cod','COD'],['express','Giao nhanh'],['bulky','Cồng kềnh']] },
          ].map(({ label, key, opts }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>{label}</span>
              <select
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(filters as any)[key] ?? 'all'}
                onChange={e => setF(key as keyof CarrierFilter, e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs outline-none"
                style={selStyle}
              >
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          {activeFilters > 0 && (
            <button onClick={() => setFilters({ type: 'all', status: 'all', region: 'all', service: 'all' })} className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
              <X size={11} /> Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
        {carriers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <Truck size={32} style={{ color: '#334155' }} />
            <p className="text-sm" style={{ color: '#475569' }}>Không tìm thấy đơn vị vận chuyển</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {carriers.map(c => (
              <CarrierCard
                key={c.id}
                carrier={c}
                onSelect={onSelect}
                onToggle={handleToggle}
                onDragStart={setDraggingId}
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                isDragging={draggingId === c.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 2 — CARRIER FORM
// ─────────────────────────────────────────────────────────────────────────
function newContact(): ShippingContact {
  return { id: `sc${Date.now()}`, name: '', role: 'account_manager', phone: '', email: '', zaloId: '', note: '' };
}

interface FormState {
  carrierCode: string;
  name: string;
  type: CarrierType;
  status: CarrierStatus;
  isDefault: boolean;
  rating: number;
  regions: CarrierRegion[];
  services: CarrierService[];
  dropOffAddress: string;
  priceNoteUrl: string;
  contractSignedAt: string;
  contractExpiresAt: string;
  notes: string;
  contacts: ShippingContact[];
  // API
  apiKey: string;
  secretKey: string;
  endpointUrl: string;
  partnerCode: string;
  // Manual
  licensePlate: string;
  driverName: string;
  terminalAddress: string;
  departureTime: string;
  routeNote: string;
}

const EMPTY: FormState = {
  carrierCode: '', name: '', type: 'api', status: 'active',
  isDefault: false, rating: 4,
  regions: [], services: [],
  dropOffAddress: '', priceNoteUrl: '',
  contractSignedAt: '', contractExpiresAt: '', notes: '',
  contacts: [newContact()],
  apiKey: '', secretKey: '', endpointUrl: '', partnerCode: '',
  licensePlate: '', driverName: '', terminalAddress: '', departureTime: '', routeNote: '',
};

function CarrierForm({ mode, carrierId, onSave, onCancel }: {
  mode: 'create' | 'edit';
  carrierId?: string;
  onSave: (c: Carrier) => void;
  onCancel: () => void;
}) {
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [asyncErr, setAsyncErr]   = useState<Record<string, string>>({});
  const [touched, setTouched]     = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty]     = useState(false);
  const [showExit, setShowExit]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [testing, setTesting]     = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);

  useEffect(() => { setIsDirty(true); }, [form]);

  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [isDirty]);

  useEffect(() => {
    if (mode === 'edit' && carrierId) {
      const c = getCarrierById(carrierId);
      if (!c) return;
      setForm({
        carrierCode: c.carrierCode,
        name: c.name,
        type: c.type,
        status: c.status,
        isDefault: c.isDefault,
        rating: c.rating,
        regions: c.regions,
        services: c.services,
        dropOffAddress: c.dropOffAddress ?? '',
        priceNoteUrl: c.priceNoteUrl ?? '',
        contractSignedAt: c.contractSignedAt ?? '',
        contractExpiresAt: c.contractExpiresAt ?? '',
        notes: c.notes ?? '',
        contacts: c.contacts.length ? c.contacts : [newContact()],
        apiKey: c.apiConfig?.apiKey ?? '',
        secretKey: c.apiConfig?.secretKey ?? '',
        endpointUrl: c.apiConfig?.endpointUrl ?? '',
        partnerCode: c.apiConfig?.partnerCode ?? '',
        licensePlate: c.manualConfig?.licensePlate ?? '',
        driverName: c.manualConfig?.driverName ?? '',
        terminalAddress: c.manualConfig?.terminalAddress ?? '',
        departureTime: c.manualConfig?.departureTime ?? '',
        routeNote: c.manualConfig?.routeNote ?? '',
      });
      setIsDirty(false);
    }
  }, [mode, carrierId]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set = (k: keyof FormState, v: any) => setForm(prev => ({ ...prev, [k]: v }));
  const touch = (k: string) => setTouched(prev => ({ ...prev, [k]: true }));

  const toggleArr = <T extends string>(key: 'regions' | 'services', val: T) =>
    setForm(prev => ({
      ...prev,
      [key]: (prev[key] as T[]).includes(val)
        ? (prev[key] as T[]).filter(x => x !== val)
        : [...(prev[key] as T[]), val],
    }));

  const addContact = () => setForm(prev => ({ ...prev, contacts: [...prev.contacts, newContact()] }));
  const removeContact = (id: string) => setForm(prev => ({ ...prev, contacts: prev.contacts.filter(c => c.id !== id) }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateContact = (id: string, k: keyof ShippingContact, v: any) =>
    setForm(prev => ({ ...prev, contacts: prev.contacts.map(c => c.id === id ? { ...c, [k]: v } : c) }));

  const onCodeBlur = () => {
    touch('carrierCode');
    if (!form.carrierCode || mode === 'edit') return;
    if (!checkCarrierCodeUnique(form.carrierCode, carrierId)) {
      setAsyncErr(prev => ({ ...prev, carrierCode: 'Mã ĐVVC này đã tồn tại' }));
    } else {
      setAsyncErr(prev => { const n = { ...prev }; delete n.carrierCode; return n; });
    }
  };

  const handleTest = async () => {
    if (!carrierId && !form.apiKey) { setTestResult({ ok: false, msg: 'Vui lòng nhập API Key trước khi kiểm tra.' }); return; }
    setTesting(true);
    setTestResult(null);
    // If editing, test via service
    if (carrierId) {
      const res = await testApiConnection(carrierId);
      setTestResult({ ok: res.ok, msg: res.message });
    } else {
      // Simulate for new form
      await new Promise(r => setTimeout(r, 1200));
      setTestResult({ ok: false, msg: 'Lưu ĐVVC trước rồi mới kiểm tra kết nối được.' });
    }
    setTesting(false);
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Tên ĐVVC là bắt buộc';
    if (!form.carrierCode.trim()) errs.carrierCode = 'Mã ĐVVC là bắt buộc';
    else if (!CARRIER_CODE_REGEX.test(form.carrierCode)) errs.carrierCode = 'Chỉ chữ hoa, số, dấu gạch dưới. VD: GHN, CHANH_CTH';
    if (!form.regions.length) errs.regions = 'Chọn ít nhất 1 tuyến';
    if (!form.services.length) errs.services = 'Chọn ít nhất 1 dịch vụ';

    if (form.type === 'api' && !form.apiKey.trim()) errs.apiKey = 'API Key bắt buộc với ĐVVC loại API';

    if (form.type === 'manual' && !form.contacts.length)
      errs.contacts = 'Chành xe cần ít nhất 1 liên hệ';

    form.contacts.forEach((c, i) => {
      if (!c.name.trim()) errs[`cname_${i}`] = 'Tên liên hệ bắt buộc';
      if (!c.phone) errs[`cphone_${i}`] = 'SĐT bắt buộc';
      else if (!VN_PHONE_REGEX.test(c.phone.replace(/\s/g, ''))) errs[`cphone_${i}`] = 'SĐT không hợp lệ';
      if (c.email && !EMAIL_REGEX.test(c.email)) errs[`cemail_${i}`] = 'Email không đúng định dạng';
    });

    setErrors(errs);
    return Object.keys(errs).length === 0 && Object.keys(asyncErr).length === 0;
  }

  const handleSave = async () => {
    setTouched(['carrierCode','name','regions','services','apiKey',
      ...form.contacts.flatMap((_,i) => [`cname_${i}`,`cphone_${i}`])
    ].reduce((a,k) => ({ ...a, [k]: true }), {}));
    if (!validate()) return;
    setSaving(true);

    const payload: Omit<Carrier, 'id' | 'createdAt' | 'updatedAt'> = {
      carrierCode: form.carrierCode.trim().toUpperCase(),
      name: form.name.trim(),
      type: form.type,
      status: form.status,
      isDefault: form.isDefault,
      rating: form.rating,
      priorityOrder: mode === 'edit'
        ? (getCarrierById(carrierId!)?.priorityOrder ?? 99)
        : 99,
      regions: form.regions,
      services: form.services,
      dropOffAddress: form.dropOffAddress || undefined,
      priceNoteUrl: form.priceNoteUrl || undefined,
      contractSignedAt: form.contractSignedAt || undefined,
      contractExpiresAt: form.contractExpiresAt || undefined,
      contacts: form.contacts,
      notes: form.notes || undefined,
      stats: mode === 'edit'
        ? (getCarrierById(carrierId!)?.stats ?? { totalOrders: 0, successOrders: 0, returnedOrders: 0, monthlyOrders: 0, avgDeliveryDays: 0, avgCodSettlementDays: 0 })
        : { totalOrders: 0, successOrders: 0, returnedOrders: 0, monthlyOrders: 0, avgDeliveryDays: 0, avgCodSettlementDays: 0 },
      apiConfig: form.type === 'api' ? {
        apiKey: form.apiKey,
        secretKey: form.secretKey || undefined,
        endpointUrl: form.endpointUrl || undefined,
        partnerCode: form.partnerCode || undefined,
        connectionStatus: 'untested',
      } : undefined,
      manualConfig: form.type === 'manual' ? {
        licensePlate: form.licensePlate || undefined,
        driverName: form.driverName || undefined,
        terminalAddress: form.terminalAddress || undefined,
        departureTime: form.departureTime || undefined,
        routeNote: form.routeNote || undefined,
      } : undefined,
    };

    try {
      const saved = mode === 'create' ? createCarrier(payload) : updateCarrier(carrierId!, payload)!;
      setIsDirty(false);
      onSave(saved);
    } finally {
      setSaving(false);
    }
  };

  const e = (k: string) => (touched[k] && (errors[k] || asyncErr[k])) || undefined;

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Unsaved guard modal */}
      {showExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-2xl p-6 w-80 space-y-4" style={{ background: '#0a1628', border: '1px solid #1e293b' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#f59e0b15' }}>
                <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
              </div>
              <div>
                <p className="text-sm font-black text-white">Có dữ liệu chưa lưu</p>
                <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>Rời đi sẽ mất toàn bộ thay đổi.</p>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowExit(false)} className="flex-1 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#94a3b8' }}>Ở lại</button>
              <button onClick={() => { setIsDirty(false); onCancel(); }} className="flex-1 py-2 rounded-xl text-sm font-black" style={{ background: '#ef444420', color: '#ef4444', border: '1px solid #ef444430' }}>Rời đi</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10" style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => { if (isDirty) setShowExit(true); else onCancel(); }} className="p-1.5 rounded-lg" style={{ background: '#1e293b', color: '#64748b' }}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <h1 className="text-base font-black text-white">
              {mode === 'create' ? 'Thêm đơn vị vận chuyển' : 'Chỉnh sửa ĐVVC'}
            </h1>
            <p className="text-[11px]" style={{ color: '#64748b' }}>
              {mode === 'edit' && `Mã: ${getCarrierById(carrierId!)?.carrierCode}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { if (isDirty) setShowExit(true); else onCancel(); }} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#64748b' }}>Hủy</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-black"
            style={{ background: saving ? '#1e293b' : '#10b98120', color: saving ? '#475569' : '#10b981', border: `1px solid ${saving ? '#334155' : '#10b98140'}` }}
          >
            <Check size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ scrollbarWidth: 'thin' }}>

        {/* Thông tin cơ bản */}
        <Section title="Thông tin cơ bản">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tên đơn vị vận chuyển" required error={e('name')}>
              <input value={form.name} onChange={e => set('name', e.target.value)} onBlur={() => touch('name')}
                placeholder="VD: Giao Hàng Nhanh, Chành xe Cần Thơ..."
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle(e('name'))} />
            </FormField>

            <FormField label="Mã ĐVVC" required error={e('carrierCode') || asyncErr.carrierCode}>
              <input
                value={form.carrierCode}
                onChange={ev => set('carrierCode', ev.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                onBlur={onCodeBlur}
                disabled={mode === 'edit'}
                placeholder="VD: GHN, GHTK, CHANH_CTH"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none font-black"
                style={{ ...iStyle(e('carrierCode')), opacity: mode === 'edit' ? 0.6 : 1 }}
              />
            </FormField>

            {/* Type selector */}
            <FormField label="Loại vận chuyển" required>
              <div className="flex gap-3">
                {([['api', 'Kết nối API', Wifi], ['manual', 'Thủ công / Chành xe', Truck]] as const).map(([v, l, Icon]) => (
                  <button key={v} onClick={() => set('type', v)}
                    className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
                    style={{
                      background: form.type === v ? (v === 'api' ? '#38bdf820' : '#c17f4420') : '#1e293b',
                      border: `1px solid ${form.type === v ? (v === 'api' ? '#38bdf840' : '#c17f4440') : '#334155'}`,
                      color: form.type === v ? (v === 'api' ? '#38bdf8' : '#c17f44') : '#64748b',
                    }}>
                    <Icon size={14} />
                    <span className="text-xs font-black">{l}</span>
                  </button>
                ))}
              </div>
            </FormField>

            {/* Default toggle */}
            <FormField label="Đơn vị mặc định">
              <button
                onClick={() => set('isDefault', !form.isDefault)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl w-full transition-all"
                style={{ background: form.isDefault ? '#10b98120' : '#1e293b', border: `1px solid ${form.isDefault ? '#10b98140' : '#334155'}`, color: form.isDefault ? '#10b981' : '#64748b' }}
              >
                {form.isDefault ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                <span className="text-xs font-black">{form.isDefault ? 'Đang là mặc định' : 'Đặt làm mặc định'}</span>
              </button>
              {form.isDefault && <p className="text-[10px] mt-1" style={{ color: '#f59e0b' }}>⚠ Các ĐVVC khác sẽ bị bỏ mặc định.</p>}
            </FormField>

            {/* Rating */}
            <FormField label="Đánh giá của nhân viên kho">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#1e293b', border: '1px solid #334155' }}>
                <Stars value={form.rating} onChange={v => set('rating', v)} />
                <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{form.rating}/5</span>
              </div>
            </FormField>

            {/* Status */}
            <FormField label="Trạng thái">
              <select value={form.status} onChange={e => set('status', e.target.value as CarrierStatus)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={selStyle}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm ngưng</option>
              </select>
            </FormField>
          </div>

          {/* Regions */}
          <div className="mt-4">
            <FormField label="Tuyến hoạt động" required error={e('regions')}>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['nationwide','north','central','south','mekong'] as CarrierRegion[]).map(r => {
                  const on = form.regions.includes(r);
                  return (
                    <button key={r} onClick={() => toggleArr('regions', r)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: on ? '#38bdf820' : '#1e293b', color: on ? '#38bdf8' : '#64748b', border: `1px solid ${on ? '#38bdf840' : '#334155'}` }}>
                      {CARRIER_REGION_LABELS[r]}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>

          {/* Services */}
          <div className="mt-4">
            <FormField label="Dịch vụ hỗ trợ" required error={e('services')}>
              <div className="flex flex-wrap gap-2 mt-1">
                {(['cod','express','standard','bulky','fragile'] as CarrierService[]).map(s => {
                  const on = form.services.includes(s);
                  return (
                    <button key={s} onClick={() => toggleArr('services', s)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: on ? '#10b98120' : '#1e293b', color: on ? '#10b981' : '#64748b', border: `1px solid ${on ? '#10b98130' : '#334155'}` }}>
                      {CARRIER_SERVICE_LABELS[s]}
                    </button>
                  );
                })}
              </div>
            </FormField>
          </div>
        </Section>

        {/* API Config — chỉ hiện khi type === 'api' */}
        {form.type === 'api' && (
          <Section title="Cấu hình kết nối API">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="API Key" required error={e('apiKey')}>
                <input value={form.apiKey} onChange={ev => set('apiKey', ev.target.value)} onBlur={() => touch('apiKey')}
                  placeholder="Dán API Key vào đây"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none font-mono"
                  style={iStyle(e('apiKey'))} />
              </FormField>

              <FormField label="Secret Key">
                <input value={form.secretKey} onChange={ev => set('secretKey', ev.target.value)}
                  placeholder="Secret Key (nếu có)"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none font-mono" style={iStyle()} />
              </FormField>

              <FormField label="Endpoint URL">
                <input value={form.endpointUrl} onChange={ev => set('endpointUrl', ev.target.value)}
                  placeholder="https://api.hãng.vn/v2"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>

              <FormField label="Mã đối tác (Partner Code)">
                <input value={form.partnerCode} onChange={ev => set('partnerCode', ev.target.value)}
                  placeholder="Mã do hãng cấp (nếu có)"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>
            </div>

            {/* Test connection button */}
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all"
                style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b30' }}
              >
                <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
                {testing ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
              </button>

              {testResult && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: testResult.ok ? '#10b98115' : '#ef444415', border: `1px solid ${testResult.ok ? '#10b98130' : '#ef444430'}`, color: testResult.ok ? '#10b981' : '#ef4444' }}>
                  {testResult.ok ? <Check size={12} /> : <AlertTriangle size={12} />}
                  {testResult.msg}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Manual config — chỉ hiện khi type === 'manual' */}
        {form.type === 'manual' && (
          <Section title="Thông tin xe & tuyến đường">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Biển số xe">
                <input value={form.licensePlate} onChange={ev => set('licensePlate', ev.target.value.toUpperCase())}
                  placeholder="VD: 51B-123.45"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none font-black" style={iStyle()} />
              </FormField>

              <FormField label="Tên tài xế">
                <input value={form.driverName} onChange={ev => set('driverName', ev.target.value)}
                  placeholder="Họ tên tài xế hay lấy hàng"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>

              <FormField label="Địa chỉ bến xe / điểm tập kết">
                <input value={form.terminalAddress} onChange={ev => set('terminalAddress', ev.target.value)}
                  placeholder="VD: Bến xe Miền Tây, 395 Kinh Dương Vương"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>

              <FormField label="Giờ xuất bến">
                <input type="time" value={form.departureTime} onChange={ev => set('departureTime', ev.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>

              <FormField label="Ghi chú tuyến đường" className="col-span-2">
                <input value={form.routeNote} onChange={ev => set('routeNote', ev.target.value)}
                  placeholder="VD: HCM → Cần Thơ → Cà Mau. Giao điểm bến Ninh Kiều."
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
              </FormField>
            </div>
          </Section>
        )}

        {/* Người liên hệ */}
        <Section
          title={`Người liên hệ (${form.contacts.length})`}
          action={<button onClick={addContact} className="flex items-center gap-1 text-[10px] font-black" style={{ color: '#38bdf8' }}><Plus size={10} /> Thêm</button>}
        >
          {e('contacts') && <p className="mb-3 text-[10px]" style={{ color: '#ef4444' }}>{e('contacts')}</p>}
          <div className="space-y-4">
            {form.contacts.map((c, i) => (
              <div key={c.id} className={i > 0 ? 'pt-4' : ''} style={{ borderTop: i > 0 ? '1px solid #1e293b' : 'none' }}>
                <div className="grid grid-cols-3 gap-3">
                  <FormField label={i === 0 ? 'Tên liên hệ chính *' : `Tên liên hệ ${i + 1}`} error={e(`cname_${i}`)}>
                    <input value={c.name} onChange={ev => updateContact(c.id, 'name', ev.target.value)} onBlur={() => touch(`cname_${i}`)}
                      placeholder="Họ và tên" className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle(e(`cname_${i}`))} />
                  </FormField>

                  <FormField label="Vai trò">
                    <select value={c.role} onChange={ev => updateContact(c.id, 'role', ev.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={selStyle}>
                      {Object.entries(SHIPPING_CONTACT_ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </FormField>

                  <FormField label="Số điện thoại *" error={e(`cphone_${i}`)}>
                    <div className="relative">
                      <input value={c.phone} onChange={ev => updateContact(c.id, 'phone', ev.target.value.replace(/\D/g, ''))} onBlur={() => touch(`cphone_${i}`)}
                        placeholder="0901234567" maxLength={10}
                        className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle(e(`cphone_${i}`))} />
                      {i > 0 && (
                        <button onClick={() => removeContact(c.id)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded" style={{ color: '#ef4444' }}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  </FormField>

                  <FormField label="Email" error={e(`cemail_${i}`)}>
                    <input value={c.email ?? ''} onChange={ev => updateContact(c.id, 'email', ev.target.value)} onBlur={() => touch(`cemail_${i}`)}
                      type="email" placeholder="email@hãng.vn" className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle(e(`cemail_${i}`))} />
                  </FormField>

                  <FormField label="Zalo ID">
                    <input value={c.zaloId ?? ''} onChange={ev => updateContact(c.id, 'zaloId', ev.target.value)}
                      placeholder="SĐT Zalo" className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
                  </FormField>

                  <FormField label="Ghi chú">
                    <input value={c.note ?? ''} onChange={ev => updateContact(c.id, 'note', ev.target.value)}
                      placeholder="VD: Sale khu vực HCM, giờ làm 8h-17h"
                      className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
                  </FormField>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Hợp đồng & ghi chú */}
        <Section title="Hợp đồng & Bảng giá">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Địa chỉ bưu cục hay ra gửi">
              <input value={form.dropOffAddress} onChange={ev => set('dropOffAddress', ev.target.value)}
                placeholder="Địa chỉ bưu cục / bến xe hay sử dụng"
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
            </FormField>

            <FormField label="Link bảng giá (ảnh/Google Drive)">
              <input value={form.priceNoteUrl} onChange={ev => set('priceNoteUrl', ev.target.value)}
                placeholder="https://drive.google.com/..."
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
            </FormField>

            <FormField label="Ngày ký hợp đồng">
              <input type="date" value={form.contractSignedAt} onChange={ev => set('contractSignedAt', ev.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
            </FormField>

            <FormField label="Ngày hết hạn HĐ">
              <input type="date" value={form.contractExpiresAt} onChange={ev => set('contractExpiresAt', ev.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none" style={iStyle()} />
            </FormField>
          </div>
        </Section>

        <Section title="Ghi chú đặc thù">
          <textarea value={form.notes} onChange={ev => set('notes', ev.target.value)}
            placeholder="VD: Chỉ nhận hàng dưới 20kg/kiện. Mạnh khu vực Miền Tây. Thanh toán tiền mặt tại bến..."
            rows={3} className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }} />
        </Section>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// SECTION 3 — CARRIER DETAIL
// ─────────────────────────────────────────────────────────────────────────
function CarrierDetail({ carrierId, onBack, onEdit }: {
  carrierId: string; onBack: () => void; onEdit: (id: string) => void;
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [carrier, setCarrier] = useState<Carrier | undefined>(getCarrierById(carrierId));

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testApiConnection(carrierId);
    setTestResult({ ok: res.ok, msg: res.message });
    setCarrier(getCarrierById(carrierId)); // Refresh after test
    setTesting(false);
  };

  const [now] = useState(() => Date.now());

  if (!carrier) return null;

  const sc = pct(carrier.stats.successOrders, carrier.stats.totalOrders);
  const rc = pct(carrier.stats.returnedOrders, carrier.stats.totalOrders);
  const contractExpiring = carrier.contractExpiresAt
    ? (new Date(carrier.contractExpiresAt).getTime() - now) / 86400000 < 60
    : false;

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div className="px-6 py-3 flex-shrink-0" style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 rounded-lg" style={{ background: '#1e293b', color: '#64748b' }}>
              <ArrowLeft size={14} />
            </button>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black" style={{ background: '#1e293b', color: carrier.type === 'api' ? '#38bdf8' : '#c17f44' }}>
              {carrier.carrierCode.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-black text-white">{carrier.name}</h1>
                {carrier.isDefault && <span className="px-1.5 py-0.5 rounded text-[9px] font-black" style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98130' }}>MẶC ĐỊNH</span>}
                <Bdg label={CARRIER_STATUS_LABELS[carrier.status]} color={CARRIER_STATUS_COLORS[carrier.status]} pulse={carrier.status === 'api_error'} />
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black" style={{ color: '#475569' }}>{carrier.carrierCode}</span>
                <span className="text-[10px]" style={{ color: '#334155' }}>•</span>
                <span className="text-[10px]" style={{ color: carrier.type === 'api' ? '#38bdf8' : '#c17f44' }}>{carrier.type === 'api' ? 'API' : 'Thủ công'}</span>
                <Stars value={carrier.rating} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {carrier.type === 'api' && (
              <button onClick={handleTest} disabled={testing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
                style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b30' }}>
                <RefreshCw size={12} className={testing ? 'animate-spin' : ''} />
                {testing ? 'Đang test...' : 'Test kết nối'}
              </button>
            )}
            <button onClick={() => onEdit(carrierId)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black" style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}>
              <Edit2 size={12} /> Sửa
            </button>
          </div>
        </div>

        {/* Test result */}
        {testResult && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: testResult.ok ? '#10b98115' : '#ef444415', border: `1px solid ${testResult.ok ? '#10b98130' : '#ef444430'}`, color: testResult.ok ? '#10b981' : '#ef4444' }}>
            {testResult.ok ? <Check size={12} /> : <AlertTriangle size={12} />}
            {testResult.msg}
            <span className="ml-auto text-[10px]" style={{ color: '#475569' }}>
              {fmtDatetime(carrier.apiConfig?.lastTestedAt)}
            </span>
          </div>
        )}

        {/* Contract expiring warning */}
        {contractExpiring && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
            style={{ background: '#f59e0b15', border: '1px solid #f59e0b30', color: '#f59e0b' }}>
            <AlertTriangle size={12} />
            Hợp đồng sắp hết hạn: {fmtDate(carrier.contractExpiresAt)}
          </div>
        )}

        {/* KPI stats */}
        <div className="grid grid-cols-5 gap-2 mt-3">
          <Stat label="Tháng này" value={`${carrier.stats.monthlyOrders} đơn`} color="#38bdf8" />
          <Stat label="Tổng đơn" value={`${carrier.stats.totalOrders}`} color="#94a3b8" />
          <Stat label="Tỷ lệ thành công" value={`${sc}%`} color={sc >= 95 ? '#10b981' : sc >= 85 ? '#f59e0b' : '#ef4444'} />
          <Stat label="Tỷ lệ hoàn hàng" value={`${rc}%`} color={rc > 10 ? '#ef4444' : rc > 5 ? '#f59e0b' : '#10b981'} />
          <Stat label="Giao TB" value={`${carrier.stats.avgDeliveryDays} ngày`} color="#a78bfa" sub={`COD về: ${carrier.stats.avgCodSettlementDays}d`} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>

        {/* Contacts */}
        <Section title={`Người liên hệ (${carrier.contacts.length})`}>
          <div className="space-y-4">
            {carrier.contacts.map((c, i) => (
              <div key={c.id} className={i > 0 ? 'pt-4' : ''} style={{ borderTop: i > 0 ? '1px solid #1e293b' : 'none' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>
                    {SHIPPING_CONTACT_ROLE_LABELS[c.role]}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Users size={11} style={{ color: '#475569' }} />
                    <span style={{ color: '#94a3b8' }}>Tên:</span>
                    <span className="font-bold text-white">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={11} style={{ color: '#38bdf8' }} />
                    <span className="font-bold" style={{ color: '#38bdf8' }}>{c.phone}</span>
                    <CopyBtn value={c.phone} />
                  </div>
                  {c.email && <div className="flex items-center gap-2"><Mail size={11} style={{ color: '#475569' }} /><span style={{ color: '#94a3b8' }}>{c.email}</span></div>}
                  {c.zaloId && <div className="flex items-center gap-2"><MessageCircle size={11} style={{ color: '#a78bfa' }} /><span style={{ color: '#a78bfa' }}>Zalo: {c.zaloId}</span><CopyBtn value={c.zaloId} /></div>}
                  {c.note && <div className="col-span-2 text-[11px] px-3 py-1.5 rounded-lg" style={{ background: '#f59e0b10', color: '#f59e0b' }}>💡 {c.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* API / Manual config */}
        {carrier.type === 'api' && carrier.apiConfig && (
          <Section title="Cấu hình API">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #0f172a' }}>
                <span style={{ color: '#64748b' }}>Endpoint</span>
                <span className="font-mono font-bold" style={{ color: '#94a3b8' }}>{carrier.apiConfig.endpointUrl ?? '--'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid #0f172a' }}>
                <span style={{ color: '#64748b' }}>API Key</span>
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px]" style={{ color: '#64748b' }}>
                    {carrier.apiConfig.apiKey ? carrier.apiConfig.apiKey.slice(0, 8) + '••••••••' : '--'}
                  </span>
                  {carrier.apiConfig.apiKey && <CopyBtn value={carrier.apiConfig.apiKey} />}
                </div>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span style={{ color: '#64748b' }}>Kiểm tra lần cuối</span>
                <span style={{ color: '#94a3b8' }}>{fmtDatetime(carrier.apiConfig.lastTestedAt)}</span>
              </div>
              {carrier.apiConfig.errorMessage && (
                <div className="mt-2 px-3 py-2 rounded-xl text-[11px]" style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444' }}>
                  {carrier.apiConfig.errorMessage}
                </div>
              )}
            </div>
          </Section>
        )}

        {carrier.type === 'manual' && carrier.manualConfig && (
          <Section title="Thông tin xe & tuyến">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Biển số xe', carrier.manualConfig.licensePlate, true],
                ['Tài xế', carrier.manualConfig.driverName, false],
                ['Giờ xuất bến', carrier.manualConfig.departureTime, false],
                ['Bến xe', carrier.manualConfig.terminalAddress, false],
              ].map(([l, v, copy]) => v ? (
                <div key={l as string} className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid #0f172a' }}>
                  <span className="w-28 flex-shrink-0" style={{ color: '#64748b' }}>{l as string}</span>
                  <span className="font-bold text-white">{v as string}</span>
                  {copy && <CopyBtn value={v as string} />}
                </div>
              ) : null)}
              {carrier.manualConfig.routeNote && (
                <div className="col-span-2 px-3 py-2 rounded-xl text-[11px]" style={{ background: '#c17f4410', border: '1px solid #c17f4420', color: '#c17f44' }}>
                  🚌 {carrier.manualConfig.routeNote}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Contract */}
        <Section title="Hợp đồng & Bảng giá">
          <div className="space-y-2 text-xs">
            {carrier.dropOffAddress && (
              <div className="flex items-start gap-2 py-1.5" style={{ borderBottom: '1px solid #0f172a' }}>
                <MapPin size={12} style={{ color: '#475569', marginTop: 1 }} />
                <span className="w-32 flex-shrink-0" style={{ color: '#64748b' }}>Bưu cục hay gửi</span>
                <span className="text-white font-bold">{carrier.dropOffAddress}</span>
              </div>
            )}
            {(carrier.contractSignedAt || carrier.contractExpiresAt) && (
              <div className="flex items-center gap-2 py-1.5" style={{ borderBottom: '1px solid #0f172a' }}>
                <FileText size={12} style={{ color: '#475569' }} />
                <span className="w-32 flex-shrink-0" style={{ color: '#64748b' }}>Hợp đồng</span>
                <span style={{ color: contractExpiring ? '#f59e0b' : '#94a3b8' }}>
                  {fmtDate(carrier.contractSignedAt)} → {fmtDate(carrier.contractExpiresAt)}
                  {contractExpiring && ' ⚠ Sắp hết hạn!'}
                </span>
              </div>
            )}
            {carrier.priceNoteUrl && (
              <div className="flex items-center gap-2 py-1.5">
                <ExternalLink size={12} style={{ color: '#38bdf8' }} />
                <a href={carrier.priceNoteUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold" style={{ color: '#38bdf8' }}>
                  Xem bảng giá →
                </a>
              </div>
            )}
          </div>
        </Section>

        {carrier.notes && (
          <Section title="Ghi chú đặc thù">
            <p className="text-xs" style={{ color: '#94a3b8' }}>{carrier.notes}</p>
          </Section>
        )}
      </div>
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

export default function DonViVanChuyenPage() {
  const [view, setView] = useState<View>({ type: 'list' });

  return (
    <div className="h-full flex flex-col" style={{ background: '#020817', color: 'white' }}>
      {view.type === 'list' && (
        <CarrierList
          onSelect={id => setView({ type: 'detail', id })}
          onCreateNew={() => setView({ type: 'form', mode: 'create' })}
        />
      )}
      {view.type === 'detail' && (
        <CarrierDetail
          carrierId={view.id}
          onBack={() => setView({ type: 'list' })}
          onEdit={id => setView({ type: 'form', mode: 'edit', id })}
        />
      )}
      {view.type === 'form' && (
        <CarrierForm
          mode={view.mode}
          carrierId={view.id}
          onSave={c => setView({ type: 'detail', id: c.id })}
          onCancel={() => view.id ? setView({ type: 'detail', id: view.id }) : setView({ type: 'list' })}
        />
      )}
    </div>
  );
}