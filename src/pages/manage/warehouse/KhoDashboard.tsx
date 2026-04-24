import { useState, useMemo, useEffect, useRef } from "react";
import {
  ScanLine,
  PackagePlus,
  PackageMinus,
  RotateCcw,
  AlertTriangle,
  TrendingDown,
  Archive,
  // ChevronRight,
  Warehouse,
  ArrowRight,
  Download,
  // Bell,
  RefreshCw,
  // Package,
  Truck,
  Box,
  ClipboardList,
  Zap,
  // Clock,
  X,
  Search,
  Check,
} from "lucide-react";
import {
  MOCK_DON_HANG,
  TRANG_THAI_DON_CONFIG,
} from "../../../components/BanHang/data/orderData";
import {
  MOCK_SKU_RULES,
  MOCK_NODES,
} from "../../../components/Kho/data/warehouseMockData";
// import { MOCK_SKU } from "./XuatNhapKho";
import { lay_canh_bao_dashboard } from "../../../components/Kho/data/skuRuleHelpers";

// ─── Mock data kho ────────────────────────────────────────────────────────────

interface SKUTonKho {
  ma_sku: string;
  ten_sp: string;
  mau_sac: string;
  kich_thuoc: string;
  vi_tri_ke: string;
  ton_kho: number;
  dinh_muc_min: number; // Tối thiểu cần có
  ngay_nhap_cuoi: string; // ISO — để tính aging
}

interface LoHang {
  id: string;
  ma_lo: string;
  ncc: string; // Nhà cung cấp / xưởng
  so_luong: number;
  trang_thai: "sap_ve" | "da_nhan_dang_kiem" | "cho_cat_len_ke";
  ngay_du_kien: string;
  ghi_chu?: string;
}

const MOCK_SKU: SKUTonKho[] = [
  {
    ma_sku: "AT001-XS-TRANG",
    ten_sp: "Áo Thun Basic Oversize",
    mau_sac: "Trắng",
    kich_thuoc: "XS",
    vi_tri_ke: "KhuA-O01",
    ton_kho: 3,
    dinh_muc_min: 10,
    ngay_nhap_cuoi: "2026-01-15",
  },
  {
    ma_sku: "AT001-M-HONG",
    ten_sp: "Áo Thun Basic Oversize",
    mau_sac: "Hồng",
    kich_thuoc: "M",
    vi_tri_ke: "KhuA-O02",
    ton_kho: 2,
    dinh_muc_min: 10,
    ngay_nhap_cuoi: "2025-12-20",
  },
  {
    ma_sku: "QS002-L-KEM",
    ten_sp: "Quần Short Kaki",
    mau_sac: "Kem",
    kich_thuoc: "L",
    vi_tri_ke: "KhuB-O03",
    ton_kho: 4,
    dinh_muc_min: 8,
    ngay_nhap_cuoi: "2026-02-01",
  },
  {
    ma_sku: "VD003-L-XANH",
    ten_sp: "Váy Midi Floral",
    mau_sac: "Xanh",
    kich_thuoc: "L",
    vi_tri_ke: "KhuC-O02",
    ton_kho: 1,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-11-10",
  },
  {
    ma_sku: "DS011-37-NAU",
    ten_sp: "Dép Sandal Da Bò",
    mau_sac: "Nâu",
    kich_thuoc: "37",
    vi_tri_ke: "KhuD-O04",
    ton_kho: 0,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-10-05",
  },
  {
    ma_sku: "AK007-S-DEN",
    ten_sp: "Áo Khoác Bomber",
    mau_sac: "Đen",
    kich_thuoc: "S",
    vi_tri_ke: "KhuA-O05",
    ton_kho: 5,
    dinh_muc_min: 8,
    ngay_nhap_cuoi: "2025-09-15",
  },
  // Hàng tồn đọng / lỗi mốt (nhập lâu, ít giao dịch)
  {
    ma_sku: "DW005-XL-DO",
    ten_sp: "Đầm Wrap Cổ V",
    mau_sac: "Đỏ",
    kich_thuoc: "XL",
    vi_tri_ke: "KhuC-O05",
    ton_kho: 18,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-07-01",
  },
  {
    ma_sku: "SB008-XL-HONG",
    ten_sp: "Set Đồ Bộ Thể Thao",
    mau_sac: "Hồng",
    kich_thuoc: "XL",
    vi_tri_ke: "KhuB-O06",
    ton_kho: 22,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-06-15",
  },
  {
    ma_sku: "MB009-FS-DO",
    ten_sp: "Mũ Bucket Vải Thô",
    mau_sac: "Đỏ",
    kich_thuoc: "FS",
    vi_tri_ke: "KhuD-O05",
    ton_kho: 35,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-05-20",
  },
  {
    ma_sku: "QJ004-34-XNHT",
    ten_sp: "Quần Jean Skinny",
    mau_sac: "Xanh",
    kich_thuoc: "34",
    vi_tri_ke: "KhuB-O07",
    ton_kho: 12,
    dinh_muc_min: 5,
    ngay_nhap_cuoi: "2025-08-01",
  },
];

const MOCK_LO_HANG: LoHang[] = [
  {
    id: "L1",
    ma_lo: "LH-2026-041",
    ncc: "Xưởng may Minh Phát",
    so_luong: 200,
    trang_thai: "sap_ve",
    ngay_du_kien: "2026-04-17",
    ghi_chu: "Đơn áo thun tháng 4",
  },
  {
    id: "L2",
    ma_lo: "LH-2026-039",
    ncc: "Xưởng Thành Đạt",
    so_luong: 150,
    trang_thai: "da_nhan_dang_kiem",
    ngay_du_kien: "2026-04-14",
    ghi_chu: "Đang kiểm lỗi đường may",
  },
  {
    id: "L3",
    ma_lo: "LH-2026-036",
    ncc: "NCC Phụ kiện VN",
    so_luong: 300,
    trang_thai: "cho_cat_len_ke",
    ngay_du_kien: "2026-04-12",
    ghi_chu: "3 thùng mũ bucket chờ cất",
  },
  {
    id: "L4",
    ma_lo: "LH-2026-042",
    ncc: "Xưởng may Minh Phát",
    so_luong: 120,
    trang_thai: "sap_ve",
    ngay_du_kien: "2026-04-20",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ngay_qua = (ngay: string): number => {
  return Math.floor((Date.now() - new Date(ngay).getTime()) / 86400000);
};

const SUC_CHUA_KHO = { hien_tai: 847, tong: 1000 }; // số ô/vị trí

// ─── Scan Bar ─────────────────────────────────────────────────────────────────

function ScanBar({ onScan }: { onScan: (ma: string) => void }) {
  const [gia_tri, setGiaTri] = useState("");
  const [ket_qua, setKetQua] = useState<{
    loai: string;
    nhan: string;
    mau: string;
  } | null>(null);
  const input_ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    input_ref.current?.focus();
  }, []);

  const xu_ly_quet = (ma: string) => {
    const m = ma.trim().toUpperCase();
    if (!m) return;

    // Nhận diện loại mã
    if (m.startsWith("DH-")) {
      const don = MOCK_DON_HANG.find((o) => o.ma_don.toUpperCase() === m);
      if (don) {
        const cfg = TRANG_THAI_DON_CONFIG[don.trang_thai_don];
        setKetQua({
          loai: "Đơn hàng",
          nhan: `${don.ma_don} · ${don.khach_hang.ten} · ${cfg.nhan}`,
          mau: cfg.mau,
        });
      } else {
        setKetQua({
          loai: "Không tìm thấy",
          nhan: `Không có đơn hàng ${m}`,
          mau: "#ef4444",
        });
      }
    } else if (m.startsWith("LH-")) {
      const lo = MOCK_LO_HANG.find((l) => l.ma_lo.toUpperCase() === m);
      if (lo) {
        setKetQua({
          loai: "Lô hàng",
          nhan: `${lo.ma_lo} · ${lo.ncc} · ${lo.so_luong} SP`,
          mau: "#38bdf8",
        });
      } else {
        setKetQua({
          loai: "Không tìm thấy",
          nhan: `Không có lô hàng ${m}`,
          mau: "#ef4444",
        });
      }
    } else {
      // Thử tìm theo SKU
      const sku = MOCK_SKU.find((s) => s.ma_sku.toUpperCase() === m);
      if (sku) {
        setKetQua({
          loai: "SKU Sản phẩm",
          nhan: `${sku.ten_sp} · ${sku.mau_sac}/${sku.kich_thuoc} · Kệ: ${sku.vi_tri_ke} · Tồn: ${sku.ton_kho}`,
          mau: "#a78bfa",
        });
      } else {
        setKetQua({
          loai: "Không nhận diện",
          nhan: `Mã không hợp lệ: ${m}`,
          mau: "#ef4444",
        });
      }
    }
    onScan(m);
  };

  return (
    <div className="space-y-2">
      <div className="relative flex items-center gap-2">
        <div className="absolute left-4 flex items-center gap-2">
          <ScanLine
            size={16}
            style={{ color: "#38bdf8" }}
            className="animate-pulse"
          />
        </div>
        <input
          ref={input_ref}
          value={gia_tri}
          onChange={(e) => {
            setGiaTri(e.target.value);
            setKetQua(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              xu_ly_quet(gia_tri);
              setGiaTri("");
            }
          }}
          placeholder="Quét mã vạch hoặc nhập mã đơn / SKU / lô hàng rồi Enter..."
          className="w-full pl-10 pr-4 py-3.5 rounded-2xl text-sm outline-none font-mono transition-all"
          style={{
            background: "#0f172a",
            border: "2px solid #38bdf8",
            color: "white",
            boxShadow: "0 0 20px #38bdf820",
          }}
        />
        {gia_tri && (
          <button
            onClick={() => {
              setGiaTri("");
              setKetQua(null);
              input_ref.current?.focus();
            }}
            className="absolute right-4"
            style={{ color: "#475569" }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {ket_qua && (
        <div
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs"
          style={{
            background: ket_qua.mau + "15",
            border: `1px solid ${ket_qua.mau}30`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: ket_qua.mau }}
          />
          <span className="font-bold" style={{ color: ket_qua.mau }}>
            {ket_qua.loai}
          </span>
          <span style={{ color: "#94a3b8" }}>{ket_qua.nhan}</span>
        </div>
      )}
    </div>
  );
}

// ─── Funnel card ──────────────────────────────────────────────────────────────

function FunnelCard({
  nhan,
  so_luong,
  mau,
  icon: Icon,
  canh_bao,
}: {
  nhan: string;
  so_luong: number;
  mau: string;
  icon: any;
  canh_bao?: boolean;
}) {
  return (
    <div className="flex-1 min-w-0 text-center">
      <div className="relative inline-flex flex-col items-center gap-1.5 w-full">
        {/* Số lượng — to, nổi bật */}
        <div
          className={`text-3xl font-black leading-none ${canh_bao ? "animate-pulse" : ""}`}
          style={{
            color: canh_bao ? mau : so_luong === 0 ? "#334155" : "white",
          }}
        >
          {so_luong}
        </div>
        {/* Icon + nhãn */}
        <div className="flex items-center gap-1">
          <Icon size={11} style={{ color: so_luong === 0 ? "#334155" : mau }} />
          <p
            className="text-[10px] font-medium leading-tight whitespace-nowrap"
            style={{ color: so_luong === 0 ? "#334155" : "#94a3b8" }}
          >
            {nhan}
          </p>
        </div>
        {/* Dot cảnh báo */}
        {canh_bao && so_luong > 0 && (
          <div
            className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
            style={{ background: mau }}
          />
        )}
      </div>
    </div>
  );
}

function FunnelArrow() {
  return (
    <div className="flex items-center flex-shrink-0 pb-4 px-1">
      <ArrowRight size={12} style={{ color: "#1e293b" }} />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KhoDashboard() {
  const [tab_canh_bao, setTabCanhBao] = useState<"sap_het" | "ton_dong">(
    "sap_het",
  );
  const [ma_quet, setMaQует] = useState<string | null>(null);

  // Tính toán từ MOCK_DON_HANG
  const luan_xuat = useMemo(
    () => ({
      don_moi: MOCK_DON_HANG.filter((o) => o.trang_thai_don === "cho_xu_ly")
        .length,
      dang_nhat_hang: MOCK_DON_HANG.filter(
        (o) => o.trang_thai_don === "dang_san_xuat",
      ).length,
      dang_dong_goi: MOCK_DON_HANG.filter(
        (o) => o.trang_thai_don === "cho_giao_van_chuyen",
      ).length,
      cho_xe_lay: MOCK_DON_HANG.filter(
        (o) => o.trang_thai_don === "dang_van_chuyen",
      ).length,
    }),
    [],
  );

  const luan_nhap = useMemo(
    () => ({
      sap_ve: MOCK_LO_HANG.filter((l) => l.trang_thai === "sap_ve").length,
      dang_kiem: MOCK_LO_HANG.filter(
        (l) => l.trang_thai === "da_nhan_dang_kiem",
      ).length,
      cho_cat_ke: MOCK_LO_HANG.filter((l) => l.trang_thai === "cho_cat_len_ke")
        .length,
    }),
    [],
  );

  const luan_su_co = useMemo(
    () => ({
      hang_hoan_ve: MOCK_DON_HANG.filter(
        (o) => o.trang_thai_don === "giao_that_bai",
      ).length,
      hang_loi: MOCK_DON_HANG.filter((o) => o.trang_thai_don === "tra_hang_loi")
        .length,
    }),
    [],
  );

  // Cảnh báo tồn kho
  // ── Cảnh báo tồn kho từ Module 2b (SkuLocationRule) ──
  const ton_kho_map = useMemo(
    () => Object.fromEntries(MOCK_SKU.map((s) => [s.ma_sku, s.ton_kho])),
    [],
  );
  const sap_het = useMemo(
    () => lay_canh_bao_dashboard(MOCK_SKU_RULES, MOCK_NODES, ton_kho_map),
    [ton_kho_map],
  );

  const ton_dong = MOCK_SKU.filter(
    (s) => ngay_qua(s.ngay_nhap_cuoi) > 90 && s.ton_kho > 5,
  ).sort((a, b) => ngay_qua(b.ngay_nhap_cuoi) - ngay_qua(a.ngay_nhap_cuoi));

  const suc_chua_pct = Math.round(
    (SUC_CHUA_KHO.hien_tai / SUC_CHUA_KHO.tong) * 100,
  );
  const canh_bao_suc_chua = suc_chua_pct >= 85;

  return (
    <div
      className="p-5 space-y-4 min-h-screen"
      style={{ background: "#020817" }}
    >
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Warehouse size={20} style={{ color: "#38bdf8" }} />
            Tổng quan kho
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            Cập nhật ·{" "}
            {new Date().toLocaleString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
            }}
          >
            <RefreshCw size={11} /> Làm mới
          </button>
        </div>
      </div>

      {/* ── Scan Bar + Action Buttons ─────────────────────── */}
      <div
        className="rounded-2xl p-4 space-y-3"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
      >
        <ScanBar onScan={setMaQует} />
        <div className="flex items-center gap-2 flex-wrap">
          {[
            {
              nhan: "Nhập kho",
              icon: PackagePlus,
              mau: "#10b981",
              nen: "#06472520",
            },
            {
              nhan: "Xuất kho",
              icon: PackageMinus,
              mau: "#f59e0b",
              nen: "#78350f20",
            },
            {
              nhan: "Xử lý hoàn",
              icon: RotateCcw,
              mau: "#fb7185",
              nen: "#88152520",
            },
          ].map(({ nhan, icon: Icon, mau, nen }) => (
            <button
              key={nhan}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:opacity-80"
              style={{
                background: nen,
                color: mau,
                border: `1px solid ${mau}30`,
              }}
            >
              <Icon size={13} /> {nhan}
            </button>
          ))}
          <div className="flex-1" />
          {/* Sức chứa kho */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-xl"
            style={{
              background: canh_bao_suc_chua ? "#7f1d1d20" : "#1e293b",
              border: `1px solid ${canh_bao_suc_chua ? "#ef444440" : "#334155"}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Warehouse
                size={12}
                style={{ color: canh_bao_suc_chua ? "#ef4444" : "#64748b" }}
              />
              <span
                className="text-[10px] font-bold"
                style={{ color: canh_bao_suc_chua ? "#ef4444" : "#64748b" }}
              >
                Sức chứa kho
              </span>
            </div>
            <div
              className="w-24 h-2 rounded-full"
              style={{ background: "#334155" }}
            >
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${suc_chua_pct}%`,
                  background:
                    suc_chua_pct >= 90
                      ? "#ef4444"
                      : suc_chua_pct >= 75
                        ? "#f59e0b"
                        : "#10b981",
                }}
              />
            </div>
            <span
              className="text-xs font-black"
              style={{ color: canh_bao_suc_chua ? "#ef4444" : "white" }}
            >
              {suc_chua_pct}%
            </span>
            <span className="text-[10px]" style={{ color: "#334155" }}>
              {SUC_CHUA_KHO.hien_tai}/{SUC_CHUA_KHO.tong} ô
            </span>
          </div>
        </div>
      </div>

      {/* ── 3 Luồng Phễu Công Việc ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Luồng Xuất */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderTop: "2px solid #10b981",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981" }}
            />
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#10b981" }}
            >
              Luồng Xuất — Đơn hàng
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <FunnelCard
              nhan="Đơn mới"
              so_luong={luan_xuat.don_moi}
              mau="#94a3b8"
              icon={ClipboardList}
              canh_bao={luan_xuat.don_moi > 10}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Đang nhặt"
              so_luong={luan_xuat.dang_nhat_hang}
              mau="#94a3b8"
              icon={Search}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Đóng gói"
              so_luong={luan_xuat.dang_dong_goi}
              mau="#94a3b8"
              icon={Box}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Chờ xe lấy"
              so_luong={luan_xuat.cho_xe_lay}
              mau="#f59e0b"
              icon={Truck}
              canh_bao={luan_xuat.cho_xe_lay > 5}
            />
          </div>
          {luan_xuat.cho_xe_lay > 5 && (
            <p
              className="text-[10px] mt-3 flex items-center gap-1.5 pt-3 border-t"
              style={{ borderColor: "#1e293b", color: "#f59e0b" }}
            >
              <AlertTriangle size={10} /> {luan_xuat.cho_xe_lay} đơn chờ ĐVVC —
              cần gọi hãng vận chuyển
            </p>
          )}
        </div>

        {/* Luồng Nhập */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderTop: "2px solid #38bdf8",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#38bdf8" }}
            />
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#38bdf8" }}
            >
              Luồng Nhập — Lô hàng
            </p>
          </div>
          <div className="flex items-center gap-0.5 mb-4">
            <FunnelCard
              nhan="Sắp về"
              so_luong={luan_nhap.sap_ve}
              mau="#94a3b8"
              icon={Truck}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Đang kiểm"
              so_luong={luan_nhap.dang_kiem}
              mau="#f59e0b"
              icon={ClipboardList}
              canh_bao={luan_nhap.dang_kiem > 0}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Chờ cất kệ"
              so_luong={luan_nhap.cho_cat_ke}
              mau="#f97316"
              icon={Warehouse}
              canh_bao={luan_nhap.cho_cat_ke > 0}
            />
          </div>
          {luan_nhap.cho_cat_ke > 0 && (
            <p
              className="text-[10px] mb-3 flex items-center gap-1.5"
              style={{ color: "#f97316" }}
            >
              <AlertTriangle size={10} /> {luan_nhap.cho_cat_ke} lô đang nằm sàn
              — cần cất lên kệ
            </p>
          )}
          {/* Chi tiết lô hàng */}
          <div
            className="space-y-1.5 pt-3 border-t"
            style={{ borderColor: "#1e293b" }}
          >
            {MOCK_LO_HANG.map((lo) => {
              const mau_tt =
                lo.trang_thai === "sap_ve"
                  ? "#475569"
                  : lo.trang_thai === "da_nhan_dang_kiem"
                    ? "#f59e0b"
                    : "#f97316";
              const nhan_tt =
                lo.trang_thai === "sap_ve"
                  ? "Sắp về"
                  : lo.trang_thai === "da_nhan_dang_kiem"
                    ? "Đang kiểm"
                    : "Chờ cất kệ";
              return (
                <div
                  key={lo.id}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                  style={{ background: "#1e293b" }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: mau_tt }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-white truncate">
                      {lo.ncc}
                    </p>
                    <p className="text-[9px]" style={{ color: "#475569" }}>
                      {lo.ma_lo} · {lo.so_luong} SP
                    </p>
                  </div>
                  <span
                    className="text-[9px] font-bold flex-shrink-0"
                    style={{ color: mau_tt }}
                  >
                    {nhan_tt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Luồng Sự Cố */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "#0f172a",
            border: "1px solid #1e293b",
            borderTop: "2px solid #ef4444",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#ef4444" }}
            />
            <p
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: "#ef4444" }}
            >
              Luồng Sự Cố — Cần xử lý
            </p>
          </div>
          <div className="flex items-center gap-0.5 mb-4">
            <FunnelCard
              nhan="Hoàn về"
              so_luong={luan_su_co.hang_hoan_ve}
              mau="#f97316"
              icon={RotateCcw}
              canh_bao={luan_su_co.hang_hoan_ve > 0}
            />
            <FunnelArrow />
            <FunnelCard
              nhan="Lỗi / trả xưởng"
              so_luong={luan_su_co.hang_loi}
              mau="#ef4444"
              icon={AlertTriangle}
              canh_bao={luan_su_co.hang_loi > 0}
            />
          </div>
          {/* Danh sách hàng hoàn / lỗi */}
          <div
            className="space-y-1.5 pt-3 border-t"
            style={{ borderColor: "#1e293b" }}
          >
            {MOCK_DON_HANG.filter((o) =>
              ["giao_that_bai", "tra_hang_loi"].includes(o.trang_thai_don),
            )
              .slice(0, 4)
              .map((don) => {
                const la_loi = don.trang_thai_don === "tra_hang_loi";
                const mau = la_loi ? "#ef4444" : "#f97316";
                return (
                  <div
                    key={don.id}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg"
                    style={{ background: "#1e293b" }}
                  >
                    <AlertTriangle
                      size={10}
                      className="flex-shrink-0"
                      style={{ color: mau }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-white truncate">
                        {don.ma_don}
                      </p>
                      <p
                        className="text-[9px] truncate"
                        style={{ color: "#475569" }}
                      >
                        {don.san_pham[0].ten_sp} · {don.san_pham[0].mau_sac}
                      </p>
                    </div>
                    <span
                      className="text-[9px] font-bold flex-shrink-0"
                      style={{ color: mau }}
                    >
                      {la_loi ? "Lỗi hàng" : "Hoàn về"}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* ── Bảng Cảnh Báo ────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
      >
        {/* Tab header */}
        <div
          className="flex items-center justify-between px-4 border-b"
          style={{ borderColor: "#1e293b" }}
        >
          <div className="flex">
            {(
              [
                {
                  id: "sap_het",
                  nhan: "Sắp hết hàng",
                  so: sap_het.length,
                  mau: "#ef4444",
                  icon: TrendingDown,
                },
                {
                  id: "ton_dong",
                  nhan: "Hàng tồn đọng > 90 ngày",
                  so: ton_dong.length,
                  mau: "#f59e0b",
                  icon: Archive,
                },
              ] as const
            ).map(({ id, nhan, so, mau, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTabCanhBao(id)}
                className="flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all"
                style={{
                  borderColor: tab_canh_bao === id ? mau : "transparent",
                  color: tab_canh_bao === id ? mau : "#475569",
                }}
              >
                <Icon size={12} />
                {nhan}
                <span
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
                  style={{ background: mau + "20", color: mau }}
                >
                  {so}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {tab_canh_bao === "sap_het" && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                style={{
                  background: "#06472520",
                  color: "#10b981",
                  border: "1px solid #10b98130",
                }}
              >
                <Download size={10} /> Xuất Excel
              </button>
            )}
            {tab_canh_bao === "ton_dong" && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                style={{
                  background: "#78350f20",
                  color: "#f59e0b",
                  border: "1px solid #f59e0b30",
                }}
              >
                <Zap size={10} /> Báo Sale xả hàng
              </button>
            )}
          </div>
        </div>

        {/* Bảng sắp hết */}
        {tab_canh_bao === "sap_het" && (
          <>
            <div
              className="grid px-4 py-2.5 text-[9px] font-black uppercase"
              style={{
                background: "#1e293b20",
                color: "#334155",
                gridTemplateColumns: "1fr 120px 80px 80px 80px 100px",
              }}
            >
              <span>Sản phẩm</span>
              <span>Vị trí kệ</span>
              <span className="text-center">Tồn kho</span>
              <span className="text-center">Định mức</span>
              <span className="text-center">Thiếu</span>
              <span className="text-right">Thao tác</span>
            </div>
            {sap_het.length === 0 ? (
              <div className="py-12 text-center">
                <Check
                  size={24}
                  className="mx-auto mb-2"
                  style={{ color: "#10b981", opacity: 0.5 }}
                />
                <p className="text-sm" style={{ color: "#475569" }}>
                  Tất cả SKU trong định mức an toàn
                </p>
              </div>
            ) : (
              sap_het.map((sku, i) => {
                const mau =
                  sku.muc_do === "het_hang"
                    ? "#ef4444"
                    : sku.muc_do === "nguy_hiem"
                      ? "#f97316"
                      : "#f59e0b";
                return (
                  <div
                    key={sku.ma_sku}
                    className="grid px-4 py-3 items-center"
                    style={{
                      gridTemplateColumns: "1fr 120px 80px 80px 80px 100px",
                      borderTop: i > 0 ? "1px solid #1e293b" : "none",
                      background:
                        sku.muc_do === "het_hang" ? "#ef444408" : "transparent",
                    }}
                  >
                    <div>
                      <p className="text-xs font-bold text-white">
                        {sku.ten_sp}
                      </p>
                      <p
                        className="text-[10px] font-mono"
                        style={{ color: "#475569" }}
                      >
                        {sku.ma_sku}
                      </p>
                    </div>
                    {/* vi_tri_ke giờ là location code từ Module 2b */}
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: "#a78bfa" }}
                    >
                      {sku.vi_tri_ke}
                    </span>
                    <div className="text-center">
                      <span
                        className="text-sm font-black"
                        style={{ color: mau }}
                      >
                        {sku.ton_kho === 0 ? "HẾT" : sku.ton_kho}
                      </span>
                    </div>
                    <span
                      className="text-center text-xs"
                      style={{ color: "#475569" }}
                    >
                      {sku.dinh_muc_min}
                    </span>
                    <span
                      className="text-center text-xs font-black"
                      style={{ color: mau }}
                    >
                      −{sku.thieu}
                    </span>
                    <div className="flex justify-end">
                      <button
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                        style={{
                          background: "#06472520",
                          color: "#10b981",
                          border: "1px solid #10b98120",
                        }}
                      >
                        Yêu cầu nhập
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Bảng hàng tồn đọng */}
        {tab_canh_bao === "ton_dong" && (
          <>
            <div
              className="grid px-4 py-2.5 text-[9px] font-black uppercase"
              style={{
                background: "#1e293b20",
                color: "#334155",
                gridTemplateColumns: "1fr 120px 80px 100px 80px 100px",
              }}
            >
              <span>Sản phẩm</span>
              <span>Vị trí kệ</span>
              <span className="text-center">Tồn kho</span>
              <span className="text-center">Ngày nhập cuối</span>
              <span className="text-center">Số ngày</span>
              <span className="text-right">Thao tác</span>
            </div>
            {ton_dong.map((sku, i) => {
              const so_ngay = ngay_qua(sku.ngay_nhap_cuoi);
              const mau =
                so_ngay > 180
                  ? "#ef4444"
                  : so_ngay > 120
                    ? "#f97316"
                    : "#f59e0b";
              return (
                <div
                  key={sku.ma_sku}
                  className="grid px-4 py-3 items-center"
                  style={{
                    gridTemplateColumns: "1fr 120px 80px 100px 80px 100px",
                    borderTop: i > 0 ? "1px solid #1e293b" : "none",
                  }}
                >
                  <div>
                    <p className="text-xs font-bold text-white">{sku.ten_sp}</p>
                    <p className="text-[10px]" style={{ color: "#475569" }}>
                      {sku.mau_sac} · {sku.kich_thuoc}
                      <span
                        className="ml-2 font-mono"
                        style={{ color: "#334155" }}
                      >
                        {sku.ma_sku}
                      </span>
                    </p>
                  </div>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: "#a78bfa" }}
                  >
                    {sku.vi_tri_ke}
                  </span>
                  <span className="text-center text-sm font-black text-white">
                    {sku.ton_kho}
                  </span>
                  <span
                    className="text-center text-xs"
                    style={{ color: "#475569" }}
                  >
                    {new Date(sku.ngay_nhap_cuoi).toLocaleDateString("vi-VN")}
                  </span>
                  <div className="text-center">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"
                      style={{ background: mau + "20", color: mau }}
                    >
                      {so_ngay} ngày
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold"
                      style={{
                        background: "#78350f20",
                        color: "#f59e0b",
                        border: "1px solid #f59e0b20",
                      }}
                    >
                      Xả hàng
                    </button>
                  </div>
                </div>
              );
            })}
            {ton_dong.length === 0 && (
              <div className="py-12 text-center">
                <Check
                  size={24}
                  className="mx-auto mb-2"
                  style={{ color: "#10b981", opacity: 0.5 }}
                />
                <p className="text-sm" style={{ color: "#475569" }}>
                  Không có hàng tồn đọng quá 90 ngày
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
