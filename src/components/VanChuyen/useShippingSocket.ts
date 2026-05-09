// useShippingSocket.ts
import { useEffect, useRef, useCallback, useState } from 'react'
import type { WsEvent } from './data/shippingTypes'

export type WsStatus = 'connecting' | 'connected' | 'polling' | 'disconnected'

export function useShippingSocket({
  onEvent,
  onStatusChange,
  enabled = true,
}: {
  onEvent:         (event: WsEvent) => void
  onStatusChange?: (status: WsStatus) => void
  enabled?:        boolean
}) {
  const [wsStatus, setWsStatus] = useState<WsStatus>('disconnected')
  const wsRef      = useRef<WebSocket | null>(null)
  const pollerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const onEventRef = useRef(onEvent)

  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  const updateStatus = useCallback((s: WsStatus) => {
    setWsStatus(s)
    onStatusChange?.(s)
  }, [onStatusChange])

  // Polling fallback — simulates webhook events while BE WebSocket isn't ready
  const startPolling = useCallback(() => {
    updateStatus('polling')
    if (pollerRef.current) clearInterval(pollerRef.current)

    let tick = 0
    pollerRef.current = setInterval(() => {
      tick++
      // Sau này: GET /api/shipments/events?since=lastSeenAt
      // Demo: move shp003 to out_for_delivery after 30s
      if (tick === 3) {
        onEventRef.current({
          event:        'shipment.status_changed',
          shipmentId:   'shp003',
          trackingCode: 'GHN555001122',
          oldStatus:    'in_transit',
          newStatus:    'out_for_delivery',
          occurredAt:   new Date().toISOString(),
          shipment: {
            id: 'shp003', shipmentCode: 'SHIP-2412-003',
            trackingCode: 'GHN555001122',
            carrierId: 1, carrierCode: 'GHN',
            orderId: 'ord003', orderCode: 'DH-2412-003',
            customerName: 'Hoàng Thị Lan', customerPhone: '0703456789',
            shippingAddress: '12 Tôn Đức Thắng, Đống Đa, Hà Nội', province: 'Hà Nội',
            status: 'out_for_delivery',
            codAmount: 980_000, shippingFee: 30_000, weightGrams: 500, isSplit: false,
            items: [{ sku: 'SCS-020-M-XAM', productName: 'Set Công Sở', color: 'Xám', size: 'M', qty: 3 }],
            trackingHistory: [
              { time: '2024-12-12T06:00:00Z', status: 'Ra khỏi kho phân loại', note: '', location: 'Bưu cục Đống Đa' },
              { time: new Date().toISOString(), status: 'Đang giao đến khách', note: 'Bưu tá đang trên đường', location: 'Đống Đa, Hà Nội' },
            ],
            createdAt: '2024-12-11T07:00:00Z', updatedAt: new Date().toISOString(),
          },
        })
      }
    }, 10_000) // poll every 10s
  }, [updateStatus])

  useEffect(() => {
    if (!enabled) return

    const WS_URL = typeof import.meta !== 'undefined'
      ? (import.meta as any).env?.VITE_WS_URL
      : null

    if (WS_URL) {
      // Sau này: new WebSocket(`${WS_URL}/shipments?token=${getToken()}`)
      try {
        updateStatus('connecting')
        const ws = new WebSocket(WS_URL)
        wsRef.current = ws
        ws.onopen    = () => updateStatus('connected')
        ws.onmessage = (e) => { try { onEventRef.current(JSON.parse(e.data)) } catch {console.log()} }
        ws.onerror   = () => startPolling()
        ws.onclose   = () => { updateStatus('disconnected'); setTimeout(() => startPolling(), 5_000) }
      } catch { startPolling() }
    } else {
      startPolling()
    }

    return () => {
      wsRef.current?.close()
      if (pollerRef.current) clearInterval(pollerRef.current)
    }
  }, [enabled, startPolling, updateStatus])

  return { wsStatus }
}