import React from 'react';
import { TrendingUp, TrendingDown, Compass, Zap, ArrowRight, Activity } from 'lucide-react';

export function IndustryTrendsView() {
  return (
    <div 
      className="space-y-6 pb-12 transition-all duration-300"
    >
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Industry Trend Forecaster</h1>
        <p className="text-muted-foreground mt-1">Strategic insights for a 2-3 year career horizon based on your profile.</p>
      </header>

      <div className="border border-border bg-card rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analysis Context</h2>
            <p className="text-lg font-medium">Frontend & Full Stack Web Development</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-3 py-1.5 rounded-lg bg-background">
          <Activity size={16} /> Data updated 2 days ago
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
            <TrendingUp className="text-green-500" size={20} />
            Skills Increasing in Demand
          </h3>
          <div className="space-y-4">
            <TrendCard 
              title="React Server Components (RSC)" 
              description="Rapidly becoming the standard for React frameworks like Next.js."
              impact="High"
              match="Aligned with your current React knowledge."
            />
            <TrendCard 
              title="WebAssembly (Wasm) & Rust" 
              description="Growing need for high-performance web applications running outside JS."
              impact="Medium-High"
              match="New paradigm. Good secondary skill to acquire by 2026."
            />
            <TrendCard 
              title="AI Integration & Prompt Engineering" 
              description="Building interfaces that effectively stream and manage LLM outputs."
              impact="High"
              match="Highly recommended to start learning immediately."
            />
          </div>
        </div>

        <div className="border border-border bg-card rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-6">
            <TrendingDown className="text-red-500" size={20} />
            Skills Becoming Less Relevant
          </h3>
          <div className="space-y-4">
            <TrendCard 
              title="Class-Based React Components" 
              description="Legacy. Most enterprise codebases are migrating to or strictly using functional components + hooks."
              impact="Low"
              match="You already use Hooks. No action needed."
              isNegative
            />
            <TrendCard 
              title="Heavy Client-Side Redux Monoliths" 
              description="Moving towards lighter state management (Zustand, Jotai) or server state (React Query, RSC)."
              impact="Medium"
              match="Shift focus from Redux to modern server-state tools."
              isNegative
            />
          </div>
        </div>
      </div>

      <div className="border border-border bg-primary/5 rounded-xl p-6 md:p-8 mt-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap size={100} className="text-primary" />
        </div>
        
        <h3 className="font-semibold text-xl mb-2">AI Strategic Recommendation</h3>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Based on industry trajectory and your current focus on Frontend Engineering, here is the recommended 6-month adjustment to your learning pathway.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-background border border-border p-4 rounded-lg flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono text-primary mb-2 block font-semibold">Phase 1 (Months 1-2)</span>
              <h4 className="font-medium mb-1">Master Next.js App Router</h4>
              <p className="text-xs text-muted-foreground">Transition your React knowledge into full-stack capabilities.</p>
            </div>
          </div>
          <div className="bg-background border border-border p-4 rounded-lg flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono text-primary mb-2 block font-semibold">Phase 2 (Months 3-4)</span>
              <h4 className="font-medium mb-1">Learn Server State Tools</h4>
              <p className="text-xs text-muted-foreground">Implement React Query or tRPC in a portfolio project.</p>
            </div>
          </div>
          <div className="bg-background border border-border p-4 rounded-lg flex flex-col justify-between shadow-sm">
            <div>
              <span className="text-xs font-mono text-primary mb-2 block font-semibold">Phase 3 (Months 5-6)</span>
              <h4 className="font-medium mb-1">AI API Integrations</h4>
              <p className="text-xs text-muted-foreground">Build a project that streams LLM responses natively.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendCard({ title, description, impact, match, isNegative = false }) {
  return (
    <div className="bg-muted p-4 rounded-lg border border-border flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase tracking-wider ${
          isNegative 
            ? 'bg-red-500/10 border-red-500/20 text-red-500' 
            : 'bg-primary/10 border-primary/20 text-primary'
        }`}>
          Impact: {impact}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <div className="mt-2 pt-2 border-t border-border flex items-start gap-2">
        <ArrowRight size={14} className="text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-foreground">{match}</p>
      </div>
    </div>
  );
}
