"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createBarang } from "@/app/actions/barang";

// Zod schema (validasi)
const varianSchema = z.object({
    id: z.number().optional(),
    warna: z.string().min(1, "Warna wajib diisi"),
    stok: z.number().min(0, "Stok minimal 0"),
});

const formSchema = z.object({
    id: z.number().optional(), // untuk edit
    kode: z.string().min(1, "Kode wajib"),
    nama: z.string().min(1, "Nama wajib"),
    hargaJual: z.number().min(0),
    hargaBeli: z.number().min(0),
    variants: z.array(varianSchema).min(1, "Minimal 1 varian"),
});

type FormBarang = z.infer<typeof formSchema>;

interface FormBarangProps {
    open: boolean;
    onClose: () => void;
    initialData?: Partial<FormBarang>;
    onSuccess: () => void;
}

export function FormBarang({ open, onClose, initialData, onSuccess }: FormBarangProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormBarang>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            kode: "",
            nama: "",
            hargaJual: 0,
            hargaBeli: 0,
            variants: [{ warna: "", stok: 0 }],
        },
    });

    const { fields, append, remove, replace } = useFieldArray({
  control: form.control,
  name: "variants",
});

useEffect(() => {
  if (!open) return;

  if (initialData) {
    const mappedVariants = initialData.variants?.map((v: any) => ({
      warna: v.warna,
      stok: Number(v.stok),
    })) ?? [{warna:"", stok: 0}];

    console.log("mappedVariants:", mappedVariants);

    form.reset({
      kode: initialData.kode,
      nama: initialData.nama,
      hargaJual: initialData.hargaJual,
      hargaBeli: initialData.hargaBeli,
      variants: mappedVariants,
    });

    replace(mappedVariants); 
  } else {
    const empty = [{ warna: "", stok: 0 }];

    form.reset({
      kode: "",
      nama: "",
      hargaJual: 0,
      hargaBeli: 0,
      variants: empty,
    });

    replace(empty);
  }
}, [open, initialData, replace, form]);


    const onSubmit = async (values: FormBarang) => {
        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append("kode", values.kode);
            formData.append("nama", values.nama);
            formData.append("hargaJual", String(values.hargaJual));
            formData.append("hargaBeli", String(values.hargaBeli));
            formData.append("variants", JSON.stringify(values.variants));

            await createBarang(formData);

            toast.success("Berhasil tambah barang");
            form.reset();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error("Gagal menyimpan data");
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{initialData?.id ? "Edit Barang" : "Tambah Barang Baru"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Kode & Nama */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Kode</Label>
                            <Input {...form.register("kode")} placeholder="DH-56" />
                            {form.formState.errors.kode && <p className="text-red-500 text-sm">{form.formState.errors.kode.message}</p>}
                        </div>
                        <div>
                            <Label>Nama</Label>
                            <Input {...form.register("nama")} placeholder="Brukat Mewah Olshop" />
                            {form.formState.errors.nama && <p className="text-red-500 text-sm">{form.formState.errors.nama.message}</p>}
                        </div>
                    </div>

                    {/* Harga */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>Harga Jual</Label>
                            <Input type="number" {...form.register("hargaJual", { valueAsNumber: true })} />
                        </div>
                        <div>
                            <Label>Harga Beli</Label>
                            <Input type="number" {...form.register("hargaBeli", { valueAsNumber: true })} />
                        </div>
                    </div>

                    {/* Varian Dynamic */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <Label>Varian / Warna</Label>
                            <Button className="bg-[#a38adf] hover:bg-[#8b5bff]" type="button" onClick={() => append({ warna: "", stok: 0 })} size="sm">
                                <Plus className="w-4 h-4 mr-1" /> Tambah Varian
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="flex gap-3 mb-3 items-end">
                                <div className="flex-1">
                                    <Input
                                        {...form.register(`variants.${index}.warna`)}
                                        placeholder="Warna (misal: Hitam)"
                                    />
                                </div>
                                <div className="w-24">
                                    <Input
                                        type="number"
                                        {...form.register(`variants.${index}.stok`, { valueAsNumber: true })}
                                        placeholder="Stok"
                                    />
                                </div>
                                {fields.length > 1 && (
                                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button type="button" className="hover:bg-[#8b5bff] hover:text-white" variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button className="bg-[#a38adf] hover:bg-[#8b5bff]" type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Menyimpan..." : initialData?.id ? "Update" : "Simpan Baru"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}