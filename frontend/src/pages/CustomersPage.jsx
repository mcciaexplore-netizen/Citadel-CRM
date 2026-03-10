import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomers, getLeads, getUsers, createCustomer } from '../api/apiService';
import { getVisibleCustomers } from '../utils/permissions';
import { useSyncData } from '../hooks/useSyncData';
import { Search, Plus, Building2, Phone, Mail, MapPin, Eye, FileText, CheckCircle2, X, Upload, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function CustomersPage() {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { syncing, getLastSyncDisplay, syncData } = useSyncData();

    const [customers, setCustomers] = useState([]);
    const [leads, setLeads] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState({ CustomerName: '', Phone: '', Email: '', CompanyName: '', City: '', GSTNumber: '' });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, lRes, uRes] = await Promise.all([
                getCustomers(isAdmin ? {} : { staffID: user?.UserID }),
                getLeads(isAdmin ? {} : { assignedUser: user?.UserID }),
                getUsers()
            ]);
            // Apply permission-based filtering
            const filteredCustomers = getVisibleCustomers(cRes, user);
            setCustomers(filteredCustomers);
            setLeads(lRes);
            setUsers(uRes);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const filtered = customers.filter(c => {
        const search = searchTerm.toLowerCase();
        return (
            c.CustomerName?.toLowerCase().includes(search) ||
            c.Phone?.includes(search) ||
            c.CompanyName?.toLowerCase().includes(search) ||
            c.City?.toLowerCase().includes(search)
        );
    });

    const getCustomerStats = (customerId) => {
        const custLeads = leads.filter(l => l.CustomerID === customerId);
        return {
            leadsCount: custLeads.length,
            lastOrder: 'N/A' // Need orders to show last order exactly, keeping simple or could fetch orders
        };
    };

    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        let err = {};
        if (!form.CustomerName.trim()) err.CustomerName = 'Required';
        if (!form.Phone.trim() || form.Phone.length < 10) err.Phone = 'Valid phone required';
        if (Object.keys(err).length > 0) return setErrors(err);

        setSubmitting(true);
        try {
            await createCustomer({ ...form, AssignedUserID: user?.UserID });
            showToast('Customer created successfully');
            setIsModalOpen(false);
            setForm({ CustomerName: '', Phone: '', Email: '', CompanyName: '', City: '', GSTNumber: '' });
            fetchData();
        } catch (e) {
            alert("Error creating customer");
        } finally {
            setSubmitting(false);
        }
    };

    // Pull-to-refresh
    const [touchStartY, setTouchStartY] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleTouchStart = (e) => {
        if (window.scrollY === 0) setTouchStartY(e.touches[0].clientY);
        else setTouchStartY(0);
    };

    const handleTouchMove = (e) => {
        if (touchStartY === 0) return;
        const currentY = e.touches[0].clientY;
        if (currentY - touchStartY > 80 && !isRefreshing) {
            setIsRefreshing(true);
            setTouchStartY(0);
            fetchData().finally(() => setIsRefreshing(false));
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Loading customers...</div>;

    return (
        <div
            className="space-y-6 min-h-[50vh]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            {isRefreshing && (
                <div className="flex justify-center py-4 absolute top-0 left-0 right-0 z-10 bg-white shadow-sm border-b animate-in slide-in-from-top-full">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-primary font-bold text-sm">Refreshing...</span>
                </div>
            )}
            {toastMessage && (
                <div className="fixed top-20 right-4 z-50 bg-green-50 text-green-800 border border-green-200 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}

            {/* Top Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search name, phone, company, city..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary px-4 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap">
                        <Upload size={18} /> Import Excel / CSV
                        <input
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setLoading(true);

                                try {
                                    const reader = new FileReader();
                                    reader.onload = async (evt) => {
                                        const bstr = evt.target.result;
                                        const workbook = XLSX.read(bstr, { type: 'binary' });
                                        const wsname = workbook.SheetNames[0];
                                        const ws = workbook.Sheets[wsname];
                                        const data = XLSX.utils.sheet_to_json(ws);

                                        let successCount = 0;
                                        let skipCount = 0;

                                        for (const row of data) {
                                            // Extract Name
                                            const name = row.Name || row.CustomerName || row['Customer Name'] || row.name || row.customer || Object.values(row)[0];
                                            // Extract Phone
                                            const phone = row.Phone || row['Phone Number'] || row.phone || row.Mobile || row.mobile || row.Contact || Object.values(row)[1] || '0000000000';

                                            if (name) {
                                                try {
                                                    await createCustomer({
                                                        CustomerName: String(name),
                                                        Phone: String(phone),
                                                        Email: row.Email || '',
                                                        CompanyName: row.Company || row.CompanyName || '',
                                                        City: row.City || '',
                                                        GSTNumber: '',
                                                        AssignedUserID: user?.UserID
                                                    });
                                                    successCount++;
                                                } catch (rowError) {
                                                    console.error(`Failed to import customer: ${name}`, rowError);
                                                    skipCount++;
                                                }
                                            }
                                        }

                                        setLoading(false);
                                        let msg = `✅ Imported ${successCount} customer records from ${file.name}`;
                                        if (skipCount > 0) msg += ` (${skipCount} failed)`;
                                        showToast(msg);
                                        e.target.value = '';
                                        fetchData(); // Refresh the table
                                    };
                                    reader.readAsBinaryString(file);
                                } catch (error) {
                                    console.error(error);
                                    setLoading(false);
                                    showToast("Failed to parse file.");
                                    e.target.value = '';
                                }
                            }}
                        />
                    </label>
                    <button
                        onClick={() => syncData([fetchData])}
                        disabled={syncing}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-bold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Refresh data (${getLastSyncDisplay()})`}
                    >
                        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                    <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-800 transition-colors whitespace-nowrap">
                        <Plus size={18} /> New Customer
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Customer</th>
                                <th className="px-6 py-4 font-semibold">Contact Info</th>
                                <th className="px-6 py-4 font-semibold">Location & Company</th>
                                <th className="px-6 py-4 font-semibold text-center">Leads Count</th>
                                {isAdmin && <th className="px-6 py-4 font-semibold">Assigned To</th>}
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(c => {
                                const stats = getCustomerStats(c.CustomerID);
                                const assigned = users.find(u => u.UserID === c.AssignedUserID);
                                return (
                                    <tr key={c.CustomerID} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{c.CustomerName}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{c.CustomerID}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 space-y-1">
                                            <div className="flex items-center gap-2"><Phone size={14} className="text-primary" /> {c.Phone}</div>
                                            {c.Email && <div className="flex items-center gap-2"><Mail size={14} className="text-primary" /> {c.Email}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 space-y-1">
                                            {c.CompanyName && <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400" /> {c.CompanyName}</div>}
                                            {c.City && <div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400" /> {c.City}</div>}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center bg-blue-50 text-primary font-bold w-8 h-8 rounded-full border border-blue-100">
                                                {stats.leadsCount}
                                            </span>
                                        </td>
                                        {isAdmin && <td className="px-6 py-4 text-gray-600">{assigned?.FullName || c.AssignedUserID}</td>}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link to={`/leads?customer=${c.CustomerID}`} className="text-primary hover:bg-blue-50 p-2 rounded-md flex items-center gap-1 font-bold" title="Add Lead">
                                                    <Plus size={16} /> Lead
                                                </Link>
                                                <Link to={`/customers/${c.CustomerID}`} className="text-gray-500 hover:text-primary hover:bg-blue-50 p-2 rounded-md" title="View Profile">
                                                    <Eye size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filtered.length === 0 && (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                    <form onSubmit={handleCreateCustomer} className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Add New Customer</h2>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:bg-gray-200 rounded p-1"><X size={20} /></button>
                        </div>
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Customer Name *</label>
                                <input type="text" value={form.CustomerName} onChange={e => setForm({ ...form, CustomerName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
                                {errors.CustomerName && <span className="text-xs text-red-500">{errors.CustomerName}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Phone *</label>
                                <input type="text" value={form.Phone} onChange={e => setForm({ ...form, Phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
                                {errors.Phone && <span className="text-xs text-red-500">{errors.Phone}</span>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
                                <input type="email" value={form.Email} onChange={e => setForm({ ...form, Email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Company</label>
                                <input type="text" value={form.CompanyName} onChange={e => setForm({ ...form, CompanyName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">City</label>
                                <input type="text" value={form.City} onChange={e => setForm({ ...form, City: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">GST Number</label>
                                <input type="text" value={form.GSTNumber} onChange={e => setForm({ ...form, GSTNumber: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-primary focus:border-primary uppercase" maxLength={15} />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded font-bold text-sm hover:bg-gray-100">Cancel</button>
                            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded font-bold text-sm hover:bg-blue-800 disabled:opacity-50">Save Customer</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}