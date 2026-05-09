// vendorService.ts
import type { Vendor } from '../data/vendorTypes';
import { MOCK_VENDORS, MOCK_VENDOR_POS } from '../data/vendorMockData';
import type { VendorPORecord } from '../data/vendorTypes';

// ── In-memory DB ──────────────────────────────────────────────────────────
let _db: Vendor[] = [...MOCK_VENDORS];

const _counters: Record<string, number> = {
  fabric:    MOCK_VENDORS.filter(v => v.category === 'fabric').length,
  trims:     MOCK_VENDORS.filter(v => v.category === 'trims').length,
  packaging: MOCK_VENDORS.filter(v => v.category === 'packaging').length,
  factory:   MOCK_VENDORS.filter(v => v.category === 'factory').length,
};

const CATEGORY_PREFIX: Record<string, string> = {
  fabric:    'V-F',
  trims:     'V-T',
  packaging: 'V-P',
  factory:   'V-C',
};

function genCode(category: string): string {
  _counters[category] = (_counters[category] ?? 0) + 1;
  return `${CATEGORY_PREFIX[category] ?? 'V-X'}${String(_counters[category]).padStart(3, '0')}`;
}

// ── CRUD ──────────────────────────────────────────────────────────────────
export function getAllVendors(): Vendor[] {
  // Sau này: fetch('/api/vendors')
  return [..._db];
}

export function getVendorById(id: string): Vendor | undefined {
  // Sau này: fetch(`/api/vendors/${id}`)
  return _db.find(v => v.id === id);
}

export function createVendor(
  data: Omit<Vendor, 'id' | 'vendorCode' | 'createdAt' | 'updatedAt'>
): Vendor {
  // Sau này: fetch('/api/vendors', { method: 'POST', body: JSON.stringify(data) })
  const now = new Date().toISOString();
  const id  = `v${String(Date.now()).slice(-6)}`;
  const vendorCode = genCode(data.category);

  const newVendor: Vendor = {
    ...data,
    id,
    vendorCode,
    createdAt: now,
    updatedAt: now,
  };

  _db.push(newVendor);
  return newVendor;
}

export function updateVendor(
  id: string,
  data: Partial<Omit<Vendor, 'id' | 'vendorCode' | 'createdAt'>>
): Vendor | null {
  // Sau này: fetch(`/api/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = _db.findIndex(v => v.id === id);
  if (idx === -1) return null;

  const updated: Vendor = {
    ..._db[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  _db[idx] = updated;
  return updated;
}

export function deleteVendor(id: string): boolean {
  // Sau này: fetch(`/api/vendors/${id}`, { method: 'DELETE' })
  const idx = _db.findIndex(v => v.id === id);
  if (idx === -1) return false;
  _db.splice(idx, 1);
  return true;
}

// ── Validation helpers ────────────────────────────────────────────────────
export function checkVendorCodeUnique(code: string, excludeId?: string): boolean {
  // Sau này: fetch(`/api/vendors/check-code?code=${code}`)
  return !_db.some(v => v.vendorCode === code && v.id !== excludeId);
}

export function checkTaxIdUnique(taxId: string, excludeId?: string): Vendor | null {
  // Sau này: fetch(`/api/vendors/check-taxid?taxId=${taxId}`)
  return _db.find(v => v.taxId === taxId && v.id !== excludeId) ?? null;
}

// ── PO History ────────────────────────────────────────────────────────────
export function getVendorPOs(vendorId: string): VendorPORecord[] {
  // Sau này: fetch(`/api/vendors/${vendorId}/purchase-orders`)
  return MOCK_VENDOR_POS[vendorId] ?? [];
}

// ── Filters ───────────────────────────────────────────────────────────────
export interface VendorFilter {
  search?: string;
  category?: string;
  status?: string;
  rating?: string;
}

export function filterVendors(filters: VendorFilter): Vendor[] {
  // Sau này: fetch('/api/vendors?' + new URLSearchParams(filters as any))
  let results = [..._db];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(v =>
      v.legalName.toLowerCase().includes(q) ||
      v.tradeName.toLowerCase().includes(q) ||
      v.vendorCode.toLowerCase().includes(q) ||
      (v.taxId?.includes(q) ?? false) ||
      v.contacts.some(c => c.phone.includes(q) || c.name.toLowerCase().includes(q))
    );
  }

  if (filters.category && filters.category !== 'all') {
    results = results.filter(v => v.category === filters.category);
  }

  if (filters.status && filters.status !== 'all') {
    results = results.filter(v => v.status === filters.status);
  }

  if (filters.rating && filters.rating !== 'all') {
    results = results.filter(v => v.rating === filters.rating);
  }

  return results;
}