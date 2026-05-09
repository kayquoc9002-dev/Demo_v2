// ─────────────────────────────────────────────────────────────────────────────
// TabPOTracking.tsx — Tab 3: Theo dõi tiến trình PO (Tháp Điều Khiển)
// Filter + Data table + Progress bar + Drawer chi tiết
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Search, X, AlertTriangle,
  Lock, Printer, Package,
  ExternalLink, RefreshCw,
} from "lucide-react";
import type { PurchaseOrder, TrangThaiPO } from "./data/purchaseTypes";
import { TRANG_THAI_PO_CONFIG } from "./data/purchaseTypes";
import {
  layDanhSachPO, capNhatSoLuongNhan, huyPO,
  dinh_dang_tien,
} from "./service/purchaseService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function la_tre_han(po: PurchaseOrder): boolean {
  return (
    new Date() > new Date(po.ngay_du_kien_giao) &&
    po.trang_thai !== "da_nhap" &&
    po.trang_thai !== "huy"
  );
}

function so_ngay_tre(po: PurchaseOrder): number {
  const diff = Date.now() - new Date(po.ngay_du_kien_giao).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function trong_tuan_nay(iso: string): boolean {
  const d    = new Date(iso);
  const now  = new Date();
  const mon  = new Date(now); mon.setDate(now.getDate() - now.getDay() + 1);
  const sun  = new Date(mon); sun.setDate(mon.getDate() + 6);
  return d >= mon && d <= sun;
}

function trong_thang_nay(iso: string): boolean {
  const d = new Date(iso);
  const n = new Date();
  return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

// ─── Badge trạng thái ─────────────────────────────────────────────────────────

function TrangThaiBadge({ po }: { po: PurchaseOrder }) {
  const tre  = la_tre_han(po);
  const cfg  = tre ? TRANG_THAI_PO_CONFIG["tre_han"] : TRANG_THAI_PO_CONFIG[po.trang_thai];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.nhap_nhay ? "animate-pulse" : ""}`}
      style={{ background: cfg.nen, color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      {cfg.nhan}
    </span>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ po }: { po: PurchaseOrder }) {
  const pct        = po.pct_nhan;
  const tong_dat   = po.items.reduce((s, i) => s + i.so_luong_dat,  0);
  const tong_nhan  = po.items.reduce((s, i) => s + i.so_luong_nhan, 0);
  const mau        = pct === 100 ? "#10b981" : pct > 0 ? "#f59e0b" : "#475569";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
          <div className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: mau }} />
        </div>
        <span className="text-[10px] font-black flex-shrink-0" style={{ color: mau }}>
          {pct}%
        </span>
      </div>
      <p className="text-[9px]" style={{ color: "#334155" }}>
        {tong_nhan}/{tong_dat} sản phẩm
      </p>
    </div>
  );
}

// ─── Drawer chi tiết PO ───────────────────────────────────────────────────────

function PODrawer({ po, onClose, onRefresh }: {
  po:        PurchaseOrder;
  onClose:   () => void;
  onRefresh: () => void;
}) {
  const [confirm_dong, setConfirmDong] = useState(false);
  const [ly_do_dong,   setLyDoDong]   = useState("");
  const [loading,      setLoading]    = useState(false);
  const [sim_sku,      setSimSku]     = useState<string | null>(null); // simulate nhận hàng
  const [sim_sl,       setSimSl]      = useState(0);

  const tong_dat  = po.items.reduce((s, i) => s + i.so_luong_dat,  0);
  const tong_nhan = po.items.reduce((s, i) => s + i.so_luong_nhan, 0);
  const tong_tien = po.items.reduce((s, i) => s + i.thanh_tien,    0);
  const tre       = la_tre_han(po);
  // const cfg       = tre ? TRANG_THAI_PO_CONFIG["tre_han"] : TRANG_THAI_PO_CONFIG[po.trang_thai];

  const handle_dong_po = async () => {
    if (!ly_do_dong.trim()) return;
    setLoading(true);
    await huyPO(po.po_id); // tạm dùng huyPO, sau này có endpoint force-close riêng
    setLoading(false);
    setConfirmDong(false);
    onRefresh();
    onClose();
  };

  const handle_simulate_nhan = async (sku_id: string, so_luong: number) => {
    await capNhatSoLuongNhan(po.po_id, sku_id, so_luong);
    onRefresh();
    setSimSku(null);
  };

  return createPortal(
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-[560px] shadow-2xl"
        style={{ background: "#0a1628", borderLeft: "1px solid #1e293b" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          <div>
            <div className="flex items-center gap-2">
              <code className="text-base font-black" style={{ color: "#38bdf8" }}>
                {po.ma_po}
              </code>
              <TrangThaiBadge po={po} />
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
              {po.vendor_name} · {new Date(po.ngay_dat).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
          style={{ scrollbarWidth: "thin" }}>

          {/* Cảnh báo trễ hẹn */}
          {tre && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
              <AlertTriangle size={15} style={{ color: "#ef4444", flexShrink: 0 }} />
              <div>
                <p className="text-xs font-black" style={{ color: "#ef4444" }}>
                  Trễ hẹn {so_ngay_tre(po)} ngày
                </p>
                <p className="text-[10px]" style={{ color: "#ef444480" }}>
                  Dự kiến giao: {new Date(po.ngay_du_kien_giao).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          )}

          {/* Thông tin header */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {[
              { label: "Nhà cung cấp",      val: po.vendor_name },
              { label: "Điều khoản TT",     val: po.dieu_khoan_tt },
              { label: "Ngày đặt",           val: new Date(po.ngay_dat).toLocaleDateString("vi-VN") },
              { label: "Dự kiến giao",       val: new Date(po.ngay_du_kien_giao).toLocaleDateString("vi-VN"), mau: tre ? "#ef4444" : undefined },
              { label: "Tổng tiền",          val: dinh_dang_tien(tong_tien), mau: "#10b981" },
              { label: "Tiến độ",            val: `${po.pct_nhan}% (${tong_nhan}/${tong_dat})`, mau: po.pct_nhan === 100 ? "#10b981" : "#f59e0b" },
            ].map(({ label, val, mau }) => (
              <div key={label} className="px-3 py-2.5 rounded-xl"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                <p className="text-[9px] font-black uppercase mb-0.5" style={{ color: "#334155" }}>
                  {label}
                </p>
                <p className="text-xs font-bold" style={{ color: mau ?? "white" }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Ghi chú */}
          {po.ghi_chu && (
            <div className="px-3 py-2.5 rounded-xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <p className="text-[9px] font-black uppercase mb-1" style={{ color: "#334155" }}>
                Ghi chú
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>{po.ghi_chu}</p>
            </div>
          )}

          {/* Bảng chi tiết hàng */}
          <div>
            <p className="text-[10px] font-black uppercase mb-2" style={{ color: "#475569" }}>
              Chi tiết hàng hóa
            </p>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
              {/* Header */}
              <div className="grid px-4 py-2 text-[9px] font-black uppercase"
                style={{ gridTemplateColumns: "1fr 60px 60px 60px 90px",
                  background: "#020817", color: "#334155",
                  borderBottom: "1px solid #1e293b" }}>
                <span>SKU</span>
                <span className="text-center">Đặt</span>
                <span className="text-center">Nhận</span>
                <span className="text-center">Thiếu</span>
                <span className="text-right">Thành tiền</span>
              </div>

              {po.items.map((item, i) => {
                const con_thieu = item.so_luong_dat - item.so_luong_nhan;
                return (
                  <div key={item.sku_id}>
                    <div className="grid items-center px-4 py-3 gap-2"
                      style={{ gridTemplateColumns: "1fr 60px 60px 60px 90px",
                        borderBottom: "1px solid #0f172a" }}>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.ten_sp}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="w-2 h-2 rounded-full border border-white/10"
                            style={{ background: item.color_hex }} />
                          <code className="text-[9px]" style={{ color: "#475569" }}>
                            {item.color_name} / {item.size_code}
                          </code>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-center" style={{ color: "#94a3b8" }}>
                        {item.so_luong_dat}
                      </p>
                      <p className="text-xs font-bold text-center"
                        style={{ color: item.so_luong_nhan > 0 ? "#10b981" : "#334155" }}>
                        {item.so_luong_nhan}
                      </p>
                      <p className="text-xs font-bold text-center"
                        style={{ color: con_thieu > 0 ? "#ef4444" : "#10b981" }}>
                        {con_thieu > 0 ? con_thieu : "✓"}
                      </p>
                      <p className="text-xs text-right" style={{ color: "#64748b" }}>
                        {dinh_dang_tien(item.thanh_tien)}
                      </p>
                    </div>

                    {/* Simulate nhận hàng — chỉ hiện khi dev/mock */}
                    <div className="px-4 pb-2 flex items-center gap-2"
                      style={{ borderBottom: i < po.items.length - 1 ? "1px solid #1e293b" : "none" }}>
                      {sim_sku === item.sku_id ? (
                        <>
                          <input type="number" min={0} max={item.so_luong_dat}
                            value={sim_sl}
                            onChange={e => setSimSl(Number(e.target.value))}
                            className="w-20 px-2 py-1 rounded-lg text-xs outline-none text-center"
                            style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                          <button onClick={() => handle_simulate_nhan(item.sku_id, sim_sl)}
                            className="px-2 py-1 rounded-lg text-[9px] font-bold"
                            style={{ background: "#06472520", color: "#10b981" }}>
                            Xác nhận
                          </button>
                          <button onClick={() => setSimSku(null)}
                            className="text-[9px]" style={{ color: "#475569" }}>
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => { setSimSku(item.sku_id); setSimSl(item.so_luong_nhan); }}
                          className="text-[9px] flex items-center gap-1"
                          style={{ color: "#334155" }}>
                          <RefreshCw size={9} /> Cập nhật SL nhận (mock)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Tổng */}
              <div className="flex items-center justify-between px-4 py-3"
                style={{ background: "#0f172a", borderTop: "1px solid #1e293b" }}>
                <p className="text-xs text-white font-black">Tổng cộng</p>
                <p className="text-sm font-black" style={{ color: "#10b981" }}>
                  {dinh_dang_tien(tong_tien)}
                </p>
              </div>
            </div>
          </div>

          {/* Confirm đóng PO */}
          {confirm_dong && (
            <div className="rounded-xl p-4 space-y-3"
              style={{ background: "#7f1d1d15", border: "1px solid #ef444430" }}>
              <p className="text-xs font-black" style={{ color: "#ef4444" }}>
                Đóng PO thủ công — Lý do (bắt buộc)
              </p>
              <textarea value={ly_do_dong}
                onChange={e => setLyDoDong(e.target.value)}
                placeholder="VD: Xưởng hết vải, chốt 990/1000 cái..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
              <div className="flex gap-2">
                <button onClick={() => setConfirmDong(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  Huỷ
                </button>
                <button onClick={handle_dong_po}
                  disabled={!ly_do_dong.trim() || loading}
                  className="flex-1 py-2 rounded-xl text-xs font-black disabled:opacity-40"
                  style={{ background: "#7f1d1d", color: "#fca5a5" }}>
                  {loading ? "Đang xử lý..." : "Xác nhận đóng PO"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {po.trang_thai !== "huy" && po.trang_thai !== "da_nhap" && (
          <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: "#1e293b" }}>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              <Printer size={12} /> Tải PDF
            </button>
            <div className="flex-1" />
            <button onClick={() => setConfirmDong(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
              <Lock size={12} /> Đóng PO thủ công
            </button>
          </div>
        )}
      </div>
    </>,
    document.body
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

type LocThoiGian = "" | "tuan_nay" | "thang_nay";

export default function TabPOTracking() {
  const [po_list,      setPoList]     = useState<PurchaseOrder[]>([]);
  const [loading,      setLoading]    = useState(true);
  const [search,       setSearch]     = useState("");
  const [loc_tt,       setLocTT]      = useState<TrangThaiPO | "">("");
  const [loc_tg,       setLocTG]      = useState<LocThoiGian>("");
  const [selected_po,  setSelectedPo] = useState<PurchaseOrder | null>(null);

  const load = async () => {
    setLoading(true);
    const data = await layDanhSachPO();
    setPoList(data);
    setLoading(false);
  };

  useEffect(() => { 
    const fetchLoad = () => {
      load();
    }
    fetchLoad()
   }, []);

  // Filter
  const filtered = po_list.filter(po => {
    const q = search.toLowerCase();
    if (q && !po.ma_po.toLowerCase().includes(q) && !po.vendor_name.toLowerCase().includes(q))
      return false;
    if (loc_tt) {
      const tre    = la_tre_han(po);
      const tt_hien = tre ? "tre_han" : po.trang_thai;
      if (tt_hien !== loc_tt) return false;
    }
    if (loc_tg === "tuan_nay"  && !trong_tuan_nay(po.ngay_du_kien_giao))  return false;
    if (loc_tg === "thang_nay" && !trong_thang_nay(po.ngay_du_kien_giao)) return false;
    return true;
  });

  const tong_tien = filtered.reduce((s, po) => s + po.tong_tien, 0);

  return (
    <div className="flex flex-col h-full">

      {/* ── Filter bar ── */}
      <div className="px-6 py-4 border-b flex-shrink-0 space-y-3"
        style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center gap-2 flex-wrap">

          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }} />
            <input value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã PO hoặc tên xưởng..."
              className="pl-8 pr-4 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#0f172a", border: "1px solid #1e293b",
                color: "white", width: 220 }} />
            {search && (
              <button onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}>
                <X size={11} />
              </button>
            )}
          </div>

          {/* Lọc trạng thái */}
          <select value={loc_tt}
            onChange={e => setLocTT(e.target.value as TrangThaiPO | "")}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(TRANG_THAI_PO_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.nhan}</option>
            ))}
          </select>

          {/* Lọc thời gian */}
          <select value={loc_tg}
            onChange={e => setLocTG(e.target.value as LocThoiGian)}
            className="px-3 py-2 rounded-xl text-xs outline-none"
            style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
            <option value="">Tất cả thời gian</option>
            <option value="tuan_nay">Dự kiến giao tuần này</option>
            <option value="thang_nay">Dự kiến giao tháng này</option>
          </select>

          {/* Refresh */}
          <button onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b" }}>
            <RefreshCw size={11} /> Làm mới
          </button>
        </div>

        {/* Tóm tắt */}
        <div className="flex items-center gap-4">
          <p className="text-[11px]" style={{ color: "#475569" }}>
            {filtered.length} phiếu PO
          </p>
          <p className="text-[11px]" style={{ color: "#475569" }}>
            Tổng giá trị:{" "}
            <span className="font-black" style={{ color: "#10b981" }}>
              {dinh_dang_tien(tong_tien)}
            </span>
          </p>
          {filtered.filter(po => la_tre_han(po)).length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: "#7f1d1d20", color: "#ef4444" }}>
              <AlertTriangle size={9} />
              {filtered.filter(po => la_tre_han(po)).length} trễ hẹn
            </span>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>

        {/* Header */}
        <div className="grid items-center px-6 py-2.5 text-[9px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "120px 1fr 100px 120px 120px 180px 110px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <span>Mã PO</span>
          <span>Nhà cung cấp</span>
          <span>Ngày tạo</span>
          <span>Dự kiến giao</span>
          <span className="text-right">Tổng tiền</span>
          <span>Tiến độ nhập kho</span>
          <span>Trạng thái</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm" style={{ color: "#475569" }}>Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={32} className="mb-3" style={{ color: "#334155" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>
              Không có phiếu PO nào
            </p>
          </div>
        ) : filtered.map(po => {
          const tre = la_tre_han(po);
          return (
            <div key={po.po_id}
              className="grid items-center px-6 py-4 gap-2 cursor-pointer hover:bg-slate-900/40 transition-all"
              style={{
                gridTemplateColumns: "120px 1fr 100px 120px 120px 180px 110px",
                borderBottom: "1px solid #0f172a",
                borderLeft:   tre ? "3px solid #ef4444" : "3px solid transparent",
              }}
              onClick={() => setSelectedPo(po)}>

              {/* Mã PO */}
              <div className="flex items-center gap-1.5">
                <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                  {po.ma_po}
                </code>
                <ExternalLink size={10} style={{ color: "#334155" }} />
              </div>

              {/* Nhà cung cấp */}
              <p className="text-sm font-bold text-white truncate">{po.vendor_name}</p>

              {/* Ngày tạo */}
              <p className="text-xs" style={{ color: "#475569" }}>
                {new Date(po.ngay_dat).toLocaleDateString("vi-VN")}
              </p>

              {/* Dự kiến giao */}
              <div className="flex items-center gap-1.5">
                {tre && <AlertTriangle size={11} style={{ color: "#ef4444", flexShrink: 0 }} />}
                <p className="text-xs font-bold"
                  style={{ color: tre ? "#ef4444" : "#94a3b8" }}>
                  {new Date(po.ngay_du_kien_giao).toLocaleDateString("vi-VN")}
                </p>
              </div>

              {/* Tổng tiền */}
              <p className="text-sm font-black text-right" style={{ color: "#10b981" }}>
                {dinh_dang_tien(po.tong_tien)}
              </p>

              {/* Progress bar */}
              <div onClick={e => e.stopPropagation()}>
                <ProgressBar po={po} />
              </div>

              {/* Trạng thái */}
              <TrangThaiBadge po={po} />
            </div>
          );
        })}
      </div>

      {/* Drawer chi tiết */}
      {selected_po && (
        <PODrawer
          po={selected_po}
          onClose={() => setSelectedPo(null)}
          onRefresh={async () => {
            await load();
            // Cập nhật selected_po với data mới
            const updated = po_list.find(p => p.po_id === selected_po.po_id);
            if (updated) setSelectedPo(updated);
          }}
        />
      )}
    </div>
  );
}