import { useState, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { SIDEBAR_TOP_MENU, SIDEBAR_BOTTOM_MENU } from "../constants/menu";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Bell, User, ChevronDown, Menu, X } from "lucide-react";
import { useMetadata } from "../hooks/useMetadata";
import { GlobalSearch } from "../components/GlobalSearch";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  className?: string;
  subItems?: SubMenuItem[];
}

const ManageLayout = () => {
  useMetadata("Quản lý May Mặc", "/manage.png");
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    isOpen: searchOpen,
    open: openSearch,
    close: closeSearch,
  } = useGlobalSearch();

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = ["admin", "Admin"].includes(savedUser.role ?? "");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path;
    const isOpen = openMenus.includes(item.id);

    if (item.id === "dang-xuat") {
      return (
        <button
          key={item.id}
          onClick={handleLogout}
          className="w-full group flex items-center gap-3 px-4 py-2.5 ronded-md transition-all duration-200 text-red-400 hover:bg-red-400/10"
        >
          <span className="group-hover:scale-110 transition-transform">
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      );
    }

    if (item.subItems) {
      const isChildActive = item.subItems.some(
        (sub) => location.pathname === sub.path,
      );
      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.id)}
            className={`w-full group flex items-center justify-between px-4 py-2.5 rounded-md transition-all duration-200 ${
              isChildActive
                ? "bg-slate-800/50 text-white"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="group-hover:text-blue-400 transition-colors">
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pl-10 space-y-1"
              >
                {item.subItems.map((sub: SubMenuItem) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    onClick={closeSidebar}
                    className={`block py-2 text-xs transition-colors ${
                      location.pathname === sub.path
                        ? "text-blue-400 font-semibold"
                        : "text-slate-500 hover:text-slate-200"
                    }`}
                  >
                    {sub.label}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        to={item.path}
        onClick={closeSidebar}
        className={`group flex items-center justify-between px-4 py-2.5 rounded-md transition-all duration-200 ${
          isActive
            ? "bg-slate-800 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        } ${item.className ?? ""}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`${isActive ? "text-blue-400" : "group-hover:text-blue-400"} transition-colors`}
          >
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.label}</span>
        </div>
        {isActive && (
          <motion.div
            layoutId="active"
            className="w-1 h-4 bg-blue-500 rounded-full"
          />
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo + nút đóng mobile */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            M
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            MayMac<span className="text-blue-500">Pro</span>
          </span>
        </div>
        <button
          onClick={closeSidebar}
          className="lg:hidden text-slate-500 hover:text-white p-1 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Label cố định */}
      <div className="px-3 pt-4 pb-1 flex-shrink-0">
        <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Menu Chính
        </p>
      </div>

      {/* Nav top — scroll được */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {SIDEBAR_TOP_MENU.map((item) => renderMenuItem(item as MenuItem))}
        </div>
      </nav>

      {/* Nav bottom — cố định, không scroll */}
      <div className="px-3 pb-3 space-y-1 border-t border-slate-800/50 pt-3 flex-shrink-0">
        {SIDEBAR_BOTTOM_MENU.map((item) => renderMenuItem(item as MenuItem))}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 bg-[#0c0c0e]">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {savedUser.name?.substring(0, 2).toUpperCase() || "AD"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">
              {savedUser.name || "Admin May Mặc"}
            </p>
            <p className="text-xs text-slate-500 truncate lowercase">
              {savedUser.username
                ? `@${savedUser.username}`
                : "admin@maymac.pro"}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="flex h-screen bg-[#09090b] text-slate-200 font-sans">
        {/* ── SIDEBAR DESKTOP (lg+) ── */}
        <aside className="hidden lg:flex w-64 border-r border-slate-800 flex-col bg-[#09090b]">
          {sidebarContent}
        </aside>

        {/* ── SIDEBAR MOBILE — overlay ── */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={closeSidebar}
                className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              />
              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-800 flex flex-col bg-[#09090b]"
              >
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
          {/* Header */}
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              {/* Hamburger — chỉ hiện dưới lg */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
              >
                <Menu size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={openSearch}
                className="p-2 text-slate-400 hover:text-white transition-colors"
                title="Tìm kiếm (⌘K)"
              >
                <Search size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]" />
              </button>
              <div className="h-6 w-[1px] bg-slate-800 mx-2" />
              <button className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <div className="w-7 h-7 bg-slate-800 rounded-full flex items-center justify-center text-blue-400">
                  <User size={16} />
                </div>
                <span className="hidden sm:block">
                  {isAdmin ? "Quản trị viên" : "Nhân viên"}
                </span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      <GlobalSearch isOpen={searchOpen} onClose={closeSearch} />
    </>
  );
};

export default ManageLayout;
