import { useState, useRef, useEffect, useMemo } from "react";
import {
  X,
  CheckCircle2,
  PenTool,
  RotateCcw,
  Eye,
  User,
  FileText,
  Briefcase,
  Banknote,
  ShieldCheck,
  Clock,
  ChevronRight,
  Phone,
  GraduationCap,
  Building2,
  Calendar,
  CreditCard,
  FileCheck,
  History,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES --- (khớp với Prisma schema)
interface WorkExperience {
  company: string;
  duration: string;
  position: string;
}

interface Employee {
  id: number;
  code: string;
  fullName: string;
  gender: string;
  dob?: string | null;
  pob?: string | null;
  nationality?: string | null;
  maritalStatus?: string | null;
  phone: string;
  emergencyPhone?: string | null;
  email?: string | null;
  permAddress?: string | null;
  tempAddress?: string | null;
  idNumber?: string | null;
  idIssueDate?: string | null;
  idIssuePlace?: string | null;
  taxCode?: string | null;
  socialInsCode?: string | null;
  socialInsBookNum?: string | null;
  startDate?: string | null;
  contractType?: string | null;
  contractDuration?: string | null;
  departmentId?: string | number | null;
  positionId?: string | number | null;
  shift?: string | null;
  education?: string | null;
  sewingLevel?: string | null;
  certificates?: string | null;
  workHistory?: string | null;
  healthStatus?: string | null;
  basicSalary?: string | number | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankBranch?: string | null;
  allowances?: string | null;
  specialNotes?: string | null;
  signature?: string | null;
  attachments?: string | null;
  status: "active" | "inactive" | "on_leave";
  department?: { name: string };
  position?: { name: string };
}

interface EmployeeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSignatureSuccess?: () => void;
}

// --- HELPERS ---
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (val: string | number | null | undefined): string => {
  if (!val && val !== 0) return "—";
  const num = Number(val);
  if (isNaN(num)) return "—";
  return num.toLocaleString("vi-VN") + " ₫";
};

// --- InfoRow ---
const InfoRow = ({
  label,
  value,
  mono = false,
  highlight = false,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  highlight?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <span
      className={`text-sm font-medium leading-snug break-words ${
        mono ? "font-mono tracking-wide" : ""
      } ${highlight ? "text-emerald-400 font-bold text-base" : "text-white"}`}
    >
      {value || <span className="text-slate-600 italic text-xs">Chưa có</span>}
    </span>
  </div>
);

// --- SIGNATURE CANVAS ---
const SignatureCanvas = ({
  onSigned,
  existingSignature,
  disabled = false,
}: {
  onSigned: (dataUrl: string) => void;
  existingSignature?: string;
  disabled?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(!!existingSignature);
  const [confirmed, setConfirmed] = useState(!!existingSignature);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#060d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (existingSignature) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = existingSignature;
    }
  }, [existingSignature]);

  const getPos = (
    e: React.MouseEvent | React.TouchEvent,
    canvas: HTMLCanvasElement,
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent).clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (confirmed || disabled) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvasRef.current!);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || confirmed || disabled) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasSigned(true);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#060d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setConfirmed(false);
  };

  const confirmSignature = () => {
    if (!hasSigned || confirmed) return;
    setConfirmed(true);
    onSigned(canvasRef.current!.toDataURL("image/png"));
  };

  return (
    <div className="space-y-3">
      <div
        className={`relative rounded-2xl overflow-hidden border-2 transition-colors ${
          confirmed
            ? "border-emerald-500/40"
            : hasSigned
              ? "border-blue-500/40"
              : "border-dashed border-slate-700"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className={`w-full h-[160px] block touch-none ${
            confirmed || disabled ? "cursor-default" : "cursor-crosshair"
          }`}
          style={{ background: "#060d1a" }}
        />
        {!hasSigned && !confirmed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center opacity-40">
              <PenTool size={24} className="text-slate-500 mx-auto mb-1.5" />
              <p className="text-slate-500 text-xs font-medium">
                Ký tên vào đây
              </p>
            </div>
          </div>
        )}
        {confirmed && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
            <CheckCircle2 size={10} />
            Đã xác nhận
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!confirmed && !disabled && (
          <button
            type="button"
            onClick={clearCanvas}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-semibold transition-all"
          >
            <RotateCcw size={12} />
            Xóa & ký lại
          </button>
        )}
        <button
          type="button"
          onClick={confirmSignature}
          disabled={!hasSigned || confirmed || disabled}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
            hasSigned && !confirmed && !disabled
              ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_16px_rgba(37,99,235,0.3)] active:scale-95"
              : confirmed
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                : "bg-slate-800 text-slate-600 cursor-not-allowed"
          }`}
        >
          <CheckCircle2 size={13} />
          {confirmed ? "Đã ký xác nhận" : "Xác nhận chữ ký"}
        </button>
      </div>
    </div>
  );
};

// --- SECTION COMPONENT ---
const Section = ({
  icon: Icon,
  title,
  color = "blue",
  children,
}: {
  icon: React.ElementType;
  title: string;
  color?: "blue" | "amber" | "violet" | "emerald" | "rose";
  children: React.ReactNode;
}) => {
  const colorMap = {
    blue: {
      text: "text-blue-400",
      border: "border-blue-500/30",
      bg: "bg-blue-500/10",
    },
    amber: {
      text: "text-amber-400",
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
    },
    violet: {
      text: "text-violet-400",
      border: "border-violet-500/30",
      bg: "bg-violet-500/10",
    },
    emerald: {
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
    },
    rose: {
      text: "text-rose-400",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
    },
  };
  const c = colorMap[color];

  return (
    <section>
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className={`w-7 h-7 rounded-lg ${c.bg} ${c.text} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={14} />
        </div>
        <h3
          className={`text-xs font-bold ${c.text} uppercase tracking-[0.15em] border-b ${c.border} pb-0.5 flex-1`}
        >
          {title}
        </h3>
      </div>
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
        {children}
      </div>
    </section>
  );
};

// --- MAIN MODAL ---
export const EmployeeProfileModal = ({
  isOpen,
  onClose,
  employee,
  onSignatureSuccess,
}: EmployeeProfileModalProps) => {
  const [activeSection, setActiveSection] = useState<
    "profile" | "documents" | "work" | "finance" | "signature"
  >("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(
    undefined,
  );

  const alreadySigned = useMemo(() => !!employee?.signature, [employee]);

  // ✅ FIX Rules of Hooks: useMemo phải đặt TRƯỚC early return
  const experiences = useMemo((): WorkExperience[] => {
    if (!employee?.workHistory) return [];
    try {
      const parsed = JSON.parse(employee.workHistory);
      if (Array.isArray(parsed)) return parsed.filter((e) => e.company);
    } catch {
      /* fallthrough */
    }
    return [];
  }, [employee?.workHistory]);

  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (isOpen) {
      setActiveSection("profile");
      setSignatureDataUrl(employee?.signature ?? undefined);
    }
  }, [isOpen, employee]);

  // ✅ FIX: Dùng đúng endpoint PATCH /signature thay vì PUT chung
  const handleSaveSignature = async () => {
    if (!signatureDataUrl || !employee) return;
    setIsSaving(true);
    try {
      const response = await fetch(
        `${apiUrl}/hr/employees/${employee.id}/signature`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ signature: signatureDataUrl }),
        },
      );
      if (response.ok) {
        alert("Chữ ký đã được lưu thành công!");
        onSignatureSuccess?.();
        onClose();
      } else {
        const result = await response.json();
        alert(result.message || "Có lỗi xảy ra khi lưu chữ ký.");
      }
    } catch {
      alert("Không kết nối được server. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !employee) return null;

  const navItems = [
    { key: "profile", label: "Cá nhân", icon: User },
    { key: "documents", label: "Giấy tờ", icon: FileText },
    { key: "work", label: "Công việc", icon: Briefcase },
    { key: "finance", label: "Lương & NH", icon: Banknote },
    {
      key: "signature",
      label: alreadySigned ? "Đã ký" : "Ký xác nhận",
      icon: alreadySigned ? ShieldCheck : PenTool,
    },
  ] as const;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="relative w-full max-w-4xl bg-[#060d1a] border border-slate-800/80 rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="relative px-7 py-6 border-b border-slate-800/60 bg-gradient-to-r from-blue-500/5 to-transparent">
          <div className="absolute top-0 left-0 w-40 h-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/30 to-blue-400/10 border border-blue-500/20 flex items-center justify-center text-blue-300 font-black text-xl shadow-inner">
                {employee.fullName.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-black text-white uppercase tracking-wide">
                    {employee.fullName}
                  </h2>
                  {alreadySigned && (
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <ShieldCheck size={9} />
                      Đã ký xác nhận
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-500 font-mono">
                    {employee.code}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-400">
                    {employee.position?.name || "—"}
                  </span>
                  <span className="text-slate-700">·</span>
                  <span className="text-xs text-slate-400">
                    {employee.department?.name || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Clock size={11} />
                Tham gia: {formatDate(employee.startDate)}
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* NAV PILLS */}
          <div className="relative flex gap-1 mt-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5 w-fit">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeSection === key
                    ? key === "signature" && !alreadySigned
                      ? "bg-blue-600 text-white shadow-[0_0_16px_rgba(37,99,235,0.4)]"
                      : "bg-slate-800 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={12} />
                {label}
                {key === "signature" && !alreadySigned && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
          <AnimatePresence mode="wait">
            {/* ---- PROFILE ---- */}
            {activeSection === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-5"
              >
                <Section icon={User} title="Thông tin định danh" color="blue">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow label="Mã nhân viên" value={employee.code} mono />
                    <InfoRow label="Họ và tên" value={employee.fullName} />
                    <InfoRow label="Giới tính" value={employee.gender} />
                    <InfoRow
                      label="Ngày sinh"
                      value={formatDate(employee.dob)}
                    />
                    <InfoRow label="Nơi sinh" value={employee.pob} />
                    <InfoRow label="Quốc tịch" value={employee.nationality} />
                    <InfoRow label="Hôn nhân" value={employee.maritalStatus} />
                    <InfoRow
                      label="Tình trạng sức khỏe"
                      value={employee.healthStatus}
                    />
                  </div>
                </Section>

                <Section icon={Phone} title="Thông tin liên lạc" color="blue">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow label="Số điện thoại" value={employee.phone} />
                    <InfoRow
                      label="SĐT khẩn cấp (người thân)"
                      value={employee.emergencyPhone}
                    />
                    {/* ✅ FIX: Email luôn hiển thị */}
                    <InfoRow label="Email" value={employee.email} />
                    <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InfoRow
                        label="Địa chỉ thường trú"
                        value={employee.permAddress}
                      />
                      <InfoRow
                        label="Địa chỉ tạm trú"
                        value={employee.tempAddress}
                      />
                    </div>
                  </div>
                </Section>

                {/* Ghi chú đặc biệt */}
                {employee.specialNotes && (
                  <Section
                    icon={FileText}
                    title="Ghi chú đặc biệt"
                    color="rose"
                  >
                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {employee.specialNotes}
                    </p>
                  </Section>
                )}
              </motion.div>
            )}

            {/* ---- DOCUMENTS ---- */}
            {activeSection === "documents" && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-5"
              >
                <Section
                  icon={CreditCard}
                  title="Căn cước công dân / CMND"
                  color="amber"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Số CCCD / CMND"
                      value={employee.idNumber}
                      mono
                    />
                    <InfoRow
                      label="Ngày cấp"
                      value={formatDate(employee.idIssueDate)}
                    />
                    <InfoRow label="Nơi cấp" value={employee.idIssuePlace} />
                  </div>
                </Section>

                {/* ✅ FIX: Hiển thị đủ 3 ô thuế & bảo hiểm */}
                <Section
                  icon={FileCheck}
                  title="Thuế & Bảo hiểm xã hội"
                  color="amber"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Mã số thuế cá nhân"
                      value={employee.taxCode}
                      mono
                    />
                    <InfoRow
                      label="Mã số BHXH"
                      value={employee.socialInsCode}
                      mono
                    />
                    <InfoRow
                      label="Số sổ BHXH"
                      value={employee.socialInsBookNum}
                      mono
                    />
                  </div>
                </Section>
                {/* Hồ sơ đính kèm */}
                {(() => {
                  try {
                    const files = employee.attachments
                      ? JSON.parse(employee.attachments)
                      : [];
                    if (!Array.isArray(files) || files.length === 0)
                      return null;
                    return (
                      <Section
                        icon={FileText}
                        title="Hồ sơ đính kèm"
                        color="blue"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {files.map(
                            (
                              f: {
                                name: string;
                                size: number;
                                type: string;
                                url: string;
                              },
                              i: number,
                            ) => (
                              <a
                                key={i}
                                href={f.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col bg-slate-800/60 border border-slate-700 hover:border-blue-500/50 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-blue-500/10"
                              >
                                {/* Preview area */}
                                {f.type.startsWith("image/") ? (
                                  <div className="w-full h-40 bg-slate-900 overflow-hidden">
                                    <img
                                      src={f.url}
                                      alt={f.name}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-40 bg-slate-900 flex flex-col items-center justify-center gap-2">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                                      <FileText size={28} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                      {f.name.split(".").pop()?.toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                {/* File info */}
                                <div className="p-3">
                                  <p className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                                    {f.name}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {f.size < 1024 * 1024
                                      ? `${(f.size / 1024).toFixed(0)} KB`
                                      : `${(f.size / (1024 * 1024)).toFixed(1)} MB`}
                                    {" · "}
                                    <span className="text-blue-400">
                                      Nhấn để xem
                                    </span>
                                  </p>
                                </div>
                              </a>
                            ),
                          )}
                        </div>
                      </Section>
                    );
                  } catch {
                    return null;
                  }
                })()}
              </motion.div>
            )}

            {/* ---- WORK ---- */}
            {activeSection === "work" && (
              <motion.div
                key="work"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-5"
              >
                <Section
                  icon={Building2}
                  title="Phòng ban & Chức danh"
                  color="violet"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Phòng ban"
                      value={employee.department?.name}
                    />
                    <InfoRow
                      label="Chức danh / Vị trí"
                      value={employee.position?.name}
                    />
                    <InfoRow label="Ca làm việc" value={employee.shift} />
                  </div>
                </Section>

                <Section
                  icon={Calendar}
                  title="Hợp đồng lao động"
                  color="violet"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Ngày bắt đầu làm việc"
                      value={formatDate(employee.startDate)}
                    />
                    <InfoRow
                      label="Loại hợp đồng"
                      value={employee.contractType}
                    />
                    {/* ✅ FIX: Thời hạn HĐ luôn hiển thị */}
                    <InfoRow
                      label="Thời hạn hợp đồng"
                      value={employee.contractDuration}
                    />
                  </div>
                </Section>

                <Section
                  icon={GraduationCap}
                  title="Trình độ & Chuyên môn"
                  color="violet"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Trình độ học vấn cao nhất"
                      value={employee.education}
                    />
                    <InfoRow label="Bậc thợ may" value={employee.sewingLevel} />
                    <div className="col-span-2 md:col-span-3">
                      <InfoRow
                        label="Chứng chỉ & bằng cấp liên quan"
                        value={employee.certificates}
                      />
                    </div>
                  </div>
                </Section>

                {/* ✅ FIX: Kinh nghiệm làm việc hiển thị đầy đủ */}
                {experiences.length > 0 && (
                  <Section
                    icon={History}
                    title="Kinh nghiệm làm việc"
                    color="emerald"
                  >
                    <div className="space-y-3">
                      {experiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="relative grid grid-cols-3 gap-5 py-4 px-1 border-b border-slate-800/60 last:border-0 last:pb-0"
                        >
                          {experiences.length > 1 && (
                            <div className="absolute -top-2 left-0 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              #{idx + 1}
                            </div>
                          )}
                          <InfoRow label="Công ty cũ" value={exp.company} />
                          <InfoRow
                            label="Thời gian làm việc"
                            value={exp.duration}
                          />
                          <InfoRow
                            label="Vị trí đảm nhiệm"
                            value={exp.position}
                          />
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {experiences.length === 0 && (
                  <Section
                    icon={Briefcase}
                    title="Kinh nghiệm làm việc"
                    color="emerald"
                  >
                    <p className="text-sm text-slate-600 italic">
                      Chưa có kinh nghiệm làm việc trước đó.
                    </p>
                  </Section>
                )}
              </motion.div>
            )}

            {/* ---- FINANCE ---- */}
            {activeSection === "finance" && (
              <motion.div
                key="finance"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-5"
              >
                <Section
                  icon={Banknote}
                  title="Lương & Phụ cấp"
                  color="emerald"
                >
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <InfoRow
                      label="Mức lương cơ bản"
                      value={formatCurrency(employee.basicSalary)}
                      highlight={!!employee.basicSalary}
                    />
                    {/* ✅ FIX: Phụ cấp luôn hiển thị */}
                    <div className="col-span-2">
                      <InfoRow
                        label="Danh sách phụ cấp"
                        value={employee.allowances}
                      />
                    </div>
                  </div>
                </Section>

                <Section
                  icon={CreditCard}
                  title="Tài khoản ngân hàng"
                  color="emerald"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4">
                    <InfoRow label="Tên ngân hàng" value={employee.bankName} />
                    <InfoRow
                      label="Số tài khoản"
                      value={employee.bankAccountNumber}
                      mono
                    />
                    <InfoRow label="Chi nhánh" value={employee.bankBranch} />
                  </div>
                </Section>
              </motion.div>
            )}

            {/* ---- SIGNATURE ---- */}
            {activeSection === "signature" && (
              <motion.div
                key="signature"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className="space-y-5"
              >
                {/* Banner */}
                <div
                  className={`flex items-start gap-4 p-5 rounded-2xl border ${
                    alreadySigned
                      ? "bg-emerald-500/5 border-emerald-500/20"
                      : "bg-blue-500/5 border-blue-500/20"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      alreadySigned
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {alreadySigned ? (
                      <ShieldCheck size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">
                      {alreadySigned
                        ? "Hồ sơ đã được ký xác nhận"
                        : "Xác nhận & ký hồ sơ điện tử"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {alreadySigned
                        ? "Bạn đã ký xác nhận hồ sơ này rồi. Nếu có sai sót, hãy liên hệ phòng nhân sự để ký lại."
                        : `Bằng việc ký tên bên dưới, ${employee.fullName} xác nhận rằng tất cả thông tin trong hồ sơ là chính xác. Ngày ký: ${new Date().toLocaleDateString("vi-VN")}.`}
                    </p>
                  </div>
                </div>

                {/* Tóm tắt thông tin nhanh */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Mã NV", value: employee.code },
                    { label: "Phòng ban", value: employee.department?.name },
                    { label: "Chức danh", value: employee.position?.name },
                    {
                      label: "Ngày bắt đầu",
                      value: formatDate(employee.startDate),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3"
                    >
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p className="text-sm text-white font-semibold truncate">
                        {value || "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Canvas ký */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Chữ ký điện tử
                  </p>
                  <SignatureCanvas
                    onSigned={(dataUrl) => setSignatureDataUrl(dataUrl)}
                    existingSignature={employee.signature ?? undefined}
                    disabled={alreadySigned}
                  />
                </div>

                {/* Nút lưu chữ ký */}
                {!alreadySigned && (
                  <button
                    type="button"
                    onClick={handleSaveSignature}
                    disabled={!signatureDataUrl || isSaving}
                    className={`w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all ${
                      signatureDataUrl && !isSaving
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_24px_rgba(37,99,235,0.3)] active:scale-[0.99]"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang lưu chữ ký...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        Lưu xác nhận hồ sơ
                      </>
                    )}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FOOTER NAV */}
        <div className="px-7 py-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-900/20">
          <button
            onClick={() => {
              const keys = navItems.map((n) => n.key) as string[];
              const idx = keys.indexOf(activeSection);
              if (idx > 0)
                setActiveSection(keys[idx - 1] as typeof activeSection);
            }}
            disabled={activeSection === "profile"}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 disabled:opacity-30 transition-all"
          >
            Trang trước
          </button>

          <div className="flex gap-1.5">
            {navItems.map(({ key }) => (
              <div
                key={key}
                className={`h-1.5 rounded-full transition-all ${
                  activeSection === key
                    ? "w-5 bg-blue-500"
                    : "w-1.5 bg-slate-700"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              const keys = navItems.map((n) => n.key) as string[];
              const idx = keys.indexOf(activeSection);
              if (idx < keys.length - 1)
                setActiveSection(keys[idx + 1] as typeof activeSection);
            }}
            disabled={activeSection === "signature"}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 transition-all"
          >
            Trang sau
            <ChevronRight size={13} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
