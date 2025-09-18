import React, { useState, useEffect, useRef, useMemo, createContext, useContext, memo } from 'react';
import { useRouter } from 'next/router';
import { AdminAnalyticsReal } from './AdminAnalyticsReal';
import { AdminABTestResults } from './AdminABTestResults';
import { AdminQuotes } from './AdminQuotes';
import { AdminBlogAnalytics } from './AdminBlogAnalytics';
import { AdminBlogGenerator } from './AdminBlogGenerator';
import { AdminChatbotDetails } from './AdminChatbotDetails';
import { AdminRealtimePerformance } from './AdminRealtimePerformance';
import { AdminSEOAnalytics } from './AdminSEOAnalytics';
import { LandingPageManager } from './LandingPageManager';
import { AdminCTAManager } from './admin/AdminCTAManager';
import { AdminBlogEnricher } from './admin/AdminBlogEnricher';
import { AdminChatbotSessions } from './AdminChatbotSessions';
import { AdminChatbotSessionDetails } from './AdminChatbotSessionDetails';

import { AdminSitePerformance } from './AdminSitePerformance';
import { AdminUserBehavior } from './AdminUserBehavior';
import { AdminMarketingInsights } from './AdminMarketingInsights';
import { AdminAIGeneration } from './AdminAIGeneration';
import { AdminUserManagement } from './AdminUserManagement';

// Composants optimisés extraits
import { AdminOverview } from './admin/AdminOverview';
import { EnhancedDashboard } from './admin/EnhancedDashboard';
import { AdminChatbotAnalytics } from './admin/AdminChatbotAnalytics';
import { AdminPerformance } from './admin/AdminPerformance';

// Performance optimization components
import { usePerformanceOptimization, useLazyLoading, useVirtualization } from '../hooks/usePerformanceOptimization';
import { LazyLoadComponent, MemoizedLazyLoadComponent } from './LazyLoadComponent';
import { MemoizedVirtualizedList } from './VirtualizedList';
import { MemoizedStatCard } from './MemoizedStatCard';

import { 
  BarChart3, 
  MessageSquare, 
  FileText, 
  BookOpen,
  Bot,
  Zap,
  Users,
  TrendingUp,
  AlertCircle,
  LogOut,
  Activity,
  Search,
  Link2,
  Check,
  Smartphone,
  MapPin,
  Bell,
  X,
  Eye,
  Monitor,
  MousePointerClick,
  List,
  FileTextIcon,
  BarChart,
  Globe,
  Heart,
  Sparkles,
  Shield,
  Sun,
  Moon,
  RefreshCw,
  Download,
  MoreHorizontal,
  MessageCircle,
  Settings,
  HelpCircle
} from 'lucide-react';

type TabType = 'overview' | 'analytics' | 'blog' | 'blog-generator' | 'chatbot' | 'chatbot-sessions' | 'chatbot-analytics' | 'abtests' | 'quotes' | 'performance' | 'realtime-performance' | 'seo' | 'landing-page' | 'cta-manager' | 'site-performance' | 'user-behavior' | 'marketing-insights' | 'ai-generation' | 'user-management' | 'dashboard' | 'users' | 'settings' | 'help';

// Create a context for dark mode
const DarkModeContext = createContext({
  darkMode: false,
  toggleDarkMode: () => {}
});

// Create a provider component
const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or respect system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return newMode;
    });
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Create a hook to use the dark mode context
const useDarkMode = () => useContext(DarkModeContext);

// Notification types
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Create a context for notifications
const NotificationContext = createContext({
  notifications: [] as Notification[],
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {},
  markAsRead: (id: string) => {},
  dismissNotification: (id: string) => {},
  clearNotifications: () => {}
});

// Create a provider component for notifications
const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substring(2, 11),
      ...notification,
      timestamp: new Date(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? {...notification, read: true} : notification
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      markAsRead, 
      dismissNotification,
      clearNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Create a hook to use the notification context
const useNotifications = () => useContext(NotificationContext);

// Define user roles
type UserRole = 'admin' | 'editor' | 'viewer';

// Define permissions for each role
const ROLE_PERMISSIONS: Record<UserRole, TabType[]> = {
  admin: [
    'overview', 'analytics', 'blog', 'blog-generator', 'chatbot', 'chatbot-sessions', 
    'chatbot-analytics', 'abtests', 'quotes', 'performance', 'realtime-performance', 
    'seo', 'landing-page', 'cta-manager', 'site-performance', 'user-behavior', 
    'marketing-insights', 'ai-generation', 'user-management'
  ],
  editor: [
    'overview', 'analytics', 'blog', 'blog-generator', 'chatbot', 'chatbot-sessions', 
    'chatbot-analytics', 'quotes', 'performance', 'realtime-performance', 
    'seo', 'landing-page', 'cta-manager', 'site-performance', 'user-behavior', 
    'marketing-insights', 'ai-generation'
  ],
  viewer: [
    'overview', 'analytics', 'blog', 'chatbot', 'chatbot-sessions', 
    'chatbot-analytics', 'quotes', 'performance', 'realtime-performance', 
    'seo', 'site-performance', 'user-behavior', 'marketing-insights'
  ]
};

// Mock user data - in a real app, this would come from your auth system
const mockUser = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@omadigital.com',
  role: 'admin' as UserRole
};

export function AdminDashboard360() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();
  const { addNotification } = useNotifications();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    
    // Vérifier l'authentification
    const isLoggedIn = localStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      router.push('/admin/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_logged_in');
    window.location.href = '/admin/login';
  };

  const tabs = [
    { id: 'overview', label: "Vue d'ensemble", icon: BarChart3, category: 'general' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, category: 'general' },
    { id: 'performance', label: 'Performance', icon: Zap, category: 'general' },
    { id: 'realtime-performance', label: 'Performance RT', icon: Activity, category: 'general' },
    { id: 'user-behavior', label: 'Comportement', icon: Users, category: 'general' },
    { id: 'seo', label: 'SEO', icon: Search, category: 'general' },
    { id: 'site-performance', label: 'Performance Site', icon: Zap, category: 'general' },
    { id: 'marketing-insights', label: 'Insights Marketing', icon: Heart, category: 'general' },
    { id: 'abtests', label: 'Tests A/B', icon: Zap, category: 'general' },
    
    { id: 'blog', label: 'Blog', icon: BookOpen, category: 'content' },
    { id: 'blog-generator', label: 'Générer article', icon: FileText, category: 'content' },
    { id: 'blog-enricher', label: 'Enrichir articles', icon: Sparkles, category: 'content' },
    { id: 'quotes', label: 'Devis', icon: FileTextIcon, category: 'content' },
    
    { id: 'chatbot', label: 'Chatbot', icon: MessageSquare, category: 'ai' },
    { id: 'chatbot-sessions', label: 'Sessions Chatbot', icon: List, category: 'ai' },
    { id: 'chatbot-analytics', label: 'Analytics Chatbot', icon: BarChart, category: 'ai' },
    
    { id: 'landing-page', label: 'Landing Page', icon: Monitor, category: 'marketing' },
    { id: 'cta-manager', label: 'Gestion CTA', icon: MousePointerClick, category: 'marketing' },
    { id: 'ai-generation', label: 'Génération IA', icon: Sparkles, category: 'marketing' },
    
    { id: 'user-management', label: 'Gestion Utilisateurs', icon: Shield, category: 'admin' },
  ] as const;

  // Sync active tab with URL and localStorage
  useEffect(() => {
    if (!isClient || !router.isReady) return;
    const q = router.query.tab as string | undefined;
    const valid = (id: any): id is TabType => !!tabs.find(t => t.id === id);

    if (q && valid(q)) {
      setActiveTab(q);
    } else if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('adminActiveTab');
      if (stored && valid(stored)) {
        setActiveTab(stored);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, isClient]);

  useEffect(() => {
    if (!isClient || !router.isReady) return;
    // Update URL query (shallow) and persist
    const nextQuery = { ...router.query, tab: activeTab };
    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true });
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('adminActiveTab', activeTab);
    }
  }, [activeTab, router, isClient]);

  // Keyboard shortcuts and quick search
  const tabIds = useMemo(() => tabs.map(t => t.id), [tabs]);

  useEffect(() => {
    if (!isClient) return;
    
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping = target && ['INPUT', 'TEXTAREA'].includes(target.tagName);
      // Focus quick search with '/'
      if (e.key === '/' && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }
      // Alt+1..9 to switch tabs
      if (e.altKey) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= Math.min(9, tabs.length)) {
          e.preventDefault();
          setActiveTab(tabs[num - 1].id as TabType);
          return;
        }
      }
      // Arrow navigation
      if (!isTyping && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        const idx = tabs.findIndex(t => t.id === activeTab);
        const nextIdx = e.key === 'ArrowRight' ? (idx + 1) % tabs.length : (idx - 1 + tabs.length) % tabs.length;
        setActiveTab(tabs[nextIdx].id as TabType);
      }
      // Enter to jump to first matching tab when search focused
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        const q = searchQuery.trim().toLowerCase();
        const match = tabs.find(t => t.label.toLowerCase().includes(q) || t.id.includes(q));
        if (match) setActiveTab(match.id as TabType);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, searchQuery, tabIds, isClient]);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const url = typeof window !== 'undefined' ? `${window.location.origin}${router.pathname}?tab=${activeTab}` : '';
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  const renderTabContent = () => {
    // Check if we're viewing chatbot details
    if (router.pathname === '/admin/chatbot/[id]') {
      return <AdminChatbotDetails />;
    }
    
    switch (activeTab) {
      case 'overview':
        return <EnhancedDashboard />;
      case 'analytics':
        return <AdminAnalyticsReal />;
      case 'blog':
        return <AdminBlogAnalytics />;
      case 'blog-generator':
        return <AdminBlogGenerator />;
      case 'blog-enricher':
        return <AdminBlogEnricher />;
      case 'chatbot':
        return <AdminChatbotAnalytics />;
      case 'chatbot-sessions':
        return <AdminChatbotSessions />;
      case 'chatbot-analytics':
        return <AdminChatbotAnalytics />;
      case 'abtests':
        return <AdminABTestResults />;
      case 'quotes':
        return <AdminQuotes />;
      case 'performance':
        return <AdminPerformance />;
      case 'realtime-performance':
        return <AdminRealtimePerformance />;
      case 'seo':
        return <AdminSEOAnalytics />;
      case 'landing-page':
        return <LandingPageManager />;
      case 'cta-manager':
        return <AdminCTAManager />;
      case 'site-performance':
        return <AdminSitePerformance />;
      case 'user-behavior':
        return <AdminUserBehavior />;
      case 'marketing-insights':
        return <AdminMarketingInsights />;
      case 'ai-generation':
        return <AdminAIGeneration />;
      case 'user-management':
        return <AdminUserManagement />;
      default:
        return <AdminOverview />;
    }
  };

  // Simulate real-time notifications
  useEffect(() => {
    if (!isClient) return;
    
    const interval = setInterval(() => {
      // Randomly add notifications
      if (Math.random() > 0.7) {
        const notificationTypes: NotificationType[] = ['info', 'success', 'warning', 'error'];
        const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const notifications = {
          info: {
            title: "Nouvelle interaction",
            message: "Un utilisateur a soumis un nouveau formulaire de contact"
          },
          success: {
            title: "Tâche terminée",
            message: "Le rapport mensuel a été généré avec succès"
          },
          warning: {
            title: "Performance faible",
            message: "Le temps de réponse du serveur dépasse 2 secondes"
          },
          error: {
            title: "Erreur système",
            message: "Impossible de se connecter à la base de données"
          }
        };
        
        addNotification({
          type: randomType,
          title: notifications[randomType].title,
          message: notifications[randomType].message
        });
      }
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [isClient, addNotification]);

  // Filter tabs based on user role
  const userTabs = tabs.filter(tab => 
    ROLE_PERMISSIONS[mockUser.role].includes(tab.id as TabType)
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isClient) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle mobile menu with Ctrl+M
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setIsMobileMenuOpen(prev => !prev);
      }
      
      // Close mobile menu with Escape
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClient, isMobileMenuOpen]);

  // Don't render interactive elements on server
  if (!isClient) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`shadow ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
              >
                <List className="w-6 h-6" />
              </button>
              <h1 className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Tableau de bord OMA Digital
                <span className={`text-xs ml-2 px-2 py-1 rounded hidden sm:inline ${
                  mockUser.role === 'admin' ? 'bg-red-100 text-red-800' : 
                  mockUser.role === 'editor' ? 'bg-blue-100 text-blue-800' : 
                  'bg-green-100 text-green-800'
                }`}>
                  {mockUser.role === 'admin' ? 'Administrateur' : 
                   mockUser.role === 'editor' ? 'Éditeur' : 'Lecteur'}
                </span>
              </h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className={`flex items-center space-x-1 text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} px-3 py-1.5 border rounded-md ${
                      darkMode ? 'border-gray-600' : 'border-gray-300'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="hidden lg:inline">Rechercher un onglet</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>/</span>
                  </button>
                  {isSearchOpen && (
                    <div className={`absolute right-0 mt-1 w-80 border rounded-md shadow-lg z-10 ${
                      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Rechercher un onglet..."
                          className={`w-full px-3 py-2 text-sm border-0 border-b focus:outline-none focus:ring-0 ${
                            darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200'
                          }`}
                          aria-label="Recherche d'onglet"
                          autoFocus
                        />
                        <button 
                          onClick={() => setIsSearchOpen(false)}
                          className={`absolute right-2 top-2 ${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      {searchQuery && (
                        <div className="max-h-60 overflow-y-auto">
                          {userTabs
                            .filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery.toLowerCase()))
                            .slice(0,8)
                            .map(t => {
                              const Icon = t.icon;
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => { setActiveTab(t.id as TabType); setIsSearchOpen(false); setSearchQuery(''); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                                    darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-50 text-gray-900'
                                  }`}
                                >
                                  <Icon className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                                  <span>{t.label}</span>
                                </button>
                              );
                            })}
                          {userTabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.includes(searchQuery.toLowerCase())).length === 0 && (
                            <div className={`px-3 py-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Aucun onglet trouvé</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`flex items-center space-x-1 text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  title="Copier le lien de l'onglet"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
                  <span className="hidden lg:inline">{copied ? 'Copié' : 'Lien'}</span>
                </button>
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center space-x-1 text-sm ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  title={darkMode ? "Désactiver le mode sombre" : "Activer le mode sombre"}
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="hidden lg:inline">{darkMode ? 'Mode clair' : 'Mode sombre'}</span>
                </button>
              </div>
              <NotificationBell />
              <button
                onClick={handleLogout}
                className={`flex items-center space-x-1 text-sm px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600`}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
              <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} hidden lg:block`}>
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className={`absolute inset-y-0 left-0 w-64 max-w-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg transform transition-transform duration-300 ease-in-out`}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="py-2 overflow-y-auto max-h-[calc(100vh-4rem)]">
              {userTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as TabType); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left ${
                      activeTab === tab.id
                        ? 'text-orange-600 bg-orange-50 dark:bg-gray-700'
                        : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t">
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Connecté en tant que {mockUser.name}
              </div>
              <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Rôle: {mockUser.role === 'admin' ? 'Administrateur' : 
                       mockUser.role === 'editor' ? 'Éditeur' : 'Lecteur'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={`shadow-sm ${darkMode ? 'bg-gray-800' : 'bg-white'} hidden md:block`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-8">
            {userTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-orange-600 border-b-2 border-orange-600'
                      : darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`py-8 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} min-h-screen`}>
        {renderTabContent()}
      </div>
    </main>
  );
}

// Utility function for filtering and sorting data
const useFilteredAndSortedData = <T,>(
  data: T[],
  filters: Record<string, any>,
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null
): T[] => {
  return useMemo(() => {
    let filteredData = [...data];
    
    // Apply filters
    Object.keys(filters).forEach(key => {
      const filterValue = filters[key];
      if (filterValue !== undefined && filterValue !== null && filterValue !== '') {
        filteredData = filteredData.filter(item => {
          const itemValue = (item as any)[key];
          if (typeof itemValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
          }
          return itemValue === filterValue;
        });
      }
    });
    
    // Apply sorting
    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredData;
  }, [data, filters, sortConfig]);
};

// Filter and sort controls component
const FilterAndSortControls: React.FC<{
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSortChange: (key: string) => void;
  filterFields: { key: string; label: string; type: 'text' | 'select'; options?: string[] }[];
  sortFields: { key: string; label: string }[];
  className?: string;
}> = ({ filters, onFilterChange, sortConfig, onSortChange, filterFields, sortFields, className = '' }) => {
  const { darkMode } = useDarkMode();
  
  return (
    <div className={`flex flex-wrap gap-3 mb-4 ${className}`}>
      {/* Filter controls */}
      {filterFields.map(field => (
        <div key={field.key} className="flex-1 min-w-[200px]">
          <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {field.label}
          </label>
          {field.type === 'select' && field.options ? (
            <select
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value || undefined)}
              className={`w-full text-sm border rounded px-2 py-1 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Tous</option>
              {field.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={filters[field.key] || ''}
              onChange={(e) => onFilterChange(field.key, e.target.value || undefined)}
              placeholder={`Filtrer par ${field.label.toLowerCase()}...`}
              className={`w-full text-sm border rounded px-2 py-1 ${
                darkMode 
                  ? 'bg-gray-800 border-gray-700 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          )}
        </div>
      ))}
      
      {/* Sort controls */}
      <div className="flex-1 min-w-[200px]">
        <label className={`block text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Trier par
        </label>
        <div className="flex gap-2">
          <select
            value={sortConfig?.key || ''}
            onChange={(e) => onSortChange(e.target.value)}
            className={`flex-1 text-sm border rounded px-2 py-1 ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">Aucun tri</option>
            {sortFields.map(field => (
              <option key={field.key} value={field.key}>{field.label}</option>
            ))}
          </select>
          {sortConfig && (
            <button
              onClick={() => onSortChange(sortConfig.key)}
              className={`px-2 rounded ${
                darkMode 
                  ? 'bg-gray-700 text-white hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              title={sortConfig.direction === 'asc' ? 'Trier par ordre décroissant' : 'Trier par ordre croissant'}
            >
              {sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};





// Export functions for overview data handling
const handleExportOverview = () => {
  console.log('Exporting overview data...');
};

const handleExportQuotes = () => {
  console.log('Exporting quotes data...');
};

const handleExportConversations = () => {
  console.log('Exporting conversations data...');
};

// Notification Bell Component
const NotificationBell = () => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="relative">
      <button className="text-gray-600 hover:text-gray-900">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

// Dashboard components
const Dashboard = () => <div>Dashboard Content</div>;
const UsersComponent = () => <div>Users Content</div>;
const SettingsComponent = () => <div>Settings Content</div>;
const Help = () => <div>Help Content</div>;

// Wrap the component with the NotificationProvider
export const AdminDashboard360WithProviders = () => {
  return (
    <NotificationProvider>
      <DarkModeProvider>
        <AdminDashboard360 />
      </DarkModeProvider>
    </NotificationProvider>
  );
};

// AdminOverview component moved to ./admin/AdminOverview.tsx

// AdminChatbotAnalytics and AdminPerformance components moved to ./admin/ directory
