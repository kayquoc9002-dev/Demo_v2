import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  User,
} from "lucide-react";
import { fmt, fmtVND, PAYMENT_METHODS } from "../data/shopData";
import { type POSOrder } from "../data/shopData";

interface OrderHistoryProps {
  orders: POSOrder[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  const todaySales = orders
    .filter((o) => o.trang_thai === "hoan_thanh")
    .reduce((s, o) => s + o.tong_tien, 0);

  const totalTietKiem = orders
    .filter((o) => o.trang_thai === "hoan_thanh")
    .reduce((s, o) => s + (o.tam_tinh - o.tong_tien), 0);

  const formatTime = (s: string) =>
    new Date(s).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="h-full flex flex-col" style={{ background: "#f7f3ef" }}>
      {/* Stats bar */}
      <div
        className="px-6 py-4 flex-shrink-0"
        style={{ background: "white", borderBottom: "1px solid #ede8e3" }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-4 gap-4">
          {[
            {
              label: "Đơn hoàn thành",
              value: orders.filter((o) => o.trang_thai === "hoan_thanh").length,
              unit: "đơn",
              color: "#c17f44",
            },
            {
              label: "Doanh thu",
              value: fmtVND(todaySales),
              unit: "",
              color: "#27ae60",
            },
            {
              label: "Khách tiết kiệm",
              value: fmtVND(totalTietKiem),
              unit: "",
              color: "#9b59b6",
            },
            {
              label: "Đơn hủy",
              value: orders.filter((o) => o.trang_thai === "huy").length,
              unit: "đơn",
              color: "#e74c3c",
            },
          ].map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="text-center py-3 rounded-2xl"
              style={{ background: "#faf3ea" }}
            >
              <p
                className="text-[10px] font-bold mb-1"
                style={{ color: "#a89070" }}
              >
                {label}
              </p>
              <p className="text-lg font-black leading-tight" style={{ color }}>
                {value}
                {unit && (
                  <span
                    className="text-xs font-bold ml-1"
                    style={{ color: "#a89070" }}
                  >
                    {unit}
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Order list */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <span className="text-5xl opacity-30">📋</span>
              <p className="text-sm font-semibold" style={{ color: "#c4b49e" }}>
                Chưa có đơn hàng nào
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const isOpen = expanded === order.id;
              const payMethod = PAYMENT_METHODS.find(
                (m) => m.id === order.phuong_thuc,
              );
              const tietKiem = order.tam_tinh - order.tong_tien;
              const soSanPham = order.items.reduce((s, i) => s + i.so_luong, 0);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "white",
                    border: "1px solid #ede8e3",
                    boxShadow: isOpen
                      ? "0 4px 16px rgba(44,24,16,0.08)"
                      : "none",
                  }}
                >
                  {/* Row summary */}
                  <button
                    onClick={() => toggle(order.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors active:bg-gray-50"
                  >
                    {order.trang_thai === "hoan_thanh" ? (
                      <CheckCircle
                        size={18}
                        style={{ color: "#27ae60", flexShrink: 0 }}
                      />
                    ) : (
                      <XCircle
                        size={18}
                        style={{ color: "#e74c3c", flexShrink: 0 }}
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-black"
                          style={{ color: "#2c1810" }}
                        >
                          #{order.ma_don}
                        </span>
                        <span
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={{
                            background: (payMethod?.color ?? "#c17f44") + "18",
                            color: payMethod?.color ?? "#c17f44",
                          }}
                        >
                          {payMethod?.icon} {payMethod?.label}
                        </span>
                        {order.khach_hang && (
                          <span
                            className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5"
                            style={{ background: "#eafaf1", color: "#27ae60" }}
                          >
                            <User size={9} /> {order.khach_hang.ho_ten}
                          </span>
                        )}
                      </div>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "#a89070" }}
                      >
                        {formatTime(order.thoi_gian)} · {soSanPham} sản phẩm
                        {tietKiem > 0 && (
                          <span style={{ color: "#27ae60" }}>
                            {" "}
                            · Tiết kiệm {fmtVND(tietKiem)}
                          </span>
                        )}
                      </p>
                    </div>

                    <span
                      className="text-base font-black flex-shrink-0"
                      style={{ color: "#c17f44" }}
                    >
                      {fmtVND(order.tong_tien)}
                    </span>
                    {isOpen ? (
                      <ChevronUp
                        size={14}
                        style={{ color: "#a89070", flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                        style={{ color: "#a89070", flexShrink: 0 }}
                      />
                    )}
                  </button>

                  {/* Expanded */}
                  {isOpen && (
                    <div
                      className="px-4 pb-4"
                      style={{ borderTop: "1px solid #ede8e3" }}
                    >
                      <div className="pt-3 flex flex-col gap-2">
                        {/* Items */}
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 py-2 rounded-xl px-2"
                            style={{ background: "#faf3ea" }}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-xs font-bold line-clamp-1"
                                style={{ color: "#2c1810" }}
                              >
                                {item.ten_sp}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: "#a89070" }}
                              >
                                {item.mau_sac} · {item.kich_thuoc} · SKU:{" "}
                                {item.ma_bien_the}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {item.giam_gia_sp > 0 && (
                                <p
                                  className="text-[10px] line-through"
                                  style={{ color: "#c4b49e" }}
                                >
                                  {fmt(item.gia_ban_goc)} × {item.so_luong}
                                </p>
                              )}
                              <p
                                className="text-xs font-bold"
                                style={{ color: "#2c1810" }}
                              >
                                {fmt(item.gia_ban_thuc)} × {item.so_luong}
                              </p>
                              <p
                                className="text-xs font-black"
                                style={{ color: "#c17f44" }}
                              >
                                {fmt(item.thanh_tien)}
                              </p>
                            </div>
                          </div>
                        ))}

                        {/* Tài chính */}
                        <div
                          className="pt-2 mt-1"
                          style={{ borderTop: "1px dashed #ede8e3" }}
                        >
                          {tietKiem > 0 && (
                            <div className="flex justify-between text-xs mb-1">
                              <span style={{ color: "#a89070" }}>
                                Tiết kiệm từ khuyến mãi
                              </span>
                              <span
                                className="font-bold"
                                style={{ color: "#27ae60" }}
                              >
                                - {fmtVND(tietKiem)}
                              </span>
                            </div>
                          )}
                          {order.phuong_thuc === "tien_mat" &&
                            (order.tien_khach_dua ?? 0) > 0 && (
                              <>
                                <div className="flex justify-between text-xs mb-1">
                                  <span style={{ color: "#a89070" }}>
                                    Tiền khách đưa
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: "#2c1810" }}
                                  >
                                    {fmtVND(order.tien_khach_dua!)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs mb-2">
                                  <span style={{ color: "#a89070" }}>
                                    Tiền thừa
                                  </span>
                                  <span
                                    className="font-bold"
                                    style={{ color: "#27ae60" }}
                                  >
                                    {fmtVND(order.tien_thua!)}
                                  </span>
                                </div>
                              </>
                            )}
                          {/* Khách thành viên */}
                          {order.khach_hang && (
                            <div
                              className="flex justify-between text-xs py-2 mt-1 rounded-lg px-2"
                              style={{ background: "#eafaf1" }}
                            >
                              <span style={{ color: "#27ae60" }}>
                                Điểm tích cho {order.khach_hang.ho_ten}
                              </span>
                              <span
                                className="font-black"
                                style={{ color: "#1a7a45" }}
                              >
                                +{order.khach_hang.diem_tich_them} điểm
                              </span>
                            </div>
                          )}
                          {order.ghi_chu && (
                            <p
                              className="text-[10px] italic mt-2"
                              style={{ color: "#a89070" }}
                            >
                              Ghi chú: {order.ghi_chu}
                            </p>
                          )}
                        </div>

                        <button
                          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
                          style={{
                            background: "#faf3ea",
                            color: "#5c3317",
                            border: "1px solid #ede8e3",
                          }}
                        >
                          <Printer size={12} /> In hóa đơn
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
