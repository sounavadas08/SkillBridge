import React from 'react';
import { useToast } from '../../context/ToastContext';
import './Hero.css';

export default function Hero({ onStartStudent, onStartEmployer }) {
  const { showToast } = useToast();

  const handleAction = (type) => {
    if (type === 'internships') {
      const el = document.getElementById('curated-matches');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      showToast('Navigating to active internship recommendations', 'success');
    } else {
      if (onStartEmployer) {
        onStartEmployer();
      } else {
        showToast('Opening Employer & Recruiter Onboarding Portal', 'info');
      }
    }
  };

  return (
    <section className="hero-section" id="hero">
      <div className="hero-atmosphere">
        <div className="hero-glow-blob hero-glow-1"></div>
        <div className="hero-glow-blob hero-glow-2"></div>
      </div>

      <div className="container hero-container">
        {/* Category Badge */}
        <div className="hero-badge">
          <span className="hero-badge-dot">•</span>
          <span className="hero-badge-text">Academia-Industry Integration Platform</span>
        </div>

        {/* Main Heading with Italic Accent */}
        <h1 className="hero-title">
          Bridge the gap <br />
          <span className="hero-title-italic">between learning</span> <br />
          and hiring.
        </h1>

        {/* Subtitle description */}
        <p className="hero-subtitle">
          Skill mapping, intelligent matchmaking, and real-time placement analytics
          uniting students, universities, and enterprise recruiters on one platform.
        </p>

        {/* Call to action buttons */}
        <div className="hero-cta-group">
          <button
            className="hero-btn-primary"
            onClick={() => handleAction('internships')}
          >
            Find Internships <span className="arrow-icon">→</span>
          </button>
          <button
            className="hero-btn-secondary"
            onClick={() => handleAction('opportunities')}
          >
            Post Opportunities
          </button>
        </div>
      </div>
    </section>
  );
}
