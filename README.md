# Plataforma de Rifas

Aplicacao SaaS multi-tenant para criar, divulgar e operar rifas online com
Next.js, TypeScript, Supabase e PostgreSQL.

## Desenvolvimento local

```bash
npm install
npm run dev
```

Copie as variaveis documentadas em `.env.local.example` para `.env.local` e
preencha somente com credenciais do ambiente local.

## Validacao

```bash
npm run lint
npm run build
npm audit --audit-level=moderate
```

## Documentacao principal

- `docs/PRODUCTION_CHECKLIST.md`: preparacao e liberacao de producao.
- `docs/CLIENT_HANDOFF.md`: operacao e apresentacao ao cliente.
- `docs/DATABASE_SCHEMA.md`: banco e isolamento multi-tenant.
- `docs/AUTH_FLOW.md`: autenticacao e protecao de rotas.
- `docs/ROADMAP.md`: etapas do produto.

## Escopo operacional atual

Reservas, area do participante, white label e resultado manual estao ativos.
O checkout Asaas e o webhook permanecem pausados para ativacao futura.
