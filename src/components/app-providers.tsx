"use client";

import { CartProvider } from "@/lib/cart-store";
import { SessionProvider } from "@/lib/session-context";
import { ThemeProvider } from "@/lib/theme-context";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <ThemeProvider><SessionProvider><CartProvider>{children}</CartProvider></SessionProvider></ThemeProvider>;
}
