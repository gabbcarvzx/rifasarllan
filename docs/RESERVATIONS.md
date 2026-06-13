# Reservas de Numeros

Etapa 8 concluida: reserva real de numeros com pedido pendente, bloqueio temporario e protecao contra dupla reserva.

## Escopo

Esta etapa implementa:

- criacao de `orders` com status `pending`;
- criacao de `order_items`;
- atualizacao de `raffle_numbers` para `reserved`;
- associacao de `user_id`, `order_id` e `reserved_until`;
- expiracao de reservas antigas;
- pagina publica do pedido em `/pedido/[id]`;
- contador regressivo da reserva.

Nao foram implementados nesta etapa:

- checkout Pix, implementado na Etapa 9;
- integracao com webhook, prevista para a Etapa 10;
- webhook;
- sorteio;
- dashboard financeiro completo.

## Fluxo de Reserva

1. Usuario autenticado acessa uma rifa ativa.
2. Seleciona numeros `available` na grade publica.
3. Informa nome, e-mail e WhatsApp.
4. O formulario chama `reserveNumbers()` em `src/app/actions/reservations.ts`.
5. A action valida campos e numeros.
6. A action chama a funcao SQL `reserve_raffle_numbers(...)`.
7. O banco cria um pedido `pending`, cria os itens do pedido e bloqueia os numeros por 15 minutos.
8. O usuario e redirecionado para `/pedido/[id]`.

## Funcao Transacional

A funcao `reserve_raffle_numbers(...)` foi criada na migration:

```txt
supabase/migrations/202606120007_number_reservations.sql
```

Ela:

- exige `auth.uid()`;
- valida rifa `active` e tenant `active`;
- valida campos do cliente;
- normaliza e valida numeros;
- limita a 100 numeros por reserva;
- chama `expire_old_reservations()`;
- bloqueia os numeros selecionados com `FOR UPDATE`;
- trata numeros reservados expirados como disponiveis;
- permite reservar apenas numeros `available`;
- cria `orders`;
- cria `order_items`;
- atualiza `raffle_numbers`;
- retorna `order_id`, `amount`, `reserved_until` e numeros reservados.

## Protecao Contra Dupla Reserva

A protecao principal esta no banco.

Durante a reserva, as linhas de `raffle_numbers` selecionadas sao travadas com:

```sql
for update
```

Se dois usuarios tentarem reservar o mesmo numero ao mesmo tempo:

1. a primeira transacao trava a linha;
2. a segunda espera a primeira terminar;
3. quando a segunda continua, o numero ja nao esta `available`;
4. a funcao retorna erro `NUMBERS_UNAVAILABLE`;
5. a UI mostra uma mensagem amigavel e atualiza a grade.

Isso evita race condition e dupla reserva.

## Expiracao

A reserva dura 15 minutos.

A funcao `expire_old_reservations()`:

- localiza numeros `reserved` com `reserved_until < now()`;
- volta esses numeros para `available`;
- limpa `user_id`, `order_id` e `reserved_until`;
- atualiza pedidos `pending` relacionados para `expired`.

Ela e chamada:

- antes de reservar novos numeros;
- ao carregar um pedido;
- ao carregar o preview admin de numeros.

A view `public_raffle_numbers` tambem mostra reservas vencidas como `available`, sem expor `reserved_until`.

## Pagina do Pedido

A rota `/pedido/[id]` mostra:

- status do pedido;
- numeros reservados;
- valor total;
- dados do cliente;
- contador regressivo;
- checkout Pix da Etapa 9, quando o pedido ainda esta elegivel para pagamento.

A leitura usa `getOrderById(orderId)`, que exige usuario autenticado e valida:

- dono do pedido; ou
- admin do mesmo tenant.

Usuarios comuns nao conseguem acessar pedidos de outros usuarios.

## Seguranca

Camadas aplicadas:

- `requireUser()` em todas as actions de reserva;
- funcao SQL `security definer` com validacoes internas;
- nenhuma permissao ampla de update em `raffle_numbers` para usuario comum;
- valida rifa e tenant ativos;
- bloqueio transacional com `FOR UPDATE`;
- RLS continua protegendo `orders`, `order_items` e `raffle_numbers`;
- pagina de pedido nao retorna dados de outro usuario;
- view publica nao expoe `user_id`, `order_id` ou dados pessoais.

## Como Testar Concorrencia Basica

1. Entrar com dois usuarios diferentes em navegadores/sessoes diferentes.
2. Abrir a mesma rifa ativa.
3. Selecionar o mesmo numero disponivel nas duas sessoes.
4. Reservar quase ao mesmo tempo.
5. Confirmar que uma reserva cria o pedido.
6. Confirmar que a segunda recebe erro de numero indisponivel.
7. Recarregar a rifa e validar que o numero aparece como reservado.

## Limitacoes Desta Etapa

- O pedido nasce `pending` e segue para o checkout Pix conectado na Etapa 9.
- A confirmacao automatica por webhook sera implementada na Etapa 10.
- Webhook e idempotencia de pagamento ficam para a Etapa 10.
- Nao ha painel financeiro completo nesta etapa.
