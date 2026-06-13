# Sistema de Premios

Etapa 6 concluida: cadastro, edicao, exclusao, ordenacao, upload e exibicao publica de premios por rifa.

## Escopo

O sistema usa a tabela `raffle_prizes` existente e adiciona apenas o vinculo `media_file_id` para auditar imagens em `media_files`.

Nao foram implementados nesta etapa:

- escolha de numeros;
- reserva de numeros;
- checkout Pix;
- webhook;
- sorteio;
- dashboard financeiro.

## CRUD

As mutacoes ficam em `src/app/actions/prizes.ts`:

- `createPrize()` cria um premio para uma rifa do tenant do admin.
- `updatePrize()` altera titulo, descricao, quantidade e posicao.
- `deletePrize()` remove o premio e desativa a midia vinculada.
- `getRafflePrizes()` carrega premios no admin apos validar ownership da rifa.

Todas as actions chamam `requireAdmin()` e validam:

- admin autenticado;
- `profile.tenant_id` presente;
- rifa pertencente ao tenant;
- premio pertencente a uma rifa do mesmo tenant.

## Upload

As imagens usam o bucket `prize-images` com caminho:

```txt
tenant-id/raffle-id/prize-id/imagem.ext
```

O helper `src/lib/storage/prize-images.ts` valida:

- JPG/JPEG, PNG e WEBP;
- limite maximo de 10 MB;
- MIME type declarado;
- assinatura real do arquivo;
- extensao segura conforme o MIME validado.

Cada upload cria um registro em `media_files`. Ao substituir ou remover uma imagem, o registro antigo e marcado como `is_active = false`.

## Ordenacao e Posicao

Cada premio possui `position`.

O admin pode:

- preencher a posicao manualmente;
- mover o premio para cima ou para baixo;
- salvar uma nova ordem via `reorderPrizes()`.

A exibicao publica ordena por `position` e depois por `created_at`.

## Admin

A tela `/admin/rifas/[id]/editar` agora possui a secao `Premios da rifa`.

Nesta secao o admin consegue:

- adicionar premio;
- editar premio;
- excluir premio;
- alterar quantidade;
- alterar posicao;
- trocar imagem;
- remover imagem.

Tudo ocorre na mesma pagina, com Server Actions e refresh do App Router apos sucesso.

## Publico

A pagina `/rifas/[slug]` exibe a secao `Premios` quando houver premios cadastrados.

Cada premio mostra:

- posicao;
- imagem;
- titulo;
- descricao;
- quantidade.

Os cards de rifas na home e na vitrine exibem um resumo discreto com quantidade de premios e premio principal.

## Seguranca

As camadas de seguranca sao redundantes por desenho:

- Server Actions validam `tenant_id` e ownership.
- RLS em `raffle_prizes` bloqueia acesso cruzado entre tenants.
- Storage usa paths com `tenant_id`.
- `media_files` registra metadata e permite auditoria.
- Nenhuma chave `service_role` e usada no frontend.

## Teste Manual

1. Entrar como admin.
2. Acessar `/admin/rifas`.
3. Abrir uma rifa em editar.
4. Criar um premio com titulo, quantidade e imagem.
5. Editar titulo, descricao, quantidade e posicao.
6. Mover o premio para cima/baixo quando houver mais de um.
7. Trocar a imagem.
8. Remover a imagem.
9. Excluir o premio.
10. Conferir `/rifas/[slug]` para validar a exibicao publica.
