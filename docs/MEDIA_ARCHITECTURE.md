# Arquitetura de Midia

Etapa 5A cria a fundacao profissional de midia para a plataforma. Ela prepara Supabase Storage, metadados, validacoes e componentes base, mas ainda nao conecta upload visual em rifas.

## Buckets

| Bucket | Publico | Finalidade | Limite base |
| --- | --- | --- | --- |
| `raffle-images` | Sim | Imagens principais e galerias futuras de rifas. | 10 MB |
| `prize-images` | Sim | Fotos de premios principais e secundarios. | 10 MB |
| `platform-assets` | Sim | Logo, banner principal e identidade visual do tenant. | 10 MB no bucket, com 5 MB para logo. |
| `winners` | Sim | Imagens publicas de vencedores e resultados. | 10 MB |
| `temporary` | Nao | Uploads transitorios antes de vinculacao definitiva. | 10 MB |

Todos os paths devem seguir o padrao:

```txt
tenants/{tenant_id}/{directory}/{file_name}
```

Esse padrao permite aplicar RLS no `storage.objects` usando o tenant presente no caminho.

Na Etapa 5B, imagens de rifas passaram a usar o padrao especifico:

```txt
raffle-images/{tenant_id}/{raffle_id}/{file_name}
```

A funcao `storage_object_tenant_id()` aceita os dois formatos para manter
compatibilidade com a fundacao e com a estrutura operacional de rifas.

## Tabela `media_files`

A tabela `public.media_files` armazena metadados de todos os arquivos:

- `id`
- `tenant_id`
- `bucket_name`
- `file_name`
- `original_name`
- `mime_type`
- `file_size`
- `storage_path`
- `public_url`
- `width`
- `height`
- `uploaded_by`
- `is_active`
- `created_at`
- `updated_at`

Principais garantias:

- `tenant_id` obrigatorio.
- `bucket_name` limitado aos buckets oficiais.
- `file_size >= 0`.
- `width` e `height` positivos quando informados.
- `bucket_name + storage_path` unico.
- `updated_at` atualizado por trigger.

## Fluxo de upload

O helper `uploadMediaFile(file, purpose)` em `src/lib/storage/upload.ts` executa:

1. `requireAdmin()` para exigir admin autenticado.
2. Validacao de tenant no profile.
3. Validacao de tamanho, extensao bloqueada, MIME informado e assinatura real do arquivo.
4. Leitura de metadados de imagem quando possivel.
5. Upload para o bucket correto.
6. Registro em `media_files`.
7. Remocao do objeto do Storage se o registro de metadados falhar.

O helper ainda nao esta conectado em paginas. Ele sera usado na Etapa 5B.

## Validacoes

Tipos permitidos:

- JPG/JPEG: `image/jpeg`
- PNG: `image/png`
- WEBP: `image/webp`

Extensoes bloqueadas:

- `exe`
- `bat`
- `cmd`
- `dll`
- `js`
- `mjs`
- `ts`
- `tsx`
- `zip`
- `rar`

MIME types perigosos tambem sao bloqueados, incluindo executaveis, JavaScript, TypeScript, octet-stream e arquivos compactados.

Limites por finalidade:

- Logo: 5 MB.
- Banner: 10 MB.
- Imagens de rifa: 10 MB.
- Imagens de premio: 10 MB.
- Vencedores: 10 MB.
- Temporarios: 10 MB.

As regras ficam centralizadas em `src/config/storage.ts`.

## Seguranca e RLS

Usuario comum nao gerencia midia.

Admin pode gerenciar apenas arquivos do proprio tenant:

- metadata em `public.media_files`;
- objetos em `storage.objects`;
- paths restritos ao padrao `tenants/{tenant_id}/...`.

Publico pode ler apenas metadados e objetos ativos de buckets publicos:

- `raffle-images`;
- `prize-images`;
- `platform-assets`;
- `winners`.

O bucket `temporary` permanece privado.

## Boas praticas para as proximas etapas

- Nunca montar path de storage fora de `src/lib/storage/urls.ts`.
- Nunca validar upload apenas por extensao.
- Sempre registrar `media_files` depois do upload.
- Sempre desativar arquivo antigo antes de substituir logo, banner ou imagem principal.
- Evitar delete fisico em arquivos que possam ter auditoria, pagamento, comprovante ou resultado publico.
- Usar delete fisico apenas para temporarios ou rollback de falha.
- Manter `tenant_id` em todas as entidades que referenciarem midia.

## Arquivos da fundacao

- `supabase/migrations/202606120004_media_management_foundation.sql`
- `src/config/storage.ts`
- `src/types/media.ts`
- `src/lib/storage/upload.ts`
- `src/lib/storage/delete.ts`
- `src/lib/storage/urls.ts`
- `src/lib/storage/validation.ts`
- `src/lib/storage/image-processing.ts`
- `src/components/media/media-preview.tsx`
- `src/components/media/image-placeholder.tsx`
- `src/components/media/file-badge.tsx`
- `src/components/media/upload-dropzone.tsx`
- `src/components/media/upload-progress.tsx`
