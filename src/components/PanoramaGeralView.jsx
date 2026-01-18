import React from 'react';
import { Clock, DollarSign, Calendar, Users, Trash2 } from 'lucide-react';
import { formatCurrency, formatTime, calculateTotalTime } from '../utils/cycleHelpers';

const PanoramaGeralView = ({ cycle, onClose, onDelete }) => {
    const totalTime = calculateTotalTime(cycle);
    const accounts = cycle?.criacao?.accounts || [];
    const totalDiferenca = cycle?.criacao?.totalDiferenca || 0;

    const getValueColor = (value) => {
        const num = parseFloat(value) || 0;
        return num < 0 ? 'text-red-600' : 'text-green-600';
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`card-brutalist ${totalDiferenca < 0 ? 'bg-red-50 border-red-600' : 'bg-green-50 border-green-600'
                    }`}>
                    <div className="flex items-center gap-3">
                        <DollarSign size={24} className={totalDiferenca < 0 ? 'text-red-600' : 'text-green-600'} />
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">SALDO TOTAL</p>
                            <p className={`text-xl font-mono font-black ${getValueColor(totalDiferenca)}`}>
                                {formatCurrency(totalDiferenca)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-brutalist bg-blue-50 border-blue-600">
                    <div className="flex items-center gap-3">
                        <Clock size={24} className="text-blue-600" />
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">TEMPO TOTAL</p>
                            <p className="text-xl font-mono font-black text-blue-600">
                                {formatTime(totalTime)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-brutalist bg-purple-50 border-purple-600">
                    <div className="flex items-center gap-3">
                        <Calendar size={24} className="text-purple-600" />
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">DATA</p>
                            <p className="text-xl font-mono font-black text-purple-600">
                                {cycle?.date || '-'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card-brutalist bg-orange-50 border-orange-600">
                    <div className="flex items-center gap-3">
                        <Users size={24} className="text-orange-600" />
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">CONTAS</p>
                            <p className="text-xl font-mono font-black text-orange-600">
                                {accounts.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stage 1: Criação de Contas */}
            {cycle?.criacao && accounts.length > 0 && (
                <div className="card-brutalist bg-blue-50 border-blue-600">
                    <h3 className="text-lg font-mono font-black uppercase mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 text-white flex items-center justify-center font-black">1</div>
                        CRIAÇÃO DE CONTAS ({accounts.length})
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {accounts.map((account, index) => (
                            <div key={index} className="card-brutalist bg-white border-blue-600">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-mono font-bold uppercase">DIFERENÇA</p>
                                    <p className={`text-sm font-mono font-bold ${getValueColor(account.diferenca || 0)}`}>
                                        {formatCurrency(account.diferenca || 0)}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <p className="font-mono text-neutral-600">MÃE</p>
                                        <p className="font-mono font-bold">{account.loginContaMae || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">FILHA</p>
                                        <p className="font-mono font-bold">{account.loginContaFilha || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">DEPÓSITO</p>
                                        <p className="font-mono font-bold">{formatCurrency(account.depositoFilha)}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">SAQUE</p>
                                        <p className="font-mono font-bold">{formatCurrency(account.saqueFilha)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                        <p className="text-sm font-mono font-bold uppercase">DIFERENÇA TOTAL</p>
                        <p className={`text-2xl font-mono font-black ${getValueColor(totalDiferenca)}`}>
                            {formatCurrency(totalDiferenca)}
                        </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="font-mono text-neutral-600">TEMPO DA ETAPA</p>
                        <p className="font-mono font-bold">{formatTime(cycle.criacao.tempoTotal)}</p>
                    </div>
                </div>
            )}

            {/* Stage 2: Saque de Bônus */}
            {cycle?.bonus && cycle?.bonus?.accountUpdates && (
                <div className="card-brutalist bg-orange-50 border-orange-600">
                    <h3 className="text-lg font-mono font-black uppercase mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-600 text-white flex items-center justify-center font-black">2</div>
                        SAQUE DE BÔNUS ({cycle.bonus.accountUpdates.length} CONTAS)
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {cycle.bonus.accountUpdates.map((account, index) => (
                            <div key={index} className="card-brutalist bg-white border-orange-600">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-mono font-black uppercase">
                                        CONTA {index + 1} - {account.loginContaMae}
                                    </h4>
                                    <span className={`text-sm font-mono font-bold ${getValueColor(
                                        (parseFloat(account.saqueBonusMae) || 0) +
                                        (parseFloat(account.saqueBonusFilha) || 0) -
                                        (parseFloat(account.primeiroDepositoMae) || 0) -
                                        (parseFloat(account.segundoDepositoMae) || 0) -
                                        (parseFloat(account.terceiroDepositoMae) || 0)
                                    )
                                        }`}>
                                        {formatCurrency(
                                            (parseFloat(account.saqueBonusMae) || 0) +
                                            (parseFloat(account.saqueBonusFilha) || 0) -
                                            (parseFloat(account.primeiroDepositoMae) || 0) -
                                            (parseFloat(account.segundoDepositoMae) || 0) -
                                            (parseFloat(account.terceiroDepositoMae) || 0)
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                    <div>
                                        <p className="font-mono text-neutral-600">1º DEP. MÃE</p>
                                        <p className="font-mono font-bold">{formatCurrency(account.primeiroDepositoMae)}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">2º DEP. MÃE</p>
                                        <p className="font-mono font-bold">{formatCurrency(account.segundoDepositoMae)}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">3º DEP. MÃE</p>
                                        <p className="font-mono font-bold">{formatCurrency(account.terceiroDepositoMae)}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">SAQUE BÔNUS MÃE</p>
                                        <p className="font-mono font-bold text-green-600">{formatCurrency(account.saqueBonusMae)}</p>
                                    </div>
                                    <div>
                                        <p className="font-mono text-neutral-600">SAQUE BÔNUS FILHA</p>
                                        <p className="font-mono font-bold text-green-600">{formatCurrency(account.saqueBonusFilha)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                        <p className="text-sm font-mono font-bold uppercase">TOTAL SAQUE BÔNUS</p>
                        <p className={`text-2xl font-mono font-black ${getValueColor(cycle.bonus.totalSaqueBonus)}`}>
                            {formatCurrency(cycle.bonus.totalSaqueBonus)}
                        </p>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                        <p className="font-mono text-neutral-600">TEMPO DA ETAPA</p>
                        <p className="font-mono font-bold">{formatTime(cycle.bonus.tempoTotal)}</p>
                    </div>
                </div>
            )}

            {/* Stage 3: Ativação por SMS */}
            {cycle?.ativacao && (
                <div className="card-brutalist bg-purple-50 border-purple-600">
                    <h3 className="text-lg font-mono font-black uppercase mb-4 flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center font-black">3</div>
                        ATIVAÇÃO POR SMS
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs font-mono text-neutral-600">LOGIN CONTA JUNTAR</p>
                            <p className="text-sm font-mono font-bold">{cycle.ativacao.loginContaJuntar || '-'}</p>
                        </div>
                        <div>
                            <p className="text-xs font-mono text-neutral-600">SAQUE CONTA JUNTAR</p>
                            <p className="text-sm font-mono font-bold">{formatCurrency(cycle.ativacao.saqueJuntar)}</p>
                        </div>
                        <div>
                            <p className="text-xs font-mono text-neutral-600">TEMPO</p>
                            <p className="text-sm font-mono font-bold">{formatTime(cycle.ativacao.tempoTotal)}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t-4 border-black flex gap-3">
                <button
                    onClick={() => onDelete?.(cycle.id)}
                    className="btn-brutalist-danger flex-1 flex items-center justify-center gap-2"
                >
                    <Trash2 size={18} />
                    <span>DELETAR CICLO</span>
                </button>
                <button
                    onClick={onClose}
                    className="btn-brutalist-secondary flex-1"
                >
                    FECHAR
                </button>
            </div>
        </div>
    );
};

export default PanoramaGeralView;
