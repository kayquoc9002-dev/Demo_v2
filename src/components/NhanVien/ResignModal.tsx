import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserX, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

interface Employee {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  department?: { name: string };
  position?: { name: string };
}

interface ResignModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onResignSuccess: () => void;
}

export const ResignModal = ({
  isOpen,
  onClose,
  employee,
  onResignSuccess,
}: ResignModalProps) => {
  const [leavingReason, setLeavingReason] = useState("");
  const [handoverInfo, setHandoverInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleResign = async () => {
    if (!employee) return;
    if (!leavingReason.trim()) {
      alert("Vui lòng nhập lý do nghỉ việc!");
      return;
    }
    if (!confirmed) {
      alert("Vui lòng tích xác nhận trước khi thực hiện!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${apiUrl}/hr/employees/${employee.id}/resign`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "inactive",
            leavingReason: leavingReason.trim(),
            handoverInfo: handoverInfo.trim() || null,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        alert(`Đã xử lý thôi việc cho ${employee.fullName} thành công.`);
        onResignSuccess();
        handleClose();
      } else {
        alert(result.message || "Có lỗi xảy ra!");
      }
    } catch {
      alert("Không kết nối được server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state khi đóng
    setLeavingReason("");
    setHandoverInfo("");
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative w-full max-w-md bg-[#0d1117] border border-slate-800 rounded-3xl p-8 shadow-2xl"
      >
        {/* Nút đóng */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-xl"
        >
          <X size={18} />
        </button>

        <div className="space-y-5">
          {/* Icon + tiêu đề */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-rose-500/15 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20">
              <UserX size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Xử lý thôi việc</h3>
              <p className="text-xs text-slate-500 mt-1">
                Tài khoản sẽ bị vô hiệu hóa ngay lập tức
              </p>
            </div>
          </div>

          {/* Thông tin nhân viên */}
          {employee ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-base flex items-center justify-center flex-shrink-0 uppercase">
                {employee.fullName.substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white uppercase truncate">
                  {employee.fullName}
                </p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {employee.code}
                  {employee.position?.name && ` · ${employee.position.name}`}
                  {employee.department?.name &&
                    ` · ${employee.department.name}`}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-rose-500/30 rounded-2xl px-5 py-4 text-center">
              <p className="text-xs text-rose-400 font-semibold">
                ⚠ Chưa chọn nhân viên — hãy bấm nút thôi việc từ dòng nhân viên
                cụ thể
              </p>
            </div>
          )}

          {/* Form */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Lý do nghỉ việc <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={leavingReason}
                onChange={(e) => setLeavingReason(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none h-24 resize-none focus:border-rose-500/60 focus:ring-1 focus:ring-rose-500/20 transition-all placeholder:text-slate-600"
                placeholder="Tự nguyện xin nghỉ / Hết hợp đồng / Vi phạm nội quy..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Thông tin bàn giao
              </label>
              <textarea
                value={handoverInfo}
                onChange={(e) => setHandoverInfo(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white outline-none h-20 resize-none focus:border-slate-600 transition-all placeholder:text-slate-600"
                placeholder="Công cụ, chìa khóa, tài liệu cần bàn giao..."
              />
            </div>
          </div>

          {/* Warning box */}
          <div className="bg-rose-500/8 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle
              className="text-rose-500 shrink-0 mt-0.5"
              size={16}
            />
            <p className="text-[11px] text-rose-300 leading-relaxed">
              Hành động này sẽ đặt trạng thái nhân viên thành{" "}
              <strong>Đã nghỉ việc</strong> và vô hiệu hóa tài khoản đăng nhập.
              Dữ liệu hồ sơ vẫn được lưu lại.
            </p>
          </div>

          {/* Checkbox xác nhận */}
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                confirmed
                  ? "bg-rose-600 border-rose-600"
                  : "border-slate-600 group-hover:border-rose-500/60"
              }`}
              onClick={() => setConfirmed(!confirmed)}
            >
              <AnimatePresence>
                {confirmed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  >
                    <CheckCircle2 size={12} className="text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span
              className="text-xs text-slate-400 leading-relaxed"
              onClick={() => setConfirmed(!confirmed)}
            >
              Tôi xác nhận đã kiểm tra thông tin và đồng ý xử lý thôi việc cho
              nhân viên này
            </span>
          </label>

          {/* Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleResign}
              disabled={isSubmitting || !employee || !confirmed}
              className="py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all active:scale-95 text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isSubmitting ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <UserX size={15} />
              )}
              {isSubmitting ? "Đang xử lý..." : "Xác nhận thôi việc"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
