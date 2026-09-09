import React, { useState } from 'react';
import { BrainCircuit, PlayCircle, Clock, BarChart2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function MockInterviewsView() {
  const [role, setRole] = useState('Frontend Developer Intern');
  const [type, setType] = useState('Comprehensive (Tech + Behavioral)');
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeSession, setActiveSession] = useState(null);

  const startSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setActiveSession({
        question: "Can you explain how the Virtual DOM works in React and how reconciliation optimizes re-renders?",
        role,
        type
      });
    }, 1000);
  };

  return (
    <div 
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Mock Interviews & Practice</h1>
        <p className="text-muted-foreground mt-1">AI-powered preparation tailored to your target roles and SkillVault profile.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-border bg-card rounded-xl p-6 md:p-8 relative overflow-hidden group hover:border-primary/50 transition-colors shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <BrainCircuit size={120} />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Start a Mock Interview</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Engage in a dynamic, AI-guided interview simulation. The system adapts questions based on your stated skills and role requirements.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Target Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Frontend Developer Intern">Frontend Developer Intern</option>
                  <option value="React UI Engineer">React UI Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Interview Type</label>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                >
                  <option value="Comprehensive (Tech + Behavioral)">Comprehensive (Tech + Behavioral)</option>
                  <option value="Technical Deep-Dive">Technical Deep-Dive</option>
                  <option value="Behavioral & Culture Fit">Behavioral & Culture Fit</option>
                </select>
              </div>
            </div>

            <button 
              onClick={startSimulation}
              disabled={isSimulating}
              className="bg-primary text-primary-foreground font-medium px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-md w-full md:w-auto justify-center disabled:opacity-50"
            >
              <PlayCircle size={20} className={isSimulating ? "animate-spin" : ""} />
              {isSimulating ? "Launching AI Session..." : "Begin Simulation"}
            </button>
          </div>

          {activeSession && (
            <div className="border border-primary/40 bg-primary/5 rounded-xl p-6 shadow-md space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles size={16} /> AI Simulator Active Session
              </div>
              <h3 className="text-lg font-medium">{activeSession.question}</h3>
              <textarea
                rows={3}
                placeholder="Type or dictate your answer here..."
                className="w-full p-3 bg-background border border-border rounded-lg text-sm outline-none focus:border-primary"
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setActiveSession(null)}
                  className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:text-foreground"
                >
                  End Session
                </button>
                <button 
                  onClick={() => alert("AI Evaluation: Excellent structure! You clearly highlighted reconciliation and batching.")}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium shadow-sm hover:bg-primary/90"
                >
                  Submit Answer for AI Feedback
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-border bg-card rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <Clock size={20} />
                </div>
                <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">5 Min</span>
              </div>
              <h3 className="font-semibold mb-1">Daily React Quiz</h3>
              <p className="text-xs text-muted-foreground">10 quick-fire questions on React Hooks, key props, and state updates.</p>
            </div>

            <div className="border border-border bg-card rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 bg-primary/10 text-primary rounded-md">
                  <BarChart2 size={20} />
                </div>
                <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded">15 Min</span>
              </div>
              <h3 className="font-semibold mb-1">System Design Lite</h3>
              <p className="text-xs text-muted-foreground">Architect a scalable chat application frontend with state streaming.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Performance Insights</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Technical Accuracy</span>
                  <span className="font-mono font-medium">78%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Communication Clarity</span>
                  <span className="font-mono font-medium">92%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-border space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} className="text-green-500" /> Strong Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-muted rounded border border-border">React Hooks</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded border border-border">CSS Layouts</span>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <AlertCircle size={14} className="text-amber-500" /> Needs Work
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs px-2 py-1 bg-amber-500/10 text-amber-600 rounded border border-amber-500/20">TypeScript Generics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
