// GiaoHangPage_D.tsx — MH6: Báo cáo Giao hàng
import { useState, useEffect, useMemo } from 'react'
import {
  TrendingUp, TrendingDown, Download,
  ChevronDown, AlertTriangle,
} from 'lucide-react'

import type { ShippingReport, CarrierPerformance } from '../../../components/VanChuyen/data/shippingTypes'
import { getShippingReport } from '../../../components/VanChuyen/service/shippingService'

// ── Helpers ───────────────────────────────────────────────────────────────
const fmt     = (n: number) => n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
const fmtM    = (n: number) => `${(n / 1_000_000).toFixed(1)}M`
const fmtPct  = (n: number) => `${n.toFixed(1)}%`
const fmtDays = (n: number) => `${n.toFixed(1)} ngày`

const CARRIER_COLORS: Record<string, string> = {
  GHTK: '#10b981',
  GHN:  '#38bdf8',
  VTP:  '#f97316',
  J_T:  '#a78bfa',
}
const carrierColor = (code: string) => CARRIER_COLORS[code] ?? '#64748b'

// ─────────────────────────────────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, color, delta,
}: {
  label: string; value: string; sub?: string; color: string; delta?: number
}) {
  return (
    <div className="rounded-xl px-4 py-3" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
      <p className="text-[10px] font-black uppercase mb-1" style={{ color: '#475569' }}>{label}</p>
      <p className="text-2xl font-black tabular-nums" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] mt-0.5" style={{ color: '#64748b' }}>{sub}</p>}
      {delta !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {delta >= 0
            ? <TrendingUp size={11} style={{ color: '#10b981' }} />
            : <TrendingDown size={11} style={{ color: '#ef4444' }} />}
          <span className="text-[10px] font-black" style={{ color: delta >= 0 ? '#10b981' : '#ef4444' }}>
            {delta >= 0 ? '+' : ''}{fmtPct(Math.abs(delta))} so kỳ trước
          </span>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// LINE CHART — Đơn theo ngày
// ─────────────────────────────────────────────────────────────────────────
function LineChart({ data }: { data: ShippingReport['trends']['daily'] }) {
  const W = 600, H = 160, PAD = { t: 16, b: 36, l: 40, r: 16 }
  const gW = W - PAD.l - PAD.r
  const gH = H - PAD.t - PAD.b

  const maxCount   = Math.max(...data.map(d => d.count), 1)
  const showEvery  = Math.ceil(data.length / 8)

  const xOf = (i: number) => PAD.l + (i / (data.length - 1)) * gW
  const yOf  = (v: number) => PAD.t + gH - (v / maxCount) * gH

  const countPath   = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(d.count)}`).join(' ')
  const successPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i)} ${yOf(d.success)}`).join(' ')

  const areaPath = `${countPath} L ${xOf(data.length - 1)} ${PAD.t + gH} L ${PAD.l} ${PAD.t + gH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(f => (
        <line key={f}
          x1={PAD.l} y1={PAD.t + gH * (1 - f)}
          x2={W - PAD.r} y2={PAD.t + gH * (1 - f)}
          stroke="#1e293b" strokeWidth={1} />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill="#38bdf808" />

      {/* Lines */}
      <path d={countPath}   fill="none" stroke="#38bdf8" strokeWidth={2} />
      <path d={successPath} fill="none" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 2" />

      {/* X labels */}
      {data.map((d, i) => i % showEvery === 0 && (
        <text key={i} x={xOf(i)} y={H - 8} textAnchor="middle"
          fill="#475569" fontSize={9} fontFamily="system-ui">
          {d.date.slice(5)}
        </text>
      ))}

      {/* Y labels */}
      {[0, Math.round(maxCount / 2), maxCount].map(v => (
        <text key={v} x={PAD.l - 4} y={yOf(v) + 3} textAnchor="end"
          fill="#475569" fontSize={9} fontFamily="system-ui">
          {v}
        </text>
      ))}

      {/* Legend */}
      <circle cx={PAD.l + 8} cy={12} r={4} fill="#38bdf8" />
      <text x={PAD.l + 16} y={16} fill="#94a3b8" fontSize={9} fontFamily="system-ui">Tổng đơn</text>
      <circle cx={PAD.l + 76} cy={12} r={4} fill="#10b981" />
      <text x={PAD.l + 84} y={16} fill="#94a3b8" fontSize={9} fontFamily="system-ui">Thành công</text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// BAR CHART — Phí theo hãng
// ─────────────────────────────────────────────────────────────────────────
function BarChart({ data }: { data: ShippingReport['shippingFee']['byCarrier'] }) {
  const W = 340, H = 160, PAD = { t: 16, b: 36, l: 48, r: 16 }
  const gW = W - PAD.l - PAD.r
  const gH = H - PAD.t - PAD.b
  const maxVal = Math.max(...data.map(d => d.fee), 1)
  const barW   = gW / data.length * 0.55
  const gap    = gW / data.length

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 0.5, 1].map(f => (
        <line key={f}
          x1={PAD.l} y1={PAD.t + gH * (1 - f)}
          x2={W - PAD.r} y2={PAD.t + gH * (1 - f)}
          stroke="#1e293b" strokeWidth={1} />
      ))}
      {data.map((d, i) => {
        const bH  = (d.fee / maxVal) * gH
        const bX  = PAD.l + i * gap + (gap - barW) / 2
        const bY  = PAD.t + gH - bH
        const col = carrierColor(d.carrier)
        return (
          <g key={d.carrier}>
            <rect x={bX} y={bY} width={barW} height={bH} rx={3}
              fill={col} fillOpacity={0.7} />
            <text x={bX + barW / 2} y={PAD.t + gH + 14} textAnchor="middle"
              fill="#94a3b8" fontSize={9} fontFamily="system-ui">
              {d.carrier}
            </text>
            <text x={bX + barW / 2} y={bY - 4} textAnchor="middle"
              fill={col} fontSize={9} fontFamily="system-ui" fontWeight="bold">
              {fmtM(d.fee)}
            </text>
          </g>
        )
      })}
      {[0, Math.round(maxVal / 2_000_000), Math.round(maxVal / 1_000_000)].map((v, i) => (
        <text key={i} x={PAD.l - 4} y={PAD.t + gH - (v * 1_000_000 / maxVal) * gH + 3}
          textAnchor="end" fill="#475569" fontSize={9} fontFamily="system-ui">
          {v}M
        </text>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// DONUT CHART — Phân bố hãng
// ─────────────────────────────────────────────────────────────────────────
function DonutChart({ data }: { data: ShippingReport['shippingFee']['byCarrier'] }) {
  const total  = data.reduce((s, d) => s + d.count, 0)
  const R      = 50, cx = 80, cy = 65, rInner = 28
  let angle    = -Math.PI / 2

  const slices = data.map(d => {
    const frac  = d.count / total
    const start = angle
    angle += frac * 2 * Math.PI
    return { ...d, frac, start, end: angle }
  })

  const arc = (s: number, e: number) => {
    const x1 = cx + R * Math.cos(s), y1 = cy + R * Math.sin(s)
    const x2 = cx + R * Math.cos(e), y2 = cy + R * Math.sin(e)
    const xi1 = cx + rInner * Math.cos(e), yi1 = cy + rInner * Math.sin(e)
    const xi2 = cx + rInner * Math.cos(s), yi2 = cy + rInner * Math.sin(s)
    const large = e - s > Math.PI ? 1 : 0
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${rInner} ${rInner} 0 ${large} 0 ${xi2} ${yi2} Z`
  }

  return (
    <svg viewBox="0 0 200 130" className="w-full" style={{ height: 130 }}>
      {slices.map(s => (
        <path key={s.carrier} d={arc(s.start, s.end)}
          fill={carrierColor(s.carrier)} fillOpacity={0.85} />
      ))}
      <text x={cx} y={cy + 5} textAnchor="middle" fill="white"
        fontSize={11} fontFamily="system-ui" fontWeight="bold">
        {total}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#64748b" fontSize={8} fontFamily="system-ui">đơn</text>

      {/* Legend */}
      {slices.map((s, i) => (
        <g key={s.carrier}>
          <rect x={130} y={20 + i * 22} width={8} height={8} rx={2}
            fill={carrierColor(s.carrier)} fillOpacity={0.85} />
          <text x={142} y={29 + i * 22} fill="#94a3b8" fontSize={9} fontFamily="system-ui">
            {s.carrier}
          </text>
          <text x={190} y={29 + i * 22} textAnchor="end" fill="white"
            fontSize={9} fontFamily="system-ui" fontWeight="bold">
            {(s.frac * 100).toFixed(0)}%
          </text>
        </g>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// CARRIER PERFORMANCE TABLE
// ─────────────────────────────────────────────────────────────────────────
function PerfTable({ data }: { data: CarrierPerformance[] }) {
  const [sort, setSort] = useState<keyof CarrierPerformance>('successRate')
  const [dir, setDir]   = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => [...data].sort((a, b) => {
    const av = a[sort] as number, bv = b[sort] as number
    return dir === 'desc' ? bv - av : av - bv
  }), [data, sort, dir])

  const toggle = (k: keyof CarrierPerformance) => {
    if (sort === k) setDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSort(k); setDir('desc') }
  }

  const COLS: { key: keyof CarrierPerformance; label: string }[] = [
    { key: 'carrierName',     label: 'ĐVVC' },
    { key: 'total',           label: 'Tổng đơn' },
    { key: 'successRate',     label: 'Tỷ lệ TC' },
    { key: 'avgDeliveryDays', label: 'Giao TB' },
    { key: 'returnRate',      label: 'Tỷ lệ hoàn' },
    { key: 'avgFee',          label: 'Phí TB' },
  ]

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid #1e293b' }}>
      <div className="grid" style={{ gridTemplateColumns: '1fr 80px 90px 80px 90px 80px', background: '#020817', borderBottom: '1px solid #1e293b' }}>
        {COLS.map(c => (
          <button key={c.key} onClick={() => toggle(c.key)}
            className="px-3 py-2 text-[9px] font-black uppercase text-left hover:text-white transition-colors"
            style={{ color: sort === c.key ? '#38bdf8' : '#334155' }}>
            {c.label} {sort === c.key ? (dir === 'desc' ? '↓' : '↑') : ''}
          </button>
        ))}
      </div>
      {sorted.map((row, i) => {
        const color = carrierColor(row.carrierCode)
        return (
          <div key={row.carrierCode}
            className="grid px-0"
            style={{
              gridTemplateColumns: '1fr 80px 90px 80px 90px 80px',
              borderBottom: '1px solid #0f172a',
              background: i % 2 === 1 ? '#0f172a40' : 'transparent',
            }}>
            <div className="px-3 py-2.5 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="text-xs font-bold text-white">{row.carrierName}</span>
            </div>
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-xs tabular-nums" style={{ color: '#94a3b8' }}>{row.total.toLocaleString('vi-VN')}</span>
            </div>
            <div className="px-3 py-2.5 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b', maxWidth: 40 }}>
                <div className="h-1.5 rounded-full" style={{ width: `${row.successRate}%`, background: row.successRate >= 90 ? '#10b981' : row.successRate >= 80 ? '#f59e0b' : '#ef4444' }} />
              </div>
              <span className="text-xs font-black tabular-nums" style={{ color: row.successRate >= 90 ? '#10b981' : row.successRate >= 80 ? '#f59e0b' : '#ef4444' }}>
                {fmtPct(row.successRate)}
              </span>
            </div>
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-xs tabular-nums" style={{ color: '#94a3b8' }}>{fmtDays(row.avgDeliveryDays)}</span>
            </div>
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-xs font-bold tabular-nums" style={{ color: row.returnRate > 5 ? '#ef4444' : row.returnRate > 3 ? '#f59e0b' : '#10b981' }}>
                {fmtPct(row.returnRate)}
              </span>
            </div>
            <div className="px-3 py-2.5 flex items-center">
              <span className="text-xs tabular-nums" style={{ color: '#64748b' }}>{fmt(row.avgFee)}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// FAILURE REASONS
// ─────────────────────────────────────────────────────────────────────────
function FailureReasons({ data }: { data: ShippingReport['failureReasons'] }) {
  return (
    <div className="space-y-2">
      {data.map((r, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold" style={{ color: i === 0 ? 'white' : '#94a3b8' }}>{r.reason}</span>
              <span className="text-xs font-black tabular-nums" style={{ color: '#64748b' }}>{r.count}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${r.percentage}%`,
                  background: i === 0 ? '#ef4444' : i === 1 ? '#f97316' : '#f59e0b',
                }}
              />
            </div>
          </div>
          <span className="text-xs font-black tabular-nums w-12 text-right" style={{ color: '#64748b' }}>
            {fmtPct(r.percentage)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// MH6 MAIN
// ─────────────────────────────────────────────────────────────────────────
type Period = 'today' | 'week' | 'month' | 'quarter'

const PERIOD_LABELS: Record<Period, string> = {
  today:   'Hôm nay',
  week:    'Tuần này',
  month:   'Tháng này',
  quarter: 'Quý này',
}

function periodRange(p: Period): { from: string; to: string } {
  const now = new Date()
  const to  = now.toISOString().slice(0, 10)
  const from = new Date(
    p === 'today'   ? now :
    p === 'week'    ? new Date(now.setDate(now.getDate() - 7))  :
    p === 'month'   ? new Date(now.setDate(1))                  :
                      new Date(now.setMonth(Math.floor(now.getMonth() / 3) * 3, 1))
  ).toISOString().slice(0, 10)
  return { from, to }
}

export function BaoCaoScreen() {
  const [period, setPeriod]   = useState<Period>('month')
  const [report, setReport]   = useState<ShippingReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPeriod, setShowPeriod] = useState(false)

  useEffect(() => {
    setLoading(true)
    const { from, to } = periodRange(period)
    getShippingReport(from, to).then(r => {
      if (r.ok) setReport(r.data)
      setLoading(false)
    })
  }, [period])

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: '#020817', scrollbarWidth: 'thin' }}>
      {/* Header */}
      <div
        className="px-6 py-3 flex items-center justify-between flex-shrink-0 sticky top-0 z-10"
        style={{ background: '#0a1628', borderBottom: '1px solid #1e293b' }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={18} style={{ color: '#10b981' }} />
          <h2 className="text-sm font-black text-white">Báo cáo Giao hàng</h2>
        </div>
        <div className="flex items-center gap-2">
          {/* Period picker */}
          <div className="relative">
            <button
              onClick={() => setShowPeriod(!showPeriod)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155' }}
            >
              {PERIOD_LABELS[period]}
              <ChevronDown size={12} />
            </button>
            {showPeriod && (
              <div
                className="absolute right-0 top-9 rounded-xl overflow-hidden z-20"
                style={{ background: '#0a1628', border: '1px solid #1e293b', minWidth: 140 }}
              >
                {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setShowPeriod(false) }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold transition-all"
                    style={{
                      background: period === p ? '#1e293b' : 'transparent',
                      color: period === p ? 'white' : '#64748b',
                    }}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#1e293b', color: '#64748b', border: '1px solid #334155' }}
          >
            <Download size={12} /> Xuất Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1 h-40">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#10b981' }} />
        </div>
      ) : report ? (
        <div className="px-6 py-5 space-y-5">

          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-4 gap-3">
            <KpiCard label="Tổng vận đơn"    value={report.kpis.totalShipments.toLocaleString('vi-VN')}  color="#38bdf8" />
            <KpiCard label="Thành công"       value={report.kpis.delivered.toLocaleString('vi-VN')}       color="#10b981"
              delta={report.kpis.vsPrevious.successRate} sub={fmtPct(report.kpis.successRate)} />
            <KpiCard label="Hoàn / Thất bại"  value={report.kpis.returned.toLocaleString('vi-VN')}        color="#ef4444"
              delta={-report.kpis.vsPrevious.returnRate} sub={fmtPct(report.kpis.returnRate)} />
            <KpiCard label="Tổng phí ship"    value={fmtM(report.shippingFee.total)}                      color="#f97316"
              sub={`TB: ${fmt(report.shippingFee.average)}/đơn`} />
          </div>

          {/* ── Charts row ── */}
          <div className="grid grid-cols-3 gap-4">
            {/* Line chart */}
            <div className="col-span-2 rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <div className="px-4 py-2.5" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
                <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Đơn hàng theo ngày</span>
              </div>
              <div className="px-4 pt-3 pb-2">
                <LineChart data={report.trends.daily} />
              </div>
            </div>

            {/* Donut */}
            <div className="rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <div className="px-4 py-2.5" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
                <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Phân bố theo ĐVVC</span>
              </div>
              <div className="px-3 pt-2 pb-1">
                <DonutChart data={report.shippingFee.byCarrier} />
              </div>
            </div>
          </div>

          {/* ── Bar + failure reasons row ── */}
          <div className="grid grid-cols-5 gap-4">
            {/* Bar chart */}
            <div className="col-span-2 rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <div className="px-4 py-2.5" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
                <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>Phí ship theo ĐVVC</span>
              </div>
              <div className="px-4 pt-3 pb-2">
                <BarChart data={report.shippingFee.byCarrier} />
              </div>
            </div>

            {/* Failure reasons */}
            <div className="col-span-3 rounded-xl overflow-hidden" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
              <div className="px-4 py-2.5 flex items-center gap-2" style={{ background: '#020817', borderBottom: '1px solid #1e293b' }}>
                <AlertTriangle size={12} style={{ color: '#ef4444' }} />
                <span className="text-[10px] font-black uppercase" style={{ color: '#475569' }}>
                  Lý do giao thất bại ({report.kpis.failed} đơn)
                </span>
              </div>
              <div className="p-4">
                <FailureReasons data={report.failureReasons} />
              </div>
            </div>
          </div>

          {/* ── Carrier performance table ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-black text-white">Hiệu suất từng ĐVVC</h3>
              <span className="text-[10px]" style={{ color: '#64748b' }}>Click header để sắp xếp</span>
            </div>
            <PerfTable data={report.carrierPerformance} />
          </div>

        </div>
      ) : null}
    </div>
  )
}