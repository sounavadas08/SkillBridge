import React, { useState } from 'react';
import { Building2, ChevronRight, Search, CheckCircle } from 'lucide-react';

export function OpportunitiesView() {
  const [filterType, setFilterType] = useState('All');
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const jobs = [
    { id: 1, title: 'Frontend Developer Intern', company: 'Acme Corp', match: 92, missing: 'TypeScript', matched: ['React', 'JavaScript', 'Git'], type: 'Internship' },
    { id: 2, title: 'React UI Engineer (Junior)', company: 'TechNova', match: 85, missing: 'Redux, Next.js', matched: ['React', 'JavaScript', 'Tailwind'], type: 'Full-time' },
    { id: 3, title: 'Web Development Intern', company: 'Global Solutions', match: 98, missing: 'None', matched: ['HTML/CSS', 'JavaScript', 'React'], type: 'Internship' },
    { id: 4, title: 'Frontend Software Engineer', company: 'Apex Labs', match: 89, missing: 'GraphQL', matched: ['React', 'Tailwind CSS', 'Node.js'], type: 'Full-time' },
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
          <p className="text-muted-foreground mt-1">Internships and roles matched to your actual SkillVault profile.</p>
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

      {toastMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-600 p-3 rounded-lg flex items-center gap-2 text-sm font-medium">
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
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold">{job.title}</h3>
                  <span className="text-xs font-mono px-2 py-0.5 bg-muted rounded-md text-muted-foreground border border-border">
                    {job.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Building2 size={16} />
                  {job.company}
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Matched Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {job.matched.map(s => (
                        <span key={s} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">{s}</span>
                      ))}
                    </div>
                  </div>
                  {job.missing !== 'None' && (
                    <div>
                      <span className="text-xs text-muted-foreground block mb-1">Missing Gaps</span>
                      <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded border border-amber-500/20">{job.missing}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center md:items-end min-w-[140px] w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border">
                <div className="text-3xl font-semibold tracking-tight text-primary mb-1">{job.match}%</div>
                <span className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Skill Match</span>
                <button 
                  onClick={() => handleApply(job)}
                  disabled={isApplied}
                  className={`flex items-center gap-1 text-sm font-medium px-4 py-2 rounded-lg w-full justify-center shadow-sm transition-all ${
                    isApplied 
                      ? 'bg-green-500 text-white cursor-default'
                      : 'btn-3d-liquid'
                  }`}
                >
                  {isApplied ? (
                    <>Applied <CheckCircle size={16} /></>
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
