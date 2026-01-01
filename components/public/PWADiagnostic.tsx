"use client";

import { useEffect, useState } from "react";

/**
 * Diagnostic component to check PWA installability
 * Remove this after confirming PWA works
 */
export function PWADiagnostic() {
  const [diagnostics, setDiagnostics] = useState<Record<string, boolean | string>>({});

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const checks: Record<string, boolean | string> = {};

    // Check if manifest is accessible
    fetch("/manifest.json")
      .then((res) => {
        checks.manifestAccessible = res.ok;
        return res.json();
      })
      .then((manifest) => {
        checks.manifestValid = !!manifest.name && !!manifest.icons;
        checks.manifestIcons = manifest.icons?.length > 0;
      })
      .catch(() => {
        checks.manifestAccessible = false;
      });

    // Check service worker
    if ("serviceWorker" in navigator) {
      checks.serviceWorkerSupported = true;
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        checks.serviceWorkerRegistered = registrations.length > 0;
      });
    } else {
      checks.serviceWorkerSupported = false;
    }

    // Check HTTPS
    checks.isHTTPS = window.location.protocol === "https:";
    checks.isLocalhost = window.location.hostname === "localhost";

    // Check install prompt support
    checks.installPromptSupported = "onbeforeinstallprompt" in window;

    // Check if already installed
    checks.isStandalone = window.matchMedia("(display-mode: standalone)").matches;

    setDiagnostics(checks);
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-xs rounded-lg border-2 border-red-300 bg-red-50 p-4 text-xs">
      <h4 className="font-bold text-red-700 mb-2">PWA Diagnostics (Dev Only)</h4>
      <div className="space-y-1">
        {Object.entries(diagnostics).map(([key, value]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={value ? "text-green-600" : "text-red-600"}>
              {value ? "✓" : "✗"}
            </span>
            <span className="text-gray-700">
              {key}: {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
