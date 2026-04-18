import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';
import HistoryPage from './pages/HistoryPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

// A wrapper to hide Navbar on Landing and Auth pages
function AppLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/auth";

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analyze" element={<AnalysisPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: "100vh", background: "#f8fafc" }}>
        <AppLayout />
      </div>
    </Router>
  );
}

export default App;
