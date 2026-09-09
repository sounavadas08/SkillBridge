import React, { useState } from 'react';
import { Target, CheckCircle2, CircleDashed, ArrowRight } from 'lucide-react';

export function SkillRadarView() {
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');

  const roleGaps = {
    'Frontend Developer': {
      strong: ['React', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Git Version Control'],
      missing: [
        { skill: 'TypeScript', status: 'In Progress (40%)' },
        { skill: 'Next.js / SSR', status: 'Not Started' },
        { skill: 'State Management (Redux/Zustand)', status: 'Not Started' }
      ]
    },
    'Full Stack Developer': {
      strong: ['React', 'JavaScript (ES6+)', 'Node.js Basics', 'Git'],
      missing: [
        { skill: 'PostgreSQL / SQL', status: 'In Progress (20%)' },
        { skill: 'Express & API Security', status: 'Not Started' },
        { skill: 'Docker Containerization', status: 'Not Started' }
      ]
    },
    'UI/UX Designer': {
      strong: ['Figma', 'User Research', 'Wireframing', 'HTML/CSS'],
      missing: [
        { skill: 'Design System Architecture', status: 'In Progress (50%)' },
        { skill: 'Prototyping Animations', status: 'Not Started' }
      ]
    }
  };

  const currentRoleData = roleGaps[selectedRole] || roleGaps['Frontend Developer'];

  return (
    <div 
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Skill-Gap Radar</h1>
          <p className="text-muted-foreground mt-1">Compare your current profile against real-time industry role requirements.</p>
        </div>
      </header>

      <div className="border border-border bg-card rounded-xl p-6 mb-8 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <Target className="text-primary size-8 shrink-0" />
        <div className="flex-1 w-full">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Target Role Benchmark</label>
          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-transparent border border-border md:border-none text-xl font-medium focus:ring-0 focus:outline-none cursor-pointer w-full max-w-xs rounded-md py-1"
          >
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="UI/UX Designer">UI/UX Designer</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-green-500" size={20} />
            Strong Skills Matched
          </h3>
          <ul className="space-y-3">
            {currentRoleData.strong.map((skill) => (
              <li key={skill} className="bg-card border border-border rounded-lg p-3 text-sm font-medium flex items-center justify-between shadow-sm">
                <span>{skill}</span>
                <span className="text-xs font-mono text-green-600 bg-green-500/10 px-2 py-0.5 rounded">Verified</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CircleDashed className="text-amber-500" size={20} />
            Skill Gaps to Bridge
          </h3>
          <ul className="space-y-3">
            {currentRoleData.missing.map((item) => (
              <li key={item.skill} className="bg-card border border-border rounded-lg p-3 flex justify-between items-center text-sm shadow-sm">
                <span className="font-medium">{item.skill}</span>
                <span className="text-xs font-mono text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded">{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Your Personalized Upskilling Pathway</h2>
        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:to-transparent">
          {[
            { step: 'Step 1: TypeScript Core Fundamentals', source: 'Official Docs & Practice', active: true },
            { step: 'Step 2: React + TypeScript Application Patterns', source: 'Frontend Masters', active: false },
            { step: 'Step 3: Next.js App Router & Server Components', source: 'Next.js Official Pathway', active: false },
          ].map((path, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-card text-muted-foreground shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                {path.active ? <Target size={16} className="text-primary" /> : <span className="text-xs font-mono">{idx + 1}</span>}
              </div>
              
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border border-border p-4 rounded-xl shadow-sm hover:border-primary/50 transition-colors">
                <h4 className="font-medium text-sm mb-1">{path.step}</h4>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{path.source}</p>
                  {path.active && (
                    <button className="text-xs text-primary font-medium flex items-center gap-1 hover:underline">
                      Start <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
