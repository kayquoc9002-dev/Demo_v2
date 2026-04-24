import { useState } from "react";
import { X, CheckCircle, Printer, RotateCcw, User, Search } from "lucide-react";
import {
  fmt,
  fmtVND,
  PAYMENT_METHODS,
  QUICK_CASH,
  generateOrderId,
  type POSCartItem,
} from "../data/shopData";
import { type POSOrder, type POSOrderItem } from "../data/shopData";

// Shape khách thành viên (dùng nội bộ modal)
interface KhachHangSnapshot {
  khach_hang_id: string;
  ho_ten: string;
  so_dien_thoai: string;
  diem_hien_tai: number;
  diem_tich_them: number;
}

interface CheckoutModalProps {
  items: POSCartItem[];
  onConfirm: (order: POSOrder) => void;
  onClose: () => void;
  onSuccess: () => void; // callback khi đơn đã được xác nhận thành công, để xóa giỏ hàng
}

type Step = "payment" | "cash_input" | "success";

// Helper: build POSOrderItem[] từ POSCartItem[]
function buildItems(items: POSCartItem[]): POSOrderItem[] {
  return items.map((item) => {
    const giaBanGoc = item.bienThe.gia_ban_goc;
    const giaBanThuc = item.bienThe.gia_ban_thuc;
    return {
      product_id: item.sanPham.id,
      ma_sp: item.sanPham.ma_sp,
      ma_bien_the: item.bienThe.ma_bien_the,
      ten_sp: item.sanPham.ten_sp,
      mau_sac: item.bienThe.mau_sac,
      kich_thuoc: item.bienThe.kich_thuoc,
      gia_ban_goc: giaBanGoc,
      gia_ban_thuc: giaBanThuc,
      giam_gia_sp: giaBanGoc - giaBanThuc,
      so_luong: item.soLuong,
      thanh_tien: giaBanThuc * item.soLuong,
    };
  });
}

export default function CheckoutModal({
  items,
  onConfirm,
  onClose,
  onSuccess,
}: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("payment");
  const [method, setMethod] = useState<POSOrder["phuong_thuc"]>("tien_mat");
  const [tienKhach, setTienKhach] = useState("");
  const [ghiChu, setGhiChu] = useState("");
  const [order, setOrder] = useState<POSOrder | null>(null);

  // Khách thành viên
  const [sdtInput, setSdtInput] = useState("");
  const [khachHang, setKhachHang] = useState<KhachHangSnapshot | null>(null);
  const [sdtNotFound, setSdtNotFound] = useState(false);

  // Tài chính
  const builtItems = buildItems(items);
  const tamTinh = builtItems.reduce(
    (s, i) => s + i.gia_ban_goc * i.so_luong,
    0,
  );
  const tongTien = builtItems.reduce((s, i) => s + i.thanh_tien, 0);
  const tietKiem = tamTinh - tongTien;
  const diemTichThem = Math.floor(tongTien / 1000);

  const tienKhachNum = parseInt(tienKhach.replace(/\D/g, "")) || 0;
  const tienThua = Math.max(0, tienKhachNum - tongTien);

  // ── Tìm khách theo SĐT (mock — sau thay bằng API call) ──────
  const handleTimKhach = () => {
    setSdtNotFound(false);
    // TODO: thay bằng fetch(`/api/customers?phone=${sdtInput}`)
    // Mock: giả sử SĐT bắt đầu bằng 09 là thành viên
    if (sdtInput.startsWith("09") && sdtInput.length === 10) {
      setKhachHang({
        khach_hang_id: "KH-MOCK-001",
        ho_ten: "Nguyễn Văn A",
        so_dien_thoai: sdtInput,
        diem_hien_tai: 1250,
        diem_tich_them: diemTichThem,
      });
    } else {
      setSdtNotFound(true);
    }
  };

  // ── Xác nhận đơn ─────────────────────────────────────────────
  const confirmOrder = (tienDua: number) => {
    const maDon = generateOrderId();
    const newOrder: POSOrder = {
      id: maDon,
      ma_don: maDon,
      thoi_gian: new Date().toISOString(),
      ghi_chu: ghiChu || undefined,
      trang_thai: "hoan_thanh",

      tam_tinh: tamTinh,
      tong_tien: tongTien,

      phuong_thuc: method,
      tien_khach_dua: method === "tien_mat" ? tienDua : undefined,
      tien_thua: method === "tien_mat" ? tienThua : undefined,

      khach_hang: khachHang
        ? { ...khachHang, diem_tich_them: diemTichThem }
        : null,

      items: builtItems,
    };

    setOrder(newOrder);
    onConfirm(newOrder);
    setStep("success");
  };

  const handlePayment = () => {
    if (method === "tien_mat") setStep("cash_input");
    else confirmOrder(0);
  };

  const addQuickCash = (amount: number) =>
    setTienKhach((prev) =>
      String((parseInt(prev.replace(/\D/g, "")) || 0) + amount),
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(44,24,16,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: "white", maxHeight: "92vh", overflowY: "auto" }}
      >
        {/* ── Bước 1: Thanh toán ── */}
        {step === "payment" && (
          <>
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                background: "#faf3ea",
                borderBottom: "1px solid #ede8e3",
              }}
            >
              <h2
                className="shop-serif text-xl font-black"
                style={{ color: "#2c1810" }}
              >
                Thanh toán
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{ background: "#ede8e3" }}
              >
                <X size={16} style={{ color: "#2c1810" }} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Tóm tắt đơn */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "#faf3ea", border: "1px solid #ede8e3" }}
              >
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "#a89070" }}
                >
                  ĐƠN HÀNG ({items.reduce((s, i) => s + i.soLuong, 0)} sản phẩm)
                </p>
                <div className="flex flex-col gap-1.5 mb-3 max-h-36 overflow-y-auto">
                  {builtItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span
                        style={{ color: "#5c3317" }}
                        className="font-medium flex-1 mr-2 line-clamp-1"
                      >
                        {item.ten_sp}
                        <span style={{ color: "#a89070" }}>
                          {" "}
                          · {item.mau_sac}/{item.kich_thuoc}
                        </span>
                        <span style={{ color: "#a89070" }}>
                          {" "}
                          x{item.so_luong}
                        </span>
                      </span>
                      <div className="text-right flex-shrink-0">
                        {item.giam_gia_sp > 0 && (
                          <p
                            className="text-[10px] line-through"
                            style={{ color: "#c4b49e" }}
                          >
                            {fmt(item.gia_ban_goc * item.so_luong)}
                          </p>
                        )}
                        <p className="font-bold" style={{ color: "#2c1810" }}>
                          {fmt(item.thanh_tien)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tài chính tóm tắt */}
                {tietKiem > 0 && (
                  <div
                    className="flex justify-between text-xs py-2"
                    style={{
                      borderTop: "1px dashed #ede8e3",
                      color: "#27ae60",
                    }}
                  >
                    <span className="font-bold">Tiết kiệm</span>
                    <span className="font-bold">- {fmtVND(tietKiem)}</span>
                  </div>
                )}
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: "1px solid #ede8e3" }}
                >
                  <span
                    className="text-base font-black"
                    style={{ color: "#2c1810" }}
                  >
                    Tổng cộng
                  </span>
                  <span
                    className="text-xl font-black"
                    style={{ color: "#c17f44" }}
                  >
                    {fmtVND(tongTien)}
                  </span>
                </div>
              </div>

              {/* Khách thành viên */}
              <div>
                <p
                  className="text-xs font-black mb-2"
                  style={{ color: "#a89070" }}
                >
                  KHÁCH THÀNH VIÊN
                </p>
                {khachHang ? (
                  <div
                    className="flex items-center justify-between p-3 rounded-2xl"
                    style={{
                      background: "#eafaf1",
                      border: "1px solid #a8e6c4",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: "#27ae60" }}
                      >
                        <User size={14} style={{ color: "white" }} />
                      </div>
                      <div>
                        <p
                          className="text-xs font-black"
                          style={{ color: "#1a7a45" }}
                        >
                          {khachHang.ho_ten}
                        </p>
                        <p className="text-[10px]" style={{ color: "#27ae60" }}>
                          {khachHang.so_dien_thoai} · {khachHang.diem_hien_tai}{" "}
                          điểm
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px]" style={{ color: "#27ae60" }}>
                        Tích thêm
                      </p>
                      <p
                        className="text-sm font-black"
                        style={{ color: "#1a7a45" }}
                      >
                        +{diemTichThem} điểm
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setKhachHang(null);
                        setSdtInput("");
                      }}
                      className="ml-2 w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: "#c8f0dc" }}
                    >
                      <X size={10} style={{ color: "#1a7a45" }} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      inputMode="numeric"
                      placeholder="Nhập số điện thoại..."
                      value={sdtInput}
                      onChange={(e) => {
                        setSdtInput(e.target.value);
                        setSdtNotFound(false);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleTimKhach()}
                      className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                      style={{
                        background: "#faf3ea",
                        border: `1px solid ${sdtNotFound ? "#e74c3c" : "#ede8e3"}`,
                        color: "#2c1810",
                      }}
                    />
                    <button
                      onClick={handleTimKhach}
                      disabled={sdtInput.length < 8}
                      className="px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold active:scale-95 transition-transform disabled:opacity-40"
                      style={{ background: "#c17f44", color: "white" }}
                    >
                      <Search size={13} /> Tìm
                    </button>
                  </div>
                )}
                {sdtNotFound && (
                  <p
                    className="text-[10px] mt-1.5 font-bold"
                    style={{ color: "#e74c3c" }}
                  >
                    Không tìm thấy thành viên với SĐT này
                  </p>
                )}
              </div>

              {/* Phương thức */}
              <div>
                <p
                  className="text-xs font-black mb-2"
                  style={{ color: "#a89070" }}
                >
                  PHƯƠNG THỨC THANH TOÁN
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() =>
                        setMethod(pm.id as POSOrder["phuong_thuc"])
                      }
                      className="py-4 rounded-2xl flex flex-col items-center gap-2 active:scale-95 transition-all"
                      style={{
                        background:
                          method === pm.id ? pm.color + "15" : "#faf3ea",
                        border: `2px solid ${method === pm.id ? pm.color : "#ede8e3"}`,
                      }}
                    >
                      <span className="text-2xl">{pm.icon}</span>
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: method === pm.id ? pm.color : "#a89070",
                        }}
                      >
                        {pm.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghi chú */}
              <textarea
                placeholder="Ghi chú đơn hàng..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{
                  background: "#faf3ea",
                  border: "1px solid #ede8e3",
                  color: "#2c1810",
                }}
              />

              <button
                onClick={handlePayment}
                className="w-full py-4 rounded-2xl font-black text-base active:scale-95 transition-transform"
                style={{
                  background:
                    "linear-gradient(135deg, #c17f44 0%, #e09550 100%)",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(193,127,68,0.4)",
                }}
              >
                {method === "tien_mat"
                  ? "Nhập tiền khách →"
                  : `Xác nhận ${fmtVND(tongTien)}`}
              </button>
            </div>
          </>
        )}

        {/* ── Bước 2: Tiền mặt ── */}
        {step === "cash_input" && (
          <>
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{
                background: "#faf3ea",
                borderBottom: "1px solid #ede8e3",
              }}
            >
              <button
                onClick={() => setStep("payment")}
                className="text-xs font-bold"
                style={{ color: "#c17f44" }}
              >
                ← Quay lại
              </button>
              <h2
                className="shop-serif text-xl font-black"
                style={{ color: "#2c1810" }}
              >
                Tiền mặt
              </h2>
              <div style={{ width: 64 }} />
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div
                className="text-center py-4 rounded-2xl"
                style={{ background: "#faf3ea" }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: "#a89070" }}
                >
                  Khách cần trả
                </p>
                <p className="text-3xl font-black" style={{ color: "#c17f44" }}>
                  {fmtVND(tongTien)}
                </p>
              </div>

              <div
                className="rounded-2xl p-4 text-center"
                style={{
                  background: "white",
                  border: `2px solid ${tienKhachNum >= tongTien ? "#27ae60" : "#c17f44"}`,
                }}
              >
                <p
                  className="text-xs font-bold mb-1"
                  style={{ color: "#a89070" }}
                >
                  Tiền khách đưa
                </p>
                <p className="text-3xl font-black" style={{ color: "#2c1810" }}>
                  {tienKhachNum ? fmtVND(tienKhachNum) : "0 ₫"}
                </p>
                {tienKhachNum >= tongTien && (
                  <p
                    className="text-sm font-black mt-2"
                    style={{ color: "#27ae60" }}
                  >
                    Tiền thừa: {fmtVND(tienThua)}
                  </p>
                )}
                {tienKhachNum > 0 && tienKhachNum < tongTien && (
                  <p
                    className="text-sm font-black mt-2"
                    style={{ color: "#e74c3c" }}
                  >
                    Còn thiếu: {fmtVND(tongTien - tienKhachNum)}
                  </p>
                )}
              </div>

              <div>
                <p
                  className="text-xs font-bold mb-2"
                  style={{ color: "#a89070" }}
                >
                  MỆNH GIÁ NHANH
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_CASH.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => addQuickCash(amount)}
                      className="py-3 rounded-xl text-xs font-black active:scale-95 transition-transform"
                      style={{
                        background: "#faf3ea",
                        color: "#5c3317",
                        border: "1px solid #ede8e3",
                      }}
                    >
                      {amount >= 1_000_000
                        ? (amount / 1_000_000).toFixed(0) + "tr"
                        : (amount / 1_000).toFixed(0) + "k"}
                    </button>
                  ))}
                  <button
                    onClick={() => setTienKhach(String(tongTien))}
                    className="py-3 rounded-xl text-xs font-black active:scale-95 transition-transform col-span-2"
                    style={{
                      background: "#faf3ea",
                      color: "#c17f44",
                      border: "1px dashed #c17f44",
                    }}
                  >
                    Đúng tiền
                  </button>
                  <button
                    onClick={() => setTienKhach("")}
                    className="py-3 rounded-xl text-xs font-black active:scale-95 transition-transform col-span-2"
                    style={{
                      background: "#fdecea",
                      color: "#e74c3c",
                      border: "1px solid #f5c3c0",
                    }}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <button
                onClick={() => confirmOrder(tienKhachNum)}
                disabled={tienKhachNum < tongTien}
                className="w-full py-4 rounded-2xl font-black text-base active:scale-95 transition-transform disabled:opacity-40"
                style={{
                  background:
                    "linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)",
                  color: "white",
                  boxShadow:
                    tienKhachNum >= tongTien
                      ? "0 4px 20px rgba(39,174,96,0.4)"
                      : "none",
                }}
              >
                ✓ Xác nhận thanh toán
              </button>
            </div>
          </>
        )}

        {/* ── Bước 3: Thành công ── */}
        {step === "success" && order && (
          <div className="p-6 flex flex-col items-center gap-4 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#eafaf1" }}
            >
              <CheckCircle size={40} style={{ color: "#27ae60" }} />
            </div>
            <div>
              <h2
                className="shop-serif text-2xl font-black"
                style={{ color: "#2c1810" }}
              >
                Thanh toán thành công!
              </h2>
              <p className="text-sm mt-1" style={{ color: "#a89070" }}>
                Mã đơn:{" "}
                <span className="font-black" style={{ color: "#c17f44" }}>
                  {order.ma_don}
                </span>
              </p>
            </div>

            <div
              className="w-full rounded-2xl p-4 text-left"
              style={{ background: "#faf3ea", border: "1px solid #ede8e3" }}
            >
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "#a89070" }}>Tổng tiền</span>
                <span className="font-black" style={{ color: "#c17f44" }}>
                  {fmtVND(order.tong_tien)}
                </span>
              </div>
              {order.tam_tinh > order.tong_tien && (
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: "#a89070" }}>Tiết kiệm</span>
                  <span className="font-bold" style={{ color: "#27ae60" }}>
                    - {fmtVND(order.tam_tinh - order.tong_tien)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm mb-2">
                <span style={{ color: "#a89070" }}>Phương thức</span>
                <span className="font-bold" style={{ color: "#2c1810" }}>
                  {
                    PAYMENT_METHODS.find((m) => m.id === order.phuong_thuc)
                      ?.label
                  }
                </span>
              </div>
              {order.phuong_thuc === "tien_mat" &&
                (order.tien_khach_dua ?? 0) > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: "#a89070" }}>Tiền khách đưa</span>
                      <span className="font-bold" style={{ color: "#2c1810" }}>
                        {fmtVND(order.tien_khach_dua!)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-sm pt-2"
                      style={{ borderTop: "1px solid #ede8e3" }}
                    >
                      <span className="font-black" style={{ color: "#27ae60" }}>
                        Tiền thừa
                      </span>
                      <span
                        className="font-black text-base"
                        style={{ color: "#27ae60" }}
                      >
                        {fmtVND(order.tien_thua!)}
                      </span>
                    </div>
                  </>
                )}
              {/* Tích điểm */}
              {order.khach_hang && (
                <div
                  className="flex justify-between text-sm mt-3 pt-3"
                  style={{ borderTop: "1px solid #ede8e3" }}
                >
                  <span style={{ color: "#a89070" }}>
                    Điểm tích cho{" "}
                    <span className="font-bold" style={{ color: "#2c1810" }}>
                      {order.khach_hang.ho_ten}
                    </span>
                  </span>
                  <span className="font-black" style={{ color: "#27ae60" }}>
                    +{order.khach_hang.diem_tich_them} điểm
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 w-full">
              <button
                className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  background: "#faf3ea",
                  color: "#5c3317",
                  border: "1px solid #ede8e3",
                }}
              >
                <Printer size={15} /> In hóa đơn
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{
                  background:
                    "linear-gradient(135deg, #c17f44 0%, #e09550 100%)",
                  color: "white",
                }}
              >
                <RotateCcw size={15} /> Đơn mới
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
