import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Package,
  ChevronDown,
} from "lucide-react";
import {
  MOCK_DON_HANG,
  TRANG_THAI_DON_CONFIG,
  TRANG_THAI_TT_CONFIG,
  KENH_BAN_CONFIG,
  dinh_dang_tien,
  dinh_dang_ngay_ngan,
  co_quyen_thao_tac,
  cap_nhat_trang_thai_don,
  type DonHang,
  type TrangThaiDon,
  type TrangThaiThanhToan,
  type KenhBan,
  type VaiTro,
} from "../data/orderData";
import { ModalChiTiet, BadgeDon, BadgeTT } from "./OrderModals";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

// Mock vai trò hiện tại — sau thay bằng auth context
const VAI_TRO_HIEN_TAI: VaiTro = "admin";

// Bộ lọc mặc định theo vai trò
const BO_LOC_MAC_DINH: Record<
  VaiTro,
  { trang_thai_don: TrangThaiDon | "tat_ca" }
> = {
  admin: { trang_thai_don: "tat_ca" },
  sale: { trang_thai_don: "tat_ca" },
  kho: { trang_thai_don: "cho_xu_ly" }, // Kho mở lên thấy ngay đơn cần làm
  ke_toan: { trang_thai_don: "tat_ca" },
};

// ─── Helpers lọc thời gian ────────────────────────────────────────────────────

type KhoangThoiGian =
  | "hom_nay"
  | "tuan_nay"
  | "thang_nay"
  | "nam_nay"
  | "tuy_chon";

const loc_theo_thoi_gian = (
  don: DonHang,
  khoang: KhoangThoiGian,
  tu: string,
  den: string,
): boolean => {
  const ngay = new Date(don.ngay_tao);
  const now = new Date();

  if (khoang === "hom_nay") {
    return ngay.toDateString() === now.toDateString();
  }
  if (khoang === "tuan_nay") {
    const dau_tuan = new Date(now);
    dau_tuan.setDate(now.getDate() - now.getDay() + 1);
    dau_tuan.setHours(0, 0, 0, 0);
    return ngay >= dau_tuan;
  }
  if (khoang === "thang_nay") {
    return (
      ngay.getMonth() === now.getMonth() &&
      ngay.getFullYear() === now.getFullYear()
    );
  }
  if (khoang === "nam_nay") {
    return ngay.getFullYear() === now.getFullYear();
  }
  if (khoang === "tuy_chon" && tu && den) {
    const ngay_tu = new Date(tu);
    const ngay_den = new Date(den);
    ngay_den.setHours(23, 59, 59, 999);
    return ngay >= ngay_tu && ngay <= ngay_den;
  }
  return true;
};

// ─── Export CSV ───────────────────────────────────────────────────────────────

const xuat_excel = (ds: DonHang[]) => {
  const hang = [
    [
      "Mã đơn",
      "Ngày tạo",
      "Kênh",
      "Khách hàng",
      "SĐT",
      "Sản phẩm",
      "Tổng tiền",
      "Đã thu",
      "Còn nợ",
      "TT đơn",
      "TT thanh toán",
      "Ghi chú",
    ],
    ...ds.map((o) => [
      o.ma_don,
      dinh_dang_ngay_ngan(o.ngay_tao),
      KENH_BAN_CONFIG[o.kenh_ban].nhan,
      o.khach_hang.ten,
      o.khach_hang.so_dien_thoai,
      o.san_pham
        .map((i) => `${i.ten_sp}(${i.mau_sac}/${i.kich_thuoc})x${i.so_luong}`)
        .join(" | "),
      o.tong_cong,
      o.da_thanh_toan,
      o.con_no,
      TRANG_THAI_DON_CONFIG[o.trang_thai_don].nhan,
      TRANG_THAI_TT_CONFIG[o.trang_thai_thanh_toan].nhan,
      o.ghi_chu,
    ]),
  ];
  const csv = hang.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `don-hang-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function XuLyDonHang() {
  const vai_tro = VAI_TRO_HIEN_TAI;

  // ── State bộ lọc ────────────────────────────────────────────────────────────
  const [ds_don, setDsDon] = useState<DonHang[]>(MOCK_DON_HANG);
  const [tim_kiem, setTimKiem] = useState("");
  const [tt_don, setTtDon] = useState<TrangThaiDon | "tat_ca">(
    BO_LOC_MAC_DINH[vai_tro].trang_thai_don,
  );
  const [tt_tt, setTtTT] = useState<TrangThaiThanhToan | "tat_ca">("tat_ca");
  const [kenh, setKenh] = useState<KenhBan | "tat_ca">("tat_ca");
  const [loai_khach, setLoaiKhach] = useState<"le" | "si" | "tat_ca">("tat_ca");
  const [khoang_tg, setKhoangTG] = useState<KhoangThoiGian>("thang_nay");
  const [ngay_tu, setNgayTu] = useState("");
  const [ngay_den, setNgayDen] = useState("");
  const [sap_xep, setSapXep] = useState<"ngay_tao" | "tong_cong">("ngay_tao");
  const [chieu, setChieu] = useState<"asc" | "desc">("desc");
  const [trang, setTrang] = useState(1);
  const [mo_filter, setMoFilter] = useState(false);
  const [don_chon, setDonChon] = useState<DonHang | null>(null);

  // Đặt ngày mặc định cho tháng này
  useEffect(() => {
    const now = new Date();
    const dau = new Date(now.getFullYear(), now.getMonth(), 1);
    const cuoi = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setNgayTu(dau.toISOString().slice(0, 10));
    setNgayDen(cuoi.toISOString().slice(0, 10));
  }, []);

  // ── Lọc + sắp xếp ───────────────────────────────────────────────────────────
  const ds_loc = useMemo(() => {
    let ds = [...ds_don];

    if (tim_kiem) {
      const q = tim_kiem.toLowerCase();
      ds = ds.filter(
        (o) =>
          o.ma_don.toLowerCase().includes(q) ||
          o.khach_hang.ten.toLowerCase().includes(q) ||
          o.khach_hang.so_dien_thoai.includes(q) ||
          o.san_pham.some(
            (i) =>
              i.ma_sku.toLowerCase().includes(q) ||
              i.ten_sp.toLowerCase().includes(q),
          ),
      );
    }
    if (tt_don !== "tat_ca") ds = ds.filter((o) => o.trang_thai_don === tt_don);
    if (tt_tt !== "tat_ca")
      ds = ds.filter((o) => o.trang_thai_thanh_toan === tt_tt);
    if (kenh !== "tat_ca") ds = ds.filter((o) => o.kenh_ban === kenh);
    if (loai_khach !== "tat_ca")
      ds = ds.filter((o) =>
        loai_khach === "si"
          ? !!o.khach_hang.ten_cong_ty
          : !o.khach_hang.ten_cong_ty,
      );
    ds = ds.filter((o) => loc_theo_thoi_gian(o, khoang_tg, ngay_tu, ngay_den));

    ds.sort((a, b) => {
      const va =
        sap_xep === "ngay_tao" ? new Date(a.ngay_tao).getTime() : a.tong_cong;
      const vb =
        sap_xep === "ngay_tao" ? new Date(b.ngay_tao).getTime() : b.tong_cong;
      return chieu === "desc" ? vb - va : va - vb;
    });
    return ds;
  }, [
    ds_don,
    tim_kiem,
    tt_don,
    tt_tt,
    kenh,
    loai_khach,
    khoang_tg,
    ngay_tu,
    ngay_den,
    sap_xep,
    chieu,
  ]);

  const tong_trang = Math.max(1, Math.ceil(ds_loc.length / PAGE_SIZE));
  const ds_hien = ds_loc.slice((trang - 1) * PAGE_SIZE, trang * PAGE_SIZE);

  const co_loc =
    tim_kiem ||
    tt_don !== "tat_ca" ||
    tt_tt !== "tat_ca" ||
    kenh !== "tat_ca" ||
    loai_khach !== "tat_ca";

  const xoa_loc = () => {
    setTimKiem("");
    setTtDon(BO_LOC_MAC_DINH[vai_tro].trang_thai_don);
    setTtTT("tat_ca");
    setKenh("tat_ca");
    setLoaiKhach("tat_ca");
    setTrang(1);
  };

  const doi_sap_xep = (field: "ngay_tao" | "tong_cong") => {
    if (sap_xep === field) setChieu((c) => (c === "desc" ? "asc" : "desc"));
    else {
      setSapXep(field);
      setChieu("desc");
    }
    setTrang(1);
  };

  const cap_nhat_don = (don_moi: DonHang) => {
    setDsDon((prev) => prev.map((o) => (o.id === don_moi.id ? don_moi : o)));
  };

  // ── Tổng tài chính của kết quả lọc ─────────────────────────────────────────
  const tong_tai_chinh = useMemo(
    () => ({
      tong_cong: ds_loc
        .filter((o) => o.trang_thai_don !== "da_huy")
        .reduce((s, o) => s + o.tong_cong, 0),
      da_thu: ds_loc.reduce((s, o) => s + o.da_thanh_toan, 0),
      con_no: ds_loc
        .filter((o) => o.trang_thai_don !== "da_huy")
        .reduce((s, o) => s + o.con_no, 0),
    }),
    [ds_loc],
  );

  return (
    <div
      className="p-5 space-y-4 min-h-screen"
      style={{ background: "#020817" }}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-white">Xử lý đơn hàng</h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>
            {ds_loc.length} đơn · vai trò:
            <span className="font-bold ml-1" style={{ color: "#a78bfa" }}>
              {vai_tro.toUpperCase()}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {co_quyen_thao_tac(vai_tro, "xuat_excel") && (
            <button
              onClick={() => xuat_excel(ds_loc)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{
                background: "#064e3b",
                color: "#34d399",
                border: "1px solid #34d39930",
              }}
            >
              <Download size={12} /> Xuất Excel
            </button>
          )}
          {co_quyen_thao_tac(vai_tro, "tao_don") && (
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#c17f44", color: "white" }}
            >
              + Tạo đơn
            </button>
          )}
        </div>
      </div>

      {/* ── Tổng tài chính mini ───────────────────────────────── */}
      {vai_tro !== "kho" && (
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              nhan: "Tổng cộng",
              gia_tri: tong_tai_chinh.tong_cong,
              mau: "#f59e0b",
            },
            { nhan: "Đã thu", gia_tri: tong_tai_chinh.da_thu, mau: "#10b981" },
            { nhan: "Còn nợ", gia_tri: tong_tai_chinh.con_no, mau: "#ef4444" },
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
                {dinh_dang_tien(gia_tri)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-52">
            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#475569" }}
            />
            <input
              value={tim_kiem}
              onChange={(e) => {
                setTimKiem(e.target.value);
                setTrang(1);
              }}
              placeholder="Tìm mã đơn, tên khách, SĐT, SKU..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
          </div>

          {/* Khoảng thời gian */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{ background: "#1e293b", border: "1px solid #334155" }}
          >
            {(
              [
                { id: "hom_nay", nhan: "Hôm nay" },
                { id: "tuan_nay", nhan: "Tuần này" },
                { id: "thang_nay", nhan: "Tháng này" },
                { id: "nam_nay", nhan: "Năm nay" },
                { id: "tuy_chon", nhan: "Tùy chọn" },
              ] as const
            ).map(({ id, nhan }) => (
              <button
                key={id}
                onClick={() => {
                  setKhoangTG(id);
                  setTrang(1);
                }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                style={{
                  background: khoang_tg === id ? "#3b82f6" : "transparent",
                  color: khoang_tg === id ? "white" : "#64748b",
                }}
              >
                {nhan}
              </button>
            ))}
          </div>

          {/* Bộ lọc nâng cao */}
          <button
            onClick={() => setMoFilter((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: mo_filter ? "#3b82f620" : "#1e293b",
              color: mo_filter ? "#60a5fa" : "#94a3b8",
              border: `1px solid ${mo_filter ? "#3b82f630" : "#334155"}`,
            }}
          >
            <Filter size={12} /> Lọc thêm
            {co_loc && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>

          {/* Sắp xếp */}
          <button
            onClick={() => doi_sap_xep("ngay_tao")}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "#1e293b",
              color: sap_xep === "ngay_tao" ? "#60a5fa" : "#64748b",
              border: "1px solid #334155",
            }}
          >
            <Calendar size={11} /> Ngày{" "}
            {sap_xep === "ngay_tao" ? (chieu === "desc" ? "↓" : "↑") : ""}
          </button>
          <button
            onClick={() => doi_sap_xep("tong_cong")}
            className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold"
            style={{
              background: "#1e293b",
              color: sap_xep === "tong_cong" ? "#60a5fa" : "#64748b",
              border: "1px solid #334155",
            }}
          >
            Tiền {sap_xep === "tong_cong" ? (chieu === "desc" ? "↓" : "↑") : ""}
          </button>

          {co_loc && (
            <button
              onClick={xoa_loc}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "#7f1d1d", color: "#fca5a5" }}
            >
              <RefreshCw size={11} /> Xoá lọc
            </button>
          )}
        </div>

        {/* Tùy chọn ngày */}
        {khoang_tg === "tuy_chon" && (
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
              onChange={(e) => {
                setNgayTu(e.target.value);
                setTrang(1);
              }}
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
              onChange={(e) => {
                setNgayDen(e.target.value);
                setTrang(1);
              }}
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                color: "white",
              }}
            />
          </div>
        )}

        {/* Bộ lọc nâng cao */}
        {mo_filter && (
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 rounded-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            {[
              {
                nhan: "Trạng thái đơn",
                gia_tri: tt_don,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                doi: (v: any) => {
                  setTtDon(v);
                  setTrang(1);
                },
                options: [
                  { gia_tri: "tat_ca", nhan: "Tất cả đơn" },
                  ...Object.entries(TRANG_THAI_DON_CONFIG).map(([k, v]) => ({
                    gia_tri: k,
                    nhan: v.nhan,
                  })),
                ],
              },
              {
                nhan: "Trạng thái TT",
                gia_tri: tt_tt,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                doi: (v: any) => {
                  setTtTT(v);
                  setTrang(1);
                },
                options: [
                  { gia_tri: "tat_ca", nhan: "Tất cả TT" },
                  ...Object.entries(TRANG_THAI_TT_CONFIG).map(([k, v]) => ({
                    gia_tri: k,
                    nhan: v.nhan,
                  })),
                ],
              },
              {
                nhan: "Kênh bán",
                gia_tri: kenh,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                doi: (v: any) => {
                  setKenh(v);
                  setTrang(1);
                },
                options: [
                  { gia_tri: "tat_ca", nhan: "Tất cả kênh" },
                  ...Object.entries(KENH_BAN_CONFIG).map(([k, v]) => ({
                    gia_tri: k,
                    nhan: v.nhan,
                  })),
                ],
              },
              {
                nhan: "Loại khách",
                gia_tri: loai_khach,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                doi: (v: any) => {
                  setLoaiKhach(v);
                  setTrang(1);
                },
                options: [
                  { gia_tri: "tat_ca", nhan: "Lẻ + Sỉ" },
                  { gia_tri: "le", nhan: "Khách lẻ" },
                  { gia_tri: "si", nhan: "Khách sỉ" },
                ],
              },
            ].map(({ nhan, gia_tri, doi, options }) => (
              <div key={nhan}>
                <p
                  className="text-[9px] font-black uppercase mb-1"
                  style={{ color: "#475569" }}
                >
                  {nhan}
                </p>
                <div className="relative">
                  <select
                    value={gia_tri}
                    onChange={(e) => doi(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none appearance-none pr-6"
                    style={{
                      background: "#1e293b",
                      border: "1px solid #334155",
                      color: "#94a3b8",
                    }}
                  >
                    {options.map((o) => (
                      <option key={o.gia_tri} value={o.gia_tri}>
                        {o.nhan}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={10}
                    className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "#475569" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bảng đơn hàng ────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
      >
        {/* Header bảng */}
        <div
          className="grid px-5 py-3 text-[9px] font-black uppercase tracking-widest"
          style={{
            background: "#1e293b",
            color: "#475569",
            gridTemplateColumns: "28px 1fr 1.2fr 1fr 90px 90px 72px 64px",
          }}
        >
          <span />
          <span>Khách hàng</span>
          <span>Sản phẩm</span>
          <span>Trạng thái</span>
          <span className="text-right">Tổng tiền</span>
          <span className="text-right">Còn nợ</span>
          <span className="text-right">Ngày tạo</span>
          <span className="text-center">Thao tác</span>
        </div>

        {ds_hien.length === 0 ? (
          <div className="py-16 text-center">
            <Package
              size={28}
              className="mx-auto mb-3 opacity-20"
              style={{ color: "#64748b" }}
            />
            <p className="text-sm" style={{ color: "#475569" }}>
              Không có đơn hàng nào
            </p>
          </div>
        ) : (
          ds_hien.map((don, idx) => {
            const cfg_don = TRANG_THAI_DON_CONFIG[don.trang_thai_don];
            const kenh_cfg = KENH_BAN_CONFIG[don.kenh_ban];
            const has_loi = don.san_pham.some((i) => (i.so_luong_loi ?? 0) > 0);
            const tong_sp = don.san_pham.reduce((s, i) => s + i.so_luong, 0);

            return (
              <div
                key={don.id}
                className="grid px-5 py-3 items-center hover:bg-slate-800/20 transition-colors cursor-pointer"
                style={{
                  gridTemplateColumns: "28px 1fr 1.2fr 1fr 90px 90px 72px 64px",
                  borderTop: idx > 0 ? "1px solid #1e293b" : "none",
                }}
                onClick={() => setDonChon(don)}
              >
                {/* Kênh */}
                <span
                  style={{ fontSize: 15, lineHeight: 1 }}
                  title={kenh_cfg.nhan}
                >
                  {kenh_cfg.bieu_tuong}
                </span>

                {/* Khách */}
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-semibold text-white truncate">
                      {don.khach_hang.ten}
                    </p>
                    {don.khach_hang.ten_cong_ty && (
                      <span
                        className="text-[8px] font-black px-1 rounded flex-shrink-0"
                        style={{ background: "#0d4f3c", color: "#34d399" }}
                      >
                        SỈ
                      </span>
                    )}
                  </div>
                  <p
                    className="text-[10px] truncate"
                    style={{ color: "#475569" }}
                  >
                    {don.ma_don}
                  </p>
                </div>

                {/* SP */}
                <div className="min-w-0 pr-2">
                  <p className="text-xs text-white truncate">
                    {don.san_pham[0].ten_sp}
                  </p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {don.san_pham[0].mau_sac} · {don.san_pham[0].kich_thuoc}
                    {don.san_pham.length > 1 &&
                      ` · +${don.san_pham.length - 1} SP`}
                    {has_loi && (
                      <span style={{ color: "#fb7185" }}> · ⚠ lỗi</span>
                    )}
                    {" · "}
                    {tong_sp} SP
                  </p>
                </div>

                {/* Trạng thái */}
                <div className="flex flex-col gap-1">
                  <BadgeDon tt={don.trang_thai_don} />
                  {vai_tro !== "kho" && (
                    <BadgeTT tt={don.trang_thai_thanh_toan} />
                  )}
                </div>

                {/* Tổng */}
                <div className="text-right">
                  <p
                    className="text-xs font-black"
                    style={{ color: "#f59e0b" }}
                  >
                    {dinh_dang_tien(don.tong_cong)}
                  </p>
                </div>

                {/* Còn nợ */}
                <div className="text-right">
                  {vai_tro !== "kho" ? (
                    don.con_no > 0 ? (
                      <p
                        className="text-xs font-black"
                        style={{ color: "#ef4444" }}
                      >
                        {dinh_dang_tien(don.con_no)}
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: "#334155" }}>
                        —
                      </p>
                    )
                  ) : (
                    <p className="text-xs" style={{ color: "#334155" }}>
                      —
                    </p>
                  )}
                </div>

                {/* Ngày */}
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {dinh_dang_ngay_ngan(don.ngay_tao)}
                  </p>
                </div>

                {/* Thao tác */}
                <div
                  className="flex items-center justify-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setDonChon(don)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                    style={{ color: "#64748b" }}
                    title="Xem chi tiết"
                  >
                    <Eye size={12} />
                  </button>
                  {co_quyen_thao_tac(vai_tro, "doi_trang_thai_don") &&
                    cfg_don.trang_thai_tiep_theo[0] &&
                    cfg_don.trang_thai_tiep_theo[0] !== "da_huy" && (
                      <button
                        onClick={() =>
                          cap_nhat_trang_thai_don(
                            don.id,
                            cfg_don.trang_thai_tiep_theo[0],
                          ).then(cap_nhat_don)
                        }
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                        style={{
                          color:
                            TRANG_THAI_DON_CONFIG[
                              cfg_don.trang_thai_tiep_theo[0]
                            ].mau,
                        }}
                        title={`→ ${TRANG_THAI_DON_CONFIG[cfg_don.trang_thai_tiep_theo[0]].nhan}`}
                      >
                        <Check size={12} />
                      </button>
                    )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ───────────────────────────────────────── */}
      {tong_trang > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#475569" }}>
            Trang {trang}/{tong_trang} · {ds_loc.length} đơn
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTrang((p) => Math.max(1, p - 1))}
              disabled={trang === 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1e293b", color: "#94a3b8" }}
            >
              <ChevronLeft size={13} />
            </button>
            {Array.from(
              { length: Math.min(tong_trang, 7) },
              (_, i) => i + 1,
            ).map((i) => (
              <button
                key={i}
                onClick={() => setTrang(i)}
                className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                style={{
                  background: trang === i ? "#3b82f6" : "#1e293b",
                  color: trang === i ? "white" : "#64748b",
                }}
              >
                {i}
              </button>
            ))}
            <button
              onClick={() => setTrang((p) => Math.min(tong_trang, p + 1))}
              disabled={trang === tong_trang}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1e293b", color: "#94a3b8" }}
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Modal chi tiết */}
      {don_chon && (
        <ModalChiTiet
          don={don_chon}
          vai_tro={vai_tro}
          onClose={() => setDonChon(null)}
          onCapNhat={(don_moi) => {
            cap_nhat_don(don_moi);
            setDonChon(don_moi);
          }}
        />
      )}
    </div>
  );
}
