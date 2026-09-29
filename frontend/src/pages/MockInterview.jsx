import React, { useEffect, useState } from "react";
import {
  MessageSquareCode,
  Briefcase,
  Sparkles,
  Award,
  ArrowRight,
  Mic,
  MicOff,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  RefreshCw,
  Star,
} from "lucide-react";
import api from "../services/api";

const MockInterview = () => {
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeInterview, setActiveInterview] = useState(null);
  
  // Active interview state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  
  // Feedback review state
  const [questionFeedback, setQuestionFeedback] = useState(null);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [completingInterview, setCompletingInterview] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async () => {
    try {
      const resumeRes = await api.get("/resume/history");
      setResumes(resumeRes.data.resumes || []);

      const interviewRes = await api.get("/interview/history");
      setHistory(interviewRes.data.interviews || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();

    // Setup speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setUserAnswer((prev) => prev + (prev ? " " : "") + finalTranscript);
        }
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleStartRecording = () => {
    if (!recognition) {
      setError("Speech recognition is not supported in this browser. Please type your answer.");
      return;
    }
    setError("");
    try {
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      recognition.stop();
    }
  };

  const handleStopRecording = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };

  // Launch mock interview API
  const handleStartInterview = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) {
      setError("Job Title is required.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await api.post(
        "/interview/generate",
        {
          jobTitle,
          jobDescription,
          resumeId: selectedResumeId || undefined,
        }
      );
      setActiveInterview(response.data.interview);
      setCurrentQuestionIndex(0);
      setUserAnswer("");
      setQuestionFeedback(null);
    } catch (err) {
      console.error(err);
      setError("Failed to generate interview questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Load a historic interview
  const handleLoadHistoryInterview = async (id) => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/interview/${id}`);
      setActiveInterview(response.data.interview);
      if (response.data.interview.status === "Pending") {
        setCurrentQuestionIndex(response.data.interview.responses.length);
        setUserAnswer("");
        setQuestionFeedback(null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load interview session.");
    } finally {
      setLoading(false);
    }
  };

  // Submit single question answer
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      setError("Please write or speak an answer before submitting.");
      return;
    }

    setSubmittingAnswer(true);
    setError("");
    const currentQuestion = activeInterview.questions[currentQuestionIndex].question;

    try {
      const response = await api.post(
        "/interview/submit-answer",
        {
          interviewId: activeInterview._id,
          question: currentQuestion,
          userAnswer,
        }
      );
      setQuestionFeedback(response.data.responseEvaluation);
      // Append the response locally
      setActiveInterview((prev) => ({
        ...prev,
        responses: [...prev.responses, response.data.responseEvaluation],
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to evaluate answer.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Advance to next question
  const handleNextQuestion = () => {
    setUserAnswer("");
    setQuestionFeedback(null);
    setError("");
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  // Complete mock interview
  const handleCompleteInterview = async () => {
    setCompletingInterview(true);
    setError("");
    try {
      const response = await api.post(
        "/interview/complete",
        { interviewId: activeInterview._id }
      );
      setActiveInterview(response.data.interview);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError("Failed to compile final report.");
    } finally {
      setCompletingInterview(false);
    }
  };

  const handleReset = () => {
    setActiveInterview(null);
    setJobTitle("");
    setJobDescription("");
    setSelectedResumeId("");
    setUserAnswer("");
    setQuestionFeedback(null);
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[80vh]">
        <div className="border-4 border-t-transparent border-purple-600 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto w-full flex flex-col lg:flex-row gap-8">
      {/* LEFT COLUMN: Setup or Sidebar Info */}
      {!activeInterview ? (
        <div className="w-full lg:w-80 space-y-6 shrink-0">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
            <h3 className="text-base font-bold font-heading text-slate-800 mb-4">Start Mock Interview</h3>
            <form onSubmit={handleStartInterview} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Target Role / Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Node.js Backend Developer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Custom Resume Profile (Optional)</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                >
                  <option value="">-- General Interview (No Resume) --</option>
                  {resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Job Requirements / Description (Optional)</label>
                <textarea
                  placeholder="Paste job description to align technical topics..."
                  rows="4"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-4 rounded-xl glass-input text-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquareCode className="h-4 w-4" />
                <span>Generate Questions</span>
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* History */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
            <h3 className="text-sm font-bold font-heading text-slate-650 uppercase tracking-wider mb-4">
              Interview History
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No interview sessions conducted yet.</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleLoadHistoryInterview(item._id)}
                    className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-slate-250 hover:bg-slate-50/50 text-slate-500 transition-all duration-300 flex items-start justify-between gap-2 cursor-pointer"
                  >
                    <div className="truncate">
                      <h4 className="text-xs font-semibold text-slate-700 truncate">{item.jobTitle}</h4>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 border uppercase ${
                        item.status === "Completed"
                          ? "bg-emerald-50 text-emerald-650 border-emerald-200/50"
                          : "bg-amber-50 text-amber-650 border-amber-200/50"
                      }`}
                    >
                      {item.status === "Completed" ? `${item.overallScore}%` : "Pending"}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full lg:w-80 shrink-0">
          <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 space-y-4 bg-white/70">
            <button
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-350 text-slate-500 hover:text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Quit / Start New</span>
            </button>
            <div className="border-t border-slate-200/80 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Session Info</h4>
              <h3 className="text-sm font-bold text-slate-800 font-heading">{activeInterview.jobTitle}</h3>
              <p className="text-[10px] text-slate-500 mt-1 uppercase">
                Status: {activeInterview.status}
              </p>
            </div>
            {activeInterview.status === "Pending" && (
              <div className="border-t border-slate-200/80 pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Progress Tracker
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                    <div
                      className="bg-purple-600 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(activeInterview.responses.length / activeInterview.questions.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-655">
                    {activeInterview.responses.length}/{activeInterview.questions.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RIGHT COLUMN: Active Panel (Setup Info, Active Questions, or Reports) */}
      <div className="flex-1 min-w-0">
        {!activeInterview ? (
          <div className="glass-panel rounded-3xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center min-h-[450px] bg-white/70">
            <div className="bg-slate-100 p-4 rounded-full border border-slate-200 mb-4 text-slate-400">
              <MessageSquareCode className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 font-heading">AI Interview Simulator</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Create an AI Mock Interview by configuring your target job role in the settings sidebar on the left. The simulator evaluates your replies using advanced analytics.
            </p>
          </div>
        ) : activeInterview.status === "Completed" ? (
          /* COMPLETION FEEDBACK VIEW */
          <div className="space-y-6 animate-fadeIn">
            {/* Summary Banner */}
            <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-white/70">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-purple-300/30 blur-[80px] pointer-events-none -mr-20 -mt-20 animate-drift"></div>
              <div className="space-y-2 relative">
                <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs uppercase tracking-wider">
                  <Award className="h-4 w-4" />
                  <span>Interview Session Complete</span>
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-800">Performance Scorecard</h2>
                <p className="text-slate-550 text-sm max-w-xl">
                  Review your answers and detailed recommendations.
                </p>
              </div>

              {/* Big Score Dial */}
              <div className="shrink-0 relative h-28 w-28 rounded-2xl bg-purple-50 border border-purple-200/60 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-purple-600 font-heading">{activeInterview.overallScore}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider mt-1 font-bold">Overall</span>
              </div>
            </div>

            {/* Compiled Overall Feedback */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70">
              <h3 className="text-base font-bold font-heading text-slate-800 mb-3">AI Evaluation Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {activeInterview.overallFeedback}
              </p>
            </div>

            {/* Q&A Detailed Breakdown */}
            <div className="space-y-4">
              <h3 className="text-base font-bold font-heading text-slate-700">Question-by-Question Review</h3>
              {activeInterview.responses.map((res, i) => (
                <div key={i} className="glass-panel p-6 rounded-2xl border border-slate-200/80 bg-white/70 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-semibold text-slate-400">QUESTION {i + 1}</span>
                    <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      <span className="text-xs font-bold text-slate-700">{res.rating}/5</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-850 mb-1.5">{res.question}</h4>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/60 mt-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Your Answer</span>
                      <p className="text-xs text-slate-655 mt-1 leading-relaxed">{res.userAnswer}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-purple-50 border border-purple-200/50 mt-3 text-xs leading-relaxed text-slate-600">
                    <strong className="text-purple-700 block mb-1">Coaching Feedback:</strong>
                    {res.feedback}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ACTIVE INTERVIEW PANEL */
          <div className="glass-panel p-8 rounded-3xl border border-slate-200/80 bg-white/70 space-y-6 animate-fadeIn">
            {/* Current Question */}
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-purple-600 font-heading uppercase tracking-wider">
                Question {currentQuestionIndex + 1} of {activeInterview.questions.length}
              </span>
              <h2 className="text-xl font-bold text-slate-850 mt-2 leading-snug">
                {activeInterview.questions[currentQuestionIndex]?.question}
              </h2>
              {activeInterview.questions[currentQuestionIndex]?.category && (
                <span className="mt-3.5 inline-block bg-slate-50 px-3 py-1 rounded-full border border-slate-200 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Type: {activeInterview.questions[currentQuestionIndex].category}
                </span>
              )}
            </div>

            {/* Answer Input and Speech-to-Text */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-600 tracking-wide uppercase">Your Response</label>
                <div className="flex gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100/60 text-purple-600 border border-purple-200 hover:border-purple-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mic className="h-3.5 w-3.5" />
                      <span>Speak Answer</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStopRecording}
                      className="px-3.5 py-1.5 rounded-lg bg-red-50 text-red-600 border border-red-200/60 text-xs font-bold flex items-center gap-1.5 animate-pulse cursor-pointer"
                    >
                      <MicOff className="h-3.5 w-3.5" />
                      <span>Stop Listening</span>
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={submittingAnswer || questionFeedback !== null}
                placeholder="Type your reply here, or click 'Speak Answer' to talk..."
                rows="6"
                className="w-full p-4 rounded-xl glass-input text-sm leading-relaxed"
              ></textarea>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submission Actions */}
            <div className="flex gap-3 justify-end">
              {questionFeedback === null ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={submittingAnswer || !userAnswer.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {submittingAnswer ? "Evaluating..." : "Submit Answer"}
                </button>
              ) : (
                currentQuestionIndex < activeInterview.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleCompleteInterview}
                    disabled={completingInterview}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm transition-all duration-300 disabled:opacity-50 cursor-pointer"
                  >
                    {completingInterview ? "Compiling Report..." : "Complete & Get Results"}
                  </button>
                )
              )}
            </div>

            {/* Instant feedback card */}
            {questionFeedback && (
              <div className="mt-6 p-6 rounded-2xl bg-purple-50 border border-purple-200/50 space-y-4 animate-slideUp">
                <div className="flex items-center justify-between border-b border-purple-100 pb-3">
                  <h4 className="text-sm font-bold text-purple-750 flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    <span>AI Coaching Feedback</span>
                  </h4>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-bold text-slate-700">{questionFeedback.rating}/5</span>
                  </div>
                </div>
                <p className="text-xs text-slate-655 leading-relaxed whitespace-pre-line">
                  {questionFeedback.feedback}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MockInterview;
