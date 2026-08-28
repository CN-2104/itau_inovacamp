import { Button } from "@/components/ui/button"
import {ChevronLeft} from "lucide-react"
import Logo from "@/assets/Logo.svg"

export function Header({ onBack } : { onBack: () => void }) {
  return (
    <header className="p-4 flex items-center justify-between bg-primary text-white">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ChevronLeft className="size-6" />
      </Button>

      <div className="flex h-full flex-col items-center justify-center gap-1 pt-1">
        <div className="size-(--logo-size)">
          <img src={Logo} className="w-16 rounded object-contain" />
        </div>
      </div>

      <div className="w-8"></div>
    </header>
  )
}