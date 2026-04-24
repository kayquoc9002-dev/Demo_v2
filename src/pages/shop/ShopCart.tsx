import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Trash2, Plus, Minus, ShoppingBag, Tag, Truck } from "lucide-react";
import {
  loadCart, saveCart, fmt, getWholesaleDisc, isWholesaleUser,
} from "../../components/BanHang/data/shopData";
import type { CartItem } from "../../components/BanHang/data/shopData";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CheckoutInfo {
  hoTen: string;
  sdt: string;
  diaChi: string;
  ghiChu: string;
  // Wholesale only
  tenCongTy?: string;
  maSoThue?: string;
  diaChiXuatHD?: string;
}

// ─── Cart Item Row ─────────────────────────────────────────────────────────────
function CartRow({ item, isWholesale, onQtyChange, onRemove }: {
  item: CartItem;
  isWholesale: boolean;
  onQtyChange: (spId: number, btId: number, qty: number) => void;
  onRemove: (spId: number, btId: number) => void;
}) {
  const price = item.bienThe.gia_ban_thuc;
  return (
    <div className="flex gap-3 p-3 rounded-2xl transition-all"
      style={{ background: "white", border: "1px solid #ede8e3" }}>
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden" style={{ background: "#faf8f5" }}>
        <img src={item.bienThe.anh ?? item.sanPham.anh} alt={item.sanPham.ten_sp}
          className="w-full h-full object-cover" />
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black leading-snug line-clamp-1" style={{ color: "#2c1810" }}>
          {item.sanPham.ten_sp}
        </p>
        <p className="text-[10px] mt-0.5" style={{ color: "#a89070" }}>
          {item.bienThe.mau_sac} · {item.bienThe.kich_thuoc} · {item.bienThe.ma_bien_the}
        </p>
        <div className="flex items-center justify-between mt-2">
          {/* Qty stepper */}
          <div className="flex items-center rounded-xl overflow-hidden border" style={{ borderColor: "#ede8e3" }}>
            <button onClick={() => onQtyChange(item.sanPham.id, item.bienThe.id, Math.max(1, item.soLuong - 1))}
              className="w-7 h-7 flex items-center justify-center" style={{ color: "#6b5344" }}>
              <Minus size={11} />
            </button>
            <span className="w-8 text-center text-xs font-black" style={{ color: "#2c1810" }}>{item.soLuong}</span>
            <button onClick={() => onQtyChange(item.sanPham.id, item.bienThe.id, item.soLuong + 1)}
              className="w-7 h-7 flex items-center justify-center" style={{ color: "#6b5344" }}>
              <Plus size={11} />
            </button>
          </div>
          {/* Price */}
          <div className="text-right">
            <p className="text-sm font-black" style={{ color: isWholesale ? "#1a7a5e" : "#c17f44" }}>
              {fmt(price * item.soLuong)}
            </p>
            {item.soLuong > 1 && (
              <p className="text-[10px]" style={{ color: "#a89070" }}>{fmt(price)} / cái</p>
            )}
          </div>
        </div>
      </div>
      {/* Remove */}
      <button onClick={() => onRemove(item.sanPham.id, item.bienThe.id)}
        className="flex-shrink-0 self-start mt-0.5 p-1 rounded-lg transition-all hover:bg-red-50"
        style={{ color: "#c8bdb5" }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Main Cart Page ────────────────────────────────────────────────────────────
export default function ShopCart() {
  const isWholesale = isWholesaleUser();

  const [cart,        setCart]        = useState<CartItem[]>([]);
  const [coupon,      setCoupon]      = useState("");
  const [couponApply, setCouponApply] = useState<{ code: string; pct: number } | null>(null);
  const [step,        setStep]        = useState<"cart" | "checkout" | "done">("cart");
  const [info,        setInfo]        = useState<CheckoutInfo>({
    hoTen: "", sdt: "", diaChi: "", ghiChu: "",
    tenCongTy: "", maSoThue: "", diaChiXuatHD: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadAndSet = useCallback(() => setCart(loadCart()), []);

  useEffect(() => {
    loadAndSet();
    window.addEventListener("shop-cart-updated", loadAndSet);
    return () => window.removeEventListener("shop-cart-updated", loadAndSet);
  }, [loadAndSet]);

  const updateQty = (spId: number, btId: number, qty: number) => {
    const next = cart.map(i =>
      i.sanPham.id === spId && i.bienThe.id === btId ? { ...i, soLuong: qty } : i
    );
    saveCart(next); setCart(next);
  };

  const removeItem = (spId: number, btId: number) => {
    const next = cart.filter(i => !(i.sanPham.id === spId && i.bienThe.id === btId));
    saveCart(next); setCart(next);
  };

  // ─── Totals ─────────────────────────────────────────────
  const totalQty  = cart.reduce((s, i) => s + i.soLuong, 0);
  const subtotal  = cart.reduce((s, i) => s + i.bienThe.gia_ban_thuc * i.soLuong, 0);

  // Wholesale auto-discount
  const wsDisc    = isWholesale ? getWholesaleDisc(totalQty) : 0;
  const wsDiscAmt = Math.round(subtotal * wsDisc / 100);

  // Coupon discount
  const couponDiscAmt = couponApply ? Math.round(subtotal * couponApply.pct / 100) : 0;

  // Shipping: miễn phí nếu sỉ hoặc đơn >= 500k
  const shippingFee = (isWholesale || subtotal >= 500000) ? 0 : 30000;

  const total = subtotal - wsDiscAmt - couponDiscAmt + shippingFee;

  const applyCoupon = () => {
    const COUPONS: Record<string, number> = { "SALE10": 10, "GIAMGIA15": 15, "NEWUSER20": 20 };
    const pct = COUPONS[coupon.toUpperCase()];
    if (pct) setCouponApply({ code: coupon.toUpperCase(), pct });
    else alert("Mã giảm giá không hợp lệ");
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: POST to /api/shop/don-hang
    await new Promise(r => setTimeout(r, 1200));
    saveCart([]); setCart([]);
    setStep("done");
    setSubmitting(false);
  };

  // ─── Empty cart ─────────────────────────────────────────
  if (cart.length === 0 && step !== "done") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <ShoppingBag size={56} color="#ede8e3" className="mx-auto mb-4" />
        <h2 className="text-xl font-black mb-2" style={{ color: "#2c1810", fontFamily: "'DM Serif Display', serif" }}>
          Giỏ hàng trống
        </h2>
        <p className="text-sm mb-6" style={{ color: "#a89070" }}>Thêm sản phẩm vào giỏ để tiếp tục mua sắm</p>
        <Link to="/shop/san-pham"
          className="inline-block px-6 py-3 rounded-2xl text-sm font-black"
          style={{ background: "#c17f44", color: "white" }}>
          Khám phá sản phẩm
        </Link>
      </div>
    );
  }

  // ─── Order done ─────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "#e8f8ef" }}>
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-black mb-2" style={{ color: "#2c1810", fontFamily: "'DM Serif Display', serif" }}>
          Đặt hàng thành công!
        </h2>
        <p className="text-sm mb-6" style={{ color: "#a89070" }}>
          Chúng tôi sẽ liên hệ xác nhận đơn trong vòng 30 phút
        </p>
        <Link to="/shop/san-pham"
          className="inline-block px-6 py-3 rounded-2xl text-sm font-black"
          style={{ background: "#c17f44", color: "white" }}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "#a89070" }}>
        <Link to="/shop">Trang chủ</Link>
        <ChevronRight size={11} />
        <span style={{ color: "#2c1810", fontWeight: 600 }}>Giỏ hàng</span>
        {step === "checkout" && <><ChevronRight size={11} /><span style={{ color: "#2c1810", fontWeight: 600 }}>Thanh toán</span></>}
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {["cart","checkout"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                style={{ background: step === s || (s === "cart" && step === "checkout") ? "#c17f44" : "#ede8e3", color: step === s || (s === "cart" && step === "checkout") ? "white" : "#a89070" }}>
                {i + 1}
              </div>
              <span className="text-xs font-semibold" style={{ color: step === s ? "#2c1810" : "#a89070" }}>
                {s === "cart" ? "Giỏ hàng" : "Thông tin"}
              </span>
            </div>
            {i < 1 && <ChevronRight size={12} color="#c8bdb5" />}
          </div>
        ))}
      </div>

      <div className="flex gap-5 flex-col lg:flex-row">
        {/* ── Left ──────────────────────────────────────── */}
        <div className="flex-1 space-y-3">
          {step === "cart" ? (
            <>
              {isWholesale && totalQty > 0 && (
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold"
                  style={{ background: wsDisc > 0 ? "#e8f8ef" : "#faf3ea", color: wsDisc > 0 ? "#1a7a5e" : "#c17f44" }}>
                  <span>{wsDisc > 0 ? `🎉 ${totalQty} SP — Chiết khấu sỉ ${wsDisc}%` : `Đặt ≥20 SP để nhận chiết khấu · Hiện: ${totalQty} SP`}</span>
                  {wsDisc > 0 && <span className="font-black">-{fmt(wsDiscAmt)}</span>}
                </div>
              )}
              {cart.map(item => (
                <CartRow key={`${item.sanPham.id}-${item.bienThe.id}`}
                  item={item} isWholesale={isWholesale}
                  onQtyChange={updateQty} onRemove={removeItem} />
              ))}
            </>
          ) : (
            /* Checkout form */
            <div className="rounded-2xl p-5" style={{ background: "white", border: "1px solid #ede8e3" }}>
              <h3 className="text-sm font-black mb-4" style={{ color: "#2c1810" }}>Thông tin giao hàng</h3>
              <div className="space-y-3">
                {[
                  { key: "hoTen",  label: "Họ và tên *",       placeholder: "Nguyễn Văn A" },
                  { key: "sdt",    label: "Số điện thoại *",   placeholder: "0912 345 678" },
                  { key: "diaChi", label: "Địa chỉ giao hàng *", placeholder: "123 Đường ABC, Phường XYZ, TP.HCM" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="text-xs font-bold block mb-1" style={{ color: "#6b5344" }}>{label}</label>
                     {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <input value={(info as any)[key]} onChange={e => setInfo(i => ({ ...i, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ border: "1.5px solid #ede8e3", color: "#2c1810", background: "white" }} />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold block mb-1" style={{ color: "#6b5344" }}>Ghi chú</label>
                  <textarea value={info.ghiChu} onChange={e => setInfo(i => ({ ...i, ghiChu: e.target.value }))}
                    placeholder="Yêu cầu đặc biệt, giờ giao hàng..."
                    rows={2} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                    style={{ border: "1.5px solid #ede8e3", color: "#2c1810", background: "white" }} />
                </div>

                {/* Wholesale billing info */}
                {isWholesale && (
                  <div className="pt-3 border-t" style={{ borderColor: "#ede8e3" }}>
                    <p className="text-xs font-black mb-3" style={{ color: "#1a7a5e" }}>Thông tin xuất hóa đơn (nếu có)</p>
                    {[
                      { key: "tenCongTy",    label: "Tên công ty",      placeholder: "Công ty TNHH ABC" },
                      { key: "maSoThue",     label: "Mã số thuế",       placeholder: "0123456789" },
                      { key: "diaChiXuatHD", label: "Địa chỉ xuất HĐ", placeholder: "Địa chỉ đăng ký kinh doanh" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="mb-2">
                        <label className="text-xs font-bold block mb-1" style={{ color: "#6b5344" }}>{label}</label>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <input value={(info as any)[key] ?? ""} onChange={e => setInfo(i => ({ ...i, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                          style={{ border: "1.5px solid #ede8e3", color: "#2c1810", background: "white" }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right — Summary ───────────────────────────── */}
        <div className="lg:w-80 flex-shrink-0 space-y-3">
          {/* Coupon */}
          {step === "cart" && (
            <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #ede8e3" }}>
              <p className="text-xs font-black mb-2" style={{ color: "#2c1810" }}>Mã giảm giá</p>
              {couponApply ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                  style={{ background: "#e8f8ef" }}>
                  <div className="flex items-center gap-2">
                    <Tag size={13} color="#1a7a5e" />
                    <span className="text-xs font-black" style={{ color: "#1a7a5e" }}>{couponApply.code} (-{couponApply.pct}%)</span>
                  </div>
                  <button onClick={() => setCouponApply(null)} className="text-xs" style={{ color: "#a89070" }}>✕</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={coupon} onChange={e => setCoupon(e.target.value)}
                    placeholder="Nhập mã..."
                    className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                    style={{ border: "1.5px solid #ede8e3", color: "#2c1810", background: "white" }} />
                  <button onClick={applyCoupon}
                    className="px-3 py-2 rounded-xl text-xs font-black"
                    style={{ background: "#c17f44", color: "white" }}>
                    Áp dụng
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Order summary */}
          <div className="rounded-2xl p-4 space-y-2.5" style={{ background: "white", border: "1px solid #ede8e3" }}>
            <p className="text-xs font-black mb-3" style={{ color: "#2c1810" }}>Tóm tắt đơn hàng</p>

            <div className="flex justify-between text-xs" style={{ color: "#6b5344" }}>
              <span>Tạm tính ({totalQty} SP)</span>
              <span className="font-semibold">{fmt(subtotal)}</span>
            </div>

            {wsDiscAmt > 0 && (
              <div className="flex justify-between text-xs" style={{ color: "#1a7a5e" }}>
                <span>Chiết khấu sỉ ({wsDisc}%)</span>
                <span className="font-bold">-{fmt(wsDiscAmt)}</span>
              </div>
            )}

            {couponDiscAmt > 0 && (
              <div className="flex justify-between text-xs" style={{ color: "#1a7a5e" }}>
                <span>Mã giảm giá ({couponApply?.pct}%)</span>
                <span className="font-bold">-{fmt(couponDiscAmt)}</span>
              </div>
            )}

            <div className="flex justify-between text-xs" style={{ color: shippingFee === 0 ? "#1a7a5e" : "#6b5344" }}>
              <span className="flex items-center gap-1"><Truck size={11} /> Phí vận chuyển</span>
              <span className="font-semibold">{shippingFee === 0 ? "Miễn phí" : fmt(shippingFee)}</span>
            </div>

            <div className="border-t pt-2.5" style={{ borderColor: "#ede8e3" }}>
              <div className="flex justify-between">
                <span className="text-sm font-black" style={{ color: "#2c1810" }}>Tổng cộng</span>
                <span className="text-lg font-black" style={{ color: isWholesale ? "#1a7a5e" : "#c17f44" }}>
                  {fmt(total)}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          {step === "cart" ? (
            <button onClick={() => setStep("checkout")}
              className="w-full py-3.5 rounded-2xl text-sm font-black transition-all"
              style={{ background: isWholesale ? "#1a7a5e" : "#c17f44", color: "white" }}>
              {isWholesale ? "Tiếp tục đặt đơn sỉ" : "Tiếp tục thanh toán"} →
            </button>
          ) : (
            <div className="space-y-2">
              <button onClick={handleSubmit} disabled={submitting || !info.hoTen || !info.sdt || !info.diaChi}
                className="w-full py-3.5 rounded-2xl text-sm font-black transition-all"
                style={{ background: submitting || !info.hoTen || !info.sdt || !info.diaChi ? "#c8bdb5" : isWholesale ? "#1a7a5e" : "#c17f44", color: "white" }}>
                {submitting ? "Đang xử lý..." : isWholesale ? "Xác nhận đơn sỉ" : "Đặt hàng ngay"}
              </button>
              <button onClick={() => setStep("cart")} className="w-full py-2 text-xs font-semibold" style={{ color: "#a89070" }}>
                ← Quay lại giỏ hàng
              </button>
            </div>
          )}

          {/* Trust */}
          <p className="text-[10px] text-center" style={{ color: "#c8bdb5" }}>
            🔒 Bảo mật · ✅ Đổi trả 7 ngày · 🚚 Giao nhanh 2–3 ngày
          </p>
        </div>
      </div>
    </div>
  );
}