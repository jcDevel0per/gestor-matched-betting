import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "CONFIRMAR", cancelText = "CANCELAR", type = "warning" }) => {
    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const getTypeColor = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600';
            case 'warning':
                return 'bg-yellow-600';
            case 'info':
                return 'bg-blue-600';
            default:
                return 'bg-yellow-600';
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white border-4 border-black max-w-md w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className={`${getTypeColor()} text-white p-4 border-b-4 border-black flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <h2 className="text-lg font-mono font-black uppercase">{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="hover:bg-black/20 p-1 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-sm font-mono leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-4 border-t-4 border-black bg-neutral-50">
                    <button
                        onClick={onClose}
                        className="btn-brutalist-secondary flex-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 font-mono font-bold uppercase px-4 py-2 border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none ${type === 'danger'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
