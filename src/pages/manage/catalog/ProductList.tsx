// ─────────────────────────────────────────────────────────────────────────────
// ProductList.tsx — Màn hình 1: Danh sách sản phẩm
// Filter + Table + Hover SKU popup + Bulk actions + Save filter
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, ChevronDown,
  Pencil, X, Check, BookmarkPlus, Bookmark,
  Package, Globe, EyeOff, Trash2,
} from "lucide-react";
import type { Product, ProductFilter, SavedFilter, LifecycleStatus } from "../../../components/DanhMucSanPham/catalogTypes";
import { LIFECYCLE_CONFIG } from "../../../components/DanhMucSanPham/catalogTypes";
import {
  layDanhSachSanPham, layDanhSachCategory,
  layDanhSachSeason, doiTrangThaiHangLoat,
  xoaSanPham, xoaSanPhamHangLoat,
} from "../../../components/DanhMucSanPham/catalogService";
import type { Category, Season, Color } from "../../../components/DanhMucSanPham/catalogTypes";
import { MOCK_COLORS } from "../../../components/DanhMucSanPham/data/catalogMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EMPTY_FILTER: ProductFilter = {
  search: "", season_id: "", category_id: "", lifecycle_status: "", vendor_id: "",
};

function dinh_dang_tien(so: number) {
  return so.toLocaleString("vi-VN") + "đ";
}

// ─── Badge trạng thái ─────────────────────────────────────────────────────────

function LifecycleBadge({ status }: { status: LifecycleStatus }) {
  const cfg = LIFECYCLE_CONFIG[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: cfg.nen, color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      {cfg.nhan}
    </span>
  );
}

// ─── Hover popup SKU count ────────────────────────────────────────────────────

function SkuCountCell({ product, colors }: { product: Product; colors: Color[] }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos]         = useState({ top: 0, left: 0 });
  const ref                   = useRef<HTMLSpanElement>(null);

  if (!product.skus || product.skus.length === 0) {
    return <span className="text-[11px]" style={{ color: "#334155" }}>—</span>;
  }

  // Nhóm màu × size
  const mau_ids  = [...new Set(product.skus.map(s => s.color_id))];
  const size_ids = [...new Set(product.skus.map(s => s.size_id))];
  const mau_list = mau_ids.map(id => colors.find(c => c.color_id === id)).filter(Boolean) as Color[];

  const show = () => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) setPos({ top: rect.bottom + 6, left: rect.left });
    setVisible(true);
  };

  return (
    <span ref={ref} onMouseEnter={show} onMouseLeave={() => setVisible(false)}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg cursor-default transition-all"
      style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf830" }}>
      <Package size={11} />
      <span className="text-[11px] font-black">{product.sku_count}</span>

      {visible && (
        <div className="fixed z-[9999] rounded-xl shadow-2xl py-3 px-4"
          style={{ top: pos.top, left: pos.left, background: "#0f172a",
            border: "1px solid #1e293b", minWidth: 200 }}>
          <p className="text-[9px] font-black uppercase mb-2" style={{ color: "#334155" }}>
            {mau_ids.length} màu × {size_ids.length} size
          </p>
          {/* Màu sắc */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {mau_list.map(c => (
              <div key={c.color_id} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full border border-white/10 flex-shrink-0"
                  style={{ background: c.hex_code }} />
                <span className="text-[10px]" style={{ color: "#64748b" }}>{c.color_name}</span>
              </div>
            ))}
          </div>
          {/* Giá */}
          <div className="pt-2 border-t" style={{ borderColor: "#1e293b" }}>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Giá bán:{" "}
              <span style={{ color: "#10b981" }}>
                {dinh_dang_tien(Math.min(...product.skus.map(s => s.sale_price)))}
                {" – "}
                {dinh_dang_tien(Math.max(...product.skus.map(s => s.sale_price)))}
              </span>
            </p>
          </div>
        </div>
      )}
    </span>
  );
}

// ─── Dropdown filter ──────────────────────────────────────────────────────────

function FilterDropdown({ label, value, options, onChange }: {
  label:    string;
  value:    string;
  options:  { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);
  const selected        = options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
        style={{
          background: value ? "#0c435430" : "#0f172a",
          color:      value ? "#38bdf8"   : "#64748b",
          border:     `1px solid ${value ? "#38bdf840" : "#1e293b"}`,
        }}>
        <span>{selected?.label ?? label}</span>
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
        {value && (
          <span onClick={e => { e.stopPropagation(); onChange(""); }}
            className="ml-1 hover:text-white">
            <X size={10} />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 rounded-xl overflow-hidden shadow-2xl"
          style={{ minWidth: 180, background: "#0f172a", border: "1px solid #1e293b" }}>
          <button onClick={() => { onChange(""); setOpen(false); }}
            className="w-full px-4 py-2.5 text-left text-xs hover:bg-slate-800/60 transition-colors"
            style={{ color: "#475569" }}>
            Tất cả
          </button>
          {options.map(opt => (
            <button key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left text-xs hover:bg-slate-800/60 transition-colors"
              style={{ color: value === opt.value ? "#38bdf8" : "#94a3b8" }}>
              <span>{opt.label}</span>
              {value === opt.value && <Check size={11} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductList() {
  const navigate = useNavigate();

  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seasons,    setSeasons]    = useState<Season[]>([]);
  const [loading,    setLoading]    = useState(true);

  const [filter,    setFilter]    = useState<ProductFilter>(() => {
    try { return JSON.parse(localStorage.getItem("catalog_filter") || "null") ?? EMPTY_FILTER; }
    catch { return EMPTY_FILTER; }
  });
  const [saved_filters, setSavedFilters] = useState<SavedFilter[]>(() => {
    try { return JSON.parse(localStorage.getItem("catalog_saved_filters") || "[]"); }
    catch { return []; }
  });
  const [show_save_modal, setShowSaveModal] = useState(false);
  const [save_name,       setSaveName]      = useState("");
  const [selected_ids,    setSelectedIds]   = useState<string[]>([]);
  const [show_bulk_menu,  setShowBulkMenu]  = useState(false);
  const [confirm_xoa,     setConfirmXoa]    = useState<string | null>(null); // product_id cần xóa
  const [xoa_hang_loat,   setXoaHangLoat]   = useState(false);

  useEffect(() => {
    Promise.all([layDanhSachCategory(), layDanhSachSeason()])
      .then(([cats, seas]) => { setCategories(cats); setSeasons(seas); });
  }, []);

  useEffect(() => {
    let active = true;
    layDanhSachSanPham(filter).then(data => {
      if (active) { setProducts(data); setLoading(false); }
    });
    localStorage.setItem("catalog_filter", JSON.stringify(filter));
    return () => { active = false; setLoading(true); };
  }, [filter]);

  const set_filter = (key: keyof ProductFilter, val: string) =>
    setFilter(prev => ({ ...prev, [key]: val }));

  const co_filter = Object.values(filter).some(v => v !== "");

  const clear_filter = () => setFilter(EMPTY_FILTER);

  const save_filter = () => {
    if (!save_name.trim()) return;
    const new_saved: SavedFilter = {
      id:     Date.now().toString(),
      name:   save_name.trim(),
      filter: { ...filter },
    };
    const updated = [...saved_filters, new_saved];
    setSavedFilters(updated);
    localStorage.setItem("catalog_saved_filters", JSON.stringify(updated));
    setShowSaveModal(false);
    setSaveName("");
  };

  const apply_saved = (sf: SavedFilter) => setFilter(sf.filter);

  const delete_saved = (id: string) => {
    const updated = saved_filters.filter(s => s.id !== id);
    setSavedFilters(updated);
    localStorage.setItem("catalog_saved_filters", JSON.stringify(updated));
  };

  // Bulk select
  const toggle_select = (id: string) =>
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const toggle_select_all = () =>
    setSelectedIds(prev => prev.length === products.length ? [] : products.map(p => p.product_id));

  const bulk_doi_trang_thai = async (status: LifecycleStatus) => {
    await doiTrangThaiHangLoat(selected_ids, status);
    const updated = await layDanhSachSanPham(filter);
    setProducts(updated);
    setSelectedIds([]);
    setShowBulkMenu(false);
  };

  const handle_xoa = async (product_id: string) => {
    await xoaSanPham(product_id);
    const updated = await layDanhSachSanPham(filter);
    setProducts(updated);
    setConfirmXoa(null);
  };

  const handle_xoa_hang_loat = async () => {
    await xoaSanPhamHangLoat(selected_ids);
    const updated = await layDanhSachSanPham(filter);
    setProducts(updated);
    setSelectedIds([]);
    setXoaHangLoat(false);
  };

  // Options cho dropdown
  const season_opts    = seasons.map(s => ({ value: s.season_id, label: s.season_name }));
  const category_opts  = categories.filter(c => !c.parent_id).map(c => ({ value: c.category_id, label: c.name }));
  const lifecycle_opts = Object.entries(LIFECYCLE_CONFIG).map(([k, v]) => ({ value: k, label: v.nhan }));

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* ── Header ── */}
      <div className="px-6 py-5 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-base font-black text-white">Danh mục sản phẩm</h1>
            <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
              {products.length} sản phẩm
            </p>
          </div>
          <button
            onClick={() => navigate("/manage/danh-muc/san-pham/tao-moi")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
            style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            <Plus size={15} /> Thêm sản phẩm
          </button>
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }} />
            <input value={filter.search}
              onChange={e => set_filter("search", e.target.value)}
              placeholder="Tìm tên, mã sản phẩm..."
              className="pl-8 pr-4 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#0f172a", border: "1px solid #1e293b",
                color: "white", width: 220 }} />
          </div>

          <FilterDropdown label="Mùa vụ"    value={filter.season_id}        options={season_opts}    onChange={v => set_filter("season_id", v)} />
          <FilterDropdown label="Danh mục"  value={filter.category_id}      options={category_opts}  onChange={v => set_filter("category_id", v)} />
          <FilterDropdown label="Trạng thái" value={filter.lifecycle_status} options={lifecycle_opts} onChange={v => set_filter("lifecycle_status", v)} />

          {/* Clear filter */}
          {co_filter && (
            <button onClick={clear_filter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#7f1d1d20", color: "#ef4444" }}>
              <X size={11} /> Xoá bộ lọc
            </button>
          )}

          {/* Save filter */}
          {co_filter && (
            <button onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#0f172a", color: "#64748b", border: "1px solid #1e293b" }}>
              <BookmarkPlus size={11} /> Lưu bộ lọc
            </button>
          )}
        </div>

        {/* Saved filters */}
        {saved_filters.length > 0 && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px]" style={{ color: "#334155" }}>Đã lưu:</span>
            {saved_filters.map(sf => (
              <button key={sf.id}
                onClick={() => apply_saved(sf)}
                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                <Bookmark size={9} />
                {sf.name}
                <span onClick={e => { e.stopPropagation(); delete_saved(sf.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 hover:text-red-400">
                  <X size={9} />
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Bulk action bar ── */}
      {selected_ids.length > 0 && (
        <div className="px-6 py-2 flex items-center gap-3 flex-shrink-0"
          style={{ background: "#0c435415", borderBottom: "1px solid #38bdf820" }}>
          <span className="text-xs font-bold" style={{ color: "#38bdf8" }}>
            Đã chọn {selected_ids.length} sản phẩm
          </span>
          <div className="relative">
            <button onClick={() => setShowBulkMenu(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              Đổi trạng thái <ChevronDown size={11} />
            </button>
            {show_bulk_menu && (
              <div className="absolute top-full left-0 mt-1 z-30 rounded-xl overflow-hidden shadow-xl"
                style={{ minWidth: 180, background: "#0f172a", border: "1px solid #1e293b" }}>
                {Object.entries(LIFECYCLE_CONFIG).map(([k, v]) => (
                  <button key={k}
                    onClick={() => bulk_doi_trang_thai(k as LifecycleStatus)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs hover:bg-slate-800/60 transition-colors"
                    style={{ color: v.mau }}>
                    {v.nhan}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => setXoaHangLoat(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
            style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
            <Trash2 size={12} /> Xóa {selected_ids.length} sản phẩm
          </button>
          <button onClick={() => setSelectedIds([])}
            className="text-xs" style={{ color: "#475569" }}>
            Bỏ chọn
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>

        {/* Table header */}
        <div className="grid items-center px-6 py-2.5 text-[10px] font-black uppercase sticky top-0 z-10"
          style={{
            gridTemplateColumns: "40px 48px 1fr 100px 120px 80px 60px",
            background: "#0a1628", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <div>
            <input type="checkbox"
              checked={selected_ids.length === products.length && products.length > 0}
              onChange={toggle_select_all}
              className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
          </div>
          <span>Ảnh</span>
          <span>Sản phẩm</span>
          <span>Mùa vụ</span>
          <span>Trạng thái</span>
          <span className="text-center">SKU</span>
          <span></span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm" style={{ color: "#475569" }}>Đang tải...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Package size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Không có sản phẩm nào</p>
            {co_filter && (
              <button onClick={clear_filter}
                className="mt-3 text-xs" style={{ color: "#38bdf8" }}>
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : products.map(p => {
          const is_selected = selected_ids.includes(p.product_id);
          const season      = seasons.find(s => s.season_id === p.season_id);
          return (
            <div key={p.product_id}
              className="grid items-center px-6 py-3 transition-all group cursor-pointer"
              style={{
                gridTemplateColumns: "40px 48px 1fr 100px 120px 80px 60px",
                borderBottom: "1px solid #0f172a",
                background: is_selected ? "#0c435410" : "transparent",
              }}
              onClick={() => navigate(`/manage/danh-muc/san-pham/${p.product_id}`)}>

              {/* Checkbox */}
              <div onClick={e => { e.stopPropagation(); toggle_select(p.product_id); }}>
                <input type="checkbox" checked={is_selected} onChange={() => {}}
                  className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
              </div>

              {/* Ảnh */}
              <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0"
                style={{ background: "#1e293b" }}>
                {p.skus?.[0]?.image_url ? (
                  <img src={p.skus[0].image_url} alt={p.name}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={14} style={{ color: "#334155" }} />
                  </div>
                )}
              </div>

              {/* Tên + mã */}
              <div className="min-w-0 pr-4">
                <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <code className="text-[10px]" style={{ color: "#475569" }}>{p.product_code}</code>
                  {p.is_visible_web ? (
                    <div className="flex items-center gap-1">
                      <Globe size={9} style={{ color: "#10b981" }} />
                      <span className="text-[9px]" style={{ color: "#10b981" }}>Web</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <EyeOff size={9} style={{ color: "#334155" }} />
                      <span className="text-[9px]" style={{ color: "#334155" }}>Ẩn</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mùa vụ */}
              <div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  {season?.season_code ?? "—"}
                </span>
              </div>

              {/* Trạng thái */}
              <div>
                <LifecycleBadge status={p.lifecycle_status} />
              </div>

              {/* SKU count với hover popup */}
              <div className="flex justify-center"
                onClick={e => e.stopPropagation()}>
                <SkuCountCell product={p} colors={MOCK_COLORS} />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => navigate(`/manage/danh-muc/san-pham/${p.product_id}`)}
                  className="p-1.5 rounded-lg transition-all hover:bg-slate-700"
                  style={{ color: "#64748b" }}>
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setConfirmXoa(p.product_id)}
                  className="p-1.5 rounded-lg transition-all hover:bg-red-900/20"
                  style={{ color: "#475569" }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal lưu bộ lọc ── */}
      {show_save_modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,8,23,0.8)" }}
          onClick={() => setShowSaveModal(false)}>
          <div className="rounded-2xl p-6 w-80"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-black text-white mb-1">Lưu bộ lọc</h3>
            <p className="text-[11px] mb-4" style={{ color: "#475569" }}>
              Đặt tên để tái sử dụng bộ lọc này
            </p>
            <input value={save_name} onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && save_filter()}
              placeholder="VD: Áo SS24 đang bán..."
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none mb-3"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <div className="flex gap-2">
              <button onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Huỷ
              </button>
              <button onClick={save_filter} disabled={!save_name.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-black disabled:opacity-40"
                style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm xóa 1 sản phẩm ── */}
      {confirm_xoa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,8,23,0.8)" }}
          onClick={() => setConfirmXoa(null)}>
          <div className="rounded-2xl p-6 w-96"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#7f1d1d20" }}>
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Xác nhận xóa</h3>
                <p className="text-[11px]" style={{ color: "#475569" }}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-xs mb-5" style={{ color: "#64748b" }}>
              Sản phẩm và toàn bộ SKU sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmXoa(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Huỷ
              </button>
              <button onClick={() => handle_xoa(confirm_xoa)}
                className="flex-1 py-2.5 rounded-xl text-sm font-black"
                style={{ background: "#7f1d1d", color: "#fca5a5", border: "1px solid #ef444440" }}>
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm xóa hàng loạt ── */}
      {xoa_hang_loat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,8,23,0.8)" }}
          onClick={() => setXoaHangLoat(false)}>
          <div className="rounded-2xl p-6 w-96"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#7f1d1d20" }}>
                <Trash2 size={18} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Xóa {selected_ids.length} sản phẩm</h3>
                <p className="text-[11px]" style={{ color: "#475569" }}>Hành động này không thể hoàn tác</p>
              </div>
            </div>
            <p className="text-xs mb-5" style={{ color: "#64748b" }}>
              Toàn bộ SKU của {selected_ids.length} sản phẩm này sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setXoaHangLoat(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Huỷ
              </button>
              <button onClick={handle_xoa_hang_loat}
                className="flex-1 py-2.5 rounded-xl text-sm font-black"
                style={{ background: "#7f1d1d", color: "#fca5a5", border: "1px solid #ef444440" }}>
                Xóa tất cả
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}