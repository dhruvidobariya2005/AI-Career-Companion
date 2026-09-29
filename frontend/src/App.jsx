import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import MockInterview from "./pages/MockInterview";
import CareerRoadmap from "./pages/CareerRoadmap";
import "./App.css";

// Layout wrapper for authenticated pages to keep the sidebar structured
const Layout = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden bg-radial-glow relative">
        {/* Glowing Drifting Pastel Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-[120px] pointer-events-none animate-drift"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-pink-200/30 blur-[120px] pointer-events-none animate-drift-reverse"></div>
        
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <Layout>
                <ResumeAnalyzer />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Layout>
                <MockInterview />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/roadmap"
          element={
            <ProtectedRoute>
              <Layout>
                <CareerRoadmap />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
