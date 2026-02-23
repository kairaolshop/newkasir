"use client"

import { cn } from "@/lib/utils";
import { Flag, Settings, Package, LogOut, ShoppingBasket, Ban, Store, AlignEndHorizontal, ChartSpline, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function MainNav({
    
  className,
}: React.HTMLAttributes<HTMLElement>) { 
  const pathname = usePathname();
  const { data: session } = useSession();
  

  const routes = [
  {
    href: `/`,
    label: "Penjualan",
    active: pathname === `/`,
    icon: Store,
  },
  {
    href: `/rekappenjualan`,
    label: "Data Penjualan",
    active: pathname === `/rekappenjualan`,
    icon: ShoppingBasket,
  },
  {
    href: `/penghasilan`,
    label: "Rekap Penghasilan",
    active: pathname === `/penghasilan`,
    icon: ChartSpline,
  },
  {
    href: `/grafik`,
    label: "Grafik",
    active: pathname === `/grafik`,
    icon: AlignEndHorizontal,
  },
  {
    href: `/belumbayar`,
    label: "Belum Bayar",
    active: pathname === `/belumbayar`,
    icon: ShoppingBag,
  },
  {
    href: `/databarang`,
    label: "Data produk",
    active: pathname === `/databarang`,
    icon: Package,
  },
  { href: "/settingAdmin", label: "Setting Admin", active: pathname === "/settingAdmin", icon: Settings },
    ...(session ? [{
      href: "/login",
      label: "Logout",
      active: false,
      icon: LogOut,
      onClick: () => signOut({ callbackUrl: "/login" }),
    }] : []),
  ];
  const validHrefs = routes
  .filter((route) => route.href !== "#" && route.href !== "")
  .map((route) => route.href);
const isValidPath = validHrefs.includes(pathname);
if (!isValidPath) {
  return null;
}
  return (
    <nav className={cn("flex md:grid-2 grid items-center text-xs", className)}>
      {routes.map((route) => {
        const Icon = route.icon;
        const isLogout = route.onClick !== undefined;

        if (isLogout) {
          return (
            <button
              key={route.label}
              onClick={route.onClick}
              className={cn(
                "flex items-center rounded p-2 gap-2 transition-colors",
                "text-slate-600 hover:text-red-600 hover:bg-red-100"
              )}
            >
              <Icon className="w-5 h-5" />
              {route.label}
            </button>
          );
        }

        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center rounded gap-2 text-xs p-2 transition-colors",
              route.active
                ? "bg-[#a38adf] text-white"
                : "text-slate-600 hover:text-primary hover:bg-[#8b5bff] hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}