import React, { useState, useEffect } from 'react';
import { Play, Pause, ArrowRight, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { formatCurrency, formatTime, calculateCriacaoDiferenca } from '../utils/cycleHelpers';
import { useToast } from '../contexts/ToastContext';
import ConfirmModal from './ConfirmModal';

const CriacaoContasForm = ({ cycle, onSave, onAdvanceStage, onBack }) => {
    const { showWarning } = useToast();
    const getValueColor = (value) => {
        const num = parseFloat(value) || 0;
        return num < 0 ? 'text-red-600' : 'text-green-600';
    };

    // Initialize with array of accounts (default 6 accounts with depositoFilha = 100)
    const createDefaultAccount = () => ({
        loginContaMae: '',
        loginContaFilha: '',
        depositoFilha: '100',
        bonusMae: '',
        bonusFilha: '',
        saqueFilha: '',
        diferenca: -100 // Initial difference is -100 (0 - 100)
    });

    const [accounts, setAccounts] = useState(
        cycle?.criacao?.accounts || Array.from({ length: 6 }, () => createDefaultAccount())
    );

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(cycle?.criacao?.tempoTotal || 0);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, accountIndex: null });

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
            // Only save if there are accounts
            if (accounts.length > 0) {
                handleSave();
            }
        }, 1000); // Auto-save after 1 second of inactivity

        return () => clearTimeout(timer);
    }, [accounts]);

    const handleAccountChange = (index, field, value) => {
        const updatedAccounts = [...accounts];
        updatedAccounts[index] = {
            ...updatedAccounts[index],
            [field]: value
        };

        // Auto-calculate diferenca for this account (only depositoFilha - saqueFilha)
        if (['depositoFilha', 'saqueFilha'].includes(field)) {
            const deposito = parseFloat(updatedAccounts[index].depositoFilha) || 0;
            const saque = parseFloat(updatedAccounts[index].saqueFilha) || 0;
            updatedAccounts[index].diferenca = saque - deposito;
        }

        setAccounts(updatedAccounts);
    };

    const addAccount = () => {
        if (accounts.length >= 20) {
            showWarning('MÁXIMO DE 20 CONTAS ATINGIDO!');
            return;
        }
        setAccounts([...accounts, createDefaultAccount()]);
    };

    const handleRemoveAccount = (index) => {
        if (accounts.length <= 1) {
            return; // Prevent removing last account
        }
        setConfirmModal({ isOpen: true, accountIndex: index });
    };

    const confirmRemoveAccount = () => {
        const updatedAccounts = accounts.filter((_, i) => i !== confirmModal.accountIndex);
        setAccounts(updatedAccounts);
    };

    const calculateTotalDiferenca = () => {
        return accounts.reduce((sum, account) => {
            return sum + (parseFloat(account.diferenca) || 0);
        }, 0);
    };

    const handleSave = () => {
        const updatedCycle = {
            ...cycle,
            criacao: {
                accounts: accounts,
                tempoTotal: elapsedTime,
                totalDiferenca: calculateTotalDiferenca()
            }
        };
        onSave(updatedCycle);
    };

    const handleAdvance = () => {
        // Validate at least one account has required fields
        const hasValidAccount = accounts.some(acc =>
            acc.loginContaMae?.trim() &&
            acc.loginContaFilha?.trim() &&
            parseFloat(acc.depositoFilha) > 0
        );

        if (!hasValidAccount) {
            showWarning('PREENCHA PELO MENOS UMA CONTA COM TODOS OS DADOS OBRIGATÓRIOS!');
            return;
        }

        const updatedCycle = {
            ...cycle,
            criacao: {
                accounts: accounts,
                tempoTotal: elapsedTime,
                totalDiferenca: calculateTotalDiferenca()
            }
        };
        onAdvanceStage(updatedCycle);
    };

    return (
        <div className="space-y-6">
            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, accountIndex: null })}
                onConfirm={confirmRemoveAccount}
                title="REMOVER CONTA"
                message={`Tem certeza que deseja remover a CONTA ${(confirmModal.accountIndex || 0) + 1}? Todos os dados desta conta serão perdidos.`}
                confirmText="SIM, REMOVER"
                cancelText="CANCELAR"
                type="danger"
            />
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

            {/* Accounts List */}
            <div className="space-y-4">
                {accounts.map((account, index) => {
                    // Calculate IDs: Mãe is odd (1, 3, 5...), Filha is even (2, 4, 6...)
                    const maeId = (index * 2) + 1;
                    const filhaId = (index * 2) + 2;

                    return (
                        <div key={index} className="card-brutalist bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-sm font-mono font-black uppercase">
                                        PAR DE CONTAS MÃE E FILHA {index + 1}
                                    </h3>
                                    <p className="text-xs font-mono text-neutral-600 mt-1">
                                        ID MÃE: {maeId} | ID FILHA: {filhaId}
                                    </p>
                                </div>
                                {accounts.length > 1 && (
                                    <button
                                        onClick={() => handleRemoveAccount(index)}
                                        className="p-2 hover:bg-red-100 border-2 border-black transition-colors"
                                        title="Remover conta"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Login Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        LOGIN CONTA MÃE *
                                    </label>
                                    <input
                                        type="text"
                                        value={account.loginContaMae}
                                        onChange={(e) => handleAccountChange(index, 'loginContaMae', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="Digite o login"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        LOGIN CONTA FILHA *
                                    </label>
                                    <input
                                        type="text"
                                        value={account.loginContaFilha}
                                        onChange={(e) => handleAccountChange(index, 'loginContaFilha', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="Digite o login"
                                    />
                                </div>
                            </div>

                            {/* Financial Fields */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        DEPÓSITO FILHA *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={account.depositoFilha}
                                        onChange={(e) => handleAccountChange(index, 'depositoFilha', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        BÔNUS MÃE
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={account.bonusMae}
                                        onChange={(e) => handleAccountChange(index, 'bonusMae', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        BÔNUS FILHA
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={account.bonusFilha}
                                        onChange={(e) => handleAccountChange(index, 'bonusFilha', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-mono font-bold uppercase mb-2">
                                        SAQUE FILHA
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={account.saqueFilha}
                                        onChange={(e) => handleAccountChange(index, 'saqueFilha', e.target.value)}
                                        className="input-brutalist w-full"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            {/* Individual Difference */}
                            <div className="mt-3 pt-3 border-t-2 border-black">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-mono font-bold uppercase">DIFERENÇA</p>
                                    <p className={`text-lg font-mono font-black ${getValueColor(account.diferenca)}`}>
                                        {formatCurrency(account.diferenca || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Add Account Button */}
                <div className="card-brutalist bg-white">
                    <button
                        onClick={addAccount}
                        disabled={accounts.length >= 20}
                        className={`w-full flex items-center justify-center gap-2 py-3 ${accounts.length >= 20
                            ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed border-2 border-neutral-400'
                            : 'btn-brutalist-success'
                            }`}
                    >
                        <Plus size={18} />
                        <span>ADICIONAR CONTA ({accounts.length}/20)</span>
                    </button>
                </div>
            </div>

            {/* Total Difference */}
            <div className={`card-brutalist ${calculateTotalDiferenca() < 0
                ? 'bg-red-50 border-red-600'
                : 'bg-green-50 border-green-600'
                }`}>
                <div className="flex items-center justify-between">
                    <p className="text-sm font-mono font-bold uppercase">
                        DIFERENÇA TOTAL ({accounts.length} {accounts.length === 1 ? 'CONTA' : 'CONTAS'})
                    </p>
                    <p className={`text-2xl font-mono font-black ${getValueColor(calculateTotalDiferenca())}`}>
                        {formatCurrency(calculateTotalDiferenca())}
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
                    <span>AVANÇAR PARA SAQUE DE BÔNUS</span>
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default CriacaoContasForm;
