import { Users2, Briefcase, Network, Trash2 } from "lucide-react";

interface HRItem {
  id: number;
  name: string;
  staffCount: number;
}

interface HRCardProps {
  type: "positions" | "departments";
  item: HRItem;
  canEdit: boolean; // Thêm dòng này
  onViewDetail: (item: HRItem) => void;
  onDelete: (item: HRItem) => void;
}

export const HRCard = ({
  type,
  item,
  canEdit,
  onViewDetail,
  onDelete,
}: HRCardProps) => {
  const isPos = type === "positions";
  return (
    <div
      onClick={() => onViewDetail(item)}
      className={`flex items-center justify-between p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl cursor-pointer hover:border-${isPos ? "blue" : "emerald"}-500/50 transition-all group relative overflow-hidden`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-3 rounded-xl ${isPos ? "bg-blue-500/10 text-blue-400" : "bg-emerald-500/10 text-emerald-400"}`}
        >
          {isPos ? <Briefcase size={22} /> : <Network size={22} />}
        </div>
        <div>
          <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
            {item.name}
          </p>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <Users2 size={12} /> {item.staffCount} nhân viên
          </p>
        </div>
      </div>

      {/* CHỈ HIỆN NÚT XÓA NẾU CÓ QUYỀN */}
      {canEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="p-2 text-slate-500 hover:text-red-400 transition-all"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
};
