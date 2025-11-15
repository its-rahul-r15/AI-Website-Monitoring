import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { telegramAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Bell, User, Shield, MessageCircle, ExternalLink, Copy } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [telegramStatus, setTelegramStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(''); // User input for chat ID

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    downtime: true,
    performance: true,
    seo: true,
    ssl: true,
    brokenLinks: true,
  });

  useEffect(() => {
    fetchTelegramStatus();
  }, []);

  const fetchTelegramStatus = async () => {
    try {
      const response = await telegramAPI.getConnectionStatus();
      setTelegramStatus(response.data.data);
    } catch (error) {
      console.error('Error fetching Telegram status:', error);
    }
  };

  const handleConnectTelegram = async () => {
    if (!chatId) {
      alert('Please enter your Chat ID first');
      return;
    }

    setLoading(true);
    try {
      await telegramAPI.connect(chatId); // User ka own chat ID use hoga
      await fetchTelegramStatus();
      setChatId(''); // Clear input after success
    } catch (error) {
      console.error('Error connecting Telegram:', error);
      alert(error.response?.data?.message || 'Failed to connect Telegram');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectTelegram = async () => {
    setLoading(true);
    try {
      await telegramAPI.disconnect();
      await fetchTelegramStatus();
    } catch (error) {
      console.error('Error disconnecting Telegram:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('URL copied to clipboard!');
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'integrations', name: 'Integrations', icon: MessageCircle },
    { id: 'security', name: 'Security', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
              <p className="text-sm text-gray-600">Update your account profile information</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Full Name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              />
              
              <Input
                label="Email Address"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            
            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>
              <p className="text-sm text-gray-600">Choose what alerts you want to receive</p>
            </div>
            
            <div className="space-y-4">
              {Object.entries(notificationSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Receive alerts for {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                  </label>
                </div>
              ))}
            </div>
            
            <div className="flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Telegram Integration</h3>
              <p className="text-sm text-gray-600">Connect your personal Telegram account to receive alerts</p>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="font-medium text-gray-900">Telegram Bot</p>
                    <p className="text-sm text-gray-600">
                      {telegramStatus?.isConnected 
                        ? `Connected to your personal Telegram account`
                        : 'Not connected'
                      }
                    </p>
                  </div>
                </div>
                
                {telegramStatus?.isConnected ? (
                  <Button
                    variant="danger"
                    loading={loading}
                    onClick={handleDisconnectTelegram}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    loading={loading}
                    onClick={handleConnectTelegram}
                    disabled={!chatId}
                  >
                    Connect Telegram
                  </Button>
                )}
              </div>
              
              {!telegramStatus?.isConnected ? (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">How to connect your Telegram:</h4>
                  
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Open Telegram and search for <strong>@alextelegram5656bot</strong></span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Send <code className="bg-blue-200 px-1 rounded">/start</code> or any message to the bot</span>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Get your Chat ID by visiting this URL:</span>
                    </div>

                    <div className="bg-black text-green-400 p-3 rounded font-mono text-[8px] relative">
                      https://api.telegram.org/bot7978415915:AAH6ST750fSfVDfseSSRBcALRbVQCMh1O0s/getUpdates
                      <button 
                        onClick={() => copyToClipboard('https://api.telegram.org/bot7978415915:AAH6ST750fSfVDfseSSRBcALRbVQCMh1O0s/getUpdates')}
                        className="absolute right-2 top-2 text-gray-400 hover:text-white"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <span>Look for <code className="bg-blue-200 px-1 rounded">"id"</code> in the <code className="bg-blue-200 px-1 rounded">"chat"</code> object</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">5</span>
                      <span>Paste your Chat ID below and click Connect</span>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <Input
                      placeholder="Enter your Chat ID (e.g., 123456789)"
                      value={chatId}
                      onChange={(e) => setChatId(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-green-800 font-medium">
                        ✅ Your Telegram is connected!
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        You will receive alerts on your personal Telegram account.
                      </p>
                      {telegramStatus.chatId && (
                        <p className="text-green-600 text-xs mt-1">
                          Connected Chat ID: {telegramStatus.chatId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
              <p className="text-sm text-gray-600">Manage your account security and password</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600 mb-4">Update your password to keep your account secure</p>
                <Button variant="secondary">Change Password</Button>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                <Button variant="secondary">Enable 2FA</Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {/* Sidebar */}
            <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200">
              <nav className="p-4 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;