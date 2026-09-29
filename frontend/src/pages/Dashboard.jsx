import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  MessageSquareCode,
  Map,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    resumesCount: 0,
    latestAtsScore: null,
    interviewsCount: 0,
    avgInterviewScore: 0,
    roadmapTarget: "",
    roadmapProgress: 0,
    roadmapTotalSteps: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch resume history
        const resumeRes = await api.get("/resume/history");
        const resumes = resumeRes.data.resumes || [];
        const resumesCount = resumes.length;
        
        // Find latest ATS score
        let latestAtsScore = null;
        const resumesWithAts = resumes.filter(r => r.atsAnalysis?.score !== undefined || (r.atsAnalysis && r.atsAnalysis.score !== 0));
        if (resumesWithAts.length > 0) {
          latestAtsScore = resumesWithAts[0].atsAnalysis.score;
        } else {
          // Check if the endpoint returns score in root (as projected in select: "atsAnalysis.score")
          const scores = resumes.map(r => r.atsAnalysis?.score).filter(s => s !== undefined && s !== 0);
          if (scores.length > 0) {
            latestAtsScore = scores[0];
          }
        }

        // Fetch interview history
        const interviewRes = await api.get("/interview/history");
        const interviews = interviewRes.data.interviews || [];
        const interviewsCount = interviews.length;
        const completedInterviews = interviews.filter(i => i.status === "Completed");
        const avgInterviewScore = completedInterviews.length > 0
          ? Math.round(completedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / completedInterviews.length)
          : 0;

        // Fetch current roadmap
        let roadmapTarget = "";
        let roadmapProgress = 0;
        let roadmapTotalSteps = 0;
        try {
          const roadmapRes = await api.get("/roadmap/current");
          const roadmap = roadmapRes.data.roadmap;
          if (roadmap) {
            roadmapTarget = roadmap.targetRole;
            roadmapTotalSteps = roadmap.steps.length;
            roadmapProgress = roadmap.steps.filter(s => s.isCompleted).length;
          }
        } catch (err) {
          // 404 is normal if no roadmap generated yet
          if (err.response?.status !== 404) {
            console.error(err);
          }
        }

        setStats({
          resumesCount,
          latestAtsScore,
          interviewsCount,
          avgInterviewScore,
          roadmapTarget,
          roadmapProgress,
          roadmapTotalSteps,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  if (stats.loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="border-4 border-t-transparent border-purple-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Resumes Uploaded",
      value: stats.resumesCount,
      description: "Manage and parse resumes",
      icon: FileText,
      color: "from-blue-600 to-cyan-600",
      link: "/resume",
    },
    {
      title: "Latest ATS Score",
      value: stats.latestAtsScore !== null ? `${stats.latestAtsScore}%` : "N/A",
      description: "Match with job descriptions",
      icon: Award,
      color: "from-purple-600 to-pink-600",
      link: "/resume",
    },
    {
      title: "Interviews Handled",
      value: stats.interviewsCount,
      description: `Avg. score: ${stats.avgInterviewScore}%`,
      icon: MessageSquareCode,
      color: "from-emerald-600 to-teal-600",
      link: "/interview",
    },
    {
      title: "Roadmap Milestones",
      value: stats.roadmapTotalSteps > 0 ? `${stats.roadmapProgress}/${stats.roadmapTotalSteps}` : "N/A",
      description: stats.roadmapTarget ? `Role: ${stats.roadmapTarget}` : "No roadmap generated",
      icon: Map,
      color: "from-orange-600 to-amber-600",
      link: "/roadmap",
    },
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden glass-panel rounded-3xl p-8 mb-8 border border-slate-200/80 bg-white/70">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-300/30 blur-[80px] pointer-events-none -mr-20 -mt-20 animate-drift"></div>
        <div className="space-y-2 relative">
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI Powered Insights Active</span>
          </div>
          <h2 className="text-3xl font-bold font-heading text-slate-800">Your Career Center</h2>
          <p className="text-slate-500 max-w-xl text-sm">
            Analyze your resume's ATS score, practice with realistic AI interviews, and follow a structured career roadmap tailored to your goals.
          </p>
        </div>
        <div className="shrink-0 relative">
          <Link
            to="/resume"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
          >
            <span>Analyze Resume</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="glass-panel hover:bg-white/90 p-6 rounded-2xl border border-slate-200/60 transition-all duration-300 hover:-translate-y-1 hover:border-purple-200 block group bg-white/45"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-sm`}>
                  <Icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 font-heading">{card.value}</h3>
              <p className="text-sm font-semibold text-slate-600 mt-1">{card.title}</p>
              <p className="text-xs text-slate-400 mt-1">{card.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Feature Spotlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mock Interview Launch Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 relative overflow-hidden flex flex-col justify-between h-64 bg-white/70">
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-emerald-300/20 blur-[80px] pointer-events-none -mr-10 -mb-10 animate-drift"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-200/60">
                MODULE 7
              </span>
              <span className="text-slate-400 text-xs font-medium">Interactive AI Mock Interview</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">Practice Interviewing</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Generate custom interview questions matching your resume and target descriptions. Record your answers with speech-to-text and receive instant scorecard evaluations.
            </p>
          </div>
          <Link
            to="/interview"
            className="flex items-center gap-2 text-emerald-600 hover:text-emerald-500 font-semibold text-sm group"
          >
            <span>Start Practice Interview</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Roadmap Launch Card */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 relative overflow-hidden flex flex-col justify-between h-64 bg-white/70">
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-orange-300/20 blur-[80px] pointer-events-none -mr-10 -mb-10 animate-drift-reverse"></div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full border border-orange-200/60">
                MODULE 9
              </span>
              <span className="text-slate-400 text-xs font-medium">Interactive Milestone Map</span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">Interactive Roadmap</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Transition to senior roles or pivot into new tech domains. Build a chronological study map listing recommended resources and track your learning progress.
            </p>
          </div>
          <Link
            to="/roadmap"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-500 font-semibold text-sm group"
          >
            <span>View Roadmap Progress</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
