import {
  Building2,
  Shirt,
  User,
  MoreVertical,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import type { KhachHang } from "./types";
import { getTenKH, getLabelLoai, getMauLoai } from "./types";

interface Props {
  kh: KhachHang;
  canEdit: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const LoaiIcon = ({ loai }: { loai: string }) => {
  if (loai === "B2B") return <Building2 size={15} />;
  if (loai === "ThoiTrang") return <Shirt size={15} />;
  return <User size={15} />;
};

export const KhachHangCard = ({
  kh,
  canEdit,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: Props) => {
  const mau = getMauLoai(kh.loai);
  const ten = getTenKH(kh);
  const label = getLabelLoai(kh.loai);
  const isActive = kh.trangThai === "active";

  // Lấy contact tùy loại
  const contact =
    kh.b2b?.sdt ||
    kh.b2b?.email ||
    kh.thoiTrang?.sdt ||
    kh.thoiTrang?.email ||
    kh.caNhan?.sdt ||
    kh.caNhan?.email ||
    null;

  const sub =
    kh.b2b?.linhVucHoatDong ||
    kh.thoiTrang?.phanKhuc ||
    kh.caNhan?.sanPhamDatMay ||
    null;

  return (
    <div
      onClick={onView}
      className="group bg-slate-900/40 border border-slate-800 rounded-2xl p-4 hover:border-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-900/70"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Icon + Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl ${mau.bg} ${mau.text} border ${mau.border} flex items-center justify-center flex-shrink-0 mt-0.5`}
          >
            <LoaiIcon loai={kh.loai} />
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
              <span
                className={`text-[10px] font-bold ${mau.text} ${mau.bg} border ${mau.border} px-2 py-0.5 rounded-md`}
              >
                {label}
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {kh.ma}
              </span>
              {sub && (
                <span className="text-[10px] text-slate-500 truncate">
                  · {sub}
                </span>
              )}
            </div>
            {contact && (
              <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                {contact}
              </p>
            )}
          </div>
        </div>

        {/* Actions — chỉ admin */}
        {canEdit && (
          <div
            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onToggleStatus}
              title={isActive ? "Ngừng hợp tác" : "Kích hoạt lại"}
              className="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
            >
              {isActive ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
            </button>
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>
        )}
        {!canEdit && (
          <MoreVertical
            size={14}
            className="text-slate-700 flex-shrink-0 mt-1"
          />
        )}
      </div>
    </div>
  );
};
