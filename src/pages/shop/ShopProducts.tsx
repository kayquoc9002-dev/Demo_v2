import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  Search, SlidersHorizontal, Heart, ShoppingCart,
  X, ChevronRight, Plus, Minus, Truck, RefreshCw, ShieldCheck, Package,
} from "lucide-react";
import {
  MOCK_SAN_PHAM, CATEGORIES, fmt, getMinGia, getMinGiaSi, getGiaSi,
  loadCart, saveCart, isWholesaleUser, getWholesaleDisc, fetchSanPham,
} from "../../components/BanHang/data/shopData";
import type { SanPham, BienThe, CartItem } from "../../components/BanHang/data/shopData";

// ─── Star row ─────────────────────────────────────────────────────────────────
const StarRow = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} width="12" height="12" viewBox="0 0 24 24"
        fill={i < Math.round(rating) ? "#f5c842" : "#e5e0d8"}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
    <span style={{ color: "#a89070", fontSize: 11 }}>({rating}) · {count.toLocaleString()} đánh giá</span>
  </div>
);

// ─── Wholesale Table ───────────────────────────────────────────────────────────
interface WholesaleTableProps {
  sanPham: SanPham;
  rows: { bienTheId: number; soLuong: number }[];
  onChange: (bienTheId: number, qty: number) => void;
}
function WholesaleTable({ sanPham, rows, onChange }: WholesaleTableProps) {
  const colors = Array.from(new Set(sanPham.bien_the.map(b => b.mau_sac)));
  const totalQty = rows.reduce((s, r) => s + r.soLuong, 0);
  const disc = getWholesaleDisc(totalQty);
  return (
    <div>
      {totalQty > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-xl mb-3 text-xs font-bold"
          style={{ background: disc > 0 ? "#e8f8ef" : "#faf3ea", color: disc > 0 ? "#1a7a5e" : "#c17f44" }}>
          <span>{disc > 0 ? `🎉 Đủ ${totalQty} SP — Chiết khấu ${disc}%` : `Đặt ≥20 SP để được chiết khấu · Hiện: ${totalQty} SP`}</span>
          {disc > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: "#1a7a5e", color: "white" }}>-{disc}%</span>}
        </div>
      )}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[["≥20","5%"],["≥50","10%"],["≥100","15%"]].map(([q, p]) => {
          const thr = parseInt(q.replace("≥",""));
          const active = totalQty >= thr && (thr === 100 || totalQty < thr * 2.5);
          return (
            <span key={q} className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ background: active?"#e8f8ef":"#faf8f5", color: active?"#1a7a5e":"#a89070", borderColor: active?"#1a7a5e40":"#ede8e3" }}>
              {q} SP → {p}
            </span>
          );
        })}
      </div>
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "#ede8e3" }}>
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest"
          style={{ background: "#faf3ea", color: "#a89070" }}>
          <span className="col-span-3">Màu</span>
          <span className="col-span-2">Size</span>
          <span className="col-span-2 text-right">Giá sỉ</span>
          <span className="col-span-2 text-right">Tồn</span>
          <span className="col-span-3 text-center">Số lượng</span>
        </div>
        {colors.map(color => (
          <div key={color}>
            <div className="px-3 py-1 text-[10px] font-black"
              style={{ background: "#faf8f5", color: "#6b5344", borderTop: "1px solid #ede8e3" }}>
              {color}
            </div>
            {sanPham.bien_the.filter(b => b.mau_sac === color).map(b => {
              const row = rows.find(r => r.bienTheId === b.id);
              const qty = row?.soLuong ?? 0;
              const giaSi = b.gia_si ?? getGiaSi(b.gia_ban_thuc);
              const ton = b.ton_kho ?? 99;
              return (
                <div key={b.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center border-t"
                  style={{ borderColor: "#ede8e3", background: qty > 0 ? "#fffdf9" : "white" }}>
                  <span className="col-span-3 text-[10px]" style={{ color: "#4a3728" }}>{b.mau_sac}</span>
                  <span className="col-span-2">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-lg"
                      style={{ background: "#faf3ea", color: "#c17f44" }}>{b.kich_thuoc}</span>
                  </span>
                  <span className="col-span-2 text-right text-[10px] font-black" style={{ color: "#c17f44" }}>
                    {(giaSi / 1000).toFixed(0)}k
                  </span>
                  <span className="col-span-2 text-right text-[10px] font-bold"
                    style={{ color: ton > 20 ? "#2ecc71" : ton > 5 ? "#e67e22" : "#e74c3c" }}>
                    {ton}
                  </span>
                  <div className="col-span-3 flex items-center justify-center gap-1">
                    <button onClick={() => onChange(b.id, Math.max(0, qty - 1))}
                      className="w-5 h-5 rounded-lg flex items-center justify-center"
                      style={{ background: "#f0ede8", color: "#6b5344" }}>
                      <Minus size={8} />
                    </button>
                    <input type="number" min={0} value={qty}
                      onChange={e => onChange(b.id, Math.max(0, Number(e.target.value)))}
                      className="w-10 text-center text-xs font-black rounded-lg border py-0.5 outline-none"
                      style={{ borderColor: qty > 0 ? "#c17f44" : "#ede8e3", color: qty > 0 ? "#c17f44" : "#2c1810", background: "white" }} />
                    <button onClick={() => onChange(b.id, qty + 1)}
                      className="w-5 h-5 rounded-lg flex items-center justify-center"
                      style={{ background: "#f0ede8", color: "#6b5344" }}>
                      <Plus size={8} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Product Detail Modal ──────────────────────────────────────────────────────
function ProductDetailModal({ sanPham, onClose }: { sanPham: SanPham; onClose: () => void }) {
  const navigate = useNavigate();
  const isWholesale = isWholesaleUser();

  const colors = Array.from(new Set(sanPham.bien_the.map(b => b.mau_sac)));

  const [selColor, setSelColor] = useState(colors[0] ?? "");
  const [selSize,  setSelSize]  = useState("");
  const [qty,      setQty]      = useState(1);
  const [wsRows,   setWsRows]   = useState(sanPham.bien_the.map(b => ({ bienTheId: b.id, soLuong: 0 })));
  const [toastMsg, setToastMsg] = useState("");
  const [tab,      setTab]      = useState<"mo-ta" | "size-guide" | "danh-gia">("mo-ta");
  const [liked,    setLiked]    = useState(false);

  const availSizes   = sanPham.bien_the.filter(b => b.mau_sac === selColor).map(b => b.kich_thuoc);
  const matchBienThe = sanPham.bien_the.find(b => b.mau_sac === selColor && b.kich_thuoc === selSize);
  const canAdd       = !!matchBienThe && (matchBienThe.ton_kho ?? 99) > 0;

  // Wholesale totals
  const wsTotalQty = wsRows.reduce((s, r) => s + r.soLuong, 0);
  const wsTotalAmt = wsRows.reduce((s, r) => {
    const b = sanPham.bien_the.find(bt => bt.id === r.bienTheId);
    return s + (b?.gia_si ?? getGiaSi(b?.gia_ban_thuc ?? 0)) * r.soLuong;
  }, 0);
  const wsDisc    = getWholesaleDisc(wsTotalQty);
  const wsDiscAmt = Math.round(wsTotalAmt * wsDisc / 100);
  const wsTotal   = wsTotalAmt - wsDiscAmt;

  useEffect(() => {
    if (!availSizes.includes(selSize)) setSelSize(availSizes[0] ?? "");
  }, [selColor]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 2500);
  };

  // Ảnh hiển thị: theo biến thể đang chọn hoặc ảnh chính
  const displayImg = matchBienThe?.anh ?? sanPham.bien_the.find(b => b.mau_sac === selColor)?.anh ?? sanPham.anh;

  // Giá hiển thị
  const displayPrice = isWholesale
    ? (matchBienThe?.gia_si ?? getMinGiaSi(sanPham))
    : (matchBienThe?.gia_ban_thuc ?? getMinGia(sanPham));

  const handleAddCart = () => {
    if (!matchBienThe) return;
    const cart = loadCart();
    const ex = cart.find(i => i.sanPham.id === sanPham.id && i.bienThe.id === matchBienThe.id);
    const newCart: CartItem[] = ex
      ? cart.map(i => i.sanPham.id === sanPham.id && i.bienThe.id === matchBienThe.id
          ? { ...i, soLuong: i.soLuong + qty } : i)
      : [...cart, { sanPham, bienThe: matchBienThe, soLuong: qty }];
    saveCart(newCart);
    window.dispatchEvent(new Event("shop-cart-updated"));
    showToast(`✅ Đã thêm ${qty} × "${sanPham.ten_sp}" vào giỏ!`);
  };

  const handleBuyNow = () => { handleAddCart(); setTimeout(() => navigate("/shop/gio-hang"), 200); };

  const handleWsAddCart = () => {
    if (wsTotalQty === 0) return;
    const cart = loadCart();
    let newCart = [...cart];
    wsRows.filter(r => r.soLuong > 0).forEach(r => {
      const b = sanPham.bien_the.find(bt => bt.id === r.bienTheId)!;
      // Dùng gia_si làm gia_ban_thuc trong giỏ sỉ
      const bienTheSi: BienThe = { ...b, gia_ban_thuc: b.gia_si ?? getGiaSi(b.gia_ban_thuc) };
      const ex = newCart.find(i => i.sanPham.id === sanPham.id && i.bienThe.id === b.id);
      if (ex) newCart = newCart.map(i => i.sanPham.id === sanPham.id && i.bienThe.id === b.id
        ? { ...i, soLuong: i.soLuong + r.soLuong } : i);
      else newCart.push({ sanPham, bienThe: bienTheSi, soLuong: r.soLuong });
    });
    saveCart(newCart);
    window.dispatchEvent(new Event("shop-cart-updated"));
    showToast(`✅ Đã thêm ${wsTotalQty} SP vào giỏ hàng sỉ!`);
  };

  const handleWsBuyNow = () => { handleWsAddCart(); setTimeout(() => navigate("/shop/gio-hang"), 200); };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(44,24,16,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div className="relative w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl"
        style={{ background: "white", boxShadow: "0 32px 80px rgba(44,24,16,0.25)" }}
        onClick={e => e.stopPropagation()}>

        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-2xl text-sm font-bold shadow-xl"
            style={{ background: "#2c1810", color: "white" }}>{toastMsg}</div>
        )}

        {/* Header buttons */}
        <div className="absolute top-3 right-3 z-10 flex gap-2">
          <button onClick={() => setLiked(l => !l)}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <Heart size={15} fill={liked ? "#e74c3c" : "none"} color={liked ? "#e74c3c" : "#a89070"} />
          </button>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <X size={15} color="#a89070" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-0">
          {/* Left — Image */}
          <div className="relative sm:w-64 flex-shrink-0 overflow-hidden rounded-t-3xl sm:rounded-l-3xl sm:rounded-tr-none"
            style={{ background: "#faf8f5", minHeight: 260 }}>
            <img src={displayImg} alt={sanPham.ten_sp}
              className="w-full h-64 sm:h-full object-cover" />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {sanPham.is_hot && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: "#e74c3c", color: "white" }}>HOT</span>}
              {sanPham.is_new && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full" style={{ background: "#9b59b6", color: "white" }}>NEW</span>}
              {sanPham.giam_gia > 0 && !isWholesale && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "#e74c3c", color: "white" }}>-{sanPham.giam_gia}%</span>}
              {isWholesale && <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: "#1a7a5e", color: "white" }}>GIÁ SỈ</span>}
            </div>
          </div>

          {/* Right — Info */}
          <div className="flex-1 p-5 overflow-y-auto" style={{ maxHeight: "80vh" }}>
            <p className="text-xs font-mono mb-1" style={{ color: "#a89070" }}>{sanPham.ma_sp}</p>
            <h2 className="text-xl font-black leading-tight mb-2" style={{ color: "#2c1810", fontFamily: "'DM Serif Display', serif" }}>
              {sanPham.ten_sp}
            </h2>
            <StarRow rating={sanPham.danh_gia ?? 4.5} count={sanPham.luot_danh_gia ?? 0} />
            <p className="text-xs mt-1" style={{ color: "#a89070" }}>Đã bán {(sanPham.luot_ban ?? 0).toLocaleString()}</p>

            {/* Price */}
            <div className="flex items-baseline gap-2 my-3">
              <span className="text-2xl font-black" style={{ color: isWholesale ? "#1a7a5e" : "#c17f44" }}>
                {fmt(displayPrice)}
              </span>
              {!isWholesale && sanPham.giam_gia > 0 && (
                <span className="text-sm line-through" style={{ color: "#c8bdb5" }}>
                  {fmt(sanPham.gia_ban_goc)}
                </span>
              )}
              {isWholesale && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "#e8f8ef", color: "#1a7a5e" }}>
                  Giá sỉ
                </span>
              )}
            </div>

            {/* Wholesale table OR Retail picker */}
            {isWholesale ? (
              <WholesaleTable sanPham={sanPham} rows={wsRows}
                onChange={(bienTheId, qty) =>
                  setWsRows(prev => prev.map(r => r.bienTheId === bienTheId ? { ...r, soLuong: qty } : r))
                } />
            ) : (
              <div className="space-y-4">
                {/* Color picker */}
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: "#2c1810" }}>
                    Màu sắc: <span style={{ color: "#c17f44" }}>{selColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colors.map(c => (
                      <button key={c} onClick={() => setSelColor(c)}
                        className="px-3 py-1 rounded-xl text-xs font-bold border-2 transition-all"
                        style={{
                          borderColor: selColor === c ? "#c17f44" : "#ede8e3",
                          background: selColor === c ? "#fff8f0" : "white",
                          color: selColor === c ? "#c17f44" : "#2c1810",
                        }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size picker */}
                <div>
                  <p className="text-xs font-bold mb-2" style={{ color: "#2c1810" }}>
                    Kích thước: <span style={{ color: "#c17f44" }}>{selSize || "Chưa chọn"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {availSizes.map(s => {
                      const b = sanPham.bien_the.find(bt => bt.mau_sac === selColor && bt.kich_thuoc === s);
                      const avail = (b?.ton_kho ?? 99) > 0;
                      return (
                        <button key={s} onClick={() => avail && setSelSize(s)} disabled={!avail}
                          className="w-12 h-10 rounded-xl text-xs font-bold border-2 transition-all"
                          style={{
                            borderColor: selSize === s ? "#c17f44" : "#ede8e3",
                            background: selSize === s ? "#fff8f0" : avail ? "white" : "#faf8f5",
                            color: selSize === s ? "#c17f44" : avail ? "#2c1810" : "#c8bdb5",
                            textDecoration: !avail ? "line-through" : "none",
                          }}>
                          {s}{b && avail && (b.ton_kho ?? 99) <= 5 && <span className="ml-0.5 text-[9px] text-red-400">({b.ton_kho})</span>}
                        </button>
                      );
                    })}
                  </div>
                  {matchBienThe && (
                    <p className="text-xs mt-1.5"
                      style={{ color: (matchBienThe.ton_kho ?? 99) > 10 ? "#2ecc71" : (matchBienThe.ton_kho ?? 99) > 0 ? "#e67e22" : "#e74c3c" }}>
                      {(matchBienThe.ton_kho ?? 99) > 10
                        ? `✓ Còn ${matchBienThe.ton_kho ?? 99} SP`
                        : (matchBienThe.ton_kho ?? 99) > 0
                          ? `⚡ Chỉ còn ${matchBienThe.ton_kho}!`
                          : "✗ Hết hàng"}
                    </p>
                  )}
                </div>

                {/* Qty */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-2xl overflow-hidden border" style={{ borderColor: "#ede8e3" }}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center transition-all hover:bg-amber-50"
                      style={{ color: "#6b5344" }}><Minus size={14} /></button>
                    <span className="w-10 text-center text-sm font-black" style={{ color: "#2c1810" }}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)}
                      className="w-9 h-9 flex items-center justify-center transition-all hover:bg-amber-50"
                      style={{ color: "#6b5344" }}><Plus size={14} /></button>
                  </div>
                  {matchBienThe && (
                    <span className="text-xs" style={{ color: "#a89070" }}>
                      Tổng: <strong style={{ color: "#c17f44" }}>{fmt(matchBienThe.gia_ban_thuc * qty)}</strong>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex gap-2 mt-4">
              {isWholesale ? (
                <>
                  <button onClick={handleWsAddCart} disabled={wsTotalQty === 0}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5"
                    style={{ borderColor: "#1a7a5e", color: "#1a7a5e", background: "white", opacity: wsTotalQty === 0 ? 0.4 : 1 }}>
                    <ShoppingCart size={14} />
                    Thêm vào giỏ {wsTotalQty > 0 && `(${wsTotalQty} SP)`}
                  </button>
                  <button onClick={handleWsBuyNow} disabled={wsTotalQty === 0}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5"
                    style={{ background: wsTotalQty > 0 ? "#1a7a5e" : "#c8bdb5", color: "white" }}>
                    Đặt đơn sỉ
                    {wsTotal > 0 && <span className="font-black">· {fmt(wsTotal)}</span>}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleAddCart} disabled={!canAdd}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-black border-2 transition-all flex items-center justify-center gap-1.5"
                    style={{ borderColor: canAdd ? "#c17f44" : "#ede8e3", color: canAdd ? "#c17f44" : "#c8bdb5", background: "white" }}>
                    <ShoppingCart size={14} />
                    Thêm vào giỏ
                  </button>
                  <button onClick={handleBuyNow} disabled={!canAdd}
                    className="flex-1 py-2.5 rounded-2xl text-xs font-black transition-all"
                    style={{ background: canAdd ? "#c17f44" : "#c8bdb5", color: "white" }}>
                    Mua ngay
                  </button>
                </>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex gap-3 mt-3 flex-wrap">
              {[[Truck,"Giao hàng toàn quốc"],[ShieldCheck,"Bảo hành 30 ngày"],[RefreshCw,"Đổi trả 7 ngày"]].map(([Icon, text], i) => (
                <div key={i} className="flex items-center gap-1">
                  <Icon size={11} color="#a89070" />
                  <span className="text-[10px]" style={{ color: "#a89070" }}>{text as string}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-4 border-t" style={{ borderColor: "#ede8e3" }}>
              <div className="flex gap-4 pt-3">
                {(["mo-ta","size-guide","danh-gia"] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className="text-xs font-bold pb-1.5 border-b-2 transition-all"
                    style={{ borderColor: tab === t ? "#c17f44" : "transparent", color: tab === t ? "#c17f44" : "#a89070" }}>
                    {t === "mo-ta" ? "Mô tả" : t === "size-guide" ? "Hướng dẫn size" : `Đánh giá (${(sanPham.luot_danh_gia ?? 0).toLocaleString()})`}
                  </button>
                ))}
              </div>
              <div className="py-3 text-xs leading-relaxed" style={{ color: "#6b5344" }}>
                {tab === "mo-ta" && (
                  <div>
                    <p>{sanPham.mo_ta}</p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {[sanPham.loai_sp, sanPham.ma_sp, sanPham.don_vi_tinh].map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: "#faf3ea", color: "#c17f44" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {tab === "size-guide" && (
                  <table className="w-full text-[11px]" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#faf3ea" }}>
                        {["Size","Ngực","Eo","Hông","Cân nặng"].map(h => (
                          <th key={h} className="px-2 py-1 text-left font-bold" style={{ color: "#2c1810" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[["S","80-84","62-66","86-90","45-52kg"],["M","86-90","68-72","92-96","53-60kg"],["L","92-96","74-78","98-102","61-70kg"],["XL","98-102","80-84","104-108","71-80kg"]].map(([s,...v]) => (
                        <tr key={s} style={{ borderTop: "1px solid #ede8e3" }}>
                          <td className="px-2 py-1 font-bold" style={{ color: "#c17f44" }}>{s}</td>
                          {v.map((x, i) => <td key={i} className="px-2 py-1" style={{ color: "#6b5344" }}>{x}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === "danh-gia" && (
                  <div className="flex items-center gap-4 py-2">
                    <span className="text-4xl font-black" style={{ color: "#2c1810", fontFamily: "'DM Serif Display', serif" }}>
                      {(sanPham.danh_gia ?? 4.5).toFixed(1)}
                    </span>
                    <div>
                      <StarRow rating={sanPham.danh_gia ?? 4.5} count={sanPham.luot_danh_gia ?? 0} />
                      <p className="text-xs mt-0.5" style={{ color: "#a89070" }}>
                        {(sanPham.luot_danh_gia ?? 0).toLocaleString()} đánh giá
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ sanPham, onClick }: { sanPham: SanPham; onClick: () => void }) {
  const isWholesale = isWholesaleUser();
  const minGia = isWholesale ? getMinGiaSi(sanPham) : getMinGia(sanPham);
  const colors = Array.from(new Set(sanPham.bien_the.map(b => b.mau_sac)));
  return (
    <button onClick={onClick} className="group text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
      style={{ background: "white", border: "1px solid #ede8e3", boxShadow: "0 2px 8px rgba(44,24,16,0.06)" }}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ paddingBottom: "110%", background: "#faf8f5" }}>
        <img src={sanPham.anh} alt={sanPham.ten_sp}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {sanPham.is_hot && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: "#e74c3c", color: "white" }}>HOT</span>}
          {sanPham.is_new && <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full" style={{ background: "#9b59b6", color: "white" }}>NEW</span>}
          {sanPham.giam_gia > 0 && <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: "#e74c3c", color: "white" }}>-{sanPham.giam_gia}%</span>}
        </div>
        {/* Cart overlay */}
        <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2">
          <div className="flex items-center justify-center gap-1 py-1.5 rounded-xl text-[10px] font-black"
            style={{ background: "rgba(44,24,16,0.85)", color: "white" }}>
            <ShoppingCart size={11} /> Xem nhanh
          </div>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-mono mb-0.5" style={{ color: "#c8bdb5" }}>{sanPham.ma_sp}</p>
        <p className="text-xs font-semibold line-clamp-2 mb-1.5 leading-tight" style={{ color: "#2c1810" }}>
          {sanPham.ten_sp}
        </p>
        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} width="10" height="10" viewBox="0 0 24 24"
              fill={i < Math.round(sanPham.danh_gia ?? 4.5) ? "#f5c842" : "#e5e0d8"}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          ))}
          <span style={{ color: "#a89070", fontSize: 9 }}>({sanPham.danh_gia ?? 4.5})</span>
        </div>
        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-black" style={{ color: isWholesale ? "#1a7a5e" : "#c17f44" }}>
            {fmt(minGia)}
          </span>
          {!isWholesale && sanPham.giam_gia > 0 && (
            <span className="text-[10px] line-through" style={{ color: "#c8bdb5" }}>
              {fmt(sanPham.gia_ban_goc)}
            </span>
          )}
        </div>
        <p className="text-[9px] mt-0.5" style={{ color: "#a89070" }}>
          Đã bán {(sanPham.luot_ban ?? 0) >= 1000 ? ((sanPham.luot_ban ?? 0) / 1000).toFixed(1) + "k" : sanPham.luot_ban ?? 0}
        </p>
        {/* Color pills */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {colors.slice(0, 3).map(mau => (
            <span key={mau} className="text-[9px] px-1.5 py-0.5 rounded-full border"
              style={{ borderColor: "#ede8e3", color: "#a89070", background: "#faf8f5" }}>
              {mau}
            </span>
          ))}
          {colors.length > 3 && <span className="text-[9px]" style={{ color: "#a89070" }}>+{colors.length - 3}</span>}
        </div>
      </div>
    </button>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse" style={{ border: "1px solid #ede8e3" }}>
      <div style={{ paddingBottom: "110%", background: "#f0ede8", position: "relative" }} />
      <div className="p-3 space-y-2">
        <div className="h-2 rounded-full w-1/3" style={{ background: "#ede8e3" }} />
        <div className="h-3 rounded-full w-4/5" style={{ background: "#ede8e3" }} />
        <div className="h-3 rounded-full w-2/3" style={{ background: "#ede8e3" }} />
        <div className="h-4 rounded-full w-1/2" style={{ background: "#ede8e3" }} />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ShopProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]     = useState<SanPham[]>([]);
  const [loading,     setLoading]      = useState(true);
  const [selProduct,  setSelProduct]   = useState<SanPham | null>(null);
  const [sortBy,      setSortBy]       = useState("ban-chay");
  const [showFilter,  setShowFilter]   = useState(false);
  const [priceMin,    setPriceMin]     = useState(0);
  const [priceMax,    setPriceMax]     = useState(2000000);

  const q      = searchParams.get("q")   ?? "";
  const catId  = searchParams.get("cat") ?? "";
  const isHot  = searchParams.get("hot") === "1";
  const isNew  = searchParams.get("new") === "1";
  const isSale = searchParams.get("sale") === "1";

  // Fetch sản phẩm từ API, fallback sang mock
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchSanPham()
      .then(data => { if (!cancelled) { setProducts(data); setLoading(false); } })
      .catch(() => { if (!cancelled) { setProducts(MOCK_SAN_PHAM); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (q)      list = list.filter(p => p.ten_sp.toLowerCase().includes(q.toLowerCase()) || p.ma_sp.includes(q));
    if (catId)  list = list.filter(p => p.loai_sp === catId);
    if (isHot)  list = list.filter(p => p.is_hot);
    if (isNew)  list = list.filter(p => p.is_new);
    if (isSale) list = list.filter(p => p.giam_gia > 0);
    list = list.filter(p => { const min = getMinGia(p); return min >= priceMin && min <= priceMax; });
    if (sortBy === "ban-chay") list.sort((a, b) => (b.luot_ban ?? 0) - (a.luot_ban ?? 0));
    if (sortBy === "gia-tang") list.sort((a, b) => getMinGia(a) - getMinGia(b));
    if (sortBy === "gia-giam") list.sort((a, b) => getMinGia(b) - getMinGia(a));
    if (sortBy === "danh-gia") list.sort((a, b) => (b.danh_gia ?? 0) - (a.danh_gia ?? 0));
    if (sortBy === "moi-nhat") list.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
    return list;
  }, [products, q, catId, isHot, isNew, isSale, sortBy, priceMin, priceMax]);

  const pageTitle = q ? `Kết quả: "${q}"` : isHot ? "🔥 Sản phẩm hot" : isNew ? "✨ Hàng mới về"
    : isSale ? "🏷️ Đang giảm giá"
    : catId ? CATEGORIES.find(c => c.id === catId)?.label ?? "Sản phẩm"
    : "Tất cả sản phẩm";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs mb-4" style={{ color: "#a89070" }}>
        <Link to="/shop" className="hover:text-amber-700 transition-colors">Trang chủ</Link>
        <ChevronRight size={11} />
        <span style={{ color: "#2c1810", fontWeight: 600 }}>{pageTitle}</span>
      </div>

      <div className="flex gap-5">
        {/* ── Sidebar ──────────────────────────────────── */}
        <div className={`${showFilter ? "block" : "hidden"} lg:block flex-shrink-0 w-52`}>
          <div className="sticky top-24 space-y-4">
            {/* Categories */}
            <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #ede8e3" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#2c1810" }}>Danh mục</p>
              <button onClick={() => setSearchParams({})}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm transition-all text-left"
                style={{ background: !catId ? "#fff8f0" : "transparent", color: !catId ? "#c17f44" : "#6b5344", fontWeight: !catId ? 700 : 500 }}>
                <span>🛍️</span> Tất cả
              </button>
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => setSearchParams({ cat: c.id })}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-sm transition-all text-left"
                  style={{ background: catId === c.id ? "#fff8f0" : "transparent", color: catId === c.id ? "#c17f44" : "#6b5344", fontWeight: catId === c.id ? 700 : 500 }}>
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>

            {/* Price filter */}
            <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #ede8e3" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#2c1810" }}>Giá</p>
              <div className="space-y-2">
                {[[0, 200000, "Dưới 200k"],[200000, 500000, "200k – 500k"],[500000, 1000000, "500k – 1tr"],[1000000, 2000000, "Trên 1tr"]].map(([min, max, label]) => (
                  <button key={String(label)} onClick={() => { setPriceMin(Number(min)); setPriceMax(Number(max)); }}
                    className="w-full text-left px-2 py-1 rounded-lg text-xs transition-all"
                    style={{ background: priceMin === min && priceMax === max ? "#fff8f0" : "transparent", color: priceMin === min && priceMax === max ? "#c17f44" : "#6b5344", fontWeight: priceMin === min && priceMax === max ? 700 : 400 }}>
                    {label as string}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick filters */}
            <div className="rounded-2xl p-4" style={{ background: "white", border: "1px solid #ede8e3" }}>
              <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: "#2c1810" }}>Lọc nhanh</p>
              {[["hot","🔥 Sản phẩm HOT"],["new","✨ Hàng mới về"],["sale","🏷️ Đang giảm giá"]].map(([key, label]) => (
                <button key={key} onClick={() => setSearchParams({ [key]: "1" })}
                  className="w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: searchParams.get(key) === "1" ? "#fff8f0" : "transparent", color: searchParams.get(key) === "1" ? "#c17f44" : "#6b5344" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Product area ──────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-5">
            <button onClick={() => setShowFilter(f => !f)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{ background: "white", border: "1px solid #ede8e3", color: "#6b5344" }}>
              <SlidersHorizontal size={13} /> Bộ lọc
            </button>
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" color="#c8bdb5" />
              <input value={q}
                onChange={e => setSearchParams(e.target.value ? { q: e.target.value } : {})}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "white", border: "1px solid #ede8e3", color: "#2c1810" }} />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold outline-none"
              style={{ background: "white", border: "1px solid #ede8e3", color: "#6b5344" }}>
              <option value="ban-chay">Bán chạy</option>
              <option value="gia-tang">Giá tăng dần</option>
              <option value="gia-giam">Giá giảm dần</option>
              <option value="danh-gia">Đánh giá cao</option>
              <option value="moi-nhat">Mới nhất</option>
            </select>
          </div>

          {/* Count */}
          {!loading && (
            <p className="text-xs mb-4" style={{ color: "#a89070" }}>
              {filtered.length} sản phẩm
            </p>
          )}

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filtered.length > 0
                ? filtered.map(p => <ProductCard key={p.id} sanPham={p} onClick={() => setSelProduct(p)} />)
                : (
                  <div className="col-span-full flex flex-col items-center py-16" style={{ color: "#a89070" }}>
                    <Package size={40} color="#ede8e3" />
                    <p className="mt-3 text-sm font-semibold">Không tìm thấy sản phẩm</p>
                    <button onClick={() => setSearchParams({})} className="mt-3 text-xs font-bold" style={{ color: "#c17f44" }}>
                      Xem tất cả
                    </button>
                  </div>
                )
            }
          </div>
        </div>
      </div>

      {/* Modal */}
      {selProduct && <ProductDetailModal sanPham={selProduct} onClose={() => setSelProduct(null)} />}
    </div>
  );
}