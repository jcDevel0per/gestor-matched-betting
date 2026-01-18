# 📊 Como Exportar para Google Sheets

## Passo a Passo

### 1. Preencher os Dados do Ciclo

1. Digite o nome do ciclo (ex: "Ciclo Manhã 15/01")
2. Clique em "Iniciar Ciclo" para começar o cronômetro
3. Preencha as contas (Mãe, Filha, Depósito, Saque)
4. Adicione quantas linhas precisar

### 2. Exportar para CSV

1. Clique no botão **"Exportar CSV"** (botão verde com ícone de download)
2. O arquivo CSV será baixado automaticamente
3. Nome do arquivo: `[Nome_do_Ciclo]_[Data_Hora].csv`

### 3. Importar no Google Sheets

#### Opção A: Arrastar e Soltar
1. Vá para [Google Sheets](https://sheets.google.com/)
2. Arraste o arquivo CSV baixado para a janela do Google Sheets
3. O Google Sheets criará automaticamente uma nova planilha

#### Opção B: Importar Manualmente
1. Abra o Google Sheets
2. Clique em **Arquivo** → **Importar**
3. Clique em **Upload** e selecione o arquivo CSV
4. Configurações recomendadas:
   - Tipo de separador: **Vírgula**
   - Converter texto em números e datas: **Sim**
5. Clique em **Importar dados**

## 📋 Estrutura do CSV Exportado

O arquivo CSV contém:

### Metadados (Topo)
- Nome do Ciclo
- Data da exportação
- Hora de Início
- Hora de Fim (ou "Em andamento")
- Duração total (HH:MM:SS)

### Tabela de Dados
| Conta Mãe | Conta Filha | Depósito (R$) | Saque (R$) | Diferença (R$) |
|-----------|-------------|---------------|------------|----------------|
| Conta A   | Conta A1    | 100.00        | 120.00     | 20.00          |
| ...       | ...         | ...           | ...        | ...            |
| **TOTAL** |             | **300.00**    | **350.00** | **50.00**      |

## 💡 Dicas

1. **Exporte regularmente**: Faça backup dos seus dados exportando periodicamente
2. **Organize por data**: Crie uma pasta no Google Drive para organizar os CSVs por mês
3. **Consolidação**: Você pode importar múltiplos CSVs para a mesma planilha em abas diferentes
4. **Análise**: Use fórmulas do Google Sheets para análises avançadas dos dados

## 🎨 Formatação Automática no Google Sheets

Após importar, você pode:

1. **Aplicar cores**:
   - Verde para diferenças positivas
   - Vermelho para diferenças negativas

2. **Criar gráficos**:
   - Gráfico de barras para comparar depósitos vs saques
   - Gráfico de pizza para distribuição de diferenças

3. **Fórmulas úteis**:
   ```
   =SUM(C:C)  // Soma total de depósitos
   =AVERAGE(E:E)  // Média das diferenças
   =COUNTIF(E:E,">0")  // Contar diferenças positivas
   ```

## ⚠️ Observações

- O arquivo CSV usa codificação UTF-8 com BOM para compatibilidade com Excel e Google Sheets
- Valores monetários são formatados com 2 casas decimais
- Campos com vírgulas são automaticamente escapados com aspas

---

**Pronto!** Agora você pode exportar seus ciclos e analisá-los no Google Sheets! 🚀
