# Dashboard Administrativo

Etapa 10 concluida: dashboard multi-tenant com indicadores reais de rifas, numeros, pedidos, receita potencial, agenda e alertas operacionais.

Esta etapa nao implementa pagamento online, webhook, confirmacao automatica, sorteio ou automacao de WhatsApp.

## Arquitetura

A migration `supabase/migrations/202606130009_admin_dashboard.sql` cria a funcao:

```sql
public.get_admin_dashboard_stats(p_tenant_id uuid)
```

A funcao retorna um unico snapshot JSON com:

- `summary`;
- `raffles`;
- `numbers`;
- `orders`;
- `revenue`;
- `upcoming_draws`;
- `top_raffles`;
- `recent_orders`;
- `alerts`.

O snapshot unico reduz round-trips entre Next.js e Supabase. As agregacoes de itens, reservas, premios e imagens sao feitas separadamente para evitar multiplicacao de linhas em joins grandes.

## Seguranca Multi-Tenant

`get_admin_dashboard_stats()` usa `SECURITY DEFINER`, `search_path` controlado e valida obrigatoriamente:

```sql
public.is_admin_for_tenant(p_tenant_id)
```

Uma chamada sem sessao, feita por usuario comum ou direcionada a outro tenant falha com `ADMIN_TENANT_ACCESS_DENIED`.

No Next.js, `src/app/actions/dashboard.ts` tambem executa `requireAdmin()` e usa apenas o `tenant_id` do profile autenticado. O tenant nunca e recebido do navegador.

## Metricas

### Rifas

- total de rifas;
- ativas;
- pausadas;
- encerradas;
- canceladas;
- rascunhos.

### Numeros

- total gerado;
- disponiveis;
- reservados;
- pagos;
- cancelados.

Reservas cujo `reserved_until` ja passou sao contabilizadas como disponiveis no dashboard, seguindo a mesma regra da grade publica.

### Pedidos

- total;
- pendentes;
- pagos;
- expirados;
- cancelados;
- reembolsados;
- participantes unicos por `user_id`.

### Receita

`Potencial total`:

```txt
soma de raffles.total_numbers * raffles.price_per_number
```

`Valor reservado`:

```txt
soma de orders.amount onde orders.status = pending
```

`Valor confirmado`:

```txt
soma de orders.amount onde orders.status = paid
```

Valor reservado nao e receita realizada. Valor confirmado depende do status persistido no pedido e, enquanto o pagamento online estiver pausado, nao representa confirmacao automatica de um provedor.

## Ocupacao

A ocupacao considera numeros reservados ativos e numeros pagos:

```txt
(reserved + paid) / total_numbers * 100
```

O dashboard principal mostra ate seis campanhas recentes. A pagina `/admin/rifas` mostra a analise completa por campanha.

## Alertas

O painel identifica:

- rifa sem premio;
- rifa sem imagem principal ou galeria;
- rifa ativa sem data de sorteio;
- reserva com menos de cinco minutos restantes;
- rifa ativa abaixo de 10% de ocupacao.

Os alertas apontam para a edicao da rifa correspondente.

## Server Actions

`src/app/actions/dashboard.ts` fornece:

- `getAdminDashboardStats()`;
- `getAdminRaffleAnalytics()`;
- `getRecentOrders()`.

As actions sao somente de leitura. Nao existe revalidacao porque nenhuma delas altera dados.

## Como Aplicar

Com o projeto Supabase linkado:

```bash
supabase db push
```

Depois, reinicie o servidor Next.js e acesse:

```txt
/admin
/admin/rifas
```

## Como Testar no Supabase

Para simular um admin no SQL Editor, substitua os UUIDs e execute dentro de uma transacao:

```sql
begin;

set local role authenticated;
set local request.jwt.claims = '{"sub":"ADMIN_USER_UUID","role":"authenticated"}';

select public.get_admin_dashboard_stats('ADMIN_TENANT_UUID');

rollback;
```

Teste de isolamento: repita a chamada com o UUID de outro tenant. O resultado esperado e `ADMIN_TENANT_ACCESS_DENIED`.

Testes pela interface:

1. Entre com um admin vinculado ao tenant.
2. Confirme os cards em `/admin`.
3. Compare os totais com `raffles`, `raffle_numbers` e `orders` no Table Editor.
4. Abra `/admin/rifas` e confira ocupacao, reservados, pagos e potencial.
5. Entre com usuario comum e confirme o bloqueio de `/admin`.

## Limitacoes Sem Pagamento Online

- Nenhum pedido e confirmado automaticamente nesta etapa.
- Nao existe webhook ou conciliacao com gateway.
- `paid` representa somente o status existente no banco.
- Pedidos pendentes antigos devem passar por `expire_old_reservations()` para que o status do pedido seja atualizado para `expired`.
- O dashboard nao executa sorteio nem registra vencedores.
