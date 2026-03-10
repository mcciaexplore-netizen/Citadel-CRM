import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getPayments, getCustomers, updatePayment, approveCredit } from '../api/apiService';
import { CreditCard, CheckCircle2, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

export default function PaymentsPage() {
    const { user, isAdmin } = useAuth();
    const [payments, setPayments] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('All');
    const [showOverdueOnly, setShowOverdueOnly] = useState(false);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pRes, cRes] = await Promise.all([getPayments(), getCustomers()]);
            // Simple role filtering -> ideally we should filter orders by staff, then payments.
            // But for display layout logic assume Admin looks at this route usually.
            setPayments(pRes);
            setCustomers(cRes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (pId, total) => {
        try {
            await updatePayment(pId, { PaidAmount: total });
            setPayments(pay => pay.map(p => p.PaymentID === pId ? { ...p, PaidAmount: total, OutstandingAmount: "0.00", "PaymentStatus (Pending/Partial/Paid)": "Paid" } : p));
        } catch (e) {
            alert("Failed recording payment");
        }
    };

    const handleApproveCredit = async (pId) => {
        try {
            await approveCredit(pId);
            setPayments(pay => pay.map(p => p.PaymentID === pId ? { ...p, "CreditApprovalStatus (NotRequired/PendingApproval/Approved/Rejected)": "Approved" } : p));
        } catch (e) {
            alert("Failed approving credit limit");
        }
    }

    const todayZero = new Date().setHours(0, 0, 0, 0);

    const filtered = payments.filter(p => {
        const sMatch = statusFilter === 'All' || p['PaymentStatus (Pending/Partial/Paid)'] === statusFilter;
        let oMatch = true;
        if (showOverdueOnly) {
            const d = new Date(p.DueDate).getTime();
            oMatch = d < todayZero && p['PaymentStatus (Pending/Partial/Paid)'] !== 'Paid';
        }
        return sMatch && oMatch;
    });

    // Calculate Metrics
    const metrics = payments.reduce((acc, p) => {
        if (p['PaymentStatus (Pending/Partial/Paid)'] !== 'Paid') {
            acc.outstanding += parseFloat(p.OutstandingAmount || 0);
            const d = new Date(p.DueDate).getTime();
            if (d < todayZero) acc.overdue += parseFloat(p.OutstandingAmount || 0);
        }
        acc.collected += parseFloat(p.PaidAmount || 0);
        return acc;
    }, { outstanding: 0, overdue: 0, collected: 0 });

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading ledgers...</div>;

    return (
        <div className="space-y-6">

            {/* Metric Cards Top */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-1">Total Outstanding</p>
                        <p className="text-3xl font-black text-gray-900">₹{metrics.outstanding.toFixed(2)}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-full"><Clock size={28} className="text-orange-500" /></div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-red-100 flex items-center justify-between hover:shadow-md transition-shadow lg:-mt-2 transform">
                    <div>
                        <p className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><AlertTriangle size={14} /> Overdue Amount</p>
                        <p className="text-3xl font-black text-red-700">₹{metrics.overdue.toFixed(2)}</p>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-green-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-bold text-green-600 uppercase tracking-widest mb-1">Total Collected</p>
                        <p className="text-3xl font-black text-gray-900">₹{metrics.collected.toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-full"><TrendingUp size={28} className="text-green-500" /></div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><CreditCard className="text-primary" /> Accounts Receivables</h2>
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer user-select-none">
                        <input type="checkbox" checked={showOverdueOnly} onChange={() => setShowOverdueOnly(!showOverdueOnly)} className="w-4 h-4 text-red-500 rounded ring-red-500" />
                        <span className="text-red-600">Overdue Only</span>
                    </label>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-bold focus:ring-primary focus:border-primary">
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Invoice Details</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Financials (₹)</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold">Payment Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(p => {
                                const c = customers.find(x => x.CustomerID === p.CustomerID);
                                const status = p['PaymentStatus (Pending/Partial/Paid)'];
                                const dDate = new Date(p.DueDate);
                                const isOverdue = dDate.getTime() < todayZero && status !== 'Paid';
                                const creditStatus = p['CreditApprovalStatus (NotRequired/PendingApproval/Approved/Rejected)'];

                                return (
                                    <tr key={p.PaymentID} className={`transition-colors ${isOverdue ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-gray-50'}`}>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 border-b border-gray-100 pb-0.5 inline-block">{p.InvoiceNumber}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-1">Ord: {p.OrderID}</p>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-800">{c?.CustomerName}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-between max-w-[140px] text-xs"><span className="text-gray-500">Total:</span><span className="font-bold text-gray-900">{parseFloat(p.TotalAmount).toFixed(2)}</span></div>
                                            <div className="flex justify-between max-w-[140px] text-xs my-0.5"><span className="text-gray-500">Paid:</span><span className="font-bold text-green-600">{parseFloat(p.PaidAmount).toFixed(2)}</span></div>
                                            <div className="flex justify-between max-w-[140px] text-xs pt-0.5 border-t border-gray-100"><span className="text-gray-500">Dues:</span><span className={`font-black ${isOverdue ? 'text-red-600' : 'text-orange-600'}`}>{parseFloat(p.OutstandingAmount).toFixed(2)}</span></div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`font-bold ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>{dDate.toLocaleDateString()}</p>
                                            {isOverdue && <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mt-0.5">Overdue</p>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wide
                        ${status === 'Pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                                    status === 'Partial' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                        'bg-green-100 text-green-800 border-green-200'}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex flex-col items-end gap-2">
                                                {status !== 'Paid' && (
                                                    <button onClick={() => handleMarkPaid(p.PaymentID, p.TotalAmount)} className="bg-white border border-green-300 text-green-700 hover:bg-green-50 px-3 py-1.5 rounded text-xs font-bold transition-colors shadow-sm whitespace-nowrap">
                                                        Mark Paid
                                                    </button>
                                                )}
                                                {isAdmin && creditStatus === 'PendingApproval' && (
                                                    <button onClick={() => handleApproveCredit(p.PaymentID)} className="bg-orange-100 border border-orange-300 text-orange-800 hover:bg-orange-200 px-3 py-1.5 rounded text-[10px] font-black tracking-widest uppercase transition-colors shadow-sm text-center">
                                                        Approve Credit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No payment ledgers found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}