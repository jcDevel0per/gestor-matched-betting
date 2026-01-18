# 🚨 AÇÃO NECESSÁRIA: Ativar Firebase Authentication

## O Problema
O login com Google não está funcionando porque o **Firebase Authentication ainda não foi ativado** no Firebase Console.

## Solução Rápida (5 minutos)

### Passo 1: Acessar Firebase Console
1. Abra: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Faça login com sua conta Google
3. Selecione o projeto: **sistemagestormatchedbetting**

### Passo 2: Ativar Authentication
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique no botão **"Get Started"** (Começar) se aparecer
3. Clique na aba **"Sign-in method"** (Método de login)

### Passo 3: Ativar Google
1. Na lista de provedores, encontre **"Google"**
2. Clique em **"Google"**
3. Ative o botão de **"Enable"** (Ativar)
4. Preencha:
   - **Nome público do projeto**: Sistema Gestor Matched Betting
   - **E-mail de suporte do projeto**: seu e-mail (ex: seuemail@gmail.com)
5. Clique em **"Save"** (Salvar)

### Passo 4: Testar
1. Volte para a aplicação: `http://localhost:5173/`
2. Atualize a página (F5)
3. Clique em **"Entrar com Google"**
4. Deve abrir o popup de login do Google
5. Selecione sua conta
6. Pronto! Você será redirecionado para o Dashboard

## Se Ainda Não Funcionar

### Verificar Domínios Autorizados
1. No Firebase Console → Authentication
2. Vá em **"Settings"** (Configurações) → **"Authorized domains"**
3. Certifique-se de que `localhost` está na lista
4. Se não estiver, clique em **"Add domain"** e adicione `localhost`

### Limpar Cache do Navegador
1. Pressione `Ctrl + Shift + Delete`
2. Selecione "Cookies e dados de sites"
3. Clique em "Limpar dados"
4. Recarregue a página

## Mensagens de Erro Comuns

### "auth/configuration-not-found"
**Causa**: Authentication não foi ativado
**Solução**: Siga os passos acima

### "auth/unauthorized-domain"
**Causa**: localhost não está nos domínios autorizados
**Solução**: Adicione localhost nos domínios autorizados

### "auth/popup-blocked"
**Causa**: Navegador bloqueou o popup
**Solução**: Permita popups para localhost

---

## ✅ Checklist Rápido

- [ ] Acessei Firebase Console
- [ ] Selecionei o projeto correto
- [ ] Ativei Authentication
- [ ] Ativei o provedor Google
- [ ] Adicionei e-mail de suporte
- [ ] Salvei as configurações
- [ ] Testei o login

---

**Após ativar, o login funcionará perfeitamente!** 🎉

**Tempo estimado**: 3-5 minutos
