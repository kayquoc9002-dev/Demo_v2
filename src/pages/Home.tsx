import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Flame,
  Sparkles,
  TruckIcon,
  RefreshCw,
  ShieldCheck,
  Headphones,
} from "lucide-react";
import {
  MOCK_SAN_PHAM,
  CATEGORIES,
  fmt,
  getMinGia,
} from "../components/BanHang/data/shopData";
// getTotalTon

const fmt2 = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(0) + "k" : String(n);

const StarRow = ({ rating, count }: { rating: number; count: number }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill={i < Math.round(rating) ? "#f5c842" : "#e5e0d8"}
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
    <span style={{ color: "#a89070", fontSize: 10 }}>({fmt2(count)})</span>
  </div>
);

export default function Home() {
  const [activeHero, setActiveHero] = useState(0);

  const hotProducts = MOCK_SAN_PHAM.filter((p) => p.is_hot).slice(0, 6);
  const newProducts = MOCK_SAN_PHAM.filter((p) => p.is_new).slice(0, 4);
  const saleProducts = MOCK_SAN_PHAM.filter((p) => p.is_sale).slice(0, 4);

  const heroSlides = [
    {
      gradient:
        "linear-gradient(135deg, #2c1810 0%, #5c3317 50%, #8b4513 100%)",
      badge: "Bộ sưu tập mới",
      title: "Thu Đông 2026",
      sub: "Phong cách tối giản · Chất liệu cao cấp",
      cta: "Khám phá ngay",
      link: "/shop/san-pham?new=1",
      accent: "#f5c842",
    },
    {
      gradient:
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)",
      badge: "🔥 Flash Sale",
      title: "Giảm đến 25%",
      sub: "Hàng trăm sản phẩm giảm giá sốc · Số lượng có hạn",
      cta: "Mua ngay",
      link: "/shop/san-pham?sale=1",
      accent: "#ff6b6b",
    },
    {
      gradient:
        "linear-gradient(135deg, #0d4f3c 0%, #1a7a5e 60%, #2aa876 100%)",
      badge: "Xu hướng hot",
      title: "Streetwear Đường Phố",
      sub: "Phong cách trẻ trung · Cá tính · Thoải mái",
      cta: "Xem bộ sưu tập",
      link: "/shop/san-pham?cat=ao",
      accent: "#38ef7d",
    },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setActiveHero((p) => (p + 1) % heroSlides.length),
      5000,
    );
    return () => clearInterval(t);
  }, []);

  const slide = heroSlides[activeHero];

  return (
    <div style={{ background: "#f7f3ef" }}>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main hero */}
          <div
            className="lg:col-span-2 relative overflow-hidden rounded-3xl"
            style={{
              height: 380,
              background: slide.gradient,
              transition: "background 0.6s ease",
            }}
          >
            {/* Decorative circles */}
            <div
              className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-10"
              style={{ background: slide.accent }}
            />
            <div
              className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full opacity-15"
              style={{ background: slide.accent }}
            />

            <div className="relative z-10 h-full flex flex-col justify-end p-8 sm:p-10">
              <span
                className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 self-start"
                style={{
                  background: slide.accent + "25",
                  color: slide.accent,
                  border: `1px solid ${slide.accent}40`,
                }}
              >
                {slide.badge}
              </span>
              <h2 className="shop-serif text-4xl sm:text-5xl font-black text-white mb-2 leading-tight">
                {slide.title}
              </h2>
              <p
                className="text-sm mb-6"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {slide.sub}
              </p>
              <Link
                to={slide.link}
                className="self-start flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all hover:gap-3"
                style={{ background: slide.accent, color: "#2c1810" }}
              >
                {slide.cta} <ArrowRight size={14} />
              </Link>
            </div>

            {/* Dots */}
            <div className="absolute bottom-4 right-6 flex gap-2">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveHero(i)}
                  className="h-1.5 rounded-full transition-all"
                  style={{
                    width: i === activeHero ? 24 : 6,
                    background:
                      i === activeHero ? "white" : "rgba(255,255,255,0.3)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Side banners */}
          <div className="flex flex-col gap-4">
            <div
              className="relative overflow-hidden rounded-2xl flex-1"
              style={{
                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                minHeight: 176,
              }}
            >
              <div
                className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-20"
                style={{ background: "white" }}
              />
              <div className="p-5 h-full flex flex-col justify-between">
                <span
                  className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  ✨ Hàng mới
                </span>
                <div>
                  <p className="shop-serif text-xl font-black text-white mb-1">
                    New Arrivals
                  </p>
                  <p className="text-xs text-white/70 mb-3">
                    Cập nhật mỗi tuần
                  </p>
                  <Link
                    to="/shop/san-pham?new=1"
                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:gap-2 transition-all"
                  >
                    Xem ngay <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
            <div
              className="relative overflow-hidden rounded-2xl flex-1"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                minHeight: 176,
              }}
            >
              <div
                className="absolute -left-4 -top-4 w-24 h-24 rounded-full opacity-20"
                style={{ background: "white" }}
              />
              <div className="p-5 h-full flex flex-col justify-between">
                <span
                  className="text-xs font-black uppercase tracking-widest px-2 py-0.5 rounded-full self-start"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "white",
                  }}
                >
                  🏷️ Sale off
                </span>
                <div>
                  <p className="shop-serif text-xl font-black text-white mb-1">
                    Giảm đến 25%
                  </p>
                  <p className="text-xs text-white/70 mb-3">Số lượng có hạn</p>
                  <Link
                    to="/shop/san-pham?sale=1"
                    className="inline-flex items-center gap-1 text-xs font-bold text-white hover:gap-2 transition-all"
                  >
                    Mua ngay <ArrowRight size={11} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits strip ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { Icon: TruckIcon, title: "Miễn phí ship", sub: "Đơn từ 500.000đ" },
            {
              Icon: RefreshCw,
              title: "Đổi trả 30 ngày",
              sub: "Không cần lý do",
            },
            {
              Icon: ShieldCheck,
              title: "Hàng chính hãng",
              sub: "Cam kết 100%",
            },
            { Icon: Headphones, title: "CSKH 24/7", sub: "Hỗ trợ tận tâm" },
          ].map(({ Icon, title, sub }) => (
            <div
              key={title}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: "white", border: "1px solid #ede8e3" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#faf3ea" }}
              >
                <Icon size={16} style={{ color: "#c17f44" }} />
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: "#2c1810" }}>
                  {title}
                </p>
                <p className="text-[10px]" style={{ color: "#a89070" }}>
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="shop-serif text-2xl font-black"
            style={{ color: "#2c1810" }}
          >
            Danh mục
          </h2>
          <Link
            to="/shop/san-pham"
            className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#c17f44" }}
          >
            Tất cả <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {CATEGORIES.filter((c) => c.id !== "tat-ca").map((c) => (
            <Link
              key={c.id}
              to={`/shop/san-pham?cat=${c.id}`}
              className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: "white", border: "1px solid #ede8e3" }}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span
                className="text-xs font-semibold text-center"
                style={{ color: "#2c1810" }}
              >
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Hot products ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame size={18} style={{ color: "#e74c3c" }} />
            <h2
              className="shop-serif text-2xl font-black"
              style={{ color: "#2c1810" }}
            >
              Sản phẩm hot
            </h2>
          </div>
          <Link
            to="/shop/san-pham?hot=1"
            className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#c17f44" }}
          >
            Xem tất cả <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {hotProducts.map((p, idx) => {
            const minPrice = getMinGia(p);
            const origPrice = Math.round(
              minPrice / (1 - (p.giam_gia ?? 0) / 100),
            );
            return (
              <Link
                key={p.id}
                to={`/shop/san-pham/${p.id}`}
                className="product-card group rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{
                  background: "white",
                  border: "1px solid #ede8e3",
                  animationDelay: `${idx * 60}ms`,
                }}
              >
                {/* Image area */}
                <div
                  className="relative overflow-hidden"
                  style={{ height: 160 }}
                >
                  <div
                    className="card-img w-full h-full"
                    style={{ background: `url(${p.anh}) center/cover` }}
                  />
                  {p.is_hot && (
                    <span
                      className="absolute top-2 left-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                      style={{ background: "#e74c3c", color: "white" }}
                    >
                      HOT
                    </span>
                  )}
                  {p.is_sale && p.giam_gia && (
                    <span
                      className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: "#e74c3c", color: "white" }}
                    >
                      -{p.giam_gia}%
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p
                    className="text-xs font-semibold line-clamp-2 mb-1"
                    style={{ color: "#2c1810" }}
                  >
                    {p.ten_sp}
                  </p>
                  <StarRow
                    rating={p.danh_gia ?? 0}
                    count={p.luot_danh_gia ?? 0}
                  />
                  <p
                    className="text-[13px] line-through"
                    style={{ color: "gray" }}
                  >
                    {fmt(origPrice)}
                  </p>
                  <p
                    className="text-xl font-black mt-1"
                    style={{ color: "#c17f44" }}
                  >
                    {fmt(minPrice)}
                  </p>
                  <p className="text-[9px] mt-0.5" style={{ color: "#a89070" }}>
                    Đã bán {fmt2(p.luot_ban ?? 0)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── New arrivals ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={18} style={{ color: "#9b59b6" }} />
            <h2
              className="shop-serif text-2xl font-black"
              style={{ color: "#2c1810" }}
            >
              Hàng mới về
            </h2>
          </div>
          <Link
            to="/shop/san-pham?new=1"
            className="text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
            style={{ color: "#c17f44" }}
          >
            Xem tất cả <ArrowRight size={11} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {newProducts.map((p) => {
            const minPrice = getMinGia(p);
            const origPrice = Math.round(
              minPrice / (1 - (p.giam_gia ?? 0) / 100),
            );
            return (
              <Link
                key={p.id}
                to={`/shop/san-pham/${p.id}`}
                className="product-card group rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
                style={{ background: "white", border: "1px solid #ede8e3" }}
              >
                <div
                  className="relative overflow-hidden"
                  style={{ height: 200 }}
                >
                  <div
                    className="card-img w-full h-full"
                    style={{ background: `url(${p.anh}) center/cover` }}
                  />
                  <span
                    className="absolute top-2 left-2 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: "#9b59b6", color: "white" }}
                  >
                    NEW
                  </span>
                </div>
                <div className="p-3">
                  <p
                    className="text-xs font-semibold line-clamp-2 mb-1"
                    style={{ color: "#2c1810" }}
                  >
                    {p.ten_sp}
                  </p>
                  <StarRow
                    rating={p.danh_gia ?? 0}
                    count={p.luot_danh_gia ?? 0}
                  />
                  <p
                    className="text-[13px] line-through"
                    style={{ color: "gray" }}
                  >
                    {fmt(origPrice)}
                  </p>
                  <p
                    className="text-xl font-black mt-1"
                    style={{ color: "#c17f44" }}
                  >
                    {fmt(minPrice)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Sale section ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #2c1810 0%, #8b4513 100%)",
          }}
        >
          <div className="p-6 sm:p-8">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <span
                  className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
                  style={{ background: "#f5c84220", color: "#f5c842" }}
                >
                  🏷️ FLASH SALE
                </span>
                <h2 className="shop-serif text-2xl font-black text-white mt-2">
                  Ưu đãi hôm nay
                </h2>
                <p
                  className="text-xs"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Giảm đến 25% · Kết thúc lúc 23:59
                </p>
              </div>
              <Link
                to="/shop/san-pham?sale=1"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm"
                style={{ background: "#f5c842", color: "#2c1810" }}
              >
                Xem tất cả <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {saleProducts.map((p) => {
                const minPrice = getMinGia(p);
                const origPrice = Math.round(
                  minPrice / (1 - (p.giam_gia ?? 0) / 100),
                );
                return (
                  <Link
                    key={p.id}
                    to={`/shop/san-pham/${p.id}`}
                    className="product-card rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ height: 140 }}
                    >
                      <div
                        className="card-img w-full h-full"
                        style={{ background: `url(${p.anh}) center/cover` }}
                      />
                      <span
                        className="absolute top-2 right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: "#e74c3c", color: "white" }}
                      >
                        -{p.giam_gia}%
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-white line-clamp-1 mb-1">
                        {p.ten_sp}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <p
                          className="text-xl font-black mt-1"
                          style={{ color: "#c17f44" }}
                        >
                          {fmt(minPrice)}
                        </p>
                        <span
                          className="text-[13px] line-through"
                          style={{ color: "rgba(255,255,255,0.35)" }}
                        >
                          {fmt(origPrice)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
