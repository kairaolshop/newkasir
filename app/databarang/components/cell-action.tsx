"use client";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BarangColumn } from "./barang-columns";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

interface CellActionProps {
  data: BarangColumn;
  onEdit: (data: BarangColumn) => void;
  onDelete: (id: number) => void;
}

export function CellAction({ data, onEdit, onDelete }: CellActionProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      setLoading(true);
      const res = await fetch(`/api/barang/${data.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Barang dihapus!");
      onDelete(data.id);
    } catch {
      toast.error("Gagal hapus");
    } finally {
      setIsDeleting(false);
      setLoading(false);
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(data)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            
            {/* Pemicu Dialog diletakkan sebagai DropdownMenuItem */}
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </AlertDialogTrigger>
          </DropdownMenuContent>
        </DropdownMenu>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yakin hapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak bisa dibatalkan. Barang "{data.nama}" akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            {/* Gunakan onClick langsung di AlertDialogAction atau Button di dalamnya */}
            <Button 
                variant="destructive" 
                onClick={handleDelete} 
                disabled={isDeleting}
            >
              {isDeleting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}