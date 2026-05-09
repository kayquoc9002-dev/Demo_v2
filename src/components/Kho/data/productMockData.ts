
export interface SKUTonKho {
  ma_sku:        string;
  ten_sp:        string;
  mau_sac:       string;
  kich_thuoc:    string;
  vi_tri_ke:     string;
  ton_kho:       number;
  don_gia_nhap?: number;
}

export const MOCK_SKU: SKUTonKho[] = [
  { ma_sku: "AT001-XS-TRANG", ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng",     kich_thuoc: "XS", vi_tri_ke: "KhuA-O01", ton_kho: 3,  don_gia_nhap: 75000  },
  { ma_sku: "AT001-M-TRANG",  ten_sp: "Áo Thun Basic Oversize", mau_sac: "Trắng",     kich_thuoc: "M",  vi_tri_ke: "KhuA-O01", ton_kho: 22, don_gia_nhap: 75000  },
  { ma_sku: "AT001-L-DEN",    ten_sp: "Áo Thun Basic Oversize", mau_sac: "Đen",       kich_thuoc: "L",  vi_tri_ke: "KhuA-O02", ton_kho: 18, don_gia_nhap: 75000  },
  { ma_sku: "AT001-M-HONG",   ten_sp: "Áo Thun Basic Oversize", mau_sac: "Hồng",      kich_thuoc: "M",  vi_tri_ke: "KhuA-O02", ton_kho: 2,  don_gia_nhap: 75000  },
  { ma_sku: "QS002-M-KEM",    ten_sp: "Quần Short Kaki",         mau_sac: "Kem",       kich_thuoc: "M",  vi_tri_ke: "KhuB-O03", ton_kho: 14, don_gia_nhap: 90000  },
  { ma_sku: "QS002-L-DEN",    ten_sp: "Quần Short Kaki",         mau_sac: "Đen",       kich_thuoc: "L",  vi_tri_ke: "KhuB-O03", ton_kho: 9,  don_gia_nhap: 90000  },
  { ma_sku: "VD003-S-HONG",   ten_sp: "Váy Midi Floral",         mau_sac: "Hồng đào",  kich_thuoc: "S",  vi_tri_ke: "KhuC-O02", ton_kho: 7,  don_gia_nhap: 170000 },
  { ma_sku: "VD003-M-XANH",   ten_sp: "Váy Midi Floral",         mau_sac: "Xanh",      kich_thuoc: "M",  vi_tri_ke: "KhuC-O02", ton_kho: 5,  don_gia_nhap: 170000 },
  { ma_sku: "DW005-M-XNGOC",  ten_sp: "Đầm Wrap Cổ V",           mau_sac: "Xanh ngọc", kich_thuoc: "M",  vi_tri_ke: "KhuC-O04", ton_kho: 6,  don_gia_nhap: 240000 },
  { ma_sku: "AK007-L-DEN",    ten_sp: "Áo Khoác Bomber",         mau_sac: "Đen",       kich_thuoc: "L",  vi_tri_ke: "KhuA-O05", ton_kho: 11, don_gia_nhap: 265000 },
  { ma_sku: "SB008-S-DEN",    ten_sp: "Set Đồ Bộ Thể Thao",      mau_sac: "Đen",       kich_thuoc: "S",  vi_tri_ke: "KhuB-O02", ton_kho: 8,  don_gia_nhap: 180000 },
  { ma_sku: "MB009-FS-DEN",   ten_sp: "Mũ Bucket Vải Thô",       mau_sac: "Đen",       kich_thuoc: "FS", vi_tri_ke: "KhuD-O03", ton_kho: 24, don_gia_nhap: 50000  },
  { ma_sku: "MB009-FS-KEM",   ten_sp: "Mũ Bucket Vải Thô",       mau_sac: "Kem",       kich_thuoc: "FS", vi_tri_ke: "KhuD-O03", ton_kho: 31, don_gia_nhap: 50000  },
  { ma_sku: "TT010-OS-KEM",   ten_sp: "Túi Tote Canvas",          mau_sac: "Kem",       kich_thuoc: "OS", vi_tri_ke: "KhuD-O02", ton_kho: 45, don_gia_nhap: 68000  },
  { ma_sku: "QJ004-29-XNHT",  ten_sp: "Quần Jean Skinny",         mau_sac: "Xanh nhạt", kich_thuoc: "29", vi_tri_ke: "KhuB-O05", ton_kho: 16, don_gia_nhap: 125000 },
  { ma_sku: "DS011-42-NAU",   ten_sp: "Dép Sandal Da Bò",         mau_sac: "Nâu bò",   kich_thuoc: "42", vi_tri_ke: "KhuD-O04", ton_kho: 4,  don_gia_nhap: 210000 },
  { ma_sku: "GS006-37-TRANG", ten_sp: "Giày Sneaker Trắng",       mau_sac: "Trắng",     kich_thuoc: "37", vi_tri_ke: "KhuD-O01", ton_kho: 3,  don_gia_nhap: 195000 },
];
