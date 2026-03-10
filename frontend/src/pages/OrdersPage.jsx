import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getOrders, getCustomers, updateOrderStatus } from '../api/apiService';
import { ShoppingCart, CheckCircle2, ChevronDown, PackageSearch, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
    const { user, isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [oRes, cRes] = await Promise.all([getOrders(), getCustomers()]);

            // Filter if not admin
            if (!isAdmin) {
                setOrders(oRes.filter(o => o.AssignedUserID === user?.UserID));
            } else {
                setOrders(oRes);
            }
            setCustomers(cRes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const statusColors = {
        'Pending': 'bg-yellow-50 text-yellow-800 border-yellow-200',
        'Confirmed': 'bg-blue-50 text-blue-800 border-blue-200',
        'Dispatched': 'bg-orange-50 text-orange-800 border-orange-200',
        'Delivered': 'bg-green-50 text-green-800 border-green-200',
        'Cancelled': 'bg-red-50 text-red-800 border-red-200'
    };

    const handleStatusChange = async (oId, newStatus) => {
        try {
            await updateOrderStatus(oId, newStatus);
            setOrders(orders.map(o => o.OrderID === oId ? { ...o, "OrderStatus (Pending/Confirmed/Dispatched/Delivered/Cancelled)": newStatus } : o));
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const filtered = orders.filter(o => statusFilter === 'All' || o['OrderStatus (Pending/Confirmed/Dispatched/Delivered/Cancelled)'] === statusFilter);

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading orders...</div>;

    return (
        <div className="space-y-6">

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingCart className="text-primary" /> Orders Management</h2>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-bold focus:ring-primary focus:border-primary">
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Order ID</th>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Product & Qty</th>
                                <th className="px-6 py-4 font-semibold">Schedule</th>
                                <th className="px-6 py-4 font-semibold">Status Update</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(o => {
                                const c = customers.find(x => x.CustomerID === o.CustomerID);
                                const status = o['OrderStatus (Pending/Confirmed/Dispatched/Delivered/Cancelled)'];

                                return (
                                    <tr key={o.OrderID} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500 font-bold">{o.OrderID}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{c?.CustomerName}</p>
                                            <p className="text-xs text-gray-500">{c?.CompanyName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900 flex items-center gap-1"><Package size={14} className="text-gray-400" /> {o.ProductOrdered}</p>
                                            <p className="text-xs font-bold text-primary mt-0.5">{o.OrderQuantity}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-xs">
                                            <div><span className="font-bold text-gray-500">Ordered:</span> {new Date(o.OrderDate).toLocaleDateString()}</div>
                                            <div className="mt-1"><span className="font-bold text-gray-500">Dispatch:</span> {o.DispatchSchedule ? o.DispatchSchedule : 'TBD'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="relative inline-block w-36">
                                                <select
                                                    value={status}
                                                    onChange={(e) => handleStatusChange(o.OrderID, e.target.value)}
                                                    className={`appearance-none w-full px-3 py-1.5 pr-8 rounded-md text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary ${statusColors[status]}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Confirmed">Confirmed</option>
                                                    <option value="Dispatched">Dispatched</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                <ChevronDown size={14} className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-current" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/leads/${o.LeadID}`} className="text-primary font-bold hover:underline bg-blue-50 px-3 py-1.5 rounded border border-blue-100 transition-colors">View Link</Link>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-500">No orders found.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}