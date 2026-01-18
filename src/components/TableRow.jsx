import React from 'react';
import { Trash2 } from 'lucide-react';

const TableRow = ({ entry, index, onUpdate, onDelete }) => {
    const handleChange = (field, value) => {
        const updatedEntry = { ...entry, [field]: value };

        // Calculate difference
        const deposit = parseFloat(updatedEntry.deposit) || 0;
        const withdrawal = parseFloat(updatedEntry.withdrawal) || 0;
        updatedEntry.difference = withdrawal - deposit;

        onUpdate(index, updatedEntry);
    };

    const getDifferenceColor = () => {
        if (entry.difference > 0) return 'text-green-600';
        if (entry.difference < 0) return 'text-red-600';
        return 'text-neutral-900';
    };

    return (
        <tr className="border-b-2 border-black hover:bg-yellow-50 transition-colors">
            <td className="p-2 border-r-2 border-black">
                <input
                    type="text"
                    value={entry.motherName}
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    placeholder="CONTA MÃE"
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold text-sm uppercase focus:outline-none focus:ring-0"
                />
            </td>
            <td className="p-2 border-r-2 border-black">
                <input
                    type="text"
                    value={entry.daughterName}
                    onChange={(e) => handleChange('daughterName', e.target.value)}
                    placeholder="CONTA FILHA"
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold text-sm uppercase focus:outline-none focus:ring-0"
                />
            </td>
            <td className="p-2 border-r-2 border-black">
                <input
                    type="number"
                    value={entry.deposit}
                    onChange={(e) => handleChange('deposit', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold text-sm text-right focus:outline-none focus:ring-0"
                />
            </td>
            <td className="p-2 border-r-2 border-black">
                <input
                    type="number"
                    value={entry.withdrawal}
                    onChange={(e) => handleChange('withdrawal', e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-3 py-2 border-2 border-black font-mono font-bold text-sm text-right focus:outline-none focus:ring-0"
                />
            </td>
            <td className="p-2 border-r-2 border-black">
                <div className={`px-3 py-2 font-mono font-black text-sm text-right ${getDifferenceColor()}`}>
                    R$ {(entry.difference || 0).toFixed(2)}
                </div>
            </td>
            <td className="p-2">
                <button
                    onClick={() => onDelete(index)}
                    className="w-full px-3 py-2 bg-red-600 text-white border-2 border-black hover:bg-white hover:text-red-600 transition-colors flex items-center justify-center"
                    title="Excluir"
                >
                    <Trash2 size={16} />
                </button>
            </td>
        </tr>
    );
};

export default TableRow;
