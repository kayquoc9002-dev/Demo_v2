import { Package, Wrench, Palette, MoreVertical, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { DoiTac } from "./types";
import { getTenDoiTac, getLabelLoai, getMauLoai } from "./types";

interface Props {
  dt: DoiTac;
  canEdit: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const LoaiIcon = ({ loai }: { loai: string }) => {
  if (loai === "CungUng") return <Package size={15} />;
  if (loai === "GiaCong") return <Wrench size={15} />;
  return <Palette size={15} />;
};

export const DoiTacCard = ({ dt, canEdit, onView, onEdit, onDelete, onToggleStatus }: Props) => {
  const mau = getMauLoai(dt.loai);
  const ten = getTenDoiTac(dt);
  const label = getLabelLoai(dt.loai);
  const isActive = dt.trangThai === "active";

  const sub = dt.cungUng?.quocGiaXuatXu || dt.giaCong?.diaChiXuong || dt.thietKe?.linhVucChuyenMon;
  const contact = dt.cungUng?.chungNhanChatLuong || dt.giaCong?.coPhongQC
    ? (dt.giaCong?.coPhongQC ? `QC: ${dt.giaCong.coPhongQC}` : null)
    : null;

  return (
    <div
      onClick={onView}
      className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${mau.bg} ${mau.text} border ${mau.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
            <LoaiIcon loai={dt.loai} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-white truncate">{ten}</p>
              {!isActive && (
                <span className="text-[9px] font-bold text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded-md">
                  Ngừng
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-bold ${mau.text} ${mau.bg} border ${mau.border} px-2 py-0.5 rounded-md`}>
                {label}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{dt.ma}</span>
              {sub && <span className="text-[10px] text-slate-500 truncate">· {sub}</span>}
            </div>
            {contact && <p className="text-[11px] text-slate-500 mt-1.5">{contact}</p>}
          </div>
        </div>

        {canEdit ? (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onToggleStatus} className="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all">
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
