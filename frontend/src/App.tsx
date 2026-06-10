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
import Topbar from "./components/Topbar";
import AdminPage from "./pages/AdminPage";
import LandingPage from "./pages/LandingPage";

function AppContent() {
  const { isAuthenticated, isLoading, user } = useBackendAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-800">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen h-full w-full flex bg-white dark:bg-gray-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tree" element={<FamilyTree />} />
            <Route path="/families" element={<Families />} />
            <Route path="/families/:id" element={<FamilyDetail />} />
            <Route path="/families/:id/tree" element={<FamilyTreePage />} />
            <Route path="/members" element={<Members />} />
            <Route path="/generations" element={<Generations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin"
              element={
                user?.role === "ADMIN" ? <AdminPage /> : <Navigate to="/" replace />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
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
