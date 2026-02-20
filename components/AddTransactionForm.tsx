"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ProdukSuggestion as ProdukSuggestionType, KeranjangItem, Marketplace } from "@/types/inventory";
import { calculateLaba, debounce } from "@/lib/calculatinglaba";
import { searchProduk, ProdukSuggestion } from "@/lib/productUtils";

interface AddTransactionFormProps {
    marketplaces: Marketplace[];
    marketplace: string;
    setMarketplace: (value: string) => void;
    kodePesanan: string;
    setKodePesanan: (value: string) => void;
    keranjang: KeranjangItem[];
    setKeranjang: (keranjang: KeranjangItem[]) => void;
    tanggalInput: string;
    isLoading: boolean;
    handleSimpan: () => Promise<void>;
    simpanBelumBayar: () => Promise<void>;
    isEditing: boolean;
    editingId: number | null;
    setIsEditing: (value: boolean) => void;
}

export default function AddTransactionForm({
    marketplaces,
    marketplace,
    setMarketplace,
    kodePesanan,
    setKodePesanan,
    keranjang,
    setKeranjang,
    tanggalInput,
    isLoading,
    handleSimpan,
    simpanBelumBayar,
    isEditing,editingId,setIsEditing,
}: AddTransactionFormProps) {
    const [namaProduk, setNamaProduk] = useState("");
    const [kodeProduk, setKodeProduk] = useState("");
    const [warna, setWarna] = useState("");
    const [hargaJual, setHargaJual] = useState("");
    const [hargaBeli, setHargaBeli] = useState("");
    const [jumlahTerjual, setJumlahTerjual] = useState("");
    const [suggestions, setSuggestions] = useState<ProdukSuggestion[]>([]);
    const [selectedProduk, setSelectedProduk] = useState<ProdukSuggestion | null>(null);
    const [isCheckingKode, setIsCheckingKode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSavingSimpan, setIsSavingSimpan] = useState(false)
    const [isSavingBelumBayar, setIsSavingBelumBayar] = useState(false);
    

    // Autocomplete produk
    useEffect(() => {
        if (namaProduk.length >= 2) {
            searchProduk(namaProduk).then(setSuggestions);
        } else {
            setSuggestions([]);
        }
    }, [namaProduk]);

    const pilihProduk = useCallback((produk: ProdukSuggestionType) => {
        setSelectedProduk(produk);
        setNamaProduk(produk.nama);
        setKodeProduk(produk.kode);
        setHargaJual(produk.hargaJual.toString());
        setHargaBeli(produk.hargaBeli.toString());
        setWarna(produk.variants?.[0]?.warna || "");
        setSuggestions([]);
    }, []);

    const tambahKeKeranjang = async () => {
        if (!kodePesanan || !namaProduk || !kodeProduk || !jumlahTerjual || !marketplace) {
            toast.warning("Lengkapi semua field + pilih marketplace!");
            return;
        }
        const jumlahNum = Number(jumlahTerjual);
        if (jumlahNum <= 0) {
            toast.warning("Jumlah terjual harus lebih dari 0!");
            return;
        }

        const varianTerpilih = selectedProduk?.variants?.find((v) => v.warna === warna);

        if (!varianTerpilih) {
            toast.error("Varian/warna belum dipilih atau tidak ditemukan!");
            return;
        }

        if (varianTerpilih.stok < jumlahNum) {
            toast.error(
                `Stok varian "${varianTerpilih.warna}" hanya tersisa ${varianTerpilih.stok} pcs!\n` +
                `Kamu meminta ${jumlahNum} pcs. Kurangi jumlah atau pilih varian lain.`
            );
            return;
        }
        setIsSaving(true);

        const hargaJualNum = Number(hargaJual) || 0;
        const hargaBeliNum = Number(hargaBeli) || 0;
        try {


            const { totalAdmin, totalZakat, labaBersih } = await calculateLaba(
                hargaJualNum,
                hargaBeliNum,
                jumlahNum,
                marketplace
            );

            const itemBaru: KeranjangItem = {
                kodePesanan,
                kodeBarang: kodeProduk,
                namaBarang: namaProduk,
                warna,
                jumlah: jumlahNum,
                hargaJual: hargaJualNum,
                hargaBeli: hargaBeliNum,
                subtotal: jumlahNum * hargaJualNum,
                totalBeli: jumlahNum * hargaBeliNum,
                totalAdmin,
                totalZakat,
                labaBersih,
                marketplace,
                varianId: selectedProduk?.variants.find((v) => v.warna === warna)?.id || 0,
            };

            setKeranjang([...keranjang, itemBaru]);

            setNamaProduk("");
            setKodeProduk("");
            setWarna("");
            setHargaJual("");
            setHargaBeli("");
            setJumlahTerjual("");
            setSelectedProduk(null);
            setSuggestions([]);
        } catch (error) {
            toast.error("Gagal memasukan keranjang");
        } finally { setIsSaving(false); }
    };

    // Fungsi cek kode duplikat
    const checkKodeDuplikat = async (kode: string) => {
        if (!kode.trim()) return;

        setIsCheckingKode(true);

        try {
            const res = await fetch(`/api/cek-kode-belumbayar?kode=${encodeURIComponent(kode.trim())}`);
            const data = await res.json();

            if (data.exists) {
                toast.error(`Kode Pesanan Duplikat`, {
                    description: `Kode "${kode.trim()}" sudah terdaftar di Belum Bayar.`,
                    action: {
                        label: "Lihat Detail",
                        onClick: () => (window.location.href = "/belumbayar"),
                    },
                    duration: 8000, // lebih lama biar dibaca
                });
            }
        } catch (err) {
            toast.error("Gagal memeriksa kode pesanan");
        } finally {
            setIsCheckingKode(false);
        }
    };

    const debouncedCheck = debounce(checkKodeDuplikat, 500);

    useEffect(() => {
        debouncedCheck(kodePesanan);
    }, [kodePesanan]);

    return (
        <div className="bg-white rounded-lg shadow p-4 border space-y-2">
            <div className="flex-1 min-w-[180px]">
                <label className="block text-sm mb-1">Marketplace</label>
                <select
                    value={marketplace}
                    onChange={(e) => setMarketplace(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                >
                    <option value="">Pilih Marketplace</option>
                    {marketplaces.map((m) => (
                        <option key={m.id} value={m.namaToko}>
                            {m.namaToko}
                        </option>
                    ))}
                </select>
            </div>

            {/* Kode Pesanan */}
            <div className="relative">
                <label className="block text-sm font-medium mb-1">Kode Pesanan</label>
                <input
                    type="text"
                    placeholder="Masukkan kode pesanan"
                    value={kodePesanan}
                    onChange={(e) => {
                        setKodePesanan(e.target.value);
                    }}
                    className={`w-full border rounded px-4 py-2.5 text-sm transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400
            ${isCheckingKode ? "border-blue-400" : "border-gray-300"}`}
                />
                {isCheckingKode && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                )}
            </div>

            {/* Nama Produk dengan autocomplete */}
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    placeholder="Nama Produk"
                    value={namaProduk}
                    onChange={(e) => setNamaProduk(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm min-w-0"
                    autoComplete="off"
                />
                {/* Suggestion dropdown */}
                {suggestions.length > 0 && (
                    <ul className="absolute top-full left-0 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto z-50 mt-1">
                        {(() => {
                            const seen = new Map<string, ProdukSuggestionType>();
                            const uniqueSuggestions = suggestions.filter((prod) => {
                                const key = `${prod.nama}|${prod.kode}`;
                                if (seen.has(key)) return false;
                                seen.set(key, prod);
                                return true;
                            });

                            return uniqueSuggestions.map((prod) => (
                                <li
                                    key={`${prod.nama}|${prod.kode}`}
                                    onClick={() => pilihProduk(prod)}
                                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b last:border-b-0"
                                >
                                    <div className="font-medium">{prod.nama}</div>
                                    <div className="text-xs text-gray-600">
                                        {prod.kode} • Rp {prod.hargaJual.toLocaleString("id-ID")}
                                    </div>
                                </li>
                            ));
                        })()}
                    </ul>
                )}
                <button className="bg-yellow-400 px-4 py-2 rounded text-sm whitespace-nowrap flex-shrink-0">
                    Cari
                </button>
            </div>

            {/* Kode Produk */}
            <input
                type="text"
                placeholder="Kode Produk"
                value={kodeProduk}
                readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
            />

            {/* Warna / Varian */}
            <div>
                <label className="block text-sm mb-1">Warna / Varian</label>
                {selectedProduk && Array.isArray(selectedProduk.variants) && selectedProduk.variants.length > 0 ? (
                    <select
                        value={warna}
                        onChange={(e) => setWarna(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        required
                    >
                        <option value="">Pilih Warna / Varian</option>
                        {selectedProduk.variants.map((v) => (
                            <option key={v.id || v.warna} value={v.warna} disabled={v.stok <= 0}>
                                {`${selectedProduk.kode}•${v.warna}•${v.stok <= 0 ? "(Stok Habis)" : `(Stok: ${v.stok})`}`}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input
                        type="text"
                        placeholder="Warna (opsional)"
                        value={warna}
                        onChange={(e) => setWarna(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                )}
            </div>

            {/* Harga Jual
            <input
                type="number"
                placeholder="Harga jual"
                value={hargaJual}
                readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
            />

            {/* Harga Beli 
            <input
                type="number"
                placeholder="Harga Beli"
                value={hargaBeli}
                readOnly
                className="w-full border rounded px-3 py-2 text-sm bg-gray-100"
            />*/}

            {/* Jumlah Terjual */}
            <input
                type="number"
                placeholder="Terjual"
                value={jumlahTerjual}
                onChange={(e) => setJumlahTerjual(e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* Button Tambah ke Keranjang */}
            <div className="flex space-x-2 flex-wrap text-white">
                <button
                    onClick={tambahKeKeranjang}
                    disabled={
                        isSaving ||
                        !selectedProduk ||
                        !warna ||
                        Number(jumlahTerjual) <= 0 ||
                        !marketplace ||
                        !kodePesanan.trim() ||
                        (selectedProduk?.variants?.find(v => v.warna === warna)?.stok || 0) <
                        (Number(jumlahTerjual) || 1)
                    }
                    className={`flex-1 py-2 px-4 rounded font-medium text-sm transition-all duration-200
            ${(isSaving ||
                            !selectedProduk ||
                            !warna ||
                            Number(jumlahTerjual) <= 0 ||
                            !marketplace ||
                            !kodePesanan.trim() ||
                            (selectedProduk?.variants?.find(v => v.warna === warna)?.stok || 0) <
                            (Number(jumlahTerjual) || 1)
                        )
                            ? "bg-yellow-300 opacity-60 cursor-not-allowed text-gray-700"
                            : "bg-yellow-400 hover:bg-yellow-500 cursor-pointer text-black"
                        }`}
                >{isSaving ? "Memproses..." : "Simpan Keranjang"}
                </button>

                {/* Button Simpan */}
                <button
                    onClick={async () => {
                        setIsSavingSimpan(true);
                        try {
                            await handleSimpan();
                        } catch (error) {
                            toast.error("Gagal menyimpan transaksi");
                        } finally {
                            setIsSavingSimpan(false);
                        }
                    }}
                    disabled={isSavingSimpan}
                    className="flex-1 cursor-pointer bg-[#a38adf] px-4 py-2 rounded text-sm"
                >
                    <div className="flex items-center justify-center">
                        {isSavingSimpan ? (
                            <>
                                Memproses...
                                <div className="ml-2 animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>  {/* Spinner */}
                            </>
                        ) : ( isEditing ? "Update" :
                            "Simpan"
                        )}
                    </div>
                </button>
                {/* button belum bayar */}
                <button
                    onClick={async () => {
                        setIsSavingBelumBayar(true);
                        try {
                            await simpanBelumBayar();
                        } catch (error) {
                            toast.error("Gagal menyimpan belum bayar");
                        } finally {
                            setIsSavingBelumBayar(false);
                        }
                    }}
                    disabled={isSavingBelumBayar}
                    className="flex-1 cursor-pointer bg-[#a38adf] py-2.5 rounded font-medium text-sm"
                >
                    <div className="flex items-center justify-center">
                        {isSavingBelumBayar ? (
                            <>
                                Memproses...
                                <div className="ml-2 animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>  {/* Spinner */}
                            </>
                        ) : (
                            "Simpan belum bayar"
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
} 