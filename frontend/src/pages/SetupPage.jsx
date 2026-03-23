import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../api/apiService';
import { Database, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SetupPage() {
    const navigate = useNavigate();
    const [settingUp, setSettingUp] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');

    const handleSetup = async () => {
        setSettingUp(true);
        setError('');
        try {
            const res = await apiCall('setupSheet');
            if (res.success === false) throw new Error(res.message);
            setDone(true);
        } catch (e) {
            setError(e.message || 'Setup failed. Check that your VITE_APPS_SCRIPT_URL is correct and the Apps Script is deployed.');
        } finally {
            setSettingUp(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-full max-w-lg overflow-hidden">
                <div className="bg-emerald-600 px-6 py-5 text-center">
                    <Database size={32} className="text-white mx-auto mb-2" />
                    <h1 className="text-xl font-bold text-white">Citadel CRM — Initial Setup</h1>
                    <p className="text-emerald-100 text-sm mt-1">One-time database bootstrap</p>
                </div>

                <div className="p-6 space-y-5">
                    {!done ? (
                        <>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    This will initialize your connected Google Sheet with:
                                </p>
                                <ul className="text-sm text-gray-600 space-y-1.5 ml-1">
                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">&#10003;</span> 10 sheet tabs (USERS, CUSTOMERS, LEADS, etc.)</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">&#10003;</span> Column headers with bold formatting and borders</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">&#10003;</span> 11 default system settings</li>
                                    <li className="flex items-start gap-2"><span className="text-emerald-500 mt-0.5">&#10003;</span> Default admin account (admin@citadel.com)</li>
                                </ul>
                                <p className="text-xs text-gray-400">Safe to run multiple times — skips anything that already exists.</p>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
                            )}

                            <button
                                onClick={handleSetup}
                                disabled={settingUp}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 text-white font-bold text-sm rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                            >
                                {settingUp ? <><Loader2 size={18} className="animate-spin" /> Setting up your database...</> : <><Database size={18} /> Setup Google Sheet</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="text-center space-y-3 py-2">
                                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                                <h2 className="text-lg font-bold text-gray-800">Setup Complete!</h2>
                                <div className="text-sm text-gray-600 space-y-2 text-left bg-gray-50 rounded-lg p-4">
                                    <p><span className="font-bold">Next steps:</span></p>
                                    <ol className="list-decimal ml-4 space-y-1">
                                        <li>Go to the <span className="font-bold">Apps Script editor</span> → <span className="font-mono text-xs">Executions</span> tab</li>
                                        <li>Find the temporary admin password in the execution log</li>
                                        <li>Login with <span className="font-mono text-xs bg-gray-200 px-1 rounded">admin@citadel.com</span> + that password</li>
                                        <li>Change the password immediately via Users → Reset Password</li>
                                    </ol>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white font-bold text-sm rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                            >
                                Go to Login <ArrowRight size={18} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
