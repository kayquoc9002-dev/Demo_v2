// ─────────────────────────────────────────────────────────────────────────────
// inboundHelpers.ts — Pure functions cho Module 3: Nhập Kho
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PhieuNhapKho,
  ChiTietPhieuNhap,
  PhieuNhapStats,
  TrangThaiPhieuNhap,
  PutAwayItem,
} from "./inboundTypes";
import type { SkuLocationRule, LocationNode } from "./warehouseTypes";
import { tinh_location_code } from "./warehouseHelpers";

// ─── ID & mã phiếu ───────────────────────────────────────────────────────────

export function gen_id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function gen_ma_phieu(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const seq = String(Math.floor(Math.random() * 900) + 100);
  return `PN-${yyyy}-${seq}`;
}

// ─── Tính stats của 1 phiếu ──────────────────────────────────────────────────

export function tinh_stats_phieu(phieu: PhieuNhapKho): PhieuNhapStats {
  const ct = phieu.chi_tiet;
  const tong_sku = ct.length;
  const da_kiem = ct.filter((c) => c.trang_thai_qc !== "chua_kiem").length;
  const so_dat = ct.reduce((s, c) => s + c.so_luong_dat, 0);
  const so_loi = ct.reduce((s, c) => s + c.so_luong_loi, 0);
  const da_cat_ke = ct.filter((c) => c.da_cat_ke).length;
  const con_lai_cat = ct.filter(
    (c) => !c.da_cat_ke && c.so_luong_dat > 0,
  ).length;

  const pct = tong_sku === 0 ? 0 : Math.round((da_cat_ke / tong_sku) * 100);

  return {
    tong_sku,
    da_kiem,
    so_dat,
    so_loi,
    da_cat_ke,
    con_lai_cat,
    pct_hoan_thanh: pct,
  };
}

// ─── Tự động cập nhật trạng thái phiếu từ chi tiết ──────────────────────────

export function tinh_trang_thai_phieu(phieu: PhieuNhapKho): TrangThaiPhieuNhap {
  const ct = phieu.chi_tiet;

  if (ct.length === 0) return "cho_hang_ve";

  const tat_ca_cat = ct.every((c) => c.da_cat_ke || c.so_luong_dat === 0);
  const tat_ca_kiem = ct.every((c) => c.trang_thai_qc !== "chua_kiem");
  const co_loi_nang = ct.some((c) => c.trang_thai_qc === "loi_nang");
  const co_thieu = ct.some((c) => c.trang_thai_qc === "thieu_hang");

  if (tat_ca_cat) return "hoan_thanh";
  if (co_loi_nang || co_thieu) return "co_van_de";
  if (tat_ca_kiem) return "cho_cat_ke";
  if (ct.some((c) => c.trang_thai_qc !== "chua_kiem")) return "dang_kiem_tra";

  return "cho_hang_ve";
}

// ─── Gợi ý vị trí put-away từ SKU rules ──────────────────────────────────────

export function goi_y_vi_tri(
  ma_sku: string,
  rules: SkuLocationRule[],
): string | null {
  // Ưu tiên primary pick bin
  const primary = rules.find(
    (r) => r.ma_sku === ma_sku && r.la_vi_tri_mac_dinh,
  );
  if (primary) return primary.node_id;

  // Fallback: rule đầu tiên của SKU này
  const any = rules.find((r) => r.ma_sku === ma_sku);
  return any?.node_id ?? null;
}

// ─── Tạo PutAwayItem từ chi tiết phiếu ───────────────────────────────────────

export function tao_put_away_items(
  phieu: PhieuNhapKho,
  rules: SkuLocationRule[],
): PutAwayItem[] {
  return phieu.chi_tiet
    .filter((c) => !c.da_cat_ke && c.so_luong_dat > 0)
    .map((c) => ({
      chi_tiet_id: c.id,
      ma_sku: c.ma_sku,
      ten_sp: c.ten_sp,
      so_luong_can: c.so_luong_dat - c.so_luong_da_cat,
      so_luong_cat: c.so_luong_dat - c.so_luong_da_cat,
      node_goi_y: goi_y_vi_tri(c.ma_sku, rules),
      node_chon: goi_y_vi_tri(c.ma_sku, rules) ?? "",
      da_xac_nhan: false,
    }));
}

// ─── Format location code cho display ────────────────────────────────────────

export function lay_location_text(
  node_id: string,
  nodes: LocationNode[],
): string {
  if (!node_id) return "—";
  return tinh_location_code(node_id, nodes) || "—";
}

// ─── Validate form tạo phiếu ─────────────────────────────────────────────────

export interface ValidationResult {
  ok: boolean;
  loi: string[];
}

export function validate_tao_phieu(data: {
  nha_cung_cap: string;
  ngay_du_kien: string;
  loai: string;
  ly_do: string;
  chi_tiet: { ma_sku: string; so_luong_po: number }[];
}): ValidationResult {
  const loi: string[] = [];

  if (!data.nha_cung_cap.trim()) loi.push("Nhà cung cấp không được để trống");

  if (!data.ngay_du_kien) loi.push("Phải chọn ngày dự kiến nhận hàng");

  if (data.loai === "nhap_khac" && !data.ly_do.trim())
    loi.push("Nhập khác bắt buộc phải có lý do");

  if (data.chi_tiet.length === 0)
    loi.push("Phiếu nhập phải có ít nhất 1 dòng hàng");

  const invalid_sl = data.chi_tiet.filter((c) => c.so_luong_po <= 0);
  if (invalid_sl.length > 0) loi.push("Số lượng phải lớn hơn 0");

  return { ok: loi.length === 0, loi };
}

// ─── Config hiển thị trạng thái ──────────────────────────────────────────────

export const TRANG_THAI_PHIEU_CONFIG: Record<
  string,
  {
    nhan: string;
    mau: string;
    nen: string;
  }
> = {
  cho_hang_ve: { nhan: "Chờ hàng về", mau: "#38bdf8", nen: "#0c435420" },
  dang_kiem_tra: { nhan: "Đang kiểm tra", mau: "#f59e0b", nen: "#78350f20" },
  cho_cat_ke: { nhan: "Chờ cất kệ", mau: "#a78bfa", nen: "#4c1d9520" },
  hoan_thanh: { nhan: "Hoàn thành", mau: "#10b981", nen: "#06472520" },
  co_van_de: { nhan: "Có vấn đề", mau: "#ef4444", nen: "#7f1d1d20" },
};

export const TRANG_THAI_QC_CONFIG: Record<
  string,
  {
    nhan: string;
    mau: string;
  }
> = {
  chua_kiem: { nhan: "Chưa kiểm", mau: "#475569" },
  dat: { nhan: "Đạt", mau: "#10b981" },
  loi_nhe: { nhan: "Lỗi nhẹ", mau: "#f59e0b" },
  loi_nang: { nhan: "Lỗi nặng", mau: "#ef4444" },
  thieu_hang: { nhan: "Thiếu hàng", mau: "#f97316" },
};

export const LOAI_PHIEU_CONFIG: Record<
  string,
  {
    nhan: string;
    mo_ta: string;
    icon: string;
  }
> = {
  tu_don_dat_hang: {
    nhan: "Nhập từ đơn đặt hàng",
    mo_ta: "Có PO trước — luồng chuẩn",
    icon: "📋",
  },
  khong_co_po: {
    nhan: "Nhập không có PO",
    mo_ta: "Hàng về bất ngờ từ xưởng/NCC",
    icon: "📦",
  },
  nhap_khac: {
    nhan: "Nhập khác",
    mo_ta: "Hàng mẫu, bù kiểm kê... (cần lý do)",
    icon: "📝",
  },
};
