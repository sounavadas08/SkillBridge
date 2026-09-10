import React, { useState } from 'react';
import { Download, Wand2, CheckCircle } from 'lucide-react';

export function AiResumeView({ user }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const userEmail = user?.email || 'alex@example.com';
  const [targetRole, setTargetRole] = useState('Frontend Developer Intern');
  const [tone, setTone] = useState('Professional & Technical');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1200);
  };

  return (
    <div
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">AI Resume Architect</h1>
          <p className="text-muted-foreground mt-1">Generate a professional ATS-tailored resume based on your SkillVault profile.</p>
        </div>
      </header>

      {showToast && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} /> Resume successfully generated and tailored for {targetRole}!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[620px]">
        <div className="lg:col-span-1 border border-border bg-card rounded-xl p-6 flex flex-col shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Generation Settings</h3>

          <div className="space-y-4 flex-1">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tone / Style</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="Professional & Technical">Professional & Technical</option>
                <option value="Creative & Startup">Creative & Startup</option>
                <option value="Standard / Academic">Standard / Academic</option>
              </select>
            </div>
            <div className="p-4 bg-muted/60 border border-border rounded-lg text-xs space-y-2 text-muted-foreground">
              <p className="font-medium text-foreground">ATS Optimization Checklist:</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-primary shrink-0" /> Action verb bullet points</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-primary shrink-0" /> SkillVault verified badges</p>
              <p className="flex items-center gap-1.5"><CheckCircle size={13} className="text-primary shrink-0" /> High match score format</p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 mt-4 shadow-md transition-colors disabled:opacity-50"
          >
            <Wand2 size={18} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Tailoring Resume..." : "Generate Tailored Resume"}
          </button>
        </div>

        <div className="lg:col-span-2 border border-border bg-muted/40 rounded-xl p-6 md:p-8 flex items-center justify-center relative overflow-hidden shadow-inner">
          <div className="w-full max-w-[500px] bg-white text-gray-900 p-8 shadow-2xl rounded-sm flex flex-col border border-gray-200">
            <div className="text-center mb-6 border-b border-gray-300 pb-4">
              <h2 className="text-2xl font-serif font-bold tracking-wide uppercase">{userName}</h2>
              <p className="text-xs mt-1 text-gray-600 font-sans">{userEmail} • github.com/student • linkedin.com/in/student</p>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase border-b border-gray-300 mb-2 font-mono tracking-wider text-gray-700">Education</h3>
              <div className="flex justify-between text-xs">
                <span className="font-semibold">Tech University</span>
                <span className="text-gray-600">Expected May 2025</span>
              </div>
              <p className="text-xs text-gray-600">B.S. in Computer Science • GPA: 3.8/4.0</p>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase border-b border-gray-300 mb-2 font-mono tracking-wider text-gray-700">Technical Skills</h3>
              <p className="text-xs leading-relaxed text-gray-700">
                <span className="font-semibold text-gray-900">Languages & Tools:</span> JavaScript (ES6+), HTML5, CSS3, Git, REST APIs<br />
                <span className="font-semibold text-gray-900">Frameworks & Libraries:</span> React.js, Tailwind CSS, Node.js, Vite
              </p>
            </div>

            <div className="mb-4 flex-1">
              <h3 className="text-xs font-bold uppercase border-b border-gray-300 mb-2 font-mono tracking-wider text-gray-700">Featured Projects</h3>
              <div className="mb-3">
                <div className="flex justify-between text-xs font-semibold text-gray-900">
                  <span>E-Commerce Dashboard UI</span>
                  <span className="text-gray-500 font-normal">React / Tailwind</span>
                </div>
                <ul className="list-disc pl-4 text-xs mt-1 space-y-1 text-gray-700">
                  <li>Built responsive dashboard components with real-time UI state management.</li>
                  <li>Integrated interactive charts and responsive CSS layout grids.</li>
                </ul>
              </div>
            </div>
          </div>

          <button className="absolute bottom-6 right-6 bg-background border border-border text-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium hover:bg-muted shadow-lg transition-colors">
            <Download size={16} /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
