import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import CreatePortfolio from './components/Portfolio/CreatePortfolio';
import EditPortfolio from './components/Portfolio/EditPortfolio';
import PrivateRoute from './components/PrivateRoute';
import PublicPortfolio from './components/Portfolio/PublicPortfolio';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import ProfileSettings from './components/Profile/ProfileSettings';
import AdminRoute from './components/Admin/AdminRoute';
import AdminDashboard from './components/Admin/AdminDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <MainApp />
    </Router>
  );
};

const MainApp: React.FC = () => {
  const location = useLocation();
  const isPublicPortfolio =
    location.pathname.startsWith('/p/') ||
    location.pathname.startsWith('/portfolio/public/');

  return (
    <>
      {!isPublicPortfolio && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/portfolio"
          element={<PrivateRoute element={<CreatePortfolio />} />}
        />
        <Route
          path="/portfolio/edit"
          element={<PrivateRoute element={<EditPortfolio />} />}
        />
        <Route
          path="/dashboard"
          element={<PrivateRoute element={<AnalyticsDashboard />} />}
        />
        <Route
          path="/settings"
          element={<PrivateRoute element={<ProfileSettings />} />}
        />
        <Route
          path="/admin"
          element={<AdminRoute element={<AdminDashboard />} />}
        />
        <Route path="/p/:username" element={<PublicPortfolio />} />
        <Route path="/p/:username/resume" element={<PublicPortfolio isResumeMode={true} />} />
        <Route path="/portfolio/public/:userId" element={<PublicPortfolio />} />
        <Route path="/portfolio/public/:userId/resume" element={<PublicPortfolio isResumeMode={true} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
