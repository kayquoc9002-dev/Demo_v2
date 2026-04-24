import { Building, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight, Globe, Phone } from "lucide-react";
import type { NhaPhanPhoi } from "./types";
import { getTrangThaiColor, getTrangThaiLabel } from "./types";

interface Props {
  npp: NhaPhanPhoi;
  canEdit: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export const NhaPhanPhoiCard = ({ npp, canEdit, onView, onEdit, onDelete, onToggleStatus }: Props) => {
  const mau = getTrangThaiColor(npp.trangThai);
  const isActive = npp.trangThai === "active";

  return (
    <div
      onClick={onView}
      className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Logo hoặc icon */}
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 overflow-hidden">
            {npp.logo ? (
              <img src={npp.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <Building size={16} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white truncate">{npp.tenCongTy}</p>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${mau.bg} ${mau.text} ${mau.border}`}>
                {getTrangThaiLabel(npp.trangThai)}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] font-mono text-slate-500">{npp.ma}</span>
              {npp.quocGiaKhuVuc && (
                <span className="text-[10px] text-slate-500">· {npp.quocGiaKhuVuc}</span>
              )}
              {npp.namBatDauHopTac && (
                <span className="text-[10px] text-slate-500">· Từ {npp.namBatDauHopTac}</span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {npp.sdt && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Phone size={10} /> {npp.sdt}
                </span>
              )}
              {npp.website && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                  <Globe size={10} /> {npp.website}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {canEdit ? (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onToggleStatus}
              title={isActive ? "Tạm ngưng" : "Kích hoạt"}
              className="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
            >
              {isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            </button>
            <button onClick={onEdit} className="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
              <Pencil size={12} />
            </button>
            <button onClick={onDelete} className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all">
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <MoreVertical size={14} className="text-slate-700 flex-shrink-0 mt-1" />
        )}
      </div>
    </div>
  );
};
