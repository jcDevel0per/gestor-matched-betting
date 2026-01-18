import React from 'react';
import { Play, Square, CheckCircle, Download } from 'lucide-react';

const CycleHeader = ({
    cycleName,
    setCycleName,
    isRunning,
    elapsedTime,
    onStart,
    onStop,
    onFinalize,
    onExport
}) => {
    const formatTime = (seconds) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card-brutalist mb-8">
            <div className="flex flex-col gap-6">
                {/* Cycle Name Input */}
                <div>
                    <label className="block text-xs font-mono font-bold uppercase tracking-wider mb-2">
                        NOME DO CICLO
                    </label>
                    <input
                        type="text"
                        value={cycleName}
                        onChange={(e) => setCycleName(e.target.value)}
                        placeholder="EX: CICLO MANHÃ 15/01"
                        className="input-brutalist w-full"
                    />
                </div>

                {/* Timer Display */}
                <div className="bg-neutral-100 border-4 border-black p-6">
                    <div className="text-center">
                        <div className="text-xs font-mono font-bold uppercase tracking-wider mb-2">
                            TEMPO DECORRIDO
                        </div>
                        <div className={`text-5xl font-black font-mono ${isRunning ? 'text-green-600' : 'text-neutral-900'}`}>
                            {formatTime(elapsedTime)}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {!isRunning ? (
                        <button
                            onClick={onStart}
                            className="btn-brutalist-success flex items-center justify-center gap-2"
                        >
                            <Play size={18} />
                            <span>INICIAR CICLO</span>
                        </button>
                    ) : (
                        <button
                            onClick={onStop}
                            className="btn-brutalist-danger flex items-center justify-center gap-2"
                        >
                            <Square size={18} />
                            <span>PARAR CICLO</span>
                        </button>
                    )}

                    <button
                        onClick={onFinalize}
                        className="btn-brutalist flex items-center justify-center gap-2"
                    >
                        <CheckCircle size={18} />
                        <span>FINALIZAR CICLO</span>
                    </button>

                    <button
                        onClick={onExport}
                        className="btn-brutalist-success flex items-center justify-center gap-2"
                        title="Exportar para CSV (Google Sheets)"
                    >
                        <Download size={18} />
                        <span>EXPORTAR CSV</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CycleHeader;
