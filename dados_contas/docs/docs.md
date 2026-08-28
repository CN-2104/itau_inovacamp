# Mapeamento de Dados: Open Finance & Engenharia de Dados (Pluggy API)

Este documento detalha a linhagem de dados do JSON unificado, cruzando as chaves do payload com os respectivos endpoints da **API da Pluggy** e **Open Finance**, além de detalhar as integrações de **Iniciação de Pagamentos (ITP)** usadas nas sugestões da IA.

---

## 1. Dados Brutos (Open Finance - Core)
Estes campos refletem os dados padronizados retornados diretamente pelos conectores bancários (instituições financeiras) via Pluggy.

| Campo no JSON | Endpoint Pluggy (Origem) | Descrição e Comportamento |
| :--- | :--- | :--- |
| `identity` | `GET /identity`[cite: 12] | Retorna os dados cadastrais do titular (nome completo, documento, tipo de documento). Fundamental para enriquecimento e validação antifraude. |
| `accounts` | `GET /accounts`[cite: 12] | Lista as contas (`CHECKING`, `SAVINGS`) vinculadas ao Item (conexão). Traz os saldos (`balance`) e limites de crédito integrados (`creditData`). |
| `transactions` | `GET /transactions`[cite: 12] | Traz o histórico transacional de até 12 meses. Inclui o tipo (`CREDIT`/`DEBIT`), valor (valores negativos para saídas), status (`POSTED`/`PENDING`) e dados do método de pagamento (`paymentData`, ex: PIX, TED). |
| `bills` | `GET /bills`[cite: 14] | Traz faturas de cartão de crédito coletadas. Utilizado para prever compromissos financeiros futuros mapeando data de vencimento (`dueDate`), valor total (`totalAmount`) e status (`OPEN`, `OVERDUE`). |
| `loans` | `GET /loans`[cite: 12] | Informações sobre contratos de empréstimos e financiamentos, detalhando saldo devedor (`outstandingBalance`), taxas de juros e parcelas. |

---

## 2. Engenharia de Dados & Enriquecimento
Estes blocos não vêm diretamente do banco na sua forma final. Eles são construídos combinando a **Enrichment API** da Pluggy com a camada de regras da Engenharia de Dados.

| Sub-bloco no JSON | Endpoints Utilizados | Lógica de Construção e Finalidade |
| :--- | :--- | :--- |
| `expenseAnalysis` (CLT) | `POST /categorize`[cite: 17]<br>`POST /behavior-analysis`[cite: 17] | O endpoint de categorização normaliza a descrição do lojista (merchant) e o Behavior Analysis consolida insights de gastos (ex: aumento no consumo de *Food & Dining*). |
| `dynamicIncomeEstimation` | `POST /recurring-payments`[cite: 17] | O serviço analisa as transações, frequência e *regularity score* para deduzir qual a renda presumida de salários (CLT) ou a média móvel de faturamento (MEI/Informal). |
| `patternsAndRecurrences` | `POST /behavior-analysis`<br>`POST /recurring-payments`[cite: 17] | Identifica em quais dias do mês o usuário concentra os gastos e lista pagamentos fixos, como assinaturas (Netflix, Gympass, etc) ou contas de consumo recorrentes. |
| `taxManagement` (MEI) | `POST /categorize`[cite: 17] | Mapeia o pagamento histórico do imposto federal na conta vinculada (DAS-MEI) para inferir a sazonalidade, extraindo a data do próximo vencimento e valor. |
| `gigEconomyStatistics` (Informal) | `POST /categorize`[cite: 17] | Extrai o CNPJ e o nome do *Merchant* (ex: iFood) nos créditos para gerar métricas estimadas de volume de trabalho/corridas cruzando o montante com tickets médios. |

---

## 3. Inteligência Acionável (iaiOverview)
Para que a IA vá além da simples visualização e consiga *atuar* de forma resolutiva, o payload sugere *triggers* mapeados que invocam a infraestrutura de **Iniciação de Pagamento** ou **Smart Transfers** da Pluggy.

### 💼 Ação CLT: Transferência Inteligente de Saldos (Prevenção de Juros)
* **Gatilho:** Fatura prestes a vencer (`bills`), saldo insuficiente na conta primária (`accounts`), e saldo positivo disponível em conta de outra instituição.
* **Ação via Pluggy:** **Smart Transfers** (`POST /smart-transfers/preauthorizations` e `POST /smart-transfers/payments`)[cite: 7].
* **Contexto:** Permite movimentar o dinheiro entre as contas da própria titularidade usando a estrutura do Open Finance, de forma que o cliente transfere via Pix para cobrir o passivo com 1 clique (apenas autorizando a transação).

### 🏬 Ação MEI: Reserva de Impostos (DAS-MEI)
* **Gatilho:** Retenção imediata de imposto assim que um repasse de recebíveis entra na conta PJ.
* **Ação via Pluggy:** **Payment Intent** (`POST /payment-intents`)[cite: 17] para cobrança direta, ou agendamento via `POST /payment-requests`.
* **Contexto:** A IA usa os dados do recebedor (Receita Federal/DAS) e aciona o fluxo de iniciação de pagamento, disparando a jornada de consentimento (ITP) no momento em que a MEI tem caixa positivo.

### 🛵 Ação Informal (Gig Economy): Cofrinho / Pix Automático para a Parcela
* **Gatilho:** Identificação de repasse (payout) no `GET /transactions` atrelado a uma parcela de financiamento a vencer (`GET /loans`).
* **Ação via Pluggy:** **Scheduled Payments (Pix Agendado)** ou Pix Automático (`POST /payment-requests`)[cite: 9].
* **Contexto:** Perfis informais têm alta variância de caixa ("o que entra, sai muito rápido"). A ação programa a destinação do recurso atrelando o pagamento da ferramenta de trabalho (veículo) diretamente ao ganho gerado na plataforma.