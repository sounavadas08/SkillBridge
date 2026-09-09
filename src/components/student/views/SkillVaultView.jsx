import React, { useState } from 'react';
import { Plus, Check, ExternalLink } from 'lucide-react';

export function SkillVaultView({ user }) {
  const userName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const [skills, setSkills] = useState(['React', 'JavaScript', 'HTML/CSS', 'Git', 'Tailwind CSS', 'Node.js', 'Figma']);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
      setIsAdding(false);
    }
  };

  return (
    <div 
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">SkillVault</h1>
        <p className="text-muted-foreground mt-1">Your dynamic professional identity, verified skills, and portfolio project repository.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 border border-border bg-card p-6 rounded-xl h-fit shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="size-32 rounded-full bg-muted border-2 border-primary overflow-hidden mb-4 shadow-md">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop&auto=format"} 
                alt="Student Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-medium">{userName}</h2>
            <p className="text-muted-foreground text-sm">Computer Science Major</p>
            <div className="w-full h-px bg-border my-6" />
            <div className="text-left w-full space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Education</h4>
                <p className="text-sm font-medium">B.S. in Computer Science</p>
                <p className="text-xs text-muted-foreground">Tech University (2021 - 2025)</p>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Target Degree</h4>
                <p className="text-sm font-medium">Software Engineering Specialization</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Professional Bio</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Passionate frontend developer with a strong foundation in modern JavaScript frameworks. 
              I specialize in building accessible, high-performance user interfaces and enjoy solving 
              complex UX challenges. Currently focused on mastering TypeScript and learning about 
              scalable system design.
            </p>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Verified Skills</h3>
              <span className="text-xs text-muted-foreground font-mono">{skills.length} Total Skills</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span 
                  key={skill} 
                  className="px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-sm font-medium rounded-md flex items-center gap-1.5"
                >
                  <Check size={14} className="text-primary" />
                  {skill}
                </span>
              ))}

              {isAdding ? (
                <form onSubmit={handleAddSkill} className="inline-flex items-center gap-1">
                  <input
                    type="text"
                    autoFocus
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    placeholder="Skill name..."
                    className="px-2.5 py-1 text-sm bg-background border border-primary rounded-md outline-none focus:ring-1 focus:ring-primary w-32"
                  />
                  <button type="submit" className="px-2.5 py-1 bg-primary text-primary-foreground text-xs rounded-md font-medium">Add</button>
                  <button type="button" onClick={() => setIsAdding(false)} className="px-2 py-1 text-xs text-muted-foreground">Cancel</button>
                </form>
              ) : (
                <button 
                  onClick={() => setIsAdding(true)}
                  className="px-3 py-1.5 border border-dashed border-muted-foreground text-muted-foreground text-sm font-medium rounded-md hover:border-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  <Plus size={14} /> Add Skill
                </button>
              )}
            </div>
          </div>

          <div className="border border-border bg-card p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg mb-4">Featured Projects</h3>
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      E-commerce Dashboard UI
                      <ExternalLink size={14} className="text-muted-foreground" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">React • Tailwind • Recharts</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 bg-background rounded border border-border">Featured</span>
                </div>
                <p className="text-sm mt-3 text-muted-foreground">
                  A responsive admin dashboard template with real-time data visualization components and state management.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      AI Job Matcher Extension
                      <ExternalLink size={14} className="text-muted-foreground" />
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">JavaScript • Chrome Extension API • OpenAI</p>
                  </div>
                  <span className="text-xs font-mono px-2 py-1 bg-background rounded border border-border">Verified</span>
                </div>
                <p className="text-sm mt-3 text-muted-foreground">
                  Browser extension that parses job descriptions and compares required keywords against your resume.
                </p>
              </div>

              <button className="w-full py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors font-medium flex items-center justify-center gap-1.5">
                <Plus size={16} /> Add New Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
