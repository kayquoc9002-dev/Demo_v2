import { useState } from "react";
import { X, Building, Globe, BarChart2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { NhaPhanPhoi } from "./types";
import { getTrangThaiColor, getTrangThaiLabel, parseJsonArray } from "./types";

interface Props {
  npp: NhaPhanPhoi;
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

const Tags = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((item, i) => (
      <span
        key={i}
        className="text-[10px] font-bold text-violet-300 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md"
      >
        {item}
      </span>
    ))}
  </div>
);

const NoteRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
    <span className="text-xs text-slate-400 flex-shrink-0 w-1/3">{label}</span>
    {value ? (
      <span className="text-xs text-slate-300 text-right flex-1">{value}</span>
    ) : (
      <span className="text-[10px] text-slate-600 italic">Không có</span>
    )}
  </div>
);

export const NhaPhanPhoiDetail = ({ npp, onClose }: Props) => {
  const [tab, setTab] = useState<"chung" | "phamvi" | "nangluc" | "chinhsach">(
    "chung",
  );
  const mau = getTrangThaiColor(npp.trangThai);

  const tabs = [
    { key: "chung" as const, label: "Thông tin chung", icon: Building },
    { key: "phamvi" as const, label: "Phạm vi", icon: Globe },
    { key: "nangluc" as const, label: "Năng lực", icon: BarChart2 },
    { key: "chinhsach" as const, label: "Chính sách", icon: FileText },
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
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {npp.logo ? (
              <img
                src={npp.logo}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Building size={18} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-base font-black text-white truncate">
                {npp.tenCongTy}
              </p>
              <span
                className={`text-[9px] font-bold px-2 py-0.5 rounded-md border flex-shrink-0 ${mau.bg} ${mau.text} ${mau.border}`}
              >
                {getTrangThaiLabel(npp.trangThai)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs font-mono text-slate-500">{npp.ma}</span>
              {npp.quocGiaKhuVuc && (
                <span className="text-xs text-slate-500">
                  · {npp.quocGiaKhuVuc}
                </span>
              )}
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {tab === "chung" && (
                <div className="grid grid-cols-2 gap-4">
                  <Row label="Người phụ trách" value={npp.nguoiPhuTrach} />
                  <Row label="Chức vụ" value={npp.chucVuLienHe} />
                  <Row label="Email" value={npp.email} />
                  <Row label="Số điện thoại" value={npp.sdt} />
                  <Row label="Website" value={npp.website} />
                  <Row
                    label="Năm bắt đầu hợp tác"
                    value={npp.namBatDauHopTac}
                  />
                  <Row label="Thời hạn hợp đồng" value={npp.thoiHanHopDong} />
                  <div className="col-span-2">
                    <Row label="Địa chỉ trụ sở" value={npp.diaChiTruSo} />
                  </div>
                  <div className="col-span-2">
                    <Row label="Địa chỉ kho hàng" value={npp.diaChiKho} />
                  </div>
                </div>
              )}

              {tab === "phamvi" && (
                <div className="space-y-4">
                  {npp.phanPhoiDocQuyen === null ? (
                    <p className="text-sm text-slate-600 italic text-center py-6">
                      Chưa có thông tin phạm vi phân phối
                    </p>
                  ) : (
                    <>
                      <Row
                        label="Phân phối độc quyền"
                        value={npp.phanPhoiDocQuyen}
                      />
                      {parseJsonArray(npp.phanPhoiKhuVuc).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Khu vực phân phối
                          </p>
                          <Tags items={parseJsonArray(npp.phanPhoiKhuVuc)} />
                        </div>
                      )}
                      {parseJsonArray(npp.phanPhoiNganhHang).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Ngành hàng
                          </p>
                          <Tags items={parseJsonArray(npp.phanPhoiNganhHang)} />
                        </div>
                      )}
                      {parseJsonArray(npp.hinhThucBanHang).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Hình thức bán hàng
                          </p>
                          <Tags items={parseJsonArray(npp.hinhThucBanHang)} />
                        </div>
                      )}
                      {parseJsonArray(npp.kenhPhanPhoi).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Kênh phân phối
                          </p>
                          <Tags items={parseJsonArray(npp.kenhPhanPhoi)} />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <Row label="Có đại lý con" value={npp.coDaiLyCon} />
                        <Row label="Số lượng đại lý" value={npp.soLuongDaiLy} />
                      </div>
                    </>
                  )}
                </div>
              )}

              {tab === "nangluc" && (
                <div className="space-y-4">
                  {npp.dienTichKho === null && npp.coHeThongWMS === null ? (
                    <p className="text-sm text-slate-600 italic text-center py-6">
                      Chưa có thông tin năng lực
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {npp.dienTichKho != null && (
                        <Row
                          label="Diện tích kho (m²)"
                          value={npp.dienTichKho.toLocaleString()}
                        />
                      )}
                      <Row label="Sức chứa tối đa" value={npp.sucChuaToiDa} />
                      <Row
                        label="Sản lượng/tháng"
                        value={npp.sanLuongTieuThuThang?.toLocaleString()}
                      />
                      <Row
                        label="Sản lượng/năm"
                        value={npp.sanLuongTieuThuNam?.toLocaleString()}
                      />
                      <Row
                        label="Giao hàng/ngày (đơn)"
                        value={npp.khaNangGiaoHangNgay}
                      />
                      <Row
                        label="Thời gian xử lý đơn"
                        value={npp.thoiGianXuLyDon}
                      />
                      <Row label="Đội ngũ nhân sự" value={npp.doiNguNhanSu} />
                      <Row
                        label="Phương tiện vận chuyển"
                        value={npp.phuongTienVanChuyen}
                      />
                      <Row label="Hệ thống WMS/ERP" value={npp.coHeThongWMS} />
                    </div>
                  )}
                </div>
              )}

              {tab === "chinhsach" && (
                <div>
                  {npp.chinhSachChietKhau === null &&
                  npp.dieuKhoanChamDut === null ? (
                    <p className="text-sm text-slate-600 italic text-center py-6">
                      Chưa có thông tin chính sách
                    </p>
                  ) : (
                    <>
                      <NoteRow
                        label="Chiết khấu"
                        value={npp.chinhSachChietKhau}
                      />
                      <NoteRow label="Công nợ" value={npp.chinhSachCongNo} />
                      <NoteRow
                        label="Thời hạn thanh toán"
                        value={npp.thoiHanThanhToan}
                      />
                      <NoteRow
                        label="Tồn kho tối thiểu"
                        value={npp.mucTonKhoToiThieu}
                      />
                      <NoteRow label="Đổi trả" value={npp.chinhSachDoiTra} />
                      <NoteRow
                        label="Bảo hành sản phẩm"
                        value={npp.dieuKhoanBaoHanh}
                      />
                      <NoteRow
                        label="Bảo mật thông tin"
                        value={npp.dieuKhoanBaoMat}
                      />
                      <NoteRow
                        label="Chấm dứt hợp tác"
                        value={npp.dieuKhoanChamDut}
                      />
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
