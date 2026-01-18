import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import CycleHeader from '../components/CycleHeader';
import AccountsTable from '../components/AccountsTable';
import { AlertCircle } from 'lucide-react';
import { exportToCSV, downloadCSV } from '../utils/csvExport';

function Dashboard() {
    const { currentUser } = useAuth();

    // State Management
    const [cycleName, setCycleName] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [currentCycleId, setCurrentCycleId] = useState(null);
    const [entries, setEntries] = useState([
        { motherName: '', daughterName: '', deposit: '', withdrawal: '', difference: 0 }
    ]);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Auto-generate cycle name on component mount
    useEffect(() => {
        const generateCycleName = async () => {
            if (!currentUser) return;

            try {
                // Get today's date range
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);

                // Query cycles created today
                const cyclesRef = collection(db, 'users', currentUser.uid, 'cycles');
                const q = query(
                    cyclesRef,
                    where('date', '>=', Timestamp.fromDate(today)),
                    where('date', '<', Timestamp.fromDate(tomorrow))
                );

                const querySnapshot = await getDocs(q);
                const cycleCount = querySnapshot.size + 1;
                const formattedNumber = cycleCount.toString().padStart(2, '0');
                setCycleName(`Ciclo ${formattedNumber}`);
            } catch (error) {
                console.error('Error generating cycle name:', error);
                setCycleName('Ciclo 01');
            }
        };

        generateCycleName();
    }, [currentUser]);

    // Timer Effect
    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Start Cycle
    const handleStartCycle = () => {
        if (!cycleName.trim()) {
            showNotification('POR FAVOR, INSIRA UM NOME PARA O CICLO!', 'error');
            return;
        }
        setIsRunning(true);
        setStartTime(Timestamp.now());
        setElapsedTime(0);
        showNotification('CICLO INICIADO COM SUCESSO!', 'success');
    };

    // Stop Cycle
    const handleStopCycle = () => {
        setIsRunning(false);
        showNotification('Ciclo pausado!', 'info');
    };

    // Calculate Total Balance
    const calculateTotalBalance = () => {
        return entries.reduce((sum, entry) => sum + (parseFloat(entry.difference) || 0), 0);
    };

    // Save Progress to Firebase
    const handleSaveProgress = async () => {
        if (!cycleName.trim()) {
            showNotification('Por favor, insira um nome para o ciclo!', 'error');
            return;
        }

        try {
            const cycleData = {
                cycleName,
                date: Timestamp.now(),
                startTime: startTime || Timestamp.now(),
                endTime: null,
                totalBalance: calculateTotalBalance(),
                entries: entries.map(entry => ({
                    motherName: entry.motherName,
                    daughterName: entry.daughterName,
                    deposit: parseFloat(entry.deposit) || 0,
                    withdrawal: parseFloat(entry.withdrawal) || 0,
                    difference: parseFloat(entry.difference) || 0
                }))
            };

            if (currentCycleId) {
                // Update existing cycle
                const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', currentCycleId);
                await updateDoc(cycleRef, cycleData);
                showNotification('Progresso salvo com sucesso!', 'success');
            } else {
                // Create new cycle
                const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'cycles'), cycleData);
                setCurrentCycleId(docRef.id);
                showNotification('Ciclo salvo com sucesso!', 'success');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
            showNotification('Erro ao salvar o ciclo. Verifique o console.', 'error');
        }
    };

    // Finalize Cycle
    const handleFinalizeCycle = async () => {
        if (!cycleName.trim()) {
            showNotification('Por favor, insira um nome para o ciclo!', 'error');
            return;
        }

        try {
            const finalEndTime = Timestamp.now();
            setEndTime(finalEndTime);
            setIsRunning(false);

            const cycleData = {
                cycleName,
                date: Timestamp.now(),
                startTime: startTime || Timestamp.now(),
                endTime: finalEndTime,
                totalBalance: calculateTotalBalance(),
                entries: entries.map(entry => ({
                    motherName: entry.motherName,
                    daughterName: entry.daughterName,
                    deposit: parseFloat(entry.deposit) || 0,
                    withdrawal: parseFloat(entry.withdrawal) || 0,
                    difference: parseFloat(entry.difference) || 0
                }))
            };

            if (currentCycleId) {
                const cycleRef = doc(db, 'users', currentUser.uid, 'cycles', currentCycleId);
                await updateDoc(cycleRef, cycleData);
            } else {
                const docRef = await addDoc(collection(db, 'users', currentUser.uid, 'cycles'), cycleData);
                setCurrentCycleId(docRef.id);
            }

            showNotification('Ciclo finalizado e salvo com sucesso!', 'success');

            // Reset after finalization
            setTimeout(() => {
                resetCycle();
            }, 2000);
        } catch (error) {
            console.error('Erro ao finalizar:', error);
            showNotification('Erro ao finalizar o ciclo. Verifique o console.', 'error');
        }
    };

    // Reset Cycle
    const resetCycle = () => {
        setCycleName('');
        setIsRunning(false);
        setElapsedTime(0);
        setStartTime(null);
        setEndTime(null);
        setCurrentCycleId(null);
        setEntries([{ motherName: '', daughterName: '', deposit: '', withdrawal: '', difference: 0 }]);
    };

    // Add New Entry
    const handleAddEntry = () => {
        setEntries([...entries, { motherName: '', daughterName: '', deposit: '', withdrawal: '', difference: 0 }]);
    };

    // Update Entry
    const handleUpdateEntry = (index, updatedEntry) => {
        const newEntries = [...entries];
        newEntries[index] = updatedEntry;
        setEntries(newEntries);
    };

    // Delete Entry
    const handleDeleteEntry = (index) => {
        if (entries.length > 1) {
            const newEntries = entries.filter((_, i) => i !== index);
            setEntries(newEntries);
        } else {
            showNotification('Deve haver pelo menos uma linha na tabela!', 'error');
        }
    };

    // Export to CSV
    const handleExportCSV = () => {
        if (!cycleName.trim()) {
            showNotification('Por favor, insira um nome para o ciclo antes de exportar!', 'error');
            return;
        }

        try {
            const csvContent = exportToCSV(cycleName, entries, startTime, endTime, elapsedTime);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `${cycleName.replace(/\s+/g, '_')}_${timestamp}.csv`;
            downloadCSV(csvContent, filename);
            showNotification('CSV exportado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            showNotification('Erro ao exportar CSV. Verifique o console.', 'error');
        }
    };

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
                                NOVO CICLO
                            </h1>
                            <div className="h-1 w-32 bg-black mt-2"></div>
                        </div>
                    </div>
                    <p className="text-sm font-mono uppercase tracking-wider text-neutral-600">
                        GERENCIE SEUS CICLOS DE CRIAÇÃO DE CONTAS
                    </p>
                </div>

                {/* Notification */}
                {notification.show && (
                    <div className={`mb-6 p-4 border-4 border-black ${notification.type === 'success' ? 'bg-green-100' :
                        notification.type === 'error' ? 'bg-red-100' :
                            'bg-blue-100'
                        }`}>
                        <div className="flex items-center gap-3">
                            <AlertCircle size={20} className="flex-shrink-0" />
                            <span className="font-mono font-bold text-sm uppercase">{notification.message}</span>
                        </div>
                    </div>
                )}

                {/* Cycle Header */}
                <CycleHeader
                    cycleName={cycleName}
                    setCycleName={setCycleName}
                    isRunning={isRunning}
                    elapsedTime={elapsedTime}
                    onStart={handleStartCycle}
                    onStop={handleStopCycle}
                    onFinalize={handleFinalizeCycle}
                    onExport={handleExportCSV}
                />

                {/* Accounts Table */}
                <AccountsTable
                    entries={entries}
                    onUpdateEntry={handleUpdateEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onAddEntry={handleAddEntry}
                />

                {/* Footer Info */}
                <div className="mt-8 pt-6 border-t-4 border-black text-center">
                    <p className="text-xs font-mono uppercase tracking-wider text-neutral-600">
                        © 2026 SISTEMA GESTOR MATCHED BETTING
                    </p>
                    <p className="text-xs font-mono uppercase tracking-wider text-neutral-600 mt-1">
                        REACT + FIREBASE
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
