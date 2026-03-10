import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../api/apiService';
import { Eye, EyeOff, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // If already logged in, shunt to dashboard
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError("Please fill in both fields");

        setLoading(true);
        setError(null);
        try {
            const userData = await login(email, password);
            toast.success(`Welcome back, ${userData.FullName}!`);
            // login() implicitly sets state and pushes us forward, but we navigate anyway
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error(err);
            setError(err.message || "Network or Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const logoUrl = '/logo.jpg';

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1565C0] to-[#2E7D32]">

            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative isolate animate-in zoom-in-95 duration-500">

                {/* Decorative Top Line */}
                <div className="h-2 bg-gradient-to-r from-primary to-secondary w-full"></div>

                <div className="p-8">

                    <div className="flex flex-col items-center mb-8">
                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm border border-gray-100 mb-4 inline-flex items-center justify-center min-w-[200px]">
                            <img src={logoUrl} alt="Citadel CRM Logo" className="max-h-12 object-contain mix-blend-multiply" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Citadel CRM</h1>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Enterprise Pipeline Management</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                                placeholder="staff@citadel.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 pl-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium focus:tracking-widest"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 animate-in slide-in-from-top-1">
                                <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-red-600 leading-snug">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-blue-800 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </>
                                ) : (
                                    <>
                                        <KeyRound size={18} className="group-hover:rotate-12 transition-transform" /> Secure Login
                                    </>
                                )}
                            </span>
                        </button>

                    </form>

                    <div className="mt-8 text-center border-t border-gray-100 pt-6">
                        <p className="text-xs text-gray-400 font-medium">Protected by 256-bit SHA Vaulting</p>
                    </div>

                </div>
            </div>
        </div>
    );
}