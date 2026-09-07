import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsStrip from './components/StatsStrip';
import PlatformArchitecture from './components/PlatformArchitecture';
import CuratedMatches from './components/CuratedMatches';
import SkillGapEngine from './components/SkillGapEngine';
import ApplicationTracker from './components/ApplicationTracker';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import './App.css';

export default function App() {
  return (
    <div className="skillbridge-app">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <PlatformArchitecture />
        <CuratedMatches />
        <SkillGapEngine />
        <ApplicationTracker />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
