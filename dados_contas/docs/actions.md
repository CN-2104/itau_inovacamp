### Ações Permitidas em Outras Contas (Pluggy / Open Finance)

#### Iniciação e Transferências Inteligentes
* **Smart Transfers (Transferências Inteligentes):** É possível criar pré-autorizações para realizar pagamentos futuros sem exigir que o cliente interaja com o aplicativo a cada nova transferência[cite: 1].
* **Programação de Pix Agendado:** Permite programar transferências futuras definindo a recorrência exata (podendo ser única, diária, semanal, mensal ou em datas totalmente customizadas)[cite: 1].

#### Gestão e Monitoramento de Pix
* **Cancelamento de Pagamentos Específicos:** Permite cancelar pontualmente a execução de um Pix Automático ou Pix Agendado que ainda não tenha sido processado pelo banco, protegendo o saldo do cliente[cite: 1].
* **Revogação Total de Autorizações:** Possibilita enviar um comando para cancelar a autorização raiz de um Pix Automático, o que bloqueia imediatamente quaisquer cobranças futuras[cite: 1].
* **Acionamento de Retentativas (Retry):** Caso um pagamento automático falhe (seja por instabilidade ou falta de saldo), o sistema permite disparar um fluxo de retentativa para recuperar a cobrança[cite: 1].
* **Espelhamento de Ações Externas:** Através do uso de *webhooks*, é possível detectar imediatamente caso o cliente cancele um Pix Agendado diretamente pelo aplicativo do próprio banco[cite: 1].

#### Gestão de Acessos, Saldos e Boletos
* **Verificação de Saldo em Tempo Real:** Permite realizar uma requisição rápida para consultar o saldo exato de uma conta conectada no momento exato da ação, sem precisar sincronizar meses de extrato[cite: 1].
* **Emissão e Cancelamento de Boletos:** A arquitetura permite comandar a emissão de novos boletos e também efetuar o seu cancelamento caso o cliente mude o método de pagamento[cite: 1].
* **Exclusão de Conexões e Consentimentos:** Permite gerenciar a privacidade do cliente através da deleção da conexão (Item), o que encerra instantaneamente o acesso da plataforma aos dados daquela instituição específica[cite: 1].