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

## Etapa 5A: Media Management Foundation

Status: concluida.

- Buckets Supabase Storage definidos por dominio de uso.
- Tabela `media_files` para metadados centralizados.
- RLS para metadata e objetos do Storage.
- Path padrao `tenants/{tenant_id}/...`.
- Configuracoes centralizadas em `src/config/storage.ts`.
- Validacoes reutilizaveis de MIME, assinatura real e tamanho.
- Helpers base em `src/lib/storage`.
- Componentes base de midia sem conexao com paginas.
- Documentacao criada em `docs/MEDIA_ARCHITECTURE.md`.

## Etapa 5B: Upload visual de imagens das rifas

Status: concluida.

- Conectar `UploadDropzone` ao formulario de rifas.
- Upload de imagem principal.
- Galeria de imagens por rifa.
- Substituicao e desativacao de imagens antigas.
- Integracao com `raffles.main_image_url`.
- Server Actions protegidas por tenant e ownership da rifa.
- Reordenacao visual da galeria.
- Pagina publica com imagem principal e miniaturas clicaveis.
- Documentacao criada em `docs/RAFFLE_MEDIA.md`.

## Etapa 6: Sistema completo de premios

Status: concluida.

- CRUD real de premios em `raffle_prizes`.
- Upload de imagens no bucket `prize-images`.
- Vinculo auditavel com `media_files`.
- Validacao de tenant e ownership por Server Actions.
- Ordenacao visual por `position`.
- Quantidade por premio.
- Exibicao publica na pagina da rifa.
- Resumo discreto de premios nos cards publicos.
- Documentacao criada em `docs/PRIZES_SYSTEM.md`.

## Etapa 7: Grade Visual de Numeros

Status: concluida.

- Consulta publica segura via `public_raffle_numbers`.
- Exibicao dos status: disponivel, reservado, pago e cancelado.
- Selecao multipla local, sem reserva real.
- Busca por numero.
- Filtro por status.
- Filtro por intervalo.
- Paginacao local para evitar renderizar milhares de botoes de uma vez.
- Resumo de selecao com quantidade e total estimado.
- CTA informativo/desabilitado para reserva futura.
- Preview estatistico no admin.
- Documentacao criada em `docs/NUMBER_GRID.md`.

## Etapa 8: Reserva de numeros

Status: concluida.

- Reserva transacional via `reserve_raffle_numbers`.
- Bloqueio de numeros com `FOR UPDATE`.
- Criacao de pedido `pending`.
- Criacao de `order_items`.
- Vinculo de `user_id`, `order_id` e `reserved_until`.
- Expiracao com `expire_old_reservations`.
- Pagina `/pedido/[id]`.
- Contador regressivo da reserva.
- Protecao para usuario nao acessar pedido de outro usuario.
- Documentacao criada em `docs/RESERVATIONS.md`.

## Etapa 9: Checkout Pix

Status: implementacao tecnica concluida, ativacao operacional pausada.

- Asaas como gateway oficial.
- Configuracao production/sandbox por variaveis de ambiente.
- Clientes Asaas persistidos e reutilizados.
- Criacao idempotente de cobrancas Pix.
- QR Code e Pix copia e cola.
- Persistencia de status e resposta do provedor.
- Refresh manual de status.
- Cancelamento de cobranca pendente.
- Pagina de pedido com checkout fintech.
- Ativacao comercial condicionada a conta Asaas, webhook e reconciliacao futura.
- Documentacao criada em `docs/ASAAS_CHECKOUT.md`.

## Etapa 10: Dashboard administrativo profissional

Status: concluida.

- RPC multi-tenant `get_admin_dashboard_stats`.
- Resumo real de rifas, numeros, pedidos e participantes.
- Potencial total, valor reservado e valor confirmado.
- Ocupacao por rifa com indicadores CSS.
- Agenda de proximos sorteios.
- Ultimos pedidos e ranking de ocupacao.
- Alertas de premio, imagem, data, ocupacao e expiracao.
- Listagem administrativa de rifas enriquecida com analytics.
- Documentacao criada em `docs/ADMIN_DASHBOARD.md`.

## Pagamento e webhook

Status: pausados temporariamente.

- Checkout Asaas nao deve ser ativado enquanto a conta do cliente nao estiver pronta.
- Webhook, conciliacao e confirmacao automatica permanecem fora do escopo atual.

## Etapa 11: Area do participante

Status: pendente.

- Minhas reservas.
- Meus pedidos.
- Historico de participacao.
- Status de pagamento e numeros.

## Etapa 12: Dashboard financeiro

Status: pendente.

- Receita por rifa.
- Taxas, conversao e inadimplencia.
- Filtros por periodo.
- Exportacao futura.

## Etapa 13: Sorteio

Status: pendente.

- Regras de elegibilidade.
- Registro de vencedor.
- Auditoria do sorteio.
- Pagina publica de resultado.

## Etapa 14: Polimento final

Status: pendente.

- Testes automatizados.
- Tratamento global de erro.
- Logging estruturado.
- Backup e restore.
- Hardening de seguranca.
- Deploy Vercel-ready.
