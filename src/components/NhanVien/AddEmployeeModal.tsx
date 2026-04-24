import { useState, useRef } from "react";
import {
  X,
  Save,
  CheckCircle2,
  PenTool,
  RefreshCw,
  AlertCircle,
  Upload,
  File,
  Trash2,
  ChevronDown,
  Plus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- ĐỊNH NGHĨA TYPES ---
interface HRItem {
  id: number;
  name: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
}

interface WorkExperience {
  company: string;
  duration: string;
  position: string;
}

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: HRItem[];
  positions: HRItem[];
  onSaveSuccess: () => void;
  initialData?: Partial<{
    code: string;
    fullName: string;
    gender: string;
    dob: string;
    pob: string;
    nationality: string;
    maritalStatus: string;
    phone: string;
    emergencyPhone: string;
    email: string;
    permAddress: string;
    tempAddress: string;
    idNumber: string;
    idIssueDate: string;
    idIssuePlace: string;
    taxCode: string;
    noTaxCode: boolean;
    socialInsCode: string;
    noSocialInsCode: boolean;
    socialInsBookNum: string;
    noSSBook: boolean;
    startDate: string;
    contractType: string;
    contractDuration: string;
    departmentId: string;
    positionId: string;
    shift: string;
    education: string;
    sewingLevel: string;
    noSewingLevel: boolean;
    certificates: string;
    noCertificates: boolean;
    experiences: WorkExperience[];
    noExperience: boolean;
    healthStatus: string;
    basicSalary: string;
    bankName: string;
    bankAccountNumber: string;
    bankBranch: string;
    allowances: string;
    noAllowances: boolean;
    specialNotes: string;
    uploadedFiles: UploadedFile[];
  }>;
}

// ---- SHARED STYLED COMPONENTS ----
const labelClass =
  "block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2";

const sectionTitleClass =
  "text-sm font-bold text-blue-400 uppercase tracking-[0.15em] border-l-[3px] border-blue-500 pl-3 mb-5";

const inputClass =
  "w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 outline-none transition-all hover:border-slate-600";

const selectClass =
  "w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 appearance-none cursor-pointer";

// Custom Select wrapper for arrow icon
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

// Checkbox "Chưa có" inline helper
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
      className="w-3.5 h-3.5 accent-blue-500 rounded"
    />
    <span className="text-[11px] text-slate-500 font-semibold">{label}</span>
  </label>
);

// ---- FILE UPLOAD ZONE (state lifted to parent) ----
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

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const removeFile = (idx: number) => {
    onFilesChange(files.filter((_, i) => i !== idx));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group
          ${
            isDragging
              ? "border-blue-500 bg-blue-500/10 scale-[0.995]"
              : "border-slate-700 hover:border-blue-500/60 hover:bg-slate-900/60 bg-slate-900/20"
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
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all
            ${
              isDragging
                ? "bg-blue-500/20 text-blue-400"
                : "bg-slate-800 text-slate-500 group-hover:bg-blue-500/10 group-hover:text-blue-400"
            }`}
        >
          <Upload size={26} />
        </div>
        <p className="text-slate-300 font-semibold text-sm">
          {isDragging
            ? "Thả file vào đây..."
            : "Kéo thả hoặc nhấn để chọn file"}
        </p>
        <p className="text-slate-600 text-xs mt-1.5">
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
                {/* Preview ảnh nhỏ nếu là image */}
                {f.type.startsWith("image/") ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
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
                    removeFile(i);
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

// ---- MAIN MODAL ----
export const AddEmployeeModal = ({
  isOpen,
  onClose,
  departments,
  positions,
  onSaveSuccess,
  initialData,
}: AddEmployeeModalProps) => {
  const [activeTab, setActiveTab] = useState(1);
  const [autoCode, setAutoCode] = useState(false);

  // --- Checkbox states (lifted from inline) ---
  const [noSSBook, setNoSSBook] = useState(initialData?.noSSBook ?? false);
  const [noSewingLevel, setNoSewingLevel] = useState(
    initialData?.noSewingLevel ?? false,
  );
  const [noExperience, setNoExperience] = useState(
    initialData?.noExperience ?? false,
  );
  const [noTaxCode, setNoTaxCode] = useState(initialData?.noTaxCode ?? false);
  const [noSocialInsCode, setNoSocialInsCode] = useState(
    initialData?.noSocialInsCode ?? false,
  );
  const [noCertificates, setNoCertificates] = useState(
    initialData?.noCertificates ?? false,
  );
  const [noAllowances, setNoAllowances] = useState(
    initialData?.noAllowances ?? false,
  );

  // --- Kinh nghiệm làm việc: danh sách nhiều entry ---
  const [experiences, setExperiences] = useState<WorkExperience[]>(
    initialData?.experiences ?? [{ company: "", duration: "", position: "" }],
  );

  // --- Files: lifted lên đây để không bị mất khi đổi tab ---
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(
    initialData?.uploadedFiles ?? [],
  );

  const [formData, setFormData] = useState({
    code: initialData?.code ?? "",
    fullName: initialData?.fullName ?? "",
    gender: initialData?.gender ?? "Nam",
    dob: initialData?.dob ?? "",
    pob: initialData?.pob ?? "",
    nationality: initialData?.nationality ?? "Việt Nam",
    maritalStatus: initialData?.maritalStatus ?? "Độc thân",
    phone: initialData?.phone ?? "",
    emergencyPhone: initialData?.emergencyPhone ?? "",
    email: initialData?.email ?? "",
    permAddress: initialData?.permAddress ?? "",
    tempAddress: initialData?.tempAddress ?? "",
    idNumber: initialData?.idNumber ?? "",
    idIssueDate: initialData?.idIssueDate ?? "",
    idIssuePlace: initialData?.idIssuePlace ?? "",
    taxCode: initialData?.taxCode ?? "",
    socialInsCode: initialData?.socialInsCode ?? "",
    socialInsBookNum: initialData?.socialInsBookNum ?? "",
    startDate: initialData?.startDate ?? "",
    contractType: initialData?.contractType ?? "Thử việc",
    contractDuration: initialData?.contractDuration ?? "",
    departmentId: initialData?.departmentId ?? "",
    positionId: initialData?.positionId ?? "",
    shift: initialData?.shift ?? "Hành chính",
    education: initialData?.education ?? "",
    sewingLevel: initialData?.sewingLevel ?? "",
    certificates: initialData?.certificates ?? "",
    healthStatus: initialData?.healthStatus ?? "",
    basicSalary: initialData?.basicSalary ?? "",
    bankName: initialData?.bankName ?? "",
    bankAccountNumber: initialData?.bankAccountNumber ?? "",
    bankBranch: initialData?.bankBranch ?? "",
    allowances: initialData?.allowances ?? "",
    specialNotes: initialData?.specialNotes ?? "",
  });

  const handleAutoCode = () => {
    const randomCode =
      "NV" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code: randomCode });
    setAutoCode(true);
    setTimeout(() => setAutoCode(false), 600);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- Kinh nghiệm helpers ---
  const addExperience = () => {
    setExperiences([
      ...experiences,
      { company: "", duration: "", position: "" },
    ]);
  };

  const removeExperience = (idx: number) => {
    setExperiences(experiences.filter((_, i) => i !== idx));
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
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!isOpen) return null;

  const tabs = [
    "1. Hồ sơ cá nhân",
    "2. Giấy tờ & Bảo hiểm",
    "3. Công việc & Kỹ năng",
    "4. Tài chính & Chữ ký",
  ];

  const handleSubmit = async () => {
    if (!formData.code || !formData.fullName || !formData.phone) {
      alert(
        "Mày quên nhập mấy thông tin quan trọng như Mã NV, Tên hoặc SĐT rồi!",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Map đúng theo Prisma schema — chỉ gửi các field có trong DB
      const payload = {
        ...formData,
        // Nullable fields — gửi null khi "chưa có"
        taxCode: noTaxCode ? null : formData.taxCode || null,
        socialInsCode: noSocialInsCode ? null : formData.socialInsCode || null,
        socialInsBookNum: noSSBook ? null : formData.socialInsBookNum || null,
        sewingLevel: noSewingLevel ? null : formData.sewingLevel || null,
        certificates: noCertificates ? null : formData.certificates || null,
        allowances: noAllowances ? null : formData.allowances || null,
        email: formData.email || null,
        contractDuration: formData.contractDuration || null,
        emergencyPhone: formData.emergencyPhone || null,
        healthStatus: formData.healthStatus || null,
        specialNotes: formData.specialNotes || null,
        // Số → number
        basicSalary: formData.basicSalary ? Number(formData.basicSalary) : 0,
        departmentId: formData.departmentId
          ? Number(formData.departmentId)
          : null,
        positionId: formData.positionId ? Number(formData.positionId) : null,
        // Dates → null nếu rỗng
        dob: formData.dob || null,
        idIssueDate: formData.idIssueDate || null,
        startDate: formData.startDate || null,
        // workHistory: đúng tên field DB (JSON string kinh nghiệm làm việc)
        workHistory: noExperience ? null : JSON.stringify(experiences),
        // attachments: đúng tên field DB (JSON string file đính kèm)
        attachments:
          uploadedFiles.length > 0
            ? JSON.stringify(
                uploadedFiles.map((f) => ({
                  name: f.name,
                  size: f.size,
                  type: f.type,
                  url: f.url,
                })),
              )
            : null,
      };

      const response = await fetch(`${apiUrl}/hr/employees`, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          initialData
            ? "Cập nhật thông tin nhân viên thành công!"
            : "Ngon! Đã thêm nhân viên và cấp tài khoản thành công.",
        );
        onSaveSuccess();
        onClose();
      } else {
        alert(result.message || "Lỗi rồi mày ơi!");
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      alert("Không gọi được Backend, check xem server chạy chưa?");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <div className="px-8 py-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              {initialData
                ? "Chỉnh sửa hồ sơ nhân viên"
                : "Thêm nhân viên & cấp tài khoản"}
            </h2>
            <p className="text-slate-500 text-xs mt-1 pl-[18px]">
              Mã nhân viên → tài khoản đăng nhập &nbsp;·&nbsp; SĐT → mật khẩu
              mặc định
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white"
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
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* FORM CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* ===== TAB 1: THÔNG TIN CÁ NHÂN ===== */}
          {activeTab === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* Định danh */}
              <section>
                <h3 className={sectionTitleClass}>Thông tin định danh</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Mã nhân viên */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Mã nhân viên
                      </label>
                      <button
                        type="button"
                        onClick={handleAutoCode}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <RefreshCw
                          size={11}
                          className={autoCode ? "animate-spin" : ""}
                        />
                        Tự động tạo
                      </button>
                    </div>
                    <input
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`${inputClass} font-mono`}
                      placeholder="NV..."
                    />
                  </div>

                  {/* Họ tên */}
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

                  {/* Giới tính */}
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

                  {/* Ngày sinh */}
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

                  {/* Nơi sinh */}
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

                  {/* Hôn nhân */}
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

              {/* Liên lạc */}
              <section>
                <h3 className={sectionTitleClass}>Thông tin liên lạc</h3>
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
                <h3 className={sectionTitleClass}>Căn cước công dân / CMND</h3>
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
                <h3 className={sectionTitleClass}>Thuế & Bảo hiểm xã hội</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Mã số thuế cá nhân */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Mã số thuế cá nhân
                      </label>
                      <NotAvailableCheckbox
                        checked={noTaxCode}
                        onChange={() => setNoTaxCode(!noTaxCode)}
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

                  {/* Mã số BHXH */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Mã số BHXH
                      </label>
                      <NotAvailableCheckbox
                        checked={noSocialInsCode}
                        onChange={() => setNoSocialInsCode(!noSocialInsCode)}
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

                  {/* Số sổ BHXH */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Số sổ BHXH
                      </label>
                      <NotAvailableCheckbox
                        checked={noSSBook}
                        onChange={() => setNoSSBook(!noSSBook)}
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

              {/* Hồ sơ đính kèm — state được giữ nguyên khi đổi tab */}
              <section>
                <h3 className={sectionTitleClass}>Hồ sơ đính kèm</h3>
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
                <h3 className={sectionTitleClass}>Thông tin hợp đồng</h3>
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
                        <option key={p.id} value={p.id}>
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
                <h3
                  className={sectionTitleClass.replace(
                    "text-blue-400 border-blue-500",
                    "text-violet-400 border-violet-500",
                  )}
                >
                  Trình độ & Chuyên môn
                </h3>
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
                        onChange={() => setNoSewingLevel(!noSewingLevel)}
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
                    <div className="flex justify-between items-center mb-2">
                      <label className={labelClass.replace("mb-2", "")}>
                        Chứng chỉ & bằng cấp liên quan
                      </label>
                      <NotAvailableCheckbox
                        checked={noCertificates}
                        onChange={() => setNoCertificates(!noCertificates)}
                      />
                    </div>
                    <input
                      name="certificates"
                      disabled={noCertificates}
                      value={noCertificates ? "" : formData.certificates}
                      onChange={handleChange}
                      className={`${inputClass} disabled:opacity-30 disabled:cursor-not-allowed`}
                      placeholder="An toàn lao động, Vệ sinh thực phẩm..."
                    />
                  </div>
                </div>
              </section>

              {/* ===== KINH NGHIỆM LÀM VIỆC ===== */}
              <section>
                <div className="flex justify-between items-center mb-5">
                  <h3
                    className={sectionTitleClass.replace(
                      "text-blue-400 border-blue-500 mb-5",
                      "text-emerald-400 border-emerald-500 mb-0",
                    )}
                  >
                    Kinh nghiệm làm việc
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-900 border border-slate-700 rounded-xl px-3 py-2">
                    <input
                      type="checkbox"
                      checked={noExperience}
                      onChange={() => setNoExperience(!noExperience)}
                      className="w-3.5 h-3.5 accent-blue-500"
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
                          {/* Số thứ tự */}
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
                            {/* Xóa entry nếu có nhiều hơn 1 */}
                            {experiences.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeExperience(idx)}
                                className="absolute -top-1 right-0 p-1 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-slate-600 transition-all"
                                title="Xóa mục này"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Nút thêm */}
                    <button
                      type="button"
                      onClick={addExperience}
                      className="flex items-center gap-2 text-sm font-semibold text-blue-400 hover:text-blue-300 border border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl px-4 py-2.5 transition-all w-full justify-center hover:bg-blue-500/5"
                    >
                      <Plus size={15} />
                      Thêm nơi làm việc
                    </button>
                  </motion.div>
                )}
              </section>
            </div>
          )}

          {/* ===== TAB 4: TÀI CHÍNH & CHỮ KÝ ===== */}
          {activeTab === 4 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lương */}
                <section>
                  <h3
                    className={sectionTitleClass.replace(
                      "text-blue-400 border-blue-500",
                      "text-emerald-400 border-emerald-500",
                    )}
                  >
                    Lương & Phụ cấp
                  </h3>
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
                      <div className="flex justify-between items-center mb-2">
                        <label className={labelClass.replace("mb-2", "")}>
                          Danh sách phụ cấp
                        </label>
                        <NotAvailableCheckbox
                          checked={noAllowances}
                          onChange={() => setNoAllowances(!noAllowances)}
                          label="Không có"
                        />
                      </div>
                      <textarea
                        name="allowances"
                        disabled={noAllowances}
                        value={noAllowances ? "" : formData.allowances}
                        onChange={handleChange}
                        className={`${inputClass} h-28 resize-none disabled:opacity-30 disabled:cursor-not-allowed`}
                        placeholder="Phụ cấp ăn trưa, xăng xe..."
                      />
                    </div>
                  </div>
                </section>

                {/* Ngân hàng */}
                <section>
                  <h3 className={sectionTitleClass}>Tài khoản ngân hàng</h3>
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

              {/* Chữ ký điện tử — thông báo rõ luồng */}
              <div className="border border-slate-800 bg-gradient-to-br from-blue-500/5 to-slate-900/0 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-blue-600/10 text-blue-400 text-[10px] font-bold px-4 py-2 rounded-bl-xl border-l border-b border-blue-500/20 uppercase tracking-widest">
                  Digital ID
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-600 border border-slate-700 flex-shrink-0">
                    <PenTool size={26} />
                  </div>
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-white font-semibold text-sm">
                        Xác nhận thông tin & Chữ ký điện tử
                      </p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        Sau khi lưu hồ sơ, nhân viên sẽ nhận được tài khoản. Khi
                        đăng nhập lần đầu, hệ thống sẽ hiển thị toàn bộ thông
                        tin để nhân viên xem lại và ký xác nhận điện tử. Quản lý
                        không thể ký thay.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full border border-blue-500/20">
                        <CheckCircle2 size={13} />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          Trạng thái: Chờ khởi tạo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 italic">
                        Nhân viên ký sau khi đăng nhập lần đầu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-8 py-5 border-t border-slate-800 flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-2.5 text-slate-500 text-xs bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-800">
            <AlertCircle size={14} className="text-amber-500 flex-shrink-0" />
            <span>
              Kiểm tra kỹ thông tin định danh và tài khoản trước khi lưu.
            </span>
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
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2.5 shadow-[0_0_20px_rgba(37,99,235,0.25)] active:scale-95 transition-all text-sm"
            >
              {isSubmitting ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSubmitting
                ? "Đang lưu..."
                : initialData
                  ? "Cập nhật hồ sơ"
                  : "Lưu hồ sơ & Cấp tài khoản"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
