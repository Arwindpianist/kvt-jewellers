"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getWishlistCount } from "@/lib/wishlist";

export function WishlistButton() {
  const router = useRouter();
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    // Update count on mount
    setItemCount(getWishlistCount());

    // Listen for storage changes (wishlist updates)
    const handleStorageChange = () => {
      setItemCount(getWishlistCount());
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom wishlist update events
    window.addEventListener("wishlistUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlistUpdated", handleStorageChange);
    };
  }, []);

  const handleClick = () => {
    router.push("/wishlist");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-white hover:text-white/90 hover:bg-brand-700 h-8 w-8"
      onClick={handleClick}
    >
      <Heart className="h-4 w-4" />
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
