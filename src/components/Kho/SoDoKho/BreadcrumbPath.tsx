// BreadcrumbPath.tsx — Hiển thị đường dẫn từ root đến node hiện tại
// Tái sử dụng ở: tree panel, form header, print label

import type { LocationNode, WarehouseLevel } from "../data/warehouseTypes";
import { lay_ancestors, tinh_location_code } from "../data/warehouseHelpers";

interface Props {
  node:    LocationNode;
  nodes:   LocationNode[];
  levels:  WarehouseLevel[];
  onClick?: (node: LocationNode) => void;
  showCode?: boolean;
}

export function BreadcrumbPath({ node, nodes, levels, onClick, showCode = true }: Props) {
  const ancestors = lay_ancestors(node.id, nodes);
  const path = [...ancestors, node];
  const code  = tinh_location_code(node.id, nodes);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {path.map((n, i) => {
        const level = levels.find(l => l.id === n.level_id);
        const is_last = i === path.length - 1;
        return (
          <div key={n.id} className="flex items-center gap-1">
            {i > 0 && (
              <span className="text-[10px]" style={{ color: "#334155" }}>/</span>
            )}
            <button
              onClick={() => onClick?.(n)}
              disabled={!onClick}
              className="flex items-center gap-1 text-[10px] font-bold rounded px-1 py-0.5 transition-colors"
              style={{
                color:      is_last ? "white" : "#64748b",
                background: is_last ? "#1e293b" : "transparent",
                cursor:     onClick ? "pointer" : "default",
              }}
            >
              <span>{level?.icon}</span>
              <span>{n.prefix}</span>
            </button>
          </div>
        );
      })}

      {showCode && (
        <span
          className="ml-1 text-[9px] font-mono px-2 py-0.5 rounded-full"
          style={{ background: "#0c4a6e30", color: "#38bdf8" }}
        >
          {code}
        </span>
      )}
    </div>
  );
}
