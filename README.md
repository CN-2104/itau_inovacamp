# Itaú InovaCamp: Smart Transfers & Orquestração de IA 🚀

Repositório do protótipo desenvolvido para o **Itaú InovaCamp**, focado em simplificar e unificar ofertas financeiras e a Iniciação de Pagamentos (ITP). Através de uma arquitetura baseada em agentes de IA e Open Finance, o sistema conecta contas externas e sugere as melhores vantagens de forma fluida.

🔗 **Link do Repositório:** [https://github.com/CN-2104/itau_inovacamp](https://github.com/CN-2104/itau_inovacamp)

## 🎯 Visão Geral do Protótipo

O projeto funciona como uma interface conversacional inteligente que atua em três frentes:
1. **Agregação:** Lê saldos e faturas de outras instituições via Open Finance.
2. **Orquestração de Ofertas:** Utiliza IA para sugerir portabilidade de crédito, renegociação de dívidas ou vantagens do ecossistema Itaú Shop de forma personalizada.
3. **Smart Transfers:** Permite realizar Iniciação de Pagamentos (ITP), trazendo dinheiro de outros bancos direto pelo chat, validado por "Quick Actions" de autenticação segura.

A IA atua como um roteador de intenções através do **Model Context Protocol (MCP)**, garantindo que regras de negócio e matemática financeira sejam resolvidas por APIs determinísticas (fora do LLM), anulando riscos de alucinação em taxas ou valores.

## 🛠️ Stack Tecnológica

**Frontend & Apresentação:**
- **Next.js & React:** Para renderização otimizada, rotas seguras (BFF para ofuscar chaves de API) e renderização do streaming de respostas.
- **Tailwind CSS:** Construção ágil da interface e componentes de Quick Actions.

**Orquestração de IA & Backend:**
- **Node.js & Express.js:** Serviços da camada interna e simulação de regras de negócio (Cálculos de vantagens).
- **LangGraph / LangChain:** Gerenciamento do grafo de estado da conversa, roteamento de ferramentas e memória do Agente `ia.i`.
- **n8n:** Automação e orquestração de workflows para os motores internos de ofertas.
- **Supabase:** Gerenciamento de banco de dados e simulação de sessões ativas no MVP.

**Integrações (Open Finance):**
- **APIs Pluggy / B3 (Sandbox):** Comunicação para Iniciação de Pagamentos (ITP) e a Enrich API para leitura de dados externos.

## 🚀 Como Rodar o Protótipo Localmente

### Pré-requisitos
- Node.js (v18+)
- Chaves de API (OpenAI, Pluggy Sandbox, Supabase)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/CN-2104/itau_inovacamp.git
cd itau_inovacamp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` na raiz do projeto baseado no `.env.example`:
```env
NEXT_PUBLIC_SUPABASE_URL=seu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_supabase_key
OPENAI_API_KEY=sua_chave_openai
PLUGGY_CLIENT_ID=seu_client_id_pluggy
PLUGGY_CLIENT_SECRET=seu_client_secret_pluggy
```

4. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse no navegador:
Abra [http://localhost:3000](http://localhost:3000) para ver o chat de iniciação.

## 🛡️ Segurança e Compliance (Simulados)
- **Desacoplamento:** A IA não possui permissões sistêmicas de escrita financeira.
- O *payload* gerado aciona um componente segregado (Quick Action) que exige validação final do usuário (SCA - Strong Customer Authentication) antes do ITP.

## 🤝 Colaboradores
Arthur Santana
Arthur Martins
Christian Nantes
Giovanna Noventa

---
*Protótipo desenvolvido para fins de demonstração técnica.*
