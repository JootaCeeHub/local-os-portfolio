import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Projects } from './components/Projects';
import { Trading } from './components/Trading';
import { Learning } from './components/Learning';
import { Pomodoro } from './components/Pomodoro';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { Notifications } from './components/Notifications';
import { Tasks } from './components/Tasks';
import { Calendar } from './components/Calendar';
import { Finances } from './components/Finances';
import { useAuthStore } from './store/auth';

function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  const { user, loading } = useAuthStore();

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      useAuthStore.setState({ user: JSON.parse(savedUser), loading: false });
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#121212]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <main className="flex-1 overflow-x-hidden">
        {activeModule === 'dashboard' && <Dashboard />}
        {activeModule === 'projects' && <Projects />}
        {activeModule === 'trading' && <Trading />}
        {activeModule === 'learning' && <Learning />}
        {activeModule === 'pomodoro' && <Pomodoro />}
        {activeModule === 'settings' && <Settings />}
        {activeModule === 'profile' && <Profile />}
        {activeModule === 'notifications' && <Notifications />}
        {activeModule === 'tasks' && <Tasks />}
        {activeModule === 'calendar' && <Calendar />}
        {activeModule === 'finances' && <Finances />}
      </main>
    </div>
  );
}

export default App;