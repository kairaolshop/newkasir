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

        await prisma.barang.update({
            where: { id },
            data: {
                kode: data.kode,
                nama: data.nama,
                hargaJual: data.hargaJual,
                hargaBeli: data.hargaBeli,
                stok: totalStok,

                variants: {
                    upsert: data.variants.map(v => ({
                        where: { id: v.id ?? 0 },
                        update: {
                            warna: v.warna,
                            stok: v.stok,
                        },
                        create: {
                            warna: v.warna,
                            stok: v.stok,
                        },
                    })),
                }
            },
        });
        revalidatePath("/databarang");
    } catch (error) {
        console.error("Database Error:", error);
        throw new Error("Gagal membuat barang");
    }
}