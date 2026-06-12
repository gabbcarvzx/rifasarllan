# CRUD de Rifas no Admin

Este documento registra a Etapa 4: CRUD real da tabela `raffles` no painel admin.

## Escopo implementado

- Criacao, listagem, edicao e cancelamento logico de rifas.
- Alteracao de status: `draft`, `active`, `paused`, `finished`, `cancelled`.
- Isolamento por `tenant_id` em todas as actions admin.
- Protecao server-side com `requireAdmin()`.
- Leitura publica apenas de rifas `active` em tenants `active`.
- Geracao automatica de numeros via `generate_raffle_numbers(p_raffle_id)` apos criar a rifa.
- Dashboard admin com metricas reais basicas de rifas.

## Como criar uma rifa

1. Entre com um usuario `admin` vinculado a um `tenant_id`.
2. Acesse `/admin/rifas/nova`.
3. Preencha titulo, slug, descricoes, regras, valor, quantidade, faixa e data.
4. Escolha status inicial `draft` ou `active`.
5. Ao salvar, a Server Action `createRaffle(formData)`:
   - valida os campos obrigatorios;
   - normaliza o slug;
   - converte valores numericos;
   - grava `tenant_id` e `created_by`;
   - chama `generate_raffle_numbers(p_raffle_id)`;
   - revalida `/admin`, `/admin/rifas`, `/`, `/rifas` e a pagina publica da rifa.

## Como os status funcionam

- `draft`: rifa em rascunho, visivel apenas para admin.
- `active`: rifa publicada na vitrine publica.
- `paused`: rifa pausada no admin, removida da vitrine publica.
- `finished`: campanha encerrada manualmente, sem sorteio automatico nesta etapa.
- `cancelled`: cancelamento logico. Os dados permanecem para auditoria.

`deleteRaffle(raffleId)` nao executa delete fisico. Ela muda o status para `cancelled`, porque futuras tabelas de pedidos, pagamentos, numeros e vencedores podem depender da rifa.

## Geracao automatica de numeros

Apos o insert em `raffles`, a action chama:

```sql
select public.generate_raffle_numbers(p_raffle_id);
```

A funcao SQL insere numeros de `min_number` ate `max_number` com `on conflict do nothing`, evitando duplicidade por causa da constraint `(raffle_id, number)`.

Na edicao, se a faixa de numeros mudar, o sistema:

- valida se nao existem numeros reservados, pagos ou cancelados;
- remove numeros disponiveis fora da nova faixa;
- chama novamente `generate_raffle_numbers` para inserir numeros faltantes.

Isso preserva consistencia sem implementar reserva ou grade visual nesta etapa.

## O que ainda nao foi implementado

- Upload de imagens: Etapa 5.
- Cadastro de premios: Etapa 6.
- Grade visual de numeros: Etapa 7.
- Reserva de numeros: Etapa 8.
- Pix: Etapa 9.
- Webhook: Etapa 10.
- Sorteio e vencedores: Etapa 11.

## Como testar o CRUD

1. Configure `.env.local` com:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

2. Aplique as migrations no Supabase.
3. Crie um usuario pelo fluxo `/cadastro`.
4. No Supabase SQL Editor, vincule o usuario a um tenant e promova para admin:

```sql
update public.profiles
set role = 'admin',
    tenant_id = '<TENANT_ID>'
where email = '<EMAIL_DO_ADMIN>';
```

5. Entre em `/login`.
6. Acesse `/admin/rifas/nova`.
7. Crie uma rifa `draft` e outra `active`.
8. Confira no banco:

```sql
select id, title, status, tenant_id
from public.raffles
order by created_at desc;

select raffle_id, count(*)
from public.raffle_numbers
group by raffle_id;
```

9. Acesse `/admin/rifas` para editar e alterar status.
10. Acesse `/rifas` e confirme que apenas rifas `active` aparecem.
11. Acesse `/rifas/[slug]` de uma rifa ativa.

## Erros comuns de tenant/admin

- Se `/admin` redirecionar para `/login`, o usuario nao tem sessao ativa.
- Se `/admin` redirecionar para `/acesso-negado`, o profile nao tem `role = 'admin'`.
- Se as actions retornarem erro de tenant, o admin provavelmente nao tem `tenant_id`.
- Se a rifa nao aparece na vitrine publica, verifique:
  - `raffles.status = 'active'`;
  - `tenants.status = 'active'`;
  - o slug acessado pertence ao tenant correto.

## Arquivos principais

- `src/app/actions/raffles.ts`
- `src/app/(admin)/admin/rifas/page.tsx`
- `src/app/(admin)/admin/rifas/nova/page.tsx`
- `src/app/(admin)/admin/rifas/[id]/editar/page.tsx`
- `src/app/(public)/rifas/page.tsx`
- `src/app/(public)/rifas/[slug]/page.tsx`
- `src/lib/raffles/public-queries.ts`
- `supabase/migrations/202606120003_restrict_public_raffles_to_active_tenants.sql`
