import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/Admin/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// ✅ Lazy-loaded: these are only downloaded when the user actually navigates to them
const CreatePortfolio    = React.lazy(() => import('./components/Portfolio/CreatePortfolio'));
const EditPortfolio      = React.lazy(() => import('./components/Portfolio/EditPortfolio'));
const PublicPortfolio    = React.lazy(() => import('./components/Portfolio/PublicPortfolio'));
const AnalyticsDashboard = React.lazy(() => import('./components/Dashboard/AnalyticsDashboard'));
const ProfileSettings    = React.lazy(() => import('./components/Profile/ProfileSettings'));
const AdminDashboard     = React.lazy(() => import('./components/Admin/AdminDashboard'));

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
      {/* Suspense shows a spinner while any lazy-loaded chunk is downloading */}
      <Suspense fallback={<LoadingSpinner size="lg" message="Loading..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
      </Suspense>
    </>
  );
};

export default App;
