import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const barang = await prisma.barang.findUnique({
    where: { id: Number(id) },
    include: { variants: true } // Pastikan varian ikut terambil
  });
  
  if (!barang) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(barang);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNumber = Number(id);
    const body = await request.json();
    const { kode, nama, hargaJual, hargaBeli, variants } = body;
    const totalStok = variants && variants.length > 0 
      ? variants.reduce((acc: number, v: any) => acc + Number(v.stok || 0), 0)
      : 0;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.varian.deleteMany({
        where: { barangId: idNumber },
      });
      return await tx.barang.update({
        where: { id: idNumber },
        data: {
          kode,
          nama,
          stok: totalStok,
          hargaJual: Number(hargaJual),
          hargaBeli: Number(hargaBeli),
          variants: variants && variants.length > 0 ? {
            create: variants.map((v: any) => ({
              warna: v.warna,
              stok: Number(v.stok),
            })),
          } : undefined,
        },
        include: { variants: true },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error update barang:", error);
    return NextResponse.json({ error: 'Gagal update barang' }, { status: 500 });
  }
}
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const idNumber = Number(id);

    if (isNaN(idNumber)) {
      return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
    }
    await prisma.barang.delete({
      where: { id: idNumber },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting barang:", error);
    return NextResponse.json(
      { error: "Gagal menghapus produk" },
      { status: 500 }
    );
  }
}