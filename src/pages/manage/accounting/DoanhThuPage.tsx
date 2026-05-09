// ─────────────────────────────────────────────────────────────────────────────
// DoanhThuPage.tsx — Trang Doanh thu & Giá vốn — gom 3 tab
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ShoppingBag, Package, BarChart2, ShieldCheck } from "lucide-react";
import Tab30OrderApproval from "../../../components/ThuChi/DoanhThu/Tab30OrderApproval";
import Tab31DoanhThu from "../../../components/ThuChi/DoanhThu/Tab31DoanhThu";
import Tab32GiaVon   from "../../../components/ThuChi/DoanhThu/Tab32GiaVon";
import Tab33PnL      from "../../../components/ThuChi/DoanhThu/Tab33PnL";
import { MOCK_COGS_DRAFTS } from "../../../components/ThuChi/data/accountingMockData";
import { MOCK_SALES_ORDERS, MOCK_ORDER_APPROVALS  } from "../../../components/ThuChi/data/revenueMockData";

type Tab = "30" | "31" | "32" | "33";
 
export default function DoanhThuPage() {
  const [tab, setTab] = useState<Tab>("30");
 
  const badge_30 = MOCK_ORDER_APPROVALS.filter(o => o.approval_status === "cho_duyet").length;
  const badge_31 = MOCK_SALES_ORDERS.filter(o => o.status === "cho_xuat_hd").length;
  const badge_32 = MOCK_COGS_DRAFTS.filter(c => c.status === "draft").length;
 
  const TABS = [
    { id: "30" as Tab, label: "Duyệt đơn",     icon: ShieldCheck, badge: badge_30, desc: "Thẩm định rủi ro tài chính" },
    { id: "31" as Tab, label: "Doanh thu",     icon: ShoppingBag, badge: badge_31, desc: "Xuất hóa đơn · Hoàn trả" },
    { id: "32" as Tab, label: "Giá vốn",       icon: Package,     badge: badge_32, desc: "Duyệt COGS · Hao hụt"   },
    { id: "33" as Tab, label: "Kết quả KD",    icon: BarChart2,   badge: 0,        desc: "P&L · Khóa sổ"           },
  ];

  return (
    <div className="flex flex-col h-screen" style={{ background: "#020817" }}>
      {/* Page header */}
      <div className="px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <h1 className="text-base font-black text-white">Doanh thu & Giá vốn</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
          Duyệt đơn → Xuất hóa đơn → Duyệt COGS → Xem P&L
        </p>
      </div>
 
      {/* Tab bar */}
      <div className="flex border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setTab(id)}
            className="flex items-center gap-2.5 px-6 py-3.5 text-xs font-bold transition-all relative"
            style={{
              color:        tab === id ? "#38bdf8" : "#475569",
              borderBottom: tab === id ? "2px solid #38bdf8" : "2px solid transparent",
            }}>
            <Icon size={14} />
            <span>{label}</span>
            {badge > 0 && (
              <span className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-black"
                style={{ background: "#f59e0b", color: "#020817" }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
 
      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {tab === "30" && <Tab30OrderApproval />}
        {tab === "31" && <Tab31DoanhThu />}
        {tab === "32" && <Tab32GiaVon />}
        {tab === "33" && <Tab33PnL />}
      </div>
    </div>
  );
}