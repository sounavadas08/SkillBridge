import React from 'react';
import './PlatformArchitecture.css';

const architectureSteps = [
  {
    step: '01',
    title: 'Students',
    description:
      'Complete curriculum-aligned skill assessments, target skill deficiencies, and discover roles tailored directly to your technical profile.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-icon">
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Colleges',
    description:
      'Track real-time departmental placement readiness, identify curriculum gaps against market trends, and manage recruitment funnels.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-icon">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Recruiters',
    description:
      'Stop filtering irrelevant resumes. Match vacancies against verified student skill profiles based on explicit algorithmic metrics.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="step-icon">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
];

export default function PlatformArchitecture() {
  return (
    <section className="architecture-section" id="platform-architecture">
      <div className="container">
        <div className="architecture-header">
          <span className="section-tag">PLATFORM ARCHITECTURE</span>
          <h2 className="section-title">How SkillBridge Operates</h2>
          <p className="section-subtitle">Targeted solutions for three primary stakeholders</p>
        </div>

        <div className="architecture-grid">
          {architectureSteps.map((item, index) => (
            <div key={index} className="architecture-card">
              <div className="card-top-row">
                <div className="icon-wrapper">{item.icon}</div>
                <span className="step-number">{item.step}</span>
              </div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-description">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
