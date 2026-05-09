// ─────────────────────────────────────────────────────────────────────────────
// Tab31DoanhThu.tsx — Màn hình 3.1: Quản lý Doanh thu & Xuất Hóa đơn
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  FileText, RotateCcw, X,
  AlertCircle
} from "lucide-react";
import type { SalesOrder } from "../data/revenueTypes";
import type { Invoice } from "../data/accountingTypes";
import { MOCK_SALES_ORDERS } from "../data/revenueMockData";
import { MOCK_INVOICES } from "../data/accountingMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}
function fmt_short(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + " tỷ";
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(0) + " tr";
  return fmt(n);
}
function fmt_ngay(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const STATUS_CONFIG = {
  cho_xuat_hd: { nhan: "Chờ xuất HĐ", mau: "#f59e0b", nen: "#78350f20" },
  da_xuat_hd:  { nhan: "Đã xuất HĐ",  mau: "#10b981", nen: "#06472520" },
  hoan_tra:    { nhan: "Hoàn trả",     mau: "#ef4444", nen: "#7f1d1d20" },
  huy:         { nhan: "Đã hủy",       mau: "#475569", nen: "#1e293b"   },
};

// ─── Modal xuất hóa đơn ───────────────────────────────────────────────────────

function ModalXuatHD({ order, onClose, onDone }: {
  order:   SalesOrder;
  onClose: () => void;
  onDone:  (order_id: string) => void;
}) {
  const [vat_rate,  setVatRate]  = useState(order.vat_rate);
  const [loading,   setLoading]  = useState(false);
  const [error,     setError]    = useState("");
  const is_da_xuat = order.status === "da_xuat_hd";

  // FE tự tính — không cần gọi BE
  const vat_amount = Math.round(order.subtotal * vat_rate / 100);
  const total      = order.subtotal + vat_amount;
  const total_vnd  = Math.round(total * order.exchange_rate);

  const handle_phat_hanh = async () => {
    setLoading(true);
    setError("");
    try {
      // Tạo Invoice vào MOCK_INVOICES
      const inv: Invoice = {
        invoice_id:    `inv-${Date.now()}`,
        invoice_code:  `HD-2026-${String(MOCK_INVOICES.length + 1).padStart(4, "0")}`,
        customer_id:   order.customer_id,
        customer_name: order.customer_name,
        order_id:      order.order_id,
        issue_date:    new Date().toISOString().split("T")[0],
        due_date:      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
        currency:      order.currency,
        exchange_rate: order.exchange_rate,
        subtotal:      order.subtotal,
        tax_amount:    vat_amount,
        total_amount:  total,
        total_vnd,
        paid_amount:   0,
        remaining:     total_vnd,
        status:        "sent",
        note:          order.note,
        lines:         order.items.map((item, i) => ({
          line_id:     `il-${Date.now()}-${i}`,
          invoice_id:  "",
          sku_code:    item.sku_code,
          description: item.ten_sp,
          quantity:    item.so_luong,
          unit_price:  item.don_gia,
          amount:      item.thanh_tien,
          center_id:   item.center_id,
        })),
      };
      MOCK_INVOICES.unshift(inv);

      // Cập nhật đơn hàng
      const idx = MOCK_SALES_ORDERS.findIndex(o => o.order_id === order.order_id);
      if (idx >= 0) {
        MOCK_SALES_ORDERS[idx].status     = "da_xuat_hd";
        MOCK_SALES_ORDERS[idx].invoice_id = inv.invoice_id;
      }

      onDone(order.order_id);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handle_hoan_tra = async () => {
    setLoading(true);
    const idx = MOCK_SALES_ORDERS.findIndex(o => o.order_id === order.order_id);
    if (idx >= 0) MOCK_SALES_ORDERS[idx].status = "hoan_tra";
    onDone(order.order_id);
    onClose();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.88)" }}
      onClick={onClose}>
      <div className="flex flex-col rounded-2xl overflow-hidden w-[640px]"
        style={{ background: "#0a1628", border: "1px solid #1e293b", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          <div>
            <div className="flex items-center gap-2">
              <code className="text-sm font-black" style={{ color: "#38bdf8" }}>
                {order.order_code}
              </code>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  background: STATUS_CONFIG[order.status].nen,
                  color:      STATUS_CONFIG[order.status].mau,
                }}>
                {STATUS_CONFIG[order.status].nhan}
              </span>
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
              {order.customer_name} · Giao {fmt_ngay(order.delivery_date)}
              {order.thi_truong === "xuat_khau" && (
                <span className="ml-2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "#0c435420", color: "#38bdf8" }}>
                  Xuất khẩu
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "thin" }}>

          {/* Chi tiết hàng hóa */}
          <div>
            <p className="text-[10px] font-black uppercase mb-2" style={{ color: "#475569" }}>
              Chi tiết hàng hóa
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
              <div className="grid px-4 py-2 text-[9px] font-black uppercase"
                style={{ gridTemplateColumns: "1fr 60px 100px 110px",
                  background: "#020817", color: "#334155",
                  borderBottom: "1px solid #1e293b" }}>
                <span>Sản phẩm</span>
                <span className="text-right">SL</span>
                <span className="text-right">Đơn giá</span>
                <span className="text-right">Thành tiền</span>
              </div>
              {order.items.map((item, i) => (
                <div key={item.item_id}
                  className="grid items-center px-4 py-2.5 gap-2"
                  style={{ gridTemplateColumns: "1fr 60px 100px 110px",
                    borderBottom: i < order.items.length - 1 ? "1px solid #0f172a" : "none" }}>
                  <div>
                    <p className="text-xs font-bold text-white truncate">{item.ten_sp}</p>
                    <code className="text-[9px]" style={{ color: "#334155" }}>{item.sku_code}</code>
                  </div>
                  <p className="text-xs text-right" style={{ color: "#94a3b8" }}>{fmt(item.so_luong)}</p>
                  <p className="text-xs text-right" style={{ color: "#64748b",
                    fontVariantNumeric: "tabular-nums" }}>
                    {order.currency !== "VND"
                      ? `$${item.don_gia}`
                      : fmt(item.don_gia) + "đ"}
                  </p>
                  <p className="text-xs font-bold text-right"
                    style={{ color: "#38bdf8", fontVariantNumeric: "tabular-nums" }}>
                    {order.currency !== "VND"
                      ? `$${fmt(item.thanh_tien)}`
                      : fmt(item.thanh_tien) + "đ"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tính thuế VAT — FE tự tính */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
            <div className="px-4 py-3" style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                Thông tin thuế & Tổng thanh toán
              </p>
            </div>
            <div className="px-4 py-4 space-y-3">
              {/* VAT input */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Thuế VAT (%)</p>
                  <p className="text-[10px]" style={{ color: "#334155" }}>
                    {order.thi_truong === "xuat_khau" ? "Xuất khẩu — thường 0%" : "Nội địa — thường 8% hoặc 10%"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {[0, 8, 10].map(r => (
                    <button key={r} onClick={() => !is_da_xuat && setVatRate(r)}
                      disabled={is_da_xuat}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                      style={{
                        background: vat_rate === r ? "#0c435425" : "#1e293b",
                        color:      vat_rate === r ? "#38bdf8"   : "#475569",
                        border:     `1px solid ${vat_rate === r ? "#38bdf840" : "#334155"}`,
                      }}>
                      {r}%
                    </button>
                  ))}
                  <input type="number" min={0} max={100}
                    value={vat_rate} disabled={is_da_xuat}
                    onChange={e => setVatRate(Number(e.target.value))}
                    className="w-16 text-center px-2 py-1.5 rounded-lg text-xs outline-none"
                    style={{ background: "#1e293b", border: "1px solid #334155",
                      color: "#38bdf8", fontVariantNumeric: "tabular-nums" }} />
                </div>
              </div>

              {/* Tổng tự tính — JS compute */}
              <div className="space-y-2 pt-2" style={{ borderTop: "1px solid #1e293b" }}>
                {[
                  { label: "Giá trị đơn hàng (chưa thuế)", val: order.subtotal, mau: "#94a3b8" },
                  { label: `Thuế VAT (${vat_rate}%)`,        val: vat_amount,     mau: "#f59e0b" },
                ].map(({ label, val, mau }) => (
                  <div key={label} className="flex items-center justify-between">
                    <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
                    <p className="text-xs font-bold"
                      style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
                      {order.currency !== "VND" ? `$${fmt(val)}` : fmt(val) + "đ"}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2"
                  style={{ borderTop: "1px solid #1e293b" }}>
                  <p className="text-sm font-black text-white">Tổng thanh toán</p>
                  <div className="text-right">
                    {order.currency !== "VND" && (
                      <p className="text-[11px]" style={{ color: "#64748b" }}>
                        {order.currency} {fmt(total)}
                      </p>
                    )}
                    <p className="text-lg font-black"
                      style={{ color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                      {fmt(total_vnd)}đ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
              style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
              <AlertCircle size={12} style={{ color: "#ef4444" }} />
              <p className="text-xs" style={{ color: "#fca5a5" }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          {is_da_xuat ? (
            <>
              <button onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Đóng
              </button>
              <button onClick={handle_hoan_tra} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
                <RotateCcw size={14} />
                Nhận hàng hoàn / Trả lại
              </button>
            </>
          ) : (
            <>
              <button onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Huỷ
              </button>
              <button onClick={handle_phat_hanh} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
                <FileText size={14} />
                {loading ? "Đang phát hành..." : "Phát hành Hóa đơn"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Tab 3.1 ─────────────────────────────────────────────────────────────

export default function Tab31DoanhThu() {
  const [orders,   setOrders]  = useState<SalesOrder[]>(MOCK_SALES_ORDERS);
  const [filter,   setFilter]  = useState<SalesOrder["status"] | "">("");
  const [search,   setSearch]  = useState("");
  const [selected, setSelected] = useState<SalesOrder | null>(null);

  const filtered = orders.filter(o => {
    if (filter && o.status !== filter) return false;
    if (search && !o.customer_name.toLowerCase().includes(search.toLowerCase())
      && !o.order_code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tong_cho  = orders.filter(o => o.status === "cho_xuat_hd").reduce((s, o) => s + o.total_vnd, 0);
  const tong_xuat = orders.filter(o => o.status === "da_xuat_hd").reduce((s, o) => s + o.total_vnd, 0);
  const tong_hoan = orders.filter(o => o.status === "hoan_tra").reduce((s, o) => s + o.total_vnd, 0);

  const handle_done = () => setOrders([...MOCK_SALES_ORDERS]);

  return (
    <div className="flex flex-col h-full">
      {/* KPI */}
      <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        {[
          { label: "Chờ xuất hóa đơn", val: tong_cho,  mau: "#f59e0b", count: orders.filter(o => o.status === "cho_xuat_hd").length },
          { label: "Đã xuất hóa đơn",  val: tong_xuat, mau: "#10b981", count: orders.filter(o => o.status === "da_xuat_hd").length  },
          { label: "Hàng hoàn trả",    val: tong_hoan,  mau: "#ef4444", count: orders.filter(o => o.status === "hoan_tra").length    },
        ].map(({ label, val, mau, count }) => (
          <div key={label} className="px-4 py-3 rounded-xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: "#334155" }}>
              {label} ({count})
            </p>
            <p className="text-xl font-black"
              style={{ color: mau, fontVariantNumeric: "tabular-nums" }}>
              {fmt_short(val)}đ
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 px-6 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm mã đơn, khách hàng..."
          className="px-3 py-1.5 rounded-xl text-xs outline-none w-52"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "white" }} />
        <select value={filter} onChange={e => setFilter(e.target.value as any)}
          className="px-3 py-1.5 rounded-xl text-xs outline-none"
          style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
          <option value="">Tất cả trạng thái</option>
          <option value="cho_xuat_hd">Chờ xuất HĐ</option>
          <option value="da_xuat_hd">Đã xuất HĐ</option>
          <option value="hoan_tra">Hoàn trả</option>
        </select>
        <p className="text-[10px]" style={{ color: "#334155" }}>
          {filtered.length} đơn hàng
        </p>
      </div>

      {/* Bảng */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="grid items-center px-6 py-2 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "110px 100px 160px 60px 140px 100px 90px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <span>Mã đơn</span>
          <span>Ngày giao</span>
          <span>Khách hàng</span>
          <span>Loại</span>
          <span className="text-right">Giá trị (chưa thuế)</span>
          <span className="text-right">Tổng TT</span>
          <span className="text-center">Trạng thái</span>
        </div>

        {filtered.map((o, i) => {
          const cfg = STATUS_CONFIG[o.status];
          return (
            <div key={o.order_id}
              className="grid items-center px-6 py-3 gap-2 cursor-pointer hover:bg-slate-800/30 transition-colors"
              style={{
                gridTemplateColumns: "110px 100px 160px 60px 140px 100px 90px",
                borderBottom: "1px solid #0f172a",
                background: i % 2 === 0 ? "transparent" : "#0f172a40",
              }}
              onClick={() => setSelected(o)}>
              <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                {o.order_code}
              </code>
              <p className="text-[11px]" style={{ color: "#64748b" }}>
                {fmt_ngay(o.delivery_date)}
              </p>
              <p className="text-xs font-bold text-white truncate">{o.customer_name}</p>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-center"
                style={{ background: o.thi_truong === "xuat_khau" ? "#0c435420" : "#1e293b",
                  color: o.thi_truong === "xuat_khau" ? "#38bdf8" : "#475569" }}>
                {o.thi_truong === "xuat_khau" ? "XK" : "NĐ"}
              </span>
              <p className="text-xs text-right" style={{ color: "#94a3b8",
                fontVariantNumeric: "tabular-nums" }}>
                {o.currency !== "VND"
                  ? `$${fmt(o.subtotal)}`
                  : fmt(o.subtotal) + "đ"}
              </p>
              <p className="text-sm font-black text-right"
                style={{ color: "#10b981", fontVariantNumeric: "tabular-nums" }}>
                {fmt_short(o.total_vnd)}đ
              </p>
              <div className="flex justify-center">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: cfg.nen, color: cfg.mau }}>
                  {cfg.nhan}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <ModalXuatHD
          order={selected}
          onClose={() => setSelected(null)}
          onDone={handle_done} />
      )}
    </div>
  );
}