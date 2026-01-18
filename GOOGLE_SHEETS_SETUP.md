# 🔧 Configuração do Google Sheets API - Guia Passo a Passo

## Passo 1: Criar Projeto no Google Cloud Console

1. **Acesse o Google Cloud Console:**
   - Vá para: [https://console.cloud.google.com/](https://console.cloud.google.com/)
   - Faça login com sua conta Google

2. **Criar Novo Projeto:**
   - Clique no seletor de projetos (topo da página)
   - Clique em **"Novo Projeto"**
   - Nome do projeto: `Sistema Gestor Matched Betting`
   - Clique em **"Criar"**

## Passo 2: Ativar Google Sheets API

1. **Navegue até APIs & Services:**
   - No menu lateral, vá em **"APIs e serviços"** → **"Biblioteca"**

2. **Buscar e Ativar:**
   - Busque por: `Google Sheets API`
   - Clique no resultado
   - Clique em **"Ativar"**

## Passo 3: Criar Credenciais OAuth 2.0

1. **Ir para Credenciais:**
   - No menu lateral, clique em **"Credenciais"**

2. **Configurar Tela de Consentimento:**
   - Clique em **"Configurar tela de consentimento"**
   - Escolha **"Externo"** → Clique em **"Criar"**
   - Preencha:
     - Nome do app: `Sistema Gestor Matched Betting`
     - E-mail de suporte: seu e-mail
     - E-mail do desenvolvedor: seu e-mail
   - Clique em **"Salvar e continuar"**
   - Em **"Escopos"**, clique em **"Adicionar ou remover escopos"**
   - Busque e adicione: `https://www.googleapis.com/auth/spreadsheets`
   - Clique em **"Salvar e continuar"**
   - Em **"Usuários de teste"**, adicione seu e-mail
   - Clique em **"Salvar e continuar"**

3. **Criar ID do Cliente OAuth:**
   - Volte para **"Credenciais"**
   - Clique em **"+ Criar credenciais"** → **"ID do cliente OAuth"**
   - Tipo de aplicativo: **"Aplicativo da Web"**
   - Nome: `Sistema Gestor Web Client`
   - **Origens JavaScript autorizadas:**
     - Adicione: `http://localhost:5173`
   - **URIs de redirecionamento autorizados:**
     - Adicione: `http://localhost:5173`
   - Clique em **"Criar"**

4. **Copiar Credenciais:**
   - Uma janela aparecerá com:
     - **ID do cliente** (ex: `123456789-abc.apps.googleusercontent.com`)
     - **Chave secreta do cliente**
   - **COPIE O ID DO CLIENTE** (você vai precisar dele!)

## Passo 4: Criar uma Planilha Google Sheets

1. **Criar Nova Planilha:**
   - Vá para: [https://sheets.google.com/](https://sheets.google.com/)
   - Clique em **"+ Em branco"**
   - Nomeie a planilha: `Ciclos Matched Betting`

2. **Copiar ID da Planilha:**
   - Na URL da planilha, copie o ID:
   - URL: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - **COPIE O SPREADSHEET_ID** (você vai precisar dele!)

## Passo 5: Configurar a Aplicação

Após obter as credenciais, você precisará fornecer:

1. **Client ID** (do Passo 3.4)
2. **Spreadsheet ID** (do Passo 4.2)

**Exemplo:**
```
Client ID: 123456789-abcdefghijk.apps.googleusercontent.com
Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

## ⚠️ Importante

- Mantenha o **Client ID** seguro
- A planilha precisa estar acessível pela conta que você usou
- Durante o desenvolvimento, você verá um aviso "App não verificado" - clique em "Avançado" → "Ir para [nome do app]"

## 📝 Próximos Passos

Após completar esta configuração, me forneça:
1. ✅ Client ID
2. ✅ Spreadsheet ID

E eu implementarei o código para exportar os dados automaticamente!

---

**Dúvidas?** Me avise em qual passo você está e posso ajudar!
