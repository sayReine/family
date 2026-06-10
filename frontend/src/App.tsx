import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Sidebar from "./components/Sidebar";
import { BackendAuthProvider } from "./contexts/BackendAuthProvider";
import { useBackendAuth } from "./hooks/UseBackendAuth";
import Dashboard from "./pages/Dashboard";
import FamilyTree from "./pages/FamilyTree";
import FamilyTreePage from "./pages/FamilyTreePage";
import FamilyDetail from "./pages/FamilyDetail";
import Families from "./pages/Families";
import Members from "./pages/Members";
import Generations from "./pages/Generations";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";

const C = { cream: '#f8f5ef' };

function AppContent() {
  const { isAuthenticated, isLoading, user } = useBackendAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.cream }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none" style={{ animation: 'spin 1.2s linear infinite' }} aria-label="Loading">
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <circle cx="16" cy="8"  r="4"   fill="#c9a84c" />
            <circle cx="8"  cy="22" r="3.5" fill="#0d2557" />
            <circle cx="24" cy="22" r="3.5" fill="#0d2557" />
            <line x1="16" y1="12" x2="12" y2="18.5" stroke="#c9a84c" strokeWidth="2" />
            <line x1="16" y1="12" x2="20" y2="18.5" stroke="#c9a84c" strokeWidth="2" />
          </svg>
          <p style={{ marginTop: 12, fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a8faa' }}>
            RootsBridge
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <LandingPage />;

  return (
    <div style={{ minHeight: '100vh', height: '100vh', display: 'flex', fontFamily: "'Segoe UI', system-ui, sans-serif", overflow: 'hidden' }}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Routes>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/tree"              element={<FamilyTree />} />
          <Route path="/families"          element={<Families />} />
          <Route path="/families/:id"      element={<FamilyDetail />} />
          <Route path="/families/:id/tree" element={<FamilyTreePage />} />
          <Route path="/members"           element={<Members />} />
          <Route path="/generations"       element={<Generations />} />
          <Route path="/settings"          element={<Settings />} />
          <Route path="/profile"           element={<ProfilePage />} />
          <Route
            path="/admin"
            element={user?.role === 'ADMIN' ? <AdminPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BackendAuthProvider>
          <AppContent />
        </BackendAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}