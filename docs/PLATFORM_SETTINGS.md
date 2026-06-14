# Configuracoes da Plataforma

## Objetivo

A Etapa 12 transforma a interface em uma operacao white label administravel.
Nome, slogan, assets, cores, redes sociais, suporte, SEO e textos legais ficam
persistidos em `platform_settings`, uma linha por tenant.

## Isolamento multi-tenant

`platform_settings.tenant_id` possui unicidade e referencia `tenants`. Toda
mutacao passa por `requireAdmin()` e usa exclusivamente o `tenant_id` do profile
autenticado. Nenhum formulario recebe ou controla o tenant de destino.

As policies RLS existentes permitem leitura publica apenas para settings de
tenants ativos e escrita somente para administradores do proprio tenant.

## Resolucao da loja publica

A vitrine resolve um unico tenant para evitar misturar branding e rifas de
clientes diferentes:

1. Usa `NEXT_PUBLIC_TENANT_SLUG` quando configurado no deploy.
2. Caso contrario, usa o primeiro tenant ativo que possui settings.
3. Em uma instalacao nova, usa o primeiro tenant ativo.

As consultas publicas de rifas reutilizam o mesmo tenant resolvido. Para uma
arquitetura futura com varios dominios no mesmo deploy, a proxima evolucao deve
mapear host para tenant antes da renderizacao.

## Campos

- Geral: `platform_name`, `platform_subtitle`, `support_email`, `footer_text`.
- Branding: `logo_url`, `favicon_url`, `hero_banner_url`, `primary_color`, `secondary_color`.
- Social: `whatsapp_number`, `instagram_url`, `facebook_url`, `youtube_url`.
- SEO: `seo_title`, `seo_description`.
- Legal: `privacy_policy`, `terms_of_use`.

Os campos legados `hero_title` e `hero_subtitle` foram mantidos para
compatibilidade. A migration inicializa `platform_subtitle` a partir deles
quando houver conteudo anterior.

## Upload de branding

Logo, favicon e banner usam o bucket publico `platform-assets` e a tabela
`media_files`. Os paths seguem:

```text
tenants/{tenant_id}/logos/{arquivo}
tenants/{tenant_id}/favicons/{arquivo}
tenants/{tenant_id}/banners/{arquivo}
```

Formatos permitidos: JPG, JPEG, PNG e WEBP. A infraestrutura valida tamanho,
MIME informado e assinatura real do arquivo. Ao substituir ou remover um
asset, o registro anterior em `media_files` e marcado como inativo.

## Tema visual

As cores sao validadas no formato hexadecimal `#RRGGBB`. O Root Layout converte
os valores em variaveis CSS:

- `--primary`: botoes, acoes principais e estados positivos.
- `--accent`: badges, destaques e detalhes de marca.

Como os componentes usam tokens Tailwind (`primary` e `accent`), a alteracao e
aplicada automaticamente sem editar componentes individualmente. A cor de
texto dos botoes e calculada para manter contraste basico.

## SEO e favicon

`generateMetadata()` carrega settings no servidor e define titulo padrao,
template de paginas, description, application name e favicon. Paginas internas
continuam definindo seus titulos especificos, combinados com o nome da marca.

## Paginas legais

- `/termos` exibe `terms_of_use`.
- `/privacidade` exibe `privacy_policy`.

O conteudo e renderizado como texto, sem HTML injetado, reduzindo risco de XSS.

## Aplicacao

1. Execute a migration `202606140011_platform_settings_white_label.sql`.
2. Acesse `/admin/configuracoes` com um admin vinculado a tenant.
3. Preencha as cinco abas e salve cada dominio separadamente.
4. Valide landing, Header, Footer, metadata, `/termos` e `/privacidade`.

## Fora do escopo

- Webhook e conciliacao de pagamento.
- Sorteio e vencedores.
- WhatsApp automatico.
- Automacao de marketing.
- Novos meios de pagamento.
