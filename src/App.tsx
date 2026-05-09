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

// ─── Thu chi ────────────────────────────────
const ThuChi = lazy(
  () => import("./pages/manage/accounting/AccountingDashboard"),
);
const SoQuy = lazy(() => import("./pages/manage/accounting/SoQuyPage"));
const CongNo = lazy(() => import("./pages/manage/accounting/CongNoPage"));
const DoanhThuChiPhi = lazy(() => import("./pages/manage/accounting/DoanhThuPage"));

// ─── Quản lý kho ────────────────────────────────
const Kho = lazy(() => import("./pages/manage/warehouse/KhoDashboard"));
const NhapKho = lazy(() => import("./pages/manage/warehouse/InboundManager"));
const XuatKho = lazy(() => import("./pages/manage/warehouse/OutboundManager"));
const ViTriHang = lazy(
  () => import("./pages/manage/warehouse/WarehouseLayout"),
);
const QuanLySku = lazy(() => import("./pages/manage/warehouse/SkuRuleManager"));
const TonKho = lazy(() => import("./pages/manage/warehouse/InventoryManager"));
const HoanHang = lazy(() => import("./pages/manage/warehouse/ReturnsManager"));

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

// ─── Catalog ──────────────────────────────────────────
const ProductList = lazy(() => import("./pages/manage/catalog/ProductList"));
const ProductDetail = lazy(
  () => import("./pages/manage/catalog/ProductDetail"),
);
const SettingCatalog = lazy(() => import("./pages/manage/catalog/SettingPage"));

// ─── Purchase ──────────────────────────────────────────
const PurchasePage = lazy(() => import("./pages/manage/purchase/PurchasePage"));
const PRApproval = lazy(() => import("./components/MuaHang/PRApproval"));
const POConsolidation = lazy(
  () => import("./components/MuaHang/POConsolidation"),
);
const POTracking = lazy(() => import("./components/MuaHang/POTracking"));
const NCC = lazy(() => import("./pages/manage/purchase/VendorPage"));

// ─── Delivery ──────────────────────────────────────────
const DanhMucVCPage = lazy(() => import("./pages/manage/delivery/DonViVanChuyenPage"));
const GiaoHangPage = lazy(() => import("./pages/manage/delivery/GiaoHangPage"));

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

          {/* Cụm thu chi */}
          <Route path="ke-toan">
            <Route
              index
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <ThuChi />
                </Suspense>
              }
            />
            <Route
              path="so-quy"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <SoQuy />
                </Suspense>
              }
            />
            <Route
              path="cong-no"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <CongNo />
                </Suspense>
              }
            />
            <Route
              path="doanh-thu"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <DoanhThuChiPhi />
                </Suspense>
              }
            />
          </Route>

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
            <Route
              path="ton-kho"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <TonKho />
                </Suspense>
              }
            />
            <Route
              path="hoan-hang"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <HoanHang />
                </Suspense>
              }
            />
          </Route>

          {/* Cụm danh mục sản phẩm */}
          <Route path="danh-muc">
            <Route
              path="danh-sach-san-pham"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <ProductList />
                </Suspense>
              }
            />
            <Route path="san-pham">
              <Route
                path=":id"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProductDetail />
                  </Suspense>
                }
              />
              <Route
                path="tao-moi"
                element={
                  <Suspense fallback={<PageSkeleton />}>
                    <ProductDetail />
                  </Suspense>
                }
              />
            </Route>
            <Route
              path="thiet-lap"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <SettingCatalog />
                </Suspense>
              }
            />
          </Route>

          {/* Cụm danh mục sản phẩm */}
          <Route path="thu-mua">
            <Route
              index
              element={
              <Suspense fallback={<PageSkeleton />}>
                <PurchasePage />
              </Suspense>
            }
            />
            <Route
              path="duyet-mua"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <PRApproval />
                </Suspense>
              }
            />
            <Route
              path="dat-hang"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <POConsolidation />
                </Suspense>
              }
            />
            <Route
              path="tracking"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <POTracking />
                </Suspense>
              }
            />
            <Route
              path="nha-cung-cap"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <NCC />
                </Suspense>
              }
            />
          </Route>

          {/* Cụm giao hàng */}
          <Route
            path="giao-hang"
          >
            <Route
              index
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <GiaoHangPage />
                </Suspense>
              }
            />
            <Route
              path="danh-muc-van-chuyen"
              element={
                <Suspense fallback={<PageSkeleton />}>
                  <DanhMucVCPage />
                </Suspense>
              }
            />
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
