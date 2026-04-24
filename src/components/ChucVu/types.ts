export interface EmpInGroup {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  position?: { name: string };
  department?: { name: string };
}

export interface Department {
  id: number;
  name: string;
  staffCount: number;
  employees: EmpInGroup[];
  roleId?: number | null;
  role?: { id: number; name: string; color: string } | null;
}

export interface Position {
  id: number;
  name: string;
  staffCount: number;
  employees: EmpInGroup[];
  roleId?: number | null;
  role?: { id: number; name: string; color: string } | null;
}

export interface Employee {
  id: number;
  code: string;
  fullName: string;
  phone: string;
  status: string;
  department?: { name: string } | null;
  position?: { name: string } | null;
  departmentId?: number | null;
  positionId?: number | null;
}

export interface Role {
  id: number;
  name: string;
  color: string;
  permissions: string;
  isDefault: boolean;
  isSystem: boolean;
}

export const PERMISSION_GROUPS = [
  {
    group: "Hệ thống",
    items: [
      { key: "all", label: "Toàn quyền", desc: "Admin/Chủ doanh nghiệp" },
      {
        key: "manage_roles",
        label: "Quản lý phân quyền",
        desc: "Tạo/sửa/xóa role",
      },
    ],
  },
  {
    group: "Tổng quát",
    items: [
      {
        key: "view_all",
        label: "Xem tất cả danh mục",
        desc: "Chỉ xem, không thao tác",
      },
      {
        key: "view_logs",
        label: "Xem lịch sử logs",
        desc: "Xem log mọi thao tác",
      },
    ],
  },
  {
    group: "Nhân sự",
    items: [
      { key: "view_hr", label: "Xem nhân sự", desc: "" },
      {
        key: "manage_hr",
        label: "Quản lý nhân sự",
        desc: "Thêm/sửa/xóa nhân viên",
      },
    ],
  },
  {
    group: "Kho",
    items: [
      { key: "view_warehouse", label: "Xem kho", desc: "" },
      {
        key: "manage_warehouse",
        label: "Quản lý kho",
        desc: "Nhập/xuất/điều chỉnh kho",
      },
    ],
  },
  {
    group: "Bán hàng",
    items: [
      { key: "view_sales", label: "Xem bán hàng", desc: "" },
      { key: "manage_sales", label: "Quản lý bán hàng", desc: "" },
    ],
  },
  {
    group: "Mua hàng",
    items: [
      { key: "view_purchase", label: "Xem mua hàng", desc: "" },
      { key: "manage_purchase", label: "Quản lý mua hàng", desc: "" },
    ],
  },
  {
    group: "Tài chính",
    items: [
      { key: "view_finance", label: "Xem thu chi", desc: "" },
      { key: "manage_finance", label: "Quản lý thu chi", desc: "" },
    ],
  },
  {
    group: "Sản xuất",
    items: [
      { key: "view_production", label: "Xem sản xuất", desc: "" },
      { key: "manage_production", label: "Quản lý sản xuất", desc: "" },
    ],
  },
  {
    group: "Giao hàng",
    items: [
      { key: "view_delivery", label: "Xem giao hàng", desc: "" },
      { key: "manage_delivery", label: "Quản lý giao hàng", desc: "" },
    ],
  },
  {
    group: "Báo cáo",
    items: [
      { key: "view_reports", label: "Xem báo cáo", desc: "" },
      { key: "manage_reports", label: "Quản lý báo cáo", desc: "" },
    ],
  },
  {
    group: "Dịch vụ",
    items: [
      {
        key: "view_customers",
        label: "Xem khách hàng",
        desc: "Xem danh sách và chi tiết khách hàng",
      },
      {
        key: "manage_customers",
        label: "Quản lý khách hàng",
        desc: "Thêm / xóa khách hàng",
      },
      {
        key: "edit_customers",
        label: "Chỉnh sửa khách hàng",
        desc: "Sửa thông tin khách hàng",
      },
      { key: "view_distributors", label: "Xem nhà phân phối" },
      { key: "manage_distributors", label: "Quản lý nhà phân phối" },
      { key: "edit_distributors", label: "Chỉnh sửa nhà phân phối" },
      { key: "view_partners", label: "Xem đối tác" },
      { key: "manage_partners", label: "Quản lý đối tác" },
      { key: "edit_partners", label: "Chỉnh sửa đối tác" },
    ],
  },
];

export const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items);
