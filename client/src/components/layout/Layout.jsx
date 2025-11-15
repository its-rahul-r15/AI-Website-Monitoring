import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Monitor, 
  Globe, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Zap
} from 'lucide-react';
import Button from '../common/Button';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Monitor,
    },
    { 
      name: 'Websites', 
      href: '/websites', 
      icon: Globe,
    },
    { 
      name: 'Analytics', 
      href: '/analytics', 
      icon: BarChart3,
    },
    { 
      name: 'Settings', 
      href: '/settings', 
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar for mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">AI Monitor</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-500 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <nav className="mt-6 px-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={handleLogout}
                className="!p-2"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200 lg:block">
        {/* Desktop Header */}
        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">AI Monitor</span>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="mt-8 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gray-100 p-2 rounded-full">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={handleLogout}
              className="!p-2"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Header */}
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="lg:hidden p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1 flex justify-end items-center">
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Mobile User Info */}
                <div className="lg:hidden flex items-center space-x-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;