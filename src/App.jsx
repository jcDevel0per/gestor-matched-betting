import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import KanbanBoard from './pages/KanbanBoard';
import History from './pages/History';
import CycleDetails from './pages/CycleDetails';

function App() {
    return (
        <AuthProvider>
            <ToastProvider>
                <Router>
                    <Routes>
                        {/* Public Route */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <KanbanBoard />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/history"
                            element={
                                <ProtectedRoute>
                                    <History />
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/cycle/:id"
                            element={
                                <ProtectedRoute>
                                    <CycleDetails />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirect unknown routes to home */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Router>
            </ToastProvider>
        </AuthProvider>
    );
}

export default App;
