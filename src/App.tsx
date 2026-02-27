import { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ExecutiveSummary } from './components/dashboard/ExecutiveSummary';
import { Dashboard } from './components/dashboard/Dashboard';
import { IndicatorsList } from './components/dashboard/IndicatorsList';
import { IndicatorForm } from './components/dashboard/IndicatorForm';
import { WelcomePage } from './components/landing/WelcomePage';
import { LoadingScreen } from './components/common/LoadingScreen';
import { MOCK_DATA } from './data/mockData';
import { Indicator, TIMEFRAMES } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'app'>('landing');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('executive');
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[0]); // Default to 'ภาพรวม (สะสม)'
  const [data, setData] = useState<Indicator[]>(MOCK_DATA);
  const [editingIndicator, setEditingIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-close sidebar on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveIndicator = (updatedIndicator: Indicator) => {
    setData(prevData => 
      prevData.map(item => item.id === updatedIndicator.id ? updatedIndicator : item)
    );
  };

  const handleEnterApp = (tab: string) => {
    setActiveTab(tab);
    setView('app');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (view === 'landing') {
    return <WelcomePage onEnterApp={handleEnterApp} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50 font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onGoHome={() => setView('landing')}
      />
      
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <Header 
          isOpen={isSidebarOpen} 
          setIsOpen={setIsSidebarOpen} 
          fiscalYear={fiscalYear}
          setFiscalYear={setFiscalYear}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
        />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait">
            {activeTab === 'executive' && (
              <motion.div
                key="executive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ExecutiveSummary data={data} fiscalYear={fiscalYear} timeframe={timeframe} />
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Dashboard data={data} fiscalYear={fiscalYear} timeframe={timeframe} />
              </motion.div>
            )}
            
            {activeTab === 'indicators' && (
              <motion.div
                key="indicators"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <IndicatorsList 
                  data={data} 
                  fiscalYear={fiscalYear} 
                  timeframe={timeframe}
                  onEdit={setEditingIndicator} 
                />
              </motion.div>
            )}

            {(activeTab === 'reports' || activeTab === 'settings') && (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center h-[60vh] text-slate-400"
              >
                <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center">
                  <span className="text-4xl">🚧</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-700 mb-2">กำลังพัฒนาระบบ</h2>
                <p>เมนูนี้อยู่ระหว่างการพัฒนา จะเปิดให้ใช้งานเร็วๆ นี้</p>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        <Footer />
      </div>

      {/* Modals */}
      {editingIndicator && (
        <IndicatorForm 
          indicator={editingIndicator} 
          timeframe={timeframe}
          onClose={() => setEditingIndicator(null)} 
          onSave={handleSaveIndicator} 
        />
      )}
    </div>
  );
}
