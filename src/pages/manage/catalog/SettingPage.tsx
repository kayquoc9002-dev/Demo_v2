// ─────────────────────────────────────────────────────────────────────────────
// SettingsPage.tsx — Trang cài đặt Master Data
// Tab: Màu sắc | Size | Mùa vụ | Danh mục
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Check, X, GripVertical,
  Palette, Ruler, Calendar, Tag
} from "lucide-react";
import type { Color, Size, Season, Category } from "../../../components/DanhMucSanPham/catalogTypes";
import {
  layDanhSachColor, layDanhSachSize,
  layDanhSachSeason, layDanhSachCategory,
} from "../../../components/DanhMucSanPham/catalogService";
import {
  MOCK_COLORS, MOCK_SIZES, MOCK_SEASONS, MOCK_CATEGORIES,
} from "../../../components/DanhMucSanPham/data/catalogMockData";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function gen_id() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

// ─── Confirm xóa ─────────────────────────────────────────────────────────────

function ConfirmDelete({ ten, onConfirm, onClose }: {
  ten:       string;
  onConfirm: () => void;
  onClose:   () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(2,8,23,0.8)" }} onClick={onClose}>
      <div className="rounded-2xl p-6 w-80"
        style={{ background: "#0f172a", border: "1px solid #1e293b" }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "#7f1d1d20" }}>
            <Trash2 size={16} style={{ color: "#ef4444" }} />
          </div>
          <div>
            <p className="text-sm font-black text-white">Xác nhận xóa</p>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              Không thể hoàn tác
            </p>
          </div>
        </div>
        <p className="text-xs mb-5" style={{ color: "#64748b" }}>
          Xóa <span className="font-bold text-white">"{ten}"</span> khỏi hệ thống?
          Các sản phẩm đang dùng sẽ bị ảnh hưởng.
        </p>
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-bold"
            style={{ background: "#1e293b", color: "#64748b" }}>
            Huỷ
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 rounded-xl text-sm font-black"
            style={{ background: "#7f1d1d", color: "#fca5a5" }}>
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Màu sắc ─────────────────────────────────────────────────────────────

function TabMauSac() {
  const [colors,      setColors]    = useState<Color[]>([]);
  const [editing,     setEditing]   = useState<Color | null>(null);
  const [is_new,      setIsNew]     = useState(false);
  const [show_form_them, setShowFormThem] = useState(false);
  const [confirm_xoa, setConfirm]   = useState<Color | null>(null);
  const [form, setForm] = useState({ color_code: "", color_name: "", hex_code: "#000000" });
//   const [count, setCount] = useState(0);

  
  useEffect(() => { layDanhSachColor().then(setColors); }, []);
  
  console.log( colors);
  const open_edit = (c: Color) => {
    setEditing(c); setIsNew(false);
    setForm({ color_code: c.color_code, color_name: c.color_name, hex_code: c.hex_code });
  };

  const open_new = () => {
    // setEditing({ color_id: gen_id(), color_code: "", color_name: "", hex_code: "#000000" });
    setShowFormThem(true);
    setIsNew(true);
    setForm({ color_code: "", color_name: "", hex_code: "#000000" });
  };

  const handle_save = () => {
    if (!form.color_code || !form.color_name) return;
    const updated = { ...editing!, ...form, color_code: form.color_code.toUpperCase() };
    setEditing(null);
    setIsNew(false);
    setShowFormThem(false);
    
    if (is_new) {
      // Kiểm tra đã có trong mock chưa trước khi push
      const da_co = MOCK_COLORS.some(c => c.color_id === updated.color_id);
      console.log(da_co);
      console.log(colors);
      if (!da_co) MOCK_COLORS.push(updated); // ← chỉ push 1 lần
      setColors(prev => [...prev, updated]);
      console.log(colors);
    } else {
      const idx = MOCK_COLORS.findIndex(c => c.color_id === updated.color_id);
      if (idx >= 0) MOCK_COLORS[idx] = updated;
      setColors(prev => prev.map(c => c.color_id === updated.color_id ? updated : c));
    }
    console.log(colors);
  };
  

  const handle_xoa = (color: Color) => {
    const idx = MOCK_COLORS.findIndex(c => c.color_id === color.color_id);
    if (idx >= 0) MOCK_COLORS.splice(idx, 1);
    setColors(prev => prev.filter(c => c.color_id !== color.color_id));
    setConfirm(null);
  };

 
 
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "#475569" }}>
          {colors.length} màu sắc
        </p>
        <button onClick={open_new}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
          <Plus size={12} /> Thêm màu
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
        {/* Header */}
        <div className="grid px-4 py-2 text-[9px] font-black uppercase"
          style={{ gridTemplateColumns: "40px 80px 1fr 80px", background: "#0a1628",
            color: "#334155", borderBottom: "1px solid #1e293b" }}>
          <span>Màu</span>
          <span>Mã</span>
          <span>Tên</span>
          <span></span>
        </div>

        {colors.map((c, i) => (
          <div key={c.color_id}>
            {/* Row xem */}
            {editing?.color_id !== c.color_id ? (
              <div className="grid items-center px-4 py-3 gap-3"
                style={{ gridTemplateColumns: "40px 80px 1fr 80px",
                  borderBottom: i < colors.length - 1 ? "1px solid #0f172a" : "none" }}>
                <div className="w-7 h-7 rounded-lg border border-white/10 flex-shrink-0"
                  style={{ background: c.hex_code }} />
                <code className="text-xs font-black" style={{ color: "#64748b" }}>
                  {c.color_code}
                </code>
                <p className="text-sm text-white">{c.color_name}</p>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => open_edit(c)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 transition-all"
                    style={{ color: "#64748b" }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirm(c)}
                    className="p-1.5 rounded-lg hover:bg-red-900/20 transition-all"
                    style={{ color: "#475569" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                Hú
              </div>
            ) : (
              /* Row edit inline */
              <div className="grid items-center px-4 py-2 gap-2"
                style={{ gridTemplateColumns: "40px 80px 1fr 80px",
                  background: "#0c435410",
                  borderBottom: i < colors.length - 1 ? "1px solid #0f172a" : "none" }}>
                <div className="flex items-center gap-1">
                  <input type="color" value={form.hex_code}
                    onChange={e => setForm(p => ({ ...p, hex_code: e.target.value }))}
                    className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0.5"
                    style={{ background: "#1e293b" }} />
                </div>
                <input value={form.color_code}
                  onChange={e => setForm(p => ({ ...p, color_code: e.target.value.toUpperCase() }))}
                  placeholder="Mã *"
                  className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <input value={form.color_name}
                  onChange={e => setForm(p => ({ ...p, color_name: e.target.value }))}
                  placeholder="Tên màu *"
                  autoFocus
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={handle_save}
                    className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditing(null)}
                    className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                    <X size={13} />
                  </button>
                </div>
                He
              </div>
            )}
          </div>
        ))}

        {/* Row thêm mới */}
        {show_form_them && (
          <div className="grid items-center px-4 py-2 gap-2"
            style={{ gridTemplateColumns: "40px 80px 1fr 80px", background: "#06472510",
              borderTop: "1px solid #1e293b" }}>
            <div className="flex items-center">
              <input type="color" value={form.hex_code}
                onChange={e => setForm(p => ({ ...p, hex_code: e.target.value }))}
                className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0.5"
                style={{ background: "#1e293b" }} />
            </div>
            <input value={form.color_code}
              onChange={e => setForm(p => ({ ...p, color_code: e.target.value.toUpperCase() }))}
              placeholder="Mã *"
              className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <input value={form.color_name}
              onChange={e => setForm(p => ({ ...p, color_name: e.target.value }))}
              placeholder="Tên màu *" autoFocus
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <div className="flex items-center gap-1 justify-end">
              <button onClick={handle_save}
                className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                <Check size={13} />
              </button>
              <button onClick={() => setEditing(null)}
                className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                <X size={13} />
              </button>
            </div>
            Hello
          </div>
        )}
      </div>

      {confirm_xoa && (
        <ConfirmDelete ten={confirm_xoa.color_name}
          onConfirm={() => handle_xoa(confirm_xoa)}
          onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

// ─── Tab Size ─────────────────────────────────────────────────────────────────

function TabSize() {
  const [sizes,       setSizes]   = useState<Size[]>([]);
  const [editing,     setEditing] = useState<Size | null>(null);
  const [is_new,      setIsNew]   = useState(false);
  const [confirm_xoa, setConfirm] = useState<Size | null>(null);
  const [form, setForm] = useState({ size_code: "", sort_order: 99 });

  useEffect(() => { layDanhSachSize().then(setSizes); }, []);

  const open_edit = (s: Size) => {
    setEditing(s); setIsNew(false);
    setForm({ size_code: s.size_code, sort_order: s.sort_order });
  };

  const open_new = () => {
    const max_order = Math.max(0, ...sizes.map(s => s.sort_order));
    setEditing({ size_id: gen_id(), size_code: "", sort_order: max_order + 1 });
    setIsNew(true);
    setForm({ size_code: "", sort_order: max_order + 1 });
  };

  const handle_save = () => {
    if (!form.size_code) return;
    const updated = { ...editing!, ...form, size_code: form.size_code.toUpperCase() };
    if (is_new) {
      MOCK_SIZES.push(updated);
      setSizes(prev => [...prev, updated].sort((a, b) => a.sort_order - b.sort_order));
    } else {
      const idx = MOCK_SIZES.findIndex(s => s.size_id === updated.size_id);
      if (idx >= 0) MOCK_SIZES[idx] = updated;
      setSizes(prev => prev.map(s => s.size_id === updated.size_id ? updated : s)
        .sort((a, b) => a.sort_order - b.sort_order));
    }
    setEditing(null);
  };

  const handle_xoa = (size: Size) => {
    const idx = MOCK_SIZES.findIndex(s => s.size_id === size.size_id);
    if (idx >= 0) MOCK_SIZES.splice(idx, 1);
    setSizes(prev => prev.filter(s => s.size_id !== size.size_id));
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "#475569" }}>{sizes.length} size</p>
        <button onClick={open_new}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
          <Plus size={12} /> Thêm size
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
        <div className="grid px-4 py-2 text-[9px] font-black uppercase"
          style={{ gridTemplateColumns: "32px 1fr 80px 80px", background: "#0a1628",
            color: "#334155", borderBottom: "1px solid #1e293b" }}>
          <span></span>
          <span>Mã size</span>
          <span className="text-center">Thứ tự</span>
          <span></span>
        </div>

        {sizes.map((s, i) => (
          <div key={s.size_id}>
            {editing?.size_id !== s.size_id ? (
              <div className="grid items-center px-4 py-3 gap-3"
                style={{ gridTemplateColumns: "32px 1fr 80px 80px",
                  borderBottom: i < sizes.length - 1 ? "1px solid #0f172a" : "none" }}>
                <GripVertical size={13} style={{ color: "#334155" }} />
                <span className="text-sm font-black text-white">{s.size_code}</span>
                <span className="text-center text-xs" style={{ color: "#475569" }}>
                  {s.sort_order}
                </span>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => open_edit(s)}
                    className="p-1.5 rounded-lg hover:bg-slate-700 transition-all"
                    style={{ color: "#64748b" }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirm(s)}
                    className="p-1.5 rounded-lg hover:bg-red-900/20 transition-all"
                    style={{ color: "#475569" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid items-center px-4 py-2 gap-2"
                style={{ gridTemplateColumns: "32px 1fr 80px 80px",
                  background: "#0c435410",
                  borderBottom: i < sizes.length - 1 ? "1px solid #0f172a" : "none" }}>
                <GripVertical size={13} style={{ color: "#334155" }} />
                <input value={form.size_code}
                  onChange={e => setForm(p => ({ ...p, size_code: e.target.value.toUpperCase() }))}
                  placeholder="VD: XXL" autoFocus
                  className="px-2 py-1.5 rounded-lg text-sm font-black outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <input type="number" value={form.sort_order}
                  onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
                  className="px-2 py-1.5 rounded-lg text-xs text-center outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editing && is_new && (
          <div className="grid items-center px-4 py-2 gap-2"
            style={{ gridTemplateColumns: "32px 1fr 80px 80px",
              background: "#06472510", borderTop: "1px solid #1e293b" }}>
            <GripVertical size={13} style={{ color: "#334155" }} />
            <input value={form.size_code}
              onChange={e => setForm(p => ({ ...p, size_code: e.target.value.toUpperCase() }))}
              placeholder="VD: XXL" autoFocus
              className="px-2 py-1.5 rounded-lg text-sm font-black outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <input type="number" value={form.sort_order}
              onChange={e => setForm(p => ({ ...p, sort_order: Number(e.target.value) }))}
              className="px-2 py-1.5 rounded-lg text-xs text-center outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <div className="flex items-center gap-1 justify-end">
              <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                <Check size={13} />
              </button>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirm_xoa && (
        <ConfirmDelete ten={confirm_xoa.size_code}
          onConfirm={() => handle_xoa(confirm_xoa)}
          onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

// ─── Tab Mùa vụ ──────────────────────────────────────────────────────────────

function TabMuaVu() {
  const [seasons,     setSeasons]  = useState<Season[]>([]);
  const [editing,     setEditing]  = useState<Season | null>(null);
  const [is_new,      setIsNew]    = useState(false);
  const [confirm_xoa, setConfirm]  = useState<Season | null>(null);
  const [form, setForm] = useState({ season_code: "", season_name: "" });

  useEffect(() => { layDanhSachSeason().then(setSeasons); }, []);

  const open_edit = (s: Season) => {
    setEditing(s); setIsNew(false);
    setForm({ season_code: s.season_code, season_name: s.season_name });
  };

  const open_new = () => {
    setEditing({ season_id: gen_id(), season_code: "", season_name: "" });
    setIsNew(true); setForm({ season_code: "", season_name: "" });
  };

  const handle_save = () => {
    if (!form.season_code || !form.season_name) return;
    const updated = { ...editing!, ...form, season_code: form.season_code.toUpperCase() };
    if (is_new) {
      MOCK_SEASONS.push(updated);
      setSeasons(prev => [...prev, updated]);
    } else {
      const idx = MOCK_SEASONS.findIndex(s => s.season_id === updated.season_id);
      if (idx >= 0) MOCK_SEASONS[idx] = updated;
      setSeasons(prev => prev.map(s => s.season_id === updated.season_id ? updated : s));
    }
    setEditing(null);
  };

  const handle_xoa = (season: Season) => {
    const idx = MOCK_SEASONS.findIndex(s => s.season_id === season.season_id);
    if (idx >= 0) MOCK_SEASONS.splice(idx, 1);
    setSeasons(prev => prev.filter(s => s.season_id !== season.season_id));
    setConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "#475569" }}>{seasons.length} mùa vụ</p>
        <button onClick={open_new}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
          <Plus size={12} /> Thêm mùa vụ
        </button>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #1e293b" }}>
        <div className="grid px-4 py-2 text-[9px] font-black uppercase"
          style={{ gridTemplateColumns: "100px 1fr 80px", background: "#0a1628",
            color: "#334155", borderBottom: "1px solid #1e293b" }}>
          <span>Mã</span><span>Tên mùa vụ</span><span></span>
        </div>

        {seasons.map((s, i) => (
          <div key={s.season_id}>
            {editing?.season_id !== s.season_id ? (
              <div className="grid items-center px-4 py-3 gap-3"
                style={{ gridTemplateColumns: "100px 1fr 80px",
                  borderBottom: i < seasons.length - 1 ? "1px solid #0f172a" : "none" }}>
                <span className="text-xs font-black px-2 py-1 rounded-lg"
                  style={{ background: "#1e293b", color: "#38bdf8" }}>
                  {s.season_code}
                </span>
                <p className="text-sm text-white">{s.season_name}</p>
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={() => open_edit(s)}
                    className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#64748b" }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirm(s)}
                    className="p-1.5 rounded-lg hover:bg-red-900/20" style={{ color: "#475569" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid items-center px-4 py-2 gap-2"
                style={{ gridTemplateColumns: "100px 1fr 80px",
                  background: "#0c435410",
                  borderBottom: i < seasons.length - 1 ? "1px solid #0f172a" : "none" }}>
                <input value={form.season_code}
                  onChange={e => setForm(p => ({ ...p, season_code: e.target.value.toUpperCase() }))}
                  placeholder="SS25" autoFocus
                  className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <input value={form.season_name}
                  onChange={e => setForm(p => ({ ...p, season_name: e.target.value }))}
                  placeholder="Xuân Hè 2025"
                  className="px-2 py-1.5 rounded-lg text-xs outline-none"
                  style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                <div className="flex items-center gap-1 justify-end">
                  <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                    <Check size={13} />
                  </button>
                  <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                    <X size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {editing && is_new && (
          <div className="grid items-center px-4 py-2 gap-2"
            style={{ gridTemplateColumns: "100px 1fr 80px",
              background: "#06472510", borderTop: "1px solid #1e293b" }}>
            <input value={form.season_code}
              onChange={e => setForm(p => ({ ...p, season_code: e.target.value.toUpperCase() }))}
              placeholder="SS25" autoFocus
              className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <input value={form.season_name}
              onChange={e => setForm(p => ({ ...p, season_name: e.target.value }))}
              placeholder="Xuân Hè 2025"
              className="px-2 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
            <div className="flex items-center gap-1 justify-end">
              <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                <Check size={13} />
              </button>
              <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                <X size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      {confirm_xoa && (
        <ConfirmDelete ten={confirm_xoa.season_name}
          onConfirm={() => handle_xoa(confirm_xoa)}
          onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

// ─── Tab Danh mục ─────────────────────────────────────────────────────────────

function TabDanhMuc() {
  const [categories,  setCategories] = useState<Category[]>([]);
  const [editing,     setEditing]    = useState<Category | null>(null);
  const [is_new,      setIsNew]      = useState(false);
  const [confirm_xoa, setConfirm]    = useState<Category | null>(null);
  const [form, setForm] = useState({
    category_code: "", name: "", parent_id: null as string | null, status: "active" as "active" | "inactive",
  });

  useEffect(() => { layDanhSachCategory().then(setCategories); }, []);

  const cat_cha = categories.filter(c => !c.parent_id);

  const open_new = (parent_id: string | null = null) => {
    const new_cat: Category = { category_id: gen_id(), parent_id, category_code: "", name: "", status: "active" };
    setEditing(new_cat); setIsNew(true);
    setForm({ category_code: "", name: "", parent_id, status: "active" });
  };

  const open_edit = (c: Category) => {
    setEditing(c); setIsNew(false);
    setForm({ category_code: c.category_code, name: c.name, parent_id: c.parent_id, status: c.status });
  };

  const handle_save = () => {
    if (!form.category_code || !form.name) return;
    const updated = { ...editing!, ...form, category_code: form.category_code.toUpperCase() };
    if (is_new) {
      MOCK_CATEGORIES.push(updated);
      setCategories(prev => [...prev, updated]);
    } else {
      const idx = MOCK_CATEGORIES.findIndex(c => c.category_id === updated.category_id);
      if (idx >= 0) MOCK_CATEGORIES[idx] = updated;
      setCategories(prev => prev.map(c => c.category_id === updated.category_id ? updated : c));
    }
    setEditing(null);
  };

  const handle_xoa = (cat: Category) => {
    const ids_xoa = [cat.category_id, ...categories.filter(c => c.parent_id === cat.category_id).map(c => c.category_id)];
    ids_xoa.forEach(id => {
      const idx = MOCK_CATEGORIES.findIndex(c => c.category_id === id);
      if (idx >= 0) MOCK_CATEGORIES.splice(idx, 1);
    });
    setCategories(prev => prev.filter(c => !ids_xoa.includes(c.category_id)));
    setConfirm(null);
  };

  const InlineForm = () => (
    <div className="grid items-center px-4 py-2 gap-2"
      style={{ gridTemplateColumns: "24px 80px 1fr 80px",
        background: "#06472510", border: "1px solid #10b98130", borderRadius: 8, margin: "4px 0" }}>
      <span />
      <input value={form.category_code}
        onChange={e => setForm(p => ({ ...p, category_code: e.target.value.toUpperCase() }))}
        placeholder="Mã *" autoFocus
        className="px-2 py-1.5 rounded-lg text-xs font-mono outline-none"
        style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
      <input value={form.name}
        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
        placeholder="Tên danh mục *"
        className="px-2 py-1.5 rounded-lg text-xs outline-none"
        style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
      <div className="flex items-center gap-1">
        <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
          <Check size={13} />
        </button>
        <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
          <X size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px]" style={{ color: "#475569" }}>{categories.length} danh mục</p>
        <button onClick={() => open_new(null)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: "#0c435425", color: "#38bdf8", border: "1px solid #38bdf840" }}>
          <Plus size={12} /> Thêm danh mục cha
        </button>
      </div>

      {/* Form thêm danh mục cha mới */}
      {editing && is_new && !form.parent_id && <InlineForm />}

      <div className="space-y-2">
        {cat_cha.map(parent => {
          const children = categories.filter(c => c.parent_id === parent.category_id);
          return (
            <div key={parent.category_id} className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #1e293b" }}>
              {/* Danh mục cha */}
              <div className="flex items-center gap-3 px-4 py-3"
                style={{ background: "#0f172a", borderBottom: children.length > 0 ? "1px solid #1e293b" : "none" }}>
                {editing?.category_id === parent.category_id && !is_new ? (
                  <>
                    <input value={form.category_code}
                      onChange={e => setForm(p => ({ ...p, category_code: e.target.value.toUpperCase() }))}
                      className="px-2 py-1 rounded-lg text-xs font-mono outline-none w-20"
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} autoFocus />
                    <input value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      className="flex-1 px-2 py-1 rounded-lg text-sm outline-none"
                      style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                    <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                      <Check size={13} />
                    </button>
                    <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <>
                    <code className="text-xs font-black px-2 py-0.5 rounded"
                      style={{ background: "#1e293b", color: "#a78bfa" }}>
                      {parent.category_code}
                    </code>
                    <p className="text-sm font-bold text-white flex-1">{parent.name}</p>
                    <button onClick={() => open_new(parent.category_id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
                      style={{ background: "#1e293b", color: "#64748b" }}>
                      <Plus size={10} /> Thêm con
                    </button>
                    <button onClick={() => open_edit(parent)}
                      className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#64748b" }}>
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => setConfirm(parent)}
                      className="p-1.5 rounded-lg hover:bg-red-900/20" style={{ color: "#475569" }}>
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>

              {/* Form thêm con mới */}
              {editing && is_new && form.parent_id === parent.category_id && (
                <div className="px-2 py-1" style={{ background: "#0a1628" }}>
                  <InlineForm />
                </div>
              )}

              {/* Danh mục con */}
              
              {// eslint-disable-next-line @typescript-eslint/no-unused-vars
              children.map((child, i) => (
                <div key={child.category_id}
                  className="flex items-center gap-3 px-4 py-2.5 pl-10"
                  style={{ borderTop: "1px solid #0f172a" }}>
                  {editing?.category_id === child.category_id && !is_new ? (
                    <>
                      <input value={form.category_code}
                        onChange={e => setForm(p => ({ ...p, category_code: e.target.value.toUpperCase() }))}
                        className="px-2 py-1 rounded-lg text-xs font-mono outline-none w-16"
                        style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} autoFocus />
                      <input value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="flex-1 px-2 py-1 rounded-lg text-sm outline-none"
                        style={{ background: "#1e293b", border: "1px solid #334155", color: "white" }} />
                      <button onClick={handle_save} className="p-1.5 rounded-lg" style={{ color: "#10b981" }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg" style={{ color: "#475569" }}>
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <>
                      <span style={{ color: "#334155", fontSize: 10 }}>└</span>
                      <code className="text-[10px] font-black px-1.5 py-0.5 rounded"
                        style={{ background: "#1e293b", color: "#64748b" }}>
                        {child.category_code}
                      </code>
                      <p className="text-xs text-white flex-1">{child.name}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: child.status === "active" ? "#06472520" : "#1e293b",
                          color: child.status === "active" ? "#10b981" : "#475569" }}>
                        {child.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <button onClick={() => open_edit(child)}
                        className="p-1.5 rounded-lg hover:bg-slate-700" style={{ color: "#64748b" }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setConfirm(child)}
                        className="p-1.5 rounded-lg hover:bg-red-900/20" style={{ color: "#475569" }}>
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {confirm_xoa && (
        <ConfirmDelete ten={confirm_xoa.name}
          onConfirm={() => handle_xoa(confirm_xoa)}
          onClose={() => setConfirm(null)} />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type ActiveTab = "mau_sac" | "size" | "mua_vu" | "danh_muc";

export default function SettingsPage() {
  const [active_tab, setActiveTab] = useState<ActiveTab>("mau_sac");

  const TABS = [
    { id: "mau_sac"  as ActiveTab, label: "Màu sắc",   icon: Palette  },
    { id: "size"     as ActiveTab, label: "Size",       icon: Ruler    },
    { id: "mua_vu"   as ActiveTab, label: "Mùa vụ",    icon: Calendar },
    { id: "danh_muc" as ActiveTab, label: "Danh mục",  icon: Tag      },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: "#020817" }}>

      {/* Header */}
      <div className="px-6 py-5 border-b flex-shrink-0"
        style={{ borderColor: "#1e293b" }}>
        <h1 className="text-base font-black text-white">Cài đặt danh mục</h1>
        <p className="text-[11px] mt-0.5" style={{ color: "#475569" }}>
          Quản lý màu sắc, size, mùa vụ và danh mục sản phẩm
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b flex-shrink-0"
        style={{ borderColor: "#1e293b", background: "#0a1628" }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 px-5 py-3 text-xs font-bold transition-all"
            style={{
              color:        active_tab === id ? "#38bdf8" : "#475569",
              borderBottom: active_tab === id ? "2px solid #38bdf8" : "2px solid transparent",
            }}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5" style={{ scrollbarWidth: "thin" }}>
        <div style={{ maxWidth: 640 }}>
          {active_tab === "mau_sac"  && <TabMauSac />}
          {active_tab === "size"     && <TabSize />}
          {active_tab === "mua_vu"   && <TabMuaVu />}
          {active_tab === "danh_muc" && <TabDanhMuc />}
        </div>
      </div>
    </div>
  );
}