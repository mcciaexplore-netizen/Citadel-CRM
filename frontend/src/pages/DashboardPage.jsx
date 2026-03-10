import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReminders } from '../context/ReminderContext';
import { useSyncData } from '../hooks/useSyncData';
import {
    getDashboardStats,
    getQuotations,
    getPayments,
    getLeads,
    getCustomers,
    getUsers,
    getOrders,
    approveQuotation,
    approveCredit
} from '../api/apiService';
import {
    UserPlus,
    Users,
    FileText,
    ShoppingCart,
    Clock,
    AlertCircle,
    Plus,
    MessageSquare,
    Bell,
    RefreshCw,
    Eye,
    CheckCircle,
    XCircle,
    ChevronRight,
    Building2
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

export default function DashboardPage() {
    const { user, isAdmin, isManager, isStaff, isUser } = useAuth();
    const { reminders, fetchReminders } = useReminders();
    const { syncing, getLastSyncDisplay, syncData } = useSyncData();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState(null);
    const [followUps, setFollowUps] = useState([]);
    const [pendingQuotations, setPendingQuotations] = useState([]);
    const [pendingPaymentsApproval, setPendingPaymentsApproval] = useState([]);
    const [leads, setLeads] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [quotations, setQuotations] = useState([]);
    const [orders, setOrders] = useState([]);

    // Data maps for quick lookups
    const [customersMap, setCustomersMap] = useState({});
    const [leadsMap, setLeadsMap] = useState({});
    const [usersMap, setUsersMap] = useState({});

    useEffect(() => {
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [
                dashboardStats,
                leadsList,
                customersList,
                usersList,
                quotationsList,
                paymentsList,
                ordersList
            ] = await Promise.all([
                getDashboardStats(),
                getLeads(),
                getCustomers(),
                getUsers(),
                isAdmin ? getQuotations() : Promise.resolve([]),
                isAdmin ? getPayments() : Promise.resolve([]),
                isAdmin ? getOrders() : Promise.resolve([])
            ]);

            setStats(dashboardStats);

            // Filter based on role
            const filteredLeads = isAdmin ? leadsList : leadsList.filter(l => l.AssignedUserID === user?.UserID);
            const filteredCustomers = isAdmin ? customersList : customersList.filter(c => c.AssignedUserID === user?.UserID);

            setLeads(filteredLeads);
            setCustomers(filteredCustomers);
            setQuotations(quotationsList);
            setOrders(ordersList);

            // Maps
            const cMap = {}; customersList.forEach(c => cMap[c.CustomerID] = c);
            setCustomersMap(cMap);

            const lMap = {}; leadsList.forEach(l => lMap[l.LeadID] = l);
            setLeadsMap(lMap);

            const uMap = {}; usersList.forEach(u => uMap[u.UserID] = u);
            setUsersMap(uMap);

            // Pending Followups (using Context reminders)
            // Actually Context reminders fetches for CURRENT user if staff, or ALL if admin (based on backend config? Actually we passed UserID)
            // But we can filter reminders here anyway
            const pendingRems = reminders
                .filter(r => r["Status (Pending/Dismissed/Completed)"] === 'Pending' && r["Type (FollowUp/Payment/Dispatch/CrossSell/GoogleReview/Reference/Quotation)"] === 'FollowUp')
                .slice(0, 10);

            const enrichedFollowUps = pendingRems.map(r => {
                const lead = lMap[r.LeadID];
                const customer = lead ? cMap[lead.CustomerID] : null;
                const assignee = uMap[r.AssignedUserID];

                let daysSince = 'N/A';
                if (lead && lead.UpdatedAt) {
                    const diff = Date.now() - new Date(lead.UpdatedAt).getTime();
                    daysSince = Math.floor(diff / (1000 * 3600 * 24));
                }

                return {
                    id: r.ReminderID,
                    leadId: r.LeadID,
                    customerName: customer ? customer.CustomerName : 'Unknown',
                    product: lead ? lead["ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)"] : 'Unknown',
                    daysSince: daysSince,
                    assignedTo: assignee ? assignee.FullName : 'Unassigned',
                    nextFollowUp: new Date(r.ReminderDate).toLocaleDateString()
                };
            });
            setFollowUps(enrichedFollowUps);

            if (isAdmin) {
                const pQuos = quotationsList.filter(q => q["ApprovalStatus (NotRequired/PendingApproval/Approved/Rejected)"] === 'PendingApproval');
                const enrichedQuos = pQuos.map(q => {
                    const customer = cMap[q.CustomerID];
                    const lead = lMap[q.LeadID];
                    return {
                        id: q.QuotationID,
                        customerName: customer ? customer.CustomerName : 'Unknown',
                        product: lead ? lead["ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)"] : 'Unknown',
                        price: q.QuotedPricePerUnit,
                        unit: q.Unit
                    };
                });
                setPendingQuotations(enrichedQuos);

                const pPays = paymentsList.filter(p => p["CreditApprovalStatus (NotRequired/PendingApproval/Approved/Rejected)"] === 'PendingApproval');
                const enrichedPays = pPays.map(p => {
                    const customer = cMap[p.CustomerID];
                    return {
                        id: p.PaymentID,
                        customerName: customer ? customer.CustomerName : 'Unknown',
                        creditDays: p.CreditPeriodDays,
                        amount: p.TotalAmount
                    };
                });
                setPendingPaymentsApproval(enrichedPays);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveQuotation = async (id) => {
        try {
            await approveQuotation(id);
            setPendingQuotations(prev => prev.filter(q => q.id !== id));
        } catch (e) {
            alert("Failed to approve quotation");
        }
    };

    const handleApproveCredit = async (id) => {
        try {
            await approveCredit(id);
            setPendingPaymentsApproval(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            alert("Failed to approve credit");
        }
    };

    const COLORS = {
        source: ['#1565C0', '#42A5F5', '#1E88E5', '#90CAF9', '#0D47A1'],
        status: {
            'New': '#9E9E9E',
            'Contacted': '#1565C0',
            'Quoted': '#FBC02D',
            'Negotiating': '#F57C00',
            'Won': '#2E7D32',
            'Lost': '#D32F2F'
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg shadow-sm"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="h-80 bg-gray-200 rounded-lg shadow-sm"></div>
                    <div className="h-80 bg-gray-200 rounded-lg shadow-sm"></div>
                </div>
                <div className="h-64 bg-gray-200 rounded-lg shadow-sm"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-red-100 max-w-lg mx-auto mt-12 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-800 transition-colors"
                >
                    <RefreshCw size={18} />
                    Retry
                </button>
            </div>
        );
    }

    const KPICard = ({ title, value, icon: CardIcon, colorClass, bgClass }) => (
        <div className={`p-6 rounded-xl shadow-sm border border-gray-100 bg-white relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
                {CardIcon && <CardIcon size={64} className="-mt-4 -mr-4" />}
            </div>
            <div className="flex justify-between items-start relative z-10">
                <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                </div>
                <div className={`p-3 rounded-lg ${bgClass} ${colorClass}`}>
                    {CardIcon && <CardIcon size={24} />}
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-16 md:pb-0">

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white p-6 rounded-xl shadow-md flex items-center justify-between">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.FullName}!</h1>
                    <p className="text-blue-100">
                        {isAdmin && "You have full access to all features. Manage your team, approve quotations, and configure settings."}
                        {isManager && "Oversee your team's leads and customers. Monitor performance and track team activity."}
                        {isStaff && "Manage your leads and customers. Create quotations and track orders."}
                        {isUser && "View your leads and quotations. Check the status of your orders."}
                    </p>
                </div>
                <button
                    onClick={() => syncData([fetchDashboardData])}
                    disabled={syncing}
                    className="ml-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title={`Refresh dashboard (${getLastSyncDisplay()})`}
                >
                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                    {syncing ? 'Syncing...' : 'Sync'}
                </button>
            </div>

            {/* KPI Cards row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isAdmin && (
                    <>
                        <KPICard title="New Leads Today" value={stats?.newLeadsToday || 0} icon={UserPlus} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Total Active Leads" value={stats?.totalLeads || 0} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Pending Approvals" value={pendingQuotations.length + pendingPaymentsApproval.length} icon={FileText} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
                        <KPICard title="Orders Confirmed" value={stats?.ordersConfirmed || 0} icon={ShoppingCart} colorClass="text-green-600" bgClass="bg-green-50" />
                        <KPICard title="Pending Payments" value={stats?.pendingPayments || 0} icon={Clock} colorClass="text-orange-600" bgClass="bg-orange-50" />
                        <KPICard title="Overdue Payments" value={stats?.overduePayments || 0} icon={AlertCircle} colorClass="text-red-600" bgClass="bg-red-50" />
                    </>
                )}
                {isManager && (
                    <>
                        <KPICard title="Team Leads" value={leads.length} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Team Customers" value={customers.length} icon={Building2} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Pending Quotations" value={quotations.filter(q => q.Status === 'Pending').length} icon={FileText} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
                        <KPICard title="Total Orders" value={orders.length} icon={ShoppingCart} colorClass="text-green-600" bgClass="bg-green-50" />
                        <KPICard title="Follow-ups Pending" value={followUps.length} icon={MessageSquare} colorClass="text-orange-600" bgClass="bg-orange-50" />
                        <KPICard title="Team Performance" value={leads.length > 0 ? Math.round((orders.length / leads.length) * 100) + '%' : '0%'} icon={CheckCircle} colorClass="text-red-600" bgClass="bg-red-50" />
                    </>
                )}
                {isStaff && (
                    <>
                        <KPICard title="My Leads" value={leads.length} icon={UserPlus} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="My Customers" value={customers.length} icon={Users} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Pending Follow-ups" value={followUps.length} icon={MessageSquare} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
                        <KPICard title="Total Quotations" value={quotations.length} icon={FileText} colorClass="text-green-600" bgClass="bg-green-50" />
                        <KPICard title="This Month Orders" value={orders.length} icon={ShoppingCart} colorClass="text-orange-600" bgClass="bg-orange-50" />
                        <KPICard title="Pending Approvals" value={pendingQuotations.length} icon={Clock} colorClass="text-red-600" bgClass="bg-red-50" />
                    </>
                )}
                {isUser && (
                    <>
                        <KPICard title="My Leads" value={leads.length} icon={UserPlus} colorClass="text-blue-600" bgClass="bg-blue-50" />
                        <KPICard title="Quotations" value={quotations.length} icon={FileText} colorClass="text-indigo-600" bgClass="bg-indigo-50" />
                        <KPICard title="Orders" value={orders.length} icon={ShoppingCart} colorClass="text-green-600" bgClass="bg-green-50" />
                    </>
                )}
            </div>

            {/* Charts Row - Admin only */}
            {isAdmin && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Leads by Source</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={stats?.leadsBySource || []}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="source" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                            <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} barSize={40}>
                                {(stats?.leadsBySource || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.source[index % COLORS.source.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[350px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Leads by Status</h3>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={stats?.leadsByStatus || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="count"
                                nameKey="status"
                            >
                                {(stats?.leadsByStatus || []).map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS.status[entry.status] || '#9E9E9E'} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            )}

            {/* Pending Follow-ups */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Pending Follow-ups</h3>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block w-full overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Customer Name</th>
                                <th className="px-6 py-4 font-semibold">Product</th>
                                <th className="px-6 py-4 font-semibold">Days Since Last Contact</th>
                                <th className="px-6 py-4 font-semibold">Assigned To</th>
                                <th className="px-6 py-4 font-semibold">Next Follow-up</th>
                                <th className="px-6 py-4 font-semibold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {followUps.length > 0 ? (
                                followUps.map((fu, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{fu.customerName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fu.product}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${fu.daysSince > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                {fu.daysSince} days
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{fu.assignedTo}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800">{fu.nextFollowUp}</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="text-primary hover:bg-blue-50 p-2 rounded-md transition-colors" title="Log Interaction">
                                                    <MessageSquare size={18} />
                                                </button>
                                                <Link to={`/leads/${fu.leadId}`} className="text-gray-500 hover:text-primary hover:bg-blue-50 p-2 rounded-md transition-colors" title="View Lead">
                                                    <Eye size={18} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500">
                                        No pending follow-ups right now. Great job!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {followUps.length > 0 ? (
                        followUps.map((fu, idx) => (
                            <div key={idx} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-base">{fu.customerName}</h4>
                                        <p className="text-sm text-gray-500">{fu.product}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${fu.daysSince > 3 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                        {fu.daysSince} days
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 flex justify-between">
                                    <span>Assigned: {fu.assignedTo}</span>
                                    <span className="font-medium">Due: {fu.nextFollowUp}</span>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <button className="flex-1 flex justify-center items-center gap-2 bg-blue-50 text-primary py-2 rounded-lg text-sm font-bold">
                                        <MessageSquare size={16} /> Log Call
                                    </button>
                                    <Link to={`/leads/${fu.leadId}`} className="flex-1 flex justify-center items-center gap-2 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold">
                                        <Eye size={16} /> View
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="px-6 py-8 text-center text-sm text-gray-500">
                            No pending follow-ups right now. Great job!
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                    <Link to="/reminders" className="text-sm font-bold text-primary flex items-center gap-1 hover:text-blue-800 transition-colors">
                        View All Reminders <ChevronRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Admin Pending Approvals Panel */}
            {isAdmin && (pendingQuotations.length > 0 || pendingPaymentsApproval.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Quotations Pending */}
                    <div className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
                        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
                            <AlertCircle size={20} className="text-orange-600" />
                            <h3 className="text-lg font-bold text-orange-900">Quotations Pending Approval</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {pendingQuotations.length > 0 ? (
                                pendingQuotations.map(q => (
                                    <div key={q.id} className="p-4 md:p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-orange-50/30">
                                        <div>
                                            <h4 className="font-bold text-gray-900">{q.customerName}</h4>
                                            <p className="text-sm text-gray-600">{q.product}</p>
                                            <p className="text-sm font-medium mt-1 text-gray-800">₹{q.price} / {q.unit}</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleApproveQuotation(q.id)} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                                                <CheckCircle size={16} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-gray-500 text-sm">No quotations pending approval.</div>
                            )}
                        </div>
                    </div>

                </div>
            )}

            {/* Mobile Floating Action Button (FAB) */}
            <div className="md:hidden fixed bottom-6 right-6 z-40 group">
                <button className="bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-800 transition-colors shadow-blue-500/30">
                    <Plus size={24} />
                </button>
                {/* Sub menu that appears on hover/click could go here */}
                <div className="absolute bottom-16 right-0 flex-col gap-3 hidden group-hover:flex pb-2">
                    <Link to="/leads" className="flex items-center justify-end gap-3 pointer-events-auto">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">New Lead</span>
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-primary shadow-md">
                            <UserPlus size={18} />
                        </div>
                    </Link>
                    <button className="flex items-center justify-end gap-3 pointer-events-auto">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">Log Interaction</span>
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-primary shadow-md">
                            <MessageSquare size={18} />
                        </div>
                    </button>
                    <Link to="/reminders" className="flex items-center justify-end gap-3 pointer-events-auto">
                        <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">Reminders</span>
                        <div className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-primary shadow-md">
                            <Bell size={18} />
                        </div>
                    </Link>
                </div>
            </div>

        </div>
    );
}