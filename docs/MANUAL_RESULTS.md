# Resultados Manuais do Sorteio

## Escopo

O sorteio acontece fora da plataforma, normalmente em uma live no Instagram.
O sistema nao escolhe numeros, nao executa algoritmo aleatorio e nao confirma
pagamentos. Ele apenas registra, audita e publica o resultado informado pelo
administrador.

## Modelo de dados

A migration `202606140012_manual_live_results.sql` amplia `winners` com:

- origem do sorteio e links da live/comprovacao;
- observacoes internas;
- estado de publicacao e data de publicacao;
- usuario admin responsavel pelo registro;
- `updated_at` para rastrear alteracoes.

Os registros continuam vinculados a `tenant_id`, rifa, premio, numero, usuario
e pedido quando essas relacoes existem.

## Cadastro e validacoes

O admin registra vencedores na edicao da rifa ou em
`/admin/rifas/[id]/resultado`. As Server Actions exigem `requireAdmin()` e
validam:

- tenant e ownership da rifa;
- premio pertencente a rifa;
- existencia do numero na grade da rifa;
- URLs HTTPS para live e comprovacao;
- formato basico do WhatsApp;
- duplicidade de premio e numero.

Quando existe pedido associado ao numero, nome, telefone, usuario e pedido
podem ser recuperados para completar o registro. Numeros `paid` sao o caminho
recomendado. Numeros `reserved`, `available` ou `cancelled` podem ser
registrados manualmente, mas geram um alerta operacional visivel ao admin.

## Publicacao

`publishResult()` publica os vencedores cadastrados da rifa e registra
`published_at`. `unpublishResult()` oculta todos novamente. A pagina publica
fica em `/rifas/[slug]/resultado`.

A leitura publica usa RPCs `security definer` limitados ao tenant white label
configurado. Eles retornam apenas premio, numero, nome, datas e links de
evidencia. Telefone, notas internas, IDs de usuario e dados do pedido nao sao
expostos.

Quando nao existe vencedor publicado, a pagina informa: "Resultado ainda nao
divulgado."

## Limitacoes intencionais

- nenhum sorteio e executado pela aplicacao;
- nao ha verificacao automatica da live ou do link de comprovacao;
- nao ha webhook Asaas nesta etapa;
- o alerta de numero nao pago nao bloqueia uma decisao manual do admin;
- a autenticidade final do resultado e responsabilidade operacional do
  organizador.

## Teste local

1. Aplique a migration incremental no projeto Supabase.
2. Entre com um usuario admin vinculado ao tenant correto.
3. Abra uma rifa com premios e numeros gerados.
4. Cadastre um vencedor com numero pago e confira a ausencia de alerta.
5. Cadastre ou edite usando um numero reservado/disponivel e confira o aviso.
6. Edite e exclua registros pela mesma tela.
7. Publique o resultado e acesse `/rifas/[slug]/resultado` sem autenticacao.
8. Oculte o resultado e confirme a mensagem de resultado nao divulgado.

