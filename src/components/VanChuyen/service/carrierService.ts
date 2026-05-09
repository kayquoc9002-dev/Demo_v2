// carrierService.ts
import type { Carrier } from '../data/carrierTypes';
import { MOCK_CARRIERS } from '../data/carrierMockData';

let _db: Carrier[] = [...MOCK_CARRIERS];

// ── CRUD ──────────────────────────────────────────────────────────────────
export function getAllCarriers(): Carrier[] {
  // Sau này: fetch('/api/carriers')
  return [..._db].sort((a, b) => a.priorityOrder - b.priorityOrder);
}

export function getCarrierById(id: string): Carrier | undefined {
  // Sau này: fetch(`/api/carriers/${id}`)
  return _db.find(c => c.id === id);
}

export function getActiveCarriers(): Carrier[] {
  // Sau này: fetch('/api/carriers?status=active')
  // Dùng cho màn hình Bán hàng — chỉ active mới xuất hiện
  return _db.filter(c => c.status === 'active').sort((a, b) => a.priorityOrder - b.priorityOrder);
}

export function createCarrier(
  data: Omit<Carrier, 'id' | 'createdAt' | 'updatedAt'>
): Carrier {
  // Sau này: fetch('/api/carriers', { method: 'POST', body: JSON.stringify(data) })
  const now = new Date().toISOString();
  const id  = `cr${String(Date.now()).slice(-6)}`;

  // Enforce single default
  if (data.isDefault) {
    _db = _db.map(c => ({ ...c, isDefault: false }));
  }

  const newCarrier: Carrier = { ...data, id, createdAt: now, updatedAt: now };
  _db.push(newCarrier);
  return newCarrier;
}

export function updateCarrier(
  id: string,
  data: Partial<Omit<Carrier, 'id' | 'createdAt'>>
): Carrier | null {
  // Sau này: fetch(`/api/carriers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = _db.findIndex(c => c.id === id);
  if (idx === -1) return null;

  // Enforce single default
  if (data.isDefault) {
    _db = _db.map((c, i) => i !== idx ? { ...c, isDefault: false } : c);
  }

  const updated: Carrier = {
    ..._db[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  _db[idx] = updated;
  return updated;
}

export function reorderCarriers(orderedIds: string[]): void {
  // Sau này: fetch('/api/carriers/reorder', { method: 'POST', body: JSON.stringify({ orderedIds }) })
  orderedIds.forEach((id, idx) => {
    const i = _db.findIndex(c => c.id === id);
    if (i !== -1) _db[i] = { ..._db[i], priorityOrder: idx + 1 };
  });
}

export function softDeleteCarrier(id: string): boolean {
  // Sau này: fetch(`/api/carriers/${id}/deactivate`, { method: 'POST' })
  // Không hard delete nếu đã có đơn hàng — chỉ chuyển inactive
  const carrier = _db.find(c => c.id === id);
  if (!carrier) return false;
  const hasOrders = carrier.stats.totalOrders > 0;
  if (hasOrders) {
    // Chỉ inactive
    updateCarrier(id, { status: 'inactive' });
    return true;
  }
  _db = _db.filter(c => c.id !== id);
  return true;
}

// ── API Connection Test (mock) ─────────────────────────────────────────
export async function testApiConnection(
  carrierId: string
): Promise<{ ok: boolean; message: string }> {
  // Sau này: fetch(`/api/carriers/${carrierId}/test-connection`, { method: 'POST' })
  await new Promise(r => setTimeout(r, 1200)); // Simulate network
  const carrier = _db.find(c => c.id === carrierId);
  if (!carrier || carrier.type !== 'api') return { ok: false, message: 'Không phải ĐVVC API' };

  const hasKey = !!(carrier.apiConfig?.apiKey);
  if (!hasKey) return { ok: false, message: 'API Key trống, vui lòng nhập trước khi kiểm tra.' };

  // Mock: GHN always error (expired token in mock data)
  if (carrier.carrierCode === 'GHN') {
    updateCarrier(carrierId, {
      status: 'api_error',
      apiConfig: { ...carrier.apiConfig!, connectionStatus: 'error', lastTestedAt: new Date().toISOString(), errorMessage: 'Token đã hết hạn (401 Unauthorized). Vui lòng cập nhật lại API Key.' },
    });
    return { ok: false, message: 'Token đã hết hạn (401 Unauthorized). Vui lòng cập nhật lại API Key.' };
  }

  updateCarrier(carrierId, {
    status: 'active',
    apiConfig: { ...carrier.apiConfig!, connectionStatus: 'ok', lastTestedAt: new Date().toISOString(), errorMessage: undefined },
  });
  return { ok: true, message: 'Kết nối thành công!' };
}

// ── Validate carrier code unique ─────────────────────────────────────────
export function checkCarrierCodeUnique(code: string, excludeId?: string): boolean {
  // Sau này: fetch(`/api/carriers/check-code?code=${code}`)
  return !_db.some(c => c.carrierCode === code && c.id !== excludeId);
}

// ── Filter ───────────────────────────────────────────────────────────────
export interface CarrierFilter {
  search?: string;
  region?: string;
  service?: string;
  status?: string;
  type?: string;
}

export function filterCarriers(f: CarrierFilter): Carrier[] {
  // Sau này: fetch('/api/carriers?' + new URLSearchParams(f as any))
  let r = getAllCarriers();
  if (f.search) {
    const q = f.search.toLowerCase();
    r = r.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.carrierCode.toLowerCase().includes(q) ||
      c.contacts.some(ct => ct.name.toLowerCase().includes(q) || ct.phone.includes(q))
    );
  }
  if (f.region && f.region !== 'all') r = r.filter(c => c.regions.includes(f.region as any));
  if (f.service && f.service !== 'all') r = r.filter(c => c.services.includes(f.service as any));
  if (f.status && f.status !== 'all') r = r.filter(c => c.status === f.status);
  if (f.type && f.type !== 'all') r = r.filter(c => c.type === f.type);
  return r;
}