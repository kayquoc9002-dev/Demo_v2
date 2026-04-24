import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Heart,
  Bell,
  LogOut,
} from "lucide-react";
import { CATEGORIES, loadCart } from "../components/BanHang/data/shopData";
import type { CartItem } from "../components/BanHang/data/shopData";

export default function ShopLayout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync cart count from localStorage whenever route changes
  useEffect(() => {
    setCart(loadCart());
    const handler = () => setCart(loadCart());
    window.addEventListener("shop-cart-updated", handler);
    return () => window.removeEventListener("shop-cart-updated", handler);
  }, [location.pathname]);

  const cartCount = cart.reduce((s, i) => s + i.soLuong, 0);
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim())
      navigate(`/san-pham?q=${encodeURIComponent(search.trim())}`);
  };

  const navLinks = [
    { to: "/", label: "Trang chủ" },
    { to: "/san-pham", label: "Sản phẩm" },
    { to: "/san-pham?hot=1", label: "🔥 Hot deals" },
    { to: "/san-pham?new=1", label: "✨ Hàng mới" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#f7f3ef", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        .shop-serif { font-family: 'Playfair Display', serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4c9be; border-radius: 2px; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .product-card:hover .card-img { transform: scale(1.06); }
        .card-img { transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .nav-link { position: relative; }
        .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:2px; background:#c17f44; transition: width 0.25s ease; border-radius:2px; }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
      `}</style>

      {/* ── Top banner ────────────────────────────────────── */}
      <div
        style={{ background: "#2c1810", color: "#f5e6d3" }}
        className="text-center text-xs py-2 font-medium tracking-wide"
      >
        🎉 Miễn phí vận chuyển cho đơn từ <strong>500.000đ</strong> · Đổi trả
        trong 30 ngày
      </div>

      {/* ── Header ────────────────────────────────────────── */}
      <header
        style={{ background: "#fff", borderBottom: "1px solid #ede8e3" }}
        className="sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div
                style={{
                  background: "#2c1810",
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{ color: "#f5c842", fontSize: 14, fontWeight: 900 }}
                >
                  F
                </span>
              </div>
              <span
                className="shop-serif text-xl font-black"
                style={{ color: "#2c1810" }}
              >
                FPTU<span style={{ color: "#c17f44" }}>Shop</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 ml-4">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`nav-link text-sm font-medium transition-colors ${location.pathname === l.to || location.pathname + location.search === l.to ? "active" : ""}`}
                  style={{ color: "#2c1810" }}
                >
                  {l.label}
                </Link>
              ))}
              {/* Categories dropdown */}
              <div className="relative group">
                <button
                  className="nav-link flex items-center gap-1 text-sm font-medium"
                  style={{ color: "#2c1810" }}
                >
                  Danh mục <ChevronDown size={13} />
                </button>
                <div className="absolute top-7 left-0 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                  {CATEGORIES.filter((c) => c.id !== "tat-ca").map((c) => (
                    <Link
                      key={c.id}
                      to={`/san-pham?cat=${c.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
                      style={{ color: "#2c1810" }}
                    >
                      <span>{c.emoji}</span> {c.label}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="hidden sm:flex flex-1 max-w-sm mx-4"
            >
              <div className="relative w-full">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#a89080" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  style={{
                    background: "#f7f3ef",
                    border: "1.5px solid #ede8e3",
                    color: "#2c1810",
                    borderRadius: 50,
                  }}
                  className="w-full pl-9 pr-4 py-2 text-sm outline-none focus:border-stone-400 transition-colors placeholder:text-stone-400"
                />
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                style={{ color: "#2c1810" }}
              >
                <Heart size={17} />
              </button>
              <button
                className="hidden sm:flex w-8 h-8 items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                style={{ color: "#2c1810" }}
              >
                <Bell size={17} />
              </button>

              {/* Cart */}
              <Link
                to="/gio-hang"
                className="relative flex w-9 h-9 items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                style={{ color: "#2c1810" }}
              >
                <ShoppingCart size={18} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center leading-none"
                    style={{ background: "#c17f44" }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu((p) => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-stone-100 transition-colors"
                  style={{ color: "#2c1810" }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: "#2c1810", color: "#f5c842" }}
                  >
                    {user?.username?.[0]?.toUpperCase() ?? <User size={12} />}
                  </div>
                  <span className="hidden sm:block max-w-20 truncate">
                    {user?.username ?? "Đăng nhập"}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-11 w-44 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-30">
                    {user ? (
                      <>
                        <Link
                          to="/don-hang"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
                          style={{ color: "#2c1810" }}
                        >
                          📦 Đơn hàng của tôi
                        </Link>
                        <Link
                          to="/tai-khoan"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
                          style={{ color: "#2c1810" }}
                        >
                          <User size={13} /> Tài khoản
                        </Link>
                        <hr
                          style={{ borderColor: "#ede8e3" }}
                          className="my-1"
                        />
                        <button
                          onClick={() => {
                            localStorage.removeItem("user");
                            window.location.href = "/login";
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors text-left"
                          style={{ color: "#c17f44" }}
                        >
                          <LogOut size={13} /> Đăng xuất
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-stone-50 transition-colors"
                        style={{ color: "#2c1810" }}
                      >
                        <User size={13} /> Đăng nhập
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100"
                style={{ color: "#2c1810" }}
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          {menuOpen && (
            <div
              className="md:hidden border-t py-3 space-y-1"
              style={{ borderColor: "#ede8e3" }}
            >
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-2 py-2 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
                  style={{ color: "#2c1810" }}
                >
                  {l.label}
                </Link>
              ))}
              <form onSubmit={handleSearch} className="pt-2">
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm kiếm..."
                    style={{
                      background: "#f7f3ef",
                      border: "1.5px solid #ede8e3",
                      borderRadius: 50,
                    }}
                    className="w-full pl-8 pr-3 py-2 text-sm outline-none"
                  />
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ── Category strip ───────────────────────────── */}
        <div
          style={{ borderTop: "1px solid #ede8e3", background: "#faf8f5" }}
          className="hidden md:block"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-0 overflow-x-auto">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  to={c.id === "tat-ca" ? "/san-pham" : `/san-pham?cat=${c.id}`}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap hover:text-amber-700 transition-colors border-b-2 border-transparent hover:border-amber-600"
                  style={{ color: "#6b5344" }}
                >
                  <span>{c.emoji}</span> {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ──────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer
        style={{ background: "#2c1810", color: "#c4a882" }}
        className="mt-16"
      >
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <span className="shop-serif text-xl font-black text-white block mb-3">
              FPTU<span style={{ color: "#f5c842" }}>Shop</span>
            </span>
            <p className="text-xs leading-relaxed" style={{ color: "#a89070" }}>
              Thời trang chất lượng cao, phong cách hiện đại. Giao hàng toàn
              quốc.
            </p>
          </div>
          {[
            {
              title: "Hỗ trợ",
              links: [
                "Chính sách đổi trả",
                "Hướng dẫn size",
                "Liên hệ CSKH",
                "FAQ",
              ],
            },
            {
              title: "Công ty",
              links: [
                "Về chúng tôi",
                "Tuyển dụng",
                "Tin tức",
                "Blog thời trang",
              ],
            },
            {
              title: "Theo dõi",
              links: ["Facebook", "Instagram", "TikTok", "Zalo OA"],
            },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-black text-white uppercase tracking-widest mb-3">
                {col.title}
              </p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-xs hover:text-white transition-colors"
                      style={{ color: "#a89070" }}
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{ borderTop: "1px solid #3d2515", color: "#6b5344" }}
          className="text-center text-xs py-4"
        >
          © 2026 FPTUShop · Doanh nhân FPTU
        </div>
      </footer>
    </div>
  );
}
