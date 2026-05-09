// shippingTypes.ts
// Thay thế toàn bộ shippingTypes.ts cũ + shippingMockData.ts (phần types)
// shippingMockData.ts bị xóa — data chuyển hết vào shippingService.ts

// ── Generic API result wrapper ────────────────────────────────────────────
// Tất cả service functions trả ApiResult<T>.
// UI chỉ check result.ok — không quan tâm mock hay real API.

export interface ApiSuccess<T> { ok: true;  data: T }
export interface ApiError      { ok: false; errorCode: string; message: string }
export type ApiResult<T> = ApiSuccess<T> | ApiError

// ── Error codes ───────────────────────────────────────────────────────────

export const ERROR_CODES = {
  ALREADY_SCANNED_IN_SESSION: 'ALREADY_SCANNED_IN_SESSION',
  ALREADY_HANDED_OVER:        'ALREADY_HANDED_OVER',
  NOT_FOUND:                  'NOT_FOUND',
  ORDER_CANCELLED:            'ORDER_CANCELLED',
  WRONG_CARRIER:              'WRONG_CARRIER',
  WRONG_WAREHOUSE:            'WRONG_WAREHOUSE',
  NOT_A_RETURN:               'NOT_A_RETURN',
  QTY_EXCEEDS_SHIPPED:        'QTY_EXCEEDS_SHIPPED',
  RETURN_ALREADY_PROCESSED:   'RETURN_ALREADY_PROCESSED',
  INVALID_FILE_FORMAT:        'INVALID_FILE_FORMAT',
  INVALID_STATUS_TRANSITION:  'INVALID_STATUS_TRANSITION',
  SPLIT_NOT_PACKING:          'SPLIT_NOT_PACKING',
  SPLIT_QTY_MISMATCH:         'SPLIT_QTY_MISMATCH',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// ─────────────────────────────────────────────────────────────────────────
// MH1 — MANIFEST
// ─────────────────────────────────────────────────────────────────────────

export interface StartSessionRequest {
  carrierCode:  string
  warehouseId:  string
  operatorId:   string
}

export interface StartSessionResponse {
  manifestId:   string   // "MF_20260509_001"
  carrierCode:  string
  startedAt:    string
  operatorId:   string
  operatorName: string
}

export interface ValidateScanRequest {
  manifestId:   string
  trackingCode: string
}

export interface ScannedItem {
  trackingCode:     string
  orderId:          string
  orderCode:        string
  receiverName:     string
  receiverProvince: string
  carrierCode:      string
  codAmount:        number
  weightGrams:      number
}

export interface ConfirmManifestRequest {
  manifestId:           string
  carrierCode:          string
  totalPackages:        number
  scannedTrackingCodes: string[]
  createdBy:            string
}

export interface ConfirmManifestResponse {
  manifestId:       string
  confirmedAt:      string
  manifestPdfUrl:   string
  shipmentsUpdated: number
  summary: {
    byCarrier: Record<string, number>
    totalCod:  number
  }
}

// ─────────────────────────────────────────────────────────────────────────
// MH2 — RETURN QC
// ─────────────────────────────────────────────────────────────────────────

export type ReturnReason =
  | 'CUSTOMER_REFUSED'
  | 'WRONG_ADDRESS'
  | 'NOT_HOME'
  | 'DAMAGED_BY_CARRIER'
  | 'OTHER'

export const RETURN_REASON_LABELS: Record<ReturnReason, string> = {
  CUSTOMER_REFUSED:   'Khách từ chối nhận',
  WRONG_ADDRESS:      'Sai địa chỉ',
  NOT_HOME:           'Không có người nhận',
  DAMAGED_BY_CARRIER: 'Hàng bị hỏng khi vận chuyển',
  OTHER:              'Lý do khác',
}

export interface ReturnLookupItem {
  sku:         string
  productName: string
  imageUrl?:   string
  color:       string
  size:        string
  qtyShipped:  number
}

export interface ReturnLookupResponse {
  shipmentId:        string
  trackingCode:      string
  orderId:           string
  orderCode:         string
  customerName:      string
  carrierCode:       string
  returnReason?:     ReturnReason
  returnReasonNote?: string
  items:             ReturnLookupItem[]
}

export type ReturnCondition = 'GOOD' | 'DAMAGED' | 'MISSING'

export const RETURN_CONDITION_LABELS: Record<ReturnCondition, string> = {
  GOOD:    'Hàng Mới — Còn nguyên vẹn',
  DAMAGED: 'Bẩn / Lỗi / Hỏng',
  MISSING: 'Thất lạc',
}

export const RETURN_CONDITION_COLORS: Record<ReturnCondition, string> = {
  GOOD:    '#10b981',
  DAMAGED: '#f59e0b',
  MISSING: '#64748b',
}

export type ReturnTarget = 'sellable' | 'qc_hold' | 'damaged_bin'

export const CONDITION_TO_TARGET: Record<ReturnCondition, ReturnTarget> = {
  GOOD:    'sellable',
  DAMAGED: 'qc_hold',
  MISSING: 'damaged_bin',
}

export const TARGET_BIN_LABELS: Record<ReturnTarget, string> = {
  sellable:    'Kho bán (Sellable)',
  qc_hold:     'Vị trí ảo QC — Chờ xử lý',
  damaged_bin: 'Kho hàng lỗi',
}

export const TARGET_BIN_CODES: Record<ReturnTarget, string> = {
  sellable:    'BIN_SELLABLE_A1',
  qc_hold:     'VIRTUAL_BIN_QC_01',
  damaged_bin: 'BIN_DAMAGED_01',
}

export interface ProcessReturnItem {
  sku:             string
  qtyReturned:     number
  condition:       ReturnCondition
  targetBin:       ReturnTarget
  qcNote?:         string
}

export interface ProcessReturnRequest {
  originalTrackingCode: string
  orderId:              string
  inspectedBy:          string
  returnItems:          ProcessReturnItem[]
  qcImages?:            string[]
}

export interface ProcessReturnResponse {
  returnId:            string
  stockMovements:      { sku: string; action: string; qty: number; binLocation: string }[]
  accountingTriggered: boolean
  claimsCreated?:      number
}

// ─────────────────────────────────────────────────────────────────────────
// MH3 — RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────

export type MatchStatus =
  | 'MATCHED'
  | 'MISMATCH_FEE'
  | 'MISMATCH_COD'
  | 'MISMATCH_WEIGHT'
  | 'MISMATCH_STATUS'
  | 'MISMATCH_MULTI'
  | 'MISSING_IN_DB'
  | 'MISSING_IN_FILE'

export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  MATCHED:          'Khớp',
  MISMATCH_FEE:     'Lệch phí ship',
  MISMATCH_COD:     'Lệch COD',
  MISMATCH_WEIGHT:  'Lệch cân nặng',
  MISMATCH_STATUS:  'Lệch trạng thái',
  MISMATCH_MULTI:   'Lệch nhiều chỉ tiêu',
  MISSING_IN_DB:    'Không có trong hệ thống',
  MISSING_IN_FILE:  'Không có trong file hãng',
}

export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  MATCHED:          '#10b981',
  MISMATCH_FEE:     '#f97316',
  MISMATCH_COD:     '#ef4444',
  MISMATCH_WEIGHT:  '#f59e0b',
  MISMATCH_STATUS:  '#f59e0b',
  MISMATCH_MULTI:   '#ef4444',
  MISSING_IN_DB:    '#f97316',
  MISSING_IN_FILE:  '#64748b',
}

export interface CompareField {
  sysVal:     number
  carrierVal: number
  diff:       number
}

export interface ReconcileRow {
  id:             string
  trackingCode:   string
  carrierCode:    string
  orderCode:      string
  matchStatus:    MatchStatus
  codCompare:     CompareField
  feeCompare:     CompareField
  weightCompare:  CompareField
  resolved:       boolean
  resolutionNote?: string
}

export interface ImportReconcileResponse {
  reconciliationId: string
  totalRows:        number
  summary: {
    matched:       number
    mismatched:    number
    missingInDb:   number
    missingInFile: number
  }
  rows: ReconcileRow[]
}

export interface ConfirmPaymentRequest {
  transferDate:       string
  transferAmount:     number
  transferReference:  string
  approvedMismatches: { trackingCode: string; approvedDiff: number; note: string }[]
}

// ─────────────────────────────────────────────────────────────────────────
// MH4 — SHIPMENT / KANBAN
// ─────────────────────────────────────────────────────────────────────────

export type ShipmentStatus =
  | 'created'
  | 'packing'
  | 'ready_to_handover'
  | 'handed_over'
  | 'picked_up'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'failed'
  | 'retry'
  | 'returning'
  | 'returned'
  | 'return_processed'
  | 'split_cancelled'

export const VALID_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  created:           ['packing', 'split_cancelled'],
  packing:           ['ready_to_handover', 'split_cancelled'],
  ready_to_handover: ['handed_over', 'packing'],
  handed_over:       ['picked_up'],
  picked_up:         ['in_transit'],
  in_transit:        ['out_for_delivery'],
  out_for_delivery:  ['delivered', 'failed'],
  delivered:         [],
  failed:            ['retry', 'returning'],
  retry:             ['out_for_delivery', 'returning'],
  returning:         ['returned'],
  returned:          ['return_processed'],
  return_processed:  [],
  split_cancelled:   [],
}

export const KANBAN_COLS = [
  { key: 'packing',        label: 'Chờ đóng gói',    color: '#64748b' },
  { key: 'waiting_pickup', label: 'Chờ lấy hàng',    color: '#f59e0b' },
  { key: 'delivering',     label: 'Đang giao',        color: '#38bdf8' },
  { key: 'success',        label: 'Thành công',       color: '#10b981' },
  { key: 'cancelled',      label: 'Đã hủy / Tách',   color: '#ef4444' },
  { key: 'returning',      label: 'Hoàn / Thất bại', color: '#f97316' },
] as const

export type KanbanColKey = typeof KANBAN_COLS[number]['key']

export interface ShipmentItem {
  sku:         string
  productName: string
  color:       string
  size:        string
  qty:         number
  imageUrl?:   string
}

export interface TrackingEvent {
  time:      string
  status:    string
  location?: string
  note:      string
}

export interface Shipment {
  id:                string
  shipmentCode:      string
  trackingCode:      string
  carrierId:         number
  carrierCode:       string
  orderId:           string
  orderCode:         string
  customerName:      string
  customerPhone:     string
  shippingAddress:   string
  province:          string
  status:            ShipmentStatus
  codAmount:         number
  shippingFee:       number
  weightGrams:       number
  items:             ShipmentItem[]
  trackingHistory:   TrackingEvent[]
  parentShipmentId?: string
  isSplit:           boolean
  expectedDelivery?: string
  handedOverAt?:     string
  deliveredAt?:      string
  labelUrl?:         string
  createdAt:         string
  updatedAt:         string
}

export interface KanbanBoard {
  columns: {
    colKey:    KanbanColKey
    label:     string
    color:     string
    count:     number
    shipments: Shipment[]
    hasMore:   boolean
  }[]
}

export interface SplitRequest {
  splits: {
    items:       { sku: string; qty: number }[]
    carrierId:   number
    serviceCode: string
  }[]
}

// ─────────────────────────────────────────────────────────────────────────
// MH5 — SHIPMENT CREATION
// ─────────────────────────────────────────────────────────────────────────

export interface QuoteRequest {
  orderId:     string
  weightGrams: number
  codAmount:   number
  toProvince:  string
  toDistrict:  string
}

export interface CarrierQuote {
  carrierId:        number
  carrierCode:      string
  carrierName:      string
  serviceCode:      string
  serviceName:      string
  fee:              number
  estimatedDays:    number
  isRecommended:    boolean
  recommendReason?: string
}

export interface CreateShipmentRequest {
  orderId:     string
  carrierId:   number
  serviceCode: string
  weightGrams: number
  codAmount:   number
  feePayer:    'sender' | 'receiver'
  note?:       string
}

export interface CreateShipmentResponse {
  shipmentId:       string
  trackingCode:     string
  fee:              number
  expectedDelivery: string
  labelUrl:         string
}

export interface BulkCreateItem {
  orderId:     string
  carrierId:   number
  serviceCode: string
}

// ─────────────────────────────────────────────────────────────────────────
// MH6 — REPORTS
// ─────────────────────────────────────────────────────────────────────────

export interface CarrierPerformance {
  carrierCode:     string
  carrierName:     string
  total:           number
  successRate:     number
  avgDeliveryDays: number
  returnRate:      number
  avgFee:          number
}

export interface DailyTrend {
  date:    string
  count:   number
  success: number
  failed:  number
}

export interface FailureReason {
  reason:     string
  count:      number
  percentage: number
}

export interface ShippingReport {
  period: { from: string; to: string }
  kpis: {
    totalShipments: number
    delivered:      number
    failed:         number
    returned:       number
    successRate:    number
    returnRate:     number
    vsPrevious: { successRate: number; returnRate: number }
  }
  shippingFee: {
    total:     number
    average:   number
    byCarrier: { carrier: string; fee: number; count: number }[]
  }
  carrierPerformance: CarrierPerformance[]
  trends: { daily: DailyTrend[] }
  failureReasons: FailureReason[]
}

// ─────────────────────────────────────────────────────────────────────────
// WebSocket events
// ─────────────────────────────────────────────────────────────────────────

export interface ShipmentStatusChangedEvent {
  event:       'shipment.status_changed'
  shipmentId:  string
  trackingCode: string
  oldStatus:   ShipmentStatus
  newStatus:   ShipmentStatus
  shipment:    Shipment
  occurredAt:  string
}

export interface BulkItemEvent {
  event:  'bulk.item_completed'
  jobId:  string
  item: {
    orderId:       string
    status:        'success' | 'error'
    trackingCode?: string
    errorMessage?: string
  }
}

export interface BulkDoneEvent {
  event:        'bulk.completed'
  jobId:        string
  successCount: number
  errorCount:   number
}

export type WsEvent = ShipmentStatusChangedEvent | BulkItemEvent | BulkDoneEvent