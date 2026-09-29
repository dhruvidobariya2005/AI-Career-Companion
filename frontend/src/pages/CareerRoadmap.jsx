import React, { useEffect, useState } from "react";
import {
  Map,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Circle,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Target,
  ArrowRight,
} from "lucide-react";
import api from "../services/api";

const CareerRoadmap = () => {
  const [targetRole, setTargetRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState("");
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchCurrentRoadmap = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/roadmap/current");
      setRoadmap(response.data.roadmap);
      if (response.data.roadmap) {
        setTargetRole(response.data.roadmap.targetRole);
        setCurrentSkills(response.data.roadmap.currentSkills.join(", "));
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error(err);
        setError("Failed to fetch current roadmap.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentRoadmap();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setError("Target Role is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        "/roadmap/generate",
        {
          targetRole,
          currentSkills,
        }
      );
      setRoadmap(response.data.roadmap);
      setSuccess("Roadmap generated successfully!");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to generate roadmap.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStep = async (stepId, currentStatus) => {
    if (toggleLoading) return;
    setToggleLoading(true);
    try {
      const response = await api.put(
        `/roadmap/${roadmap._id}/step/${stepId}`,
        { isCompleted: !currentStatus }
      );
      setRoadmap(response.data.roadmap);
    } catch (err) {
      console.error(err);
      setError("Failed to update step progress.");
    } finally {
      setToggleLoading(false);
    }
  };

  const handleReset = () => {
    setRoadmap(null);
    setTargetRole("");
    setCurrentSkills("");
    setSuccess("");
    setError("");
  };

  const completedSteps = roadmap?.steps?.filter((s) => s.isCompleted).length || 0;
  const totalSteps = roadmap?.steps?.length || 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  if (loading && !roadmap) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="border-4 border-t-transparent border-purple-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full">
      {!roadmap ? (
        /* INPUT FORM SCREEN */
        <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl border border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-600/10 blur-[80px] pointer-events-none -mr-20 -mt-20"></div>

          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-purple-600/20 p-3 rounded-2xl border border-purple-500/30 mb-4 animate-pulse-glow">
              <Map className="h-8 w-8 text-purple-400" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">Interactive Career Roadmap</h2>
            <p className="text-slate-400 mt-2 text-sm max-w-md">
              Create a personalized learning curriculum and skill checklist to transition or progress into your target position.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Target Job Title / Career Goal</label>
              <div className="relative">
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  required
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="w-full pl-12 pr-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Your Current Skills</label>
              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g. React.js, HTML, CSS, Javascript, Basic Python, SQL"
                rows="4"
                className="w-full p-4 rounded-xl glass-input text-sm leading-relaxed"
              ></textarea>
              <span className="text-[10px] text-slate-500 block leading-tight">
                Provide a comma-separated list of technologies or concepts you are already familiar with.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
            >
              {loading ? (
                <span className="border-2 border-t-transparent border-white rounded-full w-5 h-5 animate-spin"></span>
              ) : (
                <>
                  <span>Generate Career Roadmap</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        /* TIMELINE GRAPH SCREEN */
        <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
          {/* Header Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-600/5 blur-[80px] pointer-events-none -mr-20 -mt-20"></div>

            <div className="space-y-2 relative">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
                <Target className="h-4 w-4" />
                <span>Active Target Role</span>
              </div>
              <h2 className="text-2xl font-bold font-heading text-white">{roadmap.targetRole}</h2>
              <p className="text-slate-400 text-xs">
                Generated from current skills: {roadmap.currentSkills.join(", ")}
              </p>
            </div>

            {/* Progress Meter */}
            <div className="shrink-0 space-y-2 w-full md:w-48">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Roadmap Progress</span>
                <span className="font-bold text-white">{progressPercent}%</span>
              </div>
              <div className="bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-slate-500 block text-right font-medium">
                {completedSteps} of {totalSteps} phases complete
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Generate Different Path</span>
            </button>
            <button
              onClick={fetchCurrentRoadmap}
              className="p-2 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Vertical Timeline Tree */}
          <div className="relative border-l-2 border-slate-800 ml-6 pl-8 space-y-12">
            {roadmap.steps.map((step, idx) => (
              <div key={step._id} className="relative group">
                {/* Node Dot / Checkbox */}
                <button
                  onClick={() => handleToggleStep(step._id, step.isCompleted)}
                  className={`absolute -left-[45px] top-1.5 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${step.isCompleted
                    ? "bg-purple-600 border-2 border-purple-500 text-white shadow-lg shadow-purple-600/20"
                    : "bg-slate-900 border-2 border-slate-800 text-slate-600 hover:border-purple-500/50 hover:text-purple-400"
                    }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0" />
                  )}
                </button>

                {/* Content Box */}
                <div
                  className={`glass-panel p-6 rounded-2xl border transition-all duration-300 ${step.isCompleted
                    ? "border-purple-500/30 bg-purple-950/5 opacity-85"
                    : "border-slate-800 hover:border-slate-700/60"
                    }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-3">
                    <h3
                      className={`text-lg font-bold font-heading transition-all ${step.isCompleted ? "text-slate-400 line-through" : "text-white"
                        }`}
                    >
                      {step.title}
                    </h3>
                    <span className="text-xs font-semibold text-purple-400/90 bg-purple-600/10 border border-purple-500/20 px-2.5 py-1 rounded-full shrink-0">
                      {step.timeline}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-5">{step.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
                    {/* Skills badge */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                        Target Skills to Acquire
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {step.skillsToLearn.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Recommended Curriculums</span>
                      </h4>
                      <ul className="space-y-1 text-[11px] text-slate-400">
                        {step.resources.map((res, i) => (
                          <li key={i} className="flex items-center gap-1.5 truncate">
                            <span className="h-1 w-1 rounded-full bg-purple-400 shrink-0"></span>
                            <span className="truncate">{res}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerRoadmap;
