// ─────────────────────────────────────────────────────────────────────────────
// shopData.ts — Types & helpers khớp với DB schema mới
// ─────────────────────────────────────────────────────────────────────────────

// ─── Wholesale helpers ────────────────────────────────────────────────────────
export const WHOLESALE_ROLES = ["KhachSi", "wholesaler", "Wholesale", "admin", "Admin"];

export interface ShopUser {
  id: number;
  username: string;
  name?: string;
  role: string;
  permissions?: string;
}

export const getShopUser = (): ShopUser | null => {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
};

export const isWholesaleUser = (): boolean => {
  const u = getShopUser();
  return u ? WHOLESALE_ROLES.includes(u.role) : false;
};

export const getWholesaleDisc = (qty: number): number =>
  qty >= 100 ? 15 : qty >= 50 ? 10 : qty >= 20 ? 5 : 0;

// ─── Types khớp DB ────────────────────────────────────────────────────────────
export interface BienThe {
  id: number;
  ma_bien_the: string;
  mau_sac: string;
  kich_thuoc: string;
  gia_ban_goc: number;
  gia_ban_thuc: number;    // giá lẻ hiển thị
  giam_gia: number;        // % giảm
  anh: string;
  barcode: string;
  // Computed / optional
  gia_si?: number;         // tính = 75% gia_ban_thuc, làm tròn 1000đ
  ton_kho?: number;        // từ API inventory, default 99
}

export interface SanPham {
  id: number;
  ma_sp: string;
  ten_sp: string;
  mo_ta: string;
  loai_sp: string;        // "Áo" | "Quần" | "Váy" | "Giày" | "Túi" ...
  danh_muc_id: string;
  don_vi_tinh: string;
  gia_ban_goc: number;
  gia_ban_thuc: number;
  giam_gia: number;
  barcode: string;
  anh: string;
  bien_the: BienThe[];
  // Metadata bổ sung (API hoặc default)
  danh_gia?: number;
  luot_danh_gia?: number;
  luot_ban?: number;
  is_hot?: boolean;
  is_new?: boolean;
  is_sale?: boolean;   // true nếu giam_gia > 0, có thể set explicit từ API
}

export interface CartItem {
  sanPham: SanPham;
  bienThe: BienThe;
  soLuong: number;
}

// ─── Pricing helpers ──────────────────────────────────────────────────────────
export const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

export const getGiaSi = (gia: number): number =>
  Math.round(gia * 0.75 / 1000) * 1000;

export const getMinGia = (sp: SanPham): number =>
  Math.min(...sp.bien_the.map(b => b.gia_ban_thuc));

export const getMinGiaSi = (sp: SanPham): number =>
  Math.min(...sp.bien_the.map(b => b.gia_si ?? getGiaSi(b.gia_ban_thuc)));

// ─── Cart persistence ─────────────────────────────────────────────────────────
export const CART_KEY = "shop_cart_v2";

export const loadCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); }
  catch { return []; }
};

export const saveCart = (cart: CartItem[]): void =>
  localStorage.setItem(CART_KEY, JSON.stringify(cart));

// ─── Categories — dựa trên loai_sp từ DB ──────────────────────────────────────
export const CATEGORIES = [
  { id: "Áo",       label: "Áo",       emoji: "👔" },
  { id: "Quần",     label: "Quần",     emoji: "👖" },
  { id: "Váy",      label: "Váy/Đầm",  emoji: "👗" },
  { id: "Giày",     label: "Giày",     emoji: "👟" },
  { id: "Túi",      label: "Túi",      emoji: "👜" },
  { id: "Phụ kiện", label: "Phụ kiện", emoji: "💍" },
];

// ─── API helpers ──────────────────────────────────────────────────────────────
const API = import.meta.env.VITE_API_URL;

/** Bổ sung gia_si & ton_kho vào mỗi biến thể */
const hydrate = (sp: SanPham): SanPham => ({
  ...sp,
  is_sale: sp.is_sale ?? sp.giam_gia > 0,
  bien_the: sp.bien_the.map(bt => ({
    ...bt,
    gia_si: bt.gia_si ?? getGiaSi(bt.gia_ban_thuc),
    ton_kho: bt.ton_kho ?? 99,
  })),
});

export const fetchSanPham = async (): Promise<SanPham[]> => {
  const res = await fetch(`${API}/shop/san-pham`, { cache: "no-store" });
  if (!res.ok) throw new Error("Lỗi tải sản phẩm");
  return (await res.json()).map(hydrate);
};

export const fetchSanPhamById = async (id: number): Promise<SanPham> => {
  const res = await fetch(`${API}/shop/san-pham/${id}`);
  if (!res.ok) throw new Error("Không tìm thấy sản phẩm");
  return hydrate(await res.json());
};

// ─── Mock data (fallback khi API chưa có) ────────────────────────────────────
export const MOCK_SAN_PHAM: SanPham[] = [
  {
    id: 1, ma_sp: "SP001", ten_sp: "Áo Thun Nam Basic",
    mo_ta: "Áo thun nam chất liệu cotton 100%, thoáng mát, phù hợp mặc hàng ngày",
    loai_sp: "Áo", danh_muc_id: "DM001", don_vi_tinh: "Cái",
    gia_ban_goc: 250000, gia_ban_thuc: 199000, giam_gia: 20,
    barcode: "8934567890001",
    anh: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    danh_gia: 4.7, luot_danh_gia: 1240, luot_ban: 3200, is_hot: true, is_sale: true,
    bien_the: [
      { id:1, ma_bien_the:"SP001-TRANG-S", mau_sac:"Trắng",  kich_thuoc:"S", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:80,  anh:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", barcode:"8934567890001-01" },
      { id:2, ma_bien_the:"SP001-TRANG-M", mau_sac:"Trắng",  kich_thuoc:"M", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:120, anh:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", barcode:"8934567890001-02" },
      { id:3, ma_bien_the:"SP001-TRANG-L", mau_sac:"Trắng",  kich_thuoc:"L", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:95,  anh:"https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", barcode:"8934567890001-03" },
      { id:4, ma_bien_the:"SP001-DEN-S",   mau_sac:"Đen",    kich_thuoc:"S", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:60,  anh:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80", barcode:"8934567890001-04" },
      { id:5, ma_bien_the:"SP001-DEN-M",   mau_sac:"Đen",    kich_thuoc:"M", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:110, anh:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80", barcode:"8934567890001-05" },
      { id:6, ma_bien_the:"SP001-DEN-L",   mau_sac:"Đen",    kich_thuoc:"L", gia_ban_goc:250000, gia_ban_thuc:199000, giam_gia:20, gia_si:149000, ton_kho:75,  anh:"https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80", barcode:"8934567890001-06" },
    ],
  },
  {
    id: 2, ma_sp: "SP002", ten_sp: "Áo Polo Nam Cao Cấp",
    mo_ta: "Áo polo nam vải pique cao cấp, cổ bẻ, tay ngắn, phong cách lịch sự",
    loai_sp: "Áo", danh_muc_id: "DM001", don_vi_tinh: "Cái",
    gia_ban_goc: 450000, gia_ban_thuc: 380000, giam_gia: 15,
    barcode: "8934567890002",
    // anh: "https://images.unsplash.com/photo-1625910513796-d0b8549c6a86?w=400&q=80",
    anh: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYwo4kfUESc_Rw-jchJQElc6pwonAj-0WaNA&s",
    danh_gia: 4.5, luot_danh_gia: 820, luot_ban: 1500, is_new: true, is_sale: true,
    bien_the: [
      { id:7,  ma_bien_the:"SP002-XANH-S", mau_sac:"Xanh Navy", kich_thuoc:"S", gia_ban_goc:450000, gia_ban_thuc:380000, giam_gia:15, gia_si:285000, ton_kho:45, anh:"https://images.unsplash.com/photo-1625910513796-d0b8549c6a86?w=400&q=80", barcode:"8934567890002-01" },
      { id:8,  ma_bien_the:"SP002-XANH-M", mau_sac:"Xanh Navy", kich_thuoc:"M", gia_ban_goc:450000, gia_ban_thuc:380000, giam_gia:15, gia_si:285000, ton_kho:80, anh:"https://images.unsplash.com/photo-1625910513796-d0b8549c6a86?w=400&q=80", barcode:"8934567890002-02" },
      { id:9,  ma_bien_the:"SP002-XANH-L", mau_sac:"Xanh Navy", kich_thuoc:"L", gia_ban_goc:450000, gia_ban_thuc:380000, giam_gia:15, gia_si:285000, ton_kho:55, anh:"https://images.unsplash.com/photo-1625910513796-d0b8549c6a86?w=400&q=80", barcode:"8934567890002-03" },
      { id:10, ma_bien_the:"SP002-DO-M",   mau_sac:"Đỏ",        kich_thuoc:"M", gia_ban_goc:450000, gia_ban_thuc:380000, giam_gia:15, gia_si:285000, ton_kho:30, anh:"https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&q=80", barcode:"8934567890002-04" },
    ],
  },
  {
    id: 3, ma_sp: "SP003", ten_sp: "Quần Jean Nam Slim Fit",
    mo_ta: "Quần jean nam dáng slim fit, chất liệu denim co giãn, thời trang năng động",
    loai_sp: "Quần", danh_muc_id: "DM002", don_vi_tinh: "Cái",
    gia_ban_goc: 650000, gia_ban_thuc: 520000, giam_gia: 20,
    barcode: "8934567890003",
    anh: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80",
    danh_gia: 4.6, luot_danh_gia: 960, luot_ban: 2100, is_hot: true, is_sale: true,
    bien_the: [
      { id:11, ma_bien_the:"SP003-XANH-29", mau_sac:"Xanh Denim", kich_thuoc:"29", gia_ban_goc:650000, gia_ban_thuc:520000, giam_gia:20, gia_si:390000, ton_kho:40, anh:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", barcode:"8934567890003-01" },
      { id:12, ma_bien_the:"SP003-XANH-30", mau_sac:"Xanh Denim", kich_thuoc:"30", gia_ban_goc:650000, gia_ban_thuc:520000, giam_gia:20, gia_si:390000, ton_kho:65, anh:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", barcode:"8934567890003-02" },
      { id:13, ma_bien_the:"SP003-XANH-31", mau_sac:"Xanh Denim", kich_thuoc:"31", gia_ban_goc:650000, gia_ban_thuc:520000, giam_gia:20, gia_si:390000, ton_kho:50, anh:"https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80", barcode:"8934567890003-03" },
      { id:14, ma_bien_the:"SP003-DEN-30",  mau_sac:"Đen",        kich_thuoc:"30", gia_ban_goc:650000, gia_ban_thuc:520000, giam_gia:20, gia_si:390000, ton_kho:35, anh:"https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80", barcode:"8934567890003-04" },
    ],
  },
  {
    id: 4, ma_sp: "SP004", ten_sp: "Váy Đầm Nữ Hoa Nhí",
    mo_ta: "Váy đầm nữ họa tiết hoa nhí, chất liệu voan mềm mại, dáng xòe nhẹ nhàng",
    loai_sp: "Váy", danh_muc_id: "DM003", don_vi_tinh: "Cái",
    gia_ban_goc: 380000, gia_ban_thuc: 299000, giam_gia: 21,
    barcode: "8934567890004",
    anh: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80",
    danh_gia: 4.8, luot_danh_gia: 1560, luot_ban: 2800, is_hot: true, is_sale: true,
    bien_the: [
      { id:15, ma_bien_the:"SP004-HOA-S", mau_sac:"Hoa Nhí Hồng", kich_thuoc:"S", gia_ban_goc:380000, gia_ban_thuc:299000, giam_gia:21, gia_si:224000, ton_kho:55, anh:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", barcode:"8934567890004-01" },
      { id:16, ma_bien_the:"SP004-HOA-M", mau_sac:"Hoa Nhí Hồng", kich_thuoc:"M", gia_ban_goc:380000, gia_ban_thuc:299000, giam_gia:21, gia_si:224000, ton_kho:80, anh:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", barcode:"8934567890004-02" },
      { id:17, ma_bien_the:"SP004-HOA-L", mau_sac:"Hoa Nhí Hồng", kich_thuoc:"L", gia_ban_goc:380000, gia_ban_thuc:299000, giam_gia:21, gia_si:224000, ton_kho:40, anh:"https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80", barcode:"8934567890004-03" },
    ],
  },
  {
    id: 5, ma_sp: "SP005", ten_sp: "Áo Sơ Mi Nữ Trắng",
    mo_ta: "Áo sơ mi nữ màu trắng, chất liệu lụa mỏng, phù hợp đi làm và dự tiệc",
    loai_sp: "Áo", danh_muc_id: "DM003", don_vi_tinh: "Cái",
    gia_ban_goc: 320000, gia_ban_thuc: 280000, giam_gia: 12,
    barcode: "8934567890005",
    anh: "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=400&q=80",
    danh_gia: 4.4, luot_danh_gia: 540, luot_ban: 980, is_new: true, is_sale: true,
    bien_the: [
      { id:18, ma_bien_the:"SP005-TRANG-S", mau_sac:"Trắng", kich_thuoc:"S", gia_ban_goc:320000, gia_ban_thuc:280000, giam_gia:12, gia_si:210000, ton_kho:60, anh:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=400&q=80", barcode:"8934567890005-01" },
      { id:19, ma_bien_the:"SP005-TRANG-M", mau_sac:"Trắng", kich_thuoc:"M", gia_ban_goc:320000, gia_ban_thuc:280000, giam_gia:12, gia_si:210000, ton_kho:90, anh:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=400&q=80", barcode:"8934567890005-02" },
      { id:20, ma_bien_the:"SP005-TRANG-L", mau_sac:"Trắng", kich_thuoc:"L", gia_ban_goc:320000, gia_ban_thuc:280000, giam_gia:12, gia_si:210000, ton_kho:45, anh:"https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=400&q=80", barcode:"8934567890005-03" },
    ],
  },
  {
    id: 6, ma_sp: "SP006", ten_sp: "Giày Sneaker Unisex",
    mo_ta: "Giày sneaker unisex phong cách thể thao, đế cao su chống trượt, thoải mái khi vận động",
    loai_sp: "Giày", danh_muc_id: "DM004", don_vi_tinh: "Đôi",
    gia_ban_goc: 850000, gia_ban_thuc: 699000, giam_gia: 17,
    barcode: "8934567890006",
    anh: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    danh_gia: 4.9, luot_danh_gia: 2100, luot_ban: 4500, is_hot: true, is_sale: true,
    bien_the: [
      { id:21, ma_bien_the:"SP006-TRANG-38", mau_sac:"Trắng", kich_thuoc:"38", gia_ban_goc:850000, gia_ban_thuc:699000, giam_gia:17, gia_si:524000, ton_kho:30, anh:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", barcode:"8934567890006-01" },
      { id:22, ma_bien_the:"SP006-TRANG-39", mau_sac:"Trắng", kich_thuoc:"39", gia_ban_goc:850000, gia_ban_thuc:699000, giam_gia:17, gia_si:524000, ton_kho:45, anh:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", barcode:"8934567890006-02" },
      { id:23, ma_bien_the:"SP006-TRANG-40", mau_sac:"Trắng", kich_thuoc:"40", gia_ban_goc:850000, gia_ban_thuc:699000, giam_gia:17, gia_si:524000, ton_kho:25, anh:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80", barcode:"8934567890006-03" },
      { id:24, ma_bien_the:"SP006-DEN-39",   mau_sac:"Đen",   kich_thuoc:"39", gia_ban_goc:850000, gia_ban_thuc:699000, giam_gia:17, gia_si:524000, ton_kho:40, anh:"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80", barcode:"8934567890006-04" },
      { id:25, ma_bien_the:"SP006-DEN-40",   mau_sac:"Đen",   kich_thuoc:"40", gia_ban_goc:850000, gia_ban_thuc:699000, giam_gia:17, gia_si:524000, ton_kho:20, anh:"https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80", barcode:"8934567890006-05" },
    ],
  },
  {
    id: 7, ma_sp: "SP007", ten_sp: "Túi Tote Canvas",
    mo_ta: "Túi tote canvas dày dặn, nhiều ngăn tiện lợi, phong cách tối giản hiện đại",
    loai_sp: "Túi", danh_muc_id: "DM005", don_vi_tinh: "Cái",
    gia_ban_goc: 220000, gia_ban_thuc: 185000, giam_gia: 16,
    barcode: "8934567890007",
    anh: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",
    danh_gia: 4.3, luot_danh_gia: 380, luot_ban: 760, is_sale: true,
    bien_the: [
      { id:26, ma_bien_the:"SP007-KEM-FREE",  mau_sac:"Kem",       kich_thuoc:"Free Size", gia_ban_goc:220000, gia_ban_thuc:185000, giam_gia:16, gia_si:139000, ton_kho:100, anh:"https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&q=80",     barcode:"8934567890007-01" },
      { id:27, ma_bien_the:"SP007-DEN-FREE",  mau_sac:"Đen",       kich_thuoc:"Free Size", gia_ban_goc:220000, gia_ban_thuc:185000, giam_gia:16, gia_si:139000, ton_kho:80,  anh:"https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&q=80",  barcode:"8934567890007-02" },
      { id:28, ma_bien_the:"SP007-XANH-FREE", mau_sac:"Xanh Rêu",  kich_thuoc:"Free Size", gia_ban_goc:220000, gia_ban_thuc:185000, giam_gia:16, gia_si:139000, ton_kho:60,  anh:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",    barcode:"8934567890007-03" },
    ],
  },
  {
    id: 8, ma_sp: "SP008", ten_sp: "Quần Short Nam Thể Thao",
    mo_ta: "Quần short nam chất liệu thun lạnh thoáng khí, phù hợp tập gym và chạy bộ",
    loai_sp: "Quần", danh_muc_id: "DM002", don_vi_tinh: "Cái",
    gia_ban_goc: 280000, gia_ban_thuc: 230000, giam_gia: 18,
    barcode: "8934567890008",
    anh: "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&q=80",
    danh_gia: 4.5, luot_danh_gia: 620, luot_ban: 1400, is_sale: true,
    bien_the: [
      { id:29, ma_bien_the:"SP008-XAM-S", mau_sac:"Xám", kich_thuoc:"S", gia_ban_goc:280000, gia_ban_thuc:230000, giam_gia:18, gia_si:173000, ton_kho:70, anh:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&q=80",   barcode:"8934567890008-01" },
      { id:30, ma_bien_the:"SP008-XAM-M", mau_sac:"Xám", kich_thuoc:"M", gia_ban_goc:280000, gia_ban_thuc:230000, giam_gia:18, gia_si:173000, ton_kho:95, anh:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&q=80",   barcode:"8934567890008-02" },
      { id:31, ma_bien_the:"SP008-XAM-L", mau_sac:"Xám", kich_thuoc:"L", gia_ban_goc:280000, gia_ban_thuc:230000, giam_gia:18, gia_si:173000, ton_kho:60, anh:"https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&q=80",   barcode:"8934567890008-03" },
      { id:32, ma_bien_the:"SP008-DEN-M", mau_sac:"Đen", kich_thuoc:"M", gia_ban_goc:280000, gia_ban_thuc:230000, giam_gia:18, gia_si:173000, ton_kho:50, anh:"https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80",   barcode:"8934567890008-04" },
    ],
  },
];


// ─── POS-specific types & constants ──────────────────────────────────────────
// Thêm phần này vào cuối file shopData.ts

// POSOrder — dùng nội bộ FE (hiển thị OrderHistory, receipt)
// Shape đầy đủ sau khi đã confirm, khớp với types/order.ts POSOrder
export interface POSOrder {
  // ── Định danh ──────────────────────────────────────────
  id:        string;   // = ma_don, dùng làm key nội bộ
  ma_don:    string;   // "DH20240316-0001"
  thoi_gian: string;   // ISO 8601
  ghi_chu?:  string;
  trang_thai: "hoan_thanh" | "huy";
 
  // ── Tài chính ──────────────────────────────────────────
  tam_tinh:  number;   // sum(gia_ban_goc × so_luong)
  tong_tien: number;   // sum(thanh_tien) — thực thu
 
  phuong_thuc:     "tien_mat" | "chuyen_khoan" | "quet_the";
  tien_khach_dua?: number;   // chỉ có khi tien_mat
  tien_thua?:      number;   // chỉ có khi tien_mat
 
  // ── Khách thành viên (null = vãng lai) ─────────────────
  khach_hang?: {
    khach_hang_id:  string;
    ho_ten:         string;
    so_dien_thoai:  string;
    diem_hien_tai:  number;
    diem_tich_them: number;
  } | null;
 
  // ── Items — flat payload gửi BE ────────────────────────
  items: POSOrderItem[];
}
 
// Item trong đơn — flat, không nest SanPham/BienThe
export interface POSOrderItem {
  product_id:   number;
  ma_sp:        string;
  ma_bien_the:  string;
  ten_sp:       string;
  mau_sac:      string;
  kich_thuoc:   string;
  gia_ban_goc:  number;
  gia_ban_thuc: number;
  giam_gia_sp:  number;   // = gia_ban_goc - gia_ban_thuc
  so_luong:     number;
  thanh_tien:   number;   // = gia_ban_thuc × so_luong
}
 
// CartItem riêng cho POS (đơn giản hơn CartItem của shop online)
export interface POSCartItem {
  sanPham: SanPham;       // re-use SanPham từ shopData
  bienThe: BienThe;       // re-use BienThe từ shopData
  soLuong: number;
}
 
export const PAYMENT_METHODS = [
  { id: "tien_mat",      label: "Tiền mặt",     icon: "💵", color: "#27ae60" },
  { id: "chuyen_khoan",  label: "Chuyển khoản", icon: "📱", color: "#2980b9" },
  { id: "quet_the",      label: "Quẹt thẻ",     icon: "💳", color: "#8e44ad" },
] as const;
 
export const QUICK_CASH = [
  10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000,
];
 
export const generateOrderId = () =>
  "DH" + Date.now().toString().slice(-8);
 
export const fmtVND = (n: number) =>
  n.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
 
export const POS_CATEGORIES = [
  { id: "tat-ca", label: "Tất cả", emoji: "🛍️" },
  ...CATEGORIES,
];
 
export const POS_PAGE_SIZE = 12; // số sản phẩm mỗi trang POS