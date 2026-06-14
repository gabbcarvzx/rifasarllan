# Auditoria Final da Plataforma

Data da auditoria: 14/06/2026

## Resumo executivo

A causa principal da lentidao era uma cadeia de consultas remotas executada em
todas as paginas publicas. A resolucao do tenant e das configuracoes fazia duas
viagens seriais ao Supabase, sem cache entre requisicoes. Header, metadata e
conteudo ainda podiam adicionar leituras de autenticacao e perfil ao caminho
critico.

A correcao consolidou a resolucao publica em uma consulta, adicionou Data Cache
com invalidacao por tag, retirou o perfil do caminho critico do Header e reduziu
consultas duplicadas de auth, rifas, premios e area do participante.

No servidor de producao local, a Home aquecida caiu de 467,8 ms para 30,2 ms e
as demais paginas publicas passaram de aproximadamente 440 ms para 17-20 ms.

## Top 20 gargalos

| # | Gargalo | Impacto | Situacao |
|---|---|---|---|
| 1 | Resolucao de tenant e settings em duas consultas seriais | Critico | Corrigido com uma consulta embutida |
| 2 | Settings sem cache compartilhado entre requests | Critico | Corrigido com `unstable_cache` por 5 minutos |
| 3 | Header publico aguardava usuario e profile completos | Critico | Corrigido; hidratacao da conta e nao bloqueante |
| 4 | Uso de `auth.getUser()` com validacao remota | Alto | Substituido por `auth.getClaims()` |
| 5 | `requireAdmin()` fazia consulta adicional do tenant | Alto | Status do tenant incorporado na consulta do profile |
| 6 | Home e `/rifas` buscavam rifas e premios em sequencia | Alto | Consolidado em uma consulta com relacao de premios |
| 7 | Metadata e pagina de detalhe repetiam a mesma rifa | Alto | Deduplicado com React cache e Data Cache |
| 8 | Paginas publicas simples eram forcadas como dinamicas | Alto | Removido onde nao havia dependencia de request |
| 9 | Area do participante relia o profile | Alto | Reutiliza o profile carregado por `requireUser()` |
| 10 | Leituras do participante executavam RPC global de expiracao | Alto | Removido do caminho de leitura; status efetivo e calculado localmente |
| 11 | Historico do participante fazia consultas dependentes em serie | Medio | Consultas de itens, rifas e reservas executadas em paralelo |
| 12 | Pedido carregava `provider_response` e colunas nao usadas | Medio | Payload reduzido a campos usados pela interface |
| 13 | Dashboard podia repetir settings entre layout e pagina | Medio | Deduplicado por request |
| 14 | Mutacoes nao invalidavam cache publico de forma centralizada | Medio | Tags de cache adicionadas a rifas, premios, midia e settings |
| 15 | Cadastro descartava o codigo real do Supabase | Medio | Mapeamento por codigo e log estruturado sem PII |
| 16 | Erro de cadastro redirecionava e apagava o formulario | Medio | Server Action retorna estado inline e preserva os dados |
| 17 | Cadastro sem mascara e orientacao de senha | Medio | Mascara de WhatsApp, requisitos e indicador visual adicionados |
| 18 | Textos publicos expunham termos internos de implementacao | Baixo | Copy reescrita para confianca e conversao |
| 19 | Grade publica transfere todos os numeros da rifa | Alto em rifas grandes | Risco residual; recomenda-se paginacao server-side |
| 20 | Nao havia benchmark reproduzivel | Medio | Criado `npm run measure:performance` |

## Mapa de bloqueios e acesso a dados

- `cookies()`: cliente Supabase server e deteccao leve de sessao no Header.
- `headers()`: nenhum uso direto encontrado no codigo da aplicacao.
- Proxy: somente rotas administrativas e do participante; valida o JWT com
  `getClaims()` e deixa role, tenant e RLS para a camada server.
- Auth server: uma validacao de claims por request React e uma consulta de
  profile quando a pagina realmente exige identidade.
- Dashboard: uma RPC consolidada, `get_admin_dashboard_stats`, com limites para
  pedidos recentes, ranking, sorteios e alertas.
- Home e catalogo: uma resolucao cacheada de tenant/settings e uma consulta
  cacheada de rifas com resumo de premios.
- Detalhe da rifa: galeria, premios, numeros, settings e resultado sao iniciados
  em paralelo depois da rifa ser resolvida.
- Participante: pedidos primeiro; itens, rifas e prazos em paralelo e sempre
  filtrados pelo usuario atual e pelas politicas RLS.
- Uploads e configuracoes: permanecem server-only, com ownership por tenant e
  invalidacao explicita dos dados publicos apos mutacoes.

## Correcoes de performance

1. `public-platform-bootstrap` usa uma consulta em `tenants` com
   `platform_settings` embutido e cache de 300 segundos.
2. Catalogo publico usa uma consulta em `raffles` com resumo de
   `raffle_prizes`, cache de 60 segundos e invalidacao por tag.
3. Detalhe por slug usa cache de 30 segundos e deduplicacao entre metadata e
   Server Component.
4. Settings e dashboard administrativos sao deduplicados dentro do request.
5. O Header entrega o HTML imediatamente e resolve nome/role no browser apenas
   quando existe cookie de sessao.
6. Leituras do participante nao fazem mais uma escrita global antes de renderizar.
7. Queries de pedido selecionam apenas as colunas usadas e nao enviam resposta
   bruta do provedor ao componente.

## Autenticacao e cadastro

- `getClaims()` valida o token sem a viagem remota de `getUser()`.
- `requireUser()` e `requireAdmin()` usam cache React no request.
- O profile inclui status do tenant na mesma consulta.
- O trigger `handle_new_user()` foi revisado: insere `id`, `email`, nome,
  telefone e role `customer` com `security definer`.
- O schema remoto esta com migrations 001-013 aplicadas e o lint do banco nao
  encontrou erros.
- O cadastro agora diferencia usuario existente, senha fraca, e-mail invalido,
  provider desativado, rate limit e erro de banco/profile.
- Por seguranca, a auditoria nao criou uma conta real automaticamente. O erro
  exato de uma tentativa futura ficara identificado no log server por codigo e
  status, sem e-mail, senha ou outros dados pessoais.

## UX e conversao

- Cadastro preserva os campos quando o Supabase rejeita a operacao.
- WhatsApp recebe mascara brasileira e teclado numerico em dispositivos moveis.
- Senha apresenta quatro criterios, indicador de forca e confirmacao em tempo real.
- Loading do submit continua controlado por `useFormStatus`.
- Home, login, cadastro e detalhe da rifa receberam textos orientados ao cliente,
  chamadas mais claras e estados vazios menos tecnicos.
- Header nao atrasa o primeiro conteudo para montar o menu de conta.

## Imagens

Nao foram encontrados elementos HTML `<img>` nas telas auditadas. Banner, logo,
rifas, premios, galeria, resultados e QR Code usam `next/image`, com `sizes`,
`fill` e lazy loading padrao quando apropriado. Imagens acima da dobra mantem
prioridade somente onde ja e necessario.

## Seguranca

- Nenhum modulo client importa service role, env server-only ou cliente Asaas.
- O script de seguranca verifica tambem artefatos publicos gerados pelo build.
- Logs do cadastro registram apenas codigo e status do erro.
- Autorizacao administrativa continua em Server Components, Server Actions e RLS;
  o estado visual do Header nunca concede acesso.
- Dados brutos do provedor de pagamento deixaram de compor o payload do pedido.
- `NEXT_PUBLIC_TENANT_SLUG` continua obrigatorio no deploy Vercel para eliminar
  fallback ambiguo entre tenants.

## Medicao antes e depois

Ambiente: `next start`, localhost, seis requests por rota, primeiro request como
cold e media dos cinco seguintes como warm. Redirects foram medidos sem seguir.

| Rota | Antes cold | Depois cold | Antes warm | Depois warm | Ganho warm |
|---|---:|---:|---:|---:|---:|
| Home `/` | 1376,0 ms | 400,8 ms | 467,8 ms | 30,2 ms | 93,5% |
| Login | 452,3 ms | 31,1 ms | 447,1 ms | 20,4 ms | 95,4% |
| Cadastro | 441,9 ms | 30,9 ms | 446,1 ms | 18,8 ms | 95,8% |
| Rifas | 448,5 ms | 22,6 ms | 440,4 ms | 16,7 ms | 96,2% |
| Admin sem sessao | 307 | 307 | 3,3 ms | 5,4 ms | variacao de ruido |
| Minha conta sem sessao | 307 | 307 | 2,8 ms | 4,3 ms | variacao de ruido |
| Meus pedidos sem sessao | 307 | 307 | 2,1 ms | 3,3 ms | variacao de ruido |
| Meus numeros sem sessao | 307 | 307 | 2,3 ms | 3,2 ms | variacao de ruido |

Antes da correcao, somente settings consumia aproximadamente 420 ms por pagina:
duas consultas seriais de cerca de 210 ms. Depois, o primeiro acesso faz uma
consulta de aproximadamente 200-300 ms e os acessos aquecidos usam o Data Cache.

As rotas autenticadas foram verificadas no gate de sessao. Tempos internos do
dashboard e da conta com dados reais exigem credenciais de teste admin/customer,
que nao foram criadas nem alteradas durante esta auditoria.

## Como repetir

```bash
npm run build
npm run start -- -p 3100
npm run measure:performance -- http://localhost:3100
```

O numero de amostras pode ser alterado com `PERF_RUNS` e o alvo com
`PERF_BASE_URL`.

## Validacoes executadas

| Comando | Resultado |
|---|---|
| `npm run lint` | Aprovado, sem erros ou warnings |
| `npm run build` | Aprovado, compilacao e TypeScript concluidos |
| `npm run audit:security` | Aprovado, fronteiras e artefatos publicos verificados |
| `npm run check:env` | Aprovado com avisos operacionais esperados |
| `npm audit --audit-level=moderate` | 0 vulnerabilidades |
| `supabase db lint --linked --level warning` | Nenhum erro de schema |
| `npm run analyze -- --output` | Aprovado; relatorio em `.next/diagnostics/analyze` |

Avisos de ambiente: `NEXT_PUBLIC_TENANT_SLUG` ainda precisa ser configurada no
deploy e o checkout Asaas permanece pausado sem `ASAAS_API_KEY`, conforme a
configuracao atual do produto.

## Riscos residuais e proximos passos

1. Implementar paginacao server-side da grade quando uma rifa puder ultrapassar
   alguns milhares de numeros. O HTML mostra apenas uma pagina, mas hoje o RSC
   ainda recebe todos os estados.
2. Adicionar OpenTelemetry ou Vercel Observability para separar TTFB, Supabase,
   auth e render por rota em producao.
3. Criar contas seed de teste isoladas por tenant para benchmark autenticado e
   testes E2E de login, cadastro, admin e participante.
4. Configurar `NEXT_PUBLIC_TENANT_SLUG` em Preview e Production na Vercel.
5. Avaliar indices e planos SQL com dados de volume real antes da primeira
   campanha de grande porte.
