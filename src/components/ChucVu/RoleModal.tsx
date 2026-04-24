// src/components/ChucVu/RoleModal.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { X, Shield, Check, Star } from "lucide-react";
import type { Role } from "./types";
import { PERMISSION_GROUPS } from "./types";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editRole?: Role | null;
  onSave: (data: {
    name: string;
    color: string;
    permissions: string[];
    isDefault: boolean;
  }) => void;
}

export const RoleModal = ({ isOpen, onClose, editRole, onSave }: Props) => {
  const [name, setName] = useState(editRole?.name ?? "");
  const [color, setColor] = useState(editRole?.color ?? "#3b82f6");
  const [perms, setPerms] = useState<string[]>(
    JSON.parse(editRole?.permissions || "[]"),
  );
  const [isDefault, setIsDefault] = useState(editRole?.isDefault ?? false);

  const togglePerm = (key: string) => {
    setPerms((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, permissions: perms, isDefault });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-md"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center">
              <Shield size={15} />
            </div>
            <p className="text-sm font-bold text-white">
              {editRole ? "Chỉnh sửa quyền" : "Tạo quyền mới"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Tên role */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Tên quyền hạn
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={editRole?.isSystem}
              placeholder="VD: Quản lý kho, Kế toán trưởng..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all disabled:opacity-50"
            />
          </div>

          {/* Màu sắc */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Màu sắc
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-lg transition-all hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: "2px",
                    boxShadow: color === c ? `0 0 10px ${c}60` : "none",
                  }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border border-slate-700"
                title="Màu tuỳ chỉnh"
              />
            </div>
          </div>

          {/* Quyền hạn */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Quyền hạn
            </label>
            {editRole?.isSystem ? (
              <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                Role hệ thống — quyền được cố định
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {PERMISSION_GROUPS.map(({ group, items }) => (
                  <div key={group}>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                      {group}
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {items.map(({ key, label }) => {
                        const active = perms.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => togglePerm(key)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all text-left ${
                              active
                                ? "bg-violet-500/10 border-violet-500/40 text-violet-300"
                                : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                                active
                                  ? "bg-violet-600 border-violet-600"
                                  : "border-slate-600"
                              }`}
                            >
                              {active && (
                                <Check size={8} className="text-white" />
                              )}
                            </div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Default role */}
          {!editRole?.isSystem && (
            <button
              onClick={() => setIsDefault(!isDefault)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                isDefault
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-600"
              }`}
            >
              <Star
                size={14}
                className={isDefault ? "fill-amber-400 text-amber-400" : ""}
              />
              Đặt làm role mặc định cho nhân viên mới
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-all text-sm shadow-lg shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editRole ? "Lưu thay đổi" : "Tạo quyền"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
