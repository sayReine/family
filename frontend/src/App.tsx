import { useState } from "react";
import {  Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import { BackendAuthProvider } from "./contexts/BackendAuthContext";
import Dashboard from "./pages/Dashboard";
// import Overview from "./pages/Overview";
import FamilyTree from "./pages/FamilyTree";
import Members from "./pages/Members";
import Generations from "./pages/Generations";
import Settings from "./pages/Settings";
import ProfilePage from "./pages/ProfilePage";
import Topbar from "./components/Topbar";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-full w-full flex bg-white dark:bg-gray-800">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-0">
        <Topbar />
        <main className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-800">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tree" element={<FamilyTree />} />
            <Route path="/members" element={<Members />} />
            <Route path="/generations" element={<Generations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    
      <ThemeProvider>
        <BackendAuthProvider>
          <AppContent />
        </BackendAuthProvider>
      </ThemeProvider>
    
  );
}
