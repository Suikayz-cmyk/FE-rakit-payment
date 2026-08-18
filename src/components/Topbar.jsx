import { ShieldCheck, User } from 'lucide-react';

export const Topbar = () => {
  const userData = (() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  })();

  const userEmail = userData.email || '';
  
  let displayName = userData.name;
  if (!displayName) {
    if (userEmail === 'admin@rakit-payment.com') displayName = 'Rakit Super Admin';
    else if (userEmail === 'admin@kisel.co.id') displayName = 'Admin Kisel';
    else if (userEmail === 'operator@kisel.co.id') displayName = 'Operator Kisel';
    else displayName = userEmail.split('@')[0] || 'Admin Payment';
  }

  const isSuperAdmin = 
    userData.role === 'Super Admin' || 
    userEmail === 'admin@rakit-payment.com' || 
    userEmail === 'admin@kisel.co.id';

  const roleLabel = isSuperAdmin ? 'Super Admin' : 'Admin User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-xs sticky top-0 z-10">
      
      <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Panel Kontrol Payment Gateway</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 shadow-xs">
          {initial}
        </div>

        <div className="text-left">
          <p className="text-sm font-semibold text-slate-800 leading-tight">
            {displayName}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            {isSuperAdmin ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 rounded">
                <ShieldCheck className="w-3 h-3" />
                {roleLabel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 rounded">
                <User className="w-3 h-3" />
                {roleLabel}
              </span>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};