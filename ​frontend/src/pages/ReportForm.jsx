import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function ReportForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [description, setDescription] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
    
    try {
      const { data } = await axios.post(`${API_URL}/ai/analyze`, formData);
      setAnalysis(data);
      getLocation(); // Prompt for location after successful AI scan
    } catch (err) {
      alert("Error connecting to AI backend. Make sure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, () => {
        // Fallback if denied
        setLocation({ lat: 0.0, lng: 0.0 });
      });
    }
  };

  const submitReport = async () => {
    try {
      await axios.post(`${API_URL}/reports`, {
        ...analysis,
        latitude: location?.lat || 0.0,
        longitude: location?.lng || 0.0,
        description
      });
      setSuccess(true);
    } catch (err) {
      alert("Failed to submit report. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto mt-12 text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-500 mb-8">Municipal authorities have been notified of this hotspot.</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition">
          Report Another Issue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Report Urban Waste</h2>
        <p className="text-gray-500">Upload a photo to automatically categorize and map the issue.</p>
      </div>
      
      {!preview ? (
        <label className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition group">
          <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-105 transition">
            <UploadCloud className="w-10 h-10 text-green-600" />
          </div>
          <span className="text-lg font-bold text-gray-700">Click or drag image to upload</span>
          <span className="text-sm text-gray-400 mt-2">Supports JPG, PNG, WEBP</span>
          <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleFile} />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-200">
            <img src={preview} alt="Upload Preview" className="w-full h-80 object-cover" />
            <button 
              onClick={() => { setPreview(null); setFile(null); setAnalysis(null); }} 
              className="absolute top-4 right-4 bg-white/90 px-3 py-1 text-sm font-bold rounded-lg shadow-sm hover:bg-white"
            >
              Change Image
            </button>
          </div>
          
          {!analysis ? (
             <button 
               onClick={analyzeImage} 
               disabled={loading} 
               className="w-full flex justify-center items-center py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-70"
             >
               {loading ? <><Loader2 className="w-6 h-6 animate-spin mr-2" /> Analyzing Image...</> : 'Analyze with CleanCity AI'}
             </button>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
                <h3 className="font-bold text-green-900 flex items-center mb-4">
                  <AlertCircle className="w-5 h-5 mr-2"/> AI Detection Results
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-xl">
                  <div>
                    <span className="block text-gray-500 mb-1">Detected Type</span>
                    <span className="font-bold text-gray-900">{analysis.waste_type}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Confidence</span>
                    <span className="font-bold text-gray-900">{(analysis.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Category</span>
                    <span className="font-bold text-gray-900">{analysis.category}</span>
                  </div>
                  <div>
                    <span className="block text-gray-500 mb-1">Severity Rating</span>
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold ${
                      analysis.severity === 'Critical' ? 'bg-red-100 text-red-800' : 
                      analysis.severity === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {analysis.severity}
                    </span>
                  </div>
                </div>
              </div>

              {location ? (
                <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <MapPin className="w-5 h-5 mr-2 text-green-600"/>
                  GPS Location Acquired
                </div>
              ) : (
                <div className="flex items-center text-sm font-medium text-amber-700 bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <MapPin className="w-5 h-5 mr-2"/>
                  Requesting location access...
                </div>
              )}

              <textarea 
                placeholder="Add specific location details or notes for the cleanup crew..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none h-32"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              <button 
                onClick={submitReport} 
                className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200"
              >
                Submit Official Report
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
