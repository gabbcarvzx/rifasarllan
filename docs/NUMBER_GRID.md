# Grade Visual de Numeros

Etapa 7 concluida: visualizacao publica dos numeros da rifa, selecao local, filtros, busca, paginacao e preview estatistico no admin.

Nota: a reserva real foi implementada depois, na Etapa 8, e esta documentada em `docs/RESERVATIONS.md`.

## Escopo

Esta etapa implementa apenas visualizacao e selecao local.

Nao foram implementados:

- reserva real de numeros;
- checkout Pix;
- webhook;
- sorteio;
- dashboard financeiro;
- gerenciamento manual de numeros pelo admin.

## Carregamento dos Numeros

Os numeros publicos sao carregados por `getPublicRaffleNumbers(raffleId)` em `src/app/actions/raffle-numbers.ts`.

A action:

- valida que a rifa esta `active`;
- valida que o tenant da rifa esta `active`;
- consulta a view `public_raffle_numbers`;
- retorna apenas `number` e `status`.

Campos sensiveis como `user_id`, `order_id`, dados pessoais e informacoes de pedido nao sao retornados para o frontend.

## Status

A grade trabalha com os status da tabela `raffle_numbers`:

- `available`: numero disponivel e selecionavel localmente;
- `reserved`: numero reservado e bloqueado para selecao;
- `paid`: numero vendido/pago e bloqueado para selecao;
- `cancelled`: numero cancelado e bloqueado para selecao.

A selecao local adiciona um estado visual extra:

- `selected`: numero disponivel escolhido pelo usuario no navegador.

Esse estado nao e persistido no banco nesta etapa.

## Componente Publico

O componente principal fica em:

```txt
src/components/raffles/number-grid.tsx
```

Ele oferece:

- grid responsivo;
- selecao multipla local;
- legenda de status;
- filtro por status;
- busca por numero;
- filtro por intervalo;
- paginacao local;
- contador de resultados;
- resumo de selecao;
- CTA conectado ao fluxo real de reserva de numeros.

O resumo fica em:

```txt
src/components/raffles/selection-summary.tsx
```

Ele mostra:

- numeros selecionados;
- quantidade;
- total estimado;
- botao para limpar selecao;
- botao de continuar desabilitado.

## Performance

Para evitar travamento com rifas grandes, a tela nao renderiza todos os numeros simultaneamente.

A estrategia atual:

- carrega uma lista segura e enxuta: `number` + `status`;
- filtra em memoria no client;
- renderiza apenas a pagina atual;
- permite page size de 250, 500 ou 1000 numeros;
- permite reduzir rapidamente o conjunto com busca, status e intervalo.

Essa abordagem funciona bem para 100, 1.000 e cenarios maiores como 10.000 numeros sem criar uma grade gigante no DOM.

Em uma etapa futura, se houver rifas com centenas de milhares de numeros, o caminho natural e paginação server-side ou virtualizacao dedicada.

## Admin Preview

A tela `/admin/rifas/[id]/editar` agora exibe um preview estatistico:

- total;
- disponiveis;
- reservados;
- pagos;
- cancelados.

Esses numeros sao carregados por `getAdminRaffleNumberStats(raffleId)`, com `requireAdmin()` e validacao de ownership da rifa pelo `tenant_id`.

## Seguranca

Camadas aplicadas:

- view publica `public_raffle_numbers` sem dados sensiveis;
- action publica valida rifa e tenant ativos;
- RLS continua protegendo a tabela real `raffle_numbers`;
- admin stats exigem `requireAdmin()`;
- nenhuma action publica retorna `user_id`, `order_id`, pedido ou perfil.

## Por que reserva e pagamento ainda nao existem

Reserva real exige controle transacional:

- impedir dupla reserva;
- definir expiracao;
- registrar usuario/pedido;
- lidar com concorrencia;
- liberar numeros expirados;
- integrar pagamento Pix;
- processar webhook com idempotencia.

Esses pontos pertencem a Etapa 8 e Etapa 9/10. Implementar agora de forma parcial criaria risco operacional e tecnico.

## Teste Manual

1. Acessar uma rifa ativa em `/rifas/[slug]`.
2. Verificar a secao `Escolha seus numeros`.
3. Selecionar numeros disponiveis.
4. Confirmar que reservados, pagos e cancelados nao sao selecionaveis.
5. Usar busca por numero.
6. Usar filtro por status.
7. Usar filtro por intervalo.
8. Alterar pagina e quantidade por pagina.
9. Validar total estimado no resumo.
10. Acessar `/admin/rifas/[id]/editar` como admin e conferir os totais por status.
