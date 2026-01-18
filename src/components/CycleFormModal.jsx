import React, { useState, useEffect } from 'react';
import { X, Edit2, Check, XCircle } from 'lucide-react';

const CycleFormModal = ({ cycle, onClose, onSave, children }) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempCycleName, setTempCycleName] = useState('');

    useEffect(() => {
        if (cycle) {
            setTempCycleName(cycle.cycleName || '');
        }
    }, [cycle]);

    const getStageLabel = () => {
        switch (cycle?.stage) {
            case 'criacao': return 'CRIAÇÃO DE CONTAS';
            case 'bonus': return 'SAQUE DE BÔNUS';
            case 'ativacao': return 'ATIVAÇÃO POR SMS';
            case 'finalizado': return 'FINALIZADO';
            default: return cycle?.stage?.toUpperCase();
        }
    };

    const getStageColor = () => {
        switch (cycle?.stage) {
            case 'criacao': return 'bg-blue-600';
            case 'bonus': return 'bg-yellow-600';
            case 'ativacao': return 'bg-purple-600';
            case 'finalizado': return 'bg-green-600';
            default: return 'bg-neutral-600';
        }
    };

    const handleSaveName = () => {
        if (!tempCycleName.trim()) return;

        const updatedCycle = {
            ...cycle,
            cycleName: tempCycleName.trim()
        };
        onSave(updatedCycle);
        setIsEditingName(false);
    };

    const handleCancelEdit = () => {
        setTempCycleName(cycle.cycleName || '');
        setIsEditingName(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-brutalist">
                {/* Header */}
                <div className={`${getStageColor()} text-white p-6 border-b-4 border-black`}>
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            {isEditingName ? (
                                <div className="flex items-center gap-2 mb-1">
                                    <input
                                        type="text"
                                        value={tempCycleName}
                                        onChange={(e) => setTempCycleName(e.target.value)}
                                        className="text-black text-xl font-mono font-black uppercase px-2 py-1 border-2 border-black w-full max-w-md focus:outline-none focus:ring-2 focus:ring-black"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveName}
                                        className="p-1 hover:bg-green-500 rounded text-white hover:text-black transition-colors"
                                        title="Salvar nome"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-1 hover:bg-red-500 rounded text-white hover:text-black transition-colors"
                                        title="Cancelar"
                                    >
                                        <XCircle size={20} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 mb-1">
                                    <h2 className="text-2xl font-mono font-black uppercase">
                                        {cycle?.cycleName}
                                    </h2>
                                    <button
                                        onClick={() => setIsEditingName(true)}
                                        className="p-1 hover:bg-white/20 rounded transition-colors opacity-80 hover:opacity-100"
                                        title="Editar nome"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            )}
                            <p className="text-sm font-mono uppercase opacity-90">
                                {getStageLabel()}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white hover:bg-opacity-20 transition-colors"
                            aria-label="Fechar"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CycleFormModal;
