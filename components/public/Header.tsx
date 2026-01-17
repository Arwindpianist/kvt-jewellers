"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, ShoppingCart, User, Heart, Globe } from "lucide-react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { RotatingText } from "@/components/ui/shadcn-io/rotating-text";
import { TopBar } from "./TopBar";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { UserMenu } from "./UserMenu";
import { CartButton } from "./CartButton";
import { WishlistButton } from "./WishlistButton";
import { CurrencyToggle } from "./CurrencyToggle";
import { LanguageSelector } from "./LanguageSelector";
import { Badge } from "@/components/ui/badge";
import { getCartItemCount } from "@/lib/cart";
import { getWishlistCount } from "@/lib/wishlist";
import { useCurrency } from "@/lib/currency-context";
import { useTranslations } from "next-intl";
import { categoryGroups, categoryConfig } from "@/lib/product-categories";
import { getCategoryUrl } from "@/lib/category-utils";
import type { ProductCategory } from "@/types/products";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [productsMenuOpen, setProductsMenuOpen] = useState(false);
  const [mobileProductsExpanded, setMobileProductsExpanded] = useState(false);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const { currency } = useCurrency();

  // Close drawer when pathname changes (navigation occurred)
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Close products menu when clicking outside (DropdownMenu handles its own behavior, this is just a backup)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(event.target as Node)) {
        if (triggerButtonRef.current && !triggerButtonRef.current.contains(event.target as Node)) {
          setProductsMenuOpen(false);
        }
      }
    };

    if (productsMenuOpen) {
      // Small delay to avoid conflicts with DropdownMenu's own click handling
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside, true);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside, true);
      };
    }
  }, [productsMenuOpen]);

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

  // Get wishlist count
  useEffect(() => {
    setWishlistCount(getWishlistCount());
    const handleWishlistChange = () => {
      setWishlistCount(getWishlistCount());
    };
    window.addEventListener("storage", handleWishlistChange);
    window.addEventListener("wishlistUpdated", handleWishlistChange);
    return () => {
      window.removeEventListener("storage", handleWishlistChange);
      window.removeEventListener("wishlistUpdated", handleWishlistChange);
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

  // Handle wishlist click
  const handleWishlistClick = () => {
    setDrawerOpen(false);
    router.push("/wishlist");
  };

  // Build all categories for products menu
  const allCategories = [
    ...categoryGroups.investment.categories,
    ...categoryGroups.jewelry.categories,
  ].map((category) => ({
    href: getCategoryUrl(category),
    label: categoryConfig[category].label,
    category: category,
    group: categoryConfig[category].group,
  }));

  const investmentCategories = allCategories.filter((c) => c.group === "investment");
  const jewelryCategories = allCategories.filter((c) => c.group === "jewelry");

  const navItems = [
    { href: "/home", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/live-rate", label: t("nav.liveRate") },
    { href: "/contact", label: t("nav.contact") },
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
            className="flex-shrink-0"
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

          {/* Desktop Navigation - Center */}
          <div className="hidden items-center space-x-6 md:flex flex-1 justify-center mx-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                style={{ willChange: 'transform, opacity' }}
              >
                <Link
                  href={item.href}
                  className="relative text-sm font-medium text-white transition-colors hover:text-white/90"
                >
                  <motion.span
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="block"
                  >
                    {item.label}
                  </motion.span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-white"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                </Link>
              </motion.div>
            ))}
            
            {/* Products Menu with Dropdown */}
            <motion.div
              key="products-menu"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: navItems.length * 0.1,
                duration: 0.4,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              style={{ 
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
              }}
            >
              <DropdownMenu open={productsMenuOpen} onOpenChange={setProductsMenuOpen} modal={false}>
                <div
                  ref={productsMenuRef}
                  className="relative"
                >
                  <DropdownMenuTrigger asChild>
                  <button 
                    ref={triggerButtonRef}
                    className="ghost relative text-sm font-medium text-white transition-colors hover:text-white/90 flex items-center gap-1 !bg-transparent !border-0 !shadow-none outline-none focus:outline-none focus:ring-0 focus-visible:outline-none hover:!bg-transparent active:!bg-transparent [&[data-state=open]]:!bg-transparent [&[data-state=closed]]:!bg-transparent [&[data-state]]:!bg-transparent products-dropdown-trigger"
                  >
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        className="block"
                      >
                        {t("nav.products")}
                      </motion.span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${productsMenuOpen ? "rotate-180" : ""}`} />
                    <motion.div
                      className="absolute -bottom-1 left-0 h-0.5 bg-white"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </button>
                </DropdownMenuTrigger>
              </div>
              <DropdownMenuContent
                align="start"
                className="w-80 p-0 border-0 shadow-none dark:border-0 dark:shadow-none bg-background/95 dark:bg-background/95 backdrop-blur-sm"
              >
                {/* Investment Products Section */}
                <div className="px-4 py-2 border-b border-border/50">
                  <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-0">
                    {categoryGroups.investment.label}
                  </DropdownMenuLabel>
                </div>
                <div className="py-1">
                  {investmentCategories.map((cat) => (
                    <DropdownMenuItem key={cat.href} asChild>
                      <Link
                        href={cat.href}
                        className="cursor-pointer"
                        onClick={() => setProductsMenuOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>

                {/* Jewelry Section */}
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="px-4 py-2 border-b border-border/50">
                  <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground px-0">
                    {categoryGroups.jewelry.label}
                  </DropdownMenuLabel>
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {jewelryCategories.map((cat) => (
                    <DropdownMenuItem key={cat.href} asChild>
                      <Link
                        href={cat.href}
                        className="cursor-pointer"
                        onClick={() => setProductsMenuOpen(false)}
                      >
                        {cat.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </div>

                {/* View All Link */}
                <DropdownMenuSeparator className="bg-border/50" />
                <div className="p-2">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/products"
                      className="cursor-pointer text-center justify-center font-medium text-primary"
                      onClick={() => setProductsMenuOpen(false)}
                    >
                      {t("nav.viewAllProducts")}
                    </Link>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            </motion.div>
          </div>

          {/* Utility Items Island */}
          <div className="hidden items-center gap-1 md:flex flex-shrink-0">
            <div className="flex items-center gap-0.5 rounded-md bg-white/[0.05] dark:bg-white/[0.05] px-1 py-0.5 backdrop-blur-sm border-0">
              {/* Currency Toggle with Tooltip */}
              <div className="relative group">
                <CurrencyToggle />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {t("nav.currency")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 w-px bg-white/20" />
              
              {/* Wishlist with Tooltip */}
              <div className="relative group">
                <WishlistButton />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {t("nav.wishlist")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 w-px bg-white/20" />
              
              {/* Cart with Tooltip */}
              <div className="relative group">
                <CartButton />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {t("nav.cart")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 w-px bg-white/20" />
              
              {/* User Menu with Tooltip */}
              <div className="relative group">
                <UserMenu />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {user ? t("nav.account") : t("nav.signIn")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 w-px bg-white/20" />
              
              {/* Language Selector with Tooltip */}
              <div className="relative group">
                <LanguageSelector />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {t("language.selectLanguage")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
              <div className="h-3 w-px bg-white/20" />
              
              {/* Theme Switcher with Tooltip */}
              <div className="relative group">
                <ThemeSwitcher />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-800 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                  {t("common.theme")}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
                    <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex-shrink-0">
            <Drawer.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
              <Drawer.Trigger asChild>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Button
                    ref={triggerButtonRef}
                    variant="ghost"
                    size="icon"
                    className={`text-white hover:bg-brand-700 ${drawerOpen ? "bg-brand-700" : ""}`}
                    style={!drawerOpen ? { backgroundColor: 'transparent' } : undefined}
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </motion.div>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
                <Drawer.Content className="bg-brand-600 text-white dark:bg-background dark:text-foreground h-[85vh] fixed bottom-0 left-0 right-0 outline-none rounded-t-3xl border-t-4 border-brand-700 dark:border-border z-[100]">
                  <div className="flex flex-col h-full p-0">
                    {/* Drawer Handle */}
                    <div className="flex justify-center pt-4 pb-2">
                      <div className="w-12 h-1.5 bg-white/30 dark:bg-muted rounded-full" />
                    </div>

                    {/* Drawer Header */}
                    <div className="px-6 pb-4 border-b border-white/20 dark:border-border">
                      <Drawer.Title className="text-2xl font-serif text-white dark:text-foreground text-left">
                        KVT Jewellers
                      </Drawer.Title>
                      <p className="text-white/80 dark:text-muted-foreground text-left text-sm mt-1">
                        {t("nav.navigationMenu")}
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
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-4 text-base font-medium text-white dark:text-foreground transition-colors text-left cursor-pointer hover:bg-white/10 dark:hover:bg-muted active:bg-white/20 dark:active:bg-secondary"
                            >
                              <span className="flex-1">{item.label}</span>
                            </button>
                          </motion.div>
                        ))}
                        
                        {/* Products with Expandable Categories */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: navItems.length * 0.05 }}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleNavigation("/products")}
                              className="flex-1 flex items-center gap-3 rounded-lg px-4 py-4 text-base font-medium text-white dark:text-foreground transition-colors text-left cursor-pointer hover:bg-white/10 dark:hover:bg-muted active:bg-white/20 dark:active:bg-secondary"
                            >
                              <span className="flex-1">{t("nav.products")}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMobileProductsExpanded(!mobileProductsExpanded);
                              }}
                              className="flex items-center justify-center rounded-lg px-3 py-4 text-white dark:text-foreground transition-colors hover:bg-white/10 dark:hover:bg-muted active:bg-white/20 dark:active:bg-secondary"
                              aria-label={mobileProductsExpanded ? "Hide categories" : "Show categories"}
                            >
                              <ChevronDown
                                className={`h-5 w-5 transition-transform ${mobileProductsExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          </div>
                          
                          {mobileProductsExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="ml-4 mt-2 space-y-1 border-l-2 border-white/20 dark:border-border pl-4"
                            >
                              {/* Investment Products */}
                              <div className="pt-2 pb-1">
                                <p className="text-xs font-semibold text-white/70 dark:text-muted-foreground uppercase tracking-wide px-4">
                                  {categoryGroups.investment.label}
                                </p>
                              </div>
                              {investmentCategories.map((cat, catIndex) => (
                                <motion.div
                                  key={cat.href}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: catIndex * 0.03 }}
                                >
                                  <button
                                    onClick={() => handleNavigation(cat.href)}
                                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/90 dark:text-foreground transition-colors text-left cursor-pointer hover:bg-white/10 dark:hover:bg-muted hover:text-white dark:hover:text-foreground active:bg-white/20 dark:active:bg-secondary"
                                  >
                                    <span className="flex-1">{cat.label}</span>
                                  </button>
                                </motion.div>
                              ))}
                              
                              {/* Jewelry */}
                              <div className="pt-3 pb-1 border-t border-white/20 dark:border-border mt-2">
                                <p className="text-xs font-semibold text-white/70 dark:text-muted-foreground uppercase tracking-wide px-4">
                                  {categoryGroups.jewelry.label}
                                </p>
                              </div>
                              {jewelryCategories.map((cat, catIndex) => (
                                <motion.div
                                  key={cat.href}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: (investmentCategories.length + catIndex) * 0.03 }}
                                >
                                  <button
                                    onClick={() => handleNavigation(cat.href)}
                                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-white/90 dark:text-foreground transition-colors text-left cursor-pointer hover:bg-white/10 dark:hover:bg-muted hover:text-white dark:hover:text-foreground active:bg-white/20 dark:active:bg-secondary"
                                  >
                                    <span className="flex-1">{cat.label}</span>
                                  </button>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </motion.div>
                      </nav>
                    </div>

                    {/* Mobile Mini Island - Utility Items */}
                    <div className="px-6 py-4 border-t border-white/20 dark:border-border">
                      <div className="flex items-center justify-center gap-2">
                        {/* Currency Toggle */}
                        <div className="relative [&_button]:text-white [&_button]:hover:text-white/90 [&_button]:hover:bg-white/10 [&_button]:dark:text-foreground [&_button]:dark:hover:bg-muted">
                          <CurrencyToggle />
                        </div>
                        <div className="h-4 w-px bg-white/20 dark:bg-border" />
                        
                        {/* Wishlist */}
                        <button
                          onClick={handleWishlistClick}
                          className="relative h-8 w-8 flex items-center justify-center text-white dark:text-foreground hover:text-white/90 dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-muted rounded transition-colors"
                        >
                          <Heart className="h-4 w-4" />
                          {wishlistCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                            >
                              {wishlistCount > 9 ? "9+" : wishlistCount}
                            </Badge>
                          )}
                        </button>
                        <div className="h-4 w-px bg-white/20 dark:bg-border" />
                        
                        {/* Cart */}
                        <button
                          onClick={handleCartClick}
                          className="relative h-8 w-8 flex items-center justify-center text-white dark:text-foreground hover:text-white/90 dark:hover:text-foreground hover:bg-white/10 dark:hover:bg-muted rounded transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          {itemCount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute -right-1 -top-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px]"
                            >
                              {itemCount > 9 ? "9+" : itemCount}
                            </Badge>
                          )}
                        </button>
                        <div className="h-4 w-px bg-white/20 dark:bg-border" />
                        
                        {/* User Menu */}
                        <div className="relative [&_button]:text-white [&_button]:hover:text-white/90 [&_button]:hover:bg-white/10 [&_button]:dark:text-foreground [&_button]:dark:hover:bg-muted">
                          <UserMenu />
                        </div>
                        <div className="h-4 w-px bg-white/20 dark:bg-border" />
                        
                        {/* Language Selector */}
                        <div className="relative [&_button]:text-white [&_button]:hover:text-white/90 [&_button]:hover:bg-white/10 [&_button]:dark:text-foreground [&_button]:dark:hover:bg-muted">
                          <LanguageSelector />
                        </div>
                        <div className="h-4 w-px bg-white/20 dark:bg-border" />
                        
                        {/* Theme Switcher */}
                        <div className="relative [&_button]:text-white [&_button]:hover:text-white/90 [&_button]:hover:bg-white/10 [&_button]:dark:text-foreground [&_button]:dark:hover:bg-muted">
                          <ThemeSwitcher />
                        </div>
                      </div>
                    </div>

                    {/* Drawer Footer */}
                    <div className="px-6 py-3 border-t border-white/20 dark:border-border">
                      <p className="text-xs text-white/70 dark:text-muted-foreground text-center">
                        {t("footer.copyright", { year: new Date().getFullYear() })}
                      </p>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </div>
      </nav>
    </header>
  );
}
