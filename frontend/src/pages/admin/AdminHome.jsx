import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../../services/api';

const COLORS = ['#16a34e', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'performance', label: 'Performance' },
];

const StatCard = ({ label, value }) => (
  <div className="card">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
  </div>
);

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Overview tab data - unchanged from the original single-page analytics view
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Performance tab data - site traffic (visitors, page views, device usage, etc.)
  const [perf, setPerf] = useState(null);
  const [perfLoading, setPerfLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .get('/admin/analytics/performance')
      .then(({ data }) => setPerf(data))
      .catch(() => toast.error('Failed to load performance analytics'))
      .finally(() => setPerfLoading(false));
  }, []);

  return (
    <div className="pt-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Admin Analytics</h1>
        <p className="text-sm text-gray-500">Overview of platform activity and user health data</p>
      </div>

      {/* Tabs - horizontal, only the active one's content renders below */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' &&
        (loading ? (
          <p className="text-sm text-gray-500">Loading analytics...</p>
        ) : (
          data && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="card">
                  <p className="text-xs text-gray-500">Total Registered Users</p>
                  <p className="text-2xl font-bold text-gray-800">{data.totalUsers}</p>
                </div>
                <div className="card">
                  <p className="text-xs text-gray-500">Total Appointments</p>
                  <p className="text-2xl font-bold text-gray-800">{data.totalAppointments}</p>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-3">Monthly Signup Trend</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlySignupTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#16a34e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="font-semibold text-gray-800 mb-3">BMI Distribution</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.bmiDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                          {data.bmiDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h2 className="font-semibold text-gray-800 mb-3">Gender Distribution</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.genderDistribution} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                          {data.genderDistribution.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-3">County Distribution</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.countyDistribution} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={90} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )
        ))}

      {activeTab === 'performance' &&
        (perfLoading ? (
          <p className="text-sm text-gray-500">Loading performance analytics...</p>
        ) : (
          perf && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Visitors Today" value={perf.visitorsToday} />
                <StatCard label="Visitors This Week" value={perf.visitorsThisWeek} />
                <StatCard label="Visitors This Month" value={perf.visitorsThisMonth} />
                <StatCard label="Page Views (This Month)" value={perf.pageViewsThisMonth} />
                <StatCard label="Avg. Pages / Session" value={perf.avgPagesPerSession} />
                <StatCard label="Bounce Rate" value={`${perf.bounceRate}%`} />
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-3">Daily Visitors (Last 30 Days)</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perf.dailyVisitors}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" name="Visitors" stroke="#16a34e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card">
                <h2 className="font-semibold text-gray-800 mb-3">Most Visited Pages (This Month)</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perf.mostVisitedPages} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="path" tick={{ fontSize: 11 }} width={140} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="font-semibold text-gray-800 mb-3">Signups by Month</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perf.signupsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" name="Signups" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card">
                  <h2 className="font-semibold text-gray-800 mb-3">Device Usage</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={perf.deviceUsage} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={80} label>
                          {perf.deviceUsage.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )
        ))}
    </div>
  );
};

export default AdminHome;
