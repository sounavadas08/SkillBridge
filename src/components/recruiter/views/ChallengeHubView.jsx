import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Check, Sparkles, Plus, Clock, Users, ArrowRight, X, ShieldCheck } from 'lucide-react';

const INITIAL_CHALLENGES = [
  {
    id: 'c1',
    category: 'frontend',
    tickClass: 'rp-tick-frontend',
    title: 'High-Performance Virtualized Table Component',
    company: 'Stripe Ecosystem Challenge',
    stipend: '$750 USD',
    duration: '3 Days',
    applicants: 18,
    status: 'Active Submissions',
    description: 'Build a zero-dependency React virtualized list table handling 100,000 items with 60fps scrolling and keyboard navigation.',
    verifiedCount: 4
  },
  {
    id: 'c2',
    category: 'backend',
    tickClass: 'rp-tick-backend',
    title: 'Distributed Transaction Rate Limiter',
    company: 'Fintech Infrastructure',
    stipend: '$1,200 USD',
    duration: '5 Days',
    applicants: 12,
    status: 'Under Review',
    description: 'Implement a token-bucket rate-limiting middleware in Node.js/Go backed by Redis sliding logs with failure fallback.',
    verifiedCount: 2
  },
  {
    id: 'c3',
    category: 'data',
    tickClass: 'rp-tick-data',
    title: 'PostgreSQL Query Execution Profiler',
    company: 'Data Scale Engine',
    stipend: '$900 USD',
    duration: '4 Days',
    applicants: 15,
    status: 'Active Submissions',
    description: 'Construct an automated SQL query analysis script identifying unindexed joins, high sequential scans, and index suggestions.',
    verifiedCount: 5
  },
  {
    id: 'c4',
    category: 'ai',
    tickClass: 'rp-tick-ai',
    title: 'RAG Pipeline Vector Search Evaluator',
    company: 'AI Research Hub',
    stipend: '$1,500 USD',
    duration: '1 Week',
    applicants: 24,
    status: 'Active Submissions',
    description: 'Build an evaluation benchmark suite measuring context retrieval precision and recall across 500 embedding queries.',
    verifiedCount: 7
  }
];

export function ChallengeHubView() {
  const [challenges, setChallenges] = useState(INITIAL_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [verifiedStamps, setVerifiedStamps] = useState({});

  const handleVerifySubmission = (challengeId) => {
    setVerifiedStamps((prev) => ({
      ...prev,
      [challengeId]: true
    }));
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="text-primary" size={24} />
            <h1 className="rp-display-l">Micro-Internship & Challenge Hub</h1>
          </div>
          <p className="rp-body-l text-muted-foreground mt-1">
            Post real-world engineering tasks so student candidates prove ability by doing, not just interviewing.
          </p>
        </div>

        <button className="rp-button-primary shrink-0">
          <Plus size={18} /> Post New Challenge
        </button>
      </header>

      {/* Horizontal Filmstrip of Challenge Cards with Accent Ticks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="rp-heading text-lg">Active Corporate Challenges</h2>
          <span className="rp-meta">Scroll horizontally or click to inspect</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {challenges.map((item) => {
            const isVerified = verifiedStamps[item.id];

            return (
              <motion.div
                key={item.id}
                layoutId={`card-${item.id}`}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={() => setSelectedChallenge(item)}
                className={`rp-card ${item.tickClass} cursor-pointer space-y-4 relative flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/60`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground font-semibold">
                      {item.company}
                    </span>

                    {isVerified && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className="rp-seal"
                        title="Verified Recruiter Task"
                      >
                        <Check size={12} />
                      </motion.span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-primary">{item.stipend}</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock size={12} /> {item.duration}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {item.applicants} Submissions
                    </span>
                    <span className="text-primary font-semibold flex items-center gap-0.5 group">
                      Inspect <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Expanded Challenge Detail Modal Panel via Framer Motion layoutId */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              layoutId={`card-${selectedChallenge.id}`}
              className={`bg-card border border-border rounded-xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative ${selectedChallenge.tickClass}`}
            >
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground font-semibold">
                    {selectedChallenge.company}
                  </span>
                  {verifiedStamps[selectedChallenge.id] && (
                    <span className="rp-seal"><Check size={12} /></span>
                  )}
                </div>
                <h2 className="rp-heading text-xl text-foreground">{selectedChallenge.title}</h2>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {selectedChallenge.description}
              </p>

              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 border border-border rounded-lg text-xs">
                <div>
                  <span className="text-muted-foreground block">Reward Stipend:</span>
                  <span className="font-mono font-bold text-primary text-sm">{selectedChallenge.stipend}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Estimated Effort:</span>
                  <span className="font-semibold text-foreground">{selectedChallenge.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Active Submissions:</span>
                  <span className="font-semibold text-foreground">{selectedChallenge.applicants} Candidates</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Recruiter Verification Action
                </h4>
                <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-background">
                  <span className="text-xs text-foreground">Mark task submission status as Official Academic Verified</span>
                  <button
                    onClick={() => handleVerifySubmission(selectedChallenge.id)}
                    className={`rp-button-primary text-xs py-2 ${verifiedStamps[selectedChallenge.id] ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                    <ShieldCheck size={14} />
                    {verifiedStamps[selectedChallenge.id] ? 'Verified & Stamped' : 'Stamp Verification Seal'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
