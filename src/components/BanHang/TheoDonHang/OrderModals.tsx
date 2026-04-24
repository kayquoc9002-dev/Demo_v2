// ─────────────────────────────────────────────────────────────────────────────
// OrderModals.tsx — Shared modal components dùng chung
// Import vào cả TongQuanDonHang.tsx và XuLyDonHang.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo } from "react";
import {
  X, AlertTriangle, Truck, Check, RotateCcw,
  Search, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import {
  TRANG_THAI_DON_CONFIG,
  TRANG_THAI_TT_CONFIG,
  KENH_BAN_CONFIG,
  dinh_dang_tien,
  dinh_dang_ngay_ngan,
  type DonHang,
  type TrangThaiDon,
  type TrangThaiThanhToan,
  type KenhBan,
  type VaiTro,
} from "../data/orderData";

const PAGE_SIZE_MODAL = 8;

// ─── Badges ───────────────────────────────────────────────────────────────────

export function BadgeDon({ tt }: { tt: TrangThaiDon }) {
  const cfg = TRANG_THAI_DON_CONFIG[tt];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.nen, color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      {cfg.nhan}
    </span>
  );
}

export function BadgeTT({ tt }: { tt: TrangThaiThanhToan }) {
  const cfg = TRANG_THAI_TT_CONFIG[tt];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.nen, color: cfg.mau, border: `1px solid ${cfg.mau}30` }}>
      {cfg.nhan}
    </span>
  );
}

// ─── ModalChiTiet ─────────────────────────────────────────────────────────────
// Modal chi tiết đầy đủ — dùng ở cả tổng quan và xử lý đơn

export function ModalChiTiet({ don: don_ban_dau, vai_tro, onClose, onCapNhat }: {
  don:       DonHang;
  vai_tro:   VaiTro;
  onClose:   () => void;
  onCapNhat: (don: DonHang) => void;
}) {
  // State nội bộ — cập nhật ngay khi bấm nút, không cần async
  const [don, setDon] = useState<DonHang>(don_ban_dau);
  const [dang_xu_ly, setDangXuLy] = useState<TrangThaiDon | null>(null);
  const [ghi_chu_moi, setGhiChuMoi] = useState("");
  const [hien_input_ghi_chu, setHienInputGhiChu] = useState<TrangThaiDon | null>(null);

  const cfg     = TRANG_THAI_DON_CONFIG[don.trang_thai_don];
  const has_loi = don.san_pham.some(i => (i.so_luong_loi ?? 0) > 0);

  const handleDoiTrangThai = (tt: TrangThaiDon) => {
    // Một số trạng thái cần ghi chú → mở input trước
    const can_ghi_chu: TrangThaiDon[] = ["da_huy", "giao_that_bai", "tra_hang_loi"];
    if (can_ghi_chu.includes(tt) && hien_input_ghi_chu !== tt) {
      setHienInputGhiChu(tt);
      return;
    }

    setDangXuLy(tt);

    // Cập nhật state nội bộ ngay lập tức — optimistic update
    const don_moi: DonHang = {
      ...don,
      trang_thai_don: tt,
      ngay_cap_nhat:  new Date().toISOString(),
      lich_su: [
        ...don.lich_su,
        {
          trang_thai:      tt,
          thoi_gian:       new Date().toISOString(),
          nguoi_thao_tac:  "Bạn",
          ghi_chu:         ghi_chu_moi || undefined,
        },
      ],
    };

    setDon(don_moi);
    setGhiChuMoi("");
    setHienInputGhiChu(null);
    setDangXuLy(null);

    // Báo lên component cha để cập nhật danh sách
    onCapNhat(don_moi);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "#0f172a", border: "1px solid #1e293b", maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: "#1e293b" }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ fontSize: 16 }}>{KENH_BAN_CONFIG[don.kenh_ban].bieu_tuong}</span>
              <span className="text-xs font-mono" style={{ color: "#475569" }}>{don.ma_don}</span>
            </div>
            <p className="text-base font-black text-white">{don.khach_hang.ten}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <BadgeDon tt={don.trang_thai_don} />
              <BadgeTT tt={don.trang_thai_thanh_toan} />
              {don.khach_hang.ten_cong_ty && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: "#0d4f3c", color: "#34d399" }}>SỈ · VAT</span>
              )}
              {has_loi && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: "#88152525", color: "#fb7185" }}>
                  <AlertTriangle size={9} /> Có hàng lỗi
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center mt-1"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: "thin" }}>

          {/* Thông tin khách */}
          <div className="rounded-2xl p-4" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Thông tin khách hàng
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { nhan: "Tên",      gia_tri: don.khach_hang.ten },
                { nhan: "SĐT",      gia_tri: don.khach_hang.so_dien_thoai },
                { nhan: "Địa chỉ",  gia_tri: `${don.khach_hang.dia_chi}, ${don.khach_hang.thanh_pho}` },
                { nhan: "Ngày tạo", gia_tri: dinh_dang_ngay_ngan(don.ngay_tao) },
              ].map(({ nhan, gia_tri }) => (
                <div key={nhan}>
                  <p className="text-[9px] uppercase mb-0.5" style={{ color: "#475569" }}>{nhan}</p>
                  <p className="text-xs font-medium text-white">{gia_tri}</p>
                </div>
              ))}
            </div>
            {don.khach_hang.ten_cong_ty && (
              <div className="mt-3 pt-3 border-t" style={{ borderColor: "#334155" }}>
                <p className="text-[9px] uppercase mb-1" style={{ color: "#475569" }}>Xuất HĐ GTGT</p>
                <p className="text-xs font-bold" style={{ color: "#34d399" }}>{don.khach_hang.ten_cong_ty}</p>
                <p className="text-[10px]" style={{ color: "#94a3b8" }}>MST: {don.khach_hang.ma_so_thue}</p>
              </div>
            )}
            {don.ma_van_don && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2" style={{ borderColor: "#334155" }}>
                <Truck size={11} style={{ color: "#818cf8" }} />
                <div>
                  <p className="text-[9px] uppercase" style={{ color: "#475569" }}>Mã vận đơn · {don.don_vi_vc}</p>
                  <p className="text-xs font-mono font-bold" style={{ color: "#818cf8" }}>{don.ma_van_don}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sản phẩm */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest px-4 pt-3 pb-2" style={{ color: "#475569" }}>
              Sản phẩm ({don.san_pham.reduce((s, i) => s + i.so_luong, 0)} SP)
            </p>
            <div className="grid px-4 py-2 text-[9px] font-black uppercase"
              style={{ background: "#0f172a", color: "#475569", gridTemplateColumns: "1fr 50px 80px 90px" }}>
              <span>Sản phẩm</span>
              <span className="text-center">SL</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-right">Thành tiền</span>
            </div>
            {don.san_pham.map((sp, i) => (
              <div key={i} className="grid px-4 py-2.5 border-t items-center"
                style={{ borderColor: "#0f172a", gridTemplateColumns: "1fr 50px 80px 90px" }}>
                <div>
                  <p className="text-xs font-medium text-white">{sp.ten_sp}</p>
                  <p className="text-[10px]" style={{ color: "#64748b" }}>
                    {sp.mau_sac} · {sp.kich_thuoc}
                    {sp.vi_tri_ke && vai_tro === "kho" && (
                      <span className="ml-1 font-mono" style={{ color: "#a78bfa" }}> @ {sp.vi_tri_ke}</span>
                    )}
                  </p>
                  <p className="text-[9px] font-mono mt-0.5" style={{ color: "#334155" }}>{sp.ma_sku}</p>
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-white">×{sp.so_luong}</span>
                  {(sp.so_luong_loi ?? 0) > 0 && (
                    <p className="text-[9px] font-bold" style={{ color: "#fb7185" }}>−{sp.so_luong_loi} lỗi</p>
                  )}
                </div>
                <span className="text-right text-xs" style={{ color: "#94a3b8" }}>{dinh_dang_tien(sp.don_gia)}</span>
                <span className="text-right text-xs font-bold" style={{ color: "#f59e0b" }}>{dinh_dang_tien(sp.thanh_tien)}</span>
              </div>
            ))}
          </div>

          {/* Tài chính — ẩn với kho */}
          {vai_tro !== "kho" && (
            <div className="rounded-2xl p-4" style={{ background: "#1e293b" }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
                Tài chính
              </p>
              <div className="space-y-1.5">
                {[
                  { nhan: "Tạm tính",  gia_tri: don.tam_tinh,    mau: "#94a3b8" },
                  ...(don.chiet_khau > 0 ? [{ nhan: "Chiết khấu", gia_tri: -don.chiet_khau, mau: "#34d399" }] : []),
                  ...(don.phi_ship   > 0 ? [{ nhan: "Phí ship",   gia_tri: don.phi_ship,    mau: "#94a3b8" }] : []),
                ].map(({ nhan, gia_tri, mau }) => (
                  <div key={nhan} className="flex justify-between text-xs">
                    <span style={{ color: "#64748b" }}>{nhan}</span>
                    <span style={{ color: mau }}>{gia_tri < 0 ? `−${dinh_dang_tien(-gia_tri)}` : dinh_dang_tien(gia_tri)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t" style={{ borderColor: "#334155" }}>
                  <span className="text-sm font-bold text-white">Tổng cộng</span>
                  <span className="text-base font-black" style={{ color: "#f59e0b" }}>{dinh_dang_tien(don.tong_cong)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: "#64748b" }}>Đã thanh toán</span>
                  <span className="font-bold" style={{ color: "#10b981" }}>{dinh_dang_tien(don.da_thanh_toan)}</span>
                </div>
                {don.con_no > 0 && (
                  <div className="flex justify-between text-xs rounded-lg px-2 py-1.5"
                    style={{ background: "#7f1d1d25" }}>
                    <span className="font-bold" style={{ color: "#fca5a5" }}>Còn nợ</span>
                    <span className="font-black" style={{ color: "#ef4444" }}>{dinh_dang_tien(don.con_no)}</span>
                  </div>
                )}
                {vai_tro === "ke_toan" && (
                  <div className="flex justify-between text-xs pt-1">
                    <span style={{ color: "#475569" }}>Tổng giá vốn</span>
                    <span className="font-bold" style={{ color: "#64748b" }}>
                      {dinh_dang_tien(don.san_pham.reduce((s, i) => s + (i.gia_von ?? 0) * i.so_luong, 0))}
                    </span>
                  </div>
                )}
              </div>

              {/* Nút kế toán */}
              {TRANG_THAI_TT_CONFIG[don.trang_thai_thanh_toan].role_thao_tac.includes(vai_tro) && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t" style={{ borderColor: "#334155" }}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "#06472525", color: "#34d399", border: "1px solid #34d39930" }}>
                    <Check size={11} /> Xác nhận đã thu
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf830" }}>
                    Cập nhật công nợ
                  </button>
                  {has_loi && (
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background: "#88152525", color: "#fb7185", border: "1px solid #fb718530" }}>
                      <RotateCcw size={11} /> Tạo yêu cầu trả hàng
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Ghi chú */}
          {don.ghi_chu && (
            <div className="rounded-2xl p-3" style={{ background: "#1e293b" }}>
              <p className="text-[9px] uppercase font-black mb-1" style={{ color: "#475569" }}>Ghi chú nội bộ</p>
              <p className="text-xs text-white">{don.ghi_chu}</p>
            </div>
          )}

          {/* Lịch sử */}
          <div className="rounded-2xl p-4" style={{ background: "#1e293b" }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
              Lịch sử thao tác
            </p>
            <div className="relative">
              <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: "#334155" }} />
              <div className="space-y-3">
                {[...don.lich_su].reverse().map((ls, i) => {
                  const c = TRANG_THAI_DON_CONFIG[ls.trang_thai];
                  return (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 z-10"
                        style={{ background: c.nen, border: `1px solid ${c.mau}` }}>
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.mau }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold" style={{ color: c.mau }}>{c.nhan}</span>
                          <span className="text-[9px]" style={{ color: "#475569" }}>· {ls.nguoi_thao_tac}</span>
                        </div>
                        {ls.ghi_chu && <p className="text-[10px] mt-0.5" style={{ color: "#64748b" }}>{ls.ghi_chu}</p>}
                        <p className="text-[9px] mt-0.5" style={{ color: "#334155" }}>{dinh_dang_ngay_ngan(ls.thoi_gian)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer — chuyển trạng thái
            Hiện khi: role có trong role_thao_tac của trạng thái hiện tại
                   VÀ có ít nhất 1 trạng thái tiếp theo */}
        {cfg.role_thao_tac.includes(vai_tro) && cfg.trang_thai_tiep_theo.length > 0 && (
          <div className="flex-shrink-0 border-t" style={{ borderColor: "#1e293b", background: "#0a1628" }}>

            {/* Input ghi chú — hiện khi bấm nút cần ghi chú */}
            {hien_input_ghi_chu && (
              <div className="px-5 pt-3 pb-0 flex items-center gap-2">
                <input
                  autoFocus
                  value={ghi_chu_moi}
                  onChange={e => setGhiChuMoi(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleDoiTrangThai(hien_input_ghi_chu)}
                  placeholder="Ghi chú lý do (Enter để xác nhận)..."
                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}
                />
                <button
                  onClick={() => { setHienInputGhiChu(null); setGhiChuMoi(""); }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "#1e293b", color: "#64748b" }}>
                  <X size={13} />
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 px-5 py-3 flex-wrap">
              <span className="text-xs font-bold" style={{ color: "#475569" }}>Chuyển sang:</span>
              {cfg.trang_thai_tiep_theo.map(ns => {
                const nc      = TRANG_THAI_DON_CONFIG[ns];
                const la_huy  = ns === "da_huy";
                const dang_lam = dang_xu_ly === ns;
                const cho_ghi_chu = hien_input_ghi_chu === ns;
                return (
                  <button key={ns}
                    onClick={() => handleDoiTrangThai(ns)}
                    disabled={dang_lam}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
                    style={{
                      background: cho_ghi_chu ? nc.mau + "30" : la_huy ? "#7f1d1d" : nc.nen,
                      color:      la_huy ? "#fca5a5" : nc.mau,
                      border:     `2px solid ${cho_ghi_chu ? nc.mau : la_huy ? "#ef444440" : nc.mau + "40"}`,
                    }}>
                    {dang_lam
                      ? <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      : la_huy ? "🚫" : "→"
                    }
                    {nc.nhan}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ModalDanhSach ────────────────────────────────────────────────────────────
// Modal danh sách đơn theo trạng thái — mở khi bấm vào stats card

export function ModalDanhSach({ tieu_de, mau, ds_don, vai_tro, onClose, onCapNhat }: {
  tieu_de:   string;
  mau:       string;
  ds_don:    DonHang[];
  vai_tro:   VaiTro;
  onClose:   () => void;
  onCapNhat: (don: DonHang) => void;
}) {
  const [tim_kiem,  setTimKiem]  = useState("");
  const [tt_tt,     setTtTT]     = useState<TrangThaiThanhToan | "tat_ca">("tat_ca");
  const [kenh,      setKenh]     = useState<KenhBan | "tat_ca">("tat_ca");
  const [trang,     setTrang]    = useState(1);
  const [don_chon,  setDonChon]  = useState<DonHang | null>(null);

  const ds_loc = useMemo(() => {
    let ds = [...ds_don];
    if (tim_kiem) {
      const q = tim_kiem.toLowerCase();
      ds = ds.filter(o =>
        o.ma_don.toLowerCase().includes(q) ||
        o.khach_hang.ten.toLowerCase().includes(q) ||
        o.khach_hang.so_dien_thoai.includes(q)
      );
    }
    if (tt_tt !== "tat_ca") ds = ds.filter(o => o.trang_thai_thanh_toan === tt_tt);
    if (kenh  !== "tat_ca") ds = ds.filter(o => o.kenh_ban === kenh);
    return ds;
  }, [ds_don, tim_kiem, tt_tt, kenh]);

  const tong_trang = Math.max(1, Math.ceil(ds_loc.length / PAGE_SIZE_MODAL));
  const ds_hien    = ds_loc.slice((trang - 1) * PAGE_SIZE_MODAL, trang * PAGE_SIZE_MODAL);

  // Nếu đang xem chi tiết một đơn
  if (don_chon) {
    return (
      <ModalChiTiet
        don={don_chon}
        vai_tro={vai_tro}
        onClose={() => setDonChon(null)}
        onCapNhat={(don_moi) => { onCapNhat(don_moi); setDonChon(don_moi); }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl overflow-hidden flex flex-col"
        style={{ background: "#0f172a", border: "1px solid #1e293b", maxHeight: "92vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0 border-b"
          style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: mau }} />
            <h2 className="text-base font-black text-white">{tieu_de}</h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: mau + "20", color: mau }}>
              {ds_don.length} đơn
            </span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "#1e293b", color: "#94a3b8" }}>
            <X size={14} />
          </button>
        </div>

        {/* Bộ lọc nhanh */}
        <div className="flex items-center gap-2 px-5 py-3 border-b flex-wrap"
          style={{ borderColor: "#1e293b" }}>
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-40">
            <Search size={11} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#475569" }} />
            <input value={tim_kiem}
              onChange={e => { setTimKiem(e.target.value); setTrang(1); }}
              placeholder="Tìm tên khách, mã đơn..."
              className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
          </div>

          {/* Lọc TT thanh toán — ẩn với kho */}
          {vai_tro !== "kho" && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <select value={tt_tt} onChange={e => { setTtTT(e.target.value as any); setTrang(1); }}
              className="px-2 py-2 rounded-xl text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
              <option value="tat_ca">Tất cả TT</option>
              {Object.entries(TRANG_THAI_TT_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.nhan}</option>
              ))}
            </select>
          )}

          {/* Lọc kênh */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <select value={kenh} onChange={e => { setKenh(e.target.value as any); setTrang(1); }}
          
            className="px-2 py-2 rounded-xl text-xs outline-none"
            style={{ background: "#1e293b", border: "1px solid #334155", color: "#94a3b8" }}>
            <option value="tat_ca">Tất cả kênh</option>
            {Object.entries(KENH_BAN_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.bieu_tuong} {v.nhan}</option>
            ))}
          </select>

          {ds_loc.length !== ds_don.length && (
            <span className="text-xs" style={{ color: "#475569" }}>
              {ds_loc.length}/{ds_don.length} đơn
            </span>
          )}
        </div>

        {/* Danh sách */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {ds_hien.length === 0 ? (
            <div className="py-12 text-center">
              <Filter size={24} className="mx-auto mb-2 opacity-20" style={{ color: "#64748b" }} />
              <p className="text-sm" style={{ color: "#475569" }}>Không có đơn phù hợp</p>
            </div>
          ) : ds_hien.map((don, idx) => {
            // const cfg_don = TRANG_THAI_DON_CONFIG[don.trang_thai_don];
            const kenh_cfg = KENH_BAN_CONFIG[don.kenh_ban];
            return (
              <button
                key={don.id}
                onClick={() => setDonChon(don)}
                className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-800/30 transition-colors"
                style={{ borderTop: idx > 0 ? "1px solid #1e293b" : "none" }}
              >
                {/* Kênh */}
                <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>{kenh_cfg.bieu_tuong}</span>

                {/* Thông tin chính */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-bold text-white truncate">{don.khach_hang.ten}</p>
                    {don.khach_hang.ten_cong_ty && (
                      <span className="text-[8px] font-black px-1 rounded flex-shrink-0"
                        style={{ background: "#0d4f3c", color: "#34d399" }}>SỈ</span>
                    )}
                  </div>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {don.ma_don} · {dinh_dang_ngay_ngan(don.ngay_tao)}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "#334155" }}>
                    {don.san_pham[0].ten_sp}
                    {don.san_pham.length > 1 && ` +${don.san_pham.length - 1}`}
                    {" · "}{don.san_pham.reduce((s, i) => s + i.so_luong, 0)} SP
                  </p>
                </div>

                {/* Trạng thái + tiền */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-xs font-black" style={{ color: "#f59e0b" }}>
                    {dinh_dang_tien(don.tong_cong)}
                  </span>
                  <BadgeDon tt={don.trang_thai_don} />
                  {vai_tro !== "kho" && don.con_no > 0 && (
                    <span className="text-[9px] font-bold" style={{ color: "#ef4444" }}>
                      Nợ {dinh_dang_tien(don.con_no)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Pagination */}
        {tong_trang > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t flex-shrink-0"
            style={{ borderColor: "#1e293b" }}>
            <p className="text-xs" style={{ color: "#475569" }}>
              Trang {trang}/{tong_trang}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setTrang(p => Math.max(1, p - 1))} disabled={trang === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                style={{ background: "#1e293b", color: "#94a3b8" }}>
                <ChevronLeft size={12} />
              </button>
              {Array.from({ length: Math.min(tong_trang, 5) }, (_, i) => i + 1).map(i => (
                <button key={i} onClick={() => setTrang(i)}
                  className="w-7 h-7 rounded-lg text-xs font-bold"
                  style={{ background: trang === i ? "#3b82f6" : "#1e293b", color: trang === i ? "white" : "#64748b" }}>
                  {i}
                </button>
              ))}
              <button onClick={() => setTrang(p => Math.min(tong_trang, p + 1))} disabled={trang === tong_trang}
                className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30"
                style={{ background: "#1e293b", color: "#94a3b8" }}>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}