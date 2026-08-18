import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';

export const AdminLayout = ({ onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onLogout={onLogout} 
      />

      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        
        <Topbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};