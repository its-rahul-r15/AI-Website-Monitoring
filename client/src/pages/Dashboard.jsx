import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Monitor, 
  Globe, 
  Activity, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  Zap,
  Shield,
  Eye,
  RefreshCw,
  BarChart3,
  ExternalLink
} from 'lucide-react';
import { websitesAPI, monitorAPI, telegramAPI } from '../services/api';
import Button from '../components/common/Button';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [websites, setWebsites] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const websitesResponse = await websitesAPI.getAll();
      const websitesData = websitesResponse.data.data.websites;
      setWebsites(websitesData);
      calculateStats(websitesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateStats = (websitesData) => {
    const totalWebsites = websitesData.length;
    const upWebsites = websitesData.filter(w => w.status === 'up').length;
    const downWebsites = websitesData.filter(w => w.status === 'down').length;
    const avgUptime = websitesData.reduce((sum, w) => sum + (w.uptime || 0), 0) / totalWebsites || 0;
    const avgPerformance = websitesData.reduce((sum, w) => sum + (w.performanceScore || 0), 0) / totalWebsites || 0;
    const avgResponseTime = websitesData.reduce((sum, w) => sum + (w.responseTime || 0), 0) / totalWebsites || 0;

    setStats({
      totalWebsites,
      upWebsites,
      downWebsites,
      avgUptime,
      avgPerformance,
      avgResponseTime,
      healthScore: calculateHealthScore(websitesData)
    });
  };

  const calculateHealthScore = (websites) => {
    if (websites.length === 0) return 100;
    
    const totalScore = websites.reduce((sum, website) => {
      const statusScore = website.status === 'up' ? 40 : 0;
      const performanceScore = (website.performanceScore || 0) * 0.4;
      const uptimeScore = (website.uptime || 0) * 0.2;
      return sum + statusScore + performanceScore + uptimeScore;
    }, 0);
    
    return Math.round(totalScore / websites.length);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleQuickCheck = async (websiteId) => {
    try {
      await monitorAPI.manualCheck(websiteId);
      // Refresh data after check
      setTimeout(fetchDashboardData, 2000);
    } catch (error) {
      console.error('Error manual check:', error);
    }
  };

  const handleSendSummary = async (websiteId) => {
    try {
      await telegramAPI.sendSummary(websiteId);
    } catch (error) {
      console.error('Error sending summary:', error);
    }
  };

  // Chart Data
  const statusChartData = {
    labels: ['Online', 'Offline', 'Unknown'],
    datasets: [
      {
        data: [
          stats.upWebsites,
          stats.downWebsites,
          websites.length - stats.upWebsites - stats.downWebsites
        ],
        backgroundColor: ['#10b981', '#ef4444', '#6b7280'],
        borderWidth: 0,
      },
    ],
  };

  const performanceChartData = {
    labels: websites.map(w => w.name),
    datasets: [
      {
        label: 'Performance Score',
        data: websites.map(w => w.performanceScore || 0),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const responseTimeData = {
    labels: websites.slice(0, 5).map(w => w.name),
    datasets: [
      {
        label: 'Response Time (ms)',
        data: websites.slice(0, 5).map(w => w.responseTime || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const statusChartOptions = {
    ...chartOptions,
    cutout: '70%',
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'up': return 'text-green-600 bg-green-50 border-green-200';
      case 'down': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'up': return <Activity className="w-4 h-4" />;
      case 'down': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
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
                Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Real-time monitoring insights</p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="secondary" 
                onClick={handleRefresh}
                loading={refreshing}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button as={Link} to="/websites">
                <Globe className="w-4 h-4 mr-2" />
                Manage Websites
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Health Score & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Health Score */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                <p className="text-gray-600 text-sm">Overall monitoring health</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{stats.healthScore}%</div>
                <div className={`text-sm font-medium ${
                  stats.healthScore >= 80 ? 'text-green-600' : 
                  stats.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {stats.healthScore >= 80 ? 'Excellent' : 
                   stats.healthScore >= 60 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  stats.healthScore >= 80 ? 'bg-green-500' : 
                  stats.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${stats.healthScore}%` }}
              ></div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-xl font-bold text-gray-900">{stats.avgPerformance.toFixed(1)}/100</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-xl font-bold text-gray-900">{stats.avgResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Websites</p>
                <p className="text-3xl font-bold mt-1">{stats.totalWebsites}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Online</p>
                <p className="text-3xl font-bold mt-1">{stats.upWebsites}</p>
              </div>
              <Activity className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Offline</p>
                <p className="text-3xl font-bold mt-1">{stats.downWebsites}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Uptime</p>
                <p className="text-3xl font-bold mt-1">{stats.avgUptime.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-64">
              <Line data={performanceChartData} options={chartOptions} />
            </div>
          </div>

          {/* Status & Response Time Charts */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
              <div className="h-48">
                <Doughnut data={statusChartData} options={statusChartOptions} />
              </div>
            </div>
            
            {websites.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Times</h3>
                <div className="h-48">
                  <Bar data={responseTimeData} options={chartOptions} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Website Preview Grid Section - Uptime Display */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {websites.slice(0, 6).map((website) => (
    <div key={website._id} className="border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 group">
      <div className="p-5">
        {/* Website Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getStatusColor(website.status)}`}>
              {getStatusIcon(website.status)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {website.name}
              </h4>
              <p className="text-sm text-gray-500 truncate max-w-[120px]">
                {website.url.replace(/^https?:\/\//, '')}
              </p>
            </div>
          </div>
          <a 
            href={website.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
          >
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </a>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {website.performanceScore || 0}
            </div>
            <div className="text-xs text-gray-500">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {website.uptime || 100}%
            </div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {website.responseTime ? `${website.responseTime}ms` : '0'}
            </div>
            <div className="text-xs text-gray-500">Response</div>
          </div>
        </div>

        {/* Uptime Progress Bar */}
        <div className="mb-4">
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

        {/* Last Check */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
          <span>Last Check</span>
          <span>
            {website.lastChecked ? 
              new Date(website.lastChecked).toLocaleTimeString() : 
              'Never'
            }
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            size="small"
            className="flex-1"
            onClick={() => handleQuickCheck(website._id)}
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Check
          </Button>
          <Button 
            variant="secondary"
            size="small"
            onClick={() => handleSendSummary(website._id)}
          >
            📊
          </Button>
        </div>
      </div>
    </div>
  ))}
</div>
        </div>
      </div>
    
  );
};

export default Dashboard;