"use client";
import { Plus } from "lucide-react";
import { BarangColumn, columns } from "./barang-columns";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormBarang } from "./form-barang";
import { CellAction } from "./cell-action";
import { ColumnDef } from "@tanstack/react-table";


interface BarangClientProps {
  data: BarangColumn[];
}

export function BarangClient({ data }: BarangClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<BarangColumn> | null>(null);

  
  const enhancedColumns = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: { row: { original: BarangColumn } }) => (
          <CellAction
            data={row.original}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ),
      } satisfies ColumnDef<BarangColumn>; // atau pakai as ColumnDef<BarangColumn>
    }
    return col;
  });

  const handleEdit = (row: BarangColumn) => {
    console.log("Edit diklik untuk row:", row);
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {

    window.location.reload();
  };

  const handleSuccess = () => {
    setModalOpen(false);
    setEditData(null);
    // refresh table
    window.location.reload();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Heading
          title={`Barang Tersedia (${data.length})`}
          description="Kelola stok, harga, dan varian barang"
        />
        <Button className="bg-[#a38adf] hover:bg-[#8b5bff]" onClick={() => { setEditData(null); setModalOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Barang
        </Button>
      </div>
      <DataTable
        data={data}
        columns={enhancedColumns}  // ← pakai yang ini
        searchKeys={["kode", "nama"]}
      />
      <FormBarang
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditData(null); }}
        initialData={editData || undefined}
        onSuccess={handleSuccess}
      />
    </>
  );
};