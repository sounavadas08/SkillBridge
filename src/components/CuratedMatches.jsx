import React, { useState } from 'react';
import { curatedJobs } from '../data/jobMatches';
import { useToast } from '../context/ToastContext';
import './CuratedMatches.css';

export default function CuratedMatches() {
  const { showToast } = useToast();
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  const handleApply = (job) => {
    if (appliedJobs.has(job.id)) {
      showToast(`Already applied to ${job.role} at ${job.company}`, 'info');
      return;
    }
    setAppliedJobs(prev => new Set(prev).add(job.id));
    showToast(`Application submitted for ${job.role} at ${job.company}!`, 'success');
  };

  return (
    <section className="curated-section" id="curated-matches">
      <div className="container">
        <div className="curated-header">
          <span className="section-tag">CURATED MATCHES</span>
          <h2 className="section-title">Curated Recommendations</h2>
          <p className="section-subtitle">Automated candidate matching via mapped technical profiles</p>
        </div>

        <div className="curated-grid">
          {curatedJobs.map(job => {
            const isApplied = appliedJobs.has(job.id);
            return (
              <div key={job.id} className="job-card">
                {/* Header badges */}
                <div className="job-card-meta">
                  <span className="work-meta">
                    {job.workType} • {job.duration}
                  </span>
                  <span className="match-pill">{job.matchPercentage}% MATCH</span>
                </div>

                {/* Job Info */}
                <div className="job-main-info">
                  <h3 className="job-role">{job.role}</h3>
                  <div className="job-company">{job.company}</div>
                </div>

                {/* Match Progress Bar */}
                <div className="match-bar-wrapper">
                  <div className="match-progress-track">
                    <div
                      className="match-progress-fill"
                      style={{ width: `${job.matchPercentage}%` }}
                    ></div>
                  </div>
                  <span className="match-percent-label">{job.matchPercentage}%</span>
                </div>

                {/* Skills Matched count */}
                <div className="skills-matched-count">{job.skillsMatched}</div>

                {/* Skill Chips */}
                <div className="skill-chips-row">
                  {job.tags.map((tag, i) => (
                    <span key={i} className="skill-chip">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Apply Action Button */}
                <button
                  className={`btn-apply ${isApplied ? 'applied' : ''}`}
                  onClick={() => handleApply(job)}
                >
                  {isApplied ? 'Application Submitted ✓' : 'Apply Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
