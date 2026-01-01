"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LogoutButton } from "./LogoutButton";
import { Badge } from "@/components/ui/badge";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { User } from "lucide-react";

interface StaffHeaderProps {
  userName: string;
}

export function StaffHeader({ userName }: StaffHeaderProps) {
  const navItems = [
    { href: "/staff/dashboard", label: "Dashboard" },
    { href: "/staff/prices", label: "Prices" },
    { href: "/staff/products", label: "Products" },
    { href: "/staff/analytics", label: "Analytics" },
    { href: "/staff/activity", label: "Activity" },
    { href: "/staff/settings", label: "Settings" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-brand-600 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/staff/dashboard" className="flex items-center space-x-2">
              <span className="font-serif text-xl font-bold text-white">
                KVT
              </span>
              <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                Staff Portal
              </Badge>
            </Link>
          </motion.div>
          <nav className="hidden items-center space-x-6 md:flex">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-white/90 transition-colors hover:text-white"
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    className="block"
                  >
                    {item.label}
                  </motion.span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-white"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeSwitcher />
          <div className="hidden items-center space-x-2 rounded-lg bg-white/10 px-3 py-1.5 md:flex">
            <User className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white">
              {userName}
            </span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

