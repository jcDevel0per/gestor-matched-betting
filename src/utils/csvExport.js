// CSV Export Utility
import { formatTime, formatCurrency } from './cycleHelpers';

export const generateDailyCSV = (cycles) => {
    let csvRows = [];
    const BOM = '\uFEFF';

    // Helper to escape CSV fields
    const escapeCsv = (str) => {
        if (str === null || str === undefined) return '';
        const stringValue = String(str);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    };

    cycles.forEach((cycle, index) => {
        // --- DATA PREPARATION ---
        const accounts = cycle.ativacao?.allAccounts || [];
        // If no merged accounts, fallback to creation accounts
        const cycleAccounts = accounts.length > 0
            ? accounts
            : (cycle.criacao?.accounts || []).map(acc => ({
                cycleName: cycle.cycleName,
                ...acc
            }));

        // Calculate Totals for this cycle
        const totalDepositosMae = cycleAccounts.reduce((sum, acc) => {
            // Find original account data in criacao/bonus to get deposits
            // This is tricky because merged accounts might come from other cycles.
            // For simplify, we will try to find the matching account in the original cycle or linked info.
            // However, strictly following the request image structure:
            const accData = findAccountData(cycle, acc);
            const deps = (parseFloat(accData.primeiroDepositoMae) || 0) +
                (parseFloat(accData.segundoDepositoMae) || 0) +
                (parseFloat(accData.terceiroDepositoMae) || 0);
            return sum + deps;
        }, 0);

        // --- HEADER SECTION ---
        csvRows.push([`PANORAMA GERAL ${cycle.cycleName.toUpperCase()}`]);
        csvRows.push([
            'DATA',
            'LOGIN CONTAS MÃE',
            'LOGIN CONTAS FILHA',
            'DEPÓSITO FILHA',
            'DEPÓSITOS MÃE',
            'LOGIN CONTA MISSÃO',
            'SAQUE CONTA MISSÃO',
            'SAQUES BÔNUS FILHA',
            'SAQUES BÔNUS MÃE',
            'SAQUES TOTAL',
            'DIFERENÇA',
            `LUCRO TOTAL ${cycle.cycleName.toUpperCase()}`
        ]);

        // --- DATA ROWS ---
        // We need to map each account row.
        // Some columns are repeated or calculated.

        cycleAccounts.forEach((acc, rowIndex) => {
            const accDetails = findAccountData(cycle, acc);

            // Financial calculations for this row
            const depositoFilha = parseFloat(accDetails.depositoFilha) || 0;
            const depositosMae = (parseFloat(accDetails.primeiroDepositoMae) || 0) +
                (parseFloat(accDetails.segundoDepositoMae) || 0) +
                (parseFloat(accDetails.terceiroDepositoMae) || 0);

            const saqueBonusFilha = parseFloat(accDetails.saqueBonusFilha) || 0;
            const saqueBonusMae = parseFloat(accDetails.saqueBonusMae) || 0;

            // Saque conta missão is only relevant if this is a merged account or simply use the cycle's activation data
            // In the image, 'LOGIN CONTA MISSÃO' seems to be the one chosen for merging?
            // Actually, usually multiple accounts merge into one 'Conta Missão'.
            // For the row context, we might leave it empty except for the first row?
            // Or if each row contributed? 
            // Based on user request image: "LOGIN CONTA MISSÃO" column seems populated. 
            // Let's assume the cycle's 'loginContaJuntar' is the mission account.

            const isFirstRow = rowIndex === 0;
            const loginContaMissao = isFirstRow ? (cycle.ativacao?.loginContaJuntar || '') : '';
            const saqueContaMissao = isFirstRow ? (parseFloat(cycle.ativacao?.saqueJuntar) || 0) : '';

            // Total Saques per row logic is ambiguous in the image given "Saque Conta Missão" is one column.
            // But usually Total Saques = Saque Filha + Saque Mãe.
            // If "Saque Conta Missão" is the consolidate withdrawal, maybe it shouldn't be summed per row?
            // Let's interpret "SAQUES TOTAL" as the sum of withdrawals belonging to this specific account line + pro-rated mission withdrawal?
            // OR simply Saque Bonus Filha + Saque Bonus Mae.
            // Let's stick to individual account withdrawals first.
            const saquesTotal = saqueBonusFilha + saqueBonusMae;

            // Diferenca = (Saques Total - Deposito Filha - Depositos Mae)
            const diferenca = saquesTotal - depositoFilha - depositosMae;

            // Lucro Total Ciclo is a single value for the whole block
            const lucroTotalCiclo = isFirstRow ? (cycle.ativacao?.totalCycleProfit || 0) : '';

            // Format date only on first row or repeat? Image suggests clean look. Let's put on first row.
            const dateStr = isFirstRow ? formatDate(cycle.date || cycle.createdAt) : '';

            const row = [
                dateStr, // Data
                accDetails.loginContaMae || '', // Login Mãe
                accDetails.loginContaFilha || '', // Login Filha
                formatMoneyCSV(depositoFilha), // Depósito Filha
                formatMoneyCSV(depositosMae), // Depósitos Mãe
                loginContaMissao, // Login Conta Missão
                isFirstRow && saqueContaMissao !== '' ? formatMoneyCSV(saqueContaMissao) : '', // Saque Conta Missão
                formatMoneyCSV(saqueBonusFilha), // Saque Bônus Filha
                formatMoneyCSV(saqueBonusMae), // Saque Bônus Mãe
                formatMoneyCSV(saquesTotal), // Saques Total (Row)
                formatMoneyCSV(diferenca), // Diferença
                isFirstRow && lucroTotalCiclo !== '' ? formatMoneyCSV(lucroTotalCiclo) : '' // Lucro Total Ciclo
            ];

            csvRows.push(row);
        });

        // --- TIMES SECTION (Below data) ---
        // Add an empty row before times for clarity? The image shows times right below or in a separate block.
        // Let's add the times summary.
        csvRows.push([
            'TEMPO CRIAÇÃO DE CONTAS',
            formatTimeCSV(cycle.criacao?.tempoTotal || 0)
        ]);
        csvRows.push([
            'TEMPO SAQUE DE BÔNUS',
            formatTimeCSV(cycle.bonus?.tempoTotal || 0)
        ]);
        csvRows.push([
            'TEMPO ATIVAÇÃO SMS',
            formatTimeCSV(cycle.ativacao?.tempoTotal || 0)
        ]);
        csvRows.push([
            'TEMPO TOTAL CICLO',
            formatTimeCSV(
                (cycle.criacao?.tempoTotal || 0) +
                (cycle.bonus?.tempoTotal || 0) +
                (cycle.ativacao?.tempoTotal || 0)
            )
        ]);

        // --- SPACING BETWEEN CYCLES ---
        // Add 2 empty rows as requested
        if (index < cycles.length - 1) { // Don't add after the last one
            csvRows.push([]);
            csvRows.push([]);
        }
    });

    // Generate CSV string
    const csvContent = csvRows.map(row =>
        row.map(escapeCsv).join(';') // Using semicolon for Excel compatibility in BR
    ).join('\n');

    downloadCSV(BOM + csvContent, `panorama_geral_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.csv`);
};

// Helper: Find detailed account info (including deposits/bonus from original creation/bonus stages)
const findAccountData = (cycle, accountRef) => {
    // If it's a merged account from another cycle, we ideally need that cycle's data.
    // However, properly hydrating deep linked data might be complex if not passed.
    // For now, check if the account exists in the current cycle's arrays.

    // Check main cycle arrays
    let found = (cycle.criacao?.accounts || []).find(a => a.loginContaFilha === accountRef.loginContaFilha);
    if (!found) {
        // Check merged updates
        found = (cycle.bonus?.accountUpdates || []).find(a => a.loginContaFilha === accountRef.loginContaFilha);
    }

    // If still not found, check linked cycles inside ativacao (if fully populated)
    if (!found && cycle.ativacao?.linkedCycles) {
        for (const linked of cycle.ativacao.linkedCycles) {
            const linkedAcc = (linked.criacao?.accounts || []).find(a => a.loginContaFilha === accountRef.loginContaFilha);
            if (linkedAcc) {
                // Try to attach bonus info from linked cycle too
                const linkedBonus = (linked.bonus?.accountUpdates || []).find(a => a.loginContaFilha === accountRef.loginContaFilha);
                return { ...linkedAcc, ...(linkedBonus || {}) };
            }
        }
    }

    return found || accountRef; // Return found or partial ref
};

const formatDate = (dateObj) => {
    if (!dateObj) return '';
    try {
        if (dateObj.toDate) return dateObj.toDate().toLocaleDateString('pt-BR');
        if (typeof dateObj === 'string') {
            const [y, m, d] = dateObj.split('-');
            return `${d}/${m}/${y}`;
        }
        return new Date(dateObj).toLocaleDateString('pt-BR');
    } catch { return ''; }
};

const formatMoneyCSV = (val) => {
    return (parseFloat(val) || 0).toFixed(2).replace('.', ',');
};

const formatTimeCSV = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    // const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}`; // Image shows H:M
};

// Download CSV file
export const downloadCSV = (csvContent, filename) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

