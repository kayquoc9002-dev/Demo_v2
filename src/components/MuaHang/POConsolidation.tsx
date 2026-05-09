// ─────────────────────────────────────────────────────────────────────────────
// TabPOConsolidation.tsx — Tab 2: Gom hàng & Lên đơn
// Group approved items theo vendor → accordion cards
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Package, ChevronDown, ChevronRight, Trash2,
  FileText, Check, X, Calendar, Printer,
  MapPin, User, CreditCard, MessageSquare,
} from "lucide-react";
import type { ApprovedItem, PRItemSKU, PurchaseOrder, POItem } from "./data/purchaseTypes";
import { DIEU_KHOAN_OPTIONS } from "./data/purchaseTypes";
import { layApprovedItems, taoPO, dinh_dang_tien } from "./service/purchaseService";

// ─── Mock kho nhận hàng ───────────────────────────────────────────────────────

interface KhoNhanHang {
  kho_id:   string;
  ten_kho:  string;
  dia_chi:  string;
  thu_kho:  string;
  sdt:      string;
}

const MOCK_KHO: KhoNhanHang[] = [
  { kho_id: "k-1", ten_kho: "Kho Tổng Miền Nam", dia_chi: "123 Lê Lợi, Q1, TP.HCM",   thu_kho: "Nguyễn Minh Khoa", sdt: "0981234567" },
  { kho_id: "k-2", ten_kho: "Kho Miền Trung",    dia_chi: "45 Hùng Vương, Đà Nẵng",   thu_kho: "Trần Văn Nam",     sdt: "0912345678" },
  { kho_id: "k-3", ten_kho: "Kho Miền Bắc",      dia_chi: "78 Giải Phóng, Hà Nội",    thu_kho: "Lê Thị Hoa",      sdt: "0923456789" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tinh_ngay_giao(lead_time: number): string {
  const d = new Date();
  d.setDate(d.getDate() + lead_time);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

function format_ngay(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN");
}

// Item đang edit trong giỏ — có thể sửa qty và cost_price
interface CartSKU extends PRItemSKU {
  cost_price: number;
  ten_sp:     string;
}

interface VendorCart {
  vendor_id:   string;
  vendor_name: string;
  lead_time:   number;
  skus:        CartSKU[];
}

// ─── Modal Preview PO ─────────────────────────────────────────────────────────

function POPreviewModal({ cart, ngay_giao, kho_id, dieu_khoan, ghi_chu, onConfirm, onClose }: {
  cart:        VendorCart;
  ngay_giao:   string;
  kho_id:      string;
  dieu_khoan:  string;
  ghi_chu:     string;
  onConfirm:   () => Promise<void>;
  onClose:     () => void;
}) {
  const [loading, setLoading] = useState(false);
  const kho     = MOCK_KHO.find(k => k.kho_id === kho_id) ?? MOCK_KHO[0];
  const user    = JSON.parse(localStorage.getItem("user") || "{}");
  const tong    = cart.skus.reduce((s, sk) => s + sk.so_luong_duyet * sk.cost_price, 0);

  const handle_dat_hang = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  const handle_print = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.9)" }}
      onClick={onClose}>
      <div className="flex flex-col rounded-2xl overflow-hidden w-[680px]"
        style={{ background: "#0a1628", border: "1px solid #1e293b", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          <div>
            <h3 className="text-sm font-black text-white">Xem trước Đơn Đặt Hàng</h3>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Kiểm tra kỹ trước khi gửi cho {cart.vendor_name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handle_print}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              <Printer size={12} /> In / PDF
            </button>
            <button onClick={onClose}
              className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "#1e293b", color: "#64748b" }}>
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "thin" }}
          id="po-print-area">

          {/* Khu vực 1: Cấu hình */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #1e293b" }}>
            <div className="px-4 py-3"
              style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                Cấu hình giao nhận & thanh toán
              </p>
            </div>
            <div className="grid gap-4 px-4 py-4"
              style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { icon: Package,       label: "Nhà cung cấp",       val: cart.vendor_name },
                { icon: Calendar,      label: "Ngày dự kiến giao",   val: format_ngay(ngay_giao) },
                { icon: User,          label: "Người đặt",           val: user.name ?? "Admin" },
                { icon: CreditCard,    label: "Thanh toán",          val: dieu_khoan },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={13} style={{ color: "#475569", flexShrink: 0 }} />
                  <div>
                    <p className="text-[9px] font-black uppercase" style={{ color: "#334155" }}>{label}</p>
                    <p className="text-xs font-bold text-white">{val}</p>
                  </div>
                </div>
              ))}

              {/* Kho nhận hàng */}
              <div className="col-span-2 flex items-start gap-3">
                <MapPin size={13} style={{ color: "#475569", flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p className="text-[9px] font-black uppercase mb-0.5" style={{ color: "#334155" }}>
                    Giao đến
                  </p>
                  <p className="text-xs font-bold text-white">{kho.ten_kho}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>{kho.dia_chi}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    Thủ kho: {kho.thu_kho} · {kho.sdt}
                  </p>
                </div>
              </div>

              {/* Ghi chú */}
              {ghi_chu && (
                <div className="col-span-2 flex items-start gap-3">
                  <MessageSquare size={13} style={{ color: "#475569", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p className="text-[9px] font-black uppercase mb-0.5" style={{ color: "#334155" }}>
                      Ghi chú cho xưởng
                    </p>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>{ghi_chu}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Khu vực 2: Chi tiết hàng */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border: "1px solid #1e293b" }}>
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "#0f172a", borderBottom: "1px solid #1e293b" }}>
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                Chi tiết hàng hóa · {cart.skus.length} SKU
              </p>
              <p className="text-sm font-black" style={{ color: "#10b981" }}>
                {dinh_dang_tien(tong)}
              </p>
            </div>

            {/* Table header */}
            <div className="grid px-4 py-2 text-[9px] font-black uppercase"
              style={{ gridTemplateColumns: "1fr 80px 100px 100px",
                background: "#020817", color: "#334155",
                borderBottom: "1px solid #1e293b" }}>
              <span>SKU</span>
              <span className="text-center">SL</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-right">Thành tiền</span>
            </div>

            {cart.skus.map((sku, i) => (
              <div key={sku.sku_id}
                className="grid items-center px-4 py-2.5 gap-2"
                style={{ gridTemplateColumns: "1fr 80px 100px 100px",
                  borderBottom: i < cart.skus.length - 1 ? "1px solid #0f172a" : "none" }}>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{sku.ten_sp}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border border-white/10"
                      style={{ background: sku.color_hex }} />
                    <code className="text-[9px]" style={{ color: "#475569" }}>
                      {sku.color_name} / {sku.size_code} · {sku.ma_sku}
                    </code>
                  </div>
                </div>
                <p className="text-sm font-black text-center" style={{ color: "#38bdf8" }}>
                  {sku.so_luong_duyet}
                </p>
                <p className="text-xs text-right" style={{ color: "#94a3b8" }}>
                  {dinh_dang_tien(sku.cost_price)}
                </p>
                <p className="text-xs font-bold text-right" style={{ color: "#10b981" }}>
                  {dinh_dang_tien(sku.so_luong_duyet * sku.cost_price)}
                </p>
              </div>
            ))}

            {/* Tổng */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "#0f172a", borderTop: "1px solid #1e293b" }}>
              <p className="text-xs font-black text-white">
                Tổng cộng · {cart.skus.reduce((s, sk) => s + sk.so_luong_duyet, 0)} sản phẩm
              </p>
              <p className="text-base font-black" style={{ color: "#10b981" }}>
                {dinh_dang_tien(tong)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: "#1e293b", background: "#0a1628" }}>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Xem lại
          </button>
          <button onClick={handle_dat_hang} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
            <Check size={14} />
            {loading ? "Đang tạo..." : "Đặt hàng"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vendor Card ──────────────────────────────────────────────────────────────

function VendorCard({ cart, onTaoPO, onUpdate }: {
  cart:     VendorCart;
  onTaoPO:  (po: PurchaseOrder) => void;
  onUpdate: (vendor_id: string, skus: CartSKU[]) => void;
}) {
  const [expanded,    setExpanded]    = useState(true);
  const [ngay_giao,   setNgayGiao]    = useState(tinh_ngay_giao(cart.lead_time));
  const [kho_id,      setKhoId]       = useState(MOCK_KHO[0].kho_id);
  const [dieu_khoan,  setDieuKhoan]   = useState(DIEU_KHOAN_OPTIONS[2]);
  const [ghi_chu,     setGhiChu]      = useState("");
  const [show_preview, setShowPreview] = useState(false);
  const [local_skus,  setLocalSkus]   = useState<CartSKU[]>(cart.skus);

  const kho_chon = MOCK_KHO.find(k => k.kho_id === kho_id) ?? MOCK_KHO[0];
  const tong_tien = local_skus.reduce((s, sk) => s + sk.so_luong_duyet * sk.cost_price, 0);
  const tong_sl   = local_skus.reduce((s, sk) => s + sk.so_luong_duyet, 0);

  const update_sku = (sku_id: string, field: "so_luong_duyet" | "cost_price", val: number) => {
    const updated = local_skus.map(s => s.sku_id === sku_id ? { ...s, [field]: val } : s);
    setLocalSkus(updated);
    onUpdate(cart.vendor_id, updated);
  };

  const xoa_sku = (sku_id: string) => {
    const updated = local_skus.filter(s => s.sku_id !== sku_id);
    setLocalSkus(updated);
    onUpdate(cart.vendor_id, updated);
  };

  const handle_tao_po = async () => {
    const items: POItem[] = local_skus.map(sku => ({
      sku_id:        sku.sku_id,
      ma_sku:        sku.ma_sku,
      ten_sp:        sku.ten_sp,
      color_name:    sku.color_name,
      color_hex:     sku.color_hex,
      size_code:     sku.size_code,
      so_luong_dat:  sku.so_luong_duyet,
      so_luong_nhan: 0,
      don_gia:       sku.cost_price,
      thanh_tien:    sku.so_luong_duyet * sku.cost_price,
    }));

    const po = await taoPO(
      cart.vendor_id, cart.vendor_name, cart.lead_time,
      ngay_giao, dieu_khoan, ghi_chu, items,
    );

    setShowPreview(false);
    onTaoPO(po);
  };

  if (local_skus.length === 0) return null;

  return (
    <>
      <div className="rounded-2xl overflow-hidden"
        style={{ border: "1px solid #1e293b" }}>

        {/* Card Header */}
        <div className="px-5 py-4"
          style={{ background: "#0f172a", borderBottom: expanded ? "1px solid #1e293b" : "none" }}>
          <div className="flex items-start gap-4">
            {/* Expand toggle + tên vendor */}
            <button onClick={() => setExpanded(v => !v)}
              className="flex items-center gap-2 flex-1 min-w-0 text-left">
              {expanded
                ? <ChevronDown size={15} style={{ color: "#475569", flexShrink: 0 }} />
                : <ChevronRight size={15} style={{ color: "#475569", flexShrink: 0 }} />}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 18 }}>📦</span>
                  <p className="text-sm font-black text-white">{cart.vendor_name}</p>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                  {local_skus.length} SKU · Tổng:{" "}
                  <span className="font-black" style={{ color: "#10b981" }}>
                    {dinh_dang_tien(tong_tien)}
                  </span>
                </p>
              </div>
            </button>

            {/* Nút tạo đơn */}
            <button onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black flex-shrink-0"
              style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
              <FileText size={13} /> Tạo đơn
            </button>
          </div>

          {/* Inputs header */}
          {expanded && (
            <div className="grid gap-3 mt-4"
              style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>

              {/* Ngày giao */}
              <div>
                <label className="text-[9px] font-black uppercase mb-1 block"
                  style={{ color: "#334155" }}>
                  Ngày dự kiến giao
                </label>
                <input type="date" value={ngay_giao}
                  onChange={e => setNgayGiao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>
                  Gợi ý: hôm nay + {cart.lead_time} ngày
                </p>
              </div>

              {/* Điều khoản thanh toán */}
              <div>
                <label className="text-[9px] font-black uppercase mb-1 block"
                  style={{ color: "#334155" }}>
                  Điều khoản thanh toán
                </label>
                <select value={dieu_khoan}
                  onChange={e => setDieuKhoan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                  {DIEU_KHOAN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Kho nhận hàng */}
              <div>
                <label className="text-[9px] font-black uppercase mb-1 block"
                  style={{ color: "#334155" }}>
                  Giao đến kho
                </label>
                <select value={kho_id}
                  onChange={e => setKhoId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                  {MOCK_KHO.map(k => (
                    <option key={k.kho_id} value={k.kho_id}>{k.ten_kho}</option>
                  ))}
                </select>
                <p className="text-[9px] mt-0.5 truncate" style={{ color: "#334155" }}>
                  {kho_chon.dia_chi} · {kho_chon.thu_kho}
                </p>
              </div>

              {/* Ghi chú — full width */}
              <div className="col-span-3">
                <label className="text-[9px] font-black uppercase mb-1 block"
                  style={{ color: "#334155" }}>
                  Ghi chú cho xưởng
                </label>
                <input value={ghi_chu}
                  onChange={e => setGhiChu(e.target.value)}
                  placeholder="VD: Nhớ ủi kỹ cổ áo nhé em..."
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
              </div>
            </div>
          )}
        </div>

        {/* Mini table */}
        {expanded && (
          <>
            {/* Table header */}
            <div className="grid px-4 py-2 text-[9px] font-black uppercase"
              style={{ gridTemplateColumns: "1fr 100px 110px 110px 32px",
                background: "#020817", color: "#334155",
                borderBottom: "1px solid #1e293b" }}>
              <span>SKU</span>
              <span className="text-center">SL duyệt</span>
              <span className="text-right">Đơn giá vốn</span>
              <span className="text-right">Thành tiền</span>
              <span></span>
            </div>

            {local_skus.map((sku, i) => {
              const line_total = sku.so_luong_duyet * sku.cost_price;
              return (
                <div key={sku.sku_id}
                  className="grid items-center px-4 py-3 gap-2"
                  style={{ gridTemplateColumns: "1fr 100px 110px 110px 32px",
                    borderBottom: i < local_skus.length - 1 ? "1px solid #0f172a" : "none" }}>

                  {/* SKU info */}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{sku.ten_sp}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full border border-white/10 flex-shrink-0"
                        style={{ background: sku.color_hex }} />
                      <code className="text-[9px]" style={{ color: "#475569" }}>
                        {sku.color_name} / {sku.size_code}
                      </code>
                    </div>
                  </div>

                  {/* SL duyệt — inline edit */}
                  <input type="number" min={0}
                    value={sku.so_luong_duyet}
                    onChange={e => update_sku(sku.sku_id, "so_luong_duyet", Number(e.target.value))}
                    className="text-center text-sm font-black outline-none rounded-xl py-1.5"
                    style={{ background: "#0c435425", border: "1px solid #38bdf840", color: "#38bdf8" }} />

                  {/* Đơn giá vốn — inline edit */}
                  <input type="number" min={0}
                    value={sku.cost_price}
                    onChange={e => update_sku(sku.sku_id, "cost_price", Number(e.target.value))}
                    className="text-right text-xs font-bold outline-none rounded-xl py-1.5 px-2"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: "#f59e0b" }} />

                  {/* Thành tiền — reactive */}
                  <p className="text-right text-xs font-bold" style={{ color: "#10b981" }}>
                    {dinh_dang_tien(line_total)}
                  </p>

                  {/* Xóa */}
                  <button onClick={() => xoa_sku(sku.sku_id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-red-900/20 transition-all"
                    style={{ color: "#334155" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}

            {/* Tổng footer */}
            <div className="flex items-center justify-between px-4 py-3"
              style={{ background: "#0f172a", borderTop: "1px solid #1e293b" }}>
              <p className="text-xs" style={{ color: "#475569" }}>
                {local_skus.length} SKU · {tong_sl} sản phẩm
              </p>
              <p className="text-base font-black" style={{ color: "#10b981" }}>
                {dinh_dang_tien(tong_tien)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Modal preview PO */}
      {show_preview && (
        <POPreviewModal
          cart={{ ...cart, skus: local_skus }}
          ngay_giao={ngay_giao}
          kho_id={kho_id}
          dieu_khoan={dieu_khoan}
          ghi_chu={ghi_chu}
          onConfirm={handle_tao_po}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface TabPOConsolidationProps {
  onTaoPO?: (po: PurchaseOrder) => void;
}

export default function TabPOConsolidation({ onTaoPO = () => {} }: TabPOConsolidationProps) {
  const [carts, setCarts] = useState<VendorCart[]>([]);
  const [loading, setLoading] = useState(true);

  const load_data = async () => {
    const items = await layApprovedItems();

    // Group by vendor
    const groups: Record<string, ApprovedItem[]> = {};
    items.forEach(item => {
      if (!groups[item.vendor_id]) groups[item.vendor_id] = [];
      groups[item.vendor_id].push(item);
    });

    // Flatten thành VendorCart — mỗi vendor 1 cart chứa tất cả SKU
    const vendor_carts: VendorCart[] = Object.entries(groups).map(([vendor_id, vendor_items]) => {
      const first = vendor_items[0];
      const skus: CartSKU[] = vendor_items.flatMap(item =>
        item.skus
          .filter(s => s.so_luong_duyet > 0)
          .map(s => ({
            ...s,
            ten_sp:     item.ten_sp,
            cost_price: 85000, // TODO: lấy từ catalogService.laySkuById()
          }))
      );
      return { vendor_id, vendor_name: first.vendor_name, lead_time: first.lead_time, skus };
    });

    setCarts(vendor_carts);
    setLoading(false);
  };

  useEffect(() => { 
    const fetchLoadData = () => {
      load_data(); 
    }
    fetchLoadData()
  }, []);

  const handle_update = (vendor_id: string, skus: CartSKU[]) => {
    setCarts(prev => prev.map(c =>
      c.vendor_id === vendor_id ? { ...c, skus } : c
    ));
  };

  const handle_tao_po = (po: PurchaseOrder) => {
    // Xóa cart đã tạo PO khỏi Tab 2
    setCarts(prev => prev.filter(c => c.vendor_id !== po.vendor_id));
    onTaoPO(po);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "#475569" }}>Đang tải...</p>
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Check size={32} className="mb-3" style={{ color: "#10b981", opacity: 0.4 }} />
        <p className="text-sm font-bold" style={{ color: "#475569" }}>
          Giỏ hàng trống
        </p>
        <p className="text-xs mt-1" style={{ color: "#334155" }}>
          Duyệt PR ở Tab 1 để thêm hàng vào đây
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6 py-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "#475569" }}>
          {carts.length} nhà cung cấp · {carts.reduce((s, c) => s + c.skus.length, 0)} SKU
        </p>
        <p className="text-xs font-black" style={{ color: "#10b981" }}>
          Tổng: {dinh_dang_tien(carts.reduce((s, c) =>
            s + c.skus.reduce((ss, sk) => ss + sk.so_luong_duyet * sk.cost_price, 0), 0
          ))}
        </p>
      </div>

      {carts.map(cart => (
        <VendorCard
          key={cart.vendor_id}
          cart={cart}
          onTaoPO={handle_tao_po}
          onUpdate={handle_update}
        />
      ))}
    </div>
  );
}