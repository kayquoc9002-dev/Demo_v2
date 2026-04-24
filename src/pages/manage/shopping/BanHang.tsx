import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Package, FileText, ClipboardList,
  Search, Plus, Minus, Trash2, CreditCard, Banknote,
  QrCode, ChevronRight, Tag, Users, TrendingUp,
  CheckCircle, Clock, XCircle, Printer, Download,
  Building2, Phone, MapPin, Shirt
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface Product {
  id: number; ma: string; ten: string;
  gia: number; giaSi?: number; ton: number;
  loai: string; donVi: string;
}

interface CartItem extends Product { soLuong: number; ghiChu?: string; }

interface Order {
  id: string; loai: "le" | "si" | "pos";
  khachHang: string; tongTien: number;
  trangThai: "choXuLy" | "daThanhToan" | "daHuy" | "dangGiao";
  ngay: string; soSanPham: number;
}

// ─── Mock data ────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id:1,  ma:"SP001", ten:"Áo thun cotton basic",     gia:120000,  giaSi:90000,  ton:150, loai:"Áo",  donVi:"cái" },
  { id:2,  ma:"SP002", ten:"Quần jean skinny",          gia:350000,  giaSi:280000, ton:80,  loai:"Quần",donVi:"cái" },
  { id:3,  ma:"SP003", ten:"Áo sơ mi lụa trắng",       gia:280000,  giaSi:220000, ton:60,  loai:"Áo",  donVi:"cái" },
  { id:4,  ma:"SP004", ten:"Váy midi floral",           gia:420000,  giaSi:340000, ton:45,  loai:"Váy", donVi:"cái" },
  { id:5,  ma:"SP005", ten:"Áo khoác bomber",           gia:680000,  giaSi:540000, ton:30,  loai:"Áo",  donVi:"cái" },
  { id:6,  ma:"SP006", ten:"Quần short kaki",           gia:180000,  giaSi:140000, ton:120, loai:"Quần",donVi:"cái" },
  { id:7,  ma:"SP007", ten:"Đầm wrap dress",            gia:520000,  giaSi:420000, ton:25,  loai:"Váy", donVi:"cái" },
  { id:8,  ma:"SP008", ten:"Áo polo pique",             gia:220000,  giaSi:175000, ton:90,  loai:"Áo",  donVi:"cái" },
  { id:9,  ma:"SP009", ten:"Set đồ bộ thể thao",        gia:380000,  giaSi:300000, ton:55,  loai:"Set", donVi:"bộ"  },
  { id:10, ma:"SP010", ten:"Quần tây công sở",          gia:460000,  giaSi:370000, ton:40,  loai:"Quần",donVi:"cái" },
];

const MOCK_CUSTOMERS = [
  { id:1, ten:"Nguyễn Thị Lan",  sdt:"0901234567", diaChi:"123 Lê Lợi, Q1, HCM" },
  { id:2, ten:"Công ty ABC",      sdt:"0281234567", diaChi:"456 Nguyễn Văn Linh, Q7" },
  { id:3, ten:"Shop Thời Trang X",sdt:"0902345678", diaChi:"789 CMT8, Q3, HCM" },
  { id:4, ten:"Trần Văn Minh",   sdt:"0903456789", diaChi:"321 Điện Biên Phủ, Q10" },
];

const MOCK_ORDERS: Order[] = [
  { id:"DH001", loai:"pos", khachHang:"Khách lẻ",         tongTien:470000,  trangThai:"daThanhToan", ngay:"06/03/2026", soSanPham:3 },
  { id:"DH002", loai:"si",  khachHang:"Công ty ABC",       tongTien:8400000, trangThai:"choXuLy",     ngay:"06/03/2026", soSanPham:24 },
  { id:"DH003", loai:"le",  khachHang:"Nguyễn Thị Lan",   tongTien:1240000, trangThai:"dangGiao",    ngay:"05/03/2026", soSanPham:4 },
  { id:"DH004", loai:"si",  khachHang:"Shop Thời Trang X", tongTien:15600000,trangThai:"daThanhToan", ngay:"05/03/2026", soSanPham:48 },
  { id:"DH005", loai:"le",  khachHang:"Trần Văn Minh",    tongTien:680000,  trangThai:"daHuy",       ngay:"04/03/2026", soSanPham:2 },
  { id:"DH006", loai:"pos", khachHang:"Khách lẻ",         tongTien:220000,  trangThai:"daThanhToan", ngay:"04/03/2026", soSanPham:1 },
];

// ─── Helpers ──────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString("vi-VN") + "đ";

const STATUS_CFG = {
  choXuLy:     { label:"Chờ xử lý",   cls:"text-amber-400  bg-amber-400/10  border-amber-400/20"  },
  daThanhToan: { label:"Đã thanh toán",cls:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20"},
  daHuy:       { label:"Đã hủy",      cls:"text-rose-400   bg-rose-400/10   border-rose-400/20"   },
  dangGiao:    { label:"Đang giao",   cls:"text-blue-400   bg-blue-400/10   border-blue-400/20"   },
};

const LOAI_CFG = {
  pos: { label:"POS",    cls:"text-violet-400 bg-violet-400/10 border-violet-400/20" },
  le:  { label:"Đơn lẻ", cls:"text-sky-400    bg-sky-400/10    border-sky-400/20"    },
  si:  { label:"Đơn sỉ", cls:"text-orange-400 bg-orange-400/10 border-orange-400/20" },
};

// ─── Sidebar nav items ────────────────────────────────────
const NAV = [
  { id:"pos",     label:"POS Bán lẻ",       icon:QrCode,       desc:"Thanh toán nhanh tại quầy" },
  { id:"le",      label:"Đơn lẻ",           icon:FileText,     desc:"Tạo đơn, xuất hóa đơn" },
  { id:"si",      label:"Đơn sỉ",           icon:Building2,    desc:"Báo giá, chiết khấu, hợp đồng" },
  { id:"orders",  label:"Quản lý đơn hàng", icon:ClipboardList,desc:"Danh sách & trạng thái" },
];

// ═══════════════════════════════════════════════════════════
// POS VIEW
// ═══════════════════════════════════════════════════════════
const POSView = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [payMethod, setPayMethod] = useState<"tien_mat"|"chuyen_khoan"|"qr">("tien_mat");
  const [paid, setPaid] = useState(false);

  const filtered = MOCK_PRODUCTS.filter(p =>
    p.ten.toLowerCase().includes(search.toLowerCase()) || p.ma.includes(search)
  );

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, soLuong: i.soLuong + 1 } : i);
      return [...prev, { ...p, soLuong: 1 }];
    });
  };

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.id === id
      ? { ...i, soLuong: Math.max(0, i.soLuong + delta) }
      : i).filter(i => i.soLuong > 0)
    );
  };

  const total = cart.reduce((s, i) => s + i.gia * i.soLuong, 0);
  const itemCount = cart.reduce((s, i) => s + i.soLuong, 0);

  if (paid) return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
      className="flex flex-col items-center justify-center h-full gap-6 py-20">
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",bounce:0.5,delay:0.1}}
        className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center">
        <CheckCircle size={40} className="text-emerald-400" />
      </motion.div>
      <div className="text-center">
        <p className="text-2xl font-black text-white">Thanh toán thành công!</p>
        <p className="text-slate-500 mt-1">{fmt(total)} · {itemCount} sản phẩm</p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all">
          <Printer size={14}/> In hóa đơn
        </button>
        <button onClick={() => { setCart([]); setPaid(false); }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-500 transition-all">
          <Plus size={14}/> Đơn mới
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="flex gap-4 h-full min-h-0">
      {/* Left — product grid */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm sản phẩm hoặc quét mã..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"/>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-2">
            {filtered.map(p => (
              <button key={p.id} onClick={() => addToCart(p)}
                className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3 text-left transition-all hover:bg-slate-800/60">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-600">{p.ma}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${p.ton > 50 ? "bg-emerald-500/10 text-emerald-400" : p.ton > 10 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>
                    {p.ton} {p.donVi}
                  </span>
                </div>
                <p className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-2">{p.ten}</p>
                <p className="text-base font-black text-emerald-400 font-mono">{fmt(p.gia)}</p>
                <div className="mt-2 w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/40 group-hover:bg-emerald-500/70 transition-all"
                    style={{width:`${Math.min(100, (p.ton/200)*100)}%`}}/>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right — cart */}
      <div className="w-72 xl:w-80 flex flex-col gap-3 flex-shrink-0">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingCart size={14} className="text-emerald-400"/> Giỏ hàng
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">{itemCount}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar min-h-0">
          <AnimatePresence>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-700">
                <ShoppingCart size={28} className="mb-2 opacity-40"/>
                <p className="text-xs">Chưa có sản phẩm</p>
              </div>
            ) : cart.map(item => (
              <motion.div key={item.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-xs font-semibold text-white leading-tight flex-1">{item.ten}</p>
                  <button onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                    className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0"><Trash2 size={12}/></button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all">
                      <Minus size={10}/>
                    </button>
                    <span className="w-7 text-center text-sm font-black text-white font-mono">{item.soLuong}</span>
                    <button onClick={() => updateQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all">
                      <Plus size={10}/>
                    </button>
                  </div>
                  <span className="text-sm font-black text-emerald-400 font-mono">{fmt(item.gia * item.soLuong)}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Payment */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Tổng cộng</span>
            <span className="text-xl font-black text-white font-mono">{fmt(total)}</span>
          </div>
          {/* Pay methods */}
          <div className="grid grid-cols-3 gap-1.5">
            {([
              { k:"tien_mat",     label:"Tiền mặt", icon:Banknote },
              { k:"chuyen_khoan", label:"CK",        icon:CreditCard },
              { k:"qr",           label:"QR",         icon:QrCode },
            ] as const).map(({k, label, icon:Icon}) => (
              <button key={k} onClick={() => setPayMethod(k)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  payMethod === k ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600"
                }`}>
                <Icon size={14}/>{label}
              </button>
            ))}
          </div>
          <button onClick={() => cart.length > 0 && setPaid(true)}
            disabled={cart.length === 0}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
            <CreditCard size={14}/> Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ĐƠN LẺ VIEW
// ═══════════════════════════════════════════════════════════
const DonLeView = () => {
  const [step, setStep]     = useState<1|2|3>(1);
  const [khachHang, setKH]  = useState<typeof MOCK_CUSTOMERS[0]|null>(null);
  const [items, setItems]   = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [note, setNote]     = useState("");

  const addItem = (p: Product) => {
    setItems(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? {...i, soLuong: i.soLuong+1} : i);
      return [...prev, {...p, soLuong:1}];
    });
  };

  const total = items.reduce((s, i) => s + i.gia * i.soLuong, 0);

  const StepDot = ({n, label}: {n:number; label:string}) => (
    <div className="flex items-center gap-2">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
        step > n ? "bg-emerald-500 border-emerald-500 text-white"
        : step === n ? "bg-transparent border-emerald-400 text-emerald-400"
        : "bg-transparent border-slate-700 text-slate-600"
      }`}>{step > n ? <CheckCircle size={14}/> : n}</div>
      <span className={`text-xs font-bold ${step >= n ? "text-white" : "text-slate-600"}`}>{label}</span>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Stepper */}
      <div className="flex items-center gap-3">
        <StepDot n={1} label="Chọn khách hàng"/>
        <div className="flex-1 h-px bg-slate-800"/>
        <StepDot n={2} label="Chọn sản phẩm"/>
        <div className="flex-1 h-px bg-slate-800"/>
        <StepDot n={3} label="Xác nhận đơn"/>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 — KH */}
        {step === 1 && (
          <motion.div key="s1" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-3">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Chọn khách hàng</p>
            {MOCK_CUSTOMERS.map(kh => (
              <button key={kh.id} onClick={() => { setKH(kh); setStep(2); }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  khachHang?.id === kh.id ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900/60 border-slate-800 hover:border-slate-600"
                }`}>
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-black text-emerald-400">
                  {kh.ten.split(" ").slice(-1)[0][0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{kh.ten}</p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <Phone size={9}/>{kh.sdt} · <MapPin size={9}/>{kh.diaChi}
                  </p>
                </div>
                <ChevronRight size={14} className="text-slate-600"/>
              </button>
            ))}
            <button className="w-full py-2.5 border border-dashed border-slate-700 rounded-xl text-sm text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-all flex items-center justify-center gap-2">
              <Plus size={13}/> Thêm khách hàng mới
            </button>
          </motion.div>
        )}

        {/* Step 2 — Products */}
        {step === 2 && (
          <motion.div key="s2" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Chọn sản phẩm</p>
              <button onClick={() => setStep(1)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Quay lại</button>
            </div>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"/>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto custom-scrollbar">
              {MOCK_PRODUCTS.filter(p => p.ten.toLowerCase().includes(search.toLowerCase())).map(p => (
                <button key={p.id} onClick={() => addItem(p)}
                  className="flex items-center gap-3 p-3 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 rounded-xl text-left transition-all">
                  <Shirt size={16} className="text-slate-600 flex-shrink-0"/>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{p.ten}</p>
                    <p className="text-xs text-emerald-400 font-mono font-black">{fmt(p.gia)}</p>
                  </div>
                  <Plus size={13} className="text-slate-600 flex-shrink-0"/>
                </button>
              ))}
            </div>
            {/* Items added */}
            {items.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="flex-1 text-xs text-slate-300 truncate">{item.ten}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setItems(p => p.map(i => i.id===item.id?{...i,soLuong:Math.max(0,i.soLuong-1)}:i).filter(i=>i.soLuong>0))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-all"><Minus size={9}/></button>
                      <span className="w-6 text-center text-xs font-black text-white font-mono">{item.soLuong}</span>
                      <button onClick={() => setItems(p => p.map(i => i.id===item.id?{...i,soLuong:i.soLuong+1}:i))}
                        className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center hover:bg-slate-700 transition-all"><Plus size={9}/></button>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono w-20 text-right">{fmt(item.gia*item.soLuong)}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => items.length > 0 && setStep(3)} disabled={items.length === 0}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
              Tiếp theo <ChevronRight size={14}/>
            </button>
          </motion.div>
        )}

        {/* Step 3 — Confirm */}
        {step === 3 && (
          <motion.div key="s3" initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20}} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Xác nhận đơn hàng</p>
              <button onClick={() => setStep(2)} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Quay lại</button>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Users size={14} className="text-slate-500"/>
                <span className="text-sm font-bold text-white">{khachHang?.ten}</span>
                <span className="text-xs text-slate-600">{khachHang?.sdt}</span>
              </div>
              <div className="h-px bg-slate-800"/>
              {items.map(i => (
                <div key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">{i.ten} <span className="text-slate-600">×{i.soLuong}</span></span>
                  <span className="font-black text-white font-mono">{fmt(i.gia*i.soLuong)}</span>
                </div>
              ))}
              <div className="h-px bg-slate-800"/>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Tổng cộng</span>
                <span className="text-xl font-black text-emerald-400 font-mono">{fmt(total)}</span>
              </div>
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Ghi chú đơn hàng (tùy chọn)..."
              rows={2}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all resize-none"/>
            <div className="flex gap-3">
              <button className="flex-1 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                <Printer size={13}/> In hóa đơn
              </button>
              <button onClick={() => { setStep(1); setKH(null); setItems([]); setNote(""); }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                <CheckCircle size={13}/> Xác nhận
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ĐƠN SỈ VIEW
// ═══════════════════════════════════════════════════════════
const DonSiView = () => {
  const [khachHang] = useState(MOCK_CUSTOMERS[1]);
  const [items, setItems]  = useState<(CartItem & {chieuKhau:number})[]>([]);
  const [search, setSearch]= useState("");

  const addItem = (p: Product) => {
    if (items.find(i => i.id === p.id)) return;
    setItems(prev => [...prev, {...p, gia: p.giaSi ?? p.gia, soLuong:10, chieuKhau:0}]);
  };

  const updateItem = (id: number, field: "soLuong"|"chieuKhau", val: number) => {
    setItems(prev => prev.map(i => i.id === id ? {...i, [field]: Math.max(0, val)} : i));
  };

  const subtotal = items.reduce((s, i) => s + i.gia * i.soLuong, 0);
  const discountTotal = items.reduce((s, i) => s + i.gia * i.soLuong * (i.chieuKhau/100), 0);
  const total = subtotal - discountTotal;

  // Auto-discount tiers
  const getAutoDiscount = (qty: number) => qty >= 100 ? 15 : qty >= 50 ? 10 : qty >= 20 ? 5 : 0;

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Khách hàng sỉ</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-sm font-black text-orange-400">
              {khachHang.ten[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{khachHang.ten}</p>
              <p className="text-[11px] text-slate-500">{khachHang.sdt}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Chính sách chiết khấu</p>
          <div className="space-y-1">
            {[{qty:"≥ 20", pct:"5%"},{qty:"≥ 50", pct:"10%"},{qty:"≥ 100", pct:"15%"}].map((t,i)=>(
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-500">{t.qty} sản phẩm</span>
                <span className="font-bold text-orange-400">{t.pct}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add product */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm sản phẩm để thêm vào báo giá..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-orange-500/50 transition-all"/>
      </div>
      {search && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          {MOCK_PRODUCTS.filter(p => p.ten.toLowerCase().includes(search.toLowerCase()) && !items.find(i=>i.id===p.id)).slice(0,5).map(p => (
            <button key={p.id} onClick={() => { addItem(p); setSearch(""); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/60 transition-all text-left border-b border-slate-800/50 last:border-0">
              <Shirt size={14} className="text-slate-600"/>
              <span className="flex-1 text-sm text-white">{p.ten}</span>
              <span className="text-xs font-black text-orange-400 font-mono">{fmt(p.giaSi ?? p.gia)}</span>
              <span className="text-[10px] text-slate-600">Giá sỉ</span>
            </button>
          ))}
        </div>
      )}

      {/* Items table */}
      {items.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
            <span className="col-span-4">Sản phẩm</span>
            <span className="col-span-2 text-center">Đơn giá sỉ</span>
            <span className="col-span-2 text-center">Số lượng</span>
            <span className="col-span-2 text-center">CK%</span>
            <span className="col-span-2 text-right">Thành tiền</span>
          </div>
          {items.map(item => {
            const autoDisc = getAutoDiscount(item.soLuong);
            const eff = Math.max(item.chieuKhau, autoDisc);
            const thanh = item.gia * item.soLuong * (1 - eff/100);
            return (
              <div key={item.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-all">
                <div className="col-span-4">
                  <p className="text-xs font-semibold text-white">{item.ten}</p>
                  <p className="text-[10px] text-slate-600 font-mono">{item.ma}</p>
                </div>
                <div className="col-span-2 text-center text-xs font-black text-orange-400 font-mono">{fmt(item.gia)}</div>
                <div className="col-span-2 flex items-center justify-center gap-1">
                  <button onClick={() => updateItem(item.id,"soLuong",item.soLuong-10)}
                    className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] hover:bg-slate-700 transition-all">-</button>
                  <input type="number" value={item.soLuong} onChange={e => updateItem(item.id,"soLuong",Number(e.target.value))}
                    className="w-12 text-center text-xs font-black text-white bg-slate-800 border border-slate-700 rounded-lg py-0.5 outline-none focus:border-orange-500/50 font-mono"/>
                  <button onClick={() => updateItem(item.id,"soLuong",item.soLuong+10)}
                    className="w-5 h-5 rounded bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] hover:bg-slate-700 transition-all">+</button>
                </div>
                <div className="col-span-2 flex flex-col items-center gap-0.5">
                  <input type="number" value={item.chieuKhau} onChange={e => updateItem(item.id,"chieuKhau",Number(e.target.value))}
                    className="w-12 text-center text-xs font-black text-white bg-slate-800 border border-slate-700 rounded-lg py-0.5 outline-none focus:border-orange-500/50 font-mono"/>
                  {autoDisc > 0 && <span className="text-[9px] text-orange-400">Auto {autoDisc}%</span>}
                </div>
                <div className="col-span-2 text-right text-xs font-black text-white font-mono">{fmt(thanh)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="flex items-end justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Tổng trước CK:</span><span className="text-white font-mono font-bold">{fmt(subtotal)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Chiết khấu:</span><span className="text-orange-400 font-mono font-bold">-{fmt(discountTotal)}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-0.5">Tổng thanh toán</p>
            <p className="text-2xl font-black text-white font-mono">{fmt(total)}</p>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all">
            <Download size={13}/> Xuất báo giá
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all">
            <FileText size={13}/> Tạo hợp đồng
          </button>
          <button className="flex-1 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2">
            <CheckCircle size={13}/> Xác nhận đơn sỉ
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-16 text-slate-700">
          <Package size={32} className="mx-auto mb-3 opacity-30"/>
          <p className="text-sm">Tìm và thêm sản phẩm để tạo báo giá</p>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// ORDERS VIEW
// ═══════════════════════════════════════════════════════════
const OrdersView = () => {
  const [filterLoai,   setFilterLoai]   = useState<"all"|"pos"|"le"|"si">("all");
  const [filterStatus, setFilterStatus] = useState<"all"|Order["trangThai"]>("all");
  const [search, setSearch] = useState("");

  const filtered = MOCK_ORDERS.filter(o =>
    (filterLoai === "all" || o.loai === filterLoai) &&
    (filterStatus === "all" || o.trangThai === filterStatus) &&
    (o.id.includes(search) || o.khachHang.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = {
    total: MOCK_ORDERS.length,
    revenue: MOCK_ORDERS.filter(o=>o.trangThai==="daThanhToan").reduce((s,o)=>s+o.tongTien,0),
    pending: MOCK_ORDERS.filter(o=>o.trangThai==="choXuLy").length,
  };

  return (
    <div className="space-y-4">
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label:"Tổng đơn",      value:stats.total,               icon:ClipboardList, color:"text-slate-400" },
          { label:"Doanh thu",     value:fmt(stats.revenue),         icon:TrendingUp,    color:"text-emerald-400" },
          { label:"Chờ xử lý",    value:stats.pending,              icon:Clock,         color:"text-amber-400" },
        ].map((s,i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
            <s.icon size={18} className={s.color}/>
            <div>
              <p className="text-lg font-black text-white font-mono">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm mã đơn, khách hàng..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2 text-sm text-white placeholder:text-slate-600 outline-none focus:border-slate-500 transition-all"/>
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(["all","pos","le","si"] as const).map(v => (
            <button key={v} onClick={() => setFilterLoai(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterLoai===v ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {v === "all" ? "Tất cả" : v === "pos" ? "POS" : v === "le" ? "Đơn lẻ" : "Đơn sỉ"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
          {(["all","choXuLy","daThanhToan","dangGiao","daHuy"] as const).map(v => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus===v ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}>
              {v === "all" ? "Tất cả" : STATUS_CFG[v]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
          <span className="col-span-2">Mã đơn</span>
          <span className="col-span-1">Loại</span>
          <span className="col-span-3">Khách hàng</span>
          <span className="col-span-2 text-center">SP</span>
          <span className="col-span-2 text-right">Tổng tiền</span>
          <span className="col-span-2 text-right">Trạng thái</span>
        </div>
        <AnimatePresence>
          {filtered.map((o, i) => {
            const st  = STATUS_CFG[o.trangThai];
            const lt  = LOAI_CFG[o.loai];
            const StIcon = o.trangThai==="daThanhToan" ? CheckCircle : o.trangThai==="daHuy" ? XCircle : o.trangThai==="dangGiao" ? TrendingUp : Clock;
            return (
              <motion.div key={o.id} initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                className="grid grid-cols-12 gap-2 px-4 py-3.5 items-center border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-all group cursor-pointer">
                <span className="col-span-2 text-sm font-black text-white font-mono">{o.id}</span>
                <span className="col-span-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lt.cls}`}>{lt.label}</span>
                </span>
                <div className="col-span-3">
                  <p className="text-sm text-white font-semibold truncate">{o.khachHang}</p>
                  <p className="text-[10px] text-slate-600">{o.ngay}</p>
                </div>
                <span className="col-span-2 text-center text-sm font-bold text-slate-400">{o.soSanPham}</span>
                <span className="col-span-2 text-right text-sm font-black text-white font-mono">{fmt(o.tongTien)}</span>
                <span className="col-span-2 flex justify-end">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${st.cls}`}>
                    <StIcon size={9}/>{st.label}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-700">
            <ClipboardList size={28} className="mx-auto mb-2 opacity-30"/>
            <p className="text-sm">Không có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════
const BanHang = () => {
  const [active, setActive] = useState<"pos"|"le"|"si"|"orders">("pos");

  const views = { pos:<POSView/>, le:<DonLeView/>, si:<DonSiView/>, orders:<OrdersView/> };
  const current = NAV.find(n => n.id === active)!;

  return (
    <div className="flex gap-0 h-[calc(100vh-8rem)] min-h-0">

      {/* Sidebar */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-1 pr-4 border-r border-slate-800/60">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-3 mb-2">Bán hàng</p>
        {NAV.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id as typeof active)}
              className={`w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                isActive ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}>
              <Icon size={16} className={isActive ? "text-emerald-400 mt-0.5 flex-shrink-0" : "mt-0.5 flex-shrink-0"}/>
              <div>
                <p className="text-sm font-bold leading-tight">{item.label}</p>
                <p className={`text-[10px] mt-0.5 leading-tight ${isActive ? "text-slate-400" : "text-slate-700"}`}>{item.desc}</p>
              </div>
              {isActive && <motion.div layoutId="sidebar-active" className="ml-auto w-1 h-4 bg-emerald-400 rounded-full self-center flex-shrink-0"/>}
            </button>
          );
        })}

        {/* Quick stats */}
        <div className="mt-auto pt-4 border-t border-slate-800/60 space-y-2 px-1">
          <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Hôm nay</p>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Đơn hàng</span>
            <span className="font-black text-white font-mono">8</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-600">Doanh thu</span>
            <span className="font-black text-emerald-400 font-mono">24.1tr</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pl-6 flex flex-col gap-4 overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {(() => { const I = current.icon; return <I size={18} className="text-emerald-400"/>; })()}
              {current.label}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{current.desc}</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-700">
            <Tag size={10}/> Bán hàng <ChevronRight size={10}/> <span className="text-slate-400">{current.label}</span>
          </div>
        </div>

        {/* View content */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
          <AnimatePresence mode="wait">
            <motion.div key={active} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
              {views[active]}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default BanHang;
