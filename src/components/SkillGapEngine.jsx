import React, { useState } from 'react';
import { rolesSkillData } from '../data/radarData';
import RadarChart from './RadarChart';
import './SkillGapEngine.css';

export default function SkillGapEngine() {
  const [selectedRoleKey, setSelectedRoleKey] = useState('cloud-infrastructure');
  const activeData = rolesSkillData[selectedRoleKey] || rolesSkillData['cloud-infrastructure'];

  return (
    <section className="gap-engine-section" id="skill-gap-engine">
      <div className="container">
        {/* Header */}
        <div className="gap-header">
          <span className="section-tag">SKILL GAP ENGINE</span>

          {/* Title with Interactive Role Selector Dropdown / Tabs */}
          <div className="role-switcher-row">
            <h2 className="section-title">{activeData.roleTitle}</h2>
            <div className="role-pills-selector">
              <button
                className={`role-pill ${selectedRoleKey === 'cloud-infrastructure' ? 'active' : ''}`}
                onClick={() => setSelectedRoleKey('cloud-infrastructure')}
              >
                Cloud Infrastructure
              </button>
              <button
                className={`role-pill ${selectedRoleKey === 'ml-engineer' ? 'active' : ''}`}
                onClick={() => setSelectedRoleKey('ml-engineer')}
              >
                ML Engineer
              </button>
              <button
                className={`role-pill ${selectedRoleKey === 'full-stack' ? 'active' : ''}`}
                onClick={() => setSelectedRoleKey('full-stack')}
              >
                Full-Stack
              </button>
            </div>
          </div>

          <p className="section-subtitle">{activeData.subtitle}</p>
        </div>

        {/* 2-Column Split: Radar Chart on Left, Gap Meters & Readiness on Right */}
        <div className="gap-engine-layout">
          {/* Left Column: Radar Chart Card */}
          <div className="radar-card">
            <RadarChart competencies={activeData.competencies} />
          </div>

          {/* Right Column: Competency Gaps & Readiness Score */}
          <div className="gap-analytics-column">
            {/* Top Box: Competency Gaps List */}
            <div className="competency-gaps-card">
              <h3 className="card-micro-tag">COMPETENCY GAPS</h3>

              <div className="gap-items-list">
                {activeData.competencies.map((item, idx) => {
                  const displayName = item.name.replace('\n', ' ');
                  const isHighGap = item.gap <= -25;
                  const isMedGap = item.gap <= -15 && item.gap > -25;

                  return (
                    <div key={idx} className="gap-row-item">
                      <div className="gap-item-info">
                        <span className="gap-item-name">{displayName}</span>
                        <span
                          className={`gap-badge ${
                            isHighGap ? 'gap-high' : isMedGap ? 'gap-med' : 'gap-low'
                          }`}
                        >
                          {item.gap === 0 ? 'Optimal' : `${item.gap}`}
                        </span>
                      </div>

                      {/* Gap Visual Bar */}
                      <div className="gap-track">
                        <div
                          className={`gap-fill ${
                            isHighGap ? 'fill-orange' : isMedGap ? 'fill-amber' : 'fill-teal'
                          }`}
                          style={{ width: `${Math.max(8, 100 + item.gap)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Box: Overall Readiness Banner */}
            <div className="overall-readiness-card">
              <span className="readiness-tag">OVERALL READINESS</span>
              <div className="readiness-metric">{activeData.overallReadiness}%</div>
              <p className="readiness-subtext">
                of benchmark skills met across all domains
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
