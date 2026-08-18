import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export const MainLayout = ({ children, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        onLogout={onLogout} 
      />

      <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
        
        <div className="shrink-0 h-16">
          <Navbar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={setIsCollapsed} 
          />
        </div>

        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {children}
        </main>

      </div>
    </div>
  );
};