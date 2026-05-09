import {
  LayoutDashboard,
  Wallet,
  ShoppingCart,
  Tag,
  Box,
  List,
  Factory,
  Truck,
  CreditCard,
  BarChart,
  Users,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  Handshake,
  QrCode,
  ClipboardList,
  TrendingUp,
} from "lucide-react";

// Mảng ở phía trên
export const SIDEBAR_TOP_MENU = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/manage",
  },
  {
    id: "ke-toan",
    label: "Kế toán",
    icon: <Wallet size={20} />,
    path: "/manage/ke-toan",
    subItems: [
      {
        label: "Tổng quan",
        path: "/manage/ke-toan",
        icon: <ClipboardList size={14} />,
      },
      {
        label: "Sổ quỹ",
        path: "/manage/ke-toan/so-quy",
        icon: <ClipboardList size={14} />,
      },
      {
        label: "Công nợ",
        path: "/manage/ke-toan/cong-no",
        icon: <ClipboardList size={14} />,
      },
      {
        label: "Doanh thu",
        path: "/manage/ke-toan/doanh-thu",
        icon: <ClipboardList size={14} />,
      }
    ]
  },
  {
    id: "thu-mua",
    label: "Thu mua",
    icon: <ShoppingCart size={20} />,
    path: "/manage/thu-mua",
    subItems: [
      {
        label: "Mua hàng",
        path: "/manage/thu-mua",
        icon: <ClipboardList size={14} />,
      },
      {
        label: "Nhà cung cấp",
        path: "/manage/thu-mua/nha-cung-cap",
        icon: <ClipboardList size={14} />,
      },
      // {
      //   label: "Đặt hàng",
      //   path: "/manage/mua-hang/dat-hang",
      //   icon: <ClipboardList size={14} />,
      // },
      // {
      //   label: "Tracking",
      //   path: "/manage/mua-hang/tracking",
      //   icon: <ClipboardList size={14} />,
      // }
    ]
  },
  {
    id: "ban-hang",
    label: "Bán hàng",
    icon: <Tag size={20} />,
    path: "/manage/ban-hang",
    subItems: [
      {
        label: "Theo dõi đơn hàng",
        path: "/manage/ban-hang/theo-doi",
        icon: <ClipboardList size={14} />,
      },
      {
        label: "Doanh thu",
        path: "/manage/ban-hang/doanh-thu",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "Cửa hàng",
        path: "/",
        icon: <TrendingUp size={14} />,
      },
      {
        label: "POS Bán lẻ",
        path: "/manage/ban-hang/pos",
        icon: <QrCode size={14} />,
      },
    ],
  },
  {
    id: "kho",
    label: "Kho",
    icon: <Box size={20} />,
    path: "/manage/kho",
    subItems: [
      {
        id: "tong-quan",
        label: "Tổng quan kho",
        path: "/manage/kho/dashboard",
        icon: <ClipboardList size={14} />,
      },
      {
        id: "nhap-kho",
        label: "Nhập kho",
        path: "/manage/kho/nhap-kho",
        icon: <TrendingUp size={14} />,
      },
      {
        id: "xuat-kho",
        label: "Xuất kho",
        path: "/manage/kho/xuat-kho",
        icon: <TrendingUp size={14} />,
        hoverPopup: false,
      },
      {
        id: "so-do-kho",
        label: "Sơ đồ kho",
        path: "/manage/kho/so-do-kho",
        icon: <TrendingUp size={14} />,
        hoverPopup: true,
        subItems: [
          {
            label: "Vị trí hàng",
            path: "/manage/kho/so-do-kho/vi-tri",
          },
          {
            label: "Quản lý sku",
            path: "/manage/kho/so-do-kho/quan-ly-sku",
          },
        ],
      },
      {
        id: "tom-kho",
        label: "Tồn kho",
        path: "/manage/kho/ton-kho",
        icon: <TrendingUp size={14} />,
      },
      {
        id: "hoan-hang",
        label: "Hoàn hàng",
        path: "/manage/kho/hoan-hang",
        icon: <TrendingUp size={14} />,
      },
    ],
  },
  {
    id: "danh-muc",
    label: "Danh mục sản phẩm",
    icon: <List size={20} />,
    path: "/manage/danh-muc",
    subItems: [
      {
        // id: "tong-quan",
        label: "Sản phẩm",
        path: "/manage/danh-muc/danh-sach-san-pham",
        icon: <ClipboardList size={14} />,
      },
      {
        // id: "tong-quan",
        label: "Thiết lập",
        path: "/manage/danh-muc/thiet-lap",
        icon: <ClipboardList size={14} />,
      }
    ]
  },
  {
    id: "san-xuat",
    label: "Sản xuất",
    icon: <Factory size={20} />,
    path: "/manage/san-xuat",
  },
  {
    id: "giao-hang",
    label: "Giao hàng",
    icon: <Truck size={20} />,
    path: "/manage/giao-hang",
    subItems: [
      {
        label: "Danh mục vận chuyển",
        path: "/manage/giao-hang/danh-muc-van-chuyen",
      },
      {
        label: "Giao hàng",
        path: "/manage/giao-hang",
      },
    ]
  },
  {
    id: "thanh-toan",
    label: "Thanh toán",
    icon: <CreditCard size={20} />,
    path: "/manage/thanh-toan",
  },
  {
    id: "bao-cao",
    label: "Báo cáo",
    icon: <BarChart size={20} />,
    path: "/manage/bao-cao",
  },
  {
    id: "nhan-su",
    label: "Nhân sự",
    icon: <Users size={20} />,
    path: "/manage/nhan-su",
    subItems: [
      { label: "Quản lý nhân viên", path: "/manage/nhan-su/nhan-vien" },
      {
        label: "Chức vụ & Phòng ban",
        path: "/manage/nhan-su/chuc-vu-phong-ban",
      },
    ],
  },
  {
    id: "dich-vu",
    label: "Dịch vụ",
    icon: <Handshake size={20} />,
    path: "/manage/dich-vu",
    subItems: [
      { label: "Khách hàng", path: "/manage/service/khach-hang" },
      {
        label: "Nhà phân phối & Đối tác",
        path: "/manage/service/doitac-nhaphanphoi",
      },
    ],
  },
];

// Mảng ở phía dưới
export const SIDEBAR_BOTTOM_MENU = [
  {
    id: "chat",
    label: "Chat nội bộ",
    icon: <MessageSquare size={20} />,
    path: "/manage/chat",
  },
  {
    id: "huong-dan",
    label: "Hướng dẫn",
    icon: <BookOpen size={20} />,
    path: "/manage/huong-dan",
  },
  {
    id: "cai-dat",
    label: "Cài đặt",
    icon: <Settings size={20} />,
    path: "/manage/cai-dat",
  },
  {
    id: "dang-xuat",
    label: "Đăng xuất",
    icon: <LogOut size={20} />,
    path: "/logout",
    className: "text-red-400",
  },
];
