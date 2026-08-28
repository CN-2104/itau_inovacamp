interface ChatHeaderProps {
  logoUrl?: string
  label?: string
  onBack?: () => void
}

function BackIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-none stroke-current stroke-[1.8]">
      <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LogoFallback() {
  return (
    <span className="grid size-full place-items-center rounded-[9px] bg-white text-header" aria-hidden="true">
      <svg viewBox="0 0 40 40" className="size-8 fill-current">
        <path d="M20 3.5c1.3 8.9 4.5 12.1 13.4 13.4-8.9 1.3-12.1 4.5-13.4 13.4-1.3-8.9-4.5-12.1-13.4-13.4C15.5 15.6 18.7 12.4 20 3.5Z" />
      </svg>
    </span>
  )
}

export function Header({ logoUrl, label = "Assistente", onBack }: ChatHeaderProps) {
  return (
    <header className="relative h-32 shrink-0 bg-header text-white">
      <button
        type="button"
        onClick={onBack}
        aria-label="Voltar"
        className="absolute left-(--page-gutter) top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <BackIcon />
      </button>

      <div className="flex h-full flex-col items-center justify-center gap-1 pt-1">
        <div className="size-(--logo-size)">
          {logoUrl ? <img src={logoUrl} alt="" className="size-full rounded object-contain" /> : <LogoFallback />}
        </div>
        <span className="text-[10px] leading-none">{label}</span>
      </div>
    </header>
  )
}