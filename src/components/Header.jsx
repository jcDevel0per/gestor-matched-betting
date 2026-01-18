import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, History, Home } from 'lucide-react';

const Header = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!currentUser) return null;

    return (
        <header className="bg-white border-b-4 border-black mb-8">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo/Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black flex items-center justify-center">
                            <div className="w-8 h-8 border-4 border-white"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter">
                                SISTEMA GESTOR
                            </h1>
                            <div className="h-0.5 w-16 bg-black mt-1"></div>
                        </div>
                    </div>

                    {/* Navigation & User Info */}
                    <div className="flex items-center gap-4">
                        {/* Navigation Links - Desktop */}
                        <nav className="hidden md:flex items-center gap-2">
                            <Link
                                to="/"
                                className="px-4 py-2 font-mono font-bold uppercase text-sm border-2 border-black hover:bg-black hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Home size={16} />
                                    <span>NOVO</span>
                                </div>
                            </Link>
                            <Link
                                to="/history"
                                className="px-4 py-2 font-mono font-bold uppercase text-sm border-2 border-black hover:bg-black hover:text-white transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <History size={16} />
                                    <span>HISTÓRICO</span>
                                </div>
                            </Link>
                        </nav>

                        {/* User Info */}
                        <div className="hidden md:flex items-center gap-3 pl-4 border-l-4 border-black">
                            <div className="w-10 h-10 border-4 border-black overflow-hidden">
                                <img
                                    src={currentUser.photoURL || 'https://via.placeholder.com/40'}
                                    alt={currentUser.displayName}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="text-xs font-mono font-bold uppercase">
                                    {currentUser.displayName}
                                </p>
                                <p className="text-xs font-mono text-neutral-600">
                                    {currentUser.email}
                                </p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-black text-white font-mono font-bold uppercase text-sm border-4 border-black hover:bg-white hover:text-black transition-colors shadow-brutalist-sm hover:shadow-none active:translate-x-1 active:translate-y-1"
                            title="Sair"
                        >
                            <div className="flex items-center gap-2">
                                <LogOut size={16} />
                                <span className="hidden md:inline">SAIR</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden flex items-center gap-2 mt-4 pt-4 border-t-4 border-black">
                    <Link
                        to="/"
                        className="flex-1 px-4 py-2 font-mono font-bold uppercase text-sm text-center border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Home size={16} />
                            <span>NOVO</span>
                        </div>
                    </Link>
                    <Link
                        to="/history"
                        className="flex-1 px-4 py-2 font-mono font-bold uppercase text-sm text-center border-2 border-black hover:bg-black hover:text-white transition-colors"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <History size={16} />
                            <span>HISTÓRICO</span>
                        </div>
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
