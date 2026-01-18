import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, TrendingUp, Trash2, Eye } from 'lucide-react';

const CycleCard = ({ cycle, onDelete }) => {
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString('pt-BR');
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
        return date.toLocaleTimeString('pt-BR');
    };

    const calculateDuration = () => {
        if (!cycle.startTime || !cycle.endTime) return 'EM ANDAMENTO';
        const start = cycle.startTime.seconds;
        const end = cycle.endTime.seconds;
        const duration = end - start;
        const hours = Math.floor(duration / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        return `${hours}H ${minutes}M`;
    };



    const getTotalColor = () => {
        if (cycle.totalBalance > 0) return 'text-green-600';
        if (cycle.totalBalance < 0) return 'text-red-600';
        return 'text-neutral-900';
    };

    return (
        <div className="card-brutalist">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 pb-4 border-b-4 border-black">
                <div>
                    <h3 className="text-xl font-mono font-black uppercase tracking-tighter mb-2">
                        {cycle.cycleName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-600">
                        <Calendar size={12} />
                        <span>{formatDate(cycle.date)}</span>
                    </div>
                </div>
                <div className={`text-2xl font-mono font-black ${getTotalColor()}`}>
                    R$ {(cycle.totalBalance || 0).toFixed(2)}
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-neutral-100 border-2 border-black p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-neutral-600" />
                        <p className="text-xs font-mono uppercase text-neutral-600">INÍCIO</p>
                    </div>
                    <p className="text-sm font-mono font-bold">{formatTime(cycle.startTime)}</p>
                </div>
                <div className="bg-neutral-100 border-2 border-black p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-neutral-600" />
                        <p className="text-xs font-mono uppercase text-neutral-600">FIM</p>
                    </div>
                    <p className="text-sm font-mono font-bold">
                        {cycle.endTime ? formatTime(cycle.endTime) : 'EM ANDAMENTO'}
                    </p>
                </div>
                <div className="bg-neutral-100 border-2 border-black p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-neutral-600" />
                        <p className="text-xs font-mono uppercase text-neutral-600">DURAÇÃO</p>
                    </div>
                    <p className="text-sm font-mono font-bold">{calculateDuration()}</p>
                </div>
                <div className="bg-neutral-100 border-2 border-black p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp size={14} className="text-neutral-600" />
                        <p className="text-xs font-mono uppercase text-neutral-600">CONTAS</p>
                    </div>
                    <p className="text-sm font-mono font-bold">{cycle.entries?.length || 0}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t-4 border-black">
                <button
                    onClick={() => navigate(`/cycle/${cycle.id}`)}
                    className="px-3 py-2 bg-black text-white border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"
                    title="Ver Detalhes"
                >
                    <Eye size={16} />
                    <span className="text-xs font-mono font-bold uppercase hidden md:inline">VER</span>
                </button>

                <button
                    onClick={() => onDelete(cycle.id)}
                    className="px-3 py-2 bg-red-600 text-white border-2 border-black hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center gap-1"
                    title="Excluir"
                >
                    <Trash2 size={16} />
                    <span className="text-xs font-mono font-bold uppercase hidden md:inline">DEL</span>
                </button>
            </div>
        </div>
    );
};

export default CycleCard;
