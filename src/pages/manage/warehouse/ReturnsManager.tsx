// ─────────────────────────────────────────────────────────────────────────────
// ReturnsManager.tsx — Module 6: Sự cố & Hàng hoàn
// Tab 1: Hàng hoàn từ ĐVVC | Tab 2: Sự cố trong kho
// ─────────────────────────────────────────────────────────────────────────────

 
// import { useState, useMemo, useRef, useEffect } from "react";
// import {
//   ScanLine, X, Check, AlertTriangle, Package,
//   CheckCircle, Truck, ArrowRight,
//   RotateCcw, AlertCircle,
// } from "lucide-react";
// import type { PhieuHangHoan, PhieuSuCo, DongHangHoan, TinhTrangHang, HuongXuLy, LyDoSuCo } from "../../../components/Kho/data/returnsTypes";
// import {
//   TINH_TRANG_CONFIG, HUONG_XU_LY_CONFIG, LY_DO_SU_CO_CONFIG,
//   TRANG_THAI_HANG_HOAN_CONFIG, TRANG_THAI_SU_CO_CONFIG,
// } from "../../../components/Kho/data/returnsTypes";
// import {
//   tim_don_theo_van_don, tao_phieu_hang_hoan, dinh_tuyen_xu_ly,
//   tinh_stats_hang_hoan, tinh_trang_thai_phieu,
//   gen_id, gen_ma_su_co,
// } from "../../../components/Kho/data/returnsHelpers";
// import {
//   layDanhSachHangHoan, taoPhieuHangHoan, capNhatPhieuHangHoan,
//   layDanhSachSuCo, taoPhieuSuCo, capNhatPhieuSuCo,
// } from "../../../components/Kho/ServiceLayer/returnsService";
// import { layTatCaDonHang } from "../../../components/Kho/ServiceLayer/orderService";
// import { MOCK_NODES } from "../../../components/Kho/data/warehouseMockData";
// import { tinh_location_code } from "../../../components/Kho/data/warehouseHelpers";

// // ─── UI Helpers ───────────────────────────────────────────────────────────────
 
// function Badge({ tt, config }: {
//   tt: string;
//   config: Record<string, { nhan: string; mau: string; nen: string }>;
// }) {
//   const c = config[tt] ?? { nhan: tt, mau: "#475569", nen: "#1e293b" };
//   return (
//     <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
//       style={{ background: c.nen, color: c.mau, border: `1px solid ${c.mau}30` }}>
//       {c.nhan}
//     </span>
//   );
// }
 
// function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
//   const mau = type === "ok" ? "#10b981" : "#ef4444";
//   useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
//   return (
//     <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
//       style={{ background: "#0f172a", border: `1px solid ${mau}40` }}>
//       {type === "ok" ? <CheckCircle size={14} style={{ color: mau }} /> : <AlertTriangle size={14} style={{ color: mau }} />}
//       <p className="text-sm font-bold" style={{ color: mau }}>{msg}</p>
//       <button onClick={onClose} style={{ color: "#475569" }}><X size={13} /></button>
//     </div>
//   );
// }
 
// // ─── Panel QC từng SKU ───────────────────────────────────────────────────────
 
// function PanelQC({ dong, on_update }: {
//   dong:      DongHangHoan;
//   on_update: (d: DongHangHoan) => void;
// }) {
//   const [tinh_trang, setTinhTrang] = useState<TinhTrangHang | null>(dong.tinh_trang);
//   const [ghi_chu, setGhiChu]       = useState(dong.ghi_chu);
//   const [da_submit, setDaSubmit]   = useState(false);
 
//   const handle_xac_nhan = () => {
//     setDaSubmit(true);
//     if (!tinh_trang) return;
//     const huong = dinh_tuyen_xu_ly(tinh_trang);
//     on_update({
//       ...dong,
//       tinh_trang,
//       huong_xu_ly: huong,
//       ghi_chu,
//       da_qc: true,
//     });
//   };
 
//   if (dong.da_qc) {
//     const cfg = TINH_TRANG_CONFIG[dong.tinh_trang!];
//     return (
//       <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
//         style={{ background: cfg.nen, border: `1px solid ${cfg.mau}30` }}>
//         <span style={{ fontSize: 18 }}>{cfg.icon}</span>
//         <div className="flex-1">
//           <p className="text-xs font-bold" style={{ color: cfg.mau }}>{cfg.nhan}</p>
//           <p className="text-[10px]" style={{ color: "#475569" }}>
//             → {HUONG_XU_LY_CONFIG[dong.huong_xu_ly].icon} {HUONG_XU_LY_CONFIG[dong.huong_xu_ly].nhan}
//           </p>
//         </div>
//         {dong.ghi_chu && (
//           <p className="text-[10px] italic" style={{ color: "#64748b" }}>{dong.ghi_chu}</p>
//         )}
//       </div>
//     );
//   }
 
//   return (
//     <div className="space-y-3 px-4 py-3 rounded-xl"
//       style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
 
//       {/* Chọn tình trạng — bắt buộc */}
//       <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
//         Tình trạng hàng hóa *
//       </p>
//       <div className="space-y-2">
//         {(Object.entries(TINH_TRANG_CONFIG) as [TinhTrangHang, typeof TINH_TRANG_CONFIG[TinhTrangHang]][]).map(([key, cfg]) => (
//           <button key={key}
//             onClick={() => setTinhTrang(key)}
//             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
//             style={{
//               background: tinh_trang === key ? cfg.nen : "#1e293b",
//               border: `1px solid ${tinh_trang === key ? cfg.mau : "#334155"}`,
//             }}>
//             <span style={{ fontSize: 20 }}>{cfg.icon}</span>
//             <div className="flex-1">
//               <p className="text-sm font-bold" style={{ color: tinh_trang === key ? cfg.mau : "#94a3b8" }}>
//                 {cfg.nhan}
//               </p>
//               <p className="text-[10px]" style={{ color: "#475569" }}>{cfg.mo_ta}</p>
//             </div>
//             {tinh_trang === key && <Check size={14} style={{ color: cfg.mau }} />}
//           </button>
//         ))}
//       </div>
 
//       {/* Ghi chú */}
//       <input value={ghi_chu} onChange={e => setGhiChu(e.target.value)}
//         placeholder="Ghi chú tình trạng (không bắt buộc)..."
//         className="w-full px-3 py-2 rounded-xl text-xs outline-none"
//         style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
 
//       {da_submit && !tinh_trang && (
//         <div className="flex items-center gap-2 text-xs" style={{ color: "#fca5a5" }}>
//           <AlertTriangle size={11} /> Phải chọn tình trạng hàng hóa
//         </div>
//       )}
 
//       <button onClick={handle_xac_nhan}
//         className="w-full py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
//         style={{ background: "#0c4354", color: "#38bdf8", border: "1px solid #38bdf840" }}>
//         <Check size={14} /> Xác nhận tình trạng
//       </button>
//     </div>
//   );
// }
 
// // ─── Tab 1: Hàng hoàn từ ĐVVC ────────────────────────────────────────────────
 
// function TabHangHoan({
//   phieu_list, on_tao, on_update,
// }: {
//   phieu_list: PhieuHangHoan[];
//   on_tao:     (p: PhieuHangHoan) => void;
//   on_update:  (p: PhieuHangHoan) => void;
// }) {
//   const [selected_id, setSelectedId]   = useState<string | null>(phieu_list[0]?.id ?? null);
//   const [scan_input, setScanInput]     = useState("");
//   const [scan_error, setScanError]     = useState("");
//   // const [show_form, setShowForm]       = useState(false);
//   const scan_ref = useRef<HTMLInputElement>(null);
 
//   const selected = phieu_list.find(p => p.id === selected_id);
 
//   // Scan mã vận đơn
//   const handle_scan = async () => {
//     const ma = scan_input.trim().toUpperCase();
//     if (!ma) return;
 
//     // Kiểm tra đã có phiếu chưa
//     const da_co = phieu_list.find(p => p.ma_van_don === ma);
//     if (da_co) {
//       setSelectedId(da_co.id);
//       setScanInput("");
//       setScanError("Mã vận đơn này đã được tiếp nhận trước đó");
//       return;
//     }
 
//     // Tìm đơn hàng qua service
//     const ds_don = await layTatCaDonHang();
//     const don    = tim_don_theo_van_don(ma, ds_don);
//     if (!don) {
//       setScanError(`Không tìm thấy đơn hàng với mã vận đơn "${ma}"`);
//       return;
//     }
 
//     const phieu = tao_phieu_hang_hoan(ma, don);
//     on_tao(phieu);
//     setSelectedId(phieu.id);
//     setScanInput("");
//     setScanError("");
//   };
 
//   const update_dong = (phieu: PhieuHangHoan, dong: DongHangHoan) => {
//     const updated_ds = phieu.danh_sach.map(d => d.id === dong.id ? dong : d);
//     const updated = {
//       ...phieu,
//       danh_sach:  updated_ds,
//       trang_thai: tinh_trang_thai_phieu({ ...phieu, danh_sach: updated_ds }),
//     };
//     on_update(updated);
//   };
 
//   const cap_nhat_huong_xu_ly = (phieu: PhieuHangHoan, dong_id: string, huong: HuongXuLy) => {
//     const updated_ds = phieu.danh_sach.map(d =>
//       d.id === dong_id ? { ...d, huong_xu_ly: huong } : d
//     );
//     const updated = {
//       ...phieu,
//       danh_sach: updated_ds,
//       trang_thai: tinh_trang_thai_phieu({ ...phieu, danh_sach: updated_ds }),
//     };
//     on_update(updated);
//   };
 
//   const stats = selected ? tinh_stats_hang_hoan(selected) : null;
 
//   return (
//     <div className="flex h-full overflow-hidden">
 
//       {/* ── LEFT: Danh sách phiếu + Scan ── */}
//       <div className="flex flex-col border-r flex-shrink-0" style={{ width: 300, borderColor: "#1e293b" }}>
 
//         {/* Scan bar — cố định */}
//         <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
//           <h3 className="text-sm font-black text-white mb-1">Tiếp nhận hàng hoàn</h3>
//           <p className="text-[10px] mb-3" style={{ color: "#475569" }}>
//             Scan mã vận đơn bên ngoài bưu kiện
//           </p>
//           <div className="flex gap-2">
//             <div className="relative flex-1">
//               <ScanLine size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
//                 style={{ color: "#38bdf8" }} />
//               <input ref={scan_ref} value={scan_input}
//                 onChange={e => { setScanInput(e.target.value); setScanError(""); }}
//                 onKeyDown={e => e.key === "Enter" && handle_scan()}
//                 placeholder="Scan mã vận đơn..."
//                 className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
//                 style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }}
//                 autoFocus />
//             </div>
//             <button onClick={handle_scan}
//               className="px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
//               style={{ background: "#0c435425", color: "#38bdf8" }}>
//               Nhận
//             </button>
//           </div>
//           {scan_error && (
//             <p className="text-[10px] mt-1.5" style={{ color: "#ef4444" }}>
//               ⚠ {scan_error}
//             </p>
//           )}
//         </div>
 
//         {/* Danh sách phiếu — scroll */}
//         <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
//           {phieu_list.length === 0 ? (
//             <div className="flex flex-col items-center justify-center h-full pb-10">
//               <Package size={28} className="mb-2 opacity-20" style={{ color: "#64748b" }} />
//               <p className="text-xs" style={{ color: "#475569" }}>Chưa có hàng hoàn nào</p>
//             </div>
//           ) : phieu_list.map(p => (
//             <button key={p.id}
//               onClick={() => setSelectedId(p.id)}
//               className="w-full text-left px-4 py-3 transition-all hover:bg-slate-800/20"
//               style={{
//                 background: selected_id === p.id ? "#0f172a" : "transparent",
//                 borderLeft: selected_id === p.id ? "2px solid #38bdf8" : "2px solid transparent",
//                 borderBottom: "1px solid #0f172a",
//               }}>
//               <div className="flex items-center justify-between mb-1">
//                 <code className="text-xs font-black"
//                   style={{ color: selected_id === p.id ? "#38bdf8" : "#94a3b8" }}>
//                   {p.ma_phieu}
//                 </code>
//                 <Badge tt={p.trang_thai} config={TRANG_THAI_HANG_HOAN_CONFIG} />
//               </div>
//               <p className="text-[10px] font-bold" style={{ color: "#64748b" }}>{p.ma_don}</p>
//               <p className="text-[10px] truncate" style={{ color: "#475569" }}>{p.ten_khach}</p>
//               <div className="flex items-center gap-2 mt-1">
//                 <Truck size={9} style={{ color: "#334155" }} />
//                 <code className="text-[9px]" style={{ color: "#334155" }}>{p.ma_van_don}</code>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>
 
//       {/* ── RIGHT: Chi tiết phiếu + QC ── */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {!selected ? (
//           <div className="flex-1 flex flex-col items-center justify-center">
//             <RotateCcw size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
//             <p className="text-sm font-bold" style={{ color: "#475569" }}>
//               Scan mã vận đơn để tiếp nhận hàng hoàn
//             </p>
//           </div>
//         ) : (
//           <>
//             {/* Header — cố định */}
//             <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
//               <div className="flex items-start justify-between">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <code className="text-base font-black text-white">{selected.ma_phieu}</code>
//                     <Badge tt={selected.trang_thai} config={TRANG_THAI_HANG_HOAN_CONFIG} />
//                   </div>
//                   <p className="text-sm font-bold text-white">{selected.ten_khach}</p>
//                   <div className="flex items-center gap-3 mt-1">
//                     <span className="text-xs" style={{ color: "#475569" }}>{selected.ma_don}</span>
//                     <span className="text-[10px]" style={{ color: "#334155" }}>·</span>
//                     <div className="flex items-center gap-1">
//                       <Truck size={11} style={{ color: "#64748b" }} />
//                       <code className="text-[10px]" style={{ color: "#64748b" }}>
//                         {selected.ma_van_don}
//                       </code>
//                     </div>
//                     <span className="text-[10px]" style={{ color: "#334155" }}>·</span>
//                     <span className="text-[10px]" style={{ color: "#64748b" }}>{selected.dvvc}</span>
//                   </div>
//                 </div>
 
//                 {/* Stats QC */}
//                 {stats && (
//                   <div className="flex items-center gap-2">
//                     {[
//                       { label: "Tổng", val: stats.tong,   mau: "#94a3b8" },
//                       { label: "Đã QC", val: stats.da_qc,  mau: "#38bdf8" },
//                       { label: "🟢",   val: stats.moi_100, mau: "#10b981" },
//                       { label: "🟡",   val: stats.loi_nhe, mau: "#f59e0b" },
//                       { label: "🔴",   val: stats.loi_nang,mau: "#ef4444" },
//                     ].map(({ label, val, mau }) => (
//                       <div key={label} className="text-center px-2 py-1.5 rounded-xl"
//                         style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
//                         <p className="text-lg font-black leading-none" style={{ color: mau }}>{val}</p>
//                         <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
 
//               {/* Progress QC */}
//               {stats && (
//                 <div className="flex items-center gap-3 mt-3">
//                   <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
//                     <div className="h-full rounded-full transition-all"
//                       style={{
//                         width: `${stats.pct_qc}%`,
//                         background: stats.pct_qc === 100 ? "#10b981" : "#38bdf8",
//                       }} />
//                   </div>
//                   <span className="text-[10px] font-bold" style={{ color: "#475569" }}>
//                     QC {stats.pct_qc}%
//                   </span>
//                 </div>
//               )}
//             </div>
 
//             {/* Danh sách SKU — scroll */}
//             <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
//               style={{ scrollbarWidth: "thin" }}>
 
//               <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
//                 Danh sách hàng bên trong bưu kiện — kiểm định từng cái
//               </p>
 
//               {selected.danh_sach.map((dong, i) => (
//                 <div key={dong.id} className="space-y-2">
//                   {/* SKU info */}
//                   <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
//                     style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
//                     <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
//                       style={{ background: "#1e293b", color: "#64748b" }}>
//                       {i + 1}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p className="text-xs font-bold text-white">{dong.ten_sp}</p>
//                       <code className="text-[9px]" style={{ color: "#475569" }}>{dong.ma_sku}</code>
//                     </div>
//                     <span className="text-sm font-black" style={{ color: "#64748b" }}>
//                       ×{dong.so_luong}
//                     </span>
//                   </div>
 
//                   {/* QC Panel */}
//                   <PanelQC
//                     dong={dong}
//                     on_update={d => update_dong(selected, d)}
//                   />
 
//                   {/* Hướng xử lý — chỉ hiện khi đã QC và là hàng lỗi */}
//                   {dong.da_qc && dong.tinh_trang !== "moi_100" && (
//                     <div className="px-4 py-3 rounded-xl space-y-2"
//                       style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
//                       <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
//                         Hướng xử lý hàng lỗi
//                       </p>
//                       <div className="grid grid-cols-2 gap-2">
//                         {(["tra_xuong_ncc", "thanh_ly", "huy_bo"] as HuongXuLy[]).map(h => {
//                           const cfg = HUONG_XU_LY_CONFIG[h];
//                           return (
//                             <button key={h}
//                               onClick={() => cap_nhat_huong_xu_ly(selected, dong.id, h)}
//                               className="flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all"
//                               style={{
//                                 background: dong.huong_xu_ly === h ? "#0c435425" : "#1e293b",
//                                 border: `1px solid ${dong.huong_xu_ly === h ? "#38bdf8" : "#334155"}`,
//                                 color: dong.huong_xu_ly === h ? "#38bdf8" : "#64748b",
//                               }}>
//                               <span>{cfg.icon}</span>
//                               <span className="text-[10px] font-bold">{cfg.nhan}</span>
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
 
// // ─── Tab 2: Sự cố trong kho ──────────────────────────────────────────────────
 
// function TabSuCo({
//   phieu_list, on_tao, on_update,
// }: {
//   phieu_list: PhieuSuCo[];
//   on_tao:     (p: PhieuSuCo) => void;
//   on_update:  (p: PhieuSuCo) => void;
// }) {
//   const [show_form, setShowForm] = useState(false);
//   const [scan_sku, setScanSku]   = useState("");
//   const [ly_do, setLyDo]         = useState<LyDoSuCo>("hang_o_vang");
//   const [mo_ta, setMoTa]         = useState("");
//   const [so_luong, setSoLuong]   = useState(1);
//   const [node_nguon, setNodeNguon] = useState("");
//   const [loi, setLoi]            = useState<string[]>([]);
 
//   const leaf_nodes = MOCK_NODES.filter(n =>
//     !MOCK_NODES.some(x => x.parent_id === n.id) && n.trang_thai === "active"
//   );
 
//   const handle_tao = () => {
//     const errs: string[] = [];
//     if (!scan_sku.trim())         errs.push("Phải nhập mã SKU bị lỗi");
//     if (!node_nguon)              errs.push("Phải chọn vị trí kệ đang chứa hàng");
//     if (ly_do === "khac" && !mo_ta.trim()) errs.push("Phải mô tả lý do cụ thể");
//     if (so_luong <= 0)            errs.push("Số lượng phải lớn hơn 0");
//     if (errs.length) { setLoi(errs); return; }
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const node = MOCK_NODES.find(n => n.id === node_nguon)!;
//     const phieu: PhieuSuCo = {
//       id:             gen_id(),
//       ma_phieu:       gen_ma_su_co(),
//       ma_sku:         scan_sku.trim().toUpperCase(),
//       ten_sp:         scan_sku.trim().toUpperCase(), // Thực tế lookup từ DB
//       so_luong,
//       ly_do,
//       mo_ta_them:     mo_ta.trim(),
//       node_id_nguon:  node_nguon,
//       location_nguon: tinh_location_code(node_nguon, MOCK_NODES),
//       trang_thai:     "cho_xu_ly",
//       huong_xu_ly:    "chua_xu_ly",
//       nguoi_bao:      "Người dùng hiện tại",
//       ngay_tao:       new Date().toISOString(),
//       ghi_chu:        "",
//     };
//     on_tao(phieu);
//     setShowForm(false);
//     setScanSku(""); setLyDo("hang_o_vang"); setMoTa(""); setSoLuong(1); setNodeNguon(""); setLoi([]);
//   };
 
//   return (
//     <div className="flex h-full overflow-hidden">
 
//       {/* ── LEFT: Danh sách sự cố ── */}
//       <div className="flex flex-col border-r flex-shrink-0" style={{ width: 320, borderColor: "#1e293b" }}>
//         <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
//           <div className="flex items-center justify-between mb-1">
//             <h3 className="text-sm font-black text-white">Sự cố trong kho</h3>
//             <button onClick={() => setShowForm(true)}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
//               style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
//               <AlertCircle size={12} /> Báo lỗi
//             </button>
//           </div>
//           <p className="text-[10px]" style={{ color: "#475569" }}>
//             Phát hiện hàng lỗi trong lúc vận hành kho
//           </p>
//         </div>
 
//         <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
//           {phieu_list.map(p => (
//             <div key={p.id} className="px-4 py-3 border-b"
//               style={{ borderColor: "#0f172a" }}>
//               <div className="flex items-center justify-between mb-1">
//                 <code className="text-xs font-black" style={{ color: "#94a3b8" }}>{p.ma_phieu}</code>
//                 <Badge tt={p.trang_thai} config={TRANG_THAI_SU_CO_CONFIG} />
//               </div>
//               <p className="text-xs text-white">{p.ma_sku}</p>
//               <div className="flex items-center gap-2 mt-1">
//                 <span className="text-[10px]">
//                   {LY_DO_SU_CO_CONFIG[p.ly_do].icon} {LY_DO_SU_CO_CONFIG[p.ly_do].nhan}
//                 </span>
//               </div>
//               <div className="flex items-center gap-2 mt-1">
//                 <code className="text-[9px]" style={{ color: "#a78bfa" }}>{p.location_nguon}</code>
//                 <ArrowRight size={9} style={{ color: "#475569" }} />
//                 <span className="text-[9px]" style={{ color: "#ef4444" }}>Khu lỗi</span>
//                 <span className="ml-auto text-[10px] font-bold" style={{ color: "#64748b" }}>
//                   ×{p.so_luong}
//                 </span>
//               </div>
 
//               {/* Actions */}
//               {p.trang_thai === "cho_xu_ly" && (
//                 <button
//                   onClick={() => on_update({ ...p, trang_thai: "da_chuyen_kho" })}
//                   className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
//                   style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf830" }}>
//                   <Check size={11} /> Xác nhận đã chuyển vào khu lỗi
//                 </button>
//               )}
 
//               {p.trang_thai === "da_chuyen_kho" && p.huong_xu_ly === "chua_xu_ly" && (
//                 <div className="mt-2 grid grid-cols-2 gap-1">
//                   {(["tra_xuong_ncc", "thanh_ly"] as HuongXuLy[]).map(h => (
//                     <button key={h}
//                       onClick={() => on_update({ ...p, trang_thai: "da_xu_ly", huong_xu_ly: h })}
//                       className="py-1.5 rounded-lg text-[9px] font-bold"
//                       style={{ background: "#1e293b", color: "#64748b" }}>
//                       {HUONG_XU_LY_CONFIG[h].icon} {HUONG_XU_LY_CONFIG[h].nhan}
//                     </button>
//                   ))}
//                 </div>
//               )}
 
//               {p.trang_thai === "da_xu_ly" && (
//                 <div className="mt-1 flex items-center gap-1">
//                   <CheckCircle size={11} style={{ color: "#10b981" }} />
//                   <span className="text-[9px]" style={{ color: "#10b981" }}>
//                     {HUONG_XU_LY_CONFIG[p.huong_xu_ly].nhan}
//                   </span>
//                 </div>
//               )}
//             </div>
//           ))}
 
//           {phieu_list.length === 0 && (
//             <div className="flex flex-col items-center justify-center h-full pb-10">
//               <CheckCircle size={28} className="mb-2 opacity-20" style={{ color: "#10b981" }} />
//               <p className="text-xs" style={{ color: "#475569" }}>Không có sự cố nào</p>
//             </div>
//           )}
//         </div>
//       </div>
 
//       {/* ── RIGHT: Form báo lỗi ── */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {!show_form ? (
//           <div className="flex-1 flex flex-col items-center justify-center">
//             <AlertCircle size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
//             <p className="text-sm font-bold" style={{ color: "#475569" }}>
//               Phát hiện hàng lỗi?
//             </p>
//             <p className="text-xs mt-1 mb-4" style={{ color: "#334155" }}>
//               Nhấn "Báo lỗi" để ghi nhận sự cố
//             </p>
//             <button onClick={() => setShowForm(true)}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
//               style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
//               <AlertCircle size={15} /> Báo lỗi hàng hóa
//             </button>
//           </div>
//         ) : (
//           <div className="flex flex-col h-full overflow-hidden">
//             {/* Form header — cố định */}
//             <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
//               <h3 className="text-sm font-black text-white">Báo lỗi hàng hóa</h3>
//               <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>
//                 Hệ thống sẽ tự tạo lệnh chuyển hàng vào khu lỗi
//               </p>
//             </div>
 
//             {/* Form body — scroll */}
//             <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
 
//               {/* Scan / nhập SKU */}
//               <div>
//                 <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
//                   Mã SKU hàng lỗi *
//                 </label>
//                 <div className="relative">
//                   <ScanLine size={12} className="absolute left-3 top-1/2 -translate-y-1/2"
//                     style={{ color: "#38bdf8" }} />
//                   <input value={scan_sku} onChange={e => setScanSku(e.target.value)}
//                     placeholder="Scan hoặc nhập mã SKU..."
//                     className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
//                     style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }}
//                     autoFocus />
//                 </div>
//               </div>
 
//               {/* Lý do */}
//               <div>
//                 <label className="text-[10px] font-black uppercase mb-2 block" style={{ color: "#475569" }}>
//                   Lý do lỗi *
//                 </label>
//                 <div className="space-y-1.5">
//                   {// eslint-disable-next-line @typescript-eslint/no-explicit-any
//                   (Object.entries(LY_DO_SU_CO_CONFIG) as [LyDoSuCo, any][]).map(([key, cfg]) => (
//                     <button key={key}
//                       onClick={() => setLyDo(key)}
//                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all"
//                       style={{
//                         background: ly_do === key ? "#0c435425" : "#1e293b",
//                         border: `1px solid ${ly_do === key ? "#38bdf8" : "#334155"}`,
//                         color: ly_do === key ? "#38bdf8" : "#94a3b8",
//                       }}>
//                       <span>{cfg.icon}</span>
//                       <span className="text-xs font-bold">{cfg.nhan}</span>
//                       {ly_do === key && <Check size={12} className="ml-auto" />}
//                     </button>
//                   ))}
//                 </div>
//               </div>
 
//               {/* Mô tả thêm — bắt buộc nếu chọn "khác" */}
//               {(ly_do === "khac" || mo_ta) && (
//                 <div>
//                   <label className="text-[10px] font-black uppercase mb-1.5 block"
//                     style={{ color: ly_do === "khac" ? "#ef4444" : "#475569" }}>
//                     Mô tả cụ thể {ly_do === "khac" ? "* (bắt buộc)" : "(không bắt buộc)"}
//                   </label>
//                   <textarea value={mo_ta} onChange={e => setMoTa(e.target.value)}
//                     placeholder="Mô tả tình trạng hàng lỗi..."
//                     rows={2}
//                     className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
//                     style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
//                 </div>
//               )}
 
//               {/* Vị trí kệ nguồn */}
//               <div>
//                 <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
//                   Vị trí kệ đang chứa *
//                 </label>
//                 <select value={node_nguon} onChange={e => setNodeNguon(e.target.value)}
//                   className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
//                   style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}>
//                   <option value="">-- Chọn ô/bin đang chứa hàng lỗi --</option>
//                   {leaf_nodes.map(n => (
//                     <option key={n.id} value={n.id}>
//                       {tinh_location_code(n.id, MOCK_NODES)} — {n.ten}
//                     </option>
//                   ))}
//                 </select>
//               </div>
 
//               {/* Số lượng */}
//               <div>
//                 <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>
//                   Số lượng bị lỗi *
//                 </label>
//                 <input type="number" min={1} value={so_luong}
//                   onChange={e => setSoLuong(Number(e.target.value))}
//                   className="w-full px-3 py-2.5 rounded-xl text-sm font-black text-center outline-none"
//                   style={{ background: "#1e293b", border: "1px solid #334155", color: "#ef4444" }} />
//               </div>
 
//               {/* Thông tin tự động */}
//               {node_nguon && (
//                 <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
//                   style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
//                   <div className="flex items-center gap-2 flex-1">
//                     <code className="text-sm font-black" style={{ color: "#a78bfa" }}>
//                       {tinh_location_code(node_nguon, MOCK_NODES)}
//                     </code>
//                     <ArrowRight size={13} style={{ color: "#475569" }} />
//                     <span className="text-sm font-black" style={{ color: "#ef4444" }}>Khu C — Lỗi</span>
//                   </div>
//                   <p className="text-[9px]" style={{ color: "#475569" }}>Hệ thống tự chuyển</p>
//                 </div>
//               )}
 
//               {/* Lỗi validate */}
//               {loi.length > 0 && (
//                 <div className="rounded-xl p-3 space-y-1"
//                   style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
//                   {loi.map(l => (
//                     <div key={l} className="flex items-center gap-2 text-xs" style={{ color: "#fca5a5" }}>
//                       <AlertTriangle size={11} />{l}
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
 
//             {/* Footer — pin cố định */}
//             <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0"
//               style={{ borderColor: "#1e293b", background: "#0a1628" }}>
//               <button onClick={() => { setShowForm(false); setLoi([]); }}
//                 className="flex-1 py-2.5 rounded-xl text-sm font-bold"
//                 style={{ background: "#1e293b", color: "#64748b" }}>
//                 Huỷ
//               </button>
//               <button onClick={handle_tao}
//                 className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
//                 style={{ background: "#7f1d1d40", color: "#ef4444", border: "1px solid #ef444440" }}>
//                 <AlertCircle size={14} /> Xác nhận báo lỗi
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
 
// // ─── Main Page ────────────────────────────────────────────────────────────────
 
// type ActiveTab = "hang_hoan" | "su_co";
 
// export default function ReturnsManager() {
//   const [phieu_hang_hoan, setPhieuHangHoan] = useState<PhieuHangHoan[]>([]);
//   const [phieu_su_co,     setPhieuSuCo]     = useState<PhieuSuCo[]>([]);
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   const [loading,         setLoading]        = useState(true);
 
//   // Load data qua service khi mount
//   useEffect(() => {
//     Promise.all([
//       layDanhSachHangHoan(),
//       layDanhSachSuCo(),
//     ]).then(([hang_hoan, su_co]) => {
//       setPhieuHangHoan(hang_hoan);
//       setPhieuSuCo(su_co);
//       setLoading(false);
//     });
//   }, []);
//   const [active_tab, setActiveTab]           = useState<ActiveTab>("hang_hoan");
//   const [toast, setToast]                    = useState<{ msg: string; type: "ok" | "err" } | null>(null);
 
//   const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
//     setToast({ msg, type });
//     setTimeout(() => setToast(null), 3000);
//   };
 
//   const so_cho_xu_ly = useMemo(() =>
//     phieu_hang_hoan.filter(p => p.trang_thai === "cho_xu_ly" || p.trang_thai === "dang_qc").length +
//     phieu_su_co.filter(p => p.trang_thai === "cho_xu_ly").length,
//     [phieu_hang_hoan, phieu_su_co]
//   );
 
//   const TABS = [
//     { id: "hang_hoan" as ActiveTab, label: "Hàng hoàn từ ĐVVC", icon: RotateCcw },
//     { id: "su_co"     as ActiveTab, label: "Sự cố trong kho",    icon: AlertCircle },
//   ];
 
//   return (
//     <div className="flex flex-col h-screen overflow-hidden relative" style={{ background: "#020817" }}>
 
//       {/* Tab bar — cố định */}
//       <div className="flex border-b flex-shrink-0"
//         style={{ borderColor: "#1e293b", background: "#0a1628" }}>
//         <div className="flex items-center gap-2 px-5 py-2 border-r" style={{ borderColor: "#1e293b" }}>
//           <RotateCcw size={14} style={{ color: "#38bdf8" }} />
//           <span className="text-sm font-black text-white">Sự cố & Hoàn</span>
//           {so_cho_xu_ly > 0 && (
//             <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black"
//               style={{ background: "#ef444420", color: "#ef4444" }}>
//               {so_cho_xu_ly}
//             </span>
//           )}
//         </div>
//         {TABS.map(({ id, label, icon: Icon }) => (
//           <button key={id}
//             onClick={() => setActiveTab(id)}
//             className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all"
//             style={{
//               color:        active_tab === id ? "#38bdf8" : "#475569",
//               borderBottom: active_tab === id ? "2px solid #38bdf8" : "2px solid transparent",
//             }}>
//             <Icon size={13} />{label}
//           </button>
//         ))}
//       </div>
 
//       {/* Tab content */}
//       <div className="flex-1 overflow-hidden">
//         {active_tab === "hang_hoan" && (
//           <TabHangHoan
//             phieu_list={phieu_hang_hoan}
//             on_tao={async p => {
//               const saved = await taoPhieuHangHoan(p);
//               setPhieuHangHoan(prev => [saved, ...prev]);
//               show_toast(`Đã tiếp nhận ${saved.ma_phieu} — ${saved.danh_sach.length} SKU cần QC`);
//             }}
//             on_update={async p => {
//               const saved = await capNhatPhieuHangHoan(p);
//               setPhieuHangHoan(prev => prev.map(x => x.id === saved.id ? saved : x));
//             }}
//           />
//         )}
//         {active_tab === "su_co" && (
//           <TabSuCo
//             phieu_list={phieu_su_co}
//             on_tao={async p => {
//               const saved = await taoPhieuSuCo(p);
//               setPhieuSuCo(prev => [saved, ...prev]);
//               show_toast(`Đã ghi nhận ${saved.ma_phieu} — hệ thống tự tạo lệnh chuyển kho`);
//             }}
//             on_update={async p => {
//               const saved = await capNhatPhieuSuCo(p);
//               setPhieuSuCo(prev => prev.map(x => x.id === saved.id ? saved : x));
//             }}
//           />
//         )}
//       </div>
 
//       {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
//     </div>
//   );
// }


// ─────────────────────────────────────────────────────────────────────────────
// ReturnsManager.tsx — Module 6: Sự cố & Hàng hoàn (Redesign)
// Flow: Scan → QC từng SKU → Phân luồng tự động → Track trạng thái
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect } from "react";
import {
  ScanLine, X, Check, AlertTriangle, Package,
  CheckCircle, Truck, ArrowRight, AlertCircle,
  RotateCcw, ExternalLink, Clock,
} from "lucide-react";
import type {
  PhieuHangHoan, PhieuSuCo, DongHangHoan,
  TinhTrangHang, HuongXuLy, LyDoSuCo,
} from "../../../components/Kho/data/returnsTypes";
import {
  TINH_TRANG_CONFIG, HUONG_XU_LY_CONFIG, LY_DO_SU_CO_CONFIG,
  TRANG_THAI_HANG_HOAN_CONFIG, TRANG_THAI_SU_CO_CONFIG,
} from "../../../components/Kho/data/returnsTypes";
import {
  tim_don_theo_van_don, tao_phieu_hang_hoan,
  dinh_tuyen_xu_ly, tinh_stats_hang_hoan,
  tinh_trang_thai_phieu, gen_id, gen_ma_su_co,
} from "../../../components/Kho/data/returnsHelpers";
import {
  layDanhSachHangHoan, taoPhieuHangHoan, capNhatPhieuHangHoan,
  layDanhSachSuCo, taoPhieuSuCo, capNhatPhieuSuCo,
  xacNhanLoai1TaoPhieuNhap, xacNhanTraNCC,
} from "../../../components/Kho/ServiceLayer2/returnsService";
import { layTatCaDonHang } from "../../../components/Kho/ServiceLayer/orderService";
import { MOCK_NODES } from "../../../components/Kho/data/warehouseMockData";
import { tinh_location_code } from "../../../components/Kho/data/warehouseHelpers";

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({ tt, config }: { tt: string; config: Record<string, { nhan: string; mau: string; nen: string }> }) {
  const c = config[tt] ?? { nhan: tt, mau: "#475569", nen: "#1e293b" };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.nen, color: c.mau, border: `1px solid ${c.mau}30` }}>
      {c.nhan}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: "ok" | "err"; onClose: () => void }) {
  const mau = type === "ok" ? "#10b981" : "#ef4444";
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: "#0f172a", border: `1px solid ${mau}40` }}>
      {type === "ok" ? <CheckCircle size={14} style={{ color: mau }} /> : <AlertTriangle size={14} style={{ color: mau }} />}
      <p className="text-sm font-bold" style={{ color: mau }}>{msg}</p>
      <button onClick={onClose} style={{ color: "#475569" }}><X size={13} /></button>
    </div>
  );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function Stepper({ steps, current }: { steps: { label: string; done: boolean }[]; current: number }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const is_done    = step.done;
        const is_current = i === current;
        const mau = is_done ? "#10b981" : is_current ? "#38bdf8" : "#334155";
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0"
                style={{ background: is_done ? "#06472520" : is_current ? "#0c435425" : "#1e293b",
                         border: `1.5px solid ${mau}`, color: mau }}>
                {is_done ? <Check size={11} /> : i + 1}
              </div>
              <p className="text-[9px] font-bold whitespace-nowrap" style={{ color: mau }}>{step.label}</p>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 h-px mb-4 mx-1 flex-shrink-0"
                style={{ background: steps[i].done ? "#10b981" : "#1e293b" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Card một dòng hàng ───────────────────────────────────────────────────────

function DongHangCard({ dong, phieu, on_update, on_toast }: {
  dong: DongHangHoan; phieu: PhieuHangHoan;
  on_update: (p: PhieuHangHoan) => void;
  on_toast: (msg: string, type: "ok" | "err") => void;
}) {
  const [loading, setLoading] = useState(false);

  const la_hoan_thanh = (() => {
  if (!dong.da_qc || dong.huong_xu_ly === "chua_xu_ly") return false;
  if (dong.huong_xu_ly === "len_ke_ban_tiep") return dong.ghi_chu.includes("Phiếu nhập");
  if (dong.huong_xu_ly === "tra_xuong_ncc")   return dong.ghi_chu.includes("da_van_chuyen");
  if (dong.huong_xu_ly === "thanh_ly")        return true;
  if (dong.huong_xu_ly === "huy_bo")          return true;
  return false;
})();

  const steps = [
    { label: "Tiếp nhận", done: true },
    { label: "Kiểm định", done: dong.da_qc },
    { label: "Phân luồng", done: dong.da_qc && dong.huong_xu_ly !== "chua_xu_ly" },
    { label: "Hoàn thành", done: la_hoan_thanh },
  ];
  const current_step = steps.findIndex(s => !s.done);

  const update_dong = (updated: DongHangHoan) => {
    const updated_phieu = { ...phieu, danh_sach: phieu.danh_sach.map(d => d.id === dong.id ? updated : d) };
    updated_phieu.trang_thai = tinh_trang_thai_phieu(updated_phieu);
    on_update(updated_phieu);
  };

  const handle_qc = (tt: TinhTrangHang) => {
    update_dong({ ...dong, tinh_trang: tt, huong_xu_ly: dinh_tuyen_xu_ly(tt), da_qc: true });
  };

  const handle_loai1 = async () => {
    setLoading(true);
    try {
      const { ma_phieu_nhap } = await xacNhanLoai1TaoPhieuNhap(phieu.id, dong.id);
      update_dong({ ...dong, huong_xu_ly: "len_ke_ban_tiep", ghi_chu: `Phiếu nhập: ${ma_phieu_nhap}` });
      on_toast(`Đã tạo ${ma_phieu_nhap} — chờ put-away ở Module 3`, "ok");
    } finally { setLoading(false); }
  };

  const handle_tra_ncc = async () => {
    setLoading(true);
    try {
      const { ma_phieu_nhat } = await xacNhanTraNCC(phieu.id, dong.id, phieu.dvvc);
      update_dong({ ...dong, huong_xu_ly: "tra_xuong_ncc", ghi_chu: `Phiếu xuất: ${ma_phieu_nhat}` });
      on_toast(`Đã tạo ${ma_phieu_nhat} — xem tại Module 4`, "ok");
    } finally { setLoading(false); }
  };

  const tt_cfg = dong.tinh_trang ? TINH_TRANG_CONFIG[dong.tinh_trang] : null;

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${dong.da_qc ? (dong.tinh_trang === "moi_100" ? "#10b98130" : "#ef444430") : "#1e293b"}` }}>

      {/* SKU header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: "#0f172a" }}>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white">{dong.ten_sp}</p>
          <code className="text-[9px]" style={{ color: "#475569" }}>{dong.ma_sku}</code>
        </div>
        <span className="text-sm font-black flex-shrink-0" style={{ color: "#64748b" }}>×{dong.so_luong}</span>
      </div>

      {/* Stepper */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "#1e293b" }}>
        <Stepper steps={steps} current={current_step === -1 ? steps.length : current_step} />
      </div>

      {/* Chưa QC */}
      {!dong.da_qc && (
        <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: "#1e293b" }}>
          <p className="text-[10px] font-black uppercase pt-3" style={{ color: "#475569" }}>Chọn tình trạng *</p>
          {(Object.entries(TINH_TRANG_CONFIG) as [TinhTrangHang, any][]).map(([key, cfg]) => (
            <button key={key} onClick={() => handle_qc(key)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left hover:opacity-90"
              style={{ background: cfg.nen, border: `1px solid ${cfg.mau}40` }}>
              <span style={{ fontSize: 18 }}>{cfg.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: cfg.mau }}>{cfg.nhan}</p>
                <p className="text-[10px]" style={{ color: "#64748b" }}>{cfg.mo_ta}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loại 1 — tạo phiếu nhập */}
      {dong.da_qc && dong.tinh_trang === "moi_100" && dong.huong_xu_ly === "chua_xu_ly" && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl my-3"
            style={{ background: "#06472515", border: "1px solid #10b98130" }}>
            <span style={{ fontSize: 14 }}>🟢</span>
            <p className="text-xs" style={{ color: "#10b981" }}>Hàng đạt 100% — tạo phiếu nhập để cất lên kệ</p>
          </div>
          <button onClick={handle_loai1} disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: "#06472520", color: "#10b981", border: "1px solid #10b98140" }}>
            <Package size={14} />{loading ? "Đang tạo..." : "Tạo phiếu nhập → Module 3"}
          </button>
        </div>
      )}

      {/* Loại 2/3 — chọn hướng xử lý */}
      {dong.da_qc && dong.tinh_trang !== "moi_100" && dong.huong_xu_ly === "chua_xu_ly" && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl my-3"
            style={{ background: "#7f1d1d15", border: "1px solid #ef444430" }}>
            <span style={{ fontSize: 14 }}>{tt_cfg?.icon}</span>
            <div>
              <p className="text-xs font-bold" style={{ color: tt_cfg?.mau }}>{tt_cfg?.nhan}</p>
              <p className="text-[10px]" style={{ color: "#64748b" }}>Hàng đã vào Khu C — chọn hướng xử lý</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={handle_tra_ncc} disabled={loading}
              className="py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 disabled:opacity-40"
              style={{ background: "#0c435420", color: "#38bdf8", border: "1px solid #38bdf840" }}>
              <RotateCcw size={14} />Trả NCC
            </button>
            <button onClick={() => { update_dong({ ...dong, huong_xu_ly: "thanh_ly", ghi_chu: "Chờ kế toán định giá" }); on_toast("Chuyển khu thanh lý — kế toán sẽ định giá", "ok"); }}
              className="py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1"
              style={{ background: "#78350f20", color: "#f59e0b", border: "1px solid #f59e0b40" }}>
              <span style={{ fontSize: 14 }}>💰</span>Thanh lý
            </button>
            <button onClick={() => { update_dong({ ...dong, huong_xu_ly: "huy_bo", ghi_chu: "Ghi nhận hao hụt" }); on_toast("Đã ghi nhận hao hụt", "ok"); }}
              className="py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444440" }}>
              <X size={14} />Hủy bỏ
            </button>
          </div>
        </div>
      )}

      {/* Đã có hướng xử lý */}
      {/* {dong.da_qc && dong.huong_xu_ly !== "chua_xu_ly" && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-3"
            style={{ background: HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau + "15", border: `1px solid ${HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau}30` }}>
            <span style={{ fontSize: 16 }}>{HUONG_XU_LY_CONFIG[dong.huong_xu_ly].icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold" style={{ color: HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau }}>
                {HUONG_XU_LY_CONFIG[dong.huong_xu_ly].nhan}
              </p>
              {dong.ghi_chu && <p className="text-[10px] truncate" style={{ color: "#64748b" }}>{dong.ghi_chu}</p>}
            </div>
            {dong.ghi_chu.includes("Phiếu") && (
              <div className="flex items-center gap-1 text-[9px] flex-shrink-0" style={{ color: "#64748b" }}>
                <ExternalLink size={10} />
                <span>{dong.huong_xu_ly === "len_ke_ban_tiep" ? "Module 3" : "Module 4"}</span>
              </div>
            )}
            {dong.huong_xu_ly === "thanh_ly" && (
              <div className="flex items-center gap-1 text-[9px]" style={{ color: "#f59e0b" }}>
                <Clock size={10} /><span>Chờ kế toán</span>
              </div>
            )}
          </div>
        </div>
      )} */}
      {/* Đã có hướng xử lý */}
      {dong.da_qc && dong.huong_xu_ly !== "chua_xu_ly" && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-3"
            style={{ background: HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau + "15", border: `1px solid ${HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau}30` }}>
            <span style={{ fontSize: 16 }}>{HUONG_XU_LY_CONFIG[dong.huong_xu_ly].icon}</span>
            <div className="flex-1 min-w-0">
              {/* Loại 1 — hiện tên phiếu nhập thay vì "Lên kệ bán" */}
              {dong.huong_xu_ly === "len_ke_ban_tiep" ? (
                <>
                  <p className="text-xs font-bold" style={{ color: "#10b981" }}>
                    Chờ nhập kho — Module 3
                  </p>
                  <p className="text-[10px] truncate" style={{ color: "#64748b" }}>
                    {dong.ghi_chu}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold" style={{ color: HUONG_XU_LY_CONFIG[dong.huong_xu_ly].mau }}>
                    {HUONG_XU_LY_CONFIG[dong.huong_xu_ly].nhan}
                  </p>
                  {dong.ghi_chu && <p className="text-[10px] truncate" style={{ color: "#64748b" }}>{dong.ghi_chu}</p>}
                </>
              )}
            </div>
            {dong.huong_xu_ly === "len_ke_ban_tiep" && (
              <div className="flex items-center gap-1 text-[9px] flex-shrink-0" style={{ color: "#64748b" }}>
                <ExternalLink size={10} />
                <span>Module 3</span>
              </div>
            )}
            {dong.huong_xu_ly === "tra_xuong_ncc" && dong.ghi_chu.includes("Phiếu") && (
              <div className="flex items-center gap-1 text-[9px] flex-shrink-0" style={{ color: "#64748b" }}>
                <ExternalLink size={10} />
                <span>Module 4</span>
              </div>
            )}
            {dong.huong_xu_ly === "thanh_ly" && (
              <div className="flex items-center gap-1 text-[9px]" style={{ color: "#f59e0b" }}>
                <Clock size={10} /><span>Chờ kế toán</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab 1: Hàng hoàn từ ĐVVC ────────────────────────────────────────────────

function TabHangHoan({ phieu_list, on_tao, on_update, on_toast }: {
  phieu_list: PhieuHangHoan[];
  on_tao: (p: PhieuHangHoan) => void;
  on_update: (p: PhieuHangHoan) => void;
  on_toast: (msg: string, type: "ok" | "err") => void;
}) {
  const [selected_id, setSelectedId] = useState<string | null>(phieu_list[0]?.id ?? null);
  const [scan_input, setScanInput]   = useState("");
  const [scan_error, setScanError]   = useState("");

  const selected = phieu_list.find(p => p.id === selected_id) ?? null;
  const stats    = selected ? tinh_stats_hang_hoan(selected) : null;

  const handle_scan = async () => {
    const ma = scan_input.trim().toUpperCase();
    if (!ma) return;
    const da_co = phieu_list.find(p => p.ma_van_don === ma);
    if (da_co) { setSelectedId(da_co.id); setScanInput(""); setScanError("Mã vận đơn đã tiếp nhận trước đó"); return; }
    const ds_don = await layTatCaDonHang();
    const don    = tim_don_theo_van_don(ma, ds_don);
    if (!don) { setScanError(`Không tìm thấy đơn với mã "${ma}"`); return; }
    const phieu = tao_phieu_hang_hoan(ma, don);
    on_tao(phieu); setSelectedId(phieu.id); setScanInput(""); setScanError("");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 280, borderColor: "#1e293b" }}>
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <h3 className="text-sm font-black text-white mb-1">Tiếp nhận hàng hoàn</h3>
          <p className="text-[10px] mb-3" style={{ color: "#475569" }}>Scan mã vận đơn bên ngoài bưu kiện</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <ScanLine size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#38bdf8" }} />
              <input value={scan_input} onChange={e => { setScanInput(e.target.value); setScanError(""); }}
                onKeyDown={e => e.key === "Enter" && handle_scan()}
                placeholder="Scan mã vận đơn..."
                className="w-full pl-8 pr-3 py-2 rounded-xl text-xs outline-none"
                style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }} autoFocus />
            </div>
            <button onClick={handle_scan} className="px-3 py-2 rounded-xl text-xs font-bold flex-shrink-0"
              style={{ background: "#0c435425", color: "#38bdf8" }}>Nhận</button>
          </div>
          {scan_error && <p className="text-[10px] mt-1.5" style={{ color: "#f59e0b" }}>⚠ {scan_error}</p>}
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {phieu_list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-10">
              <Package size={28} className="mb-2 opacity-20" style={{ color: "#64748b" }} />
              <p className="text-xs" style={{ color: "#475569" }}>Chưa có hàng hoàn nào</p>
            </div>
          ) : phieu_list.map(p => {
            const s = tinh_stats_hang_hoan(p);
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="w-full text-left px-4 py-3 transition-all hover:bg-slate-800/20"
                style={{ background: selected_id === p.id ? "#0f172a" : "transparent",
                         borderLeft: selected_id === p.id ? "2px solid #38bdf8" : "2px solid transparent",
                         borderBottom: "1px solid #0f172a" }}>
                <div className="flex items-center justify-between mb-1">
                  <code className="text-xs font-black" style={{ color: selected_id === p.id ? "#38bdf8" : "#94a3b8" }}>
                    {p.ma_phieu}
                  </code>
                  <Badge tt={p.trang_thai} config={TRANG_THAI_HANG_HOAN_CONFIG} />
                </div>
                <p className="text-[10px] font-bold truncate" style={{ color: "#64748b" }}>{p.ten_khach}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Truck size={9} style={{ color: "#334155" }} />
                  <code className="text-[9px]" style={{ color: "#334155" }}>{p.ma_van_don}</code>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                    <div className="h-full rounded-full" style={{ width: `${s.pct_qc}%`, background: s.pct_qc === 100 ? "#10b981" : "#38bdf8" }} />
                  </div>
                  <span className="text-[9px]" style={{ color: "#475569" }}>QC {s.pct_qc}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <RotateCcw size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Scan mã vận đơn để tiếp nhận</p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <code className="text-base font-black text-white">{selected.ma_phieu}</code>
                    <Badge tt={selected.trang_thai} config={TRANG_THAI_HANG_HOAN_CONFIG} />
                  </div>
                  <p className="text-sm font-bold text-white">{selected.ten_khach}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs" style={{ color: "#475569" }}>{selected.ma_don}</span>
                    <span style={{ color: "#334155" }}>·</span>
                    <Truck size={11} style={{ color: "#64748b" }} />
                    <code className="text-[10px]" style={{ color: "#64748b" }}>{selected.ma_van_don}</code>
                  </div>
                </div>
                {stats && (
                  <div className="flex items-center gap-2">
                    {[{label:"Tổng",val:stats.tong,mau:"#94a3b8"},{label:"🟢",val:stats.moi_100,mau:"#10b981"},{label:"🟡",val:stats.loi_nhe,mau:"#f59e0b"},{label:"🔴",val:stats.loi_nang,mau:"#ef4444"}].map(({label,val,mau}) => (
                      <div key={label} className="text-center px-2 py-1.5 rounded-xl" style={{ background: "#0f172a", border: "1px solid #1e293b" }}>
                        <p className="text-lg font-black leading-none" style={{ color: mau }}>{val}</p>
                        <p className="text-[9px]" style={{ color: "#475569" }}>{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {stats && (
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "#1e293b" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${stats.pct_qc}%`, background: stats.pct_qc === 100 ? "#10b981" : "#38bdf8" }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: "#475569" }}>QC {stats.pct_qc}%</span>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
              <p className="text-[10px] font-black uppercase" style={{ color: "#475569" }}>
                {selected.danh_sach.length} SKU — kiểm định từng cái
              </p>
              {selected.danh_sach.map(dong => (
                <DongHangCard key={dong.id} dong={dong} phieu={selected} on_update={on_update} on_toast={on_toast} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Tab 2: Sự cố trong kho ──────────────────────────────────────────────────

function TabSuCo({ phieu_list, on_tao, on_update, on_toast }: {
  phieu_list: PhieuSuCo[];
  on_tao: (p: PhieuSuCo) => void;
  on_update: (p: PhieuSuCo) => void;
  on_toast: (msg: string, type: "ok" | "err") => void;
}) {
  const [show_form, setShowForm] = useState(false);
  const [scan_sku,  setScanSku]  = useState("");
  const [ly_do,     setLyDo]     = useState<LyDoSuCo>("hang_o_vang");
  const [mo_ta,     setMoTa]     = useState("");
  const [so_luong,  setSoLuong]  = useState(1);
  const [node_nguon, setNodeNguon] = useState("");
  const [loi, setLoi] = useState<string[]>([]);

  const leaf_nodes = MOCK_NODES.filter(n => !MOCK_NODES.some(x => x.parent_id === n.id) && n.trang_thai === "active");
  const su_co_cho  = phieu_list.filter(p => p.trang_thai === "cho_xu_ly").length;

  const handle_tao = async () => {
    const errs: string[] = [];
    if (!scan_sku.trim())  errs.push("Phải nhập mã SKU bị lỗi");
    if (!node_nguon)       errs.push("Phải chọn vị trí kệ");
    if (ly_do === "khac" && !mo_ta.trim()) errs.push("Phải mô tả lý do");
    if (so_luong <= 0)     errs.push("Số lượng phải > 0");
    if (errs.length) { setLoi(errs); return; }

    const phieu: PhieuSuCo = {
      id: gen_id(), ma_phieu: gen_ma_su_co(),
      ma_sku: scan_sku.trim().toUpperCase(), ten_sp: scan_sku.trim().toUpperCase(),
      so_luong, ly_do, mo_ta_them: mo_ta.trim(),
      node_id_nguon: node_nguon,
      location_nguon: tinh_location_code(node_nguon, MOCK_NODES),
      trang_thai: "cho_xu_ly", huong_xu_ly: "chua_xu_ly",
      nguoi_bao: "Người dùng hiện tại",
      ngay_tao: new Date().toISOString(), ghi_chu: "",
    };
    on_tao(phieu);
    setShowForm(false); setScanSku(""); setMoTa(""); setSoLuong(1); setNodeNguon(""); setLoi([]);
    on_toast(`Đã ghi nhận ${phieu.ma_phieu} — tồn kho đã trừ tự động`, "ok");
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* LEFT */}
      <div className="flex flex-col border-r flex-shrink-0" style={{ width: 320, borderColor: "#1e293b" }}>
        <div className="px-4 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Sự cố trong kho</h3>
              {su_co_cho > 0 && <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black" style={{ background: "#f59e0b20", color: "#f59e0b" }}>{su_co_cho}</span>}
            </div>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
              <AlertCircle size={12} /> Báo lỗi
            </button>
          </div>
          <p className="text-[10px]" style={{ color: "#475569" }}>Tồn kho tự trừ khi tạo phiếu</p>
        </div>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {phieu_list.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full pb-10">
              <CheckCircle size={28} className="mb-2 opacity-20" style={{ color: "#10b981" }} />
              <p className="text-xs" style={{ color: "#475569" }}>Không có sự cố nào</p>
            </div>
          ) : phieu_list.map(p => (
            <div key={p.id} className="px-4 py-3 border-b" style={{ borderColor: "#0f172a" }}>
              <div className="flex items-center justify-between mb-1">
                <code className="text-xs font-black" style={{ color: "#94a3b8" }}>{p.ma_phieu}</code>
                <Badge tt={p.trang_thai} config={TRANG_THAI_SU_CO_CONFIG} />
              </div>
              <p className="text-xs text-white">{p.ma_sku}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px]">{LY_DO_SU_CO_CONFIG[p.ly_do].icon}</span>
                <span className="text-[10px]" style={{ color: "#475569" }}>{LY_DO_SU_CO_CONFIG[p.ly_do].nhan}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-[9px]" style={{ color: "#a78bfa" }}>{p.location_nguon}</code>
                <ArrowRight size={9} style={{ color: "#475569" }} />
                <span className="text-[9px]" style={{ color: "#ef4444" }}>Khu C</span>
                <span className="ml-auto text-[10px] font-bold" style={{ color: "#64748b" }}>×{p.so_luong}</span>
              </div>
              {p.trang_thai === "cho_xu_ly" && (
                <button onClick={() => on_update({ ...p, trang_thai: "da_chuyen_kho" })}
                  className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                  style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf830" }}>
                  <Check size={11} /> Xác nhận đã chuyển vào Khu C
                </button>
              )}
              {p.trang_thai === "da_chuyen_kho" && p.huong_xu_ly === "chua_xu_ly" && (
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {(["tra_xuong_ncc","thanh_ly","huy_bo"] as HuongXuLy[]).map(h => (
                    <button key={h} onClick={() => on_update({ ...p, trang_thai: "da_xu_ly", huong_xu_ly: h })}
                      className="py-1.5 rounded-lg text-[9px] font-bold"
                      style={{ background: "#1e293b", color: "#64748b" }}>
                      {HUONG_XU_LY_CONFIG[h].icon} {HUONG_XU_LY_CONFIG[h].nhan}
                    </button>
                  ))}
                </div>
              )}
              {p.trang_thai === "da_xu_ly" && (
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span style={{ fontSize: 12 }}>{HUONG_XU_LY_CONFIG[p.huong_xu_ly].icon}</span>
                  <span className="text-[9px] font-bold" style={{ color: HUONG_XU_LY_CONFIG[p.huong_xu_ly].mau }}>
                    {HUONG_XU_LY_CONFIG[p.huong_xu_ly].nhan}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!show_form ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <AlertCircle size={36} className="mb-3 opacity-20" style={{ color: "#64748b" }} />
            <p className="text-sm font-bold" style={{ color: "#475569" }}>Phát hiện hàng lỗi?</p>
            <p className="text-xs mt-1 mb-4" style={{ color: "#334155" }}>Tồn kho tự trừ khi tạo phiếu</p>
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "#7f1d1d20", color: "#ef4444", border: "1px solid #ef444430" }}>
              <AlertCircle size={15} /> Báo lỗi hàng hóa
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-6 py-4 border-b flex-shrink-0" style={{ borderColor: "#1e293b" }}>
              <h3 className="text-sm font-black text-white">Báo lỗi hàng hóa</h3>
              <p className="text-[10px] mt-0.5" style={{ color: "#475569" }}>Tồn kho tự trừ · hàng vào Khu C tự động</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ scrollbarWidth: "thin" }}>
              {/* SKU */}
              <div>
                <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>Mã SKU *</label>
                <div className="relative">
                  <ScanLine size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#38bdf8" }} />
                  <input value={scan_sku} onChange={e => setScanSku(e.target.value)}
                    placeholder="Scan hoặc nhập mã SKU..."
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "#1e293b", border: "1px solid #38bdf840", color: "white" }} autoFocus />
                </div>
              </div>
              {/* Lý do */}
              <div>
                <label className="text-[10px] font-black uppercase mb-2 block" style={{ color: "#475569" }}>Lý do *</label>
                <div className="space-y-1.5">
                  {(Object.entries(LY_DO_SU_CO_CONFIG) as [LyDoSuCo, any][]).map(([key, cfg]) => (
                    <button key={key} onClick={() => setLyDo(key)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
                      style={{ background: ly_do === key ? "#0c435425" : "#1e293b", border: `1px solid ${ly_do === key ? "#38bdf8" : "#334155"}`, color: ly_do === key ? "#38bdf8" : "#94a3b8" }}>
                      <span>{cfg.icon}</span>
                      <span className="text-xs font-bold">{cfg.nhan}</span>
                      {ly_do === key && <Check size={12} className="ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
              {(ly_do === "khac" || mo_ta) && (
                <div>
                  <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: ly_do === "khac" ? "#ef4444" : "#475569" }}>
                    Mô tả {ly_do === "khac" ? "* (bắt buộc)" : ""}
                  </label>
                  <textarea value={mo_ta} onChange={e => setMoTa(e.target.value)} rows={2}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none"
                    style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                </div>
              )}
              {/* Vị trí */}
              <div>
                <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>Vị trí kệ *</label>
                <select value={node_nguon} onChange={e => setNodeNguon(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }}>
                  <option value="">-- Chọn ô/bin --</option>
                  {leaf_nodes.map(n => <option key={n.id} value={n.id}>{tinh_location_code(n.id, MOCK_NODES)} — {n.ten}</option>)}
                </select>
              </div>
              {/* Số lượng */}
              <div>
                <label className="text-[10px] font-black uppercase mb-1.5 block" style={{ color: "#475569" }}>Số lượng *</label>
                <input type="number" min={1} value={so_luong} onChange={e => setSoLuong(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl text-sm font-black text-center outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "#ef4444" }} />
              </div>
              {/* Preview */}
              {node_nguon && (
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#0a1628", border: "1px solid #1e293b" }}>
                  <code className="text-sm font-black" style={{ color: "#a78bfa" }}>{tinh_location_code(node_nguon, MOCK_NODES)}</code>
                  <ArrowRight size={13} style={{ color: "#475569" }} />
                  <span className="text-sm font-black" style={{ color: "#ef4444" }}>Khu C</span>
                  <span className="text-[9px] ml-auto" style={{ color: "#334155" }}>Tự động</span>
                </div>
              )}
              {loi.length > 0 && (
                <div className="rounded-xl p-3 space-y-1" style={{ background: "#7f1d1d20", border: "1px solid #ef444430" }}>
                  {loi.map(l => <div key={l} className="flex items-center gap-2 text-xs" style={{ color: "#fca5a5" }}><AlertTriangle size={11} />{l}</div>)}
                </div>
              )}
            </div>
            <div className="flex gap-2 px-6 py-4 border-t flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
              <button onClick={() => { setShowForm(false); setLoi([]); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold" style={{ background: "#1e293b", color: "#64748b" }}>Huỷ</button>
              <button onClick={handle_tao}
                className="flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2"
                style={{ background: "#7f1d1d40", color: "#ef4444", border: "1px solid #ef444440" }}>
                <AlertCircle size={14} /> Xác nhận báo lỗi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "hang_hoan" | "su_co";

export default function ReturnsManager() {
  const [phieu_hang_hoan, setPhieuHangHoan] = useState<PhieuHangHoan[]>([]);
  const [phieu_su_co,     setPhieuSuCo]     = useState<PhieuSuCo[]>([]);
  const [loading,         setLoading]        = useState(true);
  const [active_tab,      setActiveTab]      = useState<ActiveTab>("hang_hoan");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const show_toast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    Promise.all([layDanhSachHangHoan(), layDanhSachSuCo()])
      .then(([hh, sc]) => { setPhieuHangHoan(hh); setPhieuSuCo(sc); setLoading(false); });
  }, []);

  const so_cho_xu_ly = useMemo(() =>
    phieu_hang_hoan.filter(p => ["cho_qc","dang_qc","cho_xu_ly"].includes(p.trang_thai)).length +
    phieu_su_co.filter(p => p.trang_thai === "cho_xu_ly").length,
    [phieu_hang_hoan, phieu_su_co]
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen" style={{ background: "#020817" }}>
      <p className="text-sm" style={{ color: "#475569" }}>Đang tải...</p>
    </div>;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative" style={{ background: "#020817" }}>
      <div className="flex border-b flex-shrink-0" style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        <div className="flex items-center gap-2 px-5 py-2 border-r" style={{ borderColor: "#1e293b" }}>
          <RotateCcw size={14} style={{ color: "#38bdf8" }} />
          <span className="text-sm font-black text-white">Sự cố & Hoàn</span>
          {so_cho_xu_ly > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black" style={{ background: "#ef444420", color: "#ef4444" }}>
              {so_cho_xu_ly}
            </span>
          )}
        </div>
        {([
          { id: "hang_hoan" as ActiveTab, label: "Hàng hoàn từ ĐVVC", icon: Truck },
          { id: "su_co"     as ActiveTab, label: "Sự cố trong kho",    icon: AlertCircle },
        ]).map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all"
            style={{ color: active_tab === id ? "#38bdf8" : "#475569", borderBottom: active_tab === id ? "2px solid #38bdf8" : "2px solid transparent" }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {active_tab === "hang_hoan" && (
          <TabHangHoan
            phieu_list={phieu_hang_hoan}
            on_tao={async p => { const saved = await taoPhieuHangHoan(p); setPhieuHangHoan(prev => [saved, ...prev]); show_toast(`Đã tiếp nhận ${saved.ma_phieu} — ${saved.danh_sach.length} SKU cần QC`); }}
            on_update={async p => { const saved = await capNhatPhieuHangHoan(p); setPhieuHangHoan(prev => prev.map(x => x.id === saved.id ? saved : x)); }}
            on_toast={show_toast}
          />
        )}
        {active_tab === "su_co" && (
          <TabSuCo
            phieu_list={phieu_su_co}
            on_tao={async p => { const saved = await taoPhieuSuCo(p); setPhieuSuCo(prev => [saved, ...prev]); }}
            on_update={async p => { const saved = await capNhatPhieuSuCo(p); setPhieuSuCo(prev => prev.map(x => x.id === saved.id ? saved : x)); }}
            on_toast={show_toast}
          />
        )}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}