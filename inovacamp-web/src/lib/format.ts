const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const BRL_ROUNDED = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
})

/** Formats an amount as `R$ 44,90`. */
export function formatBRL(value: number) {
  return BRL.format(value)
}

/** Formats an amount as `R$ 182.450`, for figures where cents are noise. */
export function formatBRLRounded(value: number) {
  return BRL_ROUNDED.format(value)
}
