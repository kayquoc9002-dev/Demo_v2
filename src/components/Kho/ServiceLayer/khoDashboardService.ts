// ─────────────────────────────────────────────────────────────────────────────
// khoDashboardService.ts — Tổng hợp data từ tất cả module cho Dashboard
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "../ServiceLayer2/database";
import { MOCK_PHIEU_HANG_HOAN, MOCK_PHIEU_SU_CO } from "../data/returnsMockData";
import { MOCK_PHIEU_KIEM_KE } from "../data/inventoryMockData";
import { MOCK_NODES } from "../data/warehouseMockData";
import { la_leaf_node } from "../data/warehouseHelpers";

export interface CanhBaoThoiGian {
  loai:     "don_ngam" | "hang_hoan_ton" | "su_co_ton";
  mo_ta:    string;
  so_luong: number;
  mau:      "do" | "cam";
}

export interface DashboardData {
  // Cụm Xuất
  xuat: {
    dang_nhat:     number;  // Đang nhặt hàng
    cho_dong_goi:  number;  // Nhặt xong + đang packing
    cho_shipping:  number;  // Chờ ĐVVC lấy
  };

  // Cụm Nhập
  nhap: {
    cho_qc:   number;  // Đang QC
    cho_cat:  number;  // Chờ cất kệ
  };

  // Cụm Cảnh báo
  canh_bao_su_kien: {
    hang_hoan:    number;  // Hàng hoàn chờ QC
    su_co:        number;  // Sự cố chưa xử lý
    kiem_ke:      number;  // Kiểm kê chờ duyệt
  };

  // Cảnh báo thời gian
  canh_bao_thoi_gian: CanhBaoThoiGian[];

  // Tồn kho
  ton_kho: {
    tong_sku:        number;
    tong_san_pham:   number;
    tong_o:          number;  // Tổng số ô/bin trong kho
    o_co_hang:       number;  // Ô đang có hàng
    pct_lay_day:     number;  // % lấp đầy
    sap_het:         number;
    vuot_max:        number;
    ds_sap_het: {
      ma_sku:        string;
      ten_sp:        string;
      so_luong:      number;
      dinh_muc_min:  number;
      location_code: string;
    }[];
  };

  // Hoạt động hôm nay
  hom_nay: {
    phieu_nhap_moi: number;
    phieu_nhat_moi: number;
    hang_hoan_moi:  number;
    su_co_moi:      number;
  };
}

const GIO = 1000 * 60 * 60;
const NGAY = GIO * 24;

export async function layDashboardData(): Promise<DashboardData> {
  const now     = Date.now();
  const hom_nay = new Date().toDateString();

  // ── Module 3 ──────────────────────────────────────────────────────────────
  const phieu_nhap     = db.phieu_nhap;
  const cho_qc         = phieu_nhap.filter(p => p.trang_thai === "dang_kiem_tra").length;
  const cho_cat        = phieu_nhap.filter(p => p.trang_thai === "cho_cat_ke").length;
  const phieu_nhap_moi = phieu_nhap.filter(p => new Date(p.ngay_tao).toDateString() === hom_nay).length;

  // ── Module 4 ──────────────────────────────────────────────────────────────
  const phieu_nhat     = db.phieu_nhat;
  const dang_nhat      = phieu_nhat.filter(p => p.trang_thai === "dang_nhat" || p.trang_thai === "cho_nhat").length;
  const cho_dong_goi   = phieu_nhat.filter(p => p.trang_thai === "nhat_xong" || p.trang_thai === "dang_packing").length;
  const cho_shipping   = phieu_nhat.filter(p => p.trang_thai === "cho_shipping").length;
  const phieu_nhat_moi = phieu_nhat.filter(p => new Date(p.ngay_tao).toDateString() === hom_nay).length;

  // ── Module 5 — Tồn kho ───────────────────────────────────────────────────
  const ton_kho    = db.ton_kho;
  const leaf_nodes = MOCK_NODES.filter(n => la_leaf_node(n.id, MOCK_NODES) && n.trang_thai === "active");
  const tong_o     = leaf_nodes.length;
  const o_co_hang  = new Set(ton_kho.filter(t => t.so_luong > 0).map(t => t.node_id)).size;
  const pct_lay_day = tong_o > 0 ? Math.round(o_co_hang / tong_o * 100) : 0;

  const sku_unique   = [...new Set(ton_kho.map(t => t.ma_sku))];
  const sap_het_list = ton_kho.filter(t => t.dinh_muc_min > 0 && t.so_luong < t.dinh_muc_min);
  const vuot_max     = ton_kho.filter(t => t.dinh_muc_max > 0 && t.so_luong > t.dinh_muc_max).length;

  // ── Module 6 ──────────────────────────────────────────────────────────────
  const hang_hoan        = MOCK_PHIEU_HANG_HOAN;
  const su_co            = MOCK_PHIEU_SU_CO;
  const hang_hoan_cho_qc = hang_hoan.filter(p => ["cho_qc","dang_qc","cho_xu_ly"].includes(p.trang_thai)).length;
  const su_co_cho_xu_ly  = su_co.filter(p => p.trang_thai === "cho_xu_ly").length;
  const hang_hoan_moi    = hang_hoan.filter(p => new Date(p.ngay_tao).toDateString() === hom_nay).length;
  const su_co_moi        = su_co.filter(p => new Date(p.ngay_tao).toDateString() === hom_nay).length;
  const kiem_ke_cho_duyet= MOCK_PHIEU_KIEM_KE.filter(p => p.trang_thai === "cho_duyet").length;

  // ── Cảnh báo thời gian ────────────────────────────────────────────────────
  const canh_bao_thoi_gian: CanhBaoThoiGian[] = [];

  // Đơn hàng ngâm > 24h chưa xuất
  const don_ngam = phieu_nhat.filter(p =>
    ["cho_nhat","dang_nhat","nhat_xong","dang_packing"].includes(p.trang_thai) &&
    now - new Date(p.ngay_tao).getTime() > NGAY
  ).length;
  if (don_ngam > 0) canh_bao_thoi_gian.push({
    loai: "don_ngam", mau: "do", so_luong: don_ngam,
    mo_ta: `${don_ngam} phiếu xuất chưa xử lý quá 24 giờ`,
  });

  // Hàng hoàn tồn > 3 ngày chưa QC
  const hang_hoan_ton = hang_hoan.filter(p =>
    ["cho_qc","dang_qc"].includes(p.trang_thai) &&
    now - new Date(p.ngay_tao).getTime() > NGAY * 3
  ).length;
  if (hang_hoan_ton > 0) canh_bao_thoi_gian.push({
    loai: "hang_hoan_ton", mau: "cam", so_luong: hang_hoan_ton,
    mo_ta: `${hang_hoan_ton} lô hàng hoàn nằm kho hơn 3 ngày chưa QC`,
  });

  // Sự cố tồn > 2 ngày chưa xử lý
  const su_co_ton = su_co.filter(p =>
    p.trang_thai === "cho_xu_ly" &&
    now - new Date(p.ngay_tao).getTime() > NGAY * 2
  ).length;
  if (su_co_ton > 0) canh_bao_thoi_gian.push({
    loai: "su_co_ton", mau: "cam", so_luong: su_co_ton,
    mo_ta: `${su_co_ton} sự cố hàng hóa chưa xử lý quá 2 ngày`,
  });

  return {
    xuat: { dang_nhat, cho_dong_goi, cho_shipping },
    nhap: { cho_qc, cho_cat },
    canh_bao_su_kien: { hang_hoan: hang_hoan_cho_qc, su_co: su_co_cho_xu_ly, kiem_ke: kiem_ke_cho_duyet },
    canh_bao_thoi_gian,
    ton_kho: {
      tong_sku:      sku_unique.length,
      tong_san_pham: ton_kho.reduce((s, t) => s + t.so_luong, 0),
      tong_o, o_co_hang, pct_lay_day,
      sap_het: sap_het_list.length,
      vuot_max,
      ds_sap_het: sap_het_list
        .sort((a, b) => a.so_luong - b.so_luong)
        .slice(0, 5)
        .map(t => ({
          ma_sku: t.ma_sku, ten_sp: t.ten_sp,
          so_luong: t.so_luong, dinh_muc_min: t.dinh_muc_min,
          location_code: t.location_code,
        })),
    },
    hom_nay: { phieu_nhap_moi, phieu_nhat_moi, hang_hoan_moi, su_co_moi },
  };
}