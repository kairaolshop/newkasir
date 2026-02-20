import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params:Promise< { id: string }> }
) {
  const id = await params;
  const idNumber = Number(id);

  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.penjualan.findMany({
        where: { transaksiId: idNumber }
      });
      for (const item of items) {
        await tx.varian.update({
          where: { id: item.varianId },
          data: { stok: { increment: item.jumlah } },
        });
      }
      await tx.transaksi.delete({
        where: { id: idNumber },
      });
    });

    return NextResponse.json({ message: 'Berhasil hapus transaksi dan stok kembali' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNumber = Number(id);

  if (isNaN(idNumber)) {
    return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });
  }

  const body = await request.json();
  const { items, kodePesanan, marketplace, tanggalInput } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
  }

  const tglTransaksi = tanggalInput ? new Date(tanggalInput) : new Date();

  try {
    // 1. Cek stok semua varian dulu (read-only, di luar transaction)
    for (const item of items) {
      const varian = await prisma.varian.findUnique({
        where: { id: item.varianId },
      });
      if (!varian) {
        throw new Error(`Varian ${item.varianId} tidak ditemukan`);
      }
      if (varian.stok < item.jumlah) {
        throw new Error(`Stok untuk varian ${item.varianId} tidak mencukupi`);
      }
    }

    // 2. Jika semua OK, baru jalankan transaction untuk write
    const result = await prisma.$transaction(async (tx) => {
      // Kembalikan stok lama
      const oldItems = await tx.penjualan.findMany({
        where: { transaksiId: idNumber },
      });
      for (const oldItem of oldItems) {
        await tx.varian.update({
          where: { id: oldItem.varianId },
          data: { stok: { increment: oldItem.jumlah } },
        });
      }

      // Hapus detail lama
      await tx.penjualan.deleteMany({ where: { transaksiId: idNumber } });

      // Update header
      const header = await tx.transaksi.update({
        where: { id: idNumber },
        data: { kodePesanan, marketplace, tanggal: tglTransaksi },
      });

      // Tambah detail baru & potong stok
      for (const item of items) {
        await tx.penjualan.create({
          data: {
            transaksiId: header.id,
            varianId: item.varianId,
            jumlah: item.jumlah,
            hargaJual: item.hargaJual,
            hargaBeli: item.hargaBeli,
            totalAdmin: item.totalAdmin,
            zakat: item.totalZakat || 0,
            laba: item.labaBersih,
            tanggal: tglTransaksi,
          },
        });

        await tx.varian.update({
          where: { id: item.varianId },
          data: { stok: { decrement: item.jumlah } },
        });
      }

      return header;
    }, );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('PUT Error for ID:', idNumber, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}