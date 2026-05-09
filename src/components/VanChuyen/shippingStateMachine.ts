// shippingStateMachine.ts
import type { ShipmentStatus } from './data/shippingTypes'
import { VALID_TRANSITIONS } from './data/shippingTypes'

export function canTransition(from: ShipmentStatus, to: ShipmentStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

export function getAvailableTransitions(status: ShipmentStatus): ShipmentStatus[] {
  return VALID_TRANSITIONS[status] ?? []
}

// UI action guards — dùng để show/hide/disable buttons
export const ACTION_GUARDS = {
  canSplit:         (s: ShipmentStatus) => ['created', 'packing'].includes(s),
  canHandover:      (s: ShipmentStatus) => s === 'ready_to_handover',
  canProcessReturn: (s: ShipmentStatus) => s === 'returned',
  canManualRetry:   (s: ShipmentStatus) => s === 'failed',
  isTerminal:       (s: ShipmentStatus) => ['delivered', 'return_processed', 'split_cancelled'].includes(s),
} as const

// Map raw API status → kanban column key
export function resolveKanbanCol(status: ShipmentStatus): string {
  const map: Record<ShipmentStatus, string> = {
    created:           'packing',
    packing:           'packing',
    ready_to_handover: 'packing',
    handed_over:       'waiting_pickup',
    picked_up:         'delivering',
    in_transit:        'delivering',
    out_for_delivery:  'delivering',
    delivered:         'success',
    failed:            'returning',
    retry:             'returning',
    returning:         'returning',
    returned:          'returning',
    return_processed:  'returning',
    split_cancelled:   'cancelled',
  }
  return map[status] ?? 'packing'
}

// SLA thresholds per status (hours)
const SLA_HOURS: Partial<Record<ShipmentStatus, number>> = {
  packing:           24,
  ready_to_handover: 8,
  handed_over:       48,
  in_transit:        72,
  out_for_delivery:  24,
}

export interface SlaStatus {
  hoursSinceUpdate: number
  slaHours:         number | null
  isBreached:       boolean
  isWarning:        boolean   // > 75% of SLA
}

export function getSlaStatus(status: ShipmentStatus, updatedAt: string): SlaStatus {
  const slaHours = SLA_HOURS[status] ?? null
  const hoursSinceUpdate = (Date.now() - new Date(updatedAt).getTime()) / 3_600_000

  if (!slaHours) return { hoursSinceUpdate, slaHours: null, isBreached: false, isWarning: false }

  return {
    hoursSinceUpdate,
    slaHours,
    isBreached: hoursSinceUpdate > slaHours,
    isWarning:  hoursSinceUpdate > slaHours * 0.75,
  }
}