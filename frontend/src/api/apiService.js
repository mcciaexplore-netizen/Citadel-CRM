const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

// --- MOCK DATABASE (persisted across HMR via globalThis) ---
function createInitialMockDB() {
    return {
        users: [
            // Admin
            { UserID: 'USR-001', FullName: 'Admin User', Email: 'admin@citadel.com', Phone: '9876543210', Role: 'Admin', IsActive: true },

            // Managers
            { UserID: 'USR-002', FullName: 'Rajesh Kumar', Email: 'manager1@citadel.com', Phone: '9876543211', Role: 'Manager', IsActive: true },
            { UserID: 'USR-003', FullName: 'Priya Singh', Email: 'manager2@citadel.com', Phone: '9876543212', Role: 'Manager', IsActive: true },

            // Users
            { UserID: 'USR-004', FullName: 'Amit Patel', Email: 'user1@citadel.com', Phone: '9876543213', Role: 'User', IsActive: true },
            { UserID: 'USR-005', FullName: 'Neha Verma', Email: 'user2@citadel.com', Phone: '9876543214', Role: 'User', IsActive: true },
            { UserID: 'USR-006', FullName: 'Sanjay Gupta', Email: 'user3@citadel.com', Phone: '9876543215', Role: 'User', IsActive: true }
        ],
        customers: [
            { CustomerID: 'CUS-001', CustomerName: 'Ramesh Patel', Phone: '9876543210', Email: 'ramesh@construction.com', CompanyName: 'Om Builders', City: 'Mumbai', GSTNumber: '22AAAAA0000A1Z5', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-002', CustomerName: 'Suresh Kumar', Phone: '9876511111', Email: 'suresh@sk.com', CompanyName: 'SK Enterprises', City: 'Pune', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-101', CustomerName: 'Yash Agrawal', CompanyName: 'Agrawal construction', Phone: '9518789502', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-102', CustomerName: 'Mohan Davale Bhukum', CompanyName: 'Mohan Davale Bhukum', Phone: '9822377073', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-103', CustomerName: 'Corporate Village', CompanyName: 'Corporate Village', Phone: '8879651792', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-104', CustomerName: 'Satish Bora', CompanyName: 'Satish Bora', Phone: '9028846649', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-105', CustomerName: 'Vijay Zambare', CompanyName: 'Vijay Zambare', Phone: '9766677776', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-106', CustomerName: 'Deepak Patil', CompanyName: '', Phone: '8691846715', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-107', CustomerName: 'Sharad Patil Wankhede', CompanyName: '', Phone: '7385291520', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-108', CustomerName: 'Mujib Shaikh', CompanyName: 'Apna Traders-Parbhani', Phone: '9423324801', Email: '', City: 'Parbhani', GSTNumber: '', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-109', CustomerName: 'Praveen Talekar', CompanyName: '', Phone: '9869428526', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-110', CustomerName: 'Shriram Tiles', CompanyName: 'Shriram Tiles', Phone: '9822250520', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-111', CustomerName: 'Kiran Kolgaonkar', CompanyName: 'Lotus Developers-Mumbai', Phone: '8452804976', Email: '', City: 'Mumbai', GSTNumber: '', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-112', CustomerName: 'Laxman Mane', CompanyName: 'Laxman Mane-Wadgaonsheri', Phone: '8888965791', Email: '', City: 'Wadgaonsheri', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-113', CustomerName: 'Amarjit Singh Kaka', CompanyName: '', Phone: '9892231294', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-114', CustomerName: 'Rushi Baba', CompanyName: 'Rushi Baba-Sunrise', Phone: '9623776290', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-115', CustomerName: 'Arief', CompanyName: 'Arief-Lonavala', Phone: '8698778866', Email: '', City: 'Lonavala', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-116', CustomerName: 'Chandrashekhar Lawate', CompanyName: 'Chandrashekhar Lawate-Thane', Phone: '9821047049', Email: '', City: 'Thane', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-117', CustomerName: 'D.N. Ahire', CompanyName: 'D.N. Ahire-Malegaon', Phone: '9850224485', Email: '', City: 'Malegaon', GSTNumber: '', AssignedUserID: 'USR-002' },
            { CustomerID: 'CUS-118', CustomerName: 'Anil A Batra', CompanyName: '', Phone: '8888060001', Email: '', City: '', GSTNumber: '', AssignedUserID: 'USR-001' },
            { CustomerID: 'CUS-119', CustomerName: 'Nandurbar Dealer', CompanyName: 'Nandurbar Dealer', Phone: '9595312191', Email: '', City: 'Nandurbar', GSTNumber: '', AssignedUserID: 'USR-001' }
        ],
        leads: [
            { LeadID: 'L-001', CustomerID: 'CUS-001', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'New', AssignedUserID: 'USR-002', CreatedAt: new Date().toISOString() },
            { LeadID: 'L-002', CustomerID: 'CUS-002', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Facebook', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Kavach Plaster', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Negotiating', AssignedUserID: 'USR-001', CreatedAt: new Date().toISOString() },
            { LeadID: 'L-101', CustomerID: 'CUS-101', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'New', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T10:00:00.000Z' },
            { LeadID: 'L-102', CustomerID: 'CUS-102', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Walk-in', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Kavach Plaster', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Contacted', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T11:00:00.000Z' },
            { LeadID: 'L-103', CustomerID: 'CUS-103', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Citabond Mortar', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Negotiating', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T12:00:00.000Z' },
            { LeadID: 'L-104', CustomerID: 'CUS-104', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Facebook', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'New', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T13:00:00.000Z' },
            { LeadID: 'L-105', CustomerID: 'CUS-105', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Quoted', AssignedUserID: 'USR-002', CreatedAt: '2025-12-01T14:00:00.000Z' },
            { LeadID: 'L-106', CustomerID: 'CUS-106', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Instagram', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Kavach Plaster', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Contacted', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T15:00:00.000Z' },
            { LeadID: 'L-107', CustomerID: 'CUS-107', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'New', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T16:00:00.000Z' },
            { LeadID: 'L-108', CustomerID: 'CUS-108', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Citabond Mortar', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Won', AssignedUserID: 'USR-002', CreatedAt: '2025-12-01T17:00:00.000Z' },
            { LeadID: 'L-109', CustomerID: 'CUS-109', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Walk-in', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'AAC Blocks', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'New', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T18:00:00.000Z' },
            { LeadID: 'L-110', CustomerID: 'CUS-110', "LeadSource (Phone/Instagram/Facebook/Walk-in)": 'Phone', "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": 'Kavach Plaster', "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": 'Contacted', AssignedUserID: 'USR-001', CreatedAt: '2025-12-01T19:00:00.000Z' }
        ],
        interactions: [],
        quotations: [
            { QuotationID: 'Q-001', LeadID: 'L-002', CustomerID: 'CUS-002', TotalValue: 45000, QuotationDate: new Date().toISOString(), Status: 'Sent', NeedApproval: 'No' }
        ],
        orders: [
            { OrderID: 'ORD-001', LeadID: 'L-002', CustomerID: 'CUS-002', ProductOrdered: 'Kavach Plaster', OrderQuantity: '500 Bags', OrderDate: new Date().toISOString(), Status: 'Pending', PaymentStatus: 'Pending', AssignedUserID: 'USR-001' }
        ],
        payments: [
            { PaymentID: 'PAY-001', OrderID: 'ORD-001', CustomerID: 'CUS-002', InvoiceNumber: 'INV-1001', TotalAmount: 45000, PaidAmount: 20000, OutstandingAmount: 25000, Status: 'Partial', CreditApprovalRequired: 'No', AssignedUserID: 'USR-001', DueDate: new Date(Date.now() + 86400000 * 5).toISOString() }
        ],
        reminders: [
            { ReminderID: 'REM-001', Type: 'FollowUp', CustomerID: 'CUS-001', AssignedUserID: 'USR-002', ReminderDate: new Date().toISOString(), ReminderMessage: 'Call Ramesh regarding new site.', "Status (Pending/Dismissed/Completed)": 'Pending' },
            { ReminderID: 'REM-002', Type: 'Payment', CustomerID: 'CUS-002', AssignedUserID: 'USR-001', ReminderDate: new Date(Date.now() - 86400000).toISOString(), ReminderMessage: 'Collect advance for INV-1001.', "Status (Pending/Dismissed/Completed)": 'Pending', Status: 'Pending' }
        ],
        settings: [
            { SettingKey: 'PriceApprovalThreshold', SettingValue: '3650' },
            { SettingKey: 'CreditApprovalThresholdDays', SettingValue: '45' },
            { SettingKey: 'AutoFollowUpEmailEnabled', SettingValue: 'true' },
            { SettingKey: 'CompanyName', SettingValue: 'Citadel' }
        ],
        stats: {
            newLeadsToday: 5,
            totalLeads: 12,
            quotationsSent: 15,
            ordersConfirmed: 24,
            pendingPayments: 6,
            overduePayments: 2,
            leadsBySource: [
                { source: 'Phone', count: 7 },
                { source: 'Facebook', count: 2 },
                { source: 'Walk-in', count: 2 },
                { source: 'Instagram', count: 1 }
            ],
            leadsByStatus: [
                { status: 'New', count: 5 },
                { status: 'Contacted', count: 3 },
                { status: 'Negotiating', count: 2 },
                { status: 'Quoted', count: 1 },
                { status: 'Won', count: 1 }
            ]
        }
    };
}

// Use globalThis to persist mock DB across Vite HMR reloads
if (!globalThis.__CITADEL_MOCK_DB__) {
    globalThis.__CITADEL_MOCK_DB__ = createInitialMockDB();
}
let MOCK_DB = globalThis.__CITADEL_MOCK_DB__;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function apiCall(action, payload = {}) {
    // Check if we have a real backend, otherwise use MOCK!
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("YOUR_")) {
        console.warn(`[Mock API] Intercepting ${action}`, payload);
        await delay(600); // simulate network latency

        switch (action) {
            case 'login': {
                const validPasswords = {
                    'admin@citadel.com': 'Admin@1234',
                    'manager1@citadel.com': 'Manager@1234',
                    'manager2@citadel.com': 'Manager@1234',
                    'user1@citadel.com': 'User@1234',
                    'user2@citadel.com': 'User@1234',
                    'user3@citadel.com': 'User@1234'
                };
                const user = MOCK_DB.users.find(u => u.Email === payload.email);
                if (user && validPasswords[payload.email] === payload.password) {
                    return { success: true, token: 'mock-token-' + user.UserID, user };
                }
                return { success: false, error: 'Invalid email or password' };
            }

            case 'getDashboardStats':
                return MOCK_DB.stats;

            case 'getSettings':
                return MOCK_DB.settings;

            case 'updateSetting':
                const setIdx = MOCK_DB.settings.findIndex(s => s.SettingKey === payload.SettingKey);
                if (setIdx > -1) MOCK_DB.settings[setIdx].SettingValue = payload.SettingValue;
                else MOCK_DB.settings.push({ SettingKey: payload.SettingKey, SettingValue: payload.SettingValue });
                return { success: true };

            case 'getUsers': return MOCK_DB.users;

            case 'createUser':
                const newUser = {
                    UserID: `USR-${Date.now()}`,
                    FullName: payload.FullName,
                    Email: payload.Email,
                    Phone: payload.Phone || '',
                    Role: payload.Role || 'Staff',
                    IsActive: true
                };
                MOCK_DB.users.push(newUser);
                return { success: true, UserID: newUser.UserID };

            case 'updateUser':
                const userIdx = MOCK_DB.users.findIndex(u => u.UserID === payload.UserID);
                if (userIdx > -1) {
                    if (payload.updates.FullName) MOCK_DB.users[userIdx].FullName = payload.updates.FullName;
                    if (payload.updates.Phone) MOCK_DB.users[userIdx].Phone = payload.updates.Phone;
                    if (payload.updates.Role) MOCK_DB.users[userIdx].Role = payload.updates.Role;
                    if (payload.updates.PasswordHash) MOCK_DB.users[userIdx].PasswordHash = payload.updates.PasswordHash;
                }
                return { success: true };

            case 'deactivateUser':
                const userIdx2 = MOCK_DB.users.findIndex(u => u.UserID === payload.UserID);
                if (userIdx2 > -1) {
                    MOCK_DB.users[userIdx2].IsActive = false;
                }
                return { success: true };
            case 'getCustomers': return MOCK_DB.customers;
            case 'getCustomerById': {
                const cust = MOCK_DB.customers.find(c => c.CustomerID === payload.customerID);
                return cust || { success: false, message: 'Customer not found' };
            }
            case 'getLeads': return MOCK_DB.leads;
            case 'getLeadById': {
                const foundLead = MOCK_DB.leads.find(l => l.LeadID === payload.leadID);
                if (!foundLead) return { success: false, message: 'Lead not found' };
                const foundCust = MOCK_DB.customers.find(c => c.CustomerID === foundLead.CustomerID);
                return { lead: foundLead, customer: foundCust || null };
            }
            case 'getInteractions': return MOCK_DB.interactions.filter(i => i.LeadID === payload.LeadID);
            case 'getQuotations': return MOCK_DB.quotations;
            case 'getOrders': return MOCK_DB.orders;
            case 'getPayments': return MOCK_DB.payments;
            case 'getReminders': return MOCK_DB.reminders;

            case 'updateReminderStatus':
                const rem = MOCK_DB.reminders.find(r => r.ReminderID === payload.ReminderID);
                if (rem) {
                    rem["Status (Pending/Dismissed/Completed)"] = payload.Status;
                    rem.Status = payload.Status;
                }
                return { success: true };

            case 'updateLead':
                const led = MOCK_DB.leads.find(l => l.LeadID === payload.LeadID);
                if (led) Object.assign(led, payload);
                return { success: true };

            case 'updateOrderStatus':
                const ord = MOCK_DB.orders.find(o => o.OrderID === payload.OrderID);
                if (ord) ord.Status = payload.Status;
                return { success: true };

            case 'createLead':
                // Handle CustomerData — create a mock customer if needed
                let mockCustID = payload.CustomerID;
                if (!mockCustID && payload.CustomerData) {
                    mockCustID = `CUS-${Date.now()}`;
                    MOCK_DB.customers.unshift({ CustomerID: mockCustID, ...payload.CustomerData });
                }
                const leadStatus = payload.ImportedStatus || 'New';
                const newLead = {
                    LeadID: `L-${Date.now()}`,
                    CustomerID: mockCustID,
                    CreatedAt: payload.ImportedDate || new Date().toISOString(),
                    "LeadStatus (New/Contacted/Quoted/Negotiating/Won/Lost)": leadStatus,
                    "ProductRequired (AAC Blocks/Citabond Mortar/Kavach Plaster)": payload.ProductRequired || '',
                    "LeadSource (Phone/Instagram/Facebook/Walk-in)": payload.LeadSource || '',
                    AssignedUserID: payload.AssignedUserID || '',
                    ContactPerson: payload.ContactPerson || '',
                    Region: payload.Region || '',
                    Remark1: payload.Remark1 || '',
                    Remark2: payload.Remark2 || '',
                    OrderFlag: payload.OrderFlag || 'N',
                    OrderValue: payload.OrderValue || '',
                    PaymentStatus: payload.PaymentStatus || '',
                    AdName: payload.AdName || '',
                    CampaignName: payload.CampaignName || '',
                    QuantityRequired: payload.QuantityRequired || '',
                    RequirementTimeline: payload.RequirementTimeline || ''
                };
                MOCK_DB.leads.unshift(newLead);
                return { success: true, LeadID: newLead.LeadID, CustomerID: mockCustID };

            case 'createCustomer':
                const newCust = { CustomerID: `CUS-${Date.now()}`, ...payload };
                MOCK_DB.customers.unshift(newCust);
                return { success: true };

            default:
                return { success: true }; // catch all pass
        }
    }

    // --- REAL API CALLS IF CONFIGURED ---
    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8",
            },
            body: JSON.stringify({ action, ...payload }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Note: For login we might return data directly, because the google script
        // returns {success: true, token, user}.
        if (action === 'login') return data;

        if (!data.success && typeof data.success !== 'undefined') {
            throw new Error(data.message || data.error || "API request failed");
        }

        return data.data !== undefined ? data.data : data;
    } catch (err) {
        console.error(`API Error [${action}]: `, err);
        throw err;
    }
}

// Auth
export const login = (email, password) => apiCall('login', { email, password }).then(res => ({ token: res.token, user: res.user, ...res }));
export const changePassword = (userID, oldPassword, newPassword) => apiCall('changePassword', { userID, oldPassword, newPassword });

// Users
export const getUsers = () => apiCall('getUsers');
export const createUser = (data) => apiCall('createUser', data);
export const updateUser = (id, data) => apiCall('updateUser', { UserID: id, updates: data });
export const deactivateUser = (id) => apiCall('deactivateUser', { UserID: id });

// Customers
export const getCustomers = (filters = {}) => apiCall('getCustomers', filters);
export const getCustomerById = (id) => apiCall('getCustomerById', { customerID: id });
export const createCustomer = (data) => apiCall('createCustomer', data);
export const updateCustomer = (id, data) => apiCall('updateCustomer', { CustomerID: id, updates: data });

// Leads
export const getLeads = (filters = {}) => apiCall('getLeads', filters);
export const getLeadById = (id) => apiCall('getLeadById', { leadID: id });
export const createLead = (data) => apiCall('createLead', data);
export const updateLead = (id, data) => apiCall('updateLead', { LeadID: id, ...data });

// Interactions
export const getInteractions = (leadId) => apiCall('getInteractions', { LeadID: leadId });
export const createInteraction = (data) => apiCall('createInteraction', data);

// Quotations
export const getQuotations = (leadId) => apiCall('getQuotations', { LeadID: leadId });
export const createQuotation = (data) => apiCall('createQuotation', data);
export const updateQuotation = (id, data) => apiCall('updateQuotation', { QuotationID: id, updates: data });
export const approveQuotation = (id) => apiCall('approveQuotation', { QuotationID: id });

// Orders
export const getOrders = (filters = {}) => apiCall('getOrders', filters);
export const createOrder = (data) => apiCall('createOrder', data);
export const updateOrderStatus = (id, status) => apiCall('updateOrderStatus', { OrderID: id, Status: status });

// Payments
export const getPayments = (filters = {}) => apiCall('getPayments', filters);
export const createPayment = (data) => apiCall('createPayment', data);
export const updatePayment = (id, data) => apiCall('updatePayment', { PaymentID: id, updates: data });
export const approveCredit = (id) => apiCall('approveCredit', { PaymentID: id });

// Reminders
export const getReminders = (userId) => apiCall('getReminders', { AssignedUserID: userId, onlyPending: true });
export const updateReminderStatus = (id, status) => apiCall('updateReminderStatus', { ReminderID: id, Status: status });
export const createReminder = (data) => apiCall('createReminder', data);

// Dashboard
export const getDashboardStats = () => apiCall('getDashboardStats');

// Settings
export const getSettings = () => apiCall('getSettings');
export const updateSetting = (key, value) => apiCall('updateSetting', { SettingKey: key, SettingValue: value });
