# Sistema de Gestão de Ciclos de Contas - Guia Completo

## 📋 Visão Geral

Aplicação web completa para gerenciar ciclos de criação de contas com controle financeiro em tempo real, desenvolvida com React, Vite, Tailwind CSS e Firebase.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js instalado (versão 16 ou superior)
- Navegador web moderno

### Instalação e Execução

1. **Navegue até a pasta do projeto:**
   ```bash
   cd "c:\Users\Pc\Desktop\CPA AUTOBOT\SistemaGestorMatchedBetting"
   ```

2. **Instale as dependências (se ainda não instalou):**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. **Acesse a aplicação:**
   - Abra seu navegador em: `http://localhost:5173/`

## 📖 Como Usar a Aplicação

### 1. Iniciando um Novo Ciclo

1. **Digite o nome do ciclo** no campo "Nome do Ciclo" (ex: "Ciclo Manhã 15/01")
2. **Clique em "Iniciar Ciclo"** para começar o cronômetro
3. O timer começará a contar automaticamente

### 2. Gerenciando Contas

#### Adicionar Contas:
- Clique no botão **"Adicionar Nova Linha"** para criar novos pares de contas
- Preencha os campos:
  - **Conta Mãe**: Nome da conta principal
  - **Conta Filha**: Nome da conta secundária
  - **Depósito**: Valor depositado (em R$)
  - **Saque**: Valor sacado (em R$)

#### Cálculos Automáticos:
- A coluna **"Diferença"** é calculada automaticamente: `Saque - Depósito`
- **Verde**: Diferença positiva (lucro)
- **Vermelho**: Diferença negativa (prejuízo)
- **Cinza**: Diferença zero

#### Remover Linhas:
- Clique no ícone de **lixeira** (🗑️) para excluir uma linha
- Sempre haverá pelo menos uma linha na tabela

### 3. Totais Automáticos

O rodapé da tabela mostra:
- **Total de Depósitos**: Soma de todos os depósitos
- **Total de Saques**: Soma de todos os saques
- **Total de Diferenças**: Soma de todas as diferenças (com código de cores)

### 4. Salvando e Finalizando

#### Salvar Progresso:
- Clique em **"Salvar"** para salvar o estado atual no Firebase
- Útil para salvar rascunhos ou progresso parcial
- Pode ser salvo múltiplas vezes

#### Finalizar Ciclo:
- Clique em **"Finalizar"** quando o ciclo estiver completo
- Isso irá:
  - Parar o cronômetro
  - Registrar o horário de término
  - Salvar todos os dados no Firebase
  - Resetar a aplicação para um novo ciclo

#### Parar Cronômetro:
- Clique em **"Parar"** para pausar o timer sem finalizar o ciclo

## 🔥 Estrutura do Firebase

### Coleção: `cycles`

Cada documento contém:

```javascript
{
  id: "auto-gerado",
  cycleName: "Ciclo Manhã 15/01",
  date: Timestamp,
  startTime: Timestamp,
  endTime: Timestamp,
  totalBalance: 150.50,
  entries: [
    {
      motherName: "Conta A",
      daughterName: "Conta A1",
      deposit: 100.00,
      withdrawal: 120.00,
      difference: 20.00
    },
    // ... mais entradas
  ]
}
```

## 📁 Estrutura de Arquivos

```
SistemaGestorMatchedBetting/
├── src/
│   ├── components/
│   │   ├── CycleHeader.jsx      # Cabeçalho com timer e controles
│   │   ├── AccountsTable.jsx    # Tabela principal
│   │   ├── TableRow.jsx         # Linha individual da tabela
│   │   └── TableFooter.jsx      # Rodapé com totais
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Entry point
│   ├── index.css                # Estilos globais
│   └── firebaseConfig.js        # Configuração do Firebase
├── tailwind.config.js           # Config do Tailwind
├── postcss.config.js            # Config do PostCSS
├── vite.config.js               # Config do Vite
└── package.json                 # Dependências
```

## ✨ Funcionalidades Implementadas

✅ **Cronômetro de Processo**
- Iniciar/Parar ciclo
- Exibição em tempo real (HH:MM:SS)
- Registro de timestamps no Firebase

✅ **Gestão Dinâmica de Contas**
- Adicionar/Remover linhas
- Inputs para nomes e valores
- Validação de dados

✅ **Cálculos Automáticos**
- Diferença calculada em tempo real
- Totais atualizados automaticamente
- Código de cores (verde/vermelho)

✅ **Integração Firebase**
- Salvar progresso
- Finalizar e persistir ciclos
- Atualização de registros existentes

✅ **Interface Profissional**
- Design moderno com Tailwind CSS
- Gradiente premium (roxo/índigo)
- Responsivo e intuitivo
- Notificações de feedback

## 🎨 Tecnologias Utilizadas

- **React 18** - Framework JavaScript
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilização
- **Firebase v9** - Backend e Database (Firestore)
- **Lucide React** - Biblioteca de ícones
- **JavaScript ES6+** - Linguagem de programação

## 🔧 Comandos Úteis

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

## 📊 Visualizando Dados no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto: **sistemagestormatchedbetting**
3. Vá em **Firestore Database**
4. Navegue até a coleção **cycles**
5. Visualize todos os ciclos salvos

## 🎯 Dicas de Uso

1. **Sempre nomeie seus ciclos** antes de iniciar para facilitar identificação
2. **Salve frequentemente** para não perder dados em caso de problemas
3. **Use valores decimais** com ponto (ex: 100.50, não 100,50)
4. **Verifique os totais** antes de finalizar o ciclo
5. **O timer continua** mesmo se você fechar a aba (mas os dados não são salvos automaticamente)

## 🐛 Solução de Problemas

### Erro ao salvar no Firebase:
- Verifique sua conexão com a internet
- Confira o console do navegador (F12) para erros detalhados
- Certifique-se de que o Firebase está configurado corretamente

### Cálculos não atualizando:
- Certifique-se de digitar apenas números nos campos de valor
- Use ponto (.) como separador decimal

### Aplicação não carrega:
- Verifique se o servidor está rodando (`npm run dev`)
- Limpe o cache do navegador
- Reinstale as dependências (`npm install`)

## 📝 Notas Importantes

- Os dados são salvos apenas quando você clica em "Salvar" ou "Finalizar"
- Após finalizar, a aplicação reseta automaticamente para um novo ciclo
- Todos os timestamps são salvos no formato UTC do Firebase
- A aplicação suporta de 1 a quantas linhas você precisar (sem limite)

---

**Desenvolvido com ❤️ usando React + Firebase**
