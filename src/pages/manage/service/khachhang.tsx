import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Building2,
  Shirt,
  User,
  Filter,
} from "lucide-react";
import { KhachHangCard } from "../../../components/KhachHang/KhachHangCard";
import { KhachHangDetail } from "../../../components/KhachHang/KhachHangDetail";
import { KhachHangModal } from "../../../components/KhachHang/KhachHangModal";
import type {
  KhachHang,
  KhachHangFormData,
  LoaiKH,
} from "../../../components/KhachHang/types";
import {
  SkeletonGrid,
  SkeletonStatRow,
} from "../../../components/SkeletonCard";

// ── Auth helper ───────────────────────────────────────────
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// ── Stat Card ─────────────────────────────────────────────
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
const KhachHangPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const user = getCurrentUser();
  const canManage =
    ["admin", "Admin"].includes(user?.role ?? "") ||
    (() => {
      try {
        const perms: string[] = JSON.parse(user?.permissions || "[]");
        return perms.includes("manage_customers") || perms.includes("all");
      } catch {
        return false;
      }
    })();
  const canEdit =
    canManage ||
    (() => {
      try {
        const perms: string[] = JSON.parse(user?.permissions || "[]");
        return perms.includes("edit_customers");
      } catch {
        return false;
      }
    })();

  const [list, setList] = useState<KhachHang[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState<LoaiKH | "">("");
  const [filterTrangThai, setFilterTrangThai] = useState<
    "" | "active" | "inactive"
  >("");

  const [viewKH, setViewKH] = useState<KhachHang | null>(null);
  const [editKH, setEditKH] = useState<KhachHang | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterLoai) params.set("loai", filterLoai);
      if (filterTrangThai) params.set("trangThai", filterTrangThai);
      if (search.trim()) params.set("q", search.trim());
      const res = await fetch(`${apiUrl}/service/khachhang?${params}`, {
        cache: "no-store",
      });
      setList(await res.json());
    } catch (e) {
      console.error("Lỗi tải khách hàng:", e);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, filterLoai, filterTrangThai, search]);

  useEffect(() => {
    const t = setTimeout(fetchData, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [fetchData, search]);

  const handleSave = async (data: KhachHangFormData) => {
    if (editKH) {
      await fetch(`${apiUrl}/service/khachhang/${editKH.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch(`${apiUrl}/service/khachhang`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }
    setEditKH(null);
    fetchData();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa khách hàng này?")) return;
    await fetch(`${apiUrl}/service/khachhang/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleToggleStatus = async (kh: KhachHang) => {
    await fetch(`${apiUrl}/service/khachhang/${kh.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trangThai: kh.trangThai === "active" ? "inactive" : "active",
      }),
    });
    fetchData();
  };

  // Stats
  const total = list.length;
  const b2bCount = list.filter((k) => k.loai === "B2B").length;
  const ttCount = list.filter((k) => k.loai === "ThoiTrang").length;
  const cnCount = list.filter((k) => k.loai === "CaNhan").length;

  const filterLoaiOptions: {
    value: LoaiKH | "";
    label: string;
    icon: React.ElementType;
  }[] = [
    { value: "", label: "Tất cả", icon: Users },
    { value: "B2B", label: "Doanh nghiệp", icon: Building2 },
    { value: "ThoiTrang", label: "Thời trang", icon: Shirt },
    { value: "CaNhan", label: "Cá nhân", icon: User },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
            <Users size={22} className="text-violet-400" />
            Quản lý Khách hàng
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách khách hàng doanh nghiệp, thời trang và cá nhân
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-xl text-sm font-semibold transition-all hover:bg-slate-700"
          >
            <RefreshCw size={14} />
          </button>
          {canManage && (
            <button
              onClick={() => {
                setEditKH(null);
                setModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-500 transition-all shadow-lg shadow-violet-600/20"
            >
              <Plus size={14} />
              Thêm khách hàng
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Tổng khách hàng"
          value={total}
          icon={Users}
          color="bg-slate-800 text-slate-300"
        />
        <StatCard
          label="Doanh nghiệp"
          value={b2bCount}
          icon={Building2}
          color="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="Thời trang"
          value={ttCount}
          icon={Shirt}
          color="bg-violet-500/10 text-violet-400"
        />
        <StatCard
          label="Cá nhân"
          value={cnCount}
          icon={User}
          color="bg-emerald-500/10 text-emerald-400"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {/* Trái: Filter loại */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 flex-shrink-0">
          {filterLoaiOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilterLoai(value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterLoai === value
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <Icon size={12} />
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Giữa: Search */}
        <div className="relative flex-1">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên, mã khách hàng..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-violet-500/60 transition-all"
          />
        </div>

        {/* Phải: Filter trạng thái */}
        <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
          <Filter size={12} className="text-slate-500" />
          {["", "active", "inactive"].map((v) => (
            <button
              key={v}
              onClick={() => setFilterTrangThai(v as typeof filterTrangThai)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterTrangThai === v
                  ? "bg-slate-700 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v === "" ? "Tất cả" : v === "active" ? "Đang hợp tác" : "Ngừng"}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-6">
          <SkeletonStatRow count={4} />
          <SkeletonGrid count={6} />
        </div>
      ) : list.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <Users size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Chưa có khách hàng nào</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((kh) => (
              <motion.div
                key={kh.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <KhachHangCard
                  kh={kh}
                  canEdit={canEdit}
                  onView={() => setViewKH(kh)}
                  onEdit={() => {
                    setEditKH(kh);
                    setModalOpen(true);
                  }}
                  onDelete={() => handleDelete(kh.id)}
                  onToggleStatus={() => handleToggleStatus(kh)}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {viewKH && (
          <KhachHangDetail kh={viewKH} onClose={() => setViewKH(null)} />
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <KhachHangModal
        key={editKH?.id ?? "new"}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditKH(null);
        }}
        editKH={editKH}
        onSave={handleSave}
      />
    </div>
  );
};

export default KhachHangPage;
