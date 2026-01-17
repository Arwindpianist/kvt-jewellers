"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

export type AuthRequiredAction = "wishlist" | "cart" | "buy";

const actionMessages: Record<AuthRequiredAction, string> = {
  wishlist: "add items to your wishlist",
  cart: "add items to your cart",
  buy: "add items to your cart and complete your purchase",
};

interface SignInPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: AuthRequiredAction;
  /** Optional return path for after login/register. Defaults to current pathname. */
  returnPath?: string;
}

export function SignInPromptDialog({
  open,
  onOpenChange,
  action = "cart",
  returnPath,
}: SignInPromptDialogProps) {
  const pathname = usePathname();
  const from = returnPath || pathname || "/";

  const loginUrl = `/login?from=${encodeURIComponent(from)}`;
  const registerUrl = `/register?from=${encodeURIComponent(from)}`;

  const message = actionMessages[action];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            Please sign in or create an account to {message}.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href={registerUrl} onClick={() => onOpenChange(false)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Sign up
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto gold-gradient-button">
            <Link href={loginUrl} onClick={() => onOpenChange(false)}>
              <LogIn className="mr-2 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
