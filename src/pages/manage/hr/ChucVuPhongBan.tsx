import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Building2,
  Briefcase,
  Shield,
  RefreshCw,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GroupCard } from "../../../components/ChucVu/GroupCard";
import { RoleCard } from "../../../components/ChucVu/RoleCard";
import { RoleModal } from "../../../components/ChucVu/RoleModal";
import type {
  Department,
  Position,
  Employee,
  Role,
} from "../../../components/ChucVu/types";

const ChucVuPhongBan = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const getCurrentUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  };
  const user = getCurrentUser();
  const userIsAdmin = ["admin", "Admin"].includes(user?.role ?? "");

  const [positions, setPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"org" | "roles">("org");

  // Expanded cards
  const [expandedPos, setExpandedPos] = useState<number | null>(null);
  const [expandedDept, setExpandedDept] = useState<number | null>(null);

  // Add new inputs
  const [newPosName, setNewPosName] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [addingPos, setAddingPos] = useState(false);
  const [addingDept, setAddingDept] = useState(false);

  // Role modal
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [posRes, deptRes, empRes, roleRes] = await Promise.all([
        fetch(`${apiUrl}/hr/positions`),
        fetch(`${apiUrl}/hr/departments`),
        fetch(`${apiUrl}/hr/employees`),
        fetch(`${apiUrl}/hr/roles`),
      ]);
      setPositions(await posRes.json());
      setDepartments(await deptRes.json());
      setEmployees(await empRes.json());
      setRoles(await roleRes.json());
    } catch (e) {
      console.error("Lỗi tải dữ liệu:", e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddPosition = async () => {
    if (!newPosName.trim()) return;
    setAddingPos(true);
    try {
      const res = await fetch(`${apiUrl}/hr/positions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPosName.trim() }),
      });
      if (res.ok) {
        setNewPosName("");
        fetchAll();
      } else {
        const d = await res.json();
        alert(d.message);
      }
    } finally {
      setAddingPos(false);
    }
  };

  const handleDeletePosition = async (id: number) => {
    if (
      !confirm("Xóa chức vụ này? Nhân viên thuộc chức vụ sẽ được gỡ liên kết.")
    )
      return;
    await fetch(`${apiUrl}/hr/positions/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handlePosAddMember = async (posId: number, empId: number) => {
    await fetch(`${apiUrl}/hr/positions/${posId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId, action: "add" }),
    });
    fetchAll();
  };

  const handlePosRemoveMember = async (posId: number, empId: number) => {
    await fetch(`${apiUrl}/hr/positions/${posId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId, action: "remove" }),
    });
    fetchAll();
  };

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    setAddingDept(true);
    try {
      const res = await fetch(`${apiUrl}/hr/departments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName.trim() }),
      });
      if (res.ok) {
        setNewDeptName("");
        fetchAll();
      } else {
        const d = await res.json();
        alert(d.message);
      }
    } finally {
      setAddingDept(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (
      !confirm(
        "Xóa phòng ban này? Nhân viên thuộc phòng ban sẽ được gỡ liên kết.",
      )
    )
      return;
    await fetch(`${apiUrl}/hr/departments/${id}`, { method: "DELETE" });
    fetchAll();
  };

  const handleDeptAddMember = async (deptId: number, empId: number) => {
    await fetch(`${apiUrl}/hr/departments/${deptId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId, action: "add" }),
    });
    fetchAll();
  };

  const handleDeptRemoveMember = async (deptId: number, empId: number) => {
    await fetch(`${apiUrl}/hr/departments/${deptId}/members`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: empId, action: "remove" }),
    });
    fetchAll();
  };

  const handleSaveRole = async (data: {
    name: string;
    color: string;
    permissions: string[];
    isDefault: boolean;
  }) => {
    if (editingRole) {
      await fetch(`${apiUrl}/hr/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(`${apiUrl}/hr/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditingRole(null);
    fetchAll();
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm("Xóa quyền này?")) return;
    const res = await fetch(`${apiUrl}/hr/roles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.message);
      return;
    }
    fetchAll();
  };

  // gán role
  const handlePosAssignRole = async (posId: number, roleId: number | null) => {
    await fetch(`${apiUrl}/hr/positions/${posId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    });
    fetchAll();
  };
  const handleDeptAssignRole = async (
    deptId: number,
    roleId: number | null,
  ) => {
    await fetch(`${apiUrl}/hr/departments/${deptId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId }),
    });
    fetchAll();
  };

  const totalPos = positions.reduce((s, p) => s + p.staffCount, 0);
  const totalDept = departments.reduce((s, d) => s + d.staffCount, 0);
  const unassignedPos = employees.filter(
    (e) => e.status === "active" && !e.positionId,
  ).length;
  const unassignedDept = employees.filter(
    (e) => e.status === "active" && !e.departmentId,
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw size={24} className="text-slate-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight">
            Tổ chức & Phân quyền
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý chức vụ, phòng ban và phân quyền hệ thống
          </p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-all hover:bg-slate-700"
        >
          <RefreshCw size={14} />
          Làm mới
        </button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-2xl p-1 w-fit">
        {[
          { key: "org", label: "Tổ chức", icon: Users },
          { key: "roles", label: "Phân quyền", icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as "org" | "roles")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === key
                ? "bg-slate-700 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ============ TAB: ORG (Chức vụ + Phòng ban) ============ */}
        {activeTab === "org" && (
          <motion.div
            key="org"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* ─── CHỨC VỤ ─── */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
                      <Briefcase size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">
                        Chức Vụ
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        {positions.length} chức vụ · {totalPos} người
                        {unassignedPos > 0 && (
                          <span className="text-amber-500 ml-2">
                            · {unassignedPos} chưa phân
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add input */}
                {userIsAdmin && (
                  <div className="flex gap-2">
                    <input
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddPosition()
                      }
                      placeholder="Tên chức vụ mới..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all"
                    />
                    <button
                      onClick={handleAddPosition}
                      disabled={addingPos || !newPosName.trim()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {addingPos ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      Thêm
                    </button>
                  </div>
                )}

                {/* Cards */}
                <div className="space-y-2">
                  {positions.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-sm">
                      Chưa có chức vụ nào
                    </div>
                  ) : (
                    positions.map((pos) => (
                      <GroupCard
                        key={pos.id}
                        item={pos}
                        type="position"
                        allEmployees={employees}
                        isExpanded={expandedPos === pos.id}
                        onToggle={() =>
                          setExpandedPos(expandedPos === pos.id ? null : pos.id)
                        }
                        onDelete={() => handleDeletePosition(pos.id)}
                        onAddMember={(empId) =>
                          handlePosAddMember(pos.id, empId)
                        }
                        onRemoveMember={(empId) =>
                          handlePosRemoveMember(pos.id, empId)
                        }
                        roles={roles}
                        onAssignRole={(roleId) =>
                          handlePosAssignRole(pos.id, roleId)
                        }
                        canEdit={userIsAdmin}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* ─── PHÒNG BAN ─── */}
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black text-white uppercase tracking-wider">
                        Phòng Ban
                      </h2>
                      <p className="text-[10px] text-slate-500">
                        {departments.length} phòng ban · {totalDept} người
                        {unassignedDept > 0 && (
                          <span className="text-amber-500 ml-2">
                            · {unassignedDept} chưa phân
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Add input */}
                {userIsAdmin && (
                  <div className="flex gap-2">
                    <input
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleAddDepartment()
                      }
                      placeholder="Tên phòng ban mới..."
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all"
                    />
                    <button
                      onClick={handleAddDepartment}
                      disabled={addingDept || !newDeptName.trim()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {addingDept ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      Thêm
                    </button>
                  </div>
                )}

                {/* Cards */}
                <div className="space-y-2">
                  {departments.length === 0 ? (
                    <div className="text-center py-12 text-slate-600 text-sm">
                      Chưa có phòng ban nào
                    </div>
                  ) : (
                    departments.map((dept) => (
                      <GroupCard
                        key={dept.id}
                        item={dept}
                        type="department"
                        allEmployees={employees}
                        isExpanded={expandedDept === dept.id}
                        onToggle={() =>
                          setExpandedDept(
                            expandedDept === dept.id ? null : dept.id,
                          )
                        }
                        onDelete={() => handleDeleteDepartment(dept.id)}
                        onAddMember={(empId) =>
                          handleDeptAddMember(dept.id, empId)
                        }
                        onRemoveMember={(empId) =>
                          handleDeptRemoveMember(dept.id, empId)
                        }
                        roles={roles}
                        onAssignRole={(roleId) =>
                          handleDeptAssignRole(dept.id, roleId)
                        }
                        canEdit={userIsAdmin}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ============ TAB: ROLES (Phân quyền) ============ */}
        {activeTab === "roles" && (
          <motion.div
            key="roles"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield size={15} className="text-violet-400" />
                  Quản lý quyền hạn
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tạo và phân quyền linh hoạt như Discord — mỗi role có màu sắc
                  và tập quyền riêng
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setRoleModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
              >
                <Plus size={14} />
                Tạo quyền mới
              </button>
            </div>

            {/* Role cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  onEdit={() => {
                    setEditingRole(role);
                    setRoleModalOpen(true);
                  }}
                  onDelete={() => handleDeleteRole(role.id)}
                />
              ))}
            </div>

            {/* Info box */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-start gap-4 mt-2">
              <Shield
                size={18}
                className="text-violet-400 flex-shrink-0 mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  Cách dùng phân quyền
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sau khi tạo role, vào trang{" "}
                  <strong className="text-slate-300">Nhân viên</strong> → sửa hồ
                  sơ → chọn quyền hạn để gán role cho từng người. Role{" "}
                  <strong className="text-amber-400">Admin</strong> và{" "}
                  <strong className="text-red-400">System</strong> không thể
                  xóa. Role được đánh dấu{" "}
                  <strong className="text-blue-400">Default</strong> sẽ tự động
                  gán cho nhân viên mới.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Role Modal */}
      <RoleModal
        key={editingRole?.id ?? "new"}
        isOpen={roleModalOpen}
        onClose={() => {
          setRoleModalOpen(false);
          setEditingRole(null);
        }}
        editRole={editingRole}
        onSave={handleSaveRole}
      />
    </div>
  );
};

export default ChucVuPhongBan;
