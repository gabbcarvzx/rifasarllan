# Roadmap do Produto

Este projeto sera evoluido por etapas para manter arquitetura, seguranca e monetizacao sob controle.

## Etapa 1: Fundacao Premium do Projeto

Status: concluida.

- Next.js, TypeScript e Tailwind CSS configurados.
- Identidade visual premium em dark mode.
- Paginas publicas e administrativas baseadas em placeholders.
- Componentes reutilizaveis.
- Supabase client/server configurado sem chaves sensiveis.

## Etapa 2: Banco de dados e migrations

Status: concluida.

- Modelagem PostgreSQL multi-tenant.
- `tenantId` em todas as entidades de negocio.
- Indices compostos por tenant.
- Politicas RLS no Supabase.
- Tabelas iniciais para tenants, perfis, rifas, premios, numeros e configuracoes.
- Migration criada em `supabase/migrations/202606120001_initial_schema.sql`.
- Documentacao tecnica criada em `docs/DATABASE_SCHEMA.md`.

## Etapa 3: Autenticacao e protecao de rotas

Status: concluida.

- Supabase Auth.
- Login, cadastro e logout reais.
- Protecao server-side para rotas admin.
- Controle de papeis por tenant.
- Status de plano: trial, ativo, vencido e bloqueado.
- Middleware para `/admin`.
- Pagina `/minha-conta`.
- Pagina `/acesso-negado`.
- Documentacao criada em `docs/AUTH_FLOW.md`.

## Etapa 4: CRUD de rifas no admin

Status: concluida.

- CRUD real da tabela `raffles` no admin.
- Server Actions protegidas por `requireAdmin()`.
- Isolamento por `tenant_id` em todas as operacoes.
- Criacao de rifas `draft` e `active`.
- Edicao de dados principais, faixa de numeros e status.
- Cancelamento logico com status `cancelled`.
- Geracao automatica de numeros via `generate_raffle_numbers` apos criar rifa.
- Vitrine publica lendo apenas rifas `active` de tenants `active`.
- Dashboard admin com metricas reais basicas de rifas.
- Documentacao criada em `docs/RAFFLE_CRUD.md`.

## Etapa 5: Upload de imagens e galeria

Status: pendente.

- Supabase Storage.
- Buckets por dominio de uso.
- Organizacao por tenant.
- Validacao de tamanho e tipo de arquivo.
- Galeria por rifa.

## Etapa 6: Cadastro de premios

Status: pendente.

- Premio principal e premios secundarios.
- Ordem de exibicao.
- Regras de entrega.
- Vinculo com rifa e tenant.

## Etapa 7: Grade de numeros

Status: pendente.

- Geracao de numeros por rifa.
- Estados: disponivel, reservado, pago e cancelado.
- Indices para consulta rapida por tenant e rifa.
- UI responsiva para milhares de numeros.

## Etapa 8: Reserva de numeros

Status: pendente.

- Reserva transacional.
- Expiracao automatica.
- Prevencao de dupla reserva.
- Logs de tentativa e auditoria.

## Etapa 9: Integracao Pix

Status: pendente.

- Provedor de pagamento definido.
- Criacao de cobrancas Pix.
- QR Code e copia e cola.
- Status inicial de pagamento.

## Etapa 10: Webhook de pagamento

Status: pendente.

- Endpoint server-side seguro.
- Validacao de assinatura.
- Idempotencia.
- Atualizacao atomica de reservas e numeros.

## Etapa 11: Sorteio e vencedores

Status: pendente.

- Regras de elegibilidade.
- Registro de vencedor.
- Auditoria do sorteio.
- Pagina publica de resultado.

## Etapa 12: Dashboard financeiro

Status: pendente.

- Receita por rifa.
- Taxas, conversao e inadimplencia.
- Filtros por periodo.
- Exportacao futura.

## Etapa 13: Polimento UX, seguranca e deploy

Status: pendente.

- Testes automatizados.
- Tratamento global de erro.
- Logging estruturado.
- Backup e restore.
- Hardening de seguranca.
- Deploy Vercel-ready.
