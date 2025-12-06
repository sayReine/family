interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-6 w-full">
      <div className="flex items-center">
        <button
          className="md:hidden mr-4 p-2 rounded hover:bg-gray-200"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">Hello, Admin</span>
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
      </div>
    </header>
  );
}
