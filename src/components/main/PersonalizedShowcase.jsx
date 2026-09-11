import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  ArrowRight, 
  Layers, 
  Radar, 
  Calendar, 
  Briefcase, 
  ShieldCheck, 
  Clock, 
  ExternalLink,
  Code2,
  Lock
} from 'lucide-react';
import { gsap } from 'gsap';
import { ROUTES, navigateTo, getCurrentUser, setPortalTab } from '../../utils/navigation';
import { useToast } from '../../context/ToastContext';
import { useSafeClerk } from '../../utils/clerkAuth';
import './PersonalizedShowcase.css';

export default function PersonalizedShowcase() {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const badgesRef = useRef([]);
  const { showToast } = useToast();
  const { isClerkSignedIn, user: clerkUser } = useSafeClerk();

  const [hasAccount, setHasAccount] = useState(() => {
    if (typeof window === 'undefined') return false;
    const local = getCurrentUser();
    return Boolean(local && local.email && (local.role || local.name));
  });

  useEffect(() => {
    const checkAccount = () => {
      const isClerk = Boolean(isClerkSignedIn && clerkUser);
      const local = getCurrentUser();
      const hasLocal = Boolean(local && local.email && (local.role || local.name));
      setHasAccount(isClerk || hasLocal);
    };
    checkAccount();
    window.addEventListener('storage', checkAccount);
    return () => window.removeEventListener('storage', checkAccount);
  }, [isClerkSignedIn, clerkUser]);

  const handleFeatureAccess = (e, featureName, targetTab) => {
    e.preventDefault();
    if (!hasAccount) {
      showToast(
        `Account Required: You cannot access ${featureName} without creating a verified account. Please sign in or register first.`,
        'warning'
      );
      setTimeout(() => {
        navigateTo(ROUTES.LOGIN);
      }, 900);
      return;
    }

    if (targetTab) {
      setPortalTab(targetTab);
    }
    navigateTo(ROUTES.PORTAL);
  };

  useEffect(() => {
    // GSAP floating animations for badges (inspired by GSAP showcase video)
    const ctx = gsap.context(() => {
      // 1. Headline words reveal
      if (headlineRef.current) {
        gsap.from(headlineRef.current, {
          opacity: 0,
          y: 30,
          duration: 1.2,
          ease: 'power3.out'
        });
      }

      // 2. Continuous organic floating for inline pill badges
      gsap.to('.inline-badge-float-1', {
        y: -9,
        rotation: -2,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to('.inline-badge-float-2', {
        y: -10,
        rotation: 2.5,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.4
      });

      gsap.to('.inline-badge-float-3', {
        y: -8,
        rotation: -1.5,
        duration: 3.1,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8
      });

      // 3. Staggered banner card reveal
      gsap.from('.banner-card', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.showcase-banners-grid',
          start: 'top 85%'
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="personal-showcase-section" id="why-skillbridge">
      {/* Subtle Crimson & Amber ambient glows */}
      <div className="showcase-glow-crimson" />
      <div className="showcase-glow-amber" />

      <div className="showcase-container">
        {/* ========================================================================= */}
        {/* Hero Tagline Section: "Where the whole world socializes, we personalise." */}
        {/* ========================================================================= */}
        <div className="showcase-header-box">
          <div className="showcase-kicker">
            <Sparkles size={14} className="text-amber-500" />
            <span>The Anti-LinkedIn Standard</span>
          </div>

          <h2 ref={headlineRef} className="showcase-headline">
            <span className="font-regular">Where the whole world</span>
            <span className="inline-badge inline-badge-crimson inline-badge-float-1">
              💬 Zero Ghosting
            </span>
            <span className="font-italic-serif">socializes,</span>
            <br className="hidden sm:inline" />
            <span className="font-regular">we </span>
            <span className="inline-badge inline-badge-amber inline-badge-float-2">
              ⚡ Proof-of-Work
            </span>
            <span className="font-italic-crimson">personalise.</span>
            <span className="inline-badge inline-badge-crimson inline-badge-float-3">
              🎯 3D AI Match
            </span>
          </h2>

          <p className="showcase-subtext">
            Traditional job boards turned hiring into noisy social feeds, keyword fluffing, and 1,000-applicant resume black holes. 
            SkillBridge replaces cold InMails with real-world corporate challenges, 3D semantic talent vectors, and direct interview ledger booking.
          </p>

          {/* Quick comparison chips */}
          <div className="diff-pill-strip">
            <span className="diff-chip">
              <span className="text-rose-500 font-bold">✕</span> No Resume Spam
            </span>
            <span className="diff-chip">
              <span className="text-rose-500 font-bold">✕</span> No Cold InMail Fluff
            </span>
            <span className="diff-chip">
              <span className="text-amber-500 font-bold">✓</span> Real Engineering Sprints
            </span>
            <span className="diff-chip">
              <span className="text-amber-500 font-bold">✓</span> 3D Semantic Matching
            </span>
            <span className="diff-chip">
              <span className="text-amber-500 font-bold">✓</span> Confirmed Interview Ledger
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Differentiation Banners using Actual UI Screenshots */}
        {/* ========================================================================= */}
        <div className="showcase-banners-grid">
          {/* BANNER 1: Micro-Internships vs Resume Black Holes */}
          <div className="banner-card">
            <div className="banner-card-top">
              <div className="banner-header-row">
                <span className="banner-feature-badge">01 • Proof-of-Work Bounties</span>
                <span className="banner-vs-tag">vs. LinkedIn Easy Apply</span>
              </div>

              <h3 className="banner-title">
                Prove Ability by Doing, Not Just Interviewing
              </h3>

              <p className="banner-desc">
                Skip the generic 500-applicant PDF queue. Tackle real corporate engineering challenges posted by Stripe, Google, and NVIDIA leads, earn stipends, and get stamped with verified proof-of-work.
              </p>

              {/* Comparison Strip */}
              <div className="comparison-strip">
                <div className="comp-row comp-row-old">
                  <X size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>The LinkedIn Way:</strong> Submit a tailored resume into an ATS filter with 600 others. 95% never get read.</span>
                </div>
                <div className="comp-row comp-row-new">
                  <Check size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>The SkillBridge Standard:</strong> Submit working code, get verified by lead architects, and earn academic seals.</span>
                </div>
              </div>
            </div>

            {/* Real Screenshot Preview */}
            <div className="banner-screenshot-frame">
              <img 
                src="/showcase/feature-micro-internships.png" 
                alt="Corporate Micro-Internship and Challenge Hub" 
                className="banner-screenshot-img"
              />
              <div className="banner-screenshot-overlay">
                <span className="banner-screenshot-caption">
                  <Code2 size={13} className="text-amber-500" />
                  Live Platform: Micro-Internship & Challenge Hub
                </span>
                <button 
                  onClick={(e) => handleFeatureAccess(e, 'Micro-Internship & Challenge Hub', 'challenges')}
                  className={`banner-action-btn ${!hasAccount ? 'banner-action-locked' : ''}`}
                  title={hasAccount ? 'Explore Challenges' : 'Account Required: Sign In to Explore'}
                >
                  {!hasAccount && <Lock size={12} className="shrink-0 text-amber-400" />}
                  Explore Challenges <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* BANNER 2: 3D Vector Talent Radar vs Keyword Stuffing */}
          <div className="banner-card">
            <div className="banner-card-top">
              <div className="banner-header-row">
                <span className="banner-feature-badge">02 • 3D Semantic Radar</span>
                <span className="banner-vs-tag">vs. Buzzword Searching</span>
              </div>

              <h3 className="banner-title">
                High-Dimensional Vector Embeddings
              </h3>

              <p className="banner-desc">
                Keyword matching rewards candidates who game SEO. SkillBridge maps candidate repositories and SkillVault proficiencies into real-time 3D vector space for genuine mathematical skill alignment.
              </p>

              {/* Comparison Strip */}
              <div className="comparison-strip">
                <div className="comp-row comp-row-old">
                  <X size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>The LinkedIn Way:</strong> Recruiters search for keywords like "React" or "Python" without testing capability.</span>
                </div>
                <div className="comp-row comp-row-new">
                  <Check size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>The SkillBridge Standard:</strong> 3D Vector Radar clusters candidates by true mathematical skill proximity.</span>
                </div>
              </div>
            </div>

            {/* Real Screenshot Preview */}
            <div className="banner-screenshot-frame">
              <img 
                src="/showcase/feature-vector-field-view.png" 
                alt="AI Talent Match Radar with 3D Vector Embeddings" 
                className="banner-screenshot-img banner-screenshot-contain"
              />
              <div className="banner-screenshot-overlay">
                <span className="banner-screenshot-caption">
                  <Radar size={13} className="text-amber-500" />
                  Live Platform: 3D AI Talent Match Radar
                </span>
                <button 
                  onClick={(e) => handleFeatureAccess(e, '3D AI Talent Match Radar', 'radar')}
                  className={`banner-action-btn ${!hasAccount ? 'banner-action-locked' : ''}`}
                  title={hasAccount ? 'View 3D Radar' : 'Account Required: Sign In to View'}
                >
                  {!hasAccount && <Lock size={12} className="shrink-0 text-amber-400" />}
                  View 3D Radar <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* BANNER 3: Automated Interview Scheduler vs Weeks of Ghosting */}
          <div className="banner-card">
            <div className="banner-card-top">
              <div className="banner-header-row">
                <span className="banner-feature-badge">03 • Guaranteed Ledger</span>
                <span className="banner-vs-tag">vs. Recruiter Ghosting</span>
              </div>

              <h3 className="banner-title">
                Automated Direct Calendar Ledger
              </h3>

              <p className="banner-desc">
                No back-and-forth email tagging. Shortlisted talent and recruiters directly schedule, confirm, and verify evaluation rounds with engineering leads on a single synchronized database ledger.
              </p>

              {/* Comparison Strip */}
              <div className="comparison-strip">
                <div className="comp-row comp-row-old">
                  <X size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>The LinkedIn Way:</strong> Weeks of radio silence, automated rejection templates, or lost recruiter messages.</span>
                </div>
                <div className="comp-row comp-row-new">
                  <Check size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>The SkillBridge Standard:</strong> 1-click slot booking, real-time stage tracking, and confirmed panel evaluations.</span>
                </div>
              </div>
            </div>

            {/* Real Screenshot Preview */}
            <div className="banner-screenshot-frame">
              <img 
                src="/showcase/feature-interview-scheduler.png" 
                alt="Automated Interview Scheduler Audit Ledger" 
                className="banner-screenshot-img"
              />
              <div className="banner-screenshot-overlay">
                <span className="banner-screenshot-caption">
                  <Calendar size={13} className="text-amber-500" />
                  Live Platform: Interview Scheduler Ledger
                </span>
                <button 
                  onClick={(e) => handleFeatureAccess(e, 'Interview Scheduler Ledger', 'scheduler')}
                  className={`banner-action-btn ${!hasAccount ? 'banner-action-locked' : ''}`}
                  title={hasAccount ? 'Open Scheduler' : 'Account Required: Sign In to View'}
                >
                  {!hasAccount && <Lock size={12} className="shrink-0 text-amber-400" />}
                  Open Scheduler <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* BANNER 4: Live Verified Cohorts with Timers vs Stale Job Ads */}
          <div className="banner-card">
            <div className="banner-card-top">
              <div className="banner-header-row">
                <span className="banner-feature-badge">04 • Real Cohorts & Pay</span>
                <span className="banner-vs-tag">vs. Outdated Job Posts</span>
              </div>

              <h3 className="banner-title">
                Top-Tier Internships & Live Countdown Timers
              </h3>

              <p className="banner-desc">
                Access direct openings at Google, Stripe, Microsoft, and NVIDIA with transparent hourly stipends ($52–$60/hr). Monitor cohort launch dates with live second-by-second countdown clocks.
              </p>

              {/* Comparison Strip */}
              <div className="comparison-strip">
                <div className="comp-row comp-row-old">
                  <X size={15} className="text-rose-500 shrink-0 mt-0.5" />
                  <span><strong>The LinkedIn Way:</strong> Promoted job listings that have been closed or filled for months without notice.</span>
                </div>
                <div className="comp-row comp-row-new">
                  <Check size={15} className="text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>The SkillBridge Standard:</strong> Verified hourly stipends, upcoming cohort countdowns, and direct mentor pairing.</span>
                </div>
              </div>
            </div>

            {/* Real Screenshot Preview */}
            <div className="banner-screenshot-frame">
              <img 
                src="/showcase/feature-curated-dark.png" 
                alt="Curated Real Tech Internships" 
                className="banner-screenshot-img"
              />
              <div className="banner-screenshot-overlay">
                <span className="banner-screenshot-caption">
                  <Clock size={13} className="text-amber-500" />
                  Live Platform: Verified Internships & Timers
                </span>
                <button 
                  onClick={(e) => handleFeatureAccess(e, 'Verified Internships & Timers', 'opportunities')}
                  className={`banner-action-btn ${!hasAccount ? 'banner-action-locked' : ''}`}
                  title={hasAccount ? 'View Opportunities' : 'Account Required: Sign In to View'}
                >
                  {!hasAccount && <Lock size={12} className="shrink-0 text-amber-400" />}
                  View Opportunities <ArrowRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
