import React from 'react';
import './StatsStrip.css';

const statsData = [
  {
    number: '12,500+',
    label: 'STUDENTS ASSESSED',
  },
  {
    number: '45+',
    label: 'PARTNER UNIVERSITIES',
  },
  {
    number: '320+',
    label: 'ACTIVE RECRUITERS',
  },
  {
    number: '92%',
    label: 'MATCH-TO-INTERVIEW RATE',
  },
];

export default function StatsStrip() {
  return (
    <div className="stats-strip-wrapper">
      <div className="container">
        <div className="stats-card">
          {statsData.map((item, index) => (
            <div key={index} className="stat-column">
              <div className="stat-number">{item.number}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
