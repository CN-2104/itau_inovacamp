import { Header } from "./components/layout/Header"
import { Chat } from "./components/Chat"

export function App() {
  return (
    <div className="flex h-dvh min-h-0 flex-col">
      <Header onBack={() => console.log("Back button clicked")} />
      <main className="flex min-h-0 flex-1 flex-col">
        <Chat />
      </main>
    </div>
  )
}

export default App
