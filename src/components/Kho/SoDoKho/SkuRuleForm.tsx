// SkuRuleForm.tsx — Form tạo/sửa quy tắc SKU ↔ Vị trí
// Chọn SKU từ danh sách có sẵn, chọn node từ cây kho

import { useState, useEffect, useMemo } from "react";
import {
  X,
  Check,
  AlertTriangle,
  Info,
  Search,
  MapPin,
  Star,
} from "lucide-react";
import type {
  SkuLocationRule,
  LocationNode,
  WarehouseLevel,
} from "../data/warehouseTypes";
import type { SkuRuleFormData } from "../data/skuRuleHelpers";
import { validate_sku_rule } from "../data/skuRuleHelpers";
import { tinh_location_code, la_leaf_node } from "../data/warehouseHelpers";

// Import SKU từ module XuatNhapKho để tái sử dụng
export interface SKUOption {
  ma_sku: string;
  ten_sp: string;
  mau_sac: string;
  kich_thuoc: string;
}

interface Props {
  editing?: SkuLocationRule;
  rules: SkuLocationRule[];
  nodes: LocationNode[];
  levels: WarehouseLevel[];
  sku_options: SKUOption[];
  onSave: (data: SkuRuleFormData) => void;
  onCancel: () => void;
}

export function SkuRuleForm({
  editing,
  rules,
  nodes,
  levels,
  sku_options,
  onSave,
  onCancel,
}: Props) {
  const [form, setForm] = useState<SkuRuleFormData>({
    ma_sku: editing?.ma_sku ?? "",
    ten_sp: editing?.ten_sp ?? "",
    node_id: editing?.node_id ?? "",
    dinh_muc_min: editing?.dinh_muc_min ?? 10,
    dinh_muc_max: editing?.dinh_muc_max ?? 200,
    la_vi_tri_mac_dinh: editing?.la_vi_tri_mac_dinh ?? true,
  });

  const [sku_search, setSkuSearch] = useState("");
  const [node_search, setNodeSearch] = useState("");
  const [da_submit, setDaSubmit] = useState(false);
  const [loi, setLoi] = useState<string[]>([]);
  const [canh_bao, setCanhBao] = useState<string[]>([]);

  // Chỉ cho chọn leaf nodes đang active
  const leaf_nodes = useMemo(
    () =>
      nodes.filter(
        (n) => n.trang_thai === "active" && la_leaf_node(n.id, nodes),
      ),
    [nodes],
  );

  const filtered_skus = useMemo(() => {
    const q = sku_search.toLowerCase();
    if (!q) return sku_options;
    return sku_options.filter(
      (s) =>
        s.ma_sku.toLowerCase().includes(q) ||
        s.ten_sp.toLowerCase().includes(q),
    );
  }, [sku_options, sku_search]);

  const filtered_nodes = useMemo(() => {
    const q = node_search.toLowerCase();
    if (!q) return leaf_nodes;
    return leaf_nodes.filter((n) => {
      const code = tinh_location_code(n.id, nodes).toLowerCase();
      return n.ten.toLowerCase().includes(q) || code.includes(q);
    });
  }, [leaf_nodes, node_search, nodes]);

  // Validate realtime sau lần submit đầu
  useEffect(() => {
    if (!da_submit) return;
    const result = validate_sku_rule(form, rules, nodes, editing?.id);
    setLoi(result.loi);
    setCanhBao(result.canh_bao);
  }, [form, da_submit]);

  const set = <K extends keyof SkuRuleFormData>(
    key: K,
    val: SkuRuleFormData[K],
  ) => setForm((f) => ({ ...f, [key]: val }));

  const handle_submit = () => {
    setDaSubmit(true);
    const result = validate_sku_rule(form, rules, nodes, editing?.id);
    setLoi(result.loi);
    setCanhBao(result.canh_bao);
    if (result.ok) onSave(form);
  };

  const selected_sku = sku_options.find((s) => s.ma_sku === form.ma_sku);
  const selected_node = nodes.find((n) => n.id === form.node_id);
  const selected_code = selected_node
    ? tinh_location_code(selected_node.id, nodes)
    : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <div>
          <h3 className="text-sm font-black text-white">
            {editing ? "Chỉnh sửa quy tắc" : "Gán SKU vào vị trí"}
          </h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
            Thiết lập định mức và vị trí lấy hàng mặc định
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "#1e293b", color: "#64748b" }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Body */}
      <div
        className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* ── Chọn SKU ─────────────────────────────────── */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-2 block"
            style={{ color: "#475569" }}
          >
            Mã SKU *
          </label>

          {/* SKU đã chọn */}
          {selected_sku ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
              style={{ background: "#0c435425", border: "1px solid #38bdf840" }}
            >
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-mono font-black"
                  style={{ color: "#38bdf8" }}
                >
                  {selected_sku.ma_sku}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: "#94a3b8" }}
                >
                  {selected_sku.ten_sp} · {selected_sku.mau_sac} /{" "}
                  {selected_sku.kich_thuoc}
                </p>
              </div>
              {!editing && (
                <button
                  onClick={() => {
                    set("ma_sku", "");
                    set("ten_sp", "");
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-lg"
                  style={{ background: "#1e293b", color: "#64748b" }}
                >
                  Đổi
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="relative mb-2">
                <Search
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#475569" }}
                />
                <input
                  value={sku_search}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  placeholder="Tìm mã SKU hoặc tên sản phẩm..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                  style={{
                    background: "#1e293b",
                    border: `1px solid ${loi.some((l) => l.includes("SKU")) ? "#ef4444" : "#334155"}`,
                    color: "white",
                  }}
                />
              </div>
              <div
                className="rounded-xl overflow-hidden max-h-40 overflow-y-auto"
                style={{ border: "1px solid #1e293b" }}
              >
                {filtered_skus.length === 0 ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "#475569" }}
                  >
                    Không tìm thấy SKU
                  </p>
                ) : (
                  filtered_skus.map((sku) => (
                    <button
                      key={sku.ma_sku}
                      onClick={() => {
                        set("ma_sku", sku.ma_sku);
                        set("ten_sp", sku.ten_sp);
                        setSkuSearch("");
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-800/50 transition-colors border-b last:border-b-0"
                      style={{ borderColor: "#1e293b" }}
                    >
                      <p
                        className="text-xs font-mono font-bold"
                        style={{ color: "#38bdf8" }}
                      >
                        {sku.ma_sku}
                      </p>
                      <p className="text-[10px]" style={{ color: "#64748b" }}>
                        {sku.ten_sp} · {sku.mau_sac} / {sku.kich_thuoc}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Chọn vị trí kho ──────────────────────────── */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-2 block"
            style={{ color: "#475569" }}
          >
            Vị trí kho (ô) *
          </label>

          {selected_node ? (
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-2"
              style={{ background: "#4c1d9520", border: "1px solid #a78bfa40" }}
            >
              <MapPin size={13} style={{ color: "#a78bfa", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-mono font-black"
                  style={{ color: "#a78bfa" }}
                >
                  {selected_code}
                </p>
                <p
                  className="text-[10px] truncate"
                  style={{ color: "#94a3b8" }}
                >
                  {selected_node.ten}
                </p>
              </div>
              <button
                onClick={() => set("node_id", "")}
                className="text-[10px] px-2 py-0.5 rounded-lg"
                style={{ background: "#1e293b", color: "#64748b" }}
              >
                Đổi
              </button>
            </div>
          ) : (
            <>
              <div className="relative mb-2">
                <Search
                  size={11}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#475569" }}
                />
                <input
                  value={node_search}
                  onChange={(e) => setNodeSearch(e.target.value)}
                  placeholder="Tìm location code hoặc tên ô..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                  style={{
                    background: "#1e293b",
                    border: `1px solid ${loi.some((l) => l.includes("vị trí")) ? "#ef4444" : "#334155"}`,
                    color: "white",
                  }}
                />
              </div>
              <div
                className="rounded-xl overflow-hidden max-h-40 overflow-y-auto"
                style={{ border: "1px solid #1e293b" }}
              >
                {filtered_nodes.length === 0 ? (
                  <p
                    className="text-xs text-center py-4"
                    style={{ color: "#475569" }}
                  >
                    Không tìm thấy ô nào
                  </p>
                ) : (
                  filtered_nodes.map((node) => {
                    const code = tinh_location_code(node.id, nodes);
                    const level = levels.find((l) => l.id === node.level_id);
                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          set("node_id", node.id);
                          setNodeSearch("");
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-800/50 transition-colors border-b last:border-b-0"
                        style={{ borderColor: "#1e293b" }}
                      >
                        <p
                          className="text-xs font-mono font-bold"
                          style={{ color: "#a78bfa" }}
                        >
                          {code}
                        </p>
                        <p className="text-[10px]" style={{ color: "#64748b" }}>
                          {level?.icon} {node.ten}
                          {node.co_hang && (
                            <span style={{ color: "#10b981" }}>
                              {" "}
                              · Đang có hàng
                            </span>
                          )}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Vị trí mặc định ──────────────────────────── */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-2 block"
            style={{ color: "#475569" }}
          >
            Loại vị trí
          </label>
          <div className="flex gap-2">
            {[
              {
                val: true,
                label: "Primary",
                desc: "Vị trí lấy hàng mặc định",
                icon: <Star size={11} />,
                mau: "#f59e0b",
              },
              {
                val: false,
                label: "Overflow",
                desc: "Vị trí tràn / dự phòng",
                icon: <MapPin size={11} />,
                mau: "#64748b",
              },
            ].map(({ val, label, desc, icon, mau }) => (
              <button
                key={String(val)}
                onClick={() => set("la_vi_tri_mac_dinh", val)}
                className="flex-1 flex items-start gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background:
                    form.la_vi_tri_mac_dinh === val ? `${mau}20` : "#1e293b",
                  border: `1px solid ${form.la_vi_tri_mac_dinh === val ? `${mau}60` : "#334155"}`,
                }}
              >
                <span
                  className="mt-0.5 flex-shrink-0"
                  style={{
                    color: form.la_vi_tri_mac_dinh === val ? mau : "#475569",
                  }}
                >
                  {icon}
                </span>
                <div>
                  <p
                    className="text-xs font-bold"
                    style={{
                      color: form.la_vi_tri_mac_dinh === val ? mau : "#94a3b8",
                    }}
                  >
                    {label}
                  </p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {desc}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Định mức tồn kho ─────────────────────────── */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-2 block"
            style={{ color: "#475569" }}
          >
            Định mức tồn kho
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                key: "dinh_muc_min" as const,
                label: "Tối thiểu",
                mau: "#ef4444",
                hint: "Cảnh báo khi dưới mức này",
              },
              {
                key: "dinh_muc_max" as const,
                label: "Tối đa",
                mau: "#f59e0b",
                hint: "Cảnh báo khi vượt mức này",
              },
            ].map(({ key, label, mau, hint }) => (
              <div key={key}>
                <p
                  className="text-[10px] font-bold mb-1.5 flex items-center gap-1"
                  style={{ color: mau }}
                >
                  {label}
                </p>
                <input
                  type="number"
                  min={0}
                  value={form[key]}
                  onChange={(e) => set(key, Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl text-sm font-black outline-none"
                  style={{
                    background: "#1e293b",
                    border: `1px solid ${loi.some((l) => l.includes("Định mức") || l.includes("Tối")) ? "#ef4444" : "#334155"}`,
                    color: mau,
                  }}
                />
                <p className="text-[9px] mt-1" style={{ color: "#334155" }}>
                  {hint}
                </p>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          {form.dinh_muc_max > 0 && (
            <div
              className="mt-3 px-3 py-2.5 rounded-xl"
              style={{ background: "#0a1628" }}
            >
              <div
                className="flex justify-between text-[9px] mb-1.5"
                style={{ color: "#475569" }}
              >
                <span>0</span>
                <span style={{ color: "#ef4444" }}>
                  Min: {form.dinh_muc_min}
                </span>
                <span style={{ color: "#f59e0b" }}>
                  Max: {form.dinh_muc_max}
                </span>
              </div>
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{ background: "#1e293b" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: "100%",
                    background: `linear-gradient(to right, #ef444440 ${(form.dinh_muc_min / form.dinh_muc_max) * 100}%, #10b98140 ${(form.dinh_muc_min / form.dinh_muc_max) * 100}%, #10b98140 100%)`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Lỗi & cảnh báo */}
        {loi.length > 0 && (
          <div
            className="rounded-xl p-3 space-y-1"
            style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}
          >
            {loi.map((l) => (
              <div
                key={l}
                className="flex items-center gap-2 text-xs"
                style={{ color: "#fca5a5" }}
              >
                <AlertTriangle size={11} /> {l}
              </div>
            ))}
          </div>
        )}
        {canh_bao.length > 0 && (
          <div
            className="rounded-xl p-3 space-y-1"
            style={{ background: "#78350f20", border: "1px solid #f59e0b30" }}
          >
            {canh_bao.map((c) => (
              <div
                key={c}
                className="flex items-center gap-2 text-xs"
                style={{ color: "#fcd34d" }}
              >
                <Info size={11} /> {c}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex gap-2 px-5 py-4 border-t flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: "#1e293b", color: "#64748b" }}
        >
          Huỷ
        </button>
        <button
          onClick={handle_submit}
          className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
          style={{
            background: "#0c435425",
            color: "#38bdf8",
            border: "1px solid #38bdf840",
          }}
        >
          <Check size={14} />
          {editing ? "Lưu thay đổi" : "Tạo quy tắc"}
        </button>
      </div>
    </div>
  );
}
