"use client";

import { Edit, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

interface SalesTableProps {
  penjualanHarian: any[];
  searchKodePesanan: string;
  handleDelete:(id: number) => void;
  handleEdit: (transaksi: any) => void;
  getColormarket: (name: string) => string;
  isLoading: boolean;
}


export default function TablePenjualan({ 
  penjualanHarian, searchKodePesanan,
  handleDelete, handleEdit, getColormarket, isLoading
}: SalesTableProps) {
  
  return (
    <div className="p-2 max-w-7xl mx-auto border shadow rounded bg-white">
      <h3 className="text-gray-500 text-xs font-bold mb-2">Data Penjualan</h3>
      <div className="mt-2 overflow-x-auto max-h-[400px]">
        <table className="min-w-full text-xs">
          <thead className="bg-[#baa9d7] text-white sticky top-0">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Kode Pesanan</th>
              <th className="p-2 border">Kode Barang</th>
              <th className="p-2 border">Marketplace</th>
              <th className="p-2 border">Nama Barang</th>
              <th className="p-2 border">Warna</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Total Jual</th>
              <th className="p-2 border">Total Beli</th>
              <th className="p-2 border">Total Admin</th>
              <th className="p-2 border">Zakat</th>
              <th className="p-2 border">Laba</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
         <tbody>
            {penjualanHarian.length === 0 ? (
              <tr className="text-center text-gray-500 py-4">
                <td colSpan={13} className="p-6">
                  {searchKodePesanan.trim()
                    ? `Tidak ditemukan transaksi dengan kode "${searchKodePesanan}"`
                    : "Belum ada data penjualan hari ini."}
                </td>
              </tr>
            ) : (
              penjualanHarian.map((transaksi: any, idx: number) => {
                const jumlahTotal = transaksi.items.reduce((sum: number, it: any) => sum + it.jumlah, 0);
                const hargaJualTotal = transaksi.items.reduce((sum: number, it: any) => sum + it.hargaJual * it.jumlah, 0);
                const hargaBeliTotal = transaksi.items.reduce((sum: number, it: any) => sum + it.hargaBeli * it.jumlah, 0);
                const totalAdminTotal = transaksi.items.reduce((sum: number, it: any) => sum + it.totalAdmin, 0);
                const zakatTotal = transaksi.items.reduce((sum: number, it: any) => sum + (it.zakat || 0), 0);
                const labaTotal = transaksi.items.reduce((sum: number, it: any) => sum + it.laba, 0);

                return (
                  <tr key={transaksi.id} className="border-b hover:bg-gray-50 items-start">
                    <td className="p-2 align-top">{idx + 1}</td>
                    <td className="p-2 align-top font-bold text-blue-700">{transaksi.kodePesanan}</td>
                    <td className="p-2 align-top font-mono text-[10px]">
                      {transaksi.items.map((it: any, i: number) => (
                        <div key={i} className="border-b border-gray-100 text-sm last:border-0 truncate max-w-[150px]">
                          {it.varian?.barang?.kode || "N/A"}
                        </div>
                      ))}
                    </td>
                    <td className={`p-2 ${getColormarket(transaksi.marketplace)}`}>{transaksi.marketplace}</td>
                    <td className="p-2 align-top text-xs">
                      {transaksi.items.map((it: any, i: number) => (
                        <div key={i} className="border-b border-gray-50 last:border-0 truncate max-w-[150px]">
                          {it.varian?.barang?.nama || "N/A"}
                        </div>
                      ))}
                    </td>
                    <td className="p-2 align-top text-xs text-center">
                      {transaksi.items.map((it: any, i: number) => (
                        <div key={i} className="border-b border-gray-50 last:border-0">
                          {it.varian?.warna || "-"}
                        </div>
                      ))}
                    </td>
                    <td className="p-2 text-center">{jumlahTotal}</td>
                    <td className="p-2 text-right">Rp {hargaJualTotal.toLocaleString("id-ID")}</td>
                    <td className="p-2 text-right">Rp {hargaBeliTotal.toLocaleString("id-ID")}</td>
                    <td className="p-2 text-right text-red-600">Rp {totalAdminTotal.toLocaleString("id-ID")}</td>
                    <td className="p-2 text-right">Rp {zakatTotal.toLocaleString("id-ID")}</td>
                    <td className="p-2 text-right font-bold text-green-700">Rp {labaTotal.toLocaleString("id-ID")}</td>
                    <td className="p-2 text-center">
                      <button
                      className="bg-[#8b5bff]/50 hover:bg-[#8b5bff] text-white transition-colors rounded p-1.5"
                        onClick={() => 
                          handleEdit(transaksi)}
                        title="Edit Transaksi"
                        disabled={isLoading}
                        ><Edit size={16}/>
                      </button>
                      <button
                        onClick={() => handleDelete(transaksi.id)}
                        className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded transition-colors"
                        title="Hapus & Kembalikan Stok"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody> 
        </table>
      </div>
    </div>
  );
}