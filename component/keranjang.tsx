"use client";

import { Button } from "@/components/ui/button";
import { KeranjangItem } from "@/types/inventory";
import { Trash2 } from "lucide-react";
import { useEffect } from "react";
interface TableKeranjangProps {
  keranjang: KeranjangItem[];
  handleRemoveItems: (index: number, item: KeranjangItem) => void;
}

export default function TableKeranjang({
  keranjang,
  handleRemoveItems }: TableKeranjangProps) {
  useEffect(() => { console.log("Data keranjang", keranjang) }, [keranjang]);
  return (
    <div className="p-2 max-w-7xl mx-auto border shadow rounded bg-white">
      <h3 className="text-gray-500 text-xs font-bold mb-2">Keranjang Pembeli</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border-collapse rounded">
          <thead className="bg-[#baa9d7] text-white">
            <tr>
              <th className="p-2 border">Kode Barang</th>
              <th className="p-2 border">Nama Barang</th>
              <th className="p-2 border">Warna</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Total Jual</th>
              <th className="p-2 border">Total Beli</th>
              <th className="p-2 border">Admin</th>
              <th className="p-2 border">Zakat</th>
              <th className="p-2 border">Laba</th>
            </tr>
          </thead>
          <tbody>
            {keranjang.map((item, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-2 border">{item.kodeBarang}</td>
                <td className="p-2 border">{item.namaBarang}</td>
                <td className="p-2 border text-center">{item.warna}</td>
                <td className="p-2 border text-center">{item.jumlah}</td>
                <td className="p-2 border">Rp {item.subtotal.toLocaleString()}</td>
                <td className="p-2 border text-gray-400">Rp {item.totalBeli.toLocaleString()}</td>
                <td className="p-2 border text-red-500">Rp {item.totalAdmin.toLocaleString()}</td>
                <td className="p-2 border text-green-600">Rp{item.totalZakat.toLocaleString()}</td>
                <td className="p-2 border font-bold">Rp {item.labaBersih.toLocaleString()}</td>
                < td className="p-2 border text-center">
                  <Button onClick={() => handleRemoveItems(idx,item)}
                    className="bg-red-100 text-red-600 hover:text-white hover:bg-red-500 p-1 rounded transition-colors"><Trash2
                    size={14}
                  /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}