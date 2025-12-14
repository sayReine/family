import { useState } from "react";
import {  Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Sidebar from "./components/Sidebar";
import { BackendAuthProvider } from "./contexts/BackendAuthContext";
import Dashboard from "./pages/Dashboard";
import Overview from "./pages/Overview";
import FamilyTree from "./pages/FamilyTree";
import Members from "./pages/Members";
import Generations from "./pages/Generations";
import Settings from "./pages/Settings";
import Form from "./auth/Form";

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen h-full w-full flex bg-gray-100 dark:bg-gray-900">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col md:ml-0">
        <main className="flex-1 p-6 overflow-y-auto mt-16 bg-gray-100 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tree" element={<FamilyTree />} />
            <Route path="/members" element={<Members />} />
            <Route path="/generations" element={<Generations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/auth" element={<Form />} />
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
