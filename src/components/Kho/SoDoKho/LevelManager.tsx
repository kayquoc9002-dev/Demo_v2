// LevelManager.tsx — Quản lý các cấp phân cấp (Zone, Aisle, Rack, Bin...)
// Cho phép thêm/sửa/xóa/sắp xếp cấp, drag-to-reorder

import { useState } from "react";
import { Plus, Trash2, GripVertical, Check, X, AlertTriangle } from "lucide-react";
import type { WarehouseLevel, LocationNode } from "../data/warehouseTypes";
import { gen_id } from "../data/warehouseHelpers";

const ICON_OPTIONS = ["🏭","📍","🗄️","📦","🏷️","📂","🔲","🗂️","📋","🏗️"];

interface Props {
  levels:   WarehouseLevel[];
  nodes:    LocationNode[];
  onChange: (levels: WarehouseLevel[]) => void;
}

export function LevelManager({ levels, nodes, onChange }: Props) {
  const sorted = [...levels].sort((a, b) => a.thu_tu - b.thu_tu);

  const [editing_id, setEditingId] = useState<string | null>(null);
  const [edit_val,   setEditVal]   = useState({ ten: "", icon: "" });
  const [adding,     setAdding]    = useState(false);
  const [new_val,    setNewVal]    = useState({ ten: "", icon: "📦" });
  const [drag_over,  setDragOver]  = useState<string | null>(null);
  const [drag_src,   setDragSrc]   = useState<string | null>(null);

  // Kiểm tra level có đang được dùng không
  const level_dang_dung = (level_id: string) =>
    nodes.some(n => n.level_id === level_id);

  const handle_add = () => {
    if (!new_val.ten.trim()) return;
    const max_thu_tu = sorted.length > 0 ? Math.max(...sorted.map(l => l.thu_tu)) : 0;
    const new_level: WarehouseLevel = {
      id:     gen_id(),
      ten:    new_val.ten.trim(),
      icon:   new_val.icon,
      thu_tu: max_thu_tu + 1,
    };
    onChange([...levels, new_level]);
    setNewVal({ ten: "", icon: "📦" });
    setAdding(false);
  };

  const handle_edit_save = () => {
    if (!editing_id || !edit_val.ten.trim()) return;
    onChange(levels.map(l =>
      l.id === editing_id ? { ...l, ten: edit_val.ten.trim(), icon: edit_val.icon } : l
    ));
    setEditingId(null);
  };

  const handle_delete = (id: string) => {
    if (level_dang_dung(id)) return;
    onChange(levels.filter(l => l.id !== id));
  };

  // Drag-to-reorder
  const handle_drag_end = (src_id: string, over_id: string) => {
    if (src_id === over_id) return;
    const src_idx  = sorted.findIndex(l => l.id === src_id);
    const over_idx = sorted.findIndex(l => l.id === over_id);
    const reordered = [...sorted];
    reordered.splice(over_idx, 0, reordered.splice(src_idx, 1)[0]);
    onChange(reordered.map((l, i) => ({ ...l, thu_tu: i + 1 })));
    setDragSrc(null);
    setDragOver(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-white">Cấp phân cấp kho</h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
            Kéo để sắp xếp thứ tự · từ cao nhất (cấp 1) xuống thấp nhất
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}
        >
          <Plus size={12} /> Thêm cấp
        </button>
      </div>

      {/* Danh sách cấp */}
      <div className="space-y-2">
        {sorted.map((level, idx) => {
          const is_editing = editing_id === level.id;
          const dang_dung  = level_dang_dung(level.id);

          return (
            <div
              key={level.id}
              draggable
              onDragStart={() => setDragSrc(level.id)}
              onDragOver={e => { e.preventDefault(); setDragOver(level.id); }}
              onDrop={() => drag_src && handle_drag_end(drag_src, level.id)}
              onDragEnd={() => { setDragSrc(null); setDragOver(null); }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
              style={{
                background: drag_over === level.id ? "#1e293b" : "#0f172a",
                border:     `1px solid ${drag_over === level.id ? "#38bdf8" : "#1e293b"}`,
                opacity:    drag_src === level.id ? 0.4 : 1,
              }}
            >
              {/* Drag handle */}
              <GripVertical size={14} style={{ color: "#334155", cursor: "grab", flexShrink: 0 }} />

              {/* Số thứ tự */}
              <span
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: "#1e293b", color: "#64748b" }}
              >
                {idx + 1}
              </span>

              {is_editing ? (
                // Edit mode
                <>
                  <div className="flex items-center gap-2 flex-1">
                    {/* Icon picker */}
                    <div className="relative">
                      <select
                        value={edit_val.icon}
                        onChange={e => setEditVal(v => ({ ...v, icon: e.target.value }))}
                        className="appearance-none w-10 h-8 text-center rounded-lg text-sm outline-none cursor-pointer"
                        style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}
                      >
                        {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                      </select>
                    </div>
                    <input
                      value={edit_val.ten}
                      onChange={e => setEditVal(v => ({ ...v, ten: e.target.value }))}
                      onKeyDown={e => { if (e.key === "Enter") handle_edit_save(); if (e.key === "Escape") setEditingId(null); }}
                      autoFocus
                      className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
                      style={{ background: "#1e293b", border: "1px solid #38bdf8", color: "white" }}
                    />
                  </div>
                  <button onClick={handle_edit_save}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "#06472520", color: "#10b981" }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "#1e293b", color: "#64748b" }}>
                    <X size={13} />
                  </button>
                </>
              ) : (
                // View mode
                <>
                  <span className="text-lg flex-shrink-0">{level.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{level.ten}</p>
                    {dang_dung && (
                      <p className="text-[9px]" style={{ color: "#475569" }}>
                        Đang được dùng · không thể xóa
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setEditingId(level.id); setEditVal({ ten: level.ten, icon: level.icon }); }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                    style={{ color: "#64748b" }}>
                    <Plus size={11} style={{ transform: "rotate(45deg)" }} />
                  </button>
                  <button
                    onClick={() => handle_delete(level.id)}
                    disabled={dang_dung}
                    title={dang_dung ? "Cấp này đang được dùng" : "Xóa cấp"}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-950/40 transition-colors disabled:opacity-30"
                    style={{ color: "#ef4444" }}>
                    <Trash2 size={11} />
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Form thêm cấp mới */}
      {adding && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid #38bdf840" }}>
          <select
            value={new_val.icon}
            onChange={e => setNewVal(v => ({ ...v, icon: e.target.value }))}
            className="w-10 h-8 text-center rounded-lg text-sm outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
          </select>
          <input
            value={new_val.ten}
            onChange={e => setNewVal(v => ({ ...v, ten: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") handle_add(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Tên cấp, VD: Khu vực, Dãy, Kệ..."
            autoFocus
            className="flex-1 px-2 py-1.5 rounded-lg text-sm outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}
          />
          <button onClick={handle_add}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#06472520", color: "#10b981" }}>
            <Check size={13} />
          </button>
          <button onClick={() => setAdding(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>
      )}

      {sorted.length === 0 && !adding && (
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: "#475569" }}>
            Chưa có cấp nào. Bắt đầu bằng cách thêm cấp đầu tiên.
          </p>
        </div>
      )}

      {/* Cảnh báo nếu chỉ có 1 cấp */}
      {sorted.length === 1 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "#78350f20", border: "1px solid #f59e0b30" }}>
          <AlertTriangle size={12} style={{ color: "#f59e0b" }} />
          <p className="text-[10px]" style={{ color: "#f59e0b" }}>
            Nên có ít nhất 2 cấp để phân cấp vị trí hiệu quả
          </p>
        </div>
      )}
    </div>
  );
}
