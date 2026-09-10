import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Check, User, Plus, ShieldCheck } from 'lucide-react';

const WEEK_DAYS = [
  { day: 'Mon', date: 'Sep 14', slots: [{ time: '10:00 AM', status: 'available' }, { time: '02:00 PM', status: 'confirmed', candidate: 'Alex Chen' }] },
  { day: 'Tue', date: 'Sep 15', slots: [{ time: '11:30 AM', status: 'confirmed', candidate: 'Sarah Jenkins' }, { time: '03:30 PM', status: 'available' }] },
  { day: 'Wed', date: 'Sep 16', slots: [{ time: '09:00 AM', status: 'available' }, { time: '01:00 PM', status: 'available' }] },
  { day: 'Thu', date: 'Sep 17', slots: [{ time: '10:30 AM', status: 'confirmed', candidate: 'Marcus Vance' }, { time: '04:00 PM', status: 'available' }] },
  { day: 'Fri', date: 'Sep 18', slots: [{ time: '02:30 PM', status: 'available' }] }
];

export function InterviewSchedulerView() {
  const [calendarState, setCalendarState] = useState(WEEK_DAYS);
  const [selectedCandidate, setSelectedCandidate] = useState('David Miller (Stanford Senior)');

  const handleConfirmSlot = (dayIndex, slotIndex) => {
    const updated = [...calendarState];
    const targetSlot = updated[dayIndex].slots[slotIndex];
    if (targetSlot.status === 'available') {
      targetSlot.status = 'confirmed';
      targetSlot.candidate = selectedCandidate;
      setCalendarState(updated);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-primary" size={24} />
            <h1 className="rp-display-l">Automated Interview Scheduler</h1>
          </div>
          <p className="rp-body-l text-muted-foreground mt-1">
            Ledger-style calendar sync that removes email back-and-forth once a candidate is shortlisted.
          </p>
        </div>

        <button className="rp-button-primary shrink-0">
          <Plus size={18} /> Add Open Interview Slot
        </button>
      </header>

      {/* Shortlisted Candidates Bar */}
      <div className="rp-card p-4 space-y-3">
        <span className="rp-meta">Select Shortlisted Candidate to Schedule:</span>
        <div className="flex flex-wrap gap-2">
          {['David Miller (Stanford Senior)', 'Elena Rostova (MIT AI)', 'Priya Sharma (Berkeley CS)'].map((cand, i) => (
            <button
              key={i}
              onClick={() => setSelectedCandidate(cand)}
              className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${selectedCandidate === cand ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted text-foreground border-border'}`}
            >
              + {cand}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger-Style Week Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {calendarState.map((dayObj, dayIdx) => (
          <div key={dayIdx} className="rp-card p-4 space-y-4">
            <div className="border-b border-border pb-2 text-center">
              <span className="font-bold text-base text-foreground block">{dayObj.day}</span>
              <span className="rp-meta">{dayObj.date}</span>
            </div>

            <div className="space-y-3">
              {dayObj.slots.map((slot, slotIdx) => {
                const isConfirmed = slot.status === 'confirmed';

                return (
                  <motion.div
                    key={slotIdx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleConfirmSlot(dayIdx, slotIdx)}
                    className={`rp-calendar-slot cursor-pointer ${isConfirmed ? 'active' : ''}`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono font-bold text-foreground flex items-center gap-1">
                        <Clock size={12} className="text-muted-foreground" /> {slot.time}
                      </span>

                      {isConfirmed && (
                        <motion.span
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="rp-seal"
                        >
                          <Check size={12} />
                        </motion.span>
                      )}
                    </div>

                    <div className="mt-2 text-xs">
                      {isConfirmed ? (
                        <div>
                          <span className="font-bold text-foreground block truncate">{slot.candidate}</span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Confirmed & Synced
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground hover:text-primary font-medium">
                          + Click to Book Slot
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
