import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Map, Activity, ArrowRight } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function LandingPage() {
  const [stats, setStats] = useState({ total_reports: 0, resolved_reports: 0, active_wards: 0 });

  useEffect(() => {
    // Fetch real stats, default to 0 if backend isn't ready
    axios.get(`${API_URL}/statistics/public`)
      .then(res => setStats(res.data))
      .catch(err => console.error("Backend not connected yet", err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-6 max-w-3xl animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900">
          Smarter Cities.<br/>
          <span className="text-green-600">Cleaner Streets.</span>
        </h1>
        <p className="text-xl text-gray-600 leading-relaxed">
          AI-powered waste identification, citizen reporting, and intelligent urban waste management for modern municipalities.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link to="/report" className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg shadow-green-200">
          Report Waste <ArrowRight className="w-5 h-5" />
        </Link>
        <Link to="/admin" className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-xl font-bold text-lg hover:border-gray-900 transition flex items-center justify-center gap-2">
          Open Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl mt-12">
        <FeatureCard icon={<ShieldCheck />} title="AI Detection" desc="Instant waste categorization using deep learning." />
        <FeatureCard icon={<Map />} title="Smart Hotspots" desc="Algorithmic risk scoring to optimize cleaning routes." />
        <FeatureCard icon={<Activity />} title="Real-time Analytics" desc="Live dashboards for municipal administrators." />
      </div>

      <div className="w-full max-w-5xl bg-gray-900 rounded-2xl p-8 mt-12 text-white grid grid-cols-3 divide-x divide-gray-700 text-center">
        <div>
          <div className="text-4xl font-black text-green-400">{stats.total_reports}</div>
          <div className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">Reports Logged</div>
        </div>
        <div>
          <div className="text-4xl font-black text-blue-400">{stats.resolved_reports}</div>
          <div className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">Issues Resolved</div>
        </div>
        <div>
          <div className="text-4xl font-black text-purple-400">{stats.active_wards}</div>
          <div className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">Active Wards</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition text-left">
      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{desc}</p>
    </div>
  );
}
