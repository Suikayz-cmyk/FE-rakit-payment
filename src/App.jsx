import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { BillerPage } from './pages/BillerPage';
import { ChannelPage } from './pages/ChannelPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { TransactionPage } from './pages/TransactionPage';
import { WhitelistPage } from './pages/WhitelistPage';
import { BalancePage } from './pages/BalancePage';
import { LogPage } from './pages/LogPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('token'));
  });

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
          )
        }
      />

      <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
        <Route element={<AdminLayout onLogout={handleLogout} />}>
          <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
          <Route path="/biller" element={<BillerPage />} />
          <Route path="/channel" element={<ChannelPage />} />
          <Route path="/transaksi" element={<TransactionPage />} />
          <Route path="/Log" element={<LogPage />} />
          <Route path="/whitelist" element={<WhitelistPage />} />
          <Route path="/balance" element={<BalancePage />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to={isLoggedIn ? '/dashboard' : '/login'} replace />}
      />
    </Routes>
  );
}