import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { X, Plus, Users } from 'lucide-react';

const AddCycleModal = ({ isOpen, onClose, onAddCycle, currentCycleId, currentCycleDate, userId }) => {
    const [availableCycles, setAvailableCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCycle, setSelectedCycle] = useState(null);

    useEffect(() => {
        if (isOpen && userId) {
            loadAvailableCycles();
        }
    }, [isOpen, userId]);

    const loadAvailableCycles = async () => {
        setLoading(true);
        try {
            // Validate userId
            if (!userId) {
                console.error('❌ userId is undefined');
                setAvailableCycles([]);
                setLoading(false);
                return;
            }

            console.log('🔍 Buscando ciclos na etapa de ativação:', {
                currentCycleId,
                userId
            });

            // Query cycles in 'ativacao' stage from ANY date
            const cyclesRef = collection(db, 'users', userId, 'cycles');
            const q = query(
                cyclesRef,
                where('stage', '==', 'ativacao')
            );

            const snapshot = await getDocs(q);
            const cycles = [];

            console.log('📊 Total de ciclos encontrados:', snapshot.size);

            snapshot.forEach((doc) => {
                const data = doc.data();

                console.log('📋 Ciclo encontrado:', {
                    id: doc.id,
                    name: data.cycleName,
                    stage: data.stage,
                    date: data.date,
                    usedInActivation: data.usedInActivation,
                    isCurrentCycle: doc.id === currentCycleId
                });

                // Exclude current cycle and cycles already used in other activations
                if (doc.id !== currentCycleId && !data.usedInActivation) {
                    cycles.push({
                        id: doc.id,
                        ...data,
                        accountCount: data.criacao?.accounts?.length || 0
                    });
                }
            });

            console.log('✅ Ciclos disponíveis após filtro:', cycles.length, cycles);
            setAvailableCycles(cycles);
        } catch (error) {
            console.error('❌ Error loading cycles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        if (selectedCycle) {
            onAddCycle(selectedCycle);
            setSelectedCycle(null);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white border-4 border-black shadow-brutalist max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-purple-100 border-b-4 border-black p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Plus size={24} className="text-purple-700" />
                        <h2 className="text-lg font-mono font-black uppercase">
                            ADICIONAR CONTAS DE OUTRO CICLO
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-black/10 border-2 border-black transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <p className="font-mono font-bold uppercase">CARREGANDO CICLOS...</p>
                        </div>
                    ) : availableCycles.length === 0 ? (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-neutral-400 mb-4" />
                            <p className="font-mono font-bold uppercase text-neutral-600 mb-2">
                                NENHUM CICLO DISPONÍVEL
                            </p>
                            <p className="text-sm font-mono text-neutral-500">
                                Não há outros ciclos na etapa de Ativação SMS disponíveis
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-mono uppercase text-neutral-600 mb-4">
                                Selecione um ciclo para adicionar suas contas filhas:
                            </p>
                            {availableCycles.map((cycle) => (
                                <button
                                    key={cycle.id}
                                    onClick={() => setSelectedCycle(cycle)}
                                    className={`w-full p-4 border-4 border-black text-left transition-all ${selectedCycle?.id === cycle.id
                                        ? 'bg-purple-200 shadow-brutalist'
                                        : 'bg-white hover:bg-purple-50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-mono font-black uppercase">
                                            {cycle.cycleName}
                                        </h3>
                                        <span className="px-3 py-1 bg-purple-100 border-2 border-black text-xs font-mono font-bold">
                                            {cycle.accountCount} CONTAS
                                        </span>
                                    </div>
                                    <div className="text-xs font-mono text-neutral-600">
                                        <p>Criado em: {
                                            (() => {
                                                try {
                                                    // Try to use createdAt (timestamp) first
                                                    if (cycle.createdAt?.toDate) {
                                                        return cycle.createdAt.toDate().toLocaleString('pt-BR');
                                                    } else if (cycle.createdAt?.seconds) {
                                                        return new Date(cycle.createdAt.seconds * 1000).toLocaleString('pt-BR');
                                                    }

                                                    // Fallback to date (string or timestamp)
                                                    if (cycle.date?.toDate) {
                                                        return cycle.date.toDate().toLocaleDateString('pt-BR');
                                                    } else if (typeof cycle.date === 'string') {
                                                        // Handle YYYY-MM-DD
                                                        const [year, month, day] = cycle.date.split('-');
                                                        return `${day}/${month}/${year}`;
                                                    }

                                                    return 'Data desconhecida';
                                                } catch (e) {
                                                    console.error('Error formatting date:', e);
                                                    return 'Erro na data';
                                                }
                                            })()
                                        }</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t-4 border-black p-4 flex gap-3">
                    <button
                        onClick={onClose}
                        className="btn-brutalist-secondary flex-1"
                    >
                        CANCELAR
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedCycle}
                        className={`flex-1 flex items-center justify-center gap-2 ${selectedCycle
                            ? 'btn-brutalist-success'
                            : 'bg-neutral-200 text-neutral-400 border-2 border-neutral-400 cursor-not-allowed'
                            }`}
                    >
                        <Plus size={18} />
                        <span>ADICIONAR CICLO</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddCycleModal;
