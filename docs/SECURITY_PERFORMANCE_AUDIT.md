# Auditoria de Seguranca e Performance

## Escopo

Auditoria da Etapa 15 sobre ambientes, fronteiras client/server, autenticacao,
consultas publicas, grade de numeros, imagens, proxy e build para Vercel. Webhook,
automacao de WhatsApp, novos pagamentos e sorteio automatico permanecem fora do
escopo.

## Problemas encontrados

- O helper `src/lib/env.ts` misturava variaveis publicas com a service role.
- O proxy consultava usuario, profile e tenant em toda navegacao administrativa.
- O header buscava Auth e profile inclusive para visitantes sem cookie de sessao.
- A pagina da rifa repetia a consulta de metadados ao verificar resultado publicado.
- A grade validava rifa e tenant com duas queries antes de consultar uma view que ja
  restringe rifas e tenants ativos.
- Filtros locais recalculavam imediatamente durante digitacao sobre ate 10.000 itens.
- Imagens publicas ignoravam a otimizacao do Next.js.
- O cadastro dependia do servidor para detectar senhas divergentes.
- O error boundary enviava o objeto de erro completo ao console do navegador.
- O checkout exigia token de webhook mesmo com webhook fora do escopo e pausado.

## Correcoes aplicadas

- Envs separados em `src/lib/env/public.ts` e `src/lib/env/server.ts`.
- Modulos de env secreta, Supabase admin e Asaas marcados com `server-only`.
- Cliente Supabase anonimo e sem cookies para consultas estritamente publicas.
- Proxy reduzido a refresh e validacao da sessao. Role, tenant e status continuam
  validados por `requireAdmin()`, Server Actions e RLS.
- Auth, profile, `requireUser()` e `requireAdmin()` deduplicados por request.
- Header pula a chamada de Auth quando nao existe cookie Supabase.
- Cadastro valida e-mail, tamanho de senha e confirmacao no navegador antes do POST.
- Erros de cadastro e da aplicacao deixaram de expor mensagens internas e stacks.
- Consultas duplicadas removidas da grade e da verificacao de resultado.
- Grade limitada inicialmente a 250 botoes e filtros usam atualizacao adiada.
- `remotePatterns`, AVIF/WebP, compressao e headers de seguranca configurados.
- Scripts locais adicionados para validar envs e procurar vazamentos no bundle.

## Arquivos sensiveis revisados

- `src/lib/env/server.ts`
- `src/lib/supabase/admin.ts`
- `src/config/asaas.ts`
- `src/lib/asaas/client.ts`
- `src/app/actions/checkout.ts`
- `src/proxy.ts`
- `src/lib/auth/require-admin.ts`
- `src/lib/auth/require-user.ts`

A service role permanece limitada ao checkout server-side que precisa reconciliar
objetos protegidos. Todo CRUD administrativo comum continua usando anon key, sessao
do usuario e RLS.

## Verificar ausencia de vazamento

1. Execute `npm run build`.
2. Execute `npm run audit:security` depois do build.
3. O script examina client components, imports privilegiados e os valores secretos
   reais de `.env.local` dentro de `.next/static` e artefatos publicos renderizados.
4. No Vercel, confirme que `SUPABASE_SERVICE_ROLE_KEY`, `ASAAS_API_KEY` e
   `ASAAS_WEBHOOK_TOKEN` nao possuem prefixo `NEXT_PUBLIC_`.
5. Nunca cole valores de env em tickets, screenshots, logs ou metadata.

## Checklist de envs na Vercel

Obrigatorias para a plataforma atual:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TENANT_SLUG`

Somente servidor e apenas quando a funcao correspondente estiver operacional:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ASAAS_API_KEY`
- `ASAAS_ENV`
- `ASAAS_BASE_URL`
- `ASAAS_WEBHOOK_TOKEN` somente na futura Etapa 16

Use valores separados para Preview e Production. Depois de qualquer rotacao,
redeploye e invalide imediatamente a chave anterior no provedor.

## Decisoes de performance

- Dados de disponibilidade, reservas e resultados continuam dinamicos para evitar
  estado comercial obsoleto.
- O cache React atual deduplica settings e contexto de Auth dentro do mesmo request.
- O dashboard ja utiliza a RPC consolidada `get_admin_dashboard_stats`, com listas
  limitadas no banco.
- A grade nunca renderiza 10.000 botoes simultaneamente. Ela ainda recebe o mapa de
  status completo para selecao coerente; paginacao server-side pode ser adotada se o
  volume superar 10.000 numeros por rifa.
- Imagens do Storage passam pelo otimizador do Next/Vercel; QR Code em data URL e
  preview local continuam sem otimizacao por natureza.

## Recomendacoes futuras

- Adicionar observabilidade server-side com redacao de PII e correlation ID.
- Medir p75 de TTFB, LCP e duracao das RPCs em producao antes de criar novos caches.
- Implementar paginacao server-side da grade se a regra comercial crescer acima de
  10.000 numeros.
- Rotacionar service role e chave Asaas antes do go-live caso tenham sido usadas em
  ambientes compartilhados.
- Aplicar rate limiting no checkout e no futuro webhook.
