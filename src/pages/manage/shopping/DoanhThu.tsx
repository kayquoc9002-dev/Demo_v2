import { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Calendar,
} from "lucide-react";
import {
  dinh_dang_tien,
  dinh_dang_tien_ngan,
  type DonHang,
} from "../../../components/BanHang/data/orderData";
import { layTatCaDonHang } from "../../../components/Kho/ServiceLayer/orderService";

// ─── Helpers ──────────────────────────────────────────────
const fmt = dinh_dang_tien;
const fmtM = dinh_dang_tien_ngan;
const MONTHS = [
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
];

// ─── Filter theo thời gian — nhất quán với XuLyDonHang ───
type KhoangThoiGian =
  | "hom_nay"
  | "tuan_nay"
  | "thang_nay"
  | "nam_nay"
  | "tuy_chon";

const loc_theo_tg = (
  don: DonHang,
  khoang: KhoangThoiGian,
  tu: string,
  den: string,
): boolean => {
  const ngay = new Date(don.ngay_tao);
  const now = new Date();
  if (khoang === "hom_nay") return ngay.toDateString() === now.toDateString();
  if (khoang === "tuan_nay") {
    const dau = new Date(now);
    dau.setDate(now.getDate() - now.getDay() + 1);
    dau.setHours(0, 0, 0, 0);
    return ngay >= dau;
  }
  if (khoang === "thang_nay")
    return (
      ngay.getMonth() === now.getMonth() &&
      ngay.getFullYear() === now.getFullYear()
    );
  if (khoang === "nam_nay") return ngay.getFullYear() === now.getFullYear();
  if (khoang === "tuy_chon" && tu && den) {
    const tu_d = new Date(tu);
    const den_d = new Date(den);
    den_d.setHours(23, 59, 59, 999);
    return ngay >= tu_d && ngay <= den_d;
  }
  return true;
};

// type KyBaoCao = "thang_nay" | "thang_truoc" | "quy_nay" | "nam_nay";

// ─── Mini bar chart ───────────────────────────────────────
function BarChart({
  data,
  color = "#3b82f6",
  height = 80,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="relative w-full rounded-t-sm transition-all duration-300 group-hover:opacity-80"
            style={{
              height: Math.max(4, (d.value / max) * (height - 16)),
              background: color,
              minHeight: d.value > 0 ? 4 : 0,
            }}
          >
            {/* Tooltip */}
            <div
              className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10"
              style={{ background: "#1e293b", color: "white" }}
            >
              {fmtM(d.value)}
            </div>
          </div>
          <span className="text-[9px]" style={{ color: "#475569" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Donut chart (SVG) ────────────────────────────────────
function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let cumPct = 0;
  const r = 36;
  const cx = 44;
  const cy = 44;
  const stroke = 14;
  const circ = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-4">
      <svg width={88} height={88} viewBox="0 0 88 88">
        {/* Background ring */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#1e293b"
          strokeWidth={stroke}
        />
        {segments.map((sg, i) => {
          const pct = sg.value / total;
          const dash = pct * circ;
          const gap = circ - dash;
          const rotate = -90 + cumPct * 360;
          cumPct += pct;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={sg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotate} ${cx} ${cy})`}
              style={{ transition: "stroke-dasharray 0.5s ease" }}
            />
          );
        })}
        <text
          x={cx}
          y={cy + 1}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={10}
          fontWeight={800}
        >
          {segments.length}
        </text>
        <text
          x={cx}
          y={cy + 11}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#475569"
          fontSize={7}
        >
          loại
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((sg) => (
          <div key={sg.label} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: sg.color }}
            />
            <span className="text-[10px]" style={{ color: "#94a3b8" }}>
              {sg.label}
            </span>
            <span
              className="text-[10px] font-black ml-auto"
              style={{ color: "white" }}
            >
              {((sg.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
export default function DoanhThu() {
  const [khoang, setKhoang] = useState<KhoangThoiGian>("thang_nay");
  const [ngay_tu, setNgayTu] = useState("");
  const [ngay_den, setNgayDen] = useState("");
  const [don_hang, setDonHang] = useState<DonHang[]>([]);
  useEffect(() => { layTatCaDonHang().then(setDonHang); }, []);

  // Lọc đơn hoàn thành theo khoảng thời gian
  const don_hoan_thanh = useMemo(
    () =>
      don_hang.filter(
        (o) =>
          o.trang_thai_don === "hoan_thanh" &&
          loc_theo_tg(o, khoang, ngay_tu, ngay_den),
      ),
    [don_hang, khoang, ngay_tu, ngay_den],
  );

  // Tất cả đơn hoàn thành trong năm hiện tại (cho biểu đồ theo tháng)
  const don_nam = useMemo(
    () =>
      don_hang.filter(
        (o) =>
          o.trang_thai_don === "hoan_thanh" &&
          new Date(o.ngay_tao).getFullYear() === new Date().getFullYear(),
      ),
    [don_hang],
  );

  // ── Stats chính ──────────────────────────────────────────
  const stats = useMemo(() => {
    const dt = don_hoan_thanh.reduce((s, o) => s + o.tong_cong, 0);
    const so_don = don_hoan_thanh.length;
    const sp_ban = don_hoan_thanh.reduce(
      (s, o) => s + o.san_pham.reduce((ss, i) => ss + i.so_luong, 0),
      0,
    );
    const kh = new Set(don_hoan_thanh.map((o) => o.khach_hang.ten)).size;
    const dt_si = don_hoan_thanh
      .filter((o) => !!o.khach_hang.ten_cong_ty)
      .reduce((s, o) => s + o.tong_cong, 0);
    const dt_le = dt - dt_si;
    const gia_von = don_hoan_thanh.reduce(
      (s, o) =>
        s + o.san_pham.reduce((ss, i) => ss + (i.gia_von ?? 0) * i.so_luong, 0),
      0,
    );
    const loi_nhuan = dt - gia_von;

    // So sánh kỳ trước (tạm tính −15% do chưa có data thực)
    const prev_dt = Math.round(dt * 0.85);
    const growth =
      prev_dt > 0 ? Math.round(((dt - prev_dt) / prev_dt) * 100) : 0;

    return { dt, so_don, sp_ban, kh, dt_si, dt_le, gia_von, loi_nhuan, growth };
  }, [don_hoan_thanh]);

  // ── Doanh thu theo tháng (bar chart) ─────────────────────
  const dt_theo_thang = useMemo(() => {
    const so_thang = khoang === "nam_nay" ? 12 : 3;
    return Array.from({ length: so_thang }, (_, i) => {
      const val = don_nam
        .filter((o) => new Date(o.ngay_tao).getMonth() === i)
        .reduce((s, o) => s + o.tong_cong, 0);
      return { label: MONTHS[i], value: val };
    }).filter((_, i) => khoang === "nam_nay" || i <= new Date().getMonth());
  }, [don_nam, khoang]);

  // ── Top sản phẩm ─────────────────────────────────────────
  const top_san_pham = useMemo(() => {
    const map: Record<string, { so_luong: number; doanh_thu: number }> = {};
    don_hoan_thanh.forEach((o) =>
      o.san_pham.forEach((sp) => {
        if (!map[sp.ten_sp]) map[sp.ten_sp] = { so_luong: 0, doanh_thu: 0 };
        map[sp.ten_sp].so_luong += sp.so_luong;
        map[sp.ten_sp].doanh_thu += sp.thanh_tien;
      }),
    );
    return Object.entries(map)
      .map(([ten, v]) => ({ ten, ...v }))
      .sort((a, b) => b.doanh_thu - a.doanh_thu)
      .slice(0, 5);
  }, [don_hoan_thanh]);

  const max_top_dt = Math.max(...top_san_pham.map((p) => p.doanh_thu), 1);

  // ── Phương thức thanh toán ────────────────────────────────
  const pt_data = useMemo(() => {
    const map: Record<string, number> = {
      tien_mat: 0,
      chuyen_khoan: 0,
      cod: 0,
      qr: 0,
    };
    don_hoan_thanh.forEach((o) => {
      map[o.phuong_thuc_tt] = (map[o.phuong_thuc_tt] ?? 0) + o.tong_cong;
    });
    return [
      { label: "Chuyển khoản", value: map.chuyen_khoan, color: "#3b82f6" },
      { label: "Tiền mặt", value: map.tien_mat, color: "#f59e0b" },
      { label: "COD", value: map.cod, color: "#8b5cf6" },
      { label: "QR Code", value: map.qr, color: "#34d399" },
    ].filter((s) => s.value > 0);
  }, [don_hoan_thanh]);

  // ── Lẻ vs Sỉ ─────────────────────────────────────────────
  const loai_khach_data = [
    { label: "Khách lẻ", value: stats.dt_le, color: "#f59e0b" },
    { label: "Khách sỉ", value: stats.dt_si, color: "#34d399" },
  ].filter((s) => s.value > 0);

  // ── Đơn gần đây ──────────────────────────────────────────
  const don_gan_day = [...don_hoan_thanh]
    .sort(
      (a, b) => new Date(b.ngay_tao).getTime() - new Date(a.ngay_tao).getTime(),
    )
    .slice(0, 5);

  const nhan_khoang: Record<KhoangThoiGian, string> = {
    hom_nay: "Hôm nay",
    tuan_nay: "Tuần này",
    thang_nay: "Tháng này",
    nam_nay: "Năm nay",
    tuy_chon: "Tùy chọn",
  };

  return (
    <div
      className="p-6 space-y-5"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Doanh thu</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
            Phân tích hiệu quả bán hàng theo kỳ
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Bộ lọc thời gian */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "#1e293b" }}
          >
            {(
              [
                "hom_nay",
                "tuan_nay",
                "thang_nay",
                "nam_nay",
                "tuy_chon",
              ] as KhoangThoiGian[]
            ).map((k) => (
              <button
                key={k}
                onClick={() => setKhoang(k)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: khoang === k ? "#3b82f6" : "transparent",
                  color: khoang === k ? "white" : "#64748b",
                }}
              >
                {nhan_khoang[k]}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
            style={{
              background: "#1e293b",
              color: "#94a3b8",
              border: "1px solid #334155",
            }}
          >
            <Download size={12} /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Date range picker — chỉ hiện khi chọn tùy chọn */}
      {khoang === "tuy_chon" && (
        <div
          className="flex items-center gap-2 flex-wrap p-3 rounded-xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        >
          <Calendar size={12} style={{ color: "#475569" }} />
          <span className="text-xs" style={{ color: "#475569" }}>
            Từ ngày
          </span>
          <input
            type="date"
            value={ngay_tu}
            onChange={(e) => setNgayTu(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "white",
            }}
          />
          <span className="text-xs" style={{ color: "#475569" }}>
            đến ngày
          </span>
          <input
            type="date"
            value={ngay_den}
            onChange={(e) => setNgayDen(e.target.value)}
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "white",
            }}
          />
          <span className="text-xs ml-2" style={{ color: "#475569" }}>
            {don_hoan_thanh.length} đơn hoàn thành
          </span>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Doanh thu",
            val: fmt(stats.dt),
            sub: `${stats.growth >= 0 ? "+" : ""}${stats.growth}% so kỳ trước`,
            up: stats.growth >= 0,
            icon: TrendingUp,
            color: "#38bdf8",
            bg: "#0c435420",
          },
          {
            label: "Số đơn",
            val: String(stats.so_don),
            sub: "Đơn hoàn thành",
            up: true,
            icon: ShoppingBag,
            color: "#f59e0b",
            bg: "#78350f20",
          },
          {
            label: "SP đã bán",
            val: String(stats.sp_ban),
            sub: "Tổng số lượng",
            up: true,
            icon: BarChart2,
            color: "#8b5cf6",
            bg: "#4c1d9520",
          },
          {
            label: "Khách hàng",
            val: String(stats.kh),
            sub: "Khách trong kỳ",
            up: true,
            icon: Users,
            color: "#34d399",
            bg: "#06472520",
          },
        ].map(({ label, val, sub, up, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="p-4 rounded-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={16} style={{ color }} />
              </div>
              <span
                className={`flex items-center gap-0.5 text-[10px] font-bold ${up ? "text-emerald-400" : "text-red-400"}`}
              >
                {up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {sub}
              </span>
            </div>
            <p className="text-xl font-black text-white">{val}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Lợi nhuận gộp ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { nhan: "Doanh thu", gia_tri: stats.dt, mau: "#38bdf8" },
          { nhan: "Giá vốn", gia_tri: stats.gia_von, mau: "#ef4444" },
          { nhan: "Lợi nhuận gộp", gia_tri: stats.loi_nhuan, mau: "#10b981" },
        ].map(({ nhan, gia_tri, mau }) => (
          <div
            key={nhan}
            className="px-4 py-3 rounded-xl text-center"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <p className="text-[10px] mb-1" style={{ color: "#475569" }}>
              {nhan}
            </p>
            <p className="text-sm font-black" style={{ color: mau }}>
              {fmt(gia_tri)}
            </p>
          </div>
        ))}
      </div>

      {/* ── Row 2: Bar chart + Donut charts ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart doanh thu theo tháng */}
        <div
          className="lg:col-span-2 p-5 rounded-2xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-white">
                Doanh thu theo tháng
              </p>
              <p className="text-[10px]" style={{ color: "#64748b" }}>
                Năm {new Date().getFullYear()} (đơn hoàn thành)
              </p>
            </div>
            <BarChart2 size={14} style={{ color: "#334155" }} />
          </div>
          <BarChart data={dt_theo_thang} color="#3b82f6" height={100} />
          <div
            className="flex items-center gap-4 mt-3 pt-3 border-t"
            style={{ borderColor: "#1e293b" }}
          >
            <div>
              <p className="text-[10px]" style={{ color: "#64748b" }}>
                Tổng
              </p>
              <p className="text-sm font-black text-white">
                {fmt(dt_theo_thang.reduce((s, d) => s + d.value, 0))}
              </p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: "#64748b" }}>
                TB / tháng
              </p>
              <p className="text-sm font-black text-white">
                {fmt(
                  Math.round(
                    dt_theo_thang.reduce((s, d) => s + d.value, 0) /
                      Math.max(
                        dt_theo_thang.filter((d) => d.value > 0).length,
                        1,
                      ),
                  ),
                )}
              </p>
            </div>
            <div>
              <p className="text-[10px]" style={{ color: "#64748b" }}>
                Tháng cao nhất
              </p>
              <p className="text-sm font-black text-white">
                {[...dt_theo_thang].sort((a, b) => b.value - a.value)[0]
                  ?.label ?? "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Donut charts */}
        <div className="space-y-4">
          <div
            className="p-5 rounded-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <p className="text-xs font-black text-white mb-3">Lẻ vs Sỉ</p>
            {loai_khach_data.length > 0 ? (
              <DonutChart segments={loai_khach_data} />
            ) : (
              <p className="text-xs" style={{ color: "#475569" }}>
                Không có dữ liệu
              </p>
            )}
          </div>
          <div
            className="p-5 rounded-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <p className="text-xs font-black text-white mb-3">Phương thức TT</p>
            {pt_data.length > 0 ? (
              <DonutChart segments={pt_data} />
            ) : (
              <p className="text-xs" style={{ color: "#475569" }}>
                Không có dữ liệu
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 3: Top SP + Đơn gần đây ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top sản phẩm */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-white">Top sản phẩm</p>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full"
              style={{ background: "#1e293b", color: "#64748b" }}
            >
              {nhan_khoang[khoang]}
            </span>
          </div>

          {top_san_pham.length === 0 ? (
            <p
              className="text-xs text-center py-6"
              style={{ color: "#475569" }}
            >
              Không có dữ liệu
            </p>
          ) : (
            <div className="space-y-3">
              {top_san_pham.map((sp, i) => (
                <div key={sp.ten}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="text-[10px] font-black w-4 flex-shrink-0"
                        style={{
                          color:
                            i === 0
                              ? "#f59e0b"
                              : i === 1
                                ? "#94a3b8"
                                : i === 2
                                  ? "#cd7f32"
                                  : "#475569",
                        }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs font-medium text-white truncate">
                        {sp.ten}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p
                        className="text-xs font-black"
                        style={{ color: "#f59e0b" }}
                      >
                        {fmtM(sp.doanh_thu)}
                      </p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>
                        {sp.so_luong} SP
                      </p>
                    </div>
                  </div>
                  <div
                    className="h-1 rounded-full"
                    style={{ background: "#1e293b" }}
                  >
                    <div
                      className="h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${(sp.doanh_thu / max_top_dt) * 100}%`,
                        background:
                          i === 0
                            ? "#f59e0b"
                            : i === 1
                              ? "#3b82f6"
                              : i === 2
                                ? "#8b5cf6"
                                : "#334155",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Đơn hàng gần đây */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-white">
              Đơn hoàn thành gần đây
            </p>
            <a
              href="/manage/ban-hang/theo-doi"
              className="text-[10px] font-bold hover:opacity-70 transition-opacity"
              style={{ color: "#3b82f6" }}
            >
              Xem tất cả →
            </a>
          </div>

          {don_gan_day.length === 0 ? (
            <p
              className="text-xs text-center py-6"
              style={{ color: "#475569" }}
            >
              Không có dữ liệu
            </p>
          ) : (
            <div className="space-y-2">
              {don_gan_day.map((don) => {
                const la_si = !!don.khach_hang.ten_cong_ty;
                return (
                  <div
                    key={don.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-colors hover:bg-slate-800/40"
                    style={{ border: "1px solid #1e293b" }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0"
                      style={{
                        background: la_si ? "#0d4f3c" : "#1e3a5f",
                        color: la_si ? "#34d399" : "#60a5fa",
                      }}
                    >
                      {don.khach_hang.ten[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {don.khach_hang.ten}
                      </p>
                      <p className="text-[9px]" style={{ color: "#475569" }}>
                        {don.ma_don} ·{" "}
                        {don.san_pham.reduce((s, i) => s + i.so_luong, 0)} SP
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-xs font-black"
                        style={{ color: "#f59e0b" }}
                      >
                        {fmtM(don.tong_cong)}
                      </p>
                      {la_si && (
                        <span
                          className="text-[9px] font-bold"
                          style={{ color: "#34d399" }}
                        >
                          SỈ
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tổng kỳ */}
          <div
            className="flex items-center justify-between mt-4 pt-3 border-t"
            style={{ borderColor: "#1e293b" }}
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[9px]" style={{ color: "#64748b" }}>
                  Lẻ
                </p>
                <p className="text-xs font-black" style={{ color: "#f59e0b" }}>
                  {fmtM(stats.dt_le)}
                </p>
              </div>
              <div className="w-px h-6" style={{ background: "#1e293b" }} />
              <div>
                <p className="text-[9px]" style={{ color: "#64748b" }}>
                  Sỉ
                </p>
                <p className="text-xs font-black" style={{ color: "#34d399" }}>
                  {fmtM(stats.dt_si)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px]" style={{ color: "#64748b" }}>
                Tổng kỳ
              </p>
              <p className="text-base font-black text-white">{fmt(stats.dt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
