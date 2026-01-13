import React from "react";
import { TrendingUp, TrendingDown, IndianRupee, Wallet } from "lucide-react";

export interface Transaction {
    id: string;
    amount: number;
    source: string;
    type: 'income' | 'expense';
    date: string;
}

interface FinanceWorkspaceProps {
    transactions: Transaction[];
}

export const FinanceWorkspace: React.FC<FinanceWorkspaceProps> = ({ transactions }) => {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    // Mock expense for visualization if none exists
    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
        <div className="h-full w-full p-8 flex flex-col animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-8 font-serif">
                FINANCIAL LEDGER
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet size={48} className="text-gray-900" />
                    </div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-2">Total Balance</p>
                    <p className="text-4xl font-serif font-bold text-gray-900 tracking-tight">₹{balance.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={48} className="text-emerald-600" />
                    </div>
                    <p className="text-emerald-700/60 text-sm font-bold uppercase tracking-wider mb-2">Total Income</p>
                    <p className="text-4xl font-serif font-bold text-emerald-700 tracking-tight">+₹{totalIncome.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-md relative overflow-hidden group hover:shadow-lg transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingDown size={48} className="text-rose-600" />
                    </div>
                    <p className="text-rose-700/60 text-sm font-bold uppercase tracking-wider mb-2">Total Expenses</p>
                    <p className="text-4xl font-serif font-bold text-rose-700 tracking-tight">-₹{totalExpense.toLocaleString('en-IN')}</p>
                </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-md flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="text-lg font-serif font-bold text-gray-900">Recent Transactions</h3>
                    <div className="text-xs text-gray-400 font-mono uppercase tracking-widest">Live Feed</div>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-3">
                    {transactions.length > 0 ? (
                        transactions.map((t) => (
                            <div key={t.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-gray-100 hover:border-gray-300 transition-all group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                        <IndianRupee size={18} />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-gray-900">{t.source}</p>
                                        <p className="text-xs text-gray-500">{t.date}</p>
                                    </div>
                                </div>
                                <span className={`text-lg font-bold font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                            <Wallet size={32} className="opacity-20" />
                            <p className="font-serif italic">No transactions logged yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
