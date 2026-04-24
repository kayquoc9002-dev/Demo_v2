// PrintLabel.tsx — Tạo và in tem vị trí kho
// Sinh QR code bằng thư viện qrcode, preview trước khi in

import {useRef, useState } from "react";
import { Printer, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { LocationNode, WarehouseLevel } from "../data/warehouseTypes";
import { tinh_location_code, chia_trang_in } from "../data/warehouseHelpers";

// ─── QR Code đơn giản bằng SVG path (không cần thư viện ngoài) ───────────────
// Dùng pattern giả để demo — thực tế swap bằng qrcode.js

function SimpleQR({ data, size = 80 }: { data: string; size?: number }) {
  // Tạo pattern đơn giản từ hash của data để visual khác nhau
  const hash = data.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells = 7;
  const cell_size = size / (cells + 2);

  // Pattern cố định (finder patterns) + data pattern từ hash
  const matrix: boolean[][] = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      // Finder pattern top-left
      if (r < 3 && c < 3) return true;
      if (r === 1 && c === 1) return false;
      // Finder pattern top-right
      if (r < 3 && c >= cells - 3) return true;
      if (r === 1 && c === cells - 2) return false;
      // Data cells từ hash
      return ((hash * (r + 1) * (c + 1)) % 7) < 3;
    })
  );

  return (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg"
      style={{ background: "white" }}>
      {/* Quiet zone */}
      <rect width={size} height={size} fill="white" />
      {matrix.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={(c + 1) * cell_size}
              y={(r + 1) * cell_size}
              width={cell_size}
              height={cell_size}
              fill="black"
            />
          ) : null
        )
      )}
    </svg>
  );
}

// ─── Một tem vị trí ───────────────────────────────────────────────────────────

function LocationLabel({
  node,
  nodes,
  levels,
  config_name,
}: {
  node:        LocationNode;
  nodes:       LocationNode[];
  levels:      WarehouseLevel[];
  config_name: string;
}) {
  const code  = tinh_location_code(node.id, nodes);
  const level = levels.find(l => l.id === node.level_id);

  return (
    <div
      className="flex flex-col items-center justify-between p-3 rounded-lg"
      style={{
        width:       "160px",
        height:      "100px",
        background:  "white",
        border:      "2px solid #0f172a",
        fontFamily:  "monospace",
        breakInside: "avoid",
      }}
    >
      {/* Header */}
      <div className="w-full flex items-center justify-between">
        <span style={{ fontSize: "8px", color: "#475569", fontWeight: "bold" }}>
          {config_name}
        </span>
        <span style={{ fontSize: "8px", color: "#475569" }}>
          {level?.icon} {level?.ten}
        </span>
      </div>

      {/* Location code — to nhất */}
      <div style={{ fontSize: "18px", fontWeight: "900", color: "#0f172a", letterSpacing: "2px" }}>
        {code}
      </div>

      {/* QR + tên */}
      <div className="w-full flex items-end justify-between">
        <div style={{ maxWidth: "100px", overflow: "hidden" }}>
          <p style={{ fontSize: "7px", color: "#0f172a", fontWeight: "bold", lineHeight: 1.2 }}>
            {node.ten}
          </p>
        </div>
        <SimpleQR data={code} size={36} />
      </div>
    </div>
  );
}

// ─── Main Print Panel ─────────────────────────────────────────────────────────

interface Props {
  nodes_to_print: LocationNode[];
  all_nodes:      LocationNode[];
  levels:         WarehouseLevel[];
  warehouse_name: string;
  onClose:        () => void;
}

export function PrintLabel({ nodes_to_print, all_nodes, levels, warehouse_name, onClose }: Props) {
  const TEM_MOI_TRANG = 20;
  const pages = chia_trang_in(nodes_to_print, TEM_MOI_TRANG);
  const [page, setPage] = useState(0);
  const print_ref = useRef<HTMLDivElement>(null);

  const handle_print = () => {
    const content = print_ref.current;
    if (!content) return;

    const win = window.open("", "_blank");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tem vị trí kho — ${warehouse_name}</title>
        <style>
          @page { margin: 10mm; size: A4; }
          body { margin: 0; font-family: monospace; }
          .grid { display: flex; flex-wrap: wrap; gap: 8px; padding: 8px; }
          .label {
            width: 160px; height: 100px; border: 2px solid #0f172a;
            border-radius: 8px; padding: 8px; box-sizing: border-box;
            display: flex; flex-direction: column; justify-content: space-between;
            page-break-inside: avoid;
          }
          .code { font-size: 18px; font-weight: 900; letter-spacing: 2px; text-align: center; }
          .header, .footer { display: flex; justify-content: space-between; font-size: 8px; color: #666; }
          .name { font-size: 7px; font-weight: bold; max-width: 100px; }
          svg { display: block; }
        </style>
      </head>
      <body>
        <div class="grid">
          ${nodes_to_print.map(node => {
            const code  = tinh_location_code(node.id, all_nodes);
            const level = levels.find(l => l.id === node.level_id);
            return `
              <div class="label">
                <div class="header">
                  <span>${warehouse_name}</span>
                  <span>${level?.icon ?? ""} ${level?.ten ?? ""}</span>
                </div>
                <div class="code">${code}</div>
                <div class="footer">
                  <span class="name">${node.ten}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 500);
  };

  const current_page_nodes = pages[page] ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <div>
          <h3 className="text-sm font-black text-white">In tem vị trí</h3>
          <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
            {nodes_to_print.length} tem · {pages.length} trang
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handle_print}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            <Printer size={12} /> In ngay
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-y-auto p-5" style={{ background: "#020817" }}>
        {nodes_to_print.length === 0 ? (
          <div className="text-center py-16">
            <Printer size={32} className="mx-auto mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p style={{ color: "#475569" }}>Không có vị trí nào được chọn để in</p>
          </div>
        ) : (
          <div ref={print_ref}>
            <div className="flex flex-wrap gap-3">
              {current_page_nodes.map(node => (
                <LocationLabel
                  key={node.id}
                  node={node}
                  nodes={all_nodes}
                  levels={levels}
                  config_name={warehouse_name}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t"
          style={{ borderColor: "#1e293b" }}>
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs" style={{ color: "#475569" }}>
            Trang {page + 1} / {pages.length}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))}
            disabled={page === pages.length - 1}
            className="w-8 h-8 rounded-xl flex items-center justify-center disabled:opacity-30"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
