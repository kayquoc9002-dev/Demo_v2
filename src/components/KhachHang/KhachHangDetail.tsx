import { useState } from "react";
import {
  X,
  Building2,
  Shirt,
  User,
  Star,
  Package,
  BarChart2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { KhachHang } from "./types";
import { getTenKH, getLabelLoai, getMauLoai } from "./types";

interface Props {
  kh: KhachHang;
  onClose: () => void;
}

// ── Helper ────────────────────────────────────────────────
const Row = ({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-slate-200">{value}</span>
    </div>
  );
};

const NoteRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
    <span className="text-xs text-slate-400 flex-shrink-0">{label}</span>
    {value ? (
      <span className="text-xs text-slate-300 text-right max-w-[60%]">
        {value}
      </span>
    ) : (
      <span className="text-[10px] text-slate-600 italic">
        Không có yêu cầu
      </span>
    )}
  </div>
);

const Stars = ({ value }: { value?: number | null }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={14}
        className={
          i <= (value || 0) ? "text-amber-400 fill-amber-400" : "text-slate-700"
        }
      />
    ))}
  </div>
);

// ── B2B Detail ────────────────────────────────────────────
const B2BDetail = ({ b2b }: { b2b: NonNullable<KhachHang["b2b"]> }) => {
  const [tab, setTab] = useState<"chung" | "donhang" | "danhgia">("chung");

  const tabs = [
    { key: "chung", label: "Thông tin chung", icon: Building2 },
    { key: "donhang", label: "Đơn hàng", icon: Package },
    { key: "danhgia", label: "Đánh giá & lịch sử", icon: BarChart2 },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
              tab === key
                ? "bg-slate-700 text-white"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={12} />
            <span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="space-y-4"
        >
          {tab === "chung" && (
            <div className="grid grid-cols-2 gap-4">
              <Row label="Lĩnh vực hoạt động" value={b2b.linhVucHoatDong} />
              <Row label="Địa chỉ" value={b2b.diaChi} />
              <Row label="Người phụ trách" value={b2b.nguoiPhuTrach} />
              <Row label="Email" value={b2b.email} />
              <Row label="Số điện thoại" value={b2b.sdt} />
              <Row
                label="Bắt đầu hợp tác"
                value={
                  b2b.batDauHopTac
                    ? new Date(b2b.batDauHopTac).toLocaleDateString("vi-VN")
                    : null
                }
              />
            </div>
          )}

          {tab === "donhang" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800/60">
                <Row label="Loại sản phẩm" value={b2b.loaiSanPham} />
                <Row
                  label="Số lượng mỗi đơn"
                  value={b2b.soLuongMoiDon?.toLocaleString()}
                />
                <Row
                  label="Số đơn/năm"
                  value={b2b.soLuongDonNam?.toLocaleString()}
                />
                <Row
                  label="Tổng sản lượng/năm"
                  value={b2b.tongSanLuongNam?.toLocaleString()}
                />
                <Row
                  label="Điều khoản thanh toán"
                  value={b2b.dieuKhoanThanhToan}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Yêu cầu đặc biệt
                </p>
                <NoteRow label="Kỹ thuật đặc biệt" value={b2b.yeuCauKyThuat} />
                <NoteRow label="Logo / In / Thêu" value={b2b.yeuCauLogo} />
                <NoteRow label="Bao bì riêng" value={b2b.yeuCauBaobi} />
                <NoteRow
                  label="Thời gian giao hàng"
                  value={b2b.thoiGianGiaoHang}
                />
              </div>
            </div>
          )}

          {tab === "danhgia" && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-white">
                    {b2b.soLanDatHang ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Lần đặt hàng
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-emerald-400">
                    {b2b.tyLeTaiDat ?? 0}%
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tái đặt hàng
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center">
                  <Stars value={b2b.mucDoHaiLong} />
                  <p className="text-[10px] text-slate-500 mt-1">Hài lòng</p>
                </div>
              </div>
              {(b2b.khieuNai || b2b.thoiGianXuLyKhieuNai) && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                    Khiếu nại
                  </p>
                  {b2b.khieuNai && (
                    <p className="text-sm text-slate-300">{b2b.khieuNai}</p>
                  )}
                  {b2b.thoiGianXuLyKhieuNai && (
                    <p className="text-xs text-slate-500">
                      Thời gian xử lý: {b2b.thoiGianXuLyKhieuNai}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Thời trang Detail ─────────────────────────────────────
const ThoiTrangDetail = ({
  tt,
}: {
  tt: NonNullable<KhachHang["thoiTrang"]>;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Row label="Người phụ trách" value={tt.nguoiPhuTrach} />
      <Row label="Email" value={tt.email} />
      <Row label="Số điện thoại" value={tt.sdt} />
      <Row
        label="Bắt đầu hợp tác"
        value={
          tt.batDauHopTac
            ? new Date(tt.batDauHopTac).toLocaleDateString("vi-VN")
            : null
        }
      />
      <Row label="Phân khúc" value={tt.phanKhuc} />
      <Row label="Thị trường chính" value={tt.thiTruongChinh} />
      <Row label="Hình thức hợp tác" value={tt.hinhThucHopTac} />
      <Row
        label="Số lượng mỗi BST"
        value={tt.soLuongMoiBST?.toLocaleString()}
      />
      <Row
        label="Tần suất BST/năm"
        value={tt.tanSuatBSTNam ? `${tt.tanSuatBSTNam} BST/năm` : null}
      />
    </div>
    <div className="pt-2 border-t border-slate-800/60 space-y-0">
      <NoteRow label="Yêu cầu bảo mật" value={tt.yeuCauBaoMat} />
      <NoteRow label="Tiêu chuẩn kiểm hàng" value={tt.tieuChuanKiemHang} />
      <NoteRow
        label="Yêu cầu test co rút / màu"
        value={tt.yeuCauTestCoRutMau}
      />
    </div>
    {tt.boSuuTapDaSanXuat &&
      (() => {
        try {
          const bst: string[] = JSON.parse(tt.boSuuTapDaSanXuat!);
          return bst.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Bộ sưu tập đã sản xuất
              </p>
              <div className="flex flex-wrap gap-1.5">
                {bst.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ) : null;
        } catch {
          return null;
        }
      })()}
  </div>
);

// ── Cá nhân Detail ────────────────────────────────────────
const CaNhanDetail = ({ cn }: { cn: NonNullable<KhachHang["caNhan"]> }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <Row label="Email" value={cn.email} />
      <Row label="Số điện thoại" value={cn.sdt} />
      <Row label="Sản phẩm đặt may" value={cn.sanPhamDatMay} />
      <Row label="Số lượng" value={cn.soLuong?.toLocaleString()} />
      <Row label="Thời gian giao" value={cn.thoiGianGiao} />
      <Row
        label="Giá trị đơn hàng"
        value={
          cn.giaTriDonHang ? `${cn.giaTriDonHang.toLocaleString()} đ` : null
        }
      />
    </div>
    <div className="pt-2 border-t border-slate-800/60 space-y-0">
      <NoteRow label="Yêu cầu thiết kế riêng" value={cn.yeuCauThietKe} />
      <NoteRow label="Yêu cầu chỉnh sửa" value={cn.yeuCauChinhSua} />
      <NoteRow label="Phản hồi sau nhận hàng" value={cn.phanHoi} />
    </div>
    {cn.lichSuDatMay &&
      (() => {
        try {
          const ls: string[] = JSON.parse(cn.lichSuDatMay!);
          return ls.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Lịch sử đặt may
              </p>
              <div className="space-y-1">
                {ls.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs text-slate-400"
                  >
                    <div className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null;
        } catch {
          return null;
        }
      })()}
  </div>
);

// ── Main Modal ────────────────────────────────────────────
export const KhachHangDetail = ({ kh, onClose }: Props) => {
  const mau = getMauLoai(kh.loai);
  const ten = getTenKH(kh);
  const label = getLabelLoai(kh.loai);

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-4 flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-xl ${mau.bg} ${mau.text} border ${mau.border} flex items-center justify-center flex-shrink-0`}
          >
            {kh.loai === "B2B" ? (
              <Building2 size={18} />
            ) : kh.loai === "ThoiTrang" ? (
              <Shirt size={18} />
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-black text-white truncate">{ten}</p>
              <span
                className={`text-[9px] font-bold ${mau.text} ${mau.bg} border ${mau.border} px-2 py-0.5 rounded-md flex-shrink-0`}
              >
                {label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs font-mono text-slate-500">{kh.ma}</span>
              <span
                className={`text-[10px] font-bold ${kh.trangThai === "active" ? "text-emerald-400" : "text-slate-500"}`}
              >
                {kh.trangThai === "active"
                  ? "● Đang hợp tác"
                  : "● Ngừng hợp tác"}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {kh.b2b && <B2BDetail b2b={kh.b2b} />}
          {kh.thoiTrang && <ThoiTrangDetail tt={kh.thoiTrang} />}
          {kh.caNhan && <CaNhanDetail cn={kh.caNhan} />}
        </div>
      </motion.div>
    </div>
  );
};
