// app/actions/barang.ts
"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const barangSchema = z.object({
    kode: z.string().min(1),
    nama: z.string().min(1),
    hargaJual: z.number().min(0),
    hargaBeli: z.number().min(0),
    variants: z.array(
        z.object({
            id: z.number().optional(),
            warna: z.string().min(1),
            stok: z.number().min(0),
        })
    ),
});

export async function createBarang(formData: FormData) {
    try {
        const rawVariants = formData.get("variants") as string

        const data = barangSchema.parse({
            kode: formData.get("kode"),
            nama: formData.get("nama"),
            hargaJual: Number(formData.get("hargaJual")),
            hargaBeli: Number(formData.get("hargaBeli")),
            variants: JSON.parse(rawVariants),
        });

        const totalStok = data.variants.reduce(
            (sum, v) => sum + Number(v.stok), 0
        );

        await prisma.barang.create({
            data: {
                kode: data.kode,
                nama: data.nama,
                hargaJual: data.hargaJual,
                hargaBeli: data.hargaBeli,
                stok: totalStok,
                variants: {
                    create: data.variants.map(v => ({
                        warna: v.warna, stok: Number(v.stok)
                    }))
                },
            },
        });
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Gagal membuat barang");
    }

    revalidatePath("/databarang");
}

export async function updateBarang(id: number, formData: FormData) {
    try {
        const rawVariants = formData.get("variants") as string;

        const data = barangSchema.parse({
            kode: formData.get("kode"),
            nama: formData.get("nama"),
            hargaJual: Number(formData.get("hargaJual")),
            hargaBeli: Number(formData.get("hargaBeli")),
            variants: JSON.parse(rawVariants),
        });

        const totalStok = data.variants.reduce((sum, v) => sum + Number(v.stok), 0);
        
        const existing = await prisma.varian.findMany({
            where: { barangId: id },
            select: { id: true, warna: true, stok: true },
        });

        const existingMap = new Map(existing.map(v => [v.id, v]));
        const operations = [];
        
        const keptIds = new Set<number>();
        for (const input of data.variants) {
            const inputStok = Number(input.stok);

            if (input.id != null && existingMap.has(input.id)) {
                // ── Update varian existing ──
                const existingV = existingMap.get(input.id)!;

                // Hanya update kalau ada perubahan (optional, tapi hemat query)
                if (
                    existingV.warna !== input.warna ||
                    existingV.stok !== inputStok                ) {
                    operations.push(
                        prisma.varian.update({
                            where: { id: input.id },
                            data: {
                                warna: input.warna,
                                stok: inputStok,
                            },
                        })
                    );
                }

                keptIds.add(input.id);
            } else {
                operations.push(
                    prisma.varian.create({
                        data: {
                            warna: input.warna,
                            stok: inputStok,
                            barangId: id,
                        },
                    })
                );
            }
        }
        for (const old of existing) {
            if (!keptIds.has(old.id)) {
                operations.push(
                    prisma.varian.delete({
                        where: { id: old.id },
                    })
                );
            }
        }
        await prisma.$transaction([
            prisma.barang.update({
                where: { id },
                data: {
                    kode: data.kode,
                    nama: data.nama,
                    hargaJual: data.hargaJual,
                    hargaBeli: data.hargaBeli,
                    stok: totalStok,
                },
            }),
            ...operations,
        ]);

        revalidatePath("/databarang");
    } catch (error) {
        console.error("Update Barang Error:", error);
        throw new Error("Gagal memperbarui barang");
    }
}