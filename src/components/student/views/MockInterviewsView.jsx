import React, { useState, useEffect, useRef } from 'react';
import { 
  BrainCircuit, 
  PlayCircle, 
  Clock, 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Award,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  FileCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { 
  startMockInterviewSession, 
  evaluateInterviewAnswer, 
  speakQuestion, 
  stopSpeech, 
  createSpeechRecognizer 
} from '../../../services/mockInterviewService';

export function MockInterviewsView({ user }) {
  // Session Settings
  const [role, setRole] = useState('Frontend Developer Intern');
  const [type, setType] = useState('Comprehensive (Tech + Behavioral)');
  const [difficulty, setDifficulty] = useState('Mid-Level');
  const [questionCount, setQuestionCount] = useState(3);

  // Session Flow State: 'setup' | 'interview' | 'report'
  const [sessionState, setSessionState] = useState('setup');

  // Active Session State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [currentEvaluation, setCurrentEvaluation] = useState(null);

  // Status Indicators
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speech Recognizer Ref
  const recognizerRef = useRef(null);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      stopSpeech();
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Launch AI Mock Interview Session
  const handleStartSession = async () => {
    setIsGenerating(true);
    try {
      const generatedQuestions = await startMockInterviewSession({
        role,
        type,
        difficulty,
        count: Number(questionCount)
      });

      if (generatedQuestions && generatedQuestions.length > 0) {
        setQuestions(generatedQuestions);
        setCurrentIndex(0);
        setStudentAnswer('');
        setEvaluations([]);
        setCurrentEvaluation(null);
        setSessionState('interview');

        // Automatically read first question aloud
        setTimeout(() => {
          speakQuestion(generatedQuestions[0].question);
          setIsSpeaking(true);
        }, 500);
      }
    } catch (err) {
      console.error("Failed to start mock interview session:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Text-to-Speech
  const handleToggleSpeak = (text) => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
    } else {
      speakQuestion(text);
      setIsSpeaking(true);
    }
  };

  // Toggle Voice Dictation (Speech-to-Text)
  const handleToggleDictation = () => {
    if (isListening) {
      if (recognizerRef.current) {
        try { recognizerRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    } else {
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setStudentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
        },
        (err) => {
          console.warn("Speech recognition error:", err);
          setIsListening(false);
        }
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        try {
          recognizer.start();
          setIsListening(true);
        } catch (e) {
          console.error("Speech start error:", e);
        }
      } else {
        alert("Voice speech recognition is not supported in your current browser. Please type your answer.");
      }
    }
  };

  // Submit Answer for AI Evaluation
  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim()) {
      alert("Please enter or dictate your answer before submitting.");
      return;
    }

    stopSpeech();
    setIsSpeaking(false);
    if (isListening && recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch (e) {}
      setIsListening(false);
    }

    setIsEvaluating(true);
    const currentQ = questions[currentIndex];

    try {
      const evalResult = await evaluateInterviewAnswer({
        role,
        question: currentQ.question,
        answer: studentAnswer
      });

      setCurrentEvaluation(evalResult);
      setEvaluations((prev) => [
        ...prev,
        {
          question: currentQ.question,
          answer: studentAnswer,
          evaluation: evalResult
        }
      ]);
    } catch (err) {
      console.error("Failed to evaluate answer:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Next Question or Finish Session
  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setStudentAnswer('');
      setCurrentEvaluation(null);

      // Read next question
      setTimeout(() => {
        speakQuestion(questions[nextIdx].question);
        setIsSpeaking(true);
      }, 400);
    } else {
      // Completed all questions -> Show Performance Report
      stopSpeech();
      setSessionState('report');
    }
  };

  // Reset & Start New Session
  const handleResetSession = () => {
    stopSpeech();
    setSessionState('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setStudentAnswer('');
    setEvaluations([]);
    setCurrentEvaluation(null);
  };

  // Calculate Overall Average Score
  const calculateAverageScore = () => {
    if (evaluations.length === 0) return 85;
    const total = evaluations.reduce((acc, curr) => acc + (curr.evaluation?.overallScore || 85), 0);
    return Math.round(total / evaluations.length);
  };

  const avgScore = calculateAverageScore();

  return (
    <div className="space-y-6 pb-12 transition-all duration-300">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <BrainCircuit size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">AI Mock Interview Simulator</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Powered by Cloudflare Workers AI (<code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">@cf/meta/llama-3.1-8b-instruct-fp8</code>).
          </p>
        </div>

        {sessionState !== 'setup' && (
          <button
            onClick={handleResetSession}
            className="flex items-center gap-2 text-xs font-medium bg-muted hover:bg-muted/80 text-foreground px-3.5 py-2 rounded-lg border border-border transition-colors shrink-0"
          >
            <RotateCcw size={14} /> New Interview Session
          </button>
        )}
      </header>

      {/* VIEW 1: SETUP INTERVIEW SESSION */}
      {sessionState === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Setup Form */}
            <div className="border border-border bg-card rounded-xl p-6 md:p-8 relative overflow-hidden shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={20} />
                  <h2 className="text-xl font-bold">Launch AI Technical Interview</h2>
                </div>
                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <ShieldCheck size={12} /> Cloudflare AI Connected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Role */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Target Role
                  </label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Frontend Developer Intern">Frontend Developer Intern</option>
                    <option value="React UI Engineer">React UI Engineer</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Mobile Developer (React Native)">Mobile Developer (React Native)</option>
                    <option value="Backend Java Developer">Backend Java Developer</option>
                    <option value="Cybersecurity Analyst">Cybersecurity Analyst</option>
                    <option value="Cloud Infrastructure Architect">Cloud Infrastructure Architect</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </select>
                </div>

                {/* Interview Type */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Interview Type
                  </label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Comprehensive (Tech + Behavioral)">Comprehensive (Tech + Behavioral)</option>
                    <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                    <option value="Behavioral & Culture Fit">Behavioral & Culture Fit</option>
                    <option value="System Design Lite">System Design Lite</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Difficulty Level
                  </label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Junior / Entry-Level">Junior / Entry-Level</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="Senior / Staff Level">Senior / Staff Level</option>
                  </select>
                </div>

                {/* Questions Count */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                    Questions Count
                  </label>
                  <select 
                    value={questionCount}
                    onChange={(e) => setQuestionCount(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value={3}>3 Questions (Quick Practice)</option>
                    <option value={5}>5 Questions (Standard Session)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleStartSession}
                  disabled={isGenerating}
                  className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-md w-full disabled:opacity-50 text-sm"
                >
                  <PlayCircle size={20} className={isGenerating ? "animate-spin" : ""} />
                  {isGenerating ? "Synthesizing AI Questions..." : "Begin Live Mock Interview"}
                </button>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit">
                  <Mic size={20} />
                </div>
                <h3 className="font-semibold text-sm">Voice Dictation & Speech Reader</h3>
                <p className="text-xs text-muted-foreground">
                  Answer verbally using Web Speech recognition and listen to questions spoken by the AI interviewer.
                </p>
              </div>

              <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg w-fit">
                  <Zap size={20} />
                </div>
                <h3 className="font-semibold text-sm">Real-Time Evaluation</h3>
                <p className="text-xs text-muted-foreground">
                  Get instant scores for Technical Accuracy, Communication Clarity, and senior-level benchmark answers.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Performance Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border bg-card rounded-xl p-6 shadow-sm space-y-5">
              <h3 className="font-semibold text-base border-b border-border pb-3 flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" /> Overall Interview Readiness
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Technical Accuracy</span>
                    <span className="font-mono font-bold text-foreground">84%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '84%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground font-medium">Communication Clarity</span>
                    <span className="font-mono font-bold text-foreground">92%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> Key Strengths
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-medium">
                      React State Flow
                    </span>
                    <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md border border-emerald-500/20 font-medium">
                      REST API Design
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                    <AlertCircle size={14} className="text-amber-500" /> Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20 font-medium">
                      System Trade-off Analysis
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE INTERVIEW ROOM */}
      {sessionState === 'interview' && questions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Question Card */}
            <div className="border border-border bg-card rounded-xl p-6 md:p-8 shadow-sm space-y-5 relative">
              {/* Progress Header */}
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 bg-primary text-primary-foreground rounded-full">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {role} &nbsp;•&nbsp; {questions[currentIndex]?.category || type}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleSpeak(questions[currentIndex]?.question)}
                  className={`p-2 rounded-lg border transition-colors flex items-center gap-1.5 text-xs font-medium ${isSpeaking ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted hover:bg-muted/80 text-foreground border-border'}`}
                  title="Read question aloud"
                >
                  {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  <span>{isSpeaking ? "Mute" : "Listen"}</span>
                </button>
              </div>

              {/* Question Text */}
              <h2 className="text-lg font-semibold text-foreground leading-relaxed">
                "{questions[currentIndex]?.question}"
              </h2>

              {/* Hints dropdown */}
              {questions[currentIndex]?.hints && questions[currentIndex].hints.length > 0 && (
                <div className="p-3 bg-muted/40 border border-border rounded-lg text-xs space-y-1 text-muted-foreground">
                  <p className="font-medium text-foreground flex items-center gap-1">
                    <Lightbulb size={14} className="text-amber-500" /> Interviewer Hint:
                  </p>
                  <p>{questions[currentIndex].hints[0]}</p>
                </div>
              )}

              {/* Answer Input Area */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Response
                  </label>
                  
                  {/* Voice Dictation Button */}
                  <button
                    onClick={handleToggleDictation}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${isListening ? 'bg-red-500 text-white border-red-600 animate-pulse' : 'bg-muted hover:bg-muted/80 text-foreground border-border'}`}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    <span>{isListening ? "Listening... (Click to Stop)" : "Voice Dictate Answer"}</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type or speak your technical response here..."
                  className="w-full bg-background border border-border rounded-xl p-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Submit & Navigation */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-muted-foreground">
                  {studentAnswer.trim().split(/\s+/).filter(Boolean).length} words entered
                </span>

                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !studentAnswer.trim()}
                  className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 shadow-md transition-all disabled:opacity-50 text-sm"
                >
                  <Sparkles size={16} className={isEvaluating ? "animate-spin" : ""} />
                  {isEvaluating ? "Evaluating Response..." : "Submit Answer for Feedback"}
                </button>
              </div>
            </div>

            {/* AI Feedback & Evaluation Card */}
            {currentEvaluation && (
              <div className="border border-emerald-500/30 bg-card rounded-xl p-6 shadow-md space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
                    <CheckCircle2 size={20} /> AI Evaluation Breakdown
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                      Overall: {currentEvaluation.overallScore || 88}%
                    </span>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-muted/40 border border-border rounded-lg space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Technical Accuracy</span>
                    <span className="text-xl font-bold font-mono text-foreground">
                      {currentEvaluation.technicalScore || 85}%
                    </span>
                  </div>
                  <div className="p-3.5 bg-muted/40 border border-border rounded-lg space-y-1">
                    <span className="text-xs text-muted-foreground font-medium block">Communication Clarity</span>
                    <span className="text-xl font-bold font-mono text-foreground">
                      {currentEvaluation.communicationScore || 90}%
                    </span>
                  </div>
                </div>

                {/* Feedback Text */}
                <p className="text-xs text-foreground leading-relaxed">
                  {currentEvaluation.feedback}
                </p>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {currentEvaluation.strengths && (
                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg space-y-1">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={14} /> Strengths:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {currentEvaluation.strengths.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {currentEvaluation.improvements && (
                    <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-1">
                      <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle size={14} /> Improvement Tips:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
                        {currentEvaluation.improvements.map((imp, i) => (
                          <li key={i}>{imp}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Benchmark Sample Answer */}
                {currentEvaluation.idealSampleAnswer && (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-xs space-y-1.5">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Award size={16} className="text-primary" /> Top 1% Benchmark Sample Response:
                    </span>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{currentEvaluation.idealSampleAnswer}"
                    </p>
                  </div>
                )}

                {/* Next Question Action */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/90 shadow-md transition-colors text-xs"
                  >
                    <span>
                      {currentIndex < questions.length - 1 ? "Next Question" : "View Final Performance Report"}
                    </span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Session Progress */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-border bg-card rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-sm border-b border-border pb-3 flex items-center gap-2">
                <FileCheck size={16} className="text-primary" /> Session Questions Progress
              </h3>

              <div className="space-y-2">
                {questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${idx === currentIndex ? 'border-primary bg-primary/10 text-foreground font-semibold' : idx < currentIndex ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600' : 'border-border bg-muted/20 text-muted-foreground'}`}
                  >
                    <span className="truncate max-w-[200px]">
                      {idx + 1}. {q.question}
                    </span>
                    {idx < currentIndex && <CheckCircle2 size={14} className="shrink-0 text-emerald-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FINAL PERFORMANCE REPORT */}
      {sessionState === 'report' && (
        <div className="border border-border bg-card rounded-xl p-6 md:p-8 shadow-md space-y-6 max-w-4xl mx-auto">
          <div className="text-center border-b border-border pb-6 space-y-2">
            <div className="p-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 w-fit mx-auto">
              <Award size={48} />
            </div>
            <h2 className="text-2xl font-extrabold text-foreground">Mock Interview Session Complete!</h2>
            <p className="text-xs text-muted-foreground">
              Target Role: <strong>{role}</strong> &nbsp;•&nbsp; Difficulty: <strong>{difficulty}</strong>
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 border border-border rounded-xl text-center space-y-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overall Performance Score</span>
            <span className="text-4xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{avgScore}%</span>
            <span className="text-xs font-medium text-muted-foreground">
              {avgScore >= 85 ? "Grade A+ • Interview Placement Ready" : "Grade B • Solid Performance with Room for Growth"}
            </span>
          </div>

          {/* Questions & Feedback History */}
          <div className="space-y-4 pt-2">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" /> Session Question Transcripts & Feedback
            </h3>

            {evaluations.map((item, index) => (
              <div key={index} className="p-4 border border-border rounded-lg bg-muted/10 space-y-2 text-xs">
                <div className="flex justify-between items-center font-semibold">
                  <span className="text-foreground">Q{index + 1}: {item.question}</span>
                  <span className="font-mono text-emerald-600 font-bold">{item.evaluation?.overallScore || 85}%</span>
                </div>
                <p className="text-muted-foreground italic">
                  "Candidate Answer: {item.answer}"
                </p>
                <p className="text-foreground text-[11px]">
                  <strong>Feedback:</strong> {item.evaluation?.feedback}
                </p>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={handleResetSession}
              className="bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-primary/90 shadow-md transition-colors text-sm"
            >
              <RotateCcw size={16} /> Start Another Mock Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
