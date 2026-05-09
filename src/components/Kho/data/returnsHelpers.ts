// ─────────────────────────────────────────────────────────────────────────────
// returnsHelpers.ts — Pure functions cho Module 6: Sự cố & Hàng hoàn
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PhieuHangHoan,
  TinhTrangHang, HuongXuLy,
} from "./returnsTypes";
import { TINH_TRANG_CONFIG } from "./returnsTypes";
import type { DonHang } from "../../BanHang/data/orderData";

// ─── ID & mã phiếu ───────────────────────────────────────────────────────────

export function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function gen_ma_hang_hoan(): string {
  return `HH-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

export function gen_ma_su_co(): string {
  return `SC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`;
}

// ─── Nhận diện đơn hàng từ mã vận đơn ────────────────────────────────────────

export function tim_don_theo_van_don(
  ma_van_don: string,
  ds_don:     DonHang[],
): DonHang | null {
  return ds_don.find(d =>
    d.ma_van_don?.toUpperCase() === ma_van_don.trim().toUpperCase()
  ) ?? null;
}

// ─── Tạo phiếu hàng hoàn từ đơn hàng ────────────────────────────────────────

export function tao_phieu_hang_hoan(
  ma_van_don: string,
  don:        DonHang,
): PhieuHangHoan {
  const id = gen_id();
  return {
    id,
    ma_phieu:        gen_ma_hang_hoan(),
    ma_van_don:      ma_van_don.trim().toUpperCase(),
    don_id:          don.id,
    ma_don:          don.ma_don,
    ten_khach:       don.khach_hang.ten,
    dvvc:            don.don_vi_vc ?? "ĐVVC",
    trang_thai:      "cho_qc",
    nguon:           "dvvc",
    ngay_tao:        new Date().toISOString(),
    ngay_hoan_thanh: "",
    ghi_chu:         "",
    danh_sach: don.san_pham.map(sp => ({
      id:          gen_id(),
      phieu_id:    id,
      ma_sku:      sp.ma_sku,
      ten_sp:      `${sp.ten_sp} — ${sp.mau_sac} ${sp.kich_thuoc}`,
      so_luong:    sp.so_luong,
      tinh_trang:  null,
      huong_xu_ly: "chua_xu_ly" as HuongXuLy,
      ghi_chu:     "",
      da_qc:       false,
    })),
  };
}

// ─── Phân luồng tự động theo tình trạng QC ───────────────────────────────────

export function dinh_tuyen_xu_ly(tinh_trang: TinhTrangHang): HuongXuLy {
  const cfg = TINH_TRANG_CONFIG[tinh_trang];
  if (cfg.dinh_tuyen === "staging") return "len_ke_ban_tiep";
  return "chua_xu_ly"; // Loại 2/3 → chờ quản lý quyết định
}

// ─── Tính stats phiếu hàng hoàn ──────────────────────────────────────────────

export function tinh_stats_hang_hoan(phieu: PhieuHangHoan) {
  const ds = phieu.danh_sach;
  return {
    tong:      ds.length,
    da_qc:     ds.filter(d => d.da_qc).length,
    moi_100:   ds.filter(d => d.tinh_trang === "moi_100").length,
    loi_nhe:   ds.filter(d => d.tinh_trang === "loi_nhe").length,
    loi_nang:  ds.filter(d => d.tinh_trang === "loi_nang").length,
    cho_xu_ly: ds.filter(d => d.da_qc && d.huong_xu_ly === "chua_xu_ly").length,
    pct_qc:    ds.length === 0 ? 0 : Math.round(ds.filter(d => d.da_qc).length / ds.length * 100),
  };
}

// ─── Tính trạng thái phiếu từ danh sách QC ───────────────────────────────────

export function tinh_trang_thai_phieu(phieu: PhieuHangHoan): PhieuHangHoan["trang_thai"] {
  const ds = phieu.danh_sach;
  if (ds.length === 0) return "cho_qc";
  if (ds.every(d => d.da_qc && d.huong_xu_ly !== "chua_xu_ly")) return "hoan_thanh";
  if (ds.some(d => d.da_qc)) return "cho_xu_ly";
  return "dang_qc";
}
