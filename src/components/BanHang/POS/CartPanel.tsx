import { Trash2, Plus, Minus, X, ChevronRight } from "lucide-react";
import { fmt, fmtVND, type POSCartItem } from "../data/shopData";

interface CartPanelProps {
  items: POSCartItem[];
  onUpdateQty: (bienTheId: number, delta: number) => void;
  onRemove: (bienTheId: number) => void;
  onClear: () => void;
  onCheckout: () => void; // ← bỏ giamThem, đơn giản hóa
}

export default function CartPanel({
  items,
  onUpdateQty,
  onRemove,
  onClear,
  onCheckout,
}: CartPanelProps) {
  // Tổng giá gốc (trước giảm)
  const tamTinh = items.reduce(
    (s, i) => s + i.bienThe.gia_ban_goc * i.soLuong,
    0,
  );
  // Tổng thực thu (sau giảm từng SP)
  const tongTien = items.reduce(
    (s, i) => s + i.bienThe.gia_ban_thuc * i.soLuong,
    0,
  );
  // Tổng tiết kiệm
  const tietKiem = tamTinh - tongTien;

  const isEmpty = items.length === 0;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: "#fff", borderLeft: "1px solid #ede8e3" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid #ede8e3", background: "#faf3ea" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="shop-serif text-base font-black"
            style={{ color: "#2c1810" }}
          >
            Giỏ hàng
          </span>
          {!isEmpty && (
            <span
              className="text-xs font-black px-2 py-0.5 rounded-full"
              style={{ background: "#c17f44", color: "white" }}
            >
              {items.reduce((s, i) => s + i.soLuong, 0)}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg active:scale-95 transition-transform"
            style={{ color: "#e74c3c", background: "#fdecea" }}
          >
            <Trash2 size={12} /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
            <span className="text-5xl opacity-30">🛒</span>
            <p className="text-sm font-semibold" style={{ color: "#c4b49e" }}>
              Chưa có sản phẩm
            </p>
            <p className="text-xs" style={{ color: "#d9cfc5" }}>
              Chọn sản phẩm bên trái để thêm
            </p>
          </div>
        ) : (
          <div className="p-3 flex flex-col gap-2">
            {items.map((item) => {
              const hasDiscount =
                item.bienThe.gia_ban_goc > item.bienThe.gia_ban_thuc;
              return (
                <div
                  key={item.bienThe.id}
                  className="flex gap-3 p-3 rounded-2xl"
                  style={{ background: "#faf3ea", border: "1px solid #ede8e3" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-14 h-14 rounded-xl flex-shrink-0"
                    style={{
                      background: `url(${item.bienThe.anh || item.sanPham.anh}) center/cover`,
                      border: "1px solid #e8ddd1",
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-xs font-bold leading-tight line-clamp-1"
                      style={{ color: "#2c1810" }}
                    >
                      {item.sanPham.ten_sp}
                    </p>
                    <p
                      className="text-[10px] mt-0.5"
                      style={{ color: "#a89070" }}
                    >
                      {item.bienThe.mau_sac} · {item.bienThe.kich_thuoc}
                    </p>

                    {/* Giá — hiện giá gốc nếu đang giảm */}
                    <div className="flex items-center gap-1.5 mt-1">
                      <p
                        className="text-sm font-black"
                        style={{ color: "#c17f44" }}
                      >
                        {fmt(item.bienThe.gia_ban_thuc)}
                      </p>
                      {hasDiscount && (
                        <p
                          className="text-[10px] line-through"
                          style={{ color: "#c4b49e" }}
                        >
                          {fmt(item.bienThe.gia_ban_goc)}
                        </p>
                      )}
                    </div>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onPointerDown={() => onUpdateQty(item.bienThe.id, -1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                        style={{ background: "#ede8e3" }}
                      >
                        <Minus size={12} style={{ color: "#2c1810" }} />
                      </button>
                      <span
                        className="w-7 text-center text-sm font-black"
                        style={{ color: "#2c1810" }}
                      >
                        {item.soLuong}
                      </span>
                      <button
                        onPointerDown={() => onUpdateQty(item.bienThe.id, 1)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center active:scale-90 transition-transform"
                        style={{ background: "#c17f44" }}
                      >
                        <Plus size={12} style={{ color: "white" }} />
                      </button>
                      <span
                        className="ml-auto text-xs font-black"
                        style={{ color: "#2c1810" }}
                      >
                        {fmt(item.bienThe.gia_ban_thuc * item.soLuong)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onPointerDown={() => onRemove(item.bienThe.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 self-start active:scale-90 transition-transform"
                    style={{ background: "#fdecea" }}
                  >
                    <X size={12} style={{ color: "#e74c3c" }} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {!isEmpty && (
        <div
          className="flex-shrink-0 p-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid #ede8e3" }}
        >
          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            {/* Chỉ hiện tạm tính nếu có giảm giá */}
            {tietKiem > 0 && (
              <>
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "#a89070" }}
                >
                  <span>Tạm tính</span>
                  <span className="font-bold line-through">
                    {fmtVND(tamTinh)}
                  </span>
                </div>
                <div
                  className="flex justify-between text-xs"
                  style={{ color: "#27ae60" }}
                >
                  <span>Tiết kiệm</span>
                  <span className="font-bold">- {fmtVND(tietKiem)}</span>
                </div>
              </>
            )}
            <div
              className="flex justify-between pt-2 mt-1"
              style={{ borderTop: "1px solid #ede8e3" }}
            >
              <span className="text-sm font-black" style={{ color: "#2c1810" }}>
                Tổng cộng
              </span>
              <span className="text-lg font-black" style={{ color: "#c17f44" }}>
                {fmtVND(tongTien)}
              </span>
            </div>
          </div>

          {/* Checkout */}
          <button
            onClick={onCheckout}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
            style={{
              background: "linear-gradient(135deg, #c17f44 0%, #e09550 100%)",
              color: "white",
              boxShadow: "0 4px 20px rgba(193,127,68,0.45)",
            }}
          >
            Thanh toán <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
