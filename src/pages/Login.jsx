import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            console.error('Login error:', error);
            setError('ERRO AO FAZER LOGIN. TENTE NOVAMENTE.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            {/* Brutalist Grid Background */}
            <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
                backgroundImage: 'linear-gradient(black 1px, transparent 1px), linear-gradient(90deg, black 1px, transparent 1px)',
                backgroundSize: '50px 50px'
            }}></div>

            <div className="relative max-w-md w-full">
                {/* Main Card */}
                <div className="card-brutalist">
                    {/* Logo/Title */}
                    <div className="mb-8">
                        <div className="w-16 h-16 bg-black mb-6 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-white"></div>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
                            SISTEMA
                        </h1>
                        <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">
                            GESTOR
                        </h2>
                        <div className="h-1 w-24 bg-black"></div>
                        <p className="mt-4 text-sm font-mono uppercase tracking-wider text-neutral-600">
                            Matched Betting Management
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-4 border-black">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                <span className="font-mono font-bold text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full btn-brutalist flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin"></div>
                                <span>CARREGANDO...</span>
                            </div>
                        ) : (
                            <>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="flex-shrink-0"
                                >
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>ENTRAR COM GOOGLE</span>
                            </>
                        )}
                    </button>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t-4 border-black">
                        <p className="text-xs font-mono uppercase tracking-wider text-neutral-600 text-center">
                            ACESSE SEUS CICLOS
                        </p>
                        <p className="text-xs font-mono uppercase tracking-wider text-neutral-600 text-center mt-1">
                            GERENCIE SUAS CONTAS
                        </p>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-4 -right-4 w-32 h-32 border-4 border-black -z-10"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black -z-10"></div>
            </div>
        </div>
    );
};

export default Login;
