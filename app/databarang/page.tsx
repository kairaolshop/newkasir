
import {prisma} from "@/lib/prisma"
import { BarangClient } from "../databarang/components/client";
import { BarangColumn } from "@/app/databarang/components/barang-columns";

export default async function DataBarangPage() {
  const barangs = await prisma.barang.findMany({
    include: {
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted: BarangColumn[] = barangs.map((barang) => ({
  id: barang.id,
  kode: barang.kode,
  nama: barang.nama,
  stok: barang.stok,
  hargaJual: barang.hargaJual,
  hargaBeli: barang.hargaBeli,
  createdAt: barang.createdAt.toISOString(),

  varianCount: barang.variants.length,
  varianList: barang.variants.map(v => v.warna).join(", "),

  // 🔥 kirim variants asli
  variants: barang.variants.map(v => ({
    id: v.id,
    warna: v.warna,
    stok: v.stok,
  })),
}));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BarangClient data={formatted} /> 
    </div>
  );
}