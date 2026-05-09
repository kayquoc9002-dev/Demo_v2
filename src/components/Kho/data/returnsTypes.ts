// ─────────────────────────────────────────────────────────────────────────────
// returnsTypes.ts — Types cho Module 6: Sự cố & Hàng hoàn
// ─────────────────────────────────────────────────────────────────────────────

// ─── Tình trạng hàng hoàn (QC) ───────────────────────────────────────────────

export type TinhTrangHang =
  | "moi_100"      // 🟢 Loại 1: Mới 100%, còn nguyên tag → lên kệ bán tiếp
  | "loi_nhe"      // 🟡 Loại 2: Dơ/nhẹ, có thể giặt/ủi → quarantine xử lý
  | "loi_nang";    // 🔴 Loại 3: Rách, hư hỏng → quarantine, không bán

export const TINH_TRANG_CONFIG: Record<TinhTrangHang, {
  nhan:    string;
  mo_ta:   string;
  mau:     string;
  nen:     string;
  icon:    string;
  dinh_tuyen: "staging" | "quarantine";
}> = {
  moi_100:  {
    nhan:  "Mới 100%",
    mo_ta: "Nguyên vẹn, còn tag — có thể bán tiếp ngay",
    mau:   "#10b981", nen: "#06472520", icon: "🟢",
    dinh_tuyen: "staging",
  },
  loi_nhe: {
    nhan:  "Lỗi nhẹ",
    mo_ta: "Dơ/bụi/nhăn — cần giặt hoặc ủi lại",
    mau:   "#f59e0b", nen: "#78350f20", icon: "🟡",
    dinh_tuyen: "quarantine",
  },
  loi_nang: {
    nhan:  "Lỗi nặng",
    mo_ta: "Rách vải, sứt chỉ, rớt nút — không thể bán",
    mau:   "#ef4444", nen: "#7f1d1d20", icon: "🔴",
    dinh_tuyen: "quarantine",
  },
};

// ─── Loại sự cố trong kho ────────────────────────────────────────────────────

export type LyDoSuCo =
  | "hang_o_vang"       // Ố vàng do ẩm mốc
  | "hang_bi_rach"      // Rách vải khi lấy
  | "hang_bi_uot"       // Ướt/hỏng do rò rỉ
  | "mat_tag"           // Mất tag/nhãn sản phẩm
  | "dong_goi_sai"      // Đóng gói sai SKU
  | "khac";             // Lý do khác (bắt buộc nhập mô tả)

export const LY_DO_SU_CO_CONFIG: Record<LyDoSuCo, { nhan: string; icon: string }> = {
  hang_o_vang:  { nhan: "Hàng bị ố vàng / ẩm mốc",    icon: "🟡" },
  hang_bi_rach: { nhan: "Hàng bị rách trong khi lấy",  icon: "🔴" },
  hang_bi_uot:  { nhan: "Hàng bị ướt / hỏng",          icon: "💧" },
  mat_tag:      { nhan: "Mất tag / nhãn sản phẩm",      icon: "🏷️" },
  dong_goi_sai: { nhan: "Đóng gói nhầm SKU",            icon: "📦" },
  khac:         { nhan: "Lý do khác",                    icon: "📝" },
};

// ─── Hướng xử lý hàng lỗi ───────────────────────────────────────────────────

export type HuongXuLy =
  | "chua_xu_ly"        // Chờ quyết định
  | "len_ke_ban_tiep"   // Loại 1: đưa lên kệ bán
  | "tra_xuong_ncc"     // Trả về xưởng/NCC để đổi
  | "thanh_ly"          // Thanh lý / bán giá rẻ
  | "huy_bo";           // Hủy bỏ hoàn toàn

export const HUONG_XU_LY_CONFIG: Record<HuongXuLy, {
  nhan: string; mau: string; icon: string;
}> = {
  chua_xu_ly:      { nhan: "Chờ xử lý",     mau: "#475569", icon: "⏳" },
  len_ke_ban_tiep: { nhan: "Lên kệ bán",    mau: "#10b981", icon: "✅" },
  tra_xuong_ncc:   { nhan: "Trả xưởng/NCC", mau: "#38bdf8", icon: "🔄" },
  thanh_ly:        { nhan: "Thanh lý",      mau: "#f59e0b", icon: "💰" },
  huy_bo:          { nhan: "Huỷ bỏ",        mau: "#ef4444", icon: "🗑️" },
};

// ─── Phiếu hàng hoàn (từ ĐVVC) ───────────────────────────────────────────────

export type TrangThaiHangHoan =
  | "cho_qc"        // Đã tiếp nhận bưu kiện, chưa khui hàng
  | "dang_qc"       // Đang kiểm định từng SKU
  | "cho_xu_ly"     // QC xong, chờ phân luồng
  | "hoan_thanh";   // Đã xử lý xong tất cả

export interface DongHangHoan {
  id:            string;
  phieu_id:      string;
  ma_sku:        string;
  ten_sp:        string;
  so_luong:      number;        // Số lượng dự kiến (theo đơn hàng gốc)
  tinh_trang:    TinhTrangHang | null;  // null = chưa QC
  huong_xu_ly:   HuongXuLy;
  ghi_chu:       string;
  da_qc:         boolean;
}

export interface PhieuHangHoan {
  id:              string;
  ma_phieu:        string;      // VD: "HH-2026-041"
  ma_van_don:      string;      // Mã vận đơn ĐVVC
  don_id:          string;      // Đơn hàng gốc
  ma_don:          string;
  ten_khach:       string;
  dvvc:            string;
  trang_thai:      TrangThaiHangHoan;
  nguon:           "dvvc";      // Luồng 1: hàng hoàn từ ĐVVC
  ngay_tao:        string;
  ngay_hoan_thanh: string;
  ghi_chu:         string;
  danh_sach:       DongHangHoan[];
}

// ─── Phiếu sự cố trong kho ───────────────────────────────────────────────────

export type TrangThaiSuCo =
  | "cho_xu_ly"     // Mới báo lỗi
  | "da_chuyen_kho" // Đã chuyển sang khu hàng lỗi
  | "da_xu_ly";     // Đã có hướng xử lý cuối

export interface PhieuSuCo {
  id:            string;
  ma_phieu:      string;        // VD: "SC-2026-018"
  ma_sku:        string;
  ten_sp:        string;
  so_luong:      number;
  ly_do:         LyDoSuCo;
  mo_ta_them:    string;        // Bắt buộc nếu ly_do === "khac"
  node_id_nguon: string;        // Kệ đang chứa hàng lỗi
  location_nguon:string;
  trang_thai:    TrangThaiSuCo;
  huong_xu_ly:   HuongXuLy;
  nguoi_bao:     string;
  ngay_tao:      string;
  ghi_chu:       string;
}


// ─── Config hiển thị trạng thái ──────────────────────────────────────────────

export const TRANG_THAI_HANG_HOAN_CONFIG: Record<string, {
  nhan: string; mau: string; nen: string;
}> = {
  cho_qc:     { nhan: "Chờ QC",      mau: "#64748b", nen: "#1e293b"    },
  dang_qc:    { nhan: "Đang QC",     mau: "#f59e0b", nen: "#78350f20"  },
  cho_xu_ly:  { nhan: "Chờ xử lý",  mau: "#a78bfa", nen: "#4c1d9520"  },
  hoan_thanh: { nhan: "Hoàn thành", mau: "#10b981", nen: "#06472520"  },
};

export const TRANG_THAI_SU_CO_CONFIG: Record<string, {
  nhan: string; mau: string; nen: string;
}> = {
  cho_xu_ly:    { nhan: "Chờ xử lý",      mau: "#f59e0b", nen: "#78350f20" },
  da_chuyen_kho:{ nhan: "Đã chuyển kho",  mau: "#38bdf8", nen: "#0c435420" },
  da_xu_ly:     { nhan: "Đã xử lý",       mau: "#10b981", nen: "#06472520" },
};