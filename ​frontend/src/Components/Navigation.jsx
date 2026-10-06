import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, AlertTriangle, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed w-full bg-white border-b border-gray-100 z-50 top-0 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900">CleanCity-AI</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/report" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/report') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              Report Waste
            </Link>
            
            <Link 
              to="/admin" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/admin') ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
