"use client";

import { KeranjangItem } from "@/types/inventory";
interface TableKeranjangProps {
    keranjang: KeranjangItem[];
}

export default function TableKeranjang({keranjang}: TableKeranjangProps) {
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>      
    </div>
  );
}