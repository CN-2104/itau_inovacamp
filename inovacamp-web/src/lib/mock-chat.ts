import { createChat } from "@shadcn/helpers/ai-sdk"

import { getMessageText, type ChatMessage } from "@/lib/ai"

/**
 * Scripted stand-in for the LangGraph backend.
 *
 * The transport answers every turn from {@link MOCK_REPLIES}, picked by
 * keyword from the last user message, so the demo runs offline while the
 * FastAPI graph is being built. Swap it out by setting `VITE_CHAT_API_URL`
 * (see `Chat`'s `mock` prop) — nothing else in the UI changes.
 *
 * The numbers below come from the CLT persona in `dados_contas/clt.json`
 * (Carlos: Itaú R$ 150, Bradesco R$ 4.500, fatura de R$ 1.250 vencendo 10/09).
 */
type MockReply = {
  /** Tested against the user message, lowercased and without accents. */
  match: RegExp
  /** Optional thinking, streamed into the collapsed reasoning block. */
  reasoning?: string
  text: string
}

const MOCK_REPLIES: MockReply[] = [
  {
    match: /luz|energia|enel|light|cemig|copel/,
    reasoning:
      "Buscando histórico de pagamentos de conta de luz nas contas conectadas para configurar débito automático no Itaú.",
    text: "Vi que você paga sua conta de luz pelo Santander todo dia 12. Posso monitorar esse pagamento e você paga com 1 clique. O que acha?",
  },
  {
    match: /crédito|credito|emprestimo|empréstimo/,
    reasoning:
      "Analisando contratos de crédito pessoal em outras instituições para simular portabilidade.",
    text: "Você tem um empréstimo pessoal no Nubank com parcelas de R$ 430,00 (3,2% a.m.). Analisei seu perfil de crédito atual e consegui uma oferta pré-aprovada para 2,1% a.m., e sua parcela cai para R$ 395,00. Posso iniciar a portabilidade?",
  },
  {
    match: /sim(.*)por favor|sim(.*)pode|iniciar(.*)portabilidade/,
    reasoning:
      "Iniciando processo de portabilidade de crédito do Nubank para o Itaú.",
    text: "Portabilidade solicitada! Com a transferência do saldo devedor para o Itaú, além de você economizar R$ 35 por mês, esse contrato te leva direto para o Nível 3 do Minhas Vantagens. Isso libera até 60% de desconto em ingressos de cinema e descontos em instituições de ensino. O contrato digital já está no seu e-mail.",
  },
  {
    match: /pix agendado|pix/,
    reasoning:
      "Consultando transferências Pix agendadas em outros bancos via Open Finance.",
    text: "Encontrei 2 Pix agendados no Bradesco para esta semana (total de R$ 850,00). Quer que eu traga seu saldo pra cá e reprograme essas transferências aqui pelo Itaú?",
  },
  {
    match: /salario|cobrir|suficiente|fechar o mes|previsao|prever/,
    reasoning:
      "Comparando o saldo das contas conectadas com os vencimentos dos próximos 7 dias e a data prevista do salário.",
    text: "Hoje não, mas dá pra resolver sem juros.\n\nVocê tem R$ 150,00 na conta Itaú e R$ 4.500,00 na poupança do Bradesco. Nos próximos 7 dias vencem R$ 1.250,00 (fatura do cartão, dia 10/09). Seu salário de R$ 6.500,00 costuma cair no dia 5, então a folga só aparece depois disso.\n\nPosso agendar uma transferência via Open Finance do Bradesco para o Itaú de R$ 1.250,00 até o dia 9 e evitar o cheque especial. Quer que eu prepare?",
  },
  {
    match: /transporte|uber|99|combustivel|gasolina|onibus|metro/,
    reasoning:
      "Somando as transações categorizadas como transporte nos últimos 30 dias, nas duas contas conectadas.",
    text: "Nos últimos 30 dias você gastou R$ 412,80 com transporte — 6% da sua renda do mês.\n\n• Apps de mobilidade: R$ 268,40\n• Combustível: R$ 98,90\n• Transporte público: R$ 45,50\n\nÉ R$ 37,00 a menos que no mês anterior. O maior peso é nas corridas de segunda e sexta, no horário de pico.",
  },
  {
    match: /boleto|fatura|conta a pagar|vencimento|em aberto|pagar/,
    reasoning:
      "Consultando boletos e faturas em aberto nas instituições conectadas via Open Finance.",
    text: "Você tem 1 fatura em aberto no momento:\n\n• Cartão Itaú — R$ 1.250,00, vence em 10/09\n\nNão encontrei boletos pendentes nas outras contas conectadas. O saldo atual do Itaú (R$ 150,00) não cobre essa fatura, então vale programar o pagamento assim que o salário entrar.",
  },
  {
    match: /saldo|quanto (eu )?tenho|minhas contas|extrato/,
    reasoning:
      "Lendo o saldo em tempo real de cada conta conectada e somando o total consolidado.",
    text: "Seu saldo consolidado é de R$ 4.650,00:\n\n• Itaú PF (corrente): R$ 150,00\n• Bradesco PF (poupança): R$ 4.500,00\n\nNo Itaú você ainda tem R$ 1.500,00 de limite de crédito disponível, mas ele custa juros — prefiro usar o saldo do Bradesco se precisar cobrir alguma conta.",
  },
  {
    match: /financiamento|portabilidade|emprestimo|credito imobiliario|migrar/,
    reasoning:
      "Comparando as condições do contrato atual com as taxas de portabilidade disponíveis no Itaú.",
    text: "Encontrei 3 contratos em outros bancos:\n\n• Financiamento imobiliário (Santander): R$ 1.980,00/mês, 10,9% a.a.\n• Financiamento de veículo (Bradesco): R$ 1.145,00/mês, 1,89% a.m.\n• Empréstimo pessoal (Nubank): R$ 430,00/mês, 3,2% a.m.\n\nNa portabilidade para o Itaú, a economia estimada é de R$ 23.920 até o fim dos contratos. Posso abrir a simulação contrato a contrato?",
  },
  {
    match: /debitos? automaticos?|conta de luz|agua|internet|condominio/,
    reasoning:
      "Listando os pagamentos recorrentes ativos nas contas conectadas e a média cobrada nos últimos 6 meses.",
    text: "Você tem 6 pagamentos recorrentes em outros bancos, somando R$ 1.323,40 por mês:\n\n• Condomínio: R$ 620,00 (dia 5, Bradesco)\n• Porto Seguro Auto: R$ 210,00 (dia 10, Bradesco)\n• Enel: ~R$ 187,40 (dia 12, Santander)\n• Vivo Fibra: R$ 129,90 (dia 15, Bradesco)\n• Sabesp: ~R$ 96,20 (dia 8, Santander)\n• Claro: R$ 79,90 (dia 20, Nubank)\n\nTrazendo todos para o Itaú, você paga tudo pela mesma conta e eu consigo avisar antes de cada débito. Quer que eu abra a lista?",
  },
  {
    match: /assinatura|recorrente|cancel/,
    reasoning:
      "Cruzando as cobranças recorrentes dos últimos 3 meses para separar pagamentos recorrentes de assinaturas no cartão.",
    text: "Identifiquei R$ 214,70 por mês em cobranças recorrentes:\n\n• Streaming e apps: R$ 89,80\n• Academia: R$ 79,90\n• Seguro celular: R$ 24,90\n• Nuvem e armazenamento: R$ 20,10\n\nDuas delas não têm uso registrado há mais de 60 dias. Quer que eu monte o pedido de cancelamento dessas?",
  },
  {
    match: /delivery|ifood|comida|restaurante|alimenta/,
    reasoning:
      "Comparando a categoria Alimentação do mês com a média móvel dos últimos 3 meses.",
    text: "Alimentação é sua maior categoria no mês: R$ 345,30 só em delivery, 15% acima da sua média dos últimos 3 meses.\n\nSe voltar ao patamar habitual, sobram cerca de R$ 52,00 por mês — o suficiente para cobrir metade das assinaturas que você não usa.",
  },
]

/** Answer for anything the keyword rules don't cover. */
const DEFAULT_REPLY: MockReply = {
  match: /.*/,
  reasoning:
    "A pergunta não cai em nenhuma das análises prontas — respondo com o panorama das contas conectadas.",
  text: "Ainda estou aprendendo sobre esse assunto, mas posso te ajudar com o que já leio das suas contas conectadas: saldos, boletos e faturas em aberto, gastos por categoria e cobranças recorrentes.\n\nHoje, o ponto de atenção é a fatura de R$ 1.250,00 vencendo em 10/09 com R$ 150,00 no Itaú. Quer que eu detalhe algum desses pontos?",
}

/** Reply used when the message carries only attachments. */
const ATTACHMENT_REPLY: MockReply = {
  match: /.*/,
  reasoning: "Extraindo valores, datas e beneficiário do arquivo enviado.",
  text: "Recebi seu arquivo e consegui ler os dados principais.\n\nQuando o backend estiver conectado, eu comparo esse documento com as suas transações para identificar duplicidade, confirmar o valor e sugerir a melhor conta para o pagamento.",
}

export type CreateMockChatTransportOptions = {
  /** Delay between streamed word deltas, in milliseconds. */
  delayMs?: number
}

/**
 * Creates the mocked transport. Call it once per chat and keep the instance —
 * it owns the message id counter, so recreating it would repeat ids.
 */
export function createMockChatTransport({
  delayMs = 45,
}: CreateMockChatTransportOptions = {}) {
  return createChat<ChatMessage>().transport({
    delayMs,
    fallback: ({ writer, messages }) => {
      const reply = pickReply(messages)

      if (reply.reasoning) {
        writer.reasoning(reply.reasoning).sleep(500)
      }

      writer.text(reply.text)
    },
  })
}

function pickReply(messages: ChatMessage[]): MockReply {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user")

  if (!lastUserMessage) {
    return DEFAULT_REPLY
  }

  const prompt = normalize(getMessageText(lastUserMessage))

  if (!prompt) {
    const hasFiles = lastUserMessage.parts.some((part) => part.type === "file")
    return hasFiles ? ATTACHMENT_REPLY : DEFAULT_REPLY
  }

  return MOCK_REPLIES.find((reply) => reply.match.test(prompt)) ?? DEFAULT_REPLY
}

/** Lowercases and strips accents so the keyword rules stay readable. */
function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
}
