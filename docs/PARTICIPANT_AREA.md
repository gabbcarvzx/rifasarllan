# Area do Participante

## Objetivo

A Etapa 11 centraliza a experiencia autenticada do participante sem ampliar o
escopo de pagamentos. O usuario consulta e atualiza apenas o proprio perfil,
pedidos e numeros.

## Rotas protegidas

- `/minha-conta`: perfil, papel da conta, data de criacao e edicao de nome e WhatsApp.
- `/meus-pedidos`: historico de pedidos com status, valor, quantidade e prazo.
- `/meus-numeros`: numeros agrupados por rifa e filtrados por situacao.
- `/pedido/[id]`: detalhe de um pedido pertencente ao usuario autenticado.

O proxy exige sessao Supabase antes de atender essas rotas. Cada Server
Component tambem passa por `requireUser()`, evitando depender apenas da camada
de navegacao.

## Server Actions

O arquivo `src/app/actions/account.ts` expoe:

- `getMyProfile()`
- `updateMyProfile()`
- `getMyOrders()`
- `getMyNumbers()`
- `getMyOrderById()`

As consultas de negocio filtram explicitamente `orders.user_id` pelo UUID da
sessao. As policies RLS de `profiles`, `orders`, `order_items` e `payments`
continuam sendo a segunda camada de isolamento.

Antes das consultas de pedidos e numeros, a action executa
`expire_old_reservations()`. Assim, reservas vencidas aparecem com status
coerente e os numeros sao liberados pela funcao transacional existente.

## Historico de numeros

`order_items` e a fonte historica da participacao. Mesmo depois que uma reserva
expira e o numero volta a ficar disponivel na grade, o item do pedido preserva
qual numero foi selecionado naquele pedido.

O status apresentado ao participante deriva do pedido:

- `pending` vira reservado.
- `paid` vira pago.
- `expired` vira expirado.
- `cancelled` e `refunded` viram cancelado no historico de numeros.

## Perfil e campos privilegiados

O formulario atualiza somente `profiles.full_name` e `profiles.phone`. Papel,
tenant e e-mail nao fazem parte do payload. O trigger
`protect_profiles_privileged_fields` permanece como protecao adicional contra
elevacao de privilegio por atualizacao direta.

## Rifa associada ao historico

A migration `202606130010_participant_area.sql` permite que um usuario leia os
dados basicos de uma rifa quando possui um pedido proprio nela, inclusive se a
rifa deixou de estar ativa. A policy usa `auth.uid()` e nao concede acesso a
pedidos ou dados de outros participantes.

## Pagamentos pausados

O detalhe do pedido consulta um payment existente em modo somente leitura. Se
nao houver payment, a pagina informa que o pagamento online esta pausado. Esta
etapa nao cria cobranca, nao atualiza status no Asaas e nao implementa webhook
ou confirmacao automatica.

## Teste local

1. Aplique as migrations pendentes no projeto Supabase.
2. Inicie o projeto com `npm run dev`.
3. Entre com um usuario participante.
4. Acesse `/minha-conta` e altere nome ou WhatsApp.
5. Acesse `/meus-pedidos` e abra um pedido proprio.
6. Acesse `/meus-numeros` e teste todos os filtros.
7. Em uma janela anonima, confirme que as quatro rotas redirecionam para login.
8. Tente abrir o UUID de um pedido de outro usuario e confirme a resposta 404.

## Fora do escopo

- Webhook Asaas.
- Confirmacao automatica de pagamento.
- Sorteio e vencedores.
- WhatsApp automatizado.
- Dashboard financeiro avancado.
