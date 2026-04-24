import { useState, useMemo } from "react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from "lucide-react";
import {
  MOCK_SAN_PHAM,
  getMinGia,
  fmt,
  type SanPham,
  type BienThe,
  type POSCartItem,
  POS_CATEGORIES,
  POS_PAGE_SIZE,
} from "../data/shopData";

interface ProductGridProps {
  onAddToCart: (item: Omit<POSCartItem, "soLuong">) => void;
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState("tat-ca");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [selectedSanPham, setSelectedSanPham] = useState<SanPham | null>(null);
  const [selectedBienThe, setSelectedBienThe] = useState<BienThe | null>(null);

  const handleCategory = (id: string) => {
    setActiveCategory(id);
    setPage(1);
  };
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(1);
  };

  // Mở modal chọn biến thể
  const openModal = (p: SanPham) => {
    setSelectedSanPham(p);
    // Tự động chọn biến thể đầu tiên còn hàng
    const defaultBT =
      p.bien_the.find((bt) => (bt.ton_kho ?? 0) > 0) ?? p.bien_the[0];
    setSelectedBienThe(defaultBT);
  };

  const closeModal = () => {
    setSelectedSanPham(null);
    setSelectedBienThe(null);
  };

  const handleConfirmAdd = () => {
    if (!selectedSanPham || !selectedBienThe) return;
    onAddToCart({ sanPham: selectedSanPham, bienThe: selectedBienThe });
    closeModal();
  };

  const filtered = useMemo(
    () =>
      MOCK_SAN_PHAM.filter((p) => {
        const matchCat =
          activeCategory === "tat-ca" || p.loai_sp === activeCategory;
        const q = search.toLowerCase();
        const matchSearch =
          !search ||
          p.ten_sp.toLowerCase().includes(q) ||
          p.ma_sp.toLowerCase().includes(q) ||
          p.barcode.includes(search);
        return matchCat && matchSearch;
      }),
    [activeCategory, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / POS_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * POS_PAGE_SIZE,
    safePage * POS_PAGE_SIZE,
  );

  // Tính dãy số trang hiển thị (tối đa 5, có "..." nếu nhiều)
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((n) => {
      if (totalPages <= 5) return true;
      if (n === 1 || n === totalPages) return true;
      return Math.abs(n - safePage) <= 1;
    })
    .reduce<(number | "...")[]>((acc, n, idx, arr) => {
      if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
      acc.push(n);
      return acc;
    }, []);

  return (
    <div className="flex flex-col h-full" style={{ background: "#f7f3ef" }}>
      {/* ── Search ─────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl"
          style={{ background: "white", border: "1px solid #ede8e3" }}
        >
          <Search size={16} style={{ color: "#c17f44", flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Tìm tên, mã SP, barcode..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent font-medium"
            style={{ color: "#2c1810" }}
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#ede8e3" }}
            >
              <X size={11} style={{ color: "#a89070" }} />
            </button>
          )}
        </div>
      </div>

      {/* ── Category pills ──────────────────────────── */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {POS_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => handleCategory(c.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 active:scale-95 transition-all"
              style={{
                background: activeCategory === c.id ? "#c17f44" : "white",
                color: activeCategory === c.id ? "white" : "#a89070",
                border: `1px solid ${activeCategory === c.id ? "#c17f44" : "#ede8e3"}`,
                boxShadow:
                  activeCategory === c.id
                    ? "0 2px 10px rgba(193,127,68,0.3)"
                    : "none",
              }}
            >
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid — flex-1, KHÔNG scroll ────── */}
      <div className="flex-1 px-4 min-h-0 overflow-hidden">
        {pageItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <span className="text-4xl opacity-30">🔍</span>
            <p className="text-sm font-semibold" style={{ color: "#c4b49e" }}>
              Không tìm thấy sản phẩm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 content-start">
            {pageItems.map((p) => {
              const gia = getMinGia(p);
              const giaGoc =
                p.giam_gia > 0
                  ? Math.round(gia / (1 - p.giam_gia / 100))
                  : null;
              return (
                <button
                  key={p.id}
                  onPointerDown={() => openModal(p)}
                  className="text-left rounded-2xl overflow-hidden active:scale-95 transition-all hover:shadow-md"
                  style={{ background: "white", border: "1px solid #ede8e3" }}
                >
                  {/* Ảnh */}
                  <div
                    className="relative overflow-hidden"
                    style={{ height: 110 }}
                  >
                    <div
                      className="w-full h-full transition-transform duration-200 hover:scale-105"
                      style={{ background: `url(${p.anh}) center/cover` }}
                    />
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.is_hot && (
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                          style={{ background: "#e74c3c", color: "white" }}
                        >
                          HOT
                        </span>
                      )}
                      {p.is_new && (
                        <span
                          className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full"
                          style={{ background: "#9b59b6", color: "white" }}
                        >
                          NEW
                        </span>
                      )}
                    </div>
                    {p.giam_gia > 0 && (
                      <span
                        className="absolute top-2 right-2 text-[9px] font-black px-1.5 py-0.5 rounded-full"
                        style={{ background: "#e74c3c", color: "white" }}
                      >
                        -{p.giam_gia}%
                      </span>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(193,127,68,0.85)" }}
                    >
                      <span className="text-white font-black text-sm">
                        + Thêm
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p
                      className="text-xs font-bold line-clamp-1 leading-tight mb-0.5"
                      style={{ color: "#2c1810" }}
                    >
                      {p.ten_sp}
                    </p>
                    {giaGoc && (
                      <p
                        className="text-[10px] line-through"
                        style={{ color: "#c4b49e" }}
                      >
                        {fmt(giaGoc)}
                      </p>
                    )}
                    <p
                      className="text-sm font-black"
                      style={{ color: "#c17f44" }}
                    >
                      {fmt(gia)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 py-3 mt-2"
        style={{ borderTop: "1px solid #ede8e3", background: "white" }}
      >
        <p className="text-xs" style={{ color: "#a89070" }}>
          <span className="font-black" style={{ color: "#2c1810" }}>
            {filtered.length}
          </span>{" "}
          SP · Trang{" "}
          <span className="font-black" style={{ color: "#2c1810" }}>
            {safePage}
          </span>
          /{totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
            style={{ background: "#faf3ea", border: "1px solid #ede8e3" }}
          >
            <ChevronLeft size={16} style={{ color: "#5c3317" }} />
          </button>
          {pageNumbers.map((n, i) =>
            n === "..." ? (
              <span
                key={`dot-${i}`}
                className="w-7 text-center text-xs"
                style={{ color: "#a89070" }}
              >
                ···
              </span>
            ) : (
              <button
                key={n}
                onClick={() => setPage(n as number)}
                className="w-9 h-9 rounded-xl text-xs font-black active:scale-90 transition-all"
                style={{
                  background: safePage === n ? "#c17f44" : "#faf3ea",
                  color: safePage === n ? "white" : "#5c3317",
                  border: `1px solid ${safePage === n ? "#c17f44" : "#ede8e3"}`,
                  boxShadow:
                    safePage === n ? "0 2px 8px rgba(193,127,68,0.4)" : "none",
                }}
              >
                {n}
              </button>
            ),
          )}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 transition-all disabled:opacity-30"
            style={{ background: "#faf3ea", border: "1px solid #ede8e3" }}
          >
            <ChevronRight size={16} style={{ color: "#5c3317" }} />
          </button>
        </div>
      </div>

      {/* ── Modal chọn biến thể ──────────────────────── */}
      {selectedSanPham && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(44,24,16,0.55)",
            backdropFilter: "blur(3px)",
          }}
          onPointerDown={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "white" }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div
              className="flex items-center gap-3 p-4"
              style={{
                background: "#faf3ea",
                borderBottom: "1px solid #ede8e3",
              }}
            >
              {/* Ảnh biến thể đang chọn */}
              <div
                className="w-16 h-16 rounded-2xl flex-shrink-0"
                style={{
                  background: `url(${selectedBienThe?.anh || selectedSanPham.anh}) center/cover`,
                  border: "1px solid #ede8e3",
                }}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-black line-clamp-2 leading-tight"
                  style={{ color: "#2c1810" }}
                >
                  {selectedSanPham.ten_sp}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#a89070" }}>
                  {selectedSanPham.ma_sp} · {selectedSanPham.don_vi_tinh}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p
                    className="text-base font-black"
                    style={{ color: "#c17f44" }}
                  >
                    {selectedBienThe ? fmt(selectedBienThe.gia_ban_thuc) : "—"}
                  </p>
                  {selectedBienThe &&
                    selectedBienThe.gia_ban_goc >
                      selectedBienThe.gia_ban_thuc && (
                      <p
                        className="text-xs line-through"
                        style={{ color: "#c4b49e" }}
                      >
                        {fmt(selectedBienThe.gia_ban_goc)}
                      </p>
                    )}
                </div>
              </div>
              <button
                onPointerDown={closeModal}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 self-start"
                style={{ background: "#ede8e3" }}
              >
                <X size={14} style={{ color: "#2c1810" }} />
              </button>
            </div>

            {/* Body modal — chọn màu + size */}
            <div className="p-4 flex flex-col gap-4">
              {/* Nhóm theo màu */}
              {(() => {
                const mauList = [
                  ...new Set(selectedSanPham.bien_the.map((bt) => bt.mau_sac)),
                ];
                const selectedMau = selectedBienThe?.mau_sac ?? mauList[0];

                return (
                  <>
                    {/* Chọn màu */}
                    <div>
                      <p
                        className="text-xs font-black mb-2"
                        style={{ color: "#a89070" }}
                      >
                        MÀU SẮC
                        {selectedBienThe && (
                          <span
                            className="ml-1 font-bold normal-case"
                            style={{ color: "#2c1810" }}
                          >
                            — {selectedBienThe.mau_sac}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {mauList.map((mau) => {
                          const isSelected = selectedBienThe?.mau_sac === mau;
                          const available = selectedSanPham.bien_the.some(
                            (bt) => bt.mau_sac === mau && (bt.ton_kho ?? 0) > 0,
                          );
                          return (
                            <button
                              key={mau}
                              onPointerDown={() => {
                                // Khi đổi màu, tự chọn size đầu tiên còn hàng của màu đó
                                const bt =
                                  selectedSanPham.bien_the.find(
                                    (b) =>
                                      b.mau_sac === mau && (b.ton_kho ?? 0) > 0,
                                  ) ??
                                  selectedSanPham.bien_the.find(
                                    (b) => b.mau_sac === mau,
                                  );
                                if (bt) setSelectedBienThe(bt);
                              }}
                              disabled={!available}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-35"
                              style={{
                                background: isSelected ? "#c17f44" : "#faf3ea",
                                color: isSelected ? "white" : "#5c3317",
                                border: `1px solid ${isSelected ? "#c17f44" : "#ede8e3"}`,
                                boxShadow: isSelected
                                  ? "0 2px 8px rgba(193,127,68,0.35)"
                                  : "none",
                              }}
                            >
                              {mau}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chọn size — chỉ hiện size của màu đang chọn */}
                    <div>
                      <p
                        className="text-xs font-black mb-2"
                        style={{ color: "#a89070" }}
                      >
                        KÍCH THƯỚC
                        {selectedBienThe && (
                          <span
                            className="ml-1 font-bold normal-case"
                            style={{ color: "#2c1810" }}
                          >
                            — {selectedBienThe.kich_thuoc}
                          </span>
                        )}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedSanPham.bien_the
                          .filter((bt) => bt.mau_sac === selectedMau)
                          .map((bt) => {
                            const isSelected = selectedBienThe?.id === bt.id;
                            const outOfStock = (bt.ton_kho ?? 0) === 0;
                            return (
                              <button
                                key={bt.id}
                                onPointerDown={() =>
                                  !outOfStock && setSelectedBienThe(bt)
                                }
                                disabled={outOfStock}
                                className="relative w-14 h-10 rounded-xl text-xs font-black transition-all active:scale-95 disabled:opacity-35"
                                style={{
                                  background: isSelected
                                    ? "#2c1810"
                                    : "#faf3ea",
                                  color: isSelected ? "white" : "#5c3317",
                                  border: `1px solid ${isSelected ? "#2c1810" : "#ede8e3"}`,
                                }}
                              >
                                {bt.kich_thuoc}
                                {outOfStock && (
                                  <span
                                    className="absolute inset-0 flex items-center justify-center rounded-xl text-[9px] font-black"
                                    style={{
                                      background: "rgba(255,255,255,0.7)",
                                      color: "#e74c3c",
                                    }}
                                  >
                                    Hết
                                  </span>
                                )}
                              </button>
                            );
                          })}
                      </div>
                    </div>

                    {/* Tồn kho */}
                    {selectedBienThe && (
                      <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{
                          background:
                            (selectedBienThe.ton_kho ?? 0) > 10
                              ? "#eafaf1"
                              : "#fef9e7",
                          border: `1px solid ${(selectedBienThe.ton_kho ?? 0) > 10 ? "#a8e6c4" : "#f9e4a0"}`,
                        }}
                      >
                        <span
                          className="text-xs font-bold"
                          style={{
                            color:
                              (selectedBienThe.ton_kho ?? 0) > 10
                                ? "#1a7a45"
                                : "#b7770d",
                          }}
                        >
                          Tồn kho:
                        </span>
                        <span
                          className="text-sm font-black"
                          style={{
                            color:
                              (selectedBienThe.ton_kho ?? 0) > 10
                                ? "#1a7a45"
                                : "#b7770d",
                          }}
                        >
                          {selectedBienThe.ton_kho ?? 99}{" "}
                          {selectedSanPham.don_vi_tinh}
                        </span>
                        {(selectedBienThe.ton_kho ?? 99) <= 10 && (
                          <span
                            className="text-[10px] font-bold ml-auto"
                            style={{ color: "#e74c3c" }}
                          >
                            Sắp hết hàng!
                          </span>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Nút thêm vào giỏ */}
              <button
                onPointerDown={handleConfirmAdd}
                disabled={
                  !selectedBienThe || (selectedBienThe.ton_kho ?? 0) === 0
                }
                className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-40"
                style={{
                  background:
                    "linear-gradient(135deg, #c17f44 0%, #e09550 100%)",
                  color: "white",
                  boxShadow: "0 4px 16px rgba(193,127,68,0.4)",
                }}
              >
                <ShoppingCart size={16} />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
