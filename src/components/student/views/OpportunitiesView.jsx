import React, { useState } from 'react';
import { Building2, ChevronRight, Search, CheckCircle, Code2, ArrowRight } from 'lucide-react';

export function OpportunitiesView({ onNavigateSection }) {
  const [filterType, setFilterType] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const jobs = [
    { 
      id: 1, 
      title: 'Software Engineering Intern', 
      company: 'Google', 
      location: 'Mountain View, CA (Hybrid)',
      stipend: '$58/hr • $9,850/mo',
      match: 96, 
      missing: 'None', 
      matched: ['Python', 'Go', 'Distributed Systems', 'Algorithms'], 
      type: 'Internship' 
    },
    { 
      id: 2, 
      title: 'Full-Stack Systems Intern', 
      company: 'Stripe', 
      location: 'San Francisco, CA (Remote)',
      stipend: '$60/hr • $10,200/mo',
      match: 94, 
      missing: 'PostgreSQL tuning', 
      matched: ['React', 'TypeScript', 'Node.js'], 
      type: 'Internship' 
    },
    { 
      id: 3, 
      title: 'Applied AI & ML Intern', 
      company: 'Microsoft', 
      location: 'Redmond, WA (Hybrid)',
      stipend: '$52/hr • $8,840/mo',
      match: 91, 
      missing: 'ONNX runtime', 
      matched: ['PyTorch', 'Python', 'Azure AI'], 
      type: 'Internship' 
    },
    { 
      id: 4, 
      title: 'Deep Learning & CUDA Intern', 
      company: 'NVIDIA', 
      location: 'Santa Clara, CA (On-Site)',
      stipend: '$56/hr • $9,520/mo',
      match: 89, 
      missing: 'CUDA Kernels', 
      matched: ['C++', 'Python', 'TensorRT'], 
      type: 'Full-time' 
    },
    { 
      id: 5, 
      title: 'Cloud DevOps Intern', 
      company: 'Amazon Web Services', 
      location: 'Seattle, WA (Hybrid)',
      stipend: '$54/hr • $9,180/mo',
      match: 88, 
      missing: 'Terraform', 
      matched: ['AWS', 'Kubernetes', 'Docker'], 
      type: 'Internship' 
    },
    { 
      id: 6, 
      title: 'Production Engineering Intern', 
      company: 'Meta', 
      location: 'Menlo Park, CA (Remote)',
      stipend: '$55/hr • $9,350/mo',
      match: 86, 
      missing: 'Kernel tracing', 
      matched: ['Linux', 'Python', 'CI/CD'], 
      type: 'Full-time' 
    },
  ];

  const filteredJobs = jobs.filter(job => filterType === 'All' || job.type === filterType);

  const handleApply = (job) => {
    if (!appliedJobs.includes(job.id)) {
      setAppliedJobs([...appliedJobs, job.id]);
      setToastMsg(`Successfully submitted application for ${job.title} at ${job.company}!`);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  return (
    <div 
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Opportunity Matcher</h1>
          <p className="text-muted-foreground mt-1">Direct corporate internship openings matched to your actual SkillVault profile.</p>
        </div>

        <div className="flex gap-2">
          {['All', 'Internship', 'Full-time'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                filterType === type 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      {/* Micro-Internship Challenges Callout Banner */}
      {onNavigateSection && (
        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Code2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Looking to prove ability by doing?</h4>
              <p className="text-xs text-muted-foreground">Tackle real corporate tasks, earn bounties, and get fast-tracked to interviews.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateSection('challenges')}
            className="btn-3d-liquid text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shrink-0"
          >
            Explore Micro-Internships <ArrowRight size={14} />
          </button>
        </div>
      )}

      {toastMsg && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
          <CheckCircle size={16} /> {toastMsg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredJobs.map((job) => {
          const isApplied = appliedJobs.includes(job.id);
          return (
            <div 
              key={job.id} 
              className="border border-border bg-card rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between shadow-sm group hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{job.title}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded-md text-muted-foreground border border-border">
                    {job.type}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <Building2 size={16} className="text-primary" />
                    {job.company}
                  </span>
                  <span>•</span>
                  <span>{job.location}</span>
                  <span>•</span>
                  <span className="font-mono font-bold text-amber-500">{job.stipend}</span>
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1 font-medium">Matched Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matched.map(s => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-md border border-primary/20 font-mono">{s}</span>
                      ))}
                    </div>
                  </div>
                  {job.missing !== 'None' && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1 font-medium">Missing Gaps</span>
                      <span className="text-xs bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-md border border-amber-500/20 font-mono">{job.missing}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end min-w-[150px] w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
                <div className="text-3xl font-extrabold tracking-tight text-primary mb-1 font-mono">{job.match}%</div>
                <span className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Skill Match</span>
                <button 
                  onClick={() => handleApply(job)}
                  disabled={isApplied}
                  className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg w-full justify-center shadow-sm transition-all ${
                    isApplied 
                      ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30 cursor-default font-mono text-xs font-bold'
                      : 'btn-3d-liquid'
                  }`}
                >
                  {isApplied ? (
                    <>Applied <CheckCircle size={15} /></>
                  ) : (
                    <>Apply Now <ChevronRight size={16} /></>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

