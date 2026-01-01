"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Drawer } from "vaul";
import { LogoutButton } from "./LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { User, Menu, LayoutDashboard, DollarSign, Package, BarChart3, Activity, Settings } from "lucide-react";

interface StaffHeaderProps {
  userName: string;
}

const navItems = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/prices", label: "Prices", icon: DollarSign },
  { href: "/staff/products", label: "Products", icon: Package },
  { href: "/staff/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/staff/activity", label: "Activity", icon: Activity },
  { href: "/staff/settings", label: "Settings", icon: Settings },
];

export function StaffHeader({ userName }: StaffHeaderProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Force reset button state when drawer closes
  useEffect(() => {
    if (!drawerOpen && triggerButtonRef.current) {
      const button = triggerButtonRef.current;
      // Remove focus and active states
      button.blur();
      // Force remove any active/pressed state
      button.style.pointerEvents = 'none';
      setTimeout(() => {
        button.style.pointerEvents = '';
      }, 0);
    }
  }, [drawerOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-brand-600 text-white shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          {/* Logo */}
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

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-6 md:flex">
            {navItems.map((item, index) => {
              const isActive = pathname === item.href;
              
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    href={item.href}
                    className={`relative text-sm font-medium transition-colors ${
                      isActive ? "text-white" : "text-white/90 hover:text-white"
                    }`}
                  >
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="block"
                    >
                      {item.label}
                    </motion.span>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    {!isActive && (
                      <motion.div
                        className="absolute -bottom-1 left-0 h-0.5 bg-white"
                        initial={{ width: 0 }}
                        whileHover={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Mobile Menu & Desktop User Info */}
        <div className="flex items-center space-x-3">
          {/* Desktop User Info */}
          <div className="hidden items-center space-x-2 rounded-lg bg-white/10 px-3 py-1.5 md:flex">
            <User className="h-4 w-4 text-white/80" />
            <span className="text-sm font-medium text-white">
              {userName}
            </span>
          </div>

          {/* Mobile Hamburger Menu - Vaul Drawer */}
          <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Drawer.Trigger asChild>
              <Button
                ref={triggerButtonRef}
                variant="ghost"
                size="icon"
                className={`md:hidden text-white hover:bg-brand-700 ${drawerOpen ? "bg-brand-700" : ""}`}
                style={!drawerOpen ? { backgroundColor: 'transparent' } : undefined}
                aria-label="Open navigation menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
              <Drawer.Content className="bg-brand-600 text-white h-[85vh] fixed bottom-0 left-0 right-0 outline-none rounded-t-3xl border-t-4 border-brand-500 z-[100]">
                <div className="flex flex-col h-full p-0">
                  {/* Drawer Handle */}
                  <div className="flex justify-center pt-4 pb-2">
                    <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                  </div>

                  {/* Drawer Header */}
                  <div className="px-6 pb-4 border-b border-white/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-serif text-2xl font-bold text-white">
                        KVT
                      </span>
                      <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                        Staff Portal
                      </Badge>
                    </div>
                    <Drawer.Title className="text-lg font-serif text-white text-left">
                      Navigation
                    </Drawer.Title>
                    <p className="text-white/70 text-left text-sm mt-1">
                      {userName}
                    </p>
                  </div>

                  {/* Navigation Items */}
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <nav className="space-y-2">
                      {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Drawer.Close asChild>
                              <Link
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-4 text-base font-medium transition-colors ${
                                  isActive
                                    ? "bg-white/20 text-white shadow-lg"
                                    : "text-white hover:bg-brand-700 active:bg-brand-800"
                                }`}
                              >
                                <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-white/80"}`} />
                                <span>{item.label}</span>
                                {isActive && (
                                  <motion.div
                                    className="ml-auto h-2 w-2 rounded-full bg-white"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                  />
                                )}
                              </Link>
                            </Drawer.Close>
                          </motion.div>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Drawer Footer */}
                  <div className="px-6 py-4 border-t border-white/20 space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-white/80" />
                        <span className="text-sm font-medium text-white truncate">
                          {userName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/60">Theme</span>
                      <ThemeSwitcher />
                    </div>
                    <div className="pt-2">
                      <LogoutButton />
                    </div>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </div>
    </header>
  );
}

