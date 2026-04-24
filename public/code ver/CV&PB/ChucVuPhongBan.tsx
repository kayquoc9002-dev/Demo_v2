import { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Briefcase, Building2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

//import components
import { HRCard } from "./components/HRCard";
import { HRDetailDrawer } from "./components/HRDetailDrawer";

// 1. Định nghĩa
interface HRItem {
  id: number;
  name: string;
  staffCount: number;
}

interface ModalState {
  isOpen: boolean;
  type: "positions" | "departments";
  mode: "add" | "delete";
  data?: HRItem;
}
interface Member {
  id: number;
  name: string;
  code: string;
}
interface SelectedHRItem extends HRItem {
  type: "positions" | "departments";
}

const ChucVuPhongBan = () => {
  const [positions, setPositions] = useState<HRItem[]>([]);
  const [departments, setDepartments] = useState<HRItem[]>([]);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "positions",
    mode: "add",
  });
  const [inputValue, setInputValue] = useState("");
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  //new
  const [selectedItem, setSelectedItem] = useState<SelectedHRItem | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;

  // new
  const canEdit = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const managerNames = ["Chủ doanh nghiệp", "Phó Giám đốc", "Ban Giám đốc"];
    return user.role === "admin" || managerNames.includes(user.name);
  }, []);

  // 2. Dùng useCallback để fix lỗi useEffect dependency và hiệu năng
  const fetchData = useCallback(async () => {
    try {
      const resPos = await fetch(`${apiUrl}/hr/positions`);
      const resDept = await fetch(`${apiUrl}/hr/departments`);

      if (resPos.ok && resDept.ok) {
        const posData = await resPos.json();
        const deptData = await resDept.json();

        // Cập nhật state
        setPositions(posData);
        setDepartments(deptData);
      }
    } catch (error) {
      console.error("Lỗi fetch data:", error);
    }
  }, [apiUrl]);

  useEffect(() => {
    let isMounted = true; // Kỹ thuật để tránh lỗi memory leak

    const loadInitialData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadInitialData();

    return () => {
      isMounted = false; // Khi component unmount thì không set state nữa
    };
  }, [fetchData]);

  // 3. Logic đóng mở Modal
  const openAddModal = (type: "positions" | "departments") => {
    if (!canEdit) return alert("Mày không có quyền thêm đâu nhé!");
    setModal({ isOpen: true, type, mode: "add" });
    setInputValue("");
    setIsConfirmStep(false);
  };

  const openDeleteModal = (type: "positions" | "departments", item: HRItem) => {
    setModal({ isOpen: true, type, mode: "delete", data: item });
    setIsConfirmStep(true); // Xóa thì nhảy thẳng vào bước xác nhận
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
    setInputValue("");
    setIsConfirmStep(false);
  };

  // 4. Hàm xử lý API chính
  const handleAction = async () => {
    const { type, mode, data } = modal;
    const url =
      mode === "delete" && data
        ? `${apiUrl}/hr/${type}/${data.id}`
        : `${apiUrl}/hr/${type}`;

    const method = mode === "delete" ? "DELETE" : "POST";
    const body =
      mode === "add" ? JSON.stringify({ name: inputValue }) : undefined;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body } : {}),
    });

    if (res.ok) {
      fetchData();
      closeModal();
      if (isDrawerOpen) setIsDrawerOpen(false);
    } else {
      alert("Lỗi rồi mày ơi!");
    }
  };

  // 5. Hàm xử lý mở Drawer chi tiết
  const handleViewDetail = async (
    item: HRItem,
    type: "positions" | "departments",
  ) => {
    setSelectedItem({ ...item, type });
    // Fetch thành viên từ API
    const res = await fetch(`${apiUrl}/hr/members/${type}/${item.id}`);
    setMembers(await res.json());
    setIsDrawerOpen(true);
  };

  const handleAddMemberToGroup = () => {
    if (!selectedItem) return;
    const name = window.prompt(
      `Nhập tên nhân viên muốn thêm vào ${selectedItem.name}:`,
    );
    if (name) {
      alert(
        `Mày đang muốn thêm ${name} vào ${selectedItem.name}. Chức năng này sẽ hoàn thiện khi làm xong trang Quản lý nhân viên nhé!`,
      );
      // Sau này chỗ này sẽ gọi API POST /employees với departmentId hoặc positionId tương ứng
    }
  };

  return (
    <div className="space-y-12 relative pb-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Cấu trúc tổ chức
        </h1>
        <p className="text-slate-400 mt-1">
          Quản lý sơ đồ phòng ban và chức vụ nhân sự
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* CỘT CHỨC VỤ - Blue Theme */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 border-t-4 border-t-blue-500 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Briefcase size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Chức vụ</h2>
            </div>
            {canEdit && (
              <button
                onClick={() => openAddModal("positions")}
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {positions.map((item) => (
              <HRCard
                key={item.id}
                type="positions"
                item={item}
                canEdit={canEdit}
                onViewDetail={(it) => handleViewDetail(it, "positions")}
                onDelete={(it) => openDeleteModal("positions", it)}
              />
            ))}
          </div>
        </div>

        {/* CỘT PHÒNG BAN - Emerald Theme */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 border-t-4 border-t-emerald-500 shadow-2xl backdrop-blur-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <Building2 size={20} />
              </div>
              <h2 className="text-lg font-bold text-white">Phòng ban</h2>
            </div>
            {canEdit && (
              <button
                onClick={() => openAddModal("departments")}
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all hover:scale-105"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
            {departments.map((item) => (
              <HRCard
                key={item.id}
                type="departments"
                item={item}
                canEdit={canEdit}
                onViewDetail={(it) => handleViewDetail(it, "departments")}
                onDelete={(it) => openDeleteModal("departments", it)}
              />
            ))}
          </div>
        </div>
      </div>

      <HRDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        data={selectedItem}
        type={selectedItem?.type}
        members={members}
        canEdit={canEdit}
        onDeleteItem={(it) =>
          openDeleteModal(selectedItem?.type || "positions", it)
        }
        onAddMember={handleAddMemberToGroup}
      />

      {/* MODAL XỊN XÒ */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center space-y-4">
                <div
                  className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center ${modal.mode === "delete" ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
                >
                  {modal.mode === "delete" ? (
                    <AlertCircle size={32} />
                  ) : (
                    <Plus size={32} />
                  )}
                </div>

                <h3 className="text-xl font-bold text-white">
                  {modal.mode === "delete"
                    ? "Xác nhận xóa?"
                    : isConfirmStep
                      ? "Kiểm tra lại"
                      : "Thêm mới"}
                </h3>

                {/* Bước 1: Nhập liệu (Chỉ dành cho chế độ Add) */}
                {modal.mode === "add" && !isConfirmStep && (
                  <div className="space-y-4">
                    <p className="text-slate-400 text-sm">
                      Nhập tên{" "}
                      {modal.type === "positions" ? "chức vụ" : "phòng ban"} mày
                      muốn thêm vào hệ thống.
                    </p>
                    <input
                      autoFocus
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Tên mới..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white outline-none focus:border-blue-500 transition-all"
                    />
                    <button
                      disabled={!inputValue.trim()}
                      onClick={() => setIsConfirmStep(true)}
                      className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Tiếp theo
                    </button>
                  </div>
                )}

                {/* Bước 2: Xác nhận (Dành cho cả Add và Delete) */}
                {isConfirmStep && (
                  <div className="space-y-6">
                    <p className="text-slate-300">
                      {modal.mode === "delete"
                        ? `Mày có chắc chắn muốn xóa "${modal.data?.name}" không? Thao tác này không thể hoàn tác!`
                        : `Mày có chắc muốn thêm "${inputValue}" vào danh sách ${modal.type === "positions" ? "chức vụ" : "phòng ban"}?`}
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleAction}
                        className={`w-full font-bold py-3 rounded-xl transition-all ${modal.mode === "delete" ? "bg-red-600 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-500"} text-white`}
                      >
                        Xác nhận {modal.mode === "delete" ? "xóa" : "thêm"}
                      </button>

                      {/* Nút Chỉnh sửa quay lại bước trước (Chỉ cho Add) */}
                      {modal.mode === "add" && (
                        <button
                          onClick={() => setIsConfirmStep(false)}
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                        >
                          Chỉnh sửa (Quay lại)
                        </button>
                      )}

                      <button
                        onClick={closeModal}
                        className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium transition-all"
                      >
                        Hủy bỏ
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChucVuPhongBan;
