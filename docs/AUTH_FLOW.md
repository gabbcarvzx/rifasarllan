# Auth Flow

## Objetivo

A Etapa 3 implementa autenticacao real com Supabase Auth, sessao por cookies, protecao de rotas privadas e separacao entre usuario comum e admin. Esta etapa nao implementa CRUD de rifas, pagamentos, webhooks, upload ou sorteio.

## Como Funciona o Login

O formulario `/login` envia `email` e `password` para a server action:

```ts
signInWithEmail(formData)
```

A action valida campos obrigatorios, usa o Supabase Server Client e chama:

```ts
supabase.auth.signInWithPassword({ email, password })
```

Depois do login:

- Se o profile tiver `role = 'admin'`, o usuario e redirecionado para `/admin`.
- Se for cliente comum, o usuario e redirecionado para `/minha-conta`.
- Se houver erro, o usuario volta para `/login` com mensagem amigavel.

## Como Funciona o Cadastro

O formulario `/cadastro` envia:

- Nome completo
- WhatsApp
- E-mail
- Senha
- Confirmacao de senha

A server action:

```ts
signUpWithEmail(formData)
```

valida campos obrigatorios, senha minima de 8 caracteres e igualdade entre senha e confirmacao.

O cadastro usa:

```ts
supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name,
      phone,
      whatsapp,
    },
  },
})
```

Se confirmacao de e-mail estiver ativa no Supabase, o usuario precisa confirmar antes de logar. Se a sessao ja vier ativa, ele vai para `/minha-conta`.

## Como o Profile e Criado

Na Etapa 2 foi criado um trigger em `auth.users`:

```sql
on_auth_user_created
```

Esse trigger chama:

```sql
public.handle_new_user()
```

Na Etapa 3 foi criada a migration incremental:

```bash
supabase/migrations/202606120002_auth_profile_phone.sql
```

Ela atualiza `handle_new_user()` para tambem salvar `phone` vindo de `raw_user_meta_data`. O profile nasce com:

- `id = auth.users.id`
- `email`
- `full_name`
- `phone`
- `role = 'customer'`

## Como Admin e Identificado

Admin e identificado pelo campo:

```sql
profiles.role = 'admin'
```

O sistema nunca confia apenas no frontend. A validacao acontece em:

- `src/middleware.ts`, antes de acessar `/admin`.
- `src/app/(admin)/admin/layout.tsx`, via `requireAdmin()`.
- RLS do Supabase, pelas policies da Etapa 2.

## Como Tornar um Usuario Admin Manualmente

No SQL Editor do Supabase, depois de o usuario existir em `auth.users` e `profiles`:

```sql
update public.profiles
set role = 'admin',
    tenant_id = '<tenant-id-aqui>'
where email = 'admin@empresa.com';
```

Se ainda nao existir tenant, crie um tenant primeiro:

```sql
insert into public.tenants (name, slug, owner_id, status)
values ('Rifa Arllan', 'rifa-arllan', '<auth-user-id-aqui>', 'active')
returning id;
```

Depois use o `id` retornado como `tenant_id` no profile admin.

## Como o Middleware Protege `/admin`

Arquivo:

```bash
src/middleware.ts
```

Regras:

- `/`, `/login`, `/cadastro`, `/rifas` e `/rifas/[slug]` continuam publicas.
- `/admin` e `/admin/*` exigem usuario autenticado.
- Usuario sem sessao e redirecionado para `/login`.
- Usuario autenticado sem `role = 'admin'` vai para `/acesso-negado`.
- Admin autenticado acessa o painel.

Observacao: Next.js 16 recomenda o novo arquivo `proxy.ts`, mas esta etapa manteve `src/middleware.ts` porque foi o contrato pedido. A protecao definitiva tambem fica no Server Component `AdminLayout`, entao nao dependemos apenas do middleware.

## Helpers de Autorizacao

Arquivos:

```bash
src/lib/auth/require-user.ts
src/lib/auth/require-admin.ts
```

`requireUser()`:

- Le a sessao atual.
- Redireciona para `/login` se nao houver usuario.
- Retorna `{ user, profile }`.

`requireAdmin()`:

- Chama `requireUser()`.
- Verifica `profile.role === 'admin'`.
- Redireciona para `/acesso-negado` se nao for admin.

## Como Testar Localmente

1. Configure `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-publica
```

2. Aplique migrations:

```bash
supabase db push
```

3. Rode o projeto:

```bash
npm run dev
```

4. Teste:

- Abra `/login`.
- Abra `/cadastro`.
- Crie um usuario comum.
- Acesse `/minha-conta`.
- Tente abrir `/admin` como usuario comum e confirme redirect para `/acesso-negado`.
- Promova o usuario para admin no SQL Editor.
- Faca logout e login novamente.
- Acesse `/admin`.
- Clique em `Sair` no header ou na sidebar.

## Seguranca

- Nenhuma service role e usada no frontend.
- O projeto usa apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` no client.
- Rotas admin sao validadas no middleware e no Server Component.
- RLS continua sendo a camada final de isolamento de dados no Supabase.
