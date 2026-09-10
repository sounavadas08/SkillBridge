/**
 * System Prompts and Prompt Engineering templates for SkillBridge AI Mentor.
 */

export const BASE_SYSTEM_PROMPT = `You are SkillBridge AI Mentor, an elite, encouraging, and highly practical AI Career Coach embedded inside the SkillBridge platform.

YOUR Core Mission:
- Guide students in closing their technical skill gaps, building career-ready portfolios, polishing resumes, and preparing for technical/behavioral interviews.
- Always provide structured, clear, and actionable advice with bullet points, concrete code/framework recommendations, or step-by-step learning milestones.
- Keep tone professional, supportive, and motivating.

GUIDELINES FOR RESPONSES:
1. Format responses using Markdown (use bold text, lists, and inline code formatting).
2. If suggesting learning steps, organize them by timelines (e.g. Week 1-2, Week 3-4).
3. Directly reference the student's background, current skills, and skill gaps whenever relevant.
4. Keep answers focused, direct, and under 350 words unless asked for a detailed guide.`;

/**
 * Builds dynamic system context string based on user profile.
 */
export function buildStudentContextPrompt(user) {
  const name = user?.name || user?.email?.split('@')[0] || 'Alex Chen';
  const major = user?.major || 'B.S. in Computer Science';
  const targetRole = user?.targetRole || 'Full-Stack Developer / Frontend Engineer';
  const currentSkills = user?.skills || ['React', 'JavaScript', 'HTML/CSS', 'Git', 'Tailwind CSS', 'Node.js', 'Figma'];
  const skillGaps = user?.gaps || ['TypeScript Generics', 'System Security & Auth', 'Docker & Deployment', 'Automated Testing (Jest/Playwright)'];

  return `${BASE_SYSTEM_PROMPT}

CURRENT STUDENT CONTEXT:
- Student Name: ${name}
- Academic Program: ${major}
- Target Career Role: ${targetRole}
- Verified Skills: ${currentSkills.join(', ')}
- Priority Skill Gaps to Close: ${skillGaps.join(', ')}

Always tailor your guidance specifically for ${name}'s goal of becoming a top-tier ${targetRole}.`;
}

export const QUICK_ACTIONS = [
  {
    id: 'skill-gap-plan',
    title: 'Skill Gap Strategy',
    badge: 'Popular',
    prompt: 'Based on my current skill profile and gaps, what are the top 3 high-impact skills I should focus on learning this month?'
  },
  {
    id: 'career-roadmap',
    title: '30-Day Learning Plan',
    badge: 'Roadmap',
    prompt: 'Generate a step-by-step 30-day learning roadmap to help me transition into a Full-Stack Software Engineer.'
  },
  {
    id: 'resume-review',
    title: 'Resume Bullets Advice',
    badge: 'Career',
    prompt: 'How can I rewrite my React and JavaScript project bullets to sound more quantitative and impactful for recruiters?'
  },
  {
    id: 'mock-interview',
    title: 'React & JS Interview Qs',
    badge: 'Prep',
    prompt: 'Give me 3 commonly asked technical interview questions for a Junior Frontend role, along with how to structure winning answers.'
  },
  {
    id: 'explore-role',
    title: 'Explore DevOps Role',
    badge: 'Benchmark',
    prompt: 'Tell me about becoming a DevOps Engineer and add it to my Skill-Gap Radar benchmarks.'
  },
  {
    id: 'portfolio-idea',
    title: 'High-Impact Project Idea',
    badge: 'Portfolio',
    prompt: 'Suggest a unique, production-grade portfolio project idea that demonstrates full-stack skills and security best practices.'
  }
];
