import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { SIDEBAR_TOP_MENU, SIDEBAR_BOTTOM_MENU } from "../constants/menu";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useMetadata } from "../hooks/useMetadata";
import { GlobalSearch } from "../components/GlobalSearch";
import { useGlobalSearch } from "../hooks/useGlobalSearch";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SubMenuChild {
  label: string;
  path: string;
}

interface SubMenuItem {
  id?: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  hoverPopup?: boolean;
  subItems?: SubMenuChild[];
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  className?: string;
  subItems?: SubMenuItem[];
}

// ─── HoverPopupItem ───────────────────────────────────────────────────────────
// Dùng createPortal để render popup vào document.body
// → thoát khỏi overflow-hidden/overflow-y-auto của sidebar

// function HoverPopupItem({
//   item,
//   isChildActive,
//   pathname,
//   onLinkClick,
// }: {
//   item: {
//     id: string;
//     label: string;
//     icon?: React.ReactNode;
//     subItems: SubMenuChild[];
//   };
//   isChildActive: boolean;
//   pathname: string;
//   onLinkClick: () => void;
// }) {
//   const btnRef = useRef<HTMLButtonElement>(null);
//   const [visible, setVisible] = useState(false);
//   const [pos, setPos] = useState({ top: 0, left: 0 });

//   const show = () => {
//     console.log("hello");
//     const rect = btnRef.current?.getBoundingClientRect();
//     if (rect) setPos({ top: rect.top, left: rect.right });
//     setVisible(true);
//   };

//   const hide = () => setVisible(false);

//   return (
//     <div>
//       <button
//         ref={btnRef}
//         onMouseEnter={show}
//         onMouseLeave={hide}
//         className={`w-full flex items-center justify-between py-2 text-xs rounded-md px-2 transition-colors ${
//           isChildActive
//             ? "text-blue-400 font-semibold"
//             : "text-slate-500 hover:text-slate-200"
//         }`}
//       >
//         <span>{item.label}</span>
//         <ChevronRight size={11} className="opacity-40" />
//       </button>

//       {visible &&
//         createPortal(
//           <div
//             className="fixed z-[9999]"
//             style={{ top: pos.top, left: pos.left + 8, minWidth: 200 }}
//             onMouseEnter={() => setVisible(true)}
//             onMouseLeave={hide}
//           >
//             {/* Cầu nối trong suốt — chuột di sang popup không mất hover */}
//             <div className="absolute -left-2 top-0 w-2 h-full" />

//             <div
//               className="rounded-xl py-1.5 shadow-2xl"
//               style={{ background: "#0f172a", border: "1px solid #1e293b" }}
//             >
//               <p
//                 className="px-4 py-2 text-[10px] font-black uppercase"
//                 style={{ color: "#334155" }}
//               >
//                 {item.label}
//               </p>
//               {item.subItems.map((sub) => {
//                 const isActive = pathname === sub.path;
//                 return (
//                   <Link
//                     key={sub.path}
//                     to={sub.path}
//                     onClick={() => {
//                       hide();
//                       onLinkClick();
//                     }}
//                     className="flex items-center px-4 py-2.5 transition-all hover:bg-slate-800/60"
//                     style={{
//                       color: isActive ? "#60a5fa" : "#94a3b8",
//                       background: isActive
//                         ? "rgba(96,165,250,0.08)"
//                         : "transparent",
//                       borderLeft: isActive
//                         ? "2px solid #60a5fa"
//                         : "2px solid transparent",
//                     }}
//                   >
//                     <span className="text-sm font-medium">{sub.label}</span>
//                     {isActive && (
//                       <div
//                         className="ml-auto w-1.5 h-1.5 rounded-full"
//                         style={{ background: "#60a5fa" }}
//                       />
//                     )}
//                   </Link>
//                 );
//               })}
//             </div>
//           </div>,
//           document.body,
//         )}
//     </div>
//   );
// }

function SubItemList({
  subItems,
  pathname,
  closeSidebar,
}: {
  subItems:    SubMenuItem[];
  pathname:    string;
  closeSidebar: () => void;
}) {
  const [popup, setPopup] = useState<{
    sub:  SubMenuItem;
    top:  number;
    left: number;
  } | null>(null);

  return (
    <div>
      {subItems.map((sub) => (
        <div
          key={sub.path}
          onMouseEnter={(e) => {
            if (sub.hoverPopup && sub.subItems) {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setPopup({ sub, top: rect.top, left: rect.right });
            }
          }}
          onMouseLeave={() => setPopup(null)}
        >
          <Link
            to={sub.path}
            onClick={closeSidebar}
            className={`block py-2 px-5 text-xs transition-colors ${
              pathname === sub.path
                ? "text-blue-400 font-semibold"
                : "text-slate-500 hover:text-slate-200"
            }`}
          >
            {sub.label}
            {sub.hoverPopup && sub.subItems && (
              <ChevronRight size={11} className="inline ml-1 opacity-40" />
            )}
          </Link>
        </div>
      ))}

      {popup && createPortal(
        <div
          className="fixed z-[9999]"
          style={{ top: popup.top, left: popup.left + 8, minWidth: 180 }}
          onMouseEnter={() => setPopup(popup)}
          onMouseLeave={() => setPopup(null)}
        >
          <div className="absolute -left-2 top-0 w-2 h-full" />
          <div
            className="rounded-xl py-1.5 shadow-2xl"
            style={{ background: "#0f172a", border: "1px solid #1e293b" }}
          >
            <p className="px-4 py-2 text-[10px] font-black uppercase"
              style={{ color: "#334155" }}>
              {popup.sub.label}
            </p>
            {popup.sub.subItems!.map((child) => {
              const isActive = pathname === child.path;
              return (
                <Link
                  key={child.path}
                  to={child.path}
                  onClick={() => { setPopup(null); closeSidebar(); }}
                  className="flex items-center px-4 py-2.5 transition-all hover:bg-slate-800/60"
                  style={{
                    color:      isActive ? "#60a5fa" : "#94a3b8",
                    background: isActive ? "rgba(96,165,250,0.08)" : "transparent",
                    borderLeft: isActive ? "2px solid #60a5fa" : "2px solid transparent",
                  }}
                >
                  <span className="text-sm font-medium">{child.label}</span>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: "#60a5fa" }} />
                  )}
                </Link>
              );
            })}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

// ─── ManageLayout ─────────────────────────────────────────────────────────────

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

    // ── Đăng xuất ──
    if (item.id === "dang-xuat") {
      return (
        <button
          key={item.id}
          onClick={handleLogout}
          className="w-full group flex items-center gap-3 px-4 py-2.5 rounded-md transition-all duration-200 text-red-400 hover:bg-red-400/10"
        >
          <span className="group-hover:scale-110 transition-transform">
            {item.icon}
          </span>
          <span className="text-sm font-medium">{item.label}</span>
        </button>
      );
    }

    // ── Item có subItems (accordion) ──
    if (item.subItems) {
      const isChildActive = item.subItems.some(
        (sub) =>
          location.pathname === sub.path ||
          (sub.subItems ?? sub.subItems ?? []).some(
            (s) => location.pathname === s.path,
          ),
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
              <motion.div>
                <SubItemList
                  subItems={item.subItems}
                  pathname={location.pathname}
                  closeSidebar={closeSidebar}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    // ── Item thường (Link) ──
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
      {/* Logo */}
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

      <div className="px-3 pt-4 pb-1 flex-shrink-0">
        <p className="px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          Menu Chính
        </p>
      </div>

      {/* Nav — scroll được, KHÔNG overflow-hidden */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {SIDEBAR_TOP_MENU.map((item) => renderMenuItem(item as MenuItem))}
        </div>
      </nav>

      {/* Bottom nav */}
      <div className="px-3 pb-3 space-y-1 border-t border-slate-800/50 pt-3 flex-shrink-0">
        {SIDEBAR_BOTTOM_MENU.map((item) => renderMenuItem(item as MenuItem))}
      </div>

      {/* User */}
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
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-64 border-r border-slate-800 flex-col bg-[#09090b]">
          {sidebarContent}
        </aside>

        {/* Sidebar mobile */}
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

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
          <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#09090b]/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
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
