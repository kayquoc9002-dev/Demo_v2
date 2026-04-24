// ─────────────────────────────────────────────────────────────────────────────
// orderData.ts — Types, mock data & helpers cho module Đơn hàng
// Naming: snake_case tiếng Việt, nhất quán với DB schema
// ─────────────────────────────────────────────────────────────────────────────

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Trạng thái đơn hàng / vận chuyển
 * Tách riêng khỏi trạng thái thanh toán — 2 trục độc lập
 */
export type TrangThaiDon =
  | "cho_xu_ly"              // Đơn mới, chờ kho kiểm tra tồn kho
  | "dang_san_xuat"          // Xưởng đang cắt may / lấy hàng bổ sung
  | "cho_giao_van_chuyen"    // Đóng gói xong, chờ ĐVVC đến lấy
  | "dang_van_chuyen"        // Đã giao ĐVVC, có mã vận đơn
  | "hoan_thanh"             // Khách nhận hàng, không khiếu nại
  | "da_huy"                 // Hủy trước khi gửi
  | "giao_that_bai"          // Khách không nhận, hàng đang hoàn về kho chính
  | "tra_hang_loi";          // Khách trả lại do lỗi / sai size → nhập kho hàng lỗi

/**
 * Trạng thái thanh toán — kế toán là chủ quản
 */
export type TrangThaiThanhToan =
  | "chua_thanh_toan"        // COD chưa thu / khách sỉ mua nợ
  | "da_coc"                 // Khách sỉ cọc 30–50% trước khi sản xuất
  | "da_thanh_toan"          // Đã thu đủ tiền
  | "cho_doi_soat"           // Tiền COD đang ở ĐVVC, chờ chuyển về
  | "da_hoan_tien";          // Đã hoàn tiền cho đơn lỗi / trả hàng

export type KenhBan =
  | "shopee"
  | "tiktok"
  | "facebook"
  | "khach_si"
  | "cua_hang";

export type PhuongThucTT =
  | "tien_mat"
  | "chuyen_khoan"
  | "cod"
  | "qr";

export type VaiTro = "admin" | "sale" | "kho" | "ke_toan";

// ─── Interface gốc (đầy đủ — admin) ─────────────────────────────────────────

/** Từng dòng sản phẩm — snapshot tại thời điểm bán */
export interface DonHangItem {
  ma_sku:        string;   // VD: "AT001-M-TRANG"
  ten_sp:        string;
  mau_sac:       string;
  kich_thuoc:    string;
  vi_tri_ke?:    string;   // VD: "KhuA-O01" — kho dùng để lấy hàng
  so_luong:      number;
  don_gia:       number;   // Giá bán tại thời điểm (snapshot)
  gia_von?:      number;   // Giá vốn — chỉ kế toán thấy
  thanh_tien:    number;   // = don_gia × so_luong
  so_luong_loi?: number;   // Số lượng bị lỗi / trả về
}

/** Lịch sử thay đổi trạng thái — truy cứu trách nhiệm */
export interface LichSuTrangThai {
  trang_thai:      TrangThaiDon;
  thoi_gian:       string;         // ISO 8601
  nguoi_thao_tac:  string;
  ghi_chu?:        string;
}

/** Đơn hàng đầy đủ — source of truth, BE trả về cho admin */
export interface DonHang {
  id:             string;
  ma_don:         string;          // "DH-2026-0001"
  ngay_tao:       string;
  ngay_cap_nhat:  string;
  kenh_ban:       KenhBan;

  khach_hang: {
    ten:             string;
    so_dien_thoai:   string;
    dia_chi:         string;
    thanh_pho:       string;
    ten_cong_ty?:    string;
    ma_so_thue?:     string;
  };

  san_pham:               DonHangItem[];
  trang_thai_don:         TrangThaiDon;
  trang_thai_thanh_toan:  TrangThaiThanhToan;
  phuong_thuc_tt:         PhuongThucTT;
  ma_van_don?:            string;
  don_vi_vc?:             string;
  ma_kho?:                string;

  // Tài chính
  tam_tinh:       number;          // Tổng giá trước chiết khấu
  chiet_khau:     number;
  phi_ship:       number;          // Phí ship khách chịu
  tong_cong:      number;          // = tam_tinh - chiet_khau + phi_ship
  da_thanh_toan:  number;
  con_no:         number;          // Virtual column: tong_cong - da_thanh_toan

  ghi_chu:  string;
  lich_su:  LichSuTrangThai[];
}

// ─── 3 View interfaces theo role ─────────────────────────────────────────────
// TODO: Khi nối API thật, thay MOCK_DON_HANG bằng:
//   Sale:    GET /api/don-hang?view=sale
//   Kho:     GET /api/don-hang?view=kho
//   KeToan:  GET /api/don-hang?view=ke_toan
//   Admin:   GET /api/don-hang (full)

/**
 * View Sale / CSKH
 * Có: thông tin khách đầy đủ, items (ẩn giá vốn + vị trí kệ),
 *     trạng thái TT, mã vận đơn, tổng tiền, công nợ
 */
export interface DonHangViewSale
  extends Omit<DonHang, "san_pham" | "ma_kho"> {
  san_pham: Omit<DonHangItem, "gia_von" | "vi_tri_ke">[];
}

/**
 * View Kho
 * Có: tên SP, SKU, màu, size, vị trí kệ, mã vận đơn, địa chỉ giao
 * Không có: giá bán, giá vốn, chiết khấu, trạng thái TT, công nợ
 */
export interface DonHangViewKho {
  id:             string;
  ma_don:         string;
  ngay_tao:       string;
  kenh_ban:       KenhBan;
  khach_hang: Pick<DonHang["khach_hang"], "ten" | "so_dien_thoai" | "dia_chi" | "thanh_pho">;
  san_pham: Pick<DonHangItem,
    "ma_sku" | "ten_sp" | "mau_sac" | "kich_thuoc" | "vi_tri_ke" | "so_luong" | "so_luong_loi"
  >[];
  trang_thai_don:   TrangThaiDon;
  phuong_thuc_tt:   PhuongThucTT;   // Cần biết COD hay không để dán bill đúng
  ma_van_don?:      string;
  don_vi_vc?:       string;
  ma_kho?:          string;
  ghi_chu:          string;
  // Lịch sử kho chỉ thấy ghi chú hướng dẫn, không thấy ai thao tác tài chính
  lich_su: Pick<LichSuTrangThai, "trang_thai" | "thoi_gian" | "ghi_chu">[];
}

/**
 * View Kế toán
 * Có: tất cả tài chính, giá vốn, lịch sử đầy đủ
 * Không có: vị trí kệ (không liên quan)
 */
export interface DonHangViewKeToan
  extends Omit<DonHang, "san_pham" | "ma_van_don" | "don_vi_vc" | "ma_kho"> {
  san_pham: Omit<DonHangItem, "vi_tri_ke">[];   // Có gia_von
  ma_van_don?: string;                           // Kế toán thấy khi cần đối soát
}

// ─── Config hiển thị ─────────────────────────────────────────────────────────

export const TRANG_THAI_DON_CONFIG: Record<TrangThaiDon, {
  nhan:                   string;
  mau:                    string;
  nen:                    string;
  trang_thai_tiep_theo:   TrangThaiDon[];
  role_thao_tac:          VaiTro[];
}> = {
  cho_xu_ly:           { nhan: "Chờ xử lý",      mau: "#f59e0b", nen: "#78350f25", trang_thai_tiep_theo: ["dang_san_xuat", "cho_giao_van_chuyen", "da_huy"], role_thao_tac: ["kho", "admin"] },
  dang_san_xuat:       { nhan: "Đang sản xuất",   mau: "#38bdf8", nen: "#0c435425", trang_thai_tiep_theo: ["cho_giao_van_chuyen", "da_huy"],                  role_thao_tac: ["kho", "admin"] },
  cho_giao_van_chuyen: { nhan: "Chờ giao VC",     mau: "#a78bfa", nen: "#4c1d9525", trang_thai_tiep_theo: ["dang_van_chuyen", "da_huy"],                       role_thao_tac: ["kho", "admin"] },
  dang_van_chuyen:     { nhan: "Đang vận chuyển", mau: "#818cf8", nen: "#3730a325", trang_thai_tiep_theo: ["hoan_thanh", "giao_that_bai"],                     role_thao_tac: ["kho", "admin"] },
  hoan_thanh:          { nhan: "Hoàn thành",      mau: "#10b981", nen: "#06472525", trang_thai_tiep_theo: [],                                                  role_thao_tac: [] },
  da_huy:              { nhan: "Đã huỷ",          mau: "#ef4444", nen: "#7f1d1d25", trang_thai_tiep_theo: [],                                                  role_thao_tac: [] },
  giao_that_bai:       { nhan: "Giao thất bại",   mau: "#f97316", nen: "#7c2d1225", trang_thai_tiep_theo: ["dang_van_chuyen", "da_huy"],                       role_thao_tac: ["kho", "admin"] },
  tra_hang_loi:        { nhan: "Trả hàng lỗi",    mau: "#fb7185", nen: "#88152525", trang_thai_tiep_theo: ["hoan_thanh"],                                      role_thao_tac: ["ke_toan", "admin"] },
};

export const TRANG_THAI_TT_CONFIG: Record<TrangThaiThanhToan, {
  nhan:          string;
  mau:           string;
  nen:           string;
  role_thao_tac: VaiTro[];
}> = {
  chua_thanh_toan: { nhan: "Chưa thanh toán", mau: "#f59e0b", nen: "#78350f25", role_thao_tac: ["ke_toan", "admin"] },
  da_coc:          { nhan: "Đã cọc",          mau: "#38bdf8", nen: "#0c435425", role_thao_tac: ["ke_toan", "admin"] },
  da_thanh_toan:   { nhan: "Đã thanh toán",   mau: "#10b981", nen: "#06472525", role_thao_tac: ["ke_toan", "admin"] },
  cho_doi_soat:    { nhan: "Chờ đối soát",    mau: "#a78bfa", nen: "#4c1d9525", role_thao_tac: ["ke_toan", "admin"] },
  da_hoan_tien:    { nhan: "Đã hoàn tiền",    mau: "#94a3b8", nen: "#1e293b",   role_thao_tac: ["ke_toan", "admin"] },
};

export const KENH_BAN_CONFIG: Record<KenhBan, {
  nhan:        string;
  bieu_tuong:  string;
  mau:         string;
}> = {
  shopee:   { nhan: "Shopee",   bieu_tuong: "🛒", mau: "#f97316" },
  tiktok:   { nhan: "TikTok",   bieu_tuong: "🎵", mau: "#ec4899" },
  facebook: { nhan: "Facebook", bieu_tuong: "📘", mau: "#3b82f6" },
  khach_si: { nhan: "Khách sỉ", bieu_tuong: "🏭", mau: "#10b981" },
  cua_hang: { nhan: "Cửa hàng", bieu_tuong: "🏪", mau: "#c17f44" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const dinh_dang_tien = (so: number) =>
  so.toLocaleString("vi-VN") + "đ";

export const dinh_dang_tien_ngan = (so: number) =>
  so >= 1_000_000
    ? (so / 1_000_000).toFixed(1).replace(".0", "") + "M"
    : so >= 1_000
    ? (so / 1_000).toFixed(0) + "K"
    : String(so);

export const dinh_dang_ngay = (chuoi: string) =>
  new Date(chuoi).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

export const dinh_dang_ngay_ngan = (chuoi: string) =>
  new Date(chuoi).toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });

/** Trạng thái cần xử lý — đang chờ hành động từ cửa hàng */
export const TRANG_THAI_CAN_XU_LY: TrangThaiDon[] = [
  "cho_xu_ly",
  "dang_san_xuat",
  "cho_giao_van_chuyen",
  "tra_hang_loi",
  "giao_that_bai",
];

/** Tính thống kê tổng quan */
export const tinh_thong_ke = (ds_don: DonHang[]) => {
  const hoan_thanh = ds_don.filter(o => o.trang_thai_don === "hoan_thanh");
  const chua_huy   = ds_don.filter(o => o.trang_thai_don !== "da_huy");
  return {
    tong_don:             ds_don.length,
    can_xu_ly_ngay:       ds_don.filter(o => TRANG_THAI_CAN_XU_LY.includes(o.trang_thai_don)).length,
    dang_van_chuyen:      ds_don.filter(o => o.trang_thai_don === "dang_van_chuyen").length,
    hoan_thanh:           hoan_thanh.length,
    da_huy:               ds_don.filter(o => o.trang_thai_don === "da_huy").length,
    hang_loi:             ds_don.filter(o => o.trang_thai_don === "tra_hang_loi").length,
    giao_that_bai:        ds_don.filter(o => o.trang_thai_don === "giao_that_bai").length,
    doanh_thu_hoan_thanh: hoan_thanh.reduce((s, o) => s + o.tong_cong, 0),
    tong_thuc_thu:        ds_don.reduce((s, o) => s + o.da_thanh_toan, 0),
    tong_con_no:          chua_huy.reduce((s, o) => s + o.con_no, 0),
    cho_doi_soat:         ds_don.filter(o => o.trang_thai_thanh_toan === "cho_doi_soat").reduce((s, o) => s + o.tong_cong, 0),
    ti_le_hoan_thanh:     ds_don.length > 0 ? Math.round(hoan_thanh.length / ds_don.length * 100) : 0,
  };
};

/** Thống kê theo kênh bán */
export const thong_ke_kenh_ban = (ds_don: DonHang[]) =>
  (Object.keys(KENH_BAN_CONFIG) as KenhBan[]).map(kenh => ({
    kenh,
    ...KENH_BAN_CONFIG[kenh],
    so_don:    ds_don.filter(o => o.kenh_ban === kenh).length,
    doanh_thu: ds_don
      .filter(o => o.kenh_ban === kenh && o.trang_thai_don === "hoan_thanh")
      .reduce((s, o) => s + o.tong_cong, 0),
  })).filter(k => k.so_don > 0).sort((a, b) => b.so_don - a.so_don);

/** Top sản phẩm bán chạy (đơn hoàn thành) */
export const top_san_pham = (ds_don: DonHang[], gioi_han = 5) => {
  const bang = new Map<string, { ten_sp: string; ma_sku: string; so_luong: number; doanh_thu: number }>();
  ds_don.filter(o => o.trang_thai_don === "hoan_thanh").forEach(o =>
    o.san_pham.forEach(item => {
      const cu = bang.get(item.ma_sku) ?? { ten_sp: item.ten_sp, ma_sku: item.ma_sku, so_luong: 0, doanh_thu: 0 };
      bang.set(item.ma_sku, { ...cu, so_luong: cu.so_luong + item.so_luong, doanh_thu: cu.doanh_thu + item.thanh_tien });
    })
  );
  return [...bang.values()].sort((a, b) => b.so_luong - a.so_luong).slice(0, gioi_han);
};

/** Nhóm đơn cần xử lý theo loại */
export const nhom_can_xu_ly = (ds_don: DonHang[]) => ({
  cho_xu_ly:     ds_don.filter(o => o.trang_thai_don === "cho_xu_ly"),
  dang_san_xuat: ds_don.filter(o => o.trang_thai_don === "dang_san_xuat"),
  cho_giao_vc:   ds_don.filter(o => o.trang_thai_don === "cho_giao_van_chuyen"),
  hang_loi:      ds_don.filter(o => o.trang_thai_don === "tra_hang_loi"),
  giao_that_bai: ds_don.filter(o => o.trang_thai_don === "giao_that_bai"),
});

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_DON_HANG: DonHang[] = [
  {
    id: "1", ma_don: "DH-2026-0001",
    ngay_tao: "2026-03-08T08:30:00", ngay_cap_nhat: "2026-03-08T08:30:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Nguyễn Thị Lan", so_dien_thoai: "0901234567", dia_chi: "45 Lê Lợi", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 2, don_gia: 159000, gia_von: 80000,  thanh_tien: 318000 },
      { ma_sku: "QS002-M-KEM",   ten_sp: "Quần Short Kaki",         mau_sac: "Kem",   kich_thuoc: "M", vi_tri_ke: "KhuB-O03", so_luong: 1, don_gia: 195000, gia_von: 95000,  thanh_tien: 195000 },
    ],
    trang_thai_don: "cho_xu_ly", trang_thai_thanh_toan: "cho_doi_soat",
    phuong_thuc_tt: "cod",
    tam_tinh: 513000, chiet_khau: 0, phi_ship: 30000, tong_cong: 543000,
    da_thanh_toan: 0, con_no: 543000,
    ghi_chu: "Giao giờ hành chính",
    lich_su: [{ trang_thai: "cho_xu_ly", thoi_gian: "2026-03-08T08:30:00", nguoi_thao_tac: "System", ghi_chu: "Đơn mới từ Shopee" }],
  },
  {
    id: "2", ma_don: "DH-2026-0002",
    ngay_tao: "2026-03-08T07:15:00", ngay_cap_nhat: "2026-03-08T09:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Trần Văn Minh", so_dien_thoai: "0912345678", dia_chi: "123 Nguyễn Huệ", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "VD003-S-HONG", ten_sp: "Váy Midi Floral", mau_sac: "Hồng đào", kich_thuoc: "S", vi_tri_ke: "KhuC-O02", so_luong: 1, don_gia: 420000, gia_von: 180000, thanh_tien: 420000 },
    ],
    trang_thai_don: "dang_san_xuat", trang_thai_thanh_toan: "da_coc",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 420000, chiet_khau: 0, phi_ship: 30000, tong_cong: 450000,
    da_thanh_toan: 150000, con_no: 300000,
    ghi_chu: "Đã cọc 150k — đang may thêm size S",
    lich_su: [
      { trang_thai: "cho_xu_ly",     thoi_gian: "2026-03-08T07:15:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat", thoi_gian: "2026-03-08T09:00:00", nguoi_thao_tac: "Minh Tuấn", ghi_chu: "Đang may thêm size S" },
    ],
  },
  {
    id: "3", ma_don: "DH-2026-0003",
    ngay_tao: "2026-03-07T14:00:00", ngay_cap_nhat: "2026-03-08T06:30:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty TNHH Thời Trang ABC", so_dien_thoai: "0287654321", dia_chi: "88 Điện Biên Phủ", thanh_pho: "TP. HCM", ten_cong_ty: "Công ty TNHH Thời Trang ABC", ma_so_thue: "0312345678" },
    san_pham: [
      { ma_sku: "AT001-M-DEN",   ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen",       kich_thuoc: "M",  vi_tri_ke: "KhuA-O01", so_luong: 50, don_gia: 119000, gia_von: 65000,  thanh_tien: 5950000 },
      { ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng",     kich_thuoc: "L",  vi_tri_ke: "KhuA-O02", so_luong: 30, don_gia: 119000, gia_von: 65000,  thanh_tien: 3570000 },
      { ma_sku: "QJ004-29-XNHT", ten_sp: "Quần Jean Skinny",       mau_sac: "Xanh nhạt", kich_thuoc: "29", vi_tri_ke: "KhuB-O05", so_luong: 20, don_gia: 285000, gia_von: 130000, thanh_tien: 5700000 },
    ],
    trang_thai_don: "dang_van_chuyen", trang_thai_thanh_toan: "da_coc",
    phuong_thuc_tt: "chuyen_khoan",
    ma_van_don: "GHTK-2026-38291", don_vi_vc: "GHTK",
    tam_tinh: 15220000, chiet_khau: 1522000, phi_ship: 0, tong_cong: 13698000,
    da_thanh_toan: 6849000, con_no: 6849000,
    ghi_chu: "Xuất HĐ GTGT · Cho nợ 30 ngày",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-07T14:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-03-07T16:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-08T05:00:00", nguoi_thao_tac: "Lan Anh", ghi_chu: "Đóng gói 3 kiện" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-03-08T06:30:00", nguoi_thao_tac: "Minh Tuấn", ghi_chu: "Bàn giao GHTK" },
    ],
  },
  {
    id: "4", ma_don: "DH-2026-0004",
    ngay_tao: "2026-03-06T10:00:00", ngay_cap_nhat: "2026-03-07T16:00:00",
    kenh_ban: "cua_hang",
    khach_hang: { ten: "Lê Thị Hoa", so_dien_thoai: "0934567890", dia_chi: "12 Trần Hưng Đạo", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "DW005-M-XNGOC",  ten_sp: "Đầm Wrap Cổ V",     mau_sac: "Xanh ngọc", kich_thuoc: "M",  vi_tri_ke: "KhuC-O04", so_luong: 1, don_gia: 580000, gia_von: 250000, thanh_tien: 580000 },
      { ma_sku: "GS006-37-TRANG", ten_sp: "Giày Sneaker Trắng", mau_sac: "Trắng",     kich_thuoc: "37", vi_tri_ke: "KhuD-O01", so_luong: 1, don_gia: 450000, gia_von: 200000, thanh_tien: 450000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "tien_mat",
    tam_tinh: 1030000, chiet_khau: 0, phi_ship: 0, tong_cong: 1030000,
    da_thanh_toan: 1030000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-06T10:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-06T11:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-03-06T14:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-03-07T16:00:00", nguoi_thao_tac: "System", ghi_chu: "Khách xác nhận nhận hàng" },
    ],
  },
  {
    id: "5", ma_don: "DH-2026-0005",
    ngay_tao: "2026-03-07T09:00:00", ngay_cap_nhat: "2026-03-07T11:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Phạm Quốc Bảo", so_dien_thoai: "0956789012", dia_chi: "77 Lý Tự Trọng", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AK007-L-DEN", ten_sp: "Áo Khoác Bomber", mau_sac: "Đen", kich_thuoc: "L", vi_tri_ke: "KhuA-O05", so_luong: 1, don_gia: 612000, gia_von: 280000, thanh_tien: 612000 },
    ],
    trang_thai_don: "da_huy", trang_thai_thanh_toan: "da_hoan_tien",
    phuong_thuc_tt: "cod",
    tam_tinh: 612000, chiet_khau: 0, phi_ship: 30000, tong_cong: 642000,
    da_thanh_toan: 0, con_no: 0,
    ghi_chu: "Khách huỷ — đổi size L sang XL",
    lich_su: [
      { trang_thai: "cho_xu_ly", thoi_gian: "2026-03-07T09:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "da_huy",    thoi_gian: "2026-03-07T11:00:00", nguoi_thao_tac: "Minh Tuấn", ghi_chu: "Khách yêu cầu huỷ, muốn đổi size" },
    ],
  },
  {
    id: "6", ma_don: "DH-2026-0006",
    ngay_tao: "2026-03-08T10:45:00", ngay_cap_nhat: "2026-03-08T10:45:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Hoàng Thị Mai", so_dien_thoai: "0978901234", dia_chi: "34 Pasteur", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "SB008-S-DEN",  ten_sp: "Set Đồ Bộ Thể Thao", mau_sac: "Đen", kich_thuoc: "S",         vi_tri_ke: "KhuB-O02", so_luong: 2, don_gia: 213750, gia_von: 95000, thanh_tien: 427500 },
      { ma_sku: "MB009-FS-DEN", ten_sp: "Mũ Bucket Vải Thô",   mau_sac: "Đen", kich_thuoc: "Free size", vi_tri_ke: "KhuD-O03", so_luong: 2, don_gia: 125000, gia_von: 55000, thanh_tien: 250000 },
    ],
    trang_thai_don: "cho_xu_ly", trang_thai_thanh_toan: "chua_thanh_toan",
    phuong_thuc_tt: "cod",
    tam_tinh: 677500, chiet_khau: 0, phi_ship: 0, tong_cong: 677500,
    da_thanh_toan: 0, con_no: 677500, ghi_chu: "Đơn TikTok Shop",
    lich_su: [{ trang_thai: "cho_xu_ly", thoi_gian: "2026-03-08T10:45:00", nguoi_thao_tac: "System" }],
  },
  {
    id: "7", ma_don: "DH-2026-0007",
    ngay_tao: "2026-03-05T08:00:00", ngay_cap_nhat: "2026-03-06T17:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty CP Phân Phối XYZ", so_dien_thoai: "0243456789", dia_chi: "200 Hoàng Diệu", thanh_pho: "Hải Phòng", ten_cong_ty: "Công ty CP Phân Phối XYZ", ma_so_thue: "0209876543" },
    san_pham: [
      { ma_sku: "TT010-OS-KEM", ten_sp: "Túi Tote Canvas",   mau_sac: "Kem", kich_thuoc: "One size",  vi_tri_ke: "KhuD-O02", so_luong: 100, don_gia: 157250, gia_von: 70000, thanh_tien: 15725000 },
      { ma_sku: "MB009-FS-KEM", ten_sp: "Mũ Bucket Vải Thô", mau_sac: "Kem", kich_thuoc: "Free size", vi_tri_ke: "KhuD-O03", so_luong: 100, don_gia:  93750, gia_von: 40000, thanh_tien:  9375000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 25100000, chiet_khau: 3765000, phi_ship: 0, tong_cong: 21335000,
    da_thanh_toan: 21335000, con_no: 0,
    ghi_chu: "Đã xuất HĐ số 0045",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-05T08:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-03-05T10:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-06T08:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-03-06T10:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-03-06T17:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "8", ma_don: "DH-2026-0008",
    ngay_tao: "2026-03-07T15:00:00", ngay_cap_nhat: "2026-03-08T09:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Vũ Thanh Tùng", so_dien_thoai: "0967890123", dia_chi: "56 Bà Triệu", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "AT001-M-DEN", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 2, don_gia: 159000, gia_von: 80000, thanh_tien: 318000, so_luong_loi: 1 },
    ],
    trang_thai_don: "tra_hang_loi", trang_thai_thanh_toan: "cho_doi_soat",
    phuong_thuc_tt: "cod",
    ma_van_don: "VTP-2026-11203", don_vi_vc: "Viettel Post",
    tam_tinh: 318000, chiet_khau: 0, phi_ship: 30000, tong_cong: 348000,
    da_thanh_toan: 0, con_no: 348000,
    ghi_chu: "1 cái lỗi đường may tay áo — khách trả về",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-03-07T15:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-03-07T17:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "tra_hang_loi",    thoi_gian: "2026-03-08T09:00:00", nguoi_thao_tac: "Lan Anh", ghi_chu: "Lỗi đường may tay áo, khách trả 1/2 cái" },
    ],
  },
  {
    id: "9", ma_don: "DH-2026-0009",
    ngay_tao: "2026-03-08T06:00:00", ngay_cap_nhat: "2026-03-08T08:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Ngô Thị Bích", so_dien_thoai: "0989012345", dia_chi: "56 Bà Triệu", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "DS011-42-NAU", ten_sp: "Dép Sandal Da Bò", mau_sac: "Nâu bò", kich_thuoc: "42", vi_tri_ke: "KhuD-O04", so_luong: 1, don_gia: 520000, gia_von: 220000, thanh_tien: 520000 },
    ],
    trang_thai_don: "cho_giao_van_chuyen", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 520000, chiet_khau: 0, phi_ship: 30000, tong_cong: 550000,
    da_thanh_toan: 550000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-08T06:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-08T08:00:00", nguoi_thao_tac: "Thu Hà", ghi_chu: "Đóng gói xong, chờ GHTK đến lấy" },
    ],
  },
  {
    id: "10", ma_don: "DH-2026-0010",
    ngay_tao: "2026-03-06T14:00:00", ngay_cap_nhat: "2026-03-08T07:00:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Đinh Văn Khoa", so_dien_thoai: "0971234567", dia_chi: "99 Trần Phú", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "AT001-L-DEN", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen", kich_thuoc: "L", vi_tri_ke: "KhuA-O01", so_luong: 3, don_gia: 159000, gia_von: 80000, thanh_tien: 477000 },
      { ma_sku: "QS002-L-DEN", ten_sp: "Quần Short Kaki",         mau_sac: "Đen", kich_thuoc: "L", vi_tri_ke: "KhuB-O03", so_luong: 2, don_gia: 195000, gia_von: 95000, thanh_tien: 390000 },
    ],
    trang_thai_don: "giao_that_bai", trang_thai_thanh_toan: "chua_thanh_toan",
    phuong_thuc_tt: "cod",
    ma_van_don: "GHTK-2026-44512", don_vi_vc: "GHTK",
    tam_tinh: 867000, chiet_khau: 0, phi_ship: 30000, tong_cong: 897000,
    da_thanh_toan: 0, con_no: 897000,
    ghi_chu: "Khách không nghe máy — giao thất bại lần 2",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-06T14:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-07T08:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-03-07T10:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "giao_that_bai",       thoi_gian: "2026-03-08T07:00:00", nguoi_thao_tac: "System", ghi_chu: "GHTK báo giao thất bại lần 2" },
    ],
  },
 
  // ── Tuần này (04/04 – 15/04/2026) ────────────────────────────────────────────
 
  {
    id: "11", ma_don: "DH-2026-0011",
    ngay_tao: "2026-04-15T08:10:00", ngay_cap_nhat: "2026-04-15T08:10:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Trương Thị Kim Anh", so_dien_thoai: "0903456789", dia_chi: "22 Đinh Tiên Hoàng", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AT001-S-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "S", vi_tri_ke: "KhuA-O01", so_luong: 2, don_gia: 159000, gia_von: 80000, thanh_tien: 318000 },
    ],
    trang_thai_don: "cho_xu_ly", trang_thai_thanh_toan: "chua_thanh_toan",
    phuong_thuc_tt: "cod",
    tam_tinh: 318000, chiet_khau: 0, phi_ship: 30000, tong_cong: 348000,
    da_thanh_toan: 0, con_no: 348000, ghi_chu: "",
    lich_su: [{ trang_thai: "cho_xu_ly", thoi_gian: "2026-04-15T08:10:00", nguoi_thao_tac: "System", ghi_chu: "Đơn mới từ Shopee" }],
  },
  {
    id: "12", ma_don: "DH-2026-0012",
    ngay_tao: "2026-04-15T09:30:00", ngay_cap_nhat: "2026-04-15T09:30:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Lê Hoàng Nam", so_dien_thoai: "0918765432", dia_chi: "15 Ngô Quyền", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "VD003-M-XANH", ten_sp: "Váy Midi Floral", mau_sac: "Xanh pastel", kich_thuoc: "M", vi_tri_ke: "KhuC-O02", so_luong: 1, don_gia: 420000, gia_von: 180000, thanh_tien: 420000 },
      { ma_sku: "MB009-FS-TRANG", ten_sp: "Mũ Bucket Vải Thô", mau_sac: "Trắng", kich_thuoc: "Free size", vi_tri_ke: "KhuD-O03", so_luong: 1, don_gia: 125000, gia_von: 55000, thanh_tien: 125000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "qr",
    tam_tinh: 545000, chiet_khau: 0, phi_ship: 0, tong_cong: 545000,
    da_thanh_toan: 545000, con_no: 0, ghi_chu: "Khách mua live TikTok",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-04-15T09:30:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-04-15T11:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-04-15T14:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "13", ma_don: "DH-2026-0013",
    ngay_tao: "2026-04-14T10:00:00", ngay_cap_nhat: "2026-04-14T15:00:00",
    kenh_ban: "cua_hang",
    khach_hang: { ten: "Nguyễn Minh Quân", so_dien_thoai: "0945678901", dia_chi: "88 Hai Bà Trưng", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "GS006-40-DEN", ten_sp: "Giày Sneaker Trắng", mau_sac: "Đen", kich_thuoc: "40", vi_tri_ke: "KhuD-O01", so_luong: 1, don_gia: 699000, gia_von: 320000, thanh_tien: 699000 },
      { ma_sku: "QS002-M-DEN", ten_sp: "Quần Short Kaki", mau_sac: "Đen", kich_thuoc: "M", vi_tri_ke: "KhuB-O03", so_luong: 2, don_gia: 195000, gia_von: 95000, thanh_tien: 390000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "tien_mat",
    tam_tinh: 1089000, chiet_khau: 0, phi_ship: 0, tong_cong: 1089000,
    da_thanh_toan: 1089000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",  thoi_gian: "2026-04-14T10:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "hoan_thanh", thoi_gian: "2026-04-14T10:05:00", nguoi_thao_tac: "Thu Hà", ghi_chu: "Bán tại quầy, thanh toán tiền mặt" },
    ],
  },
  {
    id: "14", ma_don: "DH-2026-0014",
    ngay_tao: "2026-04-13T14:30:00", ngay_cap_nhat: "2026-04-14T10:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Võ Thị Thanh Thúy", so_dien_thoai: "0932109876", dia_chi: "45 Trần Phú", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "DW005-S-HONG", ten_sp: "Đầm Wrap Cổ V", mau_sac: "Hồng phấn", kich_thuoc: "S", vi_tri_ke: "KhuC-O04", so_luong: 1, don_gia: 580000, gia_von: 250000, thanh_tien: 580000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    ma_van_don: "GHTK-2026-55123", don_vi_vc: "GHTK",
    tam_tinh: 580000, chiet_khau: 0, phi_ship: 30000, tong_cong: 610000,
    da_thanh_toan: 610000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-04-13T14:30:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-04-13T16:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-04-14T10:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "15", ma_don: "DH-2026-0015",
    ngay_tao: "2026-04-12T09:00:00", ngay_cap_nhat: "2026-04-12T09:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Bùi Thị Ngọc Hân", so_dien_thoai: "0961234567", dia_chi: "12 Nguyễn Trãi", thanh_pho: "Cần Thơ" },
    san_pham: [
      { ma_sku: "SB008-M-XAM", ten_sp: "Set Đồ Bộ Thể Thao", mau_sac: "Xám", kich_thuoc: "M", vi_tri_ke: "KhuB-O02", so_luong: 1, don_gia: 427500, gia_von: 190000, thanh_tien: 427500 },
    ],
    trang_thai_don: "dang_van_chuyen", trang_thai_thanh_toan: "cho_doi_soat",
    phuong_thuc_tt: "cod",
    ma_van_don: "VTP-2026-22456", don_vi_vc: "Viettel Post",
    tam_tinh: 427500, chiet_khau: 0, phi_ship: 30000, tong_cong: 457500,
    da_thanh_toan: 0, con_no: 457500, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-04-12T09:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-04-12T14:00:00", nguoi_thao_tac: "Minh Tuấn" },
    ],
  },
  {
    id: "16", ma_don: "DH-2026-0016",
    ngay_tao: "2026-04-11T11:00:00", ngay_cap_nhat: "2026-04-13T09:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty TNHH Thời Trang Đông Nam", so_dien_thoai: "0271234567", dia_chi: "300 Lê Văn Việt", thanh_pho: "TP. HCM", ten_cong_ty: "Công ty TNHH Thời Trang Đông Nam", ma_so_thue: "0314567890" },
    san_pham: [
      { ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 30, don_gia: 119000, gia_von: 65000, thanh_tien: 3570000 },
      { ma_sku: "AT001-M-DEN",   ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen",   kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 30, don_gia: 119000, gia_von: 65000, thanh_tien: 3570000 },
      { ma_sku: "QS002-M-KEM",   ten_sp: "Quần Short Kaki",         mau_sac: "Kem",   kich_thuoc: "M", vi_tri_ke: "KhuB-O03", so_luong: 20, don_gia: 146250, gia_von: 70000, thanh_tien: 2925000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 10065000, chiet_khau: 1006500, phi_ship: 0, tong_cong: 9058500,
    da_thanh_toan: 9058500, con_no: 0,
    ghi_chu: "Đơn tháng 4 lần 1 — xuất HĐ",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-04-11T11:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-04-11T14:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-04-12T08:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-04-12T10:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-04-13T09:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "17", ma_don: "DH-2026-0017",
    ngay_tao: "2026-04-10T08:30:00", ngay_cap_nhat: "2026-04-11T16:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Phùng Thị Lan Anh", so_dien_thoai: "0987654321", dia_chi: "67 Lê Duẩn", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "AK007-M-XANH", ten_sp: "Áo Khoác Bomber", mau_sac: "Xanh rêu", kich_thuoc: "M", vi_tri_ke: "KhuA-O05", so_luong: 1, don_gia: 612000, gia_von: 280000, thanh_tien: 612000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "cod",
    ma_van_don: "GHTK-2026-56789", don_vi_vc: "GHTK",
    tam_tinh: 612000, chiet_khau: 0, phi_ship: 30000, tong_cong: 642000,
    da_thanh_toan: 642000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-04-10T08:30:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-04-10T11:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-04-11T16:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "18", ma_don: "DH-2026-0018",
    ngay_tao: "2026-04-08T10:00:00", ngay_cap_nhat: "2026-04-09T14:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Đoàn Văn Phúc", so_dien_thoai: "0908765432", dia_chi: "34 Đinh Bộ Lĩnh", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "TT010-OS-DEN", ten_sp: "Túi Tote Canvas", mau_sac: "Đen", kich_thuoc: "One size", vi_tri_ke: "KhuD-O02", so_luong: 2, don_gia: 185000, gia_von: 80000, thanh_tien: 370000 },
      { ma_sku: "MB009-FS-DEN", ten_sp: "Mũ Bucket Vải Thô", mau_sac: "Đen", kich_thuoc: "Free size", vi_tri_ke: "KhuD-O03", so_luong: 1, don_gia: 125000, gia_von: 55000, thanh_tien: 125000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 495000, chiet_khau: 0, phi_ship: 30000, tong_cong: 525000,
    da_thanh_toan: 525000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-04-08T10:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-04-08T14:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-04-09T14:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "19", ma_don: "DH-2026-0019",
    ngay_tao: "2026-04-07T09:00:00", ngay_cap_nhat: "2026-04-07T09:00:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Hà Thị Thanh Hương", so_dien_thoai: "0923456789", dia_chi: "56 Nguyễn Văn Cừ", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "DS011-38-NAU", ten_sp: "Dép Sandal Da Bò", mau_sac: "Nâu bò", kich_thuoc: "38", vi_tri_ke: "KhuD-O04", so_luong: 1, don_gia: 520000, gia_von: 220000, thanh_tien: 520000 },
    ],
    trang_thai_don: "cho_xu_ly", trang_thai_thanh_toan: "chua_thanh_toan",
    phuong_thuc_tt: "cod",
    tam_tinh: 520000, chiet_khau: 0, phi_ship: 30000, tong_cong: 550000,
    da_thanh_toan: 0, con_no: 550000, ghi_chu: "",
    lich_su: [{ trang_thai: "cho_xu_ly", thoi_gian: "2026-04-07T09:00:00", nguoi_thao_tac: "System" }],
  },
  {
    id: "20", ma_don: "DH-2026-0020",
    ngay_tao: "2026-04-06T14:00:00", ngay_cap_nhat: "2026-04-06T14:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Phan Thanh Bình", so_dien_thoai: "0936789012", dia_chi: "78 Lê Văn Sỹ", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 1, don_gia: 159000, gia_von: 80000, thanh_tien: 159000 },
      { ma_sku: "AT001-L-DEN",   ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen",   kich_thuoc: "L", vi_tri_ke: "KhuA-O01", so_luong: 1, don_gia: 159000, gia_von: 80000, thanh_tien: 159000 },
    ],
    trang_thai_don: "dang_san_xuat", trang_thai_thanh_toan: "da_coc",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 318000, chiet_khau: 0, phi_ship: 30000, tong_cong: 348000,
    da_thanh_toan: 100000, con_no: 248000, ghi_chu: "Đã cọc 100k",
    lich_su: [
      { trang_thai: "cho_xu_ly",     thoi_gian: "2026-04-06T14:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat", thoi_gian: "2026-04-06T16:00:00", nguoi_thao_tac: "Lan Anh" },
    ],
  },
 
  // ── Tháng 3/2026 (đầu tháng) ──────────────────────────────────────────────────
 
  {
    id: "21", ma_don: "DH-2026-0021",
    ngay_tao: "2026-03-25T09:00:00", ngay_cap_nhat: "2026-03-26T10:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Mai Quỳnh Anh", so_dien_thoai: "0912987654", dia_chi: "11 Nguyễn Huệ", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "VD003-M-HONG", ten_sp: "Váy Midi Floral", mau_sac: "Hồng đào", kich_thuoc: "M", vi_tri_ke: "KhuC-O02", so_luong: 2, don_gia: 420000, gia_von: 180000, thanh_tien: 840000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "cod",
    tam_tinh: 840000, chiet_khau: 0, phi_ship: 30000, tong_cong: 870000,
    da_thanh_toan: 870000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-03-25T09:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-03-25T13:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-03-26T10:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "22", ma_don: "DH-2026-0022",
    ngay_tao: "2026-03-20T10:30:00", ngay_cap_nhat: "2026-03-22T09:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty CP Thời Trang Miền Nam", so_dien_thoai: "0287123456", dia_chi: "500 Điện Biên Phủ", thanh_pho: "TP. HCM", ten_cong_ty: "Công ty CP Thời Trang Miền Nam", ma_so_thue: "0309876543" },
    san_pham: [
      { ma_sku: "DW005-M-DEN",  ten_sp: "Đầm Wrap Cổ V",     mau_sac: "Đen",   kich_thuoc: "M", vi_tri_ke: "KhuC-O04", so_luong: 20, don_gia: 464000, gia_von: 200000, thanh_tien: 9280000 },
      { ma_sku: "DW005-S-DEN",  ten_sp: "Đầm Wrap Cổ V",     mau_sac: "Đen",   kich_thuoc: "S", vi_tri_ke: "KhuC-O04", so_luong: 15, don_gia: 464000, gia_von: 200000, thanh_tien: 6960000 },
      { ma_sku: "AK007-M-DEN",  ten_sp: "Áo Khoác Bomber",  mau_sac: "Đen",   kich_thuoc: "M", vi_tri_ke: "KhuA-O05", so_luong: 10, don_gia: 489600, gia_von: 225000, thanh_tien: 4896000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 21136000, chiet_khau: 2113600, phi_ship: 0, tong_cong: 19022400,
    da_thanh_toan: 19022400, con_no: 0,
    ghi_chu: "Đơn định kỳ T3 — Xuất HĐ 0067",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-03-20T10:30:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-03-20T14:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-03-21T08:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-03-21T10:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-03-22T09:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "23", ma_don: "DH-2026-0023",
    ngay_tao: "2026-03-15T08:00:00", ngay_cap_nhat: "2026-03-16T14:00:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Lý Thị Mỹ Duyên", so_dien_thoai: "0903112233", dia_chi: "23 Hoàng Diệu", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "SB008-S-TIM", ten_sp: "Set Đồ Bộ Thể Thao", mau_sac: "Tím", kich_thuoc: "S", vi_tri_ke: "KhuB-O02", so_luong: 1, don_gia: 427500, gia_von: 190000, thanh_tien: 427500 },
      { ma_sku: "GS006-36-TRANG", ten_sp: "Giày Sneaker Trắng", mau_sac: "Trắng", kich_thuoc: "36", vi_tri_ke: "KhuD-O01", so_luong: 1, don_gia: 699000, gia_von: 320000, thanh_tien: 699000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "cod",
    ma_van_don: "J&T-2026-33456", don_vi_vc: "J&T Express",
    tam_tinh: 1126500, chiet_khau: 0, phi_ship: 30000, tong_cong: 1156500,
    da_thanh_toan: 1156500, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-03-15T08:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-03-15T11:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-03-16T14:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "24", ma_don: "DH-2026-0024",
    ngay_tao: "2026-03-10T11:00:00", ngay_cap_nhat: "2026-03-12T09:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Trần Anh Tuấn", so_dien_thoai: "0948765432", dia_chi: "100 Bà Triệu", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "QJ004-30-DEN", ten_sp: "Quần Jean Skinny", mau_sac: "Đen wash", kich_thuoc: "30", vi_tri_ke: "KhuB-O05", so_luong: 2, don_gia: 520000, gia_von: 230000, thanh_tien: 1040000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 1040000, chiet_khau: 0, phi_ship: 30000, tong_cong: 1070000,
    da_thanh_toan: 1070000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-03-10T11:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-03-10T15:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-03-12T09:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "25", ma_don: "DH-2026-0025",
    ngay_tao: "2026-03-01T09:30:00", ngay_cap_nhat: "2026-03-03T10:00:00",
    kenh_ban: "cua_hang",
    khach_hang: { ten: "Ngô Thị Thu Hà", so_dien_thoai: "0975432109", dia_chi: "55 Trần Hưng Đạo", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AT001-M-XANH", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Xanh navy", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 3, don_gia: 159000, gia_von: 80000, thanh_tien: 477000 },
      { ma_sku: "DS011-40-DEN", ten_sp: "Dép Sandal Da Bò",        mau_sac: "Đen",       kich_thuoc: "40", vi_tri_ke: "KhuD-O04", so_luong: 1, don_gia: 520000, gia_von: 220000, thanh_tien: 520000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "tien_mat",
    tam_tinh: 997000, chiet_khau: 0, phi_ship: 0, tong_cong: 997000,
    da_thanh_toan: 997000, con_no: 0, ghi_chu: "Khách quen, mua tại quầy",
    lich_su: [
      { trang_thai: "cho_xu_ly",  thoi_gian: "2026-03-01T09:30:00", nguoi_thao_tac: "System" },
      { trang_thai: "hoan_thanh", thoi_gian: "2026-03-01T09:35:00", nguoi_thao_tac: "Thu Hà", ghi_chu: "Thanh toán tại quầy" },
    ],
  },
 
  // ── Tháng 2/2026 ──────────────────────────────────────────────────────────────
 
  {
    id: "26", ma_don: "DH-2026-0026",
    ngay_tao: "2026-02-25T09:00:00", ngay_cap_nhat: "2026-02-26T14:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Mai Thị Xuân", so_dien_thoai: "0962345678", dia_chi: "33 Nguyễn Thị Minh Khai", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "AT001-M-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "M", vi_tri_ke: "KhuA-O01", so_luong: 3, don_gia: 159000, gia_von: 80000, thanh_tien: 477000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "qr",
    tam_tinh: 477000, chiet_khau: 0, phi_ship: 30000, tong_cong: 507000,
    da_thanh_toan: 507000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-02-25T09:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-02-25T13:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-02-26T14:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "27", ma_don: "DH-2026-0027",
    ngay_tao: "2026-02-20T14:00:00", ngay_cap_nhat: "2026-02-22T09:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty TNHH DEF Fashion", so_dien_thoai: "0283456789", dia_chi: "150 Đinh Tiên Hoàng", thanh_pho: "TP. HCM", ten_cong_ty: "Công ty TNHH DEF Fashion", ma_so_thue: "0304567890" },
    san_pham: [
      { ma_sku: "VD003-M-HONG", ten_sp: "Váy Midi Floral", mau_sac: "Hồng đào", kich_thuoc: "M", vi_tri_ke: "KhuC-O02", so_luong: 30, don_gia: 336000, gia_von: 144000, thanh_tien: 10080000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 10080000, chiet_khau: 1008000, phi_ship: 0, tong_cong: 9072000,
    da_thanh_toan: 9072000, con_no: 0, ghi_chu: "Xuất HĐ số 0051",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-02-20T14:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-02-21T08:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-02-21T15:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-02-22T08:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-02-22T09:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "28", ma_don: "DH-2026-0028",
    ngay_tao: "2026-02-15T10:00:00", ngay_cap_nhat: "2026-02-16T15:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Đinh Thị Phương", so_dien_thoai: "0934123456", dia_chi: "78 Hoàng Văn Thụ", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "DW005-S-DEN", ten_sp: "Đầm Wrap Cổ V",     mau_sac: "Đen",   kich_thuoc: "S",  vi_tri_ke: "KhuC-O04", so_luong: 1, don_gia: 580000, gia_von: 250000, thanh_tien: 580000 },
      { ma_sku: "TT010-OS-KEM",ten_sp: "Túi Tote Canvas",    mau_sac: "Kem",   kich_thuoc: "OS", vi_tri_ke: "KhuD-O02", so_luong: 1, don_gia: 185000, gia_von: 80000,  thanh_tien: 185000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 765000, chiet_khau: 0, phi_ship: 30000, tong_cong: 795000,
    da_thanh_toan: 795000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-02-15T10:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-02-15T14:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-02-16T15:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "29", ma_don: "DH-2026-0029",
    ngay_tao: "2026-02-10T08:00:00", ngay_cap_nhat: "2026-02-12T10:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty CP GHI Apparel", so_dien_thoai: "0243789012", dia_chi: "200 Lý Thường Kiệt", thanh_pho: "Hà Nội", ten_cong_ty: "Công ty CP GHI Apparel", ma_so_thue: "0107654321" },
    san_pham: [
      { ma_sku: "AK007-M-NAU", ten_sp: "Áo Khoác Bomber", mau_sac: "Nâu", kich_thuoc: "M", vi_tri_ke: "KhuA-O05", so_luong: 25, don_gia: 489600, gia_von: 225000, thanh_tien: 12240000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 12240000, chiet_khau: 1224000, phi_ship: 0, tong_cong: 11016000,
    da_thanh_toan: 11016000, con_no: 0, ghi_chu: "Xuất HĐ số 0048",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-02-10T08:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-02-10T11:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-02-11T09:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-02-11T11:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-02-12T10:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "30", ma_don: "DH-2026-0030",
    ngay_tao: "2026-02-05T15:00:00", ngay_cap_nhat: "2026-02-06T16:00:00",
    kenh_ban: "tiktok",
    khach_hang: { ten: "Lý Thị Hằng", so_dien_thoai: "0979012345", dia_chi: "34 Nguyễn Chí Thanh", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "SB008-S-TIM", ten_sp: "Set Đồ Bộ Thể Thao", mau_sac: "Tím", kich_thuoc: "S", vi_tri_ke: "KhuB-O02", so_luong: 1, don_gia: 427500, gia_von: 190000, thanh_tien: 427500 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "qr",
    tam_tinh: 427500, chiet_khau: 0, phi_ship: 30000, tong_cong: 457500,
    da_thanh_toan: 457500, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-02-05T15:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-02-05T17:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-02-06T16:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "31", ma_don: "DH-2026-0031",
    ngay_tao: "2026-02-02T13:00:00", ngay_cap_nhat: "2026-02-03T11:00:00",
    kenh_ban: "cua_hang",
    khach_hang: { ten: "Bùi Văn Hải", so_dien_thoai: "0956789234", dia_chi: "89 Trần Quang Khải", thanh_pho: "Cần Thơ" },
    san_pham: [
      { ma_sku: "QJ004-30-DEN", ten_sp: "Quần Jean Skinny", mau_sac: "Đen", kich_thuoc: "30", vi_tri_ke: "KhuB-O05", so_luong: 2, don_gia: 520000, gia_von: 230000, thanh_tien: 1040000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "tien_mat",
    tam_tinh: 1040000, chiet_khau: 0, phi_ship: 0, tong_cong: 1040000,
    da_thanh_toan: 1040000, con_no: 0, ghi_chu: "Bán tại quầy Cần Thơ",
    lich_su: [
      { trang_thai: "cho_xu_ly",  thoi_gian: "2026-02-02T13:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "hoan_thanh", thoi_gian: "2026-02-02T13:05:00", nguoi_thao_tac: "Thu Hà" },
    ],
  },
 
  // ── Tháng 1/2026 ──────────────────────────────────────────────────────────────
 
  {
    id: "32", ma_don: "DH-2026-0032",
    ngay_tao: "2026-01-28T09:00:00", ngay_cap_nhat: "2026-01-30T10:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty TNHH JKL Style", so_dien_thoai: "0281234567", dia_chi: "400 Võ Văn Tần", thanh_pho: "TP. HCM", ten_cong_ty: "Công ty TNHH JKL Style", ma_so_thue: "0312109876" },
    san_pham: [
      { ma_sku: "AT001-L-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng", kich_thuoc: "L", vi_tri_ke: "KhuA-O02", so_luong: 80, don_gia: 119000, gia_von: 65000, thanh_tien: 9520000 },
      { ma_sku: "QS002-M-NAU",   ten_sp: "Quần Short Kaki",         mau_sac: "Nâu",   kich_thuoc: "M", vi_tri_ke: "KhuB-O03", so_luong: 40, don_gia: 146250, gia_von: 70000, thanh_tien: 5850000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 15370000, chiet_khau: 2305500, phi_ship: 0, tong_cong: 13064500,
    da_thanh_toan: 13064500, con_no: 0, ghi_chu: "Đơn đầu năm — Xuất HĐ 0031",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-01-28T09:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-01-28T14:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-01-29T08:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-01-29T10:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-01-30T10:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "33", ma_don: "DH-2026-0033",
    ngay_tao: "2026-01-20T11:00:00", ngay_cap_nhat: "2026-01-21T15:00:00",
    kenh_ban: "facebook",
    khach_hang: { ten: "Trịnh Thu Hương", so_dien_thoai: "0934567012", dia_chi: "56 Tràng Tiền", thanh_pho: "Hà Nội" },
    san_pham: [
      { ma_sku: "VD003-M-HONG", ten_sp: "Váy Midi Floral", mau_sac: "Hồng đào", kich_thuoc: "M", vi_tri_ke: "KhuC-O02", so_luong: 2, don_gia: 420000, gia_von: 180000, thanh_tien: 840000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "qr",
    tam_tinh: 840000, chiet_khau: 0, phi_ship: 0, tong_cong: 840000,
    da_thanh_toan: 840000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-01-20T11:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-01-20T14:00:00", nguoi_thao_tac: "Thu Hà" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-01-21T15:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "34", ma_don: "DH-2026-0034",
    ngay_tao: "2026-01-15T14:00:00", ngay_cap_nhat: "2026-01-16T11:00:00",
    kenh_ban: "cua_hang",
    khach_hang: { ten: "Đặng Minh Tuấn", so_dien_thoai: "0967890456", dia_chi: "12 Lê Lợi", thanh_pho: "TP. HCM" },
    san_pham: [
      { ma_sku: "DS011-41-DEN", ten_sp: "Dép Sandal Da Bò", mau_sac: "Đen", kich_thuoc: "41", vi_tri_ke: "KhuD-O04", so_luong: 1, don_gia: 520000, gia_von: 220000, thanh_tien: 520000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "tien_mat",
    tam_tinh: 520000, chiet_khau: 0, phi_ship: 0, tong_cong: 520000,
    da_thanh_toan: 520000, con_no: 0, ghi_chu: "Bán tại quầy",
    lich_su: [
      { trang_thai: "cho_xu_ly",  thoi_gian: "2026-01-15T14:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "hoan_thanh", thoi_gian: "2026-01-15T14:05:00", nguoi_thao_tac: "Thu Hà" },
    ],
  },
  {
    id: "35", ma_don: "DH-2026-0035",
    ngay_tao: "2026-01-10T08:00:00", ngay_cap_nhat: "2026-01-11T16:00:00",
    kenh_ban: "shopee",
    khach_hang: { ten: "Phan Thị Nga", so_dien_thoai: "0912098765", dia_chi: "34 Bạch Đằng", thanh_pho: "Đà Nẵng" },
    san_pham: [
      { ma_sku: "AT001-S-HONG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Hồng pastel", kich_thuoc: "S", vi_tri_ke: "KhuA-O01", so_luong: 2, don_gia: 159000, gia_von: 80000, thanh_tien: 318000 },
      { ma_sku: "MB009-FS-HONG", ten_sp: "Mũ Bucket Vải Thô", mau_sac: "Hồng", kich_thuoc: "Free size", vi_tri_ke: "KhuD-O03", so_luong: 1, don_gia: 125000, gia_von: 55000, thanh_tien: 125000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "cod",
    ma_van_don: "VTP-2026-00123", don_vi_vc: "Viettel Post",
    tam_tinh: 443000, chiet_khau: 0, phi_ship: 30000, tong_cong: 473000,
    da_thanh_toan: 473000, con_no: 0, ghi_chu: "",
    lich_su: [
      { trang_thai: "cho_xu_ly",       thoi_gian: "2026-01-10T08:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_van_chuyen", thoi_gian: "2026-01-10T11:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",      thoi_gian: "2026-01-11T16:00:00", nguoi_thao_tac: "System" },
    ],
  },
  {
    id: "36", ma_don: "DH-2026-0036",
    ngay_tao: "2026-01-05T10:00:00", ngay_cap_nhat: "2026-01-07T14:00:00",
    kenh_ban: "khach_si",
    khach_hang: { ten: "Cty CP MNO Distribution", so_dien_thoai: "0243123456", dia_chi: "100 Lạch Tray", thanh_pho: "Hải Phòng", ten_cong_ty: "Công ty CP MNO Distribution", ma_so_thue: "0200123456" },
    san_pham: [
      { ma_sku: "GS006-39-DEN", ten_sp: "Giày Sneaker Trắng", mau_sac: "Đen", kich_thuoc: "39", vi_tri_ke: "KhuD-O01", so_luong: 50, don_gia: 559200, gia_von: 260000, thanh_tien: 27960000 },
    ],
    trang_thai_don: "hoan_thanh", trang_thai_thanh_toan: "da_thanh_toan",
    phuong_thuc_tt: "chuyen_khoan",
    tam_tinh: 27960000, chiet_khau: 2796000, phi_ship: 0, tong_cong: 25164000,
    da_thanh_toan: 25164000, con_no: 0, ghi_chu: "Đơn giày đầu năm — Xuất HĐ 0028",
    lich_su: [
      { trang_thai: "cho_xu_ly",           thoi_gian: "2026-01-05T10:00:00", nguoi_thao_tac: "System" },
      { trang_thai: "dang_san_xuat",       thoi_gian: "2026-01-05T14:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "cho_giao_van_chuyen", thoi_gian: "2026-01-06T09:00:00", nguoi_thao_tac: "Lan Anh" },
      { trang_thai: "dang_van_chuyen",     thoi_gian: "2026-01-06T11:00:00", nguoi_thao_tac: "Minh Tuấn" },
      { trang_thai: "hoan_thanh",          thoi_gian: "2026-01-07T14:00:00", nguoi_thao_tac: "System" },
    ],
  }
];


// ─── API layer ────────────────────────────────────────────────────────────────
// Giai đoạn 1: trả về mock data
// Giai đoạn 2: bỏ comment dòng fetch, xóa dòng return mock

export const lay_danh_sach_don = async (
  // vai_tro: VaiTro
): Promise<DonHang[]> => {
  // TODO: thay bằng API thật
  // const res = await fetch(`/api/don-hang?view=${vai_tro}`)
  // if (!res.ok) throw new Error("Lỗi tải danh sách đơn hàng")
  // return res.json()
  return MOCK_DON_HANG
}

export const lay_chi_tiet_don = async (id: string): Promise<DonHang> => {
  // const res = await fetch(`/api/don-hang/${id}`)
  // if (!res.ok) throw new Error("Không tìm thấy đơn hàng")
  // return res.json()
  const don = MOCK_DON_HANG.find(o => o.id === id)
  if (!don) throw new Error("Không tìm thấy đơn hàng")
  return don
}

export const cap_nhat_trang_thai_don = async (
  id: string,
  trang_thai: TrangThaiDon,
  ghi_chu?: string
): Promise<DonHang> => {
  // const res = await fetch(`/api/don-hang/${id}/trang-thai`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ trang_thai, ghi_chu })
  // })
  // return res.json()

  // Mock: cập nhật tại chỗ
  const don = MOCK_DON_HANG.find(o => o.id === id)
  if (!don) throw new Error("Không tìm thấy đơn hàng")
  don.trang_thai_don = trang_thai
  don.ngay_cap_nhat  = new Date().toISOString()
  don.lich_su.push({
    trang_thai,
    thoi_gian:      new Date().toISOString(),
    nguoi_thao_tac: "Bạn",
    ghi_chu,
  })
  return don
}


// ─── Phân quyền ──────────────────────────────────────────────────────────────

/** Lọc fields của 1 đơn theo vai trò — ẩn data nhạy cảm */
export const loc_don_theo_vai_tro = (
  don: DonHang,
  vai_tro: VaiTro
): DonHangViewSale | DonHangViewKho | DonHangViewKeToan | DonHang => {

  if (vai_tro === "kho") {
    const result: DonHangViewKho = {
      id:            don.id,
      ma_don:        don.ma_don,
      ngay_tao:      don.ngay_tao,
      kenh_ban:      don.kenh_ban,
      khach_hang: {
        ten:           don.khach_hang.ten,
        so_dien_thoai: don.khach_hang.so_dien_thoai,
        dia_chi:       don.khach_hang.dia_chi,
        thanh_pho:     don.khach_hang.thanh_pho,
      },
      san_pham: don.san_pham.map(({ ma_sku, ten_sp, mau_sac, kich_thuoc, vi_tri_ke, so_luong, so_luong_loi }) => ({
        ma_sku, ten_sp, mau_sac, kich_thuoc, vi_tri_ke, so_luong, so_luong_loi,
      })),
      trang_thai_don:  don.trang_thai_don,
      phuong_thuc_tt:  don.phuong_thuc_tt,
      ma_van_don:      don.ma_van_don,
      don_vi_vc:       don.don_vi_vc,
      ma_kho:          don.ma_kho,
      ghi_chu:         don.ghi_chu,
      lich_su: don.lich_su.map(({ trang_thai, thoi_gian, ghi_chu }) => ({
        trang_thai, thoi_gian, ghi_chu,
      })),
    }
    return result
  }

  if (vai_tro === "ke_toan") {
    const result: DonHangViewKeToan = {
      id:                     don.id,
      ma_don:                 don.ma_don,
      ngay_tao:               don.ngay_tao,
      ngay_cap_nhat:          don.ngay_cap_nhat,
      kenh_ban:               don.kenh_ban,
      khach_hang:             don.khach_hang,
      san_pham: don.san_pham.map(({...rest }) => rest), // bỏ vi_tri_ke
      trang_thai_don:         don.trang_thai_don,
      trang_thai_thanh_toan:  don.trang_thai_thanh_toan,
      phuong_thuc_tt:         don.phuong_thuc_tt,
      ma_van_don:             don.ma_van_don,
      tam_tinh:               don.tam_tinh,
      chiet_khau:             don.chiet_khau,
      phi_ship:               don.phi_ship,
      tong_cong:              don.tong_cong,
      da_thanh_toan:          don.da_thanh_toan,
      con_no:                 don.con_no,
      ghi_chu:                don.ghi_chu,
      lich_su:                don.lich_su,
    }
    return result
  }

  if (vai_tro === "sale") {
    const result: DonHangViewSale = {
      ...don,
      san_pham: don.san_pham.map(({...rest }) => rest), // bỏ gia_von + vi_tri_ke
    }
    return result
  }

  // admin — trả về đầy đủ
  return don
}

/** Kiểm tra vai trò có được thực hiện thao tác không */
export const co_quyen_thao_tac = (
  vai_tro: VaiTro,
  loai: "doi_trang_thai_don" | "doi_trang_thai_tt" | "xuat_excel" | "tao_don"
): boolean => {
  const quyen: Record<typeof loai, VaiTro[]> = {
    doi_trang_thai_don: ["kho", "admin"],
    doi_trang_thai_tt:  ["ke_toan", "admin"],
    xuat_excel:         ["ke_toan", "admin"],
    tao_don:            ["sale", "admin"],
  }
  return quyen[loai].includes(vai_tro)
}
