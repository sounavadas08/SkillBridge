import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Check, Filter, ExternalLink, Award, FileText } from 'lucide-react';
import { ThreeMatchCanvas } from '../ThreeMatchCanvas';

const SAMPLE_CANDIDATES = [
  {
    id: 1,
    name: 'Alex Chen',
    school: 'Stanford University',
    degree: 'B.S. Computer Science (Senior)',
    gpa: '3.9 / 4.0',
    matchScore: 98,
    strongSkills: ['React.js', 'TypeScript', 'Node.js', 'System Architecture', 'GraphQL'],
    verifiedProjects: 4,
    summary: 'Built high-throughput state synchronization layer for distributed web apps. Strong background in compiler optimization.'
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    school: 'MIT',
    degree: 'M.S. Electrical Eng & Computer Science',
    gpa: '3.95 / 4.0',
    matchScore: 94,
    strongSkills: ['Python', 'PostgreSQL', 'Docker', 'Distributed Systems', 'Go'],
    verifiedProjects: 6,
    summary: 'Published researcher in async database transaction optimization. Winner of 2 national hackathons.'
  },
  {
    id: 3,
    name: 'Marcus Vance',
    school: 'UC Berkeley',
    degree: 'B.S. Electrical Engineering & CS',
    gpa: '3.85 / 4.0',
    matchScore: 89,
    strongSkills: ['React Native', 'Tailwind CSS', 'WebSockets', 'UI Engineering'],
    verifiedProjects: 3,
    summary: 'Created open-source component library used by 2,000+ developers. Specialized in accessible UI patterns.'
  }
];

export function TalentMatchRadarView() {
  const [searchQuery, setSearchQuery] = useState('Senior React UI Architect with high-performance state management');
  const [selectedCandidate, setSelectedCandidate] = useState(SAMPLE_CANDIDATES[0]);
  const [isSearching, setIsSearching] = useState(false);

  // Animated Match Bar width state
  const [animatedScores, setAnimatedScores] = useState({});

  useEffect(() => {
    // Animate GSAP-style staggered fill for match score bars
    const timer = setTimeout(() => {
      const scores = {};
      SAMPLE_CANDIDATES.forEach((c) => {
        scores[c.id] = c.matchScore;
      });
      setAnimatedScores(scores);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    setIsSearching(true);
    setAnimatedScores({});
    setTimeout(() => {
      setIsSearching(false);
      const scores = {};
      SAMPLE_CANDIDATES.forEach((c) => {
        scores[c.id] = c.matchScore;
      });
      setAnimatedScores(scores);
    }, 600);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="space-y-2 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="text-primary" size={24} />
          <h1 className="rp-display-l">AI Talent Match Radar</h1>
        </div>
        <p className="rp-body-l text-muted-foreground">
          Semantic vector-embedding search that ranks candidates by true skill alignment, not keyword overlap.
        </p>
      </header>

      {/* Vector Embedding Search Bar */}
      <form onSubmit={handleSearch} className="rp-card p-4 flex flex-col sm:flex-row gap-3 items-center shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-3 text-muted-foreground" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Paste natural language job requirements or ideal candidate profile..."
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="rp-button-primary shrink-0 w-full sm:w-auto justify-center"
        >
          <Sparkles size={16} className={isSearching ? "animate-spin" : ""} />
          {isSearching ? "Computing Vector Alignment..." : "Execute Vector Search"}
        </button>
      </form>

      {/* Main Grid: 3D Visualization + Ranked Candidate Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Ranked Candidates List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="rp-heading text-lg">Ranked Candidate Matches</h2>
            <span className="rp-meta">{SAMPLE_CANDIDATES.length} High-Match Results</span>
          </div>

          <div className="space-y-4">
            {SAMPLE_CANDIDATES.map((candidate) => {
              const isSelected = selectedCandidate?.id === candidate.id;
              const fillWidth = animatedScores[candidate.id] || 0;

              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`rp-card cursor-pointer transition-all ${isSelected ? 'border-primary shadow-md bg-primary/5' : 'hover:border-primary/50'}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="rp-seal mt-0.5"><Check size={13} /></span>
                      <div>
                        <h3 className="font-bold text-base text-foreground">{candidate.name}</h3>
                        <p className="text-xs text-muted-foreground">{candidate.school} • {candidate.degree}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-extrabold font-mono text-primary">
                        {candidate.matchScore}%
                      </span>
                      <span className="block text-[11px] text-muted-foreground">Vector Alignment</span>
                    </div>
                  </div>

                  {/* Animated Match Score Bar */}
                  <div className="rp-match-bar-track mb-3">
                    <div 
                      className="rp-match-bar-fill" 
                      style={{ width: `${fillWidth}%` }}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    "{candidate.summary}"
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {candidate.strongSkills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-0.5 rounded bg-muted border border-border text-foreground font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: 3D Vector Embedding Space Canvas & Selected Dossier */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 3D Canvas Box */}
          <div className="space-y-2">
            <h3 className="rp-heading text-sm text-muted-foreground uppercase tracking-wider">
              Vector Embedding Field View
            </h3>
            <ThreeMatchCanvas activeMatchId={selectedCandidate?.id} />
          </div>

          {/* Selected Candidate Detailed Dossier */}
          {selectedCandidate && (
            <div className="rp-card space-y-4 border-primary/40 bg-card shadow-md">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rp-seal"><Check size={12} /></span>
                    <h3 className="font-bold text-lg text-foreground">{selectedCandidate.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedCandidate.school}</p>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-primary text-primary-foreground rounded-full">
                  {selectedCandidate.matchScore}% Vector Match
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Degree:</span>
                  <span className="font-medium text-foreground">{selectedCandidate.degree}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">GPA Standing:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedCandidate.gpa}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-1.5">
                  <span className="text-muted-foreground">Verified Skill Projects:</span>
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedCandidate.verifiedProjects} Verified Completed
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1.5">
                  Top Verified Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCandidate.strongSkills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button className="rp-button-primary text-xs w-full justify-center py-2.5">
                  Shortlist & Invite to Interview
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
