# Guia Completo de Deploy - OPIDAS

## Problema Identificado

A URL do Stripe estava redirecionando para `/public/onboarding/habit-tracking.html` em vez de `/onboarding/habit-tracking.html`, causando erro de MIME type porque o Netlify ja serve a partir da pasta `public/`.

## Causa Raiz

O arquivo `public/js/services/stripe.js` no GitHub ainda tem a URL antiga com `/public/` na linha 19.

## Solucao

### Passo 1: Aplicar as Correcoes

1. Baixe o arquivo `opidas-corrigido-v3.zip`
2. Extraia na raiz do seu projeto local
3. Os arquivos serao sobrescritos automaticamente

### Passo 2: Verificar as Mudancas

Abra o arquivo `public/js/services/stripe.js` e verifique a linha 19:

```javascript
// CORRETO (sem /public/)
successUrl: `${window.location.origin}/onboarding/habit-tracking.html?session_id={CHECKOUT_SESSION_ID}`,

// ERRADO (com /public/)
successUrl: `${window.location.origin}/public/onboarding/habit-tracking.html?session_id={CHECKOUT_SESSION_ID}`,
```

### Passo 3: Commit e Push para o GitHub

```bash
cd OPIDAS
git add .
git commit -m "fix: corrige URL de redirecionamento do Stripe (remove /public/)"
git push origin main
```

### Passo 4: Aguardar Deploy do Netlify

1. Acesse o dashboard do Netlify
2. Aguarde o deploy automatico (geralmente 1-2 minutos)
3. Verifique se o deploy foi bem-sucedido

### Passo 5: Testar o Fluxo

1. Acesse `https://opidas.netlify.app`
2. Faca login ou crie uma conta
3. Va para `identification.html`
4. Preencha os dados
5. Avance para `investment.html`
6. Clique em "Comecar Gratuitamente"
7. Complete o pagamento no Stripe (use o cartao de teste: `4242 4242 4242 4242`)
8. Verifique se redireciona para `habit-tracking.html` (SEM `/public/` na URL)
9. Verifique se a identidade esta preenchida com seus dados
10. Selecione a data do ultimo habito
11. Avance para `welcome.html`
12. Clique em "Entrar no Campo"
13. Verifique se entra em `campo.html`

## Verificacao de Sucesso

Apos o deploy, a URL deve ser:
```
https://opidas.netlify.app/onboarding/habit-tracking.html?session_id=cs_test_...
```

E NAO:
```
https://opidas.netlify.app/public/onboarding/habit-tracking.html?session_id=cs_test_...
```

## Troubleshooting

### Problema: Ainda aparece erro de MIME type

**Causa:** O cache do navegador ou do Netlify pode estar servindo a versao antiga.

**Solucao:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Abra em aba anonima (Ctrl+Shift+N)
3. Forca um novo deploy no Netlify (Clear cache and deploy site)

### Problema: A URL ainda tem /public/

**Causa:** O GitHub ainda tem a versao antiga.

**Solucao:**
1. Verifique se fez o `git push`
2. Verifique no GitHub se o arquivo foi atualizado
3. Aguarde o deploy automatico do Netlify

### Problema: O Netlify nao esta fazendo deploy automatico

**Causa:** A integracao GitHub-Netlify pode estar desabilitada.

**Solucao:**
1. Acesse o dashboard do Netlify
2. Va em Site settings > Build & deploy > Continuous deployment
3. Verifique se "Auto publishing" esta habilitado
4. Se necessario, faca um deploy manual: Deploys > Trigger deploy > Deploy site

## Arquivos Corrigidos

- `public/js/services/stripe.js` - URL de redirecionamento corrigida
- `public/onboarding/habit-tracking.html` - Fluxo de dados corrigido
- `public/onboarding/identification.html` - Validacoes melhoradas
- `public/onboarding/investment.html` - Validacoes melhoradas
- `public/onboarding/welcome.html` - Limpeza de localStorage
- `netlify.toml` - Configuracao de redirecionamento corrigida
- `public/404.html` - Pagina de erro criada

## Proximos Passos

Apos o deploy bem-sucedido:

1. Teste o fluxo completo de onboarding
2. Verifique se os dados estao sendo salvos corretamente no Supabase
3. Teste o acesso ao campo apos o onboarding
4. Verifique se o webhook do Stripe esta funcionando

## Suporte

Se ainda houver problemas:

1. Verifique os logs do Netlify
2. Verifique os logs do Supabase Edge Functions
3. Verifique os logs do Stripe Dashboard
4. Abra o DevTools do navegador (F12) e verifique o Console

---

**Versao:** 3.0.0
**Data:** 22/11/2025
**Autor:** Manus AI
