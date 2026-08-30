"use client"

import * as React from "react"
import {
  BuildingIcon,
  CheckIcon,
  DropletIcon,
  ShieldIcon,
  SmartphoneIcon,
  WifiIcon,
  ZapIcon,
} from "lucide-react"

import { DIRECT_DEBITS, type DirectDebit } from "@/lib/direct-debits"
import { formatBRL } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CATEGORY_ICONS = {
  energy: ZapIcon,
  water: DropletIcon,
  internet: WifiIcon,
  phone: SmartphoneIcon,
  home: BuildingIcon,
  insurance: ShieldIcon,
} satisfies Record<
  DirectDebit["category"],
  React.ComponentType<{ className?: string }>
>

export type MigrateDirectDebitsProps = {
  /** Debits to list. Defaults to the mocked Open Finance result. */
  directDebits?: DirectDebit[]
  /** Called when a row's "Migrar" button is pressed. */
  onMigrate?: (directDebit: DirectDebit) => void
  className?: string
}

export function MigrateDirectDebits({
  directDebits = DIRECT_DEBITS,
  onMigrate,
  className,
}: MigrateDirectDebitsProps) {
  const [migrated, setMigrated] = React.useState<string[]>([])

  const monthlyTotal = directDebits.reduce(
    (total, directDebit) => total + directDebit.amount,
    0
  )

  function migrate(directDebit: DirectDebit) {
    setMigrated((current) =>
      current.includes(directDebit.id) ? current : [...current, directDebit.id]
    )
    onMigrate?.(directDebit)
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col overflow-y-auto bg-background",
        className
      )}
    >
      <div className="mx-auto w-full max-w-2xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h1 className="font-heading text-xl font-semibold">
          Traga meus pagamentos recorrentes de outras contas
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Encontramos {directDebits.length} pagamentos recorrentes em outros
          bancos, somando {formatBRL(monthlyTotal)} por mês. Traga para o Itaú e
          pague tudo pela mesma conta.
        </p>

        <ul className="mt-6 flex flex-col gap-2">
          {directDebits.map((directDebit) => (
            <DirectDebitRow
              key={directDebit.id}
              directDebit={directDebit}
              migrated={migrated.includes(directDebit.id)}
              onMigrate={() => migrate(directDebit)}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}

/** One debit: biller, amount, source bank and the day it is charged. */
function DirectDebitRow({
  directDebit,
  migrated,
  onMigrate,
}: {
  directDebit: DirectDebit
  migrated: boolean
  onMigrate: () => void
}) {
  const Icon = CATEGORY_ICONS[directDebit.category]

  return (
    <li className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/10">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate font-medium">{directDebit.name}</div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>
            {directDebit.variable ? "~" : ""}
            {formatBRL(directDebit.amount)}/mês
          </span>
          <span aria-hidden>·</span>
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: directDebit.bankColor }}
          />
          <span className="truncate">{directDebit.bank}</span>
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          Debita todo dia {directDebit.dueDay}
          {directDebit.variable ? " · média de 6 meses" : ""}
        </div>
      </div>

      <Button
        size="sm"
        variant={migrated ? "secondary" : "default"}
        disabled={migrated}
        onClick={onMigrate}
      >
        {migrated ? (
          <>
            <CheckIcon />
            Migrado
          </>
        ) : (
          "Migrar"
        )}
        <span className="sr-only"> {directDebit.name}</span>
      </Button>
    </li>
  )
}
