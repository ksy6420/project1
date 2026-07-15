import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { IPCheckPage } from './pages/IPCheckPage';
import { BlacklistPage } from './pages/BlacklistPage';
import { ReportPage } from './pages/ReportPage';
import { RegisterApiPage } from './pages/RegisterApiPage';
import { WhoisPage } from './pages/WhoisPage';
import { Nav } from './components/layout/nav';
import './App.css';

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/check" element={<IPCheckPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/blacklist" element={<BlacklistPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/register-api" element={<RegisterApiPage />} />
        <Route path="/whois/:ip" element={<WhoisPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
