"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      // Use window.location for a full page reload to ensure cookie is cleared
      window.location.href = "/staff/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API call fails, redirect to login
      window.location.href = "/staff/login";
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        className="text-white hover:bg-white/20 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

