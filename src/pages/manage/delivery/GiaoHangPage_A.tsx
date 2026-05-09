// GiaoHangPage_A.tsx — MH1: Trạm Bàn giao (Manifest Station)
// MH2 (Return QC) đã được loại bỏ
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Scan, CheckCircle, AlertTriangle, X,
  Truck, Clock, User,
  Download, RotateCcw,
} from 'lucide-react'

import type {
  StartSessionResponse, ScannedItem, ConfirmManifestResponse,
} from '../../../components/VanChuyen/data/shippingTypes'

import {
  startManifestSession, validateScan, confirmManifest,
} from '../../../components/VanChuyen/service/shippingService'

// ── Audio ─────────────────────────────────────────────────────────────────
function useAudio() {
  const ctx = useRef<AudioContext | null>(null)
  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    return ctx.current
  }
  const beep = useCallback((freq: number, dur: number, vol = 0.4, type: OscillatorType = 'sine') => {
    try {
      const c = getCtx(), osc = c.createOscillator(), gain = c.createGain()
      osc.connect(gain); gain.connect(c.destination)
      osc.frequency.value = freq; osc.type = type
      gain.gain.setValueAtTime(vol, c.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur)
      osc.start(c.currentTime); osc.stop(c.currentTime + dur)
    } catch{ console.log("Error") }
  }, [])
  const success = useCallback(() => { beep(880, 0.1); setTimeout(() => beep(1100, 0.1), 100) }, [beep])
  const error   = useCallback(() => { beep(200, 0.15, 0.5, 'square'); setTimeout(() => beep(180, 0.15, 0.5, 'square'), 180); setTimeout(() => beep(160, 0.2, 0.5, 'square'), 360) }, [beep])
  return { success, error }
}

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const fmtTime = (s: string) => new Date(s).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const fmtDatetime = (s: string) => new Date(s).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

const CARRIERS = [
  { code: 'GHTK',  name: 'Giao Hàng Tiết Kiệm', color: '#10b981' },
  { code: 'GHN',   name: 'Giao Hàng Nhanh',      color: '#38bdf8' },
  { code: 'VTP',   name: 'Viettel Post',          color: '#f97316' },
  { code: 'MIXED', name: 'Nhiều hãng (hỗn hợp)', color: '#a78bfa' },
]

type SessionPhase = 'setup' | 'scanning' | 'confirming' | 'done'

interface ScannedEntry extends ScannedItem { scannedAt: string }

// ─────────────────────────────────────────────────────────────────────────
// PHASE 0 — SESSION SETUP (chọn ĐVVC trước khi quét)
// ─────────────────────────────────────────────────────────────────────────
function SessionSetup({ onStart }: { onStart: (session: StartSessionResponse) => void }) {
  const [selectedCarrier, setSelectedCarrier] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    if (!selectedCarrier) return
    setLoading(true)
    const result = await startManifestSession({
      carrierCode:  selectedCarrier,
      warehouseId:  'WH_01',
      operatorId:   'NV_KHO_01',
    })
    setLoading(false)
    if (result.ok) onStart(result.data)
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-8" style={{ background: '#020817' }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: '#38bdf820', border: '1px solid #38bdf830' }}>
          <Truck size={32} style={{ color: '#38bdf8' }} />
        </div>
        <h2 className="text-xl font-black text-white mb-1">Bắt đầu phiên bàn giao</h2>
        <p className="text-sm" style={{ color: '#64748b' }}>Chọn đơn vị vận chuyển trước khi bắt đầu quét</p>
      </div>

      <div className="w-full max-w-sm space-y-3">
        <p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Đơn vị vận chuyển *</p>
        <div className="grid grid-cols-2 gap-3">
          {CARRIERS.map(c => (
            <button
              key={c.code}
              onClick={() => setSelectedCarrier(c.code)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-left transition-all"
              style={{
                background: selectedCarrier === c.code ? c.color + '20' : '#0f172a',
                border: `1px solid ${selectedCarrier === c.code ? c.color + '50' : '#1e293b'}`,
                color: selectedCarrier === c.code ? c.color : '#64748b',
              }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: selectedCarrier === c.code ? c.color : '#334155' }} />
              <span className="text-xs font-black">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedCarrier || loading}
        className="px-10 py-3.5 rounded-2xl text-sm font-black transition-all"
        style={{
          background: selectedCarrier ? '#38bdf820' : '#1e293b',
          color:      selectedCarrier ? '#38bdf8'   : '#475569',
          border:    `1px solid ${selectedCarrier ? '#38bdf840' : '#334155'}`,
        }}
      >
        {loading ? 'Đang tạo phiên...' : 'Bắt đầu quét →'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────
function ConfirmModal({
  session, scanned, onConfirm, onCancel, loading,
}: {
  session:    StartSessionResponse
  scanned:    ScannedEntry[]
  onConfirm:  () => void
  onCancel:   () => void
  loading:    boolean
}) {
  const byCarrier = scanned.reduce<Record<string, number>>((acc, i) => {
    acc[i.carrierCode] = (acc[i.carrierCode] ?? 0) + 1; return acc
  }, {})
  const totalCod = scanned.reduce((s, i) => s + i.codAmount, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(2,8,23,0.88)', backdropFilter: 'blur(4px)' }}>
      <div className="rounded-2xl overflow-hidden w-96"
        style={{ background: '#0a1628', border: '1px solid #1e293b' }}>
        <div className="px-6 py-4" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
          <h3 className="text-sm font-black text-white">Xác nhận chốt phiên bàn giao</h3>
          <p className="text-[11px] mt-0.5" style={{ color: '#64748b' }}>{session.manifestId}</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Tổng số kiện */}
          <div className="rounded-xl px-5 py-4 text-center"
            style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
            <p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Tổng số kiện</p>
            <p className="text-5xl font-black tabular-nums mt-1" style={{ color: '#38bdf8' }}>{scanned.length}</p>
          </div>

          {/* Breakdown per carrier */}
          <div className="space-y-2">
            {Object.entries(byCarrier).map(([carrier, cnt]) => (
              <div key={carrier} className="flex items-center justify-between px-4 py-2 rounded-xl"
                style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
                <span className="text-xs font-bold text-white">{carrier}</span>
                <span className="text-sm font-black tabular-nums" style={{ color: '#f59e0b' }}>{cnt} kiện</span>
              </div>
            ))}
          </div>

          {/* Tổng COD */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: '#10b98110', border: '1px solid #10b98130' }}>
            <span className="text-xs font-bold" style={{ color: '#64748b' }}>Tổng tiền COD</span>
            <span className="text-sm font-black tabular-nums" style={{ color: '#10b981' }}>{fmt(totalCod)}</span>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: '#1e293b', color: '#64748b' }}>
            Kiểm tra lại
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all"
            style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}>
            {loading ? 'Đang chốt...' : 'Xác nhận chốt phiên'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PHASE 3 — DONE SCREEN
// ─────────────────────────────────────────────────────────────────────────
function DoneScreen({ result, onNewSession }: { result: ConfirmManifestResponse; onNewSession: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-8" style={{ background: '#020817' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: '#10b98120', border: '3px solid #10b981' }}>
        <CheckCircle size={40} style={{ color: '#10b981' }} />
      </div>

      <div className="text-center">
        <h3 className="text-xl font-black text-white mb-1">Bàn giao thành công!</h3>
        <p className="text-sm" style={{ color: '#64748b' }}>
          {result.shipmentsUpdated} kiện đã được bàn giao lúc {fmtDatetime(result.confirmedAt)}
        </p>
      </div>

      <div className="w-full max-w-sm rounded-xl overflow-hidden"
        style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
        <div className="px-4 py-2.5" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
          <p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Chi tiết phiên</p>
        </div>
        <div className="px-4 py-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span style={{ color: '#64748b' }}>Mã phiên</span>
            <span className="font-black" style={{ color: '#38bdf8' }}>{result.manifestId}</span>
          </div>
          {Object.entries(result.summary.byCarrier).map(([c, n]) => (
            <div key={c} className="flex justify-between text-xs">
              <span style={{ color: '#64748b' }}>{c}</span>
              <span className="font-bold text-white">{n} kiện</span>
            </div>
          ))}
          <div className="flex justify-between text-xs pt-2" style={{ borderTop: '1px solid #1e293b' }}>
            <span style={{ color: '#64748b' }}>Tổng COD</span>
            <span className="font-black tabular-nums" style={{ color: '#10b981' }}>
              {fmt(result.summary.totalCod)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <a
          href={result.manifestPdfUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black"
          style={{ background: '#a78bfa20', color: '#a78bfa', border: '1px solid #a78bfa30' }}
        >
          <Download size={14} /> Tải biên bản
        </a>
        <button onClick={onNewSession}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black"
          style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf840' }}>
          <RotateCcw size={14} /> Phiên mới
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// PHASE 1+2 — SCANNING
// ─────────────────────────────────────────────────────────────────────────
function ScanningPhase({
  session,
  onRequestConfirm,
}: {
  session: StartSessionResponse
  onRequestConfirm: (scanned: ScannedEntry[]) => void
}) {
  const [input, setInput]     = useState('')
  const [scanned, setScanned] = useState<ScannedEntry[]>([])
  const [flash, setFlash]     = useState<{ type: 'ok' | 'error'; msg: string } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { success: playOk, error: playErr } = useAudio()

  // Always keep focus
  useEffect(() => {
    const refocus = () => setTimeout(() => inputRef.current?.focus(), 50)
    document.addEventListener('click', refocus)
    inputRef.current?.focus()
    return () => document.removeEventListener('click', refocus)
  }, [])

  const showFlash = (type: 'ok' | 'error', msg: string) => {
    setFlash({ type, msg })
    setTimeout(() => setFlash(null), 2200)
  }

  const handleScan = useCallback(async (code: string) => {
    const trimmed = code.trim()
    if (!trimmed) return

    // FE-side duplicate check — no API call needed
    if (scanned.some(s => s.trackingCode === trimmed)) {
      playErr()
      showFlash('error', `Mã "${trimmed}" đã quét trong phiên này rồi!`)
      setInput('')
      return
    }

    const result = await validateScan({ manifestId: session.manifestId, trackingCode: trimmed })

    if (!result.ok) {
      playErr()
      showFlash('error', result.message)
      setInput('')
      return
    }

    playOk()
    const entry: ScannedEntry = { ...result.data, scannedAt: new Date().toISOString() }
    setScanned(prev => [entry, ...prev])
    showFlash('ok', `✓ ${result.data.receiverName} — ${result.data.receiverProvince}`)
    setInput('')
  }, [scanned, session.manifestId, playOk, playErr])

  const byCarrier = scanned.reduce<Record<string, number>>((acc, i) => {
    acc[i.carrierCode] = (acc[i.carrierCode] ?? 0) + 1; return acc
  }, {})
  const totalCod = scanned.reduce((s, i) => s + i.codAmount, 0)

  return (
    <div className="flex h-full" style={{ background: '#020817' }}>
      {/* ── Left panel ── */}
      <div className="flex flex-col flex-shrink-0"
        style={{ width: 360, borderRight: '1px solid #1e293b', background: '#0a1628' }}>

        {/* Session header */}
        <div className="px-5 py-3 space-y-1" style={{ borderBottom: '1px solid #1e293b' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scan size={15} style={{ color: '#38bdf8' }} />
              <span className="text-sm font-black text-white">Trạm Bàn giao</span>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
              style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf830' }}>
              {session.manifestId}
            </span>
          </div>
          <div className="flex items-center gap-4 text-[10px]" style={{ color: '#475569' }}>
            <span className="flex items-center gap-1"><User size={9} /> {session.operatorName}</span>
            <span className="flex items-center gap-1"><Truck size={9} /> {session.carrierCode}</span>
            <span className="flex items-center gap-1"><Clock size={9} /> {fmtDatetime(session.startedAt)}</span>
          </div>
        </div>

        {/* Flash feedback */}
        <div className="mx-4 mt-4 px-4 py-3 rounded-xl flex items-center gap-2 transition-all"
          style={{
            background: flash?.type === 'ok' ? '#10b98120' : flash?.type === 'error' ? '#ef444420' : '#1e293b',
            color:      flash?.type === 'ok' ? '#10b981'   : flash?.type === 'error' ? '#ef4444'   : '#334155',
            border:    `1px solid ${flash?.type === 'ok' ? '#10b98140' : flash?.type === 'error' ? '#ef444440' : '#1e293b'}`,
            minHeight: 48,
          }}>
          {flash?.type === 'ok'    && <CheckCircle size={15} />}
          {flash?.type === 'error' && <AlertTriangle size={15} />}
          <span className="text-sm font-bold">{flash?.msg ?? 'Chờ quét...'}</span>
        </div>

        {/* Scanner input */}
        <div className="px-4 mt-4">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleScan(input) }}
            autoFocus
            placeholder="Quét hoặc gõ mã vận đơn..."
            className="w-full px-4 py-4 rounded-2xl outline-none font-black"
            style={{ background: '#1e293b', border: '2px solid #38bdf8', color: 'white', fontSize: 18 }}
          />
        </div>

        {/* Big counter */}
        <div className="px-4 mt-5">
          <div className="rounded-2xl px-5 py-4 text-center"
            style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <p className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Tổng kiện đã quét</p>
            <p className="tabular-nums mt-1 font-black" style={{ color: '#38bdf8', fontSize: 64, lineHeight: 1.1 }}>
              {scanned.length}
            </p>
          </div>

          {/* Per-carrier breakdown */}
          {Object.keys(byCarrier).length > 0 && (
            <div className="mt-3 rounded-xl px-4 py-3 space-y-2"
              style={{ background: '#1e293b', border: '1px solid #334155' }}>
              {Object.entries(byCarrier).map(([carrier, cnt]) => (
                <div key={carrier} className="flex items-center justify-between">
                  <span className="text-xs font-bold" style={{ color: '#94a3b8' }}>{carrier}</span>
                  <span className="text-lg font-black tabular-nums" style={{ color: '#f59e0b' }}>{cnt}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid #334155' }}>
                <span className="text-xs font-bold" style={{ color: '#64748b' }}>Tổng COD</span>
                <span className="text-sm font-black tabular-nums" style={{ color: '#10b981' }}>{fmt(totalCod)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* Quick test tip */}
        <div className="mx-4 mb-3 px-3 py-2 rounded-xl text-[10px]"
          style={{ background: '#f59e0b10', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
          💡 Thử: <code className="font-mono">GHTK001234567</code> · <code className="font-mono">GHN555001122</code>
        </div>

        {/* CTA */}
        <div className="p-4" style={{ borderTop: '1px solid #1e293b' }}>
          <button
            onClick={() => onRequestConfirm(scanned)}
            disabled={scanned.length === 0}
            className="w-full py-3.5 rounded-2xl text-sm font-black transition-all"
            style={{
              background: scanned.length ? '#10b98120' : '#1e293b',
              color:      scanned.length ? '#10b981'   : '#475569',
              border:    `1px solid ${scanned.length ? '#10b98140' : '#334155'}`,
            }}>
            Chốt phiên bàn giao ({scanned.length} kiện)
          </button>
        </div>
      </div>

      {/* ── Right: scanned list ── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-5 py-3 flex items-center justify-between flex-shrink-0"
          style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}>
          <div>
            <h3 className="text-sm font-black text-white">Danh sách đã quét</h3>
            <p className="text-[10px]" style={{ color: '#64748b' }}>Mới nhất trên cùng</p>
          </div>
          {scanned.length > 0 && (
            <button onClick={() => setScanned([])} className="flex items-center gap-1 text-xs" style={{ color: '#ef4444' }}>
              <X size={12} /> Xóa tất cả
            </button>
          )}
        </div>

        {/* Table header */}
        <div className="grid px-5 py-2 flex-shrink-0"
          style={{
            gridTemplateColumns: '200px 1fr 80px 90px 90px 36px',
            background: '#020817', borderBottom: '1px solid #1e293b',
          }}>
          {['MÃ VẬN ĐƠN', 'KHÁCH HÀNG', 'HÃNG', 'COD', 'QUÉT LÚC', ''].map(h => (
            <div key={h} className="text-[9px] font-black uppercase" style={{ color: '#334155' }}>{h}</div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {scanned.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Scan size={48} style={{ color: '#1e293b' }} />
              <p className="text-sm font-black" style={{ color: '#334155' }}>Chưa có mã nào được quét</p>
            </div>
          ) : (
            scanned.map((item, i) => (
              <div key={item.trackingCode}
                className="grid px-5 items-center"
                style={{
                  gridTemplateColumns: '200px 1fr 80px 90px 90px 36px',
                  borderBottom: '1px solid #0f172a',
                  background: i === 0 ? '#10b98108' : i % 2 === 1 ? '#0f172a40' : 'transparent',
                  borderLeft: `3px solid ${i === 0 ? '#10b981' : 'transparent'}`,
                  padding: '10px 20px',
                }}>
                <span className="text-xs font-black font-mono" style={{ color: i === 0 ? '#38bdf8' : '#94a3b8' }}>
                  {item.trackingCode}
                </span>
                <div>
                  <p className="text-xs font-bold text-white">{item.receiverName}</p>
                  <p className="text-[10px]" style={{ color: '#64748b' }}>{item.orderCode} · {item.receiverProvince}</p>
                </div>
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: '#38bdf820', color: '#38bdf8', border: '1px solid #38bdf830' }}>
                  {item.carrierCode}
                </span>
                <span className="text-xs font-black tabular-nums text-right" style={{ color: '#10b981' }}>
                  {fmt(item.codAmount)}
                </span>
                <span className="text-[10px] tabular-nums" style={{ color: '#475569' }}>
                  {fmtTime(item.scannedAt)}
                </span>
                <button onClick={() => setScanned(prev => prev.filter(s => s.trackingCode !== item.trackingCode))}
                  className="p-1 rounded" style={{ color: '#334155' }}>
                  <X size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MANIFEST STATION — Orchestrator
// ─────────────────────────────────────────────────────────────────────────
export function ManifestStation() {
  const [phase, setPhase]         = useState<SessionPhase>('setup')
  const [session, setSession]     = useState<StartSessionResponse | null>(null)
  const [pendingScanned, setPending] = useState<ScannedEntry[]>([])
  const [confirming, setConfirming] = useState(false)
  const [doneResult, setDoneResult] = useState<ConfirmManifestResponse | null>(null)

  const handleSessionStart = (s: StartSessionResponse) => {
    setSession(s)
    setPhase('scanning')
  }

  const handleRequestConfirm = (scanned: ScannedEntry[]) => {
    setPending(scanned)
    setPhase('confirming')
  }

  const handleConfirm = async () => {
    if (!session || !pendingScanned.length) return
    setConfirming(true)
    const result = await confirmManifest({
      manifestId:           session.manifestId,
      carrierCode:          session.carrierCode,
      totalPackages:        pendingScanned.length,
      scannedTrackingCodes: pendingScanned.map(s => s.trackingCode),
      createdBy:            session.operatorId,
    })
    setConfirming(false)
    if (result.ok) {
      setDoneResult(result.data)
      setPhase('done')
    }
  }

  const handleNewSession = () => {
    setPhase('setup')
    setSession(null)
    setPending([])
    setDoneResult(null)
  }

  return (
    <div className="h-full flex flex-col" style={{ background: '#020817' }}>
      {phase === 'setup'     && <SessionSetup onStart={handleSessionStart} />}
      {phase === 'scanning'  && session && (
        <ScanningPhase session={session} onRequestConfirm={handleRequestConfirm} />
      )}
      {phase === 'confirming' && session && (
        <>
          {/* Keep scanning UI visible behind modal */}
          <ScanningPhase session={session} onRequestConfirm={handleRequestConfirm} />
          <ConfirmModal
            session={session}
            scanned={pendingScanned}
            onConfirm={handleConfirm}
            onCancel={() => setPhase('scanning')}
            loading={confirming}
          />
        </>
      )}
      {phase === 'done' && doneResult && (
        <DoneScreen result={doneResult} onNewSession={handleNewSession} />
      )}
    </div>
  )
}