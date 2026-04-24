import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building,
  Package,
  Wrench,
  Palette,
  Users,
  Plus,
  Search,
  RefreshCw,
  Filter,
} from "lucide-react";
import { NhaPhanPhoiCard } from "../../../components/NhaPhanPhoi/NhaPhanPhoiCard";
import { NhaPhanPhoiDetail } from "../../../components/NhaPhanPhoi/NhaPhanPhoiDetail";
import { NhaPhanPhoiModal } from "../../../components/NhaPhanPhoi/NhaPhanPhoiModal";
import { DoiTacCard } from "../../../components/DoiTac/DoiTacCard";
import { DoiTacDetail } from "../../../components/DoiTac/DoiTacDetail";
import { DoiTacModal } from "../../../components/DoiTac/DoiTacModal";
import type {
  NhaPhanPhoi,
  NhaPhanPhoiFormData,
} from "../../../components/NhaPhanPhoi/types";
import type {
  DoiTac,
  DoiTacFormData,
  LoaiDoiTac,
} from "../../../components/DoiTac/types";

// ── Auth helper ───────────────────────────────────────────
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const hasAnyPerm = (perms: string[], keys: string[]) =>
  perms.includes("all") || keys.some((k) => perms.includes(k));

// ── Tab type ──────────────────────────────────────────────
type ActiveTab = "nhaPhanPhoi" | "doiTac";

// ── Stat card ─────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
    >
      <Icon size={18} />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────
const DoiTacvaNhaPhanPhoiPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const user = getCurrentUser();
  const perms: string[] = (() => {
    try {
      return JSON.parse(user?.permissions || "[]");
    } catch {
      return [];
    }
  })();
  const isAdmin = ["admin", "Admin"].includes(user?.role ?? "");

  const canManageNPP = isAdmin || hasAnyPerm(perms, ["manage_distributors"]);
  const canEditNPP = canManageNPP || hasAnyPerm(perms, ["edit_distributors"]);
  const canManageDT = isAdmin || hasAnyPerm(perms, ["manage_partners"]);
  const canEditDT = canManageDT || hasAnyPerm(perms, ["edit_partners"]);

  const [activeTab, setActiveTab] = useState<ActiveTab>("nhaPhanPhoi");

  // ── NPP State ──
  const [nppList, setNppList] = useState<NhaPhanPhoi[]>([]);
  const [nppLoading, setNppLoading] = useState(true);
  const [nppSearch, setNppSearch] = useState("");
  const [nppFilterTrangThai, setNppFilterTrangThai] = useState("");
  const [viewNPP, setViewNPP] = useState<NhaPhanPhoi | null>(null);
  const [editNPP, setEditNPP] = useState<NhaPhanPhoi | null>(null);
  const [nppModalOpen, setNppModalOpen] = useState(false);

  // ── DoiTac State ──
  const [dtList, setDtList] = useState<DoiTac[]>([]);
  const [dtLoading, setDtLoading] = useState(true);
  const [dtSearch, setDtSearch] = useState("");
  const [dtFilterLoai, setDtFilterLoai] = useState<LoaiDoiTac | "">("");
  const [dtFilterTrangThai, setDtFilterTrangThai] = useState("");
  const [viewDT, setViewDT] = useState<DoiTac | null>(null);
  const [editDT, setEditDT] = useState<DoiTac | null>(null);
  const [dtModalOpen, setDtModalOpen] = useState(false);

  // ── Fetch NPP ──
  const fetchNPP = useCallback(async () => {
    setNppLoading(true);
    try {
      const params = new URLSearchParams();
      if (nppFilterTrangThai) params.set("trangThai", nppFilterTrangThai);
      if (nppSearch.trim()) params.set("q", nppSearch.trim());
      const res = await fetch(`${apiUrl}/service/nhaphanphoi?${params}`, {
        cache: "no-store",
      });
      setNppList(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setNppLoading(false);
    }
  }, [apiUrl, nppFilterTrangThai, nppSearch]);

  // ── Fetch DoiTac ──
  const fetchDT = useCallback(async () => {
    setDtLoading(true);
    try {
      const params = new URLSearchParams();
      if (dtFilterLoai) params.set("loai", dtFilterLoai);
      if (dtFilterTrangThai) params.set("trangThai", dtFilterTrangThai);
      if (dtSearch.trim()) params.set("q", dtSearch.trim());
      const res = await fetch(`${apiUrl}/service/doitac?${params}`, {
        cache: "no-store",
      });
      setDtList(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setDtLoading(false);
    }
  }, [apiUrl, dtFilterLoai, dtFilterTrangThai, dtSearch]);

  useEffect(() => {
    const t = setTimeout(fetchNPP, nppSearch ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchNPP, nppSearch]);

  useEffect(() => {
    const t = setTimeout(fetchDT, dtSearch ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchDT, dtSearch]);

  // ── NPP CRUD ──
  const handleSaveNPP = async (data: NhaPhanPhoiFormData) => {
    if (editNPP) {
      await fetch(`${apiUrl}/service/nhaphanphoi/${editNPP.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(`${apiUrl}/service/nhaphanphoi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditNPP(null);
    fetchNPP();
  };

  const handleDeleteNPP = async (id: number) => {
    if (!confirm("Xóa nhà phân phối này?")) return;
    await fetch(`${apiUrl}/service/nhaphanphoi/${id}`, { method: "DELETE" });
    fetchNPP();
  };

  const handleToggleNPP = async (npp: NhaPhanPhoi) => {
    const next = npp.trangThai === "active" ? "tamNgung" : "active";
    await fetch(`${apiUrl}/service/nhaphanphoi/${npp.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: next }),
    });
    fetchNPP();
  };

  // ── DoiTac CRUD ──
  const handleSaveDT = async (data: DoiTacFormData) => {
    if (editDT) {
      await fetch(`${apiUrl}/service/doitac/${editDT.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(`${apiUrl}/service/doitac`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditDT(null);
    fetchDT();
  };

  const handleDeleteDT = async (id: number) => {
    if (!confirm("Xóa đối tác này?")) return;
    await fetch(`${apiUrl}/service/doitac/${id}`, { method: "DELETE" });
    fetchDT();
  };

  const handleToggleDT = async (dt: DoiTac) => {
    const next = dt.trangThai === "active" ? "inactive" : "active";
    await fetch(`${apiUrl}/service/doitac/${dt.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trangThai: next }),
    });
    fetchDT();
  };

  // ── Stats ──
  const nppActive = nppList.filter((n) => n.trangThai === "active").length;
  const dtCU = dtList.filter((d) => d.loai === "CungUng").length;
  const dtGC = dtList.filter((d) => d.loai === "GiaCong").length;
  const dtTK = dtList.filter((d) => d.loai === "ThietKe").length;

  const dtLoaiOptions: {
    value: LoaiDoiTac | "";
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "", label: "Tất cả", icon: Users },
    { value: "CungUng", label: "Cung ứng", icon: Package },
    { value: "GiaCong", label: "Gia công", icon: Wrench },
    { value: "ThietKe", label: "Thiết kế", icon: Palette },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Building size={22} className="text-indigo-400" />
            Nhà phân phối & Đối tác
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý nhà phân phối và đối tác cung ứng, gia công, thiết kế
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("nhaPhanPhoi")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "nhaPhanPhoi"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Building size={13} /> Nhà phân phối
            </button>
            <button
              onClick={() => setActiveTab("doiTac")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === "doiTac"
                  ? "bg-violet-600 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Users size={13} /> Đối tác
            </button>
          </div>
        </div>
      </div>

      {/* ═══ NHÀ PHÂN PHỐI ═══ */}
      <AnimatePresence mode="wait">
        {activeTab === "nhaPhanPhoi" && (
          <motion.div
            key="npp"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Tổng nhà PP"
                value={nppList.length}
                icon={Building}
                color="bg-slate-800 text-slate-300"
              />
              <StatCard
                label="Đang hoạt động"
                value={nppActive}
                icon={Building}
                color="bg-indigo-500/10 text-indigo-400"
              />
              <StatCard
                label="Tạm ngưng"
                value={nppList.filter((n) => n.trangThai === "tamNgung").length}
                icon={Building}
                color="bg-amber-500/10 text-amber-400"
              />
              <StatCard
                label="Kết thúc"
                value={nppList.filter((n) => n.trangThai === "ketThuc").length}
                icon={Building}
                color="bg-slate-700 text-slate-500"
              />
            </div>

            {/* Filters + Add */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={nppSearch}
                  onChange={(e) => setNppSearch(e.target.value)}
                  placeholder="Tìm tên, mã nhà phân phối..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-indigo-500/60 transition-all"
                />
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Filter size={12} className="text-slate-500" />
                {["", "active", "tamNgung", "ketThuc"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setNppFilterTrangThai(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      nppFilterTrangThai === v
                        ? "bg-slate-700 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {v === ""
                      ? "Tất cả"
                      : v === "active"
                        ? "Đang HĐ"
                        : v === "tamNgung"
                          ? "Tạm ngưng"
                          : "Kết thúc"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => fetchNPP()}
                className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                <RefreshCw size={14} />
              </button>
              {canManageNPP && (
                <button
                  onClick={() => {
                    setEditNPP(null);
                    setNppModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Plus size={14} /> Thêm nhà PP
                </button>
              )}
            </div>

            {/* List */}
            {nppLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw size={24} className="text-slate-600 animate-spin" />
              </div>
            ) : nppList.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <Building size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có nhà phân phối nào</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {nppList.map((npp) => (
                    <motion.div
                      key={npp.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <NhaPhanPhoiCard
                        npp={npp}
                        canEdit={canEditNPP}
                        onView={() => setViewNPP(npp)}
                        onEdit={() => {
                          setEditNPP(npp);
                          setNppModalOpen(true);
                        }}
                        onDelete={() => handleDeleteNPP(npp.id)}
                        onToggleStatus={() => handleToggleNPP(npp)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        )}

        {/* ═══ ĐỐI TÁC ═══ */}
        {activeTab === "doiTac" && (
          <motion.div
            key="dt"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard
                label="Tổng đối tác"
                value={dtList.length}
                icon={Users}
                color="bg-slate-800 text-slate-300"
              />
              <StatCard
                label="Cung ứng NPL"
                value={dtCU}
                icon={Package}
                color="bg-orange-500/10 text-orange-400"
              />
              <StatCard
                label="Gia công"
                value={dtGC}
                icon={Wrench}
                color="bg-cyan-500/10 text-cyan-400"
              />
              <StatCard
                label="Thiết kế"
                value={dtTK}
                icon={Palette}
                color="bg-pink-500/10 text-pink-400"
              />
            </div>

            {/* Filters + Add */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 flex-shrink-0">
                {dtLoaiOptions.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setDtFilterLoai(value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dtFilterLoai === value
                        ? "bg-slate-700 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Icon size={12} />
                    <span className="hidden sm:block">{label}</span>
                  </button>
                ))}
              </div>

              <div className="relative flex-1 min-w-[200px]">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  value={dtSearch}
                  onChange={(e) => setDtSearch(e.target.value)}
                  placeholder="Tìm tên, mã đối tác..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Filter size={12} className="text-slate-500" />
                {["", "active", "inactive"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setDtFilterTrangThai(v)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      dtFilterTrangThai === v
                        ? "bg-slate-700 text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {v === ""
                      ? "Tất cả"
                      : v === "active"
                        ? "Hoạt động"
                        : "Ngừng"}
                  </button>
                ))}
              </div>

              <button
                onClick={() => fetchDT()}
                className="p-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
              >
                <RefreshCw size={14} />
              </button>
              {canManageDT && (
                <button
                  onClick={() => {
                    setEditDT(null);
                    setDtModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
                >
                  <Plus size={14} /> Thêm đối tác
                </button>
              )}
            </div>

            {/* List */}
            {dtLoading ? (
              <div className="flex justify-center py-20">
                <RefreshCw size={24} className="text-slate-600 animate-spin" />
              </div>
            ) : dtList.length === 0 ? (
              <div className="text-center py-20 text-slate-600">
                <Users size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Chưa có đối tác nào</p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {dtList.map((dt) => (
                    <motion.div
                      key={dt.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <DoiTacCard
                        dt={dt}
                        canEdit={canEditDT}
                        onView={() => setViewDT(dt)}
                        onEdit={() => {
                          setEditDT(dt);
                          setDtModalOpen(true);
                        }}
                        onDelete={() => handleDeleteDT(dt.id)}
                        onToggleStatus={() => handleToggleDT(dt)}
                      />
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modals ── */}
      <AnimatePresence>
        {viewNPP && (
          <NhaPhanPhoiDetail npp={viewNPP} onClose={() => setViewNPP(null)} />
        )}
        {viewDT && <DoiTacDetail dt={viewDT} onClose={() => setViewDT(null)} />}
      </AnimatePresence>

      <NhaPhanPhoiModal
        key={editNPP?.id ?? "new-npp"}
        isOpen={nppModalOpen}
        onClose={() => {
          setNppModalOpen(false);
          setEditNPP(null);
        }}
        editNPP={editNPP}
        onSave={handleSaveNPP}
      />

      <DoiTacModal
        key={editDT?.id ?? "new-dt"}
        isOpen={dtModalOpen}
        onClose={() => {
          setDtModalOpen(false);
          setEditDT(null);
        }}
        editDT={editDT}
        onSave={handleSaveDT}
      />
    </div>
  );
};

export default DoiTacvaNhaPhanPhoiPage;
