// ─────────────────────────────────────────────────────────────────────────────
// ProductDetail.tsx — Màn hình 2: Chi tiết / Tạo mới sản phẩm
// Tab 1: Thông tin chung | Tab 2: Ma trận SKU | Tab 3: Tài liệu
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Save,
  X,
  ChevronLeft,
  History,
  AlertCircle,
  CheckCircle,
  Clock,
  Globe,
  EyeOff,
  Trash2,
  Package,
  FileText,
  ChevronRight,
} from "lucide-react";
import type {
  Product,
  Category,
  Season,
  Color,
  Size,
  AuditLog,
  ProductAttachment,
  LifecycleStatus,
  Gender,
  Vendor,
} from "../../../components/DanhMucSanPham/catalogTypes";
import {
  LIFECYCLE_CONFIG,
  GENDER_CONFIG,
  DOCUMENT_TYPE_CONFIG,
} from "../../../components/DanhMucSanPham/catalogTypes";
import {
  laySanPhamById,
  taoSanPham,
  capNhatSanPham,
  layDanhSachCategory,
  layDanhSachSeason,
  layDanhSachColor,
  layDanhSachSize,
  layDanhSachVendor,
  layAuditLog,
  layTaiLieuTheoSanPham,
  capNhatTaiLieu,
  capNhatSkus,
  kiemTraTrungMa,
} from "../../../components/DanhMucSanPham/catalogService";
import TabSKU from "../../../components/DanhMucSanPham/TabSKU";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gen_id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dinh_dang_tien(so: number) {
  return so.toLocaleString("vi-VN");
}

const EMPTY_PRODUCT: Omit<Product, "product_id" | "created_at" | "updated_at"> =
  {
    product_code: "",
    name: "",
    category_id: "",
    season_id: "",
    vendor_id: "",
    gender: "unisex",
    material: "",
    description: "",
    tax_rate: 10,
    lifecycle_status: "draft",
    is_visible_web: false,
    sku_count: 0,
    skus: [],
  };

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({
  tt,
  config,
}: {
  tt: string;
  config: Record<string, { nhan: string; mau: string; nen: string }>;
}) {
  const c = config[tt] ?? { nhan: tt, mau: "#475569", nen: "#1e293b" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{
        background: c.nen,
        color: c.mau,
        border: `1px solid ${c.mau}30`,
      }}
    >
      {c.nhan}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  msg,
  type,
  onClose,
}: {
  msg: string;
  type: "ok" | "err";
  onClose: () => void;
}) {
  const mau = type === "ok" ? "#10b981" : "#ef4444";
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}
    >
      {type === "ok" ? (
        <CheckCircle size={14} style={{ color: mau }} />
      ) : (
        <AlertCircle size={14} style={{ color: mau }} />
      )}
      <p className="text-sm font-bold" style={{ color: mau }}>
        {msg}
      </p>
      <button onClick={onClose} style={{ color: "#475569" }}>
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Tab 1: Thông tin chung ───────────────────────────────────────────────────

function TabThongTin({
  product,
  onChange,
  categories,
  seasons,
  vendors,
  ma_trung,
}: {
  product: Partial<Product>;
  onChange: (field: keyof Product, val: unknown) => void;
  categories: Category[];
  seasons: Season[];
  vendors: Vendor[];
  ma_trung: boolean;
}) {
  const InputStyle = {
    background: "#1e293b",
    border: "1px solid #334155",
    color: "white",
  };
  const LabelStyle = { color: "#475569" };

  const cat_cha = categories.filter((c) => !c.parent_id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cat_con = categories.filter(
    (c) =>
      c.parent_id ===
      cat_cha.find(
        (p) =>
          categories.find((ch) => ch.category_id === product.category_id)
            ?.parent_id === p.category_id ||
          p.category_id === product.category_id,
      )?.category_id,
  );

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
      {/* ── Cột trái: Thông tin cơ bản ── */}
      <div className="space-y-4">
        <p
          className="text-[10px] font-black uppercase"
          style={{ color: "#475569" }}
        >
          Thông tin cơ bản
        </p>

        {/* Tên sản phẩm */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Tên sản phẩm *
          </label>
          <input
            value={product.name ?? ""}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="VD: Áo Thun Basic Oversize"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={InputStyle}
          />
        </div>

        {/* Mã sản phẩm */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Mã sản phẩm *
          </label>
          <div className="relative">
            <input
              value={product.product_code ?? ""}
              onChange={(e) =>
                onChange("product_code", e.target.value.toUpperCase())
              }
              placeholder="VD: ATS-SS24-001"
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
              style={{
                ...InputStyle,
                border: ma_trung ? "1px solid #ef4444" : "1px solid #334155",
              }}
            />
            {ma_trung && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle size={11} style={{ color: "#ef4444" }} />
                <p className="text-[10px]" style={{ color: "#ef4444" }}>
                  Mã này đã tồn tại trong hệ thống
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Danh mục */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Danh mục *
          </label>
          <select
            value={product.category_id ?? ""}
            onChange={(e) => onChange("category_id", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={InputStyle}
          >
            <option value="">-- Chọn danh mục --</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.parent_id ? `  └ ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mùa vụ */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Mùa vụ *
          </label>
          <select
            value={product.season_id ?? ""}
            onChange={(e) => onChange("season_id", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={InputStyle}
          >
            <option value="">-- Chọn mùa vụ --</option>
            {seasons.map((s) => (
              <option key={s.season_id} value={s.season_id}>
                {s.season_name}
              </option>
            ))}
          </select>
        </div>

        {/* Nhà cung cấp */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Nhà cung cấp / Xưởng
          </label>
          <select
            value={product.vendor_id ?? ""}
            onChange={(e) => onChange("vendor_id", e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={InputStyle}
          >
            <option value="">-- Chọn nhà cung cấp --</option>
            {vendors.map((v) => (
              <option key={v.vendor_id} value={v.vendor_id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Đối tượng */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Đối tượng
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(GENDER_CONFIG) as [Gender, string][]).map(
              ([key, label]) => (
                <button
                  key={key}
                  onClick={() => onChange("gender", key)}
                  className="py-2 rounded-xl text-xs font-bold transition-all"
                  style={{
                    background:
                      product.gender === key ? "#0c435425" : "#1e293b",
                    color: product.gender === key ? "#38bdf8" : "#64748b",
                    border: `1px solid ${product.gender === key ? "#38bdf840" : "#334155"}`,
                  }}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Chất liệu */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Chất liệu
          </label>
          <input
            value={product.material ?? ""}
            onChange={(e) => onChange("material", e.target.value)}
            placeholder="VD: 100% Cotton Compact"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={InputStyle}
          />
        </div>
      </div>

      {/* ── Cột phải: Cấu hình ── */}
      <div className="space-y-4">
        <p
          className="text-[10px] font-black uppercase"
          style={{ color: "#475569" }}
        >
          Cấu hình & Trạng thái
        </p>

        {/* Lifecycle status */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Trạng thái vòng đời
          </label>
          <div className="space-y-1.5">
            {  // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (Object.entries(LIFECYCLE_CONFIG) as [LifecycleStatus, any][]).map(
              ([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => onChange("lifecycle_status", key)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all"
                  style={{
                    background:
                      product.lifecycle_status === key ? cfg.nen : "#1e293b",
                    border: `1px solid ${product.lifecycle_status === key ? cfg.mau + "40" : "#334155"}`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cfg.mau }}
                  />
                  <span
                    className="text-xs font-bold flex-1"
                    style={{
                      color:
                        product.lifecycle_status === key ? cfg.mau : "#64748b",
                    }}
                  >
                    {cfg.nhan}
                  </span>
                  {product.lifecycle_status === key && (
                    <CheckCircle size={12} style={{ color: cfg.mau }} />
                  )}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Hiển thị web */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Hiển thị web bán hàng
          </label>
          <button
            onClick={() => onChange("is_visible_web", !product.is_visible_web)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
            style={{
              background: product.is_visible_web ? "#06472520" : "#1e293b",
              border: `1px solid ${product.is_visible_web ? "#10b98140" : "#334155"}`,
            }}
          >
            {product.is_visible_web ? (
              <Globe size={15} style={{ color: "#10b981" }} />
            ) : (
              <EyeOff size={15} style={{ color: "#475569" }} />
            )}
            <div className="flex-1">
              <p
                className="text-sm font-bold"
                style={{
                  color: product.is_visible_web ? "#10b981" : "#64748b",
                }}
              >
                {product.is_visible_web ? "Đang hiển thị" : "Đang ẩn"}
              </p>
              <p className="text-[10px]" style={{ color: "#334155" }}>
                {product.is_visible_web
                  ? "Khách hàng có thể thấy sản phẩm này"
                  : "Chỉ nội bộ mới thấy"}
              </p>
            </div>
            <div
              className={`w-10 h-5 rounded-full transition-all relative ${product.is_visible_web ? "bg-green-500" : "bg-slate-700"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${product.is_visible_web ? "left-5" : "left-0.5"}`}
              />
            </div>
          </button>
        </div>

        {/* Thuế VAT */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Thuế VAT (%)
          </label>
          <div className="flex gap-2">
            {[0, 5, 8, 10].map((rate) => (
              <button
                key={rate}
                onClick={() => onChange("tax_rate", rate)}
                className="flex-1 py-2 rounded-xl text-sm font-black transition-all"
                style={{
                  background:
                    product.tax_rate === rate ? "#0c435425" : "#1e293b",
                  color: product.tax_rate === rate ? "#38bdf8" : "#64748b",
                  border: `1px solid ${product.tax_rate === rate ? "#38bdf840" : "#334155"}`,
                }}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        {/* Mô tả — simplified rich text */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={LabelStyle}
          >
            Mô tả sản phẩm
          </label>
          <textarea
            value={product.description ?? ""}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="Mô tả chi tiết về sản phẩm..."
            rows={5}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={InputStyle}
          />
          <p className="text-[10px] mt-1" style={{ color: "#334155" }}>
            * Rich text editor sẽ được tích hợp khi có backend
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Ma trận SKU ───────────────────────────────────────────────────────

// function TabSKU({
//   product_id,
//   product_code,
//   skus,
//   onSave,
//   colors,
//   sizes,
// }: {
//   product_id: string;
//   product_code: string;
//   skus: ProductSKU[];
//   onSave: (skus: ProductSKU[]) => void;
//   colors: Color[];
//   sizes: Size[];
// }) {
//   const [local_skus, setLocalSkus] = useState<ProductSKU[]>(skus);
//   const [sel_colors, setSelColors] = useState<string[]>([]);
//   const [sel_sizes, setSelSizes] = useState<string[]>([]);
//   const [bulk, setBulk] = useState({
//     cost_price: "",
//     regular_price: "",
//     sale_price: "",
//     weight: "",
//   });

//   const toggle_color = (id: string) =>
//     setSelColors((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );

//   const toggle_size = (id: string) =>
//     setSelSizes((prev) =>
//       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
//     );

//   // const tao_ma_tran = () => {
//   //   if (!sel_colors.length || !sel_sizes.length) return;
//   //   const new_skus: ProductSKU[] = [];
//   //   sel_colors.forEach(color_id => {
//   //     sel_sizes.forEach(size_id => {
//   //       const color = colors.find(c => c.color_id === color_id)!;
//   //       const size  = sizes.find(s => s.size_id === size_id)!;
//   //       // Giữ lại SKU cũ nếu đã có
//   //       const existing = local_skus.find(s => s.color_id === color_id && s.size_id === size_id);
//   //       if (existing) { new_skus.push(existing); return; }
//   //       new_skus.push({
//   //         sku_id:        gen_id(),
//   //         product_id,
//   //         sku_code:      genSkuCode(product_code, color.color_code, size.size_code),
//   //         barcode:       "",
//   //         color_id, size_id,
//   //         weight:        0,
//   //         image_url:     "",
//   //         cost_price:    0,
//   //         regular_price: 0,
//   //         sale_price:    0,
//   //         status:        "active",
//   //         color, size,
//   //       });
//   //     });
//   //   });
//   //   setLocalSkus(new_skus);
//   // };

//   const tao_ma_tran = () => {
//     if (!sel_colors.length || !sel_sizes.length) return;
//     const skus_them_moi: ProductSKU[] = [];

//     sel_colors.forEach((color_id) => {
//       sel_sizes.forEach((size_id) => {
//         // Nếu tổ hợp này đã có → bỏ qua, không tạo lại
//         const da_co = local_skus.find(
//           (s) => s.color_id === color_id && s.size_id === size_id,
//         );
//         if (da_co) return;

//         const color = colors.find((c) => c.color_id === color_id)!;
//         const size = sizes.find((s) => s.size_id === size_id)!;
//         skus_them_moi.push({
//           sku_id: gen_id(),
//           product_id,
//           sku_code: genSkuCode(product_code, color.color_code, size.size_code),
//           barcode: "",
//           color_id,
//           size_id,
//           weight: 0,
//           image_url: "",
//           cost_price: 0,
//           regular_price: 0,
//           sale_price: 0,
//           status: "active",
//           color,
//           size,
//         });
//       });
//     });

//     // Chèn thêm vào list hiện tại thay vì replace
//     setLocalSkus((prev) => [...prev, ...skus_them_moi]);
//   };
//   const apply_bulk = () => {
//     setLocalSkus((prev) =>
//       prev.map((s) => ({
//         ...s,
//         ...(bulk.cost_price
//           ? { cost_price: Number(bulk.cost_price.replace(/\D/g, "")) }
//           : {}),
//         ...(bulk.regular_price
//           ? { regular_price: Number(bulk.regular_price.replace(/\D/g, "")) }
//           : {}),
//         ...(bulk.sale_price
//           ? { sale_price: Number(bulk.sale_price.replace(/\D/g, "")) }
//           : {}),
//         ...(bulk.weight ? { weight: Number(bulk.weight) } : {}),
//       })),
//     );
//   };

//   const update_sku = (
//     sku_id: string,
//     field: keyof ProductSKU,
//     val: unknown,
//   ) => {
//     setLocalSkus((prev) =>
//       prev.map((s) => (s.sku_id === sku_id ? { ...s, [field]: val } : s)),
//     );
//   };

//   const xoa_sku = (sku_id: string) =>
//     setLocalSkus((prev) => prev.filter((s) => s.sku_id !== sku_id));

//   const sorted_sizes = sizes.sort((a, b) => a.sort_order - b.sort_order);

//   return (
//     <div className="space-y-6">
//       {/* ── Bước 1: Chọn màu & size ── */}
//       <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
//         {/* Chọn màu */}
//         <div>
//           <p
//             className="text-[10px] font-black uppercase mb-3"
//             style={{ color: "#475569" }}
//           >
//             Bước 1 — Chọn màu sắc
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {colors.map((c) => {
//               const is_sel = sel_colors.includes(c.color_id);
//               return (
//                 <button
//                   key={c.color_id}
//                   onClick={() => toggle_color(c.color_id)}
//                   className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
//                   style={{
//                     background: is_sel ? c.hex_code + "25" : "#1e293b",
//                     border: `1px solid ${is_sel ? c.hex_code : "#334155"}`,
//                     color: is_sel ? c.hex_code : "#64748b",
//                   }}
//                 >
//                   <div
//                     className="w-3 h-3 rounded-full border border-white/10 flex-shrink-0"
//                     style={{ background: c.hex_code }}
//                   />
//                   {c.color_name}
//                   {is_sel && <CheckCircle size={11} />}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Chọn size */}
//         <div>
//           <p
//             className="text-[10px] font-black uppercase mb-3"
//             style={{ color: "#475569" }}
//           >
//             Bước 1 — Chọn size
//           </p>
//           <div className="flex flex-wrap gap-2">
//             {sorted_sizes.map((s) => {
//               const is_sel = sel_sizes.includes(s.size_id);
//               return (
//                 <button
//                   key={s.size_id}
//                   onClick={() => toggle_size(s.size_id)}
//                   className="px-4 py-1.5 rounded-xl text-xs font-black transition-all"
//                   style={{
//                     background: is_sel ? "#0c435425" : "#1e293b",
//                     color: is_sel ? "#38bdf8" : "#64748b",
//                     border: `1px solid ${is_sel ? "#38bdf840" : "#334155"}`,
//                   }}
//                 >
//                   {s.size_code}
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       </div>

//       {/* ── Bước 2: Nút tạo ma trận ── */}
//       <button
//         onClick={tao_ma_tran}
//         disabled={!sel_colors.length || !sel_sizes.length}
//         className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black disabled:opacity-40"
//         style={{
//           background: "#4c1d9520",
//           color: "#a78bfa",
//           border: "1px solid #a78bfa40",
//         }}
//       >
//         <Plus size={15} />
//         Thêm (
//         {sel_colors.length * sel_sizes.length -
//           local_skus.filter(
//             (s) =>
//               sel_colors.includes(s.color_id) && sel_sizes.includes(s.size_id),
//           ).length}{" "}
//         SKU)
//       </button>

//       {/* ── Bảng SKU ── */}
//       {local_skus.length > 0 && (
//         <div>
//           {/* Bulk apply */}
//           <div
//             className="px-4 py-3 rounded-xl mb-3 space-y-3"
//             style={{ background: "#0a1628", border: "1px solid #1e293b" }}
//           >
//             <p
//               className="text-[10px] font-black uppercase"
//               style={{ color: "#475569" }}
//             >
//               Áp dụng hàng loạt
//             </p>
//             <div
//               className="grid gap-3"
//               style={{ gridTemplateColumns: "1fr 1fr 1fr 80px auto" }}
//             >
//               {[
//                 { field: "cost_price", label: "Giá vốn" },
//                 { field: "regular_price", label: "Giá niêm yết" },
//                 { field: "sale_price", label: "Giá bán" },
//                 { field: "weight", label: "Cân (g)" },
//               ].map(({ field, label }) => (
//                 <input
//                   key={field}
//                   value={bulk[field as keyof typeof bulk]}
//                   onChange={(e) =>
//                     setBulk((prev) => ({ ...prev, [field]: e.target.value }))
//                   }
//                   placeholder={label}
//                   className="px-3 py-2 rounded-xl text-xs outline-none"
//                   style={{
//                     background: "#1e293b",
//                     border: "1px solid #334155",
//                     color: "white",
//                   }}
//                 />
//               ))}
//               <button
//                 onClick={apply_bulk}
//                 className="px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
//                 style={{
//                   background: "#0c435425",
//                   color: "#38bdf8",
//                   border: "1px solid #38bdf840",
//                 }}
//               >
//                 Áp dụng tất cả
//               </button>
//             </div>
//           </div>

//           {/* Table header */}
//           <div
//             className="grid px-4 py-2 text-[9px] font-black uppercase gap-2"
//             style={{
//               gridTemplateColumns: "120px 90px 100px 110px 110px 100px 50px",
//               background: "#0a1628",
//               color: "#334155",
//               borderRadius: "12px 12px 0 0",
//               borderBottom: "1px solid #1e293b",
//             }}
//           >
//             <span>Biến thể</span>
//             <span className="text-center">SKU</span>
//             <span className="text-center">Cân (g)</span>
//             <span className="text-center">Giá vốn</span>
//             <span className="text-center">Giá niêm yết</span>
//             <span className="text-center">Giá bán</span>
//             <span className="text-center">Trạng thái</span>
//             <span></span>
//           </div>

//           <div
//             className="rounded-b-xl overflow-hidden"
//             style={{ border: "1px solid #1e293b", borderTop: "none" }}
//           >
//             {local_skus.map((sku, i) => {
//               const color = colors.find((c) => c.color_id === sku.color_id);
//               const size = sizes.find((s) => s.size_id === sku.size_id);
//               return (
//                 <div
//                   key={sku.sku_id}
//                   className="grid items-center px-4 py-2 gap-2"
//                   style={{
//                     gridTemplateColumns:
//                       "120px 90px 100px 110px 110px 100px 50px",
//                     borderBottom:
//                       i < local_skus.length - 1 ? "1px solid #0f172a" : "none",
//                   }}
//                 >
//                   {/* SKU info */}
//                   <div className="flex items-center gap-2 min-w-0">
//                     {color && (
//                       <div
//                         className="w-3 h-3 rounded-full flex-shrink-0 border border-white/10"
//                         style={{ background: color.hex_code }}
//                       />
//                     )}
//                     <div className="min-w-0">
//                       <p className="text-[12px] font-bold text-white truncate">
//                         {color?.color_name} / {size?.size_code}
//                       </p>
//                       <code className="text-[9px]" style={{ color: "gray" }}>
//                         {/* #334155 */}
//                         {sku.sku_code}
//                       </code>
//                     </div>
//                   </div>

//                   {/* Barcode */}
//                   <input
//                     value={sku.barcode}
//                     onChange={(e) =>
//                       update_sku(sku.sku_id, "barcode", e.target.value)
//                     }
//                     placeholder="8938500..."
//                     className="w-full text-xs font-mono outline-none rounded-lg py-1.5 px-2"
//                     style={{
//                       background: "#1e293b",
//                       border: "1px solid #334155",
//                       color: "#94a3b8",
//                     }}
//                   />

//                   {/* Inline edit fields */}
//                   {[
//                     { field: "weight", type: "number" },
//                     { field: "cost_price", type: "number" },
//                     { field: "regular_price", type: "number" },
//                     { field: "sale_price", type: "number" },
//                   ].map(({ field, type }) => (
//                     <input
//                       key={field}
//                       type={type}
//                       value={(sku as any)[field]}
//                       onChange={(e) =>
//                         update_sku(
//                           sku.sku_id,
//                           field as keyof ProductSKU,
//                           Number(e.target.value),
//                         )
//                       }
//                       className="w-full text-center text-xs font-bold outline-none rounded-lg py-1.5 px-2"
//                       style={{
//                         background: "#1e293b",
//                         border: "1px solid #334155",
//                         color: "#10b981",
//                       }}
//                     />
//                   ))}

//                   {/* Status toggle */}
//                   <div className="flex justify-center">
//                     <button
//                       onClick={() =>
//                         update_sku(
//                           sku.sku_id,
//                           "status",
//                           sku.status === "active" ? "inactive" : "active",
//                         )
//                       }
//                       className="px-2 py-1 rounded-lg text-[9px] font-bold transition-all"
//                       style={{
//                         background:
//                           sku.status === "active" ? "#06472520" : "#1e293b",
//                         color: sku.status === "active" ? "#10b981" : "#475569",
//                       }}
//                     >
//                       {sku.status === "active" ? "Active" : "Inactive"}
//                     </button>
//                   </div>

//                   {/* Xóa */}
//                   <button
//                     onClick={() => xoa_sku(sku.sku_id)}
//                     className="flex items-center justify-center w-7 h-7 rounded-lg transition-all hover:bg-red-900/20"
//                     style={{ color: "#475569" }}
//                   >
//                     <Trash2 size={12} />
//                   </button>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Save SKU */}
//           <div className="flex justify-end mt-3">
//             <button
//               onClick={() => onSave(local_skus)}
//               className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
//               style={{
//                 background: "#06472520",
//                 color: "#10b981",
//                 border: "1px solid #10b98140",
//               }}
//             >
//               <Save size={14} /> Lưu {local_skus.length} SKU
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// ─── Tab 3: Tài liệu ─────────────────────────────────────────────────────────

function TabTaiLieu({
  product_id,
  attachments,
  onSave,
}: {
  product_id: string;
  attachments: ProductAttachment[];
  onSave: (atts: ProductAttachment[]) => void;
}) {
  const [local, setLocal] = useState<ProductAttachment[]>(attachments);
  const drop_ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle_drop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const new_atts: ProductAttachment[] = files.map((f, i) => ({
      attachment_id: gen_id(),
      product_id,
      file_name: f.name,
      file_url: URL.createObjectURL(f),
      document_type: "khac" as const,
      sort_order: local.length + i + 1,
      uploaded_at: new Date().toISOString(),
    }));
    setLocal((prev) => [...prev, ...new_atts]);
  };

  const update_type = (
    id: string,
    doc_type: ProductAttachment["document_type"],
  ) => {
    setLocal((prev) =>
      prev.map((a) =>
        a.attachment_id === id ? { ...a, document_type: doc_type } : a,
      ),
    );
  };

  const xoa = (id: string) =>
    setLocal((prev) => prev.filter((a) => a.attachment_id !== id));

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        ref={drop_ref}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handle_drop}
        className="flex flex-col items-center justify-center gap-3 py-10 rounded-2xl transition-all cursor-pointer"
        style={{
          border: `2px dashed ${dragging ? "#38bdf8" : "#1e293b"}`,
          background: dragging ? "#0c435415" : "#0f172a",
        }}
      >
        <FileText
          size={28}
          style={{ color: dragging ? "#38bdf8" : "#334155" }}
        />
        <div className="text-center">
          <p
            className="text-sm font-bold"
            style={{ color: dragging ? "#38bdf8" : "#475569" }}
          >
            Kéo & thả file vào đây
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "#334155" }}>
            PDF, Excel, ảnh — Techpack, QC Report, Sketch...
          </p>
        </div>
      </div>

      {/* Danh sách file */}
      {local.length > 0 && (
        <div className="space-y-2">
          {local.map((att) => {
            const cfg = DOCUMENT_TYPE_CONFIG[att.document_type];
            return (
              <div
                key={att.attachment_id}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}
              >
                <span style={{ fontSize: 18 }}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {att.file_name}
                  </p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {new Date(att.uploaded_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                {/* Chọn loại tài liệu */}
                <select
                  value={att.document_type}
                  onChange={(e) =>
                    update_type(
                      att.attachment_id,
                      e.target.value as ProductAttachment["document_type"],
                    )
                  }
                  className="px-2 py-1.5 rounded-lg text-[10px] font-bold outline-none"
                  style={{
                    background: cfg.mau + "20",
                    color: cfg.mau,
                    border: `1px solid ${cfg.mau}30`,
                  }}
                >
                  {Object.entries(DOCUMENT_TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.nhan}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => xoa(att.attachment_id)}
                  className="p-1.5 rounded-lg hover:bg-red-900/20 transition-all"
                  style={{ color: "#475569" }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          <div className="flex justify-end">
            <button
              onClick={() => onSave(local)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{
                background: "#06472520",
                color: "#10b981",
                border: "1px solid #10b98140",
              }}
            >
              <Save size={14} /> Lưu tài liệu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Audit Log Drawer ─────────────────────────────────────────────────────────

function AuditDrawer({
  product_id,
  onClose,
}: {
  product_id: string;
  onClose: () => void;
}) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  useEffect(() => {
    layAuditLog(product_id).then(setLogs);
  }, [product_id]);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-80 shadow-2xl"
        style={{ background: "#0a1628", borderLeft: "1px solid #1e293b" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <div className="flex items-center gap-2">
            <History size={15} style={{ color: "#64748b" }} />
            <h3 className="text-sm font-black text-white">Lịch sử chỉnh sửa</h3>
          </div>
          <button onClick={onClose} style={{ color: "#475569" }}>
            <X size={15} />
          </button>
        </div>

        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          style={{ scrollbarWidth: "thin" }}
        >
          {logs.length === 0 ? (
            <p
              className="text-sm text-center py-8"
              style={{ color: "#475569" }}
            >
              Chưa có lịch sử chỉnh sửa
            </p>
          ) : (
            logs.map((log) => (
              <div key={log.log_id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: "#38bdf8" }}
                  />
                  <p className="text-xs font-bold text-white">{log.action}</p>
                </div>
                <div className="pl-4 space-y-0.5">
                  <p className="text-[10px]" style={{ color: "#64748b" }}>
                    {log.old_value && (
                      <span
                        className="line-through mr-1"
                        style={{ color: "#ef4444" }}
                      >
                        {log.old_value}
                      </span>
                    )}
                    {log.new_value && (
                      <span style={{ color: "#10b981" }}>
                        → {log.new_value}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[9px]" style={{ color: "#334155" }}>
                      {log.user_name}
                    </p>
                    <span style={{ color: "#1e293b" }}>·</span>
                    <p className="text-[9px]" style={{ color: "#334155" }}>
                      {new Date(log.changed_at).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "thong_tin" | "sku" | "tai_lieu";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const is_new = !id;

  const [product, setProduct] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const [categories, setCategories] = useState<Category[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [attachments, setAttachments] = useState<ProductAttachment[]>([]);
  const [active_tab, setActiveTab] = useState<ActiveTab>("thong_tin");
  const [ma_trung, setMaTrung] = useState(false);
  const [show_audit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(!is_new);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  // Auto-save draft vào localStorage
  const auto_save_timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [last_saved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    Promise.all([
      layDanhSachCategory(),
      layDanhSachSeason(),
      layDanhSachColor(),
      layDanhSachSize(),
      layDanhSachVendor(),
    ]).then(([cats, seas, cols, szs, vends]) => {
      setCategories(cats);
      setSeasons(seas);
      setColors(cols);
      setSizes(szs);
      setVendors(vends);
    });

    if (!is_new && id) {
      laySanPhamById(id).then((p) => {
        if (p) setProduct(p);
        setLoading(false);
      });
      layTaiLieuTheoSanPham(id).then(setAttachments);
    }

    // Load draft từ localStorage
    const draft = localStorage.getItem(`catalog_draft_${id ?? "new"}`);
    if (draft) {
      try {
        setProduct(JSON.parse(draft));
      } catch {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      }
    }
  }, [id]);

  // Auto-save sau 2s khi có thay đổi
  const handle_change = useCallback(
    (field: keyof Product, val: unknown) => {
      setProduct((prev) => {
        const updated = { ...prev, [field]: val };
        clearTimeout(auto_save_timer.current);
        auto_save_timer.current = setTimeout(() => {
          localStorage.setItem(
            `catalog_draft_${id ?? "new"}`,
            JSON.stringify(updated),
          );
          setLastSaved(new Date());
        }, 2000);
        return updated;
      });

      // Check trùng mã realtime
      if (
        field === "product_code" &&
        typeof val === "string" &&
        val.length > 3
      ) {
        kiemTraTrungMa(val, id).then(setMaTrung);
      }
    },
    [id],
  );

  const handle_save = async () => {
    if (!product.name || !product.product_code || !product.category_id) {
      setToast({ msg: "Vui lòng điền đầy đủ thông tin bắt buộc", type: "err" });
      return;
    }
    if (ma_trung) {
      setToast({ msg: "Mã sản phẩm đã tồn tại", type: "err" });
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (is_new) {
        const new_product: Product = {
          ...(product as Product),
          product_id: gen_id(),
          created_at: now,
          updated_at: now,
        };
        await taoSanPham(new_product);
        localStorage.removeItem(`catalog_draft_new`);
        setToast({ msg: "Đã tạo sản phẩm thành công", type: "ok" });
        setTimeout(() => navigate("/manage/danh-muc/danh-sach-san-pham"), 1500);
      } else {
        await capNhatSanPham({ ...(product as Product), updated_at: now });
        localStorage.removeItem(`catalog_draft_${id}`);
        setToast({ msg: "Đã lưu thay đổi", type: "ok" });
      }
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "thong_tin" as ActiveTab, label: "Thông tin chung", icon: Package },
    { id: "sku" as ActiveTab, label: "Ma trận SKU & Giá", icon: ChevronRight },
    { id: "tai_lieu" as ActiveTab, label: "Tài liệu kỹ thuật", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm" style={{ color: "#475569" }}>
          Đang tải...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>
      {/* ── Sticky Header ── */}
      <div
        className="px-6 py-4 border-b flex-shrink-0 flex items-center justify-between"
        style={{
          borderColor: "#1e293b",
          background: "#0a1628",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/manage/danh-muc/danh-sach-san-pham")}
            className="flex items-center gap-1.5 text-xs font-bold transition-colors hover:text-white"
            style={{ color: "#475569" }}
          >
            <ChevronLeft size={14} /> Danh sách
          </button>
          <span style={{ color: "#1e293b" }}>|</span>
          <div>
            <h1 className="text-sm font-black text-white">
              {is_new ? "Thêm sản phẩm mới" : product.name}
            </h1>
            {!is_new && product.product_code && (
              <code className="text-[10px]" style={{ color: "#475569" }}>
                {product.product_code}
              </code>
            )}
          </div>
          {!is_new && product.lifecycle_status && (
            <Badge tt={product.lifecycle_status} config={LIFECYCLE_CONFIG} />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Auto-save indicator */}
          {last_saved && (
            <div
              className="flex items-center gap-1.5 text-[10px]"
              style={{ color: "#334155" }}
            >
              <Clock size={10} />
              Đã lưu nháp {last_saved.toLocaleTimeString("vi-VN")}
            </div>
          )}

          {/* Lịch sử */}
          {!is_new && (
            <button
              onClick={() => setShowAudit(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}
            >
              <History size={13} /> Lịch sử
            </button>
          )}

          <button
            onClick={() => navigate("/manage/danh-muc/danh-sach-san-pham")}
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}
          >
            Huỷ
          </button>

          <button
            onClick={handle_save}
            disabled={saving || ma_trung}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-black disabled:opacity-40"
            style={{
              background: "#0c4354",
              color: "#38bdf8",
              border: "1px solid #38bdf840",
            }}
          >
            <Save size={14} />
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}
      >
        {TABS.map(({ id: tab_id, label, icon: Icon }) => (
          <button
            key={tab_id}
            onClick={() => setActiveTab(tab_id)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all"
            style={{
              color: active_tab === tab_id ? "#38bdf8" : "#475569",
              borderBottom:
                active_tab === tab_id
                  ? "2px solid #38bdf8"
                  : "2px solid transparent",
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div
        className="flex-1 overflow-y-auto px-6 py-6"
        style={{ scrollbarWidth: "thin" }}
      >
        {active_tab === "thong_tin" && (
          <TabThongTin
            product={product}
            onChange={handle_change}
            categories={categories}
            seasons={seasons}
            vendors={vendors}
            ma_trung={ma_trung}
          />
        )}
        {active_tab === "sku" && (
          <TabSKU
            product_id={product.product_id ?? "new"}
            product_code={product.product_code ?? ""}
            skus={product.skus ?? []}
            colors={colors}
            sizes={sizes}
            onSave={async (skus) => {
              if (product.product_id)
                await capNhatSkus(product.product_id, skus);
              setProduct((prev) => ({ ...prev, skus, sku_count: skus.length }));
              setToast({ msg: `Đã lưu ${skus.length} SKU`, type: "ok" });
            }}
          />
        )}
        {active_tab === "tai_lieu" && (
          <TabTaiLieu
            product_id={product.product_id ?? ""}
            attachments={attachments}
            onSave={async (atts) => {
              await capNhatTaiLieu(atts);
              setAttachments(atts);
              setToast({ msg: "Đã lưu tài liệu", type: "ok" });
            }}
          />
        )}
      </div>

      {/* Audit drawer */}
      {show_audit && product.product_id && (
        <AuditDrawer
          product_id={product.product_id}
          onClose={() => setShowAudit(false)}
        />
      )}

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
