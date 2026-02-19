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
    header: "Stok Total",
    cell: ({ row }) => {
      const stok = row.original.stok;
      return stok <= 0 ? (
        <span className="text-red-600 font-medium">Habis</span>
      ) : (
        stok
      );
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
    id: "varian",
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