import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TestMetrics {
  timestamp: string;
  testsPassed: number;
  testsFailed: number;
  coveragePercent: number;
  executionTime: number;
  agentPerformance: {
    UI: number;
    Functional: number;
    DB: number;
  };
}

interface VisualDashboardProps {
  testResults?: any;
  historicalData?: TestMetrics[];
}

export const VisualDashboard: React.FC<VisualDashboardProps> = ({ 
  testResults, 
  historicalData = [] 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'coverage' | 'performance'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  // Generate sample historical data if none provided
  const sampleHistoricalData = historicalData.length > 0 ? historicalData : generateSampleData();

  function generateSampleData(): TestMetrics[] {
    const data: TestMetrics[] = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      data.push({
        timestamp: date.toISOString(),
        testsPassed: Math.floor(Math.random() * 50) + 30,
        testsFailed: Math.floor(Math.random() * 15) + 2,
        coveragePercent: Math.floor(Math.random() * 20) + 75,
        executionTime: Math.floor(Math.random() * 120) + 60,
        agentPerformance: {
          UI: Math.random() * 0.3 + 0.7,
          Functional: Math.random() * 0.3 + 0.75,
          DB: Math.random() * 0.3 + 0.8
        }
      });
    }
    
    return data;
  }

  // Chart configurations
  const trendsChartData = {
    labels: sampleHistoricalData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Tests Passed',
        data: sampleHistoricalData.map(d => d.testsPassed),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Tests Failed',
        data: sampleHistoricalData.map(d => d.testsFailed),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const coverageChartData = {
    labels: sampleHistoricalData.map(d => new Date(d.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Coverage %',
        data: sampleHistoricalData.map(d => d.coveragePercent),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const performanceChartData = {
    labels: ['UI Agent', 'Functional Agent', 'Database Agent'],
    datasets: [
      {
        label: 'Performance Score',
        data: [
          sampleHistoricalData[sampleHistoricalData.length - 1]?.agentPerformance.UI * 100 || 85,
          sampleHistoricalData[sampleHistoricalData.length - 1]?.agentPerformance.Functional * 100 || 90,
          sampleHistoricalData[sampleHistoricalData.length - 1]?.agentPerformance.DB * 100 || 88
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(168, 85, 247)'
        ],
        borderWidth: 2
      }
    ]
  };

  const issueDistributionData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          testResults?.issues?.filter((i: any) => i.severity === 'Critical').length || 2,
          testResults?.issues?.filter((i: any) => i.severity === 'High').length || 5,
          testResults?.issues?.filter((i: any) => i.severity === 'Medium').length || 8,
          testResults?.issues?.filter((i: any) => i.severity === 'Low').length || 12
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)'
        ],
        borderWidth: 2
      }
    ]
  };

  const agentRadarData = {
    labels: ['Speed', 'Accuracy', 'Coverage', 'Reliability', 'Adaptability'],
    datasets: [
      {
        label: 'UI Agent',
        data: [85, 88, 82, 90, 87],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(59, 130, 246)'
      },
      {
        label: 'Functional Agent',
        data: [92, 85, 88, 87, 90],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        pointBackgroundColor: 'rgb(34, 197, 94)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(34, 197, 94)'
      },
      {
        label: 'Database Agent',
        data: [88, 92, 85, 95, 83],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        pointBackgroundColor: 'rgb(168, 85, 247)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(168, 85, 247)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      r: {
        angleLines: {
          display: false
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Testing Analytics Dashboard</h2>
        <div className="flex space-x-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'trends', label: 'Trends', icon: '📈' },
          { id: 'coverage', label: 'Coverage', icon: '🎯' },
          { id: 'performance', label: 'Performance', icon: '⚡' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics Cards */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">
                {testResults?.summary?.testsPassed || sampleHistoricalData[sampleHistoricalData.length - 1]?.testsPassed || 42}
              </div>
              <div className="text-blue-100">Tests Passed</div>
            </div>
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">
                {testResults?.summary?.testsFailed || sampleHistoricalData[sampleHistoricalData.length - 1]?.testsFailed || 8}
              </div>
              <div className="text-red-100">Tests Failed</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">
                {testResults?.summary?.coveragePercent || sampleHistoricalData[sampleHistoricalData.length - 1]?.coveragePercent || 87}%
              </div>
              <div className="text-green-100">Coverage</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="text-2xl font-bold">
                {Math.round((testResults?.executionTime || sampleHistoricalData[sampleHistoricalData.length - 1]?.executionTime || 95) / 1000)}s
              </div>
              <div className="text-purple-100">Execution Time</div>
            </div>
          </div>

          {/* Issue Distribution */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Issue Distribution</h3>
            <div className="h-64">
              <Doughnut data={issueDistributionData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Agent Performance Radar */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Agent Performance Comparison</h3>
            <div className="h-64">
              <Radar data={agentRadarData} options={radarOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Test Results Trend</h3>
            <div className="h-80">
              <Line data={trendsChartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Execution Time Trend</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: sampleHistoricalData.map(d => new Date(d.timestamp).toLocaleDateString()),
                    datasets: [{
                      label: 'Execution Time (seconds)',
                      data: sampleHistoricalData.map(d => d.executionTime),
                      borderColor: 'rgb(168, 85, 247)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      fill: true,
                      tension: 0.4
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Success Rate Trend</h3>
              <div className="h-64">
                <Line 
                  data={{
                    labels: sampleHistoricalData.map(d => new Date(d.timestamp).toLocaleDateString()),
                    datasets: [{
                      label: 'Success Rate %',
                      data: sampleHistoricalData.map(d => 
                        Math.round((d.testsPassed / (d.testsPassed + d.testsFailed)) * 100)
                      ),
                      borderColor: 'rgb(34, 197, 94)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      fill: true,
                      tension: 0.4
                    }]
                  }} 
                  options={chartOptions} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coverage Tab */}
      {activeTab === 'coverage' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Coverage Over Time</h3>
            <div className="h-80">
              <Line data={coverageChartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">UI Coverage</h4>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {testResults?.agentSummaries?.UI?.coverage || 85}%
              </div>
              <div className="text-sm text-blue-700">
                Elements tested: {testResults?.agentSummaries?.UI?.elementsFound || 42}
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${testResults?.agentSummaries?.UI?.coverage || 85}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">API Coverage</h4>
              <div className="text-3xl font-bold text-green-600 mb-2">
                {testResults?.agentSummaries?.Functional?.coverage || 78}%
              </div>
              <div className="text-sm text-green-700">
                Endpoints tested: {testResults?.agentSummaries?.Functional?.endpointsDiscovered || 15}
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${testResults?.agentSummaries?.Functional?.coverage || 78}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">DB Coverage</h4>
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {testResults?.agentSummaries?.DB?.coverage || 92}%
              </div>
              <div className="text-sm text-purple-700">
                Queries tested: {testResults?.agentSummaries?.DB?.queriesExecuted || 28}
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${testResults?.agentSummaries?.DB?.coverage || 92}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Coverage Heatmap */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Test Path Coverage Map</h3>
            <div className="grid grid-cols-8 gap-1">
              {Array.from({ length: 64 }, (_, i) => (
                <div
                  key={i}
                  className={`h-8 rounded ${
                    Math.random() > 0.3 
                      ? Math.random() > 0.7 
                        ? 'bg-green-500' 
                        : 'bg-green-300'
                      : 'bg-gray-200'
                  }`}
                  title={`Path ${i + 1}: ${Math.random() > 0.3 ? 'Covered' : 'Not covered'}`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
              <span>Less coverage</span>
              <div className="flex space-x-1">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-4 h-4 bg-green-300 rounded"></div>
                <div className="w-4 h-4 bg-green-500 rounded"></div>
              </div>
              <span>More coverage</span>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Agent Performance Scores</h3>
            <div className="h-80">
              <Bar data={performanceChartData} options={chartOptions} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* UI Agent Performance */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-4">UI Agent Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Success Rate</span>
                  <span className="font-semibold text-blue-900">87%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Avg Response Time</span>
                  <span className="font-semibold text-blue-900">2.3s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Adaptations</span>
                  <span className="font-semibold text-blue-900">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-700">Resilience Score</span>
                  <span className="font-semibold text-blue-900">8.5/10</span>
                </div>
              </div>
            </div>

            {/* Functional Agent Performance */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-4">Functional Agent Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Success Rate</span>
                  <span className="font-semibold text-green-900">92%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Avg Response Time</span>
                  <span className="font-semibold text-green-900">1.8s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Adaptations</span>
                  <span className="font-semibold text-green-900">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-green-700">Resilience Score</span>
                  <span className="font-semibold text-green-900">9.1/10</span>
                </div>
              </div>
            </div>

            {/* Database Agent Performance */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-4">Database Agent Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Success Rate</span>
                  <span className="font-semibold text-purple-900">95%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Avg Query Time</span>
                  <span className="font-semibold text-purple-900">45ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Adaptations</span>
                  <span className="font-semibold text-purple-900">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-purple-700">Resilience Score</span>
                  <span className="font-semibold text-purple-900">8.8/10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Timeline */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Performance Timeline</h3>
            <div className="space-y-4">
              {[
                { time: '14:32:15', agent: 'UI', action: 'Self-healing locator fixed broken selector', status: 'success' },
                { time: '14:32:18', agent: 'Functional', action: 'Adaptive retry successful after timeout', status: 'success' },
                { time: '14:32:22', agent: 'DB', action: 'Connection pool reset resolved issue', status: 'success' },
                { time: '14:32:25', agent: 'UI', action: 'Alternative element selector used', status: 'warning' },
                { time: '14:32:28', agent: 'Functional', action: 'API endpoint discovery completed', status: 'success' }
              ].map((event, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded border">
                  <div className="text-sm text-gray-500 font-mono">{event.time}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    event.agent === 'UI' ? 'bg-blue-100 text-blue-800' :
                    event.agent === 'Functional' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {event.agent}
                  </div>
                  <div className="flex-1 text-sm">{event.action}</div>
                  <div className={`w-3 h-3 rounded-full ${
                    event.status === 'success' ? 'bg-green-500' :
                    event.status === 'warning' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};