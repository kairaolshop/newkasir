// app/page.tsx
// Modifikasi page.tsx utama untuk import dan render komponen-komponen

"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import AddTransactionForm from "@/components/AddTransactionForm";
import { KeranjangItem, Marketplace } from "@/types/inventory";
import TablePenjualan from "@/component/tablepenjualan";
import TableKeranjang from "@/component/keranjang";
import { motion } from "framer-motion";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State utama
  const [isMounted, setIsMounted] = useState(false);
  const [searchKodePesanan, setSearchKodePesanan] = useState("");
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
  const [marketplace, setMarketplace] = useState("");
  const [kodePesanan, setKodePesanan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>("");
  const [keranjang, setKeranjang] = useState<KeranjangItem[]>([]);
  const [penjualanHarian, setPenjualanHarian] = useState<any[]>([]);
  const [tanggalInput, setTanggalInput] = useState<string>("");

  const [showFormModal, setShowFormModal] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openModal = () => {
    setShowFormModal(true);
    dialogRef.current?.showModal();
  };
  const closeModal = () => {
    setShowFormModal(false);
    dialogRef.current?.close();
    setKeranjang([]);
    setMarketplace("");
    setKodePesanan("");
  };

  useEffect(() => {
    setIsMounted(true);

    const savedDate = localStorage.getItem("lastTransactionDate");
    setTanggalInput(savedDate || new Date().toISOString().split("T")[0]);

    const cached = localStorage.getItem("cachedPenjualanHarian");
    if (cached) {
      try {
        setPenjualanHarian(JSON.parse(cached));
      } catch (e) {
        console.error("Gagal parse cache penjualan");
      }
    }
  }, []);

  // Simpan tanggal ke localStorage
  useEffect(() => {
    if (isMounted && tanggalInput) {
      localStorage.setItem("lastTransactionDate", tanggalInput);
    }
  }, [tanggalInput, isMounted]);

  // Simpan cache penjualan harian
  useEffect(() => {
    if (isMounted && penjualanHarian.length > 0) {
      localStorage.setItem("cachedPenjualanHarian", JSON.stringify(penjualanHarian));
    }
  }, [penjualanHarian, isMounted]);

  // Fetch marketplace
  useEffect(() => {
    fetch("/api/marketplace")
      .then((res) => res.json())
      .then(setMarketplaces)
      .catch(console.error);
  }, []);

  // Fetch penjualan harian
  useEffect(() => {
    if (!isMounted || !tanggalInput) return;

    const fetchPenjualan = async () => {
      try {
        const url = `/api/penjualan?search=${searchKodePesanan}&tanggal=${tanggalInput}&_=${Date.now()}`;
        const res = await fetch(url);
        const data = await res.json();
        setPenjualanHarian(data || []);
      } catch (err) {
        console.error("Gagal load data harian", err);
        setPenjualanHarian([]);
      }
    };

    fetchPenjualan();
  }, [searchKodePesanan, isMounted, tanggalInput]);

  // Computed values
  const { terjualShopee, terjualTiktok } = useMemo(() => {
    const shopee = new Set(
      penjualanHarian
        .filter((item) => item.marketplace?.toLowerCase() === "shopee")
        .map((item) => item.kodePesanan)
    ).size;

    const tiktok = new Set(
      penjualanHarian
        .filter((item) => item.marketplace?.toLowerCase() === "tiktok")
        .map((item) => item.kodePesanan)
    ).size;

    return { terjualShopee: shopee, terjualTiktok: tiktok };
  }, [penjualanHarian]);

  // Handlers
  const handleSimpan = async () => {
    if (keranjang.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    setIsLoading(true);
    setLoadingAction("Menyimpan transaksi...")

    try {
      const payload = {
        kodePesanan,
        marketplace,
        tanggalInput,
        items: keranjang.map((item) => ({
          varianId: item.varianId,
          jumlah: item.jumlah,
          hargaJual: item.hargaJual,
          hargaBeli: item.hargaBeli,
          totalAdmin: item.totalAdmin,
          totalZakat: item.totalZakat,
          labaBersih: item.labaBersih,
        })),
      };

      const res = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error((await res.json()).error || "Gagal simpan");

      // Reset form
      setKeranjang([]);
      setMarketplace("");
      setKodePesanan("");
      const resHarian = await fetch(`/api/penjualan`);
      const data = await resHarian.json();
      setPenjualanHarian(data);

      toast.success("Data berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data.");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
      closeModal();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus transaksi ini? Stok akan dikembalikan.`)) return;
    setIsLoading(true);
    setLoadingAction("Menghapus transaksi...");
    try {
      const res = await fetch(`/api/penjualan?id=${id}`, { method: "DELETE" });

      if (res.ok) {
        const resHarian = await fetch("/api/penjualan");
        setPenjualanHarian(await resHarian.json());
        toast.success("Transaksi berhasil dihapus.");
      } else {
        const errorData = await res.json();
        toast.error(`Gagal hapus: ${errorData.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const handleReset = async () => {
    if (!confirm("Yakin ingin reset database penjualan? Semua data akan hilang!")) return;
    setIsLoading(true);
    setLoadingAction("Mereset database...");
    try {
      const res = await fetch("/api/penjualan/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset gagal");
      setPenjualanHarian([]);
      setKeranjang([]);
      localStorage.removeItem("cachedPenjualanHarian");
      const resHarian = await fetch("/api/penjualan");
      const freshData = await resHarian.json();
      setPenjualanHarian(freshData);

      toast.success("Reset berhasil! Data penjualan sudah dikosongkan.");
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Gagal reset database. Coba lagi atau cek console.");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const simpanBelumBayar = async () => {
    if (keranjang.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }
    setIsLoading(true);
    setLoadingAction("Menyimpan transaksi...")

    try {
      const res = await fetch("/api/belumbayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: keranjang }),
      });

      if (res.ok) {
        toast.success("Berhasil simpan ke status Belum Bayar! Stok telah dikurangi.");

        setKeranjang([]);
        setMarketplace("");
        setKodePesanan("");
      } else {
        const errorData = await res.json();
        alert(`Gagal simpan: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error simpan belum bayar:", error);
      toast.error("Terjadi kesalahan sistem saat menyimpan.");
    } finally {
      setIsLoading(false);
      setLoadingAction("");
      closeModal();
    }
  };

  const rekapHarian = async () => {
    const hariIni = new Date().toLocaleDateString("id-ID");
    if (!confirm(`Rekap & pindah penjualan hari ini (${hariIni}) ke Rekap Harian? Data harian akan direset.`)) return;
    setIsLoading(true);
    setLoadingAction("Melakukan rekap harian...");
    try {
      const res = await fetch("/api/penjualan/rekap-harian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tanggal: new Date().toISOString().split("T")[0] }),
      });

      if (res.ok) {
        toast.success("Rekap harian berhasil!");
        localStorage.removeItem("cachedPenjualanHarian");

        // 3. Opsional: Update tanggal terakhir rekap jika diperlukan
        localStorage.setItem("lastTransactionDate", new Date().toISOString().split("T")[0]);

      } else {
        const err = await res.json();
        toast.error("Gagal rekap: " + (err.error || err.message));
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server");
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingAction("");
    }
  };

  const getColormarket = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("shopee")) return "text-orange-500 font-bold";
    if (n.includes("tiktok")) return "text-green-500 font-bold";
    return "";
  };

  useEffect(() => {
    if (!session && isMounted) {
      router.replace("/login");
    }
  }, [session, isMounted, router]);

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex flex-col flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-[#8b5bff]">Kasir - Transaksi Harian</h1>
          <p className="text-lg text-red-500 font-bold"><span className="px-2">Hari ini</span>
            {new Intl.DateTimeFormat("id-ID", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }).format(new Date()).replace(/\//g, "-")}
          </p>
          <input
            type="date"
            value={tanggalInput}
            onChange={(e) => setTanggalInput(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Filter atas */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm mb-1">Cari Kode</label>
          <input
            value={searchKodePesanan}
            onChange={(e) => setSearchKodePesanan(e.target.value)}
            type="text"
            className="border rounded px-3 py-2 text-sm"
            placeholder="Kode pesanan..."
          />
        </div>
        <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
          <button
            onClick={openModal}
            className="bg-[#a38adf] hover:bg-[#8b5bff] text-white px-4  py-2 rounded text-sm shadow-md transition"
          >
            + Pesanan Baru
          </button></div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleReset}
            className="cursor-pointer bg-red-400 hover:bg-red-600 text-white p-2 rounded text-sm"
          >
            RESET
          </button>
        </div>
      </div>

      {/* Ringkasan bawah */}
      <div className="flex flex-wrap justify-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 text-white w-4 h-4 flex items-center justify-center rounded">S</div>
          <span className="font-medium">{terjualShopee} Terjual</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-black text-white w-4 h-4 flex items-center justify-center rounded">♪</div>
          <span className="font-medium">{terjualTiktok} Terjual</span>
        </div>
        <button className="bg-[#8b5bff] text-white p-2 rounded-lg font-medium">🖨️ Print PDF</button>
      </div>

      {/* Modal form dan keranjang */}
      <dialog
        ref={dialogRef}
        className="p-0 bg-stone-100 rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden bg-transparent backdrop:bg-black/40"
        onClose={() => setShowFormModal(false)}
      >
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              drag // Cukup tambah ini agar bisa digeser
              dragMomentum={false} // Agar tidak meluncur saat dilepas
              initial={{ opacity: 0, scale: 0.9, y: 20 }} // Animasi muncul
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col"
            >
              <div className="drag-handle flex justify-between items-center px-6 py-4 border-b bg-gray-50 cursor-move">
                <h2 className="text-xl font-bold text-gray-800">Input Transaksi Baru</h2>
              </div>
              {/* Scrollable Area */}
              <div className="relative flex-1">
                <div className={`p-6 overflow-y-auto max-h-[75vh] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="grid grid-cols-1 gap-6">

                    {/* Form Input */}
                    <AddTransactionForm
                      marketplaces={marketplaces}
                      marketplace={marketplace}
                      setMarketplace={setMarketplace}
                      kodePesanan={kodePesanan}
                      setKodePesanan={setKodePesanan}
                      keranjang={keranjang}
                      isLoading={isLoading}
                      setKeranjang={setKeranjang}
                      tanggalInput={tanggalInput}
                      handleSimpan={() => {
                        handleSimpan();
                      }}
                      simpanBelumBayar={() => {
                        simpanBelumBayar();
                      }}
                    />

                    {/* Tabel Keranjang - Sekarang di dalam area draggable agar ikut bergeser */}
                    <div className="border-t pt-4">
                      <TableKeranjang keranjang={keranjang} />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={closeModal}
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-300 rounded-lg transition-all"
                    >
                      BATAL / TUTUP
                    </button>
                  </div>
                </div>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                      <p className="text-lg font-medium text-gray-800">
                        {loadingAction || "Sedang menyimpan..."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </dialog>

      {/* Tabel Penjualan Harian */}
      <div className="lg:h-[calc(80vh-400px)]">
        <TablePenjualan
          penjualanHarian={penjualanHarian}
          searchKodePesanan={searchKodePesanan}
          handleDelete={handleDelete}
          getColormarket={getColormarket}
          isLoading={isLoading}
        />
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            <p className="text-lg font-medium text-gray-800">{loadingAction || "Sedang memproses..."}</p>
          </div>
        </div>
      )}
    </div>
  );
}