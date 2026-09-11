import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  Check, 
  Plus, 
  Clock, 
  Users, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Search, 
  Trash2, 
  ExternalLink, 
  Sparkles,
  Tag,
  AlertCircle,
  FileCode,
  Award
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

export function ChallengeHubView() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toast, setToast] = useState(null);

  // Form State for "+ Post New Challenge"
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    category: 'frontend',
    stipend: '$1,000 USD',
    duration: '4 Days',
    tags: 'React, TypeScript, Redux',
    starter_repo: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch challenges on mount
  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges('all');
      setChallenges(data);
    } catch (e) {
      console.error('Failed to load challenges:', e);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Handle Create Challenge
  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.company.trim() || !formData.description.trim()) {
      showNotification('Please fill in title, company, and description.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await challengeService.createChallenge(formData);
      setChallenges((prev) => [created, ...prev]);
      setIsPostModalOpen(false);
      setFormData({
        title: '',
        company: '',
        category: 'frontend',
        stipend: '$1,000 USD',
        duration: '4 Days',
        tags: 'React, TypeScript, Redux',
        starter_repo: '',
        description: ''
      });
      showNotification(`Challenge "${created.title}" posted successfully to database!`);
    } catch (err) {
      showNotification('Failed to post challenge. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Challenge
  const handleDeleteChallenge = async (challengeId, e) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this challenge?')) return;

    try {
      await challengeService.deleteChallenge(challengeId);
      setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
      if (selectedChallenge?.id === challengeId) {
        setSelectedChallenge(null);
      }
      showNotification('Challenge removed successfully.');
    } catch (err) {
      showNotification('Failed to delete challenge.', 'error');
    }
  };

  // Handle Verify Candidate Submission
  const handleVerifySubmission = async (submissionId) => {
    if (!selectedChallenge) return;
    try {
      await challengeService.verifySubmission(selectedChallenge.id, submissionId);
      
      // Update local state
      const updatedChallenges = challenges.map((c) => {
        if (c.id === selectedChallenge.id) {
          const updatedSubs = (c.submissions || []).map((sub) =>
            sub.id === submissionId ? { ...sub, status: 'verified' } : sub
          );
          return {
            ...c,
            verifiedCount: (c.verifiedCount || 0) + 1,
            submissions: updatedSubs
          };
        }
        return c;
      });
      setChallenges(updatedChallenges);

      // Update selected challenge view
      setSelectedChallenge((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          verifiedCount: (prev.verifiedCount || 0) + 1,
          submissions: (prev.submissions || []).map((sub) =>
            sub.id === submissionId ? { ...sub, status: 'verified' } : sub
          )
        };
      });

      showNotification('Candidate submission verified & academic seal stamped!');
    } catch (err) {
      showNotification('Failed to verify submission.', 'error');
    }
  };

  // Filter challenges
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

  // Calculate Metrics
  const totalSubmissions = challenges.reduce((acc, c) => acc + (c.applicants || c.submissions?.length || 0), 0);
  const totalVerified = challenges.reduce((acc, c) => acc + (c.verifiedCount || 0), 0);

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
          {toast.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
          {toast.msg}
        </motion.div>
      )}

      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Briefcase size={24} />
            </div>
            <h1 className="rp-display-l">Micro-Internship & Challenge Hub</h1>
          </div>
          <p className="rp-body-l text-muted-foreground mt-1">
            Post real-world engineering tasks so student candidates prove ability by doing, not just interviewing.
          </p>
        </div>

        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="rp-button-primary shrink-0 px-5 py-2.5 text-sm font-semibold shadow-lg hover:shadow-primary/25 transition-all"
        >
          <Plus size={18} /> Post New Challenge
        </button>
      </header>

      {/* Operations Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Challenges</p>
            <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{challenges.length}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
            <FileCode size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Submissions</p>
            <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{totalSubmissions}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Verified Proof-of-Works</p>
            <p className="text-2xl font-bold font-mono text-foreground mt-0.5">{totalVerified}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            <ShieldCheck size={20} />
          </div>
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
        <div className="flex items-center justify-between">
          <h2 className="rp-heading text-lg">Active Corporate Challenges</h2>
          <span className="rp-meta">Click any challenge card to inspect & verify submissions</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted-foreground">
            <p className="animate-pulse font-medium">Loading challenge ledger from database...</p>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-card/40">
            <Briefcase size={36} className="mx-auto text-muted-foreground mb-3 opacity-60" />
            <p className="text-base font-semibold text-foreground">No challenges found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your category filter or search terms, or post a new challenge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredChallenges.map((item) => {
              const hasVerified = (item.verifiedCount || 0) > 0;

              return (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  onClick={() => setSelectedChallenge(item)}
                  className={`rp-card ${item.tickClass || 'rp-tick-frontend'} cursor-pointer space-y-4 relative flex flex-col justify-between shadow-sm hover:shadow-md hover:border-primary/60 transition-all group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono tracking-wider uppercase text-muted-foreground font-semibold truncate max-w-[170px]">
                        {item.company}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {hasVerified && (
                          <span 
                            className="rp-seal" 
                            title={`${item.verifiedCount} candidate submission(s) verified`}
                          >
                            <Check size={12} />
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteChallenge(item.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 rounded transition-opacity"
                          title="Delete Challenge"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.split(',').slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
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
                        <Users size={12} /> {item.applicants || item.submissions?.length || 0} Submissions
                      </span>
                      <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        Inspect <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Expanded Challenge Inspection Modal with Candidate Submissions & Verification */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedChallenge && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`bg-card border border-border rounded-2xl p-6 md:p-8 max-w-3xl w-full space-y-6 shadow-2xl relative my-8 ${selectedChallenge.tickClass || 'rp-tick-frontend'}`}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedChallenge(null)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>

              {/* Title & Organization */}
              <div className="space-y-2 pr-8">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono tracking-wider uppercase text-primary font-bold">
                    {selectedChallenge.company}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground uppercase">
                    {selectedChallenge.category}
                  </span>
                </div>
                <h2 className="rp-heading text-2xl text-foreground font-bold">{selectedChallenge.title}</h2>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedChallenge.description}
              </p>

              {/* Tags */}
              {selectedChallenge.tags && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                    <Tag size={13} /> Tech Stack:
                  </span>
                  {selectedChallenge.tags.split(',').map((t, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-1 rounded-md bg-muted text-foreground border border-border">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* Specs Bar */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/30 border border-border rounded-xl text-xs">
                <div>
                  <span className="text-muted-foreground block font-medium">Reward Stipend:</span>
                  <span className="font-mono font-bold text-primary text-base">{selectedChallenge.stipend}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Estimated Effort:</span>
                  <span className="font-semibold text-foreground text-sm">{selectedChallenge.duration}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block font-medium">Total Submissions:</span>
                  <span className="font-semibold text-foreground text-sm">
                    {selectedChallenge.applicants || selectedChallenge.submissions?.length || 0} Candidates
                  </span>
                </div>
              </div>

              {/* Starter Repo Link if available */}
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
                    View Spec <ExternalLink size={13} />
                  </a>
                </div>
              )}

              {/* Candidate Submissions & Verification Section */}
              <div className="space-y-4 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Award size={16} className="text-amber-500" />
                    Candidate Submissions & Proof-of-Work
                  </h3>
                  <span className="text-xs font-mono text-muted-foreground">
                    {selectedChallenge.submissions?.length || 0} Submitted Solution(s)
                  </span>
                </div>

                {(!selectedChallenge.submissions || selectedChallenge.submissions.length === 0) ? (
                  <div className="p-6 border border-dashed border-border rounded-xl text-center bg-background/50 space-y-1">
                    <p className="text-sm font-semibold text-foreground">No candidate submissions yet</p>
                    <p className="text-xs text-muted-foreground">
                      Students in the portal are currently reviewing the task. Submissions will appear here in real time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {selectedChallenge.submissions.map((sub) => {
                      const isVerified = sub.status === 'verified';

                      return (
                        <div
                          key={sub.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isVerified
                              ? 'bg-emerald-950/20 border-emerald-600/40'
                              : 'bg-background border-border hover:border-border/80'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <div>
                              <span className="font-bold text-sm text-foreground">{sub.candidate_name}</span>
                              {sub.candidate_school && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  • {sub.candidate_school}
                                </span>
                              )}
                            </div>

                            {/* Verification Button / Badge */}
                            {isVerified ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                                <ShieldCheck size={14} /> Academic Verified & Stamped
                              </div>
                            ) : (
                              <button
                                onClick={() => handleVerifySubmission(sub.id)}
                                className="rp-button-primary text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                              >
                                <ShieldCheck size={14} /> Stamp Verification Seal
                              </button>
                            )}
                          </div>

                          {sub.notes && (
                            <p className="text-xs text-muted-foreground mb-3 leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/50">
                              <strong className="text-foreground font-medium">Candidate Note:</strong> {sub.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                            {sub.repo_url && (
                              <a
                                href={sub.repo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline flex items-center gap-1 font-semibold"
                              >
                                <GithubIcon size={13} /> GitHub Solution <ExternalLink size={11} />
                              </a>
                            )}
                            {sub.demo_url && (
                              <a
                                href={sub.demo_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                              >
                                Live Demo <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-border flex items-center justify-between">
                <button
                  onClick={(e) => handleDeleteChallenge(selectedChallenge.id, e)}
                  className="px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Delete Challenge
                </button>

                <button
                  onClick={() => setSelectedChallenge(null)}
                  className="px-5 py-2 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* Modal: "+ Post New Challenge" (Recruiter Action) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 max-w-xl w-full space-y-6 shadow-2xl relative my-8"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="rp-heading text-xl font-bold flex items-center gap-2">
                    <Plus size={20} className="text-primary" /> Post New Corporate Challenge
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create a proof-of-work engineering challenge for shortlisted candidates.
                  </p>
                </div>
                <button
                  onClick={() => setIsPostModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateChallenge} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Challenge Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Distributed Kafka Log Processing Engine"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Company / Sponsoring Team *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="e.g. Stripe Ecosystem Challenge"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Domain Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="frontend">Frontend & UI</option>
                      <option value="backend">Backend & Infrastructure</option>
                      <option value="data">Data & Scale Engine</option>
                      <option value="ai">AI Research & ML</option>
                      <option value="fullstack">Full-Stack Cloud</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Bounty / Stipend
                    </label>
                    <input
                      type="text"
                      value={formData.stipend}
                      onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                      placeholder="e.g. $1,000 USD"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Estimated Duration
                    </label>
                    <input
                      type="text"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 4 Days or 1 Week"
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Required Tech Stack (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g. Go, Redis, Docker, gRPC"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Starter Specification / Repository Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.starter_repo}
                    onChange={(e) => setFormData({ ...formData, starter_repo: e.target.value })}
                    placeholder="https://github.com/company/spec-repo"
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Problem Brief & Evaluation Criteria *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Explain the real-world engineering challenge, functional requirements, and what candidates must demonstrate..."
                    className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsPostModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rp-button-primary text-xs py-2 px-5 font-semibold"
                  >
                    {isSubmitting ? 'Posting to DB...' : 'Post Challenge'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
