"use client"
import React, { use, useState } from "react";
import { MainNav } from "../ui/main-navbar";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { DialogDescription } from "@/components/ui/dialog";

export default function Headers() {

    return (

        <>
            <div className="bg-[#8b5bff]/70 text-white py-4">
               
                <h1 className="text-center font-bold text-4xl mb-4">
                    Kasir Online
                </h1>

               
                <div className="hidden lg:flex px-4">
                    <div className="max-w-7xl mx-auto w-full bg-stone-100 rounded-lg p-2 shadow-md">
                        <MainNav className="flex justify-around items-center text-stone-800 font-medium" />
                    </div>
                </div>

                
                <div className="lg:hidden flex justify-start px-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <button className="p-2 hover:bg-white/20 rounded-md transition-colors">
                                <Menu className="text-white" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[280px]">
                            <SheetTitle className=" hidden bg-[#8b5bff] font-bold text-xl">
                               
                            </SheetTitle>
                            <DialogDescription className="sr-only">
                                Navigasi mobile
                            </DialogDescription>
                            <div className="mt-2">
                                
                                <MainNav className="px-2 gap-2 text-slate-700" />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </>

    )
}

