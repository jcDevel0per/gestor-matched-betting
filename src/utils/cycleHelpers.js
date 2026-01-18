// Helper functions for cycle management

/**
 * Format currency value to Brazilian Real
 */
export const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(num);
};

/**
 * Format time in seconds to HH:MM:SS
 */
export const formatTime = (seconds) => {
    if (!seconds) return '00:00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate difference for Criacao stage
 */
export const calculateCriacaoDiferenca = (depositoFilha, bonusMae, bonusFilha, saqueFilha) => {
    const deposito = parseFloat(depositoFilha) || 0;
    const bMae = parseFloat(bonusMae) || 0;
    const bFilha = parseFloat(bonusFilha) || 0;
    const saque = parseFloat(saqueFilha) || 0;

    return (bMae + bFilha + saque) - deposito;
};

/**
 * Calculate total saque e bonus for Bonus stage
 */
export const calculateBonusTotalSaqueBonus = (saqueFilha, saqueMae, bonusFilha, bonusMae) => {
    const sF = parseFloat(saqueFilha) || 0;
    const sM = parseFloat(saqueMae) || 0;
    const bF = parseFloat(bonusFilha) || 0;
    const bM = parseFloat(bonusMae) || 0;

    return sF + sM + bF + bM;
};

/**
 * Calculate total time across all stages
 */
export const calculateTotalTime = (cycle) => {
    let total = 0;
    if (cycle.criacao?.tempoTotal) total += cycle.criacao.tempoTotal;
    if (cycle.bonus?.tempoTotal) total += cycle.bonus.tempoTotal;
    if (cycle.ativacao?.tempoTotal) total += cycle.ativacao.tempoTotal;
    return total;
};

/**
 * Validate required fields for Criacao stage
 */
export const validateCriacaoStage = (data) => {
    const errors = [];

    if (!data.loginContaMae?.trim()) errors.push('Login Conta Mãe é obrigatório');
    if (!data.loginContaFilha?.trim()) errors.push('Login Conta Filha é obrigatório');
    if (!data.depositoFilha || parseFloat(data.depositoFilha) <= 0) {
        errors.push('Depósito Filha deve ser maior que zero');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate required fields for Bonus stage
 */
export const validateBonusStage = (data) => {
    const errors = [];

    if (!data.primeiroDepositoMae || parseFloat(data.primeiroDepositoMae) <= 0) {
        errors.push('1º Depósito Mãe é obrigatório');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Validate required fields for Ativacao stage
 */
export const validateAtivacaoStage = (data) => {
    const errors = [];

    if (!data.loginContaBetao?.trim()) errors.push('Login Conta Betão é obrigatório');

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Prepare cycle data for stage transition
 */
export const prepareStageTransition = (currentStage, cycleData) => {
    const transitions = {
        'criacao': 'bonus',
        'bonus': 'ativacao',
        'ativacao': 'finalizado'
    };

    return {
        ...cycleData,
        stage: transitions[currentStage] || currentStage
    };
};

/**
 * Calculate final balance for completed cycle
 */
export const calculateFinalBalance = (cycle) => {
    let total = 0;

    // From Criacao
    if (cycle.criacao) {
        total += calculateCriacaoDiferenca(
            cycle.criacao.depositoFilha,
            cycle.criacao.bonusMae,
            cycle.criacao.bonusFilha,
            cycle.criacao.saqueFilha
        );
    }

    // From Bonus
    if (cycle.bonus) {
        const depositos = (parseFloat(cycle.bonus.primeiroDepositoMae) || 0) +
            (parseFloat(cycle.bonus.primeiroDepositoFilha) || 0) +
            (parseFloat(cycle.bonus.segundoDepositoMae) || 0);
        const saques = calculateBonusTotalSaqueBonus(
            cycle.bonus.saqueFilha,
            cycle.bonus.saqueMae,
            cycle.bonus.bonusFilha,
            cycle.bonus.bonusMae
        );
        total += saques - depositos;
    }

    // From Ativacao
    if (cycle.ativacao) {
        total += (parseFloat(cycle.ativacao.saqueFilha) || 0) +
            (parseFloat(cycle.ativacao.saqueBetao) || 0);
    }

    return total;
};

/**
 * Get time spent in current stage
 */
export const getStageTime = (cycle) => {
    switch (cycle.stage) {
        case 'criacao':
            return cycle.criacao?.tempoTotal || 0;
        case 'bonus':
            return cycle.bonus?.tempoTotal || 0;
        case 'ativacao':
            return cycle.ativacao?.tempoTotal || 0;
        default:
            return 0;
    }
};

/**
 * Calculate cumulative time up to current stage
 */
export const getCumulativeTime = (cycle) => {
    let total = 0;

    if (cycle.criacao?.tempoTotal) {
        total += cycle.criacao.tempoTotal;
    }

    if (cycle.stage === 'criacao') {
        return total;
    }

    if (cycle.bonus?.tempoTotal) {
        total += cycle.bonus.tempoTotal;
    }

    if (cycle.stage === 'bonus') {
        return total;
    }

    if (cycle.ativacao?.tempoTotal) {
        total += cycle.ativacao.tempoTotal;
    }

    return total;
};

/**
 * Get account breakdown for activation stage
 * Returns string like "12 contas: 6 CICLO 01, 6 CICLO 02"
 */
export const getAccountBreakdown = (cycle) => {
    if (cycle.stage !== 'ativacao') {
        const accountCount = cycle.criacao?.accounts?.length || 0;
        return `${accountCount} contas`;
    }

    const linkedCycles = cycle.ativacao?.linkedCycles || [];
    const mainAccountCount = cycle.criacao?.accounts?.length || 0;

    if (linkedCycles.length === 0) {
        return `${mainAccountCount} contas`;
    }

    let total = mainAccountCount;
    const breakdown = [`${mainAccountCount} ${cycle.cycleName}`];

    linkedCycles.forEach(linked => {
        const count = linked.criacao?.accounts?.length || 0;
        total += count;
        breakdown.push(`${count} ${linked.cycleName}`);
    });

    return `${total} contas: ${breakdown.join(', ')}`;
};

