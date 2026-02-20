"use client"

import { ColumnDef } from "@tanstack/react-table";

export type BarangColumn = {
  id: number
  kode: string
  nama: string
  stok: number
  hargaJual: number
  hargaBeli: number
  createdAt: string

  varianCount: number
  varianList: string
  variants: {
    id: number
    warna: string
    stok: number
  }[]
}

export const columns: ColumnDef<BarangColumn>[] = [

  {
    id: "kode",
    accessorKey: "kode",
    header: "Kode",
  },
  {
    id: "nama",
    accessorKey: "nama",
    header: "Nama Barang",   
  },
  {
    accessorKey: "stok",
    header: "Stok",
    cell: ({ row }) => {
      const item = row.original;
      if (!item.variants?.length) return item.stok ?? "—";
      const total = item.variants.reduce((acc, v) => acc + (v.stok || 0), 0);
      return total === 0 ? "Habis" : total;
    },
  },
  {
    accessorKey: "hargaJual",
    header: "Harga Jual",
    cell: ({ row }) => `Rp ${row.original.hargaJual.toLocaleString("id-ID")}`,
  },
  {
    accessorKey: "hargaBeli",
    header: "Harga Beli",
    cell: ({ row }) => `Rp ${row.original.hargaBeli.toLocaleString("id-ID")}`,
  },
  {
    id: "varianList",
    header: "Varian",
    cell: ({ row }) => {
      return row.original.varianList || `${row.original.varianCount} varian`;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Dibuat",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("id-ID"),
  },
  {
    id: "actions",
    cell: ({ row }) => null,
  }

]