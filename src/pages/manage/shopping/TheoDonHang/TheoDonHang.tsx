import { useState, useMemo } from "react";
import {
  Search, Eye, Check, X, Truck, Package,
  Clock, Phone, MapPin,
  User, CreditCard, FileText, RefreshCw, Download,
  ArrowUpDown, ChevronLeft, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
type TrangThai = "cho_xac_nhan" | "dang_dong_goi" | "dang_giao" | "hoan_thanh" | "da_huy";
type PhuongThuc = "tien_mat" | "chuyen_khoan" | "qr";
type LoaiKhach  = "le" | "si";

interface DonHangItem {
  tenSP: string; mauSac: string; kichThuoc: string;
  soLuong: number; donGia: number; thanhTien: number;
}

interface DonHang {
  id: string; ma: string;
  khach: { ten: string; sdt: string; diaChi: string; thanhPho: string; tenCongTy?: string; maSoThue?: string; };
  items: DonHangItem[];
  trangThai: TrangThai;
  loaiKhach: LoaiKhach;
  phuongThuc: PhuongThuc;
  tamTinh: number; chietKhau: number; phiShip: number; tongCong: number;
  ghiChu: string; ngayTao: string; ngayCapNhat: string;
}

// ─── Mock data ────────────────────────────────────────────
const MOCK_ORDERS: DonHang[] = [
  {
    id: "1", ma: "DH-2026-0001",
    khach: { ten: "Nguyễn Thị Lan", sdt: "0901234567", diaChi: "45 Lê Lợi", thanhPho: "TP. Hồ Chí Minh" },
    items: [
      { tenSP: "Áo Thun Basic Oversize", mauSac: "Trắng", kichThuoc: "M", soLuong: 2, donGia: 159000, thanhTien: 318000 },
      { tenSP: "Quần Short Kaki", mauSac: "Kem", kichThuoc: "M", soLuong: 1, donGia: 195000, thanhTien: 195000 },
    ],
    trangThai: "cho_xac_nhan", loaiKhach: "le", phuongThuc: "chuyen_khoan",
    tamTinh: 513000, chietKhau: 0, phiShip: 0, tongCong: 513000,
    ghiChu: "Giao giờ hành chính", ngayTao: "2026-03-08T08:30:00", ngayCapNhat: "2026-03-08T08:30:00",
  },
  {
    id: "2", ma: "DH-2026-0002",
    khach: { ten: "Trần Văn Minh", sdt: "0912345678", diaChi: "123 Nguyễn Huệ", thanhPho: "Hà Nội" },
    items: [
      { tenSP: "Váy Midi Floral", mauSac: "Hồng đào", kichThuoc: "S", soLuong: 1, donGia: 420000, thanhTien: 420000 },
    ],
    trangThai: "dang_dong_goi", loaiKhach: "le", phuongThuc: "qr",
    tamTinh: 420000, chietKhau: 0, phiShip: 30000, tongCong: 450000,
    ghiChu: "", ngayTao: "2026-03-08T07:15:00", ngayCapNhat: "2026-03-08T09:00:00",
  },
  {
    id: "3", ma: "DH-2026-0003",
    khach: { ten: "Công ty TNHH Thời Trang ABC", sdt: "0287654321", diaChi: "88 Điện Biên Phủ", thanhPho: "TP. Hồ Chí Minh", tenCongTy: "Công ty TNHH Thời Trang ABC", maSoThue: "0312345678" },
    items: [
      { tenSP: "Áo Thun Basic Oversize", mauSac: "Đen", kichThuoc: "M", soLuong: 50, donGia: 119000, thanhTien: 5950000 },
      { tenSP: "Áo Thun Basic Oversize", mauSac: "Trắng", kichThuoc: "L", soLuong: 30, donGia: 119000, thanhTien: 3570000 },
      { tenSP: "Quần Jean Skinny", mauSac: "Xanh nhạt", kichThuoc: "29", soLuong: 20, donGia: 285000, thanhTien: 5700000 },
    ],
    trangThai: "dang_giao", loaiKhach: "si", phuongThuc: "chuyen_khoan",
    tamTinh: 15220000, chietKhau: 1522000, phiShip: 0, tongCong: 13698000,
    ghiChu: "Xuất HĐ GTGT", ngayTao: "2026-03-07T14:00:00", ngayCapNhat: "2026-03-08T06:30:00",
  },
  {
    id: "4", ma: "DH-2026-0004",
    khach: { ten: "Lê Thị Hoa", sdt: "0934567890", diaChi: "12 Trần Hưng Đạo", thanhPho: "Đà Nẵng" },
    items: [
      { tenSP: "Đầm Wrap Cổ V", mauSac: "Xanh ngọc", kichThuoc: "M", soLuong: 1, donGia: 580000, thanhTien: 580000 },
      { tenSP: "Giày Sneaker Trắng", mauSac: "Trắng", kichThuoc: "37", soLuong: 1, donGia: 450000, thanhTien: 450000 },
    ],
    trangThai: "hoan_thanh", loaiKhach: "le", phuongThuc: "tien_mat",
    tamTinh: 1030000, chietKhau: 0, phiShip: 0, tongCong: 1030000,
    ghiChu: "", ngayTao: "2026-03-06T10:00:00", ngayCapNhat: "2026-03-07T16:00:00",
  },
  {
    id: "5", ma: "DH-2026-0005",
    khach: { ten: "Phạm Quốc Bảo", sdt: "0956789012", diaChi: "77 Lý Tự Trọng", thanhPho: "TP. Hồ Chí Minh" },
    items: [
      { tenSP: "Áo Khoác Bomber", mauSac: "Đen", kichThuoc: "L", soLuong: 1, donGia: 612000, thanhTien: 612000 },
    ],
    trangThai: "da_huy", loaiKhach: "le", phuongThuc: "chuyen_khoan",
    tamTinh: 612000, chietKhau: 0, phiShip: 30000, tongCong: 642000,
    ghiChu: "Khách huỷ — đổi size", ngayTao: "2026-03-07T09:00:00", ngayCapNhat: "2026-03-07T11:00:00",
  },
  {
    id: "6", ma: "DH-2026-0006",
    khach: { ten: "Hoàng Thị Mai", sdt: "0978901234", diaChi: "34 Pasteur", thanhPho: "TP. Hồ Chí Minh" },
    items: [
      { tenSP: "Set Đồ Bộ Thể Thao", mauSac: "Đen", kichThuoc: "S", soLuong: 2, donGia: 213750, thanhTien: 427500 },
      { tenSP: "Mũ Bucket Vải Thô", mauSac: "Đen", kichThuoc: "Free size", soLuong: 2, donGia: 125000, thanhTien: 250000 },
    ],
    trangThai: "cho_xac_nhan", loaiKhach: "le", phuongThuc: "qr",
    tamTinh: 677500, chietKhau: 0, phiShip: 0, tongCong: 677500,
    ghiChu: "", ngayTao: "2026-03-08T10:45:00", ngayCapNhat: "2026-03-08T10:45:00",
  },
  {
    id: "7", ma: "DH-2026-0007",
    khach: { ten: "Cty CP Phân Phối XYZ", sdt: "0243456789", diaChi: "200 Hoàng Diệu", thanhPho: "Hải Phòng", tenCongTy: "Công ty CP Phân Phối XYZ", maSoThue: "0209876543" },
    items: [
      { tenSP: "Túi Tote Canvas", mauSac: "Kem", kichThuoc: "One size", soLuong: 100, donGia: 157250, thanhTien: 15725000 },
      { tenSP: "Mũ Bucket Vải Thô", mauSac: "Kem", kichThuoc: "Free size", soLuong: 100, donGia: 93750, thanhTien: 9375000 },
    ],
    trangThai: "hoan_thanh", loaiKhach: "si", phuongThuc: "chuyen_khoan",
    tamTinh: 25100000, chietKhau: 3765000, phiShip: 0, tongCong: 21335000,
    ghiChu: "Đã xuất HĐ số 0045", ngayTao: "2026-03-05T08:00:00", ngayCapNhat: "2026-03-06T17:00:00",
  },
  {
    id: "8", ma: "DH-2026-0008",
    khach: { ten: "Vũ Thanh Tùng", sdt: "0967890123", diaChi: "56 Bà Triệu", thanhPho: "Hà Nội" },
    items: [
      { tenSP: "Dép Sandal Da Bò", mauSac: "Nâu bò", kichThuoc: "42", soLuong: 1, donGia: 520000, thanhTien: 520000 },
    ],
    trangThai: "dang_dong_goi", loaiKhach: "le", phuongThuc: "tien_mat",
    tamTinh: 520000, chietKhau: 0, phiShip: 30000, tongCong: 550000,
    ghiChu: "", ngayTao: "2026-03-08T06:00:00", ngayCapNhat: "2026-03-08T08:00:00",
  },
];

// ─── Config ───────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TRANG_THAI_CONFIG: Record<TrangThai, { label: string; color: string; bg: string; icon: any; nextStates: TrangThai[] }> = {
  cho_xac_nhan: { label: "Chờ xác nhận", color: "#f59e0b", bg: "#fef3c7", icon: Clock,   nextStates: ["dang_dong_goi", "da_huy"] },
  dang_dong_goi:{ label: "Đang đóng gói", color: "#3b82f6", bg: "#dbeafe", icon: Package, nextStates: ["dang_giao",     "da_huy"] },
  dang_giao:    { label: "Đang giao",     color: "#8b5cf6", bg: "#ede9fe", icon: Truck,   nextStates: ["hoan_thanh",    "da_huy"] },
  hoan_thanh:   { label: "Hoàn thành",    color: "#10b981", bg: "#d1fae5", icon: Check,   nextStates: [] },
  da_huy:       { label: "Đã huỷ",        color: "#ef4444", bg: "#fee2e2", icon: X,       nextStates: [] },
};

const PAY_LABEL: Record<PhuongThuc, string> = {
  tien_mat: "Tiền mặt", chuyen_khoan: "Chuyển khoản", qr: "QR Code",
};

const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";
const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

// ─── Badge ────────────────────────────────────────────────
function TrangThaiBadge({ tt }: { tt: TrangThai }) {
  const cfg = TRANG_THAI_CONFIG[tt];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

// ─── Detail Modal ─────────────────────────────────────────
function ChiTietModal({ don, onClose, onUpdateTT }: {
  don: DonHang;
  onClose: () => void;
  onUpdateTT: (id: string, tt: TrangThai) => void;
}) {
  const cfg = TRANG_THAI_CONFIG[don.trangThai];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "#1e293b" }}>
          <div>
            <p className="text-xs font-mono" style={{ color: "#64748b" }}>{don.ma}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-base font-bold text-white">{don.khach.ten}</h2>
              <TrangThaiBadge tt={don.trangThai} />
              {don.loaiKhach === "si" && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#0d4f3c", color: "#34d399" }}>SỈ</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors text-slate-400">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ scrollbarWidth: "thin" }}>

          {/* Khách hàng */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>👤 Thông tin khách</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: User,    label: "Tên",     val: don.khach.ten },
                { icon: Phone,   label: "SĐT",     val: don.khach.sdt },
                { icon: MapPin,  label: "Địa chỉ", val: `${don.khach.diaChi}, ${don.khach.thanhPho}` },
                { icon: CreditCard, label: "Thanh toán", val: PAY_LABEL[don.phuongThuc] },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="flex items-start gap-2">
                  <Icon size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#64748b" }} />
                  <div>
                    <p className="text-[9px]" style={{ color: "#64748b" }}>{label}</p>
                    <p className="text-xs font-medium text-white">{val}</p>
                  </div>
                </div>
              ))}
            </div>
            {don.khach.tenCongTy && (
              <div className="mt-2 pt-2 border-t" style={{ borderColor: "#334155" }}>
                <p className="text-[9px] mb-1" style={{ color: "#64748b" }}>Xuất hóa đơn cho</p>
                <p className="text-xs font-bold" style={{ color: "#34d399" }}>{don.khach.tenCongTy}</p>
                <p className="text-[10px]" style={{ color: "#94a3b8" }}>MST: {don.khach.maSoThue}</p>
              </div>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest px-4 py-3" style={{ color: "#64748b" }}>📦 Sản phẩm ({don.items.reduce((s, i) => s + i.soLuong, 0)} SP)</p>
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[9px] font-black uppercase" style={{ background: "#0f172a", color: "#475569" }}>
              <span className="col-span-5">Sản phẩm</span>
              <span className="col-span-2 text-center">SL</span>
              <span className="col-span-2 text-right">Đơn giá</span>
              <span className="col-span-3 text-right">Thành tiền</span>
            </div>
            {don.items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 border-t items-center" style={{ borderColor: "#0f172a" }}>
                <div className="col-span-5">
                  <p className="text-xs font-medium text-white">{item.tenSP}</p>
                  <p className="text-[10px]" style={{ color: "#64748b" }}>{item.mauSac} · {item.kichThuoc}</p>
                </div>
                <span className="col-span-2 text-center text-xs font-bold text-white">×{item.soLuong}</span>
                <span className="col-span-2 text-right text-xs" style={{ color: "#94a3b8" }}>{fmt(item.donGia)}</span>
                <span className="col-span-3 text-right text-xs font-bold" style={{ color: "#f59e0b" }}>{fmt(item.thanhTien)}</span>
              </div>
            ))}
          </div>

          {/* Tổng tiền */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>💰 Tổng kết</p>
            {[
              { label: "Tạm tính",    val: don.tamTinh,    color: "#94a3b8" },
              ...(don.chietKhau > 0 ? [{ label: `Chiết khấu sỉ`, val: -don.chietKhau, color: "#34d399" }] : []),
              ...(don.phiShip  > 0 ? [{ label: "Phí ship",       val: don.phiShip,    color: "#94a3b8" }] : []),
            ].map(({ label, val, color }) => (
              <div key={label} className="flex justify-between text-xs">
                <span style={{ color: "#64748b" }}>{label}</span>
                <span style={{ color }}>{val < 0 ? `-${fmt(-val)}` : fmt(val)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: "#334155" }}>
              <span className="text-sm font-bold text-white">Tổng cộng</span>
              <span className="text-lg font-black" style={{ color: "#f59e0b" }}>{fmt(don.tongCong)}</span>
            </div>
          </div>

          {/* Ghi chú */}
          {don.ghiChu && (
            <div className="rounded-2xl p-3" style={{ background: "#1e293b" }}>
              <p className="text-[10px]" style={{ color: "#64748b" }}>📝 Ghi chú</p>
              <p className="text-xs mt-1 text-white">{don.ghiChu}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="rounded-2xl p-4" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#64748b" }}>🕐 Thời gian</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span style={{ color: "#64748b" }}>Đặt hàng</span>
                <span style={{ color: "#94a3b8" }}>{fmtDate(don.ngayTao)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: "#64748b" }}>Cập nhật</span>
                <span style={{ color: "#94a3b8" }}>{fmtDate(don.ngayCapNhat)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        {cfg.nextStates.length > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2 px-6 py-4 border-t" style={{ borderColor: "#1e293b" }}>
            <span className="text-xs mr-2" style={{ color: "#64748b" }}>Chuyển sang:</span>
            {cfg.nextStates.map(ns => {
              const nc = TRANG_THAI_CONFIG[ns];
              const NIcon = nc.icon;
              const isDanger = ns === "da_huy";
              return (
                <button key={ns} onClick={() => { onUpdateTT(don.id, ns); onClose(); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
                  style={{
                    background: isDanger ? "#7f1d1d" : nc.bg,
                    color:      isDanger ? "#fca5a5" : nc.color,
                  }}>
                  <NIcon size={12} /> {nc.label}
                </button>
              );
            })}
            <button className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
              style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
              <Download size={12} /> Xuất PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
const PAGE_SIZE = 6;

export default function TheoDonHang() {
  const [orders,     setOrders]     = useState<DonHang[]>(MOCK_ORDERS);
  const [search,     setSearch]     = useState("");
  const [filterTT,   setFilterTT]   = useState<TrangThai | "tat_ca">("tat_ca");
  const [filterLoai, setFilterLoai] = useState<LoaiKhach | "tat_ca">("tat_ca");
  const [sortField,  setSortField]  = useState<"ngayTao" | "tongCong">("ngayTao");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("desc");
  const [page,       setPage]       = useState(1);
  const [selDon,     setSelDon]     = useState<DonHang | null>(null);

  const updateTrangThai = (id: string, tt: TrangThai) => {
    setOrders(prev => prev.map(o => o.id === id
      ? { ...o, trangThai: tt, ngayCapNhat: new Date().toISOString() }
      : o
    ));
  };

  const filtered = useMemo(() => {
    let list = [...orders];
    if (search)             list = list.filter(o =>
      o.ma.includes(search) ||
      o.khach.ten.toLowerCase().includes(search.toLowerCase()) ||
      o.khach.sdt.includes(search)
    );
    if (filterTT   !== "tat_ca") list = list.filter(o => o.trangThai  === filterTT);
    if (filterLoai !== "tat_ca") list = list.filter(o => o.loaiKhach  === filterLoai);
    list.sort((a, b) => {
      const va = sortField === "ngayTao" ? new Date(a.ngayTao).getTime() : a.tongCong;
      const vb = sortField === "ngayTao" ? new Date(b.ngayTao).getTime() : b.tongCong;
      return sortDir === "desc" ? vb - va : va - vb;
    });
    return list;
  }, [orders, search, filterTT, filterLoai, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged      = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Stats
  const stats = useMemo(() => ({
    choXacNhan:  orders.filter(o => o.trangThai === "cho_xac_nhan").length,
    dangGiao:    orders.filter(o => o.trangThai === "dang_giao").length,
    hoanThanh:   orders.filter(o => o.trangThai === "hoan_thanh").length,
    doanhThu:    orders.filter(o => o.trangThai === "hoan_thanh").reduce((s, o) => s + o.tongCong, 0),
  }), [orders]);

  const toggleSort = (field: "ngayTao" | "tongCong") => {
    if (sortField === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(field); setSortDir("desc"); }
  };

  return (
    <div className="p-6 space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Theo dõi đơn hàng</h1>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Quản lý và cập nhật trạng thái tất cả đơn hàng</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-80"
          style={{ background: "#1e293b", color: "#94a3b8", border: "1px solid #334155" }}>
          <Download size={13} /> Xuất báo cáo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chờ xác nhận", val: stats.choXacNhan,  icon: Clock,  color: "#f59e0b", bg: "#78350f20", action: () => setFilterTT("cho_xac_nhan") },
          { label: "Đang giao",    val: stats.dangGiao,    icon: Truck,  color: "#8b5cf6", bg: "#4c1d9520", action: () => setFilterTT("dang_giao")    },
          { label: "Hoàn thành",   val: stats.hoanThanh,   icon: Check,  color: "#10b981", bg: "#06472520", action: () => setFilterTT("hoan_thanh")   },
          { label: "Doanh thu",    val: fmt(stats.doanhThu),icon: CreditCard, color: "#38bdf8", bg: "#0c435420", action: () => {} },
        ].map(({ label, val, icon: Icon, color, bg, action }) => (
          <button key={label} onClick={action}
            className="flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-lg font-black text-white leading-tight">{val}</p>
              <p className="text-[10px]" style={{ color: "#64748b" }}>{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#64748b" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm mã đơn, tên khách, SĐT..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-sm outline-none transition-colors"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
        </div>

        {/* Filter trạng thái */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <select value={filterTT} onChange={e => { setFilterTT(e.target.value as any); setPage(1); }}
          className="px-3 py-2 rounded-xl text-xs font-medium outline-none"
          style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
          <option value="tat_ca">Tất cả trạng thái</option>
          {(Object.keys(TRANG_THAI_CONFIG) as TrangThai[]).map(k => (
            <option key={k} value={k}>{TRANG_THAI_CONFIG[k].label}</option>
          ))}
        </select>

        {/* Filter loại khách */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <select value={filterLoai} onChange={e => { setFilterLoai(e.target.value as any); setPage(1); }}
          className="px-3 py-2 rounded-xl text-xs font-medium outline-none"
          style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
          <option value="tat_ca">Lẻ + Sỉ</option>
          <option value="le">Khách lẻ</option>
          <option value="si">Khách sỉ</option>
        </select>

        {/* Reset */}
        {(search || filterTT !== "tat_ca" || filterLoai !== "tat_ca") && (
          <button onClick={() => { setSearch(""); setFilterTT("tat_ca"); setFilterLoai("tat_ca"); setPage(1); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: "#7f1d1d", color: "#fca5a5" }}>
            <RefreshCw size={11} /> Xoá lọc
          </button>
        )}

        <span className="ml-auto text-xs" style={{ color: "#475569" }}>{filtered.length} đơn hàng</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        {/* Table header */}
        <div className="grid grid-cols-12 gap-3 px-5 py-3 text-[10px] font-black uppercase tracking-widest"
          style={{ background: "#1e293b", color: "#475569" }}>
          <span className="col-span-3">Khách hàng</span>
          <span className="col-span-3">Sản phẩm</span>
          <button className="col-span-2 flex items-center gap-1 hover:text-slate-300 transition-colors" onClick={() => toggleSort("tongCong")}>
            Tổng tiền <ArrowUpDown size={9} />
          </button>
          <span className="col-span-2">Trạng thái</span>
          <button className="col-span-1 flex items-center gap-1 hover:text-slate-300 transition-colors" onClick={() => toggleSort("ngayTao")}>
            Ngày <ArrowUpDown size={9} />
          </button>
          <span className="col-span-1 text-center">Thao tác</span>
        </div>

        {/* Rows */}
        {paged.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="mx-auto mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm" style={{ color: "#475569" }}>Không có đơn hàng nào</p>
          </div>
        ) : paged.map((don, idx) => {
          const cfg = TRANG_THAI_CONFIG[don.trangThai];
          return (
            <div key={don.id}
              className={`grid grid-cols-12 gap-3 px-5 py-3.5 items-center hover:bg-slate-800/30 transition-colors cursor-pointer ${idx > 0 ? "border-t" : ""}`}
              style={{ borderColor: "#1e293b" }}
              onClick={() => setSelDon(don)}>

              {/* Khách */}
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
                    style={{ background: don.loaiKhach === "si" ? "#0d4f3c" : "#1e293b", color: don.loaiKhach === "si" ? "#34d399" : "#64748b" }}>
                    {don.khach.ten[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{don.khach.ten}</p>
                    <p className="text-[10px] truncate" style={{ color: "#64748b" }}>{don.ma}</p>
                  </div>
                </div>
              </div>

              {/* Items preview */}
              <div className="col-span-3">
                <p className="text-xs text-white truncate">{don.items[0].tenSP}</p>
                <p className="text-[10px]" style={{ color: "#64748b" }}>
                  {don.items.length > 1 ? `+${don.items.length - 1} SP khác · ` : ""}
                  {don.items.reduce((s, i) => s + i.soLuong, 0)} SP
                </p>
              </div>

              {/* Tổng */}
              <div className="col-span-2">
                <p className="text-sm font-black" style={{ color: "#f59e0b" }}>{fmt(don.tongCong)}</p>
                {don.chietKhau > 0 && (
                  <p className="text-[10px]" style={{ color: "#34d399" }}>-{fmt(don.chietKhau)} sỉ</p>
                )}
              </div>

              {/* Trạng thái */}
              <div className="col-span-2">
                <TrangThaiBadge tt={don.trangThai} />
              </div>

              {/* Ngày */}
              <div className="col-span-1">
                <p className="text-[10px]" style={{ color: "#64748b" }}>{fmtDate(don.ngayTao)}</p>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                <button onClick={() => setSelDon(don)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                  style={{ color: "#64748b" }}>
                  <Eye size={13} />
                </button>
                {/* Quick action: chuyển trạng thái tiếp theo */}
                {cfg.nextStates[0] && cfg.nextStates[0] !== "da_huy" && (
                  <button
                    onClick={() => updateTrangThai(don.id, cfg.nextStates[0])}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-slate-700 transition-colors"
                    style={{ color: TRANG_THAI_CONFIG[cfg.nextStates[0]].color }}
                    title={`→ ${TRANG_THAI_CONFIG[cfg.nextStates[0]].label}`}>
                    <Check size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: "#475569" }}>
            Trang {page}/{totalPages} · {filtered.length} đơn
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1e293b", color: "#94a3b8" }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: page === i + 1 ? "#3b82f6" : "#1e293b",
                  color:      page === i + 1 ? "white"   : "#64748b",
                }}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: "#1e293b", color: "#94a3b8" }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {selDon && (
        <ChiTietModal
          don={selDon}
          onClose={() => setSelDon(null)}
          onUpdateTT={updateTrangThai}
        />
      )}
    </div>
  );
}
