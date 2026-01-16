"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Monitor, Tablet, Smartphone } from "lucide-react";

/**
 * Developer Tools - Responsive Design Helper
 * Shows viewport size, breakpoint, and device type
 * Remove this after mobile testing is complete
 */
export function DevTools() {
  const [isOpen, setIsOpen] = useState(true);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [breakpoint, setBreakpoint] = useState<string>("");

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      // Determine breakpoint
      const width = window.innerWidth;
      if (width >= 1280) {
        setBreakpoint("xl (≥1280px)");
      } else if (width >= 1024) {
        setBreakpoint("lg (≥1024px)");
      } else if (width >= 768) {
        setBreakpoint("md (≥768px)");
      } else if (width >= 640) {
        setBreakpoint("sm (≥640px)");
      } else {
        setBreakpoint("default (<640px)");
      }
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700"
        size="icon"
      >
        <Monitor className="h-5 w-5" />
      </Button>
    );
  }

  const getDeviceIcon = () => {
    if (viewport.width >= 1024) {
      return <Monitor className="h-5 w-5" />;
    } else if (viewport.width >= 768) {
      return <Tablet className="h-5 w-5" />;
    } else {
      return <Smartphone className="h-5 w-5" />;
    }
  };

  const getDeviceType = () => {
    if (viewport.width >= 1024) {
      return "Desktop";
    } else if (viewport.width >= 768) {
      return "Tablet";
    } else {
      return "Mobile";
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] shadow-2xl border-2 border-brand-300">
      <CardHeader className="bg-brand-50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-brand-700 flex items-center gap-2">
            {getDeviceIcon()}
            Developer Tools
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3 text-xs">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Device Type:</span>
            <Badge variant="outline" className="text-xs">
              {getDeviceType()}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Breakpoint:</span>
            <Badge variant="outline" className="text-xs">
              {breakpoint}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Viewport:</span>
            <span className="font-mono text-xs">
              {viewport.width} × {viewport.height}px
            </span>
          </div>
        </div>
        <div className="pt-2 border-t">
          <p className="text-muted-foreground text-[10px] leading-relaxed">
            Use browser DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M) for responsive testing
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
