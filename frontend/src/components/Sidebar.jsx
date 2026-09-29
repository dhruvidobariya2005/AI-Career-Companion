import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  MessageSquareCode,
  Map,
  LogOut,
  User,
  Sparkles,
} from "lucide-react";
import api from "../services/api";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Career Builder");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const cachedUser = localStorage.getItem("user");
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed?.name) setUserName(parsed.name);
        }

        const response = await api.get("/auth/profile");
        if (response.data?.user?.name) {
          setUserName(response.data.user.name);
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
      } catch (error) {
        console.error("Failed to fetch profile in sidebar:", error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Resume Analyzer",
      path: "/resume",
      icon: FileText,
    },
    {
      name: "Mock Interview",
      path: "/interview",
      icon: MessageSquareCode,
    },
    {
      name: "Career Roadmap",
      path: "/roadmap",
      icon: Map,
    },
  ];

  return (
    <aside className="w-64 h-screen glass-panel border-r border-slate-200/80 flex flex-col justify-between sticky top-0 bg-white/40">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
            <Sparkles className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading leading-none text-slate-800 tracking-wide">
              CareerCompanion
            </h1>
            <span className="text-xs text-purple-600 font-medium">AI Coach v1.0</span>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium ${
                  isActive
                    ? "bg-purple-50 text-purple-700 border border-purple-200/60 shadow-sm shadow-purple-500/5 scale-102"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/55 border border-transparent"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center font-heading text-white font-bold shadow-inner">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="truncate">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{userName}</h4>
            <span className="text-xs text-slate-500">Premium Account</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200/60 transition-all duration-300 font-medium text-sm"
        >
          <LogOut className="h-4 w-4" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
