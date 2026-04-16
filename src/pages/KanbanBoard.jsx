import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, Timestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import DateSelector from '../components/DateSelector';
import KanbanColumn from '../components/KanbanColumn';
import CycleFormModal from '../components/CycleFormModal';
import CriacaoContasForm from '../components/CriacaoContasForm';
import SaqueBonusForm from '../components/SaqueBonusForm';
import AtivacaoSmsForm from '../components/AtivacaoSmsForm';
import PanoramaGeralView from '../components/PanoramaGeralView';
import ConfirmModal from '../components/ConfirmModal';
import { Download } from 'lucide-react';
import { generateDailyCSV } from '../utils/csvExport';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

const KanbanBoard = () => {
    const { currentUser } = useAuth();
    const { showSuccess, showError, showWarning, showInfo } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCycle, setSelectedCycle] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, cycleId: null, cycleName: '' });

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts
            },
        })
    );

    // Load cycles for selected date
    useEffect(() => {
        if (!currentUser) return;

        const dateStr = selectedDate.toISOString().split('T')[0];
        console.log('Loading cycles for date:', dateStr);

        const cyclesRef = collection(db, 'users', currentUser.uid, 'cycles');
        const q = query(
            cyclesRef,
            where('date', '==', dateStr)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cyclesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort by createdAt in memory instead of in query
            cyclesData.sort((a, b) => {
                const aTime = a.createdAt?.toMillis() || 0;
                const bTime = b.createdAt?.toMillis() || 0;
                return aTime - bTime;
            });

            console.log('Loaded cycles:', cyclesData.length, cyclesData);
            setCycles(cyclesData);
            setLoading(false);
        }, (error) => {
            console.error('Error loading cycles:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser, selectedDate]);

    // Filter cycles by stage
    const getCyclesByStage = (stage) => {
        return cycles.filter(cycle => cycle.stage === stage);
    };

    // Handle new cycle creation
    const handleNewCycle = async () => {
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const todayCycles = cycles.length;
            const cycleNumber = (todayCycles + 1).toString().padStart(2, '0');

            // Create default accounts (6 accounts with depositoFilha = 100)
            const createDefaultAccount = () => ({
                loginContaMae: '',
                loginContaFilha: '',
                depositoFilha: '100',
                bonusMae: '',
                bonusFilha: '',
                saqueFilha: '',
                diferenca: -100
            });

            const newCycle = {
                cycleName: `Ciclo ${cycleNumber} `,
                date: dateStr,
                stage: 'criacao',
                createdAt: Timestamp.now(),
                criacao: {
                    accounts: Array.from({ length: 6 }, () => createDefaultAccount()),
                    tempoTotal: 0,
                    totalDiferenca: -600 // 6 accounts * -100
                }
            };

            const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'cycles'), newCycle);
            setSelectedCycle({ id: docRef.id, ...newCycle });
            setShowModal(true);
            showSuccess('CICLO CRIADO COM SUCESSO!');
        } catch (error) {
            console.error('Error creating cycle:', error.code, error.message, error);
            if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
                showError('SEM PERMISSÃO PARA CRIAR CICLO. VERIFIQUE AS REGRAS DO FIRESTORE.');
            } else {
                showError('ERRO AO CRIAR CICLO: ' + (error.code || error.message || 'DESCONHECIDO'));
            }
        }
    };

    // Handle cycle click
    const handleCycleClick = (cycle) => {
        setSelectedCycle(cycle);
        setShowModal(true);
    };

    // Handle date change
    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        setLoading(true);
    };

    // Export CSV for selected date
    const handleExportCSV = () => {
        const finalizados = getCyclesByStage('finalizado');
        if (finalizados.length === 0) {
            showWarning('NENHUM CICLO FINALIZADO NESTA DATA');
            return;
        }

        try {
            generateDailyCSV(finalizados);
            showSuccess('CSV DO DIA GERADO COM SUCESSO!');
        } catch (error) {
            console.error('Error generating CSV:', error);
            showError('ERRO AO GERAR CSV');
        }
    };

    // Delete cycle
    const handleDeleteCycle = (cycleId) => {
        const cycle = cycles.find(c => c.id === cycleId);
        setConfirmModal({
            isOpen: true,
            cycleId,
            cycleName: cycle?.cycleName || 'este ciclo'
        });
    };

    const confirmDelete = async () => {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'cycles', confirmModal.cycleId));
            showSuccess('CICLO DELETADO COM SUCESSO!');
            setShowModal(false);
            setSelectedCycle(null);
        } catch (error) {
            console.error('Error deleting cycle:', error);
            showError('ERRO AO DELETAR CICLO');
        } finally {
            setConfirmModal({ isOpen: false, cycleId: null, cycleName: '' });
        }
    };

    // Duplicate cycle
    const handleDuplicateCycle = async (cycleId) => {
        try {
            const cycleToClone = cycles.find(c => c.id === cycleId);
            if (!cycleToClone) return;

            // Create a copy with "CÓPIA" suffix, keeping the same date
            const duplicatedCycle = {
                ...cycleToClone,
                cycleName: `${cycleToClone.cycleName} - CÓPIA`,
                createdAt: Timestamp.now()
                // Keep the same date as the original cycle
            };

            // Remove the id from the duplicated cycle
            delete duplicatedCycle.id;

            await addDoc(collection(db, 'users', currentUser.uid, 'cycles'), duplicatedCycle);
            showSuccess('CICLO DUPLICADO COM SUCESSO!');
        } catch (error) {
            console.error('Error duplicating cycle:', error);
            showError('ERRO AO DUPLICAR CICLO');
        }
    };

    // Save cycle progress
    const handleSaveCycle = async (updatedCycle) => {
        try {
            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', updatedCycle.id);
            // Remove 'id' field before sending to Firestore (it's the document key, not a field)
            const { id, ...cycleData } = updatedCycle;
            await updateDoc(cycleRef, cycleData);
            setSelectedCycle(updatedCycle);
            showSuccess('PROGRESSO SALVO COM SUCESSO!');
        } catch (error) {
            console.error('Error saving cycle:', error.code, error.message, error);
            if (error.code === 'permission-denied' || error.code === 'PERMISSION_DENIED') {
                showError('SEM PERMISSÃO. VERIFIQUE AS REGRAS DO FIRESTORE.');
            } else {
                showError('ERRO AO SALVAR CICLO: ' + (error.code || error.message || 'DESCONHECIDO'));
            }
        }
    };

    // Advance cycle to next stage
    const handleAdvanceStage = async (updatedCycle) => {
        try {
            const stageTransitions = {
                'criacao': 'bonus',
                'bonus': 'ativacao',
                'ativacao': 'finalizado'
            };

            const nextStage = stageTransitions[updatedCycle.stage];
            if (!nextStage) {
                showWarning('CICLO JÁ ESTÁ FINALIZADO');
                return;
            }

            const cycleWithNewStage = {
                ...updatedCycle,
                stage: nextStage
            };

            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', updatedCycle.id);
            await updateDoc(cycleRef, cycleWithNewStage);

            setSelectedCycle(cycleWithNewStage);
            showSuccess(`CICLO AVANÇADO PARA ${nextStage.toUpperCase()} !`);
        } catch (error) {
            console.error('Error advancing stage:', error.code, error.message, error);
            showError('ERRO AO AVANÇAR ETAPA: ' + (error.code || error.message || 'DESCONHECIDO'));
        }
    };

    // Finalize cycle (move to finalizado)
    const handleFinalizeCycle = async (updatedCycle) => {
        try {
            const finalizedCycle = {
                ...updatedCycle,
                stage: 'finalizado',
                finalizedAt: Timestamp.now()
            };

            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', updatedCycle.id);
            await updateDoc(cycleRef, finalizedCycle);

            setShowModal(false);
            setSelectedCycle(null);
            showSuccess('CICLO FINALIZADO COM SUCESSO!');
        } catch (error) {
            console.error('Error finalizing cycle:', error.code, error.message, error);
            showError('ERRO AO FINALIZAR CICLO: ' + (error.code || error.message || 'DESCONHECIDO'));
        }
    };

    const handleBackStage = async (updatedCycle) => {
        try {
            const stageTransitions = {
                'bonus': 'criacao',
                'ativacao': 'bonus'
            };

            const previousStage = stageTransitions[updatedCycle.stage];
            if (!previousStage) {
                showWarning('JÁ ESTÁ NA PRIMEIRA ETAPA!');
                return;
            }

            const cycleWithPreviousStage = {
                ...updatedCycle,
                stage: previousStage
            };

            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', updatedCycle.id);
            await updateDoc(cycleRef, cycleWithPreviousStage);

            setSelectedCycle(cycleWithPreviousStage);
            showSuccess(`VOLTOU PARA ${previousStage.toUpperCase()} !`);
        } catch (error) {
            console.error('Error going back stage:', error);
            showError('ERRO AO VOLTAR ETAPA');
        }
    };

    // Handle drag and drop
    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        // Extract cycle ID and new stage from drag event
        const cycleId = active.id;
        const newStage = over.id; // Column ID is the stage name

        // Find the cycle being dragged
        const cycle = cycles.find(c => c.id === cycleId);
        if (!cycle) return;

        // Don't allow moving to the same stage
        if (cycle.stage === newStage) return;

        try {
            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', cycleId);
            await updateDoc(cycleRef, {
                stage: newStage,
                lastModified: Timestamp.now()
            });

            showSuccess(`CICLO MOVIDO PARA ${newStage.toUpperCase()} !`);
        } catch (error) {
            console.error('Error moving cycle:', error);
            showError('ERRO AO MOVER CICLO');
        }
    };

    // Render appropriate form based on stage
    const renderCycleForm = () => {
        if (!selectedCycle) return null;

        switch (selectedCycle.stage) {
            case 'criacao':
                return (
                    <CriacaoContasForm
                        cycle={selectedCycle}
                        onSave={handleSaveCycle}
                        onAdvanceStage={handleAdvanceStage}
                        onBack={null}
                    />
                );
            case 'bonus':
                return (
                    <SaqueBonusForm
                        cycle={selectedCycle}
                        onSave={handleSaveCycle}
                        onAdvanceStage={handleAdvanceStage}
                        onBack={() => handleBackStage(selectedCycle)}
                    />
                );
            case 'ativacao':
                return (
                    <AtivacaoSmsForm
                        cycle={selectedCycle}
                        onSave={handleSaveCycle}
                        onFinalize={handleFinalizeCycle}
                        onBack={() => handleBackStage(selectedCycle)}
                    />
                );
            case 'finalizado':
                return (
                    <PanoramaGeralView
                        cycle={selectedCycle}
                        onClose={() => setShowModal(false)}
                        onDelete={handleDeleteCycle}
                    />
                );
            default:
                return <p className="text-sm font-mono">ESTÁGIO DESCONHECIDO</p>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-2xl font-mono font-bold uppercase">CARREGANDO...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-[1600px] mx-auto px-4 pb-8">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-black"></div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                KANBAN DE CICLOS
                            </h1>
                            <div className="h-1 w-32 bg-black mt-2"></div>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="card-brutalist mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <DateSelector
                            selectedDate={selectedDate}
                            onDateChange={handleDateChange}
                        />

                        <button
                            onClick={handleExportCSV}
                            className="btn-brutalist-success flex items-center gap-2"
                            disabled={getCyclesByStage('finalizado').length === 0}
                        >
                            <Download size={18} />
                            <span>EXPORTAR CSV DO DIA</span>
                        </button>
                    </div>

                    {/* Daily Summary */}
                    <div className="mt-4 pt-4 border-t-4 border-black grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">TOTAL DE CICLOS</p>
                            <p className="text-2xl font-mono font-black">{cycles.length}</p>
                        </div>
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">EM ANDAMENTO</p>
                            <p className="text-2xl font-mono font-black text-blue-600">
                                {cycles.filter(c => c.stage !== 'finalizado').length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">FINALIZADOS</p>
                            <p className="text-2xl font-mono font-black text-green-600">
                                {getCyclesByStage('finalizado').length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-mono uppercase text-neutral-600">RENDIMENTO</p>
                            <p className="text-2xl font-mono font-black text-green-600">R$ 0,00</p>
                        </div>
                    </div>
                </div>

                {/* Kanban Columns */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <KanbanColumn
                            title="Criação de Contas"
                            stage="criacao"
                            cycles={getCyclesByStage('criacao')}
                            onCycleClick={handleCycleClick}
                            onNewCycle={handleNewCycle}
                            onDeleteCycle={handleDeleteCycle}
                            onDuplicateCycle={handleDuplicateCycle}
                            showNewButton={true}
                            onUpdateCycle={handleSaveCycle}
                        />
                        <KanbanColumn
                            title="Saque de Bônus"
                            stage="bonus"
                            cycles={getCyclesByStage('bonus')}
                            onCycleClick={handleCycleClick}
                            onDeleteCycle={handleDeleteCycle}
                            onDuplicateCycle={handleDuplicateCycle}
                            showNewButton={false}
                            onUpdateCycle={handleSaveCycle}
                        />
                        <KanbanColumn
                            title="Ativação por SMS"
                            stage="ativacao"
                            cycles={getCyclesByStage('ativacao')}
                            onCycleClick={handleCycleClick}
                            onDeleteCycle={handleDeleteCycle}
                            onDuplicateCycle={handleDuplicateCycle}
                            showNewButton={false}
                            onUpdateCycle={handleSaveCycle}
                        />
                        <KanbanColumn
                            title="Finalizado"
                            stage="finalizado"
                            cycles={getCyclesByStage('finalizado')}
                            onCycleClick={handleCycleClick}
                            onDeleteCycle={handleDeleteCycle}
                            onDuplicateCycle={handleDuplicateCycle}
                            showNewButton={false}
                            onUpdateCycle={handleSaveCycle}
                        />
                    </div>
                </DndContext>
            </div>

            {/* Modal for cycle forms */}
            {showModal && selectedCycle && (
                <CycleFormModal
                    cycle={selectedCycle}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveCycle}
                >
                    {renderCycleForm()}
                </CycleFormModal>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, cycleId: null, cycleName: '' })}
                onConfirm={confirmDelete}
                title="DELETAR CICLO"
                message={`Tem certeza que deseja deletar ${confirmModal.cycleName}? Esta ação não pode ser desfeita.`}
                confirmText="DELETAR"
                cancelText="CANCELAR"
                type="danger"
            />
        </div>
    );
};

export default KanbanBoard;
