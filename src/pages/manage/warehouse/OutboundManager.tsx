// ─────────────────────────────────────────────────────────────────────────────
// OutboundManager.tsx — Module 4: Quản lý Xuất Kho
// Tab 1: Chọn đơn → Tab 2: Phiếu nhặt → Tab 3: Packing → Tab 4: Shipping
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import {
  Plus, Search, X, Check, AlertTriangle, Package,
  CheckCircle, Truck, MapPin, ScanLine,
  ClipboardList, Box, Printer,
} from "lucide-react";
import type { PhieuNhatHang, PackingItem } from "../../../components/Kho/data/outboundTypes";
import type { DonHang } from "../../../components/BanHang/data/orderData";
import type { SkuLocationRule, LocationNode } from "../../../components/Kho/data/warehouseTypes";
import {
  gop_don_thanh_phieu_nhat, tao_packing_items, tinh_stats,
  gen_id, gen_ma_phieu_nhat,
  TRANG_THAI_CONFIG,
} from "../../../components/Kho/data/outboundHelpers";
import {
  layDanhSachPhieuNhat, layDonHangChoXuLy,
  taoPhieuNhat, capNhatPhieuNhat,
} from "../../../components/Kho/ServiceLayer/OutboundService";
import {
  layDanhSachSkuRules, layDanhSachNodes,
} from "../../../components/Kho/ServiceLayer/WarehouseService";
 
// ─── Helpers UI ──────────────────────────────────────────────────────────────
 
function Badge({ tt }: { tt: string }) {
  const cfg = TRANG_THAI_CONFIG[tt] ?? { nhan: tt, mau: "#475569", nen: "#1e293b" };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: cfg.nen, color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      {cfg.nhan}
    </span>
  );
}
 
function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  const mau = type === "ok" ? "#10b981" : "#ef4444";
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}>
      {type === "ok" ? <CheckCircle size={14} style={{ color: mau }} /> : <AlertTriangle size={14} style={{ color: mau }} />}
      <p className="text-sm font-bold" style={{ color: mau }}>{msg}</p>
      <button onClick={onClose} style={{ color: "#475569" }}><X size={13} /></button>
    </div>
  );
}
 
// ─── Tab 1: Chọn đơn để gộp ──────────────────────────────────────────────────
 
function TabChonDon({ on_tao_phieu }: { on_tao_phieu: (phieu: PhieuNhatHang) => void }) {
  const [selected, setSelected]        = useState<Set<string>>(new Set());
  const [search, setSearch]            = useState("");
  const [filter_dvvc]                  = useState("all");
  const [don_cho_xu_ly, setDonChoXuLy] = useState<DonHang[]>([]);
  const [sku_rules, setSkuRules]       = useState<SkuLocationRule[]>([]);
  const [nodes, setNodes]              = useState<LocationNode[]>([]);

  useEffect(() => {
    layDonHangChoXuLy().then(setDonChoXuLy);
    layDanhSachSkuRules().then(setSkuRules);
    layDanhSachNodes().then(setNodes);
  }, []);
 
  const filtered = useMemo(() => {
    let list = don_cho_xu_ly;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.ma_don.toLowerCase().includes(q) ||
        d.khach_hang.ten.toLowerCase().includes(q) ||
        d.san_pham.some(sp => sp.ma_sku.toLowerCase().includes(q))
      );
    }
    if (filter_dvvc !== "all") list = list.filter(d => d.don_vi_vc === filter_dvvc);
    return list;
  }, [don_cho_xu_ly, search, filter_dvvc]);
 
  const toggle = (id: string) =>
    setSelected(prev => { 
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
 
  const select_all = () => setSelected(new Set(filtered.map(d => d.id)));
  const clear_all  = () => setSelected(new Set());
 
  // Preview gộp
  const preview_gop = useMemo(() => {
    const selected_dons = don_cho_xu_ly.filter(d => selected.has(d.id));
    return gop_don_thanh_phieu_nhat(selected_dons, sku_rules, nodes);
  }, [selected, don_cho_xu_ly, sku_rules, nodes]);

  const handle_tao = () => {
    const selected_dons = don_cho_xu_ly.filter(d => selected.has(d.id));
    const danh_sach = gop_don_thanh_phieu_nhat(selected_dons, sku_rules, nodes);
    const packing   = tao_packing_items(selected_dons);
    const phieu: PhieuNhatHang = {
      id:              gen_id(),
      ma_phieu:        gen_ma_phieu_nhat(),
      trang_thai:      "cho_nhat",
      don_ids:         Array.from(selected),
      nhan_vien:       "Nhân viên kho",
      ngay_tao:        new Date().toISOString(),
      ngay_hoan_thanh: "",
      ghi_chu:         "",
      danh_sach_nhat:  danh_sach.map(d => ({ ...d, phieu_id: "" })),
      packing_items:   packing,
    };
    on_tao_phieu(phieu);
  };
 
  // Thống kê SKU gộp
  const sku_count = new Map<string, number>();
  preview_gop.forEach(d => sku_count.set(d.ma_sku, (sku_count.get(d.ma_sku) ?? 0) + d.so_luong_can));
 
  return (
    <div className="flex h-full overflow-hidden">
 
      {/* ── LEFT: Danh sách đơn chờ xử lý ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden border-r"
        style={{ borderColor: "#1e293b" }}>
 
        {/* Header — cố định */}
        <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-black text-white">Chọn đơn để gộp</h3>
              <p className="text-[10px]" style={{ color: "#475569" }}>
                {don_cho_xu_ly.length} đơn chờ xử lý · đã chọn {selected.size}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={select_all}
                className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Chọn tất cả
              </button>
              <button onClick={clear_all}
                className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Bỏ chọn
              </button>
            </div>
          </div>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm mã đơn, khách hàng, SKU..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>
        </div>
 
        {/* Table header — cố định */}
        <div className="grid px-5 py-2 text-[9px] font-black uppercase flex-shrink-0"
          style={{ gridTemplateColumns: "24px 1fr 80px 80px 60px", background: "#0a1628",
            color: "#334155", borderBottom: "1px solid #1e293b" }}>
          <span/>
          <span>Đơn hàng</span>
          <span className="text-center">ĐVVC</span>
          <span className="text-center">Sản phẩm</span>
          <span className="text-center">SL</span>
        </div>
 
        {/* Danh sách — scroll */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Package size={28} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
              <p className="text-sm" style={{ color: "#475569" }}>Không có đơn nào chờ xử lý</p>
            </div>
          ) : filtered.map(don => {
            const is_sel = selected.has(don.id);
            const tong_sl = don.san_pham.reduce((s, sp) => s + sp.so_luong, 0);
            return (
              <div key={don.id}
                className="grid items-center px-5 py-3 cursor-pointer transition-colors hover:bg-slate-800/20"
                style={{
                  gridTemplateColumns: "24px 1fr 80px 80px 60px",
                  borderBottom: "1px solid #0f172a",
                  background: is_sel ? "#0c435412" : "transparent",
                }}
                onClick={() => toggle(don.id)}>
                <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
                  style={{
                    background: is_sel ? "#38bdf8" : "transparent",
                    border: `1.5px solid ${is_sel ? "#38bdf8" : "#334155"}`,
                  }}>
                  {is_sel && <Check size={10} style={{ color: "#0f172a" }} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold" style={{ color: is_sel ? "#38bdf8" : "#94a3b8" }}>
                    {don.ma_don}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "#475569" }}>{don.khach_hang.ten}</p>
                </div>
                <div className="text-center text-[9px]" style={{ color: "#475569" }}>
                  {don.don_vi_vc ?? "GHN"}
                </div>
                <div className="text-center text-[10px]" style={{ color: "#64748b" }}>
                  {don.san_pham.length} SKU
                </div>
                <div className="text-center text-sm font-black" style={{ color: "#94a3b8" }}>
                  {tong_sl}
                </div>
              </div>
            );
          })}
        </div>
      </div>
 
      {/* ── RIGHT: Preview + Action — layout cố định ── */}
      <div className="flex flex-col flex-shrink-0" style={{ width: 320 }}>
 
        {/* Header preview — cố định */}
        <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <h3 className="text-sm font-black text-white mb-1">Preview phiếu nhặt</h3>
          <p className="text-[10px]" style={{ color: "#475569" }}>
            Hệ thống gộp theo SKU + vị trí kệ · sắp xếp theo đường đi
          </p>
        </div>
 
        {/* Stats gộp — cố định khi có chọn */}
        {selected.size > 0 && (
          <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b flex-shrink-0"
            style={{ borderColor: "#1e293b" }}>
            {[
              { label: "Đơn gộp",   val: selected.size,                                           mau: "#38bdf8" },
              { label: "Dòng nhặt", val: preview_gop.length,                                      mau: "#a78bfa" },
              { label: "Tổng cái",  val: preview_gop.reduce((s, d) => s + d.so_luong_can, 0),    mau: "#10b981" },
            ].map(({ label, val, mau }) => (
              <div key={label} className="px-2 py-2 rounded-xl text-center"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                <p className="text-base font-black" style={{ color: mau }}>{val}</p>
                <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
              </div>
            ))}
          </div>
        )}
 
        {/* Danh sách dòng nhặt — scroll */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
          {selected.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <ClipboardList size={28} className="mb-2 opacity-20" style={{ color: "#64748b" }} />
              <p className="text-xs text-center" style={{ color: "#475569" }}>
                Chọn đơn bên trái<br/>để xem preview
              </p>
            </div>
          ) : preview_gop.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: "#475569" }}>Không có hàng để nhặt</p>
          ) : preview_gop.map((dong) => (
            <div key={dong.ma_sku + dong.node_id}
              className="px-3 py-2.5 rounded-xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-white truncate">{dong.ten_sp}</p>
                  <code className="text-[9px]" style={{ color: "#475569" }}>{dong.ma_sku}</code>
                </div>
                <span className="text-base font-black ml-2 flex-shrink-0" style={{ color: "#38bdf8" }}>
                  ×{dong.so_luong_can}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <MapPin size={10} style={{ color: "#a78bfa", flexShrink: 0 }} />
                <code className="text-[10px] font-black" style={{ color: "#a78bfa" }}>
                  {dong.location_code || "Chưa có vị trí"}
                </code>
                <span className="text-[9px] ml-1" style={{ color: "#334155" }}>
                  · {dong.don_ids.length} đơn
                </span>
              </div>
            </div>
          ))}
        </div>
 
        {/* Action button — pin cố định dưới cùng */}
        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
          {selected.size > 0 && (
            <p className="text-[9px] text-center mb-2" style={{ color: "#475569" }}>
              Nhân viên đi <span style={{ color: "#38bdf8", fontWeight: 700 }}>{preview_gop.length} điểm</span> thay vì {selected.size} lần
            </p>
          )}
          <button
            onClick={handle_tao}
            disabled={selected.size === 0}
            className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            <Plus size={15} />
            Tạo phiếu nhặt {selected.size > 0 ? `(${selected.size} đơn)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
 
// ─── Tab 2: Phiếu nhặt hàng ──────────────────────────────────────────────────
 
function TabPhieuNhat({ phieu, on_update }: {
  phieu:     PhieuNhatHang;
  on_update: (p: PhieuNhatHang) => void;
}) {
  const [scan_input, setScanInput] = useState("");
 
  const handle_nhat = (dong_id: string) => {
    const updated = {
      ...phieu,
      danh_sach_nhat: phieu.danh_sach_nhat.map(d =>
        d.id === dong_id ? { ...d, da_nhat: true } : d
      ),
    };
    // Nếu nhặt hết → chuyển sang nhat_xong
    if (updated.danh_sach_nhat.every(d => d.da_nhat)) {
      updated.trang_thai = "nhat_xong";
    } else {
      updated.trang_thai = "dang_nhat";
    }
    on_update(updated);
  };
 
  const handle_scan = () => {
    const q = scan_input.trim().toUpperCase();
    const found = phieu.danh_sach_nhat.find(
      d => d.ma_sku.toUpperCase().includes(q) || d.location_code.includes(q)
    );
    if (found && !found.da_nhat) {
      handle_nhat(found.id);
    }
    setScanInput("");
  };
 
  const stats   = tinh_stats(phieu);
  const da_nhat = phieu.danh_sach_nhat.filter(d => d.da_nhat);
  const chua    = phieu.danh_sach_nhat.filter(d => !d.da_nhat);
 
  return (
    <div className="flex flex-col h-full overflow-hidden">
 
      {/* ── Header + Progress + Scan — cố định ── */}
      <div className="px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white">Phiếu nhặt hàng</h3>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Đi theo thứ tự vị trí kho — nhặt từ trên xuống
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black leading-none" style={{ color: "#38bdf8" }}>
              {stats.da_nhat}<span className="text-base" style={{ color: "#334155" }}>/{stats.tong_sku}</span>
            </p>
            <p className="text-[9px]" style={{ color: "#475569" }}>dòng đã nhặt</p>
          </div>
        </div>
 
        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "#1e293b" }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${stats.pct_nhat}%`,
              background: stats.pct_nhat === 100 ? "#10b981" : "linear-gradient(90deg, #38bdf8, #818cf8)",
            }} />
        </div>
 
        {/* Scan bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#38bdf8" }} />
            <input value={scan_input}
              onChange={e => setScanInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle_scan()}
              placeholder="Scan SKU hoặc location code để đánh dấu nhặt..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }} />
          </div>
          <button onClick={handle_scan}
            className="px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0"
            style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            Xác nhận
          </button>
        </div>
      </div>
 
      {/* ── Danh sách nhặt — scroll ── */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2" style={{ scrollbarWidth: "thin" }}>
 
        {/* Chưa nhặt */}
        {chua.length > 0 && (
          <>
            <p className="text-[9px] font-black uppercase mb-2 sticky top-0 py-1"
              style={{ color: "#475569", background: "#020817" }}>
              Chưa nhặt — {chua.length} dòng còn lại
            </p>
            {chua.map((dong, i) => (
              <div key={dong.id}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-black"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  {i + 1}
                </div>
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <MapPin size={11} style={{ color: "#a78bfa" }} />
                    <code className="text-sm font-black" style={{ color: "#a78bfa" }}>
                      {dong.location_code || "—"}
                    </code>
                  </div>
                  <p className="text-[9px]" style={{ color: "#475569" }}>
                    {dong.don_ids.length} đơn
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{dong.ten_sp}</p>
                  <code className="text-[9px]" style={{ color: "#475569" }}>{dong.ma_sku}</code>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-xl font-black" style={{ color: "#f59e0b" }}>×{dong.so_luong_can}</p>
                  <p className="text-[9px]" style={{ color: "#475569" }}>cần lấy</p>
                </div>
                <button onClick={() => handle_nhat(dong.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors hover:opacity-80"
                  style={{ background: "#06472520", border: "1px solid #10b98140", color: "#10b981" }}>
                  <Check size={18} />
                </button>
              </div>
            ))}
          </>
        )}
 
        {/* Đã nhặt */}
        {da_nhat.length > 0 && (
          <>
            <p className="text-[9px] font-black uppercase mt-4 mb-2 sticky top-0 py-1"
              style={{ color: "#334155", background: "#020817" }}>
              Đã nhặt — {da_nhat.length} dòng
            </p>
            {da_nhat.map(dong => (
              <div key={dong.id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                style={{ background: "#06472508", border: "1px solid #10b98120", opacity: 0.6 }}>
                <CheckCircle size={16} style={{ color: "#10b981", flexShrink: 0 }} />
                <code className="text-xs font-black" style={{ color: "#10b981" }}>
                  {dong.location_code}
                </code>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{dong.ten_sp}</p>
                </div>
                <span className="text-sm font-black" style={{ color: "#10b981" }}>×{dong.so_luong_lay}</span>
              </div>
            ))}
          </>
        )}
 
        {/* Empty state */}
        {chua.length === 0 && da_nhat.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <Package size={32} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm" style={{ color: "#475569" }}>Không có dòng nhặt nào</p>
          </div>
        )}
      </div>
 
      {/* ── Footer — chỉ hiện khi nhặt xong hết ── */}
      {stats.pct_nhat === 100 && (
        <div className="px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} style={{ color: "#10b981" }} />
              <p className="text-sm font-black text-white">Đã nhặt đủ tất cả hàng</p>
            </div>
            <p className="text-xs" style={{ color: "#475569" }}>
              Chuyển sang tab <span style={{ color: "#38bdf8" }}>Đóng gói</span> →
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
 
// ─── Tab 3: Packing ───────────────────────────────────────────────────────────
 
function TabPacking({ phieu, on_update }: {
  phieu:     PhieuNhatHang;
  on_update: (p: PhieuNhatHang) => void;
}) {
  const [scan_don, setScanDon] = useState("");
  const [selected_don, setSelectedDon] = useState<string | null>(null);
 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update_item = (don_id: string, field: keyof PackingItem, val: any) => {
    on_update({
      ...phieu,
      trang_thai: "dang_packing",
      packing_items: phieu.packing_items.map(p =>
        p.don_id === don_id ? { ...p, [field]: val } : p
      ),
    });
  };
 
  const dong_goi_tat_ca = () => {
    const all_done = phieu.packing_items.every(p => p.da_dong_goi);
    on_update({
      ...phieu,
      trang_thai: all_done ? "cho_shipping" : "dang_packing",
      packing_items: phieu.packing_items.map(p => ({
        ...p,
        da_kiem_tra: true,
        da_dong_goi: true,
      })),
    });
  };
 
  return (
    <div className="flex h-full overflow-hidden">
 
      {/* ── LEFT: Danh sách đơn — cố định header + footer, scroll list ── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 280, borderColor: "#1e293b" }}>
 
        {/* Header — cố định */}
        <div className="px-4 py-3 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <h3 className="text-sm font-black text-white mb-1">Đóng gói theo đơn</h3>
          <p className="text-[10px] mb-2" style={{ color: "#475569" }}>
            {phieu.packing_items.filter(p => p.da_dong_goi).length}/{phieu.packing_items.length} đơn đã đóng gói
          </p>
          <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "#1e293b" }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(phieu.packing_items.filter(p => p.da_dong_goi).length / phieu.packing_items.length * 100)}%`,
                background: "#10b981",
              }} />
          </div>
          {/* Scan đơn */}
          <div className="relative">
            <ScanLine size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "#38bdf8" }} />
            <input value={scan_don}
              onChange={e => setScanDon(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const found = phieu.packing_items.find(p =>
                    p.ma_don.toLowerCase().includes(scan_don.toLowerCase())
                  );
                  if (found) setSelectedDon(found.don_id);
                  setScanDon("");
                }
              }}
              placeholder="Scan mã đơn..."
              className="w-full pl-8 pr-2 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }} />
          </div>
        </div>
 
        {/* Danh sách đơn — scroll */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {phieu.packing_items.map(item => (
            <button key={item.don_id}
              onClick={() => setSelectedDon(item.don_id)}
              className="w-full text-left px-4 py-3 transition-all hover:bg-slate-800/30"
              style={{
                background: selected_don === item.don_id ? "#0f172a" : "transparent",
                borderLeft: selected_don === item.don_id ? "2px solid #38bdf8" : "2px solid transparent",
                borderBottom: "1px solid #0f172a",
              }}>
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black"
                  style={{ color: selected_don === item.don_id ? "#38bdf8" : "#94a3b8" }}>
                  {item.ma_don}
                </code>
                {item.da_dong_goi
                  ? <CheckCircle size={13} style={{ color: "#10b981" }} />
                  : item.da_kiem_tra
                    ? <Box size={13} style={{ color: "#f59e0b" }} />
                    : <Package size={13} style={{ color: "#475569" }} />
                }
              </div>
              <p className="text-[10px] truncate" style={{ color: "#475569" }}>{item.ten_khach}</p>
              <p className="text-[9px]" style={{ color: "#334155" }}>
                {item.san_pham.length} SKU · {item.dvvc}
              </p>
            </button>
          ))}
        </div>
 
        {/* Action — pin dưới */}
        <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
          <button onClick={dong_goi_tat_ca}
            className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
            <Check size={13} />
            Đóng gói tất cả ({phieu.packing_items.filter(p => !p.da_dong_goi).length} còn lại)
          </button>
        </div>
      </div>
 
      {/* ── RIGHT: Chi tiết đơn — scroll nội dung, action pin dưới ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected_don ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Box size={32} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Chọn đơn để bắt đầu đóng gói</p>
            <p className="text-xs mt-1" style={{ color: "#334155" }}>hoặc scan mã đơn bên trái</p>
          </div>
        ) : (() => {
          const item = phieu.packing_items.find(p => p.don_id === selected_don)!;
          if (!item) return null;
          return (
            <>
              {/* Header đơn — cố định */}
              <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-base font-black" style={{ color: "#38bdf8" }}>{item.ma_don}</code>
                      {item.da_dong_goi && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold"
                          style={{ background: "#06472520", color: "#10b981" }}>
                          Đã đóng gói ✓
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white">{item.ten_khach}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{item.dia_chi}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Truck size={13} style={{ color: "#64748b" }} />
                    <span className="text-xs font-bold" style={{ color: "#64748b" }}>{item.dvvc}</span>
                  </div>
                </div>
              </div>
 
              {/* Danh sách sản phẩm — scroll */}
              <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin" }}>
                <p className="text-[10px] font-black uppercase mb-3" style={{ color: "#475569" }}>
                  Kiểm tra sản phẩm trong đơn
                </p>
                <div className="space-y-2">
                  {item.san_pham.map(sp => (
                    <div key={sp.ma_sku}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                      <CheckCircle size={14}
                        style={{ color: item.da_kiem_tra ? "#10b981" : "#334155", flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white">{sp.ten_sp}</p>
                        <code className="text-[9px]" style={{ color: "#475569" }}>{sp.ma_sku}</code>
                      </div>
                      <span className="text-sm font-black flex-shrink-0" style={{ color: "#94a3b8" }}>
                        ×{sp.so_luong}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Actions — pin dưới */}
              <div className="px-6 py-4 border-t flex-shrink-0 space-y-2"
                style={{ borderColor: "#1e293b", background: "#0a1628" }}>
                {!item.da_kiem_tra && (
                  <button
                    onClick={() => update_item(item.don_id, "da_kiem_tra", true)}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
                    <ScanLine size={15} /> Xác nhận đã kiểm tra hàng
                  </button>
                )}
                {item.da_kiem_tra && !item.da_dong_goi && (
                  <button
                    onClick={() => {
                      update_item(item.don_id, "da_dong_goi", true);
                      const idx = phieu.packing_items.findIndex(p => p.don_id === item.don_id);
                      const next = phieu.packing_items[idx + 1];
                      if (next) setSelectedDon(next.don_id);
                      else setSelectedDon(null);
                    }}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
                    <Box size={15} /> Đóng gói xong → Đơn tiếp theo
                  </button>
                )}
                {item.da_dong_goi && (
                  <div className="flex items-center justify-center gap-2 py-2" style={{ color: "#10b981" }}>
                    <CheckCircle size={16} />
                    <span className="text-sm font-bold">Đã đóng gói xong</span>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
 
// ─── Tab 4: Shipping ──────────────────────────────────────────────────────────
 
function TabShipping({ phieu, on_update }: {
  phieu:     PhieuNhatHang;
  on_update: (p: PhieuNhatHang) => void;
}) {
  const [van_don_input, setVanDonInput] = useState<Record<string, string>>({});
 
  const cap_nhat_van_don = (don_id: string) => {
    const ma = van_don_input[don_id]?.trim();
    if (!ma) return;
    on_update({
      ...phieu,
      packing_items: phieu.packing_items.map(p =>
        p.don_id === don_id ? { ...p, ma_van_don: ma } : p
      ),
    });
    setVanDonInput(prev => ({ ...prev, [don_id]: "" }));
  };
 
  const tat_ca_co_van_don = phieu.packing_items.every(p => p.ma_van_don);
 
  const hoan_thanh = () => {
    on_update({ ...phieu, trang_thai: "hoan_thanh", ngay_hoan_thanh: new Date().toISOString() });
  };
 
  const in_tat_ca = () => {
    window.print();
  };
 
  return (
    <div className="flex flex-col h-full overflow-hidden">
 
      {/* ── Header — cố định ── */}
      <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white">In vận đơn & Bàn giao ĐVVC</h3>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Nhập mã vận đơn → in tem → dán lên kiện → chờ ĐVVC đến lấy
            </p>
          </div>
          <button onClick={in_tat_ca}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            <Printer size={13} /> In tất cả vận đơn
          </button>
        </div>
 
        {/* Progress vận đơn */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(phieu.packing_items.filter(p => p.ma_van_don).length / phieu.packing_items.length * 100)}%`,
                background: "#10b981",
              }} />
          </div>
          <span className="text-xs font-bold flex-shrink-0" style={{ color: "#10b981" }}>
            {phieu.packing_items.filter(p => p.ma_van_don).length}/{phieu.packing_items.length} đã có vận đơn
          </span>
        </div>
      </div>
 
      {/* ── Table header — cố định ── */}
      <div className="grid px-6 py-2 text-[9px] font-black uppercase flex-shrink-0"
        style={{
          gridTemplateColumns: "1fr 110px 1fr 80px",
          background: "#0a1628", color: "#334155",
          borderBottom: "1px solid #1e293b",
        }}>
        <span>Đơn hàng / Khách</span>
        <span>ĐVVC</span>
        <span>Mã vận đơn</span>
        <span className="text-center">Thao tác</span>
      </div>
 
      {/* ── Danh sách — scroll ── */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        {phieu.packing_items.map((item) => (
          <div key={item.don_id}
            className="grid items-center px-6 py-3 gap-3"
            style={{
              gridTemplateColumns: "1fr 110px 1fr 80px",
              borderBottom: "1px solid #0f172a",
              background: item.ma_van_don ? "#06472504" : "transparent",
            }}>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <code className="text-xs font-black" style={{ color: "#94a3b8" }}>{item.ma_don}</code>
                {item.ma_van_don && <CheckCircle size={12} style={{ color: "#10b981" }} />}
              </div>
              <p className="text-[10px] truncate" style={{ color: "#475569" }}>{item.ten_khach}</p>
            </div>
            <div className="text-xs font-bold" style={{ color: "#64748b" }}>{item.dvvc}</div>
            <div>
              {item.ma_van_don ? (
                <code className="text-xs font-black" style={{ color: "#10b981" }}>{item.ma_van_don}</code>
              ) : (
                <input
                  value={van_don_input[item.don_id] ?? ""}
                  onChange={e => setVanDonInput(prev => ({ ...prev, [item.don_id]: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && cap_nhat_van_don(item.don_id)}
                  placeholder="Nhập mã vận đơn..."
                  className="w-full px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
              )}
            </div>
            <div className="flex items-center justify-center gap-1">
              {!item.ma_van_don ? (
                <button onClick={() => cap_nhat_van_don(item.don_id)}
                  disabled={!van_don_input[item.don_id]?.trim()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                  style={{ background: "#06472520", color: "#10b981" }}>
                  <Check size={13} />
                </button>
              ) : (
                <button onClick={in_tat_ca}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  <Printer size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
 
      {/* ── Footer action — pin cố định dưới ── */}
      <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        {!tat_ca_co_van_don && (
          <p className="text-[10px] text-center mb-2" style={{ color: "#475569" }}>
            Còn {phieu.packing_items.filter(p => !p.ma_van_don).length} đơn chưa có mã vận đơn
          </p>
        )}
        <button onClick={hoan_thanh}
          disabled={!tat_ca_co_van_don}
          className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
          style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
          <Truck size={16} /> Xác nhận ĐVVC đã lấy hàng
        </button>
      </div>
    </div>
  );
}
 
// ─── Main Page ────────────────────────────────────────────────────────────────
 
type ActiveTab = "chon_don" | "nhat_hang" | "packing" | "shipping";
 
export default function OutboundManager() {
  const [phieu_list, setPhieuList]   = useState<PhieuNhatHang[]>([]);
  const [selected_id, setSelectedId] = useState<string | null>("pk-001");
  const [active_tab, setActiveTab]   = useState<ActiveTab>("chon_don");
  const [search, setSearch]          = useState("");
  const [toast, setToast]            = useState<{ msg: string; type: "ok" | "err" } | null>(null);
 
  useEffect(() => {
    layDanhSachPhieuNhat().then(setPhieuList);
  }, []);

  const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };
 
  const selected_phieu = phieu_list.find(p => p.id === selected_id) ?? null;
 
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return phieu_list
      .filter(p => !q || p.ma_phieu.toLowerCase().includes(q))
      .sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao));
  }, [phieu_list, search]);
 
  const handle_tao_phieu = (phieu: PhieuNhatHang) => {
    taoPhieuNhat(phieu).then(created => {
      setPhieuList(prev => [created, ...prev]);
      setSelectedId(created.id);
      setActiveTab("nhat_hang");
      show_toast(`Đã tạo ${created.ma_phieu} — gộp ${created.don_ids.length} đơn`);
    });
  };
 
  const handle_update = (phieu: PhieuNhatHang) => {
    capNhatPhieuNhat(phieu).then(updated => {
      setPhieuList(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (updated.trang_thai === "nhat_xong") {
        setActiveTab("packing");
        show_toast("Nhặt xong! Chuyển sang đóng gói.");
      } else if (updated.trang_thai === "cho_shipping") {
        setActiveTab("shipping");
        show_toast("Đóng gói xong! Nhập mã vận đơn.");
      } else if (updated.trang_thai === "hoan_thanh") {
        show_toast("Hoàn thành! ĐVVC đã lấy hàng.");
      }
    });
  };
 
  // Tab có thể dùng theo trạng thái
  const avail_tabs = useMemo((): ActiveTab[] => {
    if (!selected_phieu) return ["chon_don"];
    const tt = selected_phieu.trang_thai;
    if (tt === "cho_nhat")     return ["chon_don", "nhat_hang"];
    if (tt === "dang_nhat")    return ["chon_don", "nhat_hang"];
    if (tt === "nhat_xong")    return ["chon_don", "nhat_hang", "packing"];
    if (tt === "dang_packing") return ["chon_don", "nhat_hang", "packing"];
    return ["chon_don", "nhat_hang", "packing", "shipping"];
  }, [selected_phieu]);
 
  const TABS = [
    { id: "chon_don"  as ActiveTab, label: "Chọn & Gộp đơn",  icon: ClipboardList },
    { id: "nhat_hang" as ActiveTab, label: "Nhặt hàng",        icon: MapPin },
    { id: "packing"   as ActiveTab, label: "Đóng gói",         icon: Box },
    { id: "shipping"  as ActiveTab, label: "Vận đơn & Giao",   icon: Truck },
  ];
 
  const stats_all = useMemo(() => ({
    cho_nhat:     phieu_list.filter(p => p.trang_thai === "cho_nhat").length,
    dang_nhat:    phieu_list.filter(p => p.trang_thai === "dang_nhat").length,
    cho_shipping: phieu_list.filter(p => p.trang_thai === "cho_shipping").length,
    co_van_de:    phieu_list.filter(p => p.trang_thai === "co_van_de").length,
  }), [phieu_list]);
 
  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: "#020817" }}>
 
      {/* ── LEFT: Sidebar phiếu nhặt ──────────────────────── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 280, borderColor: "#1e293b" }}>
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-white">Xuất Kho</h2>
              <p className="text-[10px]" style={{ color: "#475569" }}>Picking · Packing · Shipping</p>
            </div>
          </div>
 
          {/* Stats */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {[
              { label: "Chờ nhặt",    val: stats_all.cho_nhat,     mau: "#64748b" },
              { label: "Đang nhặt",   val: stats_all.dang_nhat,    mau: "#f59e0b" },
              { label: "Chờ giao VC", val: stats_all.cho_shipping, mau: "#f97316" },
              { label: "Có vấn đề",   val: stats_all.co_van_de,    mau: "#ef4444" },
            ].map(({ label, val, mau }) => (
              <div key={label} className="px-2 py-1.5 rounded-lg text-center"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                <p className="text-sm font-black" style={{ color: mau }}>{val}</p>
                <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
              </div>
            ))}
          </div>
 
          <div className="relative">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm phiếu nhặt..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>
        </div>
 
        {/* Nút tạo phiếu mới */}
        <button
          onClick={() => { setSelectedId(null); setActiveTab("chon_don"); }}
          className="mx-4 my-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 flex-shrink-0"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
          <Plus size={13} /> Tạo phiếu nhặt mới
        </button>
 
        {/* Danh sách phiếu */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {filtered.map(phieu => {
            const stats = tinh_stats(phieu);
            const is_sel = selected_id === phieu.id;
            return (
              <button key={phieu.id}
                onClick={() => {
                  setSelectedId(phieu.id);
                  // Tab phù hợp theo trạng thái
                  const tt = phieu.trang_thai;
                  if (tt === "cho_nhat" || tt === "dang_nhat") setActiveTab("nhat_hang");
                  else if (tt === "nhat_xong" || tt === "dang_packing") setActiveTab("packing");
                  else if (tt === "cho_shipping" || tt === "hoan_thanh") setActiveTab("shipping");
                }}
                className="w-full text-left px-4 py-3 transition-all"
                style={{
                  background: is_sel ? "#0f172a" : "transparent",
                  borderLeft: is_sel ? "2px solid #38bdf8" : "2px solid transparent",
                  borderBottom: "1px solid #0f172a",
                }}>
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs font-black" style={{ color: is_sel ? "#38bdf8" : "#94a3b8" }}>
                    {phieu.ma_phieu}
                  </code>
                  <Badge tt={phieu.trang_thai} />
                </div>
                <p className="text-[10px]" style={{ color: "#475569" }}>
                  {phieu.don_ids.length} đơn · {stats.tong_san_pham} sản phẩm
                </p>
                {/* Mini progress */}
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                    <div className="h-full rounded-full" style={{
                      width: `${stats.pct_nhat}%`,
                      background: stats.pct_nhat === 100 ? "#10b981" : "#38bdf8",
                    }} />
                  </div>
                  <span className="text-[9px]" style={{ color: "#475569" }}>{stats.pct_nhat}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
 
      {/* ── RIGHT: Main content ────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
 
        {/* Tab bar — chỉ hiện khi có phiếu được chọn hoặc đang tạo mới */}
        <div className="flex border-b flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const is_avail = active_tab === "chon_don" && !selected_phieu
              ? id === "chon_don"
              : avail_tabs.includes(id);
            const is_active = active_tab === id;
            return (
              <button key={id}
                onClick={() => is_avail && setActiveTab(id)}
                disabled={!is_avail}
                className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all disabled:opacity-30"
                style={{
                  color:        is_active ? "#38bdf8" : "#475569",
                  borderBottom: is_active ? "2px solid #38bdf8" : "2px solid transparent",
                }}>
                <Icon size={13} />{label}
                {id === "nhat_hang" && selected_phieu && tinh_stats(selected_phieu).con_lai > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                    style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                    {tinh_stats(selected_phieu).con_lai}
                  </span>
                )}
              </button>
            );
          })}
        </div>
 
        {/* Tab content */}
        <div className="flex-1 overflow-hidden">
          {active_tab === "chon_don" && (
            <TabChonDon on_tao_phieu={handle_tao_phieu} />
          )}
          {active_tab === "nhat_hang" && selected_phieu && (
            <TabPhieuNhat phieu={selected_phieu} on_update={handle_update} />
          )}
          {active_tab === "packing" && selected_phieu && (
            <TabPacking phieu={selected_phieu} on_update={handle_update} />
          )}
          {active_tab === "shipping" && selected_phieu && (
            <TabShipping phieu={selected_phieu} on_update={handle_update} />
          )}
        </div>
      </div>
 
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}