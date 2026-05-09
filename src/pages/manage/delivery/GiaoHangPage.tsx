// GiaoHangPage_B.tsx — MH3: Đối soát + MH4: Kanban + Main page
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Upload, Search, X, AlertTriangle, Check,
  FileText, ChevronLeft, ChevronRight, SplitSquareVertical,
  Layers, Activity, Minus, Plus, Wifi, WifiOff, Clock,
  Phone, MapPin, RefreshCw,
} from 'lucide-react'

import type {
  ReconcileRow,
  Shipment, KanbanBoard, KanbanColKey,
  SplitRequest, WsEvent,
} from '../../../components/VanChuyen/data/shippingTypes'

import {
  MATCH_STATUS_LABELS, MATCH_STATUS_COLORS,
  KANBAN_COLS,
} from '../../../components/VanChuyen/data/shippingTypes'

import {
  importReconcileFile, getReconcileRows, markResolved, confirmPayment,
  getKanbanBoard, splitShipment,
} from '../../../components/VanChuyen/service/shippingService'

import { ACTION_GUARDS, getSlaStatus, resolveKanbanCol } from '../../../components/VanChuyen/shippingStateMachine'
import { useShippingSocket, type WsStatus } from '../../../components/VanChuyen/useShippingSocket'

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const fmtDatetime = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

function Bdg({ label, color, pulse }: { label: string; color: string; pulse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${pulse ? 'animate-pulse' : ''}`}
      style={{ background: color + '20', color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  )
}

function WsStatusBadge({ status }: { status: WsStatus }) {
  const cfg = {
    connected:    { label: 'Realtime',  color: '#10b981', Icon: Wifi },
    polling:      { label: 'Polling',   color: '#f59e0b', Icon: Activity },
    connecting:   { label: 'Kết nối...',color: '#38bdf8', Icon: RefreshCw },
    disconnected: { label: 'Offline',   color: '#ef4444', Icon: WifiOff },
  }[status]
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black"
      style={{ background: cfg.color + '15', color: cfg.color, border: `1px solid ${cfg.color}25` }}>
      <cfg.Icon size={9} className={status === 'connecting' ? 'animate-spin' : ''} />
      {cfg.label}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MH3 — RECONCILIATION CENTER
// ─────────────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

type ReconcileTab = 'all' | 'matched' | 'mismatch' | 'missing'

function ReconciliationCenter() {
  const [rows, setRows]           = useState<ReconcileRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [activeTab, setActiveTab] = useState<ReconcileTab>('all')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)
  const [dragging, setDragging]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [reconcileId, setReconcileId] = useState<string | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)

  // Load initial rows
  useEffect(() => {
    getReconcileRows().then(r => {
      if (r.ok) setRows(r.data)
      setLoading(false)
    })
  }, [])

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    setUploading(true)
    const result = await importReconcileFile(file.name, 'GHTK')
    setUploading(false)
    if (result.ok) {
      setRows(result.data.rows)
      setReconcileId(result.data.reconciliationId)
    }
  }

  const handleMarkResolved = async (rowId: string) => {
    await markResolved(rowId, 'Đã xác nhận và xử lý')
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, resolved: true } : r))
  }

  const filtered = useMemo(() => {
    let r = [...rows]
    if (activeTab === 'matched')  r = r.filter(row => row.matchStatus === 'MATCHED')
    if (activeTab === 'mismatch') r = r.filter(row => !['MATCHED','MISSING_IN_DB','MISSING_IN_FILE'].includes(row.matchStatus))
    if (activeTab === 'missing')  r = r.filter(row => ['MISSING_IN_DB','MISSING_IN_FILE'].includes(row.matchStatus))
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(row => row.trackingCode.toLowerCase().includes(q) || row.orderCode.toLowerCase().includes(q) || row.carrierCode.toLowerCase().includes(q))
    }
    return r
  }, [rows, activeTab, search])

  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE)

  const matched      = rows.filter(r => r.matchStatus === 'MATCHED')
  const mismatched   = rows.filter(r => !['MATCHED','MISSING_IN_DB','MISSING_IN_FILE'].includes(r.matchStatus))
  const missing      = rows.filter(r => ['MISSING_IN_DB','MISSING_IN_FILE'].includes(r.matchStatus))
  const totalFeeDiff = mismatched.reduce((s, r) => s + Math.abs(r.feeCompare.diff) + Math.abs(r.codCompare.diff), 0)

  const TABS: { id: ReconcileTab; label: string; count: number; color: string }[] = [
    { id: 'all',      label: 'Tất cả',            count: rows.length,       color: '#94a3b8' },
    { id: 'matched',  label: 'Khớp',              count: matched.length,    color: '#10b981' },
    { id: 'mismatch', label: 'Lệch — Cần xử lý',  count: mismatched.length, color: '#ef4444' },
    { id: 'missing',  label: 'Không có trong HT', count: missing.length,    color: '#f97316' },
  ]

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div className="px-6 py-3 flex-shrink-0" style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} style={{ color: '#a78bfa' }} />
            <h2 className="text-sm font-black text-white">Trung tâm Đối soát Vận chuyển</h2>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748b' }} />
            <input type="text" placeholder="Tìm mã vận đơn..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-3 py-2 rounded-xl text-xs outline-none w-52"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }} />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          {[
            { label: 'Tổng vận đơn',      value: String(rows.length),        color: '#94a3b8' },
            { label: 'Khớp hoàn toàn',    value: String(matched.length),     color: '#10b981' },
            { label: 'Lệch — Cần xử lý', value: String(mismatched.length),  color: '#ef4444' },
            { label: 'Tổng chênh lệch',   value: fmt(totalFeeDiff),          color: '#f97316' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl px-3 py-2" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <p className="text-[10px] font-black uppercase mb-0.5" style={{ color: '#475569' }}>{label}</p>
              <p className="text-sm font-black tabular-nums" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setPage(1) }}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: activeTab === t.id ? '#1e293b' : 'transparent',
                color: activeTab === t.id ? t.color : '#64748b',
                border: activeTab === t.id ? '1px solid #334155' : '1px solid transparent',
              }}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {/* Drop zone */}
      <div onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="mx-6 mt-4 flex-shrink-0 flex items-center justify-center gap-3 rounded-2xl py-3 transition-all cursor-pointer"
        style={{ background: dragging ? '#a78bfa15' : 'transparent', border: `2px dashed ${dragging ? '#a78bfa' : '#334155'}`, color: dragging ? '#a78bfa' : '#475569' }}>
        <Upload size={16} />
        <span className="text-sm font-bold">
          {uploading ? 'Đang xử lý file...' : 'Kéo thả file Excel từ hãng vận chuyển vào đây'}
        </span>
        {uploading && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#a78bfa' }} />}
      </div>

      {/* Table */}
      <div className="grid px-6 py-2 mt-4 flex-shrink-0"
        style={{ gridTemplateColumns: '180px 80px 80px 1fr 1fr 1fr 90px 100px', background: '#020817', borderBottom: '1px solid #1e293b', borderTop: '1px solid #1e293b' }}>
        {['MÃ VẬN ĐƠN','HÃNG','ĐƠN HÀNG','COD','PHÍ SHIP','CÂN (g)','TRẠNG THÁI','THAO TÁC'].map(h => (
          <div key={h} className="text-[9px] font-black uppercase" style={{ color: '#334155' }}>{h}</div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#38bdf8' }} />
          </div>
        ) : (
          paginated.map((row, i) => {
            const isMatch   = row.matchStatus === 'MATCHED'
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const isMissing = ['MISSING_IN_DB','MISSING_IN_FILE'].includes(row.matchStatus)
            const rowColor  = MATCH_STATUS_COLORS[row.matchStatus]
            return (
              <div key={row.id}
                className="grid px-6 items-start"
                style={{
                  gridTemplateColumns: '180px 80px 80px 1fr 1fr 1fr 90px 100px',
                  borderBottom: '1px solid #0f172a',
                  background: isMatch ? (i % 2 === 1 ? '#0f172a40' : 'transparent') : rowColor + '08',
                  borderLeft: isMatch ? '3px solid transparent' : `3px solid ${rowColor}`,
                  padding: '10px 24px',
                  opacity: row.resolved ? 0.5 : 1,
                }}>
                <span className="text-xs font-black font-mono" style={{ color: '#38bdf8' }}>{row.trackingCode}</span>
                <Bdg label={row.carrierCode} color="#38bdf8" />
                <span className="text-xs" style={{ color: '#94a3b8' }}>{row.orderCode}</span>
                <DiffCell c={row.codCompare} />
                <DiffCell c={row.feeCompare} />
                <DiffCell c={row.weightCompare} />
                <Bdg label={MATCH_STATUS_LABELS[row.matchStatus]} color={rowColor} />
                <div className="flex flex-col gap-1">
                  {!isMatch && !row.resolved && (
                    <button onClick={() => handleMarkResolved(row.id)}
                      className="flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-lg"
                      style={{ background: '#10b98115', color: '#10b981', border: '1px solid #10b98125' }}>
                      <Check size={9} /> Đã xử lý
                    </button>
                  )}
                  {row.resolved && (
                    <span className="text-[9px]" style={{ color: '#475569' }}>✓ Đã xử lý</span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer summary + pagination */}
      <div className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ borderTop: '1px solid #1e293b', background: '#0a1628' }}>
        <div className="flex items-center gap-4 text-xs">
          <span style={{ color: '#64748b' }}>
            {filtered.length} vận đơn · Khớp: <span style={{ color: '#10b981' }}>{matched.length}</span> · Lệch: <span style={{ color: '#ef4444' }}>{mismatched.length}</span>
          </span>
          {mismatched.length > 0 && (
            <span className="font-black tabular-nums" style={{ color: '#f97316' }}>
              Tổng lệch: {fmt(totalFeeDiff)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {reconcileId && mismatched.length > 0 && (
            <button onClick={() => setShowPayModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black"
              style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}>
              Xác nhận thanh toán →
            </button>
          )}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg" style={{ background: page > 1 ? '#1e293b' : 'transparent', color: page > 1 ? '#94a3b8' : '#334155' }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, page - 2) + i
                if (p > totalPages) return null
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className="w-7 h-7 rounded-lg text-xs font-black"
                    style={{ background: page === p ? '#38bdf8' : '#1e293b', color: page === p ? '#020817' : '#94a3b8' }}>
                    {p}
                  </button>
                )
              })}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg" style={{ background: page < totalPages ? '#1e293b' : 'transparent', color: page < totalPages ? '#94a3b8' : '#334155' }}>
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Confirm payment modal */}
      {showPayModal && reconcileId && (
        <ConfirmPaymentModal
          reconcileId={reconcileId}
          totalAmount={mismatched.reduce((s, r) => s + r.codCompare.sysVal, 0)}
          onClose={() => setShowPayModal(false)}
        />
      )}
    </div>
  )
}

function DiffCell({ c }: { c: { sysVal: number; carrierVal: number; diff: number } }) {
  const hasGap = c.diff !== 0
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <span className="text-[9px]" style={{ color: '#64748b' }}>HT:</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: hasGap ? '#ef4444' : 'white' }}>
          {c.sysVal.toLocaleString('vi-VN')}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px]" style={{ color: '#64748b' }}>HC:</span>
        <span className="text-xs font-bold tabular-nums" style={{ color: hasGap ? '#ef4444' : '#94a3b8' }}>
          {c.carrierVal.toLocaleString('vi-VN')}
        </span>
      </div>
      {hasGap && (
        <span className="text-[9px] font-black tabular-nums" style={{ color: '#ef4444' }}>
          Lệch: {c.diff > 0 ? '+' : ''}{c.diff.toLocaleString('vi-VN')}
        </span>
      )}
    </div>
  )
}

function ConfirmPaymentModal({
  reconcileId, totalAmount, onClose,
}: { reconcileId: string; totalAmount: number; onClose: () => void }) {
  const [ref, setRef]   = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    if (!ref.trim()) return
    setSaving(true)
    await confirmPayment(reconcileId, { transferDate: date, transferAmount: totalAmount, transferReference: ref, approvedMismatches: [] })
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl overflow-hidden w-96" style={{ background: '#0a1628', border: '1px solid #1e293b' }}>
        <div className="px-6 py-4" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-sm font-black text-white">Xác nhận thanh toán đối soát</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>{reconcileId}</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>Số tiền chuyển khoản</label>
            <div className="px-3 py-2 rounded-xl text-sm font-black tabular-nums" style={{ background: '#1e293b40', border: '1px solid #334155', color: '#10b981' }}>
              {fmt(totalAmount)}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>Ngày chuyển *</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: '1px solid #334155', color: 'white' }} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>Mã tham chiếu chuyển khoản *</label>
            <input value={ref} onChange={e => setRef(e.target.value)} placeholder="VD: MB-TX-20260515-001"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: '#1e293b', border: `1px solid ${ref ? '#334155' : '#334155'}`, color: 'white' }} />
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: '#1e293b', color: '#64748b' }}>Hủy</button>
          <button onClick={handleConfirm} disabled={!ref.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-black"
            style={{ background: ref.trim() ? '#a78bfa20' : '#1e293b', color: ref.trim() ? '#a78bfa' : '#475569', border: `1px solid ${ref.trim() ? '#a78bfa30' : '#334155'}` }}>
            {saving ? 'Đang xác nhận...' : 'Xác nhận'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MH4 — SHIPMENT KANBAN
// ─────────────────────────────────────────────────────────────────────────
function ShipmentKanban() {
  const [board, setBoard]       = useState<KanbanBoard | null>(null)
  const [loading, setLoading]   = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [splitId, setSplitId]   = useState<string | null>(null)
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected')

  const loadBoard = useCallback(async () => {
    const r = await getKanbanBoard()
    if (r.ok) setBoard(r.data)
    setLoading(false)
  }, [])

  useEffect(() => { 
    const fetchBoard = () => {
        loadBoard()
    }
    fetchBoard();
   }, [loadBoard])

  // Real-time: WebSocket / polling fallback
  useShippingSocket({
    onEvent: useCallback((event: WsEvent) => {
      if (event.event !== 'shipment.status_changed') return
      setBoard(prev => {
        if (!prev) return prev
        const newCols = prev.columns.map(col => ({
          ...col,
          shipments: col.shipments.filter(s => s.id !== event.shipmentId),
        }))
        const targetColKey = resolveKanbanCol(event.newStatus) as KanbanColKey
        const targetCol = newCols.find(c => c.colKey === targetColKey)
        if (targetCol) targetCol.shipments.unshift(event.shipment as unknown as Shipment)
        return { columns: newCols }
      })
    }, []),
    onStatusChange: setWsStatus,
  })

  const selectedShip = selectedId && board
    ? board.columns.flatMap(c => c.shipments).find(s => s.id === selectedId)
    : null

  const splitShip = splitId && board
    ? board.columns.flatMap(c => c.shipments).find(s => s.id === splitId)
    : null

  const handleSplit = async (req: SplitRequest) => {
    if (!splitId) return
    const r = await splitShipment(splitId, req)
    if (r.ok) { await loadBoard(); setSplitId(null) }
  }

  return (
    <div className="flex flex-col h-full" style={{ background: '#020817' }}>
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        <div className="flex items-center gap-3">
          <Layers size={18} style={{ color: '#38bdf8' }} />
          <h2 className="text-sm font-black text-white">Quản lý Vận đơn</h2>
          <WsStatusBadge status={wsStatus} />
        </div>
        <span className="text-xs" style={{ color: '#64748b' }}>
          {board ? board.columns.reduce((s, c) => s + c.count, 0) : '—'} vận đơn · Click thẻ để xem hành trình
        </span>
      </div>

      {/* Kanban board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#38bdf8' }} />
          </div>
        ) : (
          <div className="flex gap-3 h-full" style={{ minWidth: KANBAN_COLS.length * 224 }}>
            {board?.columns.map(col => (
              <KanbanColumn
                key={col.colKey}
                col={col}
                onSelect={setSelectedId}
                onSplit={setSplitId}
                selectedId={selectedId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Drawer */}
      {selectedShip && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setSelectedId(null)} />
          <ShipmentDrawer shipment={selectedShip} onClose={() => setSelectedId(null)} />
        </>
      )}

      {/* Split Modal */}
      {splitShip && (
        <SplitModal shipment={splitShip} onClose={() => setSplitId(null)} onConfirm={handleSplit} />
      )}
    </div>
  )
}

function KanbanColumn({
  col, onSelect, onSplit, selectedId,
}: {
  col: KanbanBoard['columns'][number]
  onSelect: (id: string) => void
  onSplit:  (id: string) => void
  selectedId: string | null
}) {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
      style={{ width: 224, background: '#0a1628', border: '1px solid #1e293b' }}>
      <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0"
        style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
        <span className="text-[11px] font-black text-white">{col.label}</span>
        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"
          style={{ background: col.color + '20', color: col.color }}>
          {col.count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2" style={{ scrollbarWidth: 'thin' }}>
        {col.shipments.length === 0 && (
          <div className="flex items-center justify-center h-20">
            <p className="text-[10px]" style={{ color: '#334155' }}>Không có đơn</p>
          </div>
        )}
        {col.shipments.map(ship => (
          <ShipmentCard
            key={ship.id}
            ship={ship}
            colColor={col.color}
            isSelected={selectedId === ship.id}
            onSelect={onSelect}
            onSplit={onSplit}
          />
        ))}
      </div>
    </div>
  )
}

function ShipmentCard({
  ship, colColor, isSelected, onSelect, onSplit,
}: {
  ship:       Shipment
  colColor:   string
  isSelected: boolean
  onSelect:   (id: string) => void
  onSplit:    (id: string) => void
}) {
  const sla = getSlaStatus(ship.status, ship.updatedAt)
  const canSplit = ACTION_GUARDS.canSplit(ship.status) && !ship.isSplit

  return (
    <div onClick={() => onSelect(ship.id)}
      className="rounded-xl p-3 cursor-pointer transition-all"
      style={{
        background: '#0f172a',
        border: `1px solid ${isSelected ? colColor + '60' : sla.isBreached ? '#ef444430' : '#1e293b'}`,
      }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black" style={{ color: '#38bdf8' }}>
          {ship.shipmentCode}
          {ship.isSplit && <span className="ml-1" style={{ color: '#a78bfa' }}>✂</span>}
        </span>
        <div className="flex items-center gap-1">
          {sla.isBreached && (
            <span title={`Trễ ${Math.round(sla.hoursSinceUpdate)}h / SLA ${sla.slaHours}h`}>
              <AlertTriangle size={10} style={{ color: '#ef4444' }} className="animate-pulse" />
            </span>
          )}
          {sla.isWarning && !sla.isBreached && (
            <Clock size={10} style={{ color: '#f59e0b' }} />
          )}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: colColor + '20', color: colColor }}>
            {ship.carrierCode}
          </span>
        </div>
      </div>
      <p className="text-[11px] font-bold text-white truncate">{ship.customerName}</p>
      <p className="text-[10px] truncate mt-0.5" style={{ color: '#64748b' }}>{ship.province}</p>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] tabular-nums font-black" style={{ color: '#10b981' }}>
          {fmt(ship.codAmount)}
        </span>
        <span className="text-[10px]" style={{ color: '#475569' }}>
          {ship.items.reduce((s, i) => s + i.qty, 0)} sp
        </span>
      </div>
      {canSplit && (
        <button onClick={e => { e.stopPropagation(); onSplit(ship.id) }}
          className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-bold"
          style={{ background: '#38bdf810', color: '#38bdf8', border: '1px solid #38bdf820' }}>
          <SplitSquareVertical size={10} /> Tách đơn
        </button>
      )}
    </div>
  )
}

function ShipmentDrawer({ shipment, onClose }: { shipment: Shipment; onClose: () => void }) {
  const colColor = KANBAN_COLS.find(c => c.key === resolveKanbanCol(shipment.status))?.color ?? '#64748b'

  return (
    <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col overflow-y-auto"
      style={{ width: 400, background: '#0a1628', borderLeft: '1px solid #1e293b', scrollbarWidth: 'thin' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
        style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
        <div>
          <p className="text-sm font-black text-white">{shipment.shipmentCode}</p>
          <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>
            {shipment.trackingCode || 'Chưa có mã vận đơn'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Bdg label={shipment.carrierCode} color={colColor} />
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: '#1e293b', color: '#64748b' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Customer */}
        <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
          <p className="text-[10px] font-black uppercase mb-2" style={{ color: '#475569' }}>Thông tin giao hàng</p>
          <p className="text-sm font-black text-white">{shipment.customerName}</p>
          <p className="text-xs mt-1 flex items-center gap-1" style={{ color: '#94a3b8' }}>
            <Phone size={10} /> {shipment.customerPhone}
          </p>
          <p className="text-xs mt-0.5 flex items-start gap-1" style={{ color: '#64748b' }}>
            <MapPin size={10} style={{ marginTop: 2, flexShrink: 0 }} /> {shipment.shippingAddress}
          </p>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div><span style={{ color: '#64748b' }}>COD: </span><span className="font-black tabular-nums" style={{ color: '#10b981' }}>{fmt(shipment.codAmount)}</span></div>
            <div><span style={{ color: '#64748b' }}>Phí: </span><span className="font-black tabular-nums" style={{ color: '#94a3b8' }}>{fmt(shipment.shippingFee)}</span></div>
          </div>
        </div>

        {/* Items */}
        <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
          <p className="text-[10px] font-black uppercase mb-2" style={{ color: '#475569' }}>Sản phẩm</p>
          {shipment.items.map(item => (
            <div key={item.sku} className="flex items-center justify-between py-1.5"
              style={{ borderBottom: '1px solid #0f172a' }}>
              <div>
                <p className="text-xs font-bold text-white">{item.productName}</p>
                <p className="text-[10px]" style={{ color: '#64748b' }}>{item.color} / {item.size}</p>
              </div>
              <span className="text-xs font-black" style={{ color: '#f59e0b' }}>×{item.qty}</span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        {shipment.trackingHistory.length > 0 && (
          <div className="rounded-xl p-4" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <p className="text-[10px] font-black uppercase mb-4" style={{ color: '#475569' }}>Hành trình vận chuyển</p>
            <div className="relative pl-5">
              {[...shipment.trackingHistory].reverse().map((ev, i, arr) => (
                <div key={i} className="relative pb-4">
                  {i < arr.length - 1 && (
                    <div className="absolute left-[-13px] top-4 bottom-0 w-0.5" style={{ background: '#1e293b' }} />
                  )}
                  <div className="absolute left-[-17px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center"
                    style={{ background: i === 0 ? '#38bdf8' : '#0f172a', borderColor: i === 0 ? '#38bdf8' : '#334155' }}>
                    {i === 0 && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <p className="text-xs font-black text-white">{ev.status}</p>
                  {ev.location && <p className="text-[10px]" style={{ color: '#38bdf8' }}>📍 {ev.location}</p>}
                  {ev.note && <p className="text-[10px]" style={{ color: '#94a3b8' }}>{ev.note}</p>}
                  <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>{fmtDatetime(ev.time)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// SPLIT MODAL
// ─────────────────────────────────────────────────────────────────────────
interface SplitAlloc { sku: string; productName: string; color: string; size: string; totalQty: number; qtyA: number; qtyB: number }

const CARRIER_OPTIONS = [
  { id: 1, code: 'GHN',  name: 'Giao Hàng Nhanh' },
  { id: 2, code: 'GHTK', name: 'Giao Hàng Tiết Kiệm' },
  { id: 3, code: 'VTP',  name: 'Viettel Post' },
]

function SplitModal({
  shipment, onClose, onConfirm,
}: { shipment: Shipment; onClose: () => void; onConfirm: (req: SplitRequest) => void }) {
  const [allocs, setAllocs] = useState<SplitAlloc[]>(
    shipment.items.map(i => ({ sku: i.sku, productName: i.productName, color: i.color, size: i.size, totalQty: i.qty, qtyA: i.qty, qtyB: 0 }))
  )
  const [carrierA, setCarrierA] = useState(shipment.carrierId)
  const [carrierB, setCarrierB] = useState(shipment.carrierId)

  const updateA = (idx: number, val: number) =>
    setAllocs(prev => prev.map((a, i) => {
      if (i !== idx) return a
      const qA = Math.max(0, Math.min(val, a.totalQty))
      return { ...a, qtyA: qA, qtyB: a.totalQty - qA }
    }))

  const totalA = allocs.reduce((s, a) => s + a.qtyA, 0)
  const totalB = allocs.reduce((s, a) => s + a.qtyB, 0)
  const isValid = allocs.every(a => a.qtyA + a.qtyB === a.totalQty) && totalA > 0 && totalB > 0

  const handleConfirm = () => {
    if (!isValid) return
    onConfirm({
      splits: [
        { items: allocs.filter(a => a.qtyA > 0).map(a => ({ sku: a.sku, qty: a.qtyA })), carrierId: carrierA, serviceCode: 'standard' },
        { items: allocs.filter(a => a.qtyB > 0).map(a => ({ sku: a.sku, qty: a.qtyB })), carrierId: carrierB, serviceCode: 'standard' },
      ],
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(2,8,23,0.9)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background: '#0a1628', border: '1px solid #1e293b', width: 680, maxHeight: '85vh' }}>
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center gap-2">
            <SplitSquareVertical size={18} style={{ color: '#38bdf8' }} />
            <div>
              <h3 className="text-sm font-black text-white">Tách đơn vận chuyển</h3>
              <p className="text-[10px]" style={{ color: '#64748b' }}>{shipment.shipmentCode} — {shipment.customerName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: '#1e293b', color: '#64748b' }}>
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
          {/* Carrier selectors */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {[{ label: 'Hãng vận chuyển — Phiếu A', value: carrierA, set: setCarrierA, color: '#38bdf8' },
              { label: 'Hãng vận chuyển — Phiếu B', value: carrierB, set: setCarrierB, color: '#a78bfa' }].map(({ label, value, set, color }) => (
              <div key={label}>
                <p className="text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>{label}</p>
                <select value={value} onChange={e => set(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: '#1e293b', border: `1px solid ${color}30`, color }}>
                  {CARRIER_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            <div className="text-center"><p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Sản phẩm</p></div>
            <div className="text-center">
              <p className="text-xs font-black" style={{ color: '#38bdf8' }}>📦 Phiếu A</p>
              <p className="text-4xl font-black tabular-nums mt-1" style={{ color: '#38bdf8' }}>{totalA}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-black" style={{ color: '#a78bfa' }}>📦 Phiếu B</p>
              <p className="text-4xl font-black tabular-nums mt-1" style={{ color: '#a78bfa' }}>{totalB}</p>
            </div>
          </div>

          <div className="space-y-3">
            {allocs.map((a, i) => (
              <div key={a.sku} className="grid grid-cols-3 gap-4 items-center px-4 py-3 rounded-xl"
                style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
                <div>
                  <p className="text-xs font-bold text-white">{a.productName}</p>
                  <p className="text-[10px]" style={{ color: '#64748b' }}>{a.color} / {a.size} · Tổng: {a.totalQty}</p>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => updateA(i, a.qtyA - 1)} disabled={a.qtyA === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#1e293b', color: a.qtyA > 0 ? '#38bdf8' : '#334155' }}>
                    <Minus size={12} />
                  </button>
                  <input type="number" min={0} max={a.totalQty} value={a.qtyA}
                    onChange={e => updateA(i, Number(e.target.value))}
                    className="w-12 text-center px-1 py-1 rounded-lg text-sm font-black outline-none"
                    style={{ background: '#1e293b', border: '1px solid #38bdf840', color: '#38bdf8' }} />
                  <button onClick={() => updateA(i, a.qtyA + 1)} disabled={a.qtyA === a.totalQty}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: '#1e293b', color: a.qtyA < a.totalQty ? '#38bdf8' : '#334155' }}>
                    <Plus size={12} />
                  </button>
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-12 text-center px-1 py-1.5 rounded-lg text-sm font-black"
                    style={{ background: '#1e293b', border: '1px solid #a78bfa40', color: '#a78bfa' }}>
                    {a.qtyB}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isValid && (totalA > 0 || totalB > 0) && (
            <p className="mt-3 text-xs text-center" style={{ color: '#f59e0b' }}>
              ⚠ Mỗi phiếu phải có ít nhất 1 sản phẩm và tổng phải bằng đơn gốc
            </p>
          )}
        </div>

        <div className="px-6 py-4 flex gap-3 flex-shrink-0" style={{ borderTop: '1px solid #1e293b' }}>
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#1e293b', color: '#64748b' }}>
            Hủy
          </button>
          <button onClick={handleConfirm} disabled={!isValid}
            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
            style={{
              background: isValid ? '#38bdf820' : '#1e293b',
              color:      isValid ? '#38bdf8'   : '#475569',
              border:    `1px solid ${isValid ? '#38bdf840' : '#334155'}`,
            }}>
            Xác nhận tách đơn → {totalA} + {totalB} kiện
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN PAGE — 5 màn hình
// ─────────────────────────────────────────────────────────────────────────
import { ManifestStation } from './GiaoHangPage_A'
import { TaoVanDonScreen } from './GiaoHangPage_C'
import { BaoCaoScreen }    from './GiaoHangPage_D'

type ScreenId = 'create' | 'manifest' | 'reconcile' | 'kanban' | 'reports'

const SCREENS: { id: ScreenId; label: string; color: string }[] = [
  { id: 'create',    label: 'Tạo vận đơn',      color: '#f59e0b' },
  { id: 'manifest',  label: 'Bàn giao',          color: '#38bdf8' },
  { id: 'reconcile', label: 'Đối soát',           color: '#a78bfa' },
  { id: 'kanban',    label: 'Quản lý vận đơn',   color: '#10b981' },
  { id: 'reports',   label: 'Báo cáo',            color: '#64748b' },
]

export default function GiaoHangPage() {
  const [screen, setScreen] = useState<ScreenId>('create')

  return (
    <div className="h-full flex flex-col" style={{ background: '#020817', color: 'white' }}>
      <div className="flex items-center gap-1 px-4 py-2 flex-shrink-0"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
        {SCREENS.map(({ id, label, color }) => (
          <button key={id} onClick={() => setScreen(id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: screen === id ? color + '20' : 'transparent',
              color:      screen === id ? color         : '#64748b',
              border:    `1px solid ${screen === id ? color + '30' : 'transparent'}`,
            }}>
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {screen === 'create'    && <TaoVanDonScreen />}
        {screen === 'manifest'  && <ManifestStation />}
        {screen === 'reconcile' && <ReconciliationCenter />}
        {screen === 'kanban'    && <ShipmentKanban />}
        {screen === 'reports'   && <BaoCaoScreen />}
      </div>
    </div>
  )
}