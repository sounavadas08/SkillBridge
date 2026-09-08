import React from 'react';
import { useToast } from '../../context/ToastContext';
import './CTASection.css';

export default function CTASection({ onStartStudent, onStartEmployer }) {
  const { showToast } = useToast();

  const handleAction = (portalType) => {
    if (portalType === 'Student Sign Up') {
      if (onStartStudent) {
        onStartStudent();
      } else {
        showToast(`Redirecting to ${portalType} registration portal...`, 'info');
      }
    } else if (portalType === 'University Portal') {
      if (onStartEmployer) {
        onStartEmployer();
      } else {
        showToast(`Redirecting to ${portalType} registration portal...`, 'info');
      }
    }
  };

  return (
    <section className="cta-section" id="cta">
      <div className="container cta-container">
        <span className="section-tag">READY TO CONNECT</span>
        <h2 className="cta-title">
          Your next placement <br />
          <span className="cta-title-italic">starts here.</span>
        </h2>
        <p className="cta-subtitle">
          Join 12,500 assessed students and 45+ partner universities already on the platform.
        </p>
        <div className="cta-buttons-row">
          <button
            className="btn-student-signup"
            onClick={() => handleAction('Student Sign Up')}
          >
            Student Sign Up
          </button>
          <button
            className="btn-university-portal"
            onClick={() => handleAction('University Portal')}
          >
            University Portal
          </button>
        </div>
      </div>
    </section>
  );
}
