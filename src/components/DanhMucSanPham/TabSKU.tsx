// ─────────────────────────────────────────────────────────────────────────────
// TabSKU.tsx — Tab 2: Ma trận SKU & Giá (tách riêng cho gọn)
// Group theo màu, upload ảnh per màu, inline edit, bulk apply
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef } from "react";
import { Plus, Save, Trash2, Upload, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import type { ProductSKU, Color, Size } from "./catalogTypes";
import { genSkuCode } from "./catalogService";

function gen_id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Modal thêm nhanh màu/size ────────────────────────────────────────────────

function ModalThemNhanh({
  loai,
  onSave,
  onClose,
}: {
  loai:    "color" | "size";
  onSave:  (item: Partial<Color> | Partial<Size>) => void;
  onClose: () => void;
}) {
  const [ten,        setTen]        = useState("");
  const [code,       setCode]       = useState("");
  const [hex,        setHex]        = useState("#000000");
  const [sort_order, setSortOrder]  = useState(99);

  const handle_save = () => {
    if (!ten.trim() || !code.trim()) return;
    if (loai === "color") {
      onSave({
        color_id:   gen_id(),
        color_code: code.toUpperCase(),
        color_name: ten,
        hex_code:   hex,
      } as Color);
    } else {
      onSave({
        size_id:    gen_id(),
        size_code:  code.toUpperCase(),
        sort_order,
      } as Size);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.8)" }}
      onClick={onClose}>
      <div className="rounded-2xl p-6 w-80"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        onClick={e => e.stopPropagation()}>
        <h3 className="text-sm font-black text-white mb-4">
          {loai === "color" ? "Thêm màu sắc mới" : "Thêm size mới"}
        </h3>

        <div className="space-y-3">
          {/* Tên */}
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block" style={{ color: "#475569" }}>
              {loai === "color" ? "Tên màu *" : "Tên size *"}
            </label>
            <input value={ten} onChange={e => setTen(e.target.value)}
              placeholder={loai === "color" ? "VD: Xanh rêu" : "VD: XXL"}
              autoFocus
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>

          {/* Code */}
          <div>
            <label className="text-[10px] font-black uppercase mb-1 block" style={{ color: "#475569" }}>
              {loai === "color" ? "Mã màu *" : "Mã size *"}
            </label>
            <input value={code} onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder={loai === "color" ? "VD: GRN" : "VD: XXL"}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>

          {/* Hex — chỉ cho color */}
          {loai === "color" && (
            <div>
              <label className="text-[10px] font-black uppercase mb-1 block" style={{ color: "#475569" }}>
                Mã màu hiển thị
              </label>
              <div className="flex items-center gap-2">
                <input type="color" value={hex}
                  onChange={e => setHex(e.target.value)}
                  className="w-10 h-10 rounded-xl cursor-pointer border-0 p-0.5"
                  style={{ background: "#1e293b" }} />
                <input value={hex} onChange={e => setHex(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <div className="w-8 h-8 rounded-lg border border-white/10 flex-shrink-0"
                  style={{ background: hex }} />
              </div>
            </div>
          )}

          {/* Sort order — chỉ cho size */}
          {loai === "size" && (
            <div>
              <label className="text-[10px] font-black uppercase mb-1 block" style={{ color: "#475569" }}>
                Thứ tự sắp xếp
              </label>
              <input type="number" value={sort_order}
                onChange={e => setSortOrder(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Huỷ
          </button>
          <button onClick={handle_save} disabled={!ten.trim() || !code.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
            style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            Thêm
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Upload ảnh cho 1 màu ─────────────────────────────────────────────────────

function ColorImageUpload({ color, image_url, onChange }: {
  color:     Color;
  image_url: string;
  onChange:  (url: string) => void;
}) {
  const input_ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle_file = (file: File) => {
    const url = URL.createObjectURL(file);
    onChange(url);
  };

  return (
    <div
      onClick={() => input_ref.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => {
        e.preventDefault(); setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handle_file(file);
      }}
      className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden transition-all"
      style={{
        width: 72, height: 72,
        border: `2px dashed ${dragging ? "#38bdf8" : "#334155"}`,
        background: dragging ? "#0c435415" : "#1e293b",
      }}>
      {image_url ? (
        <>
          <img src={image_url} alt={color.color_name}
            className="w-full h-full object-cover" />
          <button
            onClick={e => { e.stopPropagation(); onChange(""); }}
            className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: "#0f172a" }}>
            <X size={9} style={{ color: "#ef4444" }} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <Upload size={14} style={{ color: dragging ? "#38bdf8" : "#475569" }} />
          <p className="text-[8px] text-center px-1" style={{ color: "#475569" }}>Ảnh màu</p>
        </div>
      )}
      <input ref={input_ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle_file(f); }} />
    </div>
  );
}

// ─── Group SKU theo màu ───────────────────────────────────────────────────────

function ColorGroup({ color, skus, sizes, onUpdate, onDelete, onImageChange }: {
  color:         Color;
  skus:          ProductSKU[];
  sizes:         Size[];
  onUpdate:      (sku_id: string, field: keyof ProductSKU, val: unknown) => void;
  onDelete:      (sku_id: string) => void;
  onImageChange: (color_id: string, url: string) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const image_url = skus[0]?.image_url ?? "";

  const sorted_skus = [...skus].sort((a, b) => {
    const sa = sizes.find(s => s.size_id === a.size_id)?.sort_order ?? 0;
    const sb = sizes.find(s => s.size_id === b.size_id)?.sort_order ?? 0;
    return sa - sb;
  });

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${color.hex_code}30` }}>

      {/* Group header */}
      <div className="flex items-center gap-3 px-4 py-3"
        style={{ background: color.hex_code + "10" }}>
        {/* Ảnh upload */}
        <ColorImageUpload
          color={color}
          image_url={image_url}
          onChange={url => onImageChange(color.color_id, url)}
        />

        {/* Màu info */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
            style={{ background: color.hex_code }} />
          <p className="text-sm font-black" style={{ color: color.hex_code }}>
            {color.color_name}
          </p>
          <code className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "#1e293b", color: "#475569" }}>
            {color.color_code}
          </code>
          <span className="text-[10px]" style={{ color: "#334155" }}>
            {skus.length} size
          </span>
        </div>

        {/* Toggle collapse */}
        <button onClick={() => setCollapsed(v => !v)}
          className="p-1.5 rounded-lg transition-all"
          style={{ color: "#475569" }}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* SKU rows */}
      {!collapsed && (
        <>
          {/* Table header */}
          <div className="grid px-4 py-2 text-[9px] font-black uppercase"
            style={{
              gridTemplateColumns: "60px 1fr 80px 100px 100px 100px 80px 32px",
              background: "#0a1628", color: "#334155",
              borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b",
            }}>
            <span>Size</span>
            <span>Barcode</span>
            <span className="text-center">Cân (g)</span>
            <span className="text-center">Giá vốn</span>
            <span className="text-center">Giá niêm yết</span>
            <span className="text-center">Giá bán</span>
            <span className="text-center">Trạng thái</span>
            <span></span>
          </div>

          {sorted_skus.map((sku, i) => {
            const size = sizes.find(s => s.size_id === sku.size_id);
            return (
              <div key={sku.sku_id}
                className="grid items-center px-4 py-2 gap-2"
                style={{
                  gridTemplateColumns: "60px 1fr 80px 100px 100px 100px 80px 32px",
                  borderBottom: i < sorted_skus.length - 1 ? "1px solid #0f172a" : "none",
                  background: sku.status === "inactive" ? "#0f172a80" : "transparent",
                }}>

                {/* Size badge */}
                <span className="px-2 py-1 rounded-lg text-xs font-black text-center"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  {size?.size_code ?? "?"}
                </span>

                {/* Barcode */}
                <input value={sku.barcode}
                  onChange={e => onUpdate(sku.sku_id, "barcode", e.target.value)}
                  placeholder="8938500..."
                  className="w-full px-2 py-1.5 rounded-lg text-[11px] font-mono outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }} />

                {/* Inline edit: cân, giá vốn, niêm yết, bán */}
                {[
                  { field: "weight",        color: "#64748b" },
                  { field: "cost_price",    color: "#f59e0b" },
                  { field: "regular_price", color: "#94a3b8" },
                  { field: "sale_price",    color: "#10b981" },
                ].map(({ field, color: mau }) => (
                  <input key={field} type="number"
                    value={(sku as any)[field]}
                    onChange={e => onUpdate(sku.sku_id, field as keyof ProductSKU, Number(e.target.value))}
                    className="w-full text-center text-xs font-bold outline-none rounded-lg py-1.5 px-1"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: mau }} />
                ))}

                {/* Status */}
                <button onClick={() => onUpdate(sku.sku_id, "status", sku.status === "active" ? "inactive" : "active")}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
                  style={{
                    background: sku.status === "active" ? "#06472520" : "#1e293b",
                    color:      sku.status === "active" ? "#10b981"   : "#475569",
                  }}>
                  {sku.status === "active" ? "Active" : "Off"}
                </button>

                {/* Xóa */}
                <button onClick={() => onDelete(sku.sku_id)}
                  className="flex items-center justify-center w-6 h-6 rounded-lg hover:bg-red-900/20 transition-all"
                  style={{ color: "#334155" }}>
                  <Trash2 size={11} />
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ─── TabSKU Main ─────────────────────────────────────────────────────────────

export default function TabSKU({ product_id, product_code, skus, onSave, colors: initial_colors, sizes: initial_sizes }: {
  product_id:   string;
  product_code: string;
  skus:         ProductSKU[];
  onSave:       (skus: ProductSKU[]) => void;
  colors:       Color[];
  sizes:        Size[];
}) {
  const [local_skus,   setLocalSkus]   = useState<ProductSKU[]>(skus);
  const [colors,       setColors]      = useState<Color[]>(initial_colors);
  const [sizes,        setSizes]       = useState<Size[]>(initial_sizes);
  const [sel_colors,   setSelColors]   = useState<string[]>([]);
  const [sel_sizes,    setSelSizes]    = useState<string[]>([]);
  const [modal_them,   setModalThem]   = useState<"color" | "size" | null>(null);
  const [bulk, setBulk] = useState({ cost_price: "", regular_price: "", sale_price: "", weight: "" });

  // Group SKU theo màu
  const mau_co_trong_skus = [...new Set(local_skus.map(s => s.color_id))];
  const colors_co_sku     = mau_co_trong_skus
    .map(id => colors.find(c => c.color_id === id))
    .filter(Boolean) as Color[];

  const toggle_color = (id: string) =>
    setSelColors(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const toggle_size = (id: string) =>
    setSelSizes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  // Thêm màu/size mới từ modal
  const them_mau = (item: Partial<Color>) => {
    setColors(prev => [...prev, item as Color]);
  };
  const them_size = (item: Partial<Size>) => {
    setSizes(prev => [...prev, item as Size].sort((a, b) => a.sort_order - b.sort_order));
  };

  // Tạo ma trận — chỉ thêm, không replace
  const tao_ma_tran = () => {
    if (!sel_colors.length || !sel_sizes.length) return;
    const them_moi: ProductSKU[] = [];

    sel_colors.forEach(color_id => {
      sel_sizes.forEach(size_id => {
        const da_co = local_skus.find(s => s.color_id === color_id && s.size_id === size_id);
        if (da_co) return;

        const color = colors.find(c => c.color_id === color_id)!;
        const size  = sizes.find(s => s.size_id === size_id)!;
        them_moi.push({
          sku_id:        gen_id(),
          product_id,
          sku_code:      genSkuCode(product_code, color.color_code, size.size_code),
          barcode:       "",
          color_id, size_id,
          weight:        0,
          image_url:     "",
          cost_price:    0,
          regular_price: 0,
          sale_price:    0,
          status:        "active",
          color, size,
        });
      });
    });

    setLocalSkus(prev => [...prev, ...them_moi]);
  };

  const so_them_moi = sel_colors.reduce((total, color_id) =>
    total + sel_sizes.filter(size_id =>
      !local_skus.find(s => s.color_id === color_id && s.size_id === size_id)
    ).length, 0
  );

  // Bulk apply
  const apply_bulk = () => {
    setLocalSkus(prev => prev.map(s => ({
      ...s,
      ...(bulk.cost_price    ? { cost_price:    Number(bulk.cost_price)    } : {}),
      ...(bulk.regular_price ? { regular_price: Number(bulk.regular_price) } : {}),
      ...(bulk.sale_price    ? { sale_price:    Number(bulk.sale_price)    } : {}),
      ...(bulk.weight        ? { weight:        Number(bulk.weight)        } : {}),
    })));
  };

  const update_sku = (sku_id: string, field: keyof ProductSKU, val: unknown) =>
    setLocalSkus(prev => prev.map(s => s.sku_id === sku_id ? { ...s, [field]: val } : s));

  const delete_sku = (sku_id: string) =>
    setLocalSkus(prev => prev.filter(s => s.sku_id !== sku_id));

  // Cập nhật ảnh cho toàn bộ SKU cùng màu
  const update_color_image = (color_id: string, url: string) => {
    setLocalSkus(prev => prev.map(s =>
      s.color_id === color_id ? { ...s, image_url: url } : s
    ));
  };

  const sorted_sizes = [...sizes].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">

      {/* ── Bước 1: Chọn màu & size ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>

        {/* Màu sắc */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
              Chọn màu sắc
            </p>
            <button onClick={() => setModalThem("color")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              <Plus size={10} /> Thêm màu
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {colors.map(c => {
              const is_sel = sel_colors.includes(c.color_id);
              return (
                <button key={c.color_id} onClick={() => toggle_color(c.color_id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background: is_sel ? c.hex_code + "25" : "#1e293b",
                    border:     `1px solid ${is_sel ? c.hex_code : "#334155"}`,
                    color:      is_sel ? c.hex_code : "#64748b",
                  }}>
                  <div className="w-3 h-3 rounded-full border border-white/10 flex-shrink-0"
                    style={{ background: c.hex_code }} />
                  {c.color_name}
                  {is_sel && <Check size={10} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Size */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
              Chọn size
            </p>
            <button onClick={() => setModalThem("size")}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              <Plus size={10} /> Thêm size
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {sorted_sizes.map(s => {
              const is_sel = sel_sizes.includes(s.size_id);
              return (
                <button key={s.size_id} onClick={() => toggle_size(s.size_id)}
                  className="px-4 py-1.5 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: is_sel ? "#0c435425" : "#1e293b",
                    color:      is_sel ? "#38bdf8"   : "#64748b",
                    border:     `1px solid ${is_sel ? "#38bdf840" : "#334155"}`,
                  }}>
                  {s.size_code}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Nút tạo ma trận ── */}
      <button onClick={tao_ma_tran}
        disabled={!sel_colors.length || !sel_sizes.length || so_them_moi === 0}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
        style={{ background: "#4c1d9520", color: "#a78bfa", border: "1px solid #a78bfa40" }}>
        <Plus size={15} />
        {so_them_moi > 0
          ? `Thêm ${so_them_moi} SKU mới`
          : sel_colors.length && sel_sizes.length
          ? "Tổ hợp đã tồn tại"
          : "Chọn màu & size để tạo SKU"}
      </button>

      {/* ── Bulk apply ── */}
      {local_skus.length > 0 && (
        <div className="px-4 py-3 rounded-xl space-y-3"
          style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
          <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
            Áp dụng hàng loạt cho tất cả SKU
          </p>
          <div className="flex gap-2 flex-wrap">
            {[
              { field: "cost_price",    label: "Giá vốn",      mau: "#f59e0b" },
              { field: "regular_price", label: "Giá niêm yết", mau: "#94a3b8" },
              { field: "sale_price",    label: "Giá bán",      mau: "#10b981" },
              { field: "weight",        label: "Cân nặng (g)", mau: "#64748b" },
            ].map(({ field, label, mau }) => (
              <input key={field}
                value={bulk[field as keyof typeof bulk]}
                onChange={e => setBulk(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={label}
                type="number"
                className="px-3 py-2 rounded-xl text-xs outline-none flex-1 min-w-[100px]"
                style={{ background: "#1e293b", border: `1px solid ${mau}30`, color: mau }} />
            ))}
            <button onClick={apply_bulk}
              className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
              style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              Áp dụng tất cả
            </button>
          </div>
        </div>
      )}

      {/* ── Groups theo màu ── */}
      {colors_co_sku.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
              {local_skus.length} SKU · {colors_co_sku.length} màu
            </p>
            <button onClick={() => onSave(local_skus)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
              <Save size={13} /> Lưu SKU
            </button>
          </div>

          {colors_co_sku.map(color => (
            <ColorGroup
              key={color.color_id}
              color={color}
              skus={local_skus.filter(s => s.color_id === color.color_id)}
              sizes={sizes}
              onUpdate={update_sku}
              onDelete={delete_sku}
              onImageChange={update_color_image}
            />
          ))}
        </div>
      )}

      {/* ── Modal thêm màu/size ── */}
      {modal_them && (
        <ModalThemNhanh
          loai={modal_them}
          onSave={modal_them === "color" ? them_mau : them_size}
          onClose={() => setModalThem(null)}
        />
      )}
    </div>
  );
}