# Midia das Rifas

Este documento registra a Etapa 5B: upload visual de imagens das rifas no painel admin.

## Escopo implementado

- Upload de imagem principal da rifa.
- Preview instantaneo no formulario.
- Substituicao de imagem principal.
- Remocao de imagem principal.
- Upload multiplo de imagens para galeria.
- Limite inicial de 10 imagens por rifa.
- Remocao de imagem da galeria.
- Reordenacao visual da galeria por controles de subir/descer.
- Exibicao publica da imagem principal e miniaturas clicaveis.
- Cards publicos usando imagem real ou placeholder elegante.

Nao foram implementados nesta etapa:

- Premios.
- Escolha de numeros.
- Reserva.
- Checkout Pix.
- Webhook.
- Sorteio.
- Dashboard financeiro.

## Imagem principal

No admin, a imagem principal fica em `/admin/rifas/[id]/editar`, na secao `Midia da rifa`.

Fluxo:

1. Admin seleciona ou arrasta uma imagem.
2. O client mostra preview local.
3. A Server Action `uploadMainRaffleImage()` valida admin, tenant e ownership da rifa.
4. A imagem e enviada para o bucket `raffle-images`.
5. O registro e salvo em `media_files`.
6. `raffles.main_image_url` recebe a URL publica.
7. A imagem antiga e desativada em `media_files`.

`removeMainRaffleImage()` define `raffles.main_image_url = null` e desativa o arquivo antigo em `media_files`.

## Galeria

A galeria usa a tabela `raffle_images`.

Fluxo de upload:

1. Admin seleciona multiplas imagens.
2. O client mostra os arquivos selecionados.
3. `uploadGalleryImages()` valida tenant, rifa e limite de 10 imagens.
4. Cada imagem e enviada para Storage.
5. Cada imagem gera um registro em `media_files`.
6. Cada imagem gera tambem um registro em `raffle_images` com:
   - `raffle_id`;
   - `media_file_id`;
   - `image_url`;
   - `alt_text`;
   - `order_index`.

Remocao:

- `removeGalleryImage()` remove a linha de `raffle_images`.
- O arquivo associado e desativado em `media_files`.

Reordenacao:

- `reorderGalleryImages()` recebe a ordem desejada de IDs.
- A action valida que todas as imagens pertencem a rifa do tenant.
- `order_index` e atualizado sequencialmente.

## Estrutura do Storage

Bucket usado:

```txt
raffle-images
```

Estrutura por rifa:

```txt
raffle-images/
  tenant-uuid/
    raffle-uuid/
      arquivo-unico.webp
```

O nome final do arquivo usa:

- base normalizada do nome original;
- UUID para evitar colisao;
- extensao validada/preservada quando compativel com o MIME type.

## Validacoes

Tipos permitidos:

- JPG/JPEG
- PNG
- WEBP

Limite:

- 10 MB por imagem de rifa.

Bloqueios:

- EXE
- BAT
- CMD
- DLL
- JS
- TS
- TSX
- RAR
- ZIP

As validacoes nao confiam apenas na extensao:

- valida extensao bloqueada;
- valida MIME informado pelo browser;
- valida assinatura real do arquivo;
- compara MIME informado com assinatura real.

## Seguranca

Todas as actions usam `requireAdmin()`.

Toda operacao valida:

- usuario autenticado;
- role admin;
- `tenant_id` do profile;
- rifa pertencente ao tenant do admin;
- bucket `raffle-images`;
- limite de galeria.

A migration `202606120005_raffle_media_uploads.sql` amplia a funcao `storage_object_tenant_id()` para aceitar paths:

```txt
tenant-uuid/raffle-uuid/arquivo.ext
```

Assim as politicas de `storage.objects` continuam bloqueando acesso entre tenants.

## Pagina publica

`/rifas/[slug]` agora exibe:

- imagem principal grande;
- galeria abaixo;
- miniaturas clicaveis;
- fallback elegante se nao houver imagem.

Os cards publicos tambem usam `main_image_url` quando existir.

## Arquivos principais

- `src/app/actions/raffle-media.ts`
- `src/lib/storage/raffle-images.ts`
- `src/components/admin/raffles/raffle-media-manager.tsx`
- `src/components/admin/raffles/raffle-create-media-fields.tsx`
- `src/components/raffles/public-raffle-gallery.tsx`
- `src/components/media/upload-dropzone.tsx`
- `src/components/raffles/public-raffle-card.tsx`
- `src/app/(public)/rifas/[slug]/page.tsx`
- `supabase/migrations/202606120005_raffle_media_uploads.sql`
