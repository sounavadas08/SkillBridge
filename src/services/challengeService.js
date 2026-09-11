// ============================================================================
// SkillBridge Challenge & Micro-Internship Service
// Dual-layer persistence: FastAPI + SQLite with offline localStorage fallback
// ============================================================================

const STORAGE_KEY_CHALLENGES = 'skillbridge_corporate_challenges_v1';
const STORAGE_KEY_SUBMISSIONS = 'skillbridge_challenge_submissions_v1';

export const INITIAL_CHALLENGES = [
  {
    id: 1,
    category: 'frontend',
    tickClass: 'rp-tick-frontend',
    title: 'High-Performance Virtualized Table Component',
    company: 'Stripe Ecosystem Challenge',
    stipend: '$750 USD',
    duration: '3 Days',
    applicants: 18,
    status: 'Active Submissions',
    description: 'Build a zero-dependency React virtualized list table handling 100,000 items with 60fps scrolling and keyboard navigation.',
    tags: 'React, TypeScript, Virtualization, Performance',
    starter_repo: 'https://github.com/skillbridge/virtual-table-spec',
    verifiedCount: 4,
    submissions: [
      {
        id: 101,
        challenge_id: 1,
        candidate_name: 'Alex Chen',
        candidate_school: 'Stanford University',
        repo_url: 'https://github.com/alexchen/react-virtual-grid-60fps',
        demo_url: 'https://react-virtual-grid-preview.vercel.app',
        notes: 'Built using custom binary search row offset calculation, zero DOM layout thrashing, and dynamic item height caching.',
        status: 'verified',
        submitted_at: '2026-09-08T14:30:00Z'
      },
      {
        id: 102,
        challenge_id: 1,
        candidate_name: 'David Miller',
        candidate_school: 'Stanford University',
        repo_url: 'https://github.com/davidmiller/virtual-table-stripe',
        demo_url: 'https://davidm-table.dev',
        notes: 'Complete with keyboard navigation (arrow keys, PgUp/PgDn) and virtualized column pinning.',
        status: 'submitted',
        submitted_at: '2026-09-09T18:15:00Z'
      }
    ]
  },
  {
    id: 2,
    category: 'backend',
    tickClass: 'rp-tick-backend',
    title: 'Distributed Transaction Rate Limiter',
    company: 'Fintech Infrastructure',
    stipend: '$1,200 USD',
    duration: '5 Days',
    applicants: 12,
    status: 'Active Submissions',
    description: 'Implement a token-bucket rate-limiting middleware in Node.js/Go backed by Redis sliding logs with failure fallback.',
    tags: 'Go, Redis, Rate Limiting, Microservices',
    starter_repo: 'https://github.com/skillbridge/rate-limiter-starter',
    verifiedCount: 2,
    submissions: [
      {
        id: 201,
        challenge_id: 2,
        candidate_name: 'Sarah Jenkins',
        candidate_school: 'MIT',
        repo_url: 'https://github.com/sarahj/redis-sliding-window-limiter',
        demo_url: '',
        notes: 'Redis Lua script execution ensuring atomic sliding window calculations with memory ring buffer fallback.',
        status: 'verified',
        submitted_at: '2026-09-07T11:00:00Z'
      }
    ]
  },
  {
    id: 3,
    category: 'data',
    tickClass: 'rp-tick-data',
    title: 'PostgreSQL Query Execution Profiler',
    company: 'Data Scale Engine',
    stipend: '$900 USD',
    duration: '4 Days',
    applicants: 15,
    status: 'Active Submissions',
    description: 'Construct an automated SQL query analysis script identifying unindexed joins, high sequential scans, and index suggestions.',
    tags: 'PostgreSQL, SQL Tuning, Python, Query Optimization',
    starter_repo: 'https://github.com/skillbridge/pg-query-profiler',
    verifiedCount: 5,
    submissions: []
  },
  {
    id: 4,
    category: 'ai',
    tickClass: 'rp-tick-ai',
    title: 'RAG Pipeline Vector Search Evaluator',
    company: 'AI Research Hub',
    stipend: '$1,500 USD',
    duration: '1 Week',
    status: 'Active Submissions',
    description: 'Build an evaluation benchmark suite measuring context retrieval precision and recall across 500 embedding queries.',
    tags: 'Python, Vector Search, Embeddings, RAG, Benchmarking',
    starter_repo: 'https://github.com/skillbridge/rag-eval-benchmark',
    verifiedCount: 7,
    submissions: []
  }
];

function getStoredChallenges() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHALLENGES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed reading challenges from localStorage:', e);
  }
  return INITIAL_CHALLENGES;
}

function saveStoredChallenges(challenges) {
  try {
    localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(challenges));
  } catch (e) {
    console.warn('Failed writing challenges to localStorage:', e);
  }
}

export const challengeService = {
  // 1. Fetch all challenges
  async getChallenges(category = 'all') {
    try {
      const query = category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
      const res = await fetch(`/api/challenges${query}`);
      if (res.ok) {
        const data = await res.json();
        // Normalize backend fields for frontend consumption
        const formatted = data.map(item => ({
          ...item,
          tickClass: item.tick_class || 'rp-tick-frontend',
          applicants: item.applicants_count ?? item.applicants ?? 0,
          verifiedCount: item.verified_count ?? 0,
          submissions: item.submissions || []
        }));
        saveStoredChallenges(formatted);
        return formatted;
      }
    } catch (e) {
      // Backend not running or offline
    }

    const local = getStoredChallenges();
    if (!category || category === 'all') return local;
    return local.filter(c => c.category?.toLowerCase() === category.toLowerCase());
  },

  // 2. Create new challenge (Recruiter)
  async createChallenge(challengeData) {
    const tickMap = {
      frontend: 'rp-tick-frontend',
      backend: 'rp-tick-backend',
      data: 'rp-tick-data',
      ai: 'rp-tick-ai',
      fullstack: 'rp-tick-frontend',
      cloud: 'rp-tick-backend'
    };

    const tickClass = challengeData.tickClass || tickMap[challengeData.category?.toLowerCase()] || 'rp-tick-frontend';

    const payload = {
      title: challengeData.title,
      company: challengeData.company,
      category: challengeData.category || 'frontend',
      tick_class: tickClass,
      stipend: challengeData.stipend || '$500 USD',
      duration: challengeData.duration || '3 Days',
      status: challengeData.status || 'Active Submissions',
      description: challengeData.description || '',
      tags: challengeData.tags || '',
      starter_repo: challengeData.starter_repo || ''
    };

    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const created = await res.json();
        const formatted = {
          ...created,
          tickClass: created.tick_class || tickClass,
          applicants: created.applicants_count || 0,
          verifiedCount: created.verified_count || 0,
          submissions: []
        };
        const current = getStoredChallenges();
        saveStoredChallenges([formatted, ...current]);
        return formatted;
      }
    } catch (e) {
      // Fallback
    }

    const local = getStoredChallenges();
    const newId = Date.now();
    const fallbackItem = {
      id: newId,
      ...payload,
      tickClass,
      applicants: 0,
      verifiedCount: 0,
      submissions: []
    };
    const updated = [fallbackItem, ...local];
    saveStoredChallenges(updated);
    return fallbackItem;
  },

  // 3. Delete challenge
  async deleteChallenge(id) {
    try {
      const res = await fetch(`/api/challenges/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const current = getStoredChallenges();
        const updated = current.filter(c => c.id !== id);
        saveStoredChallenges(updated);
        return true;
      }
    } catch (e) {
      // Fallback
    }

    const current = getStoredChallenges();
    const updated = current.filter(c => c.id !== id);
    saveStoredChallenges(updated);
    return true;
  },

  // 4. Candidate submit solution
  async submitSolution(challengeId, submissionData) {
    const payload = {
      candidate_name: submissionData.candidate_name,
      candidate_email: submissionData.candidate_email || null,
      candidate_school: submissionData.candidate_school || null,
      repo_url: submissionData.repo_url,
      demo_url: submissionData.demo_url || null,
      notes: submissionData.notes || ''
    };

    try {
      const res = await fetch(`/api/challenges/${challengeId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const createdSub = await res.json();
        // Update local cache
        const current = getStoredChallenges();
        const updated = current.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              applicants: (c.applicants || 0) + 1,
              submissions: [...(c.submissions || []), createdSub]
            };
          }
          return c;
        });
        saveStoredChallenges(updated);
        return createdSub;
      }
    } catch (e) {
      // Fallback
    }

    // Local fallback
    const current = getStoredChallenges();
    const subId = Date.now();
    const fallbackSub = {
      id: subId,
      challenge_id: challengeId,
      ...payload,
      status: 'submitted',
      submitted_at: new Date().toISOString()
    };
    const updated = current.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          applicants: (c.applicants || 0) + 1,
          submissions: [...(c.submissions || []), fallbackSub]
        };
      }
      return c;
    });
    saveStoredChallenges(updated);
    return fallbackSub;
  },

  // 5. Recruiter verify and stamp a candidate submission
  async verifySubmission(challengeId, submissionId) {
    try {
      const res = await fetch(`/api/challenges/submissions/${submissionId}/verify`, {
        method: 'PUT'
      });
      if (res.ok) {
        const verified = await res.json();
        const current = getStoredChallenges();
        const updated = current.map(c => {
          if (c.id === challengeId) {
            return {
              ...c,
              verifiedCount: (c.verifiedCount || 0) + 1,
              submissions: (c.submissions || []).map(s => s.id === submissionId ? { ...s, status: 'verified' } : s)
            };
          }
          return c;
        });
        saveStoredChallenges(updated);
        return verified;
      }
    } catch (e) {
      // Fallback
    }

    const current = getStoredChallenges();
    const updated = current.map(c => {
      if (c.id === challengeId) {
        return {
          ...c,
          verifiedCount: (c.verifiedCount || 0) + 1,
          submissions: (c.submissions || []).map(s => s.id === submissionId ? { ...s, status: 'verified' } : s)
        };
      }
      return c;
    });
    saveStoredChallenges(updated);
    return { id: submissionId, status: 'verified' };
  }
};
