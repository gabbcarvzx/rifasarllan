# Checkout Pix Asaas

Etapa 9 concluida: criacao e reutilizacao de clientes, cobranca Pix, QR Code, copia e cola, persistencia local, refresh de status e cancelamento.

Webhook nao foi implementado nesta etapa.

## Variaveis de ambiente

O checkout depende das seguintes variaveis server-side:

```env
SUPABASE_SERVICE_ROLE_KEY=
ASAAS_API_KEY=
ASAAS_ENV=production
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=
```

`SUPABASE_SERVICE_ROLE_KEY` e usada somente no servidor para persistir respostas financeiras sem liberar escrita direta em `payments` para usuarios comuns.

Nunca use prefixo `NEXT_PUBLIC_` em nenhuma chave Asaas ou na service role.

## Producao

```env
ASAAS_ENV=production
ASAAS_BASE_URL=https://api.asaas.com/v3
```

Utilize uma API key de producao da conta oficial. A conta deve possuir uma chave Pix cadastrada no Asaas para um fluxo estavel.

## Sandbox

```env
ASAAS_ENV=sandbox
ASAAS_BASE_URL=https://api-sandbox.asaas.com/v3
```

O mesmo codigo funciona em sandbox. Apenas as variaveis mudam.

## Configuracao central

`src/config/asaas.ts` fornece:

- `getAsaasConfig()`;
- `isProduction()`;
- `isSandbox()`;
- `validateAsaasConfig()`.

A base URL nao possui fallback hardcoded no codigo. Ela deve vir de `ASAAS_BASE_URL` e apontar para uma URL HTTPS da API v3.

## Arquitetura

```txt
src/lib/asaas/
  client.ts
  customers.ts
  payments.ts
  types.ts
  errors.ts
```

- `client.ts`: autenticacao, timeout e requests HTTP.
- `customers.ts`: criacao, consulta, busca e reutilizacao de clientes.
- `payments.ts`: criacao, consulta, recuperacao, QR Code e cancelamento.
- `types.ts`: contratos da API Asaas.
- `errors.ts`: erros normalizados e mensagens do provedor.

## Fluxo completo

1. O usuario autenticado abre `/pedido/[id]`.
2. `createPixCheckout()` valida que o pedido pertence ao usuario.
3. A reserva precisa estar ativa e o pedido precisa estar `pending`.
4. Um registro local de `payments` faz o claim unico do checkout.
5. O cliente Asaas e buscado pelo vinculo local e por `externalReference`.
6. Se necessario, o cliente e criado e persistido em `asaas_customers`.
7. Uma cobranca `PIX` e criada com `externalReference = order.id`.
8. O QR Code e consultado em `/payments/{id}/pixQrCode`.
9. QR Code, copia e cola, status, invoice URL e resposta do provedor sao persistidos.
10. A pagina do pedido exibe o checkout.

## Idempotencia e reutilizacao

O sistema evita duplicacao em duas camadas:

- indice local unico: uma cobranca Asaas por pedido;
- `externalReference`: o ID do pedido e enviado ao Asaas.

Se a cobranca for criada no Asaas mas a resposta local falhar, uma nova tentativa busca a cobranca por `externalReference` e recupera o relacionamento.

Clientes usam `externalReference` composto por `tenant_id:user_id`, evitando reutilizacao cruzada entre tenants.

## Banco

A migration `supabase/migrations/202606130008_asaas_checkout.sql` cria:

- tabela `asaas_customers`;
- indices de tenant, usuario e e-mail;
- RLS para leitura do proprio cliente e administracao do tenant;
- campos adicionais em `payments`;
- indices de idempotencia;
- funcao `sync_asaas_payment()` restrita a `service_role`.

Campos adicionados em `payments`:

- `provider_raw_status`;
- `invoice_url`;
- `expires_at`;
- `due_date`;
- `pix_end_to_end_identifier`;
- `last_provider_sync`;
- `provider_response`.

## Status

O refresh manual consulta o Asaas e mapeia:

- `RECEIVED`, `CONFIRMED`, `RECEIVED_IN_CASH` para `paid`;
- `REFUNDED` para `refunded`;
- `OVERDUE` para `failed`;
- cobranca removida para `cancelled`;
- demais estados em processamento para `pending`.

Ao confirmar pagamento, a funcao SQL atualiza atomicamente `payments`, `orders` e `raffle_numbers`.

## Seguranca

- API key Asaas nunca e enviada ao client.
- Service role nunca e enviada ao client.
- Actions usam `requireUser()`.
- Criacao, refresh e cancelamento exigem ownership do pedido.
- Valor, tenant e dados do cliente sao lidos do banco.
- O frontend envia somente `orderId`.
- Usuarios comuns nao recebem permissao de escrita financeira direta.
- `sync_asaas_payment()` so pode ser executada por `service_role`.

## Pagina do pedido

`/pedido/[id]` agora exibe:

- status do pedido e do pagamento;
- valor e numeros reservados;
- QR Code;
- Pix copia e cola;
- botao copiar;
- invoice URL;
- botao atualizar status;
- cancelamento de cobranca pendente;
- contador da reserva;
- instrucoes de pagamento.

## Troubleshooting

### Checkout nao configurado

Confirme `ASAAS_API_KEY`, `ASAAS_ENV`, `ASAAS_BASE_URL`, `ASAAS_WEBHOOK_TOKEN` e `SUPABASE_SERVICE_ROLE_KEY`.

### Asaas solicita CPF/CNPJ

Algumas contas ou operacoes podem exigir documento. O cadastro atual segue o escopo solicitado com nome, e-mail e telefone. Se a conta exigir documento, adicione CPF/CNPJ ao perfil em migration futura antes de operar em producao.

### QR Code nao aparece

Confirme:

- cobranca com `billingType=PIX`;
- chave Pix cadastrada na conta Asaas;
- API key e ambiente correspondentes;
- migration aplicada;
- pedido ainda ativo.

### Cobranca criada, mas nao salva localmente

Clique novamente em gerar. A action busca a cobranca por `externalReference` e recupera o vinculo sem criar outra cobranca intencionalmente.

## Webhook

Esta etapa usa refresh manual. O webhook com validacao de token, idempotencia e reconciliacao automatica pertence a Etapa 10.

## Trava antes de ativar producao

A arquitetura e as chamadas usam os endpoints de producao quando `ASAAS_ENV=production`, mas o recebimento real nao deve ser liberado antes da Etapa 10.

O QR Code dinamico de uma cobranca Pix Asaas pode permanecer pagavel depois dos 15 minutos da reserva. Sem webhook e uma rotina server-side de expiracao/reconciliacao, um pagamento tardio pode chegar depois que os numeros ja foram liberados. A Etapa 10 deve cancelar cobrancas de reservas expiradas e reconciliar atomicamente qualquer pagamento recebido fora da janela antes da abertura comercial.

Referencias oficiais:

- https://docs.asaas.com/reference/create-new-customer
- https://docs.asaas.com/reference/create-new-payment
- https://docs.asaas.com/reference/get-qr-code-for-pix-payments
- https://docs.asaas.com/reference/delete-payment
- https://docs.asaas.com/docs/payments-via-pix-or-dynamic-qr-code
