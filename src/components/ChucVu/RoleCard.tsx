import { Pencil, Trash2, Shield } from "lucide-react";
import type { Role } from "./types";
import { ALL_PERMISSIONS } from "./types";

interface Props {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
}

export const RoleCard = ({ role, onEdit, onDelete }: Props) => {
  const perms: string[] = JSON.parse(role.permissions || "[]");
  const isAll = perms.includes("all");

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{
            backgroundColor: role.color,
            boxShadow: `0 0 8px ${role.color}60`,
          }}
        />
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p className="text-sm font-bold text-white truncate">{role.name}</p>
          {role.isSystem && (
            <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md tracking-wider uppercase shrink-0">
              System
            </span>
          )}
          {role.isDefault && (
            <span className="text-[9px] font-black text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-md tracking-wider uppercase shrink-0">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
          >
            <Pencil size={12} />
          </button>
          {!role.isSystem && (
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Permissions */}
      <div className="flex flex-wrap gap-1.5">
        {isAll ? (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg flex items-center gap-1">
            <Shield size={9} /> Tất cả quyền
          </span>
        ) : perms.length === 0 ? (
          <span className="text-[10px] text-slate-600 italic">
            Chưa có quyền nào
          </span>
        ) : (
          perms.map((p) => {
            const found = ALL_PERMISSIONS.find((a) => a.key === p);
            return (
              <span
                key={p}
                className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded-lg"
              >
                {found?.label || p}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};
