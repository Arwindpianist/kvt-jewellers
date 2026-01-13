"use client";

import { useEffect } from "react";

/**
 * ContentProtection - Hardens customer-facing pages against copying and scripting
 * 
 * Implements multiple layers of protection:
 * - Disables right-click context menu
 * - Disables text selection
 * - Blocks keyboard shortcuts (Ctrl+C, Ctrl+V, Ctrl+A, etc.)
 * - Disables drag and drop (including images)
 * - Blocks developer tools shortcuts
 * - Prevents image saving via drag
 * - Blocks print screen attempts (limited effectiveness)
 * 
 * Note: Complete protection is impossible, but this deters casual copying.
 * Determined users can still access content via browser dev tools or disabling JavaScript.
 */
export function ContentProtection() {
  useEffect(() => {
    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Prevent drag and drop (including images)
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent image dragging
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Block keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+X, Ctrl+S, Ctrl+P, Ctrl+U, Ctrl+I, Ctrl+J
      if (e.ctrlKey || e.metaKey) {
        const blockedKeys = ["c", "v", "a", "x", "s", "p", "u", "i", "j"];
        if (blockedKeys.includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Block F12 (Developer Tools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (DevTools)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        const blockedShiftKeys = ["I", "J", "C", "K"];
        if (blockedShiftKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }

      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        return false;
      }

      // Block Print Screen (limited effectiveness)
      if (e.key === "PrintScreen") {
        e.preventDefault();
        return false;
      }
    };

    // Prevent copy, cut, paste events
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    // Prevent image saving via right-click or drag
    const handleMouseDown = (e: MouseEvent) => {
      // Block right-click on images
      if (e.button === 2) {
        const target = e.target as HTMLElement;
        if (target.tagName === "IMG" || target.closest("img")) {
          e.preventDefault();
          return false;
        }
      }
    };

    // Add event listeners with capture phase for better blocking
    const options = { capture: true, passive: false };

    document.addEventListener("contextmenu", handleContextMenu, options);
    document.addEventListener("selectstart", handleSelectStart, options);
    document.addEventListener("dragstart", handleDragStart, options);
    document.addEventListener("drag", handleDrag, options);
    document.addEventListener("keydown", handleKeyDown, options);
    document.addEventListener("copy", handleCopy, options);
    document.addEventListener("cut", handleCut, options);
    document.addEventListener("paste", handlePaste, options);
    document.addEventListener("mousedown", handleMouseDown, options);

    // Add CSS to prevent text selection globally
    const style = document.createElement("style");
    style.id = "content-protection-styles";
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      /* Allow text selection in form inputs */
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      /* Prevent image dragging */
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: auto !important;
      }
      
      /* Prevent image context menu */
      img {
        -webkit-touch-callout: none !important;
      }
      
      /* Disable text selection highlight */
      ::selection {
        background: transparent !important;
      }
      
      ::-moz-selection {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu, options);
      document.removeEventListener("selectstart", handleSelectStart, options);
      document.removeEventListener("dragstart", handleDragStart, options);
      document.removeEventListener("drag", handleDrag, options);
      document.removeEventListener("keydown", handleKeyDown, options);
      document.removeEventListener("copy", handleCopy, options);
      document.removeEventListener("cut", handleCut, options);
      document.removeEventListener("paste", handlePaste, options);
      document.removeEventListener("mousedown", handleMouseDown, options);
      
      const styleElement = document.getElementById("content-protection-styles");
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // This component doesn't render anything
  return null;
}
