"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, ShoppingCart, User } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { RotatingText } from "@/components/ui/shadcn-io/rotating-text";
import { TopBar } from "./TopBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { Badge } from "@/components/ui/badge";
import { getCartItemCount } from "@/lib/cart";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  // Close drawer when pathname changes (navigation occurred)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Get cart item count
  useEffect(() => {
    setItemCount(getCartItemCount());
    const handleStorageChange = () => {
      setItemCount(getCartItemCount());
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("cartUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  // Get user status
  useEffect(() => {
    fetch("/api/auth/customer/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
        setUserLoading(false);
      })
      .catch(() => {
        setUserLoading(false);
      });
  }, []);

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

  // Handle cart click
  const handleCartClick = () => {
    setDrawerOpen(false);
    router.push("/cart");
  };

  // Handle account click
  const handleAccountClick = () => {
    setDrawerOpen(false);
    if (user) {
      router.push("/account");
    } else {
      router.push("/login");
    }
  };

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
              <span className="text-sm text-white/80 inline-flex items-center justify-start w-[85px] h-6 relative">
                <RotatingText 
                  text={["Jewellers", "Gold", "Silver"]}
                  duration={3000}
                  y={-15}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  containerClassName="absolute inset-0 flex items-center justify-start"
                />
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-6 md:flex">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-white transition-colors hover:text-white/90"
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
            <CartButton />
            <UserMenu />
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu - Vaul Drawer */}
          <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
            <Drawer.Trigger asChild>
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  ref={triggerButtonRef}
                  variant="ghost"
                  size="icon"
                  className={`md:hidden text-white hover:bg-brand-700 ${drawerOpen ? "bg-brand-700" : ""}`}
                  style={!drawerOpen ? { backgroundColor: 'transparent' } : undefined}
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </motion.div>
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
                    <Drawer.Title className="text-2xl font-serif text-white text-left">
                      KVT Jewellers
                    </Drawer.Title>
                    <p className="text-white/80 text-left text-sm mt-1">
                      Navigation Menu
                    </p>
                  </div>

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
                          <button
                            onClick={() => handleNavigation(item.href)}
                            className="flex w-full items-center gap-3 rounded-lg px-4 py-4 text-base font-medium text-white transition-colors text-left cursor-pointer hover:bg-brand-700 active:bg-brand-800"
                          >
                            <span className="flex-1">{item.label}</span>
                          </button>
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
                                  <button
                                    onClick={() => handleNavigation(subItem.href)}
                                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/90 transition-colors text-left cursor-pointer hover:bg-brand-700 hover:text-white active:bg-brand-800"
                                  >
                                    <span className="flex-1">{subItem.label}</span>
                                  </button>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </nav>
                  </div>

                  {/* Mobile Menu Actions - Match Desktop */}
                  <div className="px-6 py-4 border-t border-white/20 space-y-2">
                    <button
                      onClick={handleCartClick}
                      className="flex w-full items-center justify-between rounded-lg px-4 py-4 text-base font-medium text-white transition-colors hover:bg-brand-700 active:bg-brand-800 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="h-5 w-5 flex-shrink-0 text-white/80" />
                        <span className="flex-1 text-left">Cart</span>
                      </div>
                      {itemCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs flex-shrink-0"
                        >
                          {itemCount > 9 ? "9+" : itemCount}
                        </Badge>
                      )}
                    </button>
                    <button
                      onClick={handleAccountClick}
                      className="flex w-full items-center gap-3 rounded-lg px-4 py-4 text-base font-medium text-white transition-colors hover:bg-brand-700 active:bg-brand-800 cursor-pointer"
                    >
                      <User className="h-5 w-5 flex-shrink-0 text-white/80" />
                      <span className="flex-1 text-left">Account</span>
                      {userLoading ? null : user ? (
                        <span className="text-xs text-white/60 flex-shrink-0">{user.name}</span>
                      ) : (
                        <span className="text-xs text-white/60 flex-shrink-0">Sign In</span>
                      )}
                    </button>
                  </div>

                  {/* Drawer Footer */}
                  <div className="px-6 py-4 border-t border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs text-white/60">
                        Theme
                      </p>
                      <ThemeSwitcher />
                    </div>
                    <p className="text-xs text-white/60 text-center">
                      © {new Date().getFullYear()} KVT Jewellers. All rights reserved.
                    </p>
                  </div>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </nav>
    </header>
  );
}
