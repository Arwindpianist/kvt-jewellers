"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed - multiple detection methods
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const isAlreadyInstalled = isStandalone || isIOSStandalone;
    
    if (isAlreadyInstalled) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed before (stored in localStorage)
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          {/* Decorative background elements - Light mode */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-50/30 via-transparent to-gold-50/20 dark:hidden pointer-events-none" />
          
          {/* Decorative circles - Light mode */}
          <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-brand-200/40 to-gold-200/30 blur-xl dark:hidden pointer-events-none" />
          <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-gradient-to-br from-gold-200/40 to-brand-200/30 blur-xl dark:hidden pointer-events-none" />
          
          {/* Decorative background elements - Dark mode */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-brand-500/[0.15] via-transparent to-gold-500/[0.1] hidden dark:block pointer-events-none" />
          
          {/* Decorative circles - Dark mode */}
          <div className="absolute -top-2 -right-2 h-16 w-16 rounded-full bg-gradient-to-br from-brand-500/35 to-gold-500/30 blur-xl hidden dark:block pointer-events-none" />
          <div className="absolute -bottom-2 -left-2 h-12 w-12 rounded-full bg-gradient-to-br from-gold-500/35 to-brand-500/30 blur-xl hidden dark:block pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 h-8 w-8 rounded-full bg-gradient-to-br from-brand-400/25 to-gold-400/20 blur-lg hidden dark:block pointer-events-none" />
          
          <div className="relative rounded-lg border-2 border-brand-200/50 dark:border-brand-700/50 bg-white dark:bg-card-level-2 shadow-2xl dark:shadow-card-floating p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-500 dark:to-brand-600 flex-shrink-0 shadow-md">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-700 dark:text-brand-300 text-sm mb-1">
                  Install KVT Jewellers App
                </h3>
                <p className="text-xs text-muted-foreground dark:text-foreground/70 mb-3">
                  Get quick access to live prices and products. Works offline!
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={handleInstall}
                    size="sm"
                    className="gold-gradient-button rounded-lg text-xs px-3 py-1.5 h-auto"
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Install
                  </Button>
                  <Button
                    onClick={handleDismiss}
                    size="sm"
                    variant="ghost"
                    className="text-xs px-2 py-1.5 h-auto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
