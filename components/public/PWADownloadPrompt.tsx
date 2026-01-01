"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone, Sparkles } from "lucide-react";
import { AnimatedButton } from "@/components/public/AnimatedButton";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWADownloadPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [hasInstallPrompt, setHasInstallPrompt] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if user has dismissed before (stored in localStorage)
    const dismissed = localStorage.getItem("pwa-download-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      // Show again after 3 days
      if (daysSinceDismissed < 3) {
        return;
      }
    }

    let timer: NodeJS.Timeout;
    let fallbackTimer: NodeJS.Timeout;
    let currentPrompt: BeforeInstallPromptEvent | null = null;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      currentPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setHasInstallPrompt(true);
      // Show prompt after capturing the install event
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Check if we're on iOS (which doesn't support beforeinstallprompt)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    if (!isStandalone) {
      if (isIOS) {
        // For iOS, show instructions after delay
        timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      } else {
        // For Android/Desktop, wait for beforeinstallprompt event
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        
        // Fallback: if event doesn't fire within 5 seconds, show anyway (might be installable)
        fallbackTimer = setTimeout(() => {
          if (!currentPrompt) {
            setShowPrompt(true);
          }
        }, 5000);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        // Show the native install prompt
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === "accepted") {
          setIsInstalled(true);
          setShowPrompt(false);
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error("Error showing install prompt:", error);
        // Fallback to instructions if prompt fails
        showInstallInstructions();
      }
    } else {
      // Fallback for iOS or browsers without install prompt
      showInstallInstructions();
    }
  };

  const showInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let message = "To install this app:\n\n";
    
    if (isIOS) {
      message += "1. Tap the Share button (square with arrow)\n";
      message += "2. Scroll down and tap 'Add to Home Screen'\n";
      message += "3. Tap 'Add' to confirm";
    } else if (isAndroid) {
      message += "1. Tap the menu (⋮) in your browser\n";
      message += "2. Tap 'Install app' or 'Add to Home Screen'\n";
      message += "3. Confirm installation";
    } else {
      message += "Look for the install icon in your browser's address bar,\n";
      message += "or use your browser's menu to find 'Install' option.";
    }
    
    alert(message);
    setShowPrompt(false);
    localStorage.setItem("pwa-download-dismissed", Date.now().toString());
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-download-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed bottom-6 left-4 right-4 z-50 md:left-auto md:right-6 md:w-96 bg-transparent pwa-prompt-wrapper"
        >
          <div className="relative rounded-xl border-2 border-brand-200/50 dark:border-brand-700/20 bg-gradient-to-br from-white via-brand-50/30 to-white dark:from-background/30 dark:via-background/25 dark:to-background/30 shadow-2xl dark:shadow-card-floating backdrop-blur-sm overflow-hidden pwa-prompt-bg">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gold-400/20 dark:from-gold-500/30 to-transparent rounded-bl-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-brand-400/20 dark:from-brand-500/30 to-transparent rounded-tr-full" />
            
            <div className="relative p-5">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-lg">
                      <Smartphone className="h-7 w-7 text-white" />
                    </div>
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="absolute -top-1 -right-1"
                    >
                      <Sparkles className="h-5 w-5 text-gold-500" />
                    </motion.div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg font-bold text-brand-700 mb-1">
                    Install KVT Jewellers App
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    Get instant access to live gold & silver prices, browse products, and stay updated—all from your home screen!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 items-center sm:items-stretch">
                    <AnimatedButton
                      onClick={handleInstall}
                      className="gold-gradient-button rounded-lg text-sm px-4 py-2 h-auto flex-1 w-full sm:w-auto"
                      disabled={!hasInstallPrompt && !deferredPrompt}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {hasInstallPrompt || deferredPrompt ? "Install Now" : "Show Instructions"}
                    </AnimatedButton>
                    <Button
                      onClick={handleDismiss}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto"
                    >
                      Maybe later
                    </Button>
                  </div>
                  
                  {!hasInstallPrompt && !deferredPrompt && (
                    <p className="mt-2 text-xs text-muted-foreground italic">
                      Native install may not be available. Click for manual instructions.
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>Works offline</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>Fast & secure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
