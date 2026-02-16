"use client"

import { cn } from "@/lib/utils";
import { Flag, Settings, Package, LogOut, ShoppingBasket, Ban, Store } from "lucide-react";
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
    icon: Flag,
  },
  {
    href: `/belumbayar`,
    label: "Belum Bayar",
    active: pathname === `/belumbayar`,
    icon: Ban,
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
    <nav className={cn("flex items-center", className)}>
      {routes.map((route) => {
        const Icon = route.icon;
        const isLogout = route.onClick !== undefined;

        if (isLogout) {
          return (
            <button
              key={route.label}
              onClick={route.onClick}
              className={cn(
                "flex items-center gap-2 rounded text-sm p-2 transition-colors",
                "text-slate-600 hover:text-red-600 hover:bg-red-50"
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
              "flex items-center gap-2 rounded text-lg p-2 transition-colors",
              route.active
                ? "bg-slate-900 text-white"
                : "text-slate-600 text-sm hover:text-primary hover:bg-slate-200"
            )}
          >
            <Icon className="w-5 h-5" />
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}