import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResearchProvider } from './context/ResearchContext';
import TopNavbar from './components/TopNavbar';
import LeftPanel from './components/LeftPanel';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import NotificationToast from './components/NotificationToast';

function App() {
  return (
    <ResearchProvider>
      <Router>
        <div className="app-shell">
          <TopNavbar />
          <div className="workspace-body">
            <LeftPanel />
            <main className="right-panel">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </main>
          </div>
          <NotificationToast />
        </div>
      </Router>
    </ResearchProvider>
  );
}

export default App;
