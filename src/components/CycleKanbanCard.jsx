import React from 'react';
import { Edit2, GripVertical, Trash2, Copy, CheckCircle, Clock } from 'lucide-react';
import { formatTime, getStageTime, getCumulativeTime, getAccountBreakdown } from '../utils/cycleHelpers';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const CycleKanbanCard = ({ cycle, onClick, onDelete, onDuplicate, onUpdate }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: cycle.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const getStageColor = () => {
        switch (cycle.stage) {
            case 'criacao':
                return 'border-blue-600 bg-blue-50';
            case 'bonus':
                return 'border-orange-600 bg-orange-50';
            case 'ativacao':
                return 'border-purple-600 bg-purple-50';
            case 'finalizado':
                return 'border-green-600 bg-green-50';
            default:
                return 'border-neutral-600 bg-neutral-50';
        }
    };

    const stageTime = getStageTime(cycle);
    const cumulativeTime = getCumulativeTime(cycle);
    const accountBreakdown = getAccountBreakdown(cycle);
    const accountsActivated = cycle.ativacao?.accountsActivated || false;

    const handleToggleActivation = (e) => {
        e.stopPropagation();
        if (!onUpdate) return;

        const updatedCycle = {
            ...cycle,
            ativacao: {
                ...cycle.ativacao,
                accountsActivated: !accountsActivated
            }
        };
        onUpdate(updatedCycle);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`card-brutalist ${getStageColor()} hover:shadow-brutalist-lg transition-all ${isDragging ? 'shadow-brutalist-lg scale-105 rotate-2' : ''
                }`}
        >
            {/* Header with Drag Handle and Actions */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <button
                        {...listeners}
                        {...attributes}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-black/10 rounded"
                        title="Arrastar"
                    >
                        <GripVertical size={16} />
                    </button>
                    <h3 className="text-sm font-mono font-black uppercase">
                        {cycle.cycleName}
                    </h3>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick();
                        }}
                        className="p-2 hover:bg-black/10 rounded transition-colors border-2 border-transparent hover:border-black"
                        title="Editar ciclo"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate?.(cycle.id);
                        }}
                        className="p-2 hover:bg-blue-100 rounded transition-colors border-2 border-transparent hover:border-blue-600 text-blue-600"
                        title="Duplicar ciclo"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(cycle.id);
                        }}
                        className="p-2 hover:bg-red-100 rounded transition-colors border-2 border-transparent hover:border-red-600 text-red-600"
                        title="Deletar ciclo"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Time Information */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-600">TEMPO ETAPA:</span>
                    <span className="font-mono font-bold">{formatTime(stageTime)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-neutral-600">TEMPO TOTAL:</span>
                    <span className="font-mono font-bold text-green-600">{formatTime(cumulativeTime)}</span>
                </div>
            </div>

            {/* Account Information */}
            <div className="pt-2 border-t-2 border-black/20">
                <p className="text-xs font-mono text-neutral-600 mb-1">CONTAS:</p>
                <p className="text-xs font-mono font-bold">{accountBreakdown}</p>
            </div>

            {/* Activation Status (only for ativacao stage) */}
            {cycle.stage === 'ativacao' && (
                <div className="mt-2 pt-2 border-t-2 border-black/20">
                    <button
                        onClick={handleToggleActivation}
                        className={`w-full flex items-center justify-center gap-2 text-xs font-mono font-bold py-1 px-2 rounded transition-colors ${accountsActivated
                                ? 'text-green-600 hover:bg-green-100'
                                : 'text-orange-600 hover:bg-orange-100'
                            }`}>
                        {accountsActivated ? (
                            <>
                                <CheckCircle size={14} />
                                <span>CONTAS ATIVADAS</span>
                            </>
                        ) : (
                            <>
                                <Clock size={14} />
                                <span>AGUARDANDO ATIVAÇÃO</span>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CycleKanbanCard;
