/**
 * Loan and financing contracts found on the user's other banks via Open
 * Finance, with the rate the Itaú would offer on a portability.
 *
 * Mocked while the backend is being built — the totals line up with the
 * financing answer in `lib/mock-chat`.
 */
export type Financing = {
  id: string
  /** Contract name shown in the row. */
  name: string
  /** Picks the row icon. */
  kind: "home" | "vehicle" | "personal"
  /** Institution holding the contract today. */
  bank: string
  /** Bank's brand color, used for the dot next to its name. */
  bankColor: string
  /** Monthly installment, in BRL. */
  installment: number
  /** Installments still to be paid. */
  remainingInstallments: number
  /** Outstanding balance, in BRL. */
  outstanding: number
  /** Contract rate today, e.g. "10,9% a.a.". */
  rate: string
  /** Rate offered on a portability to the Itaú, in the same unit as `rate`. */
  itauRate: string
  /** Estimated total saved over the remaining term, in BRL. */
  savings: number
}

export const FINANCINGS: Financing[] = [
  {
    id: "imobiliario-santander",
    name: "Financiamento imobiliário",
    kind: "home",
    bank: "Santander",
    bankColor: "#EC0000",
    installment: 1980,
    remainingInstallments: 218,
    outstanding: 182450,
    rate: "10,9% a.a.",
    itauRate: "9,4% a.a.",
    savings: 21400,
  },
  {
    id: "veiculo-bradesco",
    name: "Financiamento de veículo",
    kind: "vehicle",
    bank: "Bradesco",
    bankColor: "#CC092F",
    installment: 1145,
    remainingInstallments: 26,
    outstanding: 28300,
    rate: "1,89% a.m.",
    itauRate: "1,54% a.m.",
    savings: 2180,
  },
  {
    id: "pessoal-nubank",
    name: "Empréstimo pessoal",
    kind: "personal",
    bank: "Nubank",
    bankColor: "#820AD1",
    installment: 430,
    remainingInstallments: 12,
    outstanding: 4820,
    rate: "3,2% a.m.",
    itauRate: "2,6% a.m.",
    savings: 340,
  },
]
