import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import ManageLayout from "./layouts/ManageLayout";

//import thêm các trang mới ở đây
import Login from "./pages/Login";
import Home from "./pages/Home";

const Dashboard = lazy(() => import("./pages/manage/Dashboard"));
const ChucVuPhongBan = lazy(() => import("./pages/manage/hr/ChucVuPhongBan"));
const NhanVien = lazy(() => import("./pages/manage/hr/NhanVien"));
const KhachHang = lazy(() => import("./pages/manage/service/khachhang"));
const DoiTacvaNhaPhanPhoi = lazy(
  () => import("./pages/manage/service/DoiTacvaNhaPhanPhoi"),
);

// ─── Quản lý kho ────────────────────────────────
const Kho = lazy(() => import("./pages/manage/warehouse/KhoDashboard"));
const NhapXuatKho = lazy(() => import("./pages/manage/warehouse/XuatNhapKho"));
const NhapKho = lazy(() => import("./pages/manage/warehouse/InboundManager"));
const XuatKho = lazy(() => import("./pages/manage/warehouse/OutboundManager"));
const ViTriHang = lazy(
  () => import("./pages/manage/warehouse/WarehouseLayout"),
);
const QuanLySku = lazy(() => import("./pages/manage/warehouse/SkuRuleManager"));

// ─── Bán hàng (nhân viên) ────────────────────────────────
const TheoDonHang = lazy(
  () => import("./pages/manage/shopping/TheoDonHang/TongQuanDonHang"),
);
const DoanhThu = lazy(() => import("./pages/manage/shopping/DoanhThu"));
const POSBanLe = lazy(() => import("./pages/manage/shopping/POS/POSPage"));

// ─── Shop (B2C) ──────────────────────────────────────────
const ShopLayout = lazy(() => import("./layouts/ShopLayout"));
const ShopProducts = lazy(() => import("./pages/shop/ShopProducts"));
const ShopCart = lazy(() => import("./pages/shop/ShopCart"));

const ShopSkeleton = () => (
  <div
    className="p-6 space-y-4 animate-pulse"
    style={{ background: "#f7f3ef", minHeight: "60vh" }}
  >
    <div className="h-64 rounded-3xl" style={{ background: "#ede8e3" }} />
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-48 rounded-2xl"
          style={{ background: "#ede8e3" }}
        />
      ))}
    </div>
  </div>
);

// Lazy Load
const PageSkeleton = () => (
  <div className="p-6 space-y-6 animate-pulse">
    <div className="h-8 w-48 bg-slate-800 rounded-xl" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-20 bg-slate-800/60 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-36 bg-slate-800/60 rounded-2xl" />
      ))}
    </div>
  </div>
);

// Hàng rào bảo vệ
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* TRANG CHỦ */}
        <Route path="/" element={<ShopLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<ShopSkeleton />}>
                <Home />
              </Suspense>
            }
          />
          <Route
            path="san-pham"
            element={
              <Suspense fallback={<ShopSkeleton />}>
                <ShopProducts />
              </Suspense>
            }
          />
          <Route
            path="san-pham/:id"
            element={
              <Suspense fallback={<ShopSkeleton />}>
                <ShopProducts />
              </Suspense>
            }
          />
          <Route
            path="gio-hang"
            element={
              <Suspense fallback={<ShopSkeleton />}>
                <ShopCart />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <div className="text-center py-20" style={{ color: "#a89070" }}>
                Trang đang phát triển...
              </div>
            }
          />
        </Route>
        {/* AUTH: Đăng nhập */}
        <Route path="/login" element={<Login />} />

        {/* ── MANAGE nội bộ ────────────────────────────── */}
        {/* Cụm quản lý lồng nhau */}
        <Route
          path="/manage"
          element={
            <ProtectedRoute>
              <ManageLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<PageSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />
          {/* Cụm bán hàng */}
          <Route path="ban-hang">
            <Route
              path="pos"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <POSBanLe />
                </Suspense>
              }
            />
            <Route
              path="theo-doi"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <TheoDonHang />
                </Suspense>
              }
            />
            <Route
              path="doanh-thu"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <DoanhThu />
                </Suspense>
                // <div className="p-8 text-slate-500 italic">
                //   Doanh thu — đang phát triển...
                // </div>
              }
            />
          </Route>
          {/* Cụm kho */}
          <Route path="kho">
            <Route
              path="dashboard"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <Kho />
                </Suspense>
              }
            />
            <Route
              path="nhap-xuat"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <NhapXuatKho />
                </Suspense>
              }
            />
            <Route
              path="nhap-kho"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <NhapKho />
                </Suspense>
              }
            />
            <Route
              path="xuat-kho"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <XuatKho />
                </Suspense>
              }
            />
            <Route path="so-do-kho">
              <Route
                path="vi-tri"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ViTriHang />
                  </Suspense>
                }
              />
              <Route
                path="quan-ly-sku"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <QuanLySku />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          {/* Cụm Nhân sự */}
          <Route path="nhan-su">
            <Route
              path="nhan-vien"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <NhanVien />
                </Suspense>
              }
            />
            <Route
              path="chuc-vu-phong-ban"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <ChucVuPhongBan />
                </Suspense>
              }
            />
          </Route>

          {/* Cụm Dịch vụ */}
          <Route path="service">
            <Route
              path="khach-hang"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <KhachHang />
                </Suspense>
              }
            />
            <Route
              path="doitac-nhaphanphoi"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <DoiTacvaNhaPhanPhoi />
                </Suspense>
              }
            />
          </Route>

          {/* Các mục khác mày cứ để placeholder */}
          <Route
            path="kho"
            element={
              <div className="text-white p-8 text-2xl font-bold">
                Quản lý Kho
              </div>
            }
          />
          <Route
            path="thu-chi"
            element={
              <div className="text-white p-8 text-2xl font-bold">Thu Chi</div>
            }
          />
          <Route
            path="*"
            element={
              <div className="p-8 text-slate-500 italic">
                Tính năng này đang được code...
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
