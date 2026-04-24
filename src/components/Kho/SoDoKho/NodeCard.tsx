// NodeCard.tsx — Card hiển thị thông tin một node trong cây kho
// Props-driven, không có internal state — cha quản lý hoàn toàn

import { ChevronRight, ChevronDown, Package, Edit2, Trash2, Plus, Printer } from "lucide-react";
import type { LocationNode, WarehouseLevel, NodeComputed } from "../data/warehouseTypes";

interface Props {
  node:         LocationNode;
  computed:     NodeComputed;
  level:        WarehouseLevel | undefined;
  is_selected:  boolean;
  is_expanded:  boolean;
  has_children: boolean;
  depth:        number;
  onSelect:     () => void;
  onToggle:     () => void;
  onAdd:        () => void;
  onEdit:       () => void;
  onDelete:     () => void;
  onPrint:      () => void;
}

export function NodeCard({
  node, computed, level, is_selected, is_expanded,
  has_children, depth, onSelect, onToggle, onAdd, onEdit, onDelete, onPrint,
}: Props) {

  const indent = depth * 20;
  const is_inactive = node.trang_thai === "inactive";

  return (
    <div
      className="group relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all cursor-pointer"
      style={{
        marginLeft: indent,
        background:  is_selected ? "#0f172a" : "transparent",
        border:      is_selected ? "1px solid #334155" : "1px solid transparent",
        opacity:     is_inactive ? 0.5 : 1,
      }}
      onClick={onSelect}
    >
      {/* Expand toggle */}
      <button
        onClick={e => { e.stopPropagation(); onToggle(); }}
        className="w-5 h-5 flex items-center justify-center flex-shrink-0 rounded transition-colors hover:bg-slate-700"
        style={{ visibility: has_children ? "visible" : "hidden" }}
      >
        {is_expanded
          ? <ChevronDown size={12} style={{ color: "#64748b" }} />
          : <ChevronRight size={12} style={{ color: "#64748b" }} />
        }
      </button>

      {/* Level icon */}
      <span className="text-sm flex-shrink-0">{level?.icon ?? "📦"}</span>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-mono font-black"
            style={{ color: is_selected ? "#38bdf8" : "#94a3b8" }}
          >
            {computed.location_code}
          </span>
          {node.trang_thai === "inactive" && (
            <span className="text-[9px] px-1.5 rounded-full font-bold"
              style={{ background: "#334155", color: "#64748b" }}>
              Tắt
            </span>
          )}
        </div>
        <p className="text-xs text-white truncate leading-tight">{node.ten}</p>
        {computed.la_leaf && (
          <div className="flex items-center gap-1 mt-0.5">
            <Package size={9} style={{ color: node.co_hang ? "#10b981" : "#334155" }} />
            <span className="text-[9px]" style={{ color: node.co_hang ? "#10b981" : "#475569" }}>
              {node.co_hang ? "Đang có hàng" : "Trống"}
            </span>
          </div>
        )}
        {!computed.la_leaf && (
          <p className="text-[9px]" style={{ color: "#475569" }}>
            {computed.so_o_tong} ô · {computed.so_con_truc_tiep} {level?.ten?.toLowerCase() ?? "cấp"} con
          </p>
        )}
      </div>

      {/* Actions — hiện khi hover hoặc selected */}
      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
        style={{ opacity: is_selected ? 1 : undefined }}
        onClick={e => e.stopPropagation()}
      >
        <button
          title="In tem vị trí"
          onClick={onPrint}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
          style={{ color: "#64748b" }}
        >
          <Printer size={11} />
        </button>
        <button
          title="Thêm vị trí con"
          onClick={onAdd}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
          style={{ color: "#38bdf8" }}
        >
          <Plus size={11} />
        </button>
        <button
          title="Chỉnh sửa"
          onClick={onEdit}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
          style={{ color: "#94a3b8" }}
        >
          <Edit2 size={11} />
        </button>
        <button
          title={node.co_hang ? "Đang có hàng — không thể xóa" : "Xóa vị trí"}
          onClick={onDelete}
          disabled={node.co_hang}
          className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors disabled:opacity-30"
          style={{ color: "#ef4444" }}
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}
