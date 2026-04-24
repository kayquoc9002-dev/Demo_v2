// NodeForm.tsx — Form thêm/sửa một vị trí kho
// Validation đầy đủ, hiển thị preview Location Code realtime

import { useState, useEffect } from "react";
import { X, Check, AlertTriangle } from "lucide-react";
import type {
  LocationNode,
  WarehouseLevel,
  NodeFormData,
  NodeFormMode,
} from "../data/warehouseTypes";
import {
  validate_node_form,
  lay_ancestors,
  tinh_thu_tu_tiep_theo,
} from "../data/warehouseHelpers";
import { BreadcrumbPath } from "./BreadcrumbPath";

interface Props {
  mode: NodeFormMode;
  parent: LocationNode | null; // Node cha (khi tạo mới)
  editing: LocationNode | null; // Node đang sửa
  nodes: LocationNode[];
  levels: WarehouseLevel[];
  onSave: (data: NodeFormData & { thu_tu: number }) => void;
  onCancel: () => void;
}

export function NodeForm({
  mode,
  parent,
  editing,
  nodes,
  levels,
  onSave,
  onCancel,
}: Props) {
  const sorted_levels = [...levels].sort((a, b) => a.thu_tu - b.thu_tu);

  // Xác định level mặc định cho node mới
  const default_level_id = (() => {
    if (mode === "edit" && editing) return editing.level_id;
    if (!parent) return sorted_levels[0]?.id ?? "";
    const parent_level = levels.find((l) => l.id === parent.level_id);
    const next_level = sorted_levels.find(
      (l) => l.thu_tu > (parent_level?.thu_tu ?? 0),
    );
    return next_level?.id ?? sorted_levels[sorted_levels.length - 1]?.id ?? "";
  })();

  const [form, setForm] = useState<NodeFormData>({
    ten: editing?.ten ?? "",
    prefix: editing?.prefix ?? "",
    level_id: default_level_id,
    parent_id: editing?.parent_id ?? parent?.id ?? null,
    mo_ta: editing?.mo_ta ?? "",
    trang_thai: editing?.trang_thai ?? "active",
  });

  const [loi_list, setLoiList] = useState<string[]>([]);
  const [da_submit, setDaSubmit] = useState(false);
  const [auto_prefix, setAutoPrefix] = useState(mode === "create");

  // Auto-generate prefix từ tên
  useEffect(() => {
    if (!auto_prefix || mode === "edit") return;
    const raw = form.ten
      .split(/[\s\-\/]+/)
      .map((w) => w[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 4);
    setForm((f) => ({ ...f, prefix: raw }));
  }, [form.ten, auto_prefix, mode]);

  // Validate khi form thay đổi (sau lần submit đầu)
  useEffect(() => {
    if (!da_submit) return;
    const result = validate_node_form(form, nodes, editing?.id);
    setLoiList(result.loi);
  }, [form, da_submit, nodes, editing?.id]);

  // Preview location code
  const preview_code = (() => {
    if (!form.prefix) return "—";
    const ancestors = parent
      ? [...lay_ancestors(parent.id, nodes), parent]
      : editing
        ? lay_ancestors(editing.id, nodes)
        : [];
    return [...ancestors.map((n) => n.prefix), form.prefix].join("-");
  })();

  const handleSubmit = () => {
    setDaSubmit(true);
    const result = validate_node_form(form, nodes, editing?.id);
    if (!result.ok) {
      setLoiList(result.loi);
      return;
    }
    const thu_tu =
      mode === "edit"
        ? (editing?.thu_tu ?? 1)
        : tinh_thu_tu_tiep_theo(form.parent_id, nodes);
    onSave({ ...form, thu_tu });
  };

  const set = <K extends keyof NodeFormData>(key: K, val: NodeFormData[K]) => {
    setForm((f) => ({ ...f, [key]: val }));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <div>
          <h3 className="text-sm font-black text-white">
            {mode === "create" ? "Thêm vị trí mới" : "Chỉnh sửa vị trí"}
          </h3>
          {parent && (
            <div className="mt-1">
              <BreadcrumbPath
                node={parent}
                nodes={nodes}
                levels={levels}
                showCode={false}
              />
            </div>
          )}
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
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Loại cấp */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={{ color: "#475569" }}
          >
            Loại cấp *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {sorted_levels.map((lv) => (
              <button
                key={lv.id}
                onClick={() => set("level_id", lv.id)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
                style={{
                  background: form.level_id === lv.id ? "#0c435425" : "#1e293b",
                  border: `1px solid ${form.level_id === lv.id ? "#38bdf8" : "#334155"}`,
                  color: form.level_id === lv.id ? "#38bdf8" : "#94a3b8",
                }}
              >
                <span>{lv.icon}</span>
                <span className="text-xs font-bold">{lv.ten}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tên */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={{ color: "#475569" }}
          >
            Tên vị trí *
          </label>
          <input
            value={form.ten}
            onChange={(e) => set("ten", e.target.value)}
            placeholder="VD: Khu A — Đồ Nam"
            autoFocus
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{
              background: "#1e293b",
              border: `1px solid ${loi_list.some((l) => l.includes("Tên")) ? "#ef4444" : "#334155"}`,
              color: "white",
            }}
          />
        </div>

        {/* Mã rút gọn (prefix) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              className="text-[10px] font-black uppercase"
              style={{ color: "#475569" }}
            >
              Mã rút gọn *
            </label>
            {mode === "create" && (
              <button
                onClick={() => setAutoPrefix((v) => !v)}
                className="text-[9px] px-2 py-0.5 rounded-full font-bold transition-colors"
                style={{
                  background: auto_prefix ? "#06472520" : "#1e293b",
                  color: auto_prefix ? "#10b981" : "#475569",
                  border: `1px solid ${auto_prefix ? "#10b981" : "#334155"}`,
                }}
              >
                {auto_prefix ? "Tự động" : "Thủ công"}
              </button>
            )}
          </div>
          <input
            value={form.prefix}
            onChange={(e) => {
              setAutoPrefix(false);
              set("prefix", e.target.value.toUpperCase());
            }}
            placeholder="VD: A, 01, 01A"
            maxLength={10}
            className="w-full px-3 py-2.5 rounded-xl text-sm font-mono outline-none"
            style={{
              background: "#1e293b",
              border: `1px solid ${loi_list.some((l) => l.includes("Mã")) ? "#ef4444" : "#334155"}`,
              color: "#38bdf8",
            }}
          />
          {/* Preview Location Code */}
          <div
            className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg"
            style={{ background: "#0a1628" }}
          >
            <span className="text-[10px]" style={{ color: "#475569" }}>
              Location Code:
            </span>
            <code className="text-xs font-black" style={{ color: "#a78bfa" }}>
              {preview_code}
            </code>
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={{ color: "#475569" }}
          >
            Mô tả
          </label>
          <textarea
            value={form.mo_ta}
            onChange={(e) => set("mo_ta", e.target.value)}
            placeholder="Ghi chú về vị trí này..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "white",
            }}
          />
        </div>

        {/* Trạng thái */}
        <div>
          <label
            className="text-[10px] font-black uppercase mb-1.5 block"
            style={{ color: "#475569" }}
          >
            Trạng thái
          </label>
          <div className="flex gap-2">
            {(["active", "inactive"] as const).map((tt) => (
              <button
                key={tt}
                onClick={() => set("trang_thai", tt)}
                className="flex-1 py-2 rounded-xl text-xs font-bold transition-all"
                style={{
                  background:
                    form.trang_thai === tt
                      ? tt === "active"
                        ? "#06472520"
                        : "#7f1d1d20"
                      : "#1e293b",
                  color:
                    form.trang_thai === tt
                      ? tt === "active"
                        ? "#10b981"
                        : "#ef4444"
                      : "#475569",
                  border: `1px solid ${
                    form.trang_thai === tt
                      ? tt === "active"
                        ? "#10b98140"
                        : "#ef444440"
                      : "#334155"
                  }`,
                }}
              >
                {tt === "active" ? "Hoạt động" : "Tắt"}
              </button>
            ))}
          </div>
        </div>

        {/* Lỗi validate */}
        {loi_list.length > 0 && (
          <div
            className="rounded-xl p-3 space-y-1"
            style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}
          >
            {loi_list.map((loi) => (
              <div
                key={loi}
                className="flex items-center gap-2 text-xs"
                style={{ color: "#fca5a5" }}
              >
                <AlertTriangle size={11} />
                {loi}
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
          onClick={handleSubmit}
          className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{
            background: "#0c4354",
            color: "#38bdf8",
            border: "1px solid #38bdf840",
          }}
        >
          <Check size={14} />
          {mode === "create" ? "Tạo vị trí" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
