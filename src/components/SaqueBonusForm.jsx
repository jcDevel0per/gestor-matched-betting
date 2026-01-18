import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, Check, TrendingDown, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/cycleHelpers';
import { useToast } from '../contexts/ToastContext';

const SaqueBonusForm = ({ cycle, onSave, onAdvanceStage, onBack }) => {
    const { showWarning } = useToast();
    // Get accounts from previous stage (only those with bonus values)
    const previousAccounts = (cycle?.criacao?.accounts || []).filter(acc =>
        (parseFloat(acc.bonusMae) > 0 || parseFloat(acc.bonusFilha) > 0)
    );

    // Check if there are any accounts with bonusMae or bonusFilha
    const hasAnyBonusMae = previousAccounts.some(acc => parseFloat(acc.bonusMae) > 0);
    const hasAnyBonusFilha = previousAccounts.some(acc => parseFloat(acc.bonusFilha) > 0);

    // Initialize bonus updates for each account
    const [accountUpdates, setAccountUpdates] = useState(
        cycle?.bonus?.accountUpdates || previousAccounts.map(acc => ({
            accountIndex: previousAccounts.indexOf(acc),
            loginContaMae: acc.loginContaMae,
            loginContaFilha: acc.loginContaFilha,
            bonusMaeOriginal: acc.bonusMae,
            bonusFilhaOriginal: acc.bonusFilha,
            primeiroDepositoMae: '',
            segundoDepositoMae: '',
            terceiroDepositoMae: '',
            saqueBonusMae: '',
            saqueBonusFilha: '',
            updated: false
        }))
    );

    const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(cycle?.bonus?.tempoTotal || 0);

    // Timer effect
    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    // Auto-save effect with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            // Only save if there are updates
            if (accountUpdates.length > 0) {
                handleSave();
            }
        }, 1000); // Auto-save after 1 second of inactivity

        return () => clearTimeout(timer);
    }, [accountUpdates]);

    const currentAccount = accountUpdates[selectedAccountIndex] || {};
    const hasBonusMae = parseFloat(currentAccount.bonusMaeOriginal) > 0;
    const hasBonusFilha = parseFloat(currentAccount.bonusFilhaOriginal) > 0;

    const handleFieldChange = (field, value) => {
        const updated = [...accountUpdates];
        updated[selectedAccountIndex] = {
            ...updated[selectedAccountIndex],
            [field]: value,
            updated: true
        };
        setAccountUpdates(updated);
    };

    const calculateLossPercentage = (account) => {
        const bonusOriginal = parseFloat(account.bonusMaeOriginal) || 0;
        const saqueBonus = parseFloat(account.saqueBonusMae) || 0;

        if (bonusOriginal === 0) return 0;

        const loss = bonusOriginal - saqueBonus;
        return (loss / bonusOriginal) * 100;
    };

    const calculateAccountTotal = (account) => {
        const depositos = (parseFloat(account.primeiroDepositoMae) || 0) +
            (parseFloat(account.segundoDepositoMae) || 0) +
            (parseFloat(account.terceiroDepositoMae) || 0);
        const saques = (parseFloat(account.saqueBonusMae) || 0) +
            (parseFloat(account.saqueBonusFilha) || 0);
        return saques - depositos;
    };

    const calculateGrandTotal = () => {
        return accountUpdates.reduce((sum, account) => {
            return sum + calculateAccountTotal(account);
        }, 0);
    };

    const getValueColor = (value) => {
        const num = parseFloat(value) || 0;
        return num < 0 ? 'text-red-600' : 'text-green-600';
    };

    const handleSave = () => {
        const updatedCycle = {
            ...cycle,
            bonus: {
                accountUpdates: accountUpdates,
                tempoTotal: elapsedTime,
                totalSaqueBonus: calculateGrandTotal()
            }
        };
        onSave(updatedCycle);
    };

    const handleAdvance = () => {
        // Check if at least one account was updated
        const hasUpdates = accountUpdates.some(acc => acc.updated);
        if (!hasUpdates) {
            showWarning('ATUALIZE PELO MENOS UMA CONTA ANTES DE AVANÇAR!');
            return;
        }

        const updatedCycle = {
            ...cycle,
            bonus: {
                accountUpdates: accountUpdates,
                tempoTotal: elapsedTime,
                totalSaqueBonus: calculateGrandTotal()
            }
        };
        onAdvanceStage(updatedCycle);
    };

    if (previousAccounts.length === 0) {
        return (
            <div className="space-y-6">
                <div className="card-brutalist bg-orange-50 border-orange-600 p-6 text-center">
                    <p className="text-sm font-mono font-bold uppercase mb-2">
                        NENHUMA CONTA COM BÔNUS CADASTRADO NA ETAPA ANTERIOR
                    </p>
                    <p className="text-xs font-mono mt-2 mb-6">
                        Volte para a etapa de Criação de Contas e preencha os valores de bônus.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-center">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="btn-brutalist-secondary flex items-center gap-2"
                            >
                                <ArrowLeft size={18} />
                                <span>VOLTAR PARA EDITAR</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                if (confirm('Deseja prosseguir sem dados de bônus? A etapa será pulada.')) {
                                    const updatedCycle = {
                                        ...cycle,
                                        bonus: {
                                            accountUpdates: [],
                                            tempoTotal: 0,
                                            totalSaqueBonus: 0,
                                            skipped: true
                                        }
                                    };
                                    onAdvanceStage(updatedCycle);
                                }
                            }}
                            className="btn-brutalist-success flex items-center gap-2"
                        >
                            <span>PROSSEGUIR MESMO ASSIM</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const lossPercentage = calculateLossPercentage(currentAccount);

    return (
        <div className="space-y-6">
            {/* Timer Section */}
            <div className="card-brutalist bg-neutral-50">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono uppercase text-neutral-600 mb-1">
                            TEMPO DE DURAÇÃO
                        </p>
                        <p className="text-3xl font-mono font-black">
                            {formatTime(elapsedTime)}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        className={`${isTimerRunning ? 'btn-brutalist-danger' : 'btn-brutalist-success'} flex items-center gap-2`}
                    >
                        {isTimerRunning ? <Pause size={18} /> : <Play size={18} />}
                        <span>{isTimerRunning ? 'PAUSAR' : 'INICIAR'}</span>
                    </button>
                </div>
            </div>

            {/* Account Selector */}
            <div className="card-brutalist bg-blue-50 border-blue-600">
                <p className="text-xs font-mono font-bold uppercase mb-3">
                    SELECIONE O PAR DE CONTAS PARA ATUALIZAR ({accountUpdates.length} PARES COM BÔNUS)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {accountUpdates.map((account, index) => (
                        <button
                            key={index}
                            onClick={() => setSelectedAccountIndex(index)}
                            className={`p-3 border-4 border-black text-left transition-all ${selectedAccountIndex === index
                                ? 'bg-orange-300 shadow-brutalist'
                                : 'bg-white hover:bg-orange-50'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-mono font-black uppercase">
                                    PAR {index + 1}
                                </span>
                                {account.updated && (
                                    <Check size={16} className="text-green-600" />
                                )}
                            </div>
                            <div className="text-xs font-mono space-y-1">
                                <p>MÃE: <span className="font-bold">{account.loginContaMae}</span></p>
                                <p>FILHA: <span className="font-bold">{account.loginContaFilha}</span></p>
                                {parseFloat(account.bonusMaeOriginal) > 0 && (
                                    <p className="text-blue-600">
                                        BÔNUS MÃE: <span className="font-bold">{formatCurrency(account.bonusMaeOriginal)}</span>
                                    </p>
                                )}
                                {parseFloat(account.bonusFilhaOriginal) > 0 && (
                                    <p className="text-blue-600">
                                        BÔNUS FILHA: <span className="font-bold">{formatCurrency(account.bonusFilhaOriginal)}</span>
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Account Form */}
            <div className="card-brutalist bg-white">
                <h3 className="text-lg font-mono font-black uppercase mb-4 border-b-4 border-black pb-3">
                    ATUALIZANDO PAR {selectedAccountIndex + 1}
                </h3>

                {/* Account Info */}
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-neutral-50 border-2 border-black">
                    <div>
                        <p className="text-xs font-mono text-neutral-600">LOGIN MÃE</p>
                        <p className="text-sm font-mono font-bold">{currentAccount.loginContaMae}</p>
                    </div>
                    <div>
                        <p className="text-xs font-mono text-neutral-600">LOGIN FILHA</p>
                        <p className="text-sm font-mono font-bold">{currentAccount.loginContaFilha}</p>
                    </div>
                    {hasBonusMae && (
                        <div>
                            <p className="text-xs font-mono text-neutral-600">BÔNUS MÃE (ETAPA ANTERIOR)</p>
                            <p className="text-sm font-mono font-bold text-blue-600">
                                {formatCurrency(currentAccount.bonusMaeOriginal)}
                            </p>
                        </div>
                    )}
                    {hasBonusFilha && (
                        <div>
                            <p className="text-xs font-mono text-neutral-600">BÔNUS FILHA (ETAPA ANTERIOR)</p>
                            <p className="text-sm font-mono font-bold text-blue-600">
                                {formatCurrency(currentAccount.bonusFilhaOriginal)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Deposit Fields - Only show if bonusMae > 0 */}
                {hasBonusMae && (
                    <div className="mb-6">
                        <p className="text-sm font-mono font-bold uppercase mb-3 text-orange-600">
                            DEPÓSITOS CONTA MÃE
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase mb-2">
                                    1º DEPÓSITO MÃE (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentAccount.primeiroDepositoMae || ''}
                                    onChange={(e) => handleFieldChange('primeiroDepositoMae', e.target.value)}
                                    className="input-brutalist w-full"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase mb-2">
                                    2º DEPÓSITO MÃE (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentAccount.segundoDepositoMae || ''}
                                    onChange={(e) => handleFieldChange('segundoDepositoMae', e.target.value)}
                                    className="input-brutalist w-full"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase mb-2">
                                    3º DEPÓSITO MÃE (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentAccount.terceiroDepositoMae || ''}
                                    onChange={(e) => handleFieldChange('terceiroDepositoMae', e.target.value)}
                                    className="input-brutalist w-full"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Saque Bonus Fields */}
                <div className="mb-6">
                    <p className="text-sm font-mono font-bold uppercase mb-3 text-green-600">
                        SAQUES DE BÔNUS
                    </p>
                    <div className="space-y-4">
                        {hasBonusMae && (
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase mb-2">
                                    SAQUE BÔNUS MÃE (R$)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={currentAccount.saqueBonusMae || ''}
                                    onChange={(e) => handleFieldChange('saqueBonusMae', e.target.value)}
                                    className="input-brutalist w-full"
                                    placeholder="0.00"
                                />
                                {/* Loss Percentage */}
                                {parseFloat(currentAccount.saqueBonusMae) > 0 && lossPercentage > 0 && (
                                    <div className="mt-2 p-2 bg-red-50 border-2 border-red-600 flex items-center gap-2">
                                        <TrendingDown size={16} className="text-red-600" />
                                        <p className="text-xs font-mono font-bold text-red-600">
                                            PERDA DE BANCA: {lossPercentage.toFixed(2)}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {hasBonusFilha && (
                            <div>
                                <label className="block text-xs font-mono font-bold uppercase mb-2">
                                    SAQUE BÔNUS FILHA (R$)
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={currentAccount.saqueBonusFilha || ''}
                                        onChange={(e) => handleFieldChange('saqueBonusFilha', e.target.value)}
                                        className="input-brutalist flex-1"
                                        placeholder="0.00"
                                    />
                                    <button
                                        onClick={() => handleFieldChange('saqueBonusFilha', currentAccount.bonusFilhaOriginal)}
                                        className="btn-brutalist-success whitespace-nowrap px-4 py-2"
                                        title="Preencher com valor integral do bônus"
                                    >
                                        SAQUE ACEITO
                                    </button>
                                    <button
                                        onClick={() => handleFieldChange('saqueBonusFilha', '0')}
                                        className="btn-brutalist-danger whitespace-nowrap px-4 py-2"
                                        title="Zerar valor (saque cancelado)"
                                    >
                                        SAQUE CANCELADO
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Account Total */}
                <div className={`card-brutalist ${calculateAccountTotal(currentAccount) < 0
                    ? 'bg-red-50 border-red-600'
                    : 'bg-orange-50 border-orange-600'
                    }`}>
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-mono font-bold uppercase">
                            TOTAL DESTE PAR (SAQUES - DEPÓSITOS)
                        </p>
                        <p className={`text-2xl font-mono font-black ${getValueColor(calculateAccountTotal(currentAccount))}`}>
                            {formatCurrency(calculateAccountTotal(currentAccount))}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grand Total */}
            <div className={`card-brutalist ${calculateGrandTotal() < 0
                ? 'bg-red-50 border-red-600'
                : 'bg-green-50 border-green-600'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono font-bold uppercase">
                            TOTAL GERAL DE TODOS OS PARES
                        </p>
                        <p className="text-xs font-mono text-neutral-600">
                            {accountUpdates.filter(a => a.updated).length} de {accountUpdates.length} pares atualizados
                        </p>
                    </div>
                    <p className={`text-3xl font-mono font-black ${getValueColor(calculateGrandTotal())}`}>
                        {formatCurrency(calculateGrandTotal())}
                    </p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t-4 border-black">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="btn-brutalist-secondary flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        <span>VOLTAR</span>
                    </button>
                )}
                <button
                    onClick={handleAdvance}
                    className="btn-brutalist-success flex-1 flex items-center justify-center gap-2"
                >
                    <span>AVANÇAR PARA ATIVAÇÃO SMS</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default SaqueBonusForm;
