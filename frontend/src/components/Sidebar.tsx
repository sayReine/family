import { User, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useBackendAuth } from "../hooks/UseBackendAuth";
import { useLang } from "../contexts/LanguageContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { logout, user } = useBackendAuth();
  const { t } = useLang();

  const link = (to: string, label: string) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `block p-2 rounded cursor-pointer ${
          isActive
            ? "bg-gray-300 dark:bg-gray-700"
            : "hover:bg-gray-200 dark:hover:bg-gray-700"
        } text-gray-900 dark:text-white`
      }
      onClick={() => setSidebarOpen(false)}
    >
      {label}
    </NavLink>
  );

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed md:relative top-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-screen z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 font-bold text-xl border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
          🌳 {t('appName')}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {link("/",            t('home'))}
          {link("/families",   t('families'))}
          {link("/tree",       t('treePreview'))}
          {link("/members",    t('allMembers'))}
          {link("/generations",t('generations'))}
          {link("/settings",   t('settings'))}
          {user?.role === "ADMIN" && link("/admin", t('admin'))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <NavLink
            to="/profile"
            className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setSidebarOpen(false)}
          >
            <User className="w-4 h-4" />
            <span>{t('profile')}</span>
          </NavLink>
          <button
            onClick={logout}
            className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
