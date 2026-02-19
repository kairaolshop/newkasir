// types/inventory.ts
export interface Marketplace {
  id: number;
  namaToko: string;
}

export interface KeranjangItem {
  kodePesanan: string;
  kodeBarang: string;
  namaBarang: string;
  warna: string;
  jumlah: number;
  hargaJual: number;
  hargaBeli: number;
  subtotal: number;
  totalBeli: number;
  totalAdmin: number;
  totalZakat: number;
  labaBersih: number;
  marketplace: string;
  varianId: number;
}

export interface TransaksiPenjualan {
  id: number;
  kodePesanan: string;
  marketplace: string;
  items: any[];
}

export interface ProdukSuggestion {
  id: number;
  kode: string;
  nama: string;
  stok: string;
  hargaJual: number; 
  hargaBeli: number; 
  variants: Varian[];
}

export interface Varian {
  id: number;
  warna: string;
  stok: number;
  kode?: string;
}