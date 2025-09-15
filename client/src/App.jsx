import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Portfolio from "./pages/Portfolio";
import PublicProfile from "./pages/PublicProfile";
<<<<<<< HEAD
import AuthCallback from "./pages/AuthCallback";
import AdminDashboard from "./pages/AdminDashboard";
import Connections from "./pages/Connections";
import UserDiscovery from "./pages/UserDiscovery";
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
<<<<<<< HEAD
        <Route path="/connections" element={<Connections />} />
        <Route path="/discover" element={<UserDiscovery />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/admin" element={<AdminDashboard />} />
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
      </Routes>
    </Router>
  );
}
