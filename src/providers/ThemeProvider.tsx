// test file ::

"use client"

// ✅ FILE PATH: src/providers/ThemeProvider.tsx

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={{ "data-cfasync": "false" } as unknown as React.ComponentProps<"script">}
      {...props}
    >
      <ThemeHotkey />
      {children}
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // Prevent if default is already prevented or it's a repeating key
      if (event.defaultPrevented || event.repeat) {
        return
      }

      // Ignore if any modifier key is pressed (Ctrl, Cmd, Alt)
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      // ✅ FIXED: Safe check for event.key (prevents "toLowerCase of undefined" error)
      if (!event.key) {
        return
      }

      const pressedKey = event.key.toLowerCase()

      // Only respond to "D" key
      if (pressedKey !== "d") {
        return
      }

      // Don't toggle theme when user is typing in input fields
      if (isTypingTarget(event.target)) {
        return
      }

      // Toggle between light and dark theme
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }






































// "use client"

// // ✅ FILE PATH: src/providers/ThemeProvider.tsx

// import * as React from "react"
// import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

// function ThemeProvider({
//   children,
//   ...props
// }: React.ComponentProps<typeof NextThemesProvider>) {
//   return (
//     <NextThemesProvider
//       attribute="class"
//       defaultTheme="system"
//       enableSystem
//       disableTransitionOnChange
     
//       scriptProps={{ "data-cfasync": "false" } as unknown as React.ComponentProps<"script">}
//       {...props}
//     >
//       <ThemeHotkey />
//       {children}
//     </NextThemesProvider>
//   )
// }

// function isTypingTarget(target: EventTarget | null) {
//   if (!(target instanceof HTMLElement)) {
//     return false
//   }

//   return (
//     target.isContentEditable ||
//     target.tagName === "INPUT" ||
//     target.tagName === "TEXTAREA" ||
//     target.tagName === "SELECT"
//   )
// }

// function ThemeHotkey() {
//   const { resolvedTheme, setTheme } = useTheme()

//   React.useEffect(() => {
//     function onKeyDown(event: KeyboardEvent) {
//       if (event.defaultPrevented || event.repeat) {
//         return
//       }

//       if (event.metaKey || event.ctrlKey || event.altKey) {
//         return
//       }

//       if (event.key.toLowerCase() !== "d") {
//         return
//       }

//       if (isTypingTarget(event.target)) {
//         return
//       }

//       setTheme(resolvedTheme === "dark" ? "light" : "dark")
//     }

//     window.addEventListener("keydown", onKeyDown)

//     return () => {
//       window.removeEventListener("keydown", onKeyDown)
//     }
//   }, [resolvedTheme, setTheme])

//   return null
// }

// export { ThemeProvider }