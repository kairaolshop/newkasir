// src/lib/productUtils.ts
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

export async function searchProduk(query: string): Promise<ProdukSuggestion[]> {
  if (!query || query.length < 2) return [];

  const res = await fetch(`/api/produk/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];

  const rawData: ProdukSuggestion[] = await res.json();

  const seen = new Map<string, ProdukSuggestion>();
  rawData.forEach((prod) => {
    const key = `${prod.nama.trim().toLowerCase()}|${prod.kode.trim().toLowerCase()}`;

    if (seen.has(key)) {
      const existing = seen.get(key)!;
      const existingVarianMap = new Map(existing.variants.map(v => [v.warna.toLowerCase(), v]));

      prod.variants.forEach((v) => {
        const vKey = v.warna.toLowerCase();
        if (!existingVarianMap.has(vKey)) {
          existing.variants.push(v);
        }
      });
    } else {
      seen.set(key, {
        ...prod,
        variants: [...prod.variants],
      });
    }
  });

  return Array.from(seen.values());
}

export function formatHarga(value: number): string {
  return `Rp ${value.toLocaleString('id-ID')}`;
}