import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, Minus, Trash2, CreditCard,
  Banknote, QrCode, ShoppingCart, CheckCircle, Printer,
} from "lucide-react";

interface Product { id:number; ma:string; ten:string; gia:number; ton:number; loai:string; donVi:string; }
interface CartItem extends Product { soLuong:number; }

const MOCK_PRODUCTS: Product[] = [
  { id:1,  ma:"SP001", ten:"Áo thun cotton basic",  gia:120000, ton:150, loai:"Áo",   donVi:"cái" },
  { id:2,  ma:"SP002", ten:"Quần jean skinny",       gia:350000, ton:80,  loai:"Quần", donVi:"cái" },
  { id:3,  ma:"SP003", ten:"Áo sơ mi lụa trắng",    gia:280000, ton:60,  loai:"Áo",   donVi:"cái" },
  { id:4,  ma:"SP004", ten:"Váy midi floral",        gia:420000, ton:45,  loai:"Váy",  donVi:"cái" },
  { id:5,  ma:"SP005", ten:"Áo khoác bomber",        gia:680000, ton:30,  loai:"Áo",   donVi:"cái" },
  { id:6,  ma:"SP006", ten:"Quần short kaki",        gia:180000, ton:120, loai:"Quần", donVi:"cái" },
  { id:7,  ma:"SP007", ten:"Đầm wrap dress",         gia:520000, ton:25,  loai:"Váy",  donVi:"cái" },
  { id:8,  ma:"SP008", ten:"Áo polo pique",          gia:220000, ton:90,  loai:"Áo",   donVi:"cái" },
  { id:9,  ma:"SP009", ten:"Set đồ bộ thể thao",    gia:380000, ton:55,  loai:"Set",  donVi:"bộ"  },
  { id:10, ma:"SP010", ten:"Quần tây công sở",       gia:460000, ton:40,  loai:"Quần", donVi:"cái" },
];

const fmt = (n:number) => n.toLocaleString("vi-VN") + "đ";

export default function POSBanLe() {
  const [cart, setCart]         = useState<CartItem[]>([]);
  const [search, setSearch]     = useState("");
  const [payMethod, setPayMethod] = useState<"tien_mat"|"chuyen_khoan"|"qr">("tien_mat");
  const [paid, setPaid]         = useState(false);
  const [filterLoai, setFilter] = useState("");

  const categories = ["", ...Array.from(new Set(MOCK_PRODUCTS.map(p => p.loai)))];
  const filtered = MOCK_PRODUCTS.filter(p =>
    (p.ten.toLowerCase().includes(search.toLowerCase()) || p.ma.includes(search)) &&
    (filterLoai === "" || p.loai === filterLoai)
  );

  const addToCart = (p:Product) => setCart(prev => {
    const ex = prev.find(i => i.id === p.id);
    if (ex) return prev.map(i => i.id===p.id ? {...i, soLuong:i.soLuong+1} : i);
    return [...prev, {...p, soLuong:1}];
  });

  const updateQty = (id:number, delta:number) =>
    setCart(prev => prev.map(i => i.id===id ? {...i, soLuong:Math.max(0,i.soLuong+delta)} : i).filter(i=>i.soLuong>0));

  const total     = cart.reduce((s,i) => s+i.gia*i.soLuong, 0);
  const itemCount = cart.reduce((s,i) => s+i.soLuong, 0);

  if (paid) return (
    <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
      className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",bounce:0.5,delay:0.1}}
        className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-400/40 flex items-center justify-center">
        <CheckCircle size={48} className="text-emerald-400"/>
      </motion.div>
      <div className="text-center">
        <p className="text-3xl font-black text-white">Thanh toán thành công!</p>
        <p className="text-slate-400 mt-2">{fmt(total)} · {itemCount} sản phẩm</p>
      </div>
      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all">
          <Printer size={14}/> In hóa đơn
        </button>
        <button onClick={() => { setCart([]); setPaid(false); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-500 transition-all">
          <Plus size={14}/> Đơn mới
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="p-6 h-full flex flex-col gap-4 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-3">
          <QrCode size={22} className="text-emerald-400"/> POS Bán lẻ
        </h1>
        <p className="text-sm text-slate-500 mt-1">Thanh toán nhanh tại quầy — quét mã hoặc chọn sản phẩm</p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left — products */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          {/* Search + filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Tìm sản phẩm hoặc quét mã..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50 transition-all"/>
            </div>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
              {categories.map(c => (
                <button key={c} onClick={()=>setFilter(c)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterLoai===c?"bg-slate-700 text-white":"text-slate-500 hover:text-slate-300"}`}>
                  {c||"Tất cả"}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2.5">
              {filtered.map(p => (
                <button key={p.id} onClick={()=>addToCart(p)}
                  className="group bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-xl p-3.5 text-left transition-all hover:bg-slate-800/60 hover:shadow-lg hover:shadow-emerald-500/5 active:scale-[0.98]">
                  <div className="flex items-start justify-between mb-2.5">
                    <span className="text-[10px] font-mono text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">{p.ma}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${p.ton>50?"bg-emerald-500/10 text-emerald-400":p.ton>10?"bg-amber-500/10 text-amber-400":"bg-rose-500/10 text-rose-400"}`}>
                      {p.ton} {p.donVi}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-white leading-tight line-clamp-2 mb-3">{p.ten}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-emerald-400 font-mono">{fmt(p.gia)}</p>
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Plus size={13} className="text-emerald-400"/>
                    </div>
                  </div>
                  <div className="mt-2.5 w-full h-0.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/40 group-hover:bg-emerald-500/60 transition-all rounded-full"
                      style={{width:`${Math.min(100,(p.ton/200)*100)}%`}}/>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — cart */}
        <div className="w-72 xl:w-80 flex flex-col gap-3 flex-shrink-0">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-black text-white flex items-center gap-2">
              <ShoppingCart size={15} className="text-emerald-400"/> Giỏ hàng
            </span>
            {itemCount > 0 && (
              <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">{itemCount} món</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar min-h-0">
            <AnimatePresence>
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-slate-700">
                  <ShoppingCart size={32} className="mb-3 opacity-30"/>
                  <p className="text-xs">Chưa có sản phẩm nào</p>
                  <p className="text-[10px] mt-1 text-slate-800">Click sản phẩm để thêm</p>
                </div>
              ) : cart.map(item => (
                <motion.div key={item.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:20,height:0}}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-white leading-tight flex-1">{item.ten}</p>
                    <button onClick={()=>setCart(c=>c.filter(i=>i.id!==item.id))}
                      className="text-slate-700 hover:text-rose-400 transition-colors flex-shrink-0"><Trash2 size={12}/></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button onClick={()=>updateQty(item.id,-1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all">
                        <Minus size={10}/>
                      </button>
                      <span className="w-7 text-center text-sm font-black text-white font-mono">{item.soLuong}</span>
                      <button onClick={()=>updateQty(item.id,1)}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center transition-all">
                        <Plus size={10}/>
                      </button>
                    </div>
                    <span className="text-sm font-black text-emerald-400 font-mono">{fmt(item.gia*item.soLuong)}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Payment panel */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-500">{itemCount} sản phẩm</span>
              <span className="text-2xl font-black text-white font-mono">{fmt(total)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                {k:"tien_mat",     label:"Tiền mặt", icon:Banknote},
                {k:"chuyen_khoan", label:"CK",        icon:CreditCard},
                {k:"qr",           label:"QR",         icon:QrCode},
              ] as const).map(({k,label,icon:Icon})=>(
                <button key={k} onClick={()=>setPayMethod(k)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-bold border transition-all ${payMethod===k?"bg-emerald-500/15 border-emerald-500/40 text-emerald-400":"bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600 hover:text-slate-400"}`}>
                  <Icon size={15}/>{label}
                </button>
              ))}
            </div>
            <button onClick={()=>cart.length>0&&setPaid(true)} disabled={cart.length===0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98]">
              <CreditCard size={15}/> Thanh toán ngay
            </button>
            {cart.length > 0 && (
              <button onClick={()=>setCart([])}
                className="w-full py-2 text-xs text-slate-600 hover:text-rose-400 transition-colors">
                Xóa giỏ hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
