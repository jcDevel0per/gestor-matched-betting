import React from 'react';

const TableFooter = ({ entries }) => {
    const calculateTotals = () => {
        return entries.reduce((acc, entry) => {
            acc.deposit += parseFloat(entry.deposit) || 0;
            acc.withdrawal += parseFloat(entry.withdrawal) || 0;
            acc.difference += parseFloat(entry.difference) || 0;
            return acc;
        }, { deposit: 0, withdrawal: 0, difference: 0 });
    };

    const totals = calculateTotals();

    const getDifferenceColor = () => {
        if (totals.difference > 0) return 'text-green-600';
        if (totals.difference < 0) return 'text-red-600';
        return 'text-neutral-900';
    };

    return (
        <tfoot className="bg-neutral-900 text-white">
            <tr>
                <td colSpan="2" className="px-4 py-4 text-right font-mono font-black uppercase text-sm border-r-2 border-white">
                    TOTAL GERAL:
                </td>
                <td className="px-4 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                    R$ {totals.deposit.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-right font-mono font-black text-sm border-r-2 border-white">
                    R$ {totals.withdrawal.toFixed(2)}
                </td>
                <td className={`px-4 py-4 text-right font-mono font-black text-sm border-r-2 border-white ${getDifferenceColor()}`}>
                    R$ {totals.difference.toFixed(2)}
                </td>
                <td className="px-4 py-4"></td>
            </tr>
        </tfoot>
    );
};

export default TableFooter;
