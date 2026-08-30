"use client"

import * as React from "react"
import {
  ArrowRightIcon,
  CarIcon,
  CheckIcon,
  HouseIcon,
  WalletIcon,
} from "lucide-react"

import { FINANCINGS, type Financing } from "@/lib/financings"
import { formatBRL, formatBRLRounded } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const KIND_ICONS = {
  home: HouseIcon,
  vehicle: CarIcon,
  personal: WalletIcon,
} satisfies Record<
  Financing["kind"],
  React.ComponentType<{ className?: string }>
>

export type MigrateFinancingsProps = {
  /** Contracts to list. Defaults to the mocked Open Finance result. */
  financings?: Financing[]
  /** Called when a card's "Migrar" button is pressed. */
  onMigrate?: (financing: Financing) => void
  className?: string
}

export function MigrateFinancings({
  financings = FINANCINGS,
  onMigrate,
  className,
}: MigrateFinancingsProps) {
  const [migrated, setMigrated] = React.useState<string[]>([])

  const totalSavings = financings.reduce(
    (total, financing) => total + financing.savings,
    0
  )

  function migrate(financing: Financing) {
    setMigrated((current) =>
      current.includes(financing.id) ? current : [...current, financing.id]
    )
    onMigrate?.(financing)
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-y-auto bg-background",
        className
      )}
    >
      <div className="mx-auto w-full max-w-2xl px-5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Trazer meu financiamento pro Itaú
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Encontramos {financings.length} contratos em outros bancos. Na
          portabilidade, a economia estimada é de{" "}
          {formatBRLRounded(totalSavings)} até o fim dos contratos.
        </p>

        <ul className="mt-8 flex flex-col gap-4">
          {financings.map((financing) => (
            <FinancingCard
              key={financing.id}
              financing={financing}
              migrated={migrated.includes(financing.id)}
              onMigrate={() => migrate(financing)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

/** One contract, laid out top down: mark, name, figures, rate and action. */
function FinancingCard({
  financing,
  migrated,
  onMigrate,
}: {
  financing: Financing
  migrated: boolean
  onMigrate: () => void
}) {
  const Icon = KIND_ICONS[financing.kind]

  return (
    <li className="flex flex-col gap-5 rounded-3xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-muted">
          <Icon className="size-6 text-muted-foreground" />
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: financing.bankColor }}
          />
          {financing.bank}
        </span>
      </div>

      <div>
        <h2 className="font-heading text-lg font-medium">{financing.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {financing.remainingInstallments} parcelas restantes
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4">
        <Figure
          label="Parcela mensal"
          value={formatBRL(financing.installment)}
        />
        <Figure
          label="Saldo devedor"
          value={formatBRLRounded(financing.outstanding)}
        />
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border pt-4 text-sm">
        <span className="flex items-center gap-2 text-muted-foreground">
          <span className="line-through">{financing.rate}</span>
          <ArrowRightIcon className="size-3.5" />
          <span className="font-medium text-brand">{financing.itauRate}</span>
        </span>
        <span className="text-muted-foreground">
          Economia de{" "}
          <span className="font-medium text-foreground">
            {formatBRLRounded(financing.savings)}
          </span>
        </span>
      </div>

      <Button
        size="lg"
        variant={migrated ? "secondary" : "default"}
        disabled={migrated}
        onClick={onMigrate}
        className="w-full"
      >
        {migrated ? (
          <>
            <CheckIcon />
            Migrado
          </>
        ) : (
          "Entrar em contato"
        )}
        <span className="sr-only"> {financing.name}</span>
      </Button>
    </li>
  )
}

/** One labelled figure inside a card. */
function Figure({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-heading text-lg font-medium">{value}</dd>
    </div>
  )
}
