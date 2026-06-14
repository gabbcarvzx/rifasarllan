# Checklist de Producao

Este documento e o runbook de preparacao, validacao e liberacao da plataforma.
O checkout Asaas permanece pausado e nao faz parte do criterio de go-live atual.

## 1. Variaveis de ambiente

Configure na Vercel com escopo separado para Production, Preview e Development.
Nunca use o banco de producao em previews de branches nao confiaveis.

Obrigatorias agora:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_TENANT_SLUG=
```

Somente servidor e pagamento pausado:

```bash
SUPABASE_SERVICE_ROLE_KEY=
ASAAS_API_KEY=
ASAAS_ENV=production
ASAAS_BASE_URL=https://api.asaas.com/v3
ASAAS_WEBHOOK_TOKEN=
```

Regras:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` sao publicas por
  natureza e protegidas por RLS.
- `NEXT_PUBLIC_TENANT_SLUG` deve ser exatamente o slug da linha em `tenants`.
- `SUPABASE_SERVICE_ROLE_KEY`, `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` nunca
  podem usar prefixo `NEXT_PUBLIC_`.
- Enquanto o checkout estiver pausado, mantenha as credenciais Asaas ausentes
  ou restritas ao ambiente onde a integracao sera validada.
- Nao commitar `.env`, `.env.local` nem arquivos baixados da Vercel.

## 2. Supabase

- [ ] Projeto de producao criado em regiao adequada ao publico.
- [ ] URL e anon key copiadas de API Settings.
- [ ] Site URL configurada com o dominio final HTTPS.
- [ ] Redirect URLs incluem dominio final e previews autorizados.
- [ ] Confirmacao de e-mail definida conforme operacao do cliente.
- [ ] Protecao contra senhas vazadas e requisitos de senha revisados.
- [ ] SMTP proprio configurado antes de volume comercial relevante.
- [ ] PITR ou rotina de backup habilitada conforme o plano contratado.

## 3. Migrations

Aplicar todas as migrations em ordem, incluindo:

```text
202606120001_initial_schema.sql
...
202606140012_manual_live_results.sql
202606140013_production_security_hardening.sql
```

Com Supabase CLI vinculado ao projeto:

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Depois:

- [ ] Confirmar que nenhuma migration ficou pendente.
- [ ] Confirmar triggers de `updated_at` e criacao de profile.
- [ ] Confirmar RPCs de reserva, dashboard e resultado publico.
- [ ] Executar migrations antes de promover o deploy que depende delas.
- [ ] Nunca editar uma migration que ja foi aplicada; criar uma incremental.

## 4. Storage buckets

Os buckets sao criados pela migration de midia:

- `raffle-images`: publico, imagens de rifas.
- `prize-images`: publico, imagens de premios.
- `platform-assets`: publico, logo, favicon e banner.
- `winners`: publico, assets futuros de vencedores.
- `temporary`: privado, arquivos transitorios.

Validar:

- [ ] Limite de 10 MB no bucket e limites menores por finalidade.
- [ ] Apenas JPG/JPEG, PNG e WEBP.
- [ ] MIME type e assinatura real validados no servidor.
- [ ] Paths iniciam com `tenants/{tenant_id}/`.
- [ ] Objetos publicos exigem metadata ativa em `media_files`.
- [ ] Admin nao consegue ler ou alterar objetos de outro tenant.

## 5. RLS e isolamento multi-tenant

- [ ] RLS habilitada em todas as tabelas de negocio.
- [ ] Admin acessa apenas linhas do proprio `tenant_id`.
- [ ] Usuario acessa apenas os proprios pedidos, numeros e pagamentos.
- [ ] Rifa publica exige rifa ativa e tenant ativo.
- [ ] Resultado publico retorna somente campos seguros.
- [ ] Telefone e observacoes de vencedor nao aparecem na leitura anonima.
- [ ] `protect_profile_privileged_fields` impede alterar o proprio role/tenant.
- [ ] `is_admin_for_tenant` exige tenant ativo.
- [ ] Service role existe apenas em modulos com `server-only`.

Teste negativo recomendado: use duas contas admin em tenants diferentes e
tente consultar IDs conhecidos do outro tenant pela API do Supabase.

## 6. Tenant e admin inicial

1. Cadastre o usuario admin pela tela ou pelo Supabase Auth.
2. Obtenha o ID em `auth.users`.
3. Crie o tenant:

```sql
insert into public.tenants (name, slug, owner_id, status)
values ('Nome do Cliente', 'slug-do-cliente', '<auth-user-id>', 'active')
returning id;
```

4. Vincule o profile:

```sql
update public.profiles
set role = 'admin',
    tenant_id = '<tenant-id>'
where id = '<auth-user-id>';
```

5. Configure `NEXT_PUBLIC_TENANT_SLUG=slug-do-cliente` na Vercel.

## 7. Vercel

- [ ] Repositorio conectado ao projeto correto.
- [ ] Framework detectado como Next.js.
- [ ] Node.js 20.9 ou superior.
- [ ] Variaveis configuradas por ambiente.
- [ ] Preview usa projeto Supabase de staging quando disponivel.
- [ ] `npm run build` passa antes do push.
- [ ] Deployment Preview validado antes de promover.
- [ ] Production Deployment promovido do mesmo artefato aprovado.
- [ ] Logs de runtime revisados depois da liberacao.

Fluxo recomendado:

```bash
npm ci
npm run lint
npm run build
npm audit --audit-level=moderate
```

Com integracao Git, o push cria preview automaticamente. Para operacao manual,
use `vercel deploy` em preview e `vercel promote <url>` depois dos testes.

## 8. Dominio

- [ ] Dominio adicionado no projeto Vercel.
- [ ] DNS validado e HTTPS ativo.
- [ ] Dominio principal redireciona variantes `www`/sem `www`.
- [ ] Supabase Site URL atualizado para o dominio final.
- [ ] URLs de redirect de autenticacao atualizadas.
- [ ] Links de termos, privacidade e suporte conferidos.
- [ ] Compartilhamento no WhatsApp usa o dominio final.

## 9. Seguranca de aplicacao

- [ ] Headers `nosniff`, `DENY`, Referrer Policy e Permissions Policy ativos.
- [ ] `/admin` bloqueia usuario anonimo, usuario comum e tenant inativo.
- [ ] Layout admin executa `requireAdmin()` no servidor.
- [ ] Server Actions administrativas validam ownership e tenant.
- [ ] Pedido alheio retorna 404 ou acesso negado.
- [ ] Chaves secretas nao aparecem no bundle client.
- [ ] Upload malicioso, extensao falsa e arquivo acima do limite sao recusados.
- [ ] Mensagens de erro nao retornam stack trace ou segredo.
- [ ] Dependencias sem vulnerabilidade moderada ou superior.

## 10. Testes manuais de aceite

Publico:

- [ ] Home, `/rifas`, rifa individual e resultado carregam em mobile/desktop.
- [ ] Rifa sem imagem e sem premio possui estado vazio profissional.
- [ ] CTA rola ate a grade de numeros.
- [ ] WhatsApp abre com texto e URL corretos.
- [ ] Copiar link funciona em HTTPS.
- [ ] Resultado so aparece quando publicado.

Participante:

- [ ] Cadastro, login e logout.
- [ ] Reserva de numeros disponiveis.
- [ ] Concorrencia impede duas reservas do mesmo numero.
- [ ] Pedido aparece em `/meus-pedidos` e `/meus-numeros`.
- [ ] Usuario nao abre pedido de outra conta.
- [ ] Reserva expirada libera numeros novamente.

Admin:

- [ ] Dashboard e onboarding carregam.
- [ ] Criar, editar, ativar e pausar rifa.
- [ ] Enviar capa e galeria.
- [ ] Criar, editar, ordenar e excluir premios.
- [ ] Configurar white label e textos legais.
- [ ] Registrar, editar, publicar e ocultar resultado manual.
- [ ] Admin de outro tenant nao acessa a rifa.

## 11. Backup, observabilidade e rollback

- [ ] Backup do banco testado com restauracao em ambiente separado.
- [ ] Retencao de Storage definida conforme contrato com o cliente.
- [ ] Alertas de erro e logs da Vercel revisados diariamente no lancamento.
- [ ] Responsavel tecnico e canal de incidente definidos.
- [ ] Deployment anterior identificado para rollback rapido.
- [ ] Mudancas de banco possuem plano de compatibilidade reversa.

## 12. Criterio de go-live

Liberar somente quando:

- migrations e RLS estiverem validadas;
- admin e tenant inicial estiverem configurados;
- ao menos uma jornada completa de reserva tiver sido testada;
- pagina comercial, links e dominio estiverem revisados;
- lint, build e audit estiverem aprovados;
- pagamento online continuar claramente sinalizado como pausado.

