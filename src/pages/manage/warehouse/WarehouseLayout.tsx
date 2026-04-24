import { useState, useMemo } from "react";
import {
  Warehouse,
  Settings,
  Search,
  Plus,
  Printer,
  Layers,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type {
  LocationNode,
  //   WarehouseLevel,
  WarehouseConfig,
  NodeFormData,
  NodeFormMode,
} from "../../../components/Kho/data/warehouseTypes";
import {
  lay_con_truc_tiep,
  tinh_computed,
  co_the_xoa,
  la_leaf_node,
  lay_descendants,
  tim_kiem,
  //   gen_id,
} from "../../../components/Kho/data/warehouseHelpers";
import { tao_node_moi } from "../../../components/Kho/data/warehouseStore";
import {
  MOCK_WAREHOUSE_CONFIG,
  MOCK_NODES,
} from "../../../components/Kho/data/warehouseMockData";
import { NodeCard } from "../../../components/Kho/SoDoKho/NodeCard";
import { NodeForm } from "../../../components/Kho/SoDoKho/NodeForm";
import { LevelManager } from "../../../components/Kho/SoDoKho/LevelManager";
import { PrintLabel } from "../../../components/Kho/SoDoKho/PrintLabel";
import { BreadcrumbPath } from "../../../components/Kho/SoDoKho/BreadcrumbPath";

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
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}
    >
      {type === "ok" ? (
        <CheckCircle size={14} style={{ color: mau }} />
      ) : (
        <AlertTriangle size={14} style={{ color: mau }} />
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

// ─── Recursive Tree ───────────────────────────────────────────────────────────

function TreeLevel({
  parent_id,
  nodes,
  config,
  expanded_ids,
  selected_id,
  depth,
  onSelect,
  onToggle,
  onAdd,
  onEdit,
  onDelete,
  onPrint,
}: {
  parent_id: string | null;
  nodes: LocationNode[];
  config: WarehouseConfig;
  expanded_ids: Set<string>;
  selected_id: string | null;
  depth: number;
  onSelect: (n: LocationNode) => void;
  onToggle: (id: string) => void;
  onAdd: (parent: LocationNode) => void;
  onEdit: (n: LocationNode) => void;
  onDelete: (n: LocationNode) => void;
  onPrint: (n: LocationNode) => void;
}) {
  const children = lay_con_truc_tiep(parent_id, nodes);
  if (children.length === 0) return null;

  return (
    <>
      {children.map((node) => {
        const computed = tinh_computed(node, nodes, config.levels);
        const level = config.levels.find((l) => l.id === node.level_id);
        const is_expanded = expanded_ids.has(node.id);
        const has_children = !computed.la_leaf;

        return (
          <div key={node.id}>
            <NodeCard
              node={node}
              computed={computed}
              level={level}
              is_selected={selected_id === node.id}
              is_expanded={is_expanded}
              has_children={has_children}
              depth={depth}
              onSelect={() => onSelect(node)}
              onToggle={() => onToggle(node.id)}
              onAdd={() => onAdd(node)}
              onEdit={() => onEdit(node)}
              onDelete={() => onDelete(node)}
              onPrint={() => onPrint(node)}
            />
            {is_expanded && (
              <TreeLevel
                parent_id={node.id}
                nodes={nodes}
                config={config}
                expanded_ids={expanded_ids}
                selected_id={selected_id}
                depth={depth + 1}
                onSelect={onSelect}
                onToggle={onToggle}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onPrint={onPrint}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type RightPanel = "none" | "form" | "print" | "levels" | "detail";

export default function WarehouseLayout() {
  const [config, setConfig] = useState<WarehouseConfig>(MOCK_WAREHOUSE_CONFIG);
  const [nodes, setNodes] = useState<LocationNode[]>(MOCK_NODES);
  const [selected_id, setSelectedId] = useState<string | null>(null);
  const [expanded_ids, setExpandedIds] = useState<Set<string>>(
    new Set(["n-A", "n-B"]),
  );
  const [right_panel, setRightPanel] = useState<RightPanel>("none");
  const [form_mode, setFormMode] = useState<NodeFormMode>("create");
  const [form_parent, setFormParent] = useState<LocationNode | null>(null);
  const [form_editing, setFormEditing] = useState<LocationNode | null>(null);
  const [print_nodes, setPrintNodes] = useState<LocationNode[]>([]);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);
  const [show_inactive, setShowInactive] = useState(false);

  const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Filtered nodes (search + inactive)
  const visible_nodes = useMemo(() => {
    let result = show_inactive
      ? nodes
      : nodes.filter((n) => n.trang_thai === "active");
    if (search.trim()) result = tim_kiem(search, result);
    return result;
  }, [nodes, search, show_inactive]);

  const selected_node = nodes.find((n) => n.id === selected_id) ?? null;

  // ── Tree actions ──

  const toggle_expand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const expand_all = () => setExpandedIds(new Set(nodes.map((n) => n.id)));
  const collapse_all = () => setExpandedIds(new Set());

  // ── CRUD ──

  const handle_add = (parent: LocationNode) => {
    setFormParent(parent);
    setFormEditing(null);
    setFormMode("create");
    setRightPanel("form");
    // Auto expand parent
    setExpandedIds((prev) => new Set([...prev, parent.id]));
  };

  const handle_add_root = () => {
    setFormParent(null);
    setFormEditing(null);
    setFormMode("create");
    setRightPanel("form");
  };

  const handle_edit = (node: LocationNode) => {
    setFormEditing(node);
    setFormParent(null);
    setFormMode("edit");
    setRightPanel("form");
  };

  const handle_delete = (node: LocationNode) => {
    const check = co_the_xoa(node, nodes);
    if (!check.ok) {
      show_toast(check.ly_do ?? "Không thể xóa", "err");
      return;
    }
    // Xóa cả descendants
    const descendants = lay_descendants(node.id, nodes);
    const ids_to_remove = new Set([node.id, ...descendants.map((d) => d.id)]);
    setNodes((prev) => prev.filter((n) => !ids_to_remove.has(n.id)));
    if (selected_id === node.id) setSelectedId(null);
    show_toast(`Đã xóa "${node.ten}"`);
  };

  const handle_print = (node: LocationNode) => {
    // In node này + tất cả leaf descendants
    const descendants = lay_descendants(node.id, nodes);
    const all = [node, ...descendants];
    const leaves = all.filter((n) => la_leaf_node(n.id, nodes));
    setPrintNodes(leaves.length > 0 ? leaves : [node]);
    setRightPanel("print");
  };

  const handle_save = (data: NodeFormData & { thu_tu: number }) => {
    if (form_mode === "create") {
      const new_node = tao_node_moi({ ...data, thu_tu: data.thu_tu });
      setNodes((prev) => [...prev, new_node]);
      setSelectedId(new_node.id);
      // Expand parent
      if (data.parent_id) {
        setExpandedIds((prev) => new Set([...prev, data.parent_id!]));
      }
      show_toast(`Đã tạo vị trí "${new_node.ten}"`);
    } else if (form_editing) {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === form_editing.id
            ? {
                ...n,
                ten: data.ten,
                prefix: data.prefix,
                level_id: data.level_id,
                mo_ta: data.mo_ta,
                trang_thai: data.trang_thai,
              }
            : n,
        ),
      );
      show_toast(`Đã cập nhật "${data.ten}"`);
    }
    setRightPanel("none");
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const roots = nodes.filter((n) => !n.parent_id);
    const leaves = nodes.filter((n) => la_leaf_node(n.id, nodes));
    const total = nodes.length;
    const co_hang = nodes.filter((n) => n.co_hang).length;
    return { roots: roots.length, leaves: leaves.length, total, co_hang };
  }, [nodes]);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#020817" }}
    >
      {/* ── LEFT: Tree panel ──────────────────────────────────────── */}
      <div
        className="flex flex-col border-r"
        style={{ width: "380px", borderColor: "#1e293b", flexShrink: 0 }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Warehouse size={16} style={{ color: "#38bdf8" }} />
              <div>
                <h1 className="text-sm font-black text-white">
                  {config.ten_kho}
                </h1>
                <p className="text-[10px]" style={{ color: "#475569" }}>
                  Sơ đồ vị trí kho
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setRightPanel((p) => (p === "levels" ? "none" : "levels"))
                }
                title="Cấu hình cấp phân cấp"
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background:
                    right_panel === "levels" ? "#0c435425" : "#1e293b",
                  color: right_panel === "levels" ? "#38bdf8" : "#64748b",
                  border:
                    right_panel === "levels"
                      ? "1px solid #38bdf840"
                      : "1px solid transparent",
                }}
              >
                <Settings size={14} />
              </button>
              <button
                onClick={handle_add_root}
                title="Thêm khu vực gốc"
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: "#0c435425",
                  color: "#38bdf8",
                  border: "1px solid #38bdf840",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Stats nhỏ */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Khu vực", val: stats.roots },
              { label: "Tổng ô", val: stats.leaves },
              { label: "Có hàng", val: stats.co_hang },
            ].map(({ label, val }) => (
              <div
                key={label}
                className="px-2 py-1.5 rounded-lg text-center"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}
              >
                <p className="text-sm font-black text-white">{val}</p>
                <p className="text-[9px]" style={{ color: "#475569" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm vị trí, mã, location code..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}
              >
                <X size={11} />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={expand_all}
              className="text-[10px] px-2 py-1 rounded-lg"
              style={{ background: "#1e293b", color: "#64748b" }}
            >
              Mở tất cả
            </button>
            <button
              onClick={collapse_all}
              className="text-[10px] px-2 py-1 rounded-lg"
              style={{ background: "#1e293b", color: "#64748b" }}
            >
              Thu gọn
            </button>
            <label className="ml-auto flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={show_inactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              <span className="text-[10px]" style={{ color: "#475569" }}>
                Hiện vị trí tắt
              </span>
            </label>
          </div>
        </div>

        {/* Tree */}
        <div
          className="flex-1 overflow-y-auto py-2 px-2"
          style={{ scrollbarWidth: "thin" }}
        >
          {visible_nodes.length === 0 ? (
            <div className="text-center py-12">
              <Warehouse
                size={28}
                className="mx-auto mb-3 opacity-20"
                style={{ color: "#64748b" }}
              />
              <p className="text-sm" style={{ color: "#475569" }}>
                {search
                  ? "Không tìm thấy vị trí nào"
                  : "Kho chưa có vị trí nào"}
              </p>
              {!search && (
                <button
                  onClick={handle_add_root}
                  className="mt-3 text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: "#0c435425", color: "#38bdf8" }}
                >
                  Tạo khu vực đầu tiên
                </button>
              )}
            </div>
          ) : (
            <TreeLevel
              parent_id={null}
              nodes={visible_nodes}
              config={config}
              expanded_ids={expanded_ids}
              selected_id={selected_id}
              depth={0}
              onSelect={(n) => {
                setSelectedId(n.id);
                if (right_panel === "form") setRightPanel("none");
              }}
              onToggle={toggle_expand}
              onAdd={handle_add}
              onEdit={handle_edit}
              onDelete={handle_delete}
              onPrint={handle_print}
            />
          )}
        </div>
      </div>

      {/* ── RIGHT: Detail / Form / Print / Levels panel ──────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {right_panel === "none" && (
          <div
            className="flex-1 flex flex-col items-center justify-center"
            style={{ background: "#020817" }}
          >
            {selected_node ? (
              // Detail view khi chọn node
              <div className="w-full max-w-lg px-8">
                <div
                  className="rounded-2xl p-6 space-y-4"
                  style={{ background: "#0f172a", border: "1px solid #1e293b" }}
                >
                  <BreadcrumbPath
                    node={selected_node}
                    nodes={nodes}
                    levels={config.levels}
                  />
                  <div>
                    <h2 className="text-xl font-black text-white">
                      {selected_node.ten}
                    </h2>
                    {selected_node.mo_ta && (
                      <p className="text-sm mt-1" style={{ color: "#64748b" }}>
                        {selected_node.mo_ta}
                      </p>
                    )}
                  </div>

                  {/* Computed info */}
                  {(() => {
                    const computed = tinh_computed(
                      selected_node,
                      nodes,
                      config.levels,
                    );
                    return (
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          {
                            label: "Location Code",
                            val: computed.location_code,
                            mono: true,
                            color: "#a78bfa",
                          },
                          {
                            label: "Loại cấp",
                            val: computed.ten_level,
                            mono: false,
                          },
                          {
                            label: "Trạng thái",
                            val:
                              selected_node.trang_thai === "active"
                                ? "Hoạt động"
                                : "Tắt",
                            mono: false,
                            color:
                              selected_node.trang_thai === "active"
                                ? "#10b981"
                                : "#64748b",
                          },
                          {
                            label: "Có hàng",
                            val: selected_node.co_hang
                              ? "Đang có hàng"
                              : "Trống",
                            mono: false,
                            color: selected_node.co_hang
                              ? "#10b981"
                              : "#64748b",
                          },
                          ...(computed.la_leaf
                            ? []
                            : [
                                {
                                  label: "Tổng ô",
                                  val: String(computed.so_o_tong),
                                  mono: false,
                                },
                                {
                                  label: "Cấp con",
                                  val: String(computed.so_con_truc_tiep),
                                  mono: false,
                                },
                              ]),
                        ].map(({ label, val, mono, color }) => (
                          <div
                            key={label}
                            className="px-3 py-2.5 rounded-xl"
                            style={{ background: "#1e293b" }}
                          >
                            <p
                              className="text-[10px] uppercase font-bold mb-1"
                              style={{ color: "#475569" }}
                            >
                              {label}
                            </p>
                            <p
                              className={`text-sm font-black ${mono ? "font-mono" : ""}`}
                              style={{ color: color ?? "white" }}
                            >
                              {val}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handle_edit(selected_node)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                      style={{ background: "#1e293b", color: "#94a3b8" }}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handle_print(selected_node)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{
                        background: "#0c435425",
                        color: "#38bdf8",
                        border: "1px solid #38bdf840",
                      }}
                    >
                      <Printer size={14} /> In tem
                    </button>
                    <button
                      onClick={() => handle_add(selected_node)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{
                        background: "#06472520",
                        color: "#10b981",
                        border: "1px solid #10b98140",
                      }}
                    >
                      <Plus size={14} /> Thêm con
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Layers
                  size={40}
                  className="mx-auto mb-4 opacity-20"
                  style={{ color: "#64748b" }}
                />
                <p className="text-sm font-bold" style={{ color: "#475569" }}>
                  Chọn một vị trí để xem chi tiết
                </p>
                <p className="text-xs mt-1" style={{ color: "#334155" }}>
                  hoặc nhấn{" "}
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px]"
                    style={{ background: "#1e293b", color: "#64748b" }}
                  >
                    +
                  </kbd>{" "}
                  để tạo khu vực mới
                </p>
              </div>
            )}
          </div>
        )}

        {right_panel === "form" && (
          <NodeForm
            mode={form_mode}
            parent={form_parent}
            editing={form_editing}
            nodes={nodes}
            levels={config.levels}
            onSave={handle_save}
            onCancel={() => setRightPanel("none")}
          />
        )}

        {right_panel === "print" && (
          <PrintLabel
            nodes_to_print={print_nodes}
            all_nodes={nodes}
            levels={config.levels}
            warehouse_name={config.ten_kho}
            onClose={() => setRightPanel("none")}
          />
        )}

        {right_panel === "levels" && (
          <div className="flex flex-col h-full">
            <div
              className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
              style={{ borderColor: "#1e293b" }}
            >
              <h3 className="text-sm font-black text-white">
                Cấu hình cấp phân cấp
              </h3>
              <button
                onClick={() => setRightPanel("none")}
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "#1e293b", color: "#64748b" }}
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <LevelManager
                levels={config.levels}
                nodes={nodes}
                onChange={(levels) => setConfig((c) => ({ ...c, levels }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
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
