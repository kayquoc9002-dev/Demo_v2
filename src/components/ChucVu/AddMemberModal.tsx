import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, UserPlus } from "lucide-react";
import type { Employee } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  allEmployees: Employee[];
  currentIds: number[];
  onAdd: (emp: Employee) => void;
}

export const AddMemberModal = ({
  isOpen,
  onClose,
  title,
  allEmployees,
  currentIds,
  onAdd,
}: Props) => {
  const [search, setSearch] = useState("");

  const available = allEmployees.filter(
    (e) =>
      e.status === "active" &&
      !currentIds.includes(e.id) &&
      (e.fullName.toLowerCase().includes(search.toLowerCase()) ||
        e.code.toLowerCase().includes(search.toLowerCase())),
  );

  if (!isOpen) return null;

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
        className="relative w-full max-w-sm bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <p className="text-sm font-bold text-white">{title}</p>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-slate-800/60">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm nhân viên..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500/60 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/50">
          {available.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-xs">
              Không có nhân viên phù hợp
            </div>
          ) : (
            available.map((emp) => (
              <button
                key={emp.id}
                onClick={() => {
                  onAdd(emp);
                  onClose();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/60 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-blue-400 font-black text-[10px] flex items-center justify-center uppercase flex-shrink-0">
                  {emp.fullName.substring(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white uppercase truncate">
                    {emp.fullName}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {emp.code}
                    {emp.department?.name && ` · ${emp.department.name}`}
                    {emp.position?.name && ` · ${emp.position.name}`}
                  </p>
                </div>
                <UserPlus size={13} className="text-slate-600 flex-shrink-0" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-600 text-center">
            {available.length} nhân viên có thể thêm
          </p>
        </div>
      </motion.div>
    </div>
  );
};
