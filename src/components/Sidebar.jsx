import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  CreditCard, 
  ArrowLeftRight, 
  Wallet, 
  Logs, 
  LogOut,
  PanelLeftClose,
  PanelLeft       
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed, onLogout }) => {
  const navigate = useNavigate();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/biller', label: 'Biller', icon: Receipt },
    { path: '/channel', label: 'Channel', icon: CreditCard },
    { path: '/transaksi', label: 'Transaksi', icon: ArrowLeftRight },
    { path: '/saldo', label: 'Saldo', icon: Wallet },
    { path: '/callback', label: 'Callback Log', icon: Logs },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <aside 
      className={`h-screen bg-white text-slate-700 border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-56'
      }`}
    >
      <div className="h-16 border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
        {!isCollapsed ? (
          <span className="text-lg font-bold tracking-wide text-blue-600 whitespace-nowrap">
            Admin Panel
          </span>
        ) : (
          <span className="text-lg font-bold text-blue-600 mx-auto">AP</span>
        )}

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors ${
            isCollapsed ? 'ml-auto' : ''
          }`}
          title={isCollapsed ? "Perluas Sidebar" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isCollapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 shrink-0">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : undefined}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};