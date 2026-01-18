import React from 'react';
import TableRow from './TableRow';
import TableFooter from './TableFooter';
import { Plus } from 'lucide-react';

const AccountsTable = ({ entries, onUpdateEntry, onDeleteEntry, onAddEntry }) => {
    return (
        <div className="card-brutalist">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">
                GESTÃO DE CONTAS
            </h2>

            <div className="overflow-x-auto">
                <table className="w-full border-4 border-black">
                    <thead className="bg-black text-white">
                        <tr>
                            <th className="px-4 py-3 text-left font-mono font-bold uppercase text-xs tracking-wider border-r-2 border-white">
                                CONTA MÃE
                            </th>
                            <th className="px-4 py-3 text-left font-mono font-bold uppercase text-xs tracking-wider border-r-2 border-white">
                                CONTA FILHA
                            </th>
                            <th className="px-4 py-3 text-right font-mono font-bold uppercase text-xs tracking-wider border-r-2 border-white">
                                DEPÓSITO FILHA (R$)
                            </th>
                            <th className="px-4 py-3 text-right font-mono font-bold uppercase text-xs tracking-wider border-r-2 border-white">
                                SAQUE (R$)
                            </th>
                            <th className="px-4 py-3 text-right font-mono font-bold uppercase text-xs tracking-wider border-r-2 border-white">
                                DIFERENÇA (R$)
                            </th>
                            <th className="px-4 py-3 text-center font-mono font-bold uppercase text-xs tracking-wider">
                                AÇÕES
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {entries.map((entry, index) => (
                            <TableRow
                                key={index}
                                entry={entry}
                                index={index}
                                onUpdate={onUpdateEntry}
                                onDelete={onDeleteEntry}
                            />
                        ))}
                    </tbody>
                    <TableFooter entries={entries} />
                </table>
            </div>

            <button
                onClick={onAddEntry}
                className="mt-6 w-full btn-brutalist-secondary flex items-center justify-center gap-2"
            >
                <Plus size={20} />
                <span>ADICIONAR NOVA LINHA</span>
            </button>
        </div>
    );
};

export default AccountsTable;
