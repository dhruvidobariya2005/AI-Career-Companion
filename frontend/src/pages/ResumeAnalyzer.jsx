import React, { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  BookOpen,
  Check,
  X,
  RefreshCw,
  FileCode,
} from "lucide-react";
import api from "../services/api";

const ResumeAnalyzer = () => {
  const [history, setHistory] = useState([]);
  const [currentResume, setCurrentResume] = useState(null);
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("parsed"); // parsed | ats | gaps | improvements

  const fetchHistory = async () => {
    try {
      const response = await api.get("/resume/history");
      setHistory(response.data.resumes || []);
    } catch (err) {
      console.error("Failed to fetch resume history:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const loadResumeDetails = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/resume/${id}`);
      setCurrentResume(response.data.resume);
      if (response.data.resume.atsAnalysis?.jobDescription) {
        setJobDescription(response.data.resume.atsAnalysis.jobDescription);
      } else if (response.data.resume.skillGapAnalysis?.jobDescription) {
        setJobDescription(response.data.resume.skillGapAnalysis.jobDescription);
      } else {
        setJobDescription("");
      }
      setActiveTab("parsed");
    } catch (err) {
      console.error(err);
      setError("Failed to load resume details.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF or DOCX file to upload.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await api.post("/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setSuccess("Resume parsed successfully!");
      setCurrentResume(response.data.resume);
      setFile(null);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to upload and parse resume.");
    } finally {
      setLoading(false);
    }
  };

  // Run ATS Optimization
  const handleAtsAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setAnalysisLoading(true);
    setError("");
    try {
      const response = await api.post(
        "/resume/analyze-ats",
        { resumeId: currentResume._id, jobDescription }
      );
      setCurrentResume((prev) => ({
        ...prev,
        atsAnalysis: response.data.atsAnalysis,
      }));
      setSuccess("ATS analysis updated!");
    } catch (err) {
      console.error(err);
      setError("Failed to compute ATS Score.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Run Skill Gap Analysis
  const handleSkillGapAnalysis = async () => {
    if (!jobDescription.trim()) {
      setError("Please paste a job description first.");
      return;
    }
    setAnalysisLoading(true);
    setError("");
    try {
      const response = await api.post(
        "/resume/skill-gap",
        { resumeId: currentResume._id, jobDescription }
      );
      setCurrentResume((prev) => ({
        ...prev,
        skillGapAnalysis: response.data.skillGapAnalysis,
      }));
      setSuccess("Skill gaps mapped!");
    } catch (err) {
      console.error(err);
      setError("Failed to run skill gap analysis.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Run Improvement suggestions
  const handleImprovements = async () => {
    setAnalysisLoading(true);
    setError("");
    try {
      const response = await api.post(
        "/resume/improvements",
        { resumeId: currentResume._id }
      );
      setCurrentResume((prev) => ({
        ...prev,
        improvementSuggestions: response.data.improvementSuggestions,
      }));
      setSuccess("Resume improvement rewrites generated!");
    } catch (err) {
      console.error(err);
      setError("Failed to generate improvement suggestions.");
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
      {/* Left Column: History & Upload Panel */}
      <div className="w-full lg:w-80 space-y-6 shrink-0">
        {/* Upload Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
          <h3 className="text-lg font-bold font-heading text-slate-800 mb-4">Analyze New Resume</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="border border-dashed border-slate-200 hover:border-purple-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors duration-300 relative bg-slate-50/50">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                {file ? file.name : "Drag & drop or browse"}
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">PDF or DOCX (Max 5MB)</span>
            </div>
            <button
              type="submit"
              disabled={loading || !file}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              {loading ? "Processing File..." : "Upload & Parse"}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs flex gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold font-heading text-slate-600 uppercase tracking-wider">
              Upload History
            </h3>
            <button onClick={fetchHistory} className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No resumes parsed yet.</p>
            ) : (
              history.map((item) => (
                <button
                  key={item._id}
                  onClick={() => loadResumeDetails(item._id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all duration-300 flex items-start gap-2.5 cursor-pointer ${
                    currentResume?._id === item._id
                      ? "bg-purple-50 border-purple-200/60 text-purple-700"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 text-slate-600"
                  }`}
                >
                  <FileText className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                  <div className="truncate">
                    <h4 className="text-xs font-semibold truncate leading-tight">{item.fileName}</h4>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                      {item.atsAnalysis?.score ? ` • ATS: ${item.atsAnalysis.score}%` : ""}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Active Resume & Tabs */}
      <div className="flex-1 min-w-0">
        {!currentResume ? (
          <div className="glass-panel rounded-3xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center min-h-[400px] bg-white/70">
            <div className="bg-slate-100 p-4 rounded-full border border-slate-200/60 mb-4 text-slate-400">
              <FileCode className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">No Active Resume</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              Please upload a resume (PDF/DOCX) or select an already parsed document from your upload history list to begin AI analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Resume Info */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200/60 uppercase">
                    {currentResume.fileType}
                  </span>
                  <span className="text-slate-400 text-xs">
                    Uploaded {new Date(currentResume.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-800">{currentResume.fileName}</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Candidate: <strong className="text-slate-700">{currentResume.parsedData.name || "N/A"}</strong> (
                  {currentResume.parsedData.email || "No Email"})
                </p>
              </div>
              <div className="shrink-0 flex gap-2">
                <button
                  onClick={loadResumeDetails.bind(null, currentResume._id)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tab Links */}
            <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
              {[
                { id: "parsed", label: "Extracted Content", icon: FileText },
                { id: "rawtext", label: "Original Resume Text", icon: FileCode },
                { id: "ats", label: "ATS Scorecard", icon: Sparkles },
                { id: "gaps", label: "Skill Gap Analysis", icon: BookOpen },
                { id: "improvements", label: "Enhancement Tips", icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-heading font-medium text-sm transition-all duration-300 shrink-0 cursor-pointer ${
                      activeTab === tab.id
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Panels */}
            <div className="min-h-[400px]">
              {/* TAB 1: Parsed Data */}
              {activeTab === "parsed" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Skills card */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                      <h3 className="text-base font-bold font-heading text-slate-800 mb-4">Extracted Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentResume.parsedData.skills?.length > 0 ? (
                          currentResume.parsedData.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No skills extracted.</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Detail Card */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                      <h3 className="text-base font-bold font-heading text-slate-800 mb-4">Contact Info</h3>
                      <div className="space-y-3.5 text-sm text-slate-600">
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400">Name</span>
                          <span className="font-semibold text-slate-700">{currentResume.parsedData.name || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-100 pb-2">
                          <span className="text-slate-400">Email</span>
                          <span className="font-semibold text-slate-700">{currentResume.parsedData.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-slate-400">Phone</span>
                          <span className="font-semibold text-slate-700">{currentResume.parsedData.phone || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                    <h3 className="text-base font-bold font-heading text-slate-800 mb-6 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-purple-600" />
                      <span>Work Experience</span>
                    </h3>
                    <div className="space-y-6 relative border-l-2 border-slate-200 pl-6 ml-3">
                      {currentResume.parsedData.experience?.length > 0 ? (
                        currentResume.parsedData.experience.map((exp, i) => (
                          <div key={i} className="relative group">
                            <span className="absolute -left-[29px] top-1.5 h-3 w-3 rounded-full bg-purple-600 border border-white group-hover:scale-125 transition-transform"></span>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                              <h4 className="text-base font-bold text-slate-800 leading-tight">
                                {exp.role} <span className="text-purple-600 text-sm font-medium">@ {exp.company}</span>
                              </h4>
                              <span className="text-xs text-slate-400 font-semibold">{exp.duration}</span>
                            </div>
                            <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                              {exp.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No work experience extracted.</p>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                    <h3 className="text-base font-bold font-heading text-slate-800 mb-6 flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                      <span>Education History</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentResume.parsedData.education?.length > 0 ? (
                        currentResume.parsedData.education.map((edu, i) => (
                          <div
                            key={i}
                            className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 flex justify-between gap-4"
                          >
                            <div>
                              <h4 className="text-sm font-bold text-slate-700">{edu.degree}</h4>
                              <p className="text-xs text-slate-400 mt-1">{edu.institution}</p>
                            </div>
                            <span className="text-xs font-semibold text-purple-600 mt-0.5">{edu.year}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic col-span-2">No education history extracted.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Original Raw Resume Document Text */}
              {activeTab === "rawtext" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold font-heading text-slate-800">Original Resume Document Text</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          100% of the raw text extracted from your uploaded file ({currentResume.fileName}).
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(currentResume.rawText || "");
                          setSuccess("Copied original resume text to clipboard!");
                          setTimeout(() => setSuccess(""), 3000);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold border border-purple-200/60 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Copy Raw Text</span>
                      </button>
                    </div>

                    <div className="bg-slate-900 text-slate-200 p-5 rounded-xl text-xs font-mono whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto border border-slate-800 shadow-inner selection:bg-purple-500 selection:text-white">
                      {currentResume.rawText || "No text extracted from document."}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ATS Scorecard */}
              {activeTab === "ats" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Job Description Input Area */}
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                    <h3 className="text-base font-bold font-heading text-slate-800 mb-2">Target Job Description</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Paste the full description of the job you are targeting. The AI will compute match score alignment.
                    </p>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job requirements, skills, and details..."
                      rows="6"
                      className="w-full p-4 rounded-xl glass-input text-xs leading-relaxed"
                    ></textarea>
                    <button
                      onClick={handleAtsAnalysis}
                      disabled={analysisLoading}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {analysisLoading ? "Running AI Scorer..." : "Compute ATS Alignment"}
                    </button>
                  </div>

                  {currentResume.atsAnalysis?.score !== undefined && currentResume.atsAnalysis.score !== 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Circle Dial */}
                      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-center bg-white/70">
                        <h4 className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-wider">
                          ATS Match Score
                        </h4>
                        <div className="relative h-36 w-36 flex items-center justify-center">
                          <svg className="h-full w-full transform -rotate-90">
                            <circle
                              cx="72"
                              cy="72"
                              r="62"
                              strokeWidth="8"
                              stroke="rgba(15, 23, 42, 0.05)"
                              fill="transparent"
                            />
                            <circle
                              cx="72"
                              cy="72"
                              r="62"
                              strokeWidth="10"
                              strokeDasharray={2 * Math.PI * 62}
                              strokeDashoffset={
                                2 * Math.PI * 62 * (1 - currentResume.atsAnalysis.score / 100)
                              }
                              strokeLinecap="round"
                              stroke={
                                currentResume.atsAnalysis.score >= 80
                                  ? "#10b981"
                                  : currentResume.atsAnalysis.score >= 50
                                  ? "#f59e0b"
                                  : "#ef4444"
                              }
                              fill="transparent"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <span className="absolute text-4xl font-extrabold text-slate-800 font-heading">
                            {currentResume.atsAnalysis.score}%
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-6">
                          {currentResume.atsAnalysis.score >= 80
                            ? "Excellent fit! Strong alignment with key requirements."
                            : currentResume.atsAnalysis.score >= 50
                            ? "Fair fit. Consider incorporating missing keywords."
                            : "Low fit. High adjustments needed to pass filters."}
                        </p>
                      </div>

                      {/* Keywords Breakdown */}
                      <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 lg:col-span-2 space-y-6 bg-white/70">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Matching */}
                          <div>
                            <h4 className="text-xs font-bold font-heading text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <Check className="h-4 w-4" />
                              <span>Matching Keywords ({currentResume.atsAnalysis.matchingKeywords?.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {currentResume.atsAnalysis.matchingKeywords?.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-semibold border border-emerald-200/50"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Missing */}
                          <div>
                            <h4 className="text-xs font-bold font-heading text-red-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <X className="h-4 w-4" />
                              <span>Missing Keywords ({currentResume.atsAnalysis.missingKeywords?.length})</span>
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {currentResume.atsAnalysis.missingKeywords?.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-semibold border border-red-200/50"
                                >
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Recommendations */}
                        <div className="border-t border-slate-100 pt-4">
                          <h4 className="text-xs font-bold font-heading text-slate-600 uppercase tracking-wider mb-3">
                            ATS Recommendations
                          </h4>
                          <ul className="space-y-2">
                            {currentResume.atsAnalysis.recommendations?.map((rec, i) => (
                              <li key={i} className="text-xs text-slate-500 flex items-start gap-2 leading-relaxed">
                                <span className="text-purple-600 font-bold shrink-0 mt-0.5">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center bg-white/50 text-slate-400 text-xs">
                      No ATS match data generated yet. Click "Compute ATS Alignment" to analyze.
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Skill Gaps */}
              {activeTab === "gaps" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
                    <h3 className="text-base font-bold font-heading text-slate-800 mb-2">Analyze Skill Gaps</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Evaluate how your current skills match the job description. The AI will recommend targeted course topics and portfolio projects.
                    </p>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste target job requirements to compare skills..."
                      rows="3"
                      className="w-full p-4 rounded-xl glass-input text-xs leading-relaxed"
                    ></textarea>
                    <button
                      onClick={handleSkillGapAnalysis}
                      disabled={analysisLoading}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {analysisLoading ? "Running Skill Gap Analysis..." : "Analyze Skill Gaps"}
                    </button>
                  </div>

                  {currentResume.skillGapAnalysis?.matchingSkills !== undefined ? (
                    <div className="space-y-6">
                      {/* Skill breakdown list */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-5 rounded-xl border border-slate-200/80 bg-white/70">
                          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            <span>Matching Core Skills ({currentResume.skillGapAnalysis.matchingSkills?.length})</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {currentResume.skillGapAnalysis.matchingSkills?.map((s, i) => (
                              <span key={i} className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="glass-panel p-5 rounded-xl border border-slate-200/80 bg-white/70">
                          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            <span>Gaps Identified ({currentResume.skillGapAnalysis.missingSkills?.length})</span>
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {currentResume.skillGapAnalysis.missingSkills?.map((s, i) => (
                              <span key={i} className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200/60 text-red-650 text-xs font-semibold">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Course recommendations cards */}
                      <div className="space-y-4">
                        <h4 className="text-base font-bold font-heading text-slate-800">Targeted Action Items to Close Gaps</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {currentResume.skillGapAnalysis.recommendations?.map((item, idx) => (
                            <div key={idx} className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70 space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </span>
                                <h4 className="text-base font-bold text-slate-800 font-heading">{item.skill}</h4>
                              </div>

                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <BookOpen className="h-3.5 w-3.5" />
                                  <span>Recommended Study Fields</span>
                                </h5>
                                <ul className="space-y-1 pl-5 list-disc text-xs text-slate-650">
                                  {item.courses?.map((c, i) => (
                                    <li key={i}>{c}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2">
                                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                  <Briefcase className="h-3.5 w-3.5" />
                                  <span>Suggested Portfolio Project</span>
                                </h5>
                                <ul className="space-y-1 pl-5 list-disc text-xs text-slate-650">
                                  {item.projects?.map((p, i) => (
                                    <li key={i}>{p}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center bg-white/50 text-slate-400 text-xs">
                      No skill gaps computed. Paste a job description and click "Analyze Skill Gaps".
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: Improvements */}
              {activeTab === "improvements" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70 flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold font-heading text-slate-800">Generate High-Impact Rewrites</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Use Gemini to identify weak phrasing in your resume and suggest strong revisions with metrics.
                      </p>
                    </div>
                    <button
                      onClick={handleImprovements}
                      disabled={analysisLoading}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {analysisLoading ? "Generating..." : "Generate Enhancements"}
                    </button>
                  </div>

                  {currentResume.improvementSuggestions?.length > 0 ? (
                    <div className="space-y-4">
                      {currentResume.improvementSuggestions.map((item, i) => (
                        <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70 space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider font-heading">
                              Section: {item.section}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl bg-red-50 border border-red-200/60">
                              <h5 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">Original Phrasing</h5>
                              <p className="text-xs text-slate-500 leading-relaxed italic">"{item.originalText}"</p>
                            </div>
                            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200/60">
                              <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Suggested Rewrite</h5>
                              <p className="text-xs text-slate-800 leading-relaxed font-semibold">"{item.suggestedText}"</p>
                            </div>
                          </div>

                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <strong>AI Rationale:</strong> {item.reason}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="glass-panel p-8 rounded-2xl border border-slate-200 text-center bg-white/50 text-slate-400 text-xs">
                      No enhancement recommendations generated yet. Click "Generate Enhancements" to analyze.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
