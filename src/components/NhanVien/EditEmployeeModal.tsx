import { useState, useRef, useEffect } from "react";
import {
  X,
  Save,
  AlertCircle,
  Upload,
  File,
  Trash2,
  ChevronDown,
  UserCog,
  RefreshCw,
  ShieldCheck,
  Clock,
  Plus,
  PenTool,
  CheckCircle2,
  Eye,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- TYPES ---
interface HRItem {
  id: number;
  name: string;
}

interface WorkExperience {
  company: string;
  duration: string;
  position: string;
}

// Employee interface khớp với Prisma schema
interface Employee {
  id: number;
  code: string;
  fullName: string;
  gender: string;
  dob: string;
  pob: string;
  nationality: string;
  maritalStatus: string;
  phone: string;
  emergencyPhone: string;
  email?: string | null;
  permAddress: string;
  tempAddress: string;
  idNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  taxCode?: string | null;
  socialInsCode?: string | null;
  socialInsBookNum?: string | null;
  startDate: string;
  contractType: string;
  contractDuration?: string | null;
  departmentId: string;
  positionId: string;
  shift: string;
  education: string;
  sewingLevel?: string | null;
  certificates?: string | null;
  // workHistory: JSON string lưu kinh nghiệm (đúng field DB)
  workHistory?: string | null;
  // attachments: JSON string lưu file đính kèm
  attachments?: string | null;
  healthStatus?: string | null;
  basicSalary: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranch: string;
  allowances?: string | null;
  specialNotes?: string | null;
  // signature: Base64 chữ ký (đúng field DB)
  signature?: string | null;
  status?: "active" | "inactive" | "on_leave";
  // Quan hệ
  department?: { name: string };
  position?: { name: string };
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  departments: HRItem[];
  positions: HRItem[];
  onSaveSuccess: () => void;
}

// --- HELPERS ---
const formatDateForInput = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const formatDateDisplay = (dateStr: string | null | undefined): string => {
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

type EmployeeStatus = "active" | "inactive" | "on_leave";

const sanitizeEmployee = (emp: Employee) => ({
  code: emp.code ?? "",
  fullName: emp.fullName ?? "",
  gender: emp.gender ?? "Nam",
  dob: formatDateForInput(emp.dob),
  pob: emp.pob ?? "",
  nationality: emp.nationality ?? "Việt Nam",
  maritalStatus: emp.maritalStatus ?? "Độc thân",
  phone: emp.phone ?? "",
  emergencyPhone: emp.emergencyPhone ?? "",
  email: emp.email ?? "", // nullable OK
  permAddress: emp.permAddress ?? "",
  tempAddress: emp.tempAddress ?? "",
  idNumber: emp.idNumber ?? "",
  idIssueDate: formatDateForInput(emp.idIssueDate),
  idIssuePlace: emp.idIssuePlace ?? "",
  taxCode: emp.taxCode ?? "",
  socialInsCode: emp.socialInsCode ?? "",
  socialInsBookNum: emp.socialInsBookNum ?? "",
  startDate: formatDateForInput(emp.startDate),
  contractType: emp.contractType ?? "Thử việc",
  contractDuration: emp.contractDuration ?? "", // nullable OK
  departmentId: emp.departmentId ? String(emp.departmentId) : "",
  positionId: emp.positionId ? String(emp.positionId) : "",
  shift: emp.shift ?? "Hành chính",
  education: emp.education ?? "",
  sewingLevel: emp.sewingLevel ?? "",
  certificates: emp.certificates ?? "",
  healthStatus: emp.healthStatus ?? "",
  basicSalary: emp.basicSalary ? String(emp.basicSalary) : "",
  bankName: emp.bankName ?? "",
  bankAccountNumber: emp.bankAccountNumber ?? "",
  bankBranch: emp.bankBranch ?? "",
  allowances: emp.allowances ?? "",
  specialNotes: emp.specialNotes ?? "",
  // status dùng EmployeeStatus type rõ ràng — tránh lỗi TypeScript khi setFormData
  status: (emp.status ?? "active") as EmployeeStatus,
});

// Normalize experiences từ workHistory (JSON string field DB)
const normalizeExperiences = (emp: Employee): WorkExperience[] => {
  // Ưu tiên workHistory (field đúng trong DB)
  if (emp.workHistory) {
    try {
      const parsed = JSON.parse(emp.workHistory);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      /* fallthrough */
    }
  }
  return [{ company: "", duration: "", position: "" }];
};

// --- SHARED STYLED COMPONENTS ---
const labelClass =
  "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

const inputClass =
  "w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 outline-none transition-all hover:border-slate-600";

const selectClass =
  "w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all hover:border-slate-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/40 appearance-none cursor-pointer";

const sectionTitleAmber =
  "text-sm font-bold text-amber-400 uppercase tracking-[0.15em] border-l-[3px] border-amber-500 pl-3 mb-5";
const sectionTitleBlue =
  "text-sm font-bold text-blue-400 uppercase tracking-[0.15em] border-l-[3px] border-blue-500 pl-3 mb-5";
const sectionTitleViolet =
  "text-sm font-bold text-violet-400 uppercase tracking-[0.15em] border-l-[3px] border-violet-500 pl-3 mb-5";
const sectionTitleEmerald =
  "text-sm font-bold text-emerald-400 uppercase tracking-[0.15em] border-l-[3px] border-emerald-500 pl-3 mb-5";

// --- Status Config ---
const statusConfig = {
  active: {
    label: "Đang làm việc",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  inactive: {
    label: "Đã nghỉ việc",
    color: "text-red-400 bg-red-500/10 border-red-500/30",
  },
  on_leave: {
    label: "Đang nghỉ phép",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
};

// --- Custom Select ---
const StyledSelect = ({
  name,
  value,
  onChange,
  children,
}: {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) => (
  <div className="relative">
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={selectClass}
    >
      {children}
    </select>
    <ChevronDown
      size={15}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
    />
  </div>
);

// --- Checkbox "Chưa có" ---
const NotAvailableCheckbox = ({
  checked,
  onChange,
  label = "Chưa có",
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) => (
  <label className="flex items-center gap-1.5 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 accent-amber-500 rounded"
    />
    <span className="text-[11px] text-slate-500 font-semibold">{label}</span>
  </label>
);

// --- InfoRow: dùng trong tab xem hồ sơ ---
const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-sm text-white font-medium">
      {value || <span className="text-slate-600 italic">Chưa có</span>}
    </span>
  </div>
);

// --- File Upload Zone (state được lift ra ngoài) ---
const FileUploadZone = ({
  files,
  onFilesChange,
}: {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (rawFiles: FileList | null) => {
    if (!rawFiles) return;
    const fileList = Array.from(rawFiles);
    const promises = fileList.map(
      (f) =>
        new Promise<UploadedFile>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) =>
            resolve({
              name: f.name,
              size: f.size,
              type: f.type,
              url: e.target?.result as string,
            });
          reader.readAsDataURL(f);
        }),
    );
    Promise.all(promises).then((newFiles) =>
      onFilesChange([...files, ...newFiles]),
    );
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group
          ${
            isDragging
              ? "border-amber-500 bg-amber-500/10 scale-[0.995]"
              : "border-slate-700 hover:border-amber-500/60 hover:bg-slate-900/60 bg-slate-900/20"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => processFiles(e.target.files)}
        />
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all
          ${isDragging ? "bg-amber-500/20 text-amber-400" : "bg-slate-800 text-slate-500 group-hover:bg-amber-500/10 group-hover:text-amber-400"}`}
        >
          <Upload size={22} />
        </div>
        <p className="text-slate-300 font-semibold text-sm">
          {isDragging
            ? "Thả file vào đây..."
            : "Kéo thả hoặc nhấn để chọn file"}
        </p>
        <p className="text-slate-600 text-xs mt-1">
          JPG, PNG, PDF — tối đa 20MB mỗi file
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence>
            {files.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3"
              >
                {f.type.startsWith("image/") && f.url.startsWith("data:") ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <File size={15} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-slate-500">{formatSize(f.size)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilesChange(files.filter((_, idx) => idx !== i));
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// ============================================================
// --- SIGNATURE CANVAS COMPONENT ---
// ============================================================
const SignatureCanvas = ({
  onSigned,
  existingSignature,
}: {
  onSigned: (dataUrl: string) => void;
  existingSignature?: string;
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
    ctx.fillStyle = "#0d1117";
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
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (confirmed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || confirmed) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !lastPos.current) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#60a5fa";
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
    ctx.fillStyle = "#0d1117";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
    setConfirmed(false);
  };

  const confirmSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSigned) return;
    setConfirmed(true);
    onSigned(canvas.toDataURL("image/png"));
  };

  return (
    <div className="space-y-4">
      <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-700 group">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          className={`w-full h-[180px] block touch-none ${confirmed ? "cursor-default" : "cursor-crosshair"}`}
          style={{ background: "#0d1117" }}
        />
        {/* Watermark hướng dẫn khi chưa ký */}
        {!hasSigned && !confirmed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <PenTool size={28} className="text-slate-700 mx-auto mb-2" />
              <p className="text-slate-700 text-sm font-medium">
                Ký tên vào đây
              </p>
            </div>
          </div>
        )}
        {/* Badge đã xác nhận */}
        {confirmed && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
            <CheckCircle2 size={12} />
            Đã xác nhận
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={clearCanvas}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 text-sm font-semibold transition-all"
        >
          <RotateCcw size={14} />
          Xóa & ký lại
        </button>
        <button
          type="button"
          onClick={confirmSignature}
          disabled={!hasSigned || confirmed}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all
            ${
              hasSigned && !confirmed
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.25)] active:scale-95"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
        >
          <CheckCircle2 size={15} />
          {confirmed ? "Đã ký xác nhận" : "Xác nhận chữ ký"}
        </button>
      </div>
    </div>
  );
};

// ============================================================
// --- TAB 5: XEM HỒ SƠ & KÝ XÁC NHẬN ---
// ============================================================
const EmployeeViewAndSignTab = ({
  employee,
  formData,
  experiences,
  departments,
  positions,
  onSignatureConfirmed,
}: {
  employee: Employee;
  formData: ReturnType<typeof sanitizeEmployee>;
  experiences: WorkExperience[];
  departments: HRItem[];
  positions: HRItem[];
  onSignatureConfirmed: (dataUrl: string) => void;
}) => {
  const [signatureSaved, setSignatureSaved] = useState<boolean>(
    !!employee.signature, // true nếu đã có chữ ký trong DB
  );

  const deptName =
    departments.find((d) => String(d.id) === formData.departmentId)?.name ||
    "—";
  const posName =
    positions.find((p) => String(p.id) === formData.positionId)?.name || "—";

  const handleSigned = (dataUrl: string) => {
    setSignatureSaved(true);
    onSignatureConfirmed(dataUrl);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner thông tin */}
      <div className="bg-gradient-to-r from-blue-500/10 to-violet-500/5 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
          <Eye size={18} />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            Xem & Xác nhận hồ sơ
          </p>
          <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">
            Đây là toàn bộ thông tin hồ sơ của bạn. Vui lòng đọc kỹ và ký xác
            nhận ở cuối trang. Chữ ký sẽ được lưu vào hệ thống và không thể
            chỉnh sửa sau khi xác nhận.
          </p>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <section>
        <h3 className={sectionTitleBlue}>Thông tin cá nhân</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
          <InfoRow label="Mã nhân viên" value={formData.code} />
          <InfoRow label="Họ và tên" value={formData.fullName} />
          <InfoRow label="Giới tính" value={formData.gender} />
          <InfoRow label="Ngày sinh" value={formatDateDisplay(formData.dob)} />
          <InfoRow label="Nơi sinh" value={formData.pob} />
          <InfoRow label="Quốc tịch" value={formData.nationality} />
          <InfoRow label="Hôn nhân" value={formData.maritalStatus} />
          <InfoRow label="Số điện thoại" value={formData.phone} />
          <InfoRow label="Email" value={formData.email} />
          <div className="col-span-2 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-5">
            <InfoRow label="Địa chỉ thường trú" value={formData.permAddress} />
            <InfoRow label="Địa chỉ tạm trú" value={formData.tempAddress} />
          </div>
        </div>
      </section>

      {/* Giấy tờ */}
      <section>
        <h3 className={sectionTitleAmber}>Giấy tờ & Bảo hiểm</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
          <InfoRow label="Số CCCD / CMND" value={formData.idNumber} />
          <InfoRow
            label="Ngày cấp CCCD"
            value={formatDateDisplay(formData.idIssueDate)}
          />
          <InfoRow label="Nơi cấp CCCD" value={formData.idIssuePlace} />
          <InfoRow label="Mã số thuế" value={formData.taxCode} />
          <InfoRow label="Mã số BHXH" value={formData.socialInsCode} />
          <InfoRow label="Số sổ BHXH" value={formData.socialInsBookNum} />
        </div>
      </section>

      {/* Hợp đồng & Công việc */}
      <section>
        <h3 className={sectionTitleViolet}>Hợp đồng & Công việc</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
          <InfoRow
            label="Ngày bắt đầu"
            value={formatDateDisplay(formData.startDate)}
          />
          <InfoRow label="Phòng ban" value={deptName} />
          <InfoRow label="Chức danh" value={posName} />
          <InfoRow label="Loại hợp đồng" value={formData.contractType} />
          <InfoRow label="Thời hạn HĐ" value={formData.contractDuration} />
          <InfoRow label="Ca làm việc" value={formData.shift} />
          <InfoRow label="Trình độ học vấn" value={formData.education} />
          <InfoRow label="Bậc thợ may" value={formData.sewingLevel} />
          <InfoRow label="Chứng chỉ" value={formData.certificates} />
        </div>
      </section>

      {/* Kinh nghiệm */}
      {experiences.some((e) => e.company) && (
        <section>
          <h3 className={sectionTitleEmerald}>Kinh nghiệm làm việc</h3>
          <div className="space-y-3">
            {experiences
              .filter((e) => e.company)
              .map((exp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-3 gap-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-5"
                >
                  <InfoRow label="Công ty cũ" value={exp.company} />
                  <InfoRow label="Thời gian" value={exp.duration} />
                  <InfoRow label="Vị trí" value={exp.position} />
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Lương */}
      <section>
        <h3 className={sectionTitleEmerald}>Lương & Ngân hàng</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 bg-slate-900/30 border border-slate-800 rounded-2xl p-5">
          <InfoRow
            label="Lương cơ bản"
            value={
              formData.basicSalary
                ? Number(formData.basicSalary).toLocaleString("vi-VN") + " ₫"
                : undefined
            }
          />
          <InfoRow label="Phụ cấp" value={formData.allowances} />
          <InfoRow label="Ngân hàng" value={formData.bankName} />
          <InfoRow label="Số tài khoản" value={formData.bankAccountNumber} />
          <InfoRow label="Chi nhánh" value={formData.bankBranch} />
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-slate-800" />

      {/* Chữ ký điện tử */}
      <section>
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-[0.15em] border-l-[3px] border-blue-500 pl-3">
            Chữ ký xác nhận điện tử
          </h3>
          {signatureSaved && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-xs font-semibold">
              <CheckCircle2 size={12} />
              "Đã ký xác nhận"
            </div>
          )}
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Bằng việc ký tên bên dưới, tôi —{" "}
            <span className="text-slate-300 font-semibold">
              {formData.fullName || "Nhân viên"}
            </span>{" "}
            — xác nhận rằng tất cả thông tin trong hồ sơ này là chính xác và
            đúng sự thật. Ngày ký:{" "}
            <span className="text-slate-300">
              {new Date().toLocaleDateString("vi-VN")}
            </span>
          </p>

          <SignatureCanvas
            onSigned={handleSigned}
            existingSignature={employee.signature ?? undefined}
          />
        </div>
      </section>
    </div>
  );
};

// ============================================================
// --- MAIN MODAL ---
// ============================================================
export const EditEmployeeModal = ({
  isOpen,
  onClose,
  employee,
  departments,
  positions,
  onSaveSuccess,
}: EditEmployeeModalProps) => {
  const [activeTab, setActiveTab] = useState(1);
  const [noSSBook, setNoSSBook] = useState(false);
  const [noSewingLevel, setNoSewingLevel] = useState(false);
  const [noExperience, setNoExperience] = useState(false);
  const [noTaxCode, setNoTaxCode] = useState(false);
  const [noSocialInsCode, setNoSocialInsCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | undefined>(
    undefined,
  );

  // Files lifted lên đây để không mất khi đổi tab
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // Multi-experience
  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { company: "", duration: "", position: "" },
  ]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const [formData, setFormData] = useState(
    sanitizeEmployee(employee ?? ({} as Employee)),
  );

  // Pre-fill form khi employee thay đổi
  useEffect(() => {
    if (employee) {
      setFormData(sanitizeEmployee(employee));
      setNoSSBook(!employee.socialInsBookNum);
      setNoSewingLevel(!employee.sewingLevel);
      // Dùng workHistory (field DB) để check "không có kinh nghiệm"
      setNoExperience(!employee.workHistory);
      setNoTaxCode(!employee.taxCode);
      setNoSocialInsCode(!employee.socialInsCode);
      setExperiences(normalizeExperiences(employee));
      // "signature" là field DB đúng — không phải signatureDataUrl
      setSignatureDataUrl(employee.signature ?? undefined);
      // Parse attachments từ JSON string
      try {
        const parsed = employee.attachments
          ? JSON.parse(employee.attachments)
          : [];
        setUploadedFiles(Array.isArray(parsed) ? parsed : []);
      } catch {
        setUploadedFiles([]);
      }
      setHasChanges(false);
      setActiveTab(1);
    }
  }, [employee]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setHasChanges(true);
  };

  // Kinh nghiệm helpers
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", duration: "", position: "" },
    ]);
    setHasChanges(true);
  };
  const removeExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
    setHasChanges(true);
  };
  const updateExperience = (
    idx: number,
    field: keyof WorkExperience,
    value: string,
  ) => {
    setExperiences(
      experiences.map((exp, i) =>
        i === idx ? { ...exp, [field]: value } : exp,
      ),
    );
    setHasChanges(true);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng kiểm tra lại Họ tên và Số điện thoại trước khi lưu.");
      return;
    }

    // Payload đúng theo Prisma schema
    const payload = {
      ...formData,
      // Int fields
      departmentId: formData.departmentId
        ? Number(formData.departmentId)
        : null,
      positionId: formData.positionId ? Number(formData.positionId) : null,
      // Float field
      basicSalary: formData.basicSalary ? Number(formData.basicSalary) : null,
      // DateTime fields — gửi null nếu rỗng
      dob: formData.dob || null,
      idIssueDate: formData.idIssueDate || null,
      startDate: formData.startDate || null,
      // Nullable String fields
      contractDuration: formData.contractDuration || null,
      emergencyPhone: formData.emergencyPhone || null,
      email: formData.email || null,
      healthStatus: formData.healthStatus || null,
      specialNotes: formData.specialNotes || null,
      // Nullable fields có checkbox
      taxCode: noTaxCode ? null : formData.taxCode || null,
      socialInsCode: noSocialInsCode ? null : formData.socialInsCode || null,
      socialInsBookNum: noSSBook ? null : formData.socialInsBookNum || null,
      sewingLevel: noSewingLevel ? null : formData.sewingLevel || null,
      // workHistory: JSON string — đúng tên field DB
      workHistory: noExperience ? null : JSON.stringify(experiences),
      // signature: Base64 chữ ký — đúng tên field DB (không phải signatureDataUrl)
      signature: signatureDataUrl || null,
      // image
      attachments:
        uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles) : null,
    };

    setIsSubmitting(true);
    try {
      const response = await fetch(`${apiUrl}/hr/employees/${employee?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Đã cập nhật hồ sơ nhân viên thành công.");
        onSaveSuccess();
        onClose();
      } else {
        const msg = Array.isArray(result.message)
          ? result.message.join("\n")
          : result.message || "Có lỗi xảy ra khi cập nhật.";
        alert(`Lỗi từ server:\n${msg}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không kết nối được Backend, kiểm tra lại server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !employee) return null;

  const tabs = [
    "1. Hồ sơ cá nhân",
    "2. Giấy tờ & Bảo hiểm",
    "3. Công việc & Kỹ năng",
    "4. Tài chính & Trạng thái",
    "5. Xem & Ký xác nhận",
  ];

  const currentStatus = formData.status as keyof typeof statusConfig;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="relative w-full max-w-5xl bg-[#0d1117] border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[93vh] overflow-hidden text-slate-200"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <UserCog size={20} />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-white">
                  Chỉnh sửa hồ sơ nhân viên
                </h2>
                {currentStatus && statusConfig[currentStatus] && (
                  <span
                    className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${statusConfig[currentStatus].color}`}
                  >
                    {statusConfig[currentStatus].label}
                  </span>
                )}
                <AnimatePresence>
                  {hasChanges && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
                      Chưa lưu
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                <span className="font-mono text-slate-400">
                  {employee.code}
                </span>
                <span className="mx-2 text-slate-700">·</span>
                Mã nhân viên không thể thay đổi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex px-6 bg-slate-900/40 border-b border-slate-800 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i + 1)}
              className={`py-4 px-5 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border-b-2 ${
                activeTab === i + 1
                  ? i === 4
                    ? "border-blue-500 text-blue-400"
                    : "border-amber-500 text-amber-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              } ${i === 4 ? "ml-auto" : ""}`}
            >
              {i === 4 ? (
                <span className="flex items-center gap-1.5">
                  <Eye size={12} />
                  {tab}
                  {employee.signature && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  )}
                </span>
              ) : (
                tab
              )}
            </button>
          ))}
        </div>

        {/* FORM CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* ===== TAB 1: HỒ SƠ CÁ NHÂN ===== */}
          {activeTab === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h3 className={sectionTitleAmber}>Thông tin định danh</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Mã nhân viên</label>
                    <input
                      name="code"
                      value={formData.code}
                      readOnly
                      className={`${inputClass} font-mono opacity-50 cursor-not-allowed`}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Họ và tên đầy đủ (theo CCCD)
                    </label>
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`${inputClass} uppercase font-semibold`}
                      placeholder="NGUYỄN VĂN A"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Giới tính</label>
                    <StyledSelect
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option>Nam</option>
                      <option>Nữ</option>
                    </StyledSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Ngày tháng năm sinh</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nơi sinh</label>
                    <input
                      name="pob"
                      value={formData.pob}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Tỉnh / Thành phố..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Tình trạng hôn nhân</label>
                    <StyledSelect
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleChange}
                    >
                      <option>Độc thân</option>
                      <option>Kết hôn</option>
                    </StyledSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Tình trạng sức khỏe</label>
                    <input
                      name="healthStatus"
                      value={formData.healthStatus}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Tốt / Bình thường..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className={sectionTitleBlue}>Thông tin liên lạc</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Số điện thoại</label>
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`${inputClass} text-blue-400 font-semibold`}
                      placeholder="090..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>
                      SĐT khẩn cấp (người thân)
                    </label>
                    <input
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="091..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="email@..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Địa chỉ thường trú</label>
                    <textarea
                      name="permAddress"
                      value={formData.permAddress}
                      onChange={handleChange}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder="Địa chỉ theo sổ hộ khẩu..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Địa chỉ tạm trú</label>
                    <textarea
                      name="tempAddress"
                      value={formData.tempAddress}
                      onChange={handleChange}
                      className={`${inputClass} h-20 resize-none`}
                      placeholder="Nơi ở hiện tại..."
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* ===== TAB 2: GIẤY TỜ & BẢO HIỂM ===== */}
          {activeTab === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h3 className={sectionTitleAmber}>Căn cước công dân / CMND</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Số CCCD / CMND</label>
                    <input
                      name="idNumber"
                      value={formData.idNumber}
                      onChange={handleChange}
                      className={`${inputClass} font-mono tracking-wider`}
                      placeholder="012345678901"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ngày cấp</label>
                    <input
                      type="date"
                      name="idIssueDate"
                      value={formData.idIssueDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Nơi cấp</label>
                    <input
                      name="idIssuePlace"
                      value={formData.idIssuePlace}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Cục CS QLHC..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className={sectionTitleBlue}>Thuế & Bảo hiểm xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Mã số thuế cá nhân
                      </label>
                      <NotAvailableCheckbox
                        checked={noTaxCode}
                        onChange={() => {
                          setNoTaxCode(!noTaxCode);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <input
                      name="taxCode"
                      disabled={noTaxCode}
                      value={noTaxCode ? "" : formData.taxCode}
                      onChange={handleChange}
                      className={`${inputClass} font-mono disabled:opacity-30 disabled:cursor-not-allowed`}
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Mã số BHXH
                      </label>
                      <NotAvailableCheckbox
                        checked={noSocialInsCode}
                        onChange={() => {
                          setNoSocialInsCode(!noSocialInsCode);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <input
                      name="socialInsCode"
                      disabled={noSocialInsCode}
                      value={noSocialInsCode ? "" : formData.socialInsCode}
                      onChange={handleChange}
                      className={`${inputClass} font-mono disabled:opacity-30 disabled:cursor-not-allowed`}
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Số sổ BHXH
                      </label>
                      <NotAvailableCheckbox
                        checked={noSSBook}
                        onChange={() => {
                          setNoSSBook(!noSSBook);
                          setHasChanges(true);
                        }}
                      />
                    </div>
                    <input
                      name="socialInsBookNum"
                      disabled={noSSBook}
                      value={noSSBook ? "" : formData.socialInsBookNum}
                      onChange={handleChange}
                      className={`${inputClass} font-mono disabled:opacity-30 disabled:cursor-not-allowed`}
                      placeholder="Nhập số sổ..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className={sectionTitleAmber}>Hồ sơ đính kèm</h3>
                {/* FileUploadZone với state lifted → không mất khi đổi tab */}
                <FileUploadZone
                  files={uploadedFiles}
                  onFilesChange={setUploadedFiles}
                />
              </section>
            </div>
          )}

          {/* ===== TAB 3: CÔNG VIỆC & KỸ NĂNG ===== */}
          {activeTab === 3 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section>
                <h3 className={sectionTitleAmber}>Thông tin hợp đồng</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Ngày bắt đầu làm việc</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phòng ban</label>
                    <StyledSelect
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleChange}
                    >
                      <option value="">Chọn phòng ban...</option>
                      {departments.map((d) => (
                        <option key={d.id} value={String(d.id)}>
                          {d.name}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Chức danh / Vị trí</label>
                    <StyledSelect
                      name="positionId"
                      value={formData.positionId}
                      onChange={handleChange}
                    >
                      <option value="">Chọn chức vụ...</option>
                      {positions.map((p) => (
                        <option key={p.id} value={String(p.id)}>
                          {p.name}
                        </option>
                      ))}
                    </StyledSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Loại hợp đồng</label>
                    <StyledSelect
                      name="contractType"
                      value={formData.contractType}
                      onChange={handleChange}
                    >
                      <option>Thử việc</option>
                      <option>Xác định thời hạn</option>
                      <option>Không xác định thời hạn</option>
                    </StyledSelect>
                  </div>
                  <div>
                    <label className={labelClass}>Thời hạn hợp đồng</label>
                    <input
                      name="contractDuration"
                      value={formData.contractDuration}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="VD: 1 năm..."
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Ca làm việc</label>
                    <input
                      name="shift"
                      value={formData.shift}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Ca sáng / Hành chính..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className={sectionTitleViolet}>Trình độ & Chuyên môn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelClass}>
                      Trình độ học vấn cao nhất
                    </label>
                    <input
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Đại học, Cao đẳng..."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Bậc thợ may
                      </label>
                      <NotAvailableCheckbox
                        checked={noSewingLevel}
                        onChange={() => {
                          setNoSewingLevel(!noSewingLevel);
                          setHasChanges(true);
                        }}
                        label="Chưa xác định"
                      />
                    </div>
                    <input
                      disabled={noSewingLevel}
                      name="sewingLevel"
                      value={noSewingLevel ? "" : formData.sewingLevel}
                      onChange={handleChange}
                      className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                      placeholder="Bậc 1 / Bậc 2..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Chứng chỉ & bằng cấp liên quan
                    </label>
                    <input
                      name="certificates"
                      value={formData.certificates}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="An toàn lao động, Vệ sinh thực phẩm..."
                    />
                  </div>
                </div>
              </section>

              {/* Kinh nghiệm làm việc — multi-entry */}
              <section>
                <div className="flex justify-between items-center mb-5">
                  <h3 className={sectionTitleEmerald.replace("mb-5", "mb-0")}>
                    Kinh nghiệm làm việc
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                    <input
                      type="checkbox"
                      checked={noExperience}
                      onChange={() => {
                        setNoExperience(!noExperience);
                        setHasChanges(true);
                      }}
                      className="w-3.5 h-3.5 accent-amber-500"
                    />
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Chưa có kinh nghiệm
                    </span>
                  </label>
                </div>

                {!noExperience && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {experiences.map((exp, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="relative grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/50 border border-slate-800 rounded-2xl p-4"
                        >
                          {experiences.length > 1 && (
                            <div className="absolute -top-3 left-4 bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              #{idx + 1}
                            </div>
                          )}
                          <div>
                            <label className={labelClass}>Công ty cũ</label>
                            <input
                              value={exp.company}
                              onChange={(e) =>
                                updateExperience(idx, "company", e.target.value)
                              }
                              className={inputClass}
                              placeholder="Tên công ty..."
                            />
                          </div>
                          <div>
                            <label className={labelClass}>
                              Thời gian làm việc
                            </label>
                            <input
                              value={exp.duration}
                              onChange={(e) =>
                                updateExperience(
                                  idx,
                                  "duration",
                                  e.target.value,
                                )
                              }
                              className={inputClass}
                              placeholder="VD: 2 năm..."
                            />
                          </div>
                          <div className="relative">
                            <label className={labelClass}>
                              Vị trí đảm nhiệm
                            </label>
                            <input
                              value={exp.position}
                              onChange={(e) =>
                                updateExperience(
                                  idx,
                                  "position",
                                  e.target.value,
                                )
                              }
                              className={inputClass}
                              placeholder="Nhân viên / Tổ trưởng..."
                            />
                            {experiences.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperience(idx)}
                                className="absolute -top-1 right-0 p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-all"
                                title="Xóa"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 border border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl px-4 py-2.5 transition-all w-full justify-center hover:bg-amber-500/5"
                    >
                      <Plus size={15} />
                      Thêm nơi làm việc
                    </button>
                  </motion.div>
                )}
              </section>
            </div>
          )}

          {/* ===== TAB 4: TÀI CHÍNH & TRẠNG THÁI ===== */}
          {activeTab === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h3 className={sectionTitleEmerald}>Lương & Phụ cấp</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>
                        Mức lương cơ bản (VND)
                      </label>
                      <input
                        type="number"
                        name="basicSalary"
                        value={formData.basicSalary}
                        onChange={handleChange}
                        className={`${inputClass} text-emerald-400 font-bold text-lg`}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Danh sách phụ cấp</label>
                      <textarea
                        name="allowances"
                        value={formData.allowances}
                        onChange={handleChange}
                        className={`${inputClass} h-28 resize-none`}
                        placeholder="Phụ cấp ăn trưa, xăng xe..."
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className={sectionTitleBlue}>Tài khoản ngân hàng</h3>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Tên ngân hàng</label>
                      <input
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Vietcombank, BIDV..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Số tài khoản</label>
                      <input
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        className={`${inputClass} font-mono tracking-widest`}
                        placeholder="0123 4567 8901..."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Chi nhánh</label>
                      <input
                        name="bankBranch"
                        value={formData.bankBranch}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Chi nhánh TP.HCM..."
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Trạng thái nhân viên */}
              <section>
                <h3 className={sectionTitleAmber}>Trạng thái nhân sự</h3>
                <div className="grid grid-cols-3 gap-4">
                  {(
                    Object.entries(statusConfig) as [
                      "active" | "inactive" | "on_leave",
                      (typeof statusConfig)[keyof typeof statusConfig],
                    ][]
                  ).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setFormData((p) => ({
                          ...p,
                          status: key as EmployeeStatus,
                        }));
                        setHasChanges(true);
                      }}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.status === key
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-700 hover:border-slate-600 bg-slate-900/40"
                      }`}
                    >
                      <div
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${key === "active" ? "bg-emerald-400" : key === "inactive" ? "bg-red-400" : "bg-amber-400"} ${formData.status === key ? "shadow-[0_0_8px_currentColor]" : ""}`}
                      />
                      <span
                        className={`text-sm font-semibold ${formData.status === key ? "text-white" : "text-slate-400"}`}
                      >
                        {cfg.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Tài khoản hệ thống */}
              <div className="border border-slate-800 bg-gradient-to-br from-slate-800/30 to-slate-900/0 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-slate-800/60 text-slate-500 text-[10px] font-bold px-4 py-2 rounded-bl-xl border-l border-b border-slate-700/50 uppercase tracking-widest">
                  Hệ thống
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-700 flex-shrink-0">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Tài khoản & Chữ ký điện tử
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Tài khoản đăng nhập:{" "}
                        <span className="font-mono text-slate-300">
                          {employee.code}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${
                          employee.signature
                            ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                            : "text-slate-400 bg-slate-800 border-slate-700"
                        }`}
                      >
                        <ShieldCheck size={12} />
                        {employee.signature
                          ? "Đã ký xác nhận"
                          : "Chờ ký xác nhận"}
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold text-slate-400 bg-slate-800 border-slate-700">
                        <Clock size={12} />
                        Tham gia: {formatDateDisplay(employee.startDate)}
                      </div>
                      {!employee.signature && (
                        <button
                          type="button"
                          onClick={() => setActiveTab(5)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                        >
                          <PenTool size={11} />
                          Đến trang ký
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB 5: XEM HỒ SƠ & KÝ XÁC NHẬN ===== */}
          {activeTab === 5 && (
            <EmployeeViewAndSignTab
              employee={employee}
              formData={formData}
              experiences={experiences}
              departments={departments}
              positions={positions}
              onSignatureConfirmed={(dataUrl) => {
                setSignatureDataUrl(dataUrl);
                setHasChanges(true);
              }}
            />
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-800 flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
            <span>Mã nhân viên không thể thay đổi sau khi tạo tài khoản.</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-slate-400 font-semibold hover:text-white transition-all text-sm hover:bg-slate-800 rounded-xl"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={isSubmitting || !hasChanges}
              onClick={handleSubmit}
              className={`px-8 py-2.5 rounded-xl font-bold flex items-center gap-2.5 text-sm transition-all
                ${
                  hasChanges
                    ? "bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.25)] active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
            >
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
