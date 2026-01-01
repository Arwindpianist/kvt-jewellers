"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TopBar } from "./TopBar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/home", label: "HOME" },
    { href: "/about", label: "ABOUT US" },
    { href: "/live-rate", label: "LIVE RATE" },
    {
      href: "/products",
      label: "PRODUCTS",
      submenu: [
        { href: "/products/coin", label: "COIN" },
        { href: "/products/bar", label: "BAR" },
        { href: "/products/jewellery", label: "JEWELLERY" },
      ],
    },
    { href: "/contact", label: "CONTACT US" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <TopBar />
      <nav className="border-b bg-brand-600 text-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link href="/home" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold text-white">
                KVT
              </span>
              <span className="text-sm text-white/80">Jewellers</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-white transition-colors hover:text-brand-200"
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
          </div>

          {/* Mobile Menu - Bottom Drawer */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-brand-700"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
            </SheetTrigger>
            <SheetContent 
              side="bottom" 
              className="h-[85vh] rounded-t-3xl border-t-4 border-brand-500 bg-brand-600 text-white p-0"
            >
              <div className="flex flex-col h-full">
                {/* Drawer Handle */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-12 h-1.5 bg-white/30 rounded-full" />
                </div>

                {/* Drawer Header */}
                <SheetHeader className="px-6 pb-4 border-b border-white/20">
                  <SheetTitle className="text-2xl font-serif text-white text-left">
                KVT Jewellers
                  </SheetTitle>
                  <SheetDescription className="text-white/80 text-left">
                    Navigation Menu
                  </SheetDescription>
                </SheetHeader>

                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <nav className="space-y-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          className="block rounded-lg px-4 py-4 text-base font-medium text-white transition-colors hover:bg-brand-700 active:bg-brand-800"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                        {item.submenu && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            transition={{ delay: index * 0.05 + 0.1 }}
                            className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 pl-4"
                          >
                            {item.submenu.map((subItem, subIndex) => (
                              <motion.div
                                key={subItem.href}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 + 0.15 + subIndex * 0.05 }}
                              >
                                <Link
                                  href={subItem.href}
                                  className="block rounded-lg px-4 py-3 text-sm text-white/90 transition-colors hover:bg-brand-700 hover:text-white active:bg-brand-800"
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </motion.div>
                    ))}
                  </nav>
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-4 border-t border-white/20">
                  <p className="text-xs text-white/60 text-center">
                    © {new Date().getFullYear()} KVT Jewellers. All rights reserved.
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
