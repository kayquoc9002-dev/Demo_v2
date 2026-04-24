import {
  ShoppingBag,
  DollarSign,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  isUp: boolean;
  icon: LucideIcon;
  color: string;
}

const StatCard = ({
  label,
  value,
  change,
  isUp,
  icon: Icon,
  color,
}: StatCardProps) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 transition-all duration-300 group shadow-lg">
    <div className="flex justify-between items-start">
      <div
        className={`p-2 rounded-lg bg-slate-800 ${color} group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} />
      </div>
      <div
        className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-emerald-400" : "text-rose-400"}`}
      >
        {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <div className="mt-4">
      <p className="text-sm text-slate-400 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-white mt-1 tracking-tight">
        {value}
      </h3>
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header của nội dung */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Chào mừng mày quay trở lại. Đây là những gì đang diễn ra tại xưởng.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors border border-slate-700">
            Xuất báo cáo
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-blue-500/20 transition-all">
            + Tạo đơn mới
          </button>
        </div>
      </div>

      {/* Grid 4 thẻ thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Đơn hàng mới"
          value="156 đơn"
          change="12.5%"
          isUp={true}
          icon={ShoppingBag}
          color="text-blue-400"
        />
        <StatCard
          label="Doanh thu tháng"
          value="842.000.000đ"
          change="8.2%"
          isUp={true}
          icon={DollarSign}
          color="text-emerald-400"
        />
        <StatCard
          label="Hiệu suất xưởng"
          value="94.2%"
          change="2.1%"
          isUp={false}
          icon={Activity}
          color="text-orange-400"
        />
        <StatCard
          label="Tồn kho vải"
          value="2,450 m"
          change="Ổn định"
          isUp={true}
          icon={Layers}
          color="text-purple-400"
        />
      </div>

      {/* Phần thân dưới: Biểu đồ và Hoạt động */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 min-h-[400px] flex flex-col shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg">
              Phân tích sản lượng
            </h3>
            <select className="bg-slate-800 border-slate-700 text-xs text-slate-300 rounded-md px-2 py-1 outline-none border">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-700 rounded-2xl text-slate-500 italic text-sm">
            [ Khu vực hiển thị biểu đồ sản xuất ]
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col shadow-xl">
          <h3 className="font-bold text-white text-lg mb-6">
            Hoạt động gần đây
          </h3>
          <div className="space-y-6 flex-1">
            {[
              {
                time: "10 phút trước",
                desc: "Lô hàng #1234 đã hoàn tất may",
                type: "success",
              },
              {
                time: "1 giờ trước",
                desc: "Nhập kho 500m vải lụa xanh",
                type: "info",
              },
              {
                time: "3 giờ trước",
                desc: "Cảnh báo: Máy may số 4 bảo trì",
                type: "warning",
              },
              {
                time: "5 giờ trước",
                desc: "Đơn hàng #1235 bị hủy",
                type: "error",
              },
            ].map((act, i) => (
              <div key={i} className="flex gap-4 relative">
                {i !== 3 && (
                  <div className="absolute left-[11px] top-6 w-[2px] h-10 bg-slate-800"></div>
                )}
                <div
                  className={`w-[24px] h-[24px] rounded-full border-4 border-[#09090b] z-10 ${
                    act.type === "success"
                      ? "bg-emerald-500"
                      : act.type === "info"
                        ? "bg-blue-500"
                        : act.type === "warning"
                          ? "bg-orange-500"
                          : "bg-rose-500"
                  }`}
                ></div>
                <div>
                  <p className="text-sm text-slate-200 leading-none">
                    {act.desc}
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full py-2 mt-4 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors border-t border-slate-800 pt-4 uppercase tracking-wider">
            Xem tất cả hoạt động
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
