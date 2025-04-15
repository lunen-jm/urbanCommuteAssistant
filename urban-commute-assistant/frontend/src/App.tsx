import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Dashboard from './components/Dashboard/Dashboard';
import NotificationPanel from './components/Notifications/NotificationPanel';
import ProfileSettings from './components/UserProfile/ProfileSettings';
import './styles.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<NotificationPanel />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;