// SkuRuleManager.tsx — Module 2b: Thiết lập Quy tắc SKU ↔ Vị trí
// Trang chính ghép: danh sách rules + form + cảnh báo tồn kho

import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Star,
  AlertTriangle,
  Package,
  X,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import type {
  SkuLocationRule,
  LocationNode,
  WarehouseLevel,
} from "../../../components/Kho/data/warehouseTypes";
import type {
  TonKhoCanhBao,
  SkuRuleStats,
} from "../../../components/Kho/data/skuRuleHelpers";
import {
  tinh_canh_bao_ton_kho,
  tinh_stats_rules,
  type SkuRuleFormData,
} from "../../../components/Kho/data/skuRuleHelpers";
import { MOCK_SKU_RULES } from "../../../components/Kho/data/warehouseMockData";
import {
  MOCK_NODES,
  MOCK_WAREHOUSE_CONFIG,
} from "../../../components/Kho/data/warehouseMockData";
import { tinh_location_code } from "../../../components/Kho/data/warehouseHelpers";
import { tao_sku_rule_moi } from "../../../components/Kho/data/warehouseStore";
import { MOCK_SKU } from "./XuatNhapKho";
import type { SKUOption } from "../../../components/Kho/SoDoKho/SkuRuleForm";
import { SkuRuleForm } from "../../../components/Kho/SoDoKho/SkuRuleForm";
import { BreadcrumbPath } from "../../../components/Kho/SoDoKho/BreadcrumbPath";
// ─── Format helpers ───────────────────────────────────────────────────────────

const fmt_so = (n: number) => n.toLocaleString("vi-VN");

// ─── CanhBaoCard — hiển thị 1 cảnh báo tồn kho ───────────────────────────────

function CanhBaoCard({
  cb,
  nodes,
  levels,
}: {
  cb: TonKhoCanhBao;
  nodes: LocationNode[];
  levels: WarehouseLevel[];
}) {
  const node = nodes.find((n) => n.id === cb.node_id);
  const mau = cb.muc_do === "nguy_hiem" ? "#ef4444" : "#f59e0b";
  const nen = cb.muc_do === "nguy_hiem" ? "#7f1d1d20" : "#78350f20";

  const pct =
    cb.dinh_muc_min > 0
      ? Math.round((cb.ton_kho_hien_tai / cb.dinh_muc_min) * 100)
      : 0;

  return (
    <div
      className="px-4 py-3 rounded-xl"
      style={{ background: nen, border: `1px solid ${mau}30` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <AlertTriangle size={11} style={{ color: mau, flexShrink: 0 }} />
            <code className="text-[10px] font-black" style={{ color: mau }}>
              {cb.ma_sku}
            </code>
          </div>
          <p className="text-xs text-white truncate">{cb.ten_sp}</p>
          {node && (
            <div className="mt-1">
              <BreadcrumbPath
                node={node}
                nodes={nodes}
                levels={levels}
                showCode={true}
              />
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-black leading-none" style={{ color: mau }}>
            {cb.ton_kho_hien_tai}
          </p>
          <p className="text-[9px]" style={{ color: "#475569" }}>
            / {cb.dinh_muc_min} min
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div
        className="mt-2 h-1.5 rounded-full overflow-hidden"
        style={{ background: "#1e293b" }}
      >
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${Math.min(pct, 100)}%`, background: mau }}
        />
      </div>
    </div>
  );
}

// ─── RuleRow — 1 dòng trong bảng danh sách rules ─────────────────────────────

function RuleRow({
  rule,
  nodes,
  levels,
  canh_bao_map,
  on_edit,
  on_delete,
}: {
  rule: SkuLocationRule;
  nodes: LocationNode[];
  levels: WarehouseLevel[];
  canh_bao_map: Map<string, TonKhoCanhBao>;
  on_edit: (r: SkuLocationRule) => void;
  on_delete: (r: SkuLocationRule) => void;
}) {
  const node = nodes.find((n) => n.id === rule.node_id);
  const cb = canh_bao_map.get(rule.id);
  const mau_cb =
    cb?.muc_do === "nguy_hiem" ? "#ef4444" : cb ? "#f59e0b" : undefined;

  return (
    <div
      className="grid items-center gap-3 px-4 py-3 hover:bg-slate-800/20 transition-colors"
      style={{ gridTemplateColumns: "1fr 1.2fr 80px 80px 80px 72px" }}
    >
      {/* SKU */}
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          {rule.la_vi_tri_mac_dinh && (
            <Star
              size={10}
              style={{ color: "#f59e0b", fill: "#f59e0b", flexShrink: 0 }}
            />
          )}
          <code
            className="text-[10px] font-black truncate"
            style={{ color: mau_cb ?? "#94a3b8" }}
          >
            {rule.ma_sku}
          </code>
        </div>
        <p className="text-[10px] truncate mt-0.5" style={{ color: "#475569" }}>
          {rule.ten_sp}
        </p>
      </div>

      {/* Vị trí */}
      <div className="min-w-0">
        {node ? (
          <BreadcrumbPath
            node={node}
            nodes={nodes}
            levels={levels}
            showCode={true}
          />
        ) : (
          <span className="text-[10px]" style={{ color: "#475569" }}>
            —
          </span>
        )}
      </div>

      {/* Tồn kho hiện tại (lấy từ MOCK) */}
      <div className="text-center">
        {cb ? (
          <span className="text-sm font-black" style={{ color: mau_cb }}>
            {cb.ton_kho_hien_tai}
          </span>
        ) : (
          <span className="text-sm font-black text-white">—</span>
        )}
      </div>

      {/* Min */}
      <div className="text-center">
        <span className="text-xs font-bold" style={{ color: "#ef4444" }}>
          {fmt_so(rule.dinh_muc_min)}
        </span>
      </div>

      {/* Max */}
      <div className="text-center">
        <span className="text-xs font-bold" style={{ color: "#10b981" }}>
          {fmt_so(rule.dinh_muc_max)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => on_edit(rule)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
          style={{ color: "#64748b" }}
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={() => on_delete(rule)}
          className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-950/40 transition-colors"
          style={{ color: "#ef4444" }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SkuRuleManager() {
  const [rules, setRules] = useState<SkuLocationRule[]>(MOCK_SKU_RULES);
  const [nodes] = useState<LocationNode[]>(MOCK_NODES);
  const [config] = useState(MOCK_WAREHOUSE_CONFIG);
  const [show_form, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SkuLocationRule | null>(null);
  const [search, setSearch] = useState("");
  const [filter_cb, setFilterCb] = useState(false); // Chỉ hiện SKU có cảnh báo
  const [show_cb, setShowCb] = useState(true); // Panel cảnh báo bên phải

  // Map tồn kho từ MOCK_SKU
  const ton_kho_map = useMemo(
    () => Object.fromEntries(MOCK_SKU.map((s) => [s.ma_sku, s.ton_kho])),
    [],
  );

  // SKU options — map từ MOCK_SKU sang SKUOption
  const sku_options: SKUOption[] = useMemo(
    () =>
      MOCK_SKU.map((s) => ({
        ma_sku: s.ma_sku,
        ten_sp: s.ten_sp,
        mau_sac: s.mau_sac,
        kich_thuoc: s.kich_thuoc,
        ton_kho: s.ton_kho,
      })),
    [],
  );

  // Tính cảnh báo
  const canh_bao_list = useMemo(
    () => tinh_canh_bao_ton_kho(rules, ton_kho_map),
    [rules, ton_kho_map],
  );

  const canh_bao_map = useMemo(
    () => new Map(canh_bao_list.map((cb) => [cb.rule_id, cb])),
    [canh_bao_list],
  );

  const stats: SkuRuleStats = useMemo(
    () => tinh_stats_rules(rules, canh_bao_list),
    [rules, canh_bao_list],
  );

  // Filter + search
  const filtered_rules = useMemo(() => {
    let list = rules;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.ma_sku.toLowerCase().includes(q) ||
          r.ten_sp.toLowerCase().includes(q),
      );
    }
    if (filter_cb) {
      const canh_bao_rule_ids = new Set(canh_bao_list.map((cb) => cb.rule_id));
      list = list.filter((r) => canh_bao_rule_ids.has(r.id));
    }
    return list;
  }, [rules, search, filter_cb, canh_bao_list]);

  // Group by SKU để hiển thị dạng accordion
  const grouped = useMemo(() => {
    const map = new Map<string, SkuLocationRule[]>();
    for (const r of filtered_rules) {
      const list = map.get(r.ma_sku) ?? [];
      list.push(r);
      map.set(r.ma_sku, list);
    }
    return map;
  }, [filtered_rules]);

  const [expanded_skus, setExpandedSkus] = useState<Set<string>>(new Set());
  const toggle_sku = (ma: string) =>
    setExpandedSkus((prev) => {
      const n = new Set(prev);
      n.has(ma) ? n.delete(ma) : n.add(ma);
      return n;
    });

  // ── Actions ──

  const handle_save = (data: SkuRuleFormData) => {
    if (editing) {
      // Nếu đổi primary → xóa primary cũ
      if (data.la_vi_tri_mac_dinh) {
        setRules((prev) =>
          prev.map((r) =>
            r.ma_sku === data.ma_sku && r.id !== editing.id
              ? { ...r, la_vi_tri_mac_dinh: false }
              : r,
          ),
        );
      }
      setRules((prev) =>
        prev.map((r) => (r.id === editing.id ? { ...r, ...data } : r)),
      );
    } else {
      // Tạo mới — auto-swap primary nếu cần
      if (data.la_vi_tri_mac_dinh) {
        setRules((prev) =>
          prev.map((r) =>
            r.ma_sku === data.ma_sku ? { ...r, la_vi_tri_mac_dinh: false } : r,
          ),
        );
      }
      const ten_sp =
        sku_options.find((s) => s.ma_sku === data.ma_sku)?.ten_sp ??
        data.ma_sku;
      setRules((prev) => [...prev, tao_sku_rule_moi({ ...data, ten_sp })]);
    }
    setShowForm(false);
    setEditing(null);
  };

  const handle_delete = (rule: SkuLocationRule) => {
    setRules((prev) => prev.filter((r) => r.id !== rule.id));
  };

  const handle_edit = (rule: SkuLocationRule) => {
    setEditing(rule);
    setShowForm(true);
  };

  return (
    <div
      className="flex h-full overflow-hidden"
      style={{ background: "#020817" }}
    >
      {/* ── LEFT: Danh sách rules ──────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-black text-white">
                Quy tắc SKU ↔ Vị trí
              </h2>
              <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
                Gán SKU vào vị trí kho · thiết lập định mức tồn kho
              </p>
            </div>
            <button
              onClick={() => {
                setEditing(null);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "#0c435425",
                color: "#38bdf8",
                border: "1px solid #38bdf840",
              }}
            >
              <Plus size={13} /> Thêm quy tắc
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {[
              { label: "Tổng rules", val: stats.tong_rules, color: "#94a3b8" },
              {
                label: "SKU đã gán",
                val: stats.tong_sku_co_rule,
                color: "#38bdf8",
              },
              {
                label: "Thiếu hàng",
                val: stats.so_canh_bao_thieu,
                color: "#ef4444",
              },
              {
                label: "Dư hàng",
                val: stats.so_canh_bao_thua,
                color: "#f59e0b",
              },
            ].map(({ label, val, color }) => (
              <div
                key={label}
                className="px-3 py-2 rounded-xl text-center"
                style={{ background: "#0f172a", border: "1px solid #1e293b" }}
              >
                <p className="text-lg font-black" style={{ color }}>
                  {val}
                </p>
                <p className="text-[9px]" style={{ color: "#475569" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#475569" }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã SKU, tên sản phẩm..."
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
            <button
              onClick={() => setFilterCb((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
              style={{
                background: filter_cb ? "#7f1d1d20" : "#1e293b",
                color: filter_cb ? "#ef4444" : "#64748b",
                border: `1px solid ${filter_cb ? "#ef444430" : "#334155"}`,
              }}
            >
              <Filter size={12} />
              Cảnh báo
              {canh_bao_list.length > 0 && (
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                  style={{ background: "#ef444420", color: "#ef4444" }}
                >
                  {canh_bao_list.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowCb((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: "#1e293b",
                color: "#64748b",
                border: "1px solid #334155",
              }}
            >
              <AlertTriangle size={12} />
              {show_cb ? "Ẩn" : "Hiện"} cảnh báo
            </button>
          </div>
        </div>

        {/* Table header */}
        <div
          className="flex-shrink-0 grid px-4 py-2 text-[9px] font-black uppercase tracking-widest"
          style={{
            gridTemplateColumns: "1fr 1.2fr 80px 80px 80px 72px",
            background: "#0a1628",
            color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <span>SKU / Sản phẩm</span>
          <span>Vị trí kho</span>
          <span className="text-center">Tồn hiện tại</span>
          <span className="text-center">Min</span>
          <span className="text-center">Max</span>
          <span />
        </div>

        {/* Table body — grouped by SKU */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {grouped.size === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Package
                size={36}
                className="mb-3 opacity-20"
                style={{ color: "#64748b" }}
              />
              <p className="text-sm font-bold" style={{ color: "#475569" }}>
                {search || filter_cb
                  ? "Không tìm thấy rule nào"
                  : "Chưa có quy tắc nào"}
              </p>
              {!search && !filter_cb && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="mt-3 text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: "#0c435425", color: "#38bdf8" }}
                >
                  Thêm quy tắc đầu tiên
                </button>
              )}
            </div>
          ) : (
            Array.from(grouped.entries()).map(([ma_sku, sku_rules]) => {
              const is_expanded = expanded_skus.has(ma_sku);
              const primary = sku_rules.find((r) => r.la_vi_tri_mac_dinh);
              const sku_info = sku_options.find((s) => s.ma_sku === ma_sku);
              const has_cb = sku_rules.some((r) => canh_bao_map.has(r.id));

              return (
                <div key={ma_sku} style={{ borderBottom: "1px solid #0f172a" }}>
                  {/* SKU group header */}
                  <button
                    onClick={() => toggle_sku(ma_sku)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/30 transition-colors text-left"
                    style={{
                      background: is_expanded ? "#0a1628" : "transparent",
                    }}
                  >
                    {is_expanded ? (
                      <ChevronDown
                        size={13}
                        style={{ color: "#64748b", flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronRight
                        size={13}
                        style={{ color: "#64748b", flexShrink: 0 }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code
                          className="text-xs font-black"
                          style={{ color: has_cb ? "#f59e0b" : "#94a3b8" }}
                        >
                          {ma_sku}
                        </code>
                        {has_cb && (
                          <AlertTriangle
                            size={10}
                            style={{ color: "#f59e0b" }}
                          />
                        )}
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full"
                          style={{ background: "#1e293b", color: "#475569" }}
                        >
                          {sku_rules.length} vị trí
                        </span>
                      </div>
                      <p
                        className="text-[10px] truncate"
                        style={{ color: "#475569" }}
                      >
                        {sku_info?.ten_sp} · {sku_info?.mau_sac} ·{" "}
                        {sku_info?.kich_thuoc}
                      </p>
                    </div>
                    {primary && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Star
                          size={10}
                          style={{ color: "#f59e0b", fill: "#f59e0b" }}
                        />
                        <span
                          className="text-[9px]"
                          style={{ color: "#f59e0b" }}
                        >
                          {tinh_location_code(primary.node_id, nodes)}
                        </span>
                      </div>
                    )}
                  </button>

                  {/* Rules của SKU này */}
                  {is_expanded &&
                    sku_rules.map((rule) => (
                      <RuleRow
                        key={rule.id}
                        rule={rule}
                        nodes={nodes}
                        levels={config.levels}
                        canh_bao_map={canh_bao_map}
                        on_edit={handle_edit}
                        on_delete={handle_delete}
                      />
                    ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Cảnh báo tồn kho ───────────────────────────── */}
      {show_cb && (
        <div
          className="flex flex-col border-l flex-shrink-0"
          style={{ width: "300px", borderColor: "#1e293b" }}
        >
          <div
            className="px-4 py-4 border-b flex-shrink-0"
            style={{ borderColor: "#1e293b" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle
                  size={14}
                  style={{
                    color: canh_bao_list.length > 0 ? "#ef4444" : "#334155",
                  }}
                />
                <h3 className="text-sm font-black text-white">
                  Cảnh báo tồn kho
                </h3>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{
                  background:
                    canh_bao_list.length > 0 ? "#7f1d1d20" : "#1e293b",
                  color: canh_bao_list.length > 0 ? "#ef4444" : "#475569",
                }}
              >
                {canh_bao_list.length}
              </span>
            </div>
            <p className="text-[10px] mt-1" style={{ color: "#475569" }}>
              SKU dưới định mức tối thiểu
            </p>
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-2"
            style={{ scrollbarWidth: "thin" }}
          >
            {canh_bao_list.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-10">
                <CheckCircle
                  size={28}
                  className="mb-3 opacity-30"
                  style={{ color: "#10b981" }}
                />
                <p
                  className="text-xs font-bold text-center"
                  style={{ color: "#475569" }}
                >
                  Tất cả SKU đang trong mức an toàn
                </p>
              </div>
            ) : (
              canh_bao_list.map((cb) => (
                <CanhBaoCard
                  key={cb.rule_id}
                  cb={cb}
                  nodes={nodes}
                  levels={config.levels}
                />
              ))
            )}
          </div>

          {canh_bao_list.length > 0 && (
            <div
              className="px-4 py-3 border-t flex-shrink-0"
              style={{ borderColor: "#1e293b" }}
            >
              <button
                className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                style={{ background: "#1e293b", color: "#64748b" }}
              >
                <RefreshCw size={12} /> Cập nhật tồn kho
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── FORM OVERLAY ──────────────────────────────────────── */}
      {show_form && (
        <div
          className="absolute inset-0 z-40 flex items-start justify-end"
          style={{
            background: "rgba(2,8,23,0.7)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => {
            setShowForm(false);
            setEditing(null);
          }}
        >
          <div
            className="h-full overflow-hidden flex flex-col"
            style={{
              width: "420px",
              background: "#0a1628",
              borderLeft: "1px solid #1e293b",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <SkuRuleForm
              editing={editing ?? undefined}
              rules={rules}
              nodes={nodes}
              levels={config.levels}
              sku_options={sku_options}
              onSave={handle_save}
              onCancel={() => {
                setShowForm(false);
                setEditing(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
