"use client"
import React, { use, useState } from "react";
import { MainNav } from "../ui/main-navbar";

export default function Headers() {

    return (        <>
            <div
                className="bg-[#8b5bff]/70 text-center text-white py-4 font-bold text-4xl">
                Kasir Online
                <div className="mt-4">
                <MainNav className="rounded max-w-7xl mx-auto bg-stone-100 flex justify-between" />
                </div>
            </div>
        </>
    )
}

