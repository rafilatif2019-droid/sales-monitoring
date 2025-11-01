
import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Stores from './pages/Stores';
import Targets from './pages/Targets';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import { DashboardIcon, StoreIcon, TargetIcon, SettingsIcon, ChatIcon } from './components/icons';

type Page = 'dashboard' | 'stores' | 'targets' | 'settings' | 'chat';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');

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
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100">
      <aside className="w-full md:w-64 bg-slate-950 p-4 md:p-6 flex-shrink-0">
        <h1 className="text-2xl font-bold text-brand-400 mb-8">Sales Monitor</h1>
        <nav className="flex md:flex-col justify-around md:justify-start md:space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id as Page)}
              className={`flex items-center p-3 rounded-lg transition-colors text-sm md:text-base w-full text-left ${
                activePage === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="w-6 h-6 mr-0 md:mr-3">{item.icon}</span>
              <span className="hidden md:inline">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;