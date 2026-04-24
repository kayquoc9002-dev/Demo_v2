import { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  History,
  ShoppingBag,
  Wifi,
  WifiOff,
  Clock,
  Maximize2,
  Minimize2,
} from "lucide-react";
import ProductGrid from "../../../../components/BanHang/POS/ProductGrid";
import CartPanel from "../../../../components/BanHang/POS/CartPanel";
import CheckoutModal from "../../../../components/BanHang/POS/CheckoutModal";
import OrderHistory from "../../../../components/BanHang/POS/OrderHistory";
import {
  type POSCartItem,
  type POSOrder,
} from "../../../../components/BanHang/data/shopData";

type Tab = "pos" | "history";

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);
  return time;
}

export default function POSPage() {
  const [tab, setTab] = useState<Tab>("pos");
  const [cartItems, setCartItems] = useState<POSCartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orders, setOrders] = useState<POSOrder[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const posRef = useRef<HTMLDivElement>(null);
  const now = useCurrentTime();

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) posRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  // ── Cart logic ──────────────────────────────────────────────

  const addToCart = (item: Omit<POSCartItem, "soLuong">) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.bienThe.id === item.bienThe.id);
      if (existing) {
        return prev.map((i) =>
          i.bienThe.id === item.bienThe.id
            ? { ...i, soLuong: i.soLuong + 1 }
            : i,
        );
      }
      return [...prev, { ...item, soLuong: 1 }];
    });
  };

  const updateQty = (bienTheId: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.bienThe.id === bienTheId ? { ...i, soLuong: i.soLuong + delta } : i,
        )
        .filter((i) => i.soLuong > 0),
    );
  };

  const removeItem = (bienTheId: number) =>
    setCartItems((prev) => prev.filter((i) => i.bienThe.id !== bienTheId));

  const clearCart = () => setCartItems([]);

  // ── Checkout logic ───────────────────────────────────────────

  const handleConfirmOrder = (order: POSOrder) => {
    setOrders((prev) => [order, ...prev]);
  };

  const handleCloseCheckout = () => {
    setShowCheckout(false);

    //Khi đóng checkout modal, thì chưa vội xóa giỏ hàng
    //Nhưng ở đây tính cả đóng checkout và xác nhận đơn thành công là 1 luôn
    // clearCart();
  };

  const handleCloseCheckoutSuccess = () => {
    setShowCheckout(false);
    clearCart();
  };

  // ── Time display ─────────────────────────────────────────────

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });

  return (
    <div
      ref={posRef}
      className="flex flex-col"
      style={{ height: "87dvh", background: "#f7f3ef", overflow: "hidden" }}
    >
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{
          background: "#2c1810",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} style={{ color: "#f5c842" }} />
            <span className="shop-serif text-base font-black text-white">
              POS
            </span>
          </div>
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          >
            {(
              [
                { id: "pos", label: "Bán hàng", Icon: LayoutGrid },
                { id: "history", label: "Lịch sử", Icon: History },
              ] as const
            ).map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold transition-all active:scale-95"
                style={{
                  background: tab === id ? "#c17f44" : "transparent",
                  color: tab === id ? "white" : "rgba(255,255,255,0.5)",
                }}
              >
                <Icon size={13} />
                {label}
                {id === "history" && orders.length > 0 && (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: "#f5c842", color: "#2c1810" }}
                  >
                    {orders.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            {isOnline ? (
              <Wifi size={11} style={{ color: "#27ae60" }} />
            ) : (
              <WifiOff size={11} style={{ color: "#ef4444" }} />
            )}
            <span
              className="text-xs hidden sm:inline"
              style={{ color: isOnline ? "#27ae60" : "#ef4444" }}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Thoát toàn màn hình (Esc)" : "Toàn màn hình"}
            className="w-8 h-8 rounded-lg flex items-center justify-center active:scale-90 transition-all"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {isFullscreen ? (
              <Minimize2 size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
            ) : (
              <Maximize2 size={14} style={{ color: "rgba(255,255,255,0.7)" }} />
            )}
          </button>

          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <Clock size={12} style={{ color: "#f5c842" }} />
            <div className="text-right">
              <p className="text-xs font-black text-white leading-none">
                {formatTime(now)}
              </p>
              <p
                className="text-[9px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {formatDate(now)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      {tab === "pos" ? (
        <div
          className="flex-1 overflow-hidden"
          style={{ display: "grid", gridTemplateColumns: "1fr 340px" }}
        >
          <ProductGrid onAddToCart={addToCart} />
          <CartPanel
            items={cartItems}
            onUpdateQty={updateQty}
            onRemove={removeItem}
            onClear={clearCart}
            onCheckout={() => setShowCheckout(true)}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <OrderHistory orders={orders} />
        </div>
      )}

      {/* ── Checkout modal ───────────────────────────────────── */}
      {showCheckout && (
        <CheckoutModal
          items={cartItems}
          onConfirm={handleConfirmOrder}
          onClose={handleCloseCheckout}
          onSuccess={handleCloseCheckoutSuccess}
        />
      )}
    </div>
  );
}
