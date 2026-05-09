// ─────────────────────────────────────────────────────────────────────────────
// InventoryManager.tsx — Module 5: Tồn kho & Kiểm kê
// Tab 1: Tra cứu thông minh | Tab 2: Chuyển kho | Tab 3: Kiểm kê
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search, X, Package, MapPin, ArrowRight, Plus, Check,
  AlertTriangle, CheckCircle, ClipboardList,
  Star, Truck, ScanLine, FileText,
} from "lucide-react";
import type {
  TonKhoRecord, SearchResult, PhieuChuyenKho, PhieuKiemKe, DongKiemKe,
} from "../../../components/Kho/data/inventoryTypes";
import type { LocationNode } from "../../../components/Kho/data/warehouseTypes";
import {
  smart_search, tinh_stats, gen_id,
  gen_ma_phieu_chuyen, gen_ma_phieu_kiem_ke,
  tao_danh_sach_kiem_ke, tinh_chenh_lech,
  TRANG_THAI_CHUYEN_CONFIG, TRANG_THAI_KIEM_KE_CONFIG,
} from "../../../components/Kho/data/inventoryHelpers";
import {
  layTonKho, layDanhSachPhieuChuyen, taoPhieuChuyen, xacNhanChuyenKho,
  layDanhSachPhieuKiemKe, taoPhieuKiemKe, capNhatPhieuKiemKe,
} from "../../../components/Kho/ServiceLayer/InventoryService";
import { layDanhSachNodes } from "../../../components/Kho/ServiceLayer/WarehouseService";
import { la_leaf_node, tinh_location_code } from "../../../components/Kho/data/warehouseHelpers";

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function Badge({ tt, config }: { tt: string; config: Record<string, { nhan: string; mau: string; nen: string }> }) {
  const c = config[tt] ?? { nhan: tt, mau: "#475569", nen: "#1e293b" };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.nen, color: c.mau, border: `1px solid ${c.mau}30` }}>
      {c.nhan}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  const mau = type === "ok" ? "#10b981" : "#ef4444";
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}>
      {type === "ok" ? <CheckCircle size={14} style={{ color: mau }} /> : <AlertTriangle size={14} style={{ color: mau }} />}
      <p className="text-sm font-bold" style={{ color: mau }}>{msg}</p>
      <button onClick={onClose} style={{ color: "#475569" }}><X size={13} /></button>
    </div>
  );
}

// ─── Tab 1: Tra cứu thông minh ───────────────────────────────────────────────

function TabTraCuu({ ton_kho, nodes, initial_query}: { ton_kho: TonKhoRecord[]; nodes: LocationNode[]; initial_query: string }) {
  const [query, setQuery]         = useState("");
  const [result, setResult]       = useState<SearchResult>({ type: "empty" });
  const [da_search, setDaSearch]  = useState(false);
  const input_ref = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => tinh_stats(ton_kho, nodes), [ton_kho, nodes]);

  const handle_search = (q: string) => {
    const r = smart_search(q, ton_kho, nodes);
    setResult(r);
    setDaSearch(true);
  };

  const ton_do_mau = (t: TonKhoRecord) => {
    if (t.so_luong === 0) return "#ef4444";
    if (t.dinh_muc_min > 0 && t.so_luong < t.dinh_muc_min) return "#f97316";
    if (t.dinh_muc_max > 0 && t.so_luong > t.dinh_muc_max) return "#f59e0b";
    return "#10b981";
  };

  // useEffect tự search khi mount
  useEffect(() => {
    if (initial_query && ton_kho.length > 0) {
      handle_search(initial_query);
    }
  }, [initial_query, ton_kho]);

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* ── Header + Stats — cố định ── */}
      <div className="px-6 py-5 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
        <h3 className="text-sm font-black text-white mb-1">Tra cứu tồn kho</h3>
        <p className="text-[10px] mb-4" style={{ color: "#475569" }}>
          Nhập mã SKU hoặc Location Code — hệ thống tự nhận diện và hiển thị đúng
        </p>

        {/* Stats nhanh */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          {[
            { label: "Loại SKU",    val: stats.tong_sku,        mau: "#94a3b8" },
            { label: "Tổng SP",     val: stats.tong_san_pham,   mau: "#38bdf8" },
            { label: "Ô có hàng",   val: stats.vi_tri_co_hang,  mau: "#10b981" },
            { label: "Sắp hết",     val: stats.sap_het,         mau: "#f97316" },
            { label: "Vượt max",    val: stats.vuot_max,        mau: "#f59e0b" },
          ].map(({ label, val, mau }) => (
            <div key={label} className="px-3 py-2 rounded-xl text-center"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <p className="text-lg font-black" style={{ color: mau }}>{val}</p>
              <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <ScanLine size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#38bdf8" }} />
            <input
              ref={input_ref}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle_search(query)}
              placeholder="Nhập mã SKU (AT001-M-TRANG) hoặc vị trí (A-01-01A-T1)..."
              className="w-full pl-9 pr-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }}
              autoFocus
            />
            {query && (
              <button onClick={() => { setQuery(""); setResult({ type: "empty" }); setDaSearch(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}>
                <X size={13} />
              </button>
            )}
          </div>
          <button onClick={() => handle_search(query)}
            className="px-5 py-3 rounded-xl text-sm font-bold"
            style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            Tra cứu
          </button>
        </div>

        {/* Gợi ý nhanh */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {["AT001-M-TRANG", "VD003-M-XANH", "A-01-01A-T1", "B-01-01A-T1"].map(q => (
            <button key={q} onClick={() => { setQuery(q); handle_search(q); }}
              className="text-[10px] px-2.5 py-1 rounded-lg font-mono"
              style={{ background: "#1e293b", color: "#64748b" }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* ── Kết quả — scroll ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin" }}>

        {/* Kết quả SKU */}
        {result.type === "sku" && (
          <div className="space-y-4">
            {/* Header SKU */}
            <div className="flex items-start justify-between px-5 py-4 rounded-2xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} style={{ color: "#38bdf8" }} />
                  <code className="text-lg font-black" style={{ color: "#38bdf8" }}>{result.ma_sku}</code>
                </div>
                <p className="text-sm font-bold text-white">{result.ten_sp}</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                  {result.mau_sac} · {result.kich_thuoc}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black" style={{ color: "#38bdf8" }}>{result.tong_ton_kho}</p>
                <p className="text-[10px]" style={{ color: "#475569" }}>tổng tồn kho</p>
              </div>
            </div>

            {/* Các vị trí đang chứa */}
            <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
              Phân bố tại {result.cac_vi_tri.length} vị trí
            </p>
            {result.cac_vi_tri.map(t => (
              <div key={t.node_id}
                className="flex items-center gap-4 px-4 py-3 rounded-xl"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                {t.la_primary && (
                  <Star size={13} style={{ color: "#f59e0b", fill: "#f59e0b", flexShrink: 0 }} />
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <MapPin size={12} style={{ color: "#a78bfa" }} />
                  <code className="text-sm font-black" style={{ color: "#a78bfa" }}>
                    {t.location_code}
                  </code>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {t.la_primary ? "Primary pick bin" : "Overflow"}
                  </p>
                </div>
                {/* Min/Max bar */}
                {t.dinh_muc_max > 0 && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                      <div className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(t.so_luong / t.dinh_muc_max * 100, 100)}%`,
                          background: ton_do_mau(t),
                        }} />
                    </div>
                    <span className="text-[10px]" style={{ color: "#475569" }}>
                      {t.dinh_muc_min}–{t.dinh_muc_max}
                    </span>
                  </div>
                )}
                <div className="text-right flex-shrink-0">
                  <p className="text-xl font-black" style={{ color: ton_do_mau(t) }}>
                    {t.so_luong === 0 ? "HẾT" : t.so_luong}
                  </p>
                  <p className="text-[9px]" style={{ color: "#475569" }}>cái</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kết quả Location */}
        {result.type === "location" && (
          <div className="space-y-4">
            {/* Header Location */}
            <div className="flex items-start justify-between px-5 py-4 rounded-2xl"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} style={{ color: "#a78bfa" }} />
                  <code className="text-lg font-black" style={{ color: "#a78bfa" }}>
                    {result.location_code}
                  </code>
                </div>
                <p className="text-sm font-bold text-white">{result.ten_vi_tri}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black" style={{ color: "#a78bfa" }}>{result.suc_chua}</p>
                <p className="text-[10px]" style={{ color: "#475569" }}>tổng đang chứa</p>
              </div>
            </div>

            {/* Danh sách SKU trong ô */}
            {result.cac_sku.length === 0 ? (
              <div className="text-center py-8">
                <Package size={28} className="mx-auto mb-2 opacity-20" style={{ color: "#64748b" }} />
                <p className="text-sm" style={{ color: "#475569" }}>Vị trí này đang trống</p>
              </div>
            ) : (
              <>
                <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                  {result.cac_sku.length} SKU đang chứa tại đây
                </p>
                {result.cac_sku.map(t => (
                  <div key={t.ma_sku}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl"
                    style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-black" style={{ color: "#94a3b8" }}>{t.ma_sku}</code>
                        {t.la_primary && (
                          <Star size={10} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
                        )}
                      </div>
                      <p className="text-xs text-white truncate">{t.ten_sp}</p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>
                        {t.mau_sac} · {t.kich_thuoc}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black" style={{ color: ton_do_mau(t) }}>
                        {t.so_luong}
                      </p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>cái</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Empty state */}
        {result.type === "empty" && !da_search && (
          <div className="flex flex-col items-center justify-center h-full pb-10">
            <ScanLine size={40} className="mb-4 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Nhập mã SKU hoặc vị trí để tra cứu</p>
            <p className="text-xs mt-1" style={{ color: "#334155" }}>Hệ thống tự nhận diện và hiển thị kết quả phù hợp</p>
          </div>
        )}

        {result.type === "empty" && da_search && (
          <div className="flex flex-col items-center justify-center h-full pb-10">
            <X size={36} className="mb-3 opacity-20" style={{ color: "#ef4444" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>
              Không tìm thấy kết quả cho "{query}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Chuyển kho nội bộ ────────────────────────────────────────────────

function TabChuyenKho({
  ton_kho, nodes, phieu_list, on_tao, on_duyet,
}: {
  ton_kho:    TonKhoRecord[];
  nodes:      LocationNode[];
  phieu_list: PhieuChuyenKho[];
  on_tao:     (p: PhieuChuyenKho) => void;
  on_duyet:   (id: string) => void;
}) {
  const [show_form, setShowForm]   = useState(false);
  const [sku_search, setSkuSearch] = useState("");
  const [sel_sku, setSelSku]       = useState<TonKhoRecord | null>(null);
  const [node_den, setNodeDen]     = useState("");
  const [so_luong, setSoLuong]     = useState(1);
  const [ly_do, setLyDo]           = useState("");
  const [loi, setLoi]              = useState<string[]>([]);

  const leaf_nodes = nodes.filter(n => la_leaf_node(n.id, nodes) && n.trang_thai === "active");

  const sku_options = useMemo(() => {
    const q = sku_search.toLowerCase();
    return ton_kho.filter(t => t.so_luong > 0 && (
      !q || t.ma_sku.toLowerCase().includes(q) || t.ten_sp.toLowerCase().includes(q)
    ));
  }, [ton_kho, sku_search]);

  const handle_tao = () => {
    const errs: string[] = [];
    if (!sel_sku)   errs.push("Chưa chọn SKU và vị trí nguồn");
    if (!node_den)  errs.push("Chưa chọn vị trí đích");
    if (sel_sku && node_den === sel_sku.node_id) errs.push("Vị trí nguồn và đích phải khác nhau");
    if (so_luong <= 0) errs.push("Số lượng phải lớn hơn 0");
    if (sel_sku && so_luong > sel_sku.so_luong) errs.push(`Số lượng vượt quá tồn tại vị trí này (${sel_sku.so_luong})`);
    if (!ly_do.trim()) errs.push("Phải nhập lý do chuyển kho");
    if (errs.length) { setLoi(errs); return; }

    const phieu: PhieuChuyenKho = {
      id:             gen_id(),
      ma_phieu:       gen_ma_phieu_chuyen(),
      ma_sku:         sel_sku!.ma_sku,
      ten_sp:         `${sel_sku!.ten_sp} — ${sel_sku!.mau_sac} ${sel_sku!.kich_thuoc}`,
      node_id_tu:     sel_sku!.node_id,
      location_tu:    sel_sku!.location_code,
      node_id_den:    node_den,
      location_den:   tinh_location_code(node_den, nodes),
      so_luong,
      ly_do:          ly_do.trim(),
      trang_thai:     "cho_xac_nhan",
      nguoi_tao:      "Người dùng hiện tại",
      ngay_tao:       new Date().toISOString(),
      ngay_hoan_thanh: "",
    };
    on_tao(phieu);
    setShowForm(false);
    setSelSku(null); setNodeDen(""); setSoLuong(1); setLyDo(""); setLoi([]);
  };

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Danh sách phiếu chuyển ── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 320, borderColor: "#1e293b" }}>
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white">Chuyển kho nội bộ</h3>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              <Plus size={12} /> Tạo phiếu
            </button>
          </div>
          <p className="text-[10px]" style={{ color: "#475569" }}>
            Dời hàng từ kệ A sang kệ B trong cùng kho
          </p>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {phieu_list.map(p => (
            <div key={p.id} className="px-4 py-3 border-b"
              style={{ borderColor: "#0f172a" }}>
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black" style={{ color: "#94a3b8" }}>{p.ma_phieu}</code>
                <Badge tt={p.trang_thai} config={TRANG_THAI_CHUYEN_CONFIG} />
              </div>
              <p className="text-xs text-white truncate">{p.ten_sp}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="text-[10px]" style={{ color: "#a78bfa" }}>{p.location_tu}</code>
                <ArrowRight size={10} style={{ color: "#475569" }} />
                <code className="text-[10px]" style={{ color: "#10b981" }}>{p.location_den}</code>
                <span className="ml-auto text-[10px] font-bold" style={{ color: "#64748b" }}>
                  ×{p.so_luong}
                </span>
              </div>
              {p.trang_thai === "cho_xac_nhan" && (
                <button onClick={() => on_duyet(p.id)}
                  className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98130" }}>
                  <Check size={11} /> Xác nhận chuyển
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Form tạo phiếu ── */}
      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin" }}>
        {!show_form ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Truck size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>
              Nhấn "Tạo phiếu" để bắt đầu chuyển hàng
            </p>
          </div>
        ) : (
          <div className="max-w-lg space-y-4">
            <h3 className="text-sm font-black text-white">Tạo phiếu chuyển kho</h3>

            {/* Chọn SKU + vị trí nguồn */}
            <div>
              <label className="text-[10px] font-black uppercase mb-2 block" style={{ color: "#475569" }}>
                SKU + Vị trí nguồn *
              </label>
              <div className="relative mb-2">
                <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
                <input value={sku_search} onChange={e => setSkuSearch(e.target.value)}
                  placeholder="Tìm SKU..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                {sku_options.map(t => (
                  <button key={t.node_id + t.ma_sku}
                    onClick={() => setSelSku(t)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: sel_sku?.node_id === t.node_id && sel_sku?.ma_sku === t.ma_sku ? "#0c435425" : "#0f172a",
                      border: `1px solid ${sel_sku?.node_id === t.node_id && sel_sku?.ma_sku === t.ma_sku ? "#38bdf840" : "#1e293b"}`,
                    }}>
                    <div className="flex-1 min-w-0">
                      <code className="text-[10px] font-black" style={{ color: "#94a3b8" }}>{t.ma_sku}</code>
                      <p className="text-xs text-white truncate">{t.ten_sp}</p>
                    </div>
                    <code className="text-[10px]" style={{ color: "#a78bfa" }}>{t.location_code}</code>
                    <span className="text-sm font-black" style={{ color: "#38bdf8" }}>×{t.so_luong}</span>
                  </button>
                ))}
              </div>
            </div>

            {sel_sku && (
              <>
                {/* Vị trí đích */}
                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
                    Vị trí đích *
                  </label>
                  <select value={node_den} onChange={e => setNodeDen(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                    <option value="">-- Chọn ô/bin đích --</option>
                    {leaf_nodes.filter(n => n.id !== sel_sku.node_id).map(n => (
                      <option key={n.id} value={n.id}>
                        {tinh_location_code(n.id, nodes)} — {n.ten}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Số lượng */}
                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
                    Số lượng * (tối đa: {sel_sku.so_luong})
                  </label>
                  <input type="number" min={1} max={sel_sku.so_luong}
                    value={so_luong} onChange={e => setSoLuong(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-black text-center outline-none"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: "#38bdf8" }} />
                </div>

                {/* Lý do */}
                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
                    Lý do chuyển kho *
                  </label>
                  <textarea value={ly_do} onChange={e => setLyDo(e.target.value)}
                    placeholder="VD: Dọn kệ, bổ sung vị trí primary đang hết hàng..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                </div>
              </>
            )}

            {/* Lỗi */}
            {loi.length > 0 && (
              <div className="rounded-xl p-3 space-y-1" style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
                {loi.map(l => (
                  <div key={l} className="flex items-center gap-2 text-xs" style={{ color: "#fca5a5" }}>
                    <AlertTriangle size={11} />{l}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={() => { setShowForm(false); setLoi([]); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Huỷ
              </button>
              <button onClick={handle_tao}
                className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
                <Check size={14} /> Tạo phiếu chuyển
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tab 3: Kiểm kê ──────────────────────────────────────────────────────────

function TabKiemKe({
  ton_kho, phieu_list, on_tao, on_update,
}: {
  ton_kho:    TonKhoRecord[];
  phieu_list: PhieuKiemKe[];
  on_tao:     (p: PhieuKiemKe) => void;
  on_update:  (p: PhieuKiemKe) => void;
}) {
  const [selected_id, setSelectedId]  = useState<string | null>(phieu_list[0]?.id ?? null);
  const [show_tao, setShowTao]         = useState(false);
  const [pham_vi, setPhamVi]           = useState("Toàn bộ kho");
  const [ghi_chu, setGhiChu]           = useState("");

  const selected = phieu_list.find(p => p.id === selected_id);

  const handle_tao = () => {
    const id = gen_id();
    const phieu: PhieuKiemKe = {
      id,
      ma_phieu:       gen_ma_phieu_kiem_ke(),
      trang_thai:     "dang_kiem",
      pham_vi:        pham_vi.trim() || "Toàn bộ kho",
      nguoi_tao:      "Quản lý kho",
      nguoi_duyet:    "",
      ngay_tao:       new Date().toISOString(),
      ngay_hoan_thanh: "",
      ghi_chu:        ghi_chu.trim(),
      danh_sach:      tao_danh_sach_kiem_ke(ton_kho, id),
    };
    on_tao(phieu);
    setSelectedId(id);
    setShowTao(false);
  };

  const cap_nhat_dong = (dong: DongKiemKe, so_luong_thuc: number, ghi_chu_dong: string) => {
    if (!selected) return;
    on_update({
      ...selected,
      danh_sach: selected.danh_sach.map(d =>
        d.id === dong.id
          ? { ...d, so_luong_thuc, chenh_lech: so_luong_thuc - d.so_luong_he_thong, ghi_chu: ghi_chu_dong, da_dem: true }
          : d
      ),
    });
  };

  const duyet_phieu = () => {
    if (!selected) return;
    on_update({
      ...selected,
      trang_thai:     "da_duyet",
      nguoi_duyet:    "Quản lý kho",
      ngay_hoan_thanh: new Date().toISOString(),
    });
  };

  const so_da_dem      = selected?.danh_sach.filter(d => d.da_dem).length ?? 0;
  const so_chenh_lech  = selected?.danh_sach.filter(d => d.da_dem && d.chenh_lech !== 0).length ?? 0;
  const tat_ca_da_dem  = selected ? so_da_dem === selected.danh_sach.length : false;

  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: Danh sách phiếu ── */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 300, borderColor: "#1e293b" }}>
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-white">Phiếu kiểm kê</h3>
            <button onClick={() => setShowTao(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              <Plus size={12} /> Tạo lệnh
            </button>
          </div>
          <p className="text-[10px]" style={{ color: "#475569" }}>
            Tạo lệnh → nhân viên đếm → duyệt chênh lệch
          </p>
        </div>

        {/* Form tạo lệnh */}
        {show_tao && (
          <div className="px-4 py-3 border-b space-y-3" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
            <p className="text-[10px] font-black text-white">Tạo lệnh kiểm kê mới</p>
            <input value={pham_vi} onChange={e => setPhamVi(e.target.value)}
              placeholder="Phạm vi: Khu A, Khu B, Toàn bộ..."
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <input value={ghi_chu} onChange={e => setGhiChu(e.target.value)}
              placeholder="Ghi chú (không bắt buộc)"
              className="w-full px-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <div className="flex gap-2">
              <button onClick={() => setShowTao(false)}
                className="flex-1 py-2 rounded-lg text-xs font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>Huỷ</button>
              <button onClick={handle_tao}
                className="flex-1 py-2 rounded-lg text-xs font-bold"
                style={{ background: "#0c435420", color: "#38bdf8" }}>Tạo</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {phieu_list.map(p => (
            <button key={p.id}
              onClick={() => setSelectedId(p.id)}
              className="w-full text-left px-4 py-3 transition-all"
              style={{
                background: selected_id === p.id ? "#0f172a" : "transparent",
                borderLeft: selected_id === p.id ? "2px solid #38bdf8" : "2px solid transparent",
                borderBottom: "1px solid #0f172a",
              }}>
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black" style={{ color: selected_id === p.id ? "#38bdf8" : "#94a3b8" }}>
                  {p.ma_phieu}
                </code>
                <Badge tt={p.trang_thai} config={TRANG_THAI_KIEM_KE_CONFIG} />
              </div>
              <p className="text-[10px]" style={{ color: "#475569" }}>{p.pham_vi}</p>
              <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>
                {p.danh_sach.filter(d => d.da_dem).length}/{p.danh_sach.length} dòng đã đếm
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Chi tiết phiếu kiểm kê ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <FileText size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Chọn phiếu kiểm kê để xem chi tiết</p>
          </div>
        ) : (
          <>
            {/* Header — cố định */}
            <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-base font-black text-white">{selected.ma_phieu}</code>
                    <Badge tt={selected.trang_thai} config={TRANG_THAI_KIEM_KE_CONFIG} />
                  </div>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {selected.pham_vi} · {new Date(selected.ngay_tao).toLocaleDateString("vi-VN")}
                  </p>
                  {selected.ghi_chu && (
                    <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>{selected.ghi_chu}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {[
                    { label: "Tổng dòng", val: selected.danh_sach.length,   mau: "#94a3b8" },
                    { label: "Đã đếm",    val: so_da_dem,                    mau: "#38bdf8" },
                    { label: "Chênh lệch",val: so_chenh_lech,               mau: so_chenh_lech > 0 ? "#ef4444" : "#10b981" },
                  ].map(({ label, val, mau }) => (
                    <div key={label} className="text-center px-3 py-2 rounded-xl"
                      style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                      <p className="text-lg font-black" style={{ color: mau }}>{val}</p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                  <div className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.round(so_da_dem / selected.danh_sach.length * 100)}%`,
                      background: tat_ca_da_dem ? "#10b981" : "#38bdf8",
                    }} />
                </div>
                <span className="text-[10px]" style={{ color: "#475569" }}>
                  {Math.round(so_da_dem / selected.danh_sach.length * 100)}%
                </span>
              </div>
            </div>

            {/* Table header — cố định */}
            <div className="grid px-6 py-2 text-[9px] font-black uppercase flex-shrink-0"
              style={{
                gridTemplateColumns: "120px 1fr 80px 80px 80px 1fr",
                background: "#0a1628", color: "#334155",
                borderBottom: "1px solid #1e293b",
              }}>
              <span>Vị trí</span>
              <span>SKU / Sản phẩm</span>
              <span className="text-center">Hệ thống</span>
              <span className="text-center">Thực tế</span>
              <span className="text-center">Chênh lệch</span>
              <span>Ghi chú</span>
            </div>

            {/* Danh sách — scroll */}
            <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
              {selected.danh_sach.map((dong) => {
                const cl = tinh_chenh_lech(dong);
                const mau_cl = cl > 0 ? "#f59e0b" : cl < 0 ? "#ef4444" : "#10b981";
                return (
                  <div key={dong.id}
                    className="grid items-center px-6 py-2.5 gap-2"
                    style={{
                      gridTemplateColumns: "120px 1fr 80px 80px 80px 1fr",
                      borderBottom: "1px solid #0f172a",
                      background: dong.da_dem && cl !== 0 ? `${mau_cl}08` : "transparent",
                    }}>
                    <code className="text-[10px] font-black" style={{ color: "#a78bfa" }}>
                      {dong.location_code}
                    </code>
                    <div className="min-w-0">
                      <p className="text-xs text-white truncate">{dong.ten_sp}</p>
                      <code className="text-[9px]" style={{ color: "#475569" }}>{dong.ma_sku}</code>
                    </div>
                    {/* Hệ thống */}
                    <div className="text-center text-sm font-bold" style={{ color: "#64748b" }}>
                      {dong.so_luong_he_thong}
                    </div>
                    {/* Nhập thực tế */}
                    <div className="text-center">
                      {selected.trang_thai === "dang_kiem" ? (
                        <input
                          type="number" min={0}
                          defaultValue={dong.so_luong_thuc}
                          onBlur={e => cap_nhat_dong(dong, Number(e.target.value), dong.ghi_chu)}
                          className="w-16 text-center text-sm font-black outline-none rounded-lg py-1"
                          style={{
                            background: dong.da_dem ? "#1e293b" : "#0f172a",
                            border: `1px solid ${dong.da_dem ? "#334155" : "#1e293b"}`,
                            color: "#10b981",
                          }}
                        />
                      ) : (
                        <span className="text-sm font-black" style={{ color: "#10b981" }}>
                          {dong.so_luong_thuc}
                        </span>
                      )}
                    </div>
                    {/* Chênh lệch */}
                    <div className="text-center">
                      {dong.da_dem ? (
                        <span className="text-sm font-black" style={{ color: mau_cl }}>
                          {cl > 0 ? `+${cl}` : cl}
                        </span>
                      ) : (
                        <span className="text-[10px]" style={{ color: "#334155" }}>—</span>
                      )}
                    </div>
                    {/* Ghi chú */}
                    <div>
                      {selected.trang_thai === "dang_kiem" ? (
                        <input
                          type="text"
                          defaultValue={dong.ghi_chu}
                          onBlur={e => cap_nhat_dong(dong, dong.so_luong_thuc, e.target.value)}
                          placeholder="Ghi chú..."
                          className="w-full px-2 py-1 rounded-lg text-xs outline-none"
                          style={{ background: "#1e293b", border: "1px solid #1e293b", color: "white" }}
                        />
                      ) : (
                        <span className="text-[10px]" style={{ color: "#475569" }}>{dong.ghi_chu || "—"}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer action — pin dưới */}
            {selected.trang_thai === "dang_kiem" && (
              <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
                {!tat_ca_da_dem && (
                  <p className="text-[10px] text-center mb-2" style={{ color: "#475569" }}>
                    Còn {selected.danh_sach.length - so_da_dem} dòng chưa đếm
                  </p>
                )}
                <button
                  onClick={() => on_update({ ...selected, trang_thai: "cho_duyet" })}
                  disabled={!tat_ca_da_dem}
                  className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "#4c1d9520", color: "#a78bfa", border: "1px solid #a78bfa40" }}>
                  <ClipboardList size={15} /> Hoàn tất kiểm kê — Gửi duyệt
                </button>
              </div>
            )}

            {selected.trang_thai === "cho_duyet" && (
              <div className="px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
                {so_chenh_lech > 0 && (
                  <p className="text-[10px] text-center mb-2" style={{ color: "#f59e0b" }}>
                    Phát hiện {so_chenh_lech} dòng có chênh lệch — duyệt sẽ cập nhật tồn kho
                  </p>
                )}
                <button onClick={duyet_phieu}
                  className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                  style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
                  <Check size={15} /> Duyệt & Cập nhật tồn kho
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "tra_cuu" | "chuyen_kho" | "kiem_ke";

export default function InventoryManager() {

  const [search_params] = useSearchParams();
  const sku_from_url = search_params.get("sku") ?? "";

  const [ton_kho, setTonKho]           = useState<TonKhoRecord[]>([]);
  const [nodes, setNodes]              = useState<LocationNode[]>([]);
  const [phieu_chuyen, setPhieuChuyen] = useState<PhieuChuyenKho[]>([]);
  const [phieu_kiem_ke, setPhieuKiemKe]= useState<PhieuKiemKe[]>([]);
  const [active_tab, setActiveTab]     = useState<ActiveTab>("tra_cuu");
  const [toast, setToast]              = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    layTonKho().then(setTonKho);
    layDanhSachNodes().then(setNodes);
    layDanhSachPhieuChuyen().then(setPhieuChuyen);
    layDanhSachPhieuKiemKe().then(setPhieuKiemKe);
  }, []);

  const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handle_tao_chuyen = (phieu: PhieuChuyenKho) => {
    taoPhieuChuyen(phieu).then(created => {
      setPhieuChuyen(prev => [created, ...prev]);
      show_toast(`Đã tạo ${created.ma_phieu}`);
    });
  };

  const handle_duyet_chuyen = (id: string) => {
    const phieu = phieu_chuyen.find(p => p.id === id);
    if (!phieu) return;
    xacNhanChuyenKho(id).then(() => {
      setTonKho(prev => {
        const updated = [...prev];
        const nguon_idx = updated.findIndex(t => t.node_id === phieu.node_id_tu && t.ma_sku === phieu.ma_sku);
        if (nguon_idx >= 0) updated[nguon_idx] = { ...updated[nguon_idx], so_luong: updated[nguon_idx].so_luong - phieu.so_luong };
        const dich_idx = updated.findIndex(t => t.node_id === phieu.node_id_den && t.ma_sku === phieu.ma_sku);
        if (dich_idx >= 0) {
          updated[dich_idx] = { ...updated[dich_idx], so_luong: updated[dich_idx].so_luong + phieu.so_luong };
        } else {
          const nguon = updated[nguon_idx];
          if (nguon) {
            updated.push({
              ...nguon,
              node_id:       phieu.node_id_den,
              location_code: phieu.location_den,
              so_luong:      phieu.so_luong,
              la_primary:    false,
            });
          }
        }
        return updated;
      });
      setPhieuChuyen(prev => prev.map(p =>
        p.id === id ? { ...p, trang_thai: "hoan_thanh", ngay_hoan_thanh: new Date().toISOString() } : p
      ));
      show_toast("Đã xác nhận chuyển kho — tồn kho đã được cập nhật");
    });
  };

  const handle_tao_kiem_ke = (phieu: PhieuKiemKe) => {
    taoPhieuKiemKe(phieu).then(created => {
      setPhieuKiemKe(prev => [created, ...prev]);
      show_toast(`Đã tạo lệnh kiểm kê ${created.ma_phieu}`);
    });
  };

  const handle_update_kiem_ke = (phieu: PhieuKiemKe) => {
    capNhatPhieuKiemKe(phieu).then(updated => {
      setPhieuKiemKe(prev => prev.map(p => p.id === updated.id ? updated : p));
      if (updated.trang_thai === "da_duyet") {
        setTonKho(prev => {
          const list = [...prev];
          updated.danh_sach.filter(d => d.chenh_lech !== 0).forEach(d => {
            const idx = list.findIndex(t => t.node_id === d.node_id && t.ma_sku === d.ma_sku);
            if (idx >= 0) list[idx] = { ...list[idx], so_luong: d.so_luong_thuc };
          });
          return list;
        });
        show_toast("Đã duyệt kiểm kê — tồn kho đã được cập nhật");
      } else if (updated.trang_thai === "cho_duyet") {
        show_toast("Đã gửi phiếu kiểm kê để duyệt");
      }
    });
  };

  const TABS = [
    { id: "tra_cuu"   as ActiveTab, label: "Tra cứu tồn kho", icon: Search },
    { id: "chuyen_kho"as ActiveTab, label: "Chuyển kho",       icon: ArrowRight },
    { id: "kiem_ke"   as ActiveTab, label: "Kiểm kê",          icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden relative" style={{ background: "#020817" }}>

      {/* Tab bar — cố định */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        <div className="flex items-center gap-2 px-5 py-2 border-r" style={{ borderColor: "#1e293b" }}>
          <Package size={14} style={{ color: "#38bdf8" }} />
          <span className="text-sm font-black text-white">Tồn kho</span>
        </div>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all"
            style={{
              color:        active_tab === id ? "#38bdf8" : "#475569",
              borderBottom: active_tab === id ? "2px solid #38bdf8" : "2px solid transparent",
            }}>
            <Icon size={13} />{label}
            {id === "kiem_ke" && phieu_kiem_ke.filter(p => p.trang_thai === "cho_duyet").length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                style={{ background: "#a78bfa20", color: "#a78bfa" }}>
                {phieu_kiem_ke.filter(p => p.trang_thai === "cho_duyet").length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {active_tab === "tra_cuu" && <TabTraCuu ton_kho={ton_kho} nodes={nodes} initial_query={sku_from_url}/>}
        {active_tab === "chuyen_kho" && (
          <TabChuyenKho
            ton_kho={ton_kho}
            nodes={nodes}
            phieu_list={phieu_chuyen}
            on_tao={handle_tao_chuyen}
            on_duyet={handle_duyet_chuyen}
          />
        )}
        {active_tab === "kiem_ke" && (
          <TabKiemKe
            ton_kho={ton_kho}
            phieu_list={phieu_kiem_ke}
            on_tao={handle_tao_kiem_ke}
            on_update={handle_update_kiem_ke}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}