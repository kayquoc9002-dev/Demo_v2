import { useState, useRef, useEffect, useMemo } from "react";
import {
  ScanLine, PackagePlus, PackageMinus, Search, X,
  Plus, Minus, Trash2, Check, AlertTriangle,
  FileText, Printer, RotateCcw, ArrowRight, Package,
} from "lucide-react";
import { KENH_BAN_CONFIG, type DonHang } from "../../../components/BanHang/data/orderData";
import { layTatCaDonHang } from "../../../components/Kho/ServiceLayer/orderService";

// ─── Shared data (import từ KhoDashboard khi tích hợp thật) ──────────────────





// ─── Types ────────────────────────────────────────────────────────────────────

interface DongPhieu {
  ma_sku:     string;
  ten_sp:     string;
  mau_sac:    string;
  kich_thuoc: string;
  vi_tri_ke:  string;
  so_luong:   number;
  don_gia?:   number;    // Nhập: giá nhập, Xuất: giá bán
  ton_kho:    number;    // Tồn hiện tại — để validate
}

type LoaiPhieu = "nhap" | "xuat";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

// ─── Scan Input ───────────────────────────────────────────────────────────────

function ScanInput({ onFound, placeholder }: {
  onFound: (sku: SKUTonKho) => void;
  placeholder?: string;
}) {
  const [val, setVal] = useState("");
  const [loi, setLoi] = useState("");
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { ref.current?.focus(); }, []);

  const xu_ly = (ma: string) => {
    const m = ma.trim().toUpperCase();
    if (!m) return;
    const sku = MOCK_SKU.find(s => s.ma_sku.toUpperCase() === m);
    if (sku) {
      onFound(sku);
      setVal("");
      setLoi("");
      ref.current?.focus();
    } else {
      setLoi(`Không tìm thấy SKU: ${m}`);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="relative flex items-center">
        <ScanLine size={14} className="absolute left-3 animate-pulse" style={{ color: "#38bdf8" }} />
        <input
          ref={ref}
          value={val}
          onChange={e => { setVal(e.target.value); setLoi(""); }}
          onKeyDown={e => e.key === "Enter" && xu_ly(val)}
          placeholder={placeholder ?? "Quét hoặc nhập mã SKU rồi Enter..."}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm font-mono outline-none"
          style={{ background: "#1e293b", border: "2px solid #38bdf840", color: "white" }}
        />
        {val && (
          <button onClick={() => { setVal(""); setLoi(""); ref.current?.focus(); }}
            className="absolute right-3" style={{ color: "#475569" }}>
            <X size={13} />
          </button>
        )}
      </div>
      {loi && (
        <p className="text-[10px] flex items-center gap-1.5 px-3" style={{ color: "#ef4444" }}>
          <AlertTriangle size={10} /> {loi}
        </p>
      )}
    </div>
  );
}

// ─── Bảng chọn từ danh sách ───────────────────────────────────────────────────

function ChonSKUModal({ onChon, onClose, loai }: {
  onChon:  (sku: SKUTonKho) => void;
  onClose: () => void;
  loai:    LoaiPhieu;
}) {
  const [tim, setTim] = useState("");

  const ds_loc = useMemo(() => {
    const q = tim.toLowerCase();
    return MOCK_SKU.filter(s =>
      s.ma_sku.toLowerCase().includes(q) ||
      s.ten_sp.toLowerCase().includes(q) ||
      s.mau_sac.toLowerCase().includes(q)
    );
  }, [tim]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#0f172a", border: "1px solid #1e293b", maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e293b" }}>
          <p className="text-sm font-black text-white">Chọn sản phẩm từ danh sách</p>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        <div className="px-4 py-2 border-b" style={{ borderColor: "#1e293b" }}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={tim} onChange={e => setTim(e.target.value)}
              autoFocus
              placeholder="Tìm theo tên, SKU, màu sắc..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Header */}
          <div className="grid px-4 py-2 text-[9px] font-black uppercase sticky top-0"
            style={{ background: "#0f172a", color: "#334155", gridTemplateColumns: "1fr 80px 70px 70px" }}>
            <span>Sản phẩm</span>
            <span>Vị trí kệ</span>
            <span className="text-center">Tồn kho</span>
            <span />
          </div>
          {ds_loc.map((sku, i) => {
            const het_hang = loai === "xuat" && sku.ton_kho === 0;
            return (
              <button key={sku.ma_sku}
                onClick={() => !het_hang && onChon(sku)}
                disabled={het_hang}
                className="w-full grid px-4 py-2.5 text-left transition-colors hover:bg-slate-800/30 disabled:opacity-40"
                style={{ borderTop: i > 0 ? "1px solid #1e293b" : "none", gridTemplateColumns: "1fr 80px 70px 70px" }}>
                <div>
                  <p className="text-xs font-medium text-white">{sku.ten_sp}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {sku.mau_sac} · {sku.kich_thuoc}
                    <span className="ml-2 font-mono" style={{ color: "#334155" }}>{sku.ma_sku}</span>
                  </p>
                </div>
                <span className="text-[10px] font-mono self-center" style={{ color: "#a78bfa" }}>{sku.vi_tri_ke}</span>
                <span className="text-sm font-black self-center text-center"
                  style={{ color: sku.ton_kho === 0 ? "#ef4444" : sku.ton_kho < 5 ? "#f59e0b" : "#10b981" }}>
                  {sku.ton_kho === 0 ? "Hết" : sku.ton_kho}
                </span>
                <div className="flex justify-end self-center">
                  {!het_hang && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ background: "#1e293b" }}>
                      <Plus size={11} style={{ color: "#38bdf8" }} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Chọn đơn hàng (chỉ cho xuất kho) ───────────────────────────────────────

function ChonDonHangModal({ onChon, onClose }: {
  onChon:  (don: DonHang) => void;
  onClose: () => void;
}) {
  const [tim, setTim] = useState("");
  const [all_don, setAllDon] = useState<DonHang[]>([]);
  useEffect(() => { layTatCaDonHang().then(setAllDon); }, []);
  const ds = all_don.filter(o =>
    ["cho_xu_ly", "dang_san_xuat", "cho_giao_van_chuyen"].includes(o.trang_thai_don)
  );
  const ds_loc = ds.filter(o =>
    o.ma_don.toLowerCase().includes(tim.toLowerCase()) ||
    o.khach_hang.ten.toLowerCase().includes(tim.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#0f172a", border: "1px solid #1e293b", maxHeight: "80vh" }}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#1e293b" }}>
          <div>
            <p className="text-sm font-black text-white">Chọn đơn hàng cần xuất kho</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>Đơn chờ xử lý, đang sản xuất, chờ giao VC</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        <div className="px-4 py-2 border-b" style={{ borderColor: "#1e293b" }}>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={tim} onChange={e => setTim(e.target.value)} autoFocus
              placeholder="Tìm mã đơn, tên khách..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {ds_loc.map((don, i) => {
            const kenh = KENH_BAN_CONFIG[don.kenh_ban];
            const tong_sp = don.san_pham.reduce((s, x) => s + x.so_luong, 0);
            return (
              <button key={don.id} onClick={() => onChon(don)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/30 transition-colors"
                style={{ borderTop: i > 0 ? "1px solid #1e293b" : "none" }}>
                <span style={{ fontSize: 16 }}>{kenh.bieu_tuong}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{don.khach_hang.ten}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {don.ma_don} · {tong_sp} SP · {don.san_pham[0].ten_sp}{don.san_pham.length > 1 ? ` +${don.san_pham.length - 1}` : ""}
                  </p>
                </div>
                <ArrowRight size={13} style={{ color: "#334155" }} />
              </button>
            );
          })}
          {ds_loc.length === 0 && (
            <p className="text-xs text-center py-8" style={{ color: "#475569" }}>Không có đơn phù hợp</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dòng trong phiếu ─────────────────────────────────────────────────────────

function DongPhieuRow({ dong, loai, onDoiSL, onXoa }: {
  dong:    DongPhieu;
  loai:    LoaiPhieu;
  onDoiSL: (sl: number) => void;
  onXoa:   () => void;
}) {
  const qua_ton = loai === "xuat" && dong.so_luong > dong.ton_kho;

  return (
    <div className={`grid items-center px-4 py-3 border-t gap-2 ${qua_ton ? "bg-red-950/20" : ""}`}
      style={{ borderColor: "#1e293b", gridTemplateColumns: "1fr 90px 120px 110px 36px" }}>

      {/* SP */}
      <div className="min-w-0">
        <p className="text-xs font-medium text-white truncate">{dong.ten_sp}</p>
        <p className="text-[10px]" style={{ color: "#475569" }}>
          {dong.mau_sac} · {dong.kich_thuoc}
          <span className="ml-2 font-mono" style={{ color: "#475569" }}>{dong.ma_sku}</span>
        </p>
        {qua_ton && (
          <p className="text-[10px] flex items-center gap-1 mt-0.5" style={{ color: "#ef4444" }}>
            <AlertTriangle size={9} /> Vượt tồn kho ({dong.ton_kho})
          </p>
        )}
      </div>

      {/* Vị trí kệ */}
      <span className="text-[10px] font-mono font-bold" style={{ color: "#a78bfa" }}>{dong.vi_tri_ke}</span>

      {/* Số lượng */}
      <div className="flex items-center gap-1.5">
        <button onClick={() => onDoiSL(Math.max(1, dong.so_luong - 1))}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#1e293b", color: "#64748b" }}>
          <Minus size={10} />
        </button>
        <input
          type="number" min={1}
          value={dong.so_luong}
          onChange={e => onDoiSL(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-12 text-center text-sm font-black rounded-lg py-1 outline-none"
          style={{
            background: "#1e293b",
            border: `1px solid ${qua_ton ? "#ef4444" : "#334155"}`,
            color: qua_ton ? "#ef4444" : "white",
          }} />
        <button onClick={() => onDoiSL(dong.so_luong + 1)}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "#1e293b", color: "#64748b" }}>
          <Plus size={10} />
        </button>
      </div>

      {/* Đơn giá */}
      <div>
        {dong.don_gia !== undefined ? (
          <p className="text-xs font-black text-right" style={{ color: "#f59e0b" }}>
            {fmt(dong.don_gia * dong.so_luong)}
          </p>
        ) : (
          <p className="text-xs text-right" style={{ color: "#334155" }}>—</p>
        )}
        {dong.don_gia !== undefined && (
          <p className="text-[9px] text-right" style={{ color: "#334155" }}>
            {fmt(dong.don_gia)} × {dong.so_luong}
          </p>
        )}
      </div>

      {/* Xóa */}
      <button onClick={onXoa}
        className="w-7 h-7 rounded-lg flex items-center justify-center justify-self-end hover:bg-red-950/40 transition-colors"
        style={{ color: "#ef444460" }}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Toast thông báo ──────────────────────────────────────────────────────────

function Toast({ nhan, mau, onClose }: { nhan: string; mau: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}>
      <div className="w-2 h-2 rounded-full" style={{ background: mau }} />
      <p className="text-sm font-bold" style={{ color: mau }}>{nhan}</p>
      <button onClick={onClose} style={{ color: "#475569" }}><X size={13} /></button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function XuatNhapKho() {
  const [tab, setTab]             = useState<LoaiPhieu>("xuat");
  const [ds_dong, setDsDong]      = useState<DongPhieu[]>([]);
  const [don_hang, setDonHang]    = useState<DonHang[]>([]);
  useEffect(() => { layTatCaDonHang().then(setDonHang); }, []);
  const [mo_chon_sku, setMoChonSKU]   = useState(false);
  const [mo_chon_don, setMoChonDon]   = useState(false);
  const [ghi_chu, setGhiChu]      = useState("");
  const [ncc, setNcc]             = useState("");
  const [da_xac_nhan, setDaXacNhan] = useState(false);
  const [toast, setToast]         = useState<{ nhan: string; mau: string } | null>(null);

  // Reset khi đổi tab
  const doi_tab = (t: LoaiPhieu) => {
    setTab(t);
    setDsDong([]);
    setGhiChu("");
    setNcc("");
    setDaXacNhan(false);
  };

  // Thêm SKU vào phiếu
  const them_sku = (sku: SKUTonKho) => {
    setDsDong(prev => {
      const idx = prev.findIndex(d => d.ma_sku === sku.ma_sku);
      if (idx >= 0) {
        // Đã có — tăng SL
        return prev.map((d, i) => i === idx ? { ...d, so_luong: d.so_luong + 1 } : d);
      }
      return [...prev, {
        ma_sku:     sku.ma_sku,
        ten_sp:     sku.ten_sp,
        mau_sac:    sku.mau_sac,
        kich_thuoc: sku.kich_thuoc,
        vi_tri_ke:  sku.vi_tri_ke,
        so_luong:   1,
        don_gia:    sku.don_gia_nhap,
        ton_kho:    sku.ton_kho,
      }];
    });
  };

  // Chọn từ đơn hàng → tự điền danh sách SP
  const chon_don = (don: DonHang) => {
    const ds_moi: DongPhieu[] = don.san_pham.map(sp => {
      const sku = MOCK_SKU.find(s => s.ma_sku === sp.ma_sku);
      return {
        ma_sku:     sp.ma_sku,
        ten_sp:     sp.ten_sp,
        mau_sac:    sp.mau_sac,
        kich_thuoc: sp.kich_thuoc,
        vi_tri_ke:  sku?.vi_tri_ke ?? "—",
        so_luong:   sp.so_luong,
        don_gia:    sp.don_gia,
        ton_kho:    sku?.ton_kho ?? 0,
      };
    });
    setDsDong(ds_moi);
    setGhiChu(`Xuất theo đơn ${don.ma_don} — ${don.khach_hang.ten}`);
    setMoChonDon(false);
    setToast({ nhan: `Đã điền ${ds_moi.length} SP từ ${don.ma_don}`, mau: "#10b981" });
  };

  const doi_sl = (ma_sku: string, sl: number) => {
    setDsDong(prev => prev.map(d => d.ma_sku === ma_sku ? { ...d, so_luong: sl } : d));
  };
  const xoa_dong = (ma_sku: string) => setDsDong(prev => prev.filter(d => d.ma_sku !== ma_sku));

  const tong_tien   = ds_dong.reduce((s, d) => s + (d.don_gia ?? 0) * d.so_luong, 0);
  const co_loi      = ds_dong.some(d => tab === "xuat" && d.so_luong > d.ton_kho);
  const co_the_luu  = ds_dong.length > 0 && !co_loi;

  const xac_nhan = () => {
    if (!co_the_luu) return;
    setDaXacNhan(true);
    setToast({
      nhan: `Phiếu ${tab === "nhap" ? "nhập" : "xuất"} kho đã lưu — ${ds_dong.length} dòng · ${ds_dong.reduce((s,d) => s + d.so_luong, 0)} SP`,
      mau: "#10b981",
    });
    // Reset sau 1.5s để người dùng thấy trạng thái success
    setTimeout(() => {
      setDsDong([]);
      setGhiChu("");
      setNcc("");
      setDaXacNhan(false);
    }, 1500);
  };

  const IS_NHAP = tab === "nhap";
  const mau_tab = IS_NHAP ? "#10b981" : "#f59e0b";

  return (
    <div className="p-5 min-h-screen" style={{ background: "#020817" }}>

      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-black text-white">Xuất / Nhập kho</h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Tạo phiếu xuất hoặc nhập hàng</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* ── Cột trái: Form ────────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Tab chọn loại phiếu */}
          <div className="flex rounded-2xl overflow-hidden p-1 gap-1"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            {([
              { id: "xuat", nhan: "Xuất kho",  icon: PackageMinus, mau: "#f59e0b" },
              { id: "nhap", nhan: "Nhập kho",  icon: PackagePlus,  mau: "#10b981" },
            ] as const).map(({ id, nhan, icon: Icon, mau }) => (
              <button key={id} onClick={() => doi_tab(id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all"
                style={{
                  background: tab === id ? mau + "20" : "transparent",
                  color:      tab === id ? mau : "#475569",
                  border:     tab === id ? `1px solid ${mau}40` : "1px solid transparent",
                }}>
                <Icon size={15} /> {nhan}
              </button>
            ))}
          </div>

          {/* Thông tin phiếu */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#475569" }}>
              Thông tin phiếu
            </p>
            {IS_NHAP && (
              <div>
                <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: "#475569" }}>
                  Nhà cung cấp / Xưởng may
                </label>
                <input value={ncc} onChange={e => setNcc(e.target.value)}
                  placeholder="Tên NCC hoặc xưởng..."
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
              </div>
            )}
            <div>
              <label className="text-[10px] font-bold uppercase mb-1 block" style={{ color: "#475569" }}>
                Ghi chú
              </label>
              <input value={ghi_chu} onChange={e => setGhiChu(e.target.value)}
                placeholder={IS_NHAP ? "VD: Nhập hàng T4, lô áo thun..." : "VD: Xuất theo đơn DH-2026-xxxx..."}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            </div>
          </div>

          {/* Thêm sản phẩm */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <div className="px-4 py-3 border-b flex items-center justify-between"
              style={{ borderColor: "#1e293b" }}>
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>
                Danh sách sản phẩm
              </p>
              <div className="flex items-center gap-2">
                {/* Chọn đơn hàng — chỉ khi xuất */}
                {!IS_NHAP && (
                  <button onClick={() => setMoChonDon(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                    style={{ background: "#78350f20", color: "#f59e0b", border: "1px solid #f59e0b30" }}>
                    <FileText size={11} /> Chọn từ đơn hàng
                  </button>
                )}
                <button onClick={() => setMoChonSKU(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                  style={{ background: mau_tab + "20", color: mau_tab, border: `1px solid ${mau_tab}30` }}>
                  <Package size={11} /> Chọn từ danh sách
                </button>
              </div>
            </div>

            {/* Scan bar */}
            <div className="px-4 py-3 border-b" style={{ borderColor: "#1e293b" }}>
              <ScanInput
                onFound={them_sku}
                placeholder={`Quét mã SKU để ${IS_NHAP ? "nhập" : "xuất"} kho...`}
              />
            </div>

            {/* Header bảng */}
            {ds_dong.length > 0 && (
              <div className="grid px-4 py-2 text-[9px] font-black uppercase"
                style={{ background: "#1e293b20", color: "#334155", gridTemplateColumns: "1fr 90px 120px 110px 36px" }}>
                <span>Sản phẩm</span>
                <span>Kệ</span>
                <span className="text-center">Số lượng</span>
                <span className="text-right">Thành tiền</span>
                <span />
              </div>
            )}

            {/* Danh sách dòng */}
            {ds_dong.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={28} className="mx-auto mb-3 opacity-20" style={{ color: "#64748b" }} />
                <p className="text-sm" style={{ color: "#475569" }}>
                  Quét mã hoặc chọn SP từ danh sách
                </p>
                <p className="text-xs mt-1" style={{ color: "#334155" }}>
                  {IS_NHAP ? "Nhập" : "Xuất"} nhiều SKU cùng lúc được
                </p>
              </div>
            ) : (
              ds_dong.map(dong => (
                <DongPhieuRow key={dong.ma_sku} dong={dong} loai={tab}
                  onDoiSL={sl => doi_sl(dong.ma_sku, sl)}
                  onXoa={() => xoa_dong(dong.ma_sku)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Cột phải: Tổng kết & Xác nhận ──────────────── */}
        <div className="space-y-4">

          {/* Tổng kết phiếu */}
          <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#475569" }}>
              Tổng kết phiếu {IS_NHAP ? "nhập" : "xuất"}
            </p>

            <div className="space-y-2.5">
              {[
                { nhan: "Loại phiếu",    gia_tri: IS_NHAP ? "Phiếu nhập kho" : "Phiếu xuất kho",    mau: mau_tab },
                { nhan: "Số dòng SP",    gia_tri: `${ds_dong.length} SKU`,                            mau: "white" },
                { nhan: "Tổng số lượng", gia_tri: `${ds_dong.reduce((s,d) => s + d.so_luong, 0)} SP`, mau: "white" },
              ].map(({ nhan, gia_tri, mau }) => (
                <div key={nhan} className="flex justify-between text-xs">
                  <span style={{ color: "#64748b" }}>{nhan}</span>
                  <span className="font-bold" style={{ color: mau }}>{gia_tri}</span>
                </div>
              ))}

              {tong_tien > 0 && (
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#1e293b" }}>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    Tổng {IS_NHAP ? "giá nhập" : "giá trị"}
                  </span>
                  <span className="text-sm font-black" style={{ color: "#f59e0b" }}>{fmt(tong_tien)}</span>
                </div>
              )}
            </div>

            {/* Cảnh báo nếu có lỗi */}
            {co_loi && (
              <div className="mt-3 px-3 py-2 rounded-xl flex items-center gap-2"
                style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
                <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                <p className="text-[10px]" style={{ color: "#ef4444" }}>
                  Có SP vượt quá tồn kho — kiểm tra lại số lượng
                </p>
              </div>
            )}

            {/* Nút xác nhận */}
            <button
              onClick={xac_nhan}
              disabled={!co_the_luu || da_xac_nhan}
              className="w-full mt-4 py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all disabled:opacity-40"
              style={{
                background: da_xac_nhan ? "#06472550" : co_the_luu ? mau_tab + "25" : "#1e293b",
                color:      da_xac_nhan ? "#10b981"   : co_the_luu ? mau_tab : "#475569",
                border:     `2px solid ${da_xac_nhan ? "#10b98150" : co_the_luu ? mau_tab + "60" : "#334155"}`,
              }}>
              {da_xac_nhan
                ? <><Check size={15} /> Đã lưu phiếu</>
                : IS_NHAP
                  ? <><PackagePlus size={15} /> Xác nhận nhập kho</>
                  : <><PackageMinus size={15} /> Xác nhận xuất kho</>
              }
            </button>

            {/* Nút phụ */}
            {ds_dong.length > 0 && !da_xac_nhan && (
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ background: "#1e293b", color: "#64748b", border: "1px solid #334155" }}>
                  <Printer size={11} /> In phiếu
                </button>
                <button
                  onClick={() => { setDsDong([]); setGhiChu(""); setNcc(""); }}
                  className="flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                  style={{ background: "#7f1d1d20", color: "#fb7185", border: "1px solid #fb718530" }}>
                  <RotateCcw size={11} /> Làm mới
                </button>
              </div>
            )}
          </div>

          {/* Gợi ý SKU sắp hết (chỉ khi nhập) */}
          {IS_NHAP && (
            <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #ef444425" }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                <p className="text-xs font-black" style={{ color: "#ef4444" }}>SKU sắp hết — cần nhập</p>
              </div>
              <div className="space-y-2">
                {MOCK_SKU.filter(s => s.ton_kho <= 5).slice(0, 5).map(sku => (
                  <button key={sku.ma_sku} onClick={() => them_sku(sku)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800/30 transition-colors"
                    style={{ border: "1px solid #334155" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate">{sku.ten_sp}</p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>
                        {sku.mau_sac} · {sku.kich_thuoc}
                      </p>
                    </div>
                    <span className="text-xs font-black flex-shrink-0"
                      style={{ color: sku.ton_kho === 0 ? "#ef4444" : "#f59e0b" }}>
                      {sku.ton_kho === 0 ? "Hết" : `Còn ${sku.ton_kho}`}
                    </span>
                    <Plus size={11} style={{ color: "#38bdf8" }} className="flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Đơn đang chờ xuất (chỉ khi xuất) */}
          {!IS_NHAP && (
            <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #f59e0b25" }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={12} style={{ color: "#f59e0b" }} />
                <p className="text-xs font-black" style={{ color: "#f59e0b" }}>Đơn đang chờ xuất</p>
              </div>
              <div className="space-y-2">
                {don_hang
                  .filter(o => o.trang_thai_don === "cho_xu_ly")
                  .slice(0, 4)
                  .map(don => (
                    <button key={don.id} onClick={() => chon_don(don)}
                      className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-left hover:bg-slate-800/30 transition-colors"
                      style={{ border: "1px solid #334155" }}>
                      <span style={{ fontSize: 13 }}>{KENH_BAN_CONFIG[don.kenh_ban].bieu_tuong}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-white truncate">{don.khach_hang.ten}</p>
                        <p className="text-[9px]" style={{ color: "#475569" }}>
                          {don.ma_don} · {don.san_pham.reduce((s,x) => s + x.so_luong, 0)} SP
                        </p>
                      </div>
                      <ArrowRight size={11} style={{ color: "#334155" }} />
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {mo_chon_sku && (
        <ChonSKUModal loai={tab} onChon={sku => { them_sku(sku); setMoChonSKU(false); }} onClose={() => setMoChonSKU(false)} />
      )}
      {mo_chon_don && (
        <ChonDonHangModal onChon={chon_don} onClose={() => setMoChonDon(false)} />
      )}
      {toast && <Toast nhan={toast.nhan} mau={toast.mau} onClose={() => setToast(null)} />}
    </div>
  );
}