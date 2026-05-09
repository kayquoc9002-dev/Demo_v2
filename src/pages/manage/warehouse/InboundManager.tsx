// ─────────────────────────────────────────────────────────────────────────────
// InboundManager.tsx — Module 3: Quản lý Nhập Kho
// Tab 1: Danh sách phiếu | Tab 2: Chi tiết + QC | Tab 3: Put-away
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  ChevronDown,
  X,
  Check,
  AlertTriangle,
  Package,
  ClipboardList,
  Warehouse,
  CheckCircle,
  MapPin,
  ArrowRight,
  Info,
  Truck,
} from "lucide-react";
import type {
  PhieuNhapKho,
  ChiTietPhieuNhap,
  LoaiPhieuNhap,
  PutAwayItem,
} from "../../../components/Kho/data/inboundTypes";
import {
  tinh_stats_phieu,
  tinh_trang_thai_phieu,
  tao_put_away_items,
  lay_location_text,
  gen_id,
  gen_ma_phieu,
  TRANG_THAI_PHIEU_CONFIG,
  TRANG_THAI_QC_CONFIG,
  LOAI_PHIEU_CONFIG,
} from "../../../components/Kho/data/inboundHelpers";
import type { DonDatHang } from "../../../components/Kho/data/inboundMockData";
import type {
  SkuLocationRule,
  LocationNode,
  WarehouseConfig,
} from "../../../components/Kho/data/warehouseTypes";
import {
  layDanhSachPhieuNhap,
  layDanhSachPO,
  layDanhSachNhaCungCap,
  taoPhieuNhap,
  capNhatPhieuNhap,
  xacNhanCatKe,
} from "../../../components/Kho/ServiceLayer2/inboundService";
import {
  layDanhSachSkuRules,
  layDanhSachNodes,
  layWarehouseConfig,
} from "../../../components/Kho/ServiceLayer/WarehouseService";
import { MOCK_SKU } from "../../../components/Kho/data/productMockData";
import {
  la_leaf_node,
  tinh_location_code,
} from "../../../components/Kho/data/warehouseHelpers";

// ─── Helpers UI ──────────────────────────────────────────────────────────────

function Badge({ tt }: { tt: string }) {
  const cfg = TRANG_THAI_PHIEU_CONFIG[tt] ?? {
    nhan: tt,
    mau: "#475569",
    nen: "#1e293b",
  };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{
        background: cfg.nen,
        color: cfg.mau,
        border: `1px solid ${cfg.mau}30`,
      }}
    >
      {cfg.nhan}
    </span>
  );
}

function BadgeQC({ tt }: { tt: string }) {
  const cfg = TRANG_THAI_QC_CONFIG[tt] ?? { nhan: tt, mau: "#475569" };
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
      style={{ background: cfg.mau + "20", color: cfg.mau }}
    >
      {cfg.nhan}
    </span>
  );
}

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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
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

// ─── Modal tạo phiếu nhập ────────────────────────────────────────────────────

function ModalTaoPhieu({
  default_type,
  onSave,
  onClose,
}: {
  default_type: LoaiPhieuNhap;
  onSave: (phieu: PhieuNhapKho) => void;
  onClose: () => void;
}) {
  const loai = default_type;

  // PO flow
  const [po_search, setPoSearch] = useState("");
  const [selected_po, setSelectedPo] = useState<DonDatHang | null>(null);
  const [po_list, setPoList] = useState<DonDatHang[]>([]);
  const [nha_cung_cap_list, setNhaCungCapList] = useState<string[]>([]);

  // Manual flow
  const [ncc, setNcc] = useState("");
  const [ncc_open, setNccOpen] = useState(false);
  const [rows, setRows] = useState([{ ma_sku: "", ten_sp: "", so_luong: 100 }]);
  const [sku_open, setSkuOpen] = useState<number | null>(null);
  const [sku_search, setSkuSearch] = useState("");

  // Shared
  const [ngay, setNgay] = useState("");
  const [ly_do, setLyDo] = useState("");
  const [ghi_chu, setGhiChu] = useState("");
  const [loi_list, setLoiList] = useState<string[]>([]);

  useEffect(() => {
    layDanhSachPO().then(setPoList);
    layDanhSachNhaCungCap().then(setNhaCungCapList);
  }, []);

  const available_pos = useMemo(
    () => po_list.filter((po) => po.trang_thai === "cho_giao"),
    [po_list],
  );

  const filtered_pos = useMemo(() => {
    if (!po_search.trim()) return available_pos;
    const q = po_search.toLowerCase();
    return available_pos.filter(
      (po) =>
        po.ma_po.toLowerCase().includes(q) ||
        po.nha_cung_cap.toLowerCase().includes(q),
    );
  }, [po_search, available_pos]);

  const filtered_sku = useMemo(() => {
    const q = sku_search.toLowerCase();
    return q
      ? MOCK_SKU.filter(
          (s) =>
            s.ma_sku.toLowerCase().includes(q) ||
            s.ten_sp.toLowerCase().includes(q),
        )
      : MOCK_SKU;
  }, [sku_search]);

  const add_row = () =>
    setRows((r) => [...r, { ma_sku: "", ten_sp: "", so_luong: 1 }]);
  const remove_row = (i: number) =>
    setRows((r) => r.filter((_, idx) => idx !== i));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const set_row = (i: number, field: string, val: any) =>
    setRows((r) =>
      r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)),
    );

  const handle_save = () => {
    const loi: string[] = [];
    if (loai === "tu_don_dat_hang") {
      if (!selected_po) loi.push("Chưa chọn đơn đặt hàng (PO)");
      if (!ngay) loi.push("Chưa nhập ngày dự kiến nhận hàng");
    } else {
      if (!ncc.trim()) loi.push("Chưa nhập nhà cung cấp");
      if (!ngay) loi.push("Chưa nhập ngày dự kiến nhận hàng");
      if (loai === "nhap_khac" && !ly_do.trim())
        loi.push("Phiếu nhập khác bắt buộc có lý do");
      if (rows.some((r) => !r.ma_sku)) loi.push("Có dòng hàng chưa chọn SKU");
    }
    if (loi.length > 0) {
      setLoiList(loi);
      return;
    }

    const base = {
      id: gen_id(),
      ma_phieu: gen_ma_phieu(),
      loai,
      trang_thai: "cho_hang_ve" as const,
      nguoi_tao: "Người dùng hiện tại",
      ngay_tao: new Date().toISOString(),
      ngay_du_kien: new Date(ngay).toISOString(),
      ngay_nhan_thuc: "",
      ghi_chu,
    };

    let phieu: PhieuNhapKho;
    if (loai === "tu_don_dat_hang" && selected_po) {
      phieu = {
        ...base,
        nha_cung_cap: selected_po.nha_cung_cap,
        ly_do: "",
        chi_tiet: selected_po.chi_tiet.map((item) => ({
          id: gen_id(),
          phieu_id: "",
          ma_sku: item.ma_sku,
          ten_sp: item.ten_sp,
          so_luong_po: item.so_luong,
          so_luong_thuc: 0,
          so_luong_dat: 0,
          so_luong_loi: 0,
          trang_thai_qc: "chua_kiem" as const,
          ghi_chu_qc: "",
          da_cat_ke: false,
          node_id_cat: "",
          so_luong_da_cat: 0,
        })),
      };
    } else {
      phieu = {
        ...base,
        nha_cung_cap: ncc,
        ly_do,
        chi_tiet: rows.map((r) => ({
          id: gen_id(),
          phieu_id: "",
          ma_sku: r.ma_sku,
          ten_sp: r.ten_sp,
          so_luong_po: r.so_luong,
          so_luong_thuc: 0,
          so_luong_dat: 0,
          so_luong_loi: 0,
          trang_thai_qc: "chua_kiem" as const,
          ghi_chu_qc: "",
          da_cat_ke: false,
          node_id_cat: "",
          so_luong_da_cat: 0,
        })),
      };
    }
    onSave(phieu);
  };

  const loai_cfg = LOAI_PHIEU_CONFIG[loai];

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.8)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col rounded-2xl overflow-hidden"
        style={{
          width: loai === "tu_don_dat_hang" ? 700 : 600,
          maxHeight: "90vh",
          background: "#0a1628",
          border: "1px solid #1e293b",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <div>
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 16 }}>{loai_cfg.icon}</span>
              <h3 className="text-sm font-black text-white">{loai_cfg.nhan}</h3>
            </div>
            <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
              {loai_cfg.mo_ta}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}
          >
            <X size={14} />
          </button>
        </div>

        {loai === "tu_don_dat_hang" ? (
          /* ── PO flow ──────────────────────────────────────────────────────── */
          <div className="flex flex-1 overflow-hidden">
            {/* Left — PO list */}
            <div
              className="flex flex-col border-r flex-shrink-0"
              style={{ width: 280, borderColor: "#1e293b" }}
            >
              <div
                className="px-4 py-3 border-b flex-shrink-0"
                style={{ borderColor: "#1e293b" }}
              >
                <p
                  className="text-[10px] font-black uppercase mb-2"
                  style={{ color: "#475569" }}
                >
                  Chọn đơn đặt hàng (PO) *
                </p>
                <div className="relative">
                  <Search
                    size={11}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: "#475569" }}
                  />
                  <input
                    value={po_search}
                    onChange={(e) => setPoSearch(e.target.value)}
                    placeholder="Tìm mã PO, NCC..."
                    className="w-full pl-7 pr-3 py-2 rounded-xl text-xs outline-none"
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "white",
                    }}
                  />
                </div>
              </div>
              <div
                className="flex-1 overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              >
                {filtered_pos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-xs" style={{ color: "#475569" }}>
                      Không có PO nào chờ giao
                    </p>
                  </div>
                ) : (
                  filtered_pos.map((po) => {
                    const is_sel = selected_po?.id === po.id;
                    return (
                      <button
                        key={po.id}
                        onClick={() => setSelectedPo(po)}
                        className="w-full text-left px-4 py-3 transition-all"
                        style={{
                          background: is_sel ? "#0c435420" : "transparent",
                          borderLeft: is_sel
                            ? "2px solid #38bdf8"
                            : "2px solid transparent",
                          borderBottom: "1px solid #0f172a",
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className="text-xs font-black"
                            style={{ color: is_sel ? "#38bdf8" : "#94a3b8" }}
                          >
                            {po.ma_po}
                          </span>
                          {is_sel && (
                            <Check size={12} style={{ color: "#38bdf8" }} />
                          )}
                        </div>
                        <p className="text-[10px]" style={{ color: "#475569" }}>
                          {po.nha_cung_cap}
                        </p>
                        <p className="text-[9px]" style={{ color: "#334155" }}>
                          {po.chi_tiet.length} SKU · Giao{" "}
                          {new Date(po.ngay_giao_du_kien).toLocaleDateString(
                            "vi-VN",
                          )}
                        </p>
                        {po.ghi_chu && (
                          <p
                            className="text-[9px] mt-0.5 truncate"
                            style={{ color: "#334155" }}
                          >
                            {po.ghi_chu}
                          </p>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right — preview + form */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selected_po ? (
                <>
                  {/* Goods preview */}
                  <div
                    className="px-4 py-3 border-b flex-shrink-0"
                    style={{ borderColor: "#1e293b" }}
                  >
                    <p
                      className="text-[10px] font-black uppercase mb-2"
                      style={{ color: "#475569" }}
                    >
                      Hàng theo {selected_po.ma_po}
                    </p>
                    <div
                      className="space-y-1.5 overflow-y-auto"
                      style={{ maxHeight: 160, scrollbarWidth: "thin" }}
                    >
                      {selected_po.chi_tiet.map((item) => (
                        <div
                          key={item.ma_sku}
                          className="flex items-center gap-3 px-3 py-1.5 rounded-xl"
                          style={{
                            background: "#0f172a",
                            border: "1px solid #1e293b",
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[10px] font-bold"
                              style={{ color: "#94a3b8" }}
                            >
                              {item.ten_sp}
                            </p>
                            <p
                              className="text-[9px] font-mono"
                              style={{ color: "#475569" }}
                            >
                              {item.ma_sku}
                            </p>
                          </div>
                          <span
                            className="text-sm font-black flex-shrink-0"
                            style={{ color: "#38bdf8" }}
                          >
                            {item.so_luong}
                          </span>
                          <span
                            className="text-[9px] flex-shrink-0"
                            style={{ color: "#334155" }}
                          >
                            cái
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PO form fields */}
                  <div
                    className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {/* NCC (read-only from PO) */}
                    <div>
                      <label
                        className="text-[10px] font-black uppercase mb-1.5 block"
                        style={{ color: "#475569" }}
                      >
                        Nhà cung cấp
                      </label>
                      <div
                        className="px-3 py-2.5 rounded-xl text-sm"
                        style={{
                          background: "#0f172a",
                          border: "1px solid #1e293b",
                          color: "#64748b",
                        }}
                      >
                        {selected_po.nha_cung_cap}
                      </div>
                    </div>

                    {/* Ngày dự kiến */}
                    <div>
                      <label
                        className="text-[10px] font-black uppercase mb-1.5 block"
                        style={{ color: "#475569" }}
                      >
                        Ngày dự kiến nhận hàng *
                      </label>
                      <input
                        type="date"
                        value={ngay}
                        onChange={(e) => setNgay(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          color: "white",
                        }}
                      />
                    </div>

                    {/* Ghi chú */}
                    <div>
                      <label
                        className="text-[10px] font-black uppercase mb-1.5 block"
                        style={{ color: "#475569" }}
                      >
                        Ghi chú
                      </label>
                      <input
                        value={ghi_chu}
                        onChange={(e) => setGhiChu(e.target.value)}
                        placeholder="Ghi chú thêm..."
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                          color: "white",
                        }}
                      />
                    </div>

                    {loi_list.length > 0 && (
                      <div
                        className="rounded-xl p-3 space-y-1"
                        style={{
                          background: "#7f1d1d20",
                          border: "1px solid #ef444430",
                        }}
                      >
                        {loi_list.map((l) => (
                          <div
                            key={l}
                            className="flex items-center gap-2 text-xs"
                            style={{ color: "#fca5a5" }}
                          >
                            <AlertTriangle size={11} />
                            {l}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Package
                    size={32}
                    className="mb-3 opacity-20"
                    style={{ color: "#64748b" }}
                  />
                  <p className="text-sm font-bold" style={{ color: "#475569" }}>
                    Chọn một PO từ danh sách
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#334155" }}>
                    Hàng hóa sẽ được điền tự động
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ── Manual flow (khong_co_po / nhap_khac) ───────────────────────── */
          <div
            className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
            style={{ scrollbarWidth: "thin" }}
          >
            {/* NCC */}
            <div className="relative">
              <label
                className="text-[10px] font-black uppercase mb-1.5 block"
                style={{ color: "#475569" }}
              >
                Nhà cung cấp / Xưởng *
              </label>
              <input
                value={ncc}
                onChange={(e) => setNcc(e.target.value)}
                onFocus={() => setNccOpen(true)}
                onBlur={() => setTimeout(() => setNccOpen(false), 150)}
                placeholder="Tên xưởng hoặc NCC..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "white",
                }}
              />
              {ncc_open && (
                <div
                  className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-10"
                  style={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                  }}
                >
                  {nha_cung_cap_list
                    .filter((n) => n.toLowerCase().includes(ncc.toLowerCase()))
                    .map((n) => (
                      <button
                        key={n}
                        onMouseDown={() => setNcc(n)}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-800 transition-colors"
                        style={{ color: "#94a3b8" }}
                      >
                        {n}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Ngày dự kiến */}
            <div>
              <label
                className="text-[10px] font-black uppercase mb-1.5 block"
                style={{ color: "#475569" }}
              >
                Ngày dự kiến nhận hàng *
              </label>
              <input
                type="date"
                value={ngay}
                onChange={(e) => setNgay(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "white",
                }}
              />
            </div>

            {/* Lý do — chỉ hiện khi nhap_khac */}
            {loai === "nhap_khac" && (
              <div>
                <label
                  className="text-[10px] font-black uppercase mb-1.5 block"
                  style={{ color: "#ef4444" }}
                >
                  Lý do * (bắt buộc)
                </label>
                <textarea
                  value={ly_do}
                  onChange={(e) => setLyDo(e.target.value)}
                  placeholder="VD: Bù chênh lệch kiểm kê tháng 4, kèm biên bản số..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{
                    background: "#1e293b",
                    border: "1px solid #ef444440",
                    color: "white",
                  }}
                />
              </div>
            )}

            {/* Ghi chú */}
            <div>
              <label
                className="text-[10px] font-black uppercase mb-1.5 block"
                style={{ color: "#475569" }}
              >
                Ghi chú
              </label>
              <input
                value={ghi_chu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                style={{
                  background: "#1e293b",
                  border: "1px solid #334155",
                  color: "white",
                }}
              />
            </div>

            {/* Danh sách hàng */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  className="text-[10px] font-black uppercase"
                  style={{ color: "#475569" }}
                >
                  Danh sách hàng *
                </label>
                <button
                  onClick={add_row}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-bold"
                  style={{ background: "#0c435425", color: "#38bdf8" }}
                >
                  <Plus size={11} /> Thêm dòng
                </button>
              </div>
              <div className="space-y-2">
                {rows.map((row, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className="relative flex-1">
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
                        style={{
                          background: "#1e293b",
                          border: "1px solid #334155",
                        }}
                        onClick={() => setSkuOpen(sku_open === i ? null : i)}
                      >
                        {row.ma_sku ? (
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[10px] font-bold"
                              style={{ color: "#38bdf8" }}
                            >
                              {row.ma_sku}
                            </p>
                            <p
                              className="text-[9px] truncate"
                              style={{ color: "#475569" }}
                            >
                              {row.ten_sp}
                            </p>
                          </div>
                        ) : (
                          <span
                            className="text-xs flex-1"
                            style={{ color: "#475569" }}
                          >
                            Chọn SKU...
                          </span>
                        )}
                        <ChevronDown
                          size={12}
                          style={{ color: "#475569", flexShrink: 0 }}
                        />
                      </div>
                      {sku_open === i && (
                        <div
                          className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
                          style={{
                            background: "#0f172a",
                            border: "1px solid #1e293b",
                            maxHeight: 200,
                          }}
                        >
                          <div
                            className="px-3 py-2 border-b"
                            style={{ borderColor: "#1e293b" }}
                          >
                            <input
                              value={sku_search}
                              onChange={(e) => setSkuSearch(e.target.value)}
                              placeholder="Tìm SKU..."
                              autoFocus
                              className="w-full text-xs outline-none"
                              style={{
                                background: "transparent",
                                color: "white",
                              }}
                            />
                          </div>
                          <div
                            className="overflow-y-auto"
                            style={{ maxHeight: 150 }}
                          >
                            {filtered_sku.map((s) => (
                              <button
                                key={s.ma_sku}
                                onMouseDown={() => {
                                  set_row(i, "ma_sku", s.ma_sku);
                                  set_row(i, "ten_sp", s.ten_sp);
                                  setSkuOpen(null);
                                  setSkuSearch("");
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-slate-800 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="text-[10px] font-bold"
                                    style={{ color: "#94a3b8" }}
                                  >
                                    {s.ma_sku}
                                  </p>
                                  <p
                                    className="text-[9px] truncate"
                                    style={{ color: "#475569" }}
                                  >
                                    {s.ten_sp}
                                  </p>
                                </div>
                                <span
                                  className="text-[9px]"
                                  style={{ color: "#475569" }}
                                >
                                  Tồn: {s.ton_kho}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={row.so_luong}
                      onChange={(e) =>
                        set_row(i, "so_luong", Number(e.target.value))
                      }
                      className="w-20 px-2 py-2 rounded-xl text-sm text-center outline-none font-bold flex-shrink-0"
                      style={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        color: "#38bdf8",
                      }}
                    />
                    <button
                      onClick={() => remove_row(i)}
                      disabled={rows.length === 1}
                      className="w-8 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30"
                      style={{ background: "#1e293b", color: "#ef4444" }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {loi_list.length > 0 && (
              <div
                className="rounded-xl p-3 space-y-1"
                style={{
                  background: "#7f1d1d20",
                  border: "1px solid #ef444430",
                }}
              >
                {loi_list.map((l) => (
                  <div
                    key={l}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "#fca5a5" }}
                  >
                    <AlertTriangle size={11} />
                    {l}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}
          >
            Huỷ
          </button>
          <button
            onClick={handle_save}
            className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
            style={{
              background: "#0c4354",
              color: "#38bdf8",
              border: "1px solid #38bdf840",
            }}
          >
            <Check size={14} /> Tạo phiếu nhập
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Panel QC ────────────────────────────────────────────────────────────────

function PanelQC({
  phieu,
  onUpdate,
}: {
  phieu: PhieuNhapKho;
  onUpdate: (ct: ChiTietPhieuNhap[]) => void;
}) {
  const [chi_tiet, setChiTiet] = useState<ChiTietPhieuNhap[]>(phieu.chi_tiet);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const update_ct = (id: string, field: keyof ChiTietPhieuNhap, val: any) => {
    setChiTiet((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const updated = { ...c, [field]: val };
        // Khi cập nhật QC, tự tính so_luong_loi
        if (field === "so_luong_thuc" || field === "so_luong_dat") {
          const thuc = field === "so_luong_thuc" ? val : c.so_luong_thuc;
          const dat = field === "so_luong_dat" ? val : c.so_luong_dat;
          updated.so_luong_loi = Math.max(0, thuc - dat);
        }
        return updated;
      }),
    );
  };

  const handle_save = () => {
    onUpdate(chi_tiet);
  };

  return (
    <div className="flex flex-col h-full">
      <div
        className="px-5 py-3 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <div>
          <h3 className="text-sm font-black text-white">
            Kiểm tra chất lượng (QC)
          </h3>
          <p className="text-[10px]" style={{ color: "#475569" }}>
            Nhập số lượng thực nhận, đánh dấu lỗi từng SKU
          </p>
        </div>
        <button
          onClick={handle_save}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{
            background: "#06472520",
            color: "#10b981",
            border: "1px solid #10b98140",
          }}
        >
          <Check size={12} /> Lưu kết quả QC
        </button>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Table header */}
        <div
          className="grid px-4 py-2 text-[9px] font-black uppercase sticky top-0"
          style={{
            background: "#0a1628",
            color: "#334155",
            borderBottom: "1px solid #1e293b",
            gridTemplateColumns: "1.5fr 80px 80px 80px 120px 1fr",
          }}
        >
          <span>SKU / Sản phẩm</span>
          <span className="text-center">SL theo PO</span>
          <span className="text-center">SL thực nhận</span>
          <span className="text-center">SL đạt QC</span>
          <span className="text-center">Kết quả QC</span>
          <span>Ghi chú lỗi</span>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {chi_tiet.map((ct, i) => (
          <div
            key={ct.id}
            className="grid items-center px-4 py-3 gap-2"
            style={{
              gridTemplateColumns: "1.5fr 80px 80px 80px 120px 1fr",
              borderBottom: "1px solid #0f172a",
              background:
                ct.trang_thai_qc === "loi_nang"
                  ? "#ef444408"
                  : ct.trang_thai_qc === "thieu_hang"
                    ? "#f97316 08"
                    : "transparent",
            }}
          >
            {/* SKU */}
            <div>
              <p className="text-xs font-bold text-white">{ct.ten_sp}</p>
              <p className="text-[9px] font-mono" style={{ color: "#475569" }}>
                {ct.ma_sku}
              </p>
            </div>
            {/* SL PO */}
            <div
              className="text-center text-sm font-bold"
              style={{ color: "#64748b" }}
            >
              {ct.so_luong_po}
            </div>
            {/* SL thực */}
            <input
              type="number"
              min={0}
              value={ct.so_luong_thuc}
              onChange={(e) =>
                update_ct(ct.id, "so_luong_thuc", Number(e.target.value))
              }
              className="text-center text-sm font-bold outline-none rounded-lg py-1"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
            {/* SL đạt */}
            <input
              type="number"
              min={0}
              max={ct.so_luong_thuc}
              value={ct.so_luong_dat}
              onChange={(e) =>
                update_ct(ct.id, "so_luong_dat", Number(e.target.value))
              }
              className="text-center text-sm font-bold outline-none rounded-lg py-1"
              style={{
                background: "#1e293b",
                border: "1px solid #10b98140",
                color: "#10b981",
              }}
            />
            {/* Kết quả QC */}
            <select
              value={ct.trang_thai_qc}
              onChange={(e) =>
                update_ct(ct.id, "trang_thai_qc", e.target.value)
              }
              className="text-[10px] font-bold rounded-lg px-2 py-1.5 outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            >
              {Object.entries(TRANG_THAI_QC_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.nhan}
                </option>
              ))}
            </select>
            {/* Ghi chú */}
            <input
              value={ct.ghi_chu_qc}
              onChange={(e) => update_ct(ct.id, "ghi_chu_qc", e.target.value)}
              placeholder="Mô tả lỗi..."
              className="px-2 py-1.5 rounded-lg text-xs outline-none w-full"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
          </div>
        ))}
      </div>

      {/* Tổng kết QC */}
      <div
        className="px-5 py-3 border-t flex-shrink-0 flex gap-4"
        style={{ borderColor: "#1e293b" }}
      >
        {[
          {
            label: "Tổng PO",
            val: chi_tiet.reduce((s, c) => s + c.so_luong_po, 0),
            mau: "#94a3b8",
          },
          {
            label: "Thực nhận",
            val: chi_tiet.reduce((s, c) => s + c.so_luong_thuc, 0),
            mau: "#38bdf8",
          },
          {
            label: "Đạt QC",
            val: chi_tiet.reduce((s, c) => s + c.so_luong_dat, 0),
            mau: "#10b981",
          },
          {
            label: "Lỗi",
            val: chi_tiet.reduce((s, c) => s + c.so_luong_loi, 0),
            mau: "#ef4444",
          },
        ].map(({ label, val, mau }) => (
          <div key={label} className="text-center">
            <p className="text-sm font-black" style={{ color: mau }}>
              {val}
            </p>
            <p className="text-[9px]" style={{ color: "#475569" }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Panel Put-away ───────────────────────────────────────────────────────────

function PanelPutAway({
  phieu,
  onComplete,
}: {
  phieu: PhieuNhapKho;
  onComplete: (items: PutAwayItem[]) => void;
}) {
  const [items, setItems] = useState<PutAwayItem[]>([]);
  const [scan_input, setScanInput] = useState("");
  const scan_ref = useRef<HTMLInputElement>(null);
  const [, setSkuRules] = useState<SkuLocationRule[]>([]);
  const [nodes, setNodes] = useState<LocationNode[]>([]);
  const [warehouse_config, setWarehouseConfig] =
    useState<WarehouseConfig | null>(null);

  useEffect(() => {
    Promise.all([
      layDanhSachSkuRules(),
      layDanhSachNodes(),
      layWarehouseConfig(),
    ]).then(([rules, nds, config]) => {
      setSkuRules(rules);
      setNodes(nds);
      setWarehouseConfig(config);
      setItems(tao_put_away_items(phieu, rules));
    });
  }, [phieu]);

  const leaf_nodes = useMemo(
    () =>
      nodes.filter(
        (n) => la_leaf_node(n.id, nodes) && n.trang_thai === "active",
      ),
    [nodes],
  );

  const update_item = (
    chi_tiet_id: string,
    field: keyof PutAwayItem,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    val: any,
  ) =>
    setItems((prev) =>
      prev.map((it) =>
        it.chi_tiet_id === chi_tiet_id ? { ...it, [field]: val } : it,
      ),
    );

  const xac_nhan = (chi_tiet_id: string) => {
    update_item(chi_tiet_id, "da_xac_nhan", true);
  };

  const tat_ca_xac_nhan = items.every((it) => it.da_xac_nhan);

  // Scan SKU — highlight item tương ứng
  const handle_scan = () => {
    const q = scan_input.trim().toUpperCase();
    const found = items.find((it) => it.ma_sku.toUpperCase().includes(q));
    if (found) {
      document
        .getElementById(`putaway-${found.chi_tiet_id}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setScanInput("");
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CheckCircle
          size={36}
          className="mb-3"
          style={{ color: "#10b981", opacity: 0.6 }}
        />
        <p className="text-sm font-bold text-white">
          Tất cả hàng đã được cất kệ
        </p>
        <p className="text-xs mt-1" style={{ color: "#475569" }}>
          Phiếu nhập này đã hoàn tất
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header + scan bar */}
      <div
        className="px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-black text-white">
              Cất hàng lên kệ (Put-away)
            </h3>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Hệ thống gợi ý vị trí theo SKU rules · xác nhận từng SKU sau khi
              cất
            </p>
          </div>
          <button
            onClick={() => onComplete(items)}
            disabled={!tat_ca_xac_nhan}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold disabled:opacity-40"
            style={{
              background: "#06472520",
              color: "#10b981",
              border: "1px solid #10b98140",
            }}
          >
            <Check size={12} /> Hoàn thành cất kệ
          </button>
        </div>
        {/* Scan input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }}
            />
            <input
              ref={scan_ref}
              value={scan_input}
              onChange={(e) => setScanInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handle_scan()}
              placeholder="Scan hoặc gõ mã SKU để định vị..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #38bdf840",
                color: "white",
              }}
            />
          </div>
          <button
            onClick={handle_scan}
            className="px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: "#0c435425", color: "#38bdf8" }}
          >
            Tìm
          </button>
        </div>
      </div>

      {/* Progress */}
      <div
        className="px-5 py-2 border-b flex items-center gap-3 flex-shrink-0"
        style={{ borderColor: "#1e293b" }}
      >
        <div
          className="flex-1 h-1.5 rounded-full overflow-hidden"
          style={{ background: "#1e293b" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.round((items.filter((it) => it.da_xac_nhan).length / items.length) * 100)}%`,
              background: "#10b981",
            }}
          />
        </div>
        <span
          className="text-[10px] font-bold flex-shrink-0"
          style={{ color: "#10b981" }}
        >
          {items.filter((it) => it.da_xac_nhan).length}/{items.length} SKU đã
          cất
        </span>
      </div>

      {/* Danh sách items */}
      <div
        className="flex-1 overflow-y-auto px-5 py-3 space-y-3"
        style={{ scrollbarWidth: "thin" }}
      >
        {items.map((item) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const goi_y_node = nodes.find((n) => n.id === item.node_goi_y);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const chon_node = nodes.find((n) => n.id === item.node_chon);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const levels = warehouse_config?.levels ?? [];

          return (
            <div
              key={item.chi_tiet_id}
              id={`putaway-${item.chi_tiet_id}`}
              className="rounded-2xl p-4 transition-all"
              style={{
                background: item.da_xac_nhan ? "#06472512" : "#0f172a",
                border: `1px solid ${item.da_xac_nhan ? "#10b98140" : "#1e293b"}`,
              }}
            >
              {/* SKU info */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <code
                      className="text-xs font-black"
                      style={{ color: "#38bdf8" }}
                    >
                      {item.ma_sku}
                    </code>
                    {item.da_xac_nhan && (
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: "#06472520", color: "#10b981" }}
                      >
                        Đã cất ✓
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white mt-0.5">{item.ten_sp}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-white">
                    {item.so_luong_can}
                  </p>
                  <p className="text-[9px]" style={{ color: "#475569" }}>
                    cái cần cất
                  </p>
                </div>
              </div>

              {/* Gợi ý vị trí */}
              {item.node_goi_y ? (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                  style={{
                    background: "#0c435420",
                    border: "1px solid #38bdf820",
                  }}
                >
                  <MapPin
                    size={12}
                    style={{ color: "#38bdf8", flexShrink: 0 }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px]" style={{ color: "#475569" }}>
                      Gợi ý từ SKU rules (Primary bin)
                    </p>
                    <p
                      className="text-xs font-black"
                      style={{ color: "#38bdf8" }}
                    >
                      {tinh_location_code(item.node_goi_y, nodes)}
                    </p>
                  </div>
                  <ArrowRight size={12} style={{ color: "#475569" }} />
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                  style={{
                    background: "#78350f20",
                    border: "1px solid #f59e0b20",
                  }}
                >
                  <Info size={12} style={{ color: "#f59e0b" }} />
                  <p className="text-[10px]" style={{ color: "#f59e0b" }}>
                    SKU này chưa có quy tắc vị trí — chọn thủ công bên dưới
                  </p>
                </div>
              )}

              {/* Chọn vị trí thực tế */}
              {!item.da_xac_nhan && (
                <div className="flex gap-2">
                  <select
                    value={item.node_chon}
                    onChange={(e) =>
                      update_item(item.chi_tiet_id, "node_chon", e.target.value)
                    }
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "white",
                    }}
                  >
                    <option value="">-- Chọn ô/bin --</option>
                    {leaf_nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {tinh_location_code(n.id, nodes)} — {n.ten}
                        {n.id === item.node_goi_y ? " ★" : ""}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={item.so_luong_can}
                    value={item.so_luong_cat}
                    onChange={(e) =>
                      update_item(
                        item.chi_tiet_id,
                        "so_luong_cat",
                        Number(e.target.value),
                      )
                    }
                    className="w-16 text-center px-2 py-2 rounded-xl text-sm font-bold outline-none"
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#10b981",
                    }}
                  />
                  <button
                    onClick={() => xac_nhan(item.chi_tiet_id)}
                    disabled={!item.node_chon}
                    className="px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 disabled:opacity-40"
                    style={{
                      background: "#06472520",
                      color: "#10b981",
                      border: "1px solid #10b98140",
                    }}
                  >
                    <Check size={12} /> Xác nhận
                  </button>
                </div>
              )}

              {/* Đã xác nhận — hiện kết quả */}
              {item.da_xac_nhan && item.node_chon && (
                <div
                  className="flex items-center gap-2 text-xs"
                  style={{ color: "#10b981" }}
                >
                  <CheckCircle size={13} />
                  <span>Đã cất {item.so_luong_cat} cái vào </span>
                  <code className="font-black">
                    {tinh_location_code(item.node_chon, nodes)}
                  </code>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "danh_sach" | "qc" | "put_away";

export default function InboundManager() {
  const [phieu_list, setPhieuList] = useState<PhieuNhapKho[]>([]);
  const [nodes, setNodes] = useState<LocationNode[]>([]);
  useEffect(() => {
    layDanhSachPhieuNhap().then(setPhieuList);
    console.log(layDanhSachPhieuNhap());
    layDanhSachNodes().then(setNodes);
  }, []);

  const [selected_id, setSelectedId] = useState<string | null>("pn-002");
  const [active_tab, setActiveTab] = useState<ActiveTab>("danh_sach");
  const [show_create, setShowCreate] = useState(false);
  const [loai_tao, setLoaiTao] = useState<LoaiPhieuNhap>("tu_don_dat_hang");
  const [show_dropdown, setShowDropdown] = useState(false);
  const [show_confirm_receipt, setShowConfirmReceipt] = useState(false);
  const [ngay_nhan_input, setNgayNhanInput] = useState("");
  const [search, setSearch] = useState("");
  const [filter_tt, setFilterTt] = useState<string>("all");
  const [toast, setToast] = useState<{
    msg: string;
    type: "ok" | "err";
  } | null>(null);

  const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handle_xac_nhan_nhan_hang = (phieu_id: string, ngay_nhan: string) => {
    setPhieuList((prev) =>
      prev.map((p) => {
        if (p.id !== phieu_id) return p;
        return {
          ...p,
          trang_thai: "dang_kiem_tra" as const,
          ngay_nhan_thuc: new Date(ngay_nhan).toISOString(),
        };
      }),
    );
    setShowConfirmReceipt(false);
    setActiveTab("qc");
    show_toast("Đã xác nhận nhận hàng — bắt đầu kiểm tra QC");
  };

  const selected_phieu = phieu_list.find((p) => p.id === selected_id) ?? null;

  const filtered_phieu = useMemo(() => {
    let list = phieu_list;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.ma_phieu.toLowerCase().includes(q) ||
          p.nha_cung_cap.toLowerCase().includes(q) ||
          p.chi_tiet.some((c) => c.ma_sku.toLowerCase().includes(q)),
      );
    }
    if (filter_tt !== "all")
      list = list.filter((p) => p.trang_thai === filter_tt);
    return list.sort((a, b) => b.ngay_tao.localeCompare(a.ngay_tao));
  }, [phieu_list, search, filter_tt]);

  // const handle_create = (phieu: PhieuNhapKho) => {
  //   setPhieuList((prev) => [phieu, ...prev]);
  //   setSelectedId(phieu.id);
  //   setShowCreate(false);
  //   show_toast(`Đã tạo phiếu ${phieu.ma_phieu}`);
  // };

  const handle_create = async (phieu: PhieuNhapKho) => {
    const saved = await taoPhieuNhap(phieu);
    setPhieuList((prev) => [saved, ...prev]);
    setSelectedId(saved.id);
    setShowCreate(false);
    show_toast(`Đã tạo phiếu ${saved.ma_phieu}`);
  };

  // const handle_update_qc = (phieu_id: string, chi_tiet: ChiTietPhieuNhap[]) => {
  //   setPhieuList((prev) =>
  //     prev.map((p) => {
  //       if (p.id !== phieu_id) return p;
  //       const updated = { ...p, chi_tiet };
  //       updated.trang_thai = tinh_trang_thai_phieu(updated);
  //       return updated;
  //     }),
  //   );
  //   show_toast("Đã lưu kết quả QC");
  // };

  const handle_update_qc = async (
    phieu_id: string,
    chi_tiet: ChiTietPhieuNhap[],
  ) => {
    setPhieuList((prev) =>
      prev.map((p) => {
        if (p.id !== phieu_id) return p;
        const updated = { ...p, chi_tiet };
        updated.trang_thai = tinh_trang_thai_phieu(updated);
        capNhatPhieuNhap(updated);
        return updated;
      }),
    );
    show_toast("Đã lưu kết quả QC");
  };

  // const handle_put_away_complete = (phieu_id: string, items: PutAwayItem[]) => {
  //   setPhieuList((prev) =>
  //     prev.map((p) => {
  //       if (p.id !== phieu_id) return p;
  //       const updated_ct = p.chi_tiet.map((c) => {
  //         const item = items.find((it) => it.chi_tiet_id === c.id);
  //         if (!item || !item.da_xac_nhan) return c;
  //         return {
  //           ...c,
  //           da_cat_ke: true,
  //           node_id_cat: item.node_chon,
  //           so_luong_da_cat: item.so_luong_cat,
  //         };
  //       });
  //       const updated = { ...p, chi_tiet: updated_ct };
  //       updated.trang_thai = tinh_trang_thai_phieu(updated);
  //       return updated;
  //     }),
  //   );
  //   show_toast("Đã hoàn thành cất kệ!");
  //   setActiveTab("danh_sach");
  // };

  const handle_put_away_complete = async (
    phieu_id: string,
    items: PutAwayItem[],
  ) => {
    for (const item of items.filter((it) => it.da_xac_nhan)) {
      await xacNhanCatKe(
        phieu_id,
        item.chi_tiet_id,
        item.node_chon,
        item.so_luong_cat,
      );
    }
    const updated_list = await layDanhSachPhieuNhap();
    setPhieuList(updated_list);
    show_toast("Đã hoàn thành cất kệ!");
    setActiveTab("danh_sach");
  };

  // Tab context theo trạng thái phiếu đang chọn
  const available_tabs = useMemo((): ActiveTab[] => {
    if (!selected_phieu) return ["danh_sach"];
    const tt = selected_phieu.trang_thai;
    if (tt === "cho_hang_ve") return ["danh_sach"];
    if (tt === "dang_kiem_tra") return ["danh_sach", "qc"];
    if (tt === "cho_cat_ke" || tt === "co_van_de")
      return ["danh_sach", "qc", "put_away"];
    if (tt === "hoan_thanh") return ["danh_sach", "qc", "put_away"];
    return ["danh_sach"];
  }, [selected_phieu]);

  const stats_all = useMemo(
    () => ({
      cho_hang_ve: phieu_list.filter((p) => p.trang_thai === "cho_hang_ve")
        .length,
      dang_kiem_tra: phieu_list.filter((p) => p.trang_thai === "dang_kiem_tra")
        .length,
      cho_cat_ke: phieu_list.filter((p) => p.trang_thai === "cho_cat_ke")
        .length,
      co_van_de: phieu_list.filter((p) => p.trang_thai === "co_van_de").length,
      hoan_thanh: phieu_list.filter((p) => p.trang_thai === "hoan_thanh")
        .length,
    }),
    [phieu_list],
  );

  return (
    <div
      className="flex h-screen overflow-hidden relative"
      style={{ background: "#020817" }}
    >
      {/* ── LEFT: Danh sách phiếu ──────────────────────────── */}
      <div
        className="flex flex-col border-r flex-shrink-0"
        style={{ width: 360, borderColor: "#1e293b" }}
      >
        {/* Header */}
        <div
          className="px-4 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-white">Nhập Kho</h2>
              <p className="text-[10px]" style={{ color: "#475569" }}>
                {phieu_list.length} phiếu nhập
              </p>
            </div>

            {/* Dropdown tạo phiếu */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                style={{
                  background: "#0c435425",
                  color: "#38bdf8",
                  border: "1px solid #38bdf840",
                }}
              >
                <Plus size={13} /> Tạo phiếu
                <ChevronDown
                  size={11}
                  style={{
                    transform: show_dropdown ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </button>
              {show_dropdown && (
                <div
                  className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden z-30"
                  style={{
                    width: 260,
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                  }}
                >
                  {(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    Object.entries(LOAI_PHIEU_CONFIG) as [LoaiPhieuNhap, any][]
                  ).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setLoaiTao(key);
                        setShowCreate(true);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800 transition-colors"
                      style={{ borderBottom: "1px solid #1e293b" }}
                    >
                      <span style={{ fontSize: 16 }}>{cfg.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-white">
                          {cfg.nhan}
                        </p>
                        <p className="text-[9px]" style={{ color: "#475569" }}>
                          {cfg.mo_ta}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {[
              {
                key: "dang_kiem_tra",
                label: "Đang QC",
                val: stats_all.dang_kiem_tra,
                mau: "#f59e0b",
              },
              {
                key: "cho_cat_ke",
                label: "Chờ cất kệ",
                val: stats_all.cho_cat_ke,
                mau: "#a78bfa",
              },
              {
                key: "co_van_de",
                label: "Có vấn đề",
                val: stats_all.co_van_de,
                mau: "#ef4444",
              },
            ].map(({ key, label, val, mau }) => (
              <button
                key={key}
                onClick={() => setFilterTt(filter_tt === key ? "all" : key)}
                className="px-2 py-1.5 rounded-lg text-center transition-all"
                style={{
                  background: filter_tt === key ? mau + "20" : "#0f172a",
                  border: `1px solid ${filter_tt === key ? mau + "40" : "#1e293b"}`,
                }}
              >
                <p className="text-sm font-black" style={{ color: mau }}>
                  {val}
                </p>
                <p className="text-[9px]" style={{ color: "#475569" }}>
                  {label}
                </p>
              </button>
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
              placeholder="Tìm mã phiếu, NCC, SKU..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
          </div>
        </div>

        {/* List phiếu */}
        <div
          className="flex-1 overflow-y-auto py-1"
          style={{ scrollbarWidth: "thin" }}
        >
          {filtered_phieu.length === 0 ? (
            <div className="text-center py-12">
              <Package
                size={28}
                className="mx-auto mb-3 opacity-20"
                style={{ color: "#64748b" }}
              />
              <p className="text-sm" style={{ color: "#475569" }}>
                Không có phiếu nào
              </p>
            </div>
          ) : (
            filtered_phieu.map((phieu) => {
              const stats = tinh_stats_phieu(phieu);
              const is_selected = selected_id === phieu.id;
              return (
                <button
                  key={phieu.id}
                  onClick={() => {
                    setSelectedId(phieu.id);
                    setActiveTab("danh_sach");
                    setShowConfirmReceipt(false);
                    setNgayNhanInput("");
                  }}
                  className="w-full text-left px-4 py-3 transition-all"
                  style={{
                    background: is_selected ? "#0f172a" : "transparent",
                    borderLeft: is_selected
                      ? "2px solid #38bdf8"
                      : "2px solid transparent",
                    borderBottom: "1px solid #0f172a",
                  }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-black"
                          style={{ color: is_selected ? "#38bdf8" : "#94a3b8" }}
                        >
                          {phieu.ma_phieu}
                        </span>
                        <span
                          className="text-[9px]"
                          style={{ color: "#334155" }}
                        >
                          {LOAI_PHIEU_CONFIG[phieu.loai]?.icon}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: "#475569" }}>
                        {phieu.nha_cung_cap}
                      </p>
                    </div>
                    <Badge tt={phieu.trang_thai} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px]" style={{ color: "#334155" }}>
                      {phieu.chi_tiet.length} SKU ·{" "}
                      {new Date(phieu.ngay_tao).toLocaleDateString("vi-VN")}
                    </p>
                    {/* Progress mini */}
                    {phieu.trang_thai !== "cho_hang_ve" && (
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-16 h-1 rounded-full overflow-hidden"
                          style={{ background: "#1e293b" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stats.pct_hoan_thanh}%`,
                              background:
                                stats.pct_hoan_thanh === 100
                                  ? "#10b981"
                                  : "#38bdf8",
                            }}
                          />
                        </div>
                        <span
                          className="text-[9px]"
                          style={{ color: "#475569" }}
                        >
                          {stats.pct_hoan_thanh}%
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Detail panel ────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected_phieu ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <ClipboardList
              size={36}
              className="mb-3 opacity-20"
              style={{ color: "#64748b" }}
            />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>
              Chọn một phiếu nhập để xem chi tiết
            </p>
          </div>
        ) : (
          <>
            {/* Phiếu header */}
            <div
              className="px-6 py-4 border-b flex-shrink-0"
              style={{ borderColor: "#1e293b" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-base font-black text-white">
                      {selected_phieu.ma_phieu}
                    </h2>
                    <Badge tt={selected_phieu.trang_thai} />
                    <span className="text-[10px]" style={{ color: "#475569" }}>
                      {LOAI_PHIEU_CONFIG[selected_phieu.loai]?.icon}{" "}
                      {LOAI_PHIEU_CONFIG[selected_phieu.loai]?.nhan}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    {selected_phieu.nha_cung_cap} · Tạo{" "}
                    {new Date(selected_phieu.ngay_tao).toLocaleDateString(
                      "vi-VN",
                    )}{" "}
                    · Dự kiến{" "}
                    {new Date(selected_phieu.ngay_du_kien).toLocaleDateString(
                      "vi-VN",
                    )}
                  </p>
                  {selected_phieu.loai === "nhap_khac" && (
                    <p
                      className="text-[10px] mt-1"
                      style={{ color: "#f59e0b" }}
                    >
                      Lý do: {selected_phieu.ly_do}
                    </p>
                  )}
                </div>

                {/* Stats nhanh */}
                {(() => {
                  const s = tinh_stats_phieu(selected_phieu);
                  return (
                    <div className="flex items-center gap-3">
                      {[
                        { label: "Tổng SKU", val: s.tong_sku, mau: "#94a3b8" },
                        { label: "Đã QC", val: s.da_kiem, mau: "#38bdf8" },
                        { label: "Đạt", val: s.so_dat, mau: "#10b981" },
                        { label: "Lỗi", val: s.so_loi, mau: "#ef4444" },
                        { label: "Đã cất", val: s.da_cat_ke, mau: "#a78bfa" },
                      ].map(({ label, val, mau }) => (
                        <div
                          key={label}
                          className="text-center px-3 py-2 rounded-xl"
                          style={{
                            background: "#0f172a",
                            border: "1px solid #1e293b",
                          }}
                        >
                          <p
                            className="text-base font-black"
                            style={{ color: mau }}
                          >
                            {val}
                          </p>
                          <p
                            className="text-[9px]"
                            style={{ color: "#475569" }}
                          >
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-3">
                {(
                  [
                    {
                      id: "danh_sach" as ActiveTab,
                      label: "Chi tiết phiếu",
                      icon: ClipboardList,
                    },
                    {
                      id: "qc" as ActiveTab,
                      label: "Kiểm tra QC",
                      icon: CheckCircle,
                    },
                    {
                      id: "put_away" as ActiveTab,
                      label: "Cất lên kệ",
                      icon: Warehouse,
                    },
                  ] as const
                ).map(({ id, label, icon: Icon }) => {
                  const is_avail = available_tabs.includes(id);
                  const is_active = active_tab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => is_avail && setActiveTab(id)}
                      disabled={!is_avail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
                      style={{
                        background: is_active ? "#0c435425" : "transparent",
                        color: is_active ? "#38bdf8" : "#475569",
                        borderBottom: is_active
                          ? "2px solid #38bdf8"
                          : "2px solid transparent",
                      }}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {active_tab === "danh_sach" && (
                <div
                  className="h-full overflow-y-auto"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {/* Table header */}
                  <div
                    className="grid px-6 py-2 text-[9px] font-black uppercase sticky top-0"
                    style={{
                      background: "#0a1628",
                      color: "#334155",
                      borderBottom: "1px solid #1e293b",
                      gridTemplateColumns:
                        "1.5fr 70px 70px 70px 70px 100px 1fr",
                    }}
                  >
                    <span>SKU / Sản phẩm</span>
                    <span className="text-center">SL PO</span>
                    <span className="text-center">Thực nhận</span>
                    <span className="text-center">Đạt QC</span>
                    <span className="text-center">Lỗi</span>
                    <span className="text-center">QC</span>
                    <span>Vị trí cất</span>
                  </div>
                  {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
                  {selected_phieu.chi_tiet.map((ct, i) => (
                    <div
                      key={ct.id}
                      className="grid items-center px-6 py-3 gap-2"
                      style={{
                        gridTemplateColumns:
                          "1.5fr 70px 70px 70px 70px 100px 1fr",
                        borderBottom: "1px solid #0f172a",
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          {ct.ten_sp}
                        </p>
                        <p
                          className="text-[9px] font-mono"
                          style={{ color: "#475569" }}
                        >
                          {ct.ma_sku}
                        </p>
                      </div>
                      <div
                        className="text-center text-sm font-bold"
                        style={{ color: "#64748b" }}
                      >
                        {ct.so_luong_po}
                      </div>
                      <div
                        className="text-center text-sm font-bold"
                        style={{ color: "#94a3b8" }}
                      >
                        {ct.so_luong_thuc || "—"}
                      </div>
                      <div
                        className="text-center text-sm font-bold"
                        style={{ color: "#10b981" }}
                      >
                        {ct.so_luong_dat || "—"}
                      </div>
                      <div
                        className="text-center text-sm font-bold"
                        style={{
                          color: ct.so_luong_loi > 0 ? "#ef4444" : "#334155",
                        }}
                      >
                        {ct.so_luong_loi || "—"}
                      </div>
                      <div className="flex justify-center">
                        <BadgeQC tt={ct.trang_thai_qc} />
                      </div>
                      <div>
                        {ct.da_cat_ke ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle
                              size={11}
                              style={{ color: "#10b981" }}
                            />
                            <code
                              className="text-[10px] font-bold"
                              style={{ color: "#a78bfa" }}
                            >
                              {lay_location_text(ct.node_id_cat, nodes)}
                            </code>
                          </div>
                        ) : ct.trang_thai_qc === "dat" ? (
                          <span
                            className="text-[9px]"
                            style={{ color: "#475569" }}
                          >
                            Chưa cất kệ
                          </span>
                        ) : (
                          <span
                            className="text-[9px]"
                            style={{ color: "#334155" }}
                          >
                            —
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Xác nhận nhận hàng */}
                  {selected_phieu.trang_thai === "cho_hang_ve" && (
                    <div className="px-6 py-4">
                      {!show_confirm_receipt ? (
                        <button
                          onClick={() => {
                            setNgayNhanInput(
                              new Date().toISOString().split("T")[0],
                            );
                            setShowConfirmReceipt(true);
                          }}
                          className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
                          style={{
                            background: "#06472520",
                            color: "#10b981",
                            border: "1px solid #10b98140",
                          }}
                        >
                          <Truck size={14} /> Xác nhận hàng đã về →
                        </button>
                      ) : (
                        <div
                          className="rounded-xl p-4 space-y-3"
                          style={{
                            background: "#0f172a",
                            border: "1px solid #1e293b",
                          }}
                        >
                          <p className="text-xs font-black text-white">
                            Xác nhận nhận hàng
                          </p>
                          <div>
                            <label
                              className="text-[10px] font-black uppercase mb-1.5 block"
                              style={{ color: "#475569" }}
                            >
                              Ngày nhận thực tế *
                            </label>
                            <input
                              type="date"
                              value={ngay_nhan_input}
                              onChange={(e) => setNgayNhanInput(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                              style={{
                                background: "#1e293b",
                                border: "1px solid #334155",
                                color: "white",
                              }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowConfirmReceipt(false)}
                              className="px-4 py-2 rounded-xl text-xs font-bold"
                              style={{
                                background: "#1e293b",
                                color: "#64748b",
                              }}
                            >
                              Huỷ
                            </button>
                            <button
                              onClick={() =>
                                handle_xac_nhan_nhan_hang(
                                  selected_phieu.id,
                                  ngay_nhan_input,
                                )
                              }
                              disabled={!ngay_nhan_input}
                              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black disabled:opacity-40"
                              style={{
                                background: "#06472520",
                                color: "#10b981",
                                border: "1px solid #10b98140",
                              }}
                            >
                              <Check size={13} /> Xác nhận → Bắt đầu QC
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Nút chuyển tab gợi ý */}
                  {selected_phieu.trang_thai === "dang_kiem_tra" && (
                    <div className="px-6 py-4">
                      <button
                        onClick={() => setActiveTab("qc")}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
                        style={{
                          background: "#0c435425",
                          color: "#38bdf8",
                          border: "1px solid #38bdf840",
                        }}
                      >
                        <CheckCircle size={14} /> Bắt đầu kiểm tra QC →
                      </button>
                    </div>
                  )}
                  {selected_phieu.trang_thai === "cho_cat_ke" && (
                    <div className="px-6 py-4">
                      <button
                        onClick={() => setActiveTab("put_away")}
                        className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl"
                        style={{
                          background: "#4c1d9525",
                          color: "#a78bfa",
                          border: "1px solid #a78bfa40",
                        }}
                      >
                        <Warehouse size={14} /> Bắt đầu cất kệ →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {active_tab === "qc" && (
                <PanelQC
                  phieu={selected_phieu}
                  onUpdate={(ct) => handle_update_qc(selected_phieu.id, ct)}
                />
              )}

              {active_tab === "put_away" && (
                <PanelPutAway
                  phieu={selected_phieu}
                  onComplete={(items) =>
                    handle_put_away_complete(selected_phieu.id, items)
                  }
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* Modal tạo phiếu */}
      {show_create && (
        <ModalTaoPhieu
          default_type={loai_tao}
          onSave={handle_create}
          onClose={() => setShowCreate(false)}
        />
      )}

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
