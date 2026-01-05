import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const AdminDashboard = lazy(() => import("./pages/EnhancedAdminDashboard"));
const Connections = lazy(() => import("./pages/Connections"));
const UserDiscovery = lazy(() => import("./pages/EnhancedDiscovery"));
const GigsBoard = lazy(() => import("./pages/GigsBoard"));
const Collaborations = lazy(() => import("./pages/Collaborations"));
const Messages = lazy(() => import("./pages/Messages"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AIAssistedFeatures = lazy(() => import("./pages/AIAssistedFeatures"));

// New Unified Dashboard Components
import DashboardLayout from "./components/DashboardLayout";
const MediaLibrary = lazy(() => import("./pages/MediaLibrary"));
const Feedback = lazy(() => import("./pages/Feedback"));
const Settings = lazy(() => import("./pages/Settings"));
const ProfileEditor = lazy(() => import("./components/Profile"));

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/profile/:userId" element={<PublicProfile />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Protected Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/media" element={<MediaLibrary />} />
              <Route path="/profile/edit" element={<ProfileEditor />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/settings" element={<Settings />} />

              {/* Keep existing features accessible for now if needed, or hide them */}
              <Route path="/connections" element={<Connections />} />
              <Route path="/discover" element={<UserDiscovery />} />
              <Route path="/gigs" element={<GigsBoard />} />
              <Route path="/collaborations" element={<Collaborations />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/ai" element={<AIAssistedFeatures />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}
