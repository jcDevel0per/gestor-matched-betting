import React from 'react';
import { Plus } from 'lucide-react';
import CycleKanbanCard from './CycleKanbanCard';
import { useDroppable } from '@dnd-kit/core';

const KanbanColumn = ({ title, stage, cycles, onCycleClick, onNewCycle, onDeleteCycle, onDuplicateCycle, onUpdateCycle, showNewButton = false }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: stage,
    });

    const getStageColor = () => {
        switch (stage) {
            case 'criacao':
                return 'bg-blue-600';
            case 'bonus':
                return 'bg-orange-600';
            case 'ativacao':
                return 'bg-purple-600';
            case 'finalizado':
                return 'bg-green-600';
            default:
                return 'bg-neutral-600';
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Column Header */}
            <div className={`${getStageColor()} text-white p-4 border-4 border-black`}>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-mono font-black uppercase">{title}</h2>
                    <div className="w-8 h-8 bg-white text-black border-2 border-black flex items-center justify-center font-mono font-black">
                        {cycles.length}
                    </div>
                </div>
            </div>

            {/* Column Content - Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 bg-neutral-100 border-4 border-t-0 border-black p-4 min-h-[500px] transition-colors ${isOver ? 'bg-blue-100 ring-4 ring-blue-500' : ''
                    }`}
            >
                <div className="space-y-3">
                    {cycles.map((cycle) => (
                        <CycleKanbanCard
                            key={cycle.id}
                            cycle={cycle}
                            onClick={() => onCycleClick(cycle)}
                            onDelete={onDeleteCycle}
                            onDuplicate={onDuplicateCycle}
                            onUpdate={onUpdateCycle}
                        />
                    ))}

                    {cycles.length === 0 && !onNewCycle && (
                        <div className="text-center py-12">
                            <p className="text-sm font-mono text-neutral-400 uppercase">
                                Nenhum ciclo nesta etapa
                            </p>
                        </div>
                    )}
                </div>

                {/* New Cycle Button */}
                {onNewCycle && (
                    <button
                        onClick={onNewCycle}
                        className="w-full mt-4 btn-brutalist-success flex items-center justify-center gap-2 py-3"
                    >
                        <Plus size={18} />
                        <span>NOVO CICLO</span>
                    </button>
                )}
            </div>
        </div>
    );
};

export default KanbanColumn;
