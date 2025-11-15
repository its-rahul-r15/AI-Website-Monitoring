import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { websitesAPI, monitorAPI } from '../services/api';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Zap, 
  Shield,
  Globe,
  Activity,
  BarChart3,
  Download,
  Calendar
} from 'lucide-react';
import Button from '../components/common/Button';

const Analytics = () => {
  const [websites, setWebsites] = useState([]);
  const [monitoringData, setMonitoringData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const [websitesResponse, monitoringResponse] = await Promise.all([
        websitesAPI.getAll(),
        // In real app, you'd have an analytics API endpoint
        // For now, we'll use websites data
        Promise.resolve({ data: { data: [] } })
      ]);
      
      const websitesData = websitesResponse.data.data.websites;
      setWebsites(websitesData);
      
      // Calculate real statistics from websites data
      calculateRealStats(websitesData);
      setMonitoringData(generateRealChartData(websitesData));
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRealStats = (websitesData) => {
    if (websitesData.length === 0) {
      setStats({
        avgPerformance: 0,
        avgUptime: 0,
        avgResponseTime: 0,
        downtimeIncidents: 0,
        totalWebsites: 0,
        upWebsites: 0,
        healthScore: 0
      });
      return;
    }

    const totalWebsites = websitesData.length;
    const upWebsites = websitesData.filter(w => w.status === 'up').length;
    const downWebsites = websitesData.filter(w => w.status === 'down').length;
    
    const avgPerformance = websitesData.reduce((sum, w) => sum + (w.performanceScore || 0), 0) / totalWebsites;
    const avgUptime = websitesData.reduce((sum, w) => sum + (w.uptime || 0), 0) / totalWebsites;
    const avgResponseTime = websitesData.reduce((sum, w) => sum + (w.responseTime || 0), 0) / totalWebsites;
    
    // Calculate health score based on multiple factors
    const healthScore = Math.round(
      (upWebsites / totalWebsites) * 40 + 
      (avgPerformance / 100) * 30 +
      (avgUptime / 100) * 30
    );

    setStats({
      avgPerformance: Math.round(avgPerformance * 10) / 10,
      avgUptime: Math.round(avgUptime * 10) / 10,
      avgResponseTime: Math.round(avgResponseTime),
      downtimeIncidents: downWebsites,
      totalWebsites,
      upWebsites,
      healthScore
    });
  };

  const generateRealChartData = (websitesData) => {
    // Real performance data based on actual website scores
    const performanceData = websitesData.map((website, index) => ({
      name: website.name.length > 10 ? website.name.substring(0, 10) + '...' : website.name,
      performance: website.performanceScore || 0,
      uptime: website.uptime || 0,
      responseTime: website.responseTime || 0
    }));

    // Status distribution based on actual data
    const statusData = [
      { 
        name: 'Online', 
        value: websitesData.filter(w => w.status === 'up').length,
        color: '#10b981'
      },
      { 
        name: 'Offline', 
        value: websitesData.filter(w => w.status === 'down').length,
        color: '#ef4444'
      },
      { 
        name: 'Unknown', 
        value: websitesData.filter(w => !w.status || w.status === 'unknown').length,
        color: '#6b7280'
      }
    ];

    // Response time comparison
    const responseTimeData = websitesData
      .filter(w => w.responseTime > 0)
      .slice(0, 8)
      .map(website => ({
        name: website.name.length > 8 ? website.name.substring(0, 8) + '...' : website.name,
        responseTime: website.responseTime,
        performance: website.performanceScore || 0
      }));

    // Uptime trend (mock data based on current uptime)
    const uptimeTrendData = [
      { day: 'Mon', uptime: Math.max(80, (websitesData[0]?.uptime || 95) - 5) },
      { day: 'Tue', uptime: Math.max(85, (websitesData[0]?.uptime || 95) - 2) },
      { day: 'Wed', uptime: websitesData[0]?.uptime || 95 },
      { day: 'Thu', uptime: Math.min(99, (websitesData[0]?.uptime || 95) + 2) },
      { day: 'Fri', uptime: Math.min(98, (websitesData[0]?.uptime || 95) + 1) },
      { day: 'Sat', uptime: Math.min(97, (websitesData[0]?.uptime || 95) + 3) },
      { day: 'Sun', uptime: websitesData[0]?.uptime || 95 }
    ];

    return {
      performanceData,
      statusData,
      responseTimeData,
      uptimeTrendData
    };
  };

  const getPerformanceTrend = (current, previous) => {
    if (previous === 0) return 'new';
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
      isPositive: change >= 0
    };
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}{entry.name.includes('Time') ? 'ms' : '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
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
                Analytics
              </h1>
              <p className="text-gray-600 mt-1">Deep insights and performance metrics</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                >
                  <option value="24h">Last 24 hours</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
              <Button variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Export
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">System Health Score</h3>
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
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
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
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Websites</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalWebsites}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Online</p>
                <p className="text-xl font-bold text-green-600">{stats.upWebsites}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Avg Performance</p>
                <p className="text-2xl font-bold mt-1">{stats.avgPerformance}%</p>
                <p className="text-blue-200 text-xs mt-1">Overall score</p>
              </div>
              <Zap className="w-8 h-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Avg Uptime</p>
                <p className="text-2xl font-bold mt-1">{stats.avgUptime}%</p>
                <p className="text-green-200 text-xs mt-1">Reliability</p>
              </div>
              <Shield className="w-8 h-8 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Avg Response</p>
                <p className="text-2xl font-bold mt-1">{stats.avgResponseTime}ms</p>
                <p className="text-purple-200 text-xs mt-1">Speed</p>
              </div>
              <Clock className="w-8 h-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Downtime</p>
                <p className="text-2xl font-bold mt-1">{stats.downtimeIncidents}</p>
                <p className="text-red-200 text-xs mt-1">Incidents</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monitoringData.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="performance" 
                    fill="#0ea5e9" 
                    name="Performance Score"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar 
                    dataKey="uptime" 
                    fill="#10b981" 
                    name="Uptime %"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={monitoringData.statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {monitoringData.statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Response Times */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Response Time Analysis</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monitoringData.responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    label={{ value: 'ms', position: 'insideTopRight', offset: -10 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="responseTime" 
                    fill="#8b5cf6" 
                    name="Response Time"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Uptime Trend */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Uptime Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monitoringData.uptimeTrendData}>
                  <defs>
                    <linearGradient id="uptimeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[80, 100]}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#uptimeGradient)" 
                    name="Uptime %"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {websites.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Data Available</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start monitoring websites to see detailed analytics and performance insights.
            </p>
            <Button as="a" href="/websites">
              Add Websites
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;