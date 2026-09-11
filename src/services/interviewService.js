// ============================================================================
// SkillBridge Interview Scheduling Service
// Dual-layer persistence: FastAPI + SQLite with offline localStorage fallback
// ============================================================================

const STORAGE_KEY = 'skillbridge_interview_ledger_v1';

export const INITIAL_INTERVIEW_SLOTS = [
  {
    id: 1,
    day: 'Mon',
    date: 'Sep 14',
    time: '10:00 AM',
    status: 'available',
    candidate_name: null,
    candidate_school: null,
    interviewer: 'Engineering Panel',
    round_type: 'Technical Coding',
    notes: 'Open slot for shortlisted candidate.'
  },
  {
    id: 2,
    day: 'Mon',
    date: 'Sep 14',
    time: '02:00 PM',
    status: 'confirmed',
    candidate_name: 'Alex Chen',
    candidate_school: 'Stanford University',
    interviewer: 'Dr. Aris Vance (Lead Architect)',
    round_type: 'System Architecture',
    notes: 'Distributed state synchronization and high-throughput evaluation.'
  },
  {
    id: 3,
    day: 'Tue',
    date: 'Sep 15',
    time: '11:30 AM',
    status: 'confirmed',
    candidate_name: 'Sarah Jenkins',
    candidate_school: 'MIT',
    interviewer: 'Kavita Rao (Staff DB Engineer)',
    round_type: 'Technical Coding',
    notes: 'Async database optimization and concurrent transaction deep dive.'
  },
  {
    id: 4,
    day: 'Tue',
    date: 'Sep 15',
    time: '03:30 PM',
    status: 'confirmed',
    candidate_name: 'David Miller (Stanford Senior)',
    candidate_school: 'Stanford University',
    interviewer: 'Marcus Brody (VP of Engineering)',
    round_type: 'System Architecture',
    notes: 'Compiler optimization & WebGL GPU rendering pipeline.'
  },
  {
    id: 5,
    day: 'Wed',
    date: 'Sep 16',
    time: '09:00 AM',
    status: 'available',
    candidate_name: null,
    candidate_school: null,
    interviewer: 'Engineering Panel',
    round_type: 'Technical Coding',
    notes: 'Morning slot for algorithmic problem solving.'
  },
  {
    id: 6,
    day: 'Wed',
    date: 'Sep 16',
    time: '01:00 PM',
    status: 'available',
    candidate_name: null,
    candidate_school: null,
    interviewer: 'Engineering Panel',
    round_type: 'Behavioral & Culture',
    notes: 'Team fit, cross-functional collaboration, and ownership.'
  },
  {
    id: 7,
    day: 'Thu',
    date: 'Sep 17',
    time: '10:30 AM',
    status: 'confirmed',
    candidate_name: 'Marcus Vance',
    candidate_school: 'UC Berkeley',
    interviewer: 'Elena Gilbert (Design Tech Lead)',
    round_type: 'Behavioral & Culture',
    notes: 'Component architecture, design systems & team collaboration.'
  },
  {
    id: 8,
    day: 'Thu',
    date: 'Sep 17',
    time: '04:00 PM',
    status: 'available',
    candidate_name: null,
    candidate_school: null,
    interviewer: 'Engineering Panel',
    round_type: 'Technical Coding',
    notes: 'Late afternoon technical evaluation slot.'
  },
  {
    id: 9,
    day: 'Fri',
    date: 'Sep 18',
    time: '02:30 PM',
    status: 'available',
    candidate_name: null,
    candidate_school: null,
    interviewer: 'Talent Operations',
    round_type: 'Executive Review',
    notes: 'Final wrap-up and offer formulation discussion.'
  }
];

// Helper to read cached slots from localStorage
function getLocalSlots() {
  if (typeof window === 'undefined') return INITIAL_INTERVIEW_SLOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_INTERVIEW_SLOTS));
      return INITIAL_INTERVIEW_SLOTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to read local interview slots:', err);
    return INITIAL_INTERVIEW_SLOTS;
  }
}

// Helper to save slots to localStorage
function saveLocalSlots(slots) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
  } catch (err) {
    console.warn('Failed to persist interview slots to localStorage:', err);
  }
}

/**
 * Fetches all interview slots from backend database, with automatic local fallback
 */
export async function fetchInterviewSlots() {
  try {
    const res = await fetch('/api/interviews', {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveLocalSlots(data);
        return data;
      }
    }
  } catch (err) {
    // Backend offline or running in Vercel static serverless mode
  }
  return getLocalSlots();
}

/**
 * Creates a new interview slot in DB and updates local storage
 */
export async function createInterviewSlot(slotPayload) {
  const localList = getLocalSlots();
  const tempId = Date.now();
  const newLocalItem = {
    id: tempId,
    status: 'available',
    interviewer: 'Engineering Panel',
    round_type: 'Technical Coding',
    candidate_name: null,
    candidate_school: null,
    notes: '',
    ...slotPayload
  };

  try {
    const res = await fetch('/api/interviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slotPayload)
    });
    if (res.ok) {
      const created = await res.json();
      const updated = [...localList, created];
      saveLocalSlots(updated);
      return created;
    }
  } catch (err) {
    // Backend offline - use local item
  }

  const updated = [...localList, newLocalItem];
  saveLocalSlots(updated);
  return newLocalItem;
}

/**
 * Updates an interview slot in DB and updates local storage
 */
export async function updateInterviewSlot(slotId, updatePayload) {
  const localList = getLocalSlots();
  const updatedLocal = localList.map(item => {
    if (item.id === slotId) {
      return { ...item, ...updatePayload };
    }
    return item;
  });
  saveLocalSlots(updatedLocal);

  try {
    const res = await fetch(`/api/interviews/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    if (res.ok) {
      const serverUpdated = await res.json();
      const synced = updatedLocal.map(item => item.id === slotId ? serverUpdated : item);
      saveLocalSlots(synced);
      return serverUpdated;
    }
  } catch (err) {
    // Backend offline - local update was already saved
  }

  return updatedLocal.find(item => item.id === slotId);
}

/**
 * Deletes an interview slot from DB and local storage
 */
export async function deleteInterviewSlot(slotId) {
  const localList = getLocalSlots();
  const filtered = localList.filter(item => item.id !== slotId);
  saveLocalSlots(filtered);

  try {
    await fetch(`/api/interviews/${slotId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    // Backend offline
  }

  return filtered;
}
