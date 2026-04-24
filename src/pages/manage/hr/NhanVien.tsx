import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  UserMinus,
  Search,
  Pencil,
  Eye,
  SlidersHorizontal,
  X,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Coffee,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AddEmployeeModal } from "../../../components/NhanVien/AddEmployeeModal";
import { EditEmployeeModal } from "../../../components/NhanVien/EditEmployeeModal";
import { ResignModal } from "../../../components/NhanVien/ResignModal";
import { EmployeeProfileModal } from "../../../components/NhanVien/EmployeeProfileModal";

// --- TYPES ---
interface HRItem {
  id: number;
  name: string;
}

// Employee interface — khớp với Prisma schema
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
  workHistory?: string | null; // JSON kinh nghiệm làm việc
  attachments?: string | null; // JSON file đính kèm
  healthStatus?: string | null;
  basicSalary: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranch: string;
  allowances?: string | null;
  specialNotes?: string | null;
  signature?: string | null; // Base64 chữ ký (field DB thực tế)
  status: "active" | "inactive" | "on_leave";
  leavingReason?: string | null;
  handoverInfo?: string | null;
  department?: { name: string };
  position?: { name: string };
}

// --- STATUS CONFIG ---
const STATUS_CONFIG = {
  active: {
    label: "Đang làm việc",
    shortLabel: "Đang làm",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    dot: "bg-emerald-400",
    tab: "text-emerald-400",
    icon: UserCheck,
    glow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]",
  },
  on_leave: {
    label: "Đang nghỉ phép",
    shortLabel: "Tạm nghỉ",
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    dot: "bg-amber-400",
    tab: "text-amber-400",
    icon: Coffee,
    glow: "shadow-[0_0_8px_rgba(251,191,36,0.4)]",
  },
  inactive: {
    label: "Đã nghỉ việc",
    shortLabel: "Đã nghỉ",
    color: "text-red-400 bg-red-500/10 border-red-500/20",
    dot: "bg-red-400",
    tab: "text-red-400",
    icon: UserX,
    glow: "",
  },
} as const;

// --- USER ROLE HELPER ---
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const isAdmin = (user: ReturnType<typeof getCurrentUser>) =>
  user?.role === "admin" ||
  user?.role === "Admin" ||
  ["Chủ doanh nghiệp", "Phó Giám đốc"].includes(user.name);

// --- FILTER PANEL ---
const FilterPanel = ({
  departments,
  positions,
  filters,
  onChange,
  onReset,
}: {
  departments: HRItem[];
  positions: HRItem[];
  filters: {
    departmentId: string;
    positionId: string;
    gender: string;
    contractType: string;
    signatureStatus: string;
  };
  onChange: (key: string, value: string) => void;
  onReset: () => void;
}) => {
  const filterSelectClass =
    "w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-blue-500 appearance-none cursor-pointer transition-all";

  const hasActiveFilter = Object.values(filters).some((v) => v !== "");

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3"
    >
      {/* Phòng ban */}
      <div className="relative">
        <select
          className={filterSelectClass}
          value={filters.departmentId}
          onChange={(e) => onChange("departmentId", e.target.value)}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>

      {/* Chức vụ */}
      <div className="relative">
        <select
          className={filterSelectClass}
          value={filters.positionId}
          onChange={(e) => onChange("positionId", e.target.value)}
        >
          <option value="">Tất cả chức vụ</option>
          {positions.map((p) => (
            <option key={p.id} value={String(p.id)}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>

      {/* Giới tính */}
      <div className="relative">
        <select
          className={filterSelectClass}
          value={filters.gender}
          onChange={(e) => onChange("gender", e.target.value)}
        >
          <option value="">Tất cả giới tính</option>
          <option value="Nam">Nam</option>
          <option value="Nữ">Nữ</option>
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>

      {/* Loại hợp đồng */}
      <div className="relative">
        <select
          className={filterSelectClass}
          value={filters.contractType}
          onChange={(e) => onChange("contractType", e.target.value)}
        >
          <option value="">Tất cả hợp đồng</option>
          <option value="Thử việc">Thử việc</option>
          <option value="Xác định thời hạn">Xác định thời hạn</option>
          <option value="Không xác định thời hạn">
            Không xác định thời hạn
          </option>
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
        />
      </div>

      {/* Chữ ký */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <select
            className={filterSelectClass}
            value={filters.signatureStatus}
            onChange={(e) => onChange("signatureStatus", e.target.value)}
          >
            <option value="">Tất cả chữ ký</option>
            <option value="signed">Đã ký</option>
            <option value="pending">Chưa ký</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>
        {hasActiveFilter && (
          <button
            onClick={onReset}
            className="p-2.5 rounded-xl border border-slate-700 text-slate-500 hover:text-white hover:border-slate-600 transition-all flex-shrink-0"
            title="Xóa bộ lọc"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================
// --- MAIN PAGE ---
// ============================================================
const NhanVien = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResignOpen, setIsResignOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  // Tab trạng thái
  const [statusTab, setStatusTab] = useState<
    "active" | "on_leave" | "inactive"
  >("active");

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    departmentId: "",
    positionId: "",
    gender: "",
    contractType: "",
    signatureStatus: "",
  });

  // Data
  const [departments, setDepartments] = useState<HRItem[]>([]);
  const [positions, setPositions] = useState<HRItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const apiUrl = import.meta.env.VITE_API_URL;
  const user = getCurrentUser();
  const userIsAdmin = isAdmin(user);

  // --- FETCH ---
  const fetchData = useCallback(async () => {
    try {
      const [resEmp, resPos, resDept] = await Promise.all([
        fetch(`${apiUrl}/hr/employees`),
        fetch(`${apiUrl}/hr/positions`),
        fetch(`${apiUrl}/hr/departments`),
      ]);
      if (resEmp.ok) setEmployees(await resEmp.json());
      if (resPos.ok) setPositions(await resPos.json());
      if (resDept.ok) setDepartments(await resDept.json());
    } catch (error) {
      console.error("Lỗi fetch:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleEditOpen = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsEditOpen(true);
  };

  const handleProfileOpen = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsProfileOpen(true);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResignOpen = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsResignOpen(true);
  };

  const resetFilters = () => {
    setFilters({
      departmentId: "",
      positionId: "",
      gender: "",
      contractType: "",
      signatureStatus: "",
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "",
  ).length;

  // --- FILTERED LIST ---
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Tab trạng thái
      if (emp.status !== statusTab) return false;

      // Tìm kiếm full-text: tên, mã, SĐT, email, phòng ban, chức vụ
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const match =
          emp.fullName.toLowerCase().includes(q) ||
          emp.code.toLowerCase().includes(q) ||
          emp.phone?.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.department?.name?.toLowerCase().includes(q) ||
          emp.position?.name?.toLowerCase().includes(q) ||
          emp.idNumber?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Bộ lọc nâng cao
      if (
        filters.departmentId &&
        String(emp.departmentId) !== filters.departmentId
      )
        return false;
      if (filters.positionId && String(emp.positionId) !== filters.positionId)
        return false;
      if (filters.gender && emp.gender !== filters.gender) return false;
      if (filters.contractType && emp.contractType !== filters.contractType)
        return false;
      if (
        filters.signatureStatus &&
        // "signed" = có signature, "pending" = không có signature
        (filters.signatureStatus === "signed" ? !emp.signature : emp.signature)
      )
        return false;

      return true;
    });
  }, [employees, statusTab, searchTerm, filters]);

  // --- COUNTS PER TAB ---
  const counts = useMemo(
    () => ({
      active: employees.filter((e) => e.status === "active").length,
      on_leave: employees.filter((e) => e.status === "on_leave").length,
      inactive: employees.filter((e) => e.status === "inactive").length,
    }),
    [employees],
  );

  return (
    <div className="space-y-6 pb-10">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Hồ sơ Nhân sự
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Quản lý toàn bộ thông tin và tài khoản nhân viên
          </p>
        </div>

        {userIsAdmin && (
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all font-bold text-sm"
            >
              <Plus size={16} />
              Thêm nhân viên mới
            </button>
          </div>
        )}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4">
        {(["active", "on_leave", "inactive"] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          const Icon = cfg.icon;
          const isActive = statusTab === status;
          return (
            <button
              key={status}
              onClick={() => setStatusTab(status)}
              className={`relative flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all group ${
                isActive
                  ? `border-current ${cfg.tab} bg-current/5`
                  : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
              }`}
            >
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                  isActive
                    ? `bg-current/10 text-current ${cfg.tab}`
                    : "bg-slate-800 text-slate-500 group-hover:text-slate-400"
                }`}
              >
                <Icon size={20} />
              </div>
              <div>
                <p
                  className={`text-2xl font-black ${isActive ? cfg.tab : "text-white"}`}
                >
                  {counts[status]}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {cfg.label}
                </p>
              </div>
              {isActive && (
                <motion.div
                  layoutId="tabIndicator"
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-full bg-current ${cfg.tab}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="space-y-3">
        <div className="flex gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
              placeholder="Tìm tên, mã NV, SĐT, email, phòng ban..."
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              showFilter || activeFilterCount > 0
                ? "bg-blue-500/10 border-blue-500/40 text-blue-400"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
            }`}
          >
            <SlidersHorizontal size={15} />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="bg-blue-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilter && (
            <FilterPanel
              departments={departments}
              positions={positions}
              filters={filters}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />
          )}
        </AnimatePresence>

        {/* Active search/filter indicator */}
        {(searchTerm || activeFilterCount > 0) && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>
              Hiển thị{" "}
              <span className="text-white font-bold">
                {filteredEmployees.length}
              </span>{" "}
              / {employees.filter((e) => e.status === statusTab).length} nhân
              viên
            </span>
            {searchTerm && (
              <span className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-400 flex items-center gap-1">
                "{searchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="hover:text-white ml-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* EMPLOYEE TABLE */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-sm">
        {/* Tab header strip */}
        <div
          className={`h-0.5 w-full ${
            statusTab === "active"
              ? "bg-gradient-to-r from-emerald-500/60 to-transparent"
              : statusTab === "on_leave"
                ? "bg-gradient-to-r from-amber-500/60 to-transparent"
                : "bg-gradient-to-r from-red-500/60 to-transparent"
          }`}
        />

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black">
              <th className="px-6 py-4">Mã NV</th>
              <th className="px-6 py-4">Nhân viên</th>
              <th className="px-6 py-4">Phòng ban</th>
              <th className="px-6 py-4">Chức vụ</th>
              <th className="px-6 py-4">Trạng thái</th>
              {userIsAdmin && <th className="px-6 py-4">Chữ ký</th>}
              <th className="px-6 py-4 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            <AnimatePresence mode="popLayout">
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((emp, idx) => {
                  const statusCfg = STATUS_CONFIG[emp.status];
                  // Kiểm tra xem employee này có phải chính user đang đăng nhập không
                  // So sánh case-insensitive + fallback nhiều field
                  const empCode = emp.code?.toLowerCase();
                  const isSelf =
                    empCode === user.code?.toLowerCase() ||
                    empCode === user.username?.toLowerCase() ||
                    empCode === user.employeeCode?.toLowerCase() ||
                    emp.id === user.employeeId ||
                    emp.id === user.id ||
                    (emp.phone && user.phone && emp.phone === user.phone);

                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="hover:bg-blue-600/5 transition-colors group"
                    >
                      {/* Mã NV */}
                      <td className="px-6 py-4 font-mono text-blue-400 font-bold text-sm">
                        {emp.code}
                      </td>

                      {/* Nhân viên */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700 font-black text-sm uppercase shadow-inner flex-shrink-0">
                            {emp.fullName.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase">
                                {emp.fullName}
                              </p>
                              {isSelf && (
                                <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {emp.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Phòng ban */}
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {emp.department?.name || "—"}
                      </td>

                      {/* Chức vụ */}
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {emp.position?.name || "—"}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusCfg.dot} ${
                              emp.status === "active" ? "animate-pulse" : ""
                            }`}
                          />
                          <span
                            className={`text-[10px] font-black uppercase tracking-tight px-2.5 py-1 rounded-lg border ${statusCfg.color}`}
                          >
                            {statusCfg.shortLabel}
                          </span>
                        </div>
                      </td>

                      {/* Chữ ký (chỉ admin thấy) */}
                      {userIsAdmin && (
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg border ${
                              emp.signature
                                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                                : "text-slate-500 bg-slate-800/60 border-slate-700"
                            }`}
                          >
                            <ShieldCheck size={10} />
                            {emp.signature ? "Đã ký" : "Chưa ký"}
                          </div>
                        </td>
                      )}

                      {/* Thao tác */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Admin: nút sửa cho tất cả */}
                          {userIsAdmin ? (
                            <button
                              onClick={() => handleEditOpen(emp)}
                              className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-xl transition-all"
                              title="Chỉnh sửa hồ sơ"
                            >
                              <Pencil size={15} />
                            </button>
                          ) : (
                            /* Non-admin: chỉ xem hồ sơ của chính mình */
                            isSelf && (
                              <button
                                onClick={() => handleProfileOpen(emp)}
                                className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                                title="Xem hồ sơ của tôi"
                              >
                                <Eye size={15} />
                              </button>
                            )
                          )}

                          {/* Admin cũng có thể xem dạng nhân viên */}
                          {userIsAdmin && (
                            <button
                              onClick={() => handleProfileOpen(emp)}
                              className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all"
                              title="Xem hồ sơ (dạng nhân viên)"
                            >
                              <Eye size={15} />
                            </button>
                          )}
                          {/* Admin: nút thôi việc — chỉ hiện khi đang active */}
                          {userIsAdmin && emp.status === "active" && (
                            <button
                              onClick={() => handleResignOpen(emp)}
                              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                              title="Xử lý thôi việc"
                            >
                              <UserMinus size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={userIsAdmin ? 7 : 6}
                    className="py-20 text-center"
                  >
                    <div className="space-y-4">
                      <div className="bg-slate-800/60 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto text-slate-600 border border-slate-700">
                        <Users size={28} />
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold text-sm">
                          {searchTerm || activeFilterCount > 0
                            ? "Không tìm thấy nhân viên phù hợp"
                            : `Chưa có nhân viên nào trong mục "${STATUS_CONFIG[statusTab].label}"`}
                        </p>
                        {(searchTerm || activeFilterCount > 0) && (
                          <button
                            onClick={() => {
                              setSearchTerm("");
                              resetFilters();
                            }}
                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
                          >
                            Xóa bộ lọc
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>

        {/* Footer count */}
        {filteredEmployees.length > 0 && (
          <div className="px-6 py-3 border-t border-slate-800/60 bg-slate-900/20 flex items-center justify-between">
            <p className="text-xs text-slate-600">
              {filteredEmployees.length} nhân viên
            </p>
            {statusTab === "active" && userIsAdmin && (
              <p className="text-xs text-slate-600">
                Đã ký:{" "}
                <span className="text-emerald-400 font-semibold">
                  {filteredEmployees.filter((e) => e.signature).length}
                </span>{" "}
                /{" "}
                <span className="text-white font-semibold">
                  {filteredEmployees.length}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Modal thêm nhân viên (admin only) */}
      <AddEmployeeModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        departments={departments}
        positions={positions}
        onSaveSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal chỉnh sửa (admin only) */}
      <EditEmployeeModal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        departments={departments}
        positions={positions}
        onSaveSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal cho nhân viên xem hồ sơ & ký */}
      <EmployeeProfileModal
        isOpen={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onSignatureSuccess={() => {
          fetchData();
        }}
      />

      {/* Modal nghỉ việc */}
      <ResignModal
        isOpen={isResignOpen}
        onClose={() => {
          setIsResignOpen(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onResignSuccess={() => {
          fetchData();
        }}
      />
    </div>
  );
};

export default NhanVien;
