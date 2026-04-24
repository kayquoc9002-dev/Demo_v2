import { X, UserPlus, UserMinus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Member {
  id: number;
  name: string;
  code: string;
}
interface HRItem {
  id: number;
  name: string;
  staffCount: number;
}

interface HRDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: HRItem | null;
  type: "positions" | "departments" | undefined;
  members: Member[];
  canEdit: boolean;
  onDeleteItem: (item: HRItem) => void;
  onAddMember: () => void;
}

export const HRDetailDrawer = ({
  isOpen,
  onClose,
  data,
  type,
  members,
  canEdit,
  onDeleteItem,
  onAddMember,
}: HRDetailDrawerProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[40] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl p-8 overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Chi tiết {type === "positions" ? "Chức vụ" : "Phòng ban"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {data && (
          <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 mb-10 shadow-inner">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em]">
              Tên gọi
            </p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1 uppercase">
              {data.name}
            </h3>

            {canEdit && (
              <button
                onClick={() => data && onDeleteItem(data)}
                className="mt-6 flex items-center gap-2 text-xs text-red-400/80 hover:text-red-400 transition-colors font-medium border-t border-slate-700/50 pt-4 w-full"
              >
                <Trash2 size={14} /> Xóa{" "}
                {type === "positions" ? "chức vụ" : "phòng ban"} này
              </button>
            )}
          </div>
        )}

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h4 className="text-white font-bold flex items-center gap-2">
              Thành viên
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-md font-mono">
                {members.length}
              </span>
            </h4>
            {canEdit && (
              <button
                onClick={onAddMember}
                className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-all font-bold uppercase tracking-wider shadow-lg shadow-blue-600/20"
              >
                <UserPlus size={14} /> Thêm người
              </button>
            )}
          </div>

          <div className="space-y-3">
            {members.length > 0 ? (
              members.map((m: Member) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-slate-950/40 rounded-xl border border-slate-800/50 group hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-slate-700">
                      {m.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        {m.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wider">
                        {m.code}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110">
                    <UserMinus size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <p className="text-sm text-slate-500 italic font-medium">
                  Chưa có thành viên nào
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
