import React from 'react';
import { Calendar } from 'lucide-react';

const DateSelector = ({ selectedDate, onDateChange }) => {
    const formatDateForInput = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateDisplay = (date) => {
        return new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get today's date for max restriction
    const today = new Date();
    const maxDate = formatDateForInput(today);

    return (
        <div className="flex items-center gap-3">
            <Calendar size={20} className="text-neutral-600" />
            <div className="flex items-center gap-2">
                <label className="text-xs font-mono font-bold uppercase text-neutral-600">
                    DATA:
                </label>
                <input
                    type="date"
                    value={formatDateForInput(selectedDate)}
                    onChange={(e) => {
                        // Parse date in local timezone to avoid day shift
                        const [year, month, day] = e.target.value.split('-');
                        const localDate = new Date(year, month - 1, day);
                        onDateChange(localDate);
                    }}
                    max={maxDate}
                    className="px-4 py-2 border-4 border-black font-mono font-bold text-sm focus:outline-none focus:ring-0 bg-white"
                />
                <span className="text-sm font-mono font-bold">
                    {formatDateDisplay(selectedDate)}
                </span>
            </div>
        </div>
    );
};

export default DateSelector;
