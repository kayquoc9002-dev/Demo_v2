// ─────────────────────────────────────────────────────────────────────────────
// TabPRApproval.tsx — Tab 1: Duyệt yêu cầu mua hàng
// Tree table: dòng cha (Product) expand/collapse → dòng con (SKU)
// Dòng cha: so_luong_duyet = sum SKU con | Dòng con: input nhập tay
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Package, Check,
  AlertTriangle, Send,
} from "lucide-react";
import type { PRItem, PRItemSKU } from "./data/purchaseTypes";
import { LY_DO_PR_CONFIG } from "./data/purchaseTypes";
import {
  layDanhSachPR, duyetPR, tuChoiPR,
  tinh_tong_duyet, dinh_dang_tien, la_hang_loi_mua,
} from "./service/purchaseService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function format_toc_do(toc_do: number) {
  if (toc_do >= 3)  return { text: `${toc_do.toFixed(1)}/ngày`, mau: "#10b981" };
  if (toc_do >= 1)  return { text: `${toc_do.toFixed(1)}/ngày`, mau: "#f59e0b" };
  return              { text: `${toc_do.toFixed(1)}/ngày`, mau: "#ef4444" };
}

function format_ngay_du_kien(lead_time: number) {
  const d = new Date();
  d.setDate(d.getDate() + lead_time);
  return d.toLocaleDateString("vi-VN");
}

// ─── Badge lý do ─────────────────────────────────────────────────────────────

function LyDoBadge({ ly_do }: { ly_do: PRItem["ly_do"] }) {
  const cfg = LY_DO_PR_CONFIG[ly_do];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
      style={{ background: cfg.mau + "20", color: cfg.mau }}>
      {cfg.icon} {cfg.nhan}
    </span>
  );
}

// ─── Tooltip tốc độ ─────────────────────────────────────────────────────────────

function TooltipTocDo({ sku }: { sku: PRItemSKU }) {
  const [show, setShow] = useState(false);
  const toc_do = format_toc_do(sku.toc_do_ban);

  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      
      <span className="text-xs font-bold cursor-help" style={{ color: toc_do.mau }}>
        {toc_do.text}
      </span>

      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 pointer-events-none"
          style={{ minWidth: 150 }}>
          <div className="rounded-xl px-3 py-2 shadow-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <p className="text-[9px] font-black uppercase mb-1.5" style={{ color: "#334155" }}>
              30 ngày qua
            </p>
            <div className="flex items-center justify-between gap-3 mb-1">
              <span className="text-[10px]" style={{ color: "#94a3b8" }}>Lẻ</span>
              <span className="text-[10px] font-black" style={{ color: "#10b981" }}>
                {sku.ban_30_ngay_le} · {sku.toc_do_ban_le.toFixed(1)}/ng
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px]" style={{ color: "#94a3b8" }}>Sỉ</span>
              <span className="text-[10px] font-black" style={{ color: "#38bdf8" }}>
                {sku.ban_30_ngay_si} · {sku.toc_do_ban_si.toFixed(1)}/ng
              </span>
            </div>
          </div>
          <div className="w-2 h-2 mx-auto -mt-1 rotate-45"
            style={{ background: "#0f172a", borderRight: "1px solid #1e293b",
              borderBottom: "1px solid #1e293b" }} />
        </div>
      )}
    </div>
  );
}

// ─── Dòng con — SKU ──────────────────────────────────────────────────────────

function SKURow({ sku, onChange, la_loi_mua }: {
  sku:        PRItemSKU;
  onChange:   (sku_id: string, val: number) => void;
  la_loi_mua: boolean;
}) {
  const toc_do = format_toc_do(sku.toc_do_ban);

  return (
    <div className="grid items-center px-4 py-2.5 gap-2 group"
      style={{
        gridTemplateColumns: "32px 24px 200px 70px 90px 80px 80px 80px 80px 200px 90px",
        background:          la_loi_mua ? "#7f1d1d08" : "#0a1628",
        borderBottom:        "1px solid #0f172a",
      }}>

      {/* Indent + dot màu */}
      <div />
      <div className="flex items-center justify-center">
        <div className="w-2 h-2 rounded-full border border-white/20 flex-shrink-0"
          style={{ background: sku.color_hex }} />
      </div>

      {/* SKU info */}
      <div className="min-w-0">
        <code className="text-[10px] font-bold" style={{ color: "#64748b" }}>
          {sku.ma_sku}
        </code>
        <p className="text-[9px]" style={{ color: "#334155" }}>
          {sku.color_name} / {sku.size_code}
        </p>
      </div>

      {/* Tồn kho */}
      <div className="text-center">
        <span className="text-sm font-black"
          style={{ color: sku.ton_kho <= 5 ? "#ef4444" : sku.ton_kho <= 20 ? "#f59e0b" : "#94a3b8" }}>
          {sku.ton_kho}
        </span>
      </div>

      {/* Đang đi đường */}
      <div className="text-center">
        <span className="text-xs font-bold" style={{ color: sku.dang_di_duong > 0 ? "#38bdf8" : "#334155" }}>
          {sku.dang_di_duong > 0 ? `+${sku.dang_di_duong}` : ""}
        </span>
      </div>

      {/* Bán 30 ngày */}
      <div className="text-center">
        <span className="text-xs font-bold" style={{ color: "#94a3b8" }}>
          {sku.ban_30_ngay}
        </span>
      </div>

      {/* Mùa vụ — trống vì kế thừa từ dòng cha */}
      <div />

      {/* Tốc độ bán */}
      <TooltipTocDo sku={sku}/>
      
      {/* Tốc độ bán — có tooltip */}
      


      {/* Kho xin */}
      <div className="text-center">
        <span className="text-xs font-bold" style={{ color: "#475569" }}>
          {sku.so_luong_xin}
        </span>
      </div>

      {/* Ô duyệt — có nút điền nhanh */}
      <div className="flex items-center gap-1">
        <input
          type="number" min={0}
          value={sku.so_luong_duyet || ""}
          onChange={e => onChange(sku.sku_id, Number(e.target.value))}
          placeholder="0"
          className="flex-1 text-center text-sm font-black outline-none rounded-xl py-1.5 px-2"
          style={{
            background: sku.so_luong_duyet > 0 ? "#0c435425" : "#1e293b",
            border:     `1px solid ${sku.so_luong_duyet > 0 ? "#38bdf840" : "#334155"}`,
            color:      sku.so_luong_duyet > 0 ? "#38bdf8" : "#475569",
            width: "100%"
          }} />
        {/* Nút điền nhanh */}
        <button
          onClick={() => onChange(sku.sku_id, sku.so_luong_xin)}
          title={`Điền nhanh: ${sku.so_luong_xin}`}
          className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
            transition-all hover:opacity-80"
          style={{
            background: "#1e293b",
            color:      "#475569",
            fontSize:   14,
          }}>
          🪄
        </button>
      </div>


      {/* NCC + lead time */}
      {/* <div className="min-w-0">
        <p className="text-[9px] truncate" style={{ color: "#475569" }}>
          —
        </p>
      </div> */}
    </div>
  );
}

// ─── Dòng cha — Product ───────────────────────────────────────────────────────

function ProductRow({ item, expanded, selected, onToggle, onSelect, onSkuChange }: {
  item:        PRItem;
  expanded:    boolean;
  selected:    boolean;
  onToggle:    () => void;
  onSelect:    (checked: boolean) => void;
  onSkuChange: (pr_id: string, sku_id: string, val: number) => void;
}) {
  const tong_duyet = tinh_tong_duyet(item.skus);
  const toc_do     = format_toc_do(item.toc_do_ban);
  const loi_mua    = la_hang_loi_mua(item.season_code);
  const ly_do_cfg  = LY_DO_PR_CONFIG[item.ly_do];

  return (
    <>
      {/* Dòng cha */}
      <div
        className="grid items-center px-4 py-3 gap-2 cursor-pointer transition-all group"
        style={{
          gridTemplateColumns: "32px 24px 200px 70px 90px 80px 80px 80px 80px 200px 90px",
          background:   loi_mua ? "#7f1d1d15" : "#0f172a",
          borderBottom: "1px solid #1e293b",
          borderLeft:   loi_mua ? "3px solid #ef4444" : "3px solid transparent",
        }}
        onClick={onToggle}>

        {/* Checkbox */}
        <div onClick={e => e.stopPropagation()}>
          <input type="checkbox" checked={selected}
            onChange={e => onSelect(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
        </div>

        {/* Expand icon */}
        <div className="flex items-center justify-center" style={{ color: "#475569" }}>
          {expanded
            ? <ChevronDown size={13} />
            : <ChevronRight size={13} />}
        </div>

        {/* Tên sản phẩm */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-black text-white truncate">{item.ten_sp}</p>
            {loi_mua && (
              <span className="flex items-center gap-1 text-[9px] font-bold flex-shrink-0"
                style={{ color: "#ef4444" }}>
                <AlertTriangle size={9} /> Lỗi mùa
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <code className="text-[9px]" style={{ color: "#334155" }}>{item.product_code}</code>
            <LyDoBadge ly_do={item.ly_do} />
          </div>
        </div>

        {/* Tồn kho cha */}
        <div className="text-center">
          <span className="text-sm font-black"
            style={{ color: item.ton_kho_cha <= 20 ? "#ef4444" : "#94a3b8" }}>
            {item.ton_kho_cha}
          </span>
          <p className="text-[9px]" style={{ color: "#334155" }}>tổng</p>
        </div>

        {/* Đang đi đường */}
        <div className="text-center">
          <span className="text-sm font-bold"
            style={{ color: item.dang_di_duong > 0 ? "#38bdf8" : "#334155" }}>
            {item.dang_di_duong > 0 ? `+${item.dang_di_duong}` : "—"}
          </span>
        </div>

        {/* Bán 30 ngày */}
        <div className="text-center">
          <span className="text-sm font-bold" style={{ color: "#94a3b8" }}>
            {item.ban_30_ngay}
          </span>
        </div>
        
        {/* Mùa vụ */}
        <div className="flex items-center justify-center">
          <span className="text-xs font-black px-2 py-1 rounded-lg"
            style={{
              background: la_hang_loi_mua(item.season_code) ? "#7f1d1d40" : "#1e293b",
              color:      la_hang_loi_mua(item.season_code) ? "#ef4444"   : "#64748b",
            }}>
            {item.season_code}
          </span>
        </div>

        {/* Tốc độ bán */}
        <div className="text-center">
          <span className="text-sm font-bold" style={{ color: toc_do.mau }}>
            {toc_do.text}
          </span>
        </div>

        {/* Kho xin (tổng) */}
        <div className="text-center">
          <span className="text-sm font-bold" style={{ color: "#475569" }}>
            {item.skus.reduce((s, sk) => s + sk.so_luong_xin, 0)}
          </span>
        </div>

        {/* Tổng duyệt — readonly, tự tính từ SKU con */}
        <div onClick={e => e.stopPropagation()}>
          <div className="text-center px-2 py-1.5 rounded-xl"
            style={{
              background: tong_duyet > 0 ? "#0c435425" : "#1e293b",
              border:     `1px solid ${tong_duyet > 0 ? "#38bdf840" : "#334155"}`,
            }}>
            <span className="text-sm font-black"
              style={{ color: tong_duyet > 0 ? "#38bdf8" : "#334155" }}>
              {tong_duyet || "—"}
            </span>
          </div>
        </div>

        {/* NCC + lead time */}
        <div className="min-w-0" onClick={e => e.stopPropagation()}>
          <p className="text-[10px] font-bold truncate text-white">{item.vendor_name}</p>
          <p className="text-[9px]" style={{ color: "#475569" }}>
            {item.lead_time} ngày · {format_ngay_du_kien(item.lead_time)}
          </p>
        </div>
      </div>

      {/* Dòng con — SKU */}
      {expanded && item.skus.map(sku => (
        <SKURow
          key={sku.sku_id}
          sku={sku}
          la_loi_mua={loi_mua}
          onChange={(sku_id, val) => onSkuChange(item.pr_id, sku_id, val)}
        />
      ))}
    </>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

interface TabPRApprovalProps {
  onDuyet: (items: PRItem[]) => void; // callback khi duyệt → chuyển sang Tab 2
}

export default function TabPRApproval({ onDuyet }: TabPRApprovalProps) {
  const [items,       setItems]      = useState<PRItem[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [expanded,    setExpanded]   = useState<Set<string>>(new Set());
  const [selected,    setSelected]   = useState<Set<string>>(new Set());
  const [confirm_gui, setConfirmGui] = useState(false);

  useEffect(() => {
    layDanhSachPR("cho_duyet").then(data => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  // Toggle expand dòng cha
  const toggle_expand = (pr_id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(pr_id) ? next.delete(pr_id) : next.add(pr_id);
      return next;
    });
  };

  // Checkbox dòng cha
  const toggle_select = (pr_id: string, checked: boolean) => {
    setSelected(prev => {
      const next = new Set(prev);
      checked ? next.add(pr_id) : next.delete(pr_id);
      return next;
    });
  };

  const toggle_select_all = () => {
    setSelected(prev =>
      prev.size === items.length
        ? new Set()
        : new Set(items.map(i => i.pr_id))
    );
  };

  // Cập nhật so_luong_duyet của SKU con
  const handle_sku_change = useCallback((pr_id: string, sku_id: string, val: number) => {
    setItems(prev => prev.map(item => {
      if (item.pr_id !== pr_id) return item;
      return {
        ...item,
        skus: item.skus.map(sku =>
          sku.sku_id === sku_id ? { ...sku, so_luong_duyet: val } : sku
        ),
      };
    }));
  }, []);

  // Gửi duyệt các PR đã chọn
  const handle_gui_duyet = async () => {
    const items_duyet = items.filter(i => selected.has(i.pr_id));
    if (!items_duyet.length) return;

    // Validate — phải có ít nhất 1 SKU được duyệt
    const hop_le = items_duyet.every(i => tinh_tong_duyet(i.skus) > 0);
    if (!hop_le) {
      alert("Vui lòng nhập số lượng duyệt cho ít nhất 1 SKU của mỗi sản phẩm đã chọn");
      return;
    }

    // Gọi service duyệt từng PR
    for (const item of items_duyet) {
      await duyetPR(item.pr_id, item.skus);
    }

    // Xóa khỏi danh sách Tab 1
    setItems(prev => prev.filter(i => !selected.has(i.pr_id)));
    setSelected(new Set());
    setConfirmGui(false);

    // Callback sang Tab 2
    onDuyet(items_duyet);
  };

  const so_da_chon    = selected.size;
  const so_co_duyet   = items.filter(i => selected.has(i.pr_id) && tinh_tong_duyet(i.skus) > 0).length;
  const tong_tien_tam = items
    .filter(i => selected.has(i.pr_id))
    .reduce((total, item) => total + item.skus.reduce((s, sku) => s + sku.so_luong_duyet * 0, 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm" style={{ color: "#475569" }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Action bar ── */}
      {so_da_chon > 0 && (
        <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
          style={{ background: "#0c435415", borderBottom: "1px solid #38bdf820" }}>
          <span className="text-xs font-bold" style={{ color: "#38bdf8" }}>
            Đã chọn {so_da_chon} sản phẩm
            {so_co_duyet > 0 && ` · ${so_co_duyet} có số lượng duyệt`}
          </span>
          <div className="flex-1" />
          <button onClick={() => setSelected(new Set())}
            className="text-xs px-3 py-1.5 rounded-xl"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Bỏ chọn
          </button>
          <button
            onClick={() => setConfirmGui(true)}
            disabled={so_co_duyet === 0}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-black disabled:opacity-40"
            style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
            <Send size={12} />
            Chuyển sang Giỏ Đặt Hàng ({so_co_duyet})
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto" style={{ scrollbarWidth: "thin" }}>

        {/* Header */}
        <div className="grid items-center px-4 py-2.5 text-[9px] font-black uppercase sticky top-0 z-10 gap-2"
          style={{
            // gridTemplateColumns: "32px 24px 200px 90px 80px 80px 80px 80px 100px 90px",
            gridTemplateColumns: "32px 24px 200px 70px 90px 80px 80px 80px 80px 200px 90px",
            background: "#020817", color: "#334155",
            borderBottom: "1px solid #1e293b",
          }}>
          <div>
            <input type="checkbox"
              checked={selected.size === items.length && items.length > 0}
              onChange={toggle_select_all}
              className="w-3.5 h-3.5 rounded accent-blue-500 cursor-pointer" />
          </div>
          <div />
          <span>Sản phẩm</span>
          <span className="text-center">Tồn kho</span>
          <span className="text-center">Đi đường</span>
          <span className="text-center">Bán 30ng</span>
          <span className="text-center">Mùa vụ</span>
          <span className="text-center">Tốc độ</span>
          <span className="text-center">Kho xin</span>
          <span className="text-center">Duyệt</span>
          <span>NCC · Dự kiến</span>
        </div>

        {/* Rows */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Check size={32} className="mb-3" style={{ color: "#10b981", opacity: 0.4 }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>
              Không có yêu cầu nào cần duyệt
            </p>
            <p className="text-xs mt-1" style={{ color: "#334155" }}>
              Tất cả đã được xử lý 🎉
            </p>
          </div>
        ) : (
          items.map(item => (
            <ProductRow
              key={item.pr_id}
              item={item}
              expanded={expanded.has(item.pr_id)}
              selected={selected.has(item.pr_id)}
              onToggle={() => toggle_expand(item.pr_id)}
              onSelect={checked => toggle_select(item.pr_id, checked)}
              onSkuChange={handle_sku_change}
            />
          ))
        )}
      </div>

      {/* ── Confirm modal ── */}
      {confirm_gui && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(2,8,23,0.85)" }}
          onClick={() => setConfirmGui(false)}>
          <div className="rounded-2xl p-6 w-96"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#0c435425" }}>
                <Send size={18} style={{ color: "#38bdf8" }} />
              </div>
              <div>
                <p className="text-sm font-black text-white">
                  Chuyển sang Giỏ Đặt Hàng
                </p>
                <p className="text-[10px]" style={{ color: "#475569" }}>
                  {so_co_duyet} sản phẩm · các dòng sẽ biến mất khỏi danh sách này
                </p>
              </div>
            </div>

            {/* Tóm tắt */}
            <div className="space-y-2 mb-5">
              {items.filter(i => selected.has(i.pr_id) && tinh_tong_duyet(i.skus) > 0).map(item => (
                <div key={item.pr_id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl"
                  style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
                  <Package size={13} style={{ color: "#64748b", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{item.ten_sp}</p>
                    <p className="text-[9px]" style={{ color: "#475569" }}>
                      {item.skus.filter(s => s.so_luong_duyet > 0).length} SKU ·{" "}
                      {item.vendor_name}
                    </p>
                  </div>
                  <span className="text-sm font-black flex-shrink-0" style={{ color: "#38bdf8" }}>
                    {tinh_tong_duyet(item.skus)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setConfirmGui(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                style={{ background: "#1e293b", color: "#64748b" }}>
                Xem lại
              </button>
              <button onClick={handle_gui_duyet}
                className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
                <Send size={13} /> Xác nhận gửi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}