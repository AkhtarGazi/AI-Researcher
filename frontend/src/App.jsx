import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResearchProvider } from './context/ResearchContext';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import NotificationToast from './components/NotificationToast';

function App() {
  return (
    <ResearchProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />
          <main className="main-workspace">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <NotificationToast />
        </div>
      </Router>
    </ResearchProvider>
  );
}

export default App;
