import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ReportForm from './pages/ReportForm';
import AdminDashboard from './pages/AdminDashboard';
import Navigation from './components/Navigation';

export default function App() {
  // Checks if running in production (GitHub Pages) to set correct base path
  const isProd = import.meta.env.PROD;
  
  return (
    <Router basename={isProd ? '/Cleancity-ai' : '/'}>
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Navigation />
        <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/report" element={<ReportForm />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
