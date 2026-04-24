import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Building,
  Package,
  Wrench,
  Palette,
  User,
  Clock,
  ArrowRight,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
  X,
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Tag,
  Box,
  List,
  Factory,
  Truck,
  CreditCard,
  BarChart,
  MessageSquare,
  BookOpen,
  Settings,
  Handshake,
  Hash,
  AtSign,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;
const RECENT_KEY = "gs_recent_v2";
const MAX_RECENT = 8;

// ─── Types ────────────────────────────────────────────────
type DataCategory = "Nhân viên" | "Khách hàng" | "Nhà phân phối" | "Đối tác";

interface PageResult {
  kind: "page";
  id: string;
  label: string;
  path: string;
  breadcrumb: string[];
  icon: React.ElementType;
  keywords: string[];
}

interface DataResult {
  kind: "data";
  id: string;
  category: DataCategory;
  title: string;
  subtitle?: string;
  badge?: string;
  status?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  raw: Record<string, unknown>;
}

type SearchResult = PageResult | DataResult;

interface RecentItem {
  id: string;
  kind: "page" | "data";
  title: string;
  subtitle?: string;
  category?: string;
  path?: string;
  ts: number;
}

// ─── Filter tags ──────────────────────────────────────────
const FILTER_TAGS: Record<
  string,
  { label: string; matches: DataCategory[] | ["page"] }
> = {
  "@nv": { label: "Nhân viên", matches: ["Nhân viên"] },
  "@kh": { label: "Khách hàng", matches: ["Khách hàng"] },
  "@npp": { label: "Nhà phân phối", matches: ["Nhà phân phối"] },
  "@dt": { label: "Đối tác", matches: ["Đối tác"] },
  "@trang": { label: "Trang", matches: ["page"] },
};

// ─── Page catalog ─────────────────────────────────────────
const ALL_PAGES: PageResult[] = [
  {
    kind: "page",
    id: "dashboard",
    label: "Dashboard",
    path: "/manage",
    breadcrumb: ["Menu chính"],
    icon: LayoutDashboard,
    keywords: ["dashboard", "tổng quan"],
  },
  {
    kind: "page",
    id: "thu-chi",
    label: "Thu Chi",
    path: "/manage/thu-chi",
    breadcrumb: ["Menu chính", "Thu Chi"],
    icon: Wallet,
    keywords: ["thu", "chi", "tài chính", "kế toán"],
  },
  {
    kind: "page",
    id: "mua-hang",
    label: "Mua hàng",
    path: "/manage/mua-hang",
    breadcrumb: ["Menu chính", "Mua hàng"],
    icon: ShoppingCart,
    keywords: ["mua", "nhập", "đơn mua"],
  },
  {
    kind: "page",
    id: "ban-hang",
    label: "Bán hàng",
    path: "/manage/ban-hang",
    breadcrumb: ["Menu chính", "Bán hàng"],
    icon: Tag,
    keywords: ["bán", "đơn hàng", "order"],
  },
  {
    kind: "page",
    id: "kho",
    label: "Kho",
    path: "/manage/kho",
    breadcrumb: ["Menu chính", "Kho"],
    icon: Box,
    keywords: ["kho", "tồn kho", "warehouse"],
  },
  {
    kind: "page",
    id: "danh-muc",
    label: "Danh mục sản phẩm",
    path: "/manage/danh-muc",
    breadcrumb: ["Menu chính", "Danh mục sản phẩm"],
    icon: List,
    keywords: ["danh mục", "sản phẩm", "product"],
  },
  {
    kind: "page",
    id: "san-xuat",
    label: "Sản xuất",
    path: "/manage/san-xuat",
    breadcrumb: ["Menu chính", "Sản xuất"],
    icon: Factory,
    keywords: ["sản xuất", "production", "xưởng"],
  },
  {
    kind: "page",
    id: "giao-hang",
    label: "Giao hàng",
    path: "/manage/giao-hang",
    breadcrumb: ["Menu chính", "Giao hàng"],
    icon: Truck,
    keywords: ["giao", "vận chuyển", "ship", "delivery"],
  },
  {
    kind: "page",
    id: "thanh-toan",
    label: "Thanh toán",
    path: "/manage/thanh-toan",
    breadcrumb: ["Menu chính", "Thanh toán"],
    icon: CreditCard,
    keywords: ["thanh toán", "payment", "hóa đơn"],
  },
  {
    kind: "page",
    id: "bao-cao",
    label: "Báo cáo",
    path: "/manage/bao-cao",
    breadcrumb: ["Menu chính", "Báo cáo"],
    icon: BarChart,
    keywords: ["báo cáo", "report", "thống kê"],
  },
  {
    kind: "page",
    id: "nhan-su",
    label: "Nhân sự",
    path: "/manage/nhan-su/nhan-vien",
    breadcrumb: ["Menu chính", "Nhân sự"],
    icon: Users,
    keywords: ["nhân sự", "hr"],
  },
  {
    kind: "page",
    id: "nhan-vien",
    label: "Quản lý nhân viên",
    path: "/manage/nhan-su/nhan-vien",
    breadcrumb: ["Menu chính", "Nhân sự", "Quản lý nhân viên"],
    icon: User,
    keywords: ["nhân viên", "employee", "staff", "nv"],
  },
  {
    kind: "page",
    id: "chuc-vu",
    label: "Chức vụ & Phòng ban",
    path: "/manage/nhan-su/chuc-vu-phong-ban",
    breadcrumb: ["Menu chính", "Nhân sự", "Chức vụ & Phòng ban"],
    icon: Settings,
    keywords: ["chức vụ", "phòng ban", "department", "position"],
  },
  {
    kind: "page",
    id: "khachhang",
    label: "Khách hàng",
    path: "/manage/service/khachhang",
    breadcrumb: ["Dịch vụ", "Khách hàng"],
    icon: Users,
    keywords: ["khách hàng", "kh", "customer"],
  },
  {
    kind: "page",
    id: "doitac-npp",
    label: "Nhà PP & Đối tác",
    path: "/manage/service/doitac-nhaphanphoi",
    breadcrumb: ["Dịch vụ", "Nhà phân phối & Đối tác"],
    icon: Handshake,
    keywords: ["nhà phân phối", "đối tác", "partner", "distributor", "npp"],
  },
  {
    kind: "page",
    id: "chat",
    label: "Chat nội bộ",
    path: "/manage/chat",
    breadcrumb: ["Tiện ích", "Chat nội bộ"],
    icon: MessageSquare,
    keywords: ["chat", "tin nhắn"],
  },
  {
    kind: "page",
    id: "huong-dan",
    label: "Hướng dẫn",
    path: "/manage/huong-dan",
    breadcrumb: ["Tiện ích", "Hướng dẫn"],
    icon: BookOpen,
    keywords: ["hướng dẫn", "help", "guide"],
  },
  {
    kind: "page",
    id: "cai-dat",
    label: "Cài đặt",
    path: "/manage/cai-dat",
    breadcrumb: ["Tiện ích", "Cài đặt"],
    icon: Settings,
    keywords: ["cài đặt", "setting", "config"],
  },
];

// ─── Config ───────────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; dot: string }> = {
  active: { label: "Đang làm", dot: "bg-emerald-400" },
  inactive: { label: "Ngừng", dot: "bg-slate-500" },
  tamNgung: { label: "Tạm ngưng", dot: "bg-amber-400" },
  ketThuc: { label: "Kết thúc", dot: "bg-slate-600" },
  resigned: { label: "Nghỉ việc", dot: "bg-rose-400" },
};

const DATA_CFG: Record<
  DataCategory,
  { color: string; bg: string; border: string; icon: React.ElementType }
> = {
  "Nhân viên": {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: User,
  },
  "Khách hàng": {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: Users,
  },
  "Nhà phân phối": {
    color: "text-indigo-400",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500/20",
    icon: Building,
  },
  "Đối tác": {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    icon: Package,
  },
};

const PARTNER_ICON: Record<string, React.ElementType> = {
  CungUng: Package,
  GiaCong: Wrench,
  ThietKe: Palette,
};

// ─── Helpers ──────────────────────────────────────────────
const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const getRecent = (): RecentItem[] => {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveRecent = (item: RecentItem) => {
  const p = getRecent().filter((r) => r.id !== item.id);
  localStorage.setItem(
    RECENT_KEY,
    JSON.stringify([item, ...p].slice(0, MAX_RECENT)),
  );
};
const clearRecent = () => localStorage.removeItem(RECENT_KEY);

const Hl = ({ text, q }: { text: string; q: string }) => {
  if (!q.trim()) return <>{text}</>;
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return (
    <>
      {text.split(re).map((p, i) =>
        re.test(p) ? (
          <mark
            key={i}
            className="bg-amber-400/25 text-amber-300 rounded-sm not-italic"
          >
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
};

// ─── Local page search ────────────────────────────────────
function searchPages(q: string): PageResult[] {
  const l = q.toLowerCase();
  return ALL_PAGES.filter(
    (p) =>
      p.label.toLowerCase().includes(l) ||
      p.keywords.some((k) => k.includes(l)) ||
      p.breadcrumb.some((b) => b.toLowerCase().includes(l)),
  ).slice(0, 4);
}

// ─── API data search ──────────────────────────────────────
async function searchData(q: string): Promise<DataResult[]> {
  const out: DataResult[] = [];
  await Promise.allSettled([
    fetch(`${API}/hr/employees?q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data: unknown[]) => {
        (Array.isArray(data) ? data : []).forEach((e: unknown) => {
          const emp = e as Record<string, unknown>;
          out.push({
            kind: "data",
            id: `emp-${emp.id}`,
            category: "Nhân viên",
            title: emp.fullName as string,
            subtitle: [
              (emp.department as Record<string, string>)?.name,
              (emp.position as Record<string, string>)?.name,
            ]
              .filter(Boolean)
              .join(" · "),
            badge: emp.code as string,
            status: emp.resigned ? "resigned" : "active",
            phone: emp.phone as string,
            email: emp.email as string,
            avatar: initials((emp.fullName as string) ?? ""),
            raw: emp,
          });
        });
      }),
    fetch(`${API}/service/khachhang?q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data: unknown[]) => {
        (Array.isArray(data) ? data : []).forEach((k: unknown) => {
          const kh = k as Record<string, unknown>;
          const d = (kh.b2b || kh.thoiTrang || kh.caNhan) as Record<
            string,
            unknown
          > | null;
          const ten = (d?.tenDoanhNghiep ||
            d?.tenThuongHieu ||
            d?.hoTen ||
            "—") as string;
          out.push({
            kind: "data",
            id: `kh-${kh.id}`,
            category: "Khách hàng",
            title: ten,
            subtitle: kh.loai as string,
            badge: kh.ma as string,
            status: kh.trangThai as string,
            phone: d?.sdt as string,
            email: d?.email as string,
            avatar: initials(ten),
            raw: kh,
          });
        });
      }),
    fetch(`${API}/service/nhaphanphoi?q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data: unknown[]) => {
        (Array.isArray(data) ? data : []).forEach((n: unknown) => {
          const npp = n as Record<string, unknown>;
          out.push({
            kind: "data",
            id: `npp-${npp.id}`,
            category: "Nhà phân phối",
            title: npp.tenCongTy as string,
            subtitle: npp.quocGiaKhuVuc as string,
            badge: npp.ma as string,
            status: npp.trangThai as string,
            phone: npp.sdt as string,
            email: npp.email as string,
            avatar: initials((npp.tenCongTy as string) ?? ""),
            raw: npp,
          });
        });
      }),
    fetch(`${API}/service/doitac?q=${encodeURIComponent(q)}&limit=5`)
      .then((r) => r.json())
      .then((data: unknown[]) => {
        (Array.isArray(data) ? data : []).forEach((d: unknown) => {
          const dt = d as Record<string, unknown>;
          const det = (dt.cungUng || dt.giaCong || dt.thietKe) as Record<
            string,
            unknown
          > | null;
          const ten = (det?.tenNhaCungCap ||
            det?.tenXuong ||
            det?.tenStudio ||
            "—") as string;
          out.push({
            kind: "data",
            id: `dt-${dt.id}`,
            category: "Đối tác",
            title: ten,
            subtitle: dt.loai as string,
            badge: dt.ma as string,
            status: dt.trangThai as string,
            avatar: initials(ten),
            raw: dt,
          });
        });
      }),
  ]);
  return out;
}

// ─── Props ────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenDetail?: (result: DataResult) => void;
}

// ─── Component ────────────────────────────────────────────
export const GlobalSearch = ({ isOpen, onClose, onOpenDetail }: Props) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [rawQuery, setRawQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  // strip tag prefix to get the real search string
  const detectedTag =
    Object.keys(FILTER_TAGS).find(
      (t) =>
        rawQuery.toLowerCase().startsWith(t + " ") ||
        rawQuery.toLowerCase() === t,
    ) ?? null;
  const effectiveTag = detectedTag ?? activeTag;
  const query = detectedTag
    ? rawQuery.slice(detectedTag.length).trim()
    : rawQuery.trim();

  useEffect(() => {
    if (isOpen) {
      setRecent(getRecent());
      setRawQuery("");
      setResults([]);
      setActiveIdx(0);
      setActiveTag(null);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query && !effectiveTag) {
      setResults([]);
      setLoading(false);
      return;
    }
    if (!query) {
      setResults([]);
      return;
    } // tag set but no query yet — wait
    setLoading(true);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const isPageOnly = effectiveTag === "@trang";
      const isDataOnly = effectiveTag && effectiveTag !== "@trang";
      const [pages, data] = await Promise.all([
        isDataOnly ? Promise.resolve([]) : searchPages(query),
        isPageOnly ? Promise.resolve([]) : searchData(query),
      ]);
      let filtered: SearchResult[] = [...pages, ...data];
      if (isDataOnly) {
        const allowed = FILTER_TAGS[effectiveTag!]?.matches as DataCategory[];
        filtered = data.filter((r) => allowed.includes(r.category));
      }
      setResults(filtered);
      setActiveIdx(0);
      setLoading(false);
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [rawQuery, query, effectiveTag]);

  const pageResults = useMemo(
    () => results.filter((r): r is PageResult => r.kind === "page"),
    [results],
  );
  const dataByCat = useMemo(() => {
    const map: Partial<Record<DataCategory, DataResult[]>> = {};
    results
      .filter((r): r is DataResult => r.kind === "data")
      .forEach((r) => {
        if (!map[r.category]) map[r.category] = [];
        map[r.category]!.push(r);
      });
    return map;
  }, [results]);
  const flat = useMemo<SearchResult[]>(
    () => [
      ...pageResults,
      ...(Object.values(dataByCat).flat() as DataResult[]),
    ],
    [pageResults, dataByCat],
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      if (result.kind === "page") {
        saveRecent({
          id: result.id,
          kind: "page",
          title: result.label,
          subtitle: result.breadcrumb.join(" › "),
          path: result.path,
          ts: Date.now(),
        });
        setRecent(getRecent());
        navigate(result.path);
      } else {
        saveRecent({
          id: result.id,
          kind: "data",
          title: result.title,
          subtitle: result.subtitle,
          category: result.category,
          ts: Date.now(),
        });
        setRecent(getRecent());
        if (result.category === "Nhân viên")
          navigate("/manage/nhan-su/nhan-vien");
        else if (result.category === "Khách hàng")
          navigate("/manage/service/khachhang");
        else navigate("/manage/service/doitac-nhaphanphoi");
        if (onOpenDetail) onOpenDetail(result);
      }
      onClose();
    },
    [navigate, onClose, onOpenDetail],
  );

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (!flat.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, flat.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (flat[activeIdx]) handleSelect(flat[activeIdx]);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, flat, activeIdx, handleSelect, onClose]);

  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-idx="${activeIdx}"]`,
    ) as HTMLElement;
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx]);

  const showIdle = !rawQuery && !activeTag;
  const showRecent = showIdle && recent.length > 0;
  const showEmpty = query.length > 0 && !loading && results.length === 0;
  const showTagWait = effectiveTag && !query;

  let gIdx = 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[201] top-[12vh] left-0 right-0 mx-auto w-full max-w-[660px] px-4"
          >
            <div className="bg-[#0c1018] border border-slate-700/70 rounded-2xl shadow-[0_32px_80px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Input bar */}
              <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-800">
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-700 border-t-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <Search size={15} className="text-slate-500 flex-shrink-0" />
                )}
                {/* active tag pill (from button click, not typed) */}
                {activeTag && !detectedTag && (
                  <div className="flex items-center gap-1 bg-blue-500/15 border border-blue-500/30 rounded-lg px-2 py-0.5 flex-shrink-0">
                    <AtSign size={9} className="text-blue-400" />
                    <span className="text-[11px] font-bold text-blue-300">
                      {FILTER_TAGS[activeTag]?.label}
                    </span>
                    <button
                      onClick={() => setActiveTag(null)}
                      className="text-blue-500 hover:text-blue-300 ml-0.5"
                    >
                      <X size={9} />
                    </button>
                  </div>
                )}
                <input
                  ref={inputRef}
                  value={rawQuery}
                  onChange={(e) => {
                    setRawQuery(e.target.value);
                    setActiveIdx(0);
                  }}
                  placeholder={
                    activeTag && !detectedTag
                      ? `Tìm trong ${FILTER_TAGS[activeTag]?.label}...`
                      : "Tìm trang, nhân viên, khách hàng..."
                  }
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 outline-none"
                />
                {rawQuery && (
                  <button
                    onClick={() => {
                      setRawQuery("");
                      setActiveTag(null);
                    }}
                    className="text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
                <kbd className="hidden sm:block text-[9px] font-bold text-slate-700 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 flex-shrink-0">
                  ESC
                </kbd>
              </div>

              {/* Filter tag chips (show when idle) */}
              {showIdle && (
                <div className="px-4 pt-3 pb-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-700 mr-0.5">
                    Lọc:
                  </span>
                  {Object.entries(FILTER_TAGS).map(([tag, cfg]) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setActiveTag(activeTag === tag ? null : tag);
                        inputRef.current?.focus();
                      }}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                        activeTag === tag
                          ? "bg-blue-500/15 border-blue-500/30 text-blue-300"
                          : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400"
                      }`}
                    >
                      <AtSign size={8} />
                      {tag.slice(1)} · {cfg.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Body */}
              <div
                ref={listRef}
                className="max-h-[440px] overflow-y-auto overscroll-contain pb-2"
              >
                {/* Waiting for query after tag */}
                {showTagWait && (
                  <div className="py-10 text-center">
                    <AtSign
                      size={26}
                      className="mx-auto text-blue-500/30 mb-2"
                    />
                    <p className="text-sm font-bold text-slate-500">
                      Lọc:{" "}
                      <span className="text-blue-400">
                        {FILTER_TAGS[effectiveTag!]?.label}
                      </span>
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Gõ từ khoá để tìm...
                    </p>
                  </div>
                )}

                {/* Recent */}
                {showRecent && (
                  <div className="px-3 pt-3">
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock size={10} /> Gần đây
                      </span>
                      <button
                        onClick={() => {
                          clearRecent();
                          setRecent([]);
                        }}
                        className="text-[10px] text-slate-700 hover:text-slate-400 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                    {recent.map((item) => {
                      const cfg = item.category
                        ? DATA_CFG[item.category as DataCategory]
                        : null;
                      const Icon =
                        item.kind === "page" ? Hash : (cfg?.icon ?? Hash);
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.kind === "page" && item.path) {
                              navigate(item.path);
                              onClose();
                            } else setRawQuery(item.title);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left hover:bg-slate-800/50 transition-all group"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0 ${item.kind === "page" ? "bg-slate-800 border-slate-700" : `${cfg?.bg} ${cfg?.border}`}`}
                          >
                            <Icon
                              size={12}
                              className={
                                item.kind === "page"
                                  ? "text-slate-500"
                                  : cfg?.color
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-300 truncate">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[10px] text-slate-600 truncate">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          <ArrowRight
                            size={11}
                            className="text-slate-700 group-hover:text-slate-500 flex-shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Empty */}
                {showEmpty && (
                  <div className="py-12 text-center">
                    <Search size={26} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-sm font-bold text-slate-500">
                      Không tìm thấy kết quả
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Thử từ khoá khác hoặc bỏ filter
                    </p>
                  </div>
                )}

                {/* Page results */}
                {pageResults.length > 0 && (
                  <div className="px-3 pt-3">
                    <div className="flex items-center gap-2 px-2 mb-1.5">
                      <Hash size={9} className="text-slate-600" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Trang
                      </span>
                      <div className="flex-1 h-px bg-slate-800" />
                    </div>
                    {pageResults.map((page) => {
                      const idx = gIdx++;
                      const active = activeIdx === idx;
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.id}
                          data-idx={idx}
                          onClick={() => handleSelect(page)}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? "bg-slate-800/80" : "hover:bg-slate-800/40"}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all ${active ? "bg-slate-700 border-slate-600" : "bg-slate-900 border-slate-800"}`}
                          >
                            <Icon
                              size={14}
                              className={
                                active ? "text-white" : "text-slate-500"
                              }
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white">
                              <Hl text={page.label} q={query} />
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1 flex-wrap">
                              {page.breadcrumb.map((b, i) => (
                                <span
                                  key={i}
                                  className="flex items-center gap-1"
                                >
                                  {i > 0 && (
                                    <span className="text-slate-700">›</span>
                                  )}
                                  <Hl text={b} q={query} />
                                </span>
                              ))}
                            </p>
                          </div>
                          <ArrowRight
                            size={13}
                            className={`flex-shrink-0 transition-all ${active ? "text-slate-400 translate-x-0.5" : "text-slate-700"}`}
                          />
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Data results by category */}
                {(
                  Object.entries(dataByCat) as [DataCategory, DataResult[]][]
                ).map(([cat, items]) => {
                  const cfg = DATA_CFG[cat];
                  const CatIcon = cfg.icon;
                  return (
                    <div key={cat} className="px-3 pt-3">
                      <div className="flex items-center gap-2 px-2 mb-1.5">
                        <CatIcon size={9} className={cfg.color} />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {cat}
                        </span>
                        <div className="flex-1 h-px bg-slate-800" />
                        <span className="text-[9px] text-slate-700">
                          {items.length}
                        </span>
                      </div>
                      {items.map((result) => {
                        const idx = gIdx++;
                        const active = activeIdx === idx;
                        const stCfg = result.status
                          ? STATUS_CFG[result.status]
                          : null;
                        const ResIcon =
                          cat === "Đối tác"
                            ? (PARTNER_ICON[result.raw?.loai as string] ??
                              Package)
                            : cfg.icon;
                        return (
                          <button
                            key={result.id}
                            data-idx={idx}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? "bg-slate-800/80" : "hover:bg-slate-800/40"}`}
                          >
                            {/* Avatar */}
                            <div
                              className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 text-[10px] font-black transition-all ${active ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "bg-slate-900 border-slate-800 text-slate-500"}`}
                            >
                              {result.avatar ? (
                                result.avatar
                              ) : (
                                <ResIcon size={14} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              {/* Title + badge */}
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-white truncate">
                                  <Hl text={result.title} q={query} />
                                </p>
                                {result.badge && (
                                  <span className="text-[10px] font-mono text-slate-600 flex-shrink-0">
                                    {result.badge}
                                  </span>
                                )}
                              </div>
                              {/* Subtitle + status */}
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {result.subtitle && (
                                  <span className="text-[11px] text-slate-500 truncate">
                                    <Hl text={result.subtitle} q={query} />
                                  </span>
                                )}
                                {stCfg && (
                                  <span className="flex items-center gap-1 flex-shrink-0">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${stCfg.dot}`}
                                    />
                                    <span className="text-[10px] text-slate-600">
                                      {stCfg.label}
                                    </span>
                                  </span>
                                )}
                              </div>
                              {/* Phone / email */}
                              {(result.phone || result.email) && (
                                <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                  {[result.phone, result.email]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </p>
                              )}
                            </div>
                            <ArrowRight
                              size={13}
                              className={`flex-shrink-0 transition-all ${active ? "text-slate-400 translate-x-0.5" : "text-slate-700"}`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}

                {/* Idle (no query, no recent) */}
                {showIdle && !showRecent && (
                  <div className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {[LayoutDashboard, User, Users, Building, Handshake].map(
                        (Icon, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center"
                          >
                            <Icon size={13} className="text-slate-500" />
                          </div>
                        ),
                      )}
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                      Tìm kiếm toàn hệ thống
                    </p>
                    <p className="text-xs text-slate-700 mt-1">
                      Trang · Nhân viên · Khách hàng · Đối tác · Nhà phân phối
                    </p>
                    <p className="text-[10px] text-slate-700 mt-2.5 space-x-1">
                      {["@nv", "@kh", "@npp", "@dt", "@trang"].map((t) => (
                        <kbd
                          key={t}
                          className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-slate-500 font-mono"
                        >
                          {t}
                        </kbd>
                      ))}
                      <span className="text-slate-700 ml-1">để lọc nhanh</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {flat.length > 0 && (
                <div className="border-t border-slate-800/80 px-4 py-2 flex items-center gap-4">
                  <div className="flex items-center gap-3 text-[10px] text-slate-600">
                    <span className="flex items-center gap-1">
                      <kbd className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5">
                        <ChevronUp size={9} />
                      </kbd>
                      <kbd className="bg-slate-800 border border-slate-700 rounded px-1 py-0.5">
                        <ChevronDown size={9} />
                      </kbd>
                      Di chuyển
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5">
                        <CornerDownLeft size={9} />
                      </kbd>
                      Mở
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[9px]">
                        ESC
                      </kbd>
                      Đóng
                    </span>
                  </div>
                  <div className="ml-auto text-[10px] text-slate-700">
                    {flat.length} kết quả
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
