import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import CycleCard from '../components/CycleCard';
import ConfirmModal from '../components/ConfirmModal';
import { Search, Filter, AlertCircle, FileDown } from 'lucide-react';
import { generateDailyCSV } from '../utils/csvExport';

const History = () => {
    const { currentUser } = useAuth();
    const { showError, showSuccess } = useToast();
    const [cycles, setCycles] = useState([]);
    const [filteredCycles, setFilteredCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, ongoing
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, cycleId: null, cycleName: '' });

    // Load cycles from Firestore
    useEffect(() => {
        if (!currentUser) return;

        const cyclesRef = collection(db, 'users', currentUser.uid, 'cycles');
        const q = query(cyclesRef, orderBy('date', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const cyclesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCycles(cyclesData);
            setFilteredCycles(cyclesData);
            setLoading(false);
        }, (error) => {
            console.error('Error loading cycles:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [currentUser]);

    // Filter cycles
    useEffect(() => {
        let filtered = cycles;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(cycle =>
                cycle.cycleName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus === 'completed') {
            filtered = filtered.filter(cycle => cycle.endTime);
        } else if (filterStatus === 'ongoing') {
            filtered = filtered.filter(cycle => !cycle.endTime);
        }

        setFilteredCycles(filtered);
    }, [searchTerm, filterStatus, cycles]);

    // Delete cycle
    const handleDelete = (cycleId) => {
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
        } catch (error) {
            console.error('Error deleting cycle:', error);
            showError('ERRO AO EXCLUIR CICLO. TENTE NOVAMENTE.');
        } finally {
            setConfirmModal({ isOpen: false, cycleId: null, cycleName: '' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50">
                <Header />
                <div className="flex items-center justify-center py-20">
                    <div className="text-2xl font-mono font-bold uppercase">CARREGANDO HISTÓRICO...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 pb-8">
                {/* Page Title */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-black"></div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter">
                                HISTÓRICO DE CICLOS
                            </h1>
                            <div className="h-1 w-32 bg-black mt-2"></div>
                        </div>
                    </div>
                    <p className="text-sm font-mono uppercase tracking-wider text-neutral-600">
                        VISUALIZE E GERENCIE TODOS OS SEUS CICLOS SALVOS
                    </p>
                </div>

                {/* Filters */}
                <div className="card-brutalist mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                            <input
                                type="text"
                                placeholder="BUSCAR POR NOME DO CICLO..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border-4 border-black font-mono font-bold text-sm uppercase focus:outline-none focus:ring-0"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter size={20} className="text-neutral-600" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-3 border-4 border-black font-mono font-bold text-sm uppercase focus:outline-none focus:ring-0 bg-white"
                            >
                                <option value="all">TODOS</option>
                                <option value="completed">FINALIZADOS</option>
                                <option value="ongoing">EM ANDAMENTO</option>
                            </select>
                        </div>
                    </div>

                    {/* Results Count & Export */}
                    <div className="mt-4 pt-4 border-t-4 border-black flex items-center justify-between">
                        <p className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-600">
                            {filteredCycles.length} {filteredCycles.length === 1 ? 'CICLO ENCONTRADO' : 'CICLOS ENCONTRADOS'}
                        </p>

                        {/* Export Button */}
                        {filteredCycles.some(c => c.stage === 'finalizado') && (
                            <button
                                onClick={() => {
                                    const completedCycles = filteredCycles.filter(c => c.stage === 'finalizado');
                                    generateDailyCSV(completedCycles);
                                    showSuccess('CSV GERADO COM SUCESSO!');
                                }}
                                className="btn-brutalist-success flex items-center gap-2 text-xs py-2 px-3"
                            >
                                <FileDown size={16} />
                                <span>EXPORTAR CSV (PANORAMA GERAL)</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Cycles Grid */}
                {filteredCycles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCycles.map(cycle => (
                            <CycleCard
                                key={cycle.id}
                                cycle={cycle}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="card-brutalist text-center py-12">
                        <AlertCircle size={48} className="mx-auto text-neutral-400 mb-4" />
                        <h3 className="text-xl font-mono font-bold uppercase tracking-wider text-neutral-700 mb-2">
                            NENHUM CICLO ENCONTRADO
                        </h3>
                        <p className="text-sm font-mono uppercase tracking-wider text-neutral-500">
                            {searchTerm || filterStatus !== 'all'
                                ? 'TENTE AJUSTAR OS FILTROS DE BUSCA'
                                : 'COMECE CRIANDO SEU PRIMEIRO CICLO!'}
                        </p>
                    </div>
                )}
            </div>

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

export default History;
