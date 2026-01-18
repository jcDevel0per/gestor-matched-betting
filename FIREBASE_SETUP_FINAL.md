# 🔐 Configuração Final do Firebase - Guia Completo

## ⚠️ IMPORTANTE: Configurações Necessárias no Firebase Console

Para que o sistema funcione corretamente, você precisa fazer as seguintes configurações no Firebase Console:

---

## 1. Ativar Firebase Authentication

### Passo 1: Acessar Authentication
1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: **sistemagestormatchedbetting**
3. No menu lateral, clique em **"Authentication"**

### Passo 2: Ativar Google como Provedor
1. Clique na aba **"Sign-in method"**
2. Clique em **"Google"**
3. Clique no botão **"Enable"** (Ativar)
4. Preencha:
   - **Nome do projeto**: Sistema Gestor Matched Betting
   - **E-mail de suporte**: seu e-mail
5. Clique em **"Save"** (Salvar)

### Passo 3: Adicionar Domínio Autorizado
1. Na mesma tela, vá em **"Authorized domains"** (Domínios autorizados)
2. Adicione: `localhost` (já deve estar lá)
3. Quando fizer deploy, adicione seu domínio de produção

---

## 2. Configurar Regras de Segurança do Firestore

### Passo 1: Acessar Firestore Database
1. No menu lateral do Firebase Console, clique em **"Firestore Database"**
2. Clique na aba **"Rules"** (Regras)

### Passo 2: Substituir as Regras
Cole as seguintes regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra para a coleção de usuários
    match /users/{userId} {
      // Usuário só pode ler/escrever seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Subcoleção de ciclos
      match /cycles/{cycleId} {
        // Usuário só pode ler/escrever seus próprios ciclos
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Passo 3: Publicar as Regras
1. Clique em **"Publish"** (Publicar)
2. Confirme a publicação

---

## 3. Estrutura de Dados no Firestore

Após configurar, a estrutura de dados será:

```
firestore
└── users (coleção)
    └── {userId} (documento - UID do Google)
        ├── email: string
        ├── displayName: string
        ├── photoURL: string
        ├── createdAt: timestamp
        └── cycles (subcoleção)
            └── {cycleId} (documento - auto-gerado)
                ├── cycleName: string
                ├── date: timestamp
                ├── startTime: timestamp
                ├── endTime: timestamp | null
                ├── totalBalance: number
                └── entries: array[
                    {
                      motherName: string,
                      daughterName: string,
                      deposit: number,
                      withdrawal: number,
                      difference: number
                    }
                  ]
```

---

## 4. Como Usar o Sistema

### Primeiro Acesso

1. **Acesse a aplicação**: `http://localhost:5173/`
2. Você será redirecionado para a página de **Login**
3. Clique em **"Entrar com Google"**
4. Selecione sua conta Google
5. Autorize o acesso
6. Você será redirecionado para o **Dashboard**

### Criar um Ciclo

1. No Dashboard, preencha:
   - Nome do ciclo
   - Dados das contas (Mãe, Filha, Depósito, Saque)
2. Clique em **"Iniciar Ciclo"** para começar o cronômetro
3. Clique em **"Salvar"** para salvar o progresso
4. Clique em **"Finalizar"** quando concluir

### Ver Histórico

1. Clique em **"Histórico"** no menu superior
2. Veja todos os seus ciclos salvos
3. Use os filtros para buscar ciclos específicos
4. Clique em **"Ver Detalhes"** para ver um ciclo completo
5. Clique no ícone de **Download** para exportar CSV
6. Clique no ícone de **Lixeira** para excluir

### Exportar para Google Sheets

1. No histórico ou detalhes, clique em **"Exportar CSV"**
2. O arquivo será baixado automaticamente
3. Abra o Google Sheets
4. Arraste o arquivo CSV para a janela
5. Pronto! Seus dados estarão organizados

---

## 5. Segurança

### O que as regras garantem:

✅ **Autenticação obrigatória**: Apenas usuários logados podem acessar dados
✅ **Isolamento de dados**: Cada usuário vê apenas seus próprios ciclos
✅ **Proteção contra acesso não autorizado**: Impossível acessar dados de outros usuários
✅ **Validação no servidor**: Firebase valida todas as operações

### Dados Protegidos:

- ✅ Ciclos são vinculados ao UID do usuário
- ✅ Não é possível listar usuários
- ✅ Não é possível acessar ciclos de outros usuários
- ✅ Todas as operações requerem autenticação

---

## 6. Solução de Problemas

### Erro: "Permission denied"
**Causa**: Regras de segurança não configuradas
**Solução**: Configure as regras conforme o Passo 2

### Erro: "Auth domain not authorized"
**Causa**: Domínio não autorizado
**Solução**: Adicione `localhost` nos domínios autorizados

### Login não funciona
**Causa**: Google Auth não ativado
**Solução**: Ative o provedor Google conforme o Passo 1

### Dados não aparecem
**Causa**: Usuário não autenticado ou regras incorretas
**Solução**: 
1. Verifique se está logado (foto no canto superior direito)
2. Verifique as regras do Firestore

---

## 7. Próximos Passos (Opcional)

### Para Deploy em Produção:

1. **Firebase Hosting**:
   ```bash
   npm run build
   firebase deploy
   ```

2. **Adicionar domínio personalizado**:
   - No Firebase Console → Hosting
   - Adicionar domínio customizado

3. **Atualizar domínios autorizados**:
   - Authentication → Settings → Authorized domains
   - Adicionar seu domínio de produção

---

## ✅ Checklist de Configuração

- [ ] Firebase Authentication ativado
- [ ] Provedor Google configurado
- [ ] Regras de segurança do Firestore publicadas
- [ ] Testado login com Google
- [ ] Testado criação de ciclo
- [ ] Testado visualização de histórico
- [ ] Testado exportação CSV

---

**Pronto!** Seu sistema está completamente configurado e seguro! 🎉
