"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { getCartItemCount } from "@/lib/cart";
import { Badge } from "@/components/ui/badge";

export function CartButton() {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Update count on mount
    setItemCount(getCartItemCount());

    // Listen for storage changes (cart updates)
    const handleStorageChange = () => {
      setItemCount(getCartItemCount());
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom cart update events
    window.addEventListener("cartUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("cartUpdated", handleStorageChange);
    };
  }, []);

  const handleClick = () => {
    router.push("/cart");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-white hover:text-white/90 hover:bg-brand-700 h-8 w-8"
      onClick={handleClick}
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
        >
          {itemCount > 9 ? "9+" : itemCount}
        </Badge>
      )}
    </Button>
  );
}