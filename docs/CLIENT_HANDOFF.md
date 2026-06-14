# Entrega ao Cliente

## Visao geral

A plataforma organiza rifas online com vitrine publica, grade de numeros,
reservas, area do participante, dashboard administrativo, white label e
publicacao manual do resultado de sorteios feitos em live.

O sorteio nao acontece dentro do sistema. O administrador realiza a apuracao
externamente e registra o resultado depois da live.

## Primeiro acesso do administrador

Ao entrar em `/admin`, use o checklist de onboarding:

1. Configure nome, slogan e suporte.
2. Envie logo, favicon e banner.
3. Crie a primeira rifa.
4. Adicione capa e galeria.
5. Cadastre os premios.
6. Revise regras, preco, data e faixa de numeros.
7. Ative a rifa.
8. Teste uma reserva com uma conta participante.
9. Abra a pagina comercial e compartilhe o link.

## Como criar uma rifa

1. Acesse `Admin > Rifas > Nova rifa`.
2. Preencha titulo, slug, descricao curta, descricao completa e regras.
3. Defina preco por numero, faixa numerica e data prevista.
4. Salve inicialmente como rascunho.
5. Revise imagens e premios na tela de edicao.
6. Ative somente quando a pagina publica estiver pronta.

Alterar a faixa numerica depois do inicio da operacao exige cuidado, pois
pedidos e numeros podem estar vinculados ao intervalo atual.

## Imagens e premios

Na edicao da rifa:

- envie a imagem principal e organize a galeria;
- cadastre titulo, descricao, quantidade e posicao de cada premio;
- use imagens reais e claras do item entregue;
- mantenha o premio principal na primeira posicao.

Arquivos aceitos: JPG/JPEG, PNG e WEBP, respeitando o limite indicado na tela.

## Reservas e participantes

O participante escolhe numeros e cria uma reserva de 15 minutos. O pedido fica
disponivel em `Minha conta`, `Meus pedidos` e `Meus numeros`.

No dashboard, o admin acompanha:

- numeros disponiveis, reservados e pagos;
- pedidos recentes;
- participantes;
- ocupacao e potencial por rifa;
- alertas de imagem, premio, data e reservas.

O pagamento online permanece pausado. A operacao deve definir com o cliente
como as reservas serao confirmadas enquanto o webhook Asaas nao estiver ativo.

## Resultado da live

Depois do sorteio externo:

1. Abra a rifa no admin.
2. Entre em `Resultado`.
3. Selecione o premio e informe o numero vencedor.
4. Confirme nome e WhatsApp do vencedor.
5. Adicione link da live e link de comprovacao quando existirem.
6. Revise alertas de numero reservado ou nao pago.
7. Publique o resultado.

A pagina `/rifas/[slug]/resultado` mostra somente dados publicos seguros. O
admin pode ocultar e republicar o resultado para corrigir informacoes.

## White label

Em `Admin > Configuracoes` o cliente controla:

- nome e slogan;
- logo, favicon e banner;
- cores principal e secundaria;
- WhatsApp e redes sociais;
- titulo e descricao SEO;
- termos de uso e politica de privacidade.

Cada implantacao deve usar `NEXT_PUBLIC_TENANT_SLUG` correspondente ao tenant
do cliente para impedir mistura de vitrines.

## Como apresentar ao cliente

Roteiro recomendado de 10 minutos:

1. Abra a home personalizada e mostre marca, banner e rifas ativas.
2. Entre em uma rifa e destaque premios, confianca e compartilhamento.
3. Selecione numeros e mostre a reserva vinculada a conta.
4. Abra `Meus pedidos` e `Meus numeros`.
5. Entre no admin e mostre onboarding, dashboard e alertas.
6. Edite branding e uma rifa sem tocar em codigo.
7. Mostre o registro manual e a pagina publica de resultado.
8. Explique claramente que pagamento/webhook permanecem pausados.

## Limitacoes atuais

- pagamento Asaas nao deve ser ativado comercialmente nesta etapa;
- nao existe webhook de confirmacao automatica;
- nao existe WhatsApp automatico;
- nao existe sorteio automatico;
- divulgacao e contato com vencedor sao manuais;
- backup, suporte e dominio dependem do plano operacional contratado.

## Modulos futuros opcionais

- webhook Asaas e reconciliacao de pagamentos;
- WhatsApp automatico para reserva e confirmacao;
- relatorios avancados e exportacoes;
- pacote final de producao com dominio, monitoramento e operacao assistida.

## Handoff tecnico

Entregar ao responsavel tecnico:

- acesso ao projeto Vercel;
- acesso ao Supabase e politicas de backup;
- dominio e DNS;
- lista das variaveis configuradas, sem enviar segredos em documento;
- conta admin inicial;
- link de `docs/PRODUCTION_CHECKLIST.md`;
- procedimento de suporte, incidente e rollback.

