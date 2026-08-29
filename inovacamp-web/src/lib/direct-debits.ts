/**
 * Direct debits (débito automático) charged to the user's accounts at other
 * banks, found via Open Finance.
 *
 * Mocked while the backend is being built — the totals line up with the
 * recurring-charges answer in `lib/mock-chat`.
 */
export type DirectDebit = {
  id: string
  /** Biller name shown in the row. */
  name: string
  /** What is being paid, e.g. "Energia". Picks the row icon. */
  category: "energy" | "water" | "internet" | "phone" | "home" | "insurance"
  /** Account the debit is charged to today. */
  bank: string
  /** Bank's brand color, used for the dot next to its name. */
  bankColor: string
  /** Monthly amount, or its 6-month average when `variable` is set. */
  amount: number
  /** The bill changes every month, so `amount` is an average. */
  variable?: boolean
  /** Day of the month the debit is charged. */
  dueDay: number
}

export const DIRECT_DEBITS: DirectDebit[] = [
  {
    id: "condominio",
    name: "Condomínio Edifício Aurora",
    category: "home",
    bank: "Bradesco",
    bankColor: "#CC092F",
    amount: 620,
    dueDay: 5,
  },
  {
    id: "enel",
    name: "Enel · Energia",
    category: "energy",
    bank: "Santander",
    bankColor: "#EC0000",
    amount: 187.4,
    variable: true,
    dueDay: 12,
  },
  {
    id: "porto-seguro-auto",
    name: "Porto Seguro · Auto",
    category: "insurance",
    bank: "Bradesco",
    bankColor: "#CC092F",
    amount: 210,
    dueDay: 10,
  },
  {
    id: "vivo-fibra",
    name: "Vivo Fibra",
    category: "internet",
    bank: "Bradesco",
    bankColor: "#CC092F",
    amount: 129.9,
    dueDay: 15,
  },
  {
    id: "sabesp",
    name: "Sabesp · Água",
    category: "water",
    bank: "Santander",
    bankColor: "#EC0000",
    amount: 96.2,
    variable: true,
    dueDay: 8,
  },
  {
    id: "claro",
    name: "Claro · Celular",
    category: "phone",
    bank: "Nubank",
    bankColor: "#820AD1",
    amount: 79.9,
    dueDay: 20,
  },
]
