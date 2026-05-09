// ─────────────────────────────────────────────────────────────────────────────
// MuaHangPage.tsx — Trang Thu mua: gom 3 tab lại
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ClipboardList, ShoppingCart, BarChart2 } from "lucide-react";
import type { PRItem, PurchaseOrder } from "../../../components/MuaHang/data/purchaseTypes";
import TabPRApproval     from "../../../components/MuaHang/PRApproval";
import TabPOConsolidation from "../../../components/MuaHang/POConsolidation";
import TabPOTracking     from "../../../components/MuaHang/POTracking";

type ActiveTab = "pr_approval" | "po_consolidation" | "po_tracking";

export default function PurchasePage() {
  const [active_tab, setActiveTab] = useState<ActiveTab>("pr_approval");
  const [badge_tab2, setBadgeTab2] = useState(0); // số item chờ gom PO
  const [badge_tab3, setBadgeTab3] = useState(0); // số PO mới tạo

  const handle_duyet = (items: PRItem[]) => {
    setBadgeTab2(prev => prev + items.length);
    setActiveTab("po_consolidation");
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handle_tao_po = (po: PurchaseOrder) => {
    setBadgeTab2(prev => Math.max(0, prev - 1));
    setBadgeTab3(prev => prev + 1);
    setActiveTab("po_tracking");
  };

  const TABS = [
    {
      id:    "pr_approval"      as ActiveTab,
      label: "Duyệt yêu cầu",
      icon:  ClipboardList,
      desc:  "Phân tích & chốt số lượng",
    },
    {
      id:    "po_consolidation" as ActiveTab,
      label: "Gom đơn",
      icon:  ShoppingCart,
      badge: badge_tab2,
      desc:  "Tạo đơn đặt hàng",
    },
    {
      id:    "po_tracking"      as ActiveTab,
      label: "Theo dõi PO",
      icon:  BarChart2,
      badge: badge_tab3,
      desc:  "Tháp điều khiển",
    },
  ];

  return (
    <div className="flex flex-col h-screen" style={{ background: "#020817" }}>

      {/* Page header */}
      <div className="px-6 py-5 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <h1 className="text-base font-black text-white">Thu mua hàng hóa</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
          Duyệt yêu cầu → Gom đơn → Theo dõi tiến độ
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        { // eslint-disable-next-line @typescript-eslint/no-unused-vars
        TABS.map(({ id, label, icon: Icon, badge, desc }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold transition-all relative"
            style={{
              color:        active_tab === id ? "#38bdf8" : "#475569",
              borderBottom: active_tab === id ? "2px solid #38bdf8" : "2px solid transparent",
            }}>
            <Icon size={14} />
            <span>{label}</span>
            {badge && badge > 0 ? (
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black"
                style={{ background: "#38bdf8", color: "#020817" }}>
                {badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {active_tab === "pr_approval"      && <TabPRApproval onDuyet={handle_duyet} />}
        {active_tab === "po_consolidation" && <TabPOConsolidation onTaoPO={handle_tao_po} />}
        {active_tab === "po_tracking"      && <TabPOTracking />}
      </div>
    </div>
  );
}