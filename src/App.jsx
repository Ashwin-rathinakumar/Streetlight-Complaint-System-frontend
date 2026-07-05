import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import Shared Components
import Navbar from './components/Navbar';

// Import Pages
import Home from './pages/Home';
import ReportForm from './pages/ReportForm';
import ReportList from './pages/ReportList';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0b0f19] flex flex-col justify-between select-none relative overflow-x-hidden">
        
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Page Views Wrapper */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit" element={<ReportForm />} />
            <Route path="/list" element={<ReportList />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

      </div>
    </Router>
  );
}
