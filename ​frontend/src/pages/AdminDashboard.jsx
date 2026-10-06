import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/admin/analytics`)
      .then(res => setData(res.data))
      .catch(err => {
        console.error(err);
        setError(true);
      });
  }, []);

  if (error) {
    return (
      <div className="p-10 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
        <AlertTriangle className="w-10 h-10 mx-auto mb-4" />
        <h3 className="font-bold text-xl">Backend Disconnected</h3>
        <p>Ensure the FastAPI server is running at {API_URL}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Command Center</h1>
        <p className="text-gray-500 mt-1">Real-time intelligence and municipal overview.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Reports Logged" 
          value={data.overview.total_reports} 
          icon={<AlertTriangle className="w-6 h-6 text-blue-500"/>} 
        />
        <StatCard 
          title="Issues Resolved" 
          value={data.overview.resolved} 
          icon={<CheckCircle className="w-6 h-6 text-green-500"/>} 
        />
        <StatCard 
          title="Pending Action" 
          value={data.overview.pending} 
          icon={<Clock className="w-6 h-6 text-orange-500"/>} 
        />
        <StatCard 
          title="Resolution Rate" 
          value={`${data.overview.resolution_rate}%`} 
          icon={<div className="font-bold text-purple-500">%</div>} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Waste Type Composition</h3>
          {data.waste_distribution.length === 0 ? (
             <div className="h-72 flex items-center justify-center text-gray-400">No data collected yet</div>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.waste_distribution} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} label>
                    {data.waste_distribution.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Reports Volume (Mocked Chart)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.waste_distribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-gray-50 p-3 rounded-2xl">{icon}</div>
      </div>
      <p className="text-4xl font-black text-gray-900 mb-1">{value}</p>
      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{title}</h4>
    </div>
  );
}
