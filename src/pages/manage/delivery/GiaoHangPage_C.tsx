// GiaoHangPage_C.tsx — MH5: Tạo vận đơn (đơn lẻ + hàng loạt)
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Package, Truck, Check, AlertTriangle, X,
  Star, Zap, ChevronDown, Printer, Plus,
  RefreshCw, CheckCircle, XCircle, Loader,
  ExternalLink, Layers,
} from 'lucide-react'

import type {
  CarrierQuote, CreateShipmentResponse, BulkCreateItem,
} from '../../../components/VanChuyen/data/shippingTypes'

import {
  getShippingQuote, createShipment, createBulkShipments,
} from '../../../components/VanChuyen/service/shippingService'

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })

// Mock pending orders (sau này: lấy từ Order module)
const MOCK_PENDING_ORDERS = [
  { orderId: 'ORD-001', orderCode: 'DH-2412-011', customerName: 'Nguyễn Thị Hoa',  customerPhone: '0901234567', shippingAddress: '12 Lê Lợi, Q.1, TP.HCM',              province: 'TP.HCM',    district: 'Quận 1',   weightGrams: 350,  codAmount: 650_000  },
  { orderId: 'ORD-002', orderCode: 'DH-2412-012', customerName: 'Trần Minh Khoa',  customerPhone: '0912345678', shippingAddress: '45 Đinh Tiên Hoàng, Hoàn Kiếm, HN',  province: 'Hà Nội',   district: 'Hoàn Kiếm', weightGrams: 500,  codAmount: 1_200_000 },
  { orderId: 'ORD-003', orderCode: 'DH-2412-013', customerName: 'Lê Thị Thu',      customerPhone: '0703456789', shippingAddress: '89 Hùng Vương, Hải Châu, Đà Nẵng',   province: 'Đà Nẵng',  district: 'Hải Châu',  weightGrams: 200,  codAmount: 420_000  },
  { orderId: 'ORD-004', orderCode: 'DH-2412-014', customerName: 'Phạm Quốc Bảo',  customerPhone: '0856789012', shippingAddress: '33 Nguyễn Trãi, Ninh Kiều, Cần Thơ', province: 'Cần Thơ',  district: 'Ninh Kiều', weightGrams: 800,  codAmount: 980_000  },
  { orderId: 'ORD-005', orderCode: 'DH-2412-015', customerName: 'Vũ Thị Lan',      customerPhone: '0778901234', shippingAddress: '67 Pasteur, Q.3, TP.HCM',             province: 'TP.HCM',   district: 'Quận 3',   weightGrams: 450,  codAmount: 750_000  },
]

// ─────────────────────────────────────────────────────────────────────────
// QUOTE CARD
// ─────────────────────────────────────────────────────────────────────────
function QuoteCard({
  quote, selected, onSelect,
}: { quote: CarrierQuote; selected: boolean; onSelect: () => void }) {
  const color = selected ? '#38bdf8' : '#334155'
  return (
    <div
      onClick={onSelect}
      className="relative rounded-xl p-4 cursor-pointer transition-all"
      style={{
        background: selected ? '#38bdf815' : '#0f172a',
        border: `2px solid ${selected ? '#38bdf8' : '#1e293b'}`,
      }}
    >
      {quote.isRecommended && (
        <div
          className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[9px] font-black flex items-center gap-1"
          style={{ background: '#10b981', color: 'white' }}
        >
          <Star size={8} fill="white" /> Gợi ý
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: color + '20', color }}
          >
            {quote.carrierCode.slice(0, 2)}
          </div>
          <div>
            <p className="text-xs font-black text-white">{quote.carrierName}</p>
            <p className="text-[10px]" style={{ color: '#64748b' }}>{quote.serviceName}</p>
          </div>
        </div>
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
          style={{ borderColor: selected ? '#38bdf8' : '#334155' }}
        >
          {selected && <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />}
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-black tabular-nums" style={{ color: '#38bdf8' }}>
            {fmt(quote.fee)}
          </p>
          {quote.recommendReason && (
            <p className="text-[10px] mt-0.5" style={{ color: '#10b981' }}>{quote.recommendReason}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-black" style={{ color: '#f59e0b' }}>
            {quote.estimatedDays} ngày
          </p>
          <p className="text-[10px]" style={{ color: '#64748b' }}>giao dự kiến</p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// TAB 1 — TẠO ĐƠN LẺ
// ─────────────────────────────────────────────────────────────────────────
function TabSingleCreate() {
  const [selectedOrder, setSelectedOrder] = useState(MOCK_PENDING_ORDERS[0])
  const [weight, setWeight]     = useState(String(MOCK_PENDING_ORDERS[0].weightGrams))
  const [codAmount, setCod]     = useState(String(MOCK_PENDING_ORDERS[0].codAmount))
  const [note, setNote]         = useState('')
  const [feePayer, setFeePayer] = useState<'sender' | 'receiver'>('receiver')
  const [quotes, setQuotes]     = useState<CarrierQuote[]>([])
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [selectedCarrierId, setSelectedCarrierId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [result, setResult]     = useState<CreateShipmentResponse | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchQuotes = useCallback(async (w: number, cod: number, order: typeof MOCK_PENDING_ORDERS[0]) => {
    if (w <= 0 || cod < 0) return
    setQuoteLoading(true)
    const r = await getShippingQuote({
      orderId:     order.orderId,
      weightGrams: w,
      codAmount:   cod,
      toProvince:  order.province,
      toDistrict:  order.district,
    })
    setQuoteLoading(false)
    if (r.ok) {
      setQuotes(r.data.quotes)
      // Auto-select recommended
      const rec = r.data.quotes.find(q => q.isRecommended)
      if (rec) setSelectedCarrierId(rec.carrierId)
    }
  }, [])

  // Debounce re-quote on weight/COD change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchQuotes(Number(weight), Number(codAmount), selectedOrder)
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [weight, codAmount, selectedOrder, fetchQuotes])

  const onOrderChange = (orderId: string) => {
    const o = MOCK_PENDING_ORDERS.find(o => o.orderId === orderId)!
    setSelectedOrder(o)
    setWeight(String(o.weightGrams))
    setCod(String(o.codAmount))
    setResult(null)
  }

  const handleCreate = async () => {
    if (!selectedCarrierId) return
    const q = quotes.find(q => q.carrierId === selectedCarrierId)
    if (!q) return
    setCreating(true)
    const r = await createShipment({
      orderId:     selectedOrder.orderId,
      carrierId:   selectedCarrierId,
      serviceCode: q.serviceCode,
      weightGrams: Number(weight),
      codAmount:   Number(codAmount),
      feePayer,
      note:        note || undefined,
    })
    setCreating(false)
    if (r.ok) setResult(r.data)
  }

  const selectedQuote = quotes.find(q => q.carrierId === selectedCarrierId)

  return (
    <div className="flex h-full gap-0">
      {/* ── Left: Order form ── */}
      <div
        className="flex flex-col overflow-y-auto"
        style={{
          width: 400, flexShrink: 0,
          borderRight: '1px solid #1e293b',
          scrollbarWidth: 'thin',
          background: '#0a1628',
        }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-sm font-black text-white">Thông tin đơn hàng</h3>
        </div>

        <div className="px-5 py-4 space-y-4 flex-1">
          {/* Order selector */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              Chọn đơn hàng
            </label>
            <select
              value={selectedOrder.orderId}
              onChange={e => onOrderChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
            >
              {MOCK_PENDING_ORDERS.map(o => (
                <option key={o.orderId} value={o.orderId}>
                  {o.orderCode} — {o.customerName}
                </option>
              ))}
            </select>
          </div>

          {/* Customer info */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Người nhận</p>
            <p className="text-sm font-black text-white">{selectedOrder.customerName}</p>
            <p className="text-xs" style={{ color: '#94a3b8' }}>{selectedOrder.customerPhone}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{selectedOrder.shippingAddress}</p>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              Cân nặng (gram)
            </label>
            <input
              type="number" min={1} value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
            />
          </div>

          {/* COD */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              Tiền thu hộ COD (VNĐ)
            </label>
            <input
              type="number" min={0} value={codAmount}
              onChange={e => setCod(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
            />
            {Number(codAmount) > 0 && (
              <p className="text-[10px] mt-1 tabular-nums" style={{ color: '#10b981' }}>
                = {fmt(Number(codAmount))}
              </p>
            )}
          </div>

          {/* Fee payer */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              Người trả phí ship
            </label>
            <div className="flex gap-2">
              {(['receiver', 'sender'] as const).map(v => (
                <button
                  key={v}
                  onClick={() => setFeePayer(v)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: feePayer === v ? '#38bdf820' : '#1e293b',
                    color:      feePayer === v ? '#38bdf8'   : '#64748b',
                    border:    `1px solid ${feePayer === v ? '#38bdf840' : '#334155'}`,
                  }}
                >
                  {v === 'receiver' ? 'Người nhận' : 'Người gửi'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              Ghi chú cho tài xế
            </label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="VD: Gọi trước khi giao 30 phút"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
            />
          </div>
        </div>

        {/* CTA */}
        <div className="p-5 space-y-2" style={{ borderTop: '1px solid #1e293b' }}>
          {selectedQuote && (
            <div className="flex items-center justify-between text-xs mb-3 px-1">
              <span style={{ color: '#64748b' }}>Đã chọn: <span className="font-black text-white">{selectedQuote.carrierName}</span></span>
              <span className="font-black tabular-nums" style={{ color: '#38bdf8' }}>{fmt(selectedQuote.fee)}</span>
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={!selectedCarrierId || creating || !!result}
            className="w-full py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
            style={{
              background: selectedCarrierId && !result ? '#38bdf820' : '#1e293b',
              color:      selectedCarrierId && !result ? '#38bdf8'   : '#475569',
              border:    `1px solid ${selectedCarrierId && !result ? '#38bdf840' : '#334155'}`,
            }}
          >
            {creating
              ? <><Loader size={14} className="animate-spin" /> Đang tạo vận đơn...</>
              : result
              ? <><Check size={14} /> Đã tạo xong!</>
              : <><Package size={14} /> Tạo vận đơn</>}
          </button>
        </div>
      </div>

      {/* ── Right: Quotes ── */}
      <div className="flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
        >
          <div>
            <h3 className="text-sm font-black text-white">Bảng giá vận chuyển</h3>
            <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>
              Tự động cập nhật khi thay đổi cân nặng hoặc COD
            </p>
          </div>
          {quoteLoading && (
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
              <RefreshCw size={12} className="animate-spin" />
              Đang lấy báo giá...
            </div>
          )}
        </div>

        <div className="px-6 py-5 space-y-3 flex-1">
          {quotes.length === 0 && !quoteLoading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-sm" style={{ color: '#334155' }}>Nhập cân nặng và COD để xem báo giá</p>
            </div>
          ) : (
            quotes.map(q => (
              <QuoteCard
                key={q.carrierId}
                quote={q}
                selected={selectedCarrierId === q.carrierId}
                onSelect={() => setSelectedCarrierId(q.carrierId)}
              />
            ))
          )}
        </div>

        {/* Result panel */}
        {result && (
          <div
            className="mx-6 mb-5 rounded-xl overflow-hidden"
            style={{ border: '1px solid #10b98140', background: '#10b98108' }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ background: '#10b98120', borderBottom: '1px solid #10b98130' }}
            >
              <CheckCircle size={16} style={{ color: '#10b981' }} />
              <span className="text-sm font-black" style={{ color: '#10b981' }}>Tạo vận đơn thành công!</span>
            </div>
            <div className="px-4 py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Mã vận đơn</span>
                <span className="font-black font-mono" style={{ color: '#38bdf8' }}>{result.trackingCode}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Phí ship thực tế</span>
                <span className="font-black tabular-nums" style={{ color: '#f97316' }}>{fmt(result.fee)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Giao dự kiến</span>
                <span className="font-black" style={{ color: '#10b981' }}>
                  {new Date(result.expectedDelivery).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <a
                href={result.labelUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-black mt-2"
                style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}
              >
                <Printer size={12} /> In nhãn vận đơn
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// TAB 2 — TẠO HÀNG LOẠT
// ─────────────────────────────────────────────────────────────────────────
type BulkItemStatus = 'pending' | 'processing' | 'success' | 'error'
type PendindOrders = typeof MOCK_PENDING_ORDERS[number];
interface BulkItem extends PendindOrders{
  selected:      boolean
  status:        BulkItemStatus
  trackingCode?: string
  errorMsg?:     string
}

const CARRIER_OPTIONS = [
  { id: 1, code: 'GHN',  name: 'Giao Hàng Nhanh' },
  { id: 2, code: 'GHTK', name: 'Giao Hàng Tiết Kiệm' },
  { id: 3, code: 'VTP',  name: 'Viettel Post' },
]

function TabBulkCreate() {
  const [items, setItems] = useState<BulkItem[]>(
    MOCK_PENDING_ORDERS.map(o => ({ ...o, selected: true, status: 'pending' }))
  )
  const [defaultCarrierId, setDefaultCarrierId] = useState(2)
  const [running, setRunning]     = useState(false)
  const [done, setDone]           = useState(false)
  const [progress, setProgress]   = useState(0)

  const selectedItems = items.filter(i => i.selected)
  const successCount  = items.filter(i => i.status === 'success').length
  const errorCount    = items.filter(i => i.status === 'error').length

  const toggleAll = () => {
    const allSelected = items.every(i => i.selected)
    setItems(prev => prev.map(i => ({ ...i, selected: !allSelected })))
  }

  const toggleItem = (orderId: string) =>
    setItems(prev => prev.map(i => i.orderId === orderId ? { ...i, selected: !i.selected } : i))

  const handleRun = async () => {
    if (!selectedItems.length) return
    setRunning(true)
    setDone(false)
    setProgress(0)

    // Reset statuses
    setItems(prev => prev.map(i => ({ ...i, status: i.selected ? 'pending' : i.status, trackingCode: undefined, errorMsg: undefined })))

    // Simulate processing each item sequentially
    for (let idx = 0; idx < selectedItems.length; idx++) {
      const item = selectedItems[idx]

      // Mark processing
      setItems(prev => prev.map(i => i.orderId === item.orderId ? { ...i, status: 'processing' } : i))

      await new Promise(r => setTimeout(r, 400 + Math.random() * 300))

      const success = Math.random() > 0.1 // 90% success rate
      const prefix  = defaultCarrierId === 1 ? 'GHN' : defaultCarrierId === 2 ? 'GHTK' : 'VTP'

      setItems(prev => prev.map(i =>
        i.orderId === item.orderId
          ? {
              ...i,
              status:       success ? 'success' : 'error',
              trackingCode: success ? `${prefix}${Date.now()}` : undefined,
              errorMsg:     success ? undefined : 'Địa chỉ không hợp lệ',
            }
          : i
      ))
      setProgress(Math.round(((idx + 1) / selectedItems.length) * 100))
    }

    setRunning(false)
    setDone(true)
  }

  const STATUS_ICON: Record<BulkItemStatus, React.ReactNode> = {
    pending:    <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: '#334155' }} />,
    processing: <Loader size={14} className="animate-spin" style={{ color: '#38bdf8' }} />,
    success:    <CheckCircle size={14} style={{ color: '#10b981' }} />,
    error:      <XCircle size={14} style={{ color: '#ef4444' }} />,
  }

  return (
    <div className="flex h-full gap-0">
      {/* ── Left: Config ── */}
      <div
        className="flex flex-col flex-shrink-0"
        style={{ width: 320, borderRight: '1px solid #1e293b', background: '#0a1628' }}
      >
        <div className="px-5 py-4" style={{ borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-sm font-black text-white">Cấu hình hàng loạt</h3>
        </div>

        <div className="px-5 py-4 space-y-4 flex-1">
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>
              ĐVVC mặc định
            </label>
            <select
              value={defaultCarrierId}
              onChange={e => setDefaultCarrierId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }}
            >
              {CARRIER_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Stats */}
          {(running || done) && (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: '#64748b' }}>
                  <span>Tiến độ</span>
                  <span className="font-black text-white">{progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${progress}%`, background: progress === 100 ? '#10b981' : '#38bdf8' }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                  <p className="text-lg font-black" style={{ color: '#10b981' }}>{successCount}</p>
                  <p className="text-[10px]" style={{ color: '#64748b' }}>Thành công</p>
                </div>
                <div className="rounded-xl px-3 py-2 text-center" style={{ background: '#ef444410', border: '1px solid #ef444420' }}>
                  <p className="text-lg font-black" style={{ color: '#ef4444' }}>{errorCount}</p>
                  <p className="text-[10px]" style={{ color: '#64748b' }}>Lỗi</p>
                </div>
              </div>
            </div>
          )}

          {done && successCount > 0 && (
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black"
              style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}
            >
              <Printer size={12} /> In {successCount} nhãn vận đơn
            </button>
          )}
        </div>

        <div className="p-5" style={{ borderTop: '1px solid #1e293b' }}>
          <button
            onClick={handleRun}
            disabled={running || !selectedItems.length}
            className="w-full py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2"
            style={{
              background: !running && selectedItems.length ? '#38bdf820' : '#1e293b',
              color:      !running && selectedItems.length ? '#38bdf8'   : '#475569',
              border:    `1px solid ${!running && selectedItems.length ? '#38bdf840' : '#334155'}`,
            }}
          >
            {running
              ? <><Loader size={14} className="animate-spin" /> Đang xử lý...</>
              : <><Layers size={14} /> Tạo {selectedItems.length} vận đơn</>}
          </button>
        </div>
      </div>

      {/* ── Right: Order list ── */}
      <div className="flex-1 flex flex-col">
        <div
          className="px-5 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAll}
              className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: '#64748b' }}
            >
              <div
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{
                  background: items.every(i => i.selected) ? '#38bdf8' : '#1e293b',
                  border: `1px solid ${items.every(i => i.selected) ? '#38bdf8' : '#334155'}`,
                }}
              >
                {items.every(i => i.selected) && <Check size={10} color="white" />}
              </div>
              Chọn tất cả
            </button>
            <span className="text-xs" style={{ color: '#475569' }}>
              {selectedItems.length}/{items.length} đơn được chọn
            </span>
          </div>
        </div>

        {/* Table header */}
        <div
          className="grid px-5 py-2 flex-shrink-0"
          style={{
            gridTemplateColumns: '36px 1fr 100px 100px 80px 80px',
            background: '#020817', borderBottom: '1px solid #1e293b',
          }}
        >
          {['', 'KHÁCH HÀNG', 'ĐỊA CHỈ TỈNH', 'COD', 'CÂN (g)', 'TRẠNG THÁI'].map(h => (
            <div key={h} className="text-[9px] font-black uppercase" style={{ color: '#334155' }}>{h}</div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {items.map((item, i) => (
            <div
              key={item.orderId}
              className="grid px-5 items-center"
              style={{
                gridTemplateColumns: '36px 1fr 100px 100px 80px 80px',
                borderBottom: '1px solid #0f172a',
                background: i % 2 === 1 ? '#0f172a40' : 'transparent',
                padding: '10px 20px',
                opacity: item.status === 'error' ? 0.7 : 1,
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => !running && toggleItem(item.orderId)}
                disabled={running}
                className="w-4 h-4 rounded flex items-center justify-center"
                style={{
                  background: item.selected ? '#38bdf8' : '#1e293b',
                  border: `1px solid ${item.selected ? '#38bdf8' : '#334155'}`,
                }}
              >
                {item.selected && <Check size={10} color="white" />}
              </button>

              {/* Customer */}
              <div>
                <p className="text-xs font-bold text-white">{item.customerName}</p>
                <p className="text-[10px]" style={{ color: '#64748b' }}>
                  {item.orderCode}
                  {item.trackingCode && (
                    <span className="ml-2 font-mono" style={{ color: '#38bdf8' }}>{item.trackingCode}</span>
                  )}
                  {item.errorMsg && (
                    <span className="ml-2" style={{ color: '#ef4444' }}>{item.errorMsg}</span>
                  )}
                </p>
              </div>

              <span className="text-xs" style={{ color: '#94a3b8' }}>{item.province}</span>
              <span className="text-xs font-black tabular-nums" style={{ color: '#10b981' }}>{fmt(item.codAmount)}</span>
              <span className="text-xs tabular-nums" style={{ color: '#64748b' }}>{item.weightGrams}g</span>
              <div className="flex items-center">{STATUS_ICON[item.status]}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MH5 — MAIN
// ─────────────────────────────────────────────────────────────────────────
export function TaoVanDonScreen() {
  const [tab, setTab] = useState<'single' | 'bulk'>('single')

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center gap-2">
          <Package size={18} style={{ color: '#f59e0b' }} />
          <h2 className="text-sm font-black text-white">Tạo vận đơn</h2>
        </div>
        <div className="flex gap-1 rounded-xl overflow-hidden" style={{ border: '1px solid #334155' }}>
          {([
            ['single', 'Tạo lẻ'],
            ['bulk',   'Tạo hàng loạt'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="px-4 py-2 text-xs font-bold transition-all"
              style={{
                background: tab === id ? '#1e293b' : 'transparent',
                color: tab === id ? '#f59e0b' : '#64748b',
                borderRight: '1px solid #334155',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {tab === 'single' && <TabSingleCreate />}
        {tab === 'bulk'   && <TabBulkCreate />}
      </div>
    </div>
  )
}