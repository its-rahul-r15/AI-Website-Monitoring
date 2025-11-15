import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Globe, 
  Activity, 
  AlertTriangle, 
  MoreVertical,
  Edit3,
  Trash2,
  RefreshCw,
  ExternalLink,
  BarChart3,
  Shield,
  Zap,
  Search,
  Filter
} from 'lucide-react';
import { websitesAPI, monitorAPI, telegramAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';

const Websites = () => {
  const [websites, setWebsites] = useState([]);
  const [filteredWebsites, setFilteredWebsites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    checkInterval: 5
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchWebsites();
  }, []);

  useEffect(() => {
    filterWebsites();
  }, [websites, searchTerm, statusFilter]);

  const fetchWebsites = async () => {
    try {
      const response = await websitesAPI.getAll();
      setWebsites(response.data.data.websites);
    } catch (error) {
      console.error('Error fetching websites:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterWebsites = () => {
    let filtered = websites;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(website =>
        website.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        website.url.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(website => website.status === statusFilter);
    }

    setFilteredWebsites(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      await websitesAPI.create(formData);
      await fetchWebsites();
      setIsModalOpen(false);
      setFormData({ name: '', url: '', checkInterval: 5 });
    } catch (error) {
      console.error('Error creating website:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleManualCheck = async (websiteId) => {
    try {
      await monitorAPI.manualCheck(websiteId);
      await fetchWebsites();
    } catch (error) {
      console.error('Error manual check:', error);
    }
  };

  const handleSendSummary = async (websiteId) => {
    try {
      await telegramAPI.sendSummary(websiteId);
      setIsTelegramModalOpen(false);
    } catch (error) {
      console.error('Error sending summary:', error);
    }
  };

  const handleDelete = async (websiteId) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      try {
        await websitesAPI.delete(websiteId);
        await fetchWebsites();
      } catch (error) {
        console.error('Error deleting website:', error);
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      up: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: Activity,
        label: 'Online',
        gradient: 'from-green-500 to-green-600'
      },
      down: {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: AlertTriangle,
        label: 'Offline',
        gradient: 'from-red-500 to-red-600'
      },
      unknown: {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        icon: Globe,
        label: 'Unknown',
        gradient: 'from-gray-500 to-gray-600'
      }
    };
    return configs[status] || configs.unknown;
  };

  const getUptimeColor = (uptime) => {
    if (uptime >= 99) return 'text-green-600';
    if (uptime >= 95) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your websites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Websites
              </h1>
              <p className="text-gray-600 mt-1">Monitor and manage your website portfolio</p>
            </div>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Website
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <p className="text-2xl font-bold text-gray-900">{websites.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">
                  {websites.filter(w => w.status === 'up').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-red-600">
                  {websites.filter(w => w.status === 'down').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Uptime</p>
                <p className="text-2xl font-bold text-gray-900">
                  {websites.length > 0 
                    ? Math.round(websites.reduce((sum, w) => sum + (w.uptime || 0), 0) / websites.length) 
                    : 0
                  }%
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="up">Online</option>
                <option value="down">Offline</option>
                <option value="unknown">Unknown</option>
              </select>
              <Button variant="secondary">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Websites Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredWebsites.map((website) => {
            const statusConfig = getStatusConfig(website.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={website._id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group overflow-hidden"
              >
                {/* Status Header */}
                <div className={`bg-gradient-to-r ${statusConfig.gradient} p-4 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <StatusIcon className="w-5 h-5" />
                      <span className="font-semibold">{statusConfig.label}</span>
                    </div>
                    <div className="text-sm font-medium">
                      {website.lastChecked ? 
                        new Date(website.lastChecked).toLocaleTimeString() : 
                        'Never checked'
                      }
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Website Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                        {website.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Globe className="w-4 h-4" />
                        <p className="text-sm truncate">{website.url}</p>
                        <a 
                          href={website.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getPerformanceColor(website.performanceScore || 0)}`}>
                        {website.performanceScore || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Performance</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getUptimeColor(website.uptime || 100)}`}>
                        {website.uptime || 100}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {website.responseTime || 0}ms
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Response</div>
                    </div>
                  </div>

                  {/* Progress Bars */}
                  <div className="space-y-3 mb-6">
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Uptime</span>
                        <span>{website.uptime || 100}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (website.uptime || 100) >= 99 ? 'bg-green-500' : 
                            (website.uptime || 100) >= 95 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${website.uptime || 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Performance</span>
                        <span>{website.performanceScore || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            (website.performanceScore || 0) >= 80 ? 'bg-green-500' : 
                            (website.performanceScore || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${website.performanceScore || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button 
                      size="small"
                      className="flex-1"
                      onClick={() => handleManualCheck(website._id)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Check Now
                    </Button>
                    <Button 
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setSelectedWebsite(website);
                        setIsTelegramModalOpen(true);
                      }}
                    >
                      <BarChart3 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="danger" 
                      size="small"
                      onClick={() => handleDelete(website._id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredWebsites.length === 0 && (
            <div className="col-span-full text-center py-16">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
                <Globe className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {websites.length === 0 ? 'No websites yet' : 'No results found'}
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {websites.length === 0 
                    ? 'Start monitoring your first website to get real-time insights and performance metrics.'
                    : 'Try adjusting your search or filter to find what you\'re looking for.'
                  }
                </p>
                {websites.length === 0 && (
                  <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Website
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Website Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Website"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website Details
            </label>
            <Input
              placeholder="e.g., Google"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <Input
              placeholder="e.g., https://google.com"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Interval
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.checkInterval}
              onChange={(e) => setFormData({ ...formData, checkInterval: parseInt(e.target.value) })}
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              How often we should check your website status
            </p>
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={formLoading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              Add Website
            </Button>
          </div>
        </form>
      </Modal>

      {/* Telegram Summary Modal */}
      <Modal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        title="Send Telegram Summary"
      >
        {selectedWebsite && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedWebsite.status === 'up' ? 'bg-green-100' : 
                  selectedWebsite.status === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {getStatusConfig(selectedWebsite.status).icon({ className: "w-5 h-5" })}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedWebsite.name}</p>
                  <p className="text-sm text-gray-600">{selectedWebsite.url}</p>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-center">
              Send detailed monitoring summary to your Telegram?
            </p>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsTelegramModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                onClick={() => handleSendSummary(selectedWebsite._id)}
              >
                Send Summary
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Websites;