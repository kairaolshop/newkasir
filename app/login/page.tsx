"use client";
import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();
    const {data: session, status} = useSession()

    useEffect(() => {
        if (status === "authenticated") {
            router.replace("/");
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault();
        setError("");
        const result = await signIn("credentials", {
            redirect: false, username, password,
        });
        if (result?.error) {
            setError("setUsername atau Password salah!")
        }else {
            router.push("/");
        }
    }

    return (
        <main className="relative min-h-screen w-full flex items-center justify-center">
            {error && <p className="text0red-600 text-center mb-4 bg-red-50 p-3 rounded">{error}</p>}
            
            <div className=" absolute inset-0 -z-10">
            <Image
                src="/login-bg.png"
                alt="Image"
                fill
                className="object-cover"
                priority
            />
            </div>
            <div className="absolute inset-0 bg-black/40">
            </div>
            <div className="w-full max-w-md p-8 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Selamat Datang</h1>
          <p className="text-white/80 text-sm">Silakan login untuk mengakses kasir</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
              autoFocus
              placeholder="Masukkan username..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
              required
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-lg transition-colors shadow-lg active:scale-[0.98]"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="#" className="text-xs text-white/60 hover:text-white transition-colors">
            Lupa password? Hubungi Admin
          </a>
        </div>
      </div>
    </main>
    );
}