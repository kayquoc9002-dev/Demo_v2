// ─────────────────────────────────────────────────────────────────────────────
// database.ts — In-memory database dùng chung giữa các module
//
// Đây là "single source of truth" cho các đối tượng cần liên thông:
//   - phieu_nhap:  Module 3 (InboundManager) + Module 6 (ReturnsManager)
//   - phieu_nhat:  Module 4 (OutboundManager) + Module 6 (ReturnsManager)
//   - ton_kho:     Module 5 (InventoryManager) + Module 3/4/6
//
// Bây giờ: dùng structuredClone từ mock data — reset khi reload trang
// Sau này: swap sang fetch() trong từng service — database.ts bị xóa
//
// KHÔNG import file này trực tiếp từ UI component
// Chỉ import qua service layer (inboundService, outboundService, inventoryService)
// ─────────────────────────────────────────────────────────────────────────────

import { MOCK_PHIEU_NHAP }  from "../data/inboundMockData";
import { MOCK_PHIEU_NHAT }  from "../data/outboundMockData";
import { MOCK_TON_KHO }     from "../data/inventoryMockData";

// ─── Database object ──────────────────────────────────────────────────────────
// structuredClone đảm bảo:
//   1. Mock data gốc không bao giờ bị thay đổi
//   2. Mỗi lần reload trang = data reset về trạng thái ban đầu
//   3. Các module ghi vào db.* không ảnh hưởng lẫn nhau qua mock

export const db = {
  phieu_nhap: structuredClone(MOCK_PHIEU_NHAP),
  phieu_nhat: structuredClone(MOCK_PHIEU_NHAT),
  ton_kho:    structuredClone(MOCK_TON_KHO),
};

// ─── Reset function — dùng khi demo xong muốn chạy lại ───────────────────────

export function resetDB(): void {
  db.phieu_nhap = structuredClone(MOCK_PHIEU_NHAP);
  db.phieu_nhat = structuredClone(MOCK_PHIEU_NHAT);
  db.ton_kho    = structuredClone(MOCK_TON_KHO);
  console.log("[database] Reset về trạng thái ban đầu");
}