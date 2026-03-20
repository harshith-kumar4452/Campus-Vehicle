import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import type { UserAuth } from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import StatusCheck from './components/StatusCheck';
import AdminDashboard from './components/AdminDashboard';
import { Car, FileText, Search, LogOut, LayoutDashboard } from 'lucide-react';

function App() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [activeTab, setActiveTab] = useState<'register' | 'status' | 'admin'>('register');

  useEffect(() => {
    if (user?.role === 'Admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('register');
    }
  }, [user]);

  const handleTabChange = (tab: 'register' | 'status' | 'admin') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return <LandingPage onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Car className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Campus Portal</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-gray-900">{user.email}</p>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{user.role}</p>
            </div>
            <button
              onClick={() => {
                setUser(null);
                setActiveTab('register');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 group"
            >
              <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {user.role !== 'Admin' ? (
          <>
            <div className="flex justify-center mb-8">
              <div className="inline-flex bg-gray-200/60 p-1.5 rounded-xl">
                <button
                  onClick={() => handleTabChange('register')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'register' 
                    ? 'bg-white shadow text-blue-700' 
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Register Vehicle
                </button>
                <button
                  onClick={() => handleTabChange('status')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-xs transition-all ${
                    activeTab === 'status' 
                    ? 'bg-white shadow text-blue-700' 
                    : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Check Status
                </button>
              </div>
            </div>

            {activeTab === 'register' ? (
              <RegistrationForm user={user} />
            ) : (
              <StatusCheck />
            )}
          </>
        ) : (
          <AdminDashboard />
        )}
      </main>

      <footer className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">&copy; 2026 Campus Vehicle Management. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
