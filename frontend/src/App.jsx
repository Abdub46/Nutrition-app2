import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import TopBanner from './components/TopBanner';
import NetworkStatus from './components/NetworkStatus';
import PageViewTracker from './components/PageViewTracker';
import ScrollToTop from './components/ScrollToTop';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleRoute from './components/RoleRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import BmiCalculator from './pages/BmiCalculator';
import Chatbot from './pages/Chatbot';
import Appointments from './pages/Appointments';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import Tools from './pages/Tools';
import Home from './pages/Home';
import SuggestImprovement from './pages/SuggestImprovement';
import HowToUse from './pages/HowToUse';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

import AdminHome from './pages/admin/AdminHome';
import AdminUsers from './pages/admin/AdminUsers';
import AdminWriters from './pages/admin/AdminWriters';
import AdminAppointments from './pages/admin/AdminAppointments';
import AdminArticles from './pages/admin/AdminArticles';
import AdminCategories from './pages/admin/AdminCategories';
import AdminFeaturedArticle from './pages/admin/AdminFeaturedArticle';
import AdminSettings from './pages/admin/AdminSettings';

const withLayout = (Component) => (
  <Layout>
    <Component />
  </Layout>
);

// Where a logged-in user should land, given their role.
// The public Horizon+ homepage is now the landing spot for everyone, including admins -
// only writers still land straight on their article workspace.
const homeRouteFor = (user) => {
  if (!user) return '/';
  if (user.role === 'writer') return '/admin/articles';
  return '/';
};

function App() {
  const { user } = useAuth();

  return (
    <>
      <TopBanner />
      <NetworkStatus />
      <PageViewTracker />
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <Routes>
        {/* Public homepage - client-facing only, no admin/writer branding or links */}
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={user ? <Navigate to={homeRouteFor(user)} /> : <Login />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to={homeRouteFor(user)} /> : <Signup />}
        />
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Public content page - visible before login/signup too */}
        <Route path="/tools" element={withLayout(Tools)} />
        <Route path="/how-to-use" element={withLayout(HowToUse)} />
        <Route path="/privacy-policy" element={withLayout(PrivacyPolicy)} />
        <Route path="/terms-of-service" element={withLayout(TermsOfService)} />
        <Route path="/cookie-policy" element={withLayout(CookiePolicy)} />

        {/* Client routes */}
        <Route path="/dashboard" element={<ProtectedRoute>{withLayout(Dashboard)}</ProtectedRoute>} />
        <Route path="/bmi-calculator" element={<ProtectedRoute>{withLayout(BmiCalculator)}</ProtectedRoute>} />
        <Route path="/chatbot" element={<ProtectedRoute>{withLayout(Chatbot)}</ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute>{withLayout(Appointments)}</ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute>{withLayout(Articles)}</ProtectedRoute>} />
        <Route path="/articles/:id" element={<ProtectedRoute>{withLayout(ArticleDetail)}</ProtectedRoute>} />
        <Route path="/suggest-improvement" element={<ProtectedRoute>{withLayout(SuggestImprovement)}</ProtectedRoute>} />

        {/* Shared admin + writer routes - article management, ownership enforced server-side */}
        <Route path="/admin/articles" element={<RoleRoute roles={['admin', 'writer']}>{withLayout(AdminArticles)}</RoleRoute>} />

        {/* Admin-only routes */}
        <Route path="/admin" element={<AdminRoute>{withLayout(AdminHome)}</AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute>{withLayout(AdminUsers)}</AdminRoute>} />
        <Route path="/admin/writers" element={<AdminRoute>{withLayout(AdminWriters)}</AdminRoute>} />
        <Route path="/admin/appointments" element={<AdminRoute>{withLayout(AdminAppointments)}</AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute>{withLayout(AdminCategories)}</AdminRoute>} />
        <Route path="/admin/featured-article" element={<AdminRoute>{withLayout(AdminFeaturedArticle)}</AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute>{withLayout(AdminSettings)}</AdminRoute>} />
        <Route path="/admin/banner" element={<Navigate to="/admin/settings" replace />} />

        <Route path="*" element={<Navigate to={homeRouteFor(user)} />} />
      </Routes>
    </>
  );
}

export default App;
