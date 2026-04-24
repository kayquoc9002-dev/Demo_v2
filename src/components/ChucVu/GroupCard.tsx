import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  ChevronRight,
  UserPlus,
  Trash2,
  X,
  Shield,
  Plus,
  Check,
} from "lucide-react";
import type { Department, Position, Employee, Role } from "./types";
import { AddMemberModal } from "./AddMemberModal";

type GroupItem = Department | Position;

interface Props {
  item: GroupItem;
  type: "department" | "position";
  allEmployees: Employee[];
  roles: Role[];
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddMember: (empId: number) => void;
  onRemoveMember: (empId: number) => void;
  onAssignRole: (roleId: number | null) => void;
  canEdit: boolean;
}

export const GroupCard = ({
  item,
  type,
  allEmployees,
  roles,
  isExpanded,
  onToggle,
  onDelete,
  onAddMember,
  onRemoveMember,
  onAssignRole,
  canEdit,
}: Props) => {
  const [addOpen, setAddOpen] = useState(false);
  const [roleDropOpen, setRoleDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });

  const isDept = type === "department";
  const accent = isDept
    ? {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
        dot: "bg-blue-400",
      }
    : {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
        dot: "bg-violet-400",
      };

  const openRoleDrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropPos({
        top: rect.bottom + 6,
        left: Math.min(rect.left, window.innerWidth - 216),
      });
    }
    setRoleDropOpen(true);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setRoleDropOpen(false);
      }
    };
    if (roleDropOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [roleDropOpen]);

  return (
    <>
      <motion.div
        layout
        className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors"
      >
        {/* ── Header ── */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none"
          onClick={onToggle}
        >
          <div
            className={`w-9 h-9 rounded-xl ${accent.bg} ${accent.text} border ${accent.border} flex items-center justify-center flex-shrink-0`}
          >
            {isDept ? <Building2 size={16} /> : <Briefcase size={16} />}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white leading-tight truncate">
              {item.name}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <div className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
                <span className="text-[10px] font-semibold text-slate-500">
                  {item.staffCount} thành viên
                </span>
              </div>

              {/* Role badge hoặc nút gán role */}
              {canEdit ? (
                item.role ? (
                  <button
                    ref={btnRef}
                    onClick={openRoleDrop}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all hover:opacity-70"
                    style={{
                      backgroundColor: item.role.color + "20",
                      borderColor: item.role.color + "50",
                      color: item.role.color,
                    }}
                  >
                    <Shield size={8} />
                    {item.role.name}
                  </button>
                ) : (
                  <button
                    ref={btnRef}
                    onClick={openRoleDrop}
                    className="flex items-center gap-1 text-[9px] text-slate-600 hover:text-slate-400 transition-all"
                  >
                    <Plus size={8} />
                    Gán role
                  </button>
                )
              ) : (
                item.role && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold border"
                    style={{
                      backgroundColor: item.role.color + "20",
                      borderColor: item.role.color + "50",
                      color: item.role.color,
                    }}
                  >
                    <Shield size={8} />
                    {item.role.name}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAddOpen(true);
                }}
                title="Thêm thành viên"
                className={`p-1.5 ${accent.bg} ${accent.text} border ${accent.border} rounded-lg hover:opacity-70 transition-all`}
              >
                <UserPlus size={12} />
              </button>
            )}
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                title="Xóa"
                className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 size={12} />
              </button>
            )}
            <ChevronRight
              size={13}
              className={`text-slate-600 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
            />
          </div>
        </div>

        {/* ── Expanded members ── */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-2 border-t border-slate-800/60">
                {item.employees.length === 0 ? (
                  <p className="text-[11px] text-slate-600 italic text-center py-3">
                    Chưa có thành viên — nhấn{" "}
                    <UserPlus size={10} className="inline" /> để thêm
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.employees.map((emp) => (
                      <div
                        key={emp.id}
                        className="group flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 rounded-lg px-2.5 py-1.5 hover:border-slate-600 transition-all"
                      >
                        <div
                          className={`w-4 h-4 rounded-md ${accent.bg} ${accent.text} flex items-center justify-center text-[8px] font-black uppercase flex-shrink-0`}
                        >
                          {emp.fullName.substring(0, 1)}
                        </div>
                        <span className="text-[11px] text-slate-300 font-medium truncate max-w-[90px]">
                          {emp.fullName}
                        </span>
                        {isDept && emp.position?.name && (
                          <span className="text-[9px] text-slate-600 hidden group-hover:block">
                            · {emp.position.name}
                          </span>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => onRemoveMember(emp.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-all ml-0.5"
                          >
                            <X size={9} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Add Member Modal ── */}
      <AddMemberModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title={`Thêm vào "${item.name}"`}
        allEmployees={allEmployees}
        currentIds={item.employees.map((e) => e.id)}
        onAdd={(emp) => onAddMember(emp.id)}
      />

      {/* ── Role Dropdown (fixed position) ── */}
      <AnimatePresence>
        {roleDropOpen && (
          <motion.div
            ref={dropRef}
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="fixed z-[200] w-52 bg-[#0d1117] border border-slate-700 rounded-xl shadow-2xl overflow-hidden"
            style={{ top: dropPos.top, left: dropPos.left }}
          >
            <div className="px-3 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Gán Role
              </p>
              <button
                onClick={() => setRoleDropOpen(false)}
                className="text-slate-600 hover:text-white"
              >
                <X size={12} />
              </button>
            </div>

            {item.roleId && (
              <button
                onClick={() => {
                  onAssignRole(null);
                  setRoleDropOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-all text-left border-b border-slate-800/60"
              >
                <X size={11} /> Gỡ role hiện tại
              </button>
            )}

            <div className="max-h-52 overflow-y-auto py-1">
              {roles.length === 0 ? (
                <p className="text-[10px] text-slate-600 text-center py-4 italic">
                  Chưa có role nào
                </p>
              ) : (
                roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onAssignRole(r.id);
                      setRoleDropOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 transition-all text-left hover:bg-slate-800/70 ${item.roleId === r.id ? "bg-slate-800/40" : ""}`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: r.color,
                        boxShadow: `0 0 6px ${r.color}60`,
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {r.name}
                      </p>
                      {r.isSystem && (
                        <p className="text-[9px] text-amber-500">System</p>
                      )}
                    </div>
                    {item.roleId === r.id && (
                      <Check
                        size={11}
                        className="text-green-400 flex-shrink-0"
                      />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
