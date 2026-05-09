// ─────────────────────────────────────────────────────────────────────────────
// ButtonTaoPR.tsx — Nút + Modal "Tạo yêu cầu mua thêm" cho KhoDashboard
// Chỉ cần import và đặt vào Dashboard là dùng được
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { ShoppingCart, X, Search, AlertCircle, Check } from "lucide-react";
import { layTonKho } from "./ServiceLayer2/inventoryService";
import type { TonKhoRecord } from "./data/inventoryTypes";
// ─── Types ────────────────────────────────────────────────────────────────────

type LyDo =
  | "duoi_muc_an_toan"
  | "hang_hong_trong_kho"
  | "du_tru_su_kien";

const LY_DO_OPTIONS: { value: LyDo; label: string; icon: string }[] = [
  { value: "duoi_muc_an_toan",  label: "Dưới mức an toàn",               icon: "📉" },
  { value: "hang_hong_trong_kho", label: "Hàng bị lỗi / hư hỏng trong kho", icon: "⚠️" },
  { value: "du_tru_su_kien",    label: "Dự trữ cho sự kiện lớn",          icon: "🎯" },
];

interface PurchaseRequest {
  id:          string;
  ma_sku:      string;
  ten_sp:      string;
  ton_kho:     number;
  so_luong_yc: number;
  ly_do:       LyDo;
  ghi_chu:     string;
  ngay_tao:    string;
  trang_thai:  "cho_duyet" | "da_duyet" | "tu_choi";
}

// Mock lưu tạm các PR đã tạo
const MOCK_PR_LIST: PurchaseRequest[] = [];

// ─── Modal Tạo PR ─────────────────────────────────────────────────────────────

function ModalTaoPR({ onClose }: { onClose: () => void }) {
  const [search,      setSearch]     = useState("");
  const [sel_sku,     setSelSku]     = useState<TonKhoRecord>();
  const [ton_kho,     setTonKho] = useState<TonKhoRecord[]>([])
  const [so_luong,    setSoLuong]    = useState(100);
  const [ly_do,       setLyDo]       = useState<LyDo>("duoi_muc_an_toan");
  const [ghi_chu,     setGhiChu]     = useState("");
  const [show_search, setShowSearch] = useState(false);
  const [submitted,   setSubmitted]  = useState(false);
  const [loi,         setLoi]        = useState("");

  useEffect(() => {
    layTonKho().then(setTonKho);
  }, []);
  console.log(sel_sku);

  
  const filtered = ton_kho.filter(t =>
    t.ma_sku.toLowerCase().includes(search.toLowerCase()) ||
    t.ten_sp.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const handle_submit = () => {
    if (!sel_sku)     { setLoi("Chưa chọn sản phẩm"); return; }
    if (so_luong <= 0) { setLoi("Số lượng phải lớn hơn 0"); return; }

    const pr: PurchaseRequest = {
      id:          `PR-${Date.now()}`,
      ma_sku:      sel_sku.ma_sku,
      ten_sp:      sel_sku.ten_sp,
      ton_kho:     sel_sku.so_luong,
      so_luong_yc: so_luong,
      ly_do,
      ghi_chu:     ghi_chu.trim(),
      ngay_tao:    new Date().toISOString(),
      trang_thai:  "cho_duyet",
    };
    MOCK_PR_LIST.unshift(pr);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}>
      <div
        className="flex flex-col rounded-2xl overflow-hidden w-[480px]"
        style={{ background: "#0a1628", border: "1px solid #1e293b", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "#0c435425" }}>
              <ShoppingCart size={15} style={{ color: "#38bdf8" }} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Tạo yêu cầu mua thêm</h3>
              <p className="text-[10px]" style={{ color: "#475569" }}>
                Gửi cho bộ phận thu mua xử lý
              </p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: "#1e293b", color: "#64748b" }}>
            <X size={13} />
          </button>
        </div>

        {submitted ? (
          /* ── Màn hình thành công ── */
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "#06472520" }}>
              <Check size={24} style={{ color: "#10b981" }} />
            </div>
            <p className="text-base font-black text-white mb-1">Đã gửi yêu cầu!</p>
            <p className="text-xs text-center mb-2" style={{ color: "#64748b" }}>
              Bộ phận thu mua sẽ nhận được yêu cầu và xử lý sớm nhất
            </p>
            <div className="px-4 py-3 rounded-xl w-full mb-6"
              style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                  {sel_sku?.ma_sku}
                </code>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                  style={{ background: "#f59e0b20", color: "#f59e0b" }}>
                  Chờ duyệt
                </span>
              </div>
              <p className="text-xs text-white">{sel_sku?.ten_sp}</p>
              <p className="text-[10px] mt-1" style={{ color: "#475569" }}>
                Yêu cầu thêm <span className="font-black text-white">{so_luong} cái</span>
                {" · "}
                {LY_DO_OPTIONS.find(l => l.value === ly_do)?.label}
              </p>
            </div>
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              Đóng
            </button>
          </div>
        ) : (
          /* ── Form nhập ── */
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
            style={{ scrollbarWidth: "thin" }}>

            {/* Chọn sản phẩm */}
            <div>
              <label className="text-[10px] font-black uppercase mb-2 block"
                style={{ color: "#475569" }}>
                Sản phẩm / SKU *
              </label>
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer"
                  style={{ background: "#1e293b", border: `1px solid ${sel_sku ? "#38bdf840" : "#334155"}` }}
                  onClick={() => setShowSearch(v => !v)}>
                  <Search size={12} style={{ color: "#475569", flexShrink: 0 }} />
                  {sel_sku ? (
                    <div className="flex-1 min-w-0">
                      <code className="text-xs font-black" style={{ color: "#38bdf8" }}>
                        {sel_sku.ma_sku}
                      </code>
                      <p className="text-[10px] truncate" style={{ color: "#64748b" }}>
                        {sel_sku.ten_sp}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs flex-1" style={{ color: "#475569" }}>
                      Gõ mã SKU hoặc tên sản phẩm...
                    </span>
                  )}
                  {sel_sku && (
                    <button onClick={e => { e.stopPropagation(); setSelSku(undefined); setSearch(""); }}
                      style={{ color: "#475569" }}>
                      <X size={12} />
                    </button>
                  )}
                </div>

                {show_search && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-20 rounded-xl overflow-hidden shadow-2xl"
                    style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                    <div className="px-3 py-2 border-b" style={{ borderColor: "#1e293b" }}>
                      <input value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm SKU..."
                        autoFocus
                        className="w-full text-xs outline-none"
                        style={{ background: "transparent", color: "white" }} />
                    </div>
                    <div className="max-h-48 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                      {filtered.length === 0 ? (
                        <p className="text-xs text-center py-4" style={{ color: "#475569" }}>
                          Không tìm thấy
                        </p>
                      ) : filtered.map(t => (
                        <button key={t.node_id + t.ma_sku}
                          onClick={() => { setSelSku(t); setSearch(""); setShowSearch(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/60 transition-colors">
                          <div className="flex-1 min-w-0">
                            <code className="text-xs font-black" style={{ color: "#94a3b8" }}>
                              {t.ma_sku}
                            </code>
                            <p className="text-[10px] truncate" style={{ color: "#475569" }}>
                              {t.ten_sp}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-black"
                              style={{ color: t.so_luong === 0 ? "#ef4444" : t.so_luong < t.dinh_muc_min ? "#f97316" : "#10b981" }}>
                              {t.so_luong}
                            </p>
                            <p className="text-[9px]" style={{ color: "#334155" }}>tồn kho</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Hiện tồn kho hiện tại */}
              {sel_sku && (
                <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl"
                  style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: sel_sku.so_luong === 0 ? "#ef4444" : sel_sku.so_luong < sel_sku.dinh_muc_min ? "#f97316" : "#10b981" }} />
                  <p className="text-xs" style={{ color: "#64748b" }}>
                    Tồn kho hiện tại:{" "}
                    <span className="font-black text-white">{sel_sku.so_luong} cái</span>
                    {sel_sku.dinh_muc_min > 0 && (
                      <span style={{ color: "#334155" }}> · Min: {sel_sku.dinh_muc_min}</span>
                    )}
                  </p>
                  <code className="text-[9px] ml-auto" style={{ color: "#334155" }}>
                    {sel_sku.location_code}
                  </code>
                </div>
              )}
            </div>

            {/* Số lượng yêu cầu */}
            <div>
              <label className="text-[10px] font-black uppercase mb-2 block"
                style={{ color: "#475569" }}>
                Số lượng yêu cầu *
              </label>
              <input type="number" min={1} value={so_luong}
                onChange={e => setSoLuong(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl text-2xl font-black text-center outline-none"
                style={{ background: "#1e293b", border: "1px solid #334155", color: "#38bdf8" }} />
            </div>

            {/* Lý do */}
            <div>
              <label className="text-[10px] font-black uppercase mb-2 block"
                style={{ color: "#475569" }}>
                Lý do yêu cầu *
              </label>
              <div className="space-y-2">
                {LY_DO_OPTIONS.map(opt => (
                  <button key={opt.value}
                    onClick={() => setLyDo(opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: ly_do === opt.value ? "#0c435425" : "#1e293b",
                      border:     `1px solid ${ly_do === opt.value ? "#38bdf840" : "#334155"}`,
                    }}>
                    <span style={{ fontSize: 18 }}>{opt.icon}</span>
                    <span className="text-sm font-bold flex-1"
                      style={{ color: ly_do === opt.value ? "#38bdf8" : "#64748b" }}>
                      {opt.label}
                    </span>
                    {ly_do === opt.value && <Check size={13} style={{ color: "#38bdf8" }} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="text-[10px] font-black uppercase mb-2 block"
                style={{ color: "#475569" }}>
                Ghi chú thêm
              </label>
              <textarea value={ghi_chu}
                onChange={e => setGhiChu(e.target.value)}
                placeholder="VD: Cần gấp trước ngày 15/5 cho đợt sale..."
                rows={2}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            </div>

            {/* Lỗi */}
            {loi && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
                <AlertCircle size={12} style={{ color: "#ef4444" }} />
                <p className="text-xs" style={{ color: "#fca5a5" }}>{loi}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!submitted && (
          <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
            style={{ borderColor: "#1e293b", background: "#0a1628" }}>
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#1e293b", color: "#64748b" }}>
              Huỷ
            </button>
            <button onClick={handle_submit}
              className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
              style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              <ShoppingCart size={14} /> Gửi yêu cầu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Button component — chèn vào Dashboard ───────────────────────────────────

export default function ButtonTaoPR() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all hover:opacity-90"
        style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
        <ShoppingCart size={15} />
        Tạo yêu cầu mua thêm
      </button>

      {open && <ModalTaoPR onClose={() => setOpen(false)} />}
    </>
  );
}