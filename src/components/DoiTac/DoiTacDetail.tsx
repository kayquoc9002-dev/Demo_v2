import { useState } from "react";
import {
  X,
  Package,
  Wrench,
  Palette,
  Info,
  Cog,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DoiTac } from "./types";
import { getTenDoiTac, getLabelLoai, getMauLoai } from "./types";

interface Props {
  dt: DoiTac;
  onClose: () => void;
}

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
    <span className="text-xs text-slate-400 flex-shrink-0 w-2/5">{label}</span>
    {value ? (
      <span className="text-xs text-slate-300 text-right flex-1">{value}</span>
    ) : (
      <span className="text-[10px] text-slate-600 italic">Không có</span>
    )}
  </div>
);

const MayRow = ({ label, so }: { label: string; so?: number | null }) => {
  if (!so && so !== 0) return null;
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800/40 last:border-0">
      <span className="text-xs text-slate-400">{label}</span>
      <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-lg">
        {so} chiếc
      </span>
    </div>
  );
};

export const DoiTacDetail = ({ dt, onClose }: Props) => {
  const mau = getMauLoai(dt.loai);
  const ten = getTenDoiTac(dt);
  const [tab, setTab] = useState<"chung" | "nangLuc" | "chatLuong">("chung");

  const Icon =
    dt.loai === "CungUng" ? Package : dt.loai === "GiaCong" ? Wrench : Palette;

  const tabs = [
    { key: "chung" as const, label: "Thông tin chung", icon: Info },
    {
      key: "nangLuc" as const,
      label:
        dt.loai === "ThietKe"
          ? "Năng lực"
          : dt.loai === "CungUng"
            ? "Cung ứng"
            : "Kỹ thuật",
      icon: Cog,
    },
    { key: "chatLuong" as const, label: "Chất lượng", icon: CheckCircle },
  ];

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
            <Icon size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-black text-white truncate">{ten}</p>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${mau.bg} ${mau.text} ${mau.border}`}
              >
                {getLabelLoai(dt.loai)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs font-mono text-slate-500">{dt.ma}</span>
              <span
                className={`text-[10px] font-bold ${dt.trangThai === "active" ? "text-emerald-400" : "text-slate-500"}`}
              >
                {dt.trangThai === "active" ? "● Hoạt động" : "● Ngừng"}
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

        {/* Tabs */}
        <div className="px-6 pt-4 flex-shrink-0">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {tabs.map(({ key, label, icon: TabIcon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  tab === key
                    ? "bg-slate-700 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <TabIcon size={12} />
                <span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {/* ── CUNG ỨNG ── */}
              {dt.loai === "CungUng" && dt.cungUng && (
                <>
                  {tab === "chung" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Row
                        label="Quốc gia xuất xứ"
                        value={dt.cungUng.quocGiaXuatXu}
                      />
                      <Row
                        label="Năm thành lập"
                        value={dt.cungUng.namThanhLap}
                      />
                      <Row
                        label="Năm bắt đầu hợp tác"
                        value={dt.cungUng.namBatDauHopTac}
                      />
                      <Row
                        label="Năng lực SX/tháng"
                        value={dt.cungUng.nangLucSanXuatThang}
                      />
                      <Row
                        label="Chứng nhận chất lượng"
                        value={dt.cungUng.chungNhanChatLuong}
                      />
                      <div className="col-span-2">
                        <Row
                          label="Địa chỉ nhà máy"
                          value={dt.cungUng.diaChiNhaMay}
                        />
                      </div>
                    </div>
                  )}
                  {tab === "nangLuc" && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Phân loại cung ứng
                      </p>
                      <NoteRow label="Vải" value={dt.cungUng.vai} />
                      <NoteRow label="Chỉ may" value={dt.cungUng.chiMay} />
                      <NoteRow
                        label="Cúc, nút, dây kéo"
                        value={dt.cungUng.cubNutDayKeo}
                      />
                      <NoteRow label="Tem nhãn" value={dt.cungUng.temNhan} />
                      <NoteRow
                        label="Bao bì đóng gói"
                        value={dt.cungUng.baoBiDongGoi}
                      />
                      <NoteRow
                        label="Phụ liệu trang trí"
                        value={dt.cungUng.phuLieuTrangTri}
                      />
                      <NoteRow
                        label="Hóa chất giặt – xử lý vải"
                        value={dt.cungUng.hoaChatGiat}
                      />
                    </div>
                  )}
                  {tab === "chatLuong" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Row label="Có phòng lab" value={dt.cungUng.coPhongLab} />
                      <Row
                        label="Tỷ lệ lỗi TB (%)"
                        value={
                          dt.cungUng.tyLeLoi != null
                            ? `${dt.cungUng.tyLeLoi}%`
                            : null
                        }
                      />
                      <Row
                        label="Thời gian giao hàng TB"
                        value={dt.cungUng.thoiGianGiaoHang}
                      />
                      <Row
                        label="Kiểm tra mẫu trước SX"
                        value={dt.cungUng.kiemTraMauTruoc}
                      />
                      <div className="col-span-2">
                        <NoteRow
                          label="Chính sách đổi trả"
                          value={dt.cungUng.chinhSachDoiTra}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── GIA CÔNG ── */}
              {dt.loai === "GiaCong" && dt.giaCong && (
                <>
                  {tab === "chung" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Row
                        label="Địa chỉ xưởng"
                        value={dt.giaCong.diaChiXuong}
                      />
                      <Row
                        label="Số chuyền may"
                        value={dt.giaCong.soLuongChuyen}
                      />
                      <Row
                        label="Số công nhân"
                        value={dt.giaCong.soLuongCongNhan?.toLocaleString()}
                      />
                      <Row
                        label="Công suất/ngày (sp)"
                        value={dt.giaCong.congSuatNgay?.toLocaleString()}
                      />
                      <Row
                        label="Công suất/tháng (sp)"
                        value={dt.giaCong.congSuatThang?.toLocaleString()}
                      />
                      <Row
                        label="Loại sản phẩm"
                        value={dt.giaCong.loaiSanPham}
                      />
                      <Row label="Có phòng QC" value={dt.giaCong.coPhongQC} />
                    </div>
                  )}
                  {tab === "nangLuc" && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Máy móc thiết bị
                      </p>
                      <MayRow
                        label="Máy may 1 kim"
                        so={dt.giaCong.mayMay1Kim}
                      />
                      <MayRow
                        label="Máy may 2 kim"
                        so={dt.giaCong.mayMay2Kim}
                      />
                      <MayRow label="Máy vắt sổ" so={dt.giaCong.mayVatSo} />
                      <MayRow label="Máy kansai" so={dt.giaCong.mayKansai} />
                      <MayRow
                        label="Máy thùa khuy"
                        so={dt.giaCong.mayThuaKhuy}
                      />
                      <MayRow label="Máy đính nút" so={dt.giaCong.mayDinhNut} />
                      <MayRow
                        label="Máy in chuyển nhiệt"
                        so={dt.giaCong.mayInChuyenNhiet}
                      />
                      <MayRow
                        label="Máy thêu vi tính"
                        so={dt.giaCong.mayTheuViTinh}
                      />
                      <MayRow
                        label="Máy giặt công nghiệp"
                        so={dt.giaCong.mayGiatCongNghiep}
                      />
                    </div>
                  )}
                  {tab === "chatLuong" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Row
                        label="Tỷ lệ lỗi TB (%)"
                        value={
                          dt.giaCong.tyLeLoi != null
                            ? `${dt.giaCong.tyLeLoi}%`
                            : null
                        }
                      />
                      <Row
                        label="Quy trình 3 bước"
                        value={dt.giaCong.quyTrinh3Buoc}
                      />
                      <Row
                        label="Tiêu chuẩn may"
                        value={dt.giaCong.tieuChuanMay}
                      />
                      <Row
                        label="Đạt audit KH"
                        value={dt.giaCong.datAuditKhachHang}
                      />
                      <Row
                        label="Kinh nghiệm XK"
                        value={dt.giaCong.kinhNghiemXuatKhau}
                      />
                    </div>
                  )}
                </>
              )}

              {/* ── THIẾT KẾ ── */}
              {dt.loai === "ThietKe" && dt.thietKe && (
                <>
                  {tab === "chung" && (
                    <div className="grid grid-cols-2 gap-4">
                      <Row
                        label="Lĩnh vực chuyên môn"
                        value={dt.thietKe.linhVucChuyenMon}
                      />
                      <Row
                        label="Số năm kinh nghiệm"
                        value={dt.thietKe.soNamKinhNghiem}
                      />
                      <Row
                        label="Thời gian hoàn thành 1 mẫu"
                        value={dt.thietKe.thoiGianHoanThanh}
                      />
                      <Row
                        label="Thiết kế rập"
                        value={dt.thietKe.khaNangThietKeRap}
                      />
                      <Row
                        label="Làm mẫu thử"
                        value={dt.thietKe.khaNangLamMauThu}
                      />
                      <div className="col-span-2">
                        <Row
                          label="Phần mềm sử dụng"
                          value={dt.thietKe.phanMemSuDung}
                        />
                      </div>
                      {dt.thietKe.duAnDaThucHien && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Dự án đã thực hiện
                          </p>
                          <p className="text-sm text-slate-300">
                            {dt.thietKe.duAnDaThucHien}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {tab === "nangLuc" && (
                    <div>
                      {dt.thietKe.quyTrinhDuyetMau &&
                      dt.thietKe.quyTrinhDuyetMau !== "__none__" ? (
                        (() => {
                          try {
                            const steps: { stt: number; buoc: string }[] =
                              JSON.parse(dt.thietKe.quyTrinhDuyetMau!);
                            return (
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                                  Quy trình duyệt mẫu
                                </p>
                                {steps.map((s) => (
                                  <div
                                    key={s.stt}
                                    className="flex items-center gap-3"
                                  >
                                    <span className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                      {s.stt}
                                    </span>
                                    <span className="text-sm text-slate-300">
                                      {s.buoc}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          } catch {
                            return null;
                          }
                        })()
                      ) : (
                        <p className="text-sm text-slate-600 italic text-center py-6">
                          Chưa có quy trình duyệt mẫu
                        </p>
                      )}
                    </div>
                  )}
                  {tab === "chatLuong" && (
                    <NoteRow
                      label="Chính sách bảo mật thiết kế"
                      value={dt.thietKe.chinhSachBaoMat}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
