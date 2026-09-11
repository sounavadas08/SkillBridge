import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, Check, User, Plus, ShieldCheck, 
  Search, Filter, Download, Trash2, CheckCircle2, RotateCcw, 
  BarChart3, PieChart, TrendingUp, X, FileText, UserPlus, AlertCircle
} from 'lucide-react';
import { 
  fetchInterviewSlots, 
  createInterviewSlot, 
  updateInterviewSlot, 
  deleteInterviewSlot 
} from '../../../services/interviewService';
import { useToast } from '../../../context/ToastContext';

const SHORTLISTED_CANDIDATES = [
  { name: 'David Miller (Stanford Senior)', school: 'Stanford University', degree: 'B.S. CS' },
  { name: 'Elena Rostova (MIT AI)', school: 'MIT', degree: 'M.S. EECS' },
  { name: 'Priya Sharma (Berkeley CS)', school: 'UC Berkeley', degree: 'B.S. EECS' },
  { name: 'Alex Chen', school: 'Stanford University', degree: 'B.S. CS' },
  { name: 'Sarah Jenkins', school: 'MIT', degree: 'M.S. EECS' }
];

const ROUND_TYPES = [
  { label: 'Technical Coding', color: '#3B82F6', className: 'rp-stage-badge-coding' },
  { label: 'System Architecture', color: '#FF8100', className: 'rp-stage-badge-arch' },
  { label: 'Behavioral & Culture', color: '#8B5CF6', className: 'rp-stage-badge-behavioral' },
  { label: 'Executive Review', color: '#DC143C', className: 'rp-stage-badge-executive' }
];

const DEFAULT_DAYS = [
  { day: 'Mon', date: 'Sep 14' },
  { day: 'Tue', date: 'Sep 15' },
  { day: 'Wed', date: 'Sep 16' },
  { day: 'Thu', date: 'Sep 17' },
  { day: 'Fri', date: 'Sep 18' }
];

export function InterviewSchedulerView() {
  const { showToast } = useToast();
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(SHORTLISTED_CANDIDATES[0]);

  // Modals & Popovers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSlotAction, setActiveSlotAction] = useState(null);

  // New Slot Form State
  const [newSlotDay, setNewSlotDay] = useState('Mon');
  const [newSlotDate, setNewSlotDate] = useState('Sep 14');
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  const [newSlotRound, setNewSlotRound] = useState('Technical Coding');
  const [newSlotInterviewer, setNewSlotInterviewer] = useState('Engineering Panel');
  const [newSlotNotes, setNewSlotNotes] = useState('');

  // Table Filters & Search
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all'); // all, confirmed, available, completed
  const [tableRoundFilter, setTableRoundFilter] = useState('all');

  // Load initial slots from DB / Service
  useEffect(() => {
    async function loadSlots() {
      setLoading(true);
      try {
        const data = await fetchInterviewSlots();
        setSlots(data);
      } catch (err) {
        console.error('Error fetching interview slots:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSlots();
  }, []);

  // Synchronize day selection with date
  const handleDaySelect = (dayStr) => {
    setNewSlotDay(dayStr);
    const match = DEFAULT_DAYS.find(d => d.day === dayStr);
    if (match) setNewSlotDate(match.date);
  };

  // Helper to get stage badge class
  const getStageClass = (roundName) => {
    const found = ROUND_TYPES.find(r => r.label === roundName);
    return found ? found.className : 'rp-stage-badge-coding';
  };

  // 1. Booking an Available Slot
  const handleBookSlot = async (slot) => {
    if (slot.status !== 'available') return;
    try {
      const updated = await updateInterviewSlot(slot.id, {
        status: 'confirmed',
        candidate_name: selectedCandidate.name,
        candidate_school: selectedCandidate.school,
        notes: `Interview booked with ${selectedCandidate.name} for ${slot.round_type}.`
      });

      setSlots(prev => prev.map(s => s.id === slot.id ? updated : s));
      showToast(`Interview confirmed with ${selectedCandidate.name}!`, 'success');
    } catch (err) {
      showToast('Failed to confirm interview slot.', 'error');
    }
  };

  // 2. Creating an Open Slot via Modal
  const handleCreateSlotSubmit = async (e) => {
    e.preventDefault();
    try {
      const created = await createInterviewSlot({
        day: newSlotDay,
        date: newSlotDate,
        time: newSlotTime,
        status: 'available',
        round_type: newSlotRound,
        interviewer: newSlotInterviewer,
        notes: newSlotNotes || 'Open interview slot for candidate scheduling.'
      });

      setSlots(prev => [...prev, created]);
      setIsAddModalOpen(false);
      setNewSlotNotes('');
      showToast(`Added open slot for ${newSlotDay} ${newSlotTime}!`, 'success');
    } catch (err) {
      showToast('Failed to create interview slot.', 'error');
    }
  };

  // 3. Slot Action Handlers (Complete, Cancel, Delete)
  const handleMarkCompleted = async (slotId) => {
    try {
      const updated = await updateInterviewSlot(slotId, { status: 'completed' });
      setSlots(prev => prev.map(s => s.id === slotId ? updated : s));
      setActiveSlotAction(null);
      showToast('Interview marked as completed! Metrics updated.', 'success');
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleCancelBooking = async (slotId) => {
    try {
      const updated = await updateInterviewSlot(slotId, {
        status: 'available',
        candidate_name: null,
        candidate_school: null,
        notes: 'Slot made available again after cancellation.'
      });
      setSlots(prev => prev.map(s => s.id === slotId ? updated : s));
      setActiveSlotAction(null);
      showToast('Interview booking released. Slot is now available.', 'success');
    } catch (err) {
      showToast('Failed to release slot.', 'error');
    }
  };

  const handleDeleteSlot = async (slotId) => {
    try {
      await deleteInterviewSlot(slotId);
      setSlots(prev => prev.filter(s => s.id !== slotId));
      setActiveSlotAction(null);
      showToast('Slot removed from database ledger.', 'success');
    } catch (err) {
      showToast('Failed to delete slot.', 'error');
    }
  };

  // 4. Export CSV of Ledger
  const handleExportCSV = () => {
    const headers = ['ID', 'Day', 'Date', 'Time', 'Status', 'Candidate', 'School', 'Round', 'Interviewer', 'Notes'];
    const rows = slots.map(s => [
      s.id,
      s.day,
      s.date,
      s.time,
      s.status,
      s.candidate_name || 'N/A',
      s.candidate_school || 'N/A',
      s.round_type || 'N/A',
      s.interviewer || 'N/A',
      `"${(s.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `skillbridge_interview_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Interview ledger exported to CSV.', 'success');
  };

  // Group slots by day for week calendar grid
  const daysWithSlots = useMemo(() => {
    const dayMap = {};
    DEFAULT_DAYS.forEach(d => {
      dayMap[d.day] = { ...d, slots: [] };
    });

    slots.forEach(slot => {
      if (dayMap[slot.day]) {
        dayMap[slot.day].slots.push(slot);
      } else {
        dayMap[slot.day] = { day: slot.day, date: slot.date, slots: [slot] };
      }
    });

    return Object.values(dayMap);
  }, [slots]);

  // Analytics Metrics Computation
  const metrics = useMemo(() => {
    const total = slots.length;
    const confirmed = slots.filter(s => s.status === 'confirmed').length;
    const completed = slots.filter(s => s.status === 'completed').length;
    const available = slots.filter(s => s.status === 'available').length;
    const utilization = total > 0 ? Math.round(((confirmed + completed) / total) * 100) : 0;

    // Day-by-day capacity for bar chart
    const dayStats = DEFAULT_DAYS.map(d => {
      const daySlots = slots.filter(s => s.day === d.day);
      const dayConfirmed = daySlots.filter(s => s.status === 'confirmed' || s.status === 'completed').length;
      return {
        day: d.day,
        total: daySlots.length,
        confirmed: dayConfirmed,
        rate: daySlots.length > 0 ? Math.round((dayConfirmed / daySlots.length) * 100) : 0
      };
    });

    // Round distribution for donut chart
    const roundCounts = {};
    ROUND_TYPES.forEach(r => { roundCounts[r.label] = 0; });
    slots.forEach(s => {
      if (roundCounts[s.round_type] !== undefined) {
        roundCounts[s.round_type]++;
      } else {
        roundCounts['Technical Coding']++;
      }
    });

    return { total, confirmed, completed, available, utilization, dayStats, roundCounts };
  }, [slots]);

  // Filtered Table Rows
  const filteredTableSlots = useMemo(() => {
    return slots.filter(slot => {
      const matchesSearch = !tableSearch.trim() || 
        (slot.candidate_name && slot.candidate_name.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (slot.candidate_school && slot.candidate_school.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (slot.interviewer && slot.interviewer.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (slot.round_type && slot.round_type.toLowerCase().includes(tableSearch.toLowerCase())) ||
        (slot.time && slot.time.toLowerCase().includes(tableSearch.toLowerCase()));

      const matchesStatus = tableStatusFilter === 'all' || slot.status === tableStatusFilter;
      const matchesRound = tableRoundFilter === 'all' || slot.round_type === tableRoundFilter;

      return matchesSearch && matchesStatus && matchesRound;
    });
  }, [slots, tableSearch, tableStatusFilter, tableRoundFilter]);

  return (
    <div className="space-y-12 pb-24 max-w-7xl mx-auto">
      {/* Header with Title & Add Slot Button */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary shadow-sm">
              <Calendar size={22} />
            </div>
            <h1 className="rp-display-l text-2xl sm:text-3xl font-bold">Automated Interview Scheduler</h1>
          </div>
          <p className="rp-body-l text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed max-w-2xl">
            Ledger-style calendar sync that eliminates back-and-forth scheduling once candidates are shortlisted.
          </p>
        </div>

        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="rp-button-primary shrink-0 self-start sm:self-auto cursor-pointer py-3 px-5 text-sm font-semibold flex items-center gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={19} /> Add Open Interview Slot
        </button>
      </header>

      {/* Shortlisted Candidates Selection Strip */}
      <div className="rp-card p-5 space-y-3.5 shadow-sm border-border/90 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
            Select Shortlisted Candidate to Schedule:
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            Active: <strong className="text-primary text-sm">{selectedCandidate.name}</strong>
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2.5 pt-1">
          {SHORTLISTED_CANDIDATES.map((cand, i) => {
            const isSelected = selectedCandidate.name === cand.name;
            return (
              <button
                key={i}
                onClick={() => setSelectedCandidate(cand)}
                className={`text-sm font-medium px-4 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected 
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]' 
                    : 'bg-background hover:bg-muted text-foreground border-border hover:border-primary/40'
                }`}
              >
                <span className="font-semibold">+ {cand.name}</span>
                <span className="text-xs opacity-75 font-normal">({cand.school})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Ledger-Style Week Calendar Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Clock size={18} className="text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Weekly Schedule & Live Slots</h2>
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground font-mono font-medium">
            {metrics.confirmed} Confirmed • {metrics.available} Available Slots
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 sm:gap-5">
          {daysWithSlots.map((dayObj, dayIdx) => (
            <div key={dayIdx} className="rp-card p-4 sm:p-5 space-y-4 shadow-sm border-border/80 hover:border-border transition-all rounded-2xl">
              <div className="border-b border-border pb-2.5 text-center">
                <span className="font-bold text-base sm:text-lg text-foreground block">{dayObj.day}</span>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{dayObj.date}</span>
              </div>

              <div className="space-y-3">
                {dayObj.slots.length === 0 ? (
                  <div className="py-8 text-center text-xs text-muted-foreground font-mono">
                    No slots scheduled
                  </div>
                ) : (
                  dayObj.slots.map((slot, slotIdx) => {
                    const isConfirmed = slot.status === 'confirmed';
                    const isCompleted = slot.status === 'completed';

                    return (
                      <motion.div
                        key={slot.id || slotIdx}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => {
                          if (slot.status === 'available') {
                            handleBookSlot(slot);
                          } else {
                            setActiveSlotAction(slot);
                          }
                        }}
                        className={`rp-calendar-slot cursor-pointer relative group p-3.5 rounded-xl ${
                          isConfirmed ? 'active' : isCompleted ? 'border-blue-500/40 bg-blue-500/5' : ''
                        }`}
                        title={isConfirmed ? "Click to manage this booking" : "Click to book with selected candidate"}
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
                          <span className="font-mono font-bold text-foreground flex items-center gap-1.5">
                            <Clock size={13} className="text-primary" /> {slot.time}
                          </span>

                          {isConfirmed && (
                            <motion.span
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className="rp-seal size-5"
                            >
                              <Check size={13} />
                            </motion.span>
                          )}

                          {isCompleted && (
                            <span className="text-blue-500 text-sm flex items-center gap-1">
                              <CheckCircle2 size={15} />
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm">
                          {isConfirmed ? (
                            <div className="space-y-1">
                              <span className="font-bold text-foreground block truncate text-sm">{slot.candidate_name}</span>
                              <div className="flex items-center justify-between gap-1 pt-0.5">
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                                  Confirmed
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate max-w-[95px] font-mono">
                                  {slot.round_type}
                                </span>
                              </div>
                            </div>
                          ) : isCompleted ? (
                            <div>
                              <span className="font-bold text-foreground block truncate text-sm">{slot.candidate_name}</span>
                              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                Completed & Dossier Saved
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between py-1">
                              <span className="text-muted-foreground group-hover:text-primary font-semibold text-xs transition-colors">
                                + Click to Book
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                {slot.round_type}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================
          SECTION 2: Interview Intelligence & Real-Time Analytics (KPIs + SVG Charts)
          ==================================================================== */}
      <section className="space-y-6 pt-3">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <BarChart3 size={20} className="text-primary" />
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Interview Operations & Intelligence</h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Database Analytics Live Feed</span>
        </div>

        {/* 4 Summary KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="rp-card p-5 border-border/80 flex items-center justify-between rounded-2xl shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Scheduled Slots</span>
              <span className="text-3xl font-mono font-extrabold text-foreground block mt-1.5">
                {metrics.total}
              </span>
              <span className="text-xs text-muted-foreground font-mono mt-1 block">
                Across 5 Operating Days
              </span>
            </div>
            <div className="size-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Calendar size={22} />
            </div>
          </div>

          <div className="rp-card p-5 border-border/80 flex items-center justify-between rounded-2xl shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Slot Utilization Rate</span>
              <span className="text-3xl font-mono font-extrabold text-primary block mt-1.5">
                {metrics.utilization}%
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block flex items-center gap-1">
                <TrendingUp size={12} /> +14% vs. last cohort
              </span>
            </div>
            <div className="size-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={22} />
            </div>
          </div>

          <div className="rp-card p-5 border-border/80 flex items-center justify-between rounded-2xl shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Completed Interviews</span>
              <span className="text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400 block mt-1.5">
                {metrics.completed}
              </span>
              <span className="text-xs text-muted-foreground font-mono mt-1 block">
                Verified candidate dossiers
              </span>
            </div>
            <div className="size-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck size={22} />
            </div>
          </div>

          <div className="rp-card p-5 border-border/80 flex items-center justify-between rounded-2xl shadow-xs">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Open Slots</span>
              <span className="text-3xl font-mono font-extrabold text-foreground block mt-1.5">
                {metrics.available}
              </span>
              <span className="text-xs text-muted-foreground font-mono mt-1 block">
                Ready for candidate claim
              </span>
            </div>
            <div className="size-12 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
              <Clock size={22} />
            </div>
          </div>
        </div>

        {/* 2 Pure SVG Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Weekly Slot Capacity Bar Chart */}
          <div className="lg:col-span-7 rp-card p-6 space-y-4 rounded-2xl shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-3.5 gap-2">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground">Weekly Capacity & Slot Utilization</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Total slots created vs. confirmed candidate bookings by day</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 font-medium"><span className="size-3 rounded-sm bg-primary" /> Confirmed</span>
                <span className="flex items-center gap-1.5 font-medium"><span className="size-3 rounded-sm bg-border" /> Open Slot</span>
              </div>
            </div>

            {/* SVG Bar Chart */}
            <div className="h-64 w-full flex items-end justify-between pt-6 px-3 pb-2">
              {metrics.dayStats.map((item, idx) => {
                const maxVal = Math.max(...metrics.dayStats.map(d => d.total), 4);
                const barHeightPct = (item.total / maxVal) * 100;
                const confirmedHeightPct = item.total > 0 ? (item.confirmed / item.total) * 100 : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group cursor-default">
                    <span className="text-xs font-mono font-semibold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.confirmed}/{item.total}
                    </span>
                    
                    <div 
                      className="w-12 sm:w-16 rounded-t-xl bg-muted border border-border relative overflow-hidden flex flex-col justify-end transition-all group-hover:border-primary/60 shadow-xs"
                      style={{ height: `${Math.max(barHeightPct, 18)}%` }}
                    >
                      <div 
                        className="w-full bg-gradient-to-t from-[#DC143C] to-[#FF8100] transition-all duration-500 rounded-t-sm"
                        style={{ height: `${confirmedHeightPct}%` }}
                      />
                    </div>

                    <span className="font-bold text-sm text-foreground mt-1">{item.day}</span>
                    <span className="text-xs font-mono text-primary font-bold">{item.rate}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Round Distribution Donut / Radial Chart */}
          <div className="lg:col-span-5 rp-card p-6 space-y-5 rounded-2xl shadow-xs flex flex-col justify-between">
            <div className="border-b border-border pb-3.5">
              <h3 className="font-bold text-base sm:text-lg text-foreground">Interview Stage Distribution</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Breakdown of technical, architecture, and behavioral rounds</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-3">
              {/* SVG Donut Chart */}
              <div className="relative size-40 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  {/* Background Circle */}
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="currentColor" strokeWidth="13" className="text-muted/40" />
                  
                  {/* Dynamic Arc Segments */}
                  {(() => {
                    const totalRounds = Object.values(metrics.roundCounts).reduce((a, b) => a + b, 0) || 1;
                    let accumulated = 0;

                    return ROUND_TYPES.map((round, rIdx) => {
                      const count = metrics.roundCounts[round.label] || 0;
                      const pct = count / totalRounds;
                      const circumference = 2 * Math.PI * 38;
                      const strokeDasharray = `${pct * circumference} ${circumference}`;
                      const strokeDashoffset = -accumulated * circumference;
                      accumulated += pct;

                      return (
                        <circle
                          key={rIdx}
                          cx="50"
                          cy="50"
                          r="38"
                          fill="transparent"
                          stroke={round.color}
                          strokeWidth="13"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                        />
                      );
                    });
                  })()}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-mono font-bold text-foreground">{metrics.total}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase font-semibold">Rounds</span>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2.5 text-xs sm:text-sm w-full sm:w-auto">
                {ROUND_TYPES.map((round, idx) => {
                  const count = metrics.roundCounts[round.label] || 0;
                  const total = metrics.total || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={idx} className="flex items-center justify-between sm:justify-start gap-3">
                      <div className="flex items-center gap-2">
                        <span className="size-3 rounded-full shrink-0" style={{ backgroundColor: round.color }} />
                        <span className="text-muted-foreground font-medium text-xs sm:text-sm truncate max-w-[130px]">{round.label}</span>
                      </div>
                      <span className="font-mono font-bold text-foreground text-xs sm:text-sm">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Turnaround speed pill */}
            <div className="bg-muted/70 border border-border/90 rounded-xl p-3 flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <TrendingUp size={16} className="text-primary" />
                <span>Sync Turnaround:</span>
              </div>
              <span className="font-mono font-bold text-primary">2.4 Days Avg (82% faster)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: Live Interview Ledger & Audit Table
          ==================================================================== */}
      <section className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-border/80 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-foreground">Interview Audit Ledger</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Comprehensive database records for all candidate interview milestones</p>
          </div>

          <button
            onClick={handleExportCSV}
            className="rp-button-secondary text-xs sm:text-sm py-2 px-4 self-start sm:self-auto cursor-pointer font-semibold flex items-center gap-2 rounded-xl"
          >
            <Download size={15} /> Export Ledger CSV
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1.5 rounded-xl border border-border overflow-x-auto">
            {[
              { key: 'all', label: `All (${metrics.total})` },
              { key: 'confirmed', label: `Confirmed (${metrics.confirmed})` },
              { key: 'available', label: `Open Slots (${metrics.available})` },
              { key: 'completed', label: `Completed (${metrics.completed})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setTableStatusFilter(tab.key)}
                className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  tableStatusFilter === tab.key 
                    ? 'bg-card text-foreground shadow-xs font-bold' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Stage Filter Dropdown */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3.5 top-3 text-muted-foreground" size={15} />
              <input
                type="text"
                value={tableSearch}
                onChange={e => setTableSearch(e.target.value)}
                placeholder="Search candidate, school, interviewer..."
                className="w-full bg-background border border-border rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <select
              value={tableRoundFilter}
              onChange={e => setTableRoundFilter(e.target.value)}
              className="bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary transition-colors cursor-pointer"
            >
              <option value="all">All Stages</option>
              {ROUND_TYPES.map((r, i) => (
                <option key={i} value={r.label}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="rp-ledger-table-container">
          <table className="rp-ledger-table">
            <thead>
              <tr>
                <th className="min-w-[240px]">Candidate / Slot</th>
                <th className="min-w-[140px] whitespace-nowrap">Day & Time</th>
                <th className="min-w-[190px] whitespace-nowrap">Interview Round</th>
                <th className="min-w-[240px]">Panel & Interviewer</th>
                <th className="min-w-[130px] whitespace-nowrap">Status</th>
                <th className="text-right min-w-[170px] whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTableSlots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground text-sm font-mono">
                    No interview records match the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTableSlots.map((slot) => {
                  const isConfirmed = slot.status === 'confirmed';
                  const isCompleted = slot.status === 'completed';
                  const isAvailable = slot.status === 'available';

                  return (
                    <tr key={slot.id}>
                      {/* Candidate Name & School */}
                      <td>
                        {slot.candidate_name ? (
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-bold text-primary text-sm shrink-0 shadow-xs">
                              {slot.candidate_name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block text-sm sm:text-base leading-snug">
                                {slot.candidate_name}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium block mt-0.5">
                                {slot.candidate_school || 'Verified Student'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm shrink-0">
                              <UserPlus size={16} />
                            </div>
                            <div>
                              <span className="font-semibold text-foreground block text-sm sm:text-base">
                                Open Interview Slot
                              </span>
                              <span className="text-xs text-muted-foreground font-mono block mt-0.5">
                                Available for booking
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Day & Time - Single Line Guarantee */}
                      <td>
                        <div className="font-mono text-xs sm:text-sm whitespace-nowrap">
                          <span className="font-bold text-foreground block">
                            {slot.day}, {slot.date}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Clock size={12} className="text-primary" /> {slot.time}
                          </span>
                        </div>
                      </td>

                      {/* Interview Round Badge - STRICT SINGLE LINE GUARANTEE */}
                      <td className="whitespace-nowrap">
                        <span className={`rp-stage-badge ${getStageClass(slot.round_type)}`}>
                          {slot.round_type}
                        </span>
                      </td>

                      {/* Panel & Interviewer */}
                      <td>
                        <div className="text-xs sm:text-sm">
                          <span className="text-foreground font-semibold block leading-snug">{slot.interviewer}</span>
                          <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{slot.notes || 'Calendar sync verified'}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="whitespace-nowrap">
                        {isConfirmed && (
                          <span className="rp-badge-confirmed text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Check size={12} /> Confirmed
                          </span>
                        )}
                        {isCompleted && (
                          <span className="rp-badge-completed text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <ShieldCheck size={12} /> Completed
                          </span>
                        )}
                        {isAvailable && (
                          <span className="rp-badge-available text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                            <Clock size={12} /> Open
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {isConfirmed && (
                            <>
                              <button
                                onClick={() => handleMarkCompleted(slot.id)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-semibold transition-colors cursor-pointer"
                                title="Mark Completed"
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleCancelBooking(slot.id)}
                                className="text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground border border-border font-medium transition-colors cursor-pointer"
                                title="Release Slot"
                              >
                                Release
                              </button>
                            </>
                          )}
                          {isAvailable && (
                            <button
                              onClick={() => handleBookSlot(slot)}
                              className="text-xs px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
                            >
                              Book Slot
                            </button>
                          )}
                          {isCompleted && (
                            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1">
                              Archived
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Delete Slot"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ====================================================================
          MODAL 1: Add Open Interview Slot Modal
          ==================================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="rp-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rp-modal-dialog"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">Add Open Interview Slot</h3>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateSlotSubmit} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-foreground mb-1.5">Day of Week</label>
                    <select
                      value={newSlotDay}
                      onChange={e => handleDaySelect(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      {DEFAULT_DAYS.map((d, i) => (
                        <option key={i} value={d.day}>{d.day} ({d.date})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-foreground mb-1.5">Time Slot</label>
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={e => setNewSlotTime(e.target.value)}
                      placeholder="e.g. 10:00 AM"
                      required
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-foreground mb-1.5">Interview Round</label>
                  <select
                    value={newSlotRound}
                    onChange={e => setNewSlotRound(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {ROUND_TYPES.map((r, i) => (
                      <option key={i} value={r.label}>{r.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-foreground mb-1.5">Assigned Panel / Interviewer</label>
                  <input
                    type="text"
                    value={newSlotInterviewer}
                    onChange={e => setNewSlotInterviewer(e.target.value)}
                    placeholder="e.g. Dr. Aris Vance (Lead Architect)"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-foreground mb-1.5">Evaluation Focus / Notes</label>
                  <textarea
                    rows={2}
                    value={newSlotNotes}
                    onChange={e => setNewSlotNotes(e.target.value)}
                    placeholder="Focus topics, prerequisite code challenge, or room link..."
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="rp-button-secondary text-sm py-2.5 px-5 cursor-pointer font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rp-button-primary text-sm py-2.5 px-5 cursor-pointer font-bold shadow-md"
                  >
                    Confirm & Save to Database
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          MODAL 2: Slot Management Action Popover / Modal
          ==================================================================== */}
      <AnimatePresence>
        {activeSlotAction && (
          <div className="rp-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rp-modal-dialog"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-foreground">Manage Scheduled Interview</h3>
                    <span className="text-xs sm:text-sm text-muted-foreground font-mono">{activeSlotAction.day}, {activeSlotAction.time}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveSlotAction(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-muted/50 border border-border p-4 rounded-xl space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidate:</span>
                    <strong className="text-foreground font-bold">{activeSlotAction.candidate_name || 'Open Slot'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Round:</span>
                    <span className="text-foreground font-semibold">{activeSlotAction.round_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviewer:</span>
                    <span className="text-foreground">{activeSlotAction.interviewer}</span>
                  </div>
                  {activeSlotAction.notes && (
                    <div className="border-t border-border/60 pt-2 mt-2 text-xs text-muted-foreground italic">
                      "{activeSlotAction.notes}"
                    </div>
                  )}
                </div>

                <div className="space-y-2.5 pt-2">
                  {activeSlotAction.status === 'confirmed' && (
                    <>
                      <button
                        onClick={() => handleMarkCompleted(activeSlotAction.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 size={18} /> Mark Interview as Completed
                      </button>
                      <button
                        onClick={() => handleCancelBooking(activeSlotAction.id)}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-bold text-sm border border-border transition-colors cursor-pointer"
                      >
                        <RotateCcw size={18} /> Cancel Booking & Free Slot
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDeleteSlot(activeSlotAction.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-600 hover:bg-red-500/10 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} /> Permanently Delete Slot from Database
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
