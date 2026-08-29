import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

import { Header } from "./components/layout/Header"
import { Chat } from "./components/Chat"
import { MigrateDirectDebits } from "./components/MigrateDirectDebits"
import { MigrateFinancings } from "./components/MigrateFinancings"

/** Screens the chat's quick actions push on top of the conversation. */
const SCREENS = {
  "migrar-financiamento": MigrateFinancings,
  "migrar-debitos-automaticos": MigrateDirectDebits,
} satisfies Record<string, React.ComponentType>

type Screen = keyof typeof SCREENS | "chat"

/** iOS-like push: the screen slides over the chat, which parallaxes behind. */
const SCREEN_TRANSITION = { duration: 0.32, ease: [0.32, 0.72, 0, 1] } as const

export function App() {
  const [screen, setScreen] = React.useState<Screen>("chat")
  const shouldReduceMotion = useReducedMotion()
  const isOverlayOpen = screen !== "chat"
  const ActiveScreen = screen === "chat" ? null : SCREENS[screen]

  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <Header onBack={() => setScreen("chat")} />
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Kept mounted behind the overlay so the conversation survives a
            round trip to another screen. */}
        <motion.div
          className="flex min-h-0 flex-1 flex-col"
          inert={isOverlayOpen}
          animate={
            isOverlayOpen
              ? { x: shouldReduceMotion ? 0 : "-20%", opacity: 0.6 }
              : { x: 0, opacity: 1 }
          }
          transition={SCREEN_TRANSITION}
        >
          <Chat
            onNavigate={(target) => {
              if (target in SCREENS) {
                setScreen(target as Screen)
                return
              }

              // TODO: route to the dedicated flow once those screens exist.
              console.log("navigate to", target)
            }}
          />
        </motion.div>

        <AnimatePresence>
          {ActiveScreen ? (
            <motion.div
              key={screen}
              className="absolute inset-0 z-10 flex flex-col bg-background"
              initial={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
              animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={SCREEN_TRANSITION}
            >
              <ActiveScreen />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
