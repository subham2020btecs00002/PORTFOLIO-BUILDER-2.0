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
import { AuthProvider } from './components/context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <MainApp />
      </Router>
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
  const location = useLocation();
  const isPublicPortfolio = location.pathname.startsWith('/portfolio/public/');

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
        <Route path="/portfolio/public/:userId" element={<PublicPortfolio />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
