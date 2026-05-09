// SoQuyPage.tsx
import { useState } from "react";
import type { Voucher, VoucherType } from "../../../components/ThuChi/data/accountingTypes";
import VoucherList from "../../../components/ThuChi/SoQuy/VoucherList";
import VoucherForm from "../../../components/ThuChi/SoQuy/VoucherForm";

export default function SoQuyPage() {
  const [form, setForm] = useState<{
    open:     boolean;
    type:     VoucherType;
    voucher?: Voucher;
  }>({ open: false, type: "phieu_thu" });

  const [refresh_key, setRefreshKey] = useState(0);

  const handle_save = () => {
    setForm({ open: false, type: "phieu_thu" });
    setRefreshKey(k => k + 1); // trigger VoucherList reload
  };

  return (
    <>
      <VoucherList
        key={refresh_key}
        onTao={(type) => setForm({ open: true, type })}
        onXem={(voucher) => setForm({ open: true, type: voucher.type, voucher })}
        onSua={(voucher) => setForm({ open: true, type: voucher.type, voucher })}
      />

      {form.open && (
        <VoucherForm
          type={form.type}
          voucher={form.voucher}
          onSave={handle_save}
          onClose={() => setForm(prev => ({ ...prev, open: false }))}
        />
      )}
    </>
  );
}