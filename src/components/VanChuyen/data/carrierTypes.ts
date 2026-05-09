// carrierTypes.ts

export type CarrierType    = 'api' | 'manual';
export type CarrierStatus  = 'active' | 'inactive' | 'api_error';
export type CarrierRegion  = 'nationwide' | 'north' | 'central' | 'south' | 'mekong';
export type CarrierService = 'cod' | 'express' | 'standard' | 'bulky' | 'fragile';

export const CARRIER_STATUS_LABELS: Record<CarrierStatus, string> = {
  active:    'Đang hoạt động',
  inactive:  'Tạm ngưng',
  api_error: 'Lỗi kết nối API',
};

export const CARRIER_STATUS_COLORS: Record<CarrierStatus, string> = {
  active:    '#10b981',
  inactive:  '#64748b',
  api_error: '#ef4444',
};

export const CARRIER_REGION_LABELS: Record<CarrierRegion, string> = {
  nationwide: 'Toàn quốc',
  north:      'Miền Bắc',
  central:    'Miền Trung',
  south:      'Miền Nam',
  mekong:     'Miền Tây',
};

export const CARRIER_SERVICE_LABELS: Record<CarrierService, string> = {
  cod:      'Thu hộ COD',
  express:  'Giao nhanh',
  standard: 'Giao tiêu chuẩn',
  bulky:    'Hàng cồng kềnh',
  fragile:  'Hàng dễ vỡ',
};

// ── Sub-tables ────────────────────────────────────────────────────────────

export interface ShippingContact {
  id: string;
  name: string;
  role: 'account_manager' | 'hotline' | 'driver' | 'hub_manager' | 'other';
  phone: string;
  email?: string;
  zaloId?: string;
  note?: string;           // VD: "Anh Nam - xe Thứ 3 và Thứ 6"
}

export const SHIPPING_CONTACT_ROLE_LABELS: Record<ShippingContact['role'], string> = {
  account_manager: 'Sale phụ trách',
  hotline:         'Hotline khiếu nại',
  driver:          'Tài xế hay lấy hàng',
  hub_manager:     'Trưởng bưu cục',
  other:           'Khác',
};

export interface ManualCarrierConfig {
  licensePlate?: string;    // Biển số xe
  driverName?: string;      // Tên tài xế
  terminalAddress?: string; // Địa chỉ bến xe / bưu cục hay gửi
  departureTime?: string;   // Giờ xe xuất bến VD: "18:00"
  routeNote?: string;       // VD: "Chạy tuyến HCM - Cần Thơ"
}

export interface ApiCarrierConfig {
  apiKey?: string;
  secretKey?: string;
  endpointUrl?: string;
  partnerCode?: string;     // Mã đối tác (một số hãng cần)
  connectionStatus: 'untested' | 'ok' | 'error';
  lastTestedAt?: string;
  errorMessage?: string;
}

// ── Performance stats (computed / from order module) ─────────────────────

export interface CarrierStats {
  totalOrders: number;
  successOrders: number;
  returnedOrders: number;
  monthlyOrders: number;       // Tháng hiện tại
  avgDeliveryDays: number;     // Thời gian giao TB (ngày)
  avgCodSettlementDays: number; // Thời gian đối soát COD TB
}

// ── Main table ────────────────────────────────────────────────────────────

export interface Carrier {
  id: string;
  carrierCode: string;           // GHN, GHTK, VTP, CHANHE_01...
  name: string;
  logoUrl?: string;
  type: CarrierType;
  status: CarrierStatus;
  isDefault: boolean;
  rating: number;                // 1–5
  priorityOrder: number;         // Thứ tự ưu tiên (drag & drop)
  regions: CarrierRegion[];
  services: CarrierService[];
  dropOffAddress?: string;       // Địa chỉ bưu cục / bến xe hay ra gửi
  priceNoteUrl?: string;         // Link ảnh/file bảng giá
  contractSignedAt?: string;
  contractExpiresAt?: string;
  contractFileUrl?: string;
  contacts: ShippingContact[];
  manualConfig?: ManualCarrierConfig;
  apiConfig?: ApiCarrierConfig;
  stats: CarrierStats;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Validation ────────────────────────────────────────────────────────────

export const CARRIER_CODE_REGEX = /^[A-Z0-9_]+$/;
export const VN_PHONE_REGEX     = /^(0[3|5|7|8|9])\d{8}$/;
export const EMAIL_REGEX        = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;