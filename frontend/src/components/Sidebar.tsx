import { User } from "lucide-react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed md:relative top-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-screen z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 font-bold text-xl border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          Family Dashboard
        </div>

        <nav className="flex-1 p-4 space-y-3">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            🏠 Acceuil
          </NavLink>

          <NavLink
            to="/tree"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            🌳 Arbre Généalogique
          </NavLink>

          <NavLink
            to="/members"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            👨‍👩‍👧 Membres
          </NavLink>

          <NavLink
            to="/generations"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            📊 Generations
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            📅 Evénéments
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `block p-2 rounded cursor-pointer ${
                isActive
                  ? "bg-gray-300 dark:bg-gray-700"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              } text-gray-900 dark:text-white`
            }
            onClick={() => setSidebarOpen(false)}
          >
            📷 Galleries
          </NavLink>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
          <NavLink
            to="/profile"
            className="flex items-center space-x-2 hover:text-gray-900 dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <User className="w-5 h-5" />
             Profile
          </NavLink>
        </div>
        
        
      </aside>
    </>
  );
}
