import React, { useState, useEffect } from 'react';
import { Play, Pause, CheckCircle, Copy, ArrowLeft, Plus, X } from 'lucide-react';
import { formatCurrency, formatTime } from '../utils/cycleHelpers';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import AddCycleModal from './AddCycleModal';

const AtivacaoSmsForm = ({ cycle, onSave, onFinalize, onBack }) => {
    const { showWarning, showSuccess } = useToast();
    const { currentUser } = useAuth();

    // Get accounts from previous stages
    const previousAccounts = cycle?.criacao?.accounts || [];

    // State for linked cycles
    const [linkedCycles, setLinkedCycles] = useState(cycle?.ativacao?.linkedCycles || []);
    const [showAddCycleModal, setShowAddCycleModal] = useState(false);

    // Merge accounts from current cycle and linked cycles
    const getAllAccounts = () => {
        const accounts = [
            ...previousAccounts.map(acc => ({
                cycleId: cycle.id,
                cycleName: cycle.cycleName,
                loginContaFilha: acc.loginContaFilha,
                color: 'bg-blue-100 text-blue-800 border-blue-300'
            }))
        ];

        // Add accounts from linked cycles with different colors
        const colors = [
            'bg-purple-100 text-purple-800 border-purple-300',
            'bg-teal-100 text-teal-800 border-teal-300',
            'bg-amber-100 text-amber-800 border-amber-300',
            'bg-rose-100 text-rose-800 border-rose-300'
        ];

        linkedCycles.forEach((linkedCycle, index) => {
            const cycleAccounts = linkedCycle.criacao?.accounts || [];
            cycleAccounts.forEach(acc => {
                accounts.push({
                    cycleId: linkedCycle.id,
                    cycleName: linkedCycle.cycleName,
                    loginContaFilha: acc.loginContaFilha,
                    color: colors[index % colors.length]
                });
            });
        });

        return accounts.filter(acc => acc.loginContaFilha);
    };

    const allAccounts = getAllAccounts();

    const [formData, setFormData] = useState({
        loginContaJuntar: '',
        saqueJuntar: '',
        accountsActivated: false,
        ...cycle?.ativacao
    });

    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(cycle?.ativacao?.tempoTotal || 0);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const getValueColor = (value) => {
        const num = parseFloat(value) || 0;
        return num < 0 ? 'text-red-600' : 'text-green-600';
    };

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
            if (formData.loginContaJuntar || formData.saqueJuntar) {
                handleSave();
            }
        }, 1000); // Auto-save after 1 second of inactivity

        return () => clearTimeout(timer);
    }, [formData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Immediate save for accountsActivated toggle
        if (field === 'accountsActivated') {
            setTimeout(() => handleSave(), 100);
        }
    };

    const handleCopyLogin = (login, index) => {
        navigator.clipboard.writeText(login);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const handleAddCycle = (selectedCycle) => {
        setLinkedCycles(prev => [...prev, selectedCycle]);
        showSuccess(`CICLO ${selectedCycle.cycleName} ADICIONADO!`);
    };

    const handleRemoveCycle = (cycleId) => {
        setLinkedCycles(prev => prev.filter(c => c.id !== cycleId));
        showSuccess('CICLO REMOVIDO!');
    };

    const calculateTotalCycleProfit = () => {
        let total = 0;

        // Etapa 1: Criação de Contas
        if (cycle?.criacao?.totalDiferenca) {
            total += parseFloat(cycle.criacao.totalDiferenca) || 0;
        }

        // Etapa 2: Saque de Bônus
        if (cycle?.bonus?.totalSaqueBonus) {
            total += parseFloat(cycle.bonus.totalSaqueBonus) || 0;
        }

        // Etapa 3: Ativação SMS (current)
        total += parseFloat(formData.saqueJuntar) || 0;

        return total;
    };

    const handleSave = () => {
        const updatedCycle = {
            ...cycle,
            ativacao: {
                ...formData,
                tempoTotal: elapsedTime,
                linkedCycles: linkedCycles,
                allAccounts: allAccounts
            }
        };
        onSave(updatedCycle);
    };

    const handleFinalize = async () => {
        if (!formData.loginContaJuntar?.trim()) {
            showWarning('SELECIONE A CONTA JUNTAR!');
            return;
        }

        const updatedCycle = {
            ...cycle,
            ativacao: {
                ...formData,
                tempoTotal: elapsedTime,
                totalCycleProfit: calculateTotalCycleProfit(),
                linkedCycles: linkedCycles,
                allAccounts: allAccounts
            }
        };

        // Auto-finalize linked cycles
        if (linkedCycles.length > 0) {
            try {
                const { updateDoc, doc } = await import('firebase/firestore');
                const { db } = await import('../firebaseConfig');

                for (const linkedCycle of linkedCycles) {
                    await updateDoc(doc(db, 'users', currentUser.uid, 'cycles', linkedCycle.id), {
                        stage: 'finalizado',
                        usedInActivation: cycle.id,
                        ativacao: {
                            ...linkedCycle.ativacao,
                            linkedTo: cycle.id,
                            finalizedAutomatically: true,
                            finalizedAt: new Date()
                        }
                    });
                }
                showSuccess(`${linkedCycles.length} CICLO(S) VINCULADO(S) FINALIZADO(S) AUTOMATICAMENTE!`);
            } catch (error) {
                console.error('Error auto-finalizing linked cycles:', error);
                showError('ERRO AO FINALIZAR CICLOS VINCULADOS');
            }
        }

        onFinalize(updatedCycle);
    };

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

            {/* All Accounts from Cycles */}
            <div className="card-brutalist bg-blue-50 border-blue-600">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-mono font-bold uppercase">
                        TODAS AS CONTAS ({allAccounts.length})
                    </p>
                    <button
                        onClick={() => setShowAddCycleModal(true)}
                        className="btn-brutalist-success flex items-center gap-2 text-xs px-3 py-2"
                    >
                        <Plus size={14} />
                        <span>ADICIONAR OUTRO CICLO</span>
                    </button>
                </div>

                {/* Linked Cycles Tags */}
                {linkedCycles.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 border-2 border-blue-300 text-xs font-mono font-bold">
                            {cycle.cycleName}
                        </span>
                        {linkedCycles.map((linkedCycle) => (
                            <span
                                key={linkedCycle.id}
                                className="px-2 py-1 bg-purple-100 text-purple-800 border-2 border-purple-300 text-xs font-mono font-bold flex items-center gap-1"
                            >
                                {linkedCycle.cycleName}
                                <button
                                    onClick={() => handleRemoveCycle(linkedCycle.id)}
                                    className="hover:bg-purple-200 p-0.5 rounded"
                                    title="Remover ciclo"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {allAccounts.map((account, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-blue-600">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 border-2 text-xs font-mono font-bold ${account.color}`}>
                                    {account.cycleName}
                                </span>
                                <p className="text-sm font-mono font-bold">{account.loginContaFilha}</p>
                            </div>
                            <button
                                onClick={() => handleCopyLogin(account.loginContaFilha, index)}
                                className="p-2 border-2 border-black hover:bg-blue-100 transition-colors"
                                title="Copiar login"
                            >
                                {copiedIndex === index ? (
                                    <span className="text-xs font-mono font-bold text-green-600">✓ COPIADO</span>
                                ) : (
                                    <Copy size={16} />
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>



            {/* Juntar Account Selector */}
            <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2">
                    LOGIN CONTA JUNTAR *
                </label>
                <select
                    value={formData.loginContaJuntar}
                    onChange={(e) => handleChange('loginContaJuntar', e.target.value)}
                    className="input-brutalist w-full"
                >
                    <option value="">SELECIONE UMA CONTA FILHA</option>
                    {allAccounts.map((account, index) => (
                        <option key={index} value={account.loginContaFilha}>
                            [{account.cycleName}] - {account.loginContaFilha}
                        </option>
                    ))}
                </select>
            </div>

            {/* Saque Juntar */}
            <div>
                <label className="block text-xs font-mono font-bold uppercase mb-2">
                    SAQUE CONTA JUNTAR (R$)
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={formData.saqueJuntar}
                    onChange={(e) => handleChange('saqueJuntar', e.target.value)}
                    className="input-brutalist w-full"
                    placeholder="0.00"
                />
            </div>

            {/* Total Cycle Profit */}
            <div className={`card-brutalist ${calculateTotalCycleProfit() < 0
                ? 'bg-red-50 border-red-600'
                : 'bg-green-50 border-green-600'
                }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-mono font-bold uppercase">
                            SAQUE TOTAL (CALCULADO)
                        </p>
                        <p className="text-xs font-mono text-neutral-600">
                            Lucro total do ciclo completo
                        </p>
                    </div>
                    <p className={`text-3xl font-mono font-black ${getValueColor(calculateTotalCycleProfit())}`}>
                        {formatCurrency(calculateTotalCycleProfit())}
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
                    onClick={handleFinalize}
                    className="btn-brutalist-success flex-1 flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18} />
                    <span>FINALIZAR CICLO</span>
                </button>
            </div>

            {/* Add Cycle Modal */}
            <AddCycleModal
                isOpen={showAddCycleModal}
                onClose={() => setShowAddCycleModal(false)}
                onAddCycle={handleAddCycle}
                currentCycleId={cycle.id}
                currentCycleDate={cycle.date}
                userId={currentUser?.uid}
            />
        </div>
    );
};

export default AtivacaoSmsForm;
