# Database Schema

## Objetivo

A Etapa 2 cria a fundacao real do Supabase/PostgreSQL para uma plataforma SaaS de rifas online. O schema foi desenhado para operar em modelo multi-tenant, com RLS ativo, separacao por tenant, status controlados por constraints e base pronta para autenticacao, CRUD, reserva, Pix, webhook, sorteio e dashboard financeiro nas proximas etapas.

## Tabelas

### `tenants`

Representa cada cliente/operacao dentro da plataforma. Toda entidade comercial deve pertencer direta ou indiretamente a um tenant.

Campos centrais: `id`, `name`, `slug`, `owner_id`, `status`.

### `profiles`

Perfil interno vinculado a `auth.users`. E criado automaticamente pelo trigger `handle_new_user` quando um usuario entra em `auth.users`.

Campos centrais: `id`, `full_name`, `email`, `phone`, `role`, `tenant_id`.

Regra de seguranca: usuarios podem atualizar o proprio perfil, mas o trigger `protect_profile_privileged_fields` impede autoescalacao de `role` ou troca indevida de `tenant_id`.

### `platform_settings`

Configuracoes visuais e publicas da operacao por tenant, como nome da plataforma, logo, cor primaria, WhatsApp, Instagram e textos de hero.

Relacao: `tenant_id -> tenants.id`.

### `raffles`

Campanhas de rifa. Guarda titulo, slug, descricoes, regras, valor por numero, quantidade de numeros, range, data prevista, status, imagem principal e destaque.

Relacoes:

- `tenant_id -> tenants.id`
- `created_by -> auth.users.id`

Restricoes importantes:

- `unique(tenant_id, slug)`
- `price_per_number > 0`
- `total_numbers > 0`
- `min_number > 0`
- `max_number > 0`
- `min_number <= max_number`

### `raffle_images`

Galeria de imagens por rifa, preparada para Supabase Storage na Etapa 5.

Relacao: `raffle_id -> raffles.id`.

### `raffle_prizes`

Premios vinculados a uma rifa, com suporte a premio principal, premios secundarios, posicao e quantidade.

Relacao: `raffle_id -> raffles.id`.

### `raffle_numbers`

Grade real de numeros de cada rifa. Cada numero possui status, usuario reservado/comprador, expiracao de reserva e pedido relacionado.

Relacoes:

- `raffle_id -> raffles.id`
- `user_id -> auth.users.id`
- `order_id -> orders.id`

Restricoes importantes:

- `unique(raffle_id, number)`
- status controlado por constraint.

Observacao de seguranca: a tabela real pode conter `user_id` e `order_id`. Para leitura publica de numeros, use a view `public_raffle_numbers`, que expoe apenas `id`, `raffle_id`, `number` e `status`.

### `orders`

Pedido de compra/reserva de numeros. Ainda nao implementa pagamento; apenas prepara a entidade para as etapas de reserva e Pix.

Relacoes:

- `tenant_id -> tenants.id`
- `user_id -> auth.users.id`
- `raffle_id -> raffles.id`

### `order_items`

Itens do pedido, cada um apontando para um numero especifico da rifa.

Relacoes:

- `order_id -> orders.id`
- `raffle_number_id -> raffle_numbers.id`

Restricao importante: `unique(order_id, raffle_number_id)`.

### `payments`

Base futura para Pix e provedores de pagamento. Nesta etapa nao existe integracao, webhook ou confirmacao real.

Relacao: `order_id -> orders.id`.

### `winners`

Registro futuro de vencedores. A criacao do sorteio e regras de elegibilidade ficam para a Etapa 11.

Relacoes:

- `tenant_id -> tenants.id`
- `raffle_id -> raffles.id`
- `prize_id -> raffle_prizes.id`
- `user_id -> auth.users.id`
- `order_id -> orders.id`

## Status Possiveis

### `profiles.role`

- `admin`
- `customer`

### `tenants.status`

- `active`
- `inactive`

### `raffles.status`

- `draft`
- `active`
- `paused`
- `finished`
- `cancelled`

### `raffle_numbers.status`

- `available`
- `reserved`
- `paid`
- `cancelled`

### `orders.status`

- `pending`
- `paid`
- `expired`
- `cancelled`
- `refunded`

### `payments.status`

- `pending`
- `paid`
- `failed`
- `cancelled`
- `refunded`

## Multi-Tenant

O isolamento por tenant funciona em tres camadas:

1. Dados principais possuem `tenant_id` direto, como `tenants`, `profiles`, `platform_settings`, `raffles`, `orders` e `winners`.
2. Dados filhos herdam o tenant pela relacao com a rifa ou pedido, como `raffle_images`, `raffle_prizes`, `raffle_numbers`, `order_items` e `payments`.
3. As politicas RLS usam as funcoes auxiliares:
   - `current_tenant_id()`
   - `is_admin()`
   - `is_admin_for_tenant(p_tenant_id uuid)`

Admins so conseguem gerenciar dados do proprio tenant. Clientes autenticados so conseguem ler o proprio perfil, pedidos, itens e pagamentos. Visitantes anonimos leem apenas dados publicos de tenants ativos e rifas ativas.

## Geracao de Numeros

A funcao `generate_raffle_numbers(p_raffle_id uuid)`:

- Busca `min_number`, `max_number` e `tenant_id` da rifa.
- Exige que o usuario autenticado seja admin do tenant da rifa.
- Insere a sequencia usando `generate_series`.
- Usa `on conflict (raffle_id, number) do nothing` para evitar duplicidade.
- Retorna quantos numeros foram inseridos.

Ela e idempotente: pode ser chamada novamente para a mesma rifa sem duplicar numeros.

## RLS Inicial

RLS esta ativo em:

- `profiles`
- `tenants`
- `platform_settings`
- `raffles`
- `raffle_images`
- `raffle_prizes`
- `raffle_numbers`
- `orders`
- `order_items`
- `payments`
- `winners`

Leitura publica:

- Tenants ativos.
- Configuracoes de tenants ativos.
- Rifas ativas.
- Imagens e premios de rifas ativas.
- Numeros publicos via `public_raffle_numbers`.

Leitura autenticada:

- Proprio profile.
- Proprios pedidos.
- Itens dos proprios pedidos.
- Pagamentos dos proprios pedidos.

Admin:

- Gerencia dados do proprio tenant.
- Gerencia rifas, numeros, pedidos, pagamentos e vencedores do proprio tenant.

## Como Aplicar a Migration

Arquivo criado:

```bash
supabase/migrations/202606120001_initial_schema.sql
```

Com projeto Supabase linkado:

```bash
supabase login
supabase link --project-ref <seu-project-ref>
supabase db push
```

Com URL direta do banco:

```bash
supabase db push --db-url "postgresql://postgres:<senha>@<host>:5432/postgres"
```

Para ambiente local com Docker/Supabase CLI:

```bash
supabase start
supabase db reset
```

Nunca commite senhas reais, `DATABASE_URL` ou `SUPABASE_SERVICE_ROLE_KEY`. A service role deve ser usada apenas em ambiente server-side controlado quando for realmente necessaria.
