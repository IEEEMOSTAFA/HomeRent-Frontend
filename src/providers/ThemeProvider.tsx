"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider 
      {...props}
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // এই লাইনটি Script tag error fix করবে
      storageKey="renthome-theme"
    >
      {children}
    </NextThemesProvider>
  );
}




























// "use client"

// import * as React from "react"
// import { ThemeProvider as NextThemesProvider } from "next-themes"

// export function ThemeProvider({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return (
//     <NextThemesProvider {...props}>
//       {children}
//     </NextThemesProvider>
//   )
// }