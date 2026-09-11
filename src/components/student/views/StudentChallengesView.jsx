import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Code2, 
  Sparkles, 
  Award, 
  X, 
  Tag, 
  Send, 
  AlertCircle, 
  Building2, 
  FileCode2 
} from 'lucide-react';
import { challengeService } from '../../../services/challengeService';

const GithubIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const CATEGORIES = [
  { id: 'all', label: 'All Challenges' },
  { id: 'frontend', label: 'Frontend & UI' },

  { id: 'backend', label: 'Backend & Systems' },
  { id: 'data', label: 'Data & SQL' },
  { id: 'ai', label: 'AI & Machine Learning' }
];

export function StudentChallengesView({ user }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const candidateName = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const candidateEmail = user?.email || 'alex.chen@university.edu';
  const candidateSchool = user?.organization || 'Stanford University';

  // Submission form state
  const [submissionForm, setSubmissionForm] = useState({
    repo_url: '',
    demo_url: '',
    notes: ''
  });

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges('all');
      setChallenges(data);
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Find if current student already submitted for this challenge
  const getCandidateSubmission = (challenge) => {
    if (!challenge?.submissions) return null;
    return challenge.submissions.find(
      (s) =>
        s.candidate_name?.toLowerCase() === candidateName.toLowerCase() ||
        (s.candidate_email && s.candidate_email.toLowerCase() === candidateEmail.toLowerCase())
    );
  };

  // Handle Submit Solution
  const handleSubmitSolution = async (e) => {
    e.preventDefault();
    if (!selectedChallenge) return;

    if (!submissionForm.repo_url.trim()) {
      showToast('Please provide a valid GitHub repository URL.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const submissionPayload = {
        candidate_name: candidateName,
        candidate_email: candidateEmail,
        candidate_school: candidateSchool,
        repo_url: submissionForm.repo_url.trim(),
        demo_url: submissionForm.demo_url.trim() || null,
        notes: submissionForm.notes.trim()
      };

      const result = await challengeService.submitSolution(selectedChallenge.id, submissionPayload);

      // Update local state
      const updated = challenges.map((c) => {
        if (c.id === selectedChallenge.id) {
          return {
            ...c,
            applicants: (c.applicants || 0) + 1,
            submissions: [...(c.submissions || []), result]
          };
        }
        return c;
      });
      setChallenges(updated);

      setSelectedChallenge((prev) => ({
        ...prev,
        applicants: (prev.applicants || 0) + 1,
        submissions: [...(prev.submissions || []), result]
      }));

      setSubmissionForm({ repo_url: '', demo_url: '', notes: '' });
      showToast('Solution submitted successfully! Recruiter panel notified.');
    } catch (err) {
      showToast('Failed to submit solution. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered challenges
  const filteredChallenges = challenges.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category?.toLowerCase() === selectedCategory.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.title?.toLowerCase().includes(query) ||
      item.company?.toLowerCase().includes(query) ||
      item.tags?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Calculate student submission stats
  const studentSubmissions = challenges.filter((c) => !!getCandidateSubmission(c));
  const verifiedSubmissions = studentSubmissions.filter((c) => {
    const sub = getCandidateSubmission(c);
    return sub && sub.status === 'verified';
  });

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm font-semibold border ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-600 text-rose-200'
              : 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
          {toast.msg}
        </motion.div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Code2 size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Micro-Internships & Corporate Challenges
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 text-sm max-w-3xl leading-relaxed">
            Solve real-world engineering tasks posted directly by tech companies and engineering leads. Prove ability through verified proof-of-work, earn stipends, and bypass standard technical phone screens.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-card px-4 py-2.5 border border-border rounded-xl shadow-xs shrink-0">
          <Award size={20} className="text-amber-500" />
          <div className="text-left">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Your Verified Bounties</p>
            <p className="text-base font-bold font-mono text-foreground">
              {verifiedSubmissions.length} of {studentSubmissions.length} Verified
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Available Challenges</p>
          <p className="text-3xl font-extrabold font-mono text-foreground mt-1">{challenges.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Open corporate bounties & specifications</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Active Submissions</p>
          <p className="text-3xl font-extrabold font-mono text-blue-500 mt-1">{studentSubmissions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Solutions submitted by {candidateName}</p>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Academic Stamped Seals</p>
          <p className="text-3xl font-extrabold font-mono text-emerald-500 mt-1">{verifiedSubmissions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Evaluated & verified by recruiter leads</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all border ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks, tech, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Challenge Cards Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="animate-pulse font-medium">Loading corporate challenges...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-card/40">
            <Code2 size={40} className="mx-auto text-muted-foreground mb-3 opacity-60" />
            <p className="text-base font-semibold text-foreground">No matching challenges found</p>
            <p className="text-xs text-muted-foreground mt-1">Try switching to "All Challenges" or clearing your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((item) => {
              const mySub = getCandidateSubmission(item);
              const isVerified = mySub?.status === 'verified';

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => setSelectedChallenge(item)}
                  className="bg-card border border-border hover:border-primary/60 rounded-2xl p-6 flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transition-all relative group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Building2 size={13} /> {item.company}
                      </span>

                      {/* Status Badges */}
                      {mySub && (
                        isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <Clock size={12} /> Submitted
                          </span>
                        )
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    {item.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.tags.split(',').slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded-md bg-muted text-foreground border border-border">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground block text-xs uppercase font-semibold">Stipend Bounty</span>
                        <span className="font-mono font-bold text-primary text-sm">{item.stipend}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-muted-foreground block text-xs uppercase font-semibold">Effort</span>
                        <span className="font-medium text-foreground flex items-center gap-1">
                          <Clock size={12} /> {item.duration}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChallenge(item);
                      }}
                      className={`w-full py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        mySub
                          ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                          : 'btn-3d-liquid'
                      }`}
                    >
                      {mySub ? (
                        <>View Your Submission <CheckCircle size={14} className="text-emerald-500" /></>
                      ) : (
                        <>Inspect & Submit Solution <Code2 size={14} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Expanded Candidate Challenge Spec & Submission Modal */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-2xl w-full space-y-6 shadow-2xl relative my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title & Info */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-primary font-bold">
                    {selectedChallenge.company}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground uppercase">
                    {selectedChallenge.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-foreground">{selectedChallenge.title}</h2>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Challenge Overview</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedChallenge.description}
                </p>
              </div>

              {/* Tech Stack Tags */}
              {selectedChallenge.tags && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Tag size={13} /> Required Stack:
                  </span>
                  {selectedChallenge.tags.split(',').map((t, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-muted/30 border border-border rounded-xl text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Reward Stipend:</span>
                  <span className="font-mono font-bold text-primary text-base">{selectedChallenge.stipend}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Estimated Effort:</span>
                  <span className="font-semibold text-foreground text-sm">{selectedChallenge.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Total Applicants:</span>
                  <span className="font-semibold text-foreground text-sm">{selectedChallenge.applicants || 0}</span>
                </div>
              </div>

              {/* Starter Spec Repo */}
              {selectedChallenge.starter_repo && (
                <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-background text-xs">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <GithubIcon size={15} className="text-foreground" /> Starter Specification Repo:
                  </span>
                  <a
                    href={selectedChallenge.starter_repo}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-mono font-semibold"
                  >
                    Open Spec <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* Existing Submission or Submission Form */}
              {(() => {
                const mySub = getCandidateSubmission(selectedChallenge);
                const isVerified = mySub?.status === 'verified';

                if (mySub) {
                  return (
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                          <CheckCircle size={16} className="text-emerald-500" />
                          Your Submitted Solution
                        </h4>
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                            <ShieldCheck size={14} /> Academic Verified & Stamped
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-amber-500/15 border border-amber-500/30 text-amber-400">
                            <Clock size={14} /> Under Recruiter Review
                          </span>
                        )}
                      </div>

                      <div className="p-4 rounded-xl border border-border bg-background space-y-3 text-xs">
                        <div>
                          <span className="text-muted-foreground block text-xs mb-1">GitHub Repository:</span>
                          <a
                            href={mySub.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline font-mono font-semibold flex items-center gap-1.5"
                          >
                            <GithubIcon size={14} /> {mySub.repo_url} <ExternalLink size={12} />
                          </a>
                        </div>


                        {mySub.demo_url && (
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1">Live Demo:</span>
                            <a
                              href={mySub.demo_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-400 hover:underline font-mono font-semibold flex items-center gap-1.5"
                            >
                              <ExternalLink size={14} /> {mySub.demo_url}
                            </a>
                          </div>
                        )}

                        {mySub.notes && (
                          <div>
                            <span className="text-muted-foreground block text-xs mb-1">Architecture Notes:</span>
                            <p className="text-foreground leading-relaxed bg-muted/40 p-2.5 rounded-lg">
                              {mySub.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                // New Submission Form
                return (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Send size={16} className="text-primary" />
                        Submit Proof-of-Work Solution
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        Submitting as <strong className="text-foreground">{candidateName}</strong>
                      </span>
                    </div>

                    <form onSubmit={handleSubmitSolution} className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          GitHub Repository URL *
                        </label>
                        <input
                          type="url"
                          required
                          value={submissionForm.repo_url}
                          onChange={(e) => setSubmissionForm({ ...submissionForm, repo_url: e.target.value })}
                          placeholder="https://github.com/your-username/challenge-repo"
                          className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Live Demo URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={submissionForm.demo_url}
                          onChange={(e) => setSubmissionForm({ ...submissionForm, demo_url: e.target.value })}
                          placeholder="https://your-preview-deployment.vercel.app"
                          className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-foreground mb-1">
                          Architecture & Approach Notes *
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={submissionForm.notes}
                          onChange={(e) => setSubmissionForm({ ...submissionForm, notes: e.target.value })}
                          placeholder="Briefly explain your architectural trade-offs, algorithms used, testing strategy, and benchmark results..."
                          className="w-full px-3.5 py-2 text-xs bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedChallenge(null)}
                          className="px-4 py-2 text-xs font-semibold bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-3d-liquid text-xs py-2 px-5 font-semibold flex items-center gap-1.5"
                        >
                          {isSubmitting ? (
                            'Submitting...'
                          ) : (
                            <>Submit Solution <Send size={13} /></>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
