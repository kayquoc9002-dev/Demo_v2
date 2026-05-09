// shippingService.ts
// Mock data sống ở đây, không có shippingMockData.ts riêng nữa.
// Tất cả functions trả ApiResult<T> — swap mock → real chỉ sửa file này.

import type {
  ApiResult,
  StartSessionRequest, StartSessionResponse,
  ValidateScanRequest, ScannedItem,
  ConfirmManifestRequest, ConfirmManifestResponse,
  ReturnLookupResponse, ReturnReason,
  ProcessReturnRequest, ProcessReturnResponse,
  ReconcileRow, MatchStatus, ImportReconcileResponse,
  ConfirmPaymentRequest,
  Shipment, ShipmentStatus, KanbanBoard,
  SplitRequest,
  QuoteRequest, CarrierQuote,
  CreateShipmentRequest, CreateShipmentResponse,
  BulkCreateItem,
  ShippingReport,
} from '../data/shippingTypes'

import { ERROR_CODES } from '../data/shippingTypes'
import { canTransition, resolveKanbanCol } from '../shippingStateMachine'

// ── Helpers ───────────────────────────────────────────────────────────────

function ok<T>(data: T): ApiResult<T> { return { ok: true, data } }
function fail<T = never>(code: string, msg: string): ApiResult<T> { return { ok: false, errorCode: code, message: msg } }
const delay = (ms = 120) => new Promise<void>(r => setTimeout(r, ms))

// ─────────────────────────────────────────────────────────────────────────
// IN-MEMORY DATA
// ─────────────────────────────────────────────────────────────────────────

const VALID_CODES: Record<string, ScannedItem> = {
  'GHTK001234567': { trackingCode: 'GHTK001234567', orderId: 'ord001', orderCode: 'DH-2412-001', receiverName: 'Nguyễn Thị Thu Hà', receiverProvince: 'TP.HCM',      carrierCode: 'GHTK', codAmount: 850_000,   weightGrams: 350 },
  'GHTK001234568': { trackingCode: 'GHTK001234568', orderId: 'ord002', orderCode: 'DH-2412-002', receiverName: 'Trần Văn Nam',       receiverProvince: 'Hà Nội',      carrierCode: 'GHTK', codAmount: 450_000,   weightGrams: 200 },
  'GHTK001234569': { trackingCode: 'GHTK001234569', orderId: 'ord003', orderCode: 'DH-2412-003', receiverName: 'Phạm Minh Tuấn',     receiverProvince: 'TP.HCM',      carrierCode: 'GHTK', codAmount: 1_200_000, weightGrams: 600 },
  'VTP009876543':  { trackingCode: 'VTP009876543',  orderId: 'ord004', orderCode: 'DH-2412-004', receiverName: 'Lê Thị Ngọc',        receiverProvince: 'Bình Dương',  carrierCode: 'VTP',  codAmount: 320_000,   weightGrams: 280 },
  'VTP009876544':  { trackingCode: 'VTP009876544',  orderId: 'ord005', orderCode: 'DH-2412-005', receiverName: 'Bùi Thành Đạt',      receiverProvince: 'TP.HCM',      carrierCode: 'VTP',  codAmount: 560_000,   weightGrams: 420 },
  'GHN555001122':  { trackingCode: 'GHN555001122',  orderId: 'ord006', orderCode: 'DH-2412-006', receiverName: 'Hoàng Thị Lan',      receiverProvince: 'Hà Nội',      carrierCode: 'GHN',  codAmount: 980_000,   weightGrams: 500 },
}

const HANDED_OVER  = new Set(['GHTK001234570'])
const CANCELLED    = new Set(['GHTK001234571'])

let _sessionCounter = 0
const _sessions: Record<string, StartSessionResponse> = {}

const RETURN_POOL: Record<string, ReturnLookupResponse> = {
  'GHTK_RETURN_001': {
    shipmentId: 'shp_r01', trackingCode: 'GHTK_RETURN_001',
    orderId: 'ord007', orderCode: 'DH-2411-089',
    customerName: 'Đặng Thị Hoa', carrierCode: 'GHTK',
    returnReason: 'CUSTOMER_REFUSED' as ReturnReason,
    returnReasonNote: 'Khách bom hàng, không nghe điện thoại 3 lần',
    items: [
      { sku: 'AKN-005-M-TRG', productName: 'Áo Kiểu Nữ',    color: 'Trắng', size: 'M',  qtyShipped: 2 },
      { sku: 'QJN-002-28-XAM', productName: 'Quần Jean Nữ', color: 'Xám',   size: '28', qtyShipped: 1 },
    ],
  },
  'VTP_RETURN_002': {
    shipmentId: 'shp_r02', trackingCode: 'VTP_RETURN_002',
    orderId: 'ord008', orderCode: 'DH-2411-112',
    customerName: 'Nguyễn Văn Hùng', carrierCode: 'VTP',
    returnReason: 'WRONG_ADDRESS' as ReturnReason,
    returnReasonNote: 'Địa chỉ sai, bưu tá không tìm được nhà',
    items: [
      { sku: 'APM-001-XL-TRG', productName: 'Áo Polo Nam', color: 'Trắng', size: 'XL', qtyShipped: 3 },
    ],
  },
}

const RECONCILE_ROWS: ReconcileRow[] = [
  { id: 'rc01', trackingCode: 'GHTK001234567', carrierCode: 'GHTK', orderCode: 'DH-2412-001', matchStatus: 'MATCHED',         resolved: false, codCompare: { sysVal: 850_000,   carrierVal: 850_000,   diff: 0 },        feeCompare: { sysVal: 22_000, carrierVal: 22_000, diff: 0 },       weightCompare: { sysVal: 350, carrierVal: 350, diff: 0 } },
  { id: 'rc02', trackingCode: 'GHTK001234568', carrierCode: 'GHTK', orderCode: 'DH-2412-002', matchStatus: 'MISMATCH_FEE',    resolved: false, codCompare: { sysVal: 450_000,   carrierVal: 450_000,   diff: 0 },        feeCompare: { sysVal: 22_000, carrierVal: 35_000, diff: -13_000 }, weightCompare: { sysVal: 200, carrierVal: 200, diff: 0 } },
  { id: 'rc03', trackingCode: 'VTP009876543',  carrierCode: 'VTP',  orderCode: 'DH-2412-004', matchStatus: 'MISMATCH_MULTI',  resolved: false, codCompare: { sysVal: 320_000,   carrierVal: 320_000,   diff: 0 },        feeCompare: { sysVal: 28_000, carrierVal: 45_000, diff: -17_000 }, weightCompare: { sysVal: 280, carrierVal: 650, diff: -370 } },
  { id: 'rc04', trackingCode: 'GHN555001122',  carrierCode: 'GHN',  orderCode: 'DH-2412-006', matchStatus: 'MATCHED',         resolved: false, codCompare: { sysVal: 980_000,   carrierVal: 980_000,   diff: 0 },        feeCompare: { sysVal: 30_000, carrierVal: 30_000, diff: 0 },       weightCompare: { sysVal: 500, carrierVal: 500, diff: 0 } },
  { id: 'rc05', trackingCode: 'VTP009876544',  carrierCode: 'VTP',  orderCode: 'DH-2412-005', matchStatus: 'MISMATCH_WEIGHT', resolved: false, codCompare: { sysVal: 560_000,   carrierVal: 560_000,   diff: 0 },        feeCompare: { sysVal: 28_000, carrierVal: 28_000, diff: 0 },       weightCompare: { sysVal: 420, carrierVal: 800, diff: -380 } },
  { id: 'rc06', trackingCode: 'GHTK001234569', carrierCode: 'GHTK', orderCode: 'DH-2412-003', matchStatus: 'MISMATCH_COD',    resolved: false, codCompare: { sysVal: 1_200_000, carrierVal: 1_050_000, diff: 150_000 },  feeCompare: { sysVal: 22_000, carrierVal: 22_000, diff: 0 },       weightCompare: { sysVal: 600, carrierVal: 600, diff: 0 } },
  { id: 'rc07', trackingCode: 'NINJA_EXTRA_01',carrierCode: 'NINJA',orderCode: 'N/A',          matchStatus: 'MISSING_IN_DB',   resolved: false, codCompare: { sysVal: 0,         carrierVal: 250_000,   diff: -250_000 }, feeCompare: { sysVal: 0,      carrierVal: 28_000, diff: -28_000 }, weightCompare: { sysVal: 0,   carrierVal: 300, diff: -300 } },
  ...Array.from({ length: 13 }, (_, i) => ({
    id: `rc${i + 10}`, trackingCode: `GHTK${String(i + 100).padStart(9, '0')}`,
    carrierCode: 'GHTK', orderCode: `DH-2412-${String(i + 10).padStart(3, '0')}`,
    matchStatus: 'MATCHED' as MatchStatus, resolved: false,
    codCompare:    { sysVal: 300_000 + i * 50_000, carrierVal: 300_000 + i * 50_000, diff: 0 },
    feeCompare:    { sysVal: 22_000, carrierVal: 22_000, diff: 0 },
    weightCompare: { sysVal: 250,    carrierVal: 250,    diff: 0 },
  })),
]

let _shipments: Shipment[] = [
  { id: 'shp001', shipmentCode: 'SHIP-2412-001', trackingCode: '',              carrierId: 2, carrierCode: 'GHTK', orderId: 'ord001', orderCode: 'DH-2412-001', customerName: 'Nguyễn Thị Thu Hà', customerPhone: '0798765432', shippingAddress: '9/4 Trần Quốc Toản, Q.3, TP.HCM', province: 'TP.HCM',      status: 'packing',          codAmount: 850_000,   shippingFee: 22_000, weightGrams: 350,   isSplit: false, items: [{ sku: 'DN-010-S-DEN',   productName: 'Đầm Nữ Dự Tiệc', color: 'Đen',  size: 'S',  qty: 1 }], trackingHistory: [], createdAt: '2024-12-12T07:00:00Z', updatedAt: '2024-12-12T07:00:00Z' },
  { id: 'shp002', shipmentCode: 'SHIP-2412-002', trackingCode: 'GHTK001234567', carrierId: 2, carrierCode: 'GHTK', orderId: 'ord002', orderCode: 'DH-2412-002', customerName: 'Trần Văn Nam',       customerPhone: '0356789012', shippingAddress: '45 Trần Thái Tông, Cầu Giấy, Hà Nội',   province: 'Hà Nội',      status: 'handed_over',      codAmount: 450_000,   shippingFee: 22_000, weightGrams: 200,   isSplit: false, items: [{ sku: 'ASN-008-S-TRG',  productName: 'Áo Sơ Mi Nữ',    color: 'Trắng',size: 'S',  qty: 2 }], trackingHistory: [{ time: '2024-12-12T08:00:00Z', status: 'Đã tạo vận đơn', note: '' }], createdAt: '2024-12-12T08:00:00Z', updatedAt: '2024-12-12T08:30:00Z' },
  { id: 'shp003', shipmentCode: 'SHIP-2412-003', trackingCode: 'GHN555001122',  carrierId: 1, carrierCode: 'GHN',  orderId: 'ord003', orderCode: 'DH-2412-003', customerName: 'Hoàng Thị Lan',      customerPhone: '0703456789', shippingAddress: '12 Tôn Đức Thắng, Đống Đa, Hà Nội',     province: 'Hà Nội',      status: 'in_transit',       codAmount: 980_000,   shippingFee: 30_000, weightGrams: 500,   isSplit: false, items: [{ sku: 'SCS-020-M-XAM',  productName: 'Set Công Sở',     color: 'Xám',  size: 'M',  qty: 3 }], trackingHistory: [{ time: '2024-12-11T07:30:00Z', status: 'Đã tạo vận đơn', note: '' }, { time: '2024-12-11T09:00:00Z', status: 'Đã lấy hàng', note: 'Bưu tá lấy hàng', location: 'Bưu cục Phú Nhuận' }, { time: '2024-12-12T06:00:00Z', status: 'Ra kho phân loại', note: '', location: 'Bưu cục Đống Đa' }], createdAt: '2024-12-11T07:00:00Z', updatedAt: '2024-12-12T06:00:00Z' },
  { id: 'shp004', shipmentCode: 'SHIP-2412-004', trackingCode: 'VTP009876543',  carrierId: 3, carrierCode: 'VTP',  orderId: 'ord004', orderCode: 'DH-2412-004', customerName: 'Lê Thị Ngọc',        customerPhone: '0855567890', shippingAddress: '101 Đại lộ Bình Dương, Bình Dương',      province: 'Bình Dương',  status: 'out_for_delivery', codAmount: 320_000,   shippingFee: 28_000, weightGrams: 280,   isSplit: false, items: [{ sku: 'APM-001-L-NAU',  productName: 'Áo Polo Nam',     color: 'Nâu',  size: 'L',  qty: 2 }], trackingHistory: [{ time: '2024-12-10T08:00:00Z', status: 'Đã tạo vận đơn', note: '' }, { time: '2024-12-10T14:00:00Z', status: 'Đã lấy hàng', note: '', location: 'Bưu cục VTP Q.1' }, { time: '2024-12-11T09:00:00Z', status: 'Đang giao', note: '', location: 'Bưu cục VTP Bình Dương' }], createdAt: '2024-12-10T07:30:00Z', updatedAt: '2024-12-11T09:00:00Z' },
  { id: 'shp005', shipmentCode: 'SHIP-2412-005', trackingCode: 'GHTK001234568', carrierId: 2, carrierCode: 'GHTK', orderId: 'ord005', orderCode: 'DH-2412-005', customerName: 'Bùi Thành Đạt',      customerPhone: '0581234567', shippingAddress: '22 Nguyễn Văn Cừ, Q.5, TP.HCM',         province: 'TP.HCM',      status: 'delivered',        codAmount: 560_000,   shippingFee: 22_000, weightGrams: 420,   isSplit: false, items: [{ sku: 'VH-003-M-HOA',   productName: 'Váy Hè',          color: 'Hoa',  size: 'M',  qty: 1 }, { sku: 'AKN-005-S-TRG', productName: 'Áo Kiểu Nữ', color: 'Trắng', size: 'S', qty: 1 }], trackingHistory: [{ time: '2024-12-09T08:00:00Z', status: 'Đã tạo vận đơn', note: '' }, { time: '2024-12-10T14:45:00Z', status: 'Giao thành công', note: 'Khách đã nhận hàng', location: 'Q.5, TP.HCM' }], createdAt: '2024-12-09T07:00:00Z', updatedAt: '2024-12-10T14:45:00Z' },
  { id: 'shp006', shipmentCode: 'SHIP-2412-006', trackingCode: 'VTP009876544',  carrierId: 3, carrierCode: 'VTP',  orderId: 'ord006', orderCode: 'DH-2412-006', customerName: 'Đặng Quốc Tuấn',     customerPhone: '0703456789', shippingAddress: '45 Lê Văn Việt, Q.9, TP.HCM',           province: 'TP.HCM',      status: 'returning',        codAmount: 1_500_000, shippingFee: 28_000, weightGrams: 1200, isSplit: false, items: [{ sku: 'APM-001-XL-TRG', productName: 'Áo Polo Nam',     color: 'Trắng',size: 'XL', qty: 5 }, { sku: 'QJN-002-32-DEN', productName: 'Quần Jean Nam', color: 'Đen', size: '32', qty: 3 }], trackingHistory: [{ time: '2024-12-08T08:00:00Z', status: 'Đã tạo vận đơn', note: '' }, { time: '2024-12-09T10:00:00Z', status: 'Giao không thành công', note: 'Khách không nghe máy' }, { time: '2024-12-11T08:00:00Z', status: 'Đang hoàn về kho', note: '' }], createdAt: '2024-12-08T07:00:00Z', updatedAt: '2024-12-11T08:00:00Z' },
  { id: 'shp007', shipmentCode: 'SHIP-2412-007', trackingCode: '',              carrierId: 2, carrierCode: 'GHTK', orderId: 'ord007', orderCode: 'DH-2412-007', customerName: 'Trương Thị Mai',     customerPhone: '0901238888', shippingAddress: '11 Đinh Tiên Hoàng, Q.1, TP.HCM',       province: 'TP.HCM',      status: 'split_cancelled',  codAmount: 350_000,   shippingFee: 22_000, weightGrams: 180,   isSplit: false, items: [{ sku: 'AKN-005-M-HOA',  productName: 'Áo Kiểu Nữ',     color: 'Hoa',  size: 'M',  qty: 1 }], trackingHistory: [{ time: '2024-12-07T14:00:00Z', status: 'Đã hủy', note: 'Tách đơn' }], createdAt: '2024-12-07T09:00:00Z', updatedAt: '2024-12-07T14:00:00Z' },
]

// ─────────────────────────────────────────────────────────────────────────
// MH1 — MANIFEST
// ─────────────────────────────────────────────────────────────────────────

export async function startManifestSession(
  req: StartSessionRequest
): Promise<ApiResult<StartSessionResponse>> {
  // Sau này: fetch('/api/manifests/start-session', { method: 'POST', body: JSON.stringify(req) })
  await delay(80)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  _sessionCounter++
  const manifestId = `MF_${today}_${String(_sessionCounter).padStart(3, '0')}`
  const session: StartSessionResponse = {
    manifestId, carrierCode: req.carrierCode,
    startedAt: new Date().toISOString(),
    operatorId: req.operatorId, operatorName: 'Nguyễn Văn Kho',
  }
  _sessions[manifestId] = session
  return ok(session)
}

export async function validateScan(
  req: ValidateScanRequest
): Promise<ApiResult<ScannedItem>> {
  // Sau này: fetch('/api/manifests/validate-scan', { method: 'POST', body: JSON.stringify(req) })
  await delay(80)
  const code = req.trackingCode.trim()
  if (CANCELLED.has(code))    return fail(ERROR_CODES.ORDER_CANCELLED,    'Đơn hàng này đã bị hủy, không thể bàn giao.')
  if (HANDED_OVER.has(code))  return fail(ERROR_CODES.ALREADY_HANDED_OVER,'Mã vận đơn này đã được bàn giao ở phiên trước.')
  const item = VALID_CODES[code]
  if (!item)                  return fail(ERROR_CODES.NOT_FOUND,           `Không tìm thấy mã vận đơn "${code}" trong hệ thống.`)
  const session = _sessions[req.manifestId]
  if (session?.carrierCode !== 'MIXED' && item.carrierCode !== session?.carrierCode) {
    return fail(ERROR_CODES.WRONG_CARRIER, `Mã vận đơn thuộc ${item.carrierCode}, phiên này đang bàn giao ${session?.carrierCode}.`)
  }
  return ok(item)
}

export async function confirmManifest(
  req: ConfirmManifestRequest
): Promise<ApiResult<ConfirmManifestResponse>> {
  // Sau này: fetch('/api/manifests/confirm', { method: 'POST', body: JSON.stringify(req) })
  await delay(400)
  req.scannedTrackingCodes.forEach(c => {
    HANDED_OVER.add(c)
    const idx = _shipments.findIndex(s => s.trackingCode === c)
    if (idx !== -1) _shipments[idx] = { ..._shipments[idx], status: 'handed_over', handedOverAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  })
  const byCarrier: Record<string, number> = {}
  req.scannedTrackingCodes.forEach(c => {
    const cc = VALID_CODES[c]?.carrierCode
    if (cc) byCarrier[cc] = (byCarrier[cc] ?? 0) + 1
  })
  const totalCod = req.scannedTrackingCodes.reduce((s, c) => s + (VALID_CODES[c]?.codAmount ?? 0), 0)
  return ok({
    manifestId: req.manifestId, confirmedAt: new Date().toISOString(),
    manifestPdfUrl: `https://erp.example.com/manifests/${req.manifestId}.pdf`,
    shipmentsUpdated: req.scannedTrackingCodes.length,
    summary: { byCarrier, totalCod },
  })
}

// ─────────────────────────────────────────────────────────────────────────
// MH2 — RETURN QC
// ─────────────────────────────────────────────────────────────────────────

export async function lookupReturn(trackingCode: string): Promise<ApiResult<ReturnLookupResponse>> {
  // Sau này: fetch(`/api/returns/lookup/${trackingCode}`)
  await delay(120)
  const found = RETURN_POOL[trackingCode.trim()]
  if (!found) return fail(ERROR_CODES.NOT_FOUND, `Không tìm thấy đơn hoàn cho mã "${trackingCode}".`)
  return ok(found)
}

export async function processReturn(req: ProcessReturnRequest): Promise<ApiResult<ProcessReturnResponse>> {
  // Sau này: fetch('/api/returns/process', { method: 'POST', body: JSON.stringify(req) })
  await delay(350)
  const movements = req.returnItems.map(item => ({
    sku: item.sku,
    action: item.condition === 'GOOD' ? 'INBOUND_SELLABLE' : item.condition === 'DAMAGED' ? 'INBOUND_QC_HOLD' : 'CLAIM_CREATED',
    qty: item.qtyReturned,
    binLocation: item.targetBin === 'sellable' ? 'BIN_SELLABLE_A1' : item.targetBin === 'qc_hold' ? 'VIRTUAL_BIN_QC_01' : 'BIN_DAMAGED_01',
  }))
  const claimsCreated = req.returnItems.filter(i => i.condition === 'MISSING').length
  return ok({ returnId: `RET_${Date.now()}`, stockMovements: movements, accountingTriggered: true, claimsCreated: claimsCreated || undefined })
}

// ─────────────────────────────────────────────────────────────────────────
// MH3 — RECONCILIATION
// ─────────────────────────────────────────────────────────────────────────

export async function importReconcileFile(carrierId: string): Promise<ApiResult<ImportReconcileResponse>> {
  // Sau này: multipart POST /api/reconciliation/import
  await delay(800)
  const rows = [...RECONCILE_ROWS]
  return ok({
    reconciliationId: `REC_${new Date().toISOString().slice(0, 7).replace('-', '')}_${carrierId}`,
    totalRows: rows.length,
    summary: {
      matched:       rows.filter(r => r.matchStatus === 'MATCHED').length,
      mismatched:    rows.filter(r => !['MATCHED','MISSING_IN_DB','MISSING_IN_FILE'].includes(r.matchStatus)).length,
      missingInDb:   rows.filter(r => r.matchStatus === 'MISSING_IN_DB').length,
      missingInFile: rows.filter(r => r.matchStatus === 'MISSING_IN_FILE').length,
    },
    rows,
  })
}

export async function getReconcileRows(): Promise<ApiResult<ReconcileRow[]>> {
  // Sau này: fetch('/api/reconciliation/current')
  await delay(80)
  return ok([...RECONCILE_ROWS])
}

export async function markResolved(rowId: string, note: string): Promise<ApiResult<void>> {
  // Sau này: PATCH /api/reconciliation/rows/:rowId
  const idx = RECONCILE_ROWS.findIndex(r => r.id === rowId)
  if (idx !== -1) RECONCILE_ROWS[idx] = { ...RECONCILE_ROWS[idx], resolved: true, resolutionNote: note }
  return ok(undefined)
}

export async function confirmPayment(
  reconciliationId: string, req: ConfirmPaymentRequest
): Promise<ApiResult<{ reconciliationId: string; completedAt: string; totalConfirmed: number }>> {
  // Sau này: POST /api/reconciliation/:id/confirm-payment
  await delay(400)
  return ok({ reconciliationId, completedAt: new Date().toISOString(), totalConfirmed: req.transferAmount })
}

// ─────────────────────────────────────────────────────────────────────────
// MH4 — KANBAN
// ─────────────────────────────────────────────────────────────────────────

export async function getKanbanBoard(): Promise<ApiResult<KanbanBoard>> {
  // Sau này: fetch('/api/shipments/board')
  await delay(100)
  const colDefs = [
    { key: 'packing',        label: 'Chờ đóng gói',    color: '#64748b' },
    { key: 'waiting_pickup', label: 'Chờ lấy hàng',    color: '#f59e0b' },
    { key: 'delivering',     label: 'Đang giao',        color: '#38bdf8' },
    { key: 'success',        label: 'Thành công',       color: '#10b981' },
    { key: 'cancelled',      label: 'Đã hủy / Tách',   color: '#ef4444' },
    { key: 'returning',      label: 'Hoàn / Thất bại', color: '#f97316' },
  ] as const
  const columns = colDefs.map(col => {
    const shipments = _shipments.filter(s => resolveKanbanCol(s.status) === col.key)
    return { ...col, colKey: col.key as any, count: shipments.length, shipments: shipments.slice(0, 50), hasMore: shipments.length > 50 }
  })
  return ok({ columns })
}

export async function getShipmentById(id: string): Promise<ApiResult<Shipment>> {
  // Sau này: fetch(`/api/shipments/${id}`)
  await delay(80)
  const found = _shipments.find(s => s.id === id)
  if (!found) return fail(ERROR_CODES.NOT_FOUND, `Không tìm thấy vận đơn ${id}`)
  return ok(found)
}

export async function updateShipmentStatus(id: string, newStatus: ShipmentStatus): Promise<ApiResult<Shipment>> {
  // Sau này: PUT /api/shipments/:id/status
  await delay(120)
  const idx = _shipments.findIndex(s => s.id === id)
  if (idx === -1) return fail(ERROR_CODES.NOT_FOUND, 'Không tìm thấy vận đơn')
  if (!canTransition(_shipments[idx].status, newStatus))
    return fail(ERROR_CODES.INVALID_STATUS_TRANSITION, `Không thể chuyển từ "${_shipments[idx].status}" sang "${newStatus}"`)
  _shipments[idx] = { ..._shipments[idx], status: newStatus, updatedAt: new Date().toISOString() }
  return ok(_shipments[idx])
}

export async function splitShipment(id: string, req: SplitRequest): Promise<ApiResult<{ originalShipmentId: string; newShipments: { id: string; shipmentCode: string; trackingCode: string; carrierId: number }[] }>> {
  // Sau này: POST /api/shipments/:id/split
  await delay(300)
  const original = _shipments.find(s => s.id === id)
  if (!original) return fail(ERROR_CODES.NOT_FOUND, 'Không tìm thấy vận đơn')
  if (!['created', 'packing', 'ready_to_handover'].includes(original.status))
    return fail(ERROR_CODES.SPLIT_NOT_PACKING, 'Chỉ có thể tách khi đơn chưa bàn giao cho hãng vận chuyển')
  const now = new Date().toISOString()
  const newShips = req.splits.map((split, i) => {
    const suffix = String.fromCharCode(65 + i)
    return {
      ...original, id: `shp${Date.now()}${i}`,
      shipmentCode: `${original.shipmentCode}-${suffix}`,
      trackingCode: '', carrierId: split.carrierId,
      carrierCode: split.carrierId === 1 ? 'GHN' : split.carrierId === 2 ? 'GHTK' : 'VTP',
      isSplit: true, parentShipmentId: id, status: 'packing' as ShipmentStatus,
      items: original.items.map(item => {
        const a = split.items.find(si => si.sku === item.sku)
        return a ? { ...item, qty: a.qty } : null
      }).filter((x): x is Shipment['items'][number] => x !== null && x.qty > 0),
      trackingHistory: [], createdAt: now, updatedAt: now,
    }
  })
  _shipments = _shipments.map(s => s.id === id ? { ...s, status: 'split_cancelled' as ShipmentStatus, updatedAt: now } : s)
  _shipments.push(...newShips)
  return ok({ originalShipmentId: id, newShipments: newShips.map(s => ({ id: s.id, shipmentCode: s.shipmentCode, trackingCode: s.trackingCode, carrierId: s.carrierId })) })
}

// ─────────────────────────────────────────────────────────────────────────
// MH5 — SHIPMENT CREATION
// ─────────────────────────────────────────────────────────────────────────

export async function getShippingQuote(req: QuoteRequest): Promise<ApiResult<{ quotes: CarrierQuote[] }>> {
  // Sau này: POST /api/shipments/quote (parallel carrier calls)
  await delay(600)
  const isNorth = ['Hà Nội', 'Hải Phòng', 'Bắc Giang'].some(p => req.toProvince.includes(p))
  const quotes: CarrierQuote[] = [
    { carrierId: 2, carrierCode: 'GHTK', carrierName: 'Giao Hàng Tiết Kiệm', serviceCode: 'standard', serviceName: 'Giao tiêu chuẩn', fee: 22_000, estimatedDays: isNorth ? 3 : 2, isRecommended: !isNorth, recommendReason: !isNorth ? 'Giá tốt nhất khu vực TP.HCM' : undefined },
    { carrierId: 1, carrierCode: 'GHN',  carrierName: 'Giao Hàng Nhanh',      serviceCode: 'express',  serviceName: 'Giao nhanh',       fee: 30_000, estimatedDays: isNorth ? 2 : 1, isRecommended: isNorth,  recommendReason: isNorth  ? 'Nhanh nhất tuyến miền Bắc'  : undefined },
    { carrierId: 3, carrierCode: 'VTP',  carrierName: 'Viettel Post',          serviceCode: 'standard', serviceName: 'Giao tiêu chuẩn', fee: 25_000, estimatedDays: isNorth ? 2 : 3, isRecommended: false },
  ]
  quotes.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0) || a.fee - b.fee)
  return ok({ quotes })
}

export async function createShipment(req: CreateShipmentRequest): Promise<ApiResult<CreateShipmentResponse>> {
  // Sau này: POST /api/shipments
  await delay(500)
  const prefix = req.carrierId === 1 ? 'GHN' : req.carrierId === 2 ? 'GHTK' : 'VTP'
  const trackingCode = `${prefix}${Date.now()}`
  return ok({ shipmentId: `shp${Date.now()}`, trackingCode, fee: req.carrierId === 1 ? 30_000 : req.carrierId === 2 ? 22_000 : 25_000, expectedDelivery: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), labelUrl: `https://erp.example.com/labels/${trackingCode}.pdf` })
}

export async function createBulkShipments(items: BulkCreateItem[]): Promise<ApiResult<{ jobId: string; totalItems: number }>> {
  // Sau này: POST /api/shipments/bulk → queue job → WebSocket events
  await delay(120)
  return ok({ jobId: `BULK_JOB_${Date.now()}`, totalItems: items.length })
}

// ─────────────────────────────────────────────────────────────────────────
// MH6 — REPORTS
// ─────────────────────────────────────────────────────────────────────────

export async function getShippingReport(from: string, to: string): Promise<ApiResult<ShippingReport>> {
  // Sau này: fetch(`/api/reports/shipping/overview?from=${from}&to=${to}`)
  await delay(300)
  return ok({
    period: { from, to },
    kpis: { totalShipments: 1_850, delivered: 1_650, failed: 80, returned: 60, successRate: 89.2, returnRate: 3.2, vsPrevious: { successRate: +2.1, returnRate: -0.5 } },
    shippingFee: { total: 45_000_000, average: 24_324, byCarrier: [{ carrier: 'GHN', fee: 15_000_000, count: 500 }, { carrier: 'GHTK', fee: 22_000_000, count: 1_000 }, { carrier: 'VTP', fee: 8_000_000, count: 350 }] },
    carrierPerformance: [
      { carrierCode: 'GHTK', carrierName: 'Giao Hàng Tiết Kiệm', total: 1_000, successRate: 91.0, avgDeliveryDays: 2.4, returnRate: 4.0, avgFee: 22_000 },
      { carrierCode: 'GHN',  carrierName: 'Giao Hàng Nhanh',      total: 500,  successRate: 93.0, avgDeliveryDays: 1.8, returnRate: 3.0, avgFee: 30_000 },
      { carrierCode: 'VTP',  carrierName: 'Viettel Post',          total: 350,  successRate: 85.0, avgDeliveryDays: 3.1, returnRate: 5.0, avgFee: 25_000 },
    ],
    trends: { daily: Array.from({ length: 30 }, (_, i) => { const count = 50 + Math.floor(Math.random() * 30); const success = Math.floor(count * 0.88); return { date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10), count, success, failed: count - success } }) },
    failureReasons: [{ reason: 'Khách bom hàng / từ chối nhận', count: 35, percentage: 43.7 }, { reason: 'Sai địa chỉ', count: 20, percentage: 25.0 }, { reason: 'Không có người nhận', count: 15, percentage: 18.8 }, { reason: 'Hàng bị hỏng khi vận chuyển', count: 7, percentage: 8.8 }, { reason: 'Khác', count: 3, percentage: 3.7 }],
  })
}