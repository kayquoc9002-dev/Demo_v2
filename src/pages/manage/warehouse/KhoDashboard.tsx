// ─────────────────────────────────────────────────────────────────────────────
// KhoDashboard.tsx — Tổng quan kho cho Quản lý
// Data tổng hợp từ Module 3, 4, 5, 6
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package, ArrowDownToLine, ArrowUpFromLine, RotateCcw,
  AlertTriangle, CheckCircle, Clock, TrendingDown,
  Warehouse, ClipboardList, AlertCircle, RefreshCw,
  Box, Truck, TrendingUp,
} from "lucide-react";
import type { DashboardData, CanhBaoThoiGian  } from "../../../components/Kho/ServiceLayer/khoDashboardService";
import { layDashboardData } from "../../../components/Kho/ServiceLayer/khoDashboardService";
import ButtonTaoPR from "../../../components/Kho/TaoPR";
// ─── Stat Card ────────────────────────────────────────────────────────────────
 
function StatCard({ label, val, mau, icon: Icon, sub, route, route_label }: {
  label: string; val: number; mau: string; icon: React.ElementType;
  sub?: string; route?: string; route_label?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="px-4 py-3 rounded-2xl flex items-center gap-3"
      style={{ background: "#0f172a", border: `1px solid ${mau}20` }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: mau + "20" }}>
        <Icon size={16} style={{ color: mau }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-black leading-none" style={{ color: val > 0 ? mau : "#334155" }}>{val}</p>
        <p className="text-[10px] mt-0.5 font-bold" style={{ color: "#64748b" }}>{label}</p>
        {sub && <p className="text-[9px]" style={{ color: "#334155" }}>{sub}</p>}
      </div>
      {route && (
        <button onClick={() => navigate(route)}
          className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold hover:opacity-80"
          style={{ background: mau + "20", color: mau }}>
          {route_label ?? "Xem"} →
        </button>
      )}
    </div>
  );
}
 
// ─── Group Header ─────────────────────────────────────────────────────────────
 
function GroupHeader({ title, mau, icon: Icon }: {
  title: string; mau: string; icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 px-1 mb-2">
      <Icon size={12} style={{ color: mau }} />
      <p className="text-[10px] font-black uppercase" style={{ color: mau }}>{title}</p>
      <div className="flex-1 h-px" style={{ background: mau + "30" }} />
    </div>
  );
}
 
// ─── Progress Bar ─────────────────────────────────────────────────────────────
 
function CapacityBar({ pct, o_co_hang, tong_o }: {
  pct: number; o_co_hang: number; tong_o: number;
}) {
  const mau = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#10b981";
  const label = pct >= 90 ? "Gần đầy — cần dồn kệ gấp!" : pct >= 70 ? "Đang lấp đầy dần" : "Còn nhiều chỗ trống";
  return (
    <div className="px-4 py-4 rounded-2xl" style={{ background: "#0f172a", border: `1px solid ${mau}25` }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Warehouse size={14} style={{ color: mau }} />
          <p className="text-xs font-black" style={{ color: mau }}>Sức chứa kho</p>
        </div>
        <p className="text-2xl font-black" style={{ color: mau }}>{pct}%</p>
      </div>
      <div className="w-full h-3 rounded-full overflow-hidden mb-2" style={{ background: "#1e293b" }}>
        <div className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: mau }} />
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold" style={{ color: mau }}>{label}</p>
        <p className="text-[10px]" style={{ color: "#475569" }}>
          {o_co_hang} / {tong_o} ô đang dùng
        </p>
      </div>
    </div>
  );
}
 
// ─── Cảnh báo thời gian ───────────────────────────────────────────────────────
 
function CanhBaoCard({ item }: { item: CanhBaoThoiGian }) {
  const mau = item.mau === "do" ? "#ef4444" : "#f97316";
  const Icon = item.mau === "do" ? AlertTriangle : Clock;
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
      style={{ background: mau + "10", border: `1px solid ${mau}30` }}>
      <Icon size={14} style={{ color: mau, flexShrink: 0, marginTop: 1 }} />
      <p className="text-xs" style={{ color: mau }}>{item.mo_ta}</p>
    </div>
  );
}
 
// ─── Main Dashboard ───────────────────────────────────────────────────────────
 
export default function KhoDashboard() {
  const navigate = useNavigate();
  const [data, setData]   = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [last_update, setLastUpdate] = useState(new Date());
 
  const refresh = async () => {
    setLoading(true);
    const d = await layDashboardData();
    setData(d); setLastUpdate(new Date()); setLoading(false);
  };
 
  useEffect(() => { refresh(); }, []);
 
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: "#020817" }}>
        <div className="text-center">
          <RefreshCw size={24} className="mx-auto mb-3 animate-spin" style={{ color: "#38bdf8" }} />
          <p className="text-sm" style={{ color: "#475569" }}>Đang tải dữ liệu kho...</p>
        </div>
      </div>
    );
  }
 
  const tong_can_xu_ly =
    data.xuat.dang_nhat + data.xuat.cho_dong_goi + data.xuat.cho_shipping +
    data.nhap.cho_qc + data.nhap.cho_cat +
    data.canh_bao_su_kien.hang_hoan + data.canh_bao_su_kien.su_co;
 
  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "#020817" }}>
      <ButtonTaoPR />
      {/* Header */}
      <div className="px-6 py-4 border-b flex-shrink-0 flex items-center justify-between"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        <div>
          <div className="flex items-center gap-2">
            <Warehouse size={16} style={{ color: "#38bdf8" }} />
            <h1 className="text-sm font-black text-white">Tổng quan Kho</h1>
            {tong_can_xu_ly > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: "#ef444420", color: "#ef4444" }}>
                {tong_can_xu_ly} việc cần làm
              </span>
            )}
          </div>
          <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
            Cập nhật lúc {last_update.toLocaleTimeString("vi-VN")}
          </p>
        </div>
        <button onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#1e293b", color: "#64748b" }}>
          <RefreshCw size={12} /> Làm mới
        </button>
      </div>
 
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6" style={{ scrollbarWidth: "thin" }}>
 
        {/* ── 1. CẦN XỬ LÝ NGAY — 3 cụm ── */}
        <div>
          <p className="text-[10px] font-black uppercase mb-3" style={{ color: "#475569" }}>
            Cần xử lý ngay
          </p>
 
          {/* Cụm Xuất — ưu tiên số 1 */}
          <div className="mb-3">
            <GroupHeader title="Xuất hàng" mau="#f97316" icon={ArrowUpFromLine} />
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Đang nhặt hàng" val={data.xuat.dang_nhat}
                mau="#38bdf8" icon={Package}
                sub="Nhân viên đang picking"
                route="/manage/kho/xuat-kho" route_label="Xuất kho" />
              <StatCard label="Chờ đóng gói" val={data.xuat.cho_dong_goi}
                mau="#f97316" icon={Box}
                sub="Nhặt xong, đang packing"
                route="/manage/kho/xuat-kho" route_label="Xuất kho" />
              <StatCard label="Chờ vận chuyển" val={data.xuat.cho_shipping}
                mau="#10b981" icon={Truck}
                sub="Đóng gói xong, chờ ĐVVC"
                route="/manage/kho/xuat-kho" route_label="Xuất kho" />
            </div>
          </div>
 
          {/* Cụm Nhập */}
          <div className="mb-3">
            <GroupHeader title="Nhập hàng" mau="#10b981" icon={ArrowDownToLine} />
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Đang kiểm tra QC" val={data.nhap.cho_qc}
                mau="#f59e0b" icon={ClipboardList}
                sub="Hàng về, cần kiểm định"
                route="/manage/kho/nhap-kho" route_label="Nhập kho" />
              <StatCard label="Chờ cất kệ" val={data.nhap.cho_cat}
                mau="#a78bfa" icon={ArrowDownToLine}
                sub="Đạt QC, chưa lên kệ"
                route="/manage/kho/nhap-kho" route_label="Nhập kho" />
            </div>
          </div>
 
          {/* Cụm Cảnh báo sự kiện */}
          <div>
            <GroupHeader title="Sự cố & Hoàn hàng" mau="#ef4444" icon={AlertCircle} />
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Hàng hoàn chờ QC" val={data.canh_bao_su_kien.hang_hoan}
                mau="#ef4444" icon={RotateCcw}
                sub="Bưu kiện về, chờ mở kiểm"
                route="/manage/kho/hoan-hang" route_label="Hoàn hàng" />
              <StatCard label="Sự cố chưa xử lý" val={data.canh_bao_su_kien.su_co}
                mau="#ef4444" icon={AlertCircle}
                sub="Hàng lỗi phát hiện trong kho"
                route="/manage/kho/hoan-hang" route_label="Hoàn hàng" />
              <StatCard label="Kiểm kê chờ duyệt" val={data.canh_bao_su_kien.kiem_ke}
                mau="#a78bfa" icon={ClipboardList}
                sub="Chênh lệch chờ quản lý duyệt"
                route="/manage/kho/ton-kho" route_label="Tồn kho" />
            </div>
          </div>
        </div>
 
        {/* ── 2. Tồn kho + Cảnh báo thời gian ── */}
        <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 320px" }}>
 
          {/* Tồn kho */}
          <div className="space-y-4">
            <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
              Tình trạng tồn kho
            </p>
 
            {/* Progress bar sức chứa */}
            <CapacityBar
              pct={data.ton_kho.pct_lay_day}
              o_co_hang={data.ton_kho.o_co_hang}
              tong_o={data.ton_kho.tong_o}
            />
 
            {/* Stats nhanh */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Loại SKU",   val: data.ton_kho.tong_sku,      mau: "#94a3b8", icon: Package },
                { label: "Sắp hết",    val: data.ton_kho.sap_het,       mau: "#ef4444", icon: TrendingDown },
                { label: "Vượt max",   val: data.ton_kho.vuot_max,      mau: "#f59e0b", icon: TrendingUp },
              ].map(({ label, val, mau, icon }) => (
                <StatCard key={label} label={label} val={val} mau={mau} icon={icon} />
              ))}
            </div>
 
            {/* Bảng SKU sắp hết */}
            {data.ton_kho.ds_sap_het.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase mb-2" style={{ color: "#ef4444" }}>
                  ⚠ SKU sắp hết hàng
                </p>
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                  <div className="grid px-4 py-2 text-[9px] font-black uppercase"
                    style={{ gridTemplateColumns: "1fr 70px 70px 100px",
                      background: "#0a1628", color: "#334155",
                      borderBottom: "1px solid #1e293b" }}>
                    <span>SKU / Sản phẩm</span>
                    <span className="text-center">Tồn kho</span>
                    <span className="text-center">Tối thiểu</span>
                    <span>Vị trí</span>
                  </div>
                  {data.ton_kho.ds_sap_het.map(t => (
                    <div key={t.ma_sku + t.location_code}
                      className="grid items-center px-4 py-2.5 gap-2 hover:bg-slate-800/20"
                      style={{ gridTemplateColumns: "1fr 70px 70px 100px",
                        borderBottom: "1px solid #0f172a" }}
                        onClick={() => {navigate(`/manage/kho/ton-kho?sku=${t.ma_sku}`)}}>
                      <div>
                        <p className="text-xs text-white truncate">{t.ten_sp}</p>
                        <code className="text-[9px]" style={{ color: "#475569" }}>{t.ma_sku}</code>
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-black"
                          style={{ color: t.so_luong === 0 ? "#ef4444" : "#f97316" }}>
                          {t.so_luong === 0 ? "HẾT" : t.so_luong}
                        </span>
                      </div>
                      <div className="text-center text-sm font-bold" style={{ color: "#475569" }}>
                        {t.dinh_muc_min}
                      </div>
                      <code className="text-[10px] font-black" style={{ color: "#a78bfa" }}>
                        {t.location_code}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
 
          {/* Cảnh báo thời gian + Hoạt động hôm nay */}
          <div className="space-y-5">
 
            {/* Cảnh báo thời gian */}
            <div>
              <p className="text-[10px] font-black uppercase mb-3" style={{ color: "#ef4444" }}>
                Cảnh báo thời gian
              </p>
              <div className="space-y-2">
                {data.canh_bao_thoi_gian.length === 0 ? (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{ background: "#06472515", border: "1px solid #10b98130" }}>
                    <CheckCircle size={14} style={{ color: "#10b981" }} />
                    <p className="text-xs font-bold" style={{ color: "#10b981" }}>
                      Không có cảnh báo
                    </p>
                  </div>
                ) : (
                  data.canh_bao_thoi_gian.map((item, i) => (
                    <CanhBaoCard key={i} item={item} />
                  ))
                )}
              </div>
            </div>
 
            {/* Hoạt động hôm nay */}
            <div>
              <p className="text-[10px] font-black uppercase mb-3" style={{ color: "#475569" }}>
                Hôm nay
              </p>
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
                {[
                  { label: "Phiếu nhập mới",       val: data.hom_nay.phieu_nhap_moi,  mau: "#38bdf8",  icon: ArrowDownToLine },
                  { label: "Phiếu xuất mới",        val: data.hom_nay.phieu_nhat_moi,  mau: "#10b981",  icon: ArrowUpFromLine },
                  { label: "Hàng hoàn tiếp nhận",   val: data.hom_nay.hang_hoan_moi,   mau: "#f59e0b",  icon: RotateCcw },
                  { label: "Sự cố ghi nhận",         val: data.hom_nay.su_co_moi,       mau: "#ef4444",  icon: AlertCircle },
                ].map(({ label, val, mau, icon: Icon }, i, arr) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: i < arr.length - 1 ? "1px solid #0f172a" : "none" }}>
                    <Icon size={13} style={{ color: mau, flexShrink: 0 }} />
                    <p className="text-xs flex-1" style={{ color: "#64748b" }}>{label}</p>
                    <span className="text-sm font-black"
                      style={{ color: val > 0 ? mau : "#334155" }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
 
          </div>
        </div>
 
      </div>
    </div>
  );
}
