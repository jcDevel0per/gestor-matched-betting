import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger animation on mount
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-500',
                    icon: <CheckCircle size={20} className="flex-shrink-0" />
                };
            case 'error':
                return {
                    bg: 'bg-red-500',
                    icon: <XCircle size={20} className="flex-shrink-0" />
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500',
                    icon: <AlertCircle size={20} className="flex-shrink-0" />
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500',
                    icon: <Info size={20} className="flex-shrink-0" />
                };
        }
    };

    const { bg, icon } = getTypeStyles();

    return (
        <div
            className={`
                ${bg} text-white
                border-4 border-black
                shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                min-w-[320px] max-w-[400px]
                pointer-events-auto
                transition-all duration-300 ease-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'}
            `}
        >
            <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5">
                    {icon}
                </div>
                <p className="flex-1 font-mono font-bold text-sm uppercase leading-tight">
                    {message}
                </p>
                <button
                    onClick={handleClose}
                    className="flex-shrink-0 hover:bg-black/20 transition-colors p-1 -m-1"
                    aria-label="Fechar"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
