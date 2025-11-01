
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import Targets from './pages/Targets';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import { DashboardIcon, StoreIcon, TargetIcon, SettingsIcon, ChatIcon } from './components/icons';
import NotificationCenter from './components/NotificationCenter';
import useDeadlineNotifier from './hooks/useDeadlineNotifier';

type Page = 'dashboard' | 'stores' | 'targets' | 'settings' | 'chat';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  useDeadlineNotifier();

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'stores':
        return <Stores />;
      case 'targets':
        return <Targets />;
      case 'settings':
        return <Settings />;
      case 'chat':
        return <Chat />;
      default:
        return <Dashboard />;
    }
  };
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'stores', label: 'Stores', icon: <StoreIcon /> },
    { id: 'targets', label: 'Targets', icon: <TargetIcon /> },
    { id: 'chat', label: 'Chat AI', icon: <ChatIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <NotificationCenter />
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-brand-400 tracking-tight">Sales Monitor</h1>
        <p className="text-slate-400 mt-1">Interactive Control Panel</p>
      </header>

      <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`group relative p-4 md:p-6 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 transform focus:outline-none focus:ring-4 focus:ring-brand-500/50 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-2xl shadow-brand-500/20 border-2 border-brand-400 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700/70 hover:border-brand-500 hover:-translate-y-1 border-2 border-slate-700'
              }`}
            >
              <div className={`transition-colors duration-300 w-8 h-8 md:w-10 md:h-10 mb-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-300'}`}>
                  {item.icon}
              </div>
              <span className="font-semibold text-sm md:text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <main key={activePage} className="bg-slate-950/50 rounded-xl p-4 sm:p-6 lg:p-8 border border-slate-800 animate-fade-in">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;