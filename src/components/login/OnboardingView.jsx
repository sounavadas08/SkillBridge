import React, { useState } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  User,
  Users
} from 'lucide-react';
import './Login.css';

// ----------------------------------------------------------------------
// ONBOARDING VIEW (Figma 5-Step Experience)
// ----------------------------------------------------------------------
export default function OnboardingView({ onComplete, onBackHome, onSwitchToLogin, initialRole = null }) {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [data, setData] = useState({
    role: initialRole || null,
    // Branch A (Student)
    careerStage: null,
    interests: [],
    experience: null,
    studentGoal: null,
    // Branch B (Recruiter)
    organization: null,
    hiringNeeds: [],
    hiringSkills: [],
    hiringGoal: null,
  });

  const nextStep = () => {
    if (step < 5) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setIsTransitioning(false);
      }, 200);
    } else {
      if (data.role && onComplete) {
        onComplete(data);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setStep((s) => s - 1);
        setIsTransitioning(false);
      }, 200);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.role !== null;
      case 2:
        return data.role === 'student'
          ? data.careerStage !== null
          : data.organization !== null;
      case 3:
        return data.role === 'student'
          ? data.interests.length > 0
          : data.hiringNeeds.length > 0;
      case 4:
        return data.role === 'student'
          ? data.experience !== null
          : data.hiringSkills.length > 0;
      case 5:
        return data.role === 'student'
          ? data.studentGoal !== null
          : data.hiringGoal !== null;
      default:
        return false;
    }
  };

  return (
    <div className="onboarding-wrapper">
      {/* Header */}
      <header className="onboarding-header">
        <div className="onboarding-header-brand" onClick={onBackHome}>
          <div className="auth-logo-icon" style={{ width: '2rem', height: '2rem' }}>
            <img src="/logo-icon-dark.png" alt="SkillBridge" />
          </div>
          <span className="auth-logo-text" style={{ fontSize: '1.15rem' }}>
            SkillBridge
          </span>
        </div>

        <div className="onboarding-header-step">
          Step {step} of 5
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {onSwitchToLogin && (
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="onboarding-header-close"
            >
              Sign In
            </button>
          )}
          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="onboarding-header-close"
            >
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="onboarding-main">
        {/* Progress Tracker */}
        <div className="onboarding-stepper">
          <div className="stepper-track-bg" />
          <div
            className="stepper-track-fill"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />

          <div className="stepper-steps-container">
            {[1, 2, 3, 4, 5].map((s) => {
              const isCompleted = step > s;
              const isActive = step === s;
              return (
                <div
                  key={s}
                  className={`stepper-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                >
                  {isCompleted ? <CheckCircle2 size={16} /> : s}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Container */}
        <div className={`step-container ${isTransitioning ? 'step-fade-out' : ''}`}>
          {/* STEP 1: Branch Selection */}
          {step === 1 && (
            <StepOne
              selected={data.role}
              onChange={(role) => setData({ ...data, role })}
            />
          )}

          {/* STEP 2 */}
          {step === 2 && data.role === 'student' && (
            <StudentStepTwo
              selected={data.careerStage}
              onChange={(careerStage) => setData({ ...data, careerStage })}
            />
          )}
          {step === 2 && data.role === 'recruiter' && (
            <RecruiterStepTwo
              selected={data.organization}
              onChange={(organization) => setData({ ...data, organization })}
            />
          )}

          {/* STEP 3 */}
          {step === 3 && data.role === 'student' && (
            <StudentStepThree
              selected={data.interests}
              onChange={(interests) => setData({ ...data, interests })}
            />
          )}
          {step === 3 && data.role === 'recruiter' && (
            <RecruiterStepThree
              selected={data.hiringNeeds}
              onChange={(hiringNeeds) => setData({ ...data, hiringNeeds })}
            />
          )}

          {/* STEP 4 */}
          {step === 4 && data.role === 'student' && (
            <StudentStepFour
              selected={data.experience}
              onChange={(experience) => setData({ ...data, experience })}
            />
          )}
          {step === 4 && data.role === 'recruiter' && (
            <RecruiterStepFour
              selected={data.hiringSkills}
              onChange={(hiringSkills) => setData({ ...data, hiringSkills })}
            />
          )}

          {/* STEP 5 */}
          {step === 5 && data.role === 'student' && (
            <StudentStepFive
              selected={data.studentGoal}
              onChange={(studentGoal) => setData({ ...data, studentGoal })}
            />
          )}
          {step === 5 && data.role === 'recruiter' && (
            <RecruiterStepFive
              selected={data.hiringGoal}
              onChange={(hiringGoal) => setData({ ...data, hiringGoal })}
            />
          )}
        </div>

        {/* Navigation Actions */}
        <div className="onboarding-actions">
          <button
            type="button"
            onClick={prevStep}
            disabled={step === 1}
            className="btn-onboarding-back"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn-onboarding-next"
          >
            {step === 5 ? 'Complete Profile' : 'Continue'}
            {step !== 5 && <ArrowRight size={16} />}
          </button>
        </div>
      </main>
    </div>
  );
}

// ----------------------------------------------------------------------
// STEP COMPONENTS (Converted to JSX)
// ----------------------------------------------------------------------

function StepOne({ selected, onChange }) {
  const options = [
    {
      id: 'student',
      label: 'Student / Job Seeker',
      desc: "I'm looking to build my skills, verify gaps, prepare for opportunities, or land a job.",
      icon: <User size={24} />,
    },
    {
      id: 'recruiter',
      label: 'Recruiter / Employer',
      desc: "I'm looking to discover pre-validated candidates, verify skill signals, or build a talent pipeline.",
      icon: <Users size={24} />,
    },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">What brings you to SkillBridge?</h2>
      <p className="step-subheadline">
        Select the branch that best describes your primary objective.
      </p>

      <div className="role-grid">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`role-card ${isActive ? 'selected' : ''}`}
            >
              <div className="role-card-icon">
                {opt.icon}
              </div>
              <div>
                <div className="role-card-title">{opt.label}</div>
                <div className="role-card-desc">{opt.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Student Branch Steps --

function StudentStepTwo({ selected, onChange }) {
  const options = [
    { id: 'student', label: 'Current University / College Student' },
    { id: 'recent_grad', label: 'Recent Graduate (0 - 1 years)' },
    { id: 'looking', label: 'Looking for my first tech/data role' },
    { id: 'working', label: 'Working Professional seeking advancement' },
    { id: 'career_changer', label: 'Career Changer moving into Tech/Analytics' },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">Where are you in your career journey?</h2>
      <p className="step-subheadline">
        This helps us calibrate the skill gap engine to your current stage.
      </p>

      <div className="options-list">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`option-row-card ${isActive ? 'selected' : ''}`}
            >
              <div className="radio-indicator">
                {isActive && <div className="radio-indicator-dot" />}
              </div>
              <span className="option-text">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentStepThree({ selected, onChange }) {
  const options = [
    { id: 'web', label: 'Full-Stack Web Development' },
    { id: 'ai', label: 'AI / Machine Learning' },
    { id: 'data', label: 'Data Science & Analytics' },
    { id: 'cloud', label: 'Cloud Infrastructure & DevOps' },
    { id: 'uiux', label: 'UI/UX & Product Design' },
    { id: 'cyber', label: 'Cybersecurity' },
    { id: 'business', label: 'Product & Business Strategy' },
    { id: 'finance', label: 'FinTech & Quant' },
    { id: 'communication', label: 'Technical Communication' },
  ];

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="w-full">
      <h2 className="step-headline">What domains are you interested in?</h2>
      <p className="step-subheadline">
        Select all areas you want to benchmark and develop (multi-select).
      </p>

      <div className="pills-cloud">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`pill-button ${isActive ? 'selected' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StudentStepFour({ selected, onChange }) {
  const levels = [
    { id: 'beginner', label: 'Beginner', desc: 'Learning fundamentals' },
    { id: 'developing', label: 'Developing', desc: 'Built a few projects' },
    { id: 'comfortable', label: 'Comfortable', desc: 'Production-ready' },
    { id: 'advanced', label: 'Advanced', desc: 'Specialized domain mastery' },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">How would you describe your current experience?</h2>
      <p className="step-subheadline">
        This helps our radar engine set realistic assessment baselines.
      </p>

      <div className="experience-grid">
        {levels.map((level, idx) => {
          const isActive = selected === level.id;
          return (
            <div
              key={level.id}
              onClick={() => onChange(level.id)}
              className={`level-card ${isActive ? 'selected' : ''}`}
            >
              <div className="level-number">{idx + 1}</div>
              <div className="level-label">{level.label}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                {level.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StudentStepFive({ selected, onChange }) {
  const options = [
    { id: 'job', label: 'Land a full-time job' },
    { id: 'internship', label: 'Find a high-growth internship' },
    { id: 'projects', label: 'Build verified portfolio projects' },
    { id: 'radar', label: 'Benchmark my skills with Radar Gap analysis' },
    { id: 'interviews', label: 'Prepare for technical interviews' },
    { id: 'skills', label: 'Close critical skill gaps' },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">What would you like SkillBridge to solve first?</h2>
      <p className="step-subheadline">
        Choose your immediate primary goal to personalize your dashboard.
      </p>

      <div className="goals-grid">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`option-row-card ${isActive ? 'selected' : ''}`}
            >
              <div className="radio-indicator">
                {isActive && <div className="radio-indicator-dot" />}
              </div>
              <span className="option-text">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// -- Recruiter Branch Steps --

function RecruiterStepTwo({ selected, onChange }) {
  const options = [
    { id: 'startup', label: 'Seed / Early-stage Startup' },
    { id: 'growth', label: 'High-growth Scaleup (Series A-C)' },
    { id: 'enterprise', label: 'Enterprise / Fortune 500' },
    { id: 'agency', label: 'Digital Agency / Consultancy' },
    { id: 'edu', label: 'University / Educational Institution' },
    { id: 'nonprofit', label: 'Non-profit or Government Body' },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">What type of organization are you hiring for?</h2>
      <p className="step-subheadline">
        This calibrates our candidate matching engine to your company scale.
      </p>

      <div className="options-list">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`option-row-card ${isActive ? 'selected' : ''}`}
            >
              <div className="radio-indicator">
                {isActive && <div className="radio-indicator-dot" />}
              </div>
              <span className="option-text">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecruiterStepThree({ selected, onChange }) {
  const options = [
    { id: 'intern', label: 'Summer / Term Internships' },
    { id: 'entry', label: 'Entry-level Engineers (0 - 2 yrs)' },
    { id: 'mid', label: 'Mid-level & Senior Talent' },
    { id: 'contract', label: 'Contract / Project-based Roles' },
    { id: 'campus', label: 'Campus Placement Drives' },
  ];

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="w-full">
      <h2 className="step-headline">What positions are you actively hiring?</h2>
      <p className="step-subheadline">
        Select all candidate categories you want to source (multi-select).
      </p>

      <div className="options-list">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <div
              key={opt.id}
              onClick={() => toggle(opt.id)}
              className={`option-row-card ${isActive ? 'selected' : ''}`}
            >
              <div
                className="radio-indicator"
                style={{
                  borderRadius: '4px',
                  backgroundColor: isActive ? 'var(--teal-dark)' : 'transparent',
                  borderColor: isActive ? 'var(--teal-dark)' : 'var(--border-card)',
                  color: '#ffffff'
                }}
              >
                {isActive && <CheckCircle2 size={12} />}
              </div>
              <span className="option-text">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecruiterStepFour({ selected, onChange }) {
  const options = [
    { id: 'web', label: 'React / Node / Web Stack' },
    { id: 'ai', label: 'LLMs & AI Engineering' },
    { id: 'cloud', label: 'Kubernetes & Cloud Infra' },
    { id: 'data', label: 'Data Engineering & SQL' },
    { id: 'uiux', label: 'Product Design & Figma' },
    { id: 'cyber', label: 'Cybersecurity & Compliance' },
    { id: 'mobile', label: 'iOS / Android Native' },
    { id: 'finance', label: 'FinTech Systems' },
  ];

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };

  return (
    <div className="w-full">
      <h2 className="step-headline">Which core skill signals matter most?</h2>
      <p className="step-subheadline">
        Candidates will be ranked by match fidelity across these areas.
      </p>

      <div className="pills-cloud">
        {options.map((opt) => {
          const isActive = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`pill-button ${isActive ? 'selected' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RecruiterStepFive({ selected, onChange }) {
  const options = [
    { id: 'discover', label: 'Discover pre-vetted top talent' },
    { id: 'shortlist', label: 'Shortlist with objective skill gap data' },
    { id: 'post', label: 'Post verified roles & internship opportunities' },
    { id: 'evaluate', label: 'Evaluate candidates with standardized radar tests' },
    { id: 'pipeline', label: 'Build a long-term campus talent pipeline' },
  ];

  return (
    <div className="w-full">
      <h2 className="step-headline">What is your primary hiring objective?</h2>
      <p className="step-subheadline">
        Select your main goal to set up your Employer Portal.
      </p>

      <div className="goals-grid">
        {options.map((opt) => {
          const isActive = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onChange(opt.id)}
              className={`option-row-card ${isActive ? 'selected' : ''}`}
            >
              <div className="radio-indicator">
                {isActive && <div className="radio-indicator-dot" />}
              </div>
              <span className="option-text">{opt.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
