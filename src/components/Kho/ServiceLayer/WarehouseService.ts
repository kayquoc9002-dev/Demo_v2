// ─────────────────────────────────────────────────────────────────────────────
// warehouseService.ts — Service layer cho Module 2: Sơ đồ kho
//
// Bây giờ: trỏ vào Mock Data
// Sau này: swap nội dung các hàm → fetch('/api/warehouse/...')
// UI components (WarehouseLayout, SkuRuleManager) chỉ import từ đây
// ─────────────────────────────────────────────────────────────────────────────

import type { WarehouseConfig, LocationNode, SkuLocationRule } from "../data/warehouseTypes";
import {
  MOCK_WAREHOUSE_CONFIG,
  MOCK_NODES,
  MOCK_SKU_RULES,
} from "../data/warehouseMockData";

// ─── Warehouse Config ─────────────────────────────────────────────────────────

export async function layWarehouseConfig(): Promise<WarehouseConfig> {
  return MOCK_WAREHOUSE_CONFIG;
  // Sau này: return fetch('/api/warehouse/config').then(r => r.json());
}

export async function capNhatWarehouseConfig(config: WarehouseConfig): Promise<void> {
  console.log("[warehouseService] capNhatWarehouseConfig", config);
  // Sau này: await fetch('/api/warehouse/config', { method: 'PUT', body: JSON.stringify(config) });
}

// ─── Location Nodes ───────────────────────────────────────────────────────────

export async function layDanhSachNodes(): Promise<LocationNode[]> {
  return MOCK_NODES;
  // Sau này: return fetch('/api/warehouse/nodes').then(r => r.json());
}

export async function taoNode(node: LocationNode): Promise<LocationNode> {
  console.log("[warehouseService] taoNode", node);
  return node;
  // Sau này:
  // return fetch('/api/warehouse/nodes', {
  //   method: 'POST', body: JSON.stringify(node)
  // }).then(r => r.json());
}

export async function capNhatNode(node: LocationNode): Promise<LocationNode> {
  console.log("[warehouseService] capNhatNode", node.id);
  return node;
  // Sau này:
  // return fetch(`/api/warehouse/nodes/${node.id}`, {
  //   method: 'PUT', body: JSON.stringify(node)
  // }).then(r => r.json());
}

export async function xoaNode(node_id: string): Promise<void> {
  console.log("[warehouseService] xoaNode", node_id);
  // Sau này: await fetch(`/api/warehouse/nodes/${node_id}`, { method: 'DELETE' });
}

// ─── SKU Location Rules ───────────────────────────────────────────────────────

export async function layDanhSachSkuRules(): Promise<SkuLocationRule[]> {
  return MOCK_SKU_RULES;
  // Sau này: return fetch('/api/warehouse/sku-rules').then(r => r.json());
}

export async function taoSkuRule(rule: SkuLocationRule): Promise<SkuLocationRule> {
  console.log("[warehouseService] taoSkuRule", rule);
  return rule;
  // Sau này:
  // return fetch('/api/warehouse/sku-rules', {
  //   method: 'POST', body: JSON.stringify(rule)
  // }).then(r => r.json());
}

export async function capNhatSkuRule(rule: SkuLocationRule): Promise<SkuLocationRule> {
  console.log("[warehouseService] capNhatSkuRule", rule.id);
  return rule;
  // Sau này:
  // return fetch(`/api/warehouse/sku-rules/${rule.id}`, {
  //   method: 'PUT', body: JSON.stringify(rule)
  // }).then(r => r.json());
}

export async function xoaSkuRule(rule_id: string): Promise<void> {
  console.log("[warehouseService] xoaSkuRule", rule_id);
  // Sau này: await fetch(`/api/warehouse/sku-rules/${rule_id}`, { method: 'DELETE' });
}