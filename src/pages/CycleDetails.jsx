import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import { ArrowLeft, Download, Edit2, Check, X } from 'lucide-react';
// import { exportToCSV, downloadCSV } from '../utils/csvExport';

const CycleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { showError } = useToast();
    const [cycle, setCycle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingCell, setEditingCell] = useState(null); // {entryIndex, field}
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        const loadCycle = async () => {
            if (!currentUser || !id) return;

            try {
                const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', id);
                const cycleSnap = await getDoc(cycleRef);

                if (cycleSnap.exists()) {
                    const data = cycleSnap.data();
                    // Ensure all entries have mother deposit fields
                    const entries = (data.entries || []).map(entry => ({
                        ...entry,
                        motherFirstDeposit: entry.motherFirstDeposit || 0,
                        motherSecondDeposit: entry.motherSecondDeposit || 0
                    }));
                    setCycle({ id: cycleSnap.id, ...data, entries });
                } else {
                    showError('CICLO NÃO ENCONTRADO');
                    navigate('/history');
                }
            } catch (error) {
                console.error('Error loading cycle:', error);
                showError('ERRO AO CARREGAR CICLO');
            } finally {
                setLoading(false);
            }
        };

        loadCycle();
    }, [currentUser, id, navigate]);

    /*
    const handleExport = () => {
        if (!cycle) return;
        try {
            const csvContent = exportToCSV(
                cycle.cycleName,
                cycle.entries || [],
                cycle.startTime,
                cycle.endTime,
                cycle.endTime && cycle.startTime ? cycle.endTime.seconds - cycle.startTime.seconds : 0
            );
            const filename = `${cycle.cycleName.replace(/\s+/g, '_')}_${cycle.id}.csv`;
            downloadCSV(csvContent, filename);
        } catch (error) {
            console.error('Error exporting CSV:', error);
        }
    };
    */

    const startEdit = (entryIndex, field, currentValue) => {
        setEditingCell({ entryIndex, field });
        setEditValue(currentValue || '0');
    };

    const cancelEdit = () => {
        setEditingCell(null);
        setEditValue('');
    };

    const saveEdit = async () => {
        if (!editingCell) return;

        try {
            const { entryIndex, field } = editingCell;
            const updatedEntries = [...cycle.entries];
            const value = parseFloat(editValue) || 0;
            updatedEntries[entryIndex][field] = value;

            // Recalculate totals and difference
            updatedEntries[entryIndex] = calculateEntryTotals(updatedEntries[entryIndex]);

            // Update Firebase
            const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', id);
            await updateDoc(cycleRef, { entries: updatedEntries });

            // Update local state
            setCycle({ ...cycle, entries: updatedEntries });
            setEditingCell(null);
            setEditValue('');
        } catch (error) {
            console.error('Error saving deposit:', error);
            showError('ERRO AO SALVAR DEPÓSITO');
        }
    };

    const calculateEntryTotals = (entry) => {
        const daughterDeposit = parseFloat(entry.deposit) || 0;
        const motherFirst = parseFloat(entry.motherFirstDeposit) || 0;
        const motherSecond = parseFloat(entry.motherSecondDeposit) || 0;
        const withdrawal = parseFloat(entry.withdrawal) || 0;

        const totalDeposits = daughterDeposit + motherFirst + motherSecond;
        const difference = withdrawal - totalDeposits;

        return {
            ...entry,
            totalDeposits,
            difference
        };
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    };

    const calculateGrandTotals = () => {
        if (!cycle?.entries) return { daughterDeposits: 0, motherFirst: 0, motherSecond: 0, withdrawals: 0, difference: 0 };

        return cycle.entries.reduce((acc, entry) => {
            const entryWithTotals = calculateEntryTotals(entry);
            acc.daughterDeposits += parseFloat(entry.deposit) || 0;
            acc.motherFirst += parseFloat(entry.motherFirstDeposit) || 0;
            acc.motherSecond += parseFloat(entry.motherSecondDeposit) || 0;
            acc.withdrawals += parseFloat(entry.withdrawal) || 0;
            acc.difference += entryWithTotals.difference;
            return acc;
        }, { daughterDeposits: 0, motherFirst: 0, motherSecond: 0, withdrawals: 0, difference: 0 });
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

    if (!cycle) return null;

    const totals = calculateGrandTotals();

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="max-w-7xl mx-auto px-4 pb-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/history')}
                    className="flex items-center gap-2 mb-6 px-4 py-2 border-2 border-black hover:bg-black hover:text-white transition-colors font-mono font-bold uppercase text-sm"
                >
                    <ArrowLeft size={16} />
                    <span>VOLTAR</span>
                </button>

                {/* Cycle Info Card */}
                <div className="card-brutalist mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
                                {cycle.cycleName}
                            </h1>
                            <div className="h-1 w-24 bg-black mb-4"></div>
                            <p className="text-xs font-mono uppercase tracking-wider text-neutral-600">
                                CRIADO EM: {formatDate(cycle.date)}
                            </p>
                        </div>
                        {/* Export Button Temporarily Removed - Functionality moved to History page * /}
                        {/* 
                        <button
                            onClick={handleExport}
                            className="btn-brutalist-success flex items-center gap-2"
                        >
                            <Download size={18} />
                            <span>EXPORTAR CSV</span>
                        </button>
                        */}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-neutral-100 border-4 border-black p-4">
                            <p className="text-xs font-mono uppercase text-neutral-600 mb-1">HORA DE INÍCIO</p>
                            <p className="text-lg font-mono font-bold">{formatDate(cycle.startTime)}</p>
                        </div>
                        <div className="bg-neutral-100 border-4 border-black p-4">
                            <p className="text-xs font-mono uppercase text-neutral-600 mb-1">HORA DE FIM</p>
                            <p className="text-lg font-mono font-bold">
                                {cycle.endTime ? formatDate(cycle.endTime) : 'EM ANDAMENTO'}
                            </p>
                        </div>
                        <div className="bg-neutral-100 border-4 border-black p-4">
                            <p className="text-xs font-mono uppercase text-neutral-600 mb-1">DIFERENÇA TOTAL</p>
                            <p className={`text-2xl font-mono font-black ${totals.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                R$ {totals.difference.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Entries Table */}
                <div className="card-brutalist">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
                        DETALHAMENTO DE CONTAS
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border-4 border-black">
                            <thead className="bg-black text-white">
                                <tr>
                                    <th className="px-3 py-3 text-left font-mono font-bold uppercase text-xs border-r-2 border-white">CONTA MÃE</th>
                                    <th className="px-3 py-3 text-left font-mono font-bold uppercase text-xs border-r-2 border-white">CONTA FILHA</th>
                                    <th className="px-3 py-3 text-right font-mono font-bold uppercase text-xs border-r-2 border-white">DEP. FILHA</th>
                                    <th className="px-3 py-3 text-right font-mono font-bold uppercase text-xs border-r-2 border-white">1º DEP. MÃE</th>
                                    <th className="px-3 py-3 text-right font-mono font-bold uppercase text-xs border-r-2 border-white">2º DEP. MÃE</th>
                                    <th className="px-3 py-3 text-right font-mono font-bold uppercase text-xs border-r-2 border-white">SAQUE</th>
                                    <th className="px-3 py-3 text-right font-mono font-bold uppercase text-xs">DIFERENÇA</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {cycle.entries?.map((entry, index) => {
                                    const entryWithTotals = calculateEntryTotals(entry);
                                    return (
                                        <tr key={index} className="border-b-2 border-black hover:bg-yellow-50">
                                            <td className="px-3 py-3 border-r-2 border-black font-mono text-sm">{entry.motherName || '-'}</td>
                                            <td className="px-3 py-3 border-r-2 border-black font-mono text-sm">{entry.daughterName || '-'}</td>
                                            <td className="px-3 py-3 border-r-2 border-black font-mono font-bold text-sm text-right">
                                                R$ {(entry.deposit || 0).toFixed(2)}
                                            </td>

                                            {/* 1º Depósito Mãe - Editável */}
                                            <td className="px-3 py-3 border-r-2 border-black">
                                                {editingCell?.entryIndex === index && editingCell?.field === 'motherFirstDeposit' ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="w-24 px-2 py-1 border-2 border-black font-mono font-bold text-sm text-right"
                                                            autoFocus
                                                            step="0.01"
                                                        />
                                                        <button onClick={saveEdit} className="p-1 bg-green-600 text-white border-2 border-black">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={cancelEdit} className="p-1 bg-red-600 text-white border-2 border-black">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(index, 'motherFirstDeposit', entry.motherFirstDeposit)}
                                                        className="w-full text-right font-mono font-bold text-sm hover:bg-neutral-100 px-2 py-1 flex items-center justify-end gap-1"
                                                    >
                                                        <span>R$ {(entry.motherFirstDeposit || 0).toFixed(2)}</span>
                                                        <Edit2 size={12} className="text-neutral-400" />
                                                    </button>
                                                )}
                                            </td>

                                            {/* 2º Depósito Mãe - Editável */}
                                            <td className="px-3 py-3 border-r-2 border-black">
                                                {editingCell?.entryIndex === index && editingCell?.field === 'motherSecondDeposit' ? (
                                                    <div className="flex items-center gap-1">
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(e.target.value)}
                                                            className="w-24 px-2 py-1 border-2 border-black font-mono font-bold text-sm text-right"
                                                            autoFocus
                                                            step="0.01"
                                                        />
                                                        <button onClick={saveEdit} className="p-1 bg-green-600 text-white border-2 border-black">
                                                            <Check size={14} />
                                                        </button>
                                                        <button onClick={cancelEdit} className="p-1 bg-red-600 text-white border-2 border-black">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => startEdit(index, 'motherSecondDeposit', entry.motherSecondDeposit)}
                                                        className="w-full text-right font-mono font-bold text-sm hover:bg-neutral-100 px-2 py-1 flex items-center justify-end gap-1"
                                                    >
                                                        <span>R$ {(entry.motherSecondDeposit || 0).toFixed(2)}</span>
                                                        <Edit2 size={12} className="text-neutral-400" />
                                                    </button>
                                                )}
                                            </td>

                                            <td className="px-3 py-3 border-r-2 border-black font-mono font-bold text-sm text-right">
                                                R$ {(entry.withdrawal || 0).toFixed(2)}
                                            </td>
                                            <td className={`px-3 py-3 font-mono font-black text-sm text-right ${entryWithTotals.difference >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                R$ {entryWithTotals.difference.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-neutral-900 text-white">
                                <tr>
                                    <td colSpan="2" className="px-3 py-4 text-right font-mono font-black uppercase text-sm border-r-2 border-white">
                                        TOTAL GERAL:
                                    </td>
                                    <td className="px-3 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                                        R$ {totals.daughterDeposits.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                                        R$ {totals.motherFirst.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                                        R$ {totals.motherSecond.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                                        R$ {totals.withdrawals.toFixed(2)}
                                    </td>
                                    <td className={`px-3 py-4 text-right font-mono font-black text-sm ${totals.difference >= 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        R$ {totals.difference.toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CycleDetails;
