import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      // 1. Lấy URL từ biến môi trường (http://localhost:5000/api)
      // const apiUrl = import.meta.env.VITE_API_URL;

      // 2. Gọi lên Backend
      // const response = await fetch(`${apiUrl}/auth/login`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ username, password }),
      // });

      // const data = await response.json();

      //Giả lập response từ Backend (xóa đoạn này khi có backend thật)
      const response = { ok: false }; // Giả lập response thành công
      if(username === "admin" && password === "admin123") {
        response.ok = true;
      }
      const data = {
        user: {"id":1,"username":"admin","name":"Admin May Mặc","role":"admin"},
        token: "fake-jwt-token",
        message: "Đăng nhập thành công!"
      }

      if (response.ok) {
        // Đăng nhập ngon lành -> Lưu data và nhảy vào trong
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        navigate("/manage");
      } else {
        // Backend trả về lỗi (401, 404...)
        setError(data.message || "Có lỗi xảy ra!");
      }
    } catch (err) {
      console.error("Lỗi kết nối:", err);
      setError("Không gọi được Backend mày ơi! Kiểm tra xem server chạy chưa?");
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Hiệu ứng nền mờ ảo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-blue-600/20 text-blue-500 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Chào mừng trở lại!
          </h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">
            Hệ thống Quản lý May Mặc Chuyên Nghiệp
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">
              Tài khoản
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="Tên đăng nhập"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-bold ml-1">
              Mật khẩu
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-12 text-white outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs text-center font-medium"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            Đăng nhập
          </button>
        </form>

        <p className="text-center text-slate-500 text-xs mt-8">
          © 2026 DoanhNhanFu Version 1.0.0
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
