import { useState } from "react";
import {
  Clock, Package, Truck, AlertTriangle, RotateCcw,
  CheckCircle, Banknote, CreditCard, PhoneCall,
  TrendingUp, Users, Store, ChevronRight
} from "lucide-react";
import {
  MOCK_DON_HANG,
  TRANG_THAI_DON_CONFIG,
  KENH_BAN_CONFIG,
  dinh_dang_tien,
  dinh_dang_tien_ngan,
  dinh_dang_ngay_ngan,
  // cap_nhat_trang_thai_don,
  type DonHang,
  type VaiTro,
} from "../../../../components/BanHang/data/orderData";
import { ModalChiTiet, ModalDanhSach, BadgeDon } from "../../../../components/BanHang/TheoDonHang/OrderModals";

// ─── Mock vai trò — thay bằng auth context sau ───────────────────────────────
const VAI_TRO_HIEN_TAI: VaiTro = "ke_toan";

// ─── StatCard bấm được → mở ModalDanhSach ────────────────────────────────────

interface StatCardProps {
  nhan: string; gia_tri: string | number; mo_ta?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; mau: string; nen: string;
  ds_don?: DonHang[];   // nếu có → bấm được, mở modal danh sách
  vai_tro?: VaiTro;
  onCapNhat?: (don: DonHang) => void;
}

function StatCard({ nhan, gia_tri, mo_ta, icon: Icon, mau, nen, ds_don, vai_tro, onCapNhat }: StatCardProps) {
  const [mo_modal, setMoModal] = useState(false);
  const co_the_bam = ds_don && ds_don.length > 0;

  return (
    <>
      <div
        className={`p-4 rounded-2xl transition-all ${co_the_bam ? "cursor-pointer hover:scale-[1.02] hover:border-opacity-60" : ""}`}
        style={{ background: "#0f172a", border: `1px solid ${co_the_bam ? mau + "40" : "#1e293b"}` }}
        onClick={() => co_the_bam && setMoModal(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#475569" }}>{nhan}</p>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: nen }}>
            <Icon size={15} style={{ color: mau }} />
          </div>
        </div>
        <p className="text-2xl font-black text-white leading-none mb-1">{gia_tri}</p>
        {mo_ta && <p className="text-[10px]" style={{ color: "#475569" }}>{mo_ta}</p>}
        {co_the_bam && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-[10px]" style={{ color: mau }}>Xem danh sách</span>
            <ChevronRight size={10} style={{ color: mau }} />
          </div>
        )}
      </div>

      {mo_modal && ds_don && vai_tro && onCapNhat && (
        <ModalDanhSach
          tieu_de={nhan}
          mau={mau}
          ds_don={ds_don}
          vai_tro={vai_tro}
          onClose={() => setMoModal(false)}
          onCapNhat={onCapNhat}
        />
      )}
    </>
  );
}

// ─── DonCanXuLyCard — bấm mở ModalChiTiet đầy đủ ─────────────────────────────

function DonCanXuLyCard({ don, vai_tro, onCapNhat }: {
  don:       DonHang;
  vai_tro:   VaiTro;
  onCapNhat: (don: DonHang) => void;
}) {
  const [mo_modal, setMoModal] = useState(false);
  const cfg    = TRANG_THAI_DON_CONFIG[don.trang_thai_don];
  const kenh   = KENH_BAN_CONFIG[don.kenh_ban];
  const tong_sp = don.san_pham.reduce((s, i) => s + i.so_luong, 0);

  return (
    <>
      <button
        onClick={() => setMoModal(true)}
        className="w-full text-left p-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] group"
        style={{ background: "#0f172a", border: `1px solid ${cfg.mau}25` }}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 13 }}>{kenh.bieu_tuong}</span>
            <span className="text-[10px] font-mono" style={{ color: "#475569" }}>{don.ma_don}</span>
          </div>
          <ChevronRight size={12} style={{ color: "#334155" }}
            className="group-hover:translate-x-0.5 transition-transform" />
        </div>
        <p className="text-xs font-bold text-white truncate mb-0.5">{don.khach_hang.ten}</p>
        <p className="text-[10px] truncate mb-2" style={{ color: "#475569" }}>
          {don.san_pham[0].ten_sp}
          {don.san_pham.length > 1 && ` +${don.san_pham.length - 1}`}
          {" · "}{tong_sp} SP
        </p>
        <div className="flex items-center justify-between">
          <BadgeDon tt={don.trang_thai_don} />
          <span className="text-xs font-black" style={{ color: "#f59e0b" }}>
            {dinh_dang_tien(don.tong_cong)}
          </span>
        </div>
        {/* Quick action hint — kho thấy vị trí kệ */}
        {vai_tro === "kho" && don.trang_thai_don === "cho_xu_ly" && (
          <div className="mt-2 flex flex-wrap gap-1">
            {don.san_pham.slice(0, 2).map((sp, i) => sp.vi_tri_ke && (
              <span key={i} className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                style={{ background: "#4c1d9525", color: "#a78bfa" }}>
                {sp.vi_tri_ke}
              </span>
            ))}
          </div>
        )}
      </button>

      {mo_modal && (
        <ModalChiTiet
          don={don}
          vai_tro={vai_tro}
          onClose={() => setMoModal(false)}
          onCapNhat={(don_moi) => { onCapNhat(don_moi); setMoModal(false); }}
        />
      )}
    </>
  );
}

// ─── Section helper ───────────────────────────────────────────────────────────

function Section({ icon: Icon, nhan, mau, children, count }: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any; nhan: string; mau: string; count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color: mau }} />
        <span className="text-xs font-black" style={{ color: mau }}>{nhan}</span>
        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
          style={{ background: mau + "20", color: mau }}>{count}</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {children}
      </div>
    </div>
  );
}

// ─── TongQuanSale ─────────────────────────────────────────────────────────────

function TongQuanSale({ ds_don, onCapNhat }: { ds_don: DonHang[]; onCapNhat: (don: DonHang) => void }) {
  const cho_xac_nhan  = ds_don.filter(o => o.trang_thai_don === "cho_xu_ly");
  const dang_giao     = ds_don.filter(o => o.trang_thai_don === "dang_van_chuyen");
  const giao_that_bai = ds_don.filter(o => o.trang_thai_don === "giao_that_bai");
  const hang_loi      = ds_don.filter(o => o.trang_thai_don === "tra_hang_loi");
  const hoan_thanh    = ds_don.filter(o => o.trang_thai_don === "hoan_thanh");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard nhan="Chờ xác nhận"    gia_tri={cho_xac_nhan.length}  mo_ta="Cần gọi xác nhận"      icon={Clock}       mau="#f59e0b" nen="#78350f20" ds_don={cho_xac_nhan}  vai_tro="sale" onCapNhat={onCapNhat} />
        <StatCard nhan="Đang vận chuyển" gia_tri={dang_giao.length}     mo_ta="Khách có thể hỏi"      icon={Truck}       mau="#818cf8" nen="#3730a320" ds_don={dang_giao}     vai_tro="sale" onCapNhat={onCapNhat} />
        <StatCard nhan="Giao thất bại"   gia_tri={giao_that_bai.length} mo_ta="Cần liên hệ lại"       icon={PhoneCall}   mau="#f97316" nen="#7c2d1220" ds_don={giao_that_bai} vai_tro="sale" onCapNhat={onCapNhat} />
        <StatCard nhan="Hoàn thành"      gia_tri={hoan_thanh.length}    mo_ta="Đơn giao thành công"   icon={CheckCircle} mau="#10b981" nen="#06472520" ds_don={hoan_thanh}    vai_tro="sale" onCapNhat={onCapNhat} />
      </div>

      <div className="rounded-2xl p-4 space-y-5" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>Việc cần làm hôm nay</p>

        <Section icon={PhoneCall} nhan="Giao thất bại — cần liên hệ lại" mau="#f97316" count={giao_that_bai.length}>
          {giao_that_bai.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="sale" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={AlertTriangle} nhan="Khiếu nại / hàng lỗi" mau="#fb7185" count={hang_loi.length}>
          {hang_loi.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="sale" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={Clock} nhan="Chờ xác nhận thông tin" mau="#f59e0b" count={cho_xac_nhan.length}>
          {cho_xac_nhan.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="sale" onCapNhat={onCapNhat} />)}
        </Section>

        {giao_that_bai.length === 0 && hang_loi.length === 0 && cho_xac_nhan.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={28} className="mx-auto mb-2" style={{ color: "#10b981", opacity: 0.5 }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Không có việc cần xử lý</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TongQuanKho ──────────────────────────────────────────────────────────────

function TongQuanKho({ ds_don, onCapNhat }: { ds_don: DonHang[]; onCapNhat: (don: DonHang) => void }) {
  const cho_xu_ly     = ds_don.filter(o => o.trang_thai_don === "cho_xu_ly");
  const dang_san_xuat = ds_don.filter(o => o.trang_thai_don === "dang_san_xuat");
  const cho_giao_vc   = ds_don.filter(o => o.trang_thai_don === "cho_giao_van_chuyen");
  const hang_loi      = ds_don.filter(o => o.trang_thai_don === "tra_hang_loi");
  const giao_that_bai = ds_don.filter(o => o.trang_thai_don === "giao_that_bai");

  const tong_sp_can_lay = cho_xu_ly.reduce((s, o) => s + o.san_pham.reduce((ss, i) => ss + i.so_luong, 0), 0);
  const tong_sp_loi     = hang_loi.reduce((s, o) => s + o.san_pham.reduce((ss, i) => ss + (i.so_luong_loi ?? 0), 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard nhan="Cần nhặt hàng"   gia_tri={cho_xu_ly.length}    mo_ta={`${tong_sp_can_lay} SP`} icon={Package}       mau="#f59e0b" nen="#78350f20" ds_don={cho_xu_ly}    vai_tro="kho" onCapNhat={onCapNhat} />
        <StatCard nhan="Đang sản xuất"   gia_tri={dang_san_xuat.length} mo_ta="Chờ xưởng"              icon={Clock}         mau="#38bdf8" nen="#0c435420" ds_don={dang_san_xuat} vai_tro="kho" onCapNhat={onCapNhat} />
        <StatCard nhan="Chờ in bill"     gia_tri={cho_giao_vc.length}   mo_ta="Chờ ĐVVC đến lấy"       icon={Truck}         mau="#a78bfa" nen="#4c1d9520" ds_don={cho_giao_vc}   vai_tro="kho" onCapNhat={onCapNhat} />
        <StatCard nhan="Hàng lỗi về kho" gia_tri={tong_sp_loi}          mo_ta="SP cần nhập kho lỗi"    icon={AlertTriangle} mau="#fb7185" nen="#88152520" ds_don={hang_loi}      vai_tro="kho" onCapNhat={onCapNhat} />
      </div>

      <div className="rounded-2xl p-4 space-y-5" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>Thứ tự xử lý hôm nay</p>

        <Section icon={Package} nhan="Ưu tiên 1 — Nhặt hàng & đóng gói" mau="#f59e0b" count={cho_xu_ly.length}>
          {cho_xu_ly.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="kho" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={Truck} nhan="Ưu tiên 2 — In bill, chờ ĐVVC" mau="#a78bfa" count={cho_giao_vc.length}>
          {cho_giao_vc.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="kho" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={AlertTriangle} nhan="Ưu tiên 3 — Nhập kho hàng lỗi" mau="#fb7185" count={hang_loi.length}>
          {hang_loi.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="kho" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={RotateCcw} nhan="Hoàn về kho" mau="#f97316" count={giao_that_bai.length}>
          {giao_that_bai.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="kho" onCapNhat={onCapNhat} />)}
        </Section>

        {cho_xu_ly.length === 0 && cho_giao_vc.length === 0 && hang_loi.length === 0 && giao_that_bai.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={28} className="mx-auto mb-2" style={{ color: "#10b981", opacity: 0.5 }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Kho không có việc tồn đọng</p>
          </div>
        )}
      </div>

      {/* Bảng vị trí kệ */}
      {cho_xu_ly.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
            Vị trí kệ cần lấy hàng — sắp xếp theo khu
          </p>
          <div className="space-y-1.5">
            {cho_xu_ly.flatMap(don =>
              don.san_pham.map(sp => ({
                ma_don: don.ma_don, ten_sp: sp.ten_sp,
                mau_sac: sp.mau_sac, kich_thuoc: sp.kich_thuoc,
                so_luong: sp.so_luong, vi_tri_ke: sp.vi_tri_ke ?? "—",
              }))
            ).sort((a, b) => a.vi_tri_ke.localeCompare(b.vi_tri_ke))
            .map((sp, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: "#1e293b" }}>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded-lg flex-shrink-0"
                  style={{ background: "#4c1d9525", color: "#a78bfa" }}>
                  {sp.vi_tri_ke}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{sp.ten_sp}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {sp.mau_sac} · {sp.kich_thuoc} · {sp.ma_don}
                  </p>
                </div>
                <span className="text-sm font-black flex-shrink-0" style={{ color: "#f59e0b" }}>
                  ×{sp.so_luong}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TongQuanKeToan ───────────────────────────────────────────────────────────

function TongQuanKeToan({ ds_don, onCapNhat }: { ds_don: DonHang[]; onCapNhat: (don: DonHang) => void }) {
  const cho_doi_soat    = ds_don.filter(o => o.trang_thai_thanh_toan === "cho_doi_soat");
  const chua_thanh_toan = ds_don.filter(o => o.trang_thai_thanh_toan === "chua_thanh_toan" && o.trang_thai_don !== "da_huy");
  const da_coc          = ds_don.filter(o => o.trang_thai_thanh_toan === "da_coc");
  const hoan_thanh_cxn  = ds_don.filter(o => o.trang_thai_don === "hoan_thanh" && o.trang_thai_thanh_toan !== "da_thanh_toan");
  const tra_hang        = ds_don.filter(o => o.trang_thai_don === "tra_hang_loi");

  const tien_doi_soat  = cho_doi_soat.reduce((s, o) => s + o.tong_cong, 0);
  const tong_con_no    = [...chua_thanh_toan, ...da_coc].reduce((s, o) => s + o.con_no, 0);
  const tong_da_thu    = ds_don.reduce((s, o) => s + o.da_thanh_toan, 0);
  const loi_nhuan      = ds_don.filter(o => o.trang_thai_don === "hoan_thanh").reduce((s, o) =>
    s + o.tong_cong - o.san_pham.reduce((ss, i) => ss + (i.gia_von ?? 0) * i.so_luong, 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard nhan="Chờ đối soát COD" gia_tri={dinh_dang_tien_ngan(tien_doi_soat)} mo_ta={`${cho_doi_soat.length} đơn`}             icon={Truck}      mau="#a78bfa" nen="#4c1d9520" ds_don={cho_doi_soat}    vai_tro="ke_toan" onCapNhat={onCapNhat} />
        <StatCard nhan="Tổng công nợ"      gia_tri={dinh_dang_tien_ngan(tong_con_no)}   mo_ta={`${chua_thanh_toan.length + da_coc.length} khách`} icon={CreditCard} mau="#ef4444" nen="#7f1d1d20" ds_don={[...chua_thanh_toan, ...da_coc]} vai_tro="ke_toan" onCapNhat={onCapNhat} />
        <StatCard nhan="Đã thu được"       gia_tri={dinh_dang_tien_ngan(tong_da_thu)}   mo_ta="Tiền đã vào tài khoản"                               icon={Banknote}   mau="#10b981" nen="#06472520" />
        <StatCard nhan="Lợi nhuận gộp"     gia_tri={dinh_dang_tien_ngan(loi_nhuan)}     mo_ta="DT − giá vốn (hoàn thành)"                           icon={TrendingUp} mau="#38bdf8" nen="#0c435420" />
      </div>

      <div className="rounded-2xl p-4 space-y-5" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>Việc cần xử lý tài chính</p>

        <Section icon={Truck} nhan="Chờ đối soát COD" mau="#a78bfa" count={cho_doi_soat.length}>
          {cho_doi_soat.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="ke_toan" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={AlertTriangle} nhan="Hoàn thành nhưng chưa thu tiền" mau="#f59e0b" count={hoan_thanh_cxn.length}>
          {hoan_thanh_cxn.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="ke_toan" onCapNhat={onCapNhat} />)}
        </Section>
        <Section icon={RotateCcw} nhan="Trả hàng lỗi — chờ duyệt hoàn tiền" mau="#fb7185" count={tra_hang.length}>
          {tra_hang.map(don => <DonCanXuLyCard key={don.id} don={don} vai_tro="ke_toan" onCapNhat={onCapNhat} />)}
        </Section>

        {cho_doi_soat.length === 0 && hoan_thanh_cxn.length === 0 && tra_hang.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle size={28} className="mx-auto mb-2" style={{ color: "#10b981", opacity: 0.5 }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Không có việc tài chính tồn đọng</p>
          </div>
        )}
      </div>

      {/* Sổ công nợ */}
      {(chua_thanh_toan.length > 0 || da_coc.length > 0) && (
        <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
          <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#475569" }}>
            Sổ công nợ — sắp xếp theo số tiền nợ
          </p>
          <div className="space-y-1.5">
            {[...chua_thanh_toan, ...da_coc].sort((a, b) => b.con_no - a.con_no).map(don => (
              <div key={don.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: "#1e293b" }}>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{don.khach_hang.ten}</p>
                  <p className="text-[10px]" style={{ color: "#475569" }}>
                    {don.ma_don} · {dinh_dang_ngay_ngan(don.ngay_tao)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-black" style={{ color: "#ef4444" }}>{dinh_dang_tien(don.con_no)}</p>
                  <p className="text-[9px]" style={{ color: "#475569" }}>Cọc {dinh_dang_tien(don.da_thanh_toan)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TongQuanAdmin ────────────────────────────────────────────────────────────

function TongQuanAdmin({ ds_don, onCapNhat }: { ds_don: DonHang[]; onCapNhat: (don: DonHang) => void }) {
  const cho_xu_ly      = ds_don.filter(o => o.trang_thai_don === "cho_xu_ly");
  const dang_giao      = ds_don.filter(o => o.trang_thai_don === "dang_van_chuyen");
  const hoan_thanh     = ds_don.filter(o => o.trang_thai_don === "hoan_thanh");
  // const da_huy         = ds_don.filter(o => o.trang_thai_don === "da_huy");
  const chua_thanh_toan = ds_don.filter(o => o.trang_thai_thanh_toan === "chua_thanh_toan" && o.trang_thai_don !== "da_huy");
  const da_coc          = ds_don.filter(o => o.trang_thai_thanh_toan === "da_coc");
  const can_xu_ly      = ds_don.filter(o =>
    ["cho_xu_ly","dang_san_xuat","cho_giao_van_chuyen","tra_hang_loi","giao_that_bai"].includes(o.trang_thai_don)
  );
  const tong_con_no    = ds_don.filter(o => o.trang_thai_don !== "da_huy").reduce((s, o) => s + o.con_no, 0);

  const [mo_modal, setMoModal] = useState(false);

  const kenh_stats = (Object.keys(KENH_BAN_CONFIG) as (keyof typeof KENH_BAN_CONFIG)[])
    .map(k => ({
      kenh: k, ...KENH_BAN_CONFIG[k],
      so_don:    ds_don.filter(o => o.kenh_ban === k).length,
      doanh_thu: ds_don.filter(o => o.kenh_ban === k && o.trang_thai_don === "hoan_thanh").reduce((s, o) => s + o.tong_cong, 0),
      ds:        ds_don.filter(o => o.kenh_ban === k),
    })).filter(k => k.so_don > 0).sort((a, b) => b.so_don - a.so_don);

  return (
    <div className="space-y-5">
      {/* Stats tổng hợp */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard nhan="Tổng đơn"     gia_tri={ds_don.length}                     icon={Package}    mau="#94a3b8" nen="#1e293b"   ds_don={ds_don}     vai_tro="admin" onCapNhat={onCapNhat} />
        <StatCard nhan="Cần xử lý"    gia_tri={can_xu_ly.length}                  icon={Clock}      mau="#f59e0b" nen="#78350f20" ds_don={can_xu_ly}   vai_tro="admin" onCapNhat={onCapNhat} />
        <StatCard nhan="Đang giao"    gia_tri={dang_giao.length}                  icon={Truck}      mau="#818cf8" nen="#3730a320" ds_don={dang_giao}    vai_tro="admin" onCapNhat={onCapNhat} />
        <StatCard nhan="Hoàn thành"   gia_tri={hoan_thanh.length}                 icon={CheckCircle} mau="#10b981" nen="#06472520" ds_don={hoan_thanh}  vai_tro="admin" onCapNhat={onCapNhat} />
        <StatCard nhan="Công nợ"      gia_tri={dinh_dang_tien_ngan(tong_con_no)}  icon={CreditCard} mau="#ef4444" nen="#7f1d1d20" ds_don={[...chua_thanh_toan, ...da_coc]} vai_tro="admin" onCapNhat={onCapNhat} />
      </div>

      {/* Nhìn nhanh 3 bộ phận */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[
          {
            icon: Users, nhan: "Sale / CSKH", mau: "#a78bfa",
            items: [
              { nhan: "Chờ xác nhận",  so: cho_xu_ly.length,                                                              mau: "#f59e0b" },
              { nhan: "Giao thất bại", so: ds_don.filter(o => o.trang_thai_don === "giao_that_bai").length,               mau: "#f97316" },
              { nhan: "Hàng lỗi",      so: ds_don.filter(o => o.trang_thai_don === "tra_hang_loi").length,                mau: "#fb7185" },
            ],
          },
          {
            icon: Package, nhan: "Bộ phận kho", mau: "#38bdf8",
            items: [
              { nhan: "Cần nhặt hàng", so: cho_xu_ly.length,                                                              mau: "#f59e0b" },
              { nhan: "Đang sản xuất", so: ds_don.filter(o => o.trang_thai_don === "dang_san_xuat").length,               mau: "#38bdf8" },
              { nhan: "Chờ in bill",   so: ds_don.filter(o => o.trang_thai_don === "cho_giao_van_chuyen").length,         mau: "#a78bfa" },
            ],
          },
          {
            icon: Banknote, nhan: "Kế toán", mau: "#10b981",
            items: [
              { nhan: "Chờ đối soát",  so: ds_don.filter(o => o.trang_thai_thanh_toan === "cho_doi_soat").length,        mau: "#a78bfa" },
              { nhan: "Khách chưa trả",so: ds_don.filter(o => o.trang_thai_thanh_toan === "chua_thanh_toan").length,     mau: "#ef4444" },
              { nhan: "Chờ duyệt hoàn",so: ds_don.filter(o => o.trang_thai_don === "tra_hang_loi").length,              mau: "#fb7185" },
            ],
          },
        ].map(({ icon: Icon, nhan, mau, items }) => (
          <div key={nhan} className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon size={13} style={{ color: mau }} />
              <p className="text-xs font-black uppercase tracking-widest" style={{ color: mau }}>{nhan}</p>
            </div>
            <div className="space-y-2">
              {items.map(({ nhan: n, so, mau: m }) => (
                <div key={n} className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: "#64748b" }}>{n}</span>
                  <span className="text-sm font-black" style={{ color: so > 0 ? m : "#334155" }}>{so}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Kênh bán */}
      <div className="rounded-2xl p-4" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
        <div className="flex items-center gap-2 mb-3">
          <Store size={13} style={{ color: "#475569" }} />
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#475569" }}>Doanh thu theo kênh</p>
        </div>
        <div className="space-y-2.5">
          {kenh_stats.map(k => {
            // const [mo_modal, setMoModal] = useState(false);
            const max_dt = Math.max(...kenh_stats.map(x => x.doanh_thu), 1);
            const pct    = Math.round(k.doanh_thu / max_dt * 100);
            return (
              <div key={k.kenh}>
                <button
                  className="w-full flex items-center justify-between mb-1 hover:opacity-80 transition-opacity"
                  onClick={() => setMoModal(true)}
                >
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontSize: 13 }}>{k.bieu_tuong}</span>
                    <span className="text-xs font-bold" style={{ color: k.mau }}>{k.nhan}</span>
                    <span className="text-[10px]" style={{ color: "#334155" }}>{k.so_don} đơn</span>
                  </div>
                  <span className="text-xs font-black text-white">{dinh_dang_tien_ngan(k.doanh_thu)}</span>
                </button>
                <div className="h-1.5 rounded-full" style={{ background: "#1e293b" }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: k.mau, opacity: 0.7 }} />
                </div>
                {mo_modal && (
                  <ModalDanhSach
                    tieu_de={`${k.bieu_tuong} ${k.nhan}`}
                    mau={k.mau}
                    ds_don={k.ds}
                    vai_tro="admin"
                    onClose={() => setMoModal(false)}
                    onCapNhat={onCapNhat}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function TongQuanDonHang() {
  const vai_tro = VAI_TRO_HIEN_TAI;
  const [ds_don, setDsDon] = useState<DonHang[]>(MOCK_DON_HANG);

  const cap_nhat_don = (don_moi: DonHang) => {
    setDsDon(prev => prev.map(o => o.id === don_moi.id ? don_moi : o));
  };

  const ten_vai_tro: Record<VaiTro, string> = {
    admin: "Quản trị viên", sale: "Sale / CSKH",
    kho: "Bộ phận kho", ke_toan: "Kế toán",
  };

  const mo_ta: Record<VaiTro, string> = {
    admin:   "Tổng quan toàn hệ thống",
    sale:    "Đơn cần liên hệ & theo dõi vận chuyển",
    kho:     "Việc cần làm theo thứ tự ưu tiên",
    ke_toan: "Tiền cần thu, đối soát, duyệt",
  };

  return (
    <div className="p-5 space-y-5 min-h-screen" style={{ background: "#020817" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Tổng quan đơn hàng</h1>
          <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{mo_ta[vai_tro]}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <div className="w-2 h-2 rounded-full" style={{ background: "#10b981" }} />
          <span className="text-xs font-bold text-white">{ten_vai_tro[vai_tro]}</span>
        </div>
      </div>

      {vai_tro === "sale"    && <TongQuanSale    ds_don={ds_don} onCapNhat={cap_nhat_don} />}
      {vai_tro === "kho"     && <TongQuanKho     ds_don={ds_don} onCapNhat={cap_nhat_don} />}
      {vai_tro === "ke_toan" && <TongQuanKeToan  ds_don={ds_don} onCapNhat={cap_nhat_don} />}
      {vai_tro === "admin"   && <TongQuanAdmin   ds_don={ds_don} onCapNhat={cap_nhat_don} />}
    </div>
  );
}