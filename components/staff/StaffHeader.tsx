"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Drawer } from "vaul";
import { LogoutButton } from "./LogoutButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { User, Menu, LayoutDashboard, DollarSign, Package, BarChart3, Activity, Settings, LogOut, ShoppingBag, Users } from "lucide-react";
import { logger } from "@/lib/logger";

interface StaffHeaderProps {
  userName: string;
  userRole?: 'admin' | 'staff';
}

const navItems = [
  { href: "/staff/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/staff/orders", label: "Orders", icon: ShoppingBag },
  { href: "/staff/prices", label: "Prices", icon: DollarSign },
  { href: "/staff/products", label: "Products", icon: Package },
  { href: "/staff/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/staff/activity", label: "Activity", icon: Activity },
  { href: "/staff/settings", label: "Settings", icon: Settings },
];

const adminNavItems = [
  { href: "/staff/staff-users", label: "Staff Users", icon: Users },
  { href: "/staff/customers", label: "Customers", icon: Users },
];

export function StaffHeader({ userName, userRole = 'staff' }: StaffHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Combine nav items - add admin items if user is admin
  const allNavItems = userRole === 'admin' 
    ? [...navItems, ...adminNavItems]
    : navItems;

  // Close drawer when pathname changes (navigation occurred)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

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

  // Handle navigation and close drawer
  const handleNavigation = (href: string) => {
    setDrawerOpen(false);
    router.push(href);
  };

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
            {allNavItems.map((item, index) => {
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
          {/* Desktop User Info & Logout */}
          <div className="hidden items-center space-x-3 md:flex">
            <div className="flex items-center space-x-2 rounded-lg bg-white/10 px-3 py-1.5">
              <User className="h-4 w-4 text-white/80" />
              <span className="text-sm font-medium text-white">
                {userName}
              </span>
            </div>
            <LogoutButton />
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
                    <button
                      onClick={() => handleNavigation("/staff/dashboard")}
                      className="flex w-full items-center space-x-2 mb-2 rounded-lg px-2 py-2 -mx-2 transition-colors hover:bg-white/10 active:bg-white/20 text-left group"
                    >
                      <span className="font-serif text-2xl font-bold text-white group-hover:scale-105 transition-transform">
                        KVT
                      </span>
                      <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                        Staff Portal
                      </Badge>
                    </button>
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
                      {allNavItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <button
                              onClick={() => handleNavigation(item.href)}
                              className={`flex w-full items-center gap-3 rounded-lg px-4 py-4 text-base font-medium transition-colors text-left cursor-pointer ${
                                isActive
                                  ? "bg-white/20 text-white shadow-lg"
                                  : "text-white hover:bg-brand-700 active:bg-brand-800"
                              }`}
                            >
                              <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-white" : "text-white/80"}`} />
                              <span className="flex-1">{item.label}</span>
                              {isActive && (
                                <motion.div
                                  className="ml-auto h-2 w-2 rounded-full bg-white flex-shrink-0"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.1 }}
                                />
                              )}
                            </button>
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
                    {/* Mobile Logout Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="pt-2"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await fetch("/api/auth/logout", {
                              method: "POST",
                            });
                            window.location.href = "/login";
                          } catch (error) {
                            logger.error("Logout error", error);
                            window.location.href = "/login";
                          }
                        }}
                        className="w-full flex items-center justify-center gap-2 border-white/30 text-white hover:bg-white/20 hover:text-white bg-white/5"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </Button>
                    </motion.div>
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

